
import React, { useState } from 'react';
import { suggestionService } from '../services/supabaseService';

const FeedbackWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Saran Fitur',
    content: ''
  });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content) return;

    setIsSending(true);
    try {
      await suggestionService.submit({
        name: formData.name || 'Anonim',
        type: formData.type as any,
        content: formData.content
      });
      alert("Terima kasih! Masukan Anda telah kami terima.");
      setFormData({ name: '', type: 'Saran Fitur', content: '' });
      setIsOpen(false);
    } catch (err) {
      alert("Maaf, terjadi kesalahan saat mengirim.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 left-6 z-[990]">
        <button 
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white pl-4 pr-6 py-4 rounded-full shadow-2xl transition-all hover:-translate-y-1 active:scale-95"
        >
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
             <i className="fa-solid fa-lightbulb text-sm"></i>
          </div>
          <div className="text-left">
             <span className="block text-[8px] font-black uppercase tracking-widest opacity-80 leading-tight">Klik Tombol Ini</span>
             <span className="block text-xs font-black uppercase tracking-tight">Saran / Masukan Fitur</span>
          </div>
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-zoom-in relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors">
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="mb-6">
               <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 text-xl">
                 <i className="fa-solid fa-box-open"></i>
               </div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white">Kotak Saran Digital</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bantu kami mengembangkan website sekolah menjadi lebih baik.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Jenis Masukan</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Saran Fitur', 'Masukan Umum', 'Pertanyaan'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({...formData, type: t})}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                        formData.type === t 
                        ? 'bg-emerald-500 text-white border-emerald-500' 
                        : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama (Opsional)</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Boleh dikosongkan..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Isi Pesan</label>
                <textarea 
                  rows={4}
                  required
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-medium outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Tuliskan ide fitur baru atau masukan Anda di sini..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSending}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 dark:shadow-none transition-all disabled:opacity-70 active:scale-95 flex items-center justify-center gap-2"
              >
                {isSending ? 'MENGIRIM...' : 'KIRIM MASUKAN'} <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
