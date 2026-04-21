import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbService } from '../services/db';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';

export default function ManhwaReader() {
  const { id } = useParams();
  const [manhwa, setManhwa] = useState<any>(null);
  const [novel, setNovel] = useState<any>(null);
  const [allManhwas, setAllManhwas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      try {
        const m = await dbService.get('manhwa', id);
        if (!m) return;
        setManhwa(m);
        
        const n = await dbService.get('novels', m.novelId);
        setNovel(n);

        const mList = await dbService.list('manhwa', { novelId: m.novelId });
        mList.sort((a,b) => a.chapterNumber - b.chapterNumber);
        setAllManhwas(mList);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  // Anti-Piracy / Reader Protection
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent PrintScreen, Ctrl+C, Ctrl+P, Ctrl+S
      if (e.key === 'PrintScreen') {
        try {
          navigator.clipboard.writeText('');
        } catch (err) {}
      }
      if ((e.ctrlKey || e.metaKey) && ['c', 'p', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.clipboardData?.setData('text/plain', 'Copying from this site is not allowed.');
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  if (loading) return <div className="text-center p-12 text-[#94a3b8]">Loading manhwa...</div>;
  if (!manhwa) return <div className="text-center p-12 text-[#94a3b8]">Manhwa not found.</div>;

  const currentIndex = allManhwas.findIndex(m => m.id === id);
  const prevChapter = currentIndex > 0 ? allManhwas[currentIndex - 1] : null;
  const nextChapter = currentIndex < allManhwas.length - 1 ? allManhwas[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-black pt-4 pb-16 select-none">
      <div className="max-w-4xl mx-auto px-4 mb-8">
         <div className="flex justify-between items-center bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
            <div className="flex flex-col">
              <Link to={`/novel/${novel?.id}`} className="text-xs font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300">
                {novel?.title}
              </Link>
              <h1 className="text-lg text-white font-medium">Chapter {manhwa.chapterNumber}: {manhwa.title}</h1>
            </div>
         </div>
      </div>

      <div className="max-w-3xl mx-auto flex flex-col">
        {(Array.isArray(manhwa.images) ? manhwa.images : (typeof manhwa.images === 'string' ? manhwa.images.split(',') : [])).map((imgUrl: string, idx: number) => {
          const url = typeof imgUrl === 'string' ? imgUrl.trim() : '';
          return url ? (
            <img 
              key={idx} 
              src={url} 
              alt={`Page ${idx + 1}`} 
              className="w-full object-contain"
              loading="lazy" 
              referrerPolicy="no-referrer" 
            />
          ) : null;
        })}
      </div>

      <div className="max-w-4xl mx-auto mt-12 px-4">
        <div className="flex justify-between items-center bg-[#1e293b] p-4 rounded-xl border border-[#334155]">
          {prevChapter ? (
            <Link to={`/manhwa/${prevChapter.id}`} className="flex items-center gap-2 px-6 py-3 bg-[#0f172a] hover:bg-[#334155] text-white rounded-full transition-colors font-medium text-sm border border-[#334155]">
              <ArrowLeft size={18} /> Prev
            </Link>
          ) : <div />}
          
          {nextChapter ? (
            <Link to={`/manhwa/${nextChapter.id}`} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors font-medium text-sm">
              Next <ArrowRight size={18} />
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
