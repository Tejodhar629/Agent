import React, { useState, useEffect, useRef } from "react";

export default function BusinessSuite() {
  const [activeBusinessTab, setActiveBusinessTab] = useState<"razorpay" | "webrtc" | "referral" | "csc">("webrtc");

  // Razorpay states
  const [billingPlan, setBillingPlan] = useState<"monthly" | "yearly">("monthly");
  const [razorpayStep, setRazorpayStep] = useState<"idle" | "popup" | "success">("idle");
  const [rzpPaymentId, setRzpPaymentId] = useState("");

  // WebRTC Escrow states
  const [escrowState, setEscrowState] = useState<"idle" | "booked" | "webrtc_active" | "completed">("idle");
  const [activeExpert, setActiveExpert] = useState({ name: "CA Amit Shinde (Chartered Accountant)", fee: 500, field: "Taxation & MUDRA Advisory" });
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  // Referral states
  const [referralPoints, setReferralPoints] = useState(450);

  // CSC locator states
  const [cscSearchPincode, setCscSearchPincode] = useState("411001");
  const [cscResults, setCscResults] = useState<Array<{ name: string; distance: string; address: string; phone: string; manager: string }>>([]);

  const screenReaderAnnouncerRef = useRef<HTMLDivElement | null>(null);

  const announceToScreenReader = (text: string) => {
    if (screenReaderAnnouncerRef.current) {
      screenReaderAnnouncerRef.current.innerText = text;
    }
  };

  // -------------------------------------------------------------
  // Razorpay Checkout Simulation
  // -------------------------------------------------------------
  const handleRazorpayCheckout = () => {
    setRazorpayStep("popup");
    announceToScreenReader("रेझरपे सुरक्षित पेमेंट गेटवे पॉप-अप उघडत आहे. कृपया तुमचे पेमेंट विवरण निवडा.");
  };

  const completeRazorpayPayment = () => {
    const mockPayId = `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    setRzpPaymentId(mockPayId);
    setRazorpayStep("success");
    announceToScreenReader(`पेमेंट यशस्वी! ट्रान्झॅक्शन आयडी: ${mockPayId}. तुमचे जन सेवा गोल्ड सदस्यत्व सक्रिय झाले आहे.`);
  };

  // -------------------------------------------------------------
  // CSC Search simulation
  // -------------------------------------------------------------
  const handleCscSearch = (e: React.FormEvent) => {
    e.preventDefault();
    announceToScreenReader("पिनकोडनुसार जवळचे कॉमन सर्व्हिस सेंटर शोधत आहे...");
    
    // Simulated spatial query lookup
    setTimeout(() => {
      if (cscSearchPincode.startsWith("411")) {
        setCscResults([
          { name: "Pune Center - Gram Panchayat VLE Hub", distance: "१.२ किमी दूर", address: "Opposite Gram Panchayat Office, Haveli, Pune", phone: "+९१ ९८२०० १८९१२", manager: "Vandana Patil (VLE)" },
          { name: "Mahaonline Maha e-Seva Kendra", distance: "२.५ किमी दूर", address: "Saraswati Complex, Shivajinagar, Pune", phone: "+९१ ९८९०० ७६१२४", manager: "Ramesh Shinde" }
        ]);
      } else {
        setCscResults([
          { name: "District Digital Seva CSC Kendra", distance: "३.८ किमी दूर", address: "Main Post Office Complex, District Collectorate", phone: "+९१ ९४५०० ४३२१०", manager: "Anil Kumar (VLE Coordinator)" }
        ]);
      }
      announceToScreenReader(`शोध पूर्ण झाला. जवळील केंद्रे सापडली आहेत.`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5] text-[#1C1C1C] flex flex-col font-sans antialiased">
      
      {/* Screen Reader announcements */}
      <div ref={screenReaderAnnouncerRef} className="sr-only" role="status" aria-live="polite"></div>

      {/* Business Suite Main Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)] overflow-hidden">
        
        {/* Left Nav menu (Cols: 3) */}
        <nav className="lg:col-span-3 bg-white border border-[#0F2C59]/10 rounded-xl shadow-md p-4 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 shrink-0 h-fit lg:h-full scrollbar-none" aria-label="व्यावसायिक सेवा सूची">
          <div className="hidden lg:block pb-3 border-b border-gray-100 mb-2">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">व्यवसाय व सल्ला दालन</h2>
            <p className="text-[10px] text-gray-500">Business & Marketplace Suite</p>
          </div>

          {[
            { id: "webrtc", label: "WebRTC Consultation (व्हिडिओ सल्ला)", icon: "🎥" },
            { id: "razorpay", label: "Gold Subscription (पेमेंट)", icon: "💳" },
            { id: "referral", label: "Referral Progress (रेफरल ट्रॅकर)", icon: "📈" },
            { id: "csc", label: "CSC Kendra Locator (केंद्र शोधक)", icon: "📍" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveBusinessTab(item.id as any);
                announceToScreenReader(`${item.label} विभाग उघडला.`);
              }}
              className={`flex-1 lg:flex-none flex items-center space-x-3 px-4 py-3 text-sm font-bold rounded-lg transition-all text-left h-12 shrink-0 ${
                activeBusinessTab === item.id
                  ? "bg-[#0F2C59] text-white shadow"
                  : "text-[#0F2C59] hover:bg-[#0F2C59]/5 border border-transparent lg:border-[#0F2C59]/10"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Content Panel (Cols: 9) */}
        <section className="lg:col-span-9 bg-white border border-[#0F2C59]/10 rounded-xl shadow-lg p-6 overflow-y-auto h-full scrollbar-thin">
          
          {/* Tab 1: SECURE WEBRTC VIDEO ESCROW CONSULTATION */}
          {activeBusinessTab === "webrtc" && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2C59]">एस्क्रो-सुरक्षित व्हिडिओ सल्लागार खोली (WebRTC Secure Escrow Room)</h3>
                  <p className="text-xs text-gray-500">प्रमाणित सीए आणि वकिलांशी व्हिडिओ कॉलद्वारे संपर्क साधून थेट एस्क्रो पद्धतीने पेमेंट सुरक्षित ठेवा.</p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-[#1F4E3D] font-extrabold uppercase px-2.5 py-1 rounded border border-emerald-300">
                  Sec 13 IT Act
                </span>
              </div>

              {/* Step-by-Step Escrow Workflow States */}
              {escrowState === "idle" && (
                <div className="border border-gray-200 rounded-xl p-6 bg-[#FAFAF5]/60 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#0F2C59]/5 text-[#0F2C59] flex items-center justify-center mx-auto" aria-hidden="true">
                    👤
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-[#1C1C1C] text-sm md:text-base">सल्लागार तज्ञ उपलब्ध आहेत</h4>
                    <p className="text-xs text-gray-500">{activeExpert.name} • दर: ₹{activeExpert.fee}/सत्र</p>
                  </div>
                  <button
                    onClick={() => {
                      setEscrowState("booked");
                      announceToScreenReader("सल्लागार सत्र यशस्वीरित्या बुक केले गेले आहे. फी एस्क्रो नोडवर राखून ठेवली आहे.");
                    }}
                    className="bg-[#0F2C59] hover:bg-[#07152c] text-white font-bold text-xs px-6 py-2.5 rounded shadow h-11 transition"
                  >
                    सत्र बुक करा आणि एस्क्रो फी होल्ड करा (Book CA Session - ₹५००)
                  </button>
                  <p className="text-[10px] text-gray-400 font-medium">
                    🛡️ सुरक्षा हमी: तुमचे पैसे थेट बँक खात्यात न जाता जन सेवा एस्क्रो नोडमध्ये सुरक्षित राहतील. कॉल पूर्ण झाल्यावरच पैसे दिले जातील.
                  </p>
                </div>
              )}

              {escrowState === "booked" && (
                <div className="border border-gray-200 rounded-xl p-5 bg-emerald-50 border-emerald-200 space-y-4 text-center">
                  <div className="space-y-1">
                    <h4 className="font-bold text-emerald-950 text-sm md:text-base">🔐 पेमेंट एस्क्रो नोडमध्ये सुरक्षित आहे (₹५०० held in Escrow)</h4>
                    <p className="text-xs text-emerald-800">तज्ञCA अमित शिंदे कॉलमध्ये तुमची वाट पाहत आहेत. खालील बटण दाबून WebRTC व्हिडिओ रूम उघडा.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEscrowState("webrtc_active");
                      announceToScreenReader("WebRTC सुरक्षित एन्क्रिप्टेड व्हिडिओ रूम सुरू झाली आहे.");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded shadow h-11 transition"
                  >
                    व्हिडिओ कॉल सुरू करा (Join WebRTC Video Consultation)
                  </button>
                </div>
              )}

              {escrowState === "webrtc_active" && (
                <div className="space-y-4">
                  {/* Simulated WebRTC Video Grid Container */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64 bg-gray-900 rounded-xl overflow-hidden p-4 relative border border-gray-800">
                    
                    {/* Citizen Cam */}
                    <div className="relative bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                      {camOn ? (
                        <div className="w-full h-full bg-[#FAFAF5]/10 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded absolute bottom-2 left-2">You (Priyanka)</span>
                          <span className="text-white text-4xl">👤</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 font-bold text-xs">कॅमेरा बंद आहे (Camera Off)</span>
                      )}
                    </div>

                    {/* CA Expert Cam */}
                    <div className="relative bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                      <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded absolute bottom-2 left-2">CA Amit Shinde</span>
                      <span className="text-white text-4xl">👨‍💼</span>
                    </div>

                    {/* Float controls bar */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/75 rounded-full px-4 py-2 flex items-center space-x-3 shadow-lg z-30">
                      <button
                        onClick={() => setMicOn(!micOn)}
                        className={`p-2.5 rounded-full ${micOn ? "bg-white/20 text-white" : "bg-red-600 text-white"}`}
                        aria-label="माईक चालू/बंद करा"
                      >
                        {micOn ? "🎙️" : "🔇"}
                      </button>
                      <button
                        onClick={() => setCamOn(!camOn)}
                        className={`p-2.5 rounded-full ${camOn ? "bg-white/20 text-white" : "bg-red-600 text-white"}`}
                        aria-label="कॅमेरा चालू/बंद करा"
                      >
                        {camOn ? "📹" : "📷"}
                      </button>
                      <button
                        onClick={() => {
                          setEscrowState("completed");
                          announceToScreenReader("कॉल संपला. एस्क्रो पेमेंट मंजुरी पॅनेल उघडले.");
                        }}
                        className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full h-9 hover:bg-red-700 transition"
                      >
                        कॉल संपवा (Hang Up)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {escrowState === "completed" && (
                <div className="border-2 border-dashed border-emerald-500 rounded-xl p-5 bg-emerald-50/20 space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-[#1F4E3D] text-sm md:text-base">🎉 सल्ला यशस्वीरित्या संपन्न झाला आहे!</h4>
                    <p className="text-xs text-gray-600">जर CA अमित शिंदे यांच्या सल्ल्याने तुमचे समाधान झाले असल्यास, एस्क्रो नोड मधील रक्कम मुक्त (release) करण्यास परवानगी द्या.</p>
                  </div>

                  <div className="bg-white border rounded-xl p-4 text-xs font-bold space-y-2 text-gray-700">
                    <div className="flex justify-between border-b pb-2 text-gray-500">
                      <span>एकूण जमा फी (Escrow Pool):</span>
                      <span>₹५००</span>
                    </div>
                    <div className="flex justify-between text-[#1F4E3D]">
                      <span>सीए उत्पन्न हिस्सा (७५% Expert Split):</span>
                      <span>₹३७५</span>
                    </div>
                    <div className="flex justify-between text-[#0F2C59]">
                      <span>सेवासेतू कमिशन (२५% Platform Fee):</span>
                      <span>₹१२५</span>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      onClick={() => {
                        setEscrowState("idle");
                        announceToScreenReader("एस्क्रो पेमेन्ट यशस्वीरीत्या सीए खात्यामध्ये वळते केले गेले. सत्र पूर्ण.");
                        alert("Escrow Payment Released [OK]. 75% credited to CA, 25% platform commission stored.");
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded shadow h-11 transition"
                    >
                      मंजूर करा व पैसे पाठवा (Approve & Release Funds)
                    </button>
                    <button
                      onClick={() => {
                        setEscrowState("idle");
                        announceToScreenReader("तक्रार दाखल केली गेली. ग्राहक सहाय्यता अधिकारी २४ तासांत मदत करतील.");
                        alert("Dispute Raised [OK]. Funds locked in Escrow. Support coordinator notified.");
                      }}
                      className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs px-5 py-2.5 rounded h-11 transition"
                    >
                      तक्रार नोंदवा (Raise Dispute)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: RAZORPAY SUBSCRIPTION INTEGRATION */}
          {activeService === "razorpay" && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2C59]">रेझरपे सुलभ आवर्ती पेमेंट (Razorpay Subscription Gateway)</h3>
                  <p className="text-xs text-gray-500">जन सेवा गोल्ड सदस्यत्व खरेदी करून तुमच्या संपूर्ण कुटुंबासाठी योजनांचे थेट अलर्ट व ट्रॅकिंग मिळवा.</p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-[#1F4E3D] font-extrabold uppercase px-2.5 py-1 rounded border border-emerald-300">
                  Razorpay Sec
                </span>
              </div>

              {/* Plans toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "monthly", price: "₹४९ / महिना", title: "Monthly AutoPay Plan", desc: "कौटुंबिक योजना अलर्ट व ८ उप-प्रोफाइल्स ट्रॅकिंग." },
                  { id: "yearly", price: "₹३९९ / वर्ष", title: "Yearly Saver Plan", desc: "साधारण ३०% कर बचत आणि अमर्यादित दस्तऐवज ओसीआर मास्किंग." }
                ].map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setBillingPlan(plan.id as any)}
                    className={`border-2 rounded-xl p-4 text-left space-y-2 transition-all ${
                      billingPlan === plan.id
                        ? "border-[#0F2C59] bg-[#0F2C59]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-[#0F2C59]">
                      <p>{plan.title}</p>
                      <span className="bg-[#E07A5F] text-white px-2 py-0.5 rounded text-[10px] uppercase font-extrabold">
                        {plan.price}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-tight font-medium">{plan.desc}</p>
                  </button>
                ))}
              </div>

              {/* Checkout process */}
              <div className="pt-4 border-t border-gray-100 flex justify-end">
                {razorpayStep === "idle" && (
                  <button
                    onClick={handleRazorpayCheckout}
                    className="bg-[#0F2C59] hover:bg-[#07152c] text-white font-bold text-xs px-6 py-2.5 rounded shadow h-11 transition"
                  >
                    रेझरपे द्वारे सुरक्षित खरेदी करा (Checkout with Razorpay)
                  </button>
                )}
              </div>

              {/* Simulated Razorpay Overlay pop-up */}
              {razorpayStep === "popup" && (
                <div className="border border-gray-200 rounded-xl p-5 bg-[#FAFAF5] space-y-4 relative shadow-md">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <p className="font-bold text-xs text-[#0F2C59]">💳 Razorpay Secure Checkout</p>
                    <button onClick={() => setRazorpayStep("idle")} className="text-gray-400 font-black">✕</button>
                  </div>

                  <div className="space-y-3 text-xs font-bold">
                    <p className="text-gray-500 font-medium">निवडलेला प्लॅन: {billingPlan === "monthly" ? "₹४९/महिना" : "₹३९९/वर्ष"}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button onClick={completeRazorpayPayment} className="border p-2 rounded-lg bg-white hover:bg-gray-50 text-center">
                        <p>📱 PhonePe / UPI</p>
                      </button>
                      <button onClick={completeRazorpayPayment} className="border p-2 rounded-lg bg-white hover:bg-gray-50 text-center">
                        <p>💳 Credit / Debit Card</p>
                      </button>
                      <button onClick={completeRazorpayPayment} className="border p-2 rounded-lg bg-white hover:bg-gray-50 text-center">
                        <p>🏦 Netbanking</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {razorpayStep === "success" && (
                <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50 text-emerald-800 text-xs font-bold space-y-1">
                  <p className="text-sm font-black">✓ पेमेंट यशस्वीरित्या पूर्ण झाले! (Payment Successful)</p>
                  <p className="font-mono text-[11px]">Razorpay Payment ID: {rzpPaymentId}</p>
                  <p className="font-medium text-gray-500 leading-relaxed pt-1">
                    तुमचे जन सेवा गोल्ड सदस्यत्व आता पूर्णतः सक्रिय झाले आहे. तुमच्या कुटुंबातील उप-प्रोफाइल्सची पात्रता तपासणी पार्श्वभूमीमध्ये सुरू झाली आहे.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: REFERRAL PROGRESS */}
          {activeBusinessTab === "referral" && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2C59]">रेफरल पुरस्कार आणि मेट्रिक्स (Referral Progress)</h3>
                  <p className="text-xs text-gray-500">तुमच्या विभागातील ग्रामस्थांना आणि गरजूंना रेफर केलेल्या नागरिकांची आकडेवारी तपासा.</p>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold uppercase px-2.5 py-1 rounded border border-blue-300">
                  Referrals Tracker
                </span>
              </div>

              {/* Reward stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#FAFAF5] p-4 rounded-xl border text-center font-bold">
                  <p className="text-[10px] text-gray-400 uppercase">एकूण रेफरल्स (Total Invited)</p>
                  <p className="text-2xl text-[#0F2C59] font-black">९ नागरिक</p>
                </div>
                <div className="bg-[#FAFAF5] p-4 rounded-xl border text-center font-bold">
                  <p className="text-[10px] text-gray-400 uppercase">मिळालेले कॉइन्स (Coins Earned)</p>
                  <p className="text-2xl text-amber-500 font-black">{referralPoints} pts</p>
                </div>
                <div className="bg-[#FAFAF5] p-4 rounded-xl border text-center font-bold">
                  <p className="text-[10px] text-gray-400 uppercase">पुढील बक्षीस (Next Milestone)</p>
                  <p className="text-xs text-gray-600 font-medium mt-1">Mantra Scanner साठी १५५० कॉइन्स हवेत</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: CSC GEOLOCATION LOCATOR */}
          {activeBusinessTab === "csc" && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2C59]">कॉमन सर्व्हिस सेंटर शोधक (CSC Kendra Locator)</h3>
                  <p className="text-xs text-gray-500">जवळचे अधिकृत महा-ई-सेवा केंद्र किंवा डिजिटल सेवा सीएससी शोधण्यासाठी तुमचा पिनकोड टाका.</p>
                </div>
                <span className="text-[10px] bg-purple-50 text-purple-800 font-extrabold uppercase px-2.5 py-1 rounded border border-purple-300">
                  CSC Directory
                </span>
              </div>

              {/* Pin code search form */}
              <form onSubmit={handleCscSearch} className="flex gap-2 bg-gray-50/50 p-4 rounded-xl border">
                <div className="flex-1 space-y-1 text-xs font-bold">
                  <label htmlFor="csc-pincode-input" className="text-gray-600 block">पिनकोड (Pincode):</label>
                  <input
                    type="text"
                    id="csc-pincode-input"
                    placeholder="उदा. 411001..."
                    value={cscSearchPincode}
                    onChange={(e) => setCscSearchPincode(e.target.value)}
                    className="bg-white border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-[#0F2C59] focus:outline-none h-10 text-xs font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#0F2C59] text-white font-bold text-xs px-5 rounded h-10 mt-auto hover:bg-[#07152c] transition"
                >
                  केंद्रे शोधा
                </button>
              </form>

              {/* Results cards */}
              {cscResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">जवळील केंद्रे (Nearest CSC Kendras found):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cscResults.map((csc, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-white space-y-3 flex flex-col justify-between">
                        <div className="space-y-1 text-xs font-bold">
                          <div className="flex justify-between">
                            <h5 className="text-[#0F2C59]">{csc.name}</h5>
                            <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                              {csc.distance}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium">व्यवस्थापक: {csc.manager}</p>
                          <p className="text-[11px] text-gray-500 font-medium leading-tight">{csc.address}</p>
                          <p className="font-mono text-gray-600 text-[11px]">फोन: {csc.phone}</p>
                        </div>

                        <a
                          href={`https://maps.google.com/?q=${csc.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-purple-50 text-purple-700 border border-purple-200 text-center py-2 rounded-lg text-xs font-bold hover:bg-purple-100 transition inline-block"
                        >
                          Google Maps वर जा (Navigate)
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </section>

      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-4 text-xs text-[#1C1C1C]/50 border-t border-[#0F2C59]/10 bg-[#FAFAF5]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
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
