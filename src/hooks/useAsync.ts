import { useCallback, useEffect, useState } from "react";

export type AsyncState<T> = { status: "loading" } | { status: "error"; error: Error } | { status: "success"; data: T };

/** Runs an async loader when its deps change; exposes loading / error / success and a reload. */
export function useAsync<T>(load: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let live = true;
    setState({ status: "loading" });
    load().then(
      (data) => live && setState({ status: "success", data }),
      (error: unknown) => live && setState({ status: "error", error: error instanceof Error ? error : new Error(String(error)) }),
    );
    return () => {
      live = false;
    };
  }, [...deps, nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return [state, reload] as const;
}
