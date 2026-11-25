import { SITE } from "@/config/site";

export const metadata = { title: "Privacy Policy" };

/* DRAFT for your information. Have a qualified person review it for Nigerian data protection law before you launch. */
export default function Privacy() {
  return (
    <main className="py-14"><div className="wrap max-w-3xl space-y-5 leading-relaxed">
      <h1 className="text-4xl">Privacy policy</h1>
      <p className="text-muted">{SITE.name} (“we”) respects your privacy. This explains what we collect and why.</p>
      <h2 className="text-2xl">What we collect</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li><b>Booking details:</b> your name, phone number, email, occasion, notes and the appointment you choose.</li>
        <li><b>Payment:</b> deposits are paid through Paystack. We never see or store your card details.</li>
        <li><b>Photos for the AI Beauty Assistant:</b> front and side photos you choose to upload.</li>
        <li><b>Inspiration photo:</b> an optional photo you add to a booking.</li>
      </ul>
      <h2 className="text-2xl">Your photos in the AI Beauty Assistant</h2>
      <p>We use them only to suggest makeup that suits you. They are sent securely to an AI service provider, analysed once, and then discarded. By default we do not store them. If you tick the option to keep them for your makeup artist, they are stored privately and deleted automatically after 30 days, or sooner if you ask. The assistant describes visible features for makeup purposes only. It does not identify you or judge your health or skin condition.</p>
      <h2 className="text-2xl">Why we use your information</h2>
      <p>To provide your appointment, take your deposit, send your confirmation, contact you about your booking, and prepare your makeup. We do not sell your information or use it for advertising.</p>
      <h2 className="text-2xl">Who handles it for us</h2>
      <p>Our website host, database and file storage, payment provider (Paystack), email provider and AI provider process information on our behalf, only to run the service.</p>
      <h2 className="text-2xl">How long we keep it</h2>
      <p>Booking records are kept for as long as needed for business and legal purposes. Saved assessment photos are deleted after 30 days. Inspiration photos are kept with your booking and deleted on request.</p>
      <h2 className="text-2xl">Your choices</h2>
      <p>You can ask to see, correct or delete your information, or withdraw your consent, at any time by emailing <a className="text-rose underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>. You can also complain to the Nigeria Data Protection Commission.</p>
      <p className="text-sm text-muted">Last updated: [date]</p>
    </div></main>
  );
}
