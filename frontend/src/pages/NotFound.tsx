import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-soft md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Not found</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          This path is not a valid webhook URL for the inspector.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
