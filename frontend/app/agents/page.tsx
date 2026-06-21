'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bot, Plus, ArrowRight, Trash2, X } from 'lucide-react';
import { getAgents, createAgent, deleteAgent } from '@/lib/api';

interface Agent {
  id: number;
  name: string;
  description: string;
  systemPrompt: string;
  emoji: string;
  createdAt: string;
}

const EMOJIS = ['🤖', '🧠', '💬', '🎯', '⚡', '🌟', '🔥', '💡', '🦾', '🎭'];

export default function AgentsPage() {
  const [agents, setAgents]     = useState<Agent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({ name: '', description: '', systemPrompt: '', emoji: '🤖' });

  const load = () => {
    setLoading(true);
    getAgents()
      .then(d => setAgents(Array.isArray(d) ? d : []))
      .catch(() => setAgents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.systemPrompt.trim()) return;
    setSaving(true);
    try {
      await createAgent(form);
      setShowModal(false);
      setForm({ name: '', description: '', systemPrompt: '', emoji: '🤖' });
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Agentni o\'chirishni tasdiqlaysizmi?')) return;
    await deleteAgent(id);
    load();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">

          <header className="mb-8 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Bot size={28} className="text-primary" />
                <h2 className="text-[28px] font-semibold text-on-surface tracking-tight">AI Agentlar</h2>
              </div>
              <p className="text-[15px] text-on-surface-variant">
                O'zingizga xos AI agentlar yarating va ular bilan suhbat quiring.
              </p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-[14px] font-semibold rounded-xl hover:bg-primary/90 transition-colors">
              <Plus size={18} /> Yangi agent
            </button>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 animate-pulse">
                  <div className="w-12 h-12 rounded-lg bg-surface-container mb-4" />
                  <div className="h-5 w-32 bg-surface-container rounded mb-2" />
                  <div className="h-4 w-48 bg-surface-container rounded" />
                </div>
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
              <Bot size={48} className="mb-4 opacity-30" />
              <p className="text-[16px] font-medium mb-1">Hali agent yaratilmagan</p>
              <p className="text-[14px] opacity-60 mb-6">Birinchi agentingizni yarating</p>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-[14px] font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                <Plus size={17} /> Agent yaratish
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {agents.map(agent => (
                <Link key={agent.id} href={`/agents/${agent.id}`}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 flex flex-col shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] hover:border-primary/20 transition-all duration-300 group cursor-pointer relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-fixed dark:bg-primary/20 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                      {agent.emoji}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={e => handleDelete(agent.id, e)}
                        className="p-1.5 rounded-lg text-outline-variant hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={15} />
                      </button>
                      <ArrowRight size={18} className="text-outline-variant group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                  <h3 className="text-[17px] font-semibold text-on-surface mb-1.5">{agent.name}</h3>
                  <p className="text-[14px] text-on-surface-variant leading-[22px] flex-1">
                    {agent.description || 'Tavsif yo\'q'}
                  </p>
                  <div className="mt-4 pt-4 border-t border-outline-variant/30">
                    <span className="text-[12px] text-on-surface-variant/60">
                      {new Date(agent.createdAt).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-semibold text-on-surface">Yangi agent yaratish</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Emoji tanlash */}
            <div className="mb-5">
              <label className="block text-[13px] font-medium text-on-surface-variant mb-2">Ikonka</label>
              <div className="flex gap-2 flex-wrap">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                    className={`w-10 h-10 rounded-lg text-xl transition-colors ${form.emoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">Agent nomi *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Masalan: Savdo bo'yicha yordamchi"
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">Tavsif</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Bu agent nima qiladi?"
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface-variant mb-1.5">System prompt *</label>
                <p className="text-[12px] text-on-surface-variant/60 mb-2">Agent qanday gapirishi va munosabat bildirishini yozing</p>
                <textarea value={form.systemPrompt} onChange={e => setForm(f => ({ ...f, systemPrompt: e.target.value }))}
                  rows={5} placeholder="Masalan: Sen savdo bo'yicha mutaxassis yordamchisan. Mijozlarga do'stona va professional munosabatda bo'lasan..."
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/50 bg-surface text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant/50 text-[14px] font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
                Bekor qilish
              </button>
              <button onClick={handleCreate} disabled={saving || !form.name.trim() || !form.systemPrompt.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {saving ? 'Yaratilmoqda...' : 'Yaratish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
