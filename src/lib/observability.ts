type LogLevel = "info" | "warn" | "error";

const counters = new Map<string, number>();

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "{}";
  }
}

export function incrementMetric(name: string, delta = 1): void {
  counters.set(name, (counters.get(name) ?? 0) + delta);
}

export function getMetric(name: string): number {
  return counters.get(name) ?? 0;
}

export function getAllMetrics(): Record<string, number> {
  return Object.fromEntries(counters.entries());
}

export function logEvent(level: LogLevel, event: string, data: Record<string, unknown> = {}): void {
  const payload = {
    level,
    event,
    ts: new Date().toISOString(),
    ...data,
  };

  const line = safeJson(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}
