package schema

import (
	"reflect"
	"strconv"
	"strings"
)

type Schema struct {
	ID     string `json:"$id"`
	Schema string `json:"$schema"`
	Title  string `json:"title"`
	SchemaProperty
}

type SchemaProperties map[string]SchemaProperty

type SchemaProperty struct {
	Default     any              `json:"default,omitempty"`
	Description string           `json:"description,omitempty"`
	Enum        []string         `json:"enum,omitempty"`
	Items       *SchemaProperty  `json:"items,omitempty"`
	Maximum     int              `json:"maximum,omitempty"`
	Minimum     int              `json:"minimum,omitempty"`
	Properties  SchemaProperties `json:"properties,omitempty"`
	Ref         string           `json:"$ref,omitempty"`
	Required    []string         `json:"required,omitempty"`
	Type        SchemaType       `json:"type,omitempty"`

	isRequired bool
}

type SchemaType string

const (
	SchemaTypeArray   SchemaType = "array"
	SchemaTypeBoolean SchemaType = "boolean"
	SchemaTypeNumber  SchemaType = "number"
	SchemaTypeObject  SchemaType = "object"
	SchemaTypeString  SchemaType = "string"
)

func getType(t string) SchemaType {
	switch SchemaType(t) {
	case SchemaTypeArray:
		return SchemaTypeArray
	case SchemaTypeBoolean:
		return SchemaTypeBoolean
	case SchemaTypeNumber:
		return SchemaTypeNumber
	case SchemaTypeObject:
		return SchemaTypeObject
	case SchemaTypeString:
		return SchemaTypeString
	}

	return ""
}

func getProperty(v reflect.Value, f reflect.StructField) (string, SchemaProperty) {
	s := SchemaProperty{}
	n := f.Tag.Get("json")
	if n == "" {
		n = f.Name
	}

	if t := f.Tag.Get("description"); t != "" {
		s.Description = t
	}

	if t := f.Tag.Get("enum"); t != "" {
		s.Enum = strings.Split(t, ",")
	}

	if t := f.Tag.Get("maximum"); t != "" {
		if n, _ := strconv.Atoi(t); n != 0 {
			s.Maximum = n
		}
	}

	if t := f.Tag.Get("minimum"); t != "" {
		if n, _ := strconv.Atoi(t); n != 0 {
			s.Minimum = n
		}
	}

	if t := f.Tag.Get("ref"); t != "" {
		s.Ref = t
	}

	if _, ok := f.Tag.Lookup("required"); ok {
		s.isRequired = true
	}

	switch f.Type.Kind() {
	case reflect.Array:
		ar := ""
		at := SchemaType("")

		if t := f.Tag.Get("items_type"); t != "" {
			at = getType(t)
		} else if t := f.Tag.Get("items_ref"); t != "" {
			ar = t
		}

		s.Type = SchemaTypeArray
		s.Items = &SchemaProperty{
			Ref:  ar,
			Type: at,
		}
	case reflect.Bool:
		s.Default = v.Interface()
		s.Type = SchemaTypeBoolean
	case reflect.Int:
		fallthrough
	case reflect.Uint:
		s.Default = v.Interface()
		s.Type = SchemaTypeNumber
	case reflect.Map:
		s.Type = SchemaTypeObject
	case reflect.String:
		s.Default = v.Interface()
		s.Type = SchemaTypeString
	case reflect.Struct:
		s.Type = SchemaTypeObject
		s.Properties, s.Required = getProperties(v.Interface())
	}

	return n, s
}

func getProperties(c any) (SchemaProperties, []string) {
	v := reflect.ValueOf(c)

	if v.Kind() != reflect.Struct {
		return nil, nil
	}

	p := SchemaProperties{}
	r := []string{}

	for i := 0; i < v.NumField(); i++ {
		k, v := getProperty(v.Field(i), v.Type().Field(i))
		if v.isRequired {
			r = append(r, k)
		}

		p[k] = v
	}

	return p, r
}

func Get(c any, id string, title string) *Schema {
	p, r := getProperties(c)
	return &Schema{
		ID:     id,
		Schema: "https://json-schema.org/draft/2020-12/schema",
		SchemaProperty: SchemaProperty{
			Properties: p,
			Required:   r,
		},
		Title: title,
	}
}
