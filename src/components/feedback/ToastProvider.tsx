import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';

type ToastTone = 'success' | 'error' | 'info';

type ToastPayload = {
    tone?: ToastTone;
    title: string;
    description?: string;
    durationMs?: number;
};

type ToastRecord = Required<ToastPayload> & { id: number };

type ToastContextValue = {
    addToast: (payload: ToastPayload) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastRecord[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback(({ tone = 'info', title, description = '', durationMs = 5000 }: ToastPayload) => {
        setToasts(prev => {
            const id = Date.now() + Math.floor(Math.random() * 1000);
            const record: ToastRecord = { id, tone, title, description, durationMs };
            window.setTimeout(() => removeToast(id), durationMs);
            return [...prev, record];
        });
    }, [removeToast]);

    const value = useMemo(() => ({ addToast }), [addToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex w-full max-w-sm flex-col gap-3 sm:max-w-md">
                {toasts.map(toast => (
                    <ToastCard key={toast.id} toast={toast} onDismiss={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastCard({ toast, onDismiss }: { toast: ToastRecord; onDismiss: (id: number) => void }) {
    const tone = toast.tone;
    const toneStyles: Record<ToastTone, { border: string; icon: string; badge: string; title: string }> = {
        success: {
            border: 'border-emerald-200/70 bg-emerald-50',
            icon: 'text-emerald-500',
            badge: 'bg-emerald-100 text-emerald-600',
            title: 'text-emerald-900',
        },
        error: {
            border: 'border-rose-200/70 bg-rose-50',
            icon: 'text-rose-500',
            badge: 'bg-rose-100 text-rose-600',
            title: 'text-rose-900',
        },
        info: {
            border: 'border-indigo-200/70 bg-indigo-50',
            icon: 'text-indigo-500',
            badge: 'bg-indigo-100 text-indigo-600',
            title: 'text-slate-900',
        },
    };

    const iconMap: Record<ToastTone, typeof Info> = {
        success: CheckCircle2,
        error: AlertTriangle,
        info: Info,
    };

    const Icon = iconMap[tone];

    return (
        <div className={clsx('pointer-events-auto rounded-3xl border p-5 shadow-xl shadow-slate-900/10 backdrop-blur', toneStyles[tone].border)}>
            <div className="flex items-start gap-4">
                <div className={clsx('flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-xl shadow-sm', toneStyles[tone].icon)}>
                    <Icon size={20} />
                </div>
                <div className="flex-1">
                    <p className={clsx('text-sm font-semibold uppercase tracking-[0.2em]', toneStyles[tone].badge, 'inline-flex rounded-full px-2 py-1')}>{tone === 'info' ? 'Notice' : tone}</p>
                    <p className={clsx('mt-2 text-base font-semibold', toneStyles[tone].title)}>{toast.title}</p>
                    {toast.description && (
                        <p className="mt-1 text-sm text-slate-600">
                            {toast.description}
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => onDismiss(toast.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/70 text-slate-400 transition-colors hover:text-slate-600"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
