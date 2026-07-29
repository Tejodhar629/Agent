import React from "react";
import Link from "next/link";

export default function PremiumSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5] p-8 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-black text-emerald-600 mb-4">Payment Success</h1>
      <Link href="/dashboard" className="text-[#1D4ED8] font-bold hover:underline">Go to Dashboard →</Link>
    </div>
  );
}