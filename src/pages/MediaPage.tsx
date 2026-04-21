import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { Play } from 'lucide-react'; // Switched to Play for standard solid triangle

export default function MediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbService.list('media').then(data => {
      setMedia(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center p-12 text-text-muted">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8 md:mt-16 pb-24">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 uppercase tracking-wider">Media Gallery</h1>
        <p className="text-sm text-text-muted">Explore trailers and animation adaptations of your favorite series.</p>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {media.map((m, idx) => {
          const aspectClasses = ['aspect-[4/3]', 'aspect-[3/4]', 'aspect-video', 'aspect-square'];
          const aspect = aspectClasses[idx % aspectClasses.length];

          return (
            <div key={m.id} className="break-inside-avoid group bg-bg-surface rounded-2xl overflow-hidden border border-bg-elevated hover:border-primary/50 transition-all flex flex-col relative w-full mb-6">
               <a 
                 href={m.videoUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className={`w-full relative overflow-hidden bg-[#0b0c10] block ${aspect}`}
               >
                  <img src={m.thumbnail} alt={m.title} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                     <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-primary text-primary flex items-center justify-center shadow-[0_0_20px_rgba(var(--color-primary),0.5)] bg-black/50 backdrop-blur-sm group-hover:bg-primary group-hover:text-white transition-all duration-300 transform scale-75 group-hover:scale-100">
                       <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-1" fill="currentColor" />
                     </div>
                  </div>
               </a>
               <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                   <h3 className="font-bold text-xs sm:text-sm text-white mb-1 line-clamp-2 drop-shadow-md">{m.title}</h3>
                   <span className="inline-block px-2 py-0.5 bg-primary text-white text-[9px] rounded uppercase font-bold tracking-widest shadow-sm">{m.type || 'Video'}</span>
               </div>
            </div>
          );
        })}
      </div>
      {media.length === 0 && (
         <div className="p-12 text-center text-text-muted bg-bg-surface border border-bg-elevated rounded-2xl">
            No media available yet.
         </div>
      )}
    </div>
  );
}
