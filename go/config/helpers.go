package config

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"
	"strconv"
	"strings"

	"github.com/candiddev/shared/go/jsonnet"
	"github.com/candiddev/shared/go/logger"
)

// TODO remove me.
type lookupFunc func(key string, lookupValues any) (string, error)

// TODO remove me.
func iterateConfig(prefix string, keys reflect.Type, values reflect.Value, lFunc lookupFunc, lValues any) error {
	for i := 0; i < keys.NumField(); i++ {
		key := keys.Field(i)
		value := values.Field(i)

		if key.Type.Kind() == reflect.Struct {
			p := fmt.Sprintf("%s%s", prefix, key.Name)
			err := iterateConfig(p, key.Type, value, lFunc, lValues)

			if err != nil {
				return err
			}

			continue
		}

		if key.Type.Kind() == reflect.Map {
			if err := iterateMap(key.Name, prefix, lFunc, lValues, value); err != nil {
				return err
			}

			continue
		}

		p := fmt.Sprintf("%s_%s", prefix, key.Name)

		v, err := lFunc(p, lValues)
		if err != nil {
			return err
		}

		rv, err := getValueFromString(v, value)
		if err != nil {
			return err
		}

		if rv.IsValid() {
			value.Set(rv.Convert(value.Type()))
		}
	}

	return nil
}

// TODO remove me.
func iterateMap(keyName, prefix string, lFunc lookupFunc, lValues any, value reflect.Value) error {
	keys := value.MapKeys()

	for i := range keys {
		p := fmt.Sprintf("%s%s_%s", prefix, keyName, keys[i])

		v, err := lFunc(p, lValues)
		if err != nil {
			return err
		}

		k := value.MapIndex(keys[i])
		if k.Kind() == reflect.Interface {
			k = value.MapIndex(keys[i]).Elem()
		}

		rv, err := getValueFromString(v, k)
		if err != nil {
			return err
		}

		if rv.IsValid() {
			value.SetMapIndex(keys[i], rv)
		}
	}

	return nil
}

// TODO remove me.
func getValueFromString(input string, value reflect.Value) (reflect.Value, error) {
	if input != "" {
		switch value.Kind() { //nolint:exhaustive
		case reflect.Bool:
			if strings.ToLower(input) == "yes" {
				return reflect.ValueOf(true), nil
			} else if strings.ToLower(input) == "no" {
				return reflect.ValueOf(false), nil
			}

			v, err := strconv.ParseBool(input)
			if err != nil {
				return reflect.Value{}, err
			}

			return reflect.ValueOf(v), nil
		case reflect.Float64:
			v, err := strconv.ParseFloat(input, 64)
			if err != nil {
				return reflect.Value{}, err
			}

			if v != 0 {
				return reflect.ValueOf(v), nil
			}
		case reflect.Int:
			v, err := strconv.ParseInt(input, 10, 64)
			if err != nil {
				return reflect.Value{}, err
			}

			if v != 0 {
				return reflect.ValueOf(int(v)), nil
			}
		case reflect.Slice:
			v := strings.Split(input, ",")

			return reflect.ValueOf(v), nil
		case reflect.String:
			return reflect.ValueOf(input), nil
		case reflect.Uint:
			v, err := strconv.ParseUint(input, 10, 64)
			if err != nil {
				return reflect.Value{}, err
			}

			if v != 0 {
				return reflect.ValueOf(v), nil
			}
		}
	}

	return reflect.Value{}, nil
}

// ParseValues will set config values from a list of kv pairs, like environment variables.
func ParseValues(ctx context.Context, config any, prefix string, kvs []string) error { //nolint:gocognit
	j := map[string]any{}

	b, err := json.Marshal(config)
	if err != nil {
		return err
	}

	if err := json.Unmarshal(b, &j); err != nil {
		return err
	}

	jsn := ""

	for _, kv := range kvs {
		if strings.HasPrefix(kv, prefix) {
			ek := strings.Split(kv, "=")
			if len(ek) >= 2 && ek[0] != strings.ToUpper(ek[0]) {
				keys := []string{}
				value := strings.Join(ek[1:], "=")

				if ek[0] == prefix+"config" {
					jsn = value

					continue
				}

				for i, p := range strings.Split(ek[0], "_") {
					if prefix != "" && i == 0 {
						continue
					}

					keys = append(keys, p)
				}

				k := j

				var v any

				if i, err := strconv.Atoi(value); err == nil {
					v = i
				} else if value == "true" { //nolint:gocritic
					v = true
				} else if value == "false" {
					v = false
				} else if strings.HasPrefix(value, "[") || strings.HasPrefix(value, "{") {
					v = json.RawMessage([]byte(value))
				} else if value != "null" {
					v = value
				}

				for i, key := range keys {
					if i == len(keys)-1 {
						break
					}

					i, ok := k[key].(map[string]any)
					if !ok || i == nil {
						k[key] = map[string]any{}
					}

					k = k[key].(map[string]any) //nolint:revive
				}

				k[keys[len(keys)-1]] = v
			}
		}
	}

	if jsn != "" {
		r := jsonnet.NewRender(ctx, config)
		r.Import(r.GetString(jsn))

		if err := r.Render(ctx, config); err != nil {
			return logger.Error(ctx, err)
		}
	}

	b, err = json.Marshal(j)
	if err != nil {
		return err
	}

	return json.Unmarshal(b, config)
}
