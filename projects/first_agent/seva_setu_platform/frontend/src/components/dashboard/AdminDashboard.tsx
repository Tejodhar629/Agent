import React, { useState, useEffect, useRef } from "react";

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  ipAddress: string;
  details: string;
  timestamp: string;
}

interface DraftScheme {
  id: string;
  name: string;
  maker: string;
  createdAt: string;
  status: "DRAFT" | "ACTIVE" | "REJECTED";
  eligibilityJson: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"telemetry" | "maker_checker" | "audit_logs" | "database">("telemetry");
  const [activeModerators, setActiveModerators] = useState([
    { name: "Rahul Deshpande", role: "CHECKER_ADMIN", active: true, department: "MeitY Coordinator" },
    { name: "Suresh Pillai", role: "MAKER_MODERATOR", active: true, department: "Agriculture Officer" },
    { name: "Meera Nair", role: "AUDITOR", active: false, department: "Third-party Security Compliance" }
  ]);

  const [activeAlerts, setActiveAlerts] = useState([
    { id: "alt-1", message: "Bhashini TTS Latency warning (> 3.5s in Karnataka region)", severity: "medium", time: "2 min ago" },
    { id: "alt-2", message: "Aadhaar Masking Guard triggered: blocked raw image upload attempt in S3 root", severity: "high", time: "10 min ago" }
  ]);

  // Maker-Checker state
  const [draftSchemes, setDraftSchemes] = useState<DraftScheme[]>([
    {
      id: "ds-1",
      name: "नमो शेतकरी महासन्मान निधी २०२४ (Namo Shetkari Yojana - MH)",
      maker: "Suresh Pillai (Agriculture)",
      createdAt: "09 Dec 2024, 02:14 PM",
      status: "DRAFT",
      eligibilityJson: JSON.stringify({ incomeCeiling: 300000, stateScope: "MH", ageRange: [18, 65] }, null, 2)
    },
    {
      id: "ds-2",
      name: "महाराष्ट्र सुशिक्षित बेरोजगार कर्ज योजना (Unemployment Loan Scheme)",
      maker: "Amit Kadam (Employment)",
      createdAt: "09 Dec 2024, 11:30 AM",
      status: "DRAFT",
      eligibilityJson: JSON.stringify({ ageRange: [18, 35], qualification: "Graduate", incomeCeiling: 200000 }, null, 2)
    }
  ]);

