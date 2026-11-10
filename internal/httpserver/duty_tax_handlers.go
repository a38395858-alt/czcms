package httpserver

import (
 "crypto/sha256"
 "crypto/subtle"
 "encoding/base64"
 "encoding/hex"
 "encoding/json"
 "errors"
 "fmt"
 "html/template"
 "net/http"
 "net/mail"
 "strconv"
 "strings"
 "time"
 "unicode/utf8"

 "czcms/internal/audit"
 "czcms/internal/catalog"
 "czcms/internal/dutytax"
 "github.com/go-chi/chi/v5"
)

const dutyTaxCalculatorSlug = "tools/import-duty-tax-calculator"

type dutyTaxOption struct { Code, Name, Currency string }
type dutyTaxPage struct {
 Action, EnquiryAction, FormToken string
 Input dutytax.Request
 Result dutytax.Result
 ResultJSON, RequestJSON template.JS
 Errors map[string]string
 Notice string
 Countries, Origins []dutyTaxOption
 LookupURL, EnquiryToken, RequestSnapshot, Success string
 CodeDescription, RateEvidence, SourceURL string
}
var dutyTaxCountries = []dutyTaxOption{{"FR","France","EUR"},{"US","United States","USD"},{"DE","Germany","EUR"},{"ES","Spain","EUR"},{"IT","Italy","EUR"},{"NL","Netherlands","EUR"},{"GB","United Kingdom (Great Britain)","GBP"}}
var dutyTaxOrigins = []dutyTaxOption{{"CN","China",""},{"US","United States",""},{"GB","United Kingdom",""},{"DE","Germany",""},{"FR","France",""},{"ES","Spain",""},{"IT","Italy",""},{"NL","Netherlands",""},{"VN","Vietnam",""},{"IN","India",""},{"JP","Japan",""},{"KR","South Korea",""},{"CA","Canada",""},{"MX","Mexico",""},{"TW","Taiwan",""},{"TH","Thailand",""},{"TR","Türkiye",""},{"ID","Indonesia",""}}

// A signed, short-lived snapshot freezes ONLY public rate evidence and the
// customer's input. It is never a public URL and is not persisted by a calculation.
type dutyTaxSnapshot struct {
 Request dutytax.Request `json:"request"`
 SiteID int64 `json:"site_id"`
 Locale string `json:"locale"`
 Issued int64 `json:"issued"`
 VerifiedBaseRate string `json:"verified_base_rate"`
 CodeDescription string `json:"code_description"`
 RateEvidence string `json:"rate_evidence"`
 SourceURL string `json:"source_url"`
}

type dutyTaxPost struct {
 dutytax.Request
 FormToken string `json:"form_token"`
}

type dutyTaxEnquiryPost struct {
 FormToken string `json:"form_token"`
 RequestSnapshot string `json:"request_snapshot"`
 EstimateToken string `json:"estimate_token"`
 FullName string `json:"full_name"`
 WorkEmail string `json:"work_email"`
 Company string `json:"company"`
 Consent bool `json:"consent"`
 Website string `json:"website"`
}

func dutyTaxLabel(language string) string {
 labels := map[string]string{"en":"Import Duty & Tax Calculator","de":"Einfuhrzoll & Steuerrechner (Englisch)","fr":"Calculateur de droits et taxes (anglais)","es":"Calculadora de aranceles e impuestos (inglés)","it":"Calcolatore dazi e imposte (inglese)","nl":"Invoerrechten & belastingcalculator (Engels)"}
 if value := labels[language]; value != "" { return value }; return labels["en"]
}

