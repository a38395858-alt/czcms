package webassets

import "embed"

// Files contains the native HTML admin shell and its static assets.
//
//go:embed index.html auth.html public.html editorial.html support.html partners.html head.html shipping-planner.html hts-lookup.html hts-detail.html taric-lookup.html fba-warehouses.html warehouse-countries.html public-atlas.html public-it.html public-reference.html public-nl.html enquiry-form.html duty-tax.html shared/enquiry-copy.json assets
var Files embed.FS
