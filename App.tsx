
import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl mb-8 animate-bounce shadow-2xl shadow-blue-200">
        <i className="fa-solid fa-code"></i>
      </div>
      <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
        SISTEM TELAH DIRESET
      </h1>
      <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
        Halaman ini sekarang dalam kondisi bersih (Blank State). 
        Silakan masukkan instruksi baru Anda untuk membangun aplikasi dari nol.
      </p>
      <div className="mt-12 flex gap-4">
        <div className="px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
          React 19
        </div>
        <div className="px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
          Tailwind CSS
        </div>
        <div className="px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
          Vite Hub
        </div>
      </div>
    </div>
  );
};

export default App;
