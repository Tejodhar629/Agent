import React, { useState, useEffect, useRef } from "react";

interface VoiceHUDProps {
  onSwitchToChat?: () => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
  isAccessibilityMode?: boolean;
}

const LANGUAGES = [
  { code: "mr", name: "मराठी (Marathi)", native: "मराठी" },
  { code: "hi", name: "हिंदी (Hindi)", native: "हिंदी" },
  { code: "en", name: "English", native: "English" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)", native: "ಕನ್ನಡ" },
  { code: "ta", name: "தமிழ் (Tamil)", native: "தமிழ்" },
  { code: "te", name: "తెలుగు (Telugu)", native: "తెలుగు" }
];

export default function VoiceHUD({
  onSwitchToChat = () => {},
  language = "hi",
  onLanguageChange = () => {},
  isAccessibilityMode = false
}: VoiceHUDProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [subtitles, setSubtitles] = useState("");
  const [aiResponseText, setAiResponseText] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [volumeNodes, setVolumeNodes] = useState<number[]>([10, 10, 10, 10, 10]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioAnimationRef = useRef<NodeJS.Timeout | null>(null);
  const screenReaderAnnouncerRef = useRef<HTMLDivElement | null>(null);

  // Screen reader utility to announce updates
  const announceToScreenReader = (text: string) => {
    if (screenReaderAnnouncerRef.current) {
      screenReaderAnnouncerRef.current.innerText = text;
    }
  };

  // Simulated transcription samples
  const TRANSCRIPTS: Record<string, { query: string; response: string }> = {
    mr: {
      query: "माझा गहू पिकाचा विमा जमा झाला आहे का?",
      response: "होय, आपल्या खात्यामध्ये पीएम फसल बीमा योजनेंतर्गत खरीप २०२४ साठी १३,५०० रुपयांची विमा रक्कम ३० नोव्हेंबर रोजी जमा झाली आहे. अधिक तपशीलासाठी बँक पासबुक तपासा."
    },
    hi: {
      query: "क्या मेरे गेहूं की फसल बीमा का पैसा खाते में जमा हो गया है?",
      response: "हाँ, आपके बैंक खाते में पीएम फसल बीमा योजना के तहत खरीफ २०२४ के लिए १३,५०० रुपये की राशि ३० नवंबर को जमा कर दी गई है। कृपया अपने नजदीकी बैंक शाखा या पासबुक में जांच करें।"
    },
    en: {
      query: "Has my wheat crop insurance money been deposited in my account?",
      response: "Yes, an insurance payout of ₹13,500 under the PM Fasal Bima Yojana for Kharif 2024 has been deposited into your linked bank account on November 30th."
    },
    kn: {
      query: "ನನ್ನ ಗೋಧಿ ಬೆಳೆ ವಿಮೆ ಹಣ ಜಮಾ ಆಗಿದೆಯೇ?",
      response: "ಹೌದು, ಪಿಎಂ ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆಯಡಿ ಖಾರೀಫ್ ೨೦೨೪ ರ ಗೋಧಿ ಬೆಳೆ ವಿಮೆಯ ₹೧೩,೫೦೦ ಹಣ ನವೆಂಬರ್ ೩೦ ರಂದು ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆಯಾಗಿದೆ."
    },
    ta: {
      query: "எனது கோதுமை பயிர் காப்பீட்டு பணம் கணக்கில் வந்துவிட்டதா?",
      response: "ஆம், பிரதமரின் பயிர் காப்பீட்டு திட்டத்தின் கீழ் (PMFBY) காரீஃப் 2024 க்கான உங்களுடைய கோதுமை பயிர் காப்பீட்டு தொகை ₹13,500 நவம்பர் 30 அன்று உங்களது வங்கிக் கணக்கில் செலுத்தப்பட்டுள்ளது."
    },
    te: {
      query: "నా గోధుమ పంట భీమా డబ్బు ఖాతాలో పడిందా?",
      response: "అవును, పీఎం ఫసల్ బీమా యోజన కింద ఖరీఫ్ 2024 కొరకు మీ గోధుమ పంట భీమా సొమ్ము ₹13,500 నవంబర్ 30న మీ బ్యాంక్ ఖాతాలో జమ చేయబడింది."
    }
  };

  // Track timer during recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
        // Simulate volume updates for ripple visualization
        setVolumeNodes(Array.from({ length: 8 }, () => Math.floor(Math.random() * 80) + 20));
      }, 300);
      announceToScreenReader("रेकॉर्डिंग सुरू आहे... (Recording in progress...)");
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
      setVolumeNodes([10, 10, 10, 10, 10]);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Handle Voice Search toggle
  const handleMicToggle = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    }
    
    if (isRecording) {
      // Stopping recording
      setIsRecording(false);
      // Retrieve language-specific simulated response
      const transcript = TRANSCRIPTS[language] || TRANSCRIPTS["hi"];
      setSubtitles(transcript.query);
      announceToScreenReader(`आपण बोलले: "${transcript.query}". उत्तर तयार होत आहे.`);
      
      // Simulate AI Processing lag of 1.2 seconds
      setTimeout(() => {
        setAiResponseText(transcript.response);
        setIsPlayingAudio(true);
        announceToScreenReader(`उत्तर आले आहे: "${transcript.response}". उत्तर आता ऐकवले जात आहे.`);
      }, 1200);
    } else {
      // Starting recording
      setSubtitles("");
      setAiResponseText("");
      setIsRecording(true);
    }
  };

  // Simulate audio playback animation
  useEffect(() => {
    if (isPlayingAudio) {
      audioAnimationRef.current = setInterval(() => {
        setVolumeNodes(Array.from({ length: 12 }, () => Math.floor(Math.random() * 50) + 15));
      }, 150);
    } else {
      if (audioAnimationRef.current) clearInterval(audioAnimationRef.current);
    }
    return () => {
      if (audioAnimationRef.current) clearInterval(audioAnimationRef.current);
    };
  }, [isPlayingAudio]);

  const toggleAudioPlayback = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      announceToScreenReader("उत्तर पुन्हा सुरू केले. (Resumed voice answer.)");
    } else {
      announceToScreenReader("उत्तर थांबवले. (Paused voice answer.)");
    }
  };

  // Format recording timer: mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF5] text-[#1C1C1C] font-sans antialiased selection:bg-[#E07A5F] selection:text-white relative overflow-x-hidden">
      
      {/* Styles Injection for custom keyframes */}
      <style>{`
        @keyframes voiceRipple {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        .animate-ripple-1 {
          animation: voiceRipple 2s infinite ease-out;
        }
        .animate-ripple-2 {
          animation: voiceRipple 2s infinite ease-out 0.6s;
        }
        .animate-ripple-3 {
          animation: voiceRipple 2s infinite ease-out 1.2s;
        }
        @keyframes subtleScale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-subtle-pulse {
          animation: subtleScale 3s infinite ease-in-out;
        }
      `}</style>

      {/* Screen Reader Announcements (Polite) */}
      <div 
        ref={screenReaderAnnouncerRef}
        className="sr-only" 
        role="status" 
        aria-live="polite"
      ></div>

      {/* Top Navigation Bar */}
      <header className="w-full bg-[#0F2C59] text-white border-b border-[#0F2C59]/10 px-4 py-3 md:px-8 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow" aria-hidden="true">
            <span className="text-xl font-bold text-[#0F2C59]">🇮🇳</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">
              सेवासेतू AI <span className="text-xs bg-[#E07A5F] px-1.5 py-0.5 rounded text-white ml-2">Voice HUD</span>
            </h1>
            <p className="text-[10px] md:text-xs text-[#FAFAF5]/80">राष्ट्रीय शासकीय योजना सहाय्यक</p>
          </div>
        </div>

        {/* Accessibility & Language Selectors */}
        <div className="flex items-center space-x-3">
          
          {/* Custom Select Box */}
          <div className="relative">
            <label htmlFor="language-select" className="sr-only">भाषा निवडा / Select Language</label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => {
                onLanguageChange(e.target.value);
                announceToScreenReader(`भाषा बदलली: ${LANGUAGES.find(l => l.code === e.target.value)?.name}`);
              }}
              className="bg-white/15 border border-white/20 hover:border-white/40 text-white rounded px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0F2C59] focus:ring-[#E07A5F] focus:outline-none cursor-pointer h-11"
              style={{ minWidth: "140px" }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-[#1C1C1C] bg-white font-medium">
                  {lang.native}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onSwitchToChat}
            className="flex items-center space-x-2 bg-white text-[#0F2C59] px-4 py-2 rounded-md font-bold text-sm shadow hover:bg-[#FAFAF5] active:scale-95 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0F2C59] focus:ring-[#1D4ED8] focus:outline-none h-11"
            aria-label="चॅट मोडवर स्विच करा (Switch to Conversational Chat)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L1 17l1.338-3.123C1.493 12.76 1 11.434 1 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">चॅट मोड (Chat)</span>
          </button>
        </div>
      </header>

      {/* Main Voice Hub Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 md:py-12 flex flex-col items-center justify-between space-y-10 z-10">
        
        {/* Title/Greeting Area */}
        <section className="text-center space-y-4 w-full">
          <h2 className={`font-bold text-[#0F2C59] leading-tight ${isAccessibilityMode ? "text-4xl" : "text-2xl md:text-3xl"}`}>
            {language === "hi" && "आपला प्रश्न विचारा..."}
            {language === "mr" && "आपले प्रश्न सांगा..."}
            {language === "en" && "Ask your question..."}
            {language === "kn" && "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ..."}
            {language === "ta" && "உங்களுடைய கேள்வியைக் கேளுங்கள்..."}
            {language === "te" && "మీ ప్రశ్నను అడగండి..."}
          </h2>
          <p className={`text-[#1C1C1C]/70 max-w-lg mx-auto ${isAccessibilityMode ? "text-xl" : "text-sm md:text-base"}`}>
            {language === "hi" && "नीचे दिए गए बटन को दबाकर अपनी क्षेत्रीय बोली में बोलें।"}
            {language === "mr" && "खालील बटण दाबून आपल्या मातृभाषेत किंवा प्रादेशिक भाषेत बोला."}
            {language === "en" && "Tap the microphone below and speak naturally in your mother tongue."}
            {language === "kn" && "ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ."}
            {language === "ta" && "கீழே உள்ள பொத்தானை அழுத்தி உங்கள் தாய்மொழியில் பேசுங்கள்."}
            {language === "te" && "క్రింది బటన్ నొక్కి మీ మాతృభాషలో మాట్లాడండి."}
          </p>
        </section>

        {/* Central HUD Mic Controls */}
        <section className="relative flex flex-col items-center justify-center py-8 my-auto w-full max-w-md">
          
          {/* Animated concentric ripples during recording */}
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              <div className="absolute w-56 h-56 rounded-full bg-red-500/25 animate-ripple-1"></div>
              <div className="absolute w-56 h-56 rounded-full bg-red-500/20 animate-ripple-2"></div>
              <div className="absolute w-56 h-56 rounded-full bg-red-500/10 animate-ripple-3"></div>
            </div>
          )}

          {/* Micro-volumetric pulses visual indicator */}
          {!isRecording && isPlayingAudio && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
              <div className="absolute w-64 h-64 rounded-full bg-green-500/10 animate-subtle-pulse"></div>
            </div>
          )}

          {/* Mic Button Cylinder */}
          <div className="relative z-20">
            <button
              onClick={handleMicToggle}
              aria-pressed={isRecording}
              aria-label={
                language === "mr" 
                  ? "सुरू करा - बोला आणि शोधा (Start Voice Search)" 
                  : "प्रारंभ करें - बोलें और खोजें (Start Voice Search)"
              }
              className={`w-32 h-32 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-dashed focus:ring-[#1D4ED8] focus:ring-offset-4 ${
                isRecording 
                  ? "bg-red-600 hover:bg-red-700 text-white scale-105" 
                  : isPlayingAudio 
                  ? "bg-[#1F4E3D] hover:bg-[#153429] text-white" 
                  : "bg-[#0F2C59] hover:bg-[#07152c] text-white hover:scale-105"
              }`}
            >
              {/* Dynamic status labels or icons */}
              {isRecording ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10v1a7 7 0 03-14 0v-1m14 0a9 9 0 00-18 0v1" />
                  </svg>
                  <span className="text-xs font-bold uppercase mt-2 tracking-widest">{formatTimer(recordingSeconds)}</span>
                </>
              ) : isPlayingAudio ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .9-1.077 1.346-1.707.707L5.586 15z" />
                  </svg>
                  <span className="text-xs font-bold uppercase mt-2 tracking-widest">वाजवत आहे</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span className="text-xs font-bold uppercase mt-1 tracking-wider">
                    {language === "mr" && "बोला (Speak)"}
                    {language === "hi" && "बोलें (Speak)"}
                    {language === "en" && "Tap to Speak"}
                    {language === "kn" && "ಮಾತನಾಡಿ"}
                    {language === "ta" && "பேசுங்கள்"}
                    {language === "te" && "మాట్లాడండి"}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Volume wave nodes rendering */}
          {isRecording && (
            <div className="flex items-center space-x-1.5 mt-8 h-12" aria-hidden="true">
              {volumeNodes.map((height, idx) => (
                <div
                  key={idx}
                  className="w-1.5 bg-red-600 rounded-full transition-all duration-150"
                  style={{ height: `${Math.max(8, height)}px` }}
                ></div>
              ))}
            </div>
          )}

          {isPlayingAudio && (
            <div className="flex items-center space-x-1 mt-8 h-10" aria-hidden="true">
              {volumeNodes.map((height, idx) => (
                <div
                  key={idx}
                  className="w-1 bg-[#1F4E3D] rounded-full transition-all duration-150"
                  style={{ height: `${Math.max(6, height * 0.7)}px` }}
                ></div>
              ))}
            </div>
          )}
        </section>

        {/* Real-time Subtitles / Transcription Box */}
        {(subtitles || aiResponseText) && (
          <section className="w-full bg-white rounded-xl border border-[#0F2C59]/10 shadow-lg p-6 space-y-4 z-20">
            {subtitles && (
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E07A5F]">
                  {language === "mr" && "तुमचे बोलणे (Your Speech)"}
                  {language === "hi" && "आपके शब्द (Your Speech)"}
                  {language === "en" && "You Said"}
                  {language === "kn" && "ನಿಮ್ಮ ಮಾತು"}
                  {language === "ta" && "நீங்கள் பேசியது"}
                  {language === "te" && "మీరు పలికినది"}
                </span>
                <p className={`font-semibold text-[#1C1C1C] ${isAccessibilityMode ? "text-2xl" : "text-lg md:text-xl"}`}>
                  “{subtitles}”
                </p>
              </div>
            )}

            {aiResponseText && (
              <div className="pt-4 border-t border-[#0F2C59]/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1F4E3D] flex items-center">
                      सेवासेतू उत्तर (AI Response)
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#1F4E3D]/10 text-[#1F4E3D] border border-[#1F4E3D]/20">
                        ✓ Verified Source (.gov.in)
                      </span>
                    </span>
                  </div>
                  
                  {/* Listen Toggle */}
                  <button
                    onClick={toggleAudioPlayback}
                    className="flex items-center space-x-1.5 text-xs text-[#0F2C59] hover:text-[#1D4ED8] font-bold focus:ring-2 focus:ring-[#1D4ED8] focus:outline-none p-1.5 rounded"
                    aria-label={isPlayingAudio ? "ऑडिओ थांबवा (Pause Audio)" : "ऑडिओ ऐका (Listen to Audio)"}
                  >
                    {isPlayingAudio ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>थांबवा (Pause)</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        <span>ऐका (Listen)</span>
                      </>
                    )}
                  </button>
                </div>
                <p className={`text-[#1C1C1C] leading-relaxed font-medium ${isAccessibilityMode ? "text-2xl" : "text-base md:text-lg"}`}>
                  {aiResponseText}
                </p>

                {/* CITATIONS BAR */}
                <div className="pt-3 flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-gray-500 font-bold">संदर्भ (Sources):</span>
                  <a
                    href="https://pmfby.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-[#1D4ED8] font-bold hover:underline bg-[#1D4ED8]/5 border border-[#1D4ED8]/10 px-2 py-1 rounded"
                    aria-label="पीएम फसल बीमा योजना पोर्टल - नवीन टॅबमध्ये उघडते (Opens in new tab)"
                  >
                    <span>pmfby.gov.in</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Global Control Toggles & FAQ Chips */}
        <section className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#0F2C59]/10 z-10">
          
          {/* Quick FAQ Suggestion */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-500">उदाहरणे (Try):</span>
            <button
              onClick={() => {
                setSubtitles(
                  language === "mr" 
                    ? "माझा गहू पिकाचा विमा जमा झाला आहे का?" 
                    : "क्या मेरे गेहूं की फसल बीमा का पैसा खाते में जमा हो गया है?"
                );
                // Trigger simulated flow directly
                const transcript = TRANSCRIPTS[language] || TRANSCRIPTS["hi"];
                announceToScreenReader(`उदाहरणे निवडली: "${transcript.query}". उत्तर तयार होत आहे.`);
                setTimeout(() => {
                  setAiResponseText(transcript.response);
                  setIsPlayingAudio(true);
                  announceToScreenReader(`उत्तर आले आहे: "${transcript.response}".`);
                }, 1000);
              }}
              className="text-xs font-bold text-[#0F2C59] bg-[#0F2C59]/5 hover:bg-[#0F2C59]/10 px-3 py-1.5 rounded-full border border-[#0F2C59]/10 transition-all h-9 flex items-center"
            >
              🌾 पीक विमा चौकशी (Crop Insurance query)
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Audio Loopback Test / Playback Controls */}
            <button
              onClick={() => {
                const transcript = TRANSCRIPTS[language] || TRANSCRIPTS["hi"];
                setAiResponseText(transcript.response);
                setIsPlayingAudio(!isPlayingAudio);
                announceToScreenReader("पुन्हा खेळा आवाज (Replaying voice answer)");
              }}
              className="flex items-center space-x-1 text-xs text-[#0F2C59] hover:text-[#1D4ED8] font-bold p-2 focus:ring-2 focus:ring-[#1D4ED8] focus:outline-none"
              aria-label="पुन्हा ऐका (Replay Voice Answer)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.005a1 1 0 01.937.715A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>पुन्हा ऐका (Replay Answer)</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer Branding block */}
      <footer className="w-full text-center py-4 text-xs text-[#1C1C1C]/50 border-t border-[#0F2C59]/10 bg-[#FAFAF5]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p>© २०२४ सेवासेतू भारत. भारत सरकारच्या अधिकृत डिजिटल सार्वजनिक पायाभूत प्रणालींवर आधारित.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:underline hover:text-[#0F2C59]">वापराच्या अटी (Terms)</a>
            <a href="#" className="hover:underline hover:text-[#0F2C59]">गोपनीयता धोरण (Privacy)</a>
            <a href="#" className="hover:underline hover:text-[#0F2C59]">GIGW ३.० सुसंगतता</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
