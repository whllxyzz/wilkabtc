
import React, { useEffect, useState } from 'react';
import { eskulService } from '../services/supabaseService';
import { Eskul } from '../types';

const EskulPage: React.FC = () => {
  const [items, setItems] = useState<Eskul[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await eskulService.getAll();
      setItems(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-orange-500 font-black text-xs uppercase tracking-[0.3em] mb-3 block">Non-Akademik</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Ekstrakurikuler</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">Wadah pengembangan bakat dan minat siswa di luar jam pelajaran sekolah.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-[2.5rem] bg-slate-50 hover:bg-white border border-slate-100 hover:border-orange-100 hover:shadow-2xl transition-all duration-500">
              <div className="h-56 overflow-hidden relative">
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-8">
                   <h3 className="text-2xl font-black text-white">{item.name}</h3>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                   <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">
                      <i className="fa-solid fa-calendar-days"></i>
                   </div>
                   <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{item.schedule}</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">{item.description}</p>
                <button className="w-full py-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all">
                   Daftar Sekarang
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EskulPage;
