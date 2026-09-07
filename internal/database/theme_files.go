package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type starterThemeFile struct {
	Key, Label, Filename, Group, Content string
}

// The starter sources deliberately use the same public page data contract as
// the built-in Go renderer. They are editable draft sources: publishing them
// is a separate, atomic operation so a syntax mistake can never break the
// currently active site.
var starterThemeFiles = []starterThemeFile{
	{
		Key: "header", Label: "头部", Filename: "partials/header.html", Group: "layout",
		Content: `<header class="site-header">
  <div class="header-shell">
    <a class="brand" href="{{.HomePath}}" aria-label="{{.SiteName}}">
      <span class="brand-copy"><strong>{{.SiteName}}</strong><small>{{.MarketCode}}</small></span>
    </a>
    <nav class="desktop-nav" aria-label="Primary navigation">
      <a href="{{.HomePath}}#services">{{.Copy.NavServices}}</a>
      <a href="{{.HomePath}}#guides">{{.Copy.NavGuides}}</a>
      <a href="{{.HomePath}}#about">{{.Copy.NavAbout}}</a>
      <a href="{{.HomePath}}#contact">{{.Copy.NavContact}}</a>
    </nav>
    <a class="header-cta" href="{{.HomePath}}#contact">{{.Copy.NavContact}}</a>
  </div>
</header>`,
	},
	{
		Key: "footer", Label: "尾部", Filename: "partials/footer.html", Group: "layout",
		Content: `<footer class="site-footer">
  <div class="content-shell footer-main">
    <a class="brand brand-footer" href="{{.HomePath}}"><strong>{{.SiteName}}</strong></a>
    <p>{{.Copy.FooterNote}}</p>
    <nav aria-label="Footer navigation">
      <a href="{{.HomePath}}#services">{{.Copy.NavServices}}</a>
      <a href="{{.HomePath}}#guides">{{.Copy.NavGuides}}</a>
      <a href="{{.HomePath}}#contact">{{.Copy.NavContact}}</a>
    </nav>
  </div>
  <div class="content-shell footer-bottom"><span>© {{.SiteName}}</span><span>{{.LanguageName}} · {{.Locale}}</span></div>
</footer>`,
	},
	{
		Key: "home", Label: "首页", Filename: "pages/home.html", Group: "page",
		Content: `<main id="main-content">
  <section class="hero">
    <div class="hero-shell">
      <div class="hero-copy">
        <p class="hero-kicker">{{.Copy.HeroKicker}}</p>
        <h1>{{.Copy.HeroTitle}}</h1>
        <p class="hero-lead">{{.Copy.HeroBody}}</p>
        <div class="hero-actions"><a class="button button-light" href="#services">{{.Copy.HeroPrimary}}</a><a class="button button-ghost" href="#guides">{{.Copy.HeroSecondary}}</a></div>
      </div>
    </div>
  </section>
  <section class="guides-section" id="guides">
    <div class="content-shell">
      <h2>{{.Copy.GuidesTitle}}</h2>
      <div class="content-grid">{{range .Published}}<article class="content-card"><a href="{{.URL}}"><h3>{{.Title}}</h3><p>{{.Summary}}</p></a></article>{{end}}</div>
    </div>
  </section>
</main>`,
	},
	{
		Key: "category", Label: "栏目页", Filename: "pages/category.html", Group: "page",
		Content: `<main id="main-content" class="category-page">
  <header class="category-heading"><div class="content-shell"><p>{{.SiteName}}</p><h1>{{.Copy.GuidesTitle}}</h1><p>{{.Copy.GuidesBody}}</p></div></header>
  <section class="content-shell category-results">
    <div class="content-grid">{{range .Published}}<article class="content-card"><a href="{{.URL}}"><span>{{.Category}}</span><h2>{{.Title}}</h2><p>{{.Summary}}</p></a></article>{{end}}</div>
  </section>
</main>`,
	},
	{
		Key: "product_category", Label: "产品栏目页", Filename: "products/category.html", Group: "product",
		Content: `<main id="main-content" class="product-category-page">
  <header class="category-heading"><div class="content-shell"><p>{{.SiteName}}</p><h1>{{.TaxonomyName}}</h1><p>{{.Copy.ServicesBody}}</p></div></header>
  <section class="content-shell product-category-results" aria-labelledby="product-category-results-heading">
    <h2 id="product-category-results-heading">{{.TaxonomyName}}</h2>
    <div class="product-grid">{{range .Published}}<article class="product-card"><a href="{{.URL}}">{{with index .Gallery 0}}<img src="{{.URL}}" alt="{{.AltText}}" width="{{.Width}}" height="{{.Height}}" loading="lazy">{{end}}<div><span>{{.Category}}</span><h3>{{.Title}}</h3><p>{{.Summary}}</p></div></a></article>{{else}}<p>{{.Copy.NoGuides}}</p>{{end}}</div>
  </section>
</main>`,
	},
	{
		Key: "content", Label: "内容页", Filename: "pages/content.html", Group: "page",
		Content: `<main id="main-content">
  <article class="article-page">
    <header class="article-masthead"><div class="content-shell"><nav aria-label="Breadcrumb"><a href="{{.HomePath}}">{{.SiteName}}</a><span>{{.Content.Category}}</span></nav><h1>{{.Content.H1}}</h1><p>{{.Content.Summary}}</p></div></header>
    <div class="content-shell article-layout"><div class="article-body">{{.Content.Body}}</div><aside><span>{{.Copy.ArticleUpdated}}</span><time>{{.Content.UpdatedAt}}</time></aside></div>
  </article>
</main>`,
	},
	{
		Key: "product_detail", Label: "产品详情页", Filename: "products/detail.html", Group: "product",
		Content: `<main id="main-content" class="product-detail-page">
  <article class="content-shell product-detail-layout">
    <header class="product-detail-heading"><p>{{.Content.Category}}</p><h1>{{.Content.H1}}</h1>{{if .Content.Summary}}<p>{{.Content.Summary}}</p>{{end}}</header>
    {{if .Content.Gallery}}<section class="product-gallery" aria-label="Product images">{{range .Content.Gallery}}<figure><img src="{{.URL}}" alt="{{.AltText}}" width="{{.Width}}" height="{{.Height}}" loading="lazy"></figure>{{end}}</section>{{end}}
    <div class="product-detail-body"><div class="article-body">{{.Content.Body}}</div>{{if .Content.Tags}}<footer class="product-tags" aria-label="Topics">{{range .Content.Tags}}<span>{{.}}</span>{{end}}</footer>{{end}}</div>
  </article>
</main>`,
	},
	{
		Key: "page", Label: "单页面", Filename: "pages/page.html", Group: "page",
		Content: `<main id="main-content" class="single-page">
  <article class="content-shell">
    <header><p>{{.Content.Category}}</p><h1>{{.Content.H1}}</h1>{{if .Content.Summary}}<p>{{.Content.Summary}}</p>{{end}}</header>
    <div class="article-body">{{.Content.Body}}</div>
  </article>
</main>`,
	},
	{
		Key: "search", Label: "搜索页", Filename: "system/search.html", Group: "system",
		Content: `<main id="main-content" class="search-page">
  <div class="content-shell"><header><h1>{{.Copy.GuidesTitle}}</h1><p>{{.Copy.GuidesBody}}</p></header>
  <div class="content-grid">{{range .Published}}<article><a href="{{.URL}}"><h2>{{.Title}}</h2><p>{{.Summary}}</p></a></article>{{else}}<p>{{.Copy.NoGuides}}</p>{{end}}</div></div>
</main>`,
	},
	{
		Key: "not_found", Label: "404 页面", Filename: "system/404.html", Group: "system",
		Content: `<main id="main-content"><section class="not-found-state"><div class="not-found-code" aria-hidden="true">404</div><div><h1>{{.Copy.NotFoundTitle}}</h1><p>{{.Copy.NotFoundBody}}</p><a class="button button-dark" href="{{.HomePath}}">{{.Copy.NotFoundButton}}</a></div></section></main>`,
	},
}

