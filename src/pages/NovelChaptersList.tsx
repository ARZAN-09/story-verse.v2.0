import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbService } from '../services/db';

export default function NovelChaptersList() {
  const { id } = useParams();
  const [novel, setNovel] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; 
  const [inputPage, setInputPage] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        setLoading(true);
        const n = await dbService.get('novels', id);
        setNovel(n);

        const chaps = await dbService.list('chapters', { novelId: id });
        chaps.sort((a,b) => a.chapterNumber - b.chapterNumber);
        
        setChapters(chaps);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div className="text-center p-12 text-[#a0a0a0]">Loading chapters...</div>;
  if (!novel) return <div className="text-center p-12 text-[#a0a0a0]">Novel not found.</div>;

  const totalPages = Math.ceil(chapters.length / itemsPerPage);
  const displayChapters = chapters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleGo = () => {
    const val = parseInt(inputPage);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
       setCurrentPage(val);
    }
    setInputPage('');
  };

  const timeAgo = (ts?: number) => {
    if (!ts) return "";
    const seconds = Math.floor((Date.now() - ts * 1000) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const getPaginationButtons = () => {
    const pages = [];
    if (totalPages <= 6) {
       for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
       pages.push(1, 2, 3, 4, 5, 6, "...", totalPages - 1, totalPages);
       // Just visually mapping the screenshot reference where it shows 1 to 6 ... 29 30
    }
    return pages;
  };

  return (
    <div className="bg-[#1b1b1b] min-h-screen -mt-16 pt-20 font-sans">
      <div className="max-w-[1100px] mx-auto px-4 pb-24">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[13px] text-gray-400 mb-6 w-full">
          <Link to="/" className="hover:text-white flex items-center gap-1"><span className="text-[10px]">🏠</span> Home</Link>
          <span>›</span>
          <Link to="/" className="hover:text-white">Novel</Link>
          <span>›</span>
          <Link to={`/novel/${novel.id}`} className="hover:text-white">{novel.title}</Link>
          <span>›</span>
          <span className="text-gray-300">Chapters</span>
        </div>

        {/* Top Novel Summary Card */}
        <div className="bg-[#222] border border-[#333] rounded-lg p-6 md:p-8 mb-6 flex flex-col items-start shadow-sm">
           <div className="flex items-start gap-4 mb-6">
              <div className="w-[80px] h-[120px] flex-shrink-0 bg-black rounded overflow-hidden">
                 <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col pt-1">
                 <h1 className="text-2xl md:text-[28px] font-medium text-[#3498db] hover:underline cursor-pointer mb-2 leading-tight">
                   <Link to={`/novel/${novel.id}`}>{novel.title}</Link>
                 </h1>
                 <p className="text-[#a0a0a0] text-[15px] mb-1">
                   Updated {chapters.length > 0 && chapters[chapters.length-1].created_at ? timeAgo(chapters[chapters.length-1].created_at) : 'recently'}
                 </p>
                 <p className="text-[#a0a0a0] text-[15px]">
                   Status: {novel.status || 'Ongoing'}
                 </p>
              </div>
           </div>

           <div className="w-full border-t border-[#333] mb-6"></div>

           <h2 className="text-[22px] font-medium text-[#e1e1e1] mb-4">{novel.title} Novel Chapters</h2>
           <p className="text-[#a0a0a0] text-[15px] leading-relaxed mb-6 max-w-[950px]">
              List of most recent chapters published for the {novel.title} novel. A total of {chapters.length} chapters have been translated and the release date of the last chapter is {new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
           </p>

           {chapters.length > 0 && (
              <div className="text-[15px]">
                 <span className="text-[#a0a0a0]">Latest Release: </span>
                 <Link to={`/chapter/${chapters[chapters.length - 1].id}`} className="text-[#3498db] hover:underline">
                    Chapter {chapters[chapters.length - 1].chapterNumber} {chapters[chapters.length - 1].title || ''}
                 </Link>
              </div>
           )}
        </div>

        {/* Chapters List and Pagination Section */}
        <div className="bg-[#222] border border-[#333] rounded-lg p-6 md:p-8 shadow-sm">
           
           {/* Top Navigation Row */}
           <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b border-[#333] pb-8">
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                 <input 
                    type="text" 
                    placeholder="Enter Page No." 
                    value={inputPage}
                    onChange={(e) => setInputPage(e.target.value)}
                    className="bg-[#1b1b1b] border border-[#333] text-[#a0a0a0] px-4 py-2.5 rounded max-w-[150px] focus:outline-none focus:border-[#555] text-sm"
                 />
                 <button onClick={handleGo} className="bg-[#3498db] hover:bg-[#2980b9] text-white px-6 py-2.5 rounded font-medium transition-colors text-sm">
                    GO
                 </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                 <button 
                   disabled={currentPage === 1}
                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                   className="w-10 h-10 flex items-center justify-center bg-[#1b1b1b] border border-[#333] text-[#888] rounded disabled:opacity-50 hover:bg-[#2a2a2a] transition-colors"
                 >
                   ‹
                 </button>
                 
                 {getPaginationButtons().map((p, i) => (
                    <button 
                      key={i}
                      disabled={p === "..."}
                      onClick={() => typeof p === 'number' && setCurrentPage(p)}
                      className={`w-10 h-10 flex items-center justify-center rounded text-sm transition-colors border ${
                        p === currentPage 
                          ? 'bg-[#3498db] text-white border-[#3498db]' 
                          : p === "..." 
                            ? 'bg-transparent border-transparent text-[#888]' 
                            : 'bg-[#1b1b1b] border border-[#333] text-[#3498db] hover:bg-[#2a2a2a]'
                      }`}
                    >
                      {p}
                    </button>
                 ))}

                 <button 
                   disabled={currentPage === totalPages}
                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                   className="w-10 h-10 flex items-center justify-center bg-[#1b1b1b] border border-[#333] text-[#888] rounded disabled:opacity-50 hover:bg-[#2a2a2a] transition-colors"
                 >
                   ›
                 </button>

                 <div className="ml-4 pl-4 border-l border-[#444] cursor-pointer text-[#3498db] hover:text-[#2980b9]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>
                 </div>
              </div>
           </div>

           {/* Chapters Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
               {displayChapters.length === 0 && (
                  <div className="col-span-full py-12 text-[#888] text-center">No chapters found for this page.</div>
               )}
               {displayChapters.map((ch: any) => (
                  <Link 
                     key={ch.id} 
                     to={`/chapter/${ch.id}`} 
                     className="flex items-center gap-6 p-4 rounded group transition-all duration-200 border-b border-[#2c2c2c] hover:bg-[#2a2a2a]/50"
                  >
                     <span className="text-[#666] font-mono text-[16px] w-[20px]">{ch.chapterNumber}</span>
                     <div>
                        <div className="text-[#e1e1e1] text-[15px] group-hover:text-[#3498db] transition-colors mb-1">
                           Chapter {ch.chapterNumber} {ch.title ? `- ${ch.title}` : ''}
                        </div>
                        <div className="text-[#777] text-[13px]">
                           {ch.created_at ? timeAgo(ch.created_at) : 'recently'}
                        </div>
                     </div>
                  </Link>
               ))}
           </div>
           
        </div>
      </div>
    </div>
  );
}
