# Jan Seva AI - User Stories & Acceptance Criteria

**Document Identifier:** JS-USAC-V1.0.0  
**Classification:** Restricted (Government/Enterprise Standard)  
**Authors:** Lead Product Manager & Lead QA Architect  
**Date:** October 2023  
**Status:** Approved  

---

## 1. Introduction

### 1.1 Document Purpose
This document specifies the core user stories and rigorous, executable Acceptance Criteria for **Jan Seva AI** (conversational e-governance platform for India). It serves as the primary guidance for frontend engineers, backend developers, and automated test engineers (writing BDD Integration tests via Behave or Cucumber).

### 1.2 Target Personas
To ensure that development directly aligns with enterprise customer requirements, all user stories are mapped to our primary target personas:
* **Ramesh Kumar (Rural Farmer, Unnao, UP):** Spoken Hindi/Awadhi; voice-first interface; PM-KISAN and PMFBY crop insurance; low digital literacy.
* **Priya Sharma (Micro-Entrepreneur, Jaipur, Rajasthan):** Hinglish/English; business-oriented; Udyam MSME, MUDRA loans, GST, and tax planning.
* **Aarav Patel (Tech Student, Bengaluru):** English/Kannada; highly digital; Post-Matric Scholarships, DigiLocker integration, PAN, and passport routing.
* **Devendra Hegde (Senior Pensioner, Pune, Maharashtra):** Marathi/English; senior accessibility wizard; Jeevan Pramaan face authentication and CGHS.

---

## 2. User Stories & Acceptance Criteria Matrix

---

### Epic 1: Conversational AI & Welfare Modules (P0)

#### US-1.1: Voice-First Scheme Discovery for Rural Citizens
* **User Story:**  
  As a **Rural Farmer (Ramesh Kumar)**,  
  I want to **speak my query in my regional dialect and listen to a clear audio response**,  
  so that **I can check my eligibility for PM-KISAN or PMFBY without needing to read complex English text or pay middleman fees**.

* **Acceptance Criteria (Gherkin Syntax):**

  ```gherkin
  Scenario: Successfully executing a voice-based crop insurance query in Hindi
    Given the user "Ramesh" has opened the Jan Seva AI mobile web page
    And "Ramesh" has selected "Hindi" as his language preference
    And the page displays a large, pulsating microphone icon centered on the screen
    When "Ramesh" taps the microphone icon and speaks: "Untimely rains ruined my wheat. How do I get insurance money?"
    Then the mobile client stream-uploads the audio payload in .ogg format to the backend
    And the Bhashini ASR pipeline transcribes the Awadhi-Hindi audio to text script
    And the translation engine converts the Hindi script to English: "Untimely rains ruined my wheat. How do I get insurance money?"
    And the RAG core queries Qdrant and matches the "PM Fasal Bima Yojana" scheme guidelines
    And the system synthesizes a concise, whitelisted Hindi response: "Ramesh, you can claim PM Fasal Bima Yojana compensation within 72 hours. Please upload photos of your fields and your land records."
    And the Bhashini TTS engine synthesizes the text into clear, natural Hindi audio
    And the mobile UI plays the Hindi audio stream with an active wave indicator on screen
    And the screen displays a large card matching "PM Fasal Bima Yojana" with a direct link to apply

  Scenario: Filtering background noise during active voice recording
    Given the user "Ramesh" is standing in a noisy farm field with background tractor sounds
    And he taps the microphone button to record a query
    When the system captures the audio stream
    Then the client-side noise-cancellation filter attenuates high-frequency background noise below 25dB
    And the Bhashini ASR successfully transcribes the vocal query without throwing semantic errors
  ```

#### US-1.2: Student Scholarship Discovery & DigiLocker Document Integration
* **User Story:**  
  As a **Tech Student (Aarav Patel)**,  
  I want to **link my DigiLocker account to automatically verify my academic marks and caste records**,  
  so that **the system can instantly confirm my eligibility and fill out my Post-Matric Scholarship applications**.

