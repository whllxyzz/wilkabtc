
import React, { useEffect, useState } from 'react';
import { galleryService } from '../services/supabaseService';
import { GalleryItem } from '../types';

const Gallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      const data = await galleryService.getAll();
      setItems(data);
      setLoading(false);
    };
    fetchGallery();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-4 block">Dokumentasi Visual</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Galeri Sekolah</h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Momen berharga, fasilitas modern, dan aktivitas siswa SMKN 2 Tembilahan dalam lensa.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="relative aspect-square group overflow-hidden rounded-[2rem] cursor-pointer bg-white shadow-sm hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-2 transition-all duration-300 border border-slate-100"
            >
              <img 
                src={item.image_url} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                <h3 className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300 leading-tight">{item.title}</h3>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-2xl">
                 <i className="fa-regular fa-images"></i>
              </div>
              <p className="text-slate-500 font-bold">Galeri belum tersedia.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
