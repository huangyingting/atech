import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[72vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-8 text-center space-y-4">
        <div className="text-[11px] font-mono tracking-widest uppercase text-zinc-400">
          404 — NOT FOUND
        </div>
        <h1 className="text-2xl font-display font-bold">That page doesn&apos;t exist</h1>
        <p className="text-xs text-zinc-500 leading-relaxed">
          The address may be mistyped, or the page may have moved. Nothing was lost — everything
          you&apos;ve built is still where it was.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
          <Link
            href="/studio"
            className="px-4 py-2 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
          >
            Describe a product
          </Link>
          <Link
            href="/projects"
            className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Your projects
          </Link>
          <Link
            href="/learn-more"
            className="px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            How it works
          </Link>
        </div>
      </div>
    </div>
  );
}
