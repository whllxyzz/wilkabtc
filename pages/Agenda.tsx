
import React, { useEffect, useState } from 'react';
import { agendaService } from '../services/supabaseService';
import { AgendaItem } from '../types';

const Agenda: React.FC = () => {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await agendaService.getAll();
      setItems(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-3 block">Kalender Akademik</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Agenda Kegiatan</h1>
          <p className="text-slate-500">Jadwal kegiatan penting sekolah yang akan datang.</p>
        </div>

        <div className="space-y-6">
          {items.length > 0 ? items.map((item) => (
            <div key={item.id} className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-8 hover:shadow-lg transition-all items-start sm:items-center group">
              <div className="flex-shrink-0 flex sm:flex-col items-center gap-2 sm:gap-0 bg-blue-50 text-blue-600 px-6 py-4 rounded-2xl min-w-[100px] text-center border border-blue-100">
                <span className="text-3xl font-black">{new Date(item.date).getDate()}</span>
                <span className="text-xs font-bold uppercase tracking-widest">{new Date(item.date).toLocaleString('id-ID', { month: 'short' })}</span>
                <span className="text-[10px] opacity-70 hidden sm:block">{new Date(item.date).getFullYear()}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap gap-3 mb-2">
                   <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 flex items-center gap-1">
                     <i className="fa-regular fa-clock"></i> {item.time} WIB
                   </span>
                   <span className="px-3 py-1 bg-blue-50 rounded-lg text-[10px] font-bold text-blue-600 flex items-center gap-1">
                     <i className="fa-solid fa-location-dot"></i> {item.location}
                   </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <i className="fa-regular fa-calendar-xmark text-4xl text-slate-300 mb-4"></i>
                <p className="text-slate-500 font-medium">Belum ada agenda dalam waktu dekat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Agenda;
