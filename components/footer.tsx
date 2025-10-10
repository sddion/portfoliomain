export function Footer() {
  return (
    <footer className="border-t border-border py-8 px-4">
      <div className="max-w-6xl mx-auto text-center text-muted text-sm">
        <p>© {new Date().getFullYear()} Sanju Kumar. Built with Next.js & TypeScript.</p>
        <p className="mt-2">Self-taught developer passionate about web, mobile, embedded systems, and security.</p>
      </div>
    </footer>
  )
}