func seedThemeFilesV13(ctx context.Context, tx *sql.Tx) error {
	now := time.Now().UTC().Format(time.RFC3339Nano)
	for _, file := range starterThemeFiles {
		if _, err := tx.ExecContext(ctx, `INSERT OR IGNORE INTO theme_files(
			theme_package_id, file_key, label, filename, page_group, origin, content, version, updated_by, created_at, updated_at)
			SELECT id, ?, ?, ?, ?, CASE WHEN kind = 'builtin' THEN 'builtin' ELSE 'starter' END, ?, 1, uploaded_by, ?, ?
			FROM theme_packages`, file.Key, file.Label, file.Filename, file.Group, file.Content, now, now); err != nil {
			return fmt.Errorf("初始化模板文件 %s: %w", file.Key, err)
		}
	}
	return nil
}

// seedThemeAssetsV18 provides deliberately small, local-only enhancement
// files. JavaScript is optional and is constrained again at save-time; this
// starter only improves progressive enhancement and never handles secrets or
// submission data.
func seedThemeAssetsV18(ctx context.Context, tx *sql.Tx) error {
	now := time.Now().UTC().Format(time.RFC3339Nano)
	assets := []struct{ Key, Type, Label, Filename, Content string }{
		{"theme_css", "css", "全站样式", "assets/theme.css", `/* 全站公共样式：仅加载本地资源。 */\n.public-site .page-single { padding: 3rem 0 5rem; }`},
		{"page_css", "css", "单页面样式", "assets/page.css", `/* 单页面公共样式。 */\n.single-page .article-body { max-width: 760px; }`},
		{"contact_css", "css", "联系表单样式", "assets/contact.css", `/* 联系表单仅在联系页面加载。 */\n.public-form { display:grid; gap:1rem; }\n.public-form label { display:grid; gap:.45rem; font-weight:600; }\n.public-form input,.public-form select,.public-form textarea { width:100%; padding:.75rem; border:1px solid #cbd5e1; border-radius:.5rem; font:inherit; }`},
		{"theme_js", "js", "全站交互脚本", "assets/theme.js", `document.addEventListener('DOMContentLoaded', () => { document.documentElement.classList.add('js-ready') })`},
		{"contact_js", "js", "联系表单交互脚本", "assets/contact.js", `document.addEventListener('DOMContentLoaded', () => { document.querySelectorAll('[data-public-form]').forEach((form) => form.addEventListener('submit', () => form.classList.add('is-submitting'), { once: true })) })`},
	}
	for _, asset := range assets {
		if _, err := tx.ExecContext(ctx, `INSERT OR IGNORE INTO theme_assets(theme_package_id, asset_key, asset_type, label, filename, content, version, updated_by, created_at, updated_at)
			SELECT id, ?, ?, ?, ?, ?, 1, uploaded_by, ?, ? FROM theme_packages`, asset.Key, asset.Type, asset.Label, asset.Filename, asset.Content, now, now); err != nil {
			return fmt.Errorf("初始化模板资源 %s: %w", asset.Key, err)
		}
	}
	return nil
}
