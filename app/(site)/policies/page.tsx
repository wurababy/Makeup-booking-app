import { SITE } from "@/config/site";

export const metadata = { title: "Booking & Cancellation Policy" };

/* DRAFT: edit these rules to match how you actually work before launch. */
export default function Policies() {
  return (
    <main className="py-14"><div className="wrap max-w-3xl space-y-5 leading-relaxed">
      <h1 className="text-4xl">Booking &amp; cancellation policy</h1>
      <h2 className="text-2xl">Deposit</h2>
      <p>A deposit secures your appointment. It is deducted from the total price, and the balance is paid on the day of your appointment.</p>
      <h2 className="text-2xl">Rescheduling</h2>
      <p>Please message us on WhatsApp at least 48 hours before your appointment to move it to another time. We’ll move your deposit to the new date once.</p>
      <h2 className="text-2xl">Cancellation</h2>
      <p>Deposits are non-refundable if you cancel with less than 48 hours’ notice or do not attend. If we have to cancel, we’ll refund your deposit in full.</p>
      <h2 className="text-2xl">On the day</h2>
      <p>Please arrive with a clean, moisturised face. If you are more than 20 minutes late, we may need to shorten your look or reschedule.</p>
      <h2 className="text-2xl">Questions</h2>
      <p>Contact us at <a className="text-rose underline" href={`mailto:${SITE.email}`}>{SITE.email}</a> or on WhatsApp.</p>
    </div></main>
  );
}
