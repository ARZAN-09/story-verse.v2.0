import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbService } from '../services/db';

export default function CharacterPage() {
  const { id } = useParams();
  const [character, setCharacter] = useState<any>(null);
  const [novel, setNovel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      dbService.get('characters', id).then(c => {
        setCharacter(c);
        if (c.model3DUrl) {
            dbService.get('novels', c.model3DUrl).then(n => {
                setNovel(n);
            }).catch(() => {});
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="text-center p-12 text-text-muted">Loading...</div>;
  if (!character) return <div className="text-center p-12 text-text-muted">Character not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 mt-8 md:mt-16 pb-24">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 bg-bg-surface p-6 md:p-12 border border-bg-elevated rounded-2xl relative overflow-hidden shadow-2xl">
        
        {/* Glow effect matching design on the image */}
        <div className="w-full md:w-[280px] flex-shrink-0 z-10">
          <div className="rounded-xl overflow-hidden aspect-[3/4] border border-[#333] shadow-lg bg-[#0b0c10]">
             {character.image ? (
               <img src={character.image} alt={character.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-[#111] text-[#555] uppercase text-sm font-bold tracking-widest min-h-[300px]">No Image</div>
             )}
          </div>
        </div>
        
        <div className="flex-1 z-10 flex flex-col pt-4">
          {novel && (
              <p className="text-[#3498db] text-[12px] font-black uppercase tracking-[0.2em] mb-2">{novel.title}</p>
          )}
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 uppercase tracking-wide">{character.name}</h1>
          <div className="text-[#a0a0a0] text-[15px] leading-relaxed whitespace-pre-wrap mb-8">
            {character.description || 'No specific character description is available yet.'}
          </div>
          
          <div className="mt-auto pt-6 border-t border-[#333]">
             {character.model3DUrl ? (
                <div className="flex flex-col sm:flex-row gap-3">
                   <Link 
                      to={`/novel/${character.model3DUrl}/wiki?tab=world`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:border-[#4caf50] text-[#4caf50] py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all"
                   >
                      World Factions <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                   </Link>
                   <Link 
                      to={`/novel/${character.model3DUrl}/wiki?tab=power`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:border-[#e67e22] text-[#e67e22] py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all"
                   >
                      Power System <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                   </Link>
                </div>
             ) : (
                <div className="text-center text-[#666] text-xs uppercase tracking-widest font-bold">
                   Not linked to a specific novel.
                </div>
             )}
          </div>
        </div>
        
        {/* Decorative blur */}
        <div className="absolute right-0 top-0 h-full w-[400px] opacity-[0.03] bg-[#3498db] blur-[100px] pointer-events-none rounded-full" />
      </div>
    </div>
  );
}
