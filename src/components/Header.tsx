import { useState } from 'react';
import { GraduationCap, ShieldAlert, Settings, LayoutDashboard, Search, FileText, HelpCircle, Menu, X, Landmark, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  activeTab: 'home' | 'register' | 'track' | 'faq' | 'admin' | 'verifikasi';
  setActiveTab: (tab: 'home' | 'register' | 'track' | 'faq' | 'admin' | 'verifikasi') => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
  isMaintenance: boolean;
}

export default function Header({ activeTab, setActiveTab, isAdminLoggedIn, onLogoutAdmin, isMaintenance }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'register', label: 'Pendaftaran', icon: FileText },
    { id: 'track', label: 'Cek Status', icon: Search },
    { id: 'faq', label: 'FAQ Interaktif', icon: HelpCircle },
    { id: 'admin', label: isAdminLoggedIn ? 'Admin Panel' : 'Login Admin', icon: isAdminLoggedIn ? LayoutDashboard : Settings },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-xs">
      {isMaintenance && (
        <div className="bg-amber-500 text-white text-xs px-4 py-1.5 flex items-center justify-center gap-2 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
          <span>Sistem dalam mode Pemeliharaan. Pengisian pendaftaran baru dinonaktifkan sementara.</span>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 text-white">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
                SMPN 1 Manonjaya
              </h1>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                Tasikmalaya • PPDB Online
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
            
            {isAdminLoggedIn && (
              <button
                onClick={onLogoutAdmin}
                className="ml-4 px-3.5 py-1.5 border border-red-200 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer transition-colors"
                id="btn-admin-logout"
              >
                Keluar Admin
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-b border-slate-100 bg-white px-4 pt-2 pb-6 space-y-1.5 shadow-lg"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-mobile-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left font-medium text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-150'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
          {isAdminLoggedIn && (
            <button
              onClick={() => {
                onLogoutAdmin();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left text-sm font-semibold text-red-500 hover:bg-red-50 cursor-pointer"
            >
              <X className="w-4 h-4 text-red-400" />
              Keluar Sesi Admin
            </button>
          )}
        </motion.div>
      )}
    </header>
  );
}
