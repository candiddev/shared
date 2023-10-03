package get

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"os"
	"testing"
	"time"

	"github.com/candiddev/shared/go/assert"
)

func TestFile(t *testing.T) {
	ctx := context.Background()
	h := NewHTTPMock([]string{"/good1", "/good2"}, []byte("Hello World"), time.Now().UTC())

	os.WriteFile("./local", []byte("Hello World"), 0600)
	local, _ := os.Stat("./local")

	tests := []struct {
		err              bool
		dst              string
		lastModified     time.Time
		name             string
		src              string
		wantHTTPRequest  HTTPMockRequest
		wantLastModified time.Time
		writer           io.Writer
	}{
		{
			err:    true,
			name:   "bad request",
			src:    "sssssss://somewhere",
			writer: &bytes.Buffer{},
		},
		{
			err:  true,
			name: "bad path",
			src:  h.URL() + "/bad",
			wantHTTPRequest: HTTPMockRequest{
				Status: http.StatusNotFound,
				Path:   "/bad",
			},
			writer: &bytes.Buffer{},
		},
		{
			name: "good path",
			src:  h.URL() + "/good1",
			wantHTTPRequest: HTTPMockRequest{
				Status: http.StatusOK,
				Path:   "/good1",
			},
			wantLastModified: h.LastModified(),
			writer:           &bytes.Buffer{},
		},
		{
			lastModified: h.LastModified(),
			name:         "no change",
			src:          h.URL() + "/good2#a:b\r\na:c\r\nc:d",
			wantHTTPRequest: HTTPMockRequest{
				Headers: http.Header{
					"A": {
						"b",
						"c",
					},
					"C": {
						"d",
					},
					"If-Modified-Since": []string{h.LastModifiedHeader()},
				},
				Status: http.StatusNotModified,
				Path:   "/good2",
			},
			writer: &bytes.Buffer{},
		},
		{
			name: "http no writer",
			src:  h.URL() + "/good1",
			wantHTTPRequest: HTTPMockRequest{
				Status: http.StatusOK,
				Path:   "/good1",
			},
			wantLastModified: h.LastModified(),
		},
		{
			err:    true,
			name:   "local not found",
			src:    "file://asdf",
			writer: &bytes.Buffer{},
		},
		{
			name:             "local",
			src:              "file:/./local",
			wantLastModified: local.ModTime(),
			writer:           &bytes.Buffer{},
		},
		{
			name:             "local no writer",
			src:              "file:/./local",
			wantLastModified: local.ModTime(),
			writer:           nil,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			lm, err := File(ctx, tc.src, tc.writer, tc.lastModified)
			assert.Equal(t, err != nil, tc.err)
			assert.Equal(t, lm, tc.wantLastModified)

			if !tc.err && tc.lastModified.IsZero() && tc.writer != nil {
				assert.Equal(t, tc.writer.(*bytes.Buffer).Bytes(), []byte("Hello World"))
			} else if tc.writer != nil {
				assert.Equal(t, tc.writer.(*bytes.Buffer).Bytes(), nil)
			}

			if tc.wantHTTPRequest.Path != "" {
				r := h.Requests()
				if len(tc.wantHTTPRequest.Headers) == 0 {
					r[0].Headers = nil
				}

				assert.Equal(t, r[0], tc.wantHTTPRequest)
			}
		})
	}

	os.Remove("./local")
	h.Close()
}

func TestFileCache(t *testing.T) {
	ctx := context.Background()
	lm := time.Now().UTC()
	h := NewHTTPMock([]string{"/good1", "/good2"}, []byte("Hello World"), lm)

	os.Mkdir("./cache", 0700)
	os.WriteFile("./local", []byte("Hello World"), 0600)
	os.Chtimes("./local", lm, lm)

	tests := []struct {
		cachePath string
		err       bool
		name      string
		src       string
	}{
		{
			err:  true,
			name: "invalid file",
			src:  "/asdfasdkfsjdfkasdfjaskdf",
		},
		{
			cachePath: "/asdfsdjfkasjdfkasjdfkasjd",
			err:       true,
			name:      "invalid cache",
			src:       h.URL() + "/good1",
		},
		{
			cachePath: "./cache/cache",
			name:      "local file",
			src:       "./local",
		},
		{
			cachePath: "./cache/cache",
			name:      "new file",
			src:       h.URL() + "/good1",
		},
		{
			cachePath: "./cache/cache",
			name:      "cache",
			src:       h.URL() + "/good1",
		},
	}

	for _, tc := range tests {
		out := bytes.Buffer{}

		t.Run(tc.name, func(t *testing.T) {
			assert.Equal(t, FileCache(ctx, tc.src, &out, tc.cachePath) != nil, tc.err)
		})
	}

	_, err := os.Stat("./cache/local")
	assert.Equal(t, err != nil, true)

	req := h.requests
	assert.Equal(t, len(req), 3)

	m := false

	for i := range req {
		if req[i].Headers.Get("if-modified-since") == lm.Format(http.TimeFormat) && req[i].Status == http.StatusNotModified {
			m = true

			break
		}
	}

	assert.Equal(t, m, true)

	os.Remove("./local")
	os.RemoveAll("./cache")
	h.Close()
}
