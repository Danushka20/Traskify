import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { clsx } from 'clsx';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Default to closed on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return false;
    }
    const saved = localStorage.getItem('sidebar-open');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebar-open', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  const handleOverlayClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={handleOverlayClick}
        />
      )}
      
      {/* Sidebar - hidden on mobile unless menu is open */}
      <div className={clsx(
        "lg:block",
        isMobileMenuOpen ? "block" : "hidden"
      )}>
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onMobileClose={() => setIsMobileMenuOpen(false)}
          isMobile={isMobileMenuOpen}
        />
      </div>
      
      <div className={clsx(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ml-0",
        isSidebarOpen ? "lg:ml-72" : "lg:ml-20"
      )}>
        <Navbar onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
