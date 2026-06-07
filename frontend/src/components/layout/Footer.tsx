import { Link } from 'react-router-dom';

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', to: '/catalog' },
      { label: 'Furniture', to: '/catalog?category=Furniture' },
      { label: 'Lighting', to: '/catalog?category=Lighting' },
      { label: 'Decor', to: '/catalog?category=Decor' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Our Story', to: '/' },
      { label: 'Craftsmanship', to: '/' },
      { label: 'Sustainability', to: '/' },
      { label: 'Press', to: '/' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', to: '/' },
      { label: 'Shipping', to: '/' },
      { label: 'Returns', to: '/' },
      { label: 'FAQ', to: '/' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-200/70 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-gold-400">
                <span className="font-display text-xl font-semibold">A</span>
              </span>
              <span className="font-display text-2xl font-semibold text-ink-900">
                Aura
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
              Objects of quiet beauty for considered living. Each piece is
              chosen for its craft, its material honesty, and the way it ages
              with grace.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow mb-4">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-500 transition-colors hover:text-ink-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-ink-200/70 pt-8 sm:flex-row">
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} Aura. Crafted with intention.
          </p>
          <div className="flex gap-6 text-xs text-ink-400">
            <Link to="/" className="transition-colors hover:text-ink-900">
              Privacy
            </Link>
            <Link to="/" className="transition-colors hover:text-ink-900">
              Terms
            </Link>
            <Link to="/" className="transition-colors hover:text-ink-900">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
