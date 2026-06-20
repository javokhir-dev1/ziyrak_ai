'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, Inbox } from 'lucide-react';
import Topbar from '@/components/Topbar';
import { getLogs } from '@/lib/api';

interface Log {
  id: number;
  type: 'success' | 'error' | 'info';
  action: string;
  message: string;
  user: string;
  timestamp: string;
}

const typeStyles: Record<string, string> = {
  success: 'bg-emerald-50 border-l-2 border-emerald-400',
  error:   'bg-red-50 border-l-2 border-red-400',
  info:    'bg-blue-50 border-l-2 border-blue-400',
};

export default function LogsPage() {
  const [logs, setLogs]       = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getLogs(100)
      .then(d => setLogs(d.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <Topbar
        title="Loglar"
        subtitle="Bot faoliyatining to'liq tarixi"
        action={
          <button onClick={load}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} /> Yangilash
          </button>
        }
      />
      <div className="p-7">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Yuklanmoqda...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Inbox size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">Hozircha faoliyat yo'q</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {logs.map(log => (
                <div key={log.id} className={`px-4 py-3 rounded-xl flex gap-3 items-start text-sm ${typeStyles[log.type] ?? typeStyles.info}`}>
                  <div className="flex-1">
                    <span className="font-semibold">{log.action}</span>: {log.message}
                    {log.user && <span className="text-violet-600 ml-1">@{log.user}</span>}
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
                    {new Date(log.timestamp).toLocaleString('uz-UZ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