* **Acceptance Criteria (Gherkin Syntax):**

  ```gherkin
  Scenario: Successfully pulling academic records from DigiLocker to confirm scholarship eligibility
    Given the user "Aarav" is authenticated on his Jan Seva dashboard
    And he navigates to the "Scholarship Finder" module
    And his profile indicates "Karnataka" state residency and "OBC" caste category
    When "Aarav" clicks the "Link DigiLocker to Check Eligibility" button
    Then the system redirects "Aarav" to the official e-Pramaan OAuth authorization gateway
    And "Aarav" signs in using his Aadhaar OTP
    And the system receives a secure authorization token from DigiLocker
    And the Verification Agent queries the connected DigiLocker API to fetch Aarav's "12th Marks Card" XML and "Caste Certificate" PDF
    And the platform extracts his GPA (85%) and confirms his OBC status
    And the eligibility engine matches him as "100% Eligible" for the "Post-Matric OBC Scholarship Karnataka"
    And the dashboard UI renders a prominent green checkmark badge stating "Eligible - Documents Verified"
  ```

#### US-1.3: Senior Citizen Digital Life Certificate Guided Setup
* **User Story:**  
  As a **Senior Pensioner (Devendra Hegde)**,  
  I want to **use a highly-accessible, voice-guided Marathi interface with large text targets**,  
  so that **I can successfully submit my digital life certificate (Jeevan Pramaan) from home without physical discomfort**.

* **Acceptance Criteria (Gherkin Syntax):**

  ```gherkin
  Scenario: Submitting Jeevan Pramaan via face authentication with Marathi audio guidance
    Given the user "Devendra" has activated "Senior Accessibility Mode"
    And the user interface shifts to a high-contrast layout (contrast ratio 7:1) with text sizes scaled to 18px
    And the language is set to "Marathi"
    When "Devendra" opens the "Pension Assistant" panel
    Then the system reads out the instructions in spoken Marathi using automatic text-to-speech
    And the screen displays single, simple questions with large buttons (minimum tap target 48x48px)
    When "Devendra" enters his Pension Payment Order (PPO) number and clicks "Proceed to Face Auth"
    Then the platform initiates the UIDAI Face-RD liveness camera overlay
    And the Marathi voice-over guides him in real-time: "Hold the camera steady. Blink your eyes now."
    And the liveness detection system validates his active presence and successfully pushes the transaction to the central Jeevan Pramaan database
    And the UI triggers a deep success chime, displaying a large confirmation checkmark and a printable high-font PDF receipt
  ```

---

### Epic 2: Business, Taxation & Registration Assistance (P1)

#### US-2.1: MSME Loan Eligibility Checker & EMI Slider
* **User Story:**  
  As a **Micro-Entrepreneur (Priya Sharma)**,  
  I want to **check my eligibility for a collateral-free MUDRA loan in Hinglish and slide repayments dynamically**,  
  so that **I can plan my business expansion with transparent interest rates and zero hidden fees**.

* **Acceptance Criteria (Gherkin Syntax):**

  ```gherkin
  Scenario: Checking MUDRA Kishor Loan eligibility using bilingual Hinglish chat
    Given the user "Priya" is in the "MSME & Startup Assistant" chat console
    When she types: "Mujhe boutique scale up karne ke liye collateral-free MUDRA loan chahiye"
    Then the bilingual LLM parses the Hinglish input and identifies the intent as "MUDRA_LOAN_DISCOVERY"
    And the system asks her for three inputs: business category, aggregate annual turnover, and Udyam MSME number
    When she inputs her Udyam number and a turnover of "15 Lakhs"
    Then the Verification Agent fetches her MSME registration details via public API Setu gateways
    And the system displays a customized "MUDRA Kishor Loan" match card showing:
      | Parameter        | Value                                            |
      | Loan Range       | ₹50,000 to ₹5,00,000                             |
      | Collateral Req.  | Nil (Government-backed guarantee)                |
      | Interest Rate    | 8.5% to 11.2% per annum                          |
    And the card renders an interactive repayment calculator slider widget

  Scenario: Adjusting loan EMIs using the visual calculator slider
    Given the interactive repayment calculator slider is rendered on Priya's screen
    When she slides the loan amount target to "₹4,00,000" and the repayment tenure to "36 Months"
    Then the calculator recalculates the results instantly (under 100ms) without page reloads
    And the screen displays: "Monthly EMI: ₹12,630, Total Interest Payable: ₹54,680"
    And the UI renders a prominent action button: "Generate Bank-ready Application PDF"
  ```

