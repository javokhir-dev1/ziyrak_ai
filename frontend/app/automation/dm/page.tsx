'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import Alert from '@/components/Alert';
import { getSettings, updateSettings, getDmMessages, updateDmMessages } from '@/lib/api';

export default function DmFullPage() {
  const router = useRouter();
  const [dmAutoReplyEnabled, setDmAutoReplyEnabled] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [savedMessages, setSavedMessages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [toggling, setToggling] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then(d => setDmAutoReplyEnabled(d.settings.dmAutoReplyEnabled ?? false));
    getDmMessages().then(d => {
      setMessages(d.messages);
      setSavedMessages(d.messages);
      setCurrentIndex(d.currentIndex);
    });
  }, []);

  const showAlert = (type: 'success' | 'error', msg: string) => {
    setAlert({ type, msg }); setTimeout(() => setAlert(null), 3500);
  };

  const handleToggleChange = async (val: boolean) => {
    if (val && messages.filter(m => m.trim()).length < 3) {
      showAlert('error', "Yoqish uchun kamida 3 ta xabar qo'shing");
      return;
    }
    setToggling(true);
    try {
      await updateSettings({ dmAutoReplyEnabled: val });
      setDmAutoReplyEnabled(val);
      showAlert('success', val ? 'DM avto javob yoqildi' : "DM avto javob o'chirildi");
    } catch { showAlert('error', 'Xato'); }
    finally { setToggling(false); }
  };

  const saveDmMessages = async () => {
    const filtered = messages.filter(m => m.trim());
    if (dmAutoReplyEnabled && filtered.length < 3) {
      return showAlert('error', "Xizmat yoqiq. Kamida 3 ta xabar bo'lishi kerak");
    }
    setSaving(true);
    try {
      await updateDmMessages(filtered);
      setMessages(filtered);
      setSavedMessages(filtered);
      setCurrentIndex(0);
      showAlert('success', filtered.length ? 'DM xabarlar saqlandi' : 'Xabarlar tozalandi');
    } catch { showAlert('error', 'Xato'); } finally { setSaving(false); }
  };

  const removeMsg = (i: number) => {
    const remaining = messages.filter((_, idx) => idx !== i);
    if (dmAutoReplyEnabled && remaining.filter(m => m.trim()).length === 0) {
      showAlert('error', "Avval xizmatni o'chiring, keyin xabarlarni o'chirishingiz mumkin");
      return;
    }
    setMessages(remaining);
  };

  const updateMsg = (i: number, val: string) => { const c = [...messages]; c[i] = val; setMessages(c); };
  const addMsg = () => setMessages([...messages, '']);
  const validCount = messages.filter(m => m.trim()).length;
  const hasChanges = JSON.stringify(messages) !== JSON.stringify(savedMessages);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/automation')}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors flex-shrink-0">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-[20px] font-semibold text-on-surface leading-tight">DM avto javob</h2>
          </div>

          {alert && <Alert type={alert.type} message={alert.msg} />}

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-on-surface">DM Avtojavobni yoqish</div>
                <div className="text-xs text-on-surface-variant mt-0.5">Kimdir DM yozganida aylanadigan xabarlardan javob yuboradi</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {toggling && <Loader2 size={14} className="animate-spin text-on-surface-variant" />}
                <label className="relative inline-flex items-center cursor-pointer"
                  onClick={e => { e.preventDefault(); if (!toggling) handleToggleChange(!dmAutoReplyEnabled); }}>
                  <input type="checkbox" checked={dmAutoReplyEnabled} onChange={() => {}} className="sr-only peer" />
                  <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
            {!dmAutoReplyEnabled && validCount > 0 && validCount < 3 && (
              <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl px-3 py-2">
                Yoqish uchun kamida 3 ta xabar kerak ({validCount}/3)
              </p>
            )}
          </div>

          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-semibold text-on-surface">Aylanadigan xabarlar</div>
              {validCount > 0 && (
                <span className="text-xs bg-primary-fixed text-primary font-semibold px-2.5 py-1 rounded-full">
                  Keyingi: {currentIndex + 1}/{validCount}
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mb-5">Har bir yangi DM ga navbat bilan yuboriladi.</p>

            {messages.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-6">Hali xabar qo'shilmagan</p>
            ) : (
              <div className="space-y-2.5">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 items-start border-[1.5px] rounded-xl px-3 py-2.5 transition-colors ${
                    i === currentIndex
                      ? 'border-primary bg-primary-fixed/40'
                      : 'border-outline-variant/30 bg-surface-container-low'
                  }`}>
                    <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold mt-0.5 ${
                      i === currentIndex ? 'bg-primary text-on-primary' : 'bg-primary-fixed text-primary'
                    }`}>{i + 1}</div>
                    <textarea rows={2} value={msg} onChange={e => updateMsg(i, e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface resize-none leading-relaxed" />
                    <button onClick={() => removeMsg(i)}
                      className="p-1.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors flex-shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <button onClick={addMsg}
                className="flex items-center gap-1.5 text-sm px-4 py-2 border-[1.5px] border-outline-variant/50 text-on-surface-variant rounded-xl hover:bg-surface-container-low transition-colors">
                <Plus size={14} /> Xabar qo'shish
              </button>
              <button onClick={saveDmMessages} disabled={saving || !hasChanges}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <Save size={15} /> {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
