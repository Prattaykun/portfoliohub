type Props = {
  searchParams: Promise<{ target?: string }>;
};

export default async function OpenProtocolPage({ searchParams }: Props) {
  const { target } = await searchParams;
  const decodedTarget = target ? decodeURIComponent(target) : "";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-24 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Protocol Handler</p>
        <h1 className="mt-4 text-4xl font-bold">External app routing is active.</h1>
        <p className="mt-4 text-slate-300">
          Android or desktop apps can hand off custom protocol links to PortfolioHub through the web manifest.
        </p>

        <div className="mt-8 rounded-2xl bg-slate-900/60 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Target</p>
          <p className="mt-2 break-all text-lg text-slate-100">{decodedTarget || "No protocol payload was provided."}</p>
        </div>
      </div>
    </main>
  );
}