#### US-2.2: Dual-Regime Income Tax Comparative Calculator
* **User Story:**  
  As a **Micro-Entrepreneur (Priya Sharma)**,  
  I want to **input my revenues and deductions to see a side-by-side comparison of the New vs. Old tax regimes**,  
  so that **I can make an informed choice on which structure minimizes my overall tax obligations**.

* **Acceptance Criteria (Gherkin Syntax):**

  ```gherkin
  Scenario: Executing a comparative tax analysis with old and new slabs
    Given the user "Priya" is in the "Income Tax Assistant" calculator view
    When she inputs the following financial parameters:
      | Field                    | Value       |
      | Gross Salary / Revenue   | ₹12,00,000  |
      | Standard Deduction       | ₹50,000     |
      | Section 80C Deductions   | ₹1,50,000   |
      | Section 80D Deductions   | ₹25,000     |
      | HRA Deductions           | ₹1,20,000   |
    And she clicks "Calculate Comparative Tax Slabs"
    Then the tax engine computes liabilities under the New Tax Regime (Section 115BAC)
    And the engine computes liabilities under the Old Tax Regime applying standard deductions
    And the interface renders a side-by-side bar graph comparing the two liabilities
    And the UI displays a clear recommendation: "The Old Tax Regime saves you ₹18,200 this fiscal year. Click here to redirect to the official e-filing portal."
  ```

---

### Epic 3: Administrative Dashboards & Verification Systems (P1)

#### US-3.1: Content Management Scheme Updates with Maker-Checker Flows
* **User Story:**  
  As a **Ministry Database Moderator (Admin)**,  
  I want to **enforce a strict Maker-Checker approval process before publishing any scheme updates or updating Qdrant vector embeddings**,  
  so that **we eliminate any risk of publicizing inaccurate, outdated, or unverified welfare guidelines**.

* **Acceptance Criteria (Gherkin Syntax):**

  ```gherkin
  Scenario: Maker creating a scheme update that is held for Checker verification
    Given the moderator "Amit" is logged in with the role "MAKER"
    And he navigates to the Scheme CMS panel
    When he updates the application deadline for "PM-KISAN" and sets the direct benefit transfer amount to "₹8,000"
    And he clicks "Submit for Review"
    Then the database sets the record's "isActive" status to false
    And the database records the state as "PENDING_CHECKER_APPROVAL"
    And the live website and search models do not show the updated values to general users

  Scenario: Checker approving the draft, triggering a vector DB rebuild
    Given a scheme update is registered in the database with status "PENDING_CHECKER_APPROVAL"
    And the administrator "Suresh" is logged in with the role "ADMIN" (Checker)
    When "Suresh" opens the CMS approval queue and clicks "Approve Scheme Update"
    Then the database updates the scheme's status to "ACTIVE" and "isActive" to true
    And the system triggers an asynchronous Celery worker to calculate fresh text embeddings
    And the worker updates the Qdrant vector database partition with the new PM-KISAN schema details
    And any new conversational user searches return the updated PM-KISAN eligibility criteria instantly
  ```

