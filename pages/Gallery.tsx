
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16 text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Galeri Sekolah</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Dokumentasi momen berharga, fasilitas, dan berbagai aktivitas yang berlangsung di SMKN 2 Tembilahan.
          </p>
          <div className="w-16 h-1 bg-blue-600 mx-auto mt-6"></div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="relative aspect-square group overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <img 
                src={item.image_url} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{item.title}</h3>
                <p className="text-blue-200 text-xs mt-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                  {new Date(item.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-400">Galeri masih kosong.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
