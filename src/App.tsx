import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import NovelView from './pages/NovelView';
import ChapterReader from './pages/ChapterReader';
import ManhwaReader from './pages/ManhwaReader';
import ManhwasPage from './pages/ManhwasPage';
import CharactersPage from './pages/CharactersPage';
import CharacterPage from './pages/CharacterPage';
import MediaPage from './pages/MediaPage';
import NovelChaptersList from './pages/NovelChaptersList';

// Admin pages
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import ManageNovels from './admin/ManageNovels';
import ManageVolumes from './admin/ManageVolumes';
import ManageArcs from './admin/ManageArcs';
import ManageChapters from './admin/ManageChapters';
import ManageManhwa from './admin/ManageManhwa';
import ManageCharacters from './admin/ManageCharacters';
import ManagePowerSystems from './admin/ManagePowerSystems';
import ManageWorldSystems from './admin/ManageWorldSystems';
import ManageMedia from './admin/ManageMedia';

import { Book, LayoutDashboard, Database, Film, Users, Bell, User } from 'lucide-react';

function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0b0c10]/95 backdrop-blur border-b border-[#1f222b]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-sans font-extrabold text-white tracking-widest flex items-center gap-2">
          <span className="text-primary text-3xl">N</span>
          <span className="hidden sm:inline">OVELVERSE</span>
        </Link>
        <div className="hidden md:flex gap-8 items-center absolute left-1/2 transform -translate-x-1/2">
          <Link to="/" className="text-sm font-medium text-white border-b-2 border-primary pb-1">Home</Link>
          <Link to="/" className="text-sm font-medium text-text-muted hover:text-white transition-colors">Novels</Link>
          <Link to="/manhwa" className="text-sm font-medium text-text-muted hover:text-white transition-colors">Manhwa</Link>
          <Link to="/characters" className="text-sm font-medium text-text-muted hover:text-white transition-colors">Characters</Link>
          <Link to="/media" className="text-sm font-medium text-text-muted hover:text-white transition-colors">Media</Link>
        </div>
        <div className="flex gap-4 items-center">
           <Bell size={20} className="text-text-muted hover:text-white cursor-pointer" />
           <Link to="/admin" className="bg-bg-elevated p-1.5 rounded-full border border-[#334155] hover:border-primary transition-colors">
              <User size={18} className="text-primary" />
           </Link>
        </div>
      </div>
      {/* Mobile nav links */}
      <div className="md:hidden flex gap-4 overflow-x-auto px-4 py-3 border-t border-[#1f222b] bg-[#14161c] no-scrollbar">
          <Link to="/" className="text-xs font-medium text-white border-b-2 border-primary pb-1 whitespace-nowrap">Home</Link>
          <Link to="/" className="text-xs font-medium text-text-muted hover:text-white transition-colors whitespace-nowrap">Novels</Link>
          <Link to="/manhwa" className="text-xs font-medium text-text-muted hover:text-white transition-colors whitespace-nowrap">Manhwa</Link>
          <Link to="/characters" className="text-xs font-medium text-text-muted hover:text-white transition-colors whitespace-nowrap">Characters</Link>
          <Link to="/media" className="text-xs font-medium text-text-muted hover:text-white transition-colors whitespace-nowrap">Media</Link>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navigation />
        <main className="pt-16 pb-24 min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/novel/:id" element={<NovelView />} />
            <Route path="/novel/:id/chapters" element={<NovelChaptersList />} />
            <Route path="/chapter/:id" element={<ChapterReader />} />
            <Route path="/manhwa" element={<ManhwasPage />} />
            <Route path="/manhwa/:id" element={<ManhwaReader />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/character/:id" element={<CharacterPage />} />
            <Route path="/media" element={<MediaPage />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="novels" element={<ManageNovels />} />
                <Route path="volumes" element={<ManageVolumes />} />
                <Route path="arcs" element={<ManageArcs />} />
                <Route path="chapters" element={<ManageChapters />} />
                <Route path="manhwa" element={<ManageManhwa />} />
                <Route path="characters" element={<ManageCharacters />} />
                <Route path="powers" element={<ManagePowerSystems />} />
                <Route path="world" element={<ManageWorldSystems />} />
                <Route path="media" element={<ManageMedia />} />
              </Route>
            </Route>
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}
