export default function Footer() {
  return (
    <footer id="contact" className="bg-baby pb-[calc(2rem+env(safe-area-inset-bottom))] pt-14">
      <div className="wrap grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-serif text-2xl font-semibold text-rose">Your Studio Name</p>
          <p className="mt-2 text-sm text-muted">Makeup artistry in Lagos, Nigeria.</p>
        </div>
        <div>
          <h3 className="text-xl">Get in touch</h3>
          <p className="mt-2 text-sm leading-7">
            <a className="text-rose" href="https://wa.me/234XXXXXXXXXX">WhatsApp</a><br />
            <a className="text-rose" href="https://instagram.com/yourhandle">Instagram</a><br />
            <a className="text-rose" href="mailto:hello@yourstudio.com">hello@yourstudio.com</a>
          </p>
        </div>
        <div>
          <h3 className="text-xl">Policies</h3>
          <p className="mt-2 text-sm leading-6 text-muted">A deposit secures your date and is deducted from your total. Please reschedule at least 48 hours ahead. Your photos are never shared or sold.</p>
        </div>
      </div>
      <p className="wrap mt-8 text-sm text-muted">© Your Studio Name</p>
    </footer>
  );
}
