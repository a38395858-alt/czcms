package app

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestLocalPreviewForwardsPublicMedia(t *testing.T) {
	base := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/media/26/5e8c28615ccbaf79" {
			t.Fatalf("unexpected forwarded media path: %s", r.URL.Path)
		}
		w.Header().Set("Content-Type", "image/avif")
		w.WriteHeader(http.StatusOK)
	})
	handler := localPreviewHandler(base, "global")
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "http://localhost:8081/media/26/5e8c28615ccbaf79", nil)
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK || recorder.Header().Get("Content-Type") != "image/avif" {
		t.Fatalf("media was not forwarded: status=%d content_type=%q", recorder.Code, recorder.Header().Get("Content-Type"))
	}
}
