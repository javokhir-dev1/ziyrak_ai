'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, MessageSquare, Mail, Filter,
  FileText, Link2, Settings, ChevronDown,
} from 'lucide-react';
import { getInstagramStatus } from '@/lib/api';

const navItems = [
  { href: '/',         icon: LayoutDashboard, label: 'Bosh sahifa' },
  { href: '/comments', icon: MessageSquare,   label: 'Post avto javob' },
  { href: '/dm',       icon: Mail,            label: 'DM avto javob' },
  { href: '/keywords', icon: Filter,          label: "Kalit so'zlar" },
  { href: '/logs',     icon: FileText,        label: 'Loglar' },
];

const bottomItems = [
  { href: '/settings', icon: Settings, label: 'Sozlamalar' },
  { href: '/webhook',  icon: Link2,    label: 'Webhook' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [account, setAccount] = useState<{ connected: boolean; username?: string } | null>(null);

  useEffect(() => {
    getInstagramStatus()
      .then(d => setAccount({ connected: d.connected, username: d.account?.username }))
      .catch(() => setAccount({ connected: false }));
  }, []);

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all duration-200 ${
          active
            ? 'bg-primary-fixed text-primary'
            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
        }`}
      >
        <Icon size={18} className={`flex-shrink-0 ${active ? 'text-primary' : ''}`} />
        {label}
      </Link>
    );
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-surface border-r border-outline-variant/30 flex flex-col z-40">

      {/* Logo */}
      <div className="px-6 py-6 mb-1">
        <h1 className="text-2xl font-bold text-primary tracking-tight">InstaBot</h1>
        <p className="text-[13px] text-on-surface-variant mt-0.5">Instagram AI Assistant</p>
      </div>

      {/* Account switcher */}
      <div className="px-3 mb-5">
        <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-left group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center text-white flex-shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </div>
            <span className="text-[14px] font-medium text-on-surface truncate group-hover:text-primary transition-colors">
              {account?.connected ? `@${account.username}` : 'Ulanmagan'}
            </span>
          </div>
          <ChevronDown size={16} className="text-on-surface-variant flex-shrink-0" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {navItems.map(item => <NavLink key={item.href} {...item} />)}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 pb-2 border-t border-outline-variant/30 pt-2">
        {bottomItems.map(item => <NavLink key={item.href} {...item} />)}
      </div>

      {/* User profile */}
      <div className="px-4 py-4 border-t border-outline-variant/30 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
          A
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-on-surface leading-tight">Admin</p>
          <p className="text-[12px] text-on-surface-variant truncate">
            {account?.connected ? `@${account.username}` : 'Admin profili'}
          </p>
        </div>
      </div>
    </aside>
  );
}
