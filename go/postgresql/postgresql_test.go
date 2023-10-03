package postgresql

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/logger"
	"github.com/candiddev/shared/go/metrics"
	"github.com/candiddev/shared/go/types"
	"github.com/google/uuid"
)

//go:embed migrations_bad/*.sql
var migrationsBad embed.FS

//go:embed migrations_good1/*.sql
var migrationsGood1 embed.FS

//go:embed migrations_good2/*.sql
var migrationsGood2 embed.FS

//go:embed triggers/*.sql
var triggers embed.FS

var TestTable = `
CREATE TABLE test_data (
	  id text primary key
	, data text
	, number integer
	, test boolean
)
`

var JoinTable = `
CREATE TABLE join_data (
	  id text primary key
	, test text references test_data (id)
)`

var ctx context.Context

var p Config

type JoinData struct {
	ID   string `db:"id"`
	Test string `db:"test"`
}

type TestData struct {
	ID     string `db:"id"`
	Data   string `db:"data"`
	Number int64  `db:"number"`
	Test   bool   `db:"test"`
}

func TestMain(m *testing.M) {
	ctx = context.Background()

	metrics.Setup("homechart")

	p = Config{
		Database: "testdb",
		Hostname: "127.0.0.1",
		Password: "testuser",
		Port:     5432,
		SSLMode:  "disable",
		Username: "testuser",
	}

	if err := p.Setup(ctx); err != nil {
		os.Exit(1)
	}

	p.Exec(ctx, "DROP OWNED BY current_user", nil)
	ctx = logger.SetLevel(ctx, logger.LevelDebug)
	r := m.Run()
	os.Exit(r)
}

func TestSetup(t *testing.T) {
	logger.UseTestLogger(t)

	pt := p

	tests := map[string]struct {
		err   error
		input string
	}{
		"good": {
			input: "testdb",
		},
		"bad": {
			err:   ErrPostgreSQLConnect,
			input: "testdb2",
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			pt.Database = tc.input
			assert.HasErr(t, pt.Setup(ctx), tc.err)
		})
	}
}

func TestExec(t *testing.T) {
	logger.UseTestLogger(t)
	p.Exec(ctx, TestTable, nil)
	p.Exec(ctx, JoinTable, nil)

	var d = TestData{
		ID:     "100",
		Data:   "test",
		Number: 1,
		Test:   true,
	}

	tests := []struct { // This test needs to be ordered
		err           error
		inputArgument any
		inputQuery    string
		name          string
	}{
		{
			name:          "insert",
			inputArgument: &d,
			inputQuery: `
INSERT INTO TEST_DATA (
	  id
	, data
	, number
	, test
) VALUES (
	  :id
	, :data
	, :number
	, :test
)`,
		},
		{
			name:          "exists",
			err:           errs.ErrSenderConflict,
			inputArgument: &d,
			inputQuery: `
INSERT INTO test_data (
	  id
	, data
	, number
	, test
) VALUES (
	  :id
	, :data
	, :number
	, :test
)`,
		},
		{
			name: "insert 2",
			inputArgument: &JoinData{
				ID:   "100",
				Test: "100",
			},
			inputQuery: `
INSERT INTO join_data (
	  id
	, test
) VALUES (
	  :id
	, :test
)`,
		},
		{
			name: "missing",
			err:  errs.ErrSenderBadRequest,
			inputArgument: &JoinData{
				ID:   "2",
				Test: "2",
			},
			inputQuery: `
INSERT INTO join_data (
	  id
	, test
) VALUES (
	  :id
	, :test
)`,
		},
		{
			name: "bad query",
			err:  ErrPostgreSQLAction,
			inputArgument: &JoinData{
				ID:   "2",
				Test: "2",
			},
			inputQuery: `
INSERT INTO join_data (
	bad_column
) VALUES (
	:id
)`,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			assert.HasErr(t, p.Exec(ctx, tc.inputQuery, tc.inputArgument), tc.err)
		})
	}

	p.Exec(ctx, "DROP TABLE join_data", nil)
	p.Exec(ctx, "DROP TABLE test_data", nil)
}

