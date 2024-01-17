// Package schema is a PoC for generating JSON schema files.
package schema

import (
	"reflect"
	"strconv"
	"strings"
)

// Schema is a JSON schema.
type Schema struct {
	ID     string `json:"$id"`
	Schema string `json:"$schema"`
	Title  string `json:"title"`
	Property
}

// Properties are properties for a schema.
type Properties map[string]Property

// Property is a property in a schema.
type Property struct {
	Default     any        `json:"default,omitempty"`
	Description string     `json:"description,omitempty"`
	Enum        []string   `json:"enum,omitempty"`
	Items       *Property  `json:"items,omitempty"`
	Maximum     int        `json:"maximum,omitempty"`
	Minimum     int        `json:"minimum,omitempty"`
	Properties  Properties `json:"properties,omitempty"`
	Ref         string     `json:"$ref,omitempty"`
	Required    []string   `json:"required,omitempty"`
	Type        Type       `json:"type,omitempty"`

	isRequired bool
}

// Type is the underlying type of the field.
type Type string

// Types for properties.
const (
	TypeArray   Type = "array"
	TypeBoolean Type = "boolean"
	TypeNumber  Type = "number"
	TypeObject  Type = "object"
	TypeString  Type = "string"
)

func getType(t string) Type {
	switch Type(t) {
	case TypeArray:
		return TypeArray
	case TypeBoolean:
		return TypeBoolean
	case TypeNumber:
		return TypeNumber
	case TypeObject:
		return TypeObject
	case TypeString:
		return TypeString
	}

	return ""
}

func getProperty(v reflect.Value, f reflect.StructField) (string, Property) {
	s := Property{}

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

	//nolint:exhaustive
	switch f.Type.Kind() {
	case reflect.Array:
		ar := ""
		at := Type("")

		if t := f.Tag.Get("items_type"); t != "" {
			at = getType(t)
		} else if t := f.Tag.Get("items_ref"); t != "" {
			ar = t
		}

		s.Type = TypeArray
		s.Items = &Property{
			Ref:  ar,
			Type: at,
		}
	case reflect.Bool:
		s.Default = v.Interface()
		s.Type = TypeBoolean
	case reflect.Int:
		fallthrough
	case reflect.Uint:
		s.Default = v.Interface()
		s.Type = TypeNumber
	case reflect.Map:
		s.Type = TypeObject
	case reflect.String:
		s.Default = v.Interface()
		s.Type = TypeString
	case reflect.Struct:
		s.Type = TypeObject
		s.Properties, s.Required = getProperties(v.Interface())
	}

	return n, s
}

func getProperties(c any) (Properties, []string) {
	v := reflect.ValueOf(c)

	if v.Kind() != reflect.Struct {
		return nil, nil
	}

	p := Properties{}
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

// Get renders a Schema.
func Get(c any, id string, title string) *Schema {
	p, r := getProperties(c)

	return &Schema{
		ID:     id,
		Schema: "https://json-schema.org/draft/2020-12/schema",
		Property: Property{
			Properties: p,
			Required:   r,
		},
		Title: title,
	}
}
