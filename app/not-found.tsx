import Link from "next/link";

export default function NotFound() {
  return (
    <main className="py-24 text-center"><div className="wrap max-w-xl">
      <h1 className="text-4xl">We couldn’t find that page</h1>
      <p className="mt-3 text-muted">It may have moved, or the link may be wrong.</p>
      <Link href="/" className="btn btn-primary mt-6">Back to home</Link>
    </div></main>
  );
}
