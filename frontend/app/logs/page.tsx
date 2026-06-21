'use client';
import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Inbox } from 'lucide-react';
import { getLogs } from '@/lib/api';

interface Log {
  id: number;
  type: 'success' | 'error' | 'info';
  action: string;
  message: string;
  user: string;
  userMessage?: string;
  timestamp: string;
}

const dotColor: Record<string, string> = {
  success: 'bg-[#4edea3] shadow-[0_0_8px_rgba(78,222,163,0.4)]',
  error:   'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]',
  info:    'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.4)]',
};

const actionColor: Record<string, string> = {
  success: 'text-[#00885d]',
  error:   'text-red-500',
  info:    'text-blue-500',
};

export default function LogsPage() {
  const [logs, setLogs]       = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const load = () => {
    setLoading(true);
    getLogs(100)
      .then(d => setLogs(d.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { scrollToBottom(); }, [logs]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <header className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-[28px] font-semibold text-on-surface tracking-tight">Loglar</h2>
              <p className="text-[15px] text-on-surface-variant mt-1">Bot faoliyatining to'liq tarixi</p>
            </div>
            <button onClick={load}
              className="flex items-center gap-2 px-4 py-2.5 text-[14px] font-medium border border-outline-variant/50 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-on-surface-variant">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Yangilash
            </button>
          </header>

          {/* Log container */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-y-auto max-h-[calc(100vh-220px)]">
              {loading ? (
                <div className="flex flex-col">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-start px-6 py-4 border-b border-outline-variant/30 last:border-b-0">
                      <div className="mt-[6px] w-2 h-2 rounded-full bg-surface-container-high shrink-0 animate-pulse" />
                      <div className="ml-4 flex-1 space-y-2">
                        <div className="h-4 w-48 bg-surface-container rounded animate-pulse" />
                        <div className="h-3 w-32 bg-surface-container rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-10 bg-surface-container rounded animate-pulse ml-4 mt-1" />
                    </div>
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                  <Inbox size={40} className="mb-3 opacity-40" />
                  <p className="text-[15px]">Hozircha faoliyat yo'q</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {logs.map(log => (
                    <div key={log.id}
                      className="flex items-start px-6 py-4 border-b border-outline-variant/30 last:border-b-0 hover:bg-surface-container-low transition-colors">
                      <span className={`mt-[6px] w-2 h-2 rounded-full shrink-0 ${dotColor[log.type] ?? dotColor.info}`} />
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className={`text-[15px] font-medium ${actionColor[log.type] ?? actionColor.info}`}>{log.action}</span>
                          {log.user && <span className="text-[13px] font-semibold text-on-surface-variant">@{log.user}</span>}
                        </div>
                        {log.userMessage && (
                          <p className="text-[13px] text-on-surface-variant/60 mt-0.5 truncate">
                            <span className="mr-1 text-on-surface-variant/40">↳</span>{log.userMessage}
                          </p>
                        )}
                        {log.message && <p className="text-[14px] text-on-surface-variant mt-0.5 truncate">{log.message}</p>}
                      </div>
                      <span className="text-[12px] text-on-surface-variant/60 ml-4 shrink-0 mt-[2px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
