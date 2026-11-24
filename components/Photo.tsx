"use client";
import { useState } from "react";

/* Shows your photo from /public/images, or a soft pink placeholder until you add it. */
export default function Photo({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [missing, setMissing] = useState(false);
  return (
    <div className={`relative overflow-hidden rounded-[18px] bg-baby ${className}`}>
      {missing ? (
        <span className="absolute inset-0 grid place-items-center p-4 text-center text-sm text-muted">Add photo</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} onError={() => setMissing(true)} className="absolute inset-0 h-full w-full object-cover" />
      )}
    </div>
  );
}
