package httpserver

import (
	"encoding/json"
	"net/http"
	"net/mail"
	"strconv"
	"strings"
	"unicode/utf8"

	"czcms/internal/audit"
	"czcms/internal/catalog"
	"github.com/go-chi/chi/v5"
)

type topicEnquiryInput struct {
	SiteID        int64  `json:"site_id"`
	Locale        string `json:"locale"`
	Route         string `json:"route"`
	FormToken     string `json:"form_token"`
	Website       string `json:"website"`
	FullName      string `json:"full_name"`
	WorkEmail     string `json:"work_email"`
	Company       string `json:"company"`
	Phone         string `json:"phone"`
	Origin        string `json:"origin"`
	Destination   string `json:"destination"`
	StartingPoint string `json:"starting_point"`
	CargoDetails  string `json:"cargo_details"`
	Timing        string `json:"target_timing"`
	Context       string `json:"additional_context"`
	Consent       bool   `json:"consent"`
	StartedAt     int64  `json:"form_started_at"`
	Placement     string `json:"placement"`
	PageContext   struct {
		Placement string            `json:"placement"`
		Fields    map[string]string `json:"fields"`
	} `json:"page_context"`
	Attachments []struct {
		Name string `json:"name"`
		Size int64  `json:"size"`
		Type string `json:"type"`
	} `json:"attachments"`
}

func validateTopicEnquiry(input topicEnquiryInput) map[string]string {
	errors := map[string]string{}
	for key, field := range map[string]struct {
		value    string
		max      int
		required bool
	}{
		"full_name": {input.FullName, 120, true}, "work_email": {input.WorkEmail, 254, true},
		"company": {input.Company, 120, true}, "phone": {input.Phone, 24, false},
		"origin": {input.Origin, 160, true}, "destination": {input.Destination, 160, true},
		"cargo_details": {input.CargoDetails, 2000, false}, "additional_context": {input.Context, 2000, false},
	} {
		value := strings.TrimSpace(field.value)
		if field.required && value == "" {
			errors[key] = "Please complete this field."
		}
		if utf8.RuneCountInString(value) > field.max {
			errors[key] = "This field is too long."
		}
	}
	if parsed, err := mail.ParseAddress(strings.TrimSpace(input.WorkEmail)); err != nil || parsed.Address != strings.TrimSpace(input.WorkEmail) {
		errors["work_email"] = "Enter a valid email address."
	}
	switch input.StartingPoint {
	case "product-sourcing", "ocean-freight", "air-freight", "warehousing-fulfillment", "packaging-branding", "not-sure":
	default:
		errors["starting_point"] = "Choose a starting point."
	}
	switch input.Timing {
	case "", "ready-now", "this-month", "planning-ahead":
	default:
		errors["target_timing"] = "Choose a valid timing option."
	}
	if !input.Consent {
		errors["consent"] = "Please confirm the privacy agreement."
	}
	if len(input.PageContext.Fields) > 20 {
		errors["additional_context"] = "Too many context fields."
	}
	for key, value := range input.PageContext.Fields {
		if len(key) > 100 || utf8.RuneCountInString(value) > 500 {
			errors["additional_context"] = "A context field is too long."
		}
	}
	if len(input.Attachments) > 5 {
		errors["additional_context"] = "Too many reference files."
	}
	for _, file := range input.Attachments {
		if utf8.RuneCountInString(file.Name) > 255 || file.Size < 0 || file.Size > 10<<20 {
			errors["additional_context"] = "A reference file is invalid."
		}
	}
	return errors
}

func (s *server) submitTopicEnquiry(w http.ResponseWriter, r *http.Request) {
	s.submitBuiltinEnquiry(w, r, "topic")
}
func (s *server) submitHomeEnquiry(w http.ResponseWriter, r *http.Request) {
	s.submitBuiltinEnquiry(w, r, "home")
}
func (s *server) submitNewsletter(w http.ResponseWriter, r *http.Request) {
	s.submitBuiltinEnquiry(w, r, "newsletter")
}

