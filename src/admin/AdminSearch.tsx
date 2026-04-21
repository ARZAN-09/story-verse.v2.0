import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { dbService } from '../services/db';
import { Link } from 'react-router-dom';

export default function AdminSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ novels: any[], chapters: any[], characters: any[] }>({ novels: [], chapters: [], characters: [] });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim().toLowerCase());
      } else {
        setResults({ novels: [], chapters: [], characters: [] });
        setIsOpen(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchStr: string) => {
    setIsLoading(true);
    setIsOpen(true);
    try {
      // Client-side filtering ensures we don't rely on external 3rd-party search capabilities / AI models.
      const [novels, chapters, characters] = await Promise.all([
        dbService.list('novels'),
        dbService.list('chapters'),
        dbService.list('characters')
      ]);

      const filteredNovels = novels.filter(n => n.title?.toLowerCase().includes(searchStr)).slice(0, 5);
      const filteredChapters = chapters.filter(c => c.title?.toLowerCase().includes(searchStr) || String(c.chapterNumber).includes(searchStr)).slice(0, 8);
      const filteredCharacters = characters.filter(c => c.name?.toLowerCase().includes(searchStr)).slice(0, 5);

      setResults({ novels: filteredNovels, chapters: filteredChapters, characters: filteredCharacters });
    } catch (error) {
      console.error("Search error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mb-8 z-50">
      <div className="relative flex items-center">
        <Search className="absolute left-4 text-text-muted w-4 h-4" />
        <input
          type="text"
          placeholder="GLOBAL SEARCH: Novels, Chapters, Characters..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim().length >= 2) setIsOpen(true); }}
          className="w-full bg-[#0b0c10] border border-bg-elevated rounded-xl pl-12 pr-10 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-text-muted/50 tracking-wider font-medium"
        />
        {isLoading ? (
          <Loader2 className="absolute right-4 text-primary w-4 h-4 animate-spin" />
        ) : query.length > 0 ? (
           <button onClick={clearSearch} className="absolute right-4 text-text-muted hover:text-white transition-colors">
              <X className="w-4 h-4" />
           </button>
        ) : null}
      </div>

      {isOpen && (query.trim().length >= 2) && (
        <div className="absolute top-full mt-2 w-full bg-[#14161c] border border-primary/30 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh] overflow-y-auto glow-box">
          {(!isLoading && results.novels.length === 0 && results.chapters.length === 0 && results.characters.length === 0) ? (
            <div className="p-6 text-center text-sm text-text-muted font-medium">No matches found for "{query}"</div>
          ) : (
            <div className="flex flex-col py-2">
              {results.novels.length > 0 && (
                <div className="pb-2 border-b border-bg-elevated/30 last:border-0">
                  <div className="px-4 py-2 text-[10px] font-bold text-primary uppercase tracking-widest bg-[#0b0c10]/50 xl:sticky top-0 z-10 backdrop-blur-md">Novels</div>
                  {results.novels.map(n => (
                    <Link key={n.id} to={`/admin/novels?edit=${n.id}`} onClick={() => setIsOpen(false)} className="block px-5 py-3 text-sm text-white hover:bg-bg-elevated hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary">
                      {n.title}
                    </Link>
                  ))}
                </div>
              )}
              {results.characters.length > 0 && (
                <div className="pb-2 border-b border-bg-elevated/30 last:border-0">
                  <div className="px-4 py-2 text-[10px] font-bold text-primary uppercase tracking-widest bg-[#0b0c10]/50 xl:sticky top-0 z-10 backdrop-blur-md">Characters</div>
                  {results.characters.map(c => (
                    <Link key={c.id} to={`/admin/characters?edit=${c.id}`} onClick={() => setIsOpen(false)} className="block px-5 py-3 text-sm text-white hover:bg-bg-elevated hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary">
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
              {results.chapters.length > 0 && (
                <div className="pb-2 last:border-0">
                  <div className="px-4 py-2 text-[10px] font-bold text-primary uppercase tracking-widest bg-[#0b0c10]/50 xl:sticky top-0 z-10 backdrop-blur-md">Chapters</div>
                  {results.chapters.map(c => (
                    <Link key={c.id} to={`/admin/chapters?edit=${c.id}`} onClick={() => setIsOpen(false)} className="block px-5 py-3 text-sm text-white hover:bg-bg-elevated hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary flex gap-2">
                      <span className="text-text-muted text-xs whitespace-nowrap">Ch {c.chapterNumber}:</span> <span className="truncate">{c.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
