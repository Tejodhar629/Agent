import React from "react";
import Link from "next/link";

export default function BusinessMsmePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5] p-8 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-black text-[#0F2C59] mb-4">MSME Registration</h1>
      <Link href="/business" className="text-[#1D4ED8] font-bold hover:underline">← Back to Business Services</Link>
    </div>
  );
}