func (s *server) submitBuiltinEnquiry(w http.ResponseWriter, r *http.Request, kind string) {
	if !s.validFormOrigin(r) {
		writeJSONError(w, http.StatusForbidden, "Invalid request origin")
		return
	}
	site, _, err := s.Catalog.SiteByHostname(r.Context(), requestHostname(r.Host))
	if err != nil && chi.URLParam(r, "siteCode") != "" {
		site, err = s.Catalog.SiteByCode(r.Context(), chi.URLParam(r, "siteCode"))
	}
	if err != nil || site.Status != "active" {
		http.NotFound(w, r)
		return
	}
	if !s.mediaImportLimiter.Allow("topic-enquiry:" + strconv.FormatInt(site.ID, 10) + ":" + s.clientIP(r)) {
		writeJSONError(w, http.StatusTooManyRequests, "Try again later")
		return
	}
	var input topicEnquiryInput
	if !decodeTopicEnquiry(w, r, &input) {
		return
	}
	if input.SiteID != site.ID || verifyPublicFormToken(s, input.FormToken, 0, site.ID) != nil {
		writeJSONError(w, http.StatusForbidden, "Refresh the page and try again")
		return
	}
	s.loadImportedTopics()
	if _, ok := s.importedTopics.pages[input.Locale+"/"+input.Route]; kind == "topic" && !ok {
		http.NotFound(w, r)
		return
	}
	if input.Website != "" {
		writeJSONError(w, http.StatusBadRequest, "Invalid request")
		return
	}
	validation := validateTopicEnquiry(input)
	if kind == "home" {
		for _, key := range []string{"company", "origin", "destination"} {
			if strings.TrimSpace(map[string]string{"company": input.Company, "origin": input.Origin, "destination": input.Destination}[key]) == "" {
				delete(validation, key)
			}
		}
	}
	if kind == "newsletter" {
		emailError, badEmail := validation["work_email"]
		validation = map[string]string{}
		if badEmail {
			validation["work_email"] = emailError
		}
	}
	if len(validation) > 0 {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"errors": validation})
		return
	}
	languages, err := s.Catalog.PublicSiteLanguages(r.Context(), site.ID)
	if err != nil {
		writeJSONError(w, http.StatusServiceUnavailable, "Please try again later")
		return
	}
	locale := ""
	for _, language := range languages {
		if strings.EqualFold(language.LanguageCode, input.Locale) {
			locale = language.Locale
			break
		}
	}
	if locale == "" {
		http.NotFound(w, r)
		return
	}
	var form catalog.Form
	if kind == "topic" {
		form, err = s.Catalog.EnsureTopicEnquiryForm(r.Context(), site.ID, locale)
	} else {
		form, err = s.Catalog.EnsureHomeEnquiryForm(r.Context(), site.ID, locale, kind == "newsletter")
	}
	if err != nil {
		writeJSONError(w, http.StatusServiceUnavailable, "Enquiries are currently unavailable")
		return
	}
	values := map[string]string{"full_name": strings.TrimSpace(input.FullName), "work_email": strings.TrimSpace(input.WorkEmail),
		"company": strings.TrimSpace(input.Company), "phone": strings.TrimSpace(input.Phone), "origin": strings.TrimSpace(input.Origin),
		"destination": strings.TrimSpace(input.Destination), "starting_point": input.StartingPoint, "cargo_details": strings.TrimSpace(input.CargoDetails),
		"target_timing": input.Timing, "additional_context": strings.TrimSpace(input.Context), "consent": "true"}
	values["placement"] = input.Placement
	if len(values["placement"]) > 100 {
		values["placement"] = values["placement"][:100]
	}
	source := "/" + input.Route
	if kind == "home" {
		source = "/"
		if input.Placement == "contact" {
			path := map[string]string{"en": "contact", "de": "kontakt", "fr": "contact", "es": "contacto", "it": "contatti", "nl": "contact"}[input.Locale]
			if path != "" {
				source += path
			}
		}
	}
	if kind == "newsletter" {
		source = "/guides"
		values = map[string]string{"work_email": strings.TrimSpace(input.WorkEmail), "purpose": "newsletter"}
	}
	if kind != "newsletter" {
		for key, value := range input.PageContext.Fields {
			values["context_"+key] = strings.TrimSpace(value)
		}
		if len(input.Attachments) > 0 {
			files, _ := json.Marshal(input.Attachments)
			values["reference_file_names_only"] = string(files)
		}
	}
	if err = catalog.ValidatePublicFormValues(form.Fields, values); err != nil {
		writeJSONError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	plain, _ := json.Marshal(values)
	encrypted, err := s.Keys.Encrypt("form-submission", plain)
	if err != nil {
		writeJSONError(w, http.StatusServiceUnavailable, "Please try again later")
		return
	}
	id, err := s.Catalog.SaveFormSubmission(r.Context(), form.ID, 0, site.ID, form.Locale, source, catalog.HashSubmission(values), s.Keys.HMAC("form-ip", s.clientIP(r)), s.Keys.HMAC("form-ua", r.UserAgent()), encrypted)
	if err != nil {
		if kind != "topic" && strings.Contains(err.Error(), "重复") {
			writeJSONError(w, http.StatusConflict, "This request was already received")
		} else {
			writeJSONError(w, http.StatusUnprocessableEntity, "Unable to submit; check whether this enquiry was already sent")
		}
		return
	}
	s.audit(r, audit.Event{Action: "form.submitted", TargetType: "form_submission", TargetID: strconv.FormatInt(id, 10), Success: true, Metadata: map[string]any{"form_id": form.ID, "site_id": site.ID, "locale": form.Locale}})
	writeJSON(w, http.StatusCreated, map[string]any{"submitted": true, "reference": "FV-" + strconv.FormatInt(id, 10)})
}

func decodeTopicEnquiry(w http.ResponseWriter, r *http.Request, input *topicEnquiryInput) bool {
	if err := decodeJSON(w, r, input, 128<<10); err != nil {
		return false
	}
	return true
}
