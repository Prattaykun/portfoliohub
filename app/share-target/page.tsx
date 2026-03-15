import Link from "next/link";

type Props = {
  searchParams: Promise<{ title?: string; text?: string; url?: string }>;
};

export default async function ShareTargetPage({ searchParams }: Props) {
  const { title, text, url } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-24 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Share Target</p>
        <h1 className="mt-4 text-4xl font-bold">Content received from another app</h1>
        <p className="mt-4 text-slate-300">
          This screen is the landing point when Android shares text or links directly into the installed PWA.
        </p>

        <div className="mt-8 space-y-4 rounded-2xl bg-slate-900/60 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Title</p>
            <p className="mt-2 break-words text-lg">{title || "No title provided"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Text</p>
            <p className="mt-2 whitespace-pre-wrap break-words text-slate-200">{text || "No text provided"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">URL</p>
            {url ? (
              <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-block break-all text-blue-300 underline">
                {url}
              </a>
            ) : (
              <p className="mt-2 text-slate-200">No URL provided</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-full bg-white px-5 py-3 font-medium text-slate-950">
            Open Dashboard
          </Link>
          <Link href="/" className="rounded-full border border-white/20 px-5 py-3 font-medium text-white">
            Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}