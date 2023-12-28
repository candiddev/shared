package types

import (
	"testing"
	"time"

	"github.com/candiddev/shared/go/assert"
)

func TestMapLock(t *testing.T) {
	m := NewMapLock[CivilDate]()

	m.Set("1", &CivilDate{
		Year: 2000,
	})
	m.Set("2", &CivilDate{
		Year: 2001,
	})
	m.Set("3", nil)
	m.Set("4", &CivilDate{
		Year: 2002,
	})
	m.Set("4", nil)
	assert.Equal(t, m.Get("1"), &CivilDate{
		Year: 2000,
	})
	assert.Equal(t, m.Get("0"), &CivilDate{})
	assert.Equal(t, m.Keys(), []string{"1", "2"})

	m.mutex.RLock()

	go func() {
		m.Set("1", &CivilDate{
			Year: m.Get("1").Year + 1,
		})
		assert.Equal(t, m.Get("1").Year, 2001)
	}()

	m.mutex.RUnlock()
	time.Sleep(time.Microsecond * 1)
}
