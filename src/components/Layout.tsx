import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, CalendarPlus, BarChart2, Activity } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: 'dashboard' | 'checkin' | 'analysis';
  setView: (view: 'dashboard' | 'checkin' | 'analysis') => void;
}

export function Layout({ children, activeView, setView }: LayoutProps) {
  const { logOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-natural-bg font-sans text-natural-text pb-20 md:pb-0">
      <header className="fixed top-0 w-full bg-natural-bg/80 backdrop-blur-md border-b border-[#E5E5DC] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-natural-accent flex items-center justify-center text-white shadow-sm">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-serif font-medium text-[#5C634D] leading-tight">Müdigkeits-Tracker</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 mr-4">
              <div className="text-right">
                <span className="block text-[10px] uppercase tracking-widest text-[#A8A89A]">Nutzer</span>
                <span className="text-xs font-semibold text-[#7A8C69]">{user?.displayName}</span>
              </div>
              <img src={user?.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-white" />
            </div>
            <button
              onClick={logOut}
              className="p-2 text-natural-muted hover:text-natural-accent transition-colors"
              title="Abmelden"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        {children}
        <div className="mt-20 py-8 text-center border-t border-[#E5E5DC]/30">
          <span className="text-[10px] uppercase tracking-widest text-natural-muted/40 font-bold">Version 1.0.4</span>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-[#E5E5DC] py-4 px-6 flex justify-around sm:hidden z-50">
        <button
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center gap-1.5 transition-colors ${activeView === 'dashboard' ? 'text-natural-accent' : 'text-natural-muted'}`}
        >
          <LayoutDashboard size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
        </button>
        <button
          onClick={() => setView('analysis')}
          className={`flex flex-col items-center gap-1.5 transition-colors ${activeView === 'analysis' ? 'text-natural-accent' : 'text-natural-muted'}`}
        >
          <BarChart2 size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Analyse</span>
        </button>
        <button
          onClick={() => setView('checkin')}
          className={`flex flex-col items-center gap-1.5 transition-colors ${activeView === 'checkin' ? 'text-natural-accent' : 'text-natural-muted'}`}
        >
          <CalendarPlus size={22} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Check-in</span>
        </button>
      </nav>

      <div className="hidden sm:flex fixed left-0 top-1/2 -translate-y-1/2 ml-8 flex-col gap-6">
        <button
          onClick={() => setView('dashboard')}
          className={`group flex items-center gap-4 ${activeView === 'dashboard' ? 'text-natural-accent' : 'text-natural-muted'}`}
        >
          <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center transition-all duration-300 ${activeView === 'dashboard' ? 'bg-natural-accent text-white shadow-md' : 'bg-white border border-[#E5E5DC] text-natural-muted hover:border-natural-accent'}`}>
            <LayoutDashboard size={22} />
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#5C634D] text-white text-[10px] uppercase tracking-widest py-1.5 px-3 rounded-lg whitespace-nowrap">
            Übersicht
          </span>
        </button>
        <button
          onClick={() => setView('analysis')}
          className={`group flex items-center gap-4 ${activeView === 'analysis' ? 'text-natural-accent' : 'text-natural-muted'}`}
        >
          <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center transition-all duration-300 ${activeView === 'analysis' ? 'bg-natural-accent text-white shadow-md' : 'bg-white border border-[#E5E5DC] text-natural-muted hover:border-natural-accent'}`}>
            <BarChart2 size={22} />
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#5C634D] text-white text-[10px] uppercase tracking-widest py-1.5 px-3 rounded-lg whitespace-nowrap">
            Analyse
          </span>
        </button>
        <button
          onClick={() => setView('checkin')}
          className={`group flex items-center gap-4 ${activeView === 'checkin' ? 'text-natural-accent' : 'text-natural-muted'}`}
        >
          <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center transition-all duration-300 ${activeView === 'checkin' ? 'bg-natural-accent text-white shadow-md' : 'bg-white border border-[#E5E5DC] text-natural-muted hover:border-natural-accent'}`}>
            <CalendarPlus size={22} />
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#5C634D] text-white text-[10px] uppercase tracking-widest py-1.5 px-3 rounded-lg whitespace-nowrap">
            Check-In
          </span>
        </button>
      </div>
    </div>
  );
}
