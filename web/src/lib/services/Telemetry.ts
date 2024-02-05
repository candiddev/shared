import type { Span, Tracer } from "@opentelemetry/api";
import api from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const spans: {
  func: string;
  span: Span;
}[] = [];

let tracer: Tracer;

export interface TelemetryOptions {
  /** Endpoint to send spans to (in the form of https://example.com), may be omitted to use just "/". */
  endpoint: string;

  /** Path to append to endpoint. */
  path: string;

  /** Service Name to set with spans. */
  serviceName: string;
}

export const Telemetry = {
  enable: async (): Promise<void> => {
    if (tracer === undefined) {
      // Setup OTEL
      const p = new WebTracerProvider({
        resource: Resource.default().merge(
          new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]:
              Telemetry.state.serviceName,
            [SemanticResourceAttributes.SERVICE_VERSION]:
              process.env.BUILD_VERSION,
            url: Telemetry.state.endpoint,
          }),
        ),
      });

      p.addSpanProcessor(
        new SimpleSpanProcessor(
          new OTLPTraceExporter({
            headers: {
              "Content-Type": "application/json",
            },
            url: `${Telemetry.state.endpoint}${Telemetry.state.path}`,
          }),
        ),
      );

      tracer = p.getTracer(Telemetry.state.serviceName);
    }
  },
  spanEnd: (name: string): void => {
    if (tracer !== undefined) {
      const i = spans.findIndex((s) => {
        return s.func === name;
      });

      if (spans[i] !== undefined) {
        spans[i].span.end();

        spans.splice(i, 1);
      }
    }
  },
  spanStart: (name: string): void => {
    if (tracer !== undefined) {
      if (spans.length > 0) {
        const ctx = api.trace.setSpan(api.context.active(), spans[0].span);

        spans.push({
          func: name,
          span: tracer.startSpan(name, undefined, ctx),
        });
      } else {
        spans.push({
          func: name,
          span: tracer.startSpan(name),
        });
      }
    }
  },
  state: {
    endpoint: "",
    path: "",
    serviceName: "",
  },
};
