import Link from "next/link";
import React from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5] text-[#1C1C1C] font-sans flex flex-col">
      {/* Header */}
      <header className="w-full bg-[#0F2C59] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow" aria-hidden="true">
            <span className="text-xl font-bold text-[#0F2C59]">🇮🇳</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">सेवासेतू भारत</h1>
            <p className="text-[10px] md:text-xs text-[#FAFAF5]/80">National Digital Public Infrastructure Gateway</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select className="bg-white/10 border border-white/20 text-white rounded px-2 py-1 text-sm font-bold focus:outline-none cursor-pointer">
            <option value="en" className="text-black">English</option>
            <option value="mr" className="text-black">मराठी</option>
            <option value="hi" className="text-black">हिंदी</option>
          </select>
          <Link href="/login" className="bg-[#E07A5F] hover:bg-[#c46850] text-white px-4 py-2 rounded font-bold text-sm transition shadow-sm">
            Login / Signup
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 flex flex-col space-y-16">
        
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-5xl font-black text-[#0F2C59] leading-tight">
            How can we help you today?
          </h2>
          <p className="text-lg text-gray-600 font-medium">
            Discover government schemes, verify documents, and get expert advisory in your regional language.
          </p>
          
          <div className="max-w-2xl mx-auto mt-8 flex border-2 border-[#0F2C59] rounded-full overflow-hidden shadow-lg bg-white focus-within:ring-4 focus-within:ring-[#0F2C59]/20">
            <input 
              type="text" 
              placeholder="Search for schemes, loans, or ask a question..." 
              className="flex-1 px-6 py-4 text-sm md:text-base outline-none font-medium text-gray-700"
            />
            <button className="px-6 py-4 bg-gray-100 border-l border-gray-200 text-gray-600 hover:bg-gray-200 transition" aria-label="Voice Search">
              🎤
            </button>
            <Link href="/chat" className="px-8 py-4 bg-[#0F2C59] text-white font-bold hover:bg-[#07152c] transition flex items-center">
              Search
            </Link>
          </div>
        </section>

        {/* Visual Persona Pathways */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">I am a...</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🌾", title: "Farmer", desc: "Kisan schemes & crop insurance" },
              { icon: "🏪", title: "Small Business", desc: "MUDRA loans & MSME benefits" },
              { icon: "🎓", title: "Student", desc: "Scholarships & education loans" },
              { icon: "👷", title: "Worker", desc: "e-Shram & social security" }
            ].map((persona, idx) => (
              <Link href="/chat" key={idx} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg hover:border-[#0F2C59] transition-all group cursor-pointer">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{persona.icon}</div>
                <h4 className="font-bold text-[#0F2C59]">{persona.title}</h4>
                <p className="text-xs text-gray-500 mt-2">{persona.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="bg-[#0F2C59]/5 rounded-2xl p-8 border border-[#0F2C59]/10 text-center">
          <h3 className="text-2xl font-bold text-[#0F2C59] mb-6">Explore the Portal</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard" className="bg-white text-[#0F2C59] border border-[#0F2C59]/20 font-bold px-6 py-3 rounded-lg hover:bg-[#0F2C59] hover:text-white transition shadow-sm">
              Citizen Dashboard
            </Link>
            <Link href="/chat" className="bg-white text-[#0F2C59] border border-[#0F2C59]/20 font-bold px-6 py-3 rounded-lg hover:bg-[#0F2C59] hover:text-white transition shadow-sm">
              Seva AI Chat
            </Link>
            <Link href="/admin" className="bg-white text-[#0F2C59] border border-[#0F2C59]/20 font-bold px-6 py-3 rounded-lg hover:bg-[#0F2C59] hover:text-white transition shadow-sm">
              Admin Portal
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-[#1C1C1C]/50 border-t border-[#0F2C59]/10 bg-[#FAFAF5]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p>© 2024 Seva Setu Bharat. GIGW 3.0 & WCAG 2.2 AA Compliant.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:underline">Privacy Policy (DPDP Act)</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
