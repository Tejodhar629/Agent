import React from "react";
import UserDashboard from "@/components/dashboard/UserDashboard";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5] flex flex-col">
      {/* Global Navigation matching internal pages */}
      <header className="w-full bg-[#0F2C59] text-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-3">
          <Link href="/" className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow font-bold text-xl cursor-pointer">
            🇮🇳
          </Link>
          <Link href="/">
            <h1 className="text-lg md:text-xl font-black tracking-tight cursor-pointer">
              सेवासेतू <span className="text-xs bg-[#E07A5F] px-1.5 py-0.5 rounded ml-1">Citizen Portal</span>
            </h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/chat" className="text-xs font-bold bg-white text-[#0F2C59] px-3 py-1.5 rounded-lg hover:bg-gray-100 transition shadow">
            💬 Seva Chat
          </Link>
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold border-2 border-white cursor-pointer">
            P
          </div>
        </div>
      </header>
      
      {/* Dashboard Component Wrapper */}
      <div className="flex-1 w-full flex flex-col">
        <UserDashboard />
      </div>
    </div>
  );
}
