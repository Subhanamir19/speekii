import { useCallback, useMemo, useRef, useState } from "react";
import type { AnalyzeRequest, AnalyzeOptions } from "../lib/api/client";
import { analyze as analyzeRequest } from "../lib/api/client";
import type { AnalyzeResponse } from "../lib/api/schema";
import { SchemaError } from "../lib/api/schema";

/** Public shape exposed to screens/components. */
export interface UseAnalyzeState {
  loading: boolean;
  error?: Error;
  data?: AnalyzeResponse;
  /** Imperative call. Accepts payload + optional options override. */
  analyze: (payload: AnalyzeRequest, options?: AnalyzeOptions) => Promise<AnalyzeResponse | undefined>;
  /** Cancel the in-flight request (if any). */
  cancel: () => void;
  /** Clear data and error back to pristine state. */
  reset: () => void;
}

/** Narrow AbortError without depending on DOM typings being perfect. */
function isAbortError(err: unknown): boolean {
  return !!err && typeof err === "object" && String((err as any).name) === "AbortError";
}

/**
 * Hook to call the analyze API safely with loading/error/data state.
 * - No global store side-effects.
 * - Enforces schema at runtime via client.
 * - Supports cancellation and reset.
 */
export function useAnalyze(defaultOptions?: AnalyzeOptions): UseAnalyzeState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [data, setData] = useState<AnalyzeResponse | undefined>(undefined);

  // Keep a single controller per in-flight request so we can cancel it.
  const controllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort(new Error("canceled"));
      controllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    setError(undefined);
    setData(undefined);
    setLoading(false);
  }, [cancel]);

  const analyze = useCallback(
    async (payload: AnalyzeRequest, options?: AnalyzeOptions) => {
      // Cancel any previous in-flight call to avoid racey updates.
      cancel();

      const merged: AnalyzeOptions = { timeoutMs: 30_000, ...defaultOptions, ...options };
      const controller = new AbortController();
      controllerRef.current = controller;

      // Merge external signal, if provided.
      if (merged.signal) {
        if (merged.signal.aborted) {
          controller.abort(merged.signal.reason);
        } else {
          merged.signal.addEventListener("abort", () => controller.abort(merged.signal!.reason), { once: true });
        }
      }

      setLoading(true);
      setError(undefined);

      try {
        const res = await analyzeRequest(payload, { ...merged, signal: controller.signal });
        // If this call was canceled, ignore updates.
        if (controllerRef.current !== controller) return undefined;

        setData(res);
        return res;
      } catch (err) {
        if (isAbortError(err)) return undefined; // Silent on cancel/timeout abort

        // Promote SchemaError with clear message; otherwise pass through unknown error.
        const finalErr =
          err instanceof SchemaError
            ? new Error(`Schema validation failed: ${err.message}`)
            : (err as Error);

        // If canceled after failure, ignore state updates.
        if (controllerRef.current !== controller) return undefined;

        setError(finalErr);
        return undefined;
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
          setLoading(false);
        }
      }
    },
    [cancel, defaultOptions]
  );

  return useMemo(
    () => ({ loading, error, data, analyze, cancel, reset }),
    [loading, error, data, analyze, cancel, reset]
  );
}

export default useAnalyze;
