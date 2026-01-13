
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Halo! Saya asisten digital SMKN 2 Tembilahan. Ada yang bisa saya bantu?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      // Use process.env.API_KEY directly as a named parameter
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "Anda adalah asisten virtual ramah dari SMKN 2 Tembilahan, sekolah kejuruan unggulan di Indragiri Hilir, Riau. Jawablah pertanyaan seputar pendaftaran siswa baru (PPDB), jurusan sekolah, dan fasilitas dengan profesional. Website ini dikelola oleh WilkaXyz. Gunakan bahasa Indonesia yang sopan.",
          temperature: 0.7,
        }
      });
      
      // Access the generated text using the .text property (not a method)
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Maaf, saya sedang tidak bisa berpikir jernih." }]);
    } catch (err) {
      console.error("Gemini Chatbot Error:", err);
      setMessages(prev => [...prev, { role: 'ai', text: "Maaf, terjadi gangguan koneksi ke otak AI saya." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] font-sans">
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all transform hover:scale-110 active:scale-95 ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-blue-600 shadow-blue-200'}`}
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-robot'} text-xl`}></i>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-zoom-in origin-bottom-right h-[500px]">
          {/* Header */}
          <div className="bg-blue-600 p-6 text-white flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <i className="fa-solid fa-robot"></i>
            </div>
            <div>
              <p className="font-black text-sm uppercase tracking-widest">S2 AI Assistant</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">Online Now</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                  m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Tanya asisten virtual..."
              className="flex-1 px-4 py-3 bg-slate-100 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
            <button type="submit" className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </form>
          
          <div className="py-2 text-center bg-slate-50 text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">
             Powered by Gemini AI • WilkaXyz
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
