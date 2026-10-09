import Link from 'next/link';
import { useRouter } from 'next/router';

const tabs = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/menu', label: 'Manage menu' },
  { href: '/admin/reservations', label: 'Reservations' },
];

export default function AdminNav() {
  const router = useRouter();
  return (
    <div className="mb-6 flex gap-2 border-b border-mauve-light">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold ${
            router.pathname === tab.href ? 'border-plum' : 'border-transparent text-mauve-dark hover:text-plum'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