func TestListen(t *testing.T) {
	logger.UseTestLogger(t)

	ctx1, cancel1 := context.WithCancel(ctx)
	ctx2, cancel2 := context.WithCancel(ctx)

	receiver1 := &types.TableNotify{}
	receiver2 := &types.TableNotify{}

	go p.Listen(ctx1, func(_ context.Context, n *types.TableNotify) {
		receiver1 = n
	})
	go p.Listen(ctx2, func(_ context.Context, n *types.TableNotify) {
		receiver2 = n
	})
	time.Sleep(1 * time.Second)

	aa := uuid.New()
	ah := uuid.New()
	id := uuid.New()

	p.Exec(ctx, fmt.Sprintf(`
SELECT pg_notify(
	'changes',
	json_build_object(
		'authAccountID', '%s',
		'authHouseholdID', '%s',
		'id', '%s',
		'table', 'test'
	)::text
)
`, aa, ah, id), nil)

	for i := 0; i < 5; i++ {
		if receiver1.Table != "" {
			break
		}

		time.Sleep(1 * time.Second)
	}

	for i := 0; i < 5; i++ {
		if receiver2.Table != "" {
			break
		}

		time.Sleep(1 * time.Second)
	}

	want := &types.TableNotify{
		AuthAccountID:   &aa,
		AuthHouseholdID: &ah,
		ID:              id,
		Table:           "test",
	}

	assert.Equal(t, receiver1, want)
	assert.Equal(t, receiver2, want)

	p.Exec(ctx, fmt.Sprintf(`
SELECT pg_notify(
	'changes',
	json_build_object(
		'authAccountID', '%s',
		'authHouseholdID', '%s',
		'id', '%s',
		'table', '111'
	)::text
)
`, aa, ah, id), nil)

	for i := 0; i < 5; i++ {
		if receiver1.Table != "test" {
			break
		}

		time.Sleep(1 * time.Second)
	}

	assert.Equal(t, receiver1.Table, "111")

	for i := 0; i < 5; i++ {
		if receiver2.Table != "test" {
			break
		}

		time.Sleep(1 * time.Second)
	}

	assert.Equal(t, receiver2.Table, "111")

	cancel1()
	cancel2()
}

func TestLockExistsGet(t *testing.T) {
	logger.UseTestLogger(t)

	conn1, _ := p.Conn(ctx)
	defer conn1.Close()

	conn2, _ := p.Conn(ctx)
	defer conn2.Close()

	tests := map[string]struct {
		input *sql.Conn
		want  bool
	}{
		"1-a": {
			input: conn1,
			want:  true,
		},
		"1-b": {
			input: conn1,
			want:  true,
		},
		"2": {
			input: conn2,
			want:  false,
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			assert.Equal(t, p.LockAcquire(ctx, LockMigrations, tc.input), tc.want)
			assert.Equal(t, p.LockAcquire(ctx, LockMigrations, tc.input), tc.want)
		})
	}

	p.LockRelease(ctx, LockMigrations, conn1)
	p.LockRelease(ctx, LockMigrations, conn1)
}

func TestLockRelease(t *testing.T) {
	conn, _ := p.Conn(ctx)
	defer conn.Close()

	lock := p.LockAcquire(ctx, LockMigrations, conn)
	p.LockRelease(ctx, LockMigrations, conn)

	assert.Equal(t, lock, true)

	var e bool

	p.db.QueryRow("SELECT EXISTS(SELECT mode FROM pg_locks WHERE objid = $1)", LockMigrations).Scan(&e)

	assert.Equal(t, e, false)
}

func TestMigrate(t *testing.T) {
	logger.UseTestLogger(t)

	assert.Equal(t, p.Migrate(ctx, "test", triggers, migrationsGood1), nil)

	var count int

	p.Query(ctx, false, &count, "SELECT version FROM migration WHERE app = 'test'", nil)

	assert.Equal(t, count, 1)

	assert.Equal(t, p.Migrate(ctx, "test", triggers, migrationsGood1), nil)

	p.Query(ctx, false, &count, "SELECT version FROM migration WHERE app = 'test'", nil)

	assert.Equal(t, count, 1)

	assert.HasErr(t, p.Migrate(ctx, "test", triggers, migrationsBad), ErrPostgreSQLMigrate)

	assert.Equal(t, p.Migrate(ctx, "test", triggers, migrationsGood2), nil)

	p.Query(ctx, false, &count, "SELECT version FROM migration WHERE app = 'test'", nil)

	assert.Equal(t, count, 2)
}

