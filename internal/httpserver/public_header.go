package httpserver

import (
	"encoding/json"
	"strings"

	webassets "czcms/frontend"
)

// All public shells use head.html. Keep navigation content independent of the
// React page bundles so a page can never install a second, different header.
type publicHeaderMenu struct {
	Key, Trigger, Eyebrow string
	Columns               int
	Items                 []struct{ Title, Desc, Href string }
	Aside                 struct{ Title, Body, CTA, CTAHref, Secondary, SecondaryHref string }
}

type publicHeaderData struct {
	LanguageCode, LanguageName, Locale, HomePath, EnquiryURL string
	GuideIndexPath, MenuLabel, BrandTagline                  string
	WhatsAppLabel                                            string
	IsHome                                                   bool
	SuppressHreflang                                         bool
	Copy                                                     publicCopy
	Links                                                    publicSiteLinks
	Languages                                                []publicLanguageData
	Menus                                                    []publicHeaderMenu
}

var publicHeaderMenus = func() map[string]json.RawMessage {
	source, err := webassets.Files.ReadFile("assets/data/header-menus.json")
	if err != nil {
		panic(err)
	}
	var menus map[string]json.RawMessage
	if err := json.Unmarshal(source, &menus); err != nil {
		panic(err)
	}
	return menus
}()

func sharedPublicHeader(data publicSitePageData) publicHeaderData {
	code := strings.ToLower(strings.Split(data.LanguageCode, "-")[0])
	menuLabel := map[string]string{"en": "Menu", "de": "Menü", "fr": "Menu", "es": "Menú", "it": "Menu", "nl": "Menu"}[code]
	brandTagline := map[string]string{
		"en": "International logistics network",
		"de": "Internationales Logistiknetzwerk",
		"fr": "Réseau logistique international",
		"es": "Red logística internacional",
		"it": "Rete logistica internazionale",
		"nl": "Internationaal logistiek netwerk",
	}[code]
	if brandTagline == "" {
		brandTagline = "International logistics network"
	}
	view := publicHeaderData{
		LanguageCode: code, LanguageName: data.LanguageName, Locale: data.Locale,
		HomePath: data.HomePath, EnquiryURL: publicEnquiryURL(&data),
		GuideIndexPath: data.GuideIndexPath, MenuLabel: menuLabel, BrandTagline: brandTagline, IsHome: data.IsHome,
		Copy: data.Copy, Links: data.Links, Languages: data.Languages,
	}
	view.WhatsAppLabel = map[string]string{
		"en": "Chat with us on WhatsApp (opens in a new tab)",
		"de": "Mit uns auf WhatsApp chatten (öffnet einen neuen Tab)",
		"fr": "Discuter avec nous sur WhatsApp (nouvel onglet)",
		"es": "Chatea con nosotros por WhatsApp (se abre en otra pestaña)",
		"it": "Chatta con noi su WhatsApp (si apre in una nuova scheda)",
		"nl": "Chat met ons via WhatsApp (opent in een nieuw tabblad)",
	}[code]
	if view.WhatsAppLabel == "" {
		view.WhatsAppLabel = "Chat with us on WhatsApp (opens in a new tab)"
	}
	source := publicHeaderMenus[code]
	if source == nil {
		source = publicHeaderMenus["en"]
	}
	// Decode a fresh copy per request: URL scoping must never mutate other sites.
	if err := json.Unmarshal(source, &view.Menus); err != nil {
		panic(err)
	}
	resolve := func(href string) string {
		if strings.HasPrefix(href, "#") {
			return view.EnquiryURL
		}
		if strings.HasPrefix(href, "/") && !strings.HasPrefix(href, "//") {
			return strings.TrimRight(data.HomePath, "/") + href
		}
		return href
	}
	for i := range view.Menus {
		menu := &view.Menus[i]
		for j := range menu.Items {
			menu.Items[j].Href = resolve(menu.Items[j].Href)
		}
		menu.Aside.CTAHref = resolve(menu.Aside.CTAHref)
		menu.Aside.SecondaryHref = resolve(menu.Aside.SecondaryHref)
	}
	return view
}