func (s *server) configureDutyTaxPage(r *http.Request, data *publicSitePageData, site catalog.Site) {
 input, _ := dutytax.SampleRequest("FR")
 if r.URL.Query().Get("sample") == "US" { input, _ = dutytax.SampleRequest("US") }
 // Non-sensitive code-page prefill switches OFF the synthetic scenario.
 if code := r.URL.Query().Get("code"); code != "" {
  input.Code = code; input.Mode = "estimate"; input.Clearance = ""; input.Freight = ""; input.Insurance = ""; input.Delivery = ""; input.Goods = ""
  input.ImportDate = time.Now().UTC().Format("2006-01-02")
  if c := r.URL.Query().Get("country"); c != "" { input.Destination = c }
  for _, option := range dutyTaxCountries { if option.Code == input.Destination { input.Currency = option.Currency } }
  if origin := r.URL.Query().Get("origin"); origin != "" { input.Origin = origin }
 }
 page := &dutyTaxPage{Action: strings.TrimSuffix(data.BasePath,"/")+"/duty-tax/calculate", EnquiryAction: strings.TrimSuffix(data.BasePath,"/")+"/duty-tax/enquiries", FormToken: publicFormToken(s,0,site.ID), Input:input, Countries:dutyTaxCountries, Origins:dutyTaxOrigins, Errors:map[string]string{}}
 page.LookupURL = data.TARICURL
 if input.Destination == "US" { page.LookupURL = data.HTSLookupURL }
 if page.LookupURL == "" { page.LookupURL = data.HomePath+"tools/hts-code-lookup" }
 if input.Mode == "sample" {
  result, err := dutytax.Calculate(input)
  if err == nil { page.Result = result; s.freezeDutyTax(page, dutyTaxSnapshot{Request:input,SiteID:site.ID,Locale:data.Locale,Issued:time.Now().Unix()}) }
 }
 dutyTaxJSON(page)
 data.IsDutyTaxCalculator, data.DutyTax = true,page
 data.PageTitle = "Import Duty & Tax Calculator | FreightVanta"
 data.MetaDescription = "Explore import duties, VAT and clearance costs with transparent sample scenarios and a partial estimate for your shipment. Verify additional charges with FreightVanta."
 data.OGTitle, data.OGDescription = data.PageTitle,data.MetaDescription
 data.RobotsIndex = r.Method == http.MethodGet && r.URL.RawQuery == ""
}

func dutyTaxJSON(p *dutyTaxPage) {
 raw,_:=json.Marshal(p.Result); p.ResultJSON=template.JS(raw)
 raw,_=json.Marshal(p.Input); p.RequestJSON=template.JS(raw)
}

func (s *server) freezeDutyTax(p *dutyTaxPage, snap dutyTaxSnapshot) {
 raw,_:=json.Marshal(snap)
 p.RequestSnapshot=base64.RawURLEncoding.EncodeToString(raw)
 p.EnquiryToken=s.Keys.HMAC("duty-tax-estimate-v1",p.RequestSnapshot)
 p.CodeDescription,p.RateEvidence,p.SourceURL=snap.CodeDescription,snap.RateEvidence,snap.SourceURL
}

func (s *server) dutyTaxSite(w http.ResponseWriter,r *http.Request) (catalog.Site,bool) {
 var site catalog.Site
 var err error
 if code:=chi.URLParam(r,"siteCode"); code!="" { site,err=s.Catalog.SiteByCode(r.Context(),code) } else { site,_,err=s.Catalog.SiteByHostname(r.Context(),requestHostname(r.Host)) }
 if err!=nil || site.Status!="active" || !isFreightVantaSite(site) { http.NotFound(w,r); return site,false }
 return site,true
}

func (s *server) dutyTaxGuard(w http.ResponseWriter,r *http.Request) (catalog.Site,bool) {
 w.Header().Set("Cache-Control","private, no-store")
 w.Header().Set("X-Robots-Tag","noindex, nofollow")
 if !s.validFormOrigin(r) { writeJSONError(w,403,"Use this form from the same website.");return catalog.Site{},false }
 site,ok:=s.dutyTaxSite(w,r);if !ok{return site,false}
 if !s.dutyTaxLimiter.Allow("calculate:"+strconv.FormatInt(site.ID,10)+":"+s.clientIP(r)) { w.Header().Set("Retry-After","60");writeJSONError(w,429,"Too many estimates. Wait a minute and try again.");return site,false }
 return site,true
}

func (s *server) dutyTaxData(r *http.Request,site catalog.Site) (publicSitePageData,int) {
 preview:=chi.URLParam(r,"siteCode")!=""
 origin:="http://"+r.Host
 if s.Config.PublicHTTPS || r.TLS!=nil { origin="https://"+r.Host }
 canonical:=origin+"/"+dutyTaxCalculatorSlug
 if preview { canonical="" }
 return s.publicPageData(r,site,preview,canonical,dutyTaxCalculatorSlug,nil)
}

