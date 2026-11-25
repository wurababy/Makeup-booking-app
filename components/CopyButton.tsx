"use client";
import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (<button type="button" className="btn btn-quiet !px-5 !py-2.5 text-sm" onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); } catch { window.prompt("Copy this link:", text); } }}>{done ? "Copied!" : "Copy link"}</button>);
}
