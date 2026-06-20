'use client';
import { useEffect, useState } from 'react';
import { Zap, Mail, MessageSquare, Tag, Users, Send } from 'lucide-react';
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
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* BEGIN: HeaderSection */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-on-surface leading-[32px]">Bosh sahifa</h1>
            <p className="text-[13px] text-on-surface-variant mt-0.5 leading-[18px]">Umumiy holat va statistika</p>
          </div>
          {/* Refresh Button */}
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors text-[14px] font-medium disabled:opacity-50 shadow-sm"
            type="button"
          >
            <svg aria-hidden="true" className={`-ml-0.5 h-4 w-4 text-on-surface-variant ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Yangilash
          </button>
        </header>
        {/* END: HeaderSection */}

        <main className="space-y-8">
          {/* BEGIN: StatsGrid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Account Card */}
            <article className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-card transition-shadow relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f09433]/5 to-[#bc1888]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="flex items-start gap-4 relative">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center text-white shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect height="20" rx="5" ry="5" width="20" x="2" y="2"></rect>
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-on-surface-variant truncate">Akkaunt</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <h2 className="text-[18px] font-semibold text-on-surface truncate">
                      {account ? `@${account.username}` : 'Ulanmagan'}
                    </h2>
                    {account && (
                      <svg className="w-5 h-5 text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" fillRule="evenodd"></path>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                <span className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${account ? 'bg-[#10B981]/10 text-[#059669] ring-[#10B981]/20' : 'bg-surface-container-high text-on-surface-variant ring-outline-variant/50'}`}>
                  <svg aria-hidden="true" className={`h-1.5 w-1.5 ${account ? 'fill-[#10B981]' : 'fill-on-surface-variant'}`} viewBox="0 0 6 6"><circle cx="3" cy="3" r="3"></circle></svg>
                  {account ? 'Ulangan' : '.env kiritilmagan'}
                </span>
              </div>
            </article>

            {/* Subscribers Card */}
            <article className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-card transition-shadow relative overflow-hidden group">
              <div className="flex items-center gap-4 relative">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-primary-fixed flex items-center justify-center">
                  <Users size={24} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-on-surface-variant">Obunachilar soni</p>
                </div>
              </div>
              <div className="mt-4 flex items-baseline">
                <p className="text-4xl font-bold tracking-tight text-on-surface">
                  {account?.followers_count ? account.followers_count.toLocaleString() : '—'}
                </p>
              </div>
            </article>

            {/* Post Replies Card */}
            <article className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-card transition-shadow relative overflow-hidden group">
              <div className="flex items-start gap-4 relative">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-primary-fixed flex items-center justify-center">
                  <MessageSquare size={24} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-on-surface-variant leading-tight">Bugun postlarga yuborilgan javoblar</p>
                </div>
              </div>
              <div className="mt-4 flex items-baseline">
                <p className="text-4xl font-bold tracking-tight text-on-surface">{todayStats.commentReplies}</p>
              </div>
            </article>

            {/* DM Recipients Card */}
            <article className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:shadow-card transition-shadow relative overflow-hidden group">
              <div className="flex items-start gap-4 relative">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-primary-fixed flex items-center justify-center">
                  <Send size={24} className="text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-on-surface-variant leading-tight">Bugun DM olgan foydalanuvchilar</p>
                </div>
              </div>
              <div className="mt-4 flex items-baseline">
                <p className="text-4xl font-bold tracking-tight text-on-surface">{todayStats.dmUsers}</p>
              </div>
            </article>

          </section>
          {/* END: StatsGrid */}

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
          {/* END: ActiveServicesSection */}

        </main>
      </div>
    </div>
  );
}