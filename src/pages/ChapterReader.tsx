import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import Markdown from 'react-markdown';
import { ArrowLeft, ArrowRight, Bookmark, Sun, Moon } from 'lucide-react';

export default function ChapterReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<any>(null);
  const [novel, setNovel] = useState<any>(null);
  const [allChapters, setAllChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('reader_theme') as 'dark' | 'light') || 'dark'
  );

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      try {
        const c = await dbService.get('chapters', id);
        if (!c) return;
        setChapter(c);
        
        setIsBookmarked(localStorage.getItem(`bookmark_${c.novelId}`) === c.id);
        
        const n = await dbService.get('novels', c.novelId);
        setNovel(n);

        const chaps = await dbService.list('chapters', { novelId: c.novelId });
        chaps.sort((a,b) => a.chapterNumber - b.chapterNumber);
        setAllChapters(chaps);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    localStorage.setItem('reader_theme', theme);
  }, [theme]);

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

  const handleBookmark = () => {
     if (isBookmarked) {
        localStorage.removeItem(`bookmark_${chapter.novelId}`);
        setIsBookmarked(false);
     } else {
        localStorage.setItem(`bookmark_${chapter.novelId}`, chapter.id);
        setIsBookmarked(true);
     }
  };

  if (loading) return <div className="text-center p-12 text-text-muted">Loading chapter...</div>;
  if (!chapter) return <div className="text-center p-12 text-text-muted">Chapter not found.</div>;

  const currentIndex = allChapters.findIndex(c => c.id === id);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <div className={`min-h-screen -mt-16 pt-16 select-none ${theme === 'dark' ? 'bg-[#1b1b1b]' : 'bg-[#f4f6f8]'}`}>
      <div className="max-w-[1200px] mx-auto px-4 mt-4 pb-32">
        {/* Breadcrumb Navigation */}
        <div className={`flex items-center gap-2 text-[13px] mb-8 font-sans ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <Link to="/" className="hover:text-primary flex items-center gap-1"><span className="text-[10px]">🏠</span> Home</Link>
          <span>›</span>
          <Link to={`/novel/${chapter.novelId}`} className="hover:text-primary">{novel?.title}</Link>
          <span>›</span>
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}>Chapter {chapter.chapterNumber}</span>
        </div>

        <div className={`mb-8 p-6 lg:p-8 flex items-start justify-between border-[1px] transition-colors rounded-xl ${theme === 'dark' ? 'bg-[#222] border-[#333]' : 'bg-white border-[#ddd] shadow-sm'}`}>
           <div>
              <Link to={`/novel/${chapter.novelId}`} className="text-[#3498db] hover:underline text-lg md:text-xl font-medium mb-1 block">
                {novel?.title}
              </Link>
              <h1 className={`text-lg font-medium ${theme === 'dark' ? 'text-[#e1e1e1]' : 'text-[#222]'}`}>
                Chapter {chapter.chapterNumber} {chapter.title ? `- ${chapter.title}` : ''}
              </h1>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>
                [ {chapter.content ? chapter.content.split(/\s+/).length : 0} words ]
              </p>
           </div>
           
           <div className="flex flex-col items-end gap-3 border-[1px] border-[#333] p-1.5 rounded-xl">
              <button 
                 onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                 className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${theme === 'dark' ? 'bg-[#333] text-gray-200 hover:bg-[#444]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
              </button>
           </div>
        </div>

        <div className="flex justify-center items-center gap-2 mb-10 max-w-[850px] mx-auto">
          <button 
             onClick={() => prevChapter && navigate(`/chapter/${prevChapter.id}`)} 
             disabled={!prevChapter}
             className="w-10 h-10 bg-[#3498db] text-white flex items-center justify-center rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2980b9] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          
          <select 
             value={chapter.id}
             onChange={(e) => navigate(`/chapter/${e.target.value}`)}
             className="flex-1 max-w-[300px] h-10 bg-[#3498db] text-white px-4 rounded hover:bg-[#2980b9] outline-none cursor-pointer border-none text-center"
             style={{ textAlignLast: 'center' }}
          >
             {allChapters.map(c => (
                <option key={c.id} value={c.id} className={theme === 'dark' ? 'bg-[#222] text-[#e1e1e1]' : 'bg-white text-gray-900 text-left'}>
                   Chapter {c.chapterNumber}
                </option>
             ))}
          </select>
          
          <button 
             onClick={() => nextChapter && navigate(`/chapter/${nextChapter.id}`)} 
             disabled={!nextChapter}
             className="w-10 h-10 bg-[#3498db] text-white flex items-center justify-center rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2980b9] transition-colors"
          >
            <ArrowRight size={16} />
          </button>
          
          <button 
             onClick={handleBookmark}
             className={`w-10 h-10 ml-2 flex items-center justify-center rounded border transition-colors ${theme === 'dark' ? 'bg-[#2c3e50] text-[#3498db] border-[#3498db] hover:bg-[#1a252f]' : 'bg-[#e0f2fe] text-[#3498db] border-[#3498db] hover:bg-[#bae6fd]'}`}
             title={isBookmarked ? "Remove Bookmark" : "Bookmark this chapter"}
          >
            <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>

        <div className={`min-h-[60vh] ${theme === 'dark' ? 'bg-[#1b1b1b]' : 'bg-[#f4f6f8]'}`}>
          <div className={`text-left font-sans text-lg md:text-xl md:leading-[2.2] max-w-[900px] mx-auto reader-content ${theme === 'dark' ? 'text-[#d1d1d1]' : 'text-[#333]'}`}>
            {chapter.content ? (
               <Markdown>{chapter.content}</Markdown>
            ) : (
               <p className="italic opacity-70">No content available.</p>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className={`flex justify-center items-center gap-2 mt-16 pt-8 border-t max-w-[850px] mx-auto ${theme === 'dark' ? 'border-[#333]' : 'border-[#ddd]'}`}>
          <button 
             onClick={() => prevChapter && navigate(`/chapter/${prevChapter.id}`)} 
             disabled={!prevChapter}
             className="w-10 h-10 bg-[#3498db] text-white flex items-center justify-center rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2980b9] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          
          <select 
             value={chapter.id}
             onChange={(e) => navigate(`/chapter/${e.target.value}`)}
             className="flex-1 max-w-[300px] h-10 bg-[#3498db] text-white px-4 rounded hover:bg-[#2980b9] outline-none cursor-pointer border-none text-center"
             style={{ textAlignLast: 'center' }}
          >
             {allChapters.map(c => (
                <option key={c.id} value={c.id} className={theme === 'dark' ? 'bg-[#222] text-[#e1e1e1]' : 'bg-white text-gray-900 text-left'}>
                   Chapter {c.chapterNumber}
                </option>
             ))}
          </select>
          
          <button 
             onClick={() => nextChapter && navigate(`/chapter/${nextChapter.id}`)} 
             disabled={!nextChapter}
             className="w-10 h-10 bg-[#3498db] text-white flex items-center justify-center rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2980b9] transition-colors"
          >
            <ArrowRight size={16} />
          </button>
          
          <button 
             onClick={handleBookmark}
             className={`w-10 h-10 ml-2 flex items-center justify-center rounded border transition-colors ${theme === 'dark' ? 'bg-[#2c3e50] text-[#3498db] border-[#3498db] hover:bg-[#1a252f]' : 'bg-[#e0f2fe] text-[#3498db] border-[#3498db] hover:bg-[#bae6fd]'}`}
             title={isBookmarked ? "Remove Bookmark" : "Bookmark this chapter"}
          >
            <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>

        <style>{`
           .reader-content p {
               margin-bottom: 2.5em;
               color: inherit;
           }
        `}</style>
      </div>
    </div>
  );
}
