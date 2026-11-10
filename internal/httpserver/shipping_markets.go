package httpserver

import (
	"encoding/json"
	"html/template"
	"sync"

	webassets "czcms/frontend"
)

// Market catalogues own their language, destinations and editorial content.
// The same embedded data drives crawlable HTML and the interactive calculator.
type shippingMarket struct {
	Country, Language, Locale, ContactAnchor string
	Copy                                     map[string]any
	CopyJSON                                 template.JS
	SEO                                      struct{ Title, HomeTitle, Description, Keywords string }
	Sections                                 []struct{ Title, Body string }
	Process                                  []struct{ No, Title, Body string }
	FAQs                                     []struct{ Question, Answer string }
	Destinations                             []map[string]any
	Origins                                  []map[string]any
	Routes                                   []struct {
		Origin, Destination string
		Offers              []struct {
			Service string
			Days    []int
			Rate    []float64
		}
	}
	FclRoutes []struct {
		Origin, Destination string
		Offers              []struct {
			Service string
			Days    []int
			Rates   map[string][]float64
		}
	}
	Examples map[string]shippingLaneExample
}

type shippingLaneExample struct {
	Low, High               float64
	DaysLow, DaysHigh       int
	AirLow, AirHigh         float64
	AirDaysLow, AirDaysHigh int
	ExLow, ExHigh           float64
	ExDaysLow, ExDaysHigh   int
	FCLLow, FCLHigh         float64
	FCLDaysLow, FCLDaysHigh int
	FCL20Low, FCL20High     float64
	FCL40Low, FCL40High     float64
}

var shippingMarkets struct {
	sync.Once
	items map[string]*shippingMarket
}

func shippingMarketFor(language string) *shippingMarket {
	shippingMarkets.Do(func() {
		shippingMarkets.items = make(map[string]*shippingMarket)
		for _, code := range []string{"de", "fr", "es", "it", "nl"} {
			body, err := webassets.Files.ReadFile("assets/data/shipping-planner." + code + ".demo.json")
			var market shippingMarket
			if err == nil && json.Unmarshal(body, &market) == nil && market.Language == code {
				copyJSON, _ := json.Marshal(market.Copy)
				market.CopyJSON = template.JS(copyJSON)
				market.Examples = make(map[string]shippingLaneExample)
				for _, route := range market.Routes {
					if route.Origin != "shanghai" {
						continue
					}
					example := market.Examples[route.Destination]
					for _, offer := range route.Offers {
						if len(offer.Rate) != 2 || len(offer.Days) != 2 {
							continue
						}
						switch offer.Service {
						case "standard":
							example.Low, example.High = offer.Rate[0], offer.Rate[1]
							example.DaysLow, example.DaysHigh = offer.Days[0], offer.Days[1]
						case "air":
							example.AirLow, example.AirHigh = offer.Rate[0], offer.Rate[1]
							example.AirDaysLow, example.AirDaysHigh = offer.Days[0], offer.Days[1]
						case "express":
							example.ExLow, example.ExHigh = offer.Rate[0], offer.Rate[1]
							example.ExDaysLow, example.ExDaysHigh = offer.Days[0], offer.Days[1]
						}
					}
					market.Examples[route.Destination] = example
				}
				for _, route := range market.FclRoutes {
					if route.Origin != "shanghai" {
						continue
					}
					example := market.Examples[route.Destination]
					for _, offer := range route.Offers {
						rate, ok := offer.Rates["40hc"]
						if !ok || len(rate) != 2 || len(offer.Days) != 2 {
							continue
						}
						example.FCLLow, example.FCLHigh = rate[0], rate[1]
						example.FCLDaysLow, example.FCLDaysHigh = offer.Days[0], offer.Days[1]
						if r20, ok := offer.Rates["20gp"]; ok && len(r20) == 2 {
							example.FCL20Low, example.FCL20High = r20[0], r20[1]
						}
						if r40, ok := offer.Rates["40gp"]; ok && len(r40) == 2 {
							example.FCL40Low, example.FCL40High = r40[0], r40[1]
						}
						market.Examples[route.Destination] = example
						break
					}
				}
				shippingMarkets.items[code] = &market
			}
		}
	})
	return shippingMarkets.items[language]
}
