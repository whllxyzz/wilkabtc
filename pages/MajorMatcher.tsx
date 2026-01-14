
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const MajorMatcher: React.FC = () => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const questions = [
    "Apa kegiatan yang paling kamu sukai di waktu luang?",
    "Jika diberi tugas proyek, kamu lebih suka bagian mana?",
    "Bagaimana caramu menyelesaikan masalah?",
    "Apa impian karirmu di masa depan?"
  ];

  const handleNext = (val: string) => {
    const newAnswers = [...answers, val];
    setAnswers(newAnswers);
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      generateRecommendation(newAnswers);
    }
  };

  const generateRecommendation = async (userAnswers: string[]) => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Seorang calon siswa SMKN 2 Tembilahan memberikan jawaban berikut: 
      1. Suka: ${userAnswers[0]}
      2. Peran: ${userAnswers[1]}
      3. Cara: ${userAnswers[2]}
      4. Impian: ${userAnswers[3]}
      
      SMKN 2 Tembilahan memiliki jurusan: TKJ (Teknik Komputer), Akuntansi, Tata Boga, Bisnis Pemasaran, Perkantoran.
      Berikan rekomendasi jurusan yang paling cocok (pilih satu) dan berikan alasan singkat serta motivasi dalam bahasa Indonesia yang keren dan profesional. Berikan dalam format: JURUSAN: [Nama Jurusan] - ALASAN: [Alasan].`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setResult(response.text || "Pilih jurusan favoritmu!");
    } catch (err) {
      setResult("Maaf, AI sedang istirahat. Coba lagi nanti ya!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <i className="fa-solid fa-wand-magic-sparkles"></i> AI Powered Matcher
           </div>
           <h1 className="text-4xl font-black text-slate-900 mb-4">Temukan Masa Depanmu</h1>
           <p className="text-slate-500 font-medium">Beri tahu AI tentang dirimu, dan kami akan mencarikan jurusan terbaik di SMKN 2 Tembilahan.</p>
        </div>

        <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 shadow-sm min-h-[400px] flex flex-col justify-center">
           {!result && !loading && (
             <div className="animate-slide-up">
                <div className="mb-8">
                   <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Pertanyaan {step}/4</p>
                   <h2 className="text-2xl font-black text-slate-800 leading-tight">{questions[step-1]}</h2>
                </div>
                <div className="space-y-3">
                   <textarea 
                     className="w-full p-6 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold text-sm"
                     placeholder="Ketik jawabanmu di sini..."
                     onKeyDown={(e) => { if(e.key === 'Enter') handleNext((e.target as any).value) }}
                     id="ans-input"
                   />
                   <button 
                     onClick={() => { const input = document.getElementById('ans-input') as HTMLTextAreaElement; handleNext(input.value); input.value = ''; }}
                     className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200"
                   >
                     Lanjut <i className="fa-solid fa-arrow-right ml-2"></i>
                   </button>
                </div>
             </div>
           )}

           {loading && (
             <div className="text-center space-y-6 py-10">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Menganalisa Bakatmu...</p>
             </div>
           )}

           {result && (
             <div className="animate-zoom-in text-center">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center text-3xl mx-auto mb-8 shadow-2xl shadow-blue-200">
                   <i className="fa-solid fa-graduation-cap"></i>
                </div>
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Hasil Rekomendasi</h3>
                <div className="bg-white p-8 rounded-3xl border border-blue-100 mb-8">
                   <p className="text-slate-700 font-bold leading-relaxed">{result}</p>
                </div>
                <button onClick={() => { setStep(1); setResult(null); setAnswers([]); }} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Ulangi Tes</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MajorMatcher;
