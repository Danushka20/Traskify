import { Bell, Search, User, ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

const Navbar = ({ onMobileMenuToggle }: NavbarProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const displayName = user?.name ?? 'Guest User';
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member';
  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2)
    : '';

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number; title: string; body: string; read: boolean }>>([
    { id: 1, title: 'New task assigned', body: 'You have been assigned "Prepare report"', read: false },
    { id: 2, title: 'Daily note reminder', body: 'Don\'t forget to add your daily note.', read: false },
    { id: 3, title: 'Task completed', body: 'Alex completed "Customer follow-up"', read: true },
  ]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleOpenNotification(id: number) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <header className="h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300">
      <div className="flex items-center gap-4 lg:gap-8 flex-1">
        {/* Mobile menu button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        {/* Breadcrumbs */}
        <div className="hidden md:flex items-center text-sm text-slate-500">
           <span className="text-slate-400 hover:text-indigo-600 transition-colors cursor-default">App</span>
           {pathSegments.map((segment, index) => (
             <div key={index} className="flex items-center">
                <ChevronRight size={14} className="mx-2 text-slate-300" />
                <span className="capitalize font-medium text-slate-700">
                  {segment.replace(/-/g, ' ')}
                </span>
             </div>
           ))}
        </div>

        {/* Modern Search Bar */}
        <div className="relative w-full max-w-xs sm:max-w-sm lg:w-96 hidden sm:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Quick search..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border-transparent focus:bg-white rounded-full border focus:border-indigo-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Notifications */}
        <div className="relative" ref={wrapperRef}>
          <button
            onClick={() => setOpen((s) => !s)}
            className={cn(
               "relative p-2.5 rounded-full transition-all duration-200 outline-none",
               open ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
            )}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {(Array.isArray(notifications) ? notifications : []).filter((n) => !n.read).length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-white/90 backdrop-blur-xl text-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 border border-white/20 ring-1 ring-slate-200 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/50 bg-slate-50/50">
                <strong className="text-sm font-semibold text-slate-700">Notifications</strong>
                <button
                  onClick={() => setNotifications((prev) => (Array.isArray(prev) ? prev : []).map((n) => ({ ...n, read: true })))}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Mark all as read
                </button>
              </div>
              <ul className="max-h-[20rem] overflow-y-auto custom-scrollbar">
                {(Array.isArray(notifications) ? notifications : []).length === 0 && (
                  <li className="p-8 text-center text-sm text-slate-500">No new notifications</li>
                )}
                {(Array.isArray(notifications) ? notifications : []).map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      "px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 cursor-pointer flex items-start gap-4 transition-colors",
                      n.read ? 'opacity-60' : 'bg-indigo-50/30'
                    )}
                    onClick={() => handleOpenNotification(n.id)}
                  >
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", n.read ? 'bg-slate-300' : 'bg-red-500 shadow-sm shadow-red-500/50')} />
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-medium text-slate-900 leading-none">{n.title}</div>
                      <div className="text-xs text-slate-500 leading-relaxed line-clamp-2">{n.body}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-6 border-l border-slate-200/50">
          <div className="text-right hidden sm:block group cursor-default">
             <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">{displayName}</p>
             <p className="text-xs text-slate-500 font-medium">{roleLabel}</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white font-bold text-sm tracking-wide transform hover:scale-105 transition-transform duration-200 cursor-pointer">
            {user && initials ? initials : <User size={18} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
