export default function LoadingScreen() {
    return (
        <main className="min-h-screen bg-cararra text-cod-gray" role="status" aria-live="polite" aria-label="Loading BrightThanks">
            <div className="h-18 bg-cod-gray" />
            <div className="mx-auto grid w-[min(1180px,92vw)] gap-6 py-10">
                <div className="grid gap-3">
                    <div className="h-3 w-36 animate-pulse rounded bg-cod-gray/15" />
                    <div className="h-10 w-2/3 animate-pulse rounded-xl bg-cod-gray/10" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-cod-gray/10" />
                </div>
                <div className="grid grid-cols-[2fr_1fr] gap-4 max-md:grid-cols-1">
                    <div className="h-40 animate-pulse rounded-2xl bg-cod-gray/90" />
                    <div className="h-40 animate-pulse rounded-2xl border border-cod-gray/15 bg-cod-gray/5" />
                </div>
                <div className="grid gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-36 animate-pulse rounded-2xl border border-cod-gray/10 bg-cod-gray/5" />
                    ))}
                </div>
                <span className="sr-only">Loading BrightThanks...</span>
            </div>
        </main>
    );
}
