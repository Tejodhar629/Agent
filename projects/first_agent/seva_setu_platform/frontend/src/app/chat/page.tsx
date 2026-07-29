"use client";

import React, { useState } from "react";
import Link from "next/link";
import ChatWorkspace from "@/components/chat/ChatWorkspace";
import VoiceHUD from "@/components/chat/VoiceHUD";

export default function ChatPage() {
  const [chatMode, setChatMode] = useState<"workspace" | "voice">("workspace");
  const [lang, setLang] = useState("mr");

  return (
    <div className="min-h-screen bg-[#FAFAF5] flex flex-col">
      {/* Only show custom minimal header for Workspace (Voice HUD handles its own header) */}
      {chatMode === "workspace" && (
        <header className="w-full bg-white border-b px-4 py-2 flex items-center justify-between z-40 sticky top-0 shadow-sm">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm font-bold text-gray-500 hover:text-[#0F2C59] flex items-center gap-1">
              <span>← Back</span>
            </Link>
            <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
              <button 
                onClick={() => setChatMode("workspace")} 
                className={`text-xs font-bold px-3 py-1.5 rounded-md transition ${chatMode === "workspace" ? "bg-white shadow text-[#0F2C59]" : "text-gray-500 hover:text-gray-800"}`}
              >
                💬 Chat & Tools
              </button>
              <button 
                onClick={() => setChatMode("voice")} 
                className={`text-xs font-bold px-3 py-1.5 rounded-md transition ${chatMode === "voice" ? "bg-white shadow text-[#0F2C59]" : "text-gray-500 hover:text-gray-800"}`}
              >
                🎤 Voice HUD
              </button>
            </div>
          </div>
          <Link href="/dashboard" className="text-xs font-bold bg-[#0F2C59] text-white px-3 py-1.5 rounded-md hover:bg-[#07152c] transition">
            Go to Dashboard
          </Link>
        </header>
      )}

      {/* Renders Trimodal UI Based on mode selection */}
      <div className="flex-1 w-full flex flex-col h-full relative">
        {chatMode === "workspace" ? (
          <ChatWorkspace />
        ) : (
          <VoiceHUD 
            onSwitchToChat={() => setChatMode("workspace")} 
            language={lang}
            onLanguageChange={(l) => setLang(l)}
          />
        )}
      </div>
    </div>
  );
}