#### US-3.2: Automated 8-Digit Aadhaar Masking on Document Upload
* **User Story:**  
  As a **Compliance Officer (David)**,  
  I want **the platform to intercept and mask the first 8 digits of Aadhaar cards automatically on upload**,  
  so that **we comply with UIDAI security regulations and prevent storage of raw biometric credentials**.

* **Acceptance Criteria (Gherkin Syntax):**

  ```gherkin
  Scenario: Intercepting and masking an uploaded Aadhaar card PDF
    Given a user "Aarav" is in the document submission section of his dashboard
    When he uploads a PDF named "my_aadhaar_card.pdf" containing his clear Aadhaar card details
    Then the Verification and OCR Agent intercepts the file in memory prior to storage
    And the OCR engine scans the document for any 12-digit numeric sequences matching Aadhaar patterns
    And the system applies a visual solid black mask overlay covering the first 8 digits of the detected Aadhaar number
    And the system writes the masked document to secure AWS S3 storage
    And the system logs the transaction in the compliance log: "Aadhaar Masking Successful for User usr_902e"
    And the raw, unmasked PDF is completely purged from server RAM memory
  ```

---

### Epic 4: Commercial, Referral & Consultancy Hub (P2)

#### US-4.1: Professional Escrow Booking & Encrypted WebRTC Consultations
* **User Story:**  
  As a **Micro-Entrepreneur (Priya Sharma)**,  
  I want to **book a live consultation slot with a verified Chartered Accountant and pay securely into an escrow account**,  
  so that **I can get professional compliance guidance over a secured WebRTC video room without paying unverified consultants upfront**.

* **Acceptance Criteria (Gherkin Syntax):**

  ```gherkin
  Scenario: Successfully booking a verified consultant with escrow payment
    Given the user "Priya" is in the "Consultancy Booking" panel
    And she filters experts for "GST Compliance Specialist"
    And she selects expert "CA Vikram Mehta" showing a 4.9 rating
    When she selects an available slot "Friday, 10:00 AM" and clicks "Book Session"
    Then the system requests a Razorpay secure transaction token for the fee of ₹1,500
    When she completes the payment via UPI
    Then Razorpay returns a successful signature verification token
    And the system registers the transaction in the database with status "ESCROW_HELD"
    And the system blocks the expert's calendar slot in the "ConsultancyBooking" table
    And the system sends both parties a secure dashboard notification with a unique WebRTC video room link

  Scenario: Releasing Escrow funds following session completion
    Given Priya and CA Vikram have completed their scheduled video consultation
    When Priya clicks "Mark Session as Completed" in her dashboard
    Then the system updates the payment status to "FUNDS_RELEASED"
    And the platform transfers the fee of ₹1,500 (minus platform commission) to CA Vikram Mehta's verified bank account
  ```

#### US-4.2: Privacy-Compliant Multilingual Consent Gate
* **User Story:**  
  As a **Privacy-Conscious Citizen (David)**,  
  I want **to see a clear, multilingual consent manager detailing my DPDP rights before the platform processes any of my information**,  
  so that **I have complete transparency over how my data is stored and utilized**.

* **Acceptance Criteria (Gherkin Syntax):**

  ```gherkin
  Scenario: Displaying and accepting the DPDP consent notice on first-time login
    Given the user "Ramesh" is opening the platform for the first time
    And his language is set to "Hindi"
    When the landing page finishes loading
    Then the screen displays a mandatory consent modal translated into Hindi
    And the modal details exactly what data is collected, why it is needed, and references his DPDP Act 2023 rights
    And the main interface behind the modal is completely disabled
    When "Ramesh" clicks the Hindi button "मुझे मंजूर है" (I Agree)
    Then the system writes a consent log entry in the secure "User" table with the active timestamp
    And the consent modal collapses, allowing Ramesh to access the conversational chat workspace
  ```

---
*End of User Stories and Acceptance Criteria Specification.*
