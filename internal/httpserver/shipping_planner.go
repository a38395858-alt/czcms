package httpserver

const shippingCalculatorSlug = "tools/shipping-calculator"
const shippingResultsSlug = "tools/shipping-results"

// Keep search snippets and social previews aligned with the visible calculator.
func configureShippingPlannerSEO(data *publicSitePageData) {
	if market := data.ShippingMarket; market != nil {
		data.PageTitle, data.MetaDescription = market.SEO.Title, market.SEO.Description
		if data.IsHome {
			data.PageTitle = market.SEO.HomeTitle
		}
		if data.IsShippingPlanner {
			data.PageTitle = market.Copy["resultTitle"].(string) + " | FreightVanta"
		}
		data.MetaKeywords = market.SEO.Keywords
		data.OGTitle, data.OGDescription = data.PageTitle, data.MetaDescription
		return
	}
	data.PageTitle = "China to USA Shipping Cost & Transit Time Calculator | FreightVanta"
	data.MetaDescription = "Compare door-to-door China-to-USA shipping costs and transit times by lane: ocean LCL, FCL, air and express from five Chinese ports to seven US destinations."
	if data.IsHome {
		data.PageTitle = "China to USA Freight & US Delivery | FreightVanta"
		data.MetaDescription = "Plan China-to-USA ocean freight, air freight, express and US warehouse delivery. Use our cost and transit time calculator, then request a shipment-specific quote."
	}
	if data.IsShippingPlanner {
		data.PageTitle = "Shipping Cost & Transit Time Results | FreightVanta"
		data.MetaDescription = "View estimated shipping costs and transit times for China-to-USA ocean, air and express freight or US warehouse delivery. Contact us for a current quote."
	}
	data.MetaKeywords = "China to USA shipping cost, China to US transit time, shipping cost calculator, ocean LCL cost per CBM, FCL 40HQ rate, air freight cost per kg, express courier cost, US last-mile delivery"
	data.OGTitle, data.OGDescription = data.PageTitle, data.MetaDescription
}
