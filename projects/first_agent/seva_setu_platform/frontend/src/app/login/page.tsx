import React from "react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5] text-[#1C1C1C] flex flex-col lg:flex-row font-sans">
      
      {/* Left Marketing / Information Pane */}
      <div className="lg:w-1/2 bg-[#0F2C59] text-white p-8 md:p-16 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow text-xl font-bold">🇮🇳</div>
            <h1 className="text-2xl font-black tracking-tight text-white">सेवासेतू भारत</h1>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black leading-tight mb-6">
            Access thousands of government schemes securely.
          </h2>
          <p className="text-lg text-white/80 font-medium mb-12">
            Login using your mobile number or DigiLocker to seamlessly fetch documents, verify eligibility, and track applications.
          </p>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="text-2xl">🔒</div>
              <div>
                <h4 className="font-bold">DPDP Act Compliant</h4>
                <p className="text-sm text-white/70">Your data is strictly encrypted and automatically masked.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="text-2xl">🌐</div>
              <div>
                <h4 className="font-bold">Multilingual Support</h4>
                <p className="text-sm text-white/70">Interact in Hindi, Marathi, Kannada, and 12 other languages.</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-white/50 mt-12">© 2024 Seva Setu Government Gateway.</p>
      </div>

      {/* Right Login / Auth Pane */}
      <div className="lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-[#0F2C59]">Welcome Back</h3>
            <p className="text-sm text-gray-500 font-medium">Log in to your citizen account or consultant portal.</p>
          </div>

          {/* Role Switcher */}
          <div className="flex p-1 bg-gray-100 rounded-lg">
            <button className="flex-1 py-2 text-xs font-bold bg-white shadow-sm rounded-md text-[#0F2C59]">Citizen</button>
            <button className="flex-1 py-2 text-xs font-bold text-gray-500 hover:text-gray-800">Consultant / VLE</button>
          </div>

          <form className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="mobile" className="text-xs font-bold text-gray-700">Mobile Number (मोबाईल क्रमांक)</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 font-bold text-sm">
                  +91
                </span>
                <input 
                  type="tel" 
                  id="mobile" 
                  className="flex-1 min-w-0 block w-full px-3 py-2.5 rounded-none rounded-r-md border border-gray-300 focus:ring-[#0F2C59] focus:border-[#0F2C59] sm:text-sm font-bold text-gray-900" 
                  placeholder="Enter 10-digit number"
                />
              </div>
            </div>

            <Link href="/dashboard" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#0F2C59] hover:bg-[#07152c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F2C59] transition">
              Get OTP (ओटीपी मिळवा)
            </Link>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-bold">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard" className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
              <span className="mr-2">📁</span> DigiLocker
            </Link>
            <Link href="/dashboard" className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
              <span className="mr-2">G</span> Google
            </Link>
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            By continuing, you agree to our <a href="#" className="font-bold text-[#0F2C59] hover:underline">Terms of Service</a> and <a href="#" className="font-bold text-[#0F2C59] hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
