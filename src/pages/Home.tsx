import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { Link } from 'react-router-dom';

export default function Home() {
  const [novels, setNovels] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const novelsData = await dbService.list('novels');
        const chaptersData = await dbService.list('chapters');
        
        // Sort chapters globally to get latest
        chaptersData.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        setNovels(novelsData);
        setChapters(chaptersData.slice(0, 5)); // display latest 5
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Cycle the hero banner every 5 seconds
  useEffect(() => {
    if (novels.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % Math.min(novels.length, 5));
    }, 5000);
    return () => clearInterval(interval);
  }, [novels.length]);

  if (loading) return <div className="text-center p-12 text-text-muted">Loading...</div>;

  const featuredNovels = novels.slice(0, 5);
  const heroNovel = featuredNovels.length > 0 ? featuredNovels[heroIndex] : null;

  // Extract all unique genres
  const allGenres = Array.from(new Set(novels.flatMap(n => n.genres || []))).filter(Boolean) as string[];
  
  const filteredNovels = activeGenre ? novels.filter(n => (n.genres || []).includes(activeGenre)) : novels;

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6 md:mt-12 space-y-12 pb-12 overflow-x-hidden">
      
      {/* Featured Banner Carousel */}
      {heroNovel && (
        <div className="relative rounded-2xl overflow-hidden glow-box bg-bg-surface flex flex-col md:flex-row h-auto md:h-96 w-full mb-12 border border-primary/30 transition-all duration-700">
          <div className="p-8 md:p-16 z-10 flex flex-col justify-center w-full md:w-1/2 min-h-[300px]">
             <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 bg-primary/10 w-max px-3 py-1 rounded-full border border-primary/20">Featured</span>
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 shadow-black drop-shadow-md line-clamp-2 md:line-clamp-none">{heroNovel.title}</h1>
             <p className="text-sm text-text-muted mb-8 line-clamp-2 md:line-clamp-3 max-w-lg">{heroNovel.description}</p>
             <div className="flex gap-4 items-center">
               <Link to={`/novel/${heroNovel.id}`} className="filled-pill inline-block text-center uppercase tracking-widest text-xs px-8 py-3">
                 Read Now
               </Link>
             </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-full md:w-2/3 object-cover opacity-30 md:opacity-80">
            <img key={heroNovel.id} src={heroNovel.coverImage} alt={heroNovel.title} className="w-full h-full object-cover animate-[fadeIn_0.5s_ease-out]" style={{ maskImage: 'linear-gradient(to right, transparent, black 40%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }} referrerPolicy="no-referrer" />
          </div>
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {featuredNovels.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setHeroIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${idx === heroIndex ? 'w-8 bg-primary' : 'w-2 bg-text-muted/50 hover:bg-text-muted'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Latest Chapters - Left Side */}
        <div className="w-full lg:w-1/3 flex flex-col order-2 lg:order-1">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Latest Chapters</h2>
          </div>
          
          <div className="flex flex-col rounded-xl overflow-hidden bg-bg-surface border border-bg-elevated">
            {chapters.length === 0 ? (
              <div className="p-6 text-text-muted text-sm text-center">No chapters yet.</div>
            ) : (
              chapters.map((ch, idx) => {
                const parentNovel = novels.find(n => n.id === ch.novelId);
                return (
                  <Link key={ch.id} to={`/chapter/${ch.id}`} className="flex items-center justify-between p-4 border-b border-bg-elevated hover:bg-bg-elevated transition-colors last:border-b-0 group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded bg-[#0b0c10] overflow-hidden flex-shrink-0">
                         {parentNovel && <img src={parentNovel.coverImage} alt="novel" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" referrerPolicy="no-referrer" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">Chapter {ch.chapterNumber}</span>
                        <span className="text-[10px] sm:text-xs text-text-muted line-clamp-1 max-w-[120px] sm:max-w-xs">{parentNovel?.title || 'Unknown Novel'}</span>
                      </div>
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-text-muted bg-bg-surface border border-bg-elevated px-2 py-1 rounded hidden sm:inline-block">NEW</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Popular Novels Grid - Right Side */}
        <div className="w-full lg:w-2/3 flex flex-col order-1 lg:order-2">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4">
             <h2 className="text-lg font-bold text-white uppercase tracking-wider">Library</h2>
             
             {/* Genre Filters Scrollable */}
             <div className="flex gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1">
               <button 
                 onClick={() => setActiveGenre(null)} 
                 className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider border transition-colors ${!activeGenre ? 'bg-primary text-white border-primary' : 'bg-bg-surface text-text-muted border-bg-elevated hover:border-text-muted'}`}
               >
                 All
               </button>
               {allGenres.map(genre => (
                 <button 
                   key={genre}
                   onClick={() => setActiveGenre(genre)} 
                   className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider border transition-colors ${activeGenre === genre ? 'bg-primary text-white border-primary' : 'bg-bg-surface text-text-muted border-bg-elevated hover:border-text-muted'}`}
                 >
                   {genre}
                 </button>
               ))}
             </div>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
             {filteredNovels.length === 0 ? (
                <div className="col-span-full py-12 text-center text-text-muted">No novels found for this genre.</div>
             ) : (
               filteredNovels.map(novel => (
                 <Link key={novel.id} to={`/novel/${novel.id}`} className="group flex flex-col p-3 bg-bg-surface border border-bg-elevated rounded-xl hover:border-primary/50 transition-colors">
                   <div className="aspect-[2/3] rounded-lg overflow-hidden relative mb-3 bg-[#0b0c10]">
                     <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                   </div>
                   <h3 className="font-semibold text-xs sm:text-sm text-white truncate group-hover:text-primary transition-colors mb-1">{novel.title}</h3>
                   <div className="flex gap-1 overflow-hidden mt-1">
                     {novel.genres?.slice(0, 2).map((g: string) => (
                       <span key={g} className="text-[9px] px-1.5 py-[1px] bg-bg-elevated text-text-muted rounded truncate">{g}</span>
                     ))}
                   </div>
                 </Link>
               ))
             )}
           </div>
        </div>

      </div>
    </div>
  );
}
