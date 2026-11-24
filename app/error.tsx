"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="py-24 text-center"><div className="wrap max-w-xl">
      <h1 className="text-4xl">Something went wrong</h1>
      <p className="mt-3 text-muted">Please try again. If it keeps happening, message us on WhatsApp.</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-6">Try again</button>
    </div></main>
  );
}
