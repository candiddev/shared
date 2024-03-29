package get

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

func fileHTTP(ctx context.Context, src string, dst io.Writer, lastModified time.Time) (newLastModified time.Time, err error) {
	h := strings.Split(src, "#")

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, h[0], nil)
	if err != nil {
		return time.Time{}, fmt.Errorf("error creating request: %w", err)
	}

	if !lastModified.IsZero() {
		req.Header.Add("If-Modified-Since", lastModified.UTC().Format(http.TimeFormat))
	}

	skipVerify := false
	timeout := 10

	if len(h) == 2 {
		for _, header := range strings.Split(h[1], "\r\n") {
			kv := strings.Split(header, ":")
			v := ""

			if len(kv) == 2 {
				v = kv[1]
			}

			switch kv[0] {
			case "clientSkipVerify":
				skipVerify = true
			case "clientTimeout":
				timeout, err = strconv.Atoi(v)
				if err != nil {
					return time.Time{}, fmt.Errorf("error parsing clientTimeout: %w", err)
				}
			default:
				req.Header[kv[0]] = append(req.Header[kv[0]], v)
			}
		}
	}

	var client http.Client

	client.Transport = &http.Transport{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: skipVerify, //nolint:gosec
		},
	}
	client.Timeout = time.Duration(timeout) * time.Second

	res, err := client.Do(req)
	if err != nil {
		return time.Time{}, fmt.Errorf("error making request: %w", err)
	}

	defer res.Body.Close()

	switch res.StatusCode {
	case http.StatusOK:
		if dst != nil {
			if _, err := io.Copy(dst, res.Body); err != nil {
				return time.Time{}, fmt.Errorf("error copying response: %w", err)
			}
		}

		if lm := res.Header.Get("Last-Modified"); lm != "" {
			t, err := time.Parse(http.TimeFormat, lm)
			if err != nil {
				return time.Time{}, fmt.Errorf("error parsing Last-Modified header: %w", err)
			}

			return t, nil
		}
	case http.StatusNotModified:
		return time.Time{}, nil
	default:
		return time.Time{}, fmt.Errorf("bad response from server: %d", res.StatusCode)
	}

	return time.Time{}, nil
}
