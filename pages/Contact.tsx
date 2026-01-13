
import React, { useState } from 'react';
import { contactService } from '../services/supabaseService';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Mohon lengkapi data.");
      return;
    }

    setIsSending(true);
    try {
      await contactService.send(formData);
      alert("Pesan Anda berhasil dikirim! Kami akan segera menghubungi Anda.");
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      alert("Gagal mengirim pesan. Silakan coba lagi.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-16 text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Hubungi Kami</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Punya pertanyaan atau ingin berkunjung? Tim kami siap melayani Anda dengan sepenuh hati.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info cards */}
          <div className="space-y-6">
            {[
              { icon: 'fa-location-dot', title: 'Alamat', detail: 'Jl. Pendidikan No. 45, Tembilahan, Indragiri Hilir, Riau' },
              { icon: 'fa-phone', title: 'Telepon', detail: '(0768) 123456 / +62 812 3456 7890' },
              { icon: 'fa-envelope', title: 'Email', detail: 'info@smkn2tembilahan.sch.id' },
              { icon: 'fa-clock', title: 'Jam Kerja', detail: 'Senin - Jumat, 07:00 - 15:30 WIB' },
            ].map((info, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 flex items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mr-5 flex-shrink-0">
                  <i className={`fa-solid ${info.icon} text-xl`}></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{info.title}</h4>
                  <p className="text-slate-500 text-sm">{info.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Kirim Pesan</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
                      placeholder="Masukkan nama Anda" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
                      placeholder="email@contoh.com" 
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subjek</label>
                  <input 
                    type="text" 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
                    placeholder="Tujuan pesan" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pesan</label>
                  <textarea 
                    rows={5} 
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
                    placeholder="Tuliskan pesan Anda di sini..."
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isSending}
                  className="w-full md:w-auto bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 transform active:scale-95 disabled:opacity-70"
                >
                  {isSending ? 'Mengirim...' : 'Kirim Sekarang'} <i className="fa-solid fa-paper-plane ml-2"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
