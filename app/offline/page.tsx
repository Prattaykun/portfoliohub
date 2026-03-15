export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-24 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Offline</p>
        <h1 className="mt-4 text-4xl font-bold">PortfolioHub is temporarily offline.</h1>
        <p className="mt-4 text-base text-slate-300">
          Cached pages are still available, but fresh data and API calls need a network connection.
          Reconnect and reopen the app to resume editing, sharing, or generating content.
        </p>
      </div>
    </main>
  );
}