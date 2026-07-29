import React, { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  citations?: Array<{ title: string; url: string }>;
  isVerified?: boolean;
}

interface SchemeEligibility {
  name: string;
  limit: number;
  description: string;
  status: "eligible" | "ineligible" | "warning";
}

export default function ChatWorkspace() {
  const [activeTab, setActiveTab] = useState<"chat" | "workspace">("chat"); // For responsive layouts
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: "नमस्ते! मी सेवासेतू AI सहाय्यक आहे. मी आपल्याला शासकीय योजना शोधण्यात, पात्रता तपासण्यात आणि अर्जांची तयारी करण्यास मदत करू शकतो. आपण इंग्रजी, हिंदी किंवा मराठी भाषेत प्रश्न विचारू शकता.",
      timestamp: "10:14 AM",
      isVerified: true
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Dynamic Workspace State - Income Slider
  const [annualIncome, setAnnualIncome] = useState(250000); // Default ₹2.5 Lakhs
  
  // Dynamic Workspace State - MUDRA Loan EMI Calculator
  const [loanAmount, setLoanAmount] = useState(300000); // Default ₹3 Lakhs
  const [loanTenure, setLoanTenure] = useState(3); // Default 3 years
  const interestRate = 8.5; // Standard 8.5%

  // Dynamic Workspace State - Document Dropzone Masker
  const [uploadState, setUploadState] = useState<"idle" | "scanning" | "completed">("idle");
  const [uploadedDocType, setUploadedDocType] = useState<"aadhaar" | "pan" | "khasra">("aadhaar");
  const [maskedDocOutput, setMaskedDocOutput] = useState<{
    name: string;
    idMasked: string;
    verified: boolean;
  } | null>(null);

  // Dynamic Scheme Eligibility List (updates when annual income slider shifts)
  const [schemesList, setSchemesList] = useState<SchemeEligibility[]>([
    { name: "पीएम-किसान सन्मान निधी (PM-KISAN)", limit: 300000, description: "वार्षिक ₹६००० थेट बँक खात्यात.", status: "eligible" },
    { name: "आयुष्मान भारत विमा योजना (Ayushman Bharat)", limit: 500000, description: "₹५ लाखांपर्यंत मोफत आरोग्य उपचार विमा.", status: "eligible" },
    { name: "उद्यम योजना मुद्रा कर्ज (MUDRA Kishor)", limit: 800000, description: "लघु व्यवसायांसाठी ₹५ लाखांपर्यंत खेळते भांडवल कर्ज.", status: "eligible" },
    { name: "पोस्ट-मॅट्रिक शिष्यवृत्ती (Post-Matric Scholarship)", limit: 250000, description: "मागासवर्गीय विद्यार्थ्यांसाठी शिक्षण शुल्क परतावा.", status: "eligible" }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const screenReaderAnnouncerRef = useRef<HTMLDivElement | null>(null);

  // Utility to announce things dynamically to screen readers
  const announceToScreenReader = (text: string) => {
    if (screenReaderAnnouncerRef.current) {
      screenReaderAnnouncerRef.current.innerText = text;
    }
  };

  // Autoscroll message viewport
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Recalculate schemes eligibility dynamically when annualIncome moves
  useEffect(() => {
    const updated = schemesList.map((scheme) => {
      let status: "eligible" | "ineligible" | "warning" = "eligible";
      if (annualIncome > scheme.limit) {
        status = "ineligible";
      } else if (annualIncome > scheme.limit * 0.8) {
        status = "warning";
      }
      return { ...scheme, status };
    });
    setSchemesList(updated);
  }, [annualIncome]);

  // Execute Simulated AI Response Generation based on triggers
  const executeAIResponse = (userText: string) => {
    setIsTyping(true);
    let matchedReply = "";
    let citations: Message["citations"] = [];

    const normalized = userText.toLowerCase();

    if (normalized.includes("mudra") || normalized.includes("कर्ज") || normalized.includes("loan")) {
      matchedReply = `आपल्या प्रोफाइलनुसार, आपण **मुद्रा किशोर कर्ज योजनेसाठी (MUDRA Kishor)** पात्र आहात. ८.५% व्याजदरावर आपण कर्ज मिळवू शकता. उजव्या बाजूच्या कॅल्क्युलेटरवर आम्ही ५ वर्षांच्या कालावधीसाठी मासिक हप्त्याचे (EMI) पूर्ण गणित मांडले आहे, आपण तिथून बदल करून पाहू शकता.`;
      citations = [{ title: "MUDRA Loan Portal - Govt of India", url: "https://www.mudra.org.in" }];
    } else if (normalized.includes("aadhaar") || normalized.includes("आधार") || normalized.includes("mask") || normalized.includes("verify")) {
      matchedReply = `आपल्या सुरक्षिततेसाठी, आमच्या कृत्रिम बुद्धिमत्ता प्रणालीने आपल्या आधार क्रमांकातील पहिले ८ अंक स्वयंचलितपणे आणि सुरक्षितपणे बदलले आहेत (**XXXX-XXXX**). आता उजव्या बाजूच्या 'दस्तऐवज पडताळणी' पॅनेलमध्ये आपण मास्क केलेले विवरण तपासू शकता आणि शासकीय पडताळणीसाठी पुढे जाऊ शकता.`;
      citations = [{ title: "UIDAI e-Aadhaar Guidelines", url: "https://uidai.gov.in" }];
    } else if (normalized.includes("income") || normalized.includes("उत्पन्न") || normalized.includes("eligibility") || normalized.includes("पात्रता")) {
      matchedReply = `तुमच्या वार्षिक उत्पन्नानुसार म्हणजेच ₹${(annualIncome / 100000).toFixed(1)} लाख नुसार योजनांच्या पात्रतेमध्ये बदल करण्यात आला आहे. उजवीकडील **पात्रता कॅल्क्युलेटर** वापरून तुम्ही उत्पन्न मोजपट्टी सरकवू शकता. पीएम-किसान आणि आयुष्यमान भारत योजनांमध्ये आवश्यकतेनुसार बदल स्वयंचलितपणे दिसून येतील.`;
      citations = [{ title: "National Welfare Directory", url: "https://myscheme.gov.in" }];
    } else {
      matchedReply = `आपल्या विनंतीची नोंद घेतली आहे. आम्ही whitelisted .gov.in स्त्रोतांमध्ये शोध घेऊन योग्य तो निकाल मिळवला आहे. आपल्या गरजेनुसार आपण उजवीकडील पॅनेलवरील साधने (दस्तऐवज मास्किंग किंवा कर्ज कॅल्क्युलेटर) वापरू शकता.`;
      citations = [{ title: "MyScheme India Gateway", url: "https://www.myscheme.gov.in" }];
    }

    setTimeout(() => {
      setIsTyping(false);
      const newAiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text: matchedReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations,
        isVerified: true
      };
      setMessages((prev) => [...prev, newAiMsg]);
      announceToScreenReader(`सेवासेतू AI कडून नवीन उत्तर आले आहे: ${matchedReply}`);
    }, 1500);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
    announceToScreenReader(`आपण पाठवलेला संदेश: "${userText}". सेवासेतू उत्तर तयार करत आहे...`);
    executeAIResponse(userText);
  };

  // Simulated dropzone actions
  const triggerDocumentProcessing = (type: "aadhaar" | "pan" | "khasra") => {
    setUploadedDocType(type);
    setUploadState("scanning");
    announceToScreenReader(`दस्तऐवज अपलोड होत आहे. स्थानिक पातळीवर स्कॅनिंग आणि आधार सुरक्षा मास्किंग सुरू आहे, कृपया वाट पहा.`);

    setTimeout(() => {
      setUploadState("completed");
      if (type === "aadhaar") {
        setMaskedDocOutput({
          name: "PRIYA ARVIND SHARMA",
          idMasked: "XXXX-XXXX-8924",
          verified: true
        });
        announceToScreenReader(`आधार यशस्वीरीत्या मास्क केले गेले आहे. पहिले ८ अंक सुरक्षितपणे बदलले आहेत. अंतिम ४ अंक: ८९२४. पडताळणी पूर्ण झाली.`);
        
        // Push a direct AI message confirming the upload
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-doc-${Date.now()}`,
            sender: "ai",
            text: "मी आपल्या आधार कार्डची पडताळणी पूर्ण केली आहे. सुरक्षा नियमांनुसार मी पहिले ८ अंक मुखवटा लावून लपवून ठेवले आहेत (**XXXX-XXXX-8924**). ही संपूर्ण प्रक्रिया स्थानिक पातळीवर आपल्याच मोबाईल/संगणकावर झाली असून सर्व्हरवर कोणताही कच्चा डेटा पाठवला गेलेला नाही. आपण मुद्रा कर्ज अर्जासाठी पात्र आहात.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            citations: [{ title: "UIDAI Data Vault Compliance", url: "https://uidai.gov.in" }],
            isVerified: true
          }
        ]);
      } else if (type === "pan") {
        setMaskedDocOutput({
          name: "PRIYA ARVIND SHARMA",
          idMasked: "XXXXX4921K",
          verified: true
        });
        announceToScreenReader(`पॅन कार्ड यशस्वीरीत्या स्कॅन आणि मास्क केले गेले आहे.`);
      } else {
        setMaskedDocOutput({
          name: "PRIYA ARVIND SHARMA",
          idMasked: "Survey No. 104/A - Unnao",
          verified: true
        });
        announceToScreenReader(`खसरा जमीन महसूल दस्तऐवज स्कॅन केला आहे. जमिनीचे क्षेत्रफळ: १.८ हेक्टर.`);
      }
    }, 1800);
  };

  // MUDRA Loan EMI math formulas
  const calculateEMI = () => {
    const P = loanAmount;
    const r = (interestRate / 12) / 100;
    const n = loanTenure * 12;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    return {
      monthlyEMI: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment)
    };
  };

  const { monthlyEMI, totalInterest, totalPayment } = calculateEMI();

  // Rupees formatting in Lakhs
  const formatRupees = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} लाख (Lakh)`;
    }
    return `₹${value.toLocaleString("en-IN")}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF5] text-[#1C1C1C] font-sans selection:bg-[#E07A5F] selection:text-white">
      
      {/* Screen reader dynamic update region */}
      <div
        ref={screenReaderAnnouncerRef}
        className="sr-only"
        role="status"
        aria-live="polite"
      ></div>

      {/* Top Header Block */}
      <header className="w-full bg-[#0F2C59] text-white border-b border-[#0F2C59]/15 px-4 py-3 md:px-8 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow" aria-hidden="true">
            <span className="text-xl font-bold text-[#0F2C59]">🇮🇳</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight flex items-center">
              जन सेवा AI <span className="ml-2 text-xs bg-emerald-600 px-2 py-0.5 rounded text-white font-semibold">SevaSetu Chat</span>
            </h1>
            <p className="text-[10px] md:text-xs text-[#FAFAF5]/80">शासकीय योजना व पात्रता माहिती दालन</p>
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center space-x-3">
          <span className="text-xs bg-[#E07A5F] px-2.5 py-1 rounded-full text-white font-bold flex items-center space-x-1 shadow-sm">
            <span>👑 Gold Member</span>
          </span>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold border border-white/10" aria-label="वापरकर्ता प्रोफाइल (User Profile)">
            P
          </div>
        </div>
      </header>

      {/* Mobile-only Navigation Tabs (for screens below 1024px) */}
      <div className="lg:hidden flex bg-[#0F2C59]/5 border-b border-[#0F2C59]/10 p-1.5 sticky top-[65px] z-40">
        <button
          onClick={() => {
            setActiveTab("chat");
            announceToScreenReader("संवाद चॅट सहाय्यक सक्रिय केला.");
          }}
          className={`flex-1 py-2.5 text-center font-bold text-sm rounded-md transition-all h-11 ${
            activeTab === "chat"
              ? "bg-[#0F2C59] text-white shadow"
              : "text-[#0F2C59] hover:bg-[#0F2C59]/10"
          }`}
          aria-selected={activeTab === "chat"}
          role="tab"
        >
          💬 चॅट सहाय्यक (Chat Assistant)
        </button>
        <button
          onClick={() => {
            setActiveTab("workspace");
            announceToScreenReader("पडताळणी आणि पात्रता कॅल्क्युलेटर सक्रिय केला.");
          }}
          className={`flex-1 py-2.5 text-center font-bold text-sm rounded-md transition-all h-11 ${
            activeTab === "workspace"
              ? "bg-[#0F2C59] text-white shadow"
              : "text-[#0F2C59] hover:bg-[#0F2C59]/10"
          }`}
          aria-selected={activeTab === "workspace"}
          role="tab"
        >
          📊 पात्रता मोजणी व सुरक्षा (Workspace)
        </button>
      </div>

      {/* Main Responsive Split Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 px-0 md:px-4 lg:px-6 py-0 lg:py-6 h-[calc(100vh-125px)] overflow-hidden">
        
        {/* LEFT CHAT PANE (Cols: 7) */}
        <section
          className={`lg:col-span-7 flex flex-col bg-white border border-[#0F2C59]/10 rounded-none lg:rounded-xl shadow-lg overflow-hidden h-full ${
            activeTab === "chat" ? "flex" : "hidden lg:flex"
          }`}
          role="region"
          aria-label="चॅट संवाद विभाग (Conversational Chat)"
        >
          {/* Active Consultation Header inside Chat Pane */}
          <div className="bg-[#FAFAF5] border-b border-[#0F2C59]/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs font-bold text-[#0F2C59] uppercase tracking-wider">MUDRA Loan & Agriculture Assistance Desk</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] bg-[#1F4E3D]/10 text-[#1F4E3D] border border-[#1F4E3D]/30 px-2 py-0.5 rounded font-bold uppercase">
                DPDP SAFE
              </span>
            </div>
          </div>

          {/* Message List viewport */}
          <div 
            className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-[#FAFAF5]/30 scrollbar-thin"
            role="log"
            aria-label="संदेश इतिहास (Chat Message Log)"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                {/* Sender badge */}
                <span className="text-[10px] text-gray-500 font-bold mb-1 mx-1">
                  {msg.sender === "user" ? "आपण (You)" : "सेवासेतू AI"} • {msg.timestamp}
                </span>

                {/* Speech Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm border ${
                    msg.sender === "user"
                      ? "bg-[#0F2C59] text-white border-[#0F2C59] rounded-tr-none"
                      : "bg-white text-[#1C1C1C] border-[#0F2C59]/15 rounded-tl-none"
                  }`}
                >
                  {/* Verified badge for AI */}
                  {msg.sender === "ai" && msg.isVerified && (
                    <div className="flex items-center space-x-1.5 mb-2 pb-1.5 border-b border-gray-100" aria-hidden="true">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                        Verified Government Source
                      </span>
                    </div>
                  )}

                  {/* Message body text */}
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-line font-medium">
                    {msg.text}
                  </p>

                  {/* Render citations chips if available */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#0F2C59]/10 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-400">संदर्भ (Sources):</span>
                      {msg.citations.map((cite, index) => (
                        <a
                          key={index}
                          href={cite.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-[#1D4ED8] font-bold hover:underline bg-[#1D4ED8]/5 border border-[#1D4ED8]/20 px-2 py-0.5 rounded"
                          aria-label={`${cite.title} - नवीन टॅबमध्ये उघडते`}
                        >
                          <span>{cite.title}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex flex-col items-start max-w-[80%]">
                <span className="text-[10px] text-gray-400 font-bold mb-1 mx-1">सेवासेतू विचार करत आहे...</span>
                <div className="bg-white border border-[#0F2C59]/10 rounded-2xl rounded-tl-none px-4 py-3.5 shadow-sm flex items-center space-x-1.5 h-11" aria-hidden="true">
                  <span className="w-2.5 h-2.5 bg-[#E07A5F] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2.5 h-2.5 bg-[#E07A5F] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2.5 h-2.5 bg-[#E07A5F] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips above inputs */}
          <div className="px-4 py-2 bg-[#FAFAF5] border-t border-[#0F2C59]/10 flex items-center space-x-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 select-none">त्वरित प्रश्न:</span>
            
            <button
              onClick={() => {
                setInputValue("MUDRA Loan मुद्रा कर्ज योजनेची पात्रता काय आहे?");
                announceToScreenReader("पत्ता आणि मुद्रा कर्ज पात्रता पर्याय निवडला.");
              }}
              className="inline-block bg-white text-xs font-bold text-[#0F2C59] border border-[#0F2C59]/15 hover:bg-[#0F2C59]/5 px-3 py-1.5 rounded-full transition shadow-sm h-8"
            >
              💼 मुद्रा कर्ज पात्रता (MUDRA Eligibility)
            </button>

            <button
              onClick={() => {
                setInputValue("माझे आधार कार्ड मास्क करून तपासा.");
                announceToScreenReader("आधार मास्किंग आणि तपासणी पर्याय निवडला.");
              }}
              className="inline-block bg-white text-xs font-bold text-[#0F2C59] border border-[#0F2C59]/15 hover:bg-[#0F2C59]/5 px-3 py-1.5 rounded-full transition shadow-sm h-8"
            >
              🛡️ आधार मास्किंग पडताळणी (Aadhaar Masking)
            </button>

            <button
              onClick={() => {
                setInputValue("वार्षिक उत्पन्न पात्रता तपासा.");
                announceToScreenReader("वार्षिक उत्पन्न पात्रता पर्याय निवडला.");
              }}
              className="inline-block bg-white text-xs font-bold text-[#0F2C59] border border-[#0F2C59]/15 hover:bg-[#0F2C59]/5 px-3 py-1.5 rounded-full transition shadow-sm h-8"
            >
              🌾 उत्पन्न मर्यादा बदल (Income thresholds)
            </button>
          </div>

          {/* Form and Input Section */}
          <form 
            onSubmit={handleSendMessage}
            className="p-4 bg-white border-t border-[#0F2C59]/10 flex items-center space-x-3"
            role="search"
            aria-label="चॅटमध्ये प्रश्न पाठवा"
          >
            {/* Attach trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  triggerDocumentProcessing("aadhaar");
                  announceToScreenReader("आधार कार्ड अपलोड सुरू झाले.");
                }}
                className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95 focus:ring-2 focus:ring-[#1D4ED8] focus:outline-none"
                aria-label="फाईल अपलोड करा (Attach Aadhaar/PAN Document)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
            </div>

            {/* Input field */}
            <div className="flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="योजना किंवा पात्रतेविषयी काहीही विचारा..."
                className="w-full bg-gray-50 border border-gray-300 focus:border-[#0F2C59] focus:bg-white rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-[#0F2C59] focus:outline-none h-12"
                aria-label="तुमचा प्रश्न येथे टाईप करा (Type your query here)"
              />
            </div>

            {/* Mic placeholder trigger */}
            <button
              type="button"
              onClick={() => {
                setInputValue("माझा पीक विमा जमा झाला का?");
                announceToScreenReader("व्हॉईस चॅट इनपुट सुरू.");
              }}
              className="flex items-center justify-center w-12 h-12 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 focus:ring-2 focus:ring-[#1D4ED8] focus:outline-none"
              aria-label="बोला - आवाज रेकॉर्डिंग (Speak query)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7.001 7.001 0 005 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Send button */}
            <button
              type="submit"
              className="bg-[#0F2C59] hover:bg-[#07152c] text-white px-5 py-3 rounded-lg font-bold text-sm shadow hover:scale-102 transition h-12 flex items-center justify-center min-w-[70px] focus:ring-2 focus:ring-offset-2 focus:ring-[#1D4ED8] focus:outline-none"
              aria-label="संदेश पाठवा (Send Message)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </section>

        {/* RIGHT DYNAMIC WORKSPACE PANE (Cols: 5) */}
        <section
          className={`lg:col-span-5 flex flex-col bg-white border border-[#0F2C59]/10 rounded-none lg:rounded-xl shadow-lg overflow-hidden h-full ${
            activeTab === "workspace" ? "flex" : "hidden lg:flex"
          }`}
          role="region"
          aria-label="योजना कॅल्क्युलेटर व दस्तऐवज पडताळणी विभाग"
        >
          {/* Tabs header for Right Pane */}
          <div className="bg-[#0F2C59]/5 border-b border-[#0F2C59]/10 flex" role="tablist">
            <div className="px-4 py-3 text-xs font-bold text-[#0F2C59] uppercase tracking-wider flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#E07A5F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>योजना पात्रता टूलकिट (Welfare Toolkit)</span>
            </div>
          </div>

          {/* Internal scrollable container for tools */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6 scrollbar-thin bg-gray-50/50">
            
            {/* Tool 1: Dynamic Income Eligibility Slider */}
            <div className="bg-white rounded-xl p-4 border border-[#0F2C59]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F2C59] uppercase tracking-wider">१. वार्षिक उत्पन्न पात्रता मोजपट्टी</h3>
                <span className="text-xs bg-[#0F2C59]/5 text-[#0F2C59] px-2 py-0.5 rounded font-bold border border-[#0F2C59]/10">
                  Income Slider
                </span>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="annual-income-slider" className="sr-only">वार्षिक उत्पन्न निवडा (Select annual income)</label>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">निवडलेले वार्षिक उत्पन्न:</span>
                  <span className="text-base font-bold text-[#0F2C59] bg-[#FAFAF5] border border-[#0F2C59]/15 px-3 py-1 rounded">
                    {formatRupees(annualIncome)}
                  </span>
                </div>

                {/* The Color-Coded Thick Track Slider */}
                <div className="relative pt-4 pb-2">
                  <div className="absolute top-1/2 left-0 right-0 h-4 rounded-full -translate-y-1/2 bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500" aria-hidden="true" />
                  <input
                    type="range"
                    id="annual-income-slider"
                    min="50000"
                    max="1000000"
                    step="25000"
                    value={annualIncome}
                    onChange={(e) => {
                      setAnnualIncome(Number(e.target.value));
                      announceToScreenReader(`वार्षिक उत्पन्न बदलले: ${formatRupees(Number(e.target.value))}`);
                    }}
                    role="slider"
                    aria-valuemin={50000}
                    aria-valuemax={1000000}
                    aria-valuenow={annualIncome}
                    aria-valuetext={`वार्षिक उत्पन्न - ${annualIncome} रुपये`}
                    className="relative z-10 w-full h-4 bg-transparent appearance-none cursor-pointer focus:outline-none"
                    style={{
                      WebkitAppearance: "none",
                    }}
                  />
                  {/* Inline custom CSS for massive 32px slider thumb */}
                  <style>{`
                    #annual-income-slider::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      appearance: none;
                      width: 32px;
                      height: 32px;
                      border-radius: 50%;
                      background: #0F2C59;
                      border: 3px solid #FAFAF5;
                      cursor: pointer;
                      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                      transition: transform 0.1s ease;
                    }
                    #annual-income-slider::-webkit-slider-thumb:hover {
                      transform: scale(1.15);
                    }
                    #annual-income-slider::-webkit-slider-thumb:active {
                      transform: scale(1.25);
                      border-color: #E07A5F;
                    }
                  `}</style>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-bold px-1" aria-hidden="true">
                  <span>₹५० हजार (Highly Eligible)</span>
                  <span>₹५ लाख (Medium)</span>
                  <span>₹१० लाख (Ineligible)</span>
                </div>
              </div>

              {/* Dynamic Eligibility Checklists */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">योजना पात्रता स्थिती (Calculated Eligibility):</p>
                <div className="space-y-1.5">
                  {schemesList.map((scheme, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start justify-between p-2.5 rounded-lg border text-xs font-bold ${
                        scheme.status === "eligible"
                          ? "bg-emerald-50 border-emerald-200 text-[#1F4E3D]"
                          : scheme.status === "warning"
                          ? "bg-amber-50 border-amber-200 text-amber-800"
                          : "bg-red-50 border-red-200 text-red-800"
                      }`}
                    >
                      <div>
                        <p>{scheme.name}</p>
                        <p className="text-[10px] font-medium opacity-80">{scheme.description}</p>
                      </div>
                      <span className="shrink-0 font-extrabold uppercase text-[10px] px-1.5 py-0.5 rounded border">
                        {scheme.status === "eligible" && "✓ पात्र"}
                        {scheme.status === "warning" && "⚠ मर्यादित"}
                        {scheme.status === "ineligible" && "✗ अपात्र"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tool 2: Secure Document Dropzone (with Auto-Masking Indicator) */}
            <div className="bg-white rounded-xl p-4 border border-[#0F2C59]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F2C59] uppercase tracking-wider">२. दस्तऐवज मास्किंग आणि पडताळणी</h3>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">
                  CLIENT-SIDE SECURE
                </span>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                तुमच्या खाजगी गोपनीयतेसाठी, तुमचे कागदपत्र अपलोड करताच आमच्या प्रणालीद्वारे त्यातील खाजगी ओळख क्र. स्वयंचलितपणे खोडून (mask) सुरक्षित केले जातात.
              </p>

              {/* Dropzone Container */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  uploadState === "scanning"
                    ? "bg-[#E07A5F]/5 border-[#E07A5F] scale-[0.99]"
                    : "bg-gray-50 hover:bg-gray-100 border-[#0F2C59]/20 hover:border-[#0F2C59]/40"
                }`}
                role="region"
                aria-describedby="upload-security-note"
              >
                {uploadState === "idle" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      {/* Upload triggers */}
                      <button
                        type="button"
                        onClick={() => triggerDocumentProcessing("aadhaar")}
                        className="bg-white hover:bg-gray-50 border border-gray-300 text-xs font-bold text-[#0F2C59] px-3 py-2 rounded shadow-sm focus:ring-2 focus:ring-[#1D4ED8]"
                      >
                        📂 आधार अपलोड (Aadhaar)
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerDocumentProcessing("pan")}
                        className="bg-white hover:bg-gray-50 border border-gray-300 text-xs font-bold text-[#0F2C59] px-3 py-2 rounded shadow-sm focus:ring-2 focus:ring-[#1D4ED8]"
                      >
                        💳 पॅन कार्ड (PAN)
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 font-bold">किंवा दस्तऐवज ओढा आणि येथे सोडा (Drag and Drop files here)</p>
                  </div>
                )}

                {uploadState === "scanning" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-[#E07A5F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-xs font-bold text-[#E07A5F] uppercase tracking-wider">आधार डेटा खोडणे आणि मास्क प्रक्रिया सुरू...</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#E07A5F] h-2 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                )}

                {uploadState === "completed" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2 text-emerald-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">मास्क दस्तऐवज पडताळणी यशस्वी!</span>
                    </div>

                    {/* Masked Output result display */}
                    {maskedDocOutput && (
                      <div className="bg-emerald-50 rounded-lg p-3 text-left border border-emerald-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900">नाव: {maskedDocOutput.name}</span>
                          <span className="bg-emerald-600 text-white text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border border-emerald-400 flex items-center">
                            🛡️ Masked Guard [OK]
                          </span>
                        </div>
                        <p className="font-semibold text-emerald-800">
                          {uploadedDocType === "aadhaar" ? "सुरक्षित आधार ओळख क्र:" : "सुरक्षित पॅन क्र:"}{" "}
                          <span className="font-mono text-sm tracking-wider font-extrabold">{maskedDocOutput.idMasked}</span>
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setUploadState("idle")}
                      className="text-[10px] text-gray-500 hover:text-gray-700 underline font-bold"
                    >
                      दुसरे दस्तऐवज अपलोड करा (Upload Another Document)
                    </button>
                  </div>
                )}
              </div>
              <p id="upload-security-note" className="text-[10px] text-gray-400 font-bold text-center">
                🛡️ UIDAI आणि DPDP कायदा (2023) अंतर्गत: आम्ही कधीही सर्व्हरवर तुमचा raw १२-अंकी आधार क्रमांक साठवत नाही.
              </p>
            </div>

            {/* Tool 3: MUDRA Loan Repayment EMI Calculator */}
            <div className="bg-white rounded-xl p-4 border border-[#0F2C59]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F2C59] uppercase tracking-wider">३. मुद्रा व्यवसाय कर्ज कॅल्क्युलेटर</h3>
                <span className="text-xs bg-[#E07A5F]/10 text-[#E07A5F] px-2 py-0.5 rounded font-bold border border-[#E07A5F]/20">
                  EMI Calculator
                </span>
              </div>

              <div className="space-y-4">
                {/* Principal Slide */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-gray-600">
                    <span>हवे असलेले कर्ज (Loan Amount):</span>
                    <span className="font-extrabold text-[#0F2C59]">{formatRupees(loanAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="1000000"
                    step="50000"
                    value={loanAmount}
                    onChange={(e) => {
                      setLoanAmount(Number(e.target.value));
                      announceToScreenReader(`कर्ज रक्कम बदलली: ${formatRupees(Number(e.target.value))}`);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0F2C59]"
                    aria-label="कर्ज रक्कम मोजपट्टी"
                  />
                </div>

                {/* Tenure Slide */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-gray-600">
                    <span>परतफेड कालावधी (Tenure):</span>
                    <span className="font-extrabold text-[#0F2C59]">{loanTenure} वर्षे (Years)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={loanTenure}
                    onChange={(e) => {
                      setLoanTenure(Number(e.target.value));
                      announceToScreenReader(`परतफेड कालावधी बदलला: ${e.target.value} वर्षे`);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0F2C59]"
                    aria-label="परतफेड कालावधी मोजपट्टी"
                  />
                </div>

                {/* Interest Readout */}
                <div className="flex justify-between text-xs font-medium text-gray-600 pb-2 border-b border-gray-100">
                  <span>व्याजदर (Interest Rate - Fixed):</span>
                  <span className="font-extrabold text-emerald-700">{interestRate}% प्रति वर्ष (Per Annum)</span>
                </div>

                {/* Calculation Outputs */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-[#FAFAF5] p-3 rounded-lg border border-[#0F2C59]/10 text-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">मासिक हप्ता (Monthly EMI)</p>
                    <p className="text-lg font-black text-[#0F2C59]">₹{monthlyEMI.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="bg-[#FAFAF5] p-3 rounded-lg border border-[#0F2C59]/10 text-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">एकूण व्याज (Total Interest)</p>
                    <p className="text-lg font-black text-[#E07A5F]">₹{totalInterest.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="bg-[#1F4E3D]/5 border border-[#1F4E3D]/20 p-3 rounded-lg text-xs font-bold text-[#1F4E3D] flex items-center justify-between">
                  <span>एकूण परतफेड रक्कम (Total Repayable):</span>
                  <span>₹{totalPayment.toLocaleString("en-IN")}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: `msg-loan-${Date.now()}`,
                        sender: "user",
                        text: `मला ₹${(loanAmount / 100000).toFixed(2)} लाख रुपयांच्या मुद्रा कर्जासाठी अर्ज करायचा आहे. माझी पात्रता आणि दस्तऐवज तपासा.`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      },
                      {
                        id: `msg-loan-res-${Date.now()}`,
                        sender: "ai",
                        text: `नक्कीच! मुद्रा किशोर कर्जासाठी आवश्यक असणारे दस्तऐवज खालीलप्रमाणे आहेत:\n१. उद्यम नोंदणी प्रमाणपत्र\n२. पत्त्याचा पुरावा\n३. गेल्या ६ महिन्यांचे बँक विवरण\n४. मालकी हक्क किंवा भाडेकरार दस्तऐवज.\n\nआपल्याकडे हे सर्व उपलब्ध असल्यास, डावीकडील अपलोड आयकॉनचा वापर करून फाईल पाठवा, मी लगेच पडताळणी प्रक्रिया पूर्ण करतो.`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        citations: [{ title: "Pradhan Mantri MUDRA Yojana Guidelines", url: "https://www.mudra.org.in" }],
                        isVerified: true
                      }
                    ]);
                    announceToScreenReader("कॅल्क्युलेटर डेटा चॅटमध्ये पाठवला गेला.");
                  }}
                  className="w-full bg-[#0F2C59] hover:bg-[#07152c] text-white py-2.5 rounded-lg text-xs font-bold transition hover:shadow focus:ring-2 focus:ring-[#1D4ED8]"
                >
                  कॅल्क्युलेशन चॅटमध्ये पाठवा (Share EMI Details in Chat)
                </button>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
