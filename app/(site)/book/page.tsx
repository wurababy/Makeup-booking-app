import BookingFlow from "@/components/BookingFlow";
import { getCatalog, getDeposit } from "@/lib/server/looks";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book Appointment" };

export default async function BookPage({ searchParams }: { searchParams: Promise<{ look?: string }> }) {
  const { look } = await searchParams;
  const { looks, fromDb } = await getCatalog();
  const deposit = await getDeposit();
  return (
    <main className="py-12 lg:py-16">
      <div className="wrap max-w-3xl">
        <h1 className="text-4xl lg:text-5xl">Book your appointment</h1>
        <p className="mb-8 mt-2 text-muted">Three quick steps. A deposit secures your time.</p>
        {fromDb ? <BookingFlow looks={looks.map((l) => ({ slug: l.slug, name: l.name, price: l.price, minutes: l.minutes }))} deposit={deposit} initial={look ?? ""} />
          : <p className="card">Online booking opens soon. In the meantime, please message us on WhatsApp.</p>}
      </div>
    </main>
  );
}
