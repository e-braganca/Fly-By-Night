export function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
        Coming soon
      </p>
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      <p className="max-w-sm text-sm text-text-secondary">
        This screen hasn&apos;t been built yet. We&apos;re shipping the product
        piece by piece.
      </p>
    </div>
  );
}
