package catalog

import (
	"context"
	"errors"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"czcms/internal/contentsafety"
	"czcms/internal/database"
)

func TestMetafieldDefinitionAndValueLifecycle(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	db, err := database.Open(ctx, filepath.Join(t.TempDir(), "metafields.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	now := time.Now().UTC().Format(time.RFC3339)
	result, err := db.ExecContext(ctx, `INSERT INTO users(username,display_name,password_hash,password_changed_at,created_at,updated_at) VALUES ('meta-owner','元字段管理员','test-only',?,?,?)`, now, now, now)
	if err != nil {
		t.Fatal(err)
	}
	userID, _ := result.LastInsertId()
	if _, err = db.ExecContext(ctx, `INSERT INTO user_access_scopes(user_id,site_id,locale,created_at) VALUES (?,0,'*',?)`, userID, now); err != nil {
		t.Fatal(err)
	}
	var siteID int64
	var locale string
	if err = db.QueryRowContext(ctx, `SELECT s.id,sl.locale FROM sites s JOIN site_languages sl ON sl.site_id=s.id AND sl.enabled=1 ORDER BY s.id LIMIT 1`).Scan(&siteID, &locale); err != nil {
		t.Fatal(err)
	}
	service := New(db, contentsafety.NewSanitizer())
	product, err := service.CreateContent(ctx, userID, CreateContentInput{ContentType: "product", SiteID: siteID, Locale: locale, Status: "draft", Title: "Sample product", Slug: "sample-product", BodyHTML: "<p>Product</p>"})
	if err != nil {
		t.Fatal(err)
	}
	definition, err := service.CreateMetafieldDefinition(ctx, userID, MetafieldDefinitionInput{Name: "产品型号", Namespace: "specs", Key: "model", FieldType: "text", OwnerType: "product", Required: true})
	if err != nil {
		t.Fatal(err)
	}
	if definition.Version != 1 || definition.Key != "model" {
		t.Fatalf("definition=%+v", definition)
	}
	if _, err = service.CreateMetafieldDefinition(ctx, userID, MetafieldDefinitionInput{Name: "重复", Namespace: "SPECS", Key: "MODEL", FieldType: "text", OwnerType: "product"}); !errors.Is(err, ErrConflict) {
		t.Fatalf("duplicate error=%v, want conflict", err)
	}
	if _, err = service.UpsertMetafieldValue(ctx, MetafieldValue{DefinitionID: definition.ID, OwnerType: "article", OwnerID: product.ContentID, SiteID: siteID, Locale: locale, Value: "X1"}); !errors.Is(err, ErrInvalid) {
		t.Fatalf("owner mismatch error=%v, want invalid", err)
	}
	value, err := service.UpsertMetafieldValue(ctx, MetafieldValue{DefinitionID: definition.ID, OwnerType: "product", OwnerID: product.ContentID, SiteID: siteID, Locale: locale, Value: "  X1-200  "})
	if err != nil {
		t.Fatal(err)
	}
	if value.Value != "X1-200" {
		t.Fatalf("value=%q, want trimmed", value.Value)
	}
	if _, err = service.UpsertMetafieldValue(ctx, MetafieldValue{DefinitionID: definition.ID, OwnerType: "product", OwnerID: product.ContentID + 9999, SiteID: siteID, Locale: locale, Value: "X"}); !errors.Is(err, ErrNotFound) {
		t.Fatalf("unknown owner error=%v, want not found", err)
	}
	richtext, err := service.CreateMetafieldDefinition(ctx, userID, MetafieldDefinitionInput{Name: "说明", Namespace: "specs", Key: "description", FieldType: "richtext", OwnerType: "product"})
	if err != nil {
		t.Fatal(err)
	}
	cleaned, err := service.UpsertMetafieldValue(ctx, MetafieldValue{DefinitionID: richtext.ID, OwnerType: "product", OwnerID: product.ContentID, SiteID: siteID, Locale: locale, Value: `<p>safe</p><script>alert(1)</script>`})
	if err != nil {
		t.Fatal(err)
	}
	if cleaned.Value == "" || strings.Contains(cleaned.Value, "script") {
		t.Fatalf("richtext not sanitized: %q", cleaned.Value)
	}
}
