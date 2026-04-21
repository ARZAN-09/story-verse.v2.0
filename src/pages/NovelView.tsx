import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';

export default function NovelView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [novel, setNovel] = useState<any>(null);
  const [volumes, setVolumes] = useState<any[]>([]);
  const [arcs, setArcs] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openVolume, setOpenVolume] = useState<string | null>(null);
  const [openArc, setOpenArc] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const n = await dbService.get('novels', id);
        setNovel(n);

        const v = await dbService.list('volumes', { novelId: id });
        const a = await dbService.list('arcs', { novelId: id });
        const c = await dbService.list('chapters', { novelId: id });

        v.sort((x,y) => x.volumeNumber - y.volumeNumber);
        c.sort((x,y) => x.chapterNumber - y.chapterNumber);

        setVolumes(v);
        setArcs(a);
        setChapters(c);
        if (v.length > 0) setOpenVolume(v[0].id);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center p-12 text-text-muted">Loading...</div>;
  if (!novel) return <div className="text-center p-12 text-text-muted">Novel not found.</div>;

  const savedBookmark = localStorage.getItem(`bookmark_${novel.id}`);
  const hasBookmark = savedBookmark && chapters.some(c => c.id === savedBookmark);

  const handleReadNow = () => {
    if (chapters.length === 0) {
       alert('No chapters available yet.');
       return;
    }
    if (hasBookmark) {
       navigate(`/chapter/${savedBookmark}`);
    } else {
       navigate(`/chapter/${chapters[0].id}`);
    }
  };

  return (
    <div className="bg-[#1b1b1b] min-h-screen -mt-16 pt-16">
      <div className="max-w-[1200px] mx-auto px-4 mt-4 pb-24">
         
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-[13px] text-gray-400 mb-6 font-sans">
          <Link to="/" className="hover:text-white flex items-center gap-1"><span className="text-[10px]">🏠</span> Home</Link>
          <span>›</span>
          <Link to="/" className="hover:text-white">Novel</Link>
          <span>›</span>
          <span className="text-gray-300">{novel.title}</span>
        </div>

        {/* Top Banner Info */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
           <div className="w-[300px] flex-shrink-0 relative rounded-md shadow-2xl overflow-hidden aspect-[2/3]">
              <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              {/* Optional MUNPIA logo badge if we wanted to mimic the exact ref, but leaving it clean */}
           </div>

           <div className="flex-1 flex flex-col justify-start pt-2">
               <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{novel.title}</h1>
               <div className="flex items-center gap-2 text-[13px] text-gray-300 mb-6">
                 <span>Author: {novel.author || 'Unknown'}</span>
               </div>
               
               <div className="flex items-center divide-x divide-gray-600 mb-6 w-fit">
                  <div className="pr-6">
                     <div className="text-[12px] text-gray-400 mb-1">Chapters</div>
                     <div className="text-xl font-bold text-white flex items-center gap-2">
                        📖 {chapters.length}
                     </div>
                  </div>
                  <div className="pl-6">
                     <div className="text-[12px] text-gray-400 mb-1">Status</div>
                     <div className="text-lg font-bold text-[#4caf50] uppercase">{novel.status || 'Ongoing'}</div>
                  </div>
               </div>
               
               <div className="mb-8">
                  <div className="text-[12px] text-gray-400 mb-2">Genres</div>
                  <div className="flex flex-wrap gap-2">
                     {novel.genres && novel.genres.length > 0 ? (
                        novel.genres.map((g: string, i: number) => (
                           <span key={i} className="px-3 py-1 bg-[#2582d1] hover:bg-[#1a65a7] cursor-pointer text-white text-[11px] font-bold uppercase rounded">{g}</span>
                        ))
                     ) : (
                        <span className="px-3 py-1 bg-[#2582d1] text-white text-[11px] font-bold uppercase rounded">NO GENRES</span>
                     )}
                  </div>
               </div>

               <div className="flex gap-4">
                  <button onClick={handleReadNow} className="bg-[#2582d1] hover:bg-[#1a65a7] text-white px-8 py-3 rounded text-sm font-medium transition-colors uppercase">
                     {hasBookmark ? "Continue Reading" : "Read Now"}
                  </button>
                  <button className="bg-[#2582d1] hover:bg-[#1a65a7] text-white px-8 py-3 rounded text-sm font-medium flex items-center gap-2 transition-colors">
                     <span className="text-lg">🔖</span> ADD TO LIBRARY
                  </button>
               </div>
           </div>
        </div>

        {/* Separator / Tabs area (mock) */}
        <div className="border-b border-[#333] mb-8"></div>

        {/* Summary */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-[#e1e1e1] mb-6">Summary</h2>
          <div className="text-[#a0a0a0] leading-[1.8] text-[15px] whitespace-pre-wrap max-w-[850px]">
            {novel.description}
          </div>
        </div>

        <div className="border-b border-dashed border-[#444] my-8 max-w-[850px]"></div>

        {/* Tags */}
        {novel.tags && novel.tags.length > 0 && (
           <div className="mb-12 max-w-[850px]">
             <h2 className="text-2xl font-bold text-[#e1e1e1] mb-6">Tags</h2>
             <div className="flex flex-wrap gap-2.5">
                {novel.tags.map((tag: string, index: number) => (
                   <span key={index} className="px-3.5 py-1.5 bg-[#17202a] text-[#3498db] border border-[#2c3e50] text-[13px] rounded opacity-90 cursor-pointer hover:bg-[#1c2836]">
                      {tag}
                   </span>
                ))}
             </div>
           </div>
        )}

        {/* Navigation Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 max-w-[850px]">
           <Link to={`/novel/${novel.id}/chapters`} className="border border-[#444] hover:border-[#666] bg-[#1b1b1b] p-5 md:p-6 rounded flex justify-between items-center group transition-colors shadow-sm cursor-pointer">
              <div>
                 <h3 className="text-[#e1e1e1] font-bold text-[15px] tracking-[0.1em] mb-2 uppercase">Novel Chapters</h3>
                 <p className="text-[#888] text-[13px]">
                    {chapters.length > 0 ? `Chapter ${chapters[chapters.length - 1].chapterNumber} ${chapters[chapters.length - 1].title || ''}` : 'No chapters available'}
                 </p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#555] group-hover:text-[#e1e1e1] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
           </Link>
           
           <Link to={`/characters?novelId=${novel.id}`} className="border border-[#444] hover:border-[#666] bg-[#1b1b1b] p-5 md:p-6 rounded flex justify-between items-center group transition-colors shadow-sm">
              <div>
                 <h3 className="text-[#e1e1e1] font-bold text-[15px] tracking-[0.1em] mb-2 uppercase">Lore & Compendium</h3>
                 <p className="text-[#888] text-[13px]">Explore characters, world, and powers</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#555] group-hover:text-[#e1e1e1] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
           </Link>
        </div>
      </div>
    </div>
  );
}
