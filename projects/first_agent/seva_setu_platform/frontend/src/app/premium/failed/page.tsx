import React from "react";
import Link from "next/link";

export default function PremiumFailedPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5] p-8 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-black text-red-600 mb-4">Payment Failed</h1>
      <Link href="/premium/checkout" className="text-[#1D4ED8] font-bold hover:underline">Try Again</Link>
    </div>
  );
}