'use client';
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import Topbar from '@/components/Topbar';
import Alert from '@/components/Alert';
import { getSettings, updateSettings } from '@/lib/api';

export default function SettingsPage() {
  const [cooldown, setCooldown]   = useState(24);
  const [daily, setDaily]         = useState(200);
  const [delay, setDelay]         = useState(3);
  const [alert, setAlert]         = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    getSettings().then(d => {
      const s = d.settings;
      setCooldown(s.userCooldownHours ?? 24);
      setDaily(s.dailyLimit ?? 200);
      setDelay(s.replyDelaySeconds ?? 3);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings({
        userCooldownHours: cooldown,
        dailyLimit: daily,
        replyDelaySeconds: delay,
      });
      setAlert({ type: 'success', msg: 'Sozlamalar saqlandi' });
    } catch {
      setAlert({ type: 'error', msg: 'Saqlashda xato' });
    } finally {
      setSaving(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  return (
    <>
      <Topbar title="Himoya sozlamalari" subtitle="Rate limit, delay va kunlik cheklovlar" />
      <div className="p-7 max-w-2xl">
        {alert && <Alert type={alert.type} message={alert.msg} />}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Foydalanuvchi cooldown
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Bir xil foydalanuvchiga necha soatda bir marta javob yuborilsin
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1} max={72}
                value={cooldown}
                onChange={e => setCooldown(+e.target.value)}
                className="flex-1 accent-violet-600"
              />
              <span className="w-20 text-center font-bold text-accent bg-accent-light px-3 py-1.5 rounded-lg text-sm">
                {cooldown} soat
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Kunlik limit
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Bir kunda maksimal nechta avtomatik javob yuborilsin
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={10} max={500} step={10}
                value={daily}
                onChange={e => setDaily(+e.target.value)}
                className="flex-1 accent-violet-600"
              />
              <span className="w-20 text-center font-bold text-accent bg-accent-light px-3 py-1.5 rounded-lg text-sm">
                {daily} ta
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Javob kechikishi
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Javob yuborishdan oldin necha soniya kutilsin (bot ko'rinmaslik uchun)
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0} max={30}
                value={delay}
                onChange={e => setDelay(+e.target.value)}
                className="flex-1 accent-violet-600"
              />
              <span className="w-20 text-center font-bold text-accent bg-accent-light px-3 py-1.5 rounded-lg text-sm">
                {delay} soniya
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 bg-amber-50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>Tavsiya:</strong> Cooldown 24 soat, kunlik limit 100-200 ta, kechikish 3-5 soniya.
              Bu Instagram spam filtrlaridan himoya qiladi.
            </p>
          </div>

        </div>

        <div className="flex justify-end mt-4">
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-dark transition-colors disabled:opacity-60">
            <Save size={15} /> {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </>
  );
}
