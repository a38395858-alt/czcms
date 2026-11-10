package httpserver

import (
	"encoding/json"
	"strings"

	webassets "czcms/frontend"
)

type publicEnquiryOption struct{ Value, Label string }

type publicEnquiryCopy struct {
	Labels                    [5]string
	Options                   [6]string
	Placeholder, Button       string
	Consent, PrivacyLabel     string
	BeforePolicy, AfterPolicy string
	StartingPoints            []publicEnquiryOption
}

// Native pages and React pages read the same localized five-field form copy.
var publicEnquiryCopies = func() map[string]publicEnquiryCopy {
	body, err := webassets.Files.ReadFile("shared/enquiry-copy.json")
	if err != nil {
		panic(err)
	}
	copies := map[string]publicEnquiryCopy{}
	if err = json.Unmarshal(body, &copies); err != nil {
		panic(err)
	}
	values := []string{"product-sourcing", "ocean-freight", "air-freight", "warehousing-fulfillment", "packaging-branding", "not-sure"}
	for locale, copy := range copies {
		copy.BeforePolicy, copy.AfterPolicy, _ = strings.Cut(copy.Consent, copy.PrivacyLabel)
		for i, value := range values {
			copy.StartingPoints = append(copy.StartingPoints, publicEnquiryOption{Value: value, Label: copy.Options[i]})
		}
		copies[locale] = copy
	}
	return copies
}()

func enquiryCopyFor(locale string) publicEnquiryCopy {
	if copy, ok := publicEnquiryCopies[strings.Split(locale, "-")[0]]; ok {
		return copy
	}
	return publicEnquiryCopies["en"]
}
