import React from "react";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5] flex flex-col">
      {/* Simple exit top bar for standalone page routing */}
      <div className="bg-[#0F2C59] text-white w-full flex justify-end px-4 py-1 text-[10px] uppercase font-bold tracking-widest opacity-80 hover:opacity-100 transition">
        <Link href="/" className="hover:underline">Return to Public Portal</Link>
      </div>

      {/* Admin Interface */}
      <div className="flex-1 w-full flex flex-col">
        <AdminDashboard />
      </div>
    </div>
  );
}
