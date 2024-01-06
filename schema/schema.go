package schema

import (
	"reflect"
)

type Schema map[string]any

func getField(v reflect.Value, f reflect.StructField) (name string, usage any, value any) {
	n := f.Tag.Get("json")
	if n == "" {
		n = f.Name
	}

	var o any

	if f.Type.Kind() == reflect.Struct {
		o = Get(v.Interface())
	} else {
		o = f.Tag.Get("usage")
		value = v.Interface()
	}

	return n, o, value
}

func Get(c any) *Schema {
	s := Schema{}
	v := reflect.ValueOf(c)

	for i := 0; i < v.NumField(); i++ {
		f := v.Field(i)
		n, o, value := getField(f, v.Type().Field(i))
		if value == nil {
			s[n] = o
		} else {
			s[n] = value
			s[n+":usage"] = o
		}
	}

	return &s
}
