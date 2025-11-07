/**
 * Speakmate API client (analysis)
 * - Single responsibility: call analyze endpoint and return a validated AnalyzeResponse.
 * - No UI, no state. Pure I/O with strict parsing.
 *
 * Env/config discovery (in priority order):
 *  1) options.baseUrl passed to analyze()
 *  2) globalThis.__SPEAKMATE_BASE_URL__ (for quick runtime overrides)
 *  3) process.env.EXPO_PUBLIC_API_BASE_URL (Expo public env)
 *
 * If no baseUrl is found, analyze() will return a valid stub response to keep the app bootable.
 */

import {
    AnalyzeResponse,
    parseAnalyzeResponse,
    makeEmptyAnalyzeResponse,
  } from "./schema";
  
  /** Payload shape for analysis. Extend safely later. */
  export interface AnalyzeRequest {
    /** Reference to the uploaded transcript blob or key. */
    transcript_key: string;
    /** Optional language hint (BCP-47, e.g., "en", "en-US"). */
    language?: string;
  }
  
  /** Call options for the client. */
  export interface AnalyzeOptions {
    /** Override API base URL (e.g., "https://api.example.com"). */
    baseUrl?: string;
    /** Endpoint path; defaults to "/analyze". */
    path?: string;
    /** Request timeout in milliseconds. Default 30000. */
    timeoutMs?: number;
    /** External AbortSignal, merged with the internal timeout controller. */
    signal?: AbortSignal;
    /** When true, returns a stub without network I/O (useful for offline dev). */
    dryRun?: boolean;
  }
  
  /** Reasonable default timeout for mobile networks. */
  const DEFAULT_TIMEOUT_MS = 30_000;
  
  /** Resolve API base URL from options, globals, or Expo env. */
  function resolveBaseUrl(override?: string): string | undefined {
    if (override && override.trim()) return trimTrailingSlash(override);
  
    // Runtime global override for quick testing without rebuilds.
    const g = globalThis as any;
    if (g && typeof g.__SPEAKMATE_BASE_URL__ === "string" && g.__SPEAKMATE_BASE_URL__.trim()) {
      return trimTrailingSlash(g.__SPEAKMATE_BASE_URL__);
    }
  
    // Expo public env (bundled at build time)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const env = (typeof process !== "undefined" ? (process as any).env : undefined) || {};
      if (typeof env.EXPO_PUBLIC_API_BASE_URL === "string" && env.EXPO_PUBLIC_API_BASE_URL.trim()) {
        return trimTrailingSlash(env.EXPO_PUBLIC_API_BASE_URL);
      }
    } catch {
      // ignore
    }
  
    return undefined;
  }
  
  function trimTrailingSlash(u: string): string {
    return u.endsWith("/") ? u.slice(0, -1) : u;
  }
  
  /** Merge an external AbortSignal with a timeout controller. */
  function withTimeout(signal: AbortSignal | undefined, ms: number) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new Error(`Request timed out after ${ms} ms`)), ms);
  
    function cleanup() {
      clearTimeout(timer);
    }
  
    if (signal) {
      if (signal.aborted) controller.abort(signal.reason);
      else signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
    }
  
    return { signal: controller.signal, cleanup };
  }
  
  /** Convert non-2xx responses into rich errors with small body snippet. */
  async function assertOk(res: Response): Promise<void> {
    if (res.ok) return;
    let snippet = "";
    try {
      const text = await res.text();
      snippet = text.length > 300 ? text.slice(0, 300) + "…" : text;
    } catch {
      // ignore
    }
    const err = new Error(`HTTP ${res.status} ${res.statusText}${snippet ? ` — ${snippet}` : ""}`);
    // Attach useful debugging context without throwing TS fits
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).status = res.status;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).statusText = res.statusText;
    throw err;
  }
  
  /**
   * Analyze speech data and return validated results.
   * If no baseUrl is configured and dryRun is not explicitly false, returns a stub.
   */
  export async function analyze(
    payload: AnalyzeRequest,
    options: AnalyzeOptions = {}
  ): Promise<AnalyzeResponse> {
    const baseUrl = resolveBaseUrl(options.baseUrl);
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const path = options.path ?? "/analyze";
  
    // If no API base is configured or dryRun requested, return a valid stub.
    if (!baseUrl || options.dryRun) {
      const stub = makeEmptyAnalyzeResponse();
      // Provide minimal helpful placeholders so UI doesn’t look dead.
      stub.feedback = {
        vocabulary: "No server configured. This is a stub response.",
        filler: "—",
        clarity: "—",
        idea: "—",
        actions: [
          "Set EXPO_PUBLIC_API_BASE_URL to your backend URL.",
          "Call analyze() again to see live results.",
        ],
      };
      stub.assets = { transcript_key: payload.transcript_key ?? "" };
      return stub;
    }
  
    const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  
    const { signal, cleanup } = withTimeout(options.signal, timeoutMs);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify(payload),
        signal,
      });
  
      await assertOk(res);
  
      // Prefer JSON parsing; fall back to text->JSON if some proxy mangles headers
      let data: unknown;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = safeJson(text);
      }
  
      return parseAnalyzeResponse(data);
    } finally {
      cleanup();
    }
  }
  
  function safeJson(s: string): unknown {
    try {
      return JSON.parse(s);
    } catch {
      // Return something that will fail schema validation with a readable error
      return { _raw: s };
    }
  }
  
  /** Convenience: set or override base URL at runtime for local testing. */
  export function setRuntimeBaseUrl(url: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__SPEAKMATE_BASE_URL__ = trimTrailingSlash(url);
  }
  