  // Security Audit Log records matching GIGW 3.0 / SOC-2
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: "log-1", action: "AADHAAR_VAULT_QUERY", actor: "system-ocr-guard", ipAddress: "10.0.4.152", details: "Aadhaar token generated for masked input (XXXX-XXXX-8924)", timestamp: "09 Dec 2024, 03:14:15 PM" },
    { id: "log-2", action: "CONSENT_RECORDED", actor: "citizen_priyanka_924", ipAddress: "157.45.102.12", details: "Consent purpose SCHEME_ELIGIBILITY granted (multilingual notice hi-IN)", timestamp: "09 Dec 2024, 03:12:02 PM" },
    { id: "log-3", action: "DATABASE_KEY_ROTATION", actor: "kms-cron-service", ipAddress: "AWS_INTERNAL", details: "Symmetric key rotated automatically for columns: UserProfile.fullNameEnc", timestamp: "09 Dec 2024, 12:00:00 AM" },
    { id: "log-4", action: "USER_ABSOLUTE_ERASURE", actor: "citizen_anon_891", ipAddress: "112.92.14.85", details: "DPDP Right to Erasure cascade triggered. Purged UserProfile, AadhaarVault, and Document entries for UserID: user_891240", timestamp: "08 Dec 2024, 08:45:10 PM" }
  ]);

  // Telemetry indicators
  const [concurrentUsers, setConcurrentUsers] = useState(1420);
  const [apiLatency, setApiLatency] = useState(140); // ms
  const [qdrantIndexedDocs, setQdrantIndexedDocs] = useState(4892);
  const [indexingSchemeId, setIndexingSchemeId] = useState<string | null>(null);
  const [indexingProgress, setIndexingProgress] = useState(0);

  const screenReaderAnnouncerRef = useRef<HTMLDivElement | null>(null);

  const announceToScreenReader = (text: string) => {
    if (screenReaderAnnouncerRef.current) {
      screenReaderAnnouncerRef.current.innerText = text;
    }
  };

  // Simulating random telemetry drifts
  useEffect(() => {
    const interval = setInterval(() => {
      setConcurrentUsers((prev) => prev + Math.floor(Math.random() * 11) - 5);
      setApiLatency((prev) => Math.max(90, prev + Math.floor(Math.random() * 9) - 4));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle Maker-Checker approval and index to Qdrant
  const handleApproveAndIndex = (schemeId: string, name: string) => {
    setIndexingSchemeId(schemeId);
    setIndexingProgress(0);
    announceToScreenReader(`${name} मंजूर केले जात आहे. Qdrant वेक्टर डेटाबेसमध्ये नवीन एम्बेडिंग तयार करण्याची प्रक्रिया सुरू झाली आहे.`);

    // Simulate embedding generation and indexing
    const interval = setInterval(() => {
      setIndexingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDraftSchemes((old) => old.filter((s) => s.id !== schemeId));
          setQdrantIndexedDocs((old) => old + 1);
          setIndexingSchemeId(null);
          
          // Inject an audit log
          const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            action: "SCHEME_VECTOR_INDEX_REFRESH",
            actor: "Rahul Deshpande (CHECKER_ADMIN)",
            ipAddress: "10.0.1.45",
            details: `Scheme ${name} approved. Celery embedding worker finished reindexing Qdrant index.`,
            timestamp: new Date().toLocaleString()
          };
          setAuditLogs((old) => [newLog, ...old]);
          announceToScreenReader(`${name} यशस्वीरित्या मंजूर आणि Qdrant वेक्टर डेटाबेसमध्ये संकलित करण्यात आले आहे.`);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5] text-[#1C1C1C] flex flex-col font-sans antialiased">
      
      {/* Screen Reader Announcements */}
      <div ref={screenReaderAnnouncerRef} className="sr-only" role="status" aria-live="polite"></div>

      {/* Admin Top Navigation Bar */}
      <header className="w-full bg-[#0F2C59] text-white border-b border-[#0F2C59]/15 px-4 py-3 md:px-8 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow" aria-hidden="true">
            <span className="text-xl font-bold text-[#0F2C59]">⚙️</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">
              सेवासेतू AI <span className="text-xs bg-[#E07A5F] px-1.5 py-0.5 rounded text-white ml-2">Admin Panel</span>
            </h1>
            <p className="text-[10px] md:text-xs text-[#FAFAF5]/80">राष्ट्रीय शासकीय योजना व सुरक्षा मॉनिटरिंग</p>
          </div>
        </div>

        {/* Admin Coordinator details */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">Rahul Deshpande</p>
            <p className="text-[10px] text-white/70 uppercase font-extrabold tracking-widest">Checker Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E07A5F] border-2 border-white flex items-center justify-center font-bold text-white">
            RD
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">

        {/* Global Operational Metrics Cards Row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="सिस्टम टेलिमेट्री">
          
          <div className="bg-white rounded-xl p-4 border border-[#0F2C59]/10 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-[#0F2C59]/5 text-[#0F2C59]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">सक्रिय नागरिक (Active Users)</p>
              <p className="text-2xl font-black text-[#0F2C59]">{concurrentUsers}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#0F2C59]/10 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-emerald-50 text-[#1F4E3D]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">सरासरी लेटन्सी (API Latency)</p>
              <p className="text-2xl font-black text-emerald-700">{apiLatency} ms</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#0F2C59]/10 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-[#E07A5F]/5 text-[#E07A5F]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Qdrant इंडेक्स (Vector DB)</p>
              <p className="text-2xl font-black text-[#E07A5F]">{qdrantIndexedDocs} एम्बेडिंग्स</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-[#0F2C59]/10 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-800" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">सक्रिय अलर्ट्स (Alerts)</p>
              <p className="text-2xl font-black text-amber-700">{activeAlerts.length} इशारे</p>
            </div>
          </div>

        </section>

        {/* Tab Controls */}
        <nav className="flex bg-white p-1 rounded-xl border border-[#0F2C59]/10 shadow overflow-x-auto whitespace-nowrap scrollbar-none" aria-label="ऍडमीन विभाग">
          {[
            { id: "telemetry", label: "Operational Stats (थेट आकडेवारी)", icon: "📊" },
            { id: "maker_checker", label: "Maker-Checker Workflow (मंजुरी)", icon: "🤝" },
            { id: "audit_logs", label: "Security Audit Logs (सुरक्षा लॉग)", icon: "🛡️" },
            { id: "database", label: "System Alerts & Overrides (इशारे)", icon: "⚙️" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                announceToScreenReader(`${tab.label} विभाग उघडला.`);
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-bold rounded-lg transition-all h-12 ${
                activeTab === tab.id
                  ? "bg-[#0F2C59] text-white shadow"
                  : "text-[#0F2C59] hover:bg-[#0F2C59]/5"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Section 1: Detailed Telemetry and Moderators */}
        {activeTab === "telemetry" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Live active coordinators */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#0F2C59]/10 shadow-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#0F2C59] uppercase tracking-wider text-sm">सक्रिय समन्वयक अधिकारी (Active Moderators)</h3>
                <span className="text-[10px] bg-emerald-100 text-[#1F4E3D] px-2 py-0.5 rounded font-extrabold uppercase">
                  ONLINE SECURE
                </span>
              </div>

              <div className="space-y-3">
                {activeModerators.map((mod, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 bg-gray-50/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3.5 h-3.5 rounded-full ${mod.active ? "bg-emerald-500" : "bg-gray-300"}`} />
                      <div>
                        <p className="text-xs font-bold text-[#1C1C1C]">{mod.name}</p>
                        <p className="text-[10px] text-gray-500">{mod.department}</p>
                      </div>
                    </div>
                    <span className="bg-[#0F2C59]/5 text-[#0F2C59] border text-[9px] font-extrabold px-2 py-0.5 rounded">
                      {mod.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Micro Alerts Panel */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#0F2C59]/10 shadow-lg p-6 space-y-4">
              <h3 className="font-bold text-[#0F2C59] uppercase tracking-wider text-sm">प्रणाली सुरक्षा इशारे (Active Alerts)</h3>
              
              <div className="space-y-3">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col justify-between gap-1.5 ${
                      alert.severity === "high"
                        ? "bg-red-50 border-red-200 text-red-900"
                        : "bg-amber-50 border-amber-200 text-amber-900"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p>{alert.message}</p>
                      <span className="text-[9px] uppercase shrink-0 px-1 border border-current rounded ml-1 font-extrabold">
                        {alert.severity}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 block text-right font-medium">{alert.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Section 2: Maker-Checker Flow Panel */}
        {activeTab === "maker_checker" && (
          <section className="bg-white rounded-2xl border border-[#0F2C59]/10 shadow-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0F2C59]">नवीन योजना मंजुरी मंच (Maker-Checker Management)</h3>
                <p className="text-xs text-gray-500">समन्वयकांनी तयार केलेल्या योजना तपासून Qdrant वेक्टर डेटाबेसमध्ये समाविष्ट करण्यासाठी मंजूर करा.</p>
              </div>
              <span className="text-xs bg-[#E07A5F]/10 text-[#E07A5F] border border-[#E07A5F]/20 px-3 py-1 rounded font-bold">
                {draftSchemes.length} मंजुरी प्रलंबित
              </span>
            </div>

            <div className="space-y-4">
              {draftSchemes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-bold">
                  ✓ सर्व योजना मंजूर आणि संकलित केल्या आहेत. कोणतीही योजना प्रलंबित नाही.
                </div>
              ) : (
                draftSchemes.map((scheme) => (
                  <div key={scheme.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-[#E07A5F] text-white text-[10px] font-extrabold px-2 py-0.5 rounded">
                          {scheme.status}
                        </span>
                        <span className="text-[11px] text-gray-500">तयार केले: {scheme.maker} • {scheme.createdAt}</span>
                      </div>
                      <h4 className="font-bold text-sm md:text-base text-[#1C1C1C]">{scheme.name}</h4>
                      
                      {/* JSON Schema Preview Accordion */}
                      <div className="text-xs">
                        <p className="font-bold text-gray-500 uppercase mb-1">पात्रता नियमांचे JSON संरचना (Eligibility Rules):</p>
                        <pre className="bg-white border border-gray-200 rounded-lg p-2.5 font-mono text-gray-700 overflow-x-auto max-h-32">
                          {scheme.eligibilityJson}
                        </pre>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="shrink-0 flex md:flex-col gap-2 justify-end">
                      {indexingSchemeId === scheme.id ? (
                        <div className="w-full min-w-[140px] text-center space-y-1">
                          <p className="text-[10px] text-[#E07A5F] font-black uppercase tracking-widest animate-pulse">
                            Indexing... {indexingProgress}%
                          </p>
                          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#E07A5F] h-1.5 rounded-full" style={{ width: `${indexingProgress}%` }}></div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApproveAndIndex(scheme.id, scheme.name)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded h-10 transition focus:ring-2 focus:ring-emerald-500"
                          >
                            मंजूर करा (Approve & Index)
                          </button>
                          <button
                            onClick={() => {
                              setDraftSchemes((old) =>
                                old.map((s) => (s.id === scheme.id ? { ...s, status: "REJECTED" } : s))
                              );
                              announceToScreenReader(`${scheme.name} नाकारण्यात आली.`);
                            }}
                            className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs px-4 py-2.5 rounded h-10 transition focus:ring-2 focus:ring-red-500"
                          >
                            नाकारा (Reject)
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Section 3: High-Security Audit Logs Grid */}
        {activeTab === "audit_logs" && (
          <section className="bg-white rounded-2xl border border-[#0F2C59]/10 shadow-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#0F2C59]">सुरक्षा अंमलबजावणी व ऑडिट लॉग्स (Security Audit Logs)</h3>
              <p className="text-xs text-gray-500">GIGW ३.०, SOC-२ आणि CERT-In मानकांनुसार प्रणालीवरील प्रत्येक हालचालीची अपरिवर्तनीय नोंदणी.</p>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs font-bold border-collapse">
                <thead>
                  <tr className="bg-[#0F2C59]/5 border-b border-gray-200 text-[#0F2C59]">
                    <th className="p-3">कृती (Action)</th>
                    <th className="p-3">वापरकर्ता (Actor)</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">तपशील (Details)</th>
                    <th className="p-3 text-right">वेळ (Timestamp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-mono font-bold">
                        <span className="bg-[#0F2C59]/10 text-[#0F2C59] px-2 py-0.5 rounded border border-[#0F2C59]/10">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-[#1C1C1C]">{log.actor}</td>
                      <td className="p-3 font-mono text-gray-500">{log.ipAddress}</td>
                      <td className="p-3 max-w-xs truncate text-gray-600 font-medium">{log.details}</td>
                      <td className="p-3 text-right text-gray-500 font-medium">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section 4: System Alerts and Database Failover */}
        {activeTab === "database" && (
          <section className="bg-white rounded-2xl border border-[#0F2C59]/10 shadow-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#0F2C59]">प्रणाली नियंत्रक व आपत्कालीन व्यवस्थापन (Overrides & Failover)</h3>
              <p className="text-xs text-gray-500">डेटाबेस सर्किट ब्रेकर्स आणि आपत्कालीन परिस्थितीमध्ये प्रणालीतील बदल नियंत्रित करा.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Failover Status Panel */}
              <div className="border border-gray-200 rounded-xl p-5 bg-[#FAFAF5]/60 space-y-4">
                <h4 className="font-bold text-sm text-[#0F2C59] uppercase tracking-wider pb-2 border-b border-gray-200">
                  ⚡ AWS Multi-AZ Failover Status
                </h4>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-500">मुंबई मुख्य नोड (Mumbai Primary Node):</span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase font-bold">
                    ONLINE [OK]
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-500">चेन्नई स्टँडबाय नोड (Chennai Passive Replica):</span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase font-bold">
                    SYNCHRONIZED [OK]
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      alert("Manual failover initiated. Shifting active connections to Chennai Node.");
                      announceToScreenReader("मॅन्युअल फेलओव्हर प्रक्रिया सुरू केली.");
                    }}
                    className="bg-[#0F2C59] hover:bg-[#07152c] text-white font-bold text-xs px-4 py-2 rounded h-10 transition"
                  >
                    Initiate Failover Test
                  </button>
                </div>
              </div>

              {/* API Circuit Breaker */}
              <div className="border border-gray-200 rounded-xl p-5 bg-[#FAFAF5]/60 space-y-4">
                <h4 className="font-bold text-sm text-[#0F2C59] uppercase tracking-wider pb-2 border-b border-gray-200">
                  🔌 LLM Provider Circuit Breaker
                </h4>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-500">Primary Model (OpenAI GPT-4o-mini):</span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase font-bold">
                    CONNECTED
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-500">Backup Model (Claude Bedrock):</span>
                  <span className="text-gray-500 bg-gray-100 border border-gray-300 px-2 py-0.5 rounded uppercase font-bold">
                    STANDBY
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      alert("Primary endpoint changed. Active LLM switched to Claude Bedrock.");
                      announceToScreenReader("पार्श्वभूमी मॉडेल बदलले.");
                    }}
                    className="bg-[#E07A5F] hover:bg-[#c9694e] text-white font-bold text-xs px-4 py-2 rounded h-10 transition"
                  >
                    Force Switch to Backup LLM
                  </button>
                </div>
              </div>

            </div>
          </section>
        )}

      </main>

      {/* Admin Panel Footer */}
      <footer className="w-full text-center py-4 text-xs text-[#1C1C1C]/50 border-t border-[#0F2C59]/10 bg-[#FAFAF5] mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p>© २०२४ सेवासेतू भारत. प्रशासकीय पॅनेल - अंतर्गत वापरासाठी मर्यादित.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:underline hover:text-[#0F2C59]">सुरक्षा मार्गदर्शक (Audit Security guidelines)</a>
            <a href="#" className="hover:underline hover:text-[#0F2C59]">GIGW ३.० सुसंगतता</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
