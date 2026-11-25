import Link from "next/link";
import { PLATFORM } from "@/config/platform";

export default function PlatformFooter() {
  return (
    <footer className="bg-baby pb-[calc(2rem+env(safe-area-inset-bottom))] pt-12">
      <div className="wrap flex flex-wrap items-start justify-between gap-8">
        <div><p className="font-serif text-2xl font-semibold text-rose">{PLATFORM.name}</p><p className="mt-2 max-w-xs text-sm text-muted">Beautiful booking websites for independent makeup artists.</p></div>
        <div className="text-sm leading-7"><Link className="text-rose underline" href="/signup">Sign up as a makeup artist</Link><br /><Link className="text-rose underline" href="/login">Artist login</Link><br /><a className="text-rose underline" href={`mailto:${PLATFORM.supportEmail}`}>{PLATFORM.supportEmail}</a></div>
      </div>
      <p className="wrap mt-8 text-sm text-muted">© {PLATFORM.name}</p>
    </footer>
  );
}
