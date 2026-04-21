import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { Link, useLocation } from 'react-router-dom';

export default function CharactersPage() {
  const [allCharacters, setAllCharacters] = useState<any[]>([]);
  const [allPowerSystems, setAllPowerSystems] = useState<any[]>([]);
  const [allWorldSystems, setAllWorldSystems] = useState<any[]>([]);
  const [novels, setNovels] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedChar, setSelectedChar] = useState<any | null>(null);
  const [charTab, setCharTab] = useState<'about' | 'appearance' | 'personality' | 'history' | 'relationships'>('about');
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialMainTab = (queryParams.get('tab') as 'characters' | 'power' | 'world') || 'characters';
  const filterNovelId = queryParams.get('novelId');
  
  const [mainTab, setMainTab] = useState<'characters' | 'power' | 'world'>(initialMainTab);

  const characters = filterNovelId ? allCharacters.filter(c => c.model3DUrl === filterNovelId) : allCharacters;
  const powerSystems = filterNovelId ? allPowerSystems.filter(c => c.model3DUrl === filterNovelId) : allPowerSystems;
  const worldSystems = filterNovelId ? allWorldSystems.filter(w => w.model3DUrl === filterNovelId) : allWorldSystems;

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab') as 'characters' | 'power' | 'world';
    if (tab) setMainTab(tab);
  }, [location.search]);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const chars = await dbService.list('characters');
      const powers = await dbService.list('power_systems');
      const worlds = await dbService.list('world_systems');
      const novs = await dbService.list('novels');
      
      const novelMap: Record<string, any> = {};
      novs.forEach(n => novelMap[n.id] = n);

      setNovels(novelMap);
      setAllCharacters(chars);
      setAllPowerSystems(powers);
      setAllWorldSystems(worlds);
      setLoading(false);
    }
    loadAll();
  }, []);

  if (loading) return <div className="text-center p-12 text-text-muted">Loading data...</div>;

  return (
    <div className="max-w-[1200px] mx-auto px-4 mt-8 md:mt-12 pb-24 font-sans relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
        <div>
           <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest text-shadow">
              {!filterNovelId ? 'Compendium' : mainTab === 'characters' ? 'Characters' : mainTab === 'power' ? 'Power Systems' : 'World Systems'}
           </h1>
           {filterNovelId && novels[filterNovelId] && (
              <div className="mt-3 flex items-center gap-3">
                 <span className="bg-[#1a1c23] px-3 py-1.5 rounded-lg text-xs font-bold text-primary uppercase tracking-widest border border-[#333]">
                    {novels[filterNovelId].title}
                 </span>
                 <Link to={`/characters`} className="text-[#666] hover:text-white text-xs font-bold uppercase transition-colors">
                    Clear Filter ✕
                 </Link>
              </div>
           )}
        </div>
        {filterNovelId && (
          <div className="flex bg-[#12141a] p-1.5 rounded-xl border border-[#1f222b]">
             <button 
                onClick={() => { setMainTab('characters'); window.history.replaceState(null, '', `?tab=characters${filterNovelId ? `&novelId=${filterNovelId}` : ''}`); }}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${mainTab === 'characters' ? 'bg-primary text-white shadow-lg' : 'text-[#888] hover:text-white hover:bg-[#1a1c23]'}`}
             >
                Characters
             </button>
             <button 
                onClick={() => { setMainTab('world'); window.history.replaceState(null, '', `?tab=world${filterNovelId ? `&novelId=${filterNovelId}` : ''}`); }}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${mainTab === 'world' ? 'bg-[#4caf50] text-white shadow-lg' : 'text-[#888] hover:text-white hover:bg-[#1a1c23]'}`}
             >
                World
             </button>
             <button 
                onClick={() => { setMainTab('power'); window.history.replaceState(null, '', `?tab=power${filterNovelId ? `&novelId=${filterNovelId}` : ''}`); }}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${mainTab === 'power' ? 'bg-[#e67e22] text-white shadow-lg' : 'text-[#888] hover:text-white hover:bg-[#1a1c23]'}`}
             >
                Powers
             </button>
          </div>
        )}
      </div>

      {!filterNovelId ? (
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 tracking-wide">
            {Object.values(novels).map(novel => (
               <Link 
                  key={novel.id} 
                  to={`/characters?tab=characters&novelId=${novel.id}`}
                  className="group block relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer shadow-xl border border-[#333] hover:border-primary transition-all duration-300"
               >
                  {novel.coverImage ? (
                     <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-[#111] p-6 text-center">
                        <span className="text-xl font-bold text-[#555] uppercase tracking-widest leading-relaxed">{novel.title}</span>
                     </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 p-5 w-full">
                     <h3 className="text-lg font-black text-white uppercase tracking-wider group-hover:text-primary transition-colors text-shadow line-clamp-2 leading-tight">{novel.title}</h3>
                     <p className="text-[10px] sm:text-xs font-bold text-primary mt-2 uppercase tracking-widest bg-[#0b0c10]/80 backdrop-blur-sm inline-block px-3 py-1.5 rounded-lg border border-primary/30">View Compendium</p>
                  </div>
               </Link>
            ))}
            {Object.values(novels).length === 0 && (
               <div className="col-span-full p-12 text-center text-[#888] bg-[#1c1c1c] border border-[#333] rounded-xl font-medium uppercase tracking-widest text-xs">
                  No novels found.
               </div>
            )}
         </div>
      ) : (
         <>
            {mainTab === 'characters' && (
         <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {characters.map(char => (
                <div 
                   key={char.id} 
                   onClick={() => setSelectedChar(char)}
                   className="group relative block aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-[#333] hover:border-primary transition-all duration-300"
                >
                   {char.image ? (
                      <img src={char.image} alt={char.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#111] text-[#555] uppercase text-xs font-bold tracking-widest">No Image</div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
                   <div className="absolute bottom-0 left-0 p-4 sm:p-6 w-full">
                      <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider group-hover:text-primary transition-colors">{char.name}</h3>
                   </div>
                </div>
              ))}
            </div>
            
            {characters.length === 0 && (
               <div className="p-12 text-center text-[#888] bg-[#1c1c1c] border border-[#333] rounded-xl font-medium">
                  No characters available yet.
               </div>
            )}
         </>
      )}

      {mainTab === 'world' && (
         <div className="flex flex-col gap-6">
            {worldSystems.length === 0 && <div className="p-12 text-center text-[#888] bg-[#1c1c1c] border border-[#333] rounded-xl font-medium">No world records available yet.</div>}
            {worldSystems.map(sys => (
               <div key={sys.id} className="bg-[#12141a] border border-[#1f222b] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-lg">
                  {sys.image && (
                     <div className="md:w-[350px] flex-shrink-0 bg-[#0b0c10] min-h-[250px] relative border-b md:border-b-0 md:border-r border-[#1f222b]">
                       <img src={sys.image} alt={sys.name} className="w-full h-full object-cover absolute inset-0" referrerPolicy="no-referrer" />
                     </div>
                  )}
                  <div className="p-8 flex-1 flex flex-col">
                     {sys.model3DUrl && novels[sys.model3DUrl] && (
                        <span className="text-xs font-bold uppercase tracking-widest text-[#4caf50] mb-2">{novels[sys.model3DUrl].title}</span>
                     )}
                     <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-wider">{sys.name}</h3>
                     <div className="text-[#a0a0a0] text-[15px] leading-relaxed whitespace-pre-wrap flex-1">
                        {sys.description}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}

      {mainTab === 'power' && (
         <div className="flex flex-col gap-6">
            {powerSystems.length === 0 && <div className="p-12 text-center text-[#888] bg-[#1c1c1c] border border-[#333] rounded-xl font-medium">No power systems available yet.</div>}
            {powerSystems.map(sys => (
               <div key={sys.id} className="bg-[#12141a] border border-[#1f222b] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-lg">
                  {sys.image && (
                     <div className="md:w-[350px] flex-shrink-0 bg-[#0b0c10] min-h-[250px] relative border-b md:border-b-0 md:border-r border-[#1f222b]">
                       <img src={sys.image} alt={sys.name} className="w-full h-full object-cover absolute inset-0" referrerPolicy="no-referrer" />
                     </div>
                  )}
                  <div className="p-8 flex-1 flex flex-col">
                     {sys.model3DUrl && novels[sys.model3DUrl] && (
                        <span className="text-xs font-bold uppercase tracking-widest text-[#e67e22] mb-2">{novels[sys.model3DUrl].title}</span>
                     )}
                     <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-wider">{sys.name}</h3>
                     <div className="text-[#a0a0a0] text-[15px] leading-relaxed whitespace-pre-wrap flex-1">
                        {sys.description}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}
      </>
   )}

      {/* Pop-up Character Panel */}
      {selectedChar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md" onClick={() => setSelectedChar(null)}>
           <div 
              className="bg-[#141414] border border-[#333] rounded-2xl w-full max-w-[800px] h-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
           >
              <button 
                 onClick={() => setSelectedChar(null)} 
                 className="absolute top-3 right-3 md:top-4 md:right-4 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                 aria-label="Close"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              
              <div className="w-full md:w-[320px] shrink-0 relative bg-[#0b0c10] md:border-r border-[#333] overflow-hidden">
                 {selectedChar.image ? (
                    <img src={selectedChar.image} className="w-full h-auto max-h-[40vh] md:max-h-full md:h-full object-cover object-top aspect-[3/4] md:absolute md:inset-0" referrerPolicy="no-referrer" alt={selectedChar.name} />
                 ) : (
                    <div className="w-full h-[40vh] md:h-full aspect-[3/4] flex items-center justify-center text-[#555] uppercase text-sm font-bold tracking-widest md:absolute md:inset-0">No Image</div>
                 )}
                 <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#141414] to-transparent md:hidden" />
              </div>

              <div className="w-full flex-1 p-6 md:p-8 flex flex-col items-start h-full">
                 <div className="mb-6 w-full flex-shrink-0">
                        {selectedChar.model3DUrl && novels[selectedChar.model3DUrl] && (
                           <p className="text-[#3498db] text-[11px] font-black uppercase tracking-[0.2em] mb-2">{novels[selectedChar.model3DUrl].title}</p>
                        )}
                        <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-wider">{selectedChar.name}</h3>
                        
                        {/* Sub-tabs for Character Detail */}
                        <div className="flex gap-4 mt-6 border-b border-[#333] w-full overflow-x-auto no-scrollbar pb-1">
                           <button 
                              onClick={() => setCharTab('about')}
                              className={`pb-2 text-[11px] whitespace-nowrap font-bold tracking-widest uppercase transition-colors border-b-2 ${charTab === 'about' ? 'text-white border-white' : 'text-[#555] border-transparent hover:text-[#888]'}`}
                           >
                              About
                           </button>
                           {(selectedChar.appearance || selectedChar.stats?.appearance) && (
                              <button 
                                 onClick={() => setCharTab('appearance')}
                                 className={`pb-2 text-[11px] whitespace-nowrap font-bold tracking-widest uppercase transition-colors border-b-2 ${charTab === 'appearance' ? 'text-white border-white' : 'text-[#555] border-transparent hover:text-[#888]'}`}
                              >
                                 Appearance
                              </button>
                           )}
                           {(selectedChar.personality || selectedChar.stats?.personality) && (
                              <button 
                                 onClick={() => setCharTab('personality')}
                                 className={`pb-2 text-[11px] whitespace-nowrap font-bold tracking-widest uppercase transition-colors border-b-2 ${charTab === 'personality' ? 'text-white border-white' : 'text-[#555] border-transparent hover:text-[#888]'}`}
                              >
                                 Personality
                              </button>
                           )}
                           {(selectedChar.history || selectedChar.stats?.history) && (
                              <button 
                                 onClick={() => setCharTab('history')}
                                 className={`pb-2 text-[11px] whitespace-nowrap font-bold tracking-widest uppercase transition-colors border-b-2 ${charTab === 'history' ? 'text-white border-white' : 'text-[#555] border-transparent hover:text-[#888]'}`}
                              >
                                 History
                              </button>
                           )}
                           {(selectedChar.relationships || selectedChar.stats?.relationships) && (
                              <button 
                                 onClick={() => setCharTab('relationships')}
                                 className={`pb-2 text-[11px] whitespace-nowrap font-bold tracking-widest uppercase transition-colors border-b-2 ${charTab === 'relationships' ? 'text-white border-white' : 'text-[#555] border-transparent hover:text-[#888]'}`}
                              >
                                 Relations
                              </button>
                           )}
                        </div>
                     </div>

                     <div className="w-full flex-1 overflow-y-auto no-scrollbar pb-6 flex flex-col pr-2">
                        {charTab === 'about' && (
                           <div className="text-[#a0a0a0] text-[14px] leading-relaxed whitespace-pre-wrap pr-2">
                              {selectedChar.description || "No specific character description is available yet."}
                           </div>
                        )}
                        {charTab === 'appearance' && (
                           <div className="text-[#a0a0a0] text-[14px] leading-relaxed whitespace-pre-wrap pr-2">
                              {selectedChar.appearance || selectedChar.stats?.appearance}
                           </div>
                        )}
                        {charTab === 'personality' && (
                           <div className="text-[#a0a0a0] text-[14px] leading-relaxed whitespace-pre-wrap pr-2">
                              {selectedChar.personality || selectedChar.stats?.personality}
                           </div>
                        )}
                        {charTab === 'history' && (
                           <div className="text-[#a0a0a0] text-[14px] leading-relaxed whitespace-pre-wrap pr-2">
                              {selectedChar.history || selectedChar.stats?.history}
                           </div>
                        )}
                        {charTab === 'relationships' && (
                           <div className="text-[#a0a0a0] text-[14px] leading-relaxed whitespace-pre-wrap pr-2">
                              {selectedChar.relationships || selectedChar.stats?.relationships}
                           </div>
                        )}
                     </div>

                     {/* Links to Wiki / Novel Document */}
                 {selectedChar.model3DUrl ? (
                    <div className="flex flex-col flex-shrink-0 w-full sm:flex-row gap-3 pt-6 border-t border-[#333] mt-auto">
                       <Link 
                          onClick={() => setSelectedChar(null)}
                          to={`/characters?novelId=${selectedChar.model3DUrl}&tab=world`}
                          className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:border-[#4caf50] text-[#4caf50] py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all"
                       >
                          World Factions <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                       </Link>
                       <Link 
                          onClick={() => setSelectedChar(null)}
                          to={`/characters?novelId=${selectedChar.model3DUrl}&tab=power`}
                          className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:border-[#e67e22] text-[#e67e22] py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all"
                       >
                          Power System <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                       </Link>
                    </div>
                 ) : (
                    <div className="pt-6 border-t border-[#333] text-center text-[#666] text-xs uppercase tracking-widest font-bold mt-auto">
                       Not linked to a specific novel.
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
