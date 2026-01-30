import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';
import { useToast } from '../components/feedback/ToastProvider';
import { useConfirm } from '../components/feedback/ConfirmDialogProvider';
import { useEchoListener } from '../context/RealtimeContext';

interface DailyNote {
  id: number;
  title: string;
  content: string;
  date: string; // ISO timestamp or date string
  created_at?: string;
  recipients: { id: number; name: string }[];
}

interface Props {
  date: string;
  memberId: string;
  refreshTrigger?: number;
}

export default function DailyNoteTable({ date, memberId, refreshTrigger }: Props) {
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOnly24h, setShowOnly24h] = useState(false);
  const { addToast } = useToast();
  const confirm = useConfirm();
  const [editModal, setEditModal] = useState<{ open: boolean; note?: DailyNote }>( { open: false } );
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const applyIncomingNote = useCallback((incoming: any) => {
    if (!incoming) return;
    const updatedId = String(incoming.id);
    setNotes(prev => {
      const exists = prev.some(n => String(n.id) === updatedId);
      if (exists) {
        return prev.map(n => String(n.id) === updatedId ? incoming : n);
      }
      return [incoming, ...prev];
    });
  }, []);

  // Real-time updates for Admin History
  useEchoListener('daily-notes', 'DailyNoteCreated', (e: any) => {
    applyIncomingNote(e?.note);
  }, [applyIncomingNote]);

  useEchoListener('daily-notes', 'DailyNoteUpdated', (e: any) => {
    applyIncomingNote(e?.note);
  }, [applyIncomingNote]);

  useEchoListener('daily-notes', 'DailyNoteDeleted', (e: any) => {
    const deletedId = String(e.id);
    setNotes(prev => prev.filter(n => String(n.id) !== deletedId));
  }, []);

  useEffect(() => {
    setLoading(true);
    // fetch all notes and apply filters client-side so all combinations work
    api.get('/daily-note')
      .then(res => {
        const data = res.data;
        const arr = Array.isArray(data) ? data : (data ? [data] : []);
        setNotes(arr as DailyNote[]);
      })
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, [date, memberId, refreshTrigger]);

  if (loading) return <div className="p-6 text-slate-500">Loading notes…</div>;

  // apply filters: date (YYYY-MM-DD) and memberId, plus optional 24h filter
  const filtered = notes.filter(note => {
    // member filter
    if (memberId) {
      const mid = Number(memberId);
      if (!note.recipients || !note.recipients.some(r => r.id === mid)) return false;
    }

    // date filter (compare ISO date portion)
    if (date) {
      const ts = note.date ?? note.created_at ?? '';
      const d = new Date(ts);
      if (isNaN(d.getTime())) return false;
      const noteDate = d.toISOString().slice(0, 10);
      if (noteDate !== date) return false;
    }

    // 24h filter
    if (showOnly24h) {
      const ts = note.created_at ?? note.date ?? '';
      const t = new Date(ts).getTime();
      if (isNaN(t)) return false;
      if ((Date.now() - t) > 24 * 60 * 60 * 1000) return false;
    }

    return true;
  });

  if (!filtered.length) return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 text-center border-2 border-dashed rounded-xl sm:rounded-2xl lg:rounded-3xl border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 bg-white rounded-full shadow-sm text-slate-300">
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800">No records found</h3>
        <p className="max-w-xs mt-1 text-xs sm:text-sm font-medium text-slate-500">No daily notes match your current filter settings.</p>
    </div>
  );

  return (
    <div className="overflow-hidden bg-white border border-slate-200 rounded-xl sm:rounded-2xl lg:rounded-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-2">
            <span className="flex items-center justify-center h-5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-xs font-bold text-white rounded-md bg-slate-800">
                {filtered.length}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Records Found</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-600 cursor-pointer hover:text-indigo-600">
             <input type="checkbox" checked={showOnly24h} onChange={e => setShowOnly24h(e.target.checked)} className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
             <span className="hidden sm:inline">Show only last 24h</span>
             <span className="sm:hidden">Last 24h</span>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b bg-slate-50/80 border-slate-100">
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-xs font-extrabold tracking-widest text-left uppercase text-slate-400">Status</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-xs font-extrabold tracking-widest text-left uppercase text-slate-400">Date/Time</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-xs font-extrabold tracking-widest text-left uppercase text-slate-400">Details</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-xs font-extrabold tracking-widest text-left uppercase text-slate-400 hidden md:table-cell">Recipients</th>
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-xs font-extrabold tracking-widest uppercase text-slate-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map(note => {
             const created = new Date(note.created_at || note.date);
             const ageMs = Date.now() - created.getTime();
             const isExpired = ageMs > 24 * 60 * 60 * 1000;
             const hours = Math.floor(ageMs / (1000 * 60 * 60));
             const mins = Math.floor((ageMs % (1000 * 60 * 60)) / (60 * 1000));
             
             return (
              <tr key={note.id} className="transition-colors hover:bg-slate-50/80 group align-top">
                <td className="px-3 sm:px-6 py-3 sm:py-4 w-20 sm:w-32">
                   {isExpired ? (
                       <span className="inline-flex items-center justify-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full bg-rose-100 text-rose-600 border border-rose-200">
                           Prior
                       </span>
                   ) : (
                       <span className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
                           <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                           Active
                       </span>
                   )}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 w-32 sm:w-48">
                    <div className="text-xs sm:text-sm font-bold text-slate-700">{new Date(note.date).toLocaleDateString()}</div>
                    <div className="text-[10px] sm:text-xs font-medium text-slate-400 mt-0.5 sm:mt-1">{created.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-wide">{hours}h {mins}m ago</div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 max-w-[150px] sm:max-w-lg">
                    <div className="font-bold text-slate-800 text-xs sm:text-sm mb-0.5 sm:mb-1 truncate sm:whitespace-normal">{note.title}</div>
                    <div className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-1 sm:line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                        {note.content}
                    </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {note.recipients && note.recipients.length > 0 ? (
                        note.recipients.slice(0, 4).map(r => (
                        <span key={r.id} className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold border rounded-md sm:rounded-lg bg-white border-slate-200 text-slate-600 shadow-sm">
                            {r.name}
                        </span>
                        ))
                    ) : (
                        <span className="text-xs font-medium text-slate-400 italic">Global / All</span>
                    )}
                    {note.recipients && note.recipients.length > 4 && (
                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-100 rounded-md sm:rounded-lg">
                            +{note.recipients.length - 4}
                        </span>
                    )}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                   <div className="flex items-center justify-end gap-2 sm:gap-3 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                            setEditTitle(note.title);
                            setEditContent(note.content);
                            setEditModal({ open: true, note });
                        }}
                        className="text-indigo-600 hover:text-indigo-700 font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-indigo-50 hover:bg-indigo-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                            const ok = await confirm({
                                title: 'Delete Note',
                                message: 'Are you sure you want to delete this note?',
                                tone: 'danger',
                                confirmText: 'Delete',
                                cancelText: 'Cancel',
                            });
                            if (!ok) return;
                            try {
                                await api.delete(`/daily-note/${note.id}`);
                                setNotes(prev => prev.filter(n => n.id !== note.id));
                                addToast({ type: 'success', message: 'Note deleted' } as any);
                            } catch (err) {
                                addToast({ type: 'error', message: 'Failed to delete note' } as any);
                            }
                        }}
                        className="text-rose-600 hover:text-rose-700 font-bold text-[10px] sm:text-xs uppercase tracking-wider bg-rose-50 hover:bg-rose-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-colors"
                      >
                        <span className="hidden sm:inline">Delete</span>
                        <span className="sm:hidden">Del</span>
                      </button>
                   </div>
                   {!isExpired && <div className="text-[9px] sm:text-[10px] font-bold text-emerald-500 mt-1.5 sm:mt-2 text-right sm:group-hover:hidden">Active</div>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {/* Edit Modal (Preserved & Styled) */}
      {editModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-xl sm:rounded-2xl lg:rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">Edit Assignment</h2>
                <p className="text-xs sm:text-sm text-slate-500">Update the content of this daily note.</p>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5 sm:mb-2">Title</label>
                <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-transparent rounded-lg sm:rounded-xl focus:bg-white focus:border-indigo-500/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium text-sm text-slate-800 transition-all"
                />
                </div>
                <div>
                <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5 sm:mb-2">Content</label>
                <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-transparent rounded-lg sm:rounded-xl focus:bg-white focus:border-indigo-500/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium text-sm text-slate-800 min-h-[120px] sm:min-h-[150px] resize-none transition-all"
                />
                </div>
            </div>
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 bg-slate-50 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 border-t border-slate-100">
              <button
                className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                onClick={() => setEditModal({ open: false })}
              >Cancel</button>
              <button
                className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg sm:rounded-xl shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95"
                disabled={!editTitle || !editContent}
                onClick={async () => {
                  if (!editModal.note) return;
                  try {
                    await api.put(`/daily-note/${editModal.note.id}`, { title: editTitle, content: editContent });
                    setNotes(prev => prev.map(n => n.id === editModal.note!.id ? { ...n, title: editTitle, content: editContent } : n));
                    addToast({ type: 'success', message: 'Note updated successfully' } as any);
                    setEditModal({ open: false });
                  } catch (err) {
                    addToast({ type: 'error', message: 'Failed to update note' } as any);
                  }
                }}
              >Save Updates</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
