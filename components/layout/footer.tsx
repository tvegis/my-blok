export function Footer() {
  return (
    <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-zinc-200/60 dark:border-zinc-800/60">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
        <p>&copy; {new Date().getFullYear()} &middot; Built with Next.js &amp; Velite</p>
        <div className="flex gap-4">
          <a href="/rss.xml" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            RSS
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
