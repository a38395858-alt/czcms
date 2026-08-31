package webassets

import "embed"

// Files contains the native HTML admin shell and its static assets.
//
//go:embed index.html auth.html public.html public-atlas.html assets
var Files embed.FS
