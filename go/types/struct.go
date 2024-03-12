package types

import "encoding/json"

// AppendStructToMap adds a struct to a map using JSON.
func AppendStructToMap(s any, m *map[string]any) error {
	b, err := json.Marshal(s)
	if err != nil {
		return err
	}

	return json.Unmarshal(b, m)
}
