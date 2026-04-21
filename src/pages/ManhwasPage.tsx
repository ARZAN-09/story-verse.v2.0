import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { Link } from 'react-router-dom';

export default function ManhwasPage() {
  const [manhwas, setManhwas] = useState<any[]>([]);
  const [novels, setNovels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dbService.list('manhwa'),
      dbService.list('novels')
    ]).then(([m, n]) => {
      // Sort to show latest chapter numbers or creations
      m.sort((a,b) => b.chapterNumber - a.chapterNumber);
      setManhwas(m);
      setNovels(n);
      setLoading(false);
    });
    window.scrollTo(0,0);
  }, []);

  if (loading) return <div className="text-center p-12 text-text-muted">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8 md:mt-16 pb-24">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 uppercase tracking-wider">Manhwa Library</h1>
        <p className="text-sm text-text-muted">Read the latest illustrated chapters of your favorite series.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {manhwas.map(m => {
           const novel = novels.find(n => n.id === m.novelId);
           // Try to use the first image of the manhwa as cover, or fallback to the novel's cover
           let cover = novel?.coverImage || '';
           if (m.images) {
             const imagesArray = Array.isArray(m.images) ? m.images : (typeof m.images === 'string' ? m.images.split(',') : []);
             if (imagesArray.length > 0 && imagesArray[0]) cover = imagesArray[0].trim();
           }

           return (
             <Link key={m.id} to={`/manhwa/${m.id}`} className="group bg-bg-surface border border-bg-elevated rounded-2xl overflow-hidden hover:border-primary/50 transition-colors flex flex-col">
               <div className="aspect-[3/4] overflow-hidden bg-[#0b0c10] relative">
                  {cover && <img src={cover} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                    Ch. {m.chapterNumber}
                  </div>
               </div>
               <div className="p-4 flex flex-col justify-center">
                 <h3 className="text-white font-bold text-sm mb-1 group-hover:text-primary transition-colors truncate">{m.title}</h3>
                 <p className="text-xs text-text-muted truncate">{novel?.title || 'Unknown Novel'}</p>
               </div>
             </Link>
           );
        })}
      </div>
      {manhwas.length === 0 && (
         <div className="p-12 text-center text-text-muted bg-bg-surface border border-bg-elevated rounded-2xl">
            No manhwa chapters available yet.
         </div>
      )}
    </div>
  );
}
