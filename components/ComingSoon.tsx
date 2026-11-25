export default function ComingSoon({ title, intro, items }: { title: string; intro: string; items: string[] }) {
  return (
    <div><h1 className="text-4xl">{title}</h1>
      <div className="card mt-6 max-w-2xl"><p className="font-semibold text-rose">Coming in the next stage of the build</p><p className="mt-2 text-muted">{intro}</p>
        <ul className="mt-3 space-y-1.5 text-sm">{items.map((i) => <li key={i}>• {i}</li>)}</ul></div></div>
  );
}
