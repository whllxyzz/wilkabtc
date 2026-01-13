
import React, { useEffect, useState } from 'react';
import { newsService } from '../services/supabaseService';
import { NewsItem } from '../types';

const News: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const data = await newsService.getAll();
      setNews(data);
      setLoading(false);
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-4 block">Archive Update</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Warta & Kabar Sekolah</h1>
          <p className="text-slate-500 text-lg">Informasi terbaru seputar prestasi dan kegiatan SMKN 2 Tembilahan.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {news.length > 0 ? (
            news.map((item) => (
              <article key={item.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="relative h-64 overflow-hidden">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-6 left-6">
                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase shadow-xl ${item.author.includes('Owner') ? 'bg-blue-600 text-white' : 'bg-white/90 backdrop-blur-md text-slate-800'}`}>
                      {item.author}
                    </div>
                  </div>
                </div>
                <div className="p-10">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs font-bold text-slate-400">
                      {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-5 leading-tight group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-4 mb-8">
                    {item.content}
                  </p>
                  <button className="text-blue-600 font-black text-sm flex items-center gap-2 group/btn">
                    Baca Artikel <i className="fa-solid fa-arrow-right-long group-hover/btn:translate-x-2 transition-transform"></i>
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] shadow-sm border border-slate-100">
               <h3 className="text-2xl font-black text-slate-800">Tidak Ada Artikel</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default News;
