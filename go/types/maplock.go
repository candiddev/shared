package types

import "sync"

// MapLock is a standard Map/Mutex struct.
type MapLock[T any] struct {
	m     map[string]T
	mutex sync.RWMutex
}

// NewMapLock creates a new MapLock pointer with an initialized map.
func NewMapLock[T any]() *MapLock[T] {
	return &MapLock[T]{
		m: map[string]T{},
	}
}

// Get returns a Key from a map, taking care of any locks.
func (m *MapLock[T]) Get(key string) *T {
	m.mutex.RLock()
	defer m.mutex.RUnlock()

	o := m.m[key]

	return &o
}

// Set sets a Key in a map, taking care of any locks.
func (m *MapLock[T]) Set(key string, value *T) {
	m.mutex.Lock()
	defer m.mutex.Unlock()

	if value == nil {
		delete(m.m, key)
	} else {
		m.m[key] = *value
	}
}
