import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Book, Layers, GitMerge, FileText, Image, Users, Film, LogOut, Zap, Globe } from 'lucide-react';
import { supabase } from '../services/supabase';
import AdminSearch from './AdminSearch';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: Home },
  { path: '/admin/novels', label: 'Novels', icon: Book },
  { path: '/admin/volumes', label: 'Volumes', icon: Layers },
  { path: '/admin/arcs', label: 'Arcs', icon: GitMerge },
  { path: '/admin/chapters', label: 'Chapters', icon: FileText },
  { path: '/admin/manhwa', label: 'Manhwa', icon: Image },
  { path: '/admin/characters', label: 'Characters', icon: Users },
  { path: '/admin/powers', label: 'Power Sys', icon: Zap },
  { path: '/admin/world', label: 'World Sys', icon: Globe },
  { path: '/admin/media', label: 'Media', icon: Film },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col lg:flex-row max-w-[1400px] mx-auto px-4 mt-8 md:mt-16 gap-6 h-auto lg:h-[80vh] pb-16">
      <aside className="w-full lg:w-64 flex-shrink-0 h-auto lg:h-full">
        <div className="bg-bg-surface rounded-2xl p-4 h-full border border-bg-elevated flex flex-col">
          <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4 px-4 pl-3 hidden lg:block">Novelverse</h2>
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 flex-1 no-scrollbar items-center lg:items-stretch">
            {navItems.map((item) => {
              const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 lg:gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-semibold whitespace-nowrap border ${
                    active ? 'bg-[#1a1b26] border-primary/30 text-primary glow-box-purple' : 'border-transparent text-text-muted hover:bg-bg-elevated hover:text-white'
                  }`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 lg:mt-auto pt-4 border-t border-bg-elevated px-2 hidden lg:block">
            <button 
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-3 px-3 py-2 text-xs text-text-muted hover:text-red-400 transition-colors w-full text-left font-semibold rounded-xl hover:bg-bg-elevated"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 bg-bg-surface rounded-2xl p-4 sm:p-6 md:p-10 border border-bg-elevated min-h-[500px] lg:h-full overflow-y-auto">
        <AdminSearch />
        <Outlet />
      </main>
    </div>
  );
}
