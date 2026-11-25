import Link from "next/link";
import { SITE } from "@/config/site";

export default function Footer() {
  return (
    <footer id="contact" className="bg-baby pb-[calc(2rem+env(safe-area-inset-bottom))] pt-14">
      <div className="wrap grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-serif text-2xl font-semibold text-rose">{SITE.name}</p>
          <p className="mt-2 text-sm text-muted">Makeup artistry in {SITE.city}.</p>
        </div>
        <div>
          <h3 className="text-xl">Get in touch</h3>
          <p className="mt-2 text-sm leading-7">
            <a className="text-rose" href={`https://wa.me/${SITE.whatsapp}`}>WhatsApp</a><br />
            <a className="text-rose" href={`https://instagram.com/${SITE.instagram}`}>Instagram</a><br />
            <a className="text-rose" href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
        </div>
        <div>
          <h3 className="text-xl">Policies</h3>
          <p className="mt-2 text-sm leading-7"><Link className="text-rose" href="/policies">Booking &amp; cancellation policy</Link><br /><Link className="text-rose" href="/privacy">Privacy policy</Link></p>
        </div>
      </div>
      <p className="wrap mt-8 text-sm text-muted">© {new Date().getFullYear()} {SITE.name}</p>
    </footer>
  );
}
