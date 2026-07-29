"use client";

import React, { useState, useEffect, useRef } from "react";

interface SavedScheme {
  id: string;
  name: string;
  category: string;
  dbtAmount: string;
  status: "applied" | "eligible" | "pending_doc";
  officialUrl: string;
}

interface Application {
  id: string;
  name: string;
  portal: string;
  status: "DRAFT" | "SUBMITTED" | "VERIFYING" | "APPROVED" | "REJECTED";
  updatedAt: string;
  steps: Array<{ label: string; done: boolean }>;
}

interface ConsentRecord {
  purpose: string;
  description: string;
  status: "ACTIVE" | "REVOKED";
  grantedAt: string;
}

export default function UserDashboard() {
  const [userCoins, setUserCoins] = useState(450);
  const [digiLockerSynced, setDigiLockerSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purged, setPurged] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState<"schemes" | "docs" | "applications" | "referrals" | "privacy">("schemes");

  const screenReaderAnnouncerRef = useRef<HTMLDivElement | null>(null);

  const announceToScreenReader = (text: string) => {
    if (screenReaderAnnouncerRef.current) {
      screenReaderAnnouncerRef.current.innerText = text;
    }
  };

  // Sample Saved Schemes Cart
  const [savedSchemes, setSavedSchemes] = useState<SavedScheme[]>([
    {
      id: "sc-1",
      name: "पीएम-किसान सन्मान निधी (PM-KISAN)",
      category: "Agriculture",
      dbtAmount: "₹६,००० / वर्ष",
      status: "applied",
      officialUrl: "https://pmkisan.gov.in"
    },
    {
      id: "sc-2",
      name: "आयुष्मान भारत जन आरोग्य विमा (Ayushman Bharat)",
      category: "Healthcare",
      dbtAmount: "₹५,००,००० / वर्ष",
      status: "eligible",
      officialUrl: "https://dashboard.pmjay.gov.in"
    },
    {
      id: "sc-3",
      name: "अटल पेन्शन योजना (Atal Pension Yojana)",
      category: "Social Security",
      dbtAmount: "₹१,००० - ₹५,००० / महिना",
      status: "pending_doc",
      officialUrl: "https://www.npscra.nsdl.co.in"
    }
  ]);

  // Active Application Progress Tracker
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "app-1",
      name: "मुद्रा किशोर व्यवसाय कर्ज (MUDRA Kishor)",
      portal: "SBI Partner Portal",
      status: "VERIFYING",
      updatedAt: "08 Dec 2024",
      steps: [
        { label: "अर्ज मसुदा (Draft Saved)", done: true },
        { label: "कागदपत्रे अपलोड (Docs Uploaded)", done: true },
        { label: "स्थानिक अधिकारी पडताळणी (Officer Verifying)", done: true },
        { label: "कर्ज मंजुरी व वितरण (Disbursal)", done: false }
      ]
    },
    {
      id: "app-2",
      name: "उद्यम नोंदणी प्रमाणपत्र (Udyam MSME)",
      portal: "Ministry of MSME",
      status: "APPROVED",
      updatedAt: "04 Dec 2024",
      steps: [
        { label: "अर्ज दाखल (Submitted)", done: true },
        { label: "आधार e-KYC पडताळणी (Aadhaar OTP Verified)", done: true },
        { label: "प्रमाणपत्र जारी झाले (Certificate Issued)", done: true }
      ]
    }
  ]);

  // DPDP Consent Log Entries
  const [consents, setConsents] = useState<ConsentRecord[]>([
    {
      purpose: "SCHEME_ELIGIBILITY",
      description: "माहिती आधारे पात्र योजनांचा शोध घेणे.",
      status: "ACTIVE",
      grantedAt: "05 Dec 2024, 10:15 AM"
    },
    {
      purpose: "DIGILOCKER_FETCH",
      description: "डिजीलॉकरमधून जात व उत्पन्न प्रमाणपत्र प्राप्त करणे.",
      status: "ACTIVE",
      grantedAt: "05 Dec 2024, 10:16 AM"
    },
    {
      purpose: "BHASHINI_TRANSLATION",
      description: "MeitY Bhashini द्वारे प्रादेशिक भाषांमध्ये भाषांतर करणे.",
      status: "ACTIVE",
      grantedAt: "05 Dec 2024, 10:14 AM"
    }
  ]);

  // Sync DigiLocker
  const handleDigiLockerSync = () => {
    setSyncing(true);
    announceToScreenReader("डिजीलॉकरशी संपर्क साधत आहे, कृपया वाट पहा...");
    setTimeout(() => {
      setSyncing(false);
      setDigiLockerSynced(true);
      setUserCoins((prev) => prev + 50); // Reward for syncing docs
      announceToScreenReader("डिजीलॉकर यशस्वीरीत्या जोडले गेले. ५० जन सेवा कॉइन्स मिळाले!");
    }, 2000);
  };

  // Copy Referral link
  const handleCopyReferral = () => {
    setReferralCopied(true);
    navigator.clipboard.writeText("https://sevasetu.gov.in/register?ref=GOLD492A");
    announceToScreenReader("रेफरल लिंक कॉपी झाली आहे.");
    setTimeout(() => setReferralCopied(false), 2000);
  };

  // Revoke Consent
  const toggleConsent = (purpose: string) => {
    setConsents((prev) =>
      prev.map((c) => {
        if (c.purpose === purpose) {
          const newStatus = c.status === "ACTIVE" ? "REVOKED" : "ACTIVE";
          announceToScreenReader(`सहमती स्थिती बदलली: ${purpose} आता ${newStatus === "ACTIVE" ? "सक्रिय" : "रद्द"} आहे.`);
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  // Purge Account (DPDP Right to Erasure Cascade)
  const executeAbsolutePurge = () => {
    setPurging(true);
    announceToScreenReader("DPDP कायदा २०२३ नुसार तुमची संपूर्ण माहिती आणि कागदपत्रे कायमची नष्ट केली जात आहेत...");
    setTimeout(() => {
      setPurging(false);
      setPurged(true);
      setShowPurgeModal(false);
      announceToScreenReader("खाते यशस्वीरित्या नष्ट केले गेले. सर्व डेटा सुरक्षितपणे पुसला गेला आहे.");
    }, 2500);
  };

  if (purged) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-red-200 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-700">माहिती पुसण्यात आली आहे (Data Erased)</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            DPDP कायदा २०२३ अंतर्गत तुमच्या अधिकारानुसार, तुमचे प्रोफाइल, कागदपत्रे आणि चॅट इतिहास आमच्या प्रणालीतून कायमचे नष्ट करण्यात आले आहेत.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#0F2C59] text-white py-3 rounded-lg font-bold hover:bg-[#07152c] transition h-12"
          >
            नवीन नोंदणी करा (New Register)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5] text-[#1C1C1C] flex flex-col font-sans antialiased">
      {/* Screen reader dynamic live status zone */}
      <div ref={screenReaderAnnouncerRef} className="sr-only" role="status" aria-live="polite"></div>

      {/* Main Dashboard Wrapper */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        
        {/* Profile and Coins Header block */}
        <section className="bg-gradient-to-r from-[#0F2C59] to-[#153b75] text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="w-16 h-16 rounded-full bg-[#E07A5F] text-white font-extrabold text-2xl flex items-center justify-center border-2 border-white shadow" aria-hidden="true">
              PK
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold">प्रियंका देशमूर्ख (Priyanka Deshmukh)</h2>
                <span className="bg-[#E07A5F] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/20 shadow-sm">
                  ★ Gold Member
                </span>
              </div>
              <p className="text-xs text-[#FAFAF5]/80">नोंदणीकृत फोन: +९१ XXXXX XX९२४ • सदस्यत्व संपण्याची तारीख: ३० मार्च २०२५</p>
              <div className="mt-2 text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 w-fit px-2 py-1 rounded">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                UPI AutoPay Active (₹४९/महिना)
              </div>
            </div>
          </div>

          {/* Point/Rewards counter */}
          <div className="bg-white/10 border border-white/10 rounded-xl p-4 flex items-center space-x-4 w-full md:w-auto shrink-0 shadow-inner">
            <div className="bg-[#E07A5F] rounded-full p-2" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-white/70 font-bold uppercase tracking-wider">जन सेवा कॉइन्स (Coins)</p>
              <p className="text-2xl font-black text-amber-300">{userCoins} Coins</p>
            </div>
          </div>
        </section>

        {/* Tab Controls for Dashboard Sections */}
        <nav className="flex bg-white p-1 rounded-xl border border-[#0F2C59]/10 shadow overflow-x-auto whitespace-nowrap scrollbar-none" aria-label="डॅशबोर्ड विभाग">
          {[
            { id: "schemes", label: "My Schemes Cart (योजना)", icon: "🌾" },
            { id: "docs", label: "DigiLocker (कागदपत्रे)", icon: "📄" },
            { id: "applications", label: "Applications Progress (अर्ज)", icon: "⏱" },
            { id: "referrals", label: "Referrals Rewards (रेफरल)", icon: "🤝" },
            { id: "privacy", label: "Privacy (गोपनीयता & DPDP)", icon: "🛡️" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveDashboardTab(tab.id as any);
                announceToScreenReader(`${tab.label} विभाग उघडला.`);
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-bold rounded-lg transition-all h-12 ${
                activeDashboardTab === tab.id
                  ? "bg-[#0F2C59] text-white shadow"
                  : "text-[#0F2C59] hover:bg-[#0F2C59]/5"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab Content 1: Schemes Cart */}
        {activeDashboardTab === "schemes" && (
          <section className="bg-white rounded-2xl border border-[#0F2C59]/10 shadow-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0F2C59]">माझे जतन केलेल्या योजना (My Schemes Cart)</h3>
                <p className="text-xs text-gray-500">तुमच्या मसुद्यात किंवा जतन केलेल्या योजना ज्यांच्यासाठी तुम्ही अर्ज करू शकता.</p>
              </div>
              <span className="text-xs bg-[#0F2C59]/5 text-[#0F2C59] border border-[#0F2C59]/10 px-3 py-1 rounded font-bold">
                {savedSchemes.length} जतन केलेल्या
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedSchemes.map((scheme) => (
                <div key={scheme.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-[#0F2C59]/10 text-[#0F2C59] px-2 py-0.5 rounded font-bold uppercase">
                      {scheme.category}
                    </span>
                    <h4 className="font-bold text-sm text-[#1C1C1C] line-clamp-1">{scheme.name}</h4>
                    <p className="text-xs text-gray-500">फायदा: <span className="font-bold text-[#0F2C59]">{scheme.dbtAmount}</span></p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      scheme.status === "applied"
                        ? "bg-emerald-50 border-emerald-200 text-[#1F4E3D]"
                        : scheme.status === "eligible"
                        ? "bg-blue-50 border-blue-200 text-[#1D4ED8]"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}>
                      {scheme.status === "applied" && "✓ अर्ज भरला"}
                      {scheme.status === "eligible" && "● तुम्ही पात्र आहात"}
                      {scheme.status === "pending_doc" && "⚠ अपूर्ण दस्तऐवज"}
                    </span>

                    <a
                      href={scheme.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#1D4ED8] font-bold hover:underline inline-flex items-center space-x-1"
                      aria-label={`${scheme.name} अधिकृत पोर्टलला भेट द्या`}
                    >
                      <span>Apply</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab Content 2: DigiLocker Vault */}
        {activeDashboardTab === "docs" && (
          <section className="bg-white rounded-2xl border border-[#0F2C59]/10 shadow-lg p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#0F2C59]">डिजीलॉकर संकालन तिजोरी (DigiLocker Sync Vault)</h3>
                <p className="text-xs text-gray-500">तुमची कागदपत्रे अधिकृत शासकीय डेटाबेसमधून थेट संकालित (sync) करा.</p>
              </div>

              {!digiLockerSynced ? (
                <button
                  onClick={handleDigiLockerSync}
                  disabled={syncing}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow h-11 flex items-center space-x-2 transition-all focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  aria-label="डिजीलॉकर संकालित करा"
                >
                  {syncing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>जोडत आहे...</span>
                    </>
                  ) : (
                    <>
                      <span>🔗 जोडा आणि मिळवा ५० कॉइन्स</span>
                    </>
                  )}
                </button>
              ) : (
                <span className="bg-emerald-100 text-[#1F4E3D] border border-emerald-300 text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1">
                  <span>✓ डिजीलॉकर संकालित आहे (Synced)</span>
                </span>
              )}
            </div>

            {/* Simulated Verified Documents Ledger */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "जात प्रमाणपत्र (Caste Certificate)", source: "State Revenue Dept", synced: digiLockerSynced, number: "CC-89410292" },
                { title: "उत्पन्न दाखला (Income Certificate)", source: "State Revenue Dept", synced: digiLockerSynced, number: "INC-2024-9102" },
                { title: "आधार कार्ड (Aadhaar Card)", source: "UIDAI", synced: true, number: "XXXX-XXXX-8924" },
                { title: "रेशन कार्ड (Ration Card)", source: "PDS Portal", synced: digiLockerSynced, number: "RC-MH-492102" }
              ].map((doc, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-[#1C1C1C]">{doc.title}</h4>
                    <p className="text-[11px] text-gray-500">स्त्रोत: {doc.source}</p>
                    {doc.synced && (
                      <p className="text-xs font-mono text-gray-600">ID: {doc.number}</p>
                    )}
                  </div>

                  <div>
                    {doc.synced ? (
                      <span className="bg-emerald-50 text-[#1F4E3D] border border-emerald-200 text-[10px] font-extrabold uppercase px-2 py-1 rounded">
                        ✓ सत्यापित
                      </span>
                    ) : (
                      <span className="bg-gray-200 text-gray-500 border border-gray-300 text-[10px] font-extrabold uppercase px-2 py-1 rounded">
                        असंकालित
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab Content 3: Application Ledger Progress */}
        {activeDashboardTab === "applications" && (
          <section className="bg-white rounded-2xl border border-[#0F2C59]/10 shadow-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#0F2C59]">माझे अर्ज प्रगती अहवाल (Applications Progress)</h3>
              <p className="text-xs text-gray-500">विविध शासकीय पोर्टलवर दाखल केलेल्या अर्जांची सद्यस्थिती खालीलप्रमाणे आहे.</p>
            </div>

            <div className="space-y-6">
              {applications.map((app) => (
                <div key={app.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-gray-200/60">
                    <div>
                      <h4 className="font-bold text-sm md:text-base text-[#1C1C1C]">{app.name}</h4>
                      <p className="text-[11px] text-gray-500">पोर्टल: {app.portal} • शेवटचा बदल: {app.updatedAt}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      app.status === "APPROVED"
                        ? "bg-emerald-50 border-emerald-300 text-[#1F4E3D]"
                        : app.status === "VERIFYING"
                        ? "bg-blue-50 border-blue-300 text-[#1D4ED8]"
                        : "bg-gray-100 border-gray-300 text-gray-600"
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Dynamic Progress Timeline Bar */}
                  <div className="pt-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">प्रगती टप्पे (Timeline Steps):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2">
                      {app.steps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-center space-x-3 sm:space-x-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            step.done
                              ? "bg-[#0F2C59] text-white"
                              : "bg-gray-200 text-gray-500 border border-gray-300"
                          }`}>
                            {step.done ? "✓" : sIdx + 1}
                          </div>
                          <span className={`text-xs font-bold ${
                            step.done ? "text-[#0F2C59]" : "text-gray-400"
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab Content 4: Referral System */}
        {activeDashboardTab === "referrals" && (
          <section className="bg-white rounded-2xl border border-[#0F2C59]/10 shadow-lg p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Actions and QR */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-[#0F2C59]">ग्रामसेवक व लीडर रेफरल कार्यक्रम (Referral Program)</h3>
                  <p className="text-xs text-gray-500">इतर गरजूंना सेवासेतू AI द्वारे अर्ज भरण्यास मदत करा आणि 'जन सेवा कॉइन्स' कमवा.</p>
                </div>

                <div className="bg-[#FAFAF5] p-4 rounded-xl border border-[#0F2C59]/10 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-500">तुमचा रेफरल कोड:</span>
                    <div className="flex items-center space-x-2">
                      <span className="bg-white border border-[#0F2C59]/20 rounded px-3 py-2 text-sm font-mono font-bold text-[#0F2C59] select-all">
                        GOLD492A
                      </span>
                      <button
                        onClick={handleCopyReferral}
                        className="bg-[#0F2C59] hover:bg-[#07152c] text-white text-xs font-bold px-4 py-2.5 rounded h-10 transition focus:ring-2 focus:ring-[#1D4ED8]"
                      >
                        {referralCopied ? "कॉपी झाला!" : "कॉपी करा"}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600">
                    तुमच्या लिंकद्वारे नोंदणी करणाऱ्या प्रत्येक नागरिकासाठी तुम्हाला <strong>५० कॉइन्स</strong> आणि त्यांना <strong>२५ कॉइन्स</strong> मिळतील.
                  </p>
                </div>

                {/* Redeem Rewards section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[#0F2C59] uppercase tracking-wider">कॉइन्सचे बक्षीस रुपांतर (Redeem Ledger):</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { reward: "Mantra Biometric MFS100", cost: "२००० कॉइन्स", desc: "CSC केंद्रासाठी आधार फिंगरप्रिंट स्कॅनर उपकरण." },
                      { reward: "1 Month Gold Free", cost: "४०० कॉइन्स", desc: "तुमच्या खात्यासाठी विनामूल्य १ महिन्याचा विमा आणि अलर्ट." }
                    ].map((item, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-white space-y-2 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-xs text-[#0F2C59]">{item.reward}</p>
                          <p className="text-[11px] text-gray-500 leading-tight mt-1">{item.desc}</p>
                        </div>
                        <button
                          disabled={userCoins < (idx === 0 ? 2000 : 400)}
                          className="w-full bg-[#E07A5F] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs py-1.5 rounded transition"
                        >
                          Redeem • {item.cost}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Mini Leaderboard */}
              <div className="lg:col-span-5 bg-[#0F2C59]/5 rounded-xl p-4 border border-[#0F2C59]/10 space-y-4">
                <h4 className="font-bold text-sm text-[#0F2C59] uppercase tracking-wider pb-2 border-b border-[#0F2C59]/15 flex items-center gap-1.5">
                  🏆 विभागीय लीडरबोर्ड (Gram Leaders)
                </h4>

                <div className="space-y-2.5">
                  {[
                    { rank: 1, name: "रामभाऊ शिंदे (Ram Patel)", referals: "१४२", village: "उस्मानाबाद", points: "७,१००" },
                    { rank: 2, name: "संजय खोत (Sanjay Khot)", referals: "९८", village: "कोल्हापूर", points: "४,९००" },
                    { rank: 3, name: "प्रिया शर्मा (Priya Sharma)", referals: "७४", village: "पुणे", points: "३,७००" },
                    { rank: 12, name: "प्रियंका देशमूर्ख (You)", referals: "९", village: "पुणे", points: "४५०" }
                  ].map((leader, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold ${
                        leader.rank === 12 ? "bg-[#0F2C59] text-white" : "bg-white border border-gray-200 text-[#1C1C1C]"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 text-center">{leader.rank}</span>
                        <div>
                          <p>{leader.name}</p>
                          <p className={`text-[9px] ${leader.rank === 12 ? "text-white/75" : "text-gray-400"}`}>
                            {leader.village}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p>{leader.points} pts</p>
                        <p className={`text-[9px] ${leader.rank === 12 ? "text-white/75" : "text-gray-400"}`}>
                          {leader.referals} रेफरल्स
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>
        )}

        {/* Tab Content 5: DPDP Act Privacy Manager */}
        {activeDashboardTab === "privacy" && (
          <section className="bg-white rounded-2xl border border-[#0F2C59]/10 shadow-lg p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#0F2C59]">DPDP कायदा २०२३ डेटा व्यवस्थापन (Consent Vault)</h3>
                <p className="text-xs text-gray-500">तुमच्या संमतीचे अधिकार नियंत्रित करा आणि तुमच्या डेटाच्या सुरक्षिततेची खात्री करा.</p>
              </div>

              {/* Absolute Delete Button */}
              <button
                onClick={() => setShowPurgeModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow h-11 flex items-center space-x-2 transition focus:ring-2 focus:ring-red-500 focus:outline-none"
                aria-label="खाते आणि डेटा पूर्ण नष्ट करा (Right to Erasure)"
              >
                🗑️ डेटा पूर्ण नष्ट करा (Delete Data)
              </button>
            </div>

            {/* Consents table list */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">माझ्या संमतीची यादी (Active Consent Records):</h4>
              <div className="space-y-2.5">
                {consents.map((c) => (
                  <div key={c.purpose} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-[#0F2C59] bg-white border px-2 py-0.5 rounded">
                          {c.purpose}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold">दिले: {c.grantedAt}</span>
                      </div>
                      <p className="text-xs font-bold text-[#1C1C1C]">{c.description}</p>
                    </div>

                    <button
                      onClick={() => toggleConsent(c.purpose)}
                      className={`px-4 py-2 rounded font-bold text-xs transition h-10 ${
                        c.status === "ACTIVE"
                          ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-300"
                          : "bg-emerald-50 hover:bg-emerald-100 text-[#1F4E3D] border border-emerald-300"
                      }`}
                      aria-label={`${c.purpose} साठी संमती बदला`}
                    >
                      {c.status === "ACTIVE" ? "Revoke (रद्द करा)" : "Grant (संमती द्या)"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Erasure Cascade Confirmation Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-red-100 animate-[subtleScale_0.2s_ease-out_1]">
            <div className="space-y-2 text-center">
              <span className="text-3xl" aria-hidden="true">⚠️</span>
              <h3 id="modal-title" className="text-xl font-bold text-red-700">कापडी सुरक्षा चेतावणी (Absolute Erasure Warning)</h3>
              <p className="text-xs text-gray-500">हे कृत्य पूर्ववत केले जाऊ शकत नाही.</p>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed text-center">
              DPDP कायदा २०२३ नुसार "Right to Erasure" चा वापर करून, तुमचे <strong>आधार कार्ड</strong>, <strong>सर्व डिजीलॉकर दस्तऐवज</strong>, <strong>जतन केलेल्या योजना</strong>, आणि <strong>चॅटचा सर्व इतिहास</strong> तात्काळ आमच्या सर्व्हरवरून कायमचे नष्ट केले जातील.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPurgeModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg h-12 transition"
              >
                रद्द करा (Cancel)
              </button>
              <button
                onClick={executeAbsolutePurge}
                disabled={purging}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg h-12 transition flex items-center justify-center space-x-2"
              >
                {purging ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>नष्ट करत आहे...</span>
                  </>
                ) : (
                  <span>नष्ट करा (Confirm Delete)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standard Footer Branding Block */}
      <footer className="w-full text-center py-4 text-xs text-[#1C1C1C]/50 border-t border-[#0F2C59]/10 bg-[#FAFAF5] mt-auto">
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
