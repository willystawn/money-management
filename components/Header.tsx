import React, { useState } from 'react';
import { View } from '../types';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
}

const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90V10Z" fill="url(#h_paint0_linear)"/>
      <path d="M50 10C72.0914 10 90 27.9086 90 50C90 72.0914 72.0914 90 50 90V10Z" fill="url(#h_paint1_linear)" fillOpacity="0.7"/>
      <defs>
        <linearGradient id="h_paint0_linear" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1"/> <stop offset="1" stopColor="#3B82F6"/>
        </linearGradient>
        <linearGradient id="h_paint1_linear" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A5B4FC"/> <stop offset="1" stopColor="#60A5FA"/>
        </linearGradient>
      </defs>
    </svg>
  );

const Icons = {
    Dashboard: ({className}:{className?:string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    History: ({className}:{className?:string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Accounts: ({className}:{className?:string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" /></svg>,
    Budget: ({className}:{className?:string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15zm0 0v7.5m0 0h7.5m-7.5 0L21 12a9 9 0 11-9-9v9z" /></svg>,
    Profile: ({className}:{className?:string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Logout: ({className}:{className?:string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>,
    Menu: ({className}:{className?:string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>,
    Close: ({className}:{className?:string}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
};


const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const baseLinkClasses = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200";
  const activeLinkClasses = "bg-blue-600/30 text-blue-300 shadow-inner shadow-blue-900/50 ring-1 ring-blue-500/30";
  const inactiveLinkClasses = "text-gray-400 hover:bg-gray-700/50 hover:text-white";

  const navItems = [
    { view: View.DASHBOARD, label: "Dashboard", icon: Icons.Dashboard },
    { view: View.HISTORY, label: "Riwayat", icon: Icons.History },
    { view: View.ACCOUNTS, label: "Akun", icon: Icons.Accounts },
    { view: View.BUDGET, label: "Budget", icon: Icons.Budget },
    { view: View.PROFILE, label: "Profil", icon: Icons.Profile },
  ];

  const NavButton = ({ item, isMobile }: { item: typeof navItems[0], isMobile?: boolean }) => (
     <button
        onClick={() => {
            setCurrentView(item.view);
            if (isMobile) setIsMobileMenuOpen(false);
        }}
        className={`${baseLinkClasses} ${currentView === item.view ? activeLinkClasses : inactiveLinkClasses} ${isMobile ? 'w-full justify-start' : ''}`}
        aria-current={currentView === item.view ? 'page' : undefined}
    >
        <item.icon className="h-5 w-5" />
        {item.label}
    </button>
  );

  return (
    <header className="bg-gray-900/70 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Logo className="h-10 w-10" />
            <h1 className="text-xl font-bold text-gray-100 ml-3 hidden sm:block">Manajer Keuangan</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-2">
             {navItems.map(item => <NavButton key={item.view} item={item} />)}
          </nav>
          <div className="flex items-center gap-2">
            <button
                onClick={onLogout}
                className={`${baseLinkClasses} ${inactiveLinkClasses}`}
                aria-label="Keluar"
            >
                <Icons.Logout className="h-5 w-5" />
                <span className="hidden md:inline">Keluar</span>
            </button>
            <div className="md:hidden">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`${baseLinkClasses} ${inactiveLinkClasses}`} aria-label="Buka Menu">
                    {isMobileMenuOpen ? <Icons.Close className="h-6 w-6"/> : <Icons.Menu className="h-6 w-6"/>}
                </button>
            </div>
          </div>
        </div>
      </div>
       {isMobileMenuOpen && (
         <div className="md:hidden bg-gray-900 border-t border-gray-800 animate-fade-in">
           <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map(item => <NavButton key={item.view} item={item} isMobile/>)}
           </div>
        </div>
       )}
    </header>
  );
};

export default Header;