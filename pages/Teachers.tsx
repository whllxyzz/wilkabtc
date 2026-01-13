
import React, { useEffect, useState } from 'react';
import { teacherService } from '../services/supabaseService';
import { Teacher } from '../types';

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await teacherService.getAll();
      setTeachers(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-3 block">Tenaga Pendidik</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Guru & Staf Pengajar</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">Mengenal lebih dekat para pahlawan tanpa tanda jasa yang berdedikasi membimbing siswa SMKN 2 Tembilahan.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center group">
              <div className="w-32 h-32 mx-auto rounded-full p-1 border-2 border-dashed border-blue-200 group-hover:border-blue-500 transition-colors mb-6">
                <img 
                  src={teacher.image_url} 
                  alt={teacher.name} 
                  className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{teacher.name}</h3>
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">{teacher.position}</p>
              {teacher.nip && (
                <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-mono text-slate-500">
                  NIP: {teacher.nip}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Teachers;
