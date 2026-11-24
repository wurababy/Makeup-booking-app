import Link from "next/link";
import Gallery from "@/components/Gallery";
import Photo from "@/components/Photo";

const REVIEWS = [
  { q: "She made me feel so beautiful on my wedding day. The makeup lasted from morning until the last dance.", by: "Adaeze, Bridal Glam" },
  { q: "Soft, flawless and exactly my style. I’ve never received so many compliments on my birthday.", by: "Tola, Birthday Glam" },
  { q: "The consultation helped me finally pick a look that suits my skin tone. I felt like myself, only better.", by: "Zainab, Natural Glam" },
];

export default function Home() {
  return (
    <main>
      <section className="py-10 lg:py-16">
        <div className="wrap grid items-center gap-10 lg:grid-cols-2">
          <div>
            <hr className="mb-6 h-0.5 w-16 border-0 bg-champagne" />
            <h1 className="text-5xl sm:text-6xl lg:text-7xl">Your Beauty,<br />Your Signature.</h1>
            <p className="mb-7 mt-5 max-w-md text-lg text-muted">Discover your perfect makeup look with personalised beauty recommendations and professional makeup artistry.</p>
            <div className="flex flex-wrap gap-3.5">
              <Link href="/#looks" className="btn btn-primary">Explore Makeup Looks</Link>
              <Link href="/assistant" className="btn btn-quiet">Discover My Perfect Look</Link>
            </div>
          </div>
          <Photo src="/images/hero.jpg" alt="A woman wearing a soft glam makeup look" className="aspect-[4/5] max-h-[620px] w-full" />
        </div>
      </section>

      <section id="looks" className="bg-baby py-16 lg:py-20">
        <div className="wrap">
          <h2 className="text-4xl lg:text-5xl">Makeup Looks</h2>
          <p className="mt-2 text-muted">Browse by style, then choose the look you love.</p>
          <Gallery />
        </div>
      </section>

      <section className="bg-blush py-16 lg:py-20">
        <div className="wrap max-w-3xl text-center">
          <h2 className="text-4xl !text-brown lg:text-5xl">Not Sure Which Look Suits You?</h2>
          <p className="mx-auto mb-7 mt-4 max-w-xl text-lg">Let our AI Beauty Assistant analyse your facial features and help you discover makeup looks you’ll love.</p>
          <Link href="/assistant" className="btn btn-light">Start My Beauty Consultation</Link>
        </div>
      </section>

      <section id="about" className="py-16 lg:py-20">
        <div className="wrap grid items-center gap-10 lg:grid-cols-2">
          <Photo src="/images/about.jpg" alt="Portrait of the makeup artist" className="aspect-[4/5] w-full" />
          <div>
            <h2 className="text-4xl lg:text-5xl">Hello, I’m [Your Name]</h2>
            <p className="mt-4">I’m a professional makeup artist based in Lagos. I believe great makeup should feel like you, only more radiant, so every look is tailored to your features, your skin and your occasion.</p>
            <p className="mb-6 mt-2 text-muted">Replace this with your story, training and the clients you love working with.</p>
            <Link href="/book" className="btn btn-quiet">Book Appointment</Link>
          </div>
        </div>
      </section>

      <section className="bg-baby py-16 lg:py-20">
        <div className="wrap">
          <h2 className="text-4xl lg:text-5xl">Kind words from clients</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <figure key={r.by} className="card m-0">
                <blockquote className="mb-4 font-serif text-2xl leading-snug">{r.q}</blockquote>
                <figcaption className="text-sm font-semibold text-rose">{r.by}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">Sample reviews. Replace with your real client feedback.</p>
        </div>
      </section>
    </main>
  );
}
