import { NavLink } from 'react-router-dom';
import fulllogo from '../assets/fulllogo_transparent.png';
import icononly from '../assets/icononly.png';
import { LayoutDashboard, CheckSquare, Users, LogOut, FileText, ClipboardList, ChevronLeft, ChevronRight, UserCircle, BarChart3, Settings2, Video, Mail, ChevronUp, ChevronDown, Folder } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  onMobileClose?: () => void;
  isMobile?: boolean;
}

const Sidebar = ({ isOpen, toggle, onMobileClose, isMobile }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navRef = useRef<HTMLElement>(null);
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('sidebar-expanded');
    return saved ? JSON.parse(saved) : {
      Overview: true,
      Tasks: true,
      Communication: true,
      Team: true,
      Work: true,
      Account: true
    };
  });

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', JSON.stringify(expandedSections));
  }, [expandedSections]);

  useEffect(() => {
    const savedScroll = localStorage.getItem('sidebar-scroll');
    if (savedScroll && navRef.current) {
      navRef.current.scrollTop = parseInt(savedScroll);
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    localStorage.setItem('sidebar-scroll', e.currentTarget.scrollTop.toString());
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const memberNavItems = [
    { title: 'Overview', items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: CheckSquare, label: 'Daily Tasks', path: '/tasks' },
    ]},
    { title: 'Work', items: [
      { icon: Folder, label: 'Projects', path: '/projects' },
      { icon: ClipboardList, label: 'Late Jobs', path: '/late-jobs' },
      { icon: ClipboardList, label: 'Reassignments', path: '/reassignments' },
      { icon: BarChart3, label: 'My Progress', path: '/progress' },
    ]},
    { title: 'Account', items: [
      { icon: UserCircle, label: 'Profile', path: '/profile' },
    ]}
  ];

  const adminNavItems = [
    { title: 'Overview', items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Folder, label: 'Projects', path: '/projects' },
    ]},
    { title: 'Tasks', items: [
      { icon: ClipboardList, label: 'Task Management', path: '/admin/tasks' },
      { icon: Settings2, label: 'Task Setup', path: '/admin/task-setup' },
      { icon: FileText, label: 'Daily Notes', path: '/admin/daily-notes' },
      { icon: FileText, label: 'Records', path: '/admin/records' },
      { icon: ClipboardList, label: 'Reassignments', path: '/admin/reassignments' },
      { icon: BarChart3, label: 'Member Progress', path: '/admin/progress' },
    ]},
    { title: 'Communication', items: [
      { icon: Video, label: 'Daily Meeting', path: '/admin/meeting' },
      { icon: Mail, label: 'Custom Email', path: '/admin/custom-mail' },
    ]},
    { title: 'Team', items: [
      { icon: Users, label: 'Team Members', path: '/admin/members' },
      { icon: UserCircle, label: 'Profile', path: '/admin/profile' },
    ]}
  ];

  const sections = user?.role === 'admin' ? adminNavItems : memberNavItems;

  // On mobile, always show expanded sidebar
  const effectiveIsOpen = isMobile ? true : isOpen;

  const handleNavClick = () => {
    // Close mobile menu when navigating
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside className={clsx(
      "bg-gradient-to-b from-slate-950 to-indigo-950 flex flex-col h-screen fixed left-0 top-0 border-r border-white/5 backdrop-blur-md transition-all duration-300 z-50 shadow-2xl",
      effectiveIsOpen ? "w-72" : "w-20"
    )}>
      {/* Header */}
      <div className={clsx(
            "relative flex items-center justify-center border-b border-white/5",
            effectiveIsOpen ? "h-24 px-4" : "h-20 px-2"
      )}>
        {/* Glow effect for logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-500/10 blur-[40px] rounded-full pointer-events-none" />
        
        {effectiveIsOpen ? (
          <div className="relative z-10 flex flex-col items-center w-full duration-500 animate-in fade-in">
             <div className="transition-transform duration-500 transform hover:scale-105">
                <img
                src={fulllogo}
                alt="Trackify"
                className="object-contain w-full h-16 filter brightness-110 drop-shadow-lg"
                />
             </div>
          </div>
        ) : (
          <img
            src={icononly}
            alt="Trackify"
            className="relative z-10 object-contain w-10 h-10 transition-transform filter brightness-110 hover:scale-110 drop-shadow-md"
          />
        )}
      </div>

       {/* Floating Toggle Button - hidden on mobile */}
       <button
        onClick={toggle}
        className="absolute z-50 p-1.5 text-slate-400 transition-all transform bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-full shadow-lg -right-3 top-10 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 hidden lg:block"
      >
        {effectiveIsOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Navigation */}
      <nav 
        ref={navRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 px-3 py-6 overflow-x-hidden overflow-y-auto custom-scrollbar"
      >
        {sections.map((section) => (
          <div 
            key={section.title} 
            className="mb-6 last:mb-0"
          >
            {effectiveIsOpen && (
              <button 
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-3 mb-2 cursor-pointer group"
              >
                <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500/80 group-hover:text-indigo-400 transition-colors">
                  {section.title}
                </h3>
                {expandedSections[section.title] ? (
                  <ChevronUp size={12} className="transition-transform transform text-slate-600 group-hover:text-indigo-400" />
                ) : (
                  <ChevronDown size={12} className="transition-transform transform text-slate-600 group-hover:text-indigo-400" />
                )}
              </button>
            )}
            
            <div className={clsx(
              "space-y-0.5 transition-all duration-300 ease-in-out overflow-hidden",
              effectiveIsOpen && !expandedSections[section.title] ? "max-h-0 opacity-0" : "max-h-[800px] opacity-100"
            )}>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={({ isActive }) =>
                    twMerge(
                      clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative select-none',
                        isActive 
                          ? 'bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-500 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]' 
                          : 'text-slate-400 border-l-2 border-transparent hover:text-white hover:bg-white/5 hover:border-slate-600',
                        !effectiveIsOpen && 'justify-center px-0 py-3 border-l-0'
                      )
                    )
                  }
                >
                  <div className="relative flex items-center justify-center">
                      <item.icon 
                        size={18} 
                        className={clsx(
                          "min-w-[18px] transition-all duration-200", 
                          !effectiveIsOpen && "mx-auto",
                          hoveredItem === item.path && "text-indigo-300 scale-110"
                        )} 
                      />
                  </div>
                  
                  <span className={clsx(
                    "whitespace-nowrap transition-all duration-200 text-sm font-medium tracking-wide", 
                    !effectiveIsOpen && "w-0 opacity-0 scale-0 hidden",
                  )}>
                      {item.label}
                  </span>
                  
                  {!effectiveIsOpen && (
                      <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-slate-200 text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10 translate-x-1 group-hover:translate-x-0 duration-200">
                          {item.label}
                      </div>
                  )}
                </NavLink>
              ))}
            </div>
            
            {!effectiveIsOpen && <div className="h-px mx-2 my-4 bg-white/5" />}
          </div>
        ))}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-3 mx-2 mb-2 border-t border-white/5">
        <button 
          onClick={logout}
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all group relative",
            !effectiveIsOpen && 'justify-center px-0'
          )}
        >
          <LogOut size={18} className="min-w-[18px]" />
          <span className={clsx("whitespace-nowrap transition-all duration-300 text-sm font-medium", !effectiveIsOpen && "w-0 opacity-0 hidden")}>Sign Out</span>
           
           {!effectiveIsOpen && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-rose-400 text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-rose-500/20">
                    Sign Out
                </div>
            )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
