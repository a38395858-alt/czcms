package authorization

import (
	"context"
	"path/filepath"
	"testing"

	"czcms/internal/auth"
	"czcms/internal/database"
	"czcms/internal/security"
)

func TestRBACAndSiteLocaleScope(t *testing.T) {
	ctx := context.Background()
	root := t.TempDir()
	db, err := database.Open(ctx, filepath.Join(root, "rbac.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	keys, _ := security.LoadKeyring("", filepath.Join(root, "secrets"), "development")
	authService, _ := auth.New(db, keys, auth.Config{})
	owner, err := authService.CreateInitialOwner(ctx, "owner", "Owner", "", "correct horse battery staple")
	if err != nil {
		t.Fatal(err)
	}
	service := New(db)
	editor, err := service.CreateUser(ctx, CreateUserRequest{Username: "editor", DisplayName: "Editor", Password: "editor secure passphrase", Roles: []string{"editor"}, Scopes: []Scope{{SiteID: 1, Locale: "de-DE"}}}, true)
	if err != nil {
		t.Fatal(err)
	}
	if allowed, _ := service.CanAccess(ctx, editor.ID, "content.write", 1, "de-DE"); !allowed {
		t.Fatal("editor should access assigned site/locale")
	}
	if allowed, _ := service.CanAccess(ctx, editor.ID, "content.write", 1, "fr-FR"); allowed {
		t.Fatal("editor escaped locale scope")
	}
	if allowed, _ := service.Can(ctx, editor.ID, "users.manage"); allowed {
		t.Fatal("editor received user management")
	}
	if err = service.UpdateAccess(ctx, owner.ID, AccessUpdate{Roles: []string{"administrator"}, Scopes: []Scope{{SiteID: 0, Locale: "*"}}}, true); err == nil {
		t.Fatal("last owner could be removed")
	}
}
