package logger

import (
	"context"
	"fmt"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type ctxKey string

// GetAttribute gets a logging attributes.
func GetAttribute(ctx context.Context, attr string) string {
	s, ok := ctx.Value(ctxKey(attr)).(string)
	if !ok {
		return ""
	}

	return s
}

// GetAttributes gets all logging attributes.
func GetAttributes(ctx context.Context) string {
	s, ok := ctx.Value(ctxKey("attributes")).(string)
	if !ok {
		return ""
	}

	return s
}

// SetAttribute sets a value for a key.
func SetAttribute(ctx context.Context, key string, value any) context.Context {
	a := GetAttributes(ctx)
	span := trace.SpanFromContext(ctx)

	if a != "" {
		a += " "
	}

	a += fmt.Sprintf("%s=%#v", key, value)

	var v attribute.Value

	switch t := value.(type) {
	case bool:
		v = attribute.BoolValue(t)
	case int:
		v = attribute.IntValue(t)
	default:
		v = attribute.StringValue(fmt.Sprintf("%#v", value))
	}

	span.SetAttributes(attribute.KeyValue{
		Key:   attribute.Key(key),
		Value: v,
	})

	ctx = context.WithValue(ctx, ctxKey("attributes"), a)
	ctx = context.WithValue(ctx, ctxKey(key), value)
	ctx = trace.ContextWithSpan(ctx, span)

	return ctx
}

// GetNoColor for current context.
func GetNoColor(ctx context.Context) bool {
	if v, ok := ctx.Value(ctxKey("noColor")).(bool); ok {
		return v
	}

	return false
}

// SetNoColor for context.
func SetNoColor(ctx context.Context, n bool) context.Context {
	return context.WithValue(ctx, ctxKey("noColor"), n)
}

// GetFormat for current context.
func GetFormat(ctx context.Context) Format {
	if v, ok := ctx.Value(ctxKey("logFormat")).(Format); ok && v != "" {
		return v
	}

	return FormatHuman
}

// SetFormat for context.
func SetFormat(ctx context.Context, f Format) context.Context {
	return context.WithValue(ctx, ctxKey("logFormat"), f)
}

// GetLevel for current context.
func GetLevel(ctx context.Context) Level {
	if v, ok := ctx.Value(ctxKey("logLevel")).(Level); ok && v != "" {
		return v
	}

	return LevelInfo
}

// SetLevel for context.
func SetLevel(ctx context.Context, l Level) context.Context {
	return context.WithValue(ctx, ctxKey("logLevel"), l)
}
