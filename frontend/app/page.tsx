'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, Users, MessageSquare, Mail, Tag, Zap, CheckCircle } from 'lucide-react';
import { getInstagramStatus, getSettings, getTodayStats } from '@/lib/api';

export default function DashboardPage() {
  const [account, setAccount] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [todayStats, setTodayStats] = useState({ commentReplies: 0, dmUsers: 0 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    await Promise.allSettled([
      getInstagramStatus().then(d => { if (d.connected) setAccount(d.account); }),
      getSettings().then(d => setSettings(d.settings)),
      getTodayStats().then(d => setTodayStats({ commentReplies: d.commentReplies, dmUsers: d.dmUsers })),
    ]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const services = [
    { label: 'DM avto javob', on: settings?.dmAutoReplyEnabled, icon: Mail, color: 'emerald' },
    { label: 'Post avto javob', on: settings?.autoReplyEnabled, icon: MessageSquare, color: 'emerald' },
    { label: "Kalit so'z filtri", on: settings?.keywordsEnabled, icon: Tag, color: 'emerald' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h2 className="text-[24px] font-semibold text-on-surface tracking-tight leading-[32px]">Bosh sahifa</h2>
          <p className="text-[13px] leading-[18px] text-on-surface-variant mt-0.5">Umumiy holat va statistika</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-high transition-colors text-[14px] font-medium disabled:opacity-50">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Yangilash
        </button>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1440px] mx-auto flex flex-col gap-12">

          {/* Metric cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {/* Akkaunt */}
            <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.02)] flex items-start gap-5 min-h-[140px]">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white shrink-0 shadow-sm">
                <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
                  <rect height="20" rx="5" ry="5" width="20" x="2" y="2"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </div>
              <div className="flex flex-col justify-between h-full py-1 min-w-0 flex-1">
                <span className="text-sm font-medium text-slate-500">Akkaunt</span>
                <div className="flex items-center gap-1.5 mt-1.5 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 truncate">
                    {account ? `@${account.username}` : 'Ulanmagan'}
                  </h3>
                </div>
                <span className="text-sm text-slate-500 mt-2">{account ? 'Ulangan' : '.env'}</span>
              </div>
            </div>

            {/* Obunachi */}
            <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.02)] flex items-start gap-5 min-h-[140px]">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Users size={24} strokeWidth={2} />
              </div>
              <div className="flex flex-col justify-between h-full py-1">
                <span className="text-sm font-medium text-slate-500">Obunachilar soni</span>
                <h2 className="text-4xl font-extrabold text-slate-700 tracking-tight mt-2">
                  {account?.followers_count ? account.followers_count.toLocaleString() : '—'}
                </h2>
              </div>
            </div>

            {/* Bugun postlarga yuborilgan javoblar */}
            <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.02)] flex items-start gap-5 min-h-[140px]">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <MessageSquare size={24} strokeWidth={2} />
              </div>
              <div className="flex flex-col justify-between h-full py-1">
                <span className="text-sm font-medium text-slate-500 line-clamp-2 leading-snug">Bugun postlarga yuborilgan javoblar</span>
                <h2 className="text-4xl font-extrabold text-slate-700 tracking-tight mt-2">
                  {todayStats.commentReplies}
                </h2>
              </div>
            </div>

            {/* Bugun DM olgan foydalanuvchilar */}
            <div className="bg-white rounded-2xl p-7 border border-slate-100 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.02)] flex items-start gap-5 min-h-[140px]">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Mail size={24} strokeWidth={2} />
              </div>
              <div className="flex flex-col justify-between h-full py-1">
                <span className="text-sm font-medium text-slate-500 line-clamp-2 leading-snug">Bugun DM olgan foydalanuvchilar</span>
                <h2 className="text-4xl font-extrabold text-slate-700 tracking-tight mt-2">
                  {todayStats.dmUsers}
                </h2>
              </div>
            </div>

          </section>

          {/* Faol xizmatlar */}
          <section className="bg-white/80 backdrop-blur-xl border border-[#E2E8F0] shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap size={24} className="text-primary fill-primary/20" />
              <h3 className="text-[24px] font-semibold text-on-surface leading-[32px] tracking-[-0.01em]">Faol xizmatlar</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map(({ label, on, icon: Icon }) => (
                <div key={label} className={`rounded-xl p-5 border flex items-center justify-between transition-colors ${on
                    ? 'bg-[#10B981]/5 border-[#10B981]/20 hover:border-[#10B981]/40'
                    : 'bg-surface border-outline-variant/50 hover:border-outline'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${on ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <span className="text-[16px] font-medium text-on-surface leading-[24px]">{label}</span>
                  </div>
                  <span className={`px-3 py-1 text-[12px] leading-[16px] tracking-[0.05em] font-bold rounded-full border ${on
                      ? 'bg-[#10B981]/10 text-[#059669] border-[#10B981]/20'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                    {on ? 'Yoqilgan' : "O'chirilgan"}
                  </span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}