import React from "react";
import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5] p-8 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-black text-[#0F2C59] mb-4">Refund Policy</h1>
      <Link href="/" className="text-[#1D4ED8] font-bold hover:underline">← Back to Home</Link>
    </div>
  );
}