func dutyTaxFormRequest(r *http.Request) dutytax.Request {
 value:=func(key string)string{return strings.TrimSpace(r.PostForm.Get(key))}
 return dutytax.Request{Destination:value("destination_country"),Origin:value("origin_country"),Code:value("commodity_code"),ImportDate:value("import_date"),Term:value("delivery_term"),Transport:value("transport_mode"),Currency:value("input_currency"),Goods:value("goods_value"),Freight:value("international_freight"),Insurance:value("insurance"),Delivery:value("domestic_delivery"),Clearance:value("clearance_service"),DutyRate:value("duty_rate_percent"),VATRate:value("vat_rate_percent"),Mode:value("mode")}
}

func (s *server) resolveDutyTax(r *http.Request,input dutytax.Request,siteID int64,locale string) (dutytax.Result,dutyTaxSnapshot,error) {
 snap:=dutyTaxSnapshot{Request:input,SiteID:siteID,Locale:locale,Issued:time.Now().Unix()}
 if input.Mode!="estimate" { result,err:=dutytax.Calculate(input);return result,snap,err }
 // Validate before looking up evidence or hitting any provider. Estimate mode
 // ignores ALL customer supplied rates; no public request can assert a verified rate.
 result,err:=dutytax.CalculateEstimate(input,"")
 if err!=nil {return result,snap,err}
 snap.Request=result.Request
 if input.Destination=="US" && input.Origin=="CN" && len(input.Code)==10 && input.ImportDate==time.Now().UTC().Format("2006-01-02") && s.HTS!=nil {
  found,e:=s.HTS.Search(r.Context(),input.Code,1)
  if e==nil && len(found.Items)==1 && found.Items[0].Code==input.Code {
   entry:=found.Items[0]
   snap.CodeDescription=entry.Description
   snap.RateEvidence=found.Metadata.Label+" · General rate: "+entry.GeneralRate+". Snapshot reference only; current applicability and additional measures need review."
   snap.SourceURL="https://hts.usitc.gov/"
   // Footnoted expressions may hide conditions. Only an unqualified base rate
   // is passed to the pure parser; it still NEVER means complete US duties.
   if len(entry.Footnotes)==0 { snap.VerifiedBaseRate=entry.GeneralRate }
  }
 }
 result,err=dutytax.CalculateEstimate(input,snap.VerifiedBaseRate)
 snap.Request=result.Request
 return result,snap,err
}

func (s *server) calculateDutyTax(w http.ResponseWriter,r *http.Request) {
 site,ok:=s.dutyTaxGuard(w,r);if !ok{return}
 jsonRequest:=strings.HasPrefix(r.Header.Get("Content-Type"),"application/json")
 var input dutyTaxPost
 if jsonRequest { if decodeJSON(w,r,&input,32<<10)!=nil{return} } else {
  r.Body=http.MaxBytesReader(w,r.Body,32<<10)
  if r.ParseForm()!=nil {http.Error(w,"Invalid form",400);return}
  input.Request=dutyTaxFormRequest(r);input.FormToken=r.PostForm.Get("form_token")
 }
 if verifyPublicFormToken(s,input.FormToken,0,site.ID)!=nil {writeJSONError(w,403,"Refresh the page before estimating.");return}
 data,status:=s.dutyTaxData(r,site)
 if status!=200 || data.DutyTax==nil {writeJSONError(w,503,"Calculator unavailable.");return}
 result,snap,err:=s.resolveDutyTax(r,input.Request,site.ID,data.Locale)
 p:=data.DutyTax;p.Input=input.Request
 if err!=nil {
  var invalid *dutytax.ValidationError
  if errors.As(err,&invalid) {p.Errors=invalid.Fields}else{p.Errors=map[string]string{"form":"Unable to calculate. Check your details and retry."}}
  if jsonRequest {writeJSON(w,422,map[string]any{"field_errors":p.Errors});return}
  p.Result=dutytax.Result{};p.RequestSnapshot="";p.EnquiryToken=""
  s.renderDutyTaxPost(w,r,data,422);return
 }
 p.Result=result;p.Input=result.Request;s.freezeDutyTax(p,snap);dutyTaxJSON(p)
 if jsonRequest {writeJSON(w,200,map[string]any{"result":result,"request_snapshot":p.RequestSnapshot,"estimate_token":p.EnquiryToken,"code_description":p.CodeDescription,"rate_evidence":p.RateEvidence,"source_url":p.SourceURL});return}
 s.renderDutyTaxPost(w,r,data,200)
}

func (s *server) renderDutyTaxPost(w http.ResponseWriter,r *http.Request,data publicSitePageData,status int) {
 data.RobotsIndex=false;data.CanonicalURL="";data.Hreflangs=nil;data.Header=sharedPublicHeader(data)
 dutyTaxJSON(data.DutyTax)
 w.Header().Set("Cache-Control","private, no-store");w.Header().Set("X-Robots-Tag","noindex, nofollow");w.Header().Set("Content-Type","text/html; charset=utf-8")
 w.WriteHeader(status)
 if err:=s.Template.ExecuteTemplate(w,"public.html",data);err!=nil{s.Logger.Error("render duty-tax form","error",err)}
}

func (s *server) submitDutyTaxEnquiry(w http.ResponseWriter,r *http.Request) {
 site,ok:=s.dutyTaxGuard(w,r);if !ok{return}
 if !s.dutyTaxLimiter.Allow("enquiry:"+strconv.FormatInt(site.ID,10)+":"+s.clientIP(r)) {writeJSONError(w,429,"Please wait before sending another enquiry.");return}
 jsonRequest:=strings.HasPrefix(r.Header.Get("Content-Type"),"application/json")
 var input dutyTaxEnquiryPost
 if jsonRequest {if decodeJSON(w,r,&input,32<<10)!=nil{return}}else{
  r.Body=http.MaxBytesReader(w,r.Body,32<<10);if r.ParseForm()!=nil{http.Error(w,"Invalid form",400);return}
  input=dutyTaxEnquiryPost{FormToken:r.PostForm.Get("form_token"),RequestSnapshot:r.PostForm.Get("request_snapshot"),EstimateToken:r.PostForm.Get("estimate_token"),FullName:r.PostForm.Get("full_name"),WorkEmail:r.PostForm.Get("work_email"),Company:r.PostForm.Get("company"),Consent:r.PostForm.Get("consent")=="on" || r.PostForm.Get("consent")=="true",Website:r.PostForm.Get("website")}
 }
 if verifyPublicFormToken(s,input.FormToken,0,site.ID)!=nil || len(input.RequestSnapshot)>16000 {writeJSONError(w,403,"Refresh and calculate again before sending.");return}
 expected:=s.Keys.HMAC("duty-tax-estimate-v1",input.RequestSnapshot)
 if len(input.EstimateToken)!=len(expected) || subtle.ConstantTimeCompare([]byte(expected),[]byte(input.EstimateToken))!=1 {writeJSONError(w,403,"The estimate changed. Calculate again before sending.");return}
 raw,err:=base64.RawURLEncoding.DecodeString(input.RequestSnapshot)
 var snap dutyTaxSnapshot
 if err!=nil || json.Unmarshal(raw,&snap)!=nil || snap.SiteID!=site.ID || time.Now().Unix()-snap.Issued>900 || snap.Issued>time.Now().Unix()+60 {writeJSONError(w,409,"This estimate has expired. Calculate again before sending.");return}
 input.FullName=strings.TrimSpace(input.FullName);input.WorkEmail=strings.TrimSpace(input.WorkEmail);input.Company=strings.TrimSpace(input.Company)
 fields:=map[string]string{}
 if input.FullName=="" || utf8.RuneCountInString(input.FullName)>120 {fields["full_name"]="Enter your name (up to 120 characters)."}
 if email,e:=mail.ParseAddress(input.WorkEmail);e!=nil || email.Address!=input.WorkEmail || len(input.WorkEmail)>254 {fields["work_email"]="Enter a valid email address."}
 if utf8.RuneCountInString(input.Company)>120 {fields["company"]="Company must be 120 characters or less."}
 if !input.Consent {fields["consent"]="Please agree to the use of your details to review this enquiry."}
 if input.Website!="" {fields["form"]="Unable to submit this request."}
 data,status:=s.dutyTaxData(r,site);if status!=200 || data.DutyTax==nil{writeJSONError(w,503,"Enquiries unavailable.");return}
 p:=data.DutyTax;p.Input=snap.Request
 result,err:=dutytax.Calculate(snap.Request)
 if snap.Request.Mode=="estimate" {result,err=dutytax.CalculateEstimate(snap.Request,snap.VerifiedBaseRate)}
 if err!=nil {writeJSONError(w,409,"Please calculate again before sending.");return}
 p.Result=result;s.freezeDutyTax(p,snap);dutyTaxJSON(p)
 if len(fields)>0 {if jsonRequest {writeJSON(w,422,map[string]any{"field_errors":fields});return};p.Errors=fields;s.renderDutyTaxPost(w,r,data,422);return}
 languages,err:=s.Catalog.PublicSiteLanguages(r.Context(),site.ID)
 validLocale:=false
 for _,lang:=range languages {if lang.Locale==snap.Locale{validLocale=true}}
 if err!=nil || !validLocale{writeJSONError(w,403,"This language is unavailable.");return}
 form,err:=s.Catalog.EnsureHomeEnquiryForm(r.Context(),site.ID,snap.Locale,false)
 if err!=nil{writeJSONError(w,503,"Enquiries unavailable. Please retry later.");return}
 summary:=fmt.Sprintf("Import duty & tax verification. %s → %s; code %s; %s; mode %s; status %s. Known costs %s %s. Not a complete import cost or a binding quote.",snap.Request.Origin,snap.Request.Destination,snap.Request.Code,snap.Request.Term,snap.Request.Mode,result.Status,result.Currency,result.KnownSubtotal)
 resultRaw,_:=json.Marshal(result)
 values:=map[string]string{"full_name":input.FullName,"work_email":input.WorkEmail,"company":input.Company,"origin":snap.Request.Origin,"destination":snap.Request.Destination,"starting_point":"not-sure","cargo_details":summary,"additional_context":summary,"consent":"true","placement":"duty-tax","duty_tax_request":string(raw),"duty_tax_result":string(resultRaw),"duty_tax_engine":dutytax.EngineVersion}
 if err=catalog.ValidatePublicFormValues(form.Fields,values);err!=nil{writeJSONError(w,422,"Please check your contact details.");return}
 plain,_:=json.Marshal(values);encrypted,err:=s.Keys.Encrypt("form-submission",plain)
 if err!=nil{writeJSONError(w,503,"Unable to save your enquiry.");return}
 // Existing SaveFormSubmission atomically persists the encrypted submission and
 // its mail outbox; dedupe is based on the frozen request, not random UI clicks.
 id,err:=s.Catalog.SaveFormSubmission(r.Context(),form.ID,0,site.ID,snap.Locale,"/"+dutyTaxCalculatorSlug,catalog.HashSubmission(values),s.Keys.HMAC("form-ip",s.clientIP(r)),s.Keys.HMAC("form-ua",r.UserAgent()),encrypted)
 if err!=nil {
  if strings.Contains(err.Error(),"重复"){writeJSONError(w,409,"This enquiry was already received.")}else{writeJSONError(w,503,"Unable to save your enquiry. Please retry later.")};return
 }
 s.audit(r,audit.Event{Action:"form.submitted",TargetType:"form_submission",TargetID:strconv.FormatInt(id,10),Success:true,Metadata:map[string]any{"form_id":form.ID,"site_id":site.ID,"locale":snap.Locale,"source":"duty-tax"}})
 reference:="FV-"+strconv.FormatInt(id,10)
 if jsonRequest{writeJSON(w,201,map[string]any{"submitted":true,"reference":reference});return}
 p.Success="Your request has been received. Reference "+reference+". Our team will verify the missing charges."
 s.renderDutyTaxPost(w,r,data,200)
}

func dutyTaxEvidenceHash(value string) string { sum:=sha256.Sum256([]byte(value));return hex.EncodeToString(sum[:]) }
