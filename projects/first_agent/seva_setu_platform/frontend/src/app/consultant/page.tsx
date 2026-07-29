import React from "react";
import Link from "next/link";
import BusinessSuite from "@/components/business/BusinessSuite";

export default function ConsultantPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5] flex flex-col">
      {/* Consultant Portal Top Navigation */}
      <header className="w-full bg-[#0F2C59] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-3">
          <Link href="/" className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow font-bold text-xl cursor-pointer text-[#0F2C59]">
            🇮🇳
          </Link>
          <Link href="/">
            <h1 className="text-lg md:text-xl font-black tracking-tight cursor-pointer">
              सेवासेतू <span className="text-xs bg-amber-500 text-[#0F2C59] px-1.5 py-0.5 rounded ml-1 font-extrabold uppercase">Consultant B2B</span>
            </h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline-block text-xs font-bold text-amber-300 border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 rounded-lg">
            ⭐ Verified Expert
          </span>
          <div className="w-8 h-8 rounded-full bg-white text-[#0F2C59] flex items-center justify-center font-bold shadow-sm cursor-pointer">
            C
          </div>
        </div>
      </header>
      
      {/* Business Suite Wrapper */}
      <div className="flex-1 w-full flex flex-col">
        <BusinessSuite />
      </div>
    </div>
  );
}