func TestQuery(t *testing.T) {
	logger.UseTestLogger(t)
	p.Exec(ctx, TestTable, nil)

	d1 := TestData{
		ID:     "1",
		Data:   "test",
		Number: 1,
		Test:   true,
	}
	d2 := TestData{
		ID:     "2",
		Data:   "test",
		Number: 2,
		Test:   true,
	}

	p.Exec(ctx, `
INSERT INTO test_data (
	  id
	, data
	, number
	, test
) VALUES (
	  :id
	, :data
	, :number
	, :test
)`, d1)
	p.Exec(ctx, `
INSERT INTO test_data (
	  id
	, data
	, number
	, test
) VALUES (
	  :id
	, :data
	, :number
	, :test
)`, d2)

	// Test named
	tests := []struct { // This test needs to be ordered
		err         error
		inputColumn string
		inputValue  string
		name        string
		want        int
	}{
		{
			name:        "d1",
			inputColumn: "id",
			inputValue:  d1.ID,
			want:        2,
		},
		{
			name:        "d2",
			inputColumn: "id",
			inputValue:  d2.ID,
			want:        2,
		},
		{
			name:        "missing",
			err:         errs.ErrSenderNotFound,
			inputColumn: "id",
			inputValue:  "3",
		},
		{
			name:        "invalid",
			err:         ErrPostgreSQLAction,
			inputColumn: "notacolumn",
			inputValue:  "",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			var d TestData

			var ds []TestData

			data := struct {
				Input string `db:"input"`
			}{
				Input: tc.inputValue,
			}

			assert.HasErr(t, p.Query(ctx, false, &d, "SELECT * FROM test_data WHERE "+tc.inputColumn+" = :input", data), tc.err)
			p.Query(ctx, true, &ds, "SELECT * FROM test_data WHERE data = $1", nil, "test")

			if tc.err == nil {
				assert.Equal(t, len(ds), tc.want)
			}
		})
	}

	// Test args
	tests = []struct {
		err         error
		inputColumn string
		inputValue  string
		name        string
		want        int
	}{
		{
			name:        "d1",
			inputColumn: "id",
			inputValue:  d1.ID,
			want:        2,
		},
		{
			name:        "d2",
			inputColumn: "id",
			inputValue:  d2.ID,
			want:        2,
		},
		{
			name:        "missing",
			err:         errs.ErrSenderNotFound,
			inputColumn: "id",
			inputValue:  "3",
		},
		{
			name:        "invalid",
			err:         ErrPostgreSQLAction,
			inputColumn: "notacolumn",
			inputValue:  "",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			var d TestData

			var ds []TestData

			assert.HasErr(t, p.Query(ctx, false, &d, "SELECT * FROM test_data WHERE "+tc.inputColumn+" = $1", nil, tc.inputValue), tc.err)
			p.Query(ctx, true, &ds, "SELECT * FROM test_data WHERE data = $1", nil, "test")

			if tc.err == nil {
				assert.Equal(t, len(ds), tc.want)
			}
		})
	}

	p.Exec(ctx, "DROP TABLE test_data", nil)
}

func TestGetTable(t *testing.T) {
	tests := map[string]struct {
		input  string
		output string
	}{
		"auth_session": {
			input:  "DELETE FROM auth_session WHERE",
			output: "auth_session",
		},
		"auth_household": {
			input: `
INSERT INTO auth_household (a value)
`,
			output: "auth_household",
		},
		"auth_account": {
			input:  "SELECT * FROM auth_account WHERE",
			output: "auth_account",
		},
		"auth_household update": {
			input:  "UPDATE auth_household SET",
			output: "auth_household",
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			assert.Equal(t, getTable(tc.input), tc.output)
		})
	}
}

func TestGetVerb(t *testing.T) {
	tests := map[string]struct {
		input  string
		output string
	}{
		"delete": {
			input:  "DELETE FROM auth_session WHERE",
			output: "DELETE",
		},
		"insert": {
			input: `
INSERT INTO auth_household (a value)
`,
			output: "INSERT",
		},
		"select": {
			input:  "SELECT * FROM auth_account WHERE",
			output: "SELECT",
		},
		"update": {
			input:  "UPDATE auth_household SET",
			output: "UPDATE",
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			assert.Equal(t, getVerb(tc.input), tc.output)
		})
	}
}
