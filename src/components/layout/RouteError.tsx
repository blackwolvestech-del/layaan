import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { buttonClass } from "@/components/ui/Button";

/** Shown instead of React Router's default screen when a page throws while rendering. */
export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error instanceof Error ? error.message : null;
  if (import.meta.env.DEV && error) console.error(error);
  return (
    <main className="container-x flex min-h-dvh flex-col items-center justify-center py-16 text-center">
      <title>Something went wrong — LAYAAN Atelier</title>
      <p className="code-accent mb-4">unexpected_error</p>
      <h1 className="page-title">Something went wrong</h1>
      <p className="tagline mt-4 max-w-md">This page couldn't be displayed. Please reload, or return to the homepage.</p>
      {import.meta.env.DEV && message && <pre className="mt-6 max-w-full overflow-x-auto border border-line bg-surface p-4 text-xs text-danger">{message}</pre>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => location.reload()} className={buttonClass("primary")}>
          Reload
        </button>
        <Link to="/" reloadDocument className={buttonClass("outline")}>
          Homepage
        </Link>
      </div>
    </main>
  );
}
