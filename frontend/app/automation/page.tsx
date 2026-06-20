'use client';
import Link from 'next/link';
import { MessageSquare, Mail, ArrowRight, Zap } from 'lucide-react';

const cards = [
  {
    href: '/automation/comments',
    icon: MessageSquare,
    label: 'Komentlarga avtomatik javob',
    description: 'Har bir post uchun alohida koment javob qoidalari va variantlar',
    iconBg: 'bg-[#ebebfc] text-[#4648d4]',
    hoverBorder: 'hover:border-[#4648d4]/10',
    arrowHover: 'group-hover:text-[#4648d4]',
  },
  {
    href: '/automation/dm',
    icon: Mail,
    label: 'DM Xabarlarga avtomatik javob',
    description: 'Kiruvchi DM xabarlarga aylanadigan javoblar bilan avtomatik javob',
    iconBg: 'bg-[#f3ebfc] text-[#8127cf]',
    hoverBorder: 'hover:border-[#8127cf]/10',
    arrowHover: 'group-hover:text-[#8127cf]',
  },
];

export default function AutomationPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 px-8 py-5 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Zap size={22} className="text-primary" />
          <div>
            <h2 className="text-[24px] font-semibold text-on-surface tracking-tight leading-[32px]">Avtomatizatsiya</h2>
            <p className="text-[13px] text-on-surface-variant">Bo'limni tanlang</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-5xl">
          {cards.map(({ href, icon: Icon, label, description, iconBg, hoverBorder, arrowHover }) => (
            <Link key={href} href={href}
              className={`bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-transparent ${hoverBorder} hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${iconBg}`}>
                  <Icon size={22} strokeWidth={2} />
                </div>
                <ArrowRight size={20} className={`text-slate-300 transition-all duration-200 group-hover:translate-x-1 ${arrowHover}`} />
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-[16px] font-semibold text-on-surface mb-2 leading-6">{label}</h3>
                <p className="text-[14px] text-on-surface-variant leading-[22px] mt-auto">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
