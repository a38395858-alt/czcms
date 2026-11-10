package httpserver

import (
	webassets "czcms/frontend"
	"encoding/json"
)

type publicPartnerLogo struct{ Name, File string }
type publicPartnerGroup struct {
	Title string
	Logos []publicPartnerLogo
}
type publicPartnerNetwork struct {
	Title, Body string
	Groups      []publicPartnerGroup
}

var partnerNetworkSource = func() struct {
	Locales map[string]struct {
		Title, Body string
		Groups      []string
	}
	Groups [][]publicPartnerLogo
} {
	var source struct {
		Locales map[string]struct {
			Title, Body string
			Groups      []string
		}
		Groups [][]publicPartnerLogo
	}
	raw, err := webassets.Files.ReadFile("assets/company/partner-network.json")
	if err != nil {
		panic(err)
	}
	if err = json.Unmarshal(raw, &source); err != nil {
		panic(err)
	}
	return source
}()

func partnerNetworkFor(locale string) *publicPartnerNetwork {
	copy, ok := partnerNetworkSource.Locales[locale]
	if !ok {
		copy = partnerNetworkSource.Locales["en"]
	}
	result := &publicPartnerNetwork{Title: copy.Title, Body: copy.Body}
	for i, logos := range partnerNetworkSource.Groups {
		result.Groups = append(result.Groups, publicPartnerGroup{Title: copy.Groups[i], Logos: logos})
	}
	return result
}
