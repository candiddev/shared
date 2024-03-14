package jsonnet

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/candiddev/shared/go/diff"
	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/logger"
	"github.com/candiddev/shared/go/types"
	"github.com/google/go-jsonnet"
)

// Imports is a collection of jsonnet files.
type Imports struct {
	Entrypoint string                      `json:"entrypoint"`
	Files      map[string]string           `json:"files"`
	Raw        map[string]jsonnet.Contents `json:"-"`
}

var ErrImport = errors.New("error importing jsonnet files")
var matchPath = regexp.MustCompile(`^/[^/]*`)

// Diff returns the difference for each file.
func (i *Imports) Diff(newName, oldName string, old *Imports) string {
	j1, _ := json.MarshalIndent(i, "", "  ")   //nolint:errchkjson
	j2, _ := json.MarshalIndent(old, "", "  ") //nolint:errchkjson

	return string(diff.Diff(oldName, j2, newName, j1))
}

// GetPath gathers dependencies and text from a path.
func (r *Render) GetPath(ctx context.Context, path string) (*Imports, errs.Err) {
	im := Imports{
		Files: map[string]string{},
	}

	ctx = logger.SetAttribute(ctx, "path", path)

	imports, err := r.vm.FindDependencies("", []string{
		path,
	}, false)
	if err != nil {
		return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(ErrImport, err))
	}

	c, _, err := r.vm.ImportData("", path)
	if err != nil {
		return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(ErrImport, err))
	}

	if !strings.HasPrefix(path, "/") {
		p, err := os.Getwd()
		if err != nil {
			return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(ErrImport, err))
		}

		path = filepath.Join(p, path)
	}

	r.path = filepath.Dir(path)
	basePath := r.path

	for i := range imports {
		imports[i] = filepath.Clean(imports[i])

		for !strings.HasPrefix(imports[i], basePath) {
			basePath = filepath.Dir(basePath)
		}
	}

	if basePath == "/" {
		basePath = ""
	}

	for i := range imports {
		c, _, err := r.vm.ImportData(path, imports[i])
		if err != nil {
			return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(ErrImport, err))
		}

		im.Files[strings.Replace(filepath.Clean(imports[i]), basePath, "", 1)] = c
	}

	im.Entrypoint = strings.Replace(path, basePath, "", 1)
	im.Files[im.Entrypoint] = c

	return &im, logger.Error(ctx, nil)
}

// GetString returns imports from a string.
func (r *Render) GetString(ctx context.Context, content string) (*Imports, errs.Err) {
	d, e := os.Getwd()
	if e != nil {
		return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(fmt.Errorf("error determining wd: %w", e)))
	}

	m := filepath.Join(d, ".etcha."+types.RandString(10))

	if err := os.WriteFile(m, []byte(content), 0600); err != nil {
		return nil, errs.ErrReceiver.Wrap(fmt.Errorf("error writing temporary file: %w", err))
	}

	i, err := r.GetPath(ctx, m)
	if err != nil {
		return nil, err
	}

	if e := os.Remove(m); e != nil {
		return nil, errs.ErrReceiver.Wrap(fmt.Errorf("error removing temporary file: %w", e))
	}

	return i, err
}

// Import takes an Imports, converts them into importContent, and sets the vm.Importer.
func (r *Render) Import(i *Imports) {
	r.imports = i
	i.Raw = map[string]jsonnet.Contents{}

	r.vm.Importer(i)
}

// Import allows Imports to act as a jsonnet import provider.
func (i Imports) Import(importedFrom, importedPath string) (contents jsonnet.Contents, foundAt string, err error) {
	op := importedPath

	if !strings.HasPrefix(importedPath, "/") {
		importedPath = filepath.Join(filepath.Dir(importedFrom), importedPath)
	}

	f, ok := i.Files[importedPath]
	for !ok && importedPath != "" {
		importedPath = matchPath.ReplaceAllString(importedPath, "")
		f, ok = i.Files[importedPath]
	}

	if ok {
		if c, ok := i.Raw[importedPath]; ok {
			return c, importedPath, nil
		}

		r := jsonnet.MakeContentsRaw([]byte(f))
		i.Raw[importedPath] = r

		return r, importedPath, nil
	}

	if importedPath == "" {
		importedPath = op
	}

	return jsonnet.Contents{}, "", fmt.Errorf("couldn't find import %s from %s", importedPath, importedFrom)
}
