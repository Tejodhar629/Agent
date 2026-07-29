import React, { useState, useEffect, useRef } from "react";

export default function ServiceSuite() {
  const [activeService, setActiveService] = useState<"gst" | "tax" | "msme" | "passport" | "pan">("gst");

  // GST Assistant States
  const [gstTurnover, setGstTurnover] = useState(3500000); // 35 Lakhs default
  const [isSpecialCategoryState, setIsSpecialCategoryState] = useState(false);
  const [gstServiceType, setGstServiceType] = useState<"goods" | "services">("goods");
  const [hsnSearchText, setHsnSearchText] = useState("");
  const [hsnResults, setHsnResults] = useState<Array<{ hsn: string; desc: string; rate: string }>>([]);

  // Income Tax Assistant States
  const [grossSalary, setGrossSalary] = useState(850000); // 8.5 Lakhs default
  const [deduction80C, setDeduction80C] = useState(150000); // Max capped at 1.5L
  const [deduction80D, setDeduction80D] = useState(25000); // Max capped at 25k
  const [deductionHRA, setDeductionHRA] = useState(50000);

  // MSME Assistant States
  const [msmeInvestment, setMsmeInvestment] = useState(8000000); // ₹80 Lakhs default
  const [msmeTurnover, setMsmeTurnover] = useState(40000000); // ₹4 Crores default
  const [msmeSector, setMsmeSector] = useState<"manufacturing" | "services">("manufacturing");

  // Passport Assistant States
  const [passportAppType, setPassportAppType] = useState<"fresh" | "renewal" | "tatkaal">("fresh");
  const [passportAge, setPassportAge] = useState<"adult" | "minor">("adult");
  const [passportPincode, setPassportPincode] = useState("411001");
  const [matchedPOPSK, setMatchedPOPSK] = useState<string | null>(null);

  // PAN Assistant States
  const [panHasAadhaar, setPanHasAadhaar] = useState(true);
  const [panAadhaarLinkedMobile, setPanAadhaarLinkedMobile] = useState(true);

  const screenReaderAnnouncerRef = useRef<HTMLDivElement | null>(null);

  const announceToScreenReader = (text: string) => {
    if (screenReaderAnnouncerRef.current) {
      screenReaderAnnouncerRef.current.innerText = text;
    }
  };

  // -------------------------------------------------------------
  // GST Calculation Logic
  // -------------------------------------------------------------
  const getGstThresholdStatus = () => {
    let limit = 4000000; // 40 Lakhs standard for Goods
    if (gstServiceType === "services") {
      limit = 2000000; // 20 Lakhs for Services
    } else if (isSpecialCategoryState) {
      limit = 2000000; // 20 Lakhs for Special Category North-Eastern states
    }

    const needsRegistration = gstTurnover > limit;
    return {
      limit,
      needsRegistration,
      compositionEligible: gstTurnover <= 15000000 // Composition scheme limit ₹1.5 Cr
    };
  };

  const hsnDatabase = [
    { hsn: "1001", desc: "Wheat and meslin (गहू आणि मेसलिन)", rate: "0% (Exempted)" },
    { hsn: "8471", desc: "Automatic data processing machines / Computers", rate: "18%" },
    { hsn: "9983", desc: "Professional, technical, and business services (SAC)", rate: "18%" },
    { hsn: "1905", desc: "Bread, pastry, cakes, biscuits (बेकरी उत्पादने)", rate: "5% / 18%" }
  ];

  const handleHsnSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = hsnDatabase.filter(
      (item) => item.hsn.includes(hsnSearchText) || item.desc.toLowerCase().includes(hsnSearchText.toLowerCase())
    );
    setHsnResults(filtered);
    announceToScreenReader(`शोध पूर्ण झाला. ${filtered.length} परिणाम सापडले.`);
  };

  // -------------------------------------------------------------
  // Income Tax (Old vs New Slabs FY 2024-25) Calculation Logic
  // -------------------------------------------------------------
  const calculateTaxLiabilities = () => {
    const stdDeduction = 50000;

    // --- OLD REGIME TAX CALCULATION ---
    const totalOldDeductions = Math.min(150000, deduction80C) + Math.min(25000, deduction80D) + deductionHRA + stdDeduction;
    const taxableIncomeOld = Math.max(0, grossSalary - totalOldDeductions);
    
    let taxOld = 0;
    if (taxableIncomeOld > 1000000) {
      taxOld += (taxableIncomeOld - 1000000) * 0.3 + 112500;
    } else if (taxableIncomeOld > 500000) {
      taxOld += (taxableIncomeOld - 500000) * 0.2 + 12500;
    } else if (taxableIncomeOld > 250000) {
      taxOld += (taxableIncomeOld - 250000) * 0.05;
    }
    // Tax rebate under Sec 87A for Old Regime: if taxable income is <= ₹5,00,000, tax is 0.
    if (taxableIncomeOld <= 500000) taxOld = 0;
    
    const cessOld = taxOld * 0.04;
    const finalTaxOld = taxOld + cessOld;

    // --- NEW REGIME TAX CALCULATION (FY 24-25) ---
    // No deductions allowed except standard deduction
    const taxableIncomeNew = Math.max(0, grossSalary - stdDeduction);
    
    let taxNew = 0;
    if (taxableIncomeNew > 1500000) {
      taxNew += (taxableIncomeNew - 1500000) * 0.3 + 150000;
    } else if (taxableIncomeNew > 1200000) {
      taxNew += (taxableIncomeNew - 1200000) * 0.2 + 90000;
    } else if (taxableIncomeNew > 900000) {
      taxNew += (taxableIncomeNew - 900000) * 0.15 + 45000;
    } else if (taxableIncomeNew > 600000) {
      taxNew += (taxableIncomeNew - 600000) * 0.1 + 15000;
    } else if (taxableIncomeNew > 300000) {
      taxNew += (taxableIncomeNew - 300000) * 0.05;
    }
    // Tax rebate under Sec 87A for New Regime: if taxable income is <= ₹7,00,000, tax is 0.
    if (taxableIncomeNew <= 700000) taxNew = 0;

    const cessNew = taxNew * 0.04;
    const finalTaxNew = taxNew + cessNew;

    return {
      taxableIncomeOld,
      totalOldDeductions,
      finalTaxOld,
      taxableIncomeNew,
      finalTaxNew,
      recommendation: finalTaxNew < finalTaxOld ? "New Tax Regime" : "Old Tax Regime",
      savings: Math.abs(finalTaxOld - finalTaxNew)
    };
  };

  const taxMetrics = calculateTaxLiabilities();

  // -------------------------------------------------------------
  // MSME Classification Logic
  // -------------------------------------------------------------
  const getMsmeClassification = () => {
    // Micro: investment <= 1 Crore (100 Lakhs) AND turnover <= 5 Crore (500 Lakhs)
    // Small: investment <= 10 Crore AND turnover <= 50 Crore
    // Medium: investment <= 50 Crore AND turnover <= 250 Crore
    const invCr = msmeInvestment / 10000000;
    const turnCr = msmeTurnover / 10000000;

    if (invCr <= 1 && turnCr <= 5) {
      return { class: "Micro (सूक्ष्म)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    } else if (invCr <= 10 && turnCr <= 50) {
      return { class: "Small (लघु)", color: "text-blue-700 bg-blue-50 border-blue-200" };
    } else if (invCr <= 50 && turnCr <= 250) {
      return { class: "Medium (मध्यम)", color: "text-amber-800 bg-amber-50 border-amber-200" };
    }
    return { class: "Beyond MSME Threshold (मोठा उद्योग)", color: "text-red-700 bg-red-50 border-red-200" };
  };

  // -------------------------------------------------------------
  // Passport POPSK lookup
  // -------------------------------------------------------------
  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passportPincode.startsWith("411")) {
      setMatchedPOPSK("Pune POPSK, Senapati Bapat Road - Active Slots Available today");
    } else if (passportPincode.startsWith("400")) {
      setMatchedPOPSK("Mumbai POPSK, Lower Parel - High Demand (Slot wait time: 3 days)");
    } else {
      setMatchedPOPSK("District Head Post Office Passport Seva Kendra (POPSK) - Synced with Indian Post");
    }
    announceToScreenReader(`पिनकोड शोध पूर्ण झाला: ${matchedPOPSK}`);
  };

  // Format Rupees helper
  const formatLakhs = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} कोटी (Crore)`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} लाख (Lakh)`;
    }
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5] text-[#1C1C1C] flex flex-col font-sans antialiased">
      
      {/* Screen Reader Live updates area */}
      <div ref={screenReaderAnnouncerRef} className="sr-only" role="status" aria-live="polite"></div>

      {/* Main Suite Layout Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)] overflow-hidden">
        
        {/* Left Column Navigation List (Cols: 3) */}
        <nav className="lg:col-span-3 bg-white border border-[#0F2C59]/10 rounded-xl shadow-md p-4 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 shrink-0 h-fit lg:h-full scrollbar-none" aria-label="सेवा सूची">
          <div className="hidden lg:block pb-3 border-b border-gray-100 mb-2">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">शासकीय सेवा संच</h2>
            <p className="text-[10px] text-gray-500">Service Suite Suite Toolkits</p>
          </div>

          {[
            { id: "gst", label: "GST Assistant (जीएसटी सहाय्यक)", icon: "📊" },
            { id: "tax", label: "Income Tax Calculator (आयकर)", icon: "💼" },
            { id: "msme", label: "MSME & Startup Classifier (उद्यम)", icon: "🏢" },
            { id: "passport", label: "Passport Checklist (पासपोर्ट)", icon: "🛂" },
            { id: "pan", label: "PAN Card Assistant (पॅन कार्ड)", icon: "💳" }
          ].map((srv) => (
            <button
              key={srv.id}
              onClick={() => {
                setActiveService(srv.id as any);
                announceToScreenReader(`${srv.label} सक्रिय केली.`);
              }}
              className={`flex-1 lg:flex-none flex items-center space-x-3 px-4 py-3 text-sm font-bold rounded-lg transition-all text-left h-12 shrink-0 ${
                activeService === srv.id
                  ? "bg-[#0F2C59] text-white shadow"
                  : "text-[#0F2C59] hover:bg-[#0F2C59]/5 border border-transparent lg:border-[#0F2C59]/10"
              }`}
            >
              <span className="text-lg">{srv.icon}</span>
              <span className="truncate">{srv.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Column Content Panel (Cols: 9) */}
        <section className="lg:col-span-9 bg-white border border-[#0F2C59]/10 rounded-xl shadow-lg p-6 overflow-y-auto h-full scrollbar-thin">
          
          {/* Service Tab 1: GST ASSISTANT */}
          {activeService === "gst" && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2C59]">जीएसटी नोंदणी आणि दर शोधक (GST Assistant)</h3>
                  <p className="text-xs text-gray-500">तुमच्या व्यवसायाच्या उलाढालीनुसार नोंदणी मर्यादा तपासा आणि दर शोधा.</p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-[#1F4E3D] font-extrabold uppercase px-2.5 py-1 rounded border border-emerald-300">
                  Sec 22 CGST
                </span>
              </div>

              {/* Threshold aggregate turnover slider */}
              <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border">
                <h4 className="text-xs font-bold text-[#0F2C59] uppercase tracking-wider">१. वार्षिक व्यवसाय उलाढाल मर्यादा (Annual Aggregate Turnover)</h4>
                
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-1.5 text-xs font-bold text-gray-700">
                      <input
                        type="radio"
                        checked={gstServiceType === "goods"}
                        onChange={() => setGstServiceType("goods")}
                        className="accent-[#0F2C59]"
                      />
                      <span>माल व्यवसाय (Goods Goods)</span>
                    </label>
                    <label className="flex items-center space-x-1.5 text-xs font-bold text-gray-700">
                      <input
                        type="radio"
                        checked={gstServiceType === "services"}
                        onChange={() => setGstServiceType("services")}
                        className="accent-[#0F2C59]"
                      />
                      <span>सेवा पुरवठा (Services Supplier)</span>
                    </label>
                  </div>

                  <label className="flex items-center space-x-1.5 text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={isSpecialCategoryState}
                      onChange={(e) => setIsSpecialCategoryState(e.target.checked)}
                      className="rounded accent-[#0F2C59]"
                    />
                    <span>विशेष श्रेणी राज्य (North-Eastern States)</span>
                  </label>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-medium text-gray-600">
                    <span>उलाढाल (Turnover):</span>
                    <span className="font-extrabold text-[#0F2C59] text-sm bg-white px-2 py-0.5 border rounded">
                      {formatLakhs(gstTurnover)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="20000000"
                    step="500000"
                    value={gstTurnover}
                    onChange={(e) => {
                      setGstTurnover(Number(e.target.value));
                      announceToScreenReader(`व्यवसाय उलाढाल बदलली: ${formatLakhs(Number(e.target.value))}`);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0F2C59]"
                    aria-label="व्यवसाय उलाढाल मोजपट्टी"
                  />
                </div>

                {/* GST Threshold Classification outputs */}
                {(() => {
                  const status = getGstThresholdStatus();
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className={`p-3 rounded-lg border text-xs font-bold ${
                        status.needsRegistration
                          ? "bg-red-50 border-red-200 text-red-900"
                          : "bg-emerald-50 border-emerald-200 text-[#1F4E3D]"
                      }`}>
                        <p className="uppercase text-[9px] text-gray-400">जीएसटी नोंदणी (GST Mandate):</p>
                        <p className="text-sm font-black mt-1">
                          {status.needsRegistration ? "✗ नोंदणी आवश्यक (Mandatory)" : "✓ नोंदणी अनिवार्य नाही (Exempt)"}
                        </p>
                        <p className="font-medium mt-1 text-[11px] opacity-80">
                          तुमची उलाढाल मर्यादा {formatLakhs(status.limit)} पेक्षा {status.needsRegistration ? "जास्त" : "कमी"} आहे.
                        </p>
                      </div>

                      <div className="bg-white p-3 rounded-lg border text-xs font-bold">
                        <p className="uppercase text-[9px] text-gray-400">कंपोझिशन योजना (Composition Scheme):</p>
                        <p className={`text-sm font-black mt-1 ${status.compositionEligible ? "text-[#1F4E3D]" : "text-gray-500"}`}>
                          {status.compositionEligible ? "✓ पात्र (Eligible)" : "✗ अपात्र (Not Eligible)"}
                        </p>
                        <p className="font-medium mt-1 text-[11px] text-gray-500">
                          १.५ कोटीपर्यंतच्या मॅन्युफॅक्चरर्सना फक्त १% सपाट कर भरण्याचा पर्याय मिळतो.
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* HSN search block */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="text-xs font-bold text-[#0F2C59] uppercase tracking-wider">२. HSN / SAC कर दर शोधक (HSN Code Rate Finder)</h4>
                
                <form onSubmit={handleHsnSearch} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="उदा. Computers, Wheat, 8471..."
                    value={hsnSearchText}
                    onChange={(e) => setHsnSearchText(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-300 focus:bg-white rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-[#0F2C59] h-10 focus:outline-none"
                    aria-label="HSN किंवा वस्तूचे नाव टाईप करा"
                  />
                  <button
                    type="submit"
                    className="bg-[#0F2C59] text-white text-xs font-bold px-4 py-2 rounded h-10 hover:bg-[#07152c] transition"
                  >
                    शोधा
                  </button>
                </form>

                {/* HSN Result list */}
                {hsnResults.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100 text-xs">
                    {hsnResults.map((item, idx) => (
                      <div key={idx} className="p-3 bg-gray-50/30 flex items-center justify-between font-bold">
                        <div>
                          <p className="text-[#0F2C59]">HSN {item.hsn}</p>
                          <p className="text-gray-500 font-medium text-[11px]">{item.desc}</p>
                        </div>
                        <span className="bg-[#E07A5F] text-white px-2 py-0.5 rounded font-extrabold">
                          दर: {item.rate}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Service Tab 2: INCOME TAX CALCULATION COMPARISON */}
          {activeService === "tax" && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2C59]">नवीन विरुद्ध जुनी कर प्रणाली तुलना (Income Tax Regime Comparison)</h3>
                  <p className="text-xs text-gray-500">Section 115BAC नुसार तुमच्यासाठी कोणती कर रचना अधिक फायदेशीर आहे ते तपासा.</p>
                </div>
                <span className="text-[10px] bg-amber-50 text-amber-800 font-extrabold uppercase px-2.5 py-1 rounded border border-amber-300">
                  Sec 115BAC
                </span>
              </div>

              {/* Gross salary and deduction controllers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#0F2C59] uppercase tracking-wider">उत्पन्न विवरण (Salary & Deductions):</h4>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">एकूण वार्षिक पगार (Gross Salary):</label>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <span>₹५०,००० ते ₹२५,००,०००</span>
                      <span className="text-[#0F2C59]">{formatLakhs(grossSalary)}</span>
                    </div>
                    <input
                      type="range"
                      min="150000"
                      max="2500000"
                      step="50000"
                      value={grossSalary}
                      onChange={(e) => {
                        setGrossSalary(Number(e.target.value));
                        announceToScreenReader(`वार्षिक पगार बदलला: ${formatLakhs(Number(e.target.value))}`);
                      }}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-[#0F2C59]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">80C गुंतवणूक (PPF, ELSS, Life Insurance):</label>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <span>कमाल मर्यादा ₹१.५ लाख</span>
                      <span className="text-[#0F2C59]">{formatLakhs(deduction80C)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="150000"
                      step="10000"
                      value={deduction80C}
                      onChange={(e) => {
                        setDeduction80C(Number(e.target.value));
                        announceToScreenReader(`80C गुंतवणूक बदलली: ${formatLakhs(Number(e.target.value))}`);
                      }}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-[#0F2C59]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#0F2C59] uppercase tracking-wider">इतर सवलती (Old Tax Deductions only):</h4>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">80D वैद्यकीय विमा (Medical Insurance premium):</label>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <span>कमाल मर्यादा ₹२५ हजार</span>
                      <span className="text-[#0F2C59]">{formatLakhs(deduction80D)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25000"
                      step="5000"
                      value={deduction80D}
                      onChange={(e) => {
                        setDeduction80D(Number(e.target.value));
                        announceToScreenReader(`80D विमा सवलत बदलली: ${formatLakhs(Number(e.target.value))}`);
                      }}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-[#0F2C59]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-600 block">HRA गृहनिर्माण भाडे सवलत (Rent allowance deduction):</label>
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <span>₹५० हजार पर्यंत</span>
                      <span className="text-[#0F2C59]">{formatLakhs(deductionHRA)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="10000"
                      value={deductionHRA}
                      onChange={(e) => {
                        setDeductionHRA(Number(e.target.value));
                        announceToScreenReader(`HRA सवलत बदलली: ${formatLakhs(Number(e.target.value))}`);
                      }}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-[#0F2C59]"
                    />
                  </div>
                </div>
              </div>

              {/* Comparative calculations results side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="border border-gray-200 rounded-xl p-4 bg-white text-xs font-bold shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b pb-2 text-[#0F2C59]">
                    <span>जुनी कर प्रणाली (Old Regime Slabs)</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded font-extrabold uppercase">Standard Slabs</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>एकूण वजावटी (Total Deductions):</span>
                    <span>-{formatLakhs(taxMetrics.totalOldDeductions)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>करपात्र उत्पन्न (Taxable Income):</span>
                    <span>{formatLakhs(taxMetrics.taxableIncomeOld)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-gray-800 pt-2 border-t border-dashed">
                    <span>देय एकूण कर (Tax Payable):</span>
                    <span>₹{Math.round(taxMetrics.finalTaxOld).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="border-2 border-emerald-500 rounded-xl p-4 bg-emerald-50/10 text-xs font-bold shadow-sm space-y-3 relative">
                  <div className="absolute -top-3 right-4 bg-emerald-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded shadow">
                    Most Efficient
                  </div>
                  
                  <div className="flex justify-between items-center border-b pb-2 text-[#1F4E3D]">
                    <span>नवीन कर प्रणाली (New Regime Sec 115BAC)</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold uppercase">Default</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>एकूण वजावटी (Deductions):</span>
                    <span>-₹५०,००० (Standard Ded)</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>करपात्र उत्पन्न (Taxable Income):</span>
                    <span>{formatLakhs(taxMetrics.taxableIncomeNew)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#1F4E3D] pt-2 border-t border-dashed">
                    <span>देय एकूण कर (Tax Payable):</span>
                    <span>₹{Math.round(taxMetrics.finalTaxNew).toLocaleString("en-IN")}</span>
                  </div>
                </div>

              </div>

              {/* Comparative Saving Recommendation Banner */}
              <div className="bg-emerald-600/10 border border-emerald-400 p-4 rounded-xl text-xs font-bold text-emerald-950 flex flex-col sm:flex-row justify-between items-center gap-2">
                <div>
                  <p className="text-sm">💡 सेवासेतू शिफारस: तुमच्यासाठी <strong>{taxMetrics.recommendation}</strong> कर रचना सर्वात फायदेशीर आहे!</p>
                  <p className="text-gray-600 font-medium mt-0.5">यात निवड केल्याने तुम्ही वार्षिक साधारण <strong>₹{Math.round(taxMetrics.savings).toLocaleString("en-IN")}</strong> रुपयांची कर बचत करू शकता.</p>
                </div>
              </div>
            </div>
          )}

          {/* Service Tab 3: MSME & STARTUP CLASSIFIER */}
          {activeService === "msme" && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2C59]">सूक्ष्म, लघु व मध्यम उद्योग वर्गीकरण टूल (MSME & Startup Classifier)</h3>
                  <p className="text-xs text-gray-500">उद्यम आणि नवीन एमएसमे नियमानुसार तुमच्या व्यवसायाची श्रेणी तपासा.</p>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold uppercase px-2.5 py-1 rounded border border-blue-300">
                  Udyam Standard
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold mb-1 text-gray-600">
                    <span>यंत्रसामग्री व उपकरणे गुंतवणूक (Plant Machinery Investment):</span>
                    <span className="text-[#0F2C59]">{formatLakhs(msmeInvestment)}</span>
                  </div>
                  <input
                    type="range"
                    min="1000000"
                    max="600000000"
                    step="5000000"
                    value={msmeInvestment}
                    onChange={(e) => {
                      setMsmeInvestment(Number(e.target.value));
                      announceToScreenReader(`गुंतवणूक रक्कम बदलली: ${formatLakhs(Number(e.target.value))}`);
                    }}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-[#0F2C59]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold mb-1 text-gray-600">
                    <span>एकूण वार्षिक उलाढाल (Annual Aggregate Turnover):</span>
                    <span className="text-[#0F2C59]">{formatLakhs(msmeTurnover)}</span>
                  </div>
                  <input
                    type="range"
                    min="5000000"
                    max="2800000000"
                    step="10000000"
                    value={msmeTurnover}
                    onChange={(e) => {
                      setMsmeTurnover(Number(e.target.value));
                      announceToScreenReader(`एमएसएमई उलाढाल बदलली: ${formatLakhs(Number(e.target.value))}`);
                    }}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none accent-[#0F2C59]"
                  />
                </div>
              </div>

              {/* MSME Class output representation */}
              {(() => {
                const result = getMsmeClassification();
                return (
                  <div className={`p-4 rounded-xl border-2 text-sm font-bold flex items-center justify-between ${result.color}`}>
                    <div>
                      <p className="uppercase text-[9px] text-gray-400">एमएसएमई वर्गवारी (MSME Category):</p>
                      <p className="text-lg font-black mt-1">{result.class} उद्योग</p>
                    </div>
                    <div className="text-right text-xs">
                      <p>✓ Udyam Verification [OK]</p>
                      <p className="font-medium text-gray-500 text-[11px] mt-0.5">MUDRA Collateral-Free Eligibility: YES</p>
                    </div>
                  </div>
                );
              })()}

              {/* Startup India Benefits Checklist */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-[#0F2C59] uppercase tracking-wider">Startup India Recognition Incentives Checklist:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: "Sec 80-IAC Tax Exemption", desc: "नवीन कंपन्यांना ३ वर्षांसाठी कर माफी सवलत." },
                    { title: "Fast-track Patent applications", desc: "८०% शासकीय शुल्क सवलत आणि वेगवान प्रक्रिया." },
                    { title: "Collateral-free MUDRA loans", desc: "₹१० लाखांपर्यंत बँक सुरक्षातारणाशिवाय खेळते भांडवल कर्ज." },
                    { title: "Self-Certification Compliance", desc: "९ पर्यावरण व कामगार कायद्यांचे मॅन्युअल तपासणी सवलत." }
                  ].map((benefit, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-white flex items-start space-x-2 text-xs font-bold">
                      <span className="text-emerald-600 bg-emerald-100 p-0.5 rounded-full shrink-0" aria-hidden="true">✓</span>
                      <div>
                        <p className="text-[#0F2C59]">{benefit.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Service Tab 4: PASSPORT CHECKLIST & POPSK FINDER */}
          {activeService === "passport" && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2C59]">पासपोर्ट अर्ज पात्रता व केंद्र शोधक (Passport Assistant)</h3>
                  <p className="text-xs text-gray-500">अर्ज प्रकारानुसार कागदपत्रांची यादी तपासा आणि जवळचे केंद्र शोधा.</p>
                </div>
                <span className="text-[10px] bg-purple-50 text-purple-800 font-extrabold uppercase px-2.5 py-1 rounded border border-purple-300">
                  POPSK Sync
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-xl border">
                
                {/* Inputs for selection */}
                <div className="space-y-4 text-xs font-bold">
                  <div className="space-y-1.5">
                    <label className="text-gray-600 block">अर्ज प्रकार (Application Type):</label>
                    <select
                      value={passportAppType}
                      onChange={(e) => setPassportAppType(e.target.value as any)}
                      className="bg-white border border-gray-300 rounded px-2.5 py-2 w-full focus:ring-2 focus:ring-[#0F2C59] focus:outline-none"
                    >
                      <option value="fresh">नवीन पासपोर्ट (Fresh Passport)</option>
                      <option value="renewal">पासपोर्ट नूतनीकरण (Renewal / Reissue)</option>
                      <option value="tatkaal">तात्काळ सेवा (Tatkaal Passport)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-gray-600 block">वय गट (Age Group):</label>
                    <select
                      value={passportAge}
                      onChange={(e) => setPassportAge(e.target.value as any)}
                      className="bg-white border border-gray-300 rounded px-2.5 py-2 w-full focus:ring-2 focus:ring-[#0F2C59] focus:outline-none"
                    >
                      <option value="adult">प्रौढ (१८ वर्षांपेक्षा जास्त - Adult)</option>
                      <option value="minor">अल्पवयीन (१८ वर्षांपेक्षा कमी - Minor)</option>
                    </select>
                  </div>
                </div>

                {/* POPSK Postcode lookup */}
                <form onSubmit={handlePincodeSubmit} className="space-y-4 text-xs font-bold">
                  <div className="space-y-1.5">
                    <label className="text-gray-600 block" htmlFor="pincode-input">तुमचा पिनकोड (Postcode for POPSK Search):</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        id="pincode-input"
                        placeholder="उदा. 411001..."
                        value={passportPincode}
                        onChange={(e) => setPassportPincode(e.target.value)}
                        className="bg-white border border-gray-300 rounded px-3 py-2 flex-1 focus:ring-2 focus:ring-[#0F2C59] focus:outline-none h-10"
                      />
                      <button
                        type="submit"
                        className="bg-[#0F2C59] text-white font-bold text-xs px-4 rounded h-10 hover:bg-[#07152c] transition"
                      >
                        केंद्र शोधा
                      </button>
                    </div>
                  </div>

                  {/* Match result map placeholder simulation */}
                  {matchedPOPSK && (
                    <div className="p-3 bg-white border rounded-lg space-y-1 text-xs">
                      <p className="font-bold text-[#0F2C59]">✓ जवळचे सापडलेले पासपोर्ट केंद्र (POPSK):</p>
                      <p className="text-gray-600 font-medium text-[11px]">{matchedPOPSK}</p>
                    </div>
                  )}
                </form>
              </div>

              {/* Dynamic Passport Checklist */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-[#0F2C59] uppercase tracking-wider">आवश्यक दस्तऐवजांची यादी (Mandatory PDF Checklist):</h4>
                <div className="space-y-2">
                  {[
                    { title: "पत्ता पुरावा (Address Proof)", desc: "Aadhaar Card, Water bill, Electricity bill, or Rent lease agreement." },
                    { title: "जन्मतारीख पुरावा (DOB Proof)", desc: "PAN Card, Birth Certificate, or School leaving certificate / SSC Matric memo." },
                    { title: "Non-ECR पात्रता प्रमाणपत्र", desc: "जर तुम्ही १० वी किंवा अधिक शिक्षण पूर्ण केले असल्यास, पासपोर्टवरील 'Emigration Check' ची गरज नाही." }
                  ].map((chk, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex items-start space-x-2 text-xs font-bold">
                      <span className="text-purple-700 bg-purple-100 p-0.5 rounded-full shrink-0" aria-hidden="true">✓</span>
                      <div>
                        <p className="text-[#0F2C59]">{chk.title}</p>
                        <p className="text-[10px] text-gray-500 font-medium leading-tight mt-0.5">{chk.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Service Tab 5: PAN CARD ASSISTANT */}
          {activeService === "pan" && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2C59]">पेपरलेस ई-पॅन कार्ड आणि दुरुस्ती (PAN Card Assistant)</h3>
                  <p className="text-xs text-gray-500">अवघ्या १० मिनिटांत मोफत पेपरलेस e-PAN मिळवण्याच्या अटी व प्रक्रिया तपासा.</p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-[#1F4E3D] font-extrabold uppercase px-2.5 py-1 rounded border border-emerald-300">
                  Instant PAN
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-xl border text-xs font-bold">
                
                {/* Instant verification checklist */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#0F2C59] uppercase tracking-wider">e-PAN पेपरलेस अटी (Pre-requisites):</h4>
                  
                  <label className="flex items-center space-x-2.5 cursor-pointer bg-white p-2 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      checked={panHasAadhaar}
                      onChange={(e) => setPanHasAadhaar(e.target.checked)}
                      className="rounded accent-[#0F2C59]"
                    />
                    <div>
                      <p className="text-[#1C1C1C]">माझ्याकडे वैध आधार कार्ड आहे</p>
                      <p className="text-[10px] text-gray-400 font-medium">Valid UIDAI Aadhaar</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer bg-white p-2 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      checked={panAadhaarLinkedMobile}
                      onChange={(e) => setPanAadhaarLinkedMobile(e.target.checked)}
                      className="rounded accent-[#0F2C59]"
                    />
                    <div>
                      <p className="text-[#1C1C1C]">आधार कार्ड मोबाईल नंबरशी जोडलेले आहे</p>
                      <p className="text-[10px] text-gray-400 font-medium">Linked Mobile OTP Authentication</p>
                    </div>
                  </label>
                </div>

                {/* Instant PAN results classification */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#0F2C59] uppercase tracking-wider">e-PAN पात्रता (Classification result):</h4>
                  
                  {panHasAadhaar && panAadhaarLinkedMobile ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[#1F4E3D] space-y-2">
                      <p className="text-sm font-black">✓ आपण त्वरित पेपरलेस e-PAN साठी पात्र आहात!</p>
                      <p className="text-[11px] font-medium leading-relaxed opacity-90">
                        कोणतेही प्रत्यक्ष कागदपत्र पाठवण्याची गरज नाही. e-Filing आयकर पोर्टलवर आधार कार्डवरील OTP टाकून अवघ्या १० मिनिटांत डिजिटल पॅन जारी केले जाईल.
                      </p>
                      <a
                        href="https://www.incometax.gov.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 font-extrabold underline text-xs pt-1"
                      >
                        <span>e-Filing पोर्टलला भेट द्या (Visit IT Portal)</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 space-y-1">
                      <p className="text-sm font-black">● मॅन्युअल भौतिक पॅन अर्ज आवश्यक</p>
                      <p className="text-[11px] font-medium leading-relaxed">
                        मोबाईल लिंक नसल्यास किंवा आधार नसल्यास, आपल्याला NSDL/UTIITSL पोर्टलद्वारे प्रत्यक्ष कागदपत्रे जोडून (उदा. जन्मतारीख दाखला व शाळा सोडल्याचा दाखला) अर्ज करावा लागेल.
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
