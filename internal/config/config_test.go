package config

import "testing"

func TestProductionRejectsInsecureCombinations(t *testing.T) {
	_, err := (Config{Environment: "production", HTTPAddr: "0.0.0.0:8080"}).Normalize()
	if err == nil {
		t.Fatal("production accepted HTTP and insecure cookie")
	}
	_, err = (Config{Environment: "production", HTTPAddr: "0.0.0.0:8080", CookieSecure: true, PublicHTTPS: true, MasterKey: "configured", BackupKey: "configured", RedisAddr: "10.0.0.2:6379"}).Normalize()
	if err == nil {
		t.Fatal("production accepted Redis without ACL and TLS")
	}
}

func TestProductionProxyMustBeLoopbackAndTrusted(t *testing.T) {
	base := Config{Environment: "production", CookieSecure: true, PublicHTTPS: true, MasterKey: "configured", BackupKey: "configured", SetupToken: "12345678901234567890123456789012", AntivirusCommand: "scanner"}
	base.HTTPAddr = "0.0.0.0:8080"
	base.TrustedProxies = []string{"127.0.0.1"}
	if _, err := base.Normalize(); err == nil {
		t.Fatal("proxy mode accepted public cleartext listener")
	}
	base.HTTPAddr = "127.0.0.1:8080"
	base.TrustedProxies = nil
	if _, err := base.Normalize(); err == nil {
		t.Fatal("proxy mode accepted no trusted proxy")
	}
	base.TrustedProxies = []string{"127.0.0.1"}
	if _, err := base.Normalize(); err != nil {
		t.Fatalf("valid proxy mode rejected: %v", err)
	}
}

func TestAIConfigurationCanBeDisabledOrMustNameAModel(t *testing.T) {
	if _, err := (Config{}).Normalize(); err != nil {
		t.Fatalf("disabled AI should use article fallback: %v", err)
	}
	if _, err := (Config{AIBaseURL: "https://example.com/v1", AIAPIKey: "secret"}).Normalize(); err == nil {
		t.Fatal("partial AI configuration was accepted")
	}
}
