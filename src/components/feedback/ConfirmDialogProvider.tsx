import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { clsx } from 'clsx';

type ConfirmTone = 'default' | 'danger';

type ConfirmOptions = {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    tone?: ConfirmTone;
};

type InternalState = ConfirmOptions & {
    isOpen: boolean;
    resolve?: (value: boolean) => void;
};

type ConfirmContextValue = {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmDialogContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<InternalState>({ isOpen: false, message: '' });

    const close = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: false }));
    }, []);

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>(resolve => {
            setState({
                isOpen: true,
                resolve,
                title: options.title,
                message: options.message,
                confirmText: options.confirmText,
                cancelText: options.cancelText,
                tone: options.tone,
            });
        });
    }, []);

    const providerValue = useMemo(() => ({ confirm }), [confirm]);

    const handleCancel = useCallback(() => {
        state.resolve?.(false);
        close();
    }, [state.resolve, close]);

    const handleConfirm = useCallback(() => {
        state.resolve?.(true);
        close();
    }, [state.resolve, close]);

    const tone: ConfirmTone = state.tone ?? 'default';
    const isOpen = state.isOpen;

    return (
        <ConfirmDialogContext.Provider value={providerValue}>
            {children}
            {isOpen && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-900/40">
                        <div className="flex items-center gap-3 text-slate-500">
                            <div className={clsx('flex h-12 w-12 items-center justify-center rounded-2xl', tone === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500')}>
                                {tone === 'danger' ? <AlertTriangle size={24} /> : <Check size={24} />}
                            </div>
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                                    {tone === 'danger' ? 'Confirm action' : 'Please review'}
                                </p>
                                <h2 className="mt-2 text-xl font-semibold text-slate-900">{state.title ?? 'Are you sure?'}</h2>
                            </div>
                        </div>
                        <p className="mt-6 text-sm leading-relaxed text-slate-600">{state.message}</p>
                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 sm:w-auto sm:px-6"
                            >
                                {state.cancelText ?? 'Cancel'}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className={clsx(
                                    'w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all sm:w-auto sm:px-6',
                                    tone === 'danger'
                                        ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/30'
                                        : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'
                                )}
                            >
                                {state.confirmText ?? 'Confirm'}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition-colors hover:text-slate-600"
                            aria-label="Close dialog"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}
        </ConfirmDialogContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmDialogContext);
    if (!context) {
        throw new Error('useConfirm must be used within a ConfirmDialogProvider');
    }
    return context.confirm;
}
