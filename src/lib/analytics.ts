// No-op analytics stub — design spec §4.
// v1 ships ZERO third-party JavaScript; this hook is retained so future
// instrumentation (e.g. AdSense pageview events) lands here without touching
// pages. Nothing imports it yet by design.
export type AnalyticsEvent = string;
export function track(event: AnalyticsEvent, data?: Record<string, unknown>): void {
  // no-op in v1
  void event;
  void data;
}