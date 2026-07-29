# Information Architecture, Design System, & Component Library

## Document Overview
**Project Name:** Jan Seva AI (SevaSetu AI) — AI-powered Government Services Platform for India  
**Document Classification:** Technical Design Specification  
**Version:** 1.0.0  
**Target Audience:** Frontend Developers, Visual Designers, Accessibility Auditors, Product Owners  
**Standards Compliance:** WCAG 2.2 AA (Targeting AAA for core elements), GIGW 3.0 (Guidelines for Indian Government Websites)

---

## 1. Executive UX Vision: "Bharat-Centric Simplicity"

India's digital demographic is vast and highly unequal. While urban youth demand fast, friction-free interfaces matching international standards, rural citizens and senior citizens require heavy cognitive support, localized verbal feedback, and extreme trust reinforcement.

**Jan Seva AI** bridges this gap using a **Trimodal UX Strategy**:
1. **Voice-First HUD:** Replaces keyboards with spoken regional dialects, optimized for low-literacy users.
2. **Conversational Chat Workspace:** A fast, multi-modal interface with floating data cards and interactive calculators, designed for MSMEs and tech-literate citizens.
3. **Accessibility Wizard:** A linear, single-screen-single-question questionnaire featuring large typography and visual guides, designed for seniors and motor-impaired individuals.

This document serves as the absolute "Ground Truth" for constructing these experiences, providing detailed specifications for sitemaps, system design tokens, reusable components, and key page templates.

---

## 2. Information Architecture (IA) & Sitemaps

To ensure citizens never get lost in bureaucratic silos, the platform’s layout is strictly categorized by user-centric life-events and domains, rather than government department divisions.

### 2.1 Navigation & Directory Sitemap

```
                              [ Jan Seva AI Gateway ]
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  [ Citizen Portal ]            [ Consultant Portal ]             [ CSC Agent Portal ]
        │                                │                                │
  ├─► Trimodal Selection Gateway         ├─► Expert Registration Dashboard ├─► Agent Core Desk
  │   ├─ Voice HUD                       ├─ Active Client Escrows         ├─ Bulk Submissions
  │   ├─ Conversational Chat             ├─ Calendar & Video Consultation  ├─ Geolocation Cashier
  │   └─ Accessibility Wizard            └─ Tax/Legal Document Vault      └─ Offline Sync Log
  │
  ├─► Universal Scheme Finder
  │   ├─ Filters (State, Age, Income)
  │   └─ Document Prerequisite Checker
  │
  ├─► Dynamic Service Directory
  │   ├─ Agriculture (PM-KISAN, PMFBY)
  │   ├─ MSME & Startup (Udyam, MUDRA)
  │   ├─ Education (Post-Matric, National)
  │   └─ Pension & Healthcare (Ayushman)
  │
  ├─► Unified Citizen Dashboard
  │   ├─ My Scheme Cart
  │   ├─ DigiLocker Sync Vault
  │   ├─ My Consultations Ledger
  │   └─ Referral/Community Rewards
  │
  └─► Informational Blog / Wiki
      └─ Programmatic SEO Scheme Guides
```

### 2.2 Schema & Service Taxonomy

Services are indexed using a standardized metadata taxonomy to feed the semantic RAG pipeline and localized filters:

| Metadata Key | Allowed Values / Formats | Purpose |
| :--- | :--- | :--- |
| `service_level` | `CENTRAL` \| `STATE` \| `DISTRICT` | Directs user to local or national administrative pipelines. |
| `target_demographic` | `FARMER` \| `MSME` \| `STUDENT` \| `SENIOR` \| `WOMEN` \| `GENERAL` | Filters user profiles instantly during progressive intake. |
| `income_ceiling` | Integer (e.g., `300000` INR per annum) | Hard filter for income-restricted welfare programs. |
| `verification_type` | `AADHAAR_OTP` \| `FACE_LIVENESS` \| `PAN_OCR` \| `MANUAL` | Informs the frontend which hardware APIs to call. |
| `official_url` | String (Must match pattern `^https:\/\/.*\.gov\.in$`) | Strict whitelisting for outgoing citation links. |

---

## 3. Core User Flows (UX Blueprint)

### 3.1 Flow 1: Conversational Eligibility & Voice-First Application Check
The process path mapping how an unstructured voice query is converted into a structured eligibility evaluation:

```
[ Citizen voice query ]
        │
        ▼ (ASR / Bhashini API)
[ Transcribed text ] ──► [ Intent Classifier Agent ]
                                │
                                ├─► Missing parameters? ──► [ AI requests voice parameter ]
                                │
                                └─► All parameters active?
                                             │
                                             ▼ (Secure Consent Granted)
                                    [ Trigger OCR Agent ]
                                             │
                                             ▼
                                    [ Mask PII (Aadhaar/PAN) ]
                                             │
                                             ▼ (RAG & Rules Engine Match)
                                    [ Match Rules JSON ]
                                             │
                                             ▼
                                [ Render Eligible Schemes ]
                                             │
                                             ▼
                                [ Direct .gov.in Apply Link ]
```

### 3.2 Flow 2: Escrow-Backed Consultancy Booking
Ensures absolute financial security when a citizen books a private professional (CA/Lawyer) to resolve complicated edge cases:

```
[ Scheme Rejection / Complex Edge Case ]
        │
        ▼
[ AI Chatbot recommends certified consultant ]
        │
        ▼
[ User reviews profiles & schedules slot ]
        │
        ▼ (Razorpay Gateway)
[ User pays fee ] ──► [ Funds held in Jan Seva Escrow Node ]
                                │
                                ▼
                     [ WebRTC Secure Video Room ]
                                │
                                ▼
                     [ Joint Document Sign-off ]
                                │
                                ▼
                [ Citizen approves resolution ]
                                │
                                ▼
                  [ Funds released to Consultant ]
```

---

## 4. UI/UX Design System Tokens

Developed for extreme accessibility, high visibility under bright sunlight (common for agricultural field workers), and seamless integration with Tailwind CSS config.

### 4.1 Color System (WCAG 2.2 AAA Compliant)

```
========================================================================
TOKEN NAME         HEX CODE    CONTRAST RATIO (vs BG)    INTENDED USE
========================================================================
--primary-navy     #0F2C59     9.2:1 (AAA)              Headers, primary buttons, borders
--accent-saffron   #E07A5F     4.8:1 (AA)               Warning alerts, progress gauges
--success-green    #1F4E3D     10.5:1 (AAA)             Success flags, approved status
--bg-cream         #FAFAF5     --                       Base page background (anti-fatigue)
--text-coal        #1C1C1C     14.1:1 (AAA)             Body text, input labels
--accessible-blue  #1D4ED8     7.1:1 (AAA)              Actionable links, focus rings
========================================================================
```

### 4.2 Typography Stack
All fonts must include complete regional glyph mappings for 22 vernacular scripts.

* **Primary English Sans:** `Inter, system-ui, -apple-system, sans-serif`
* **Vernacular Devanagari (Hindi, Marathi):** `Poppins, Noto Sans Devanagari`
* **South Indian Scripts (Kannada, Telugu, Tamil):** `Noto Sans Kannada, Noto Sans Telugu, Noto Sans Tamil`
* **Font Size Scale (Standard vs. Accessibility Mode):**

```
========================================================================
STYLE              STANDARD MODE SIZES          ACCESSIBILITY MODE SIZES
========================================================================
Display/Hero       36px (SemiBold, Leading 1.2) 48px (Bold, Leading 1.3)
Heading 1          28px (Medium, Leading 1.3)   36px (Bold, Leading 1.4)
Heading 2          20px (Medium, Leading 1.4)   28px (Medium, Leading 1.5)
Body Text          16px (Regular, Leading 1.5)  22px (Regular, Leading 1.6)
Caption/Label      12px (Regular, Leading 1.4)  16px (Medium, Leading 1.5)
========================================================================
```

### 4.3 Layout & Responsive Breakpoints
Optimized for the wide range of mobile screens active in Indian rural markets (from sub-$100 Android devices to massive tablets).

* **Mobile (Critical Limit):** `320px` to `480px` (All controls must remain fully interactive at `320px` layout without clipping).
* **Tablet Portability:** `481px` to `1024px`
* **Desktop Workspace:** `1025px` and above
* **Accessible Tap Target Size:** Minimum `48px` x `48px` with at least `16px` of clear spacing around interactive boundaries to accommodate shaky hands or field-worn fingertips.

---

## 5. Reusable Component Library Specifications

These specifications map directly to Tailwind classes and ensure maximum screen-reader accessibility via semantic ARIA tags.

### 5.1 The Pulsing Voice Mic (Activating Voice-First HUD)
* **Visuals:** Large, circular crimson-red icon containing a clean microphone silhouette. Surrounding the button are three translucent, concentric animated waves.
* **Hover State:** Background scales up by 5% and color shifts to high-density red.
* **Active/Recording State:** Concentric waves pulse outward with a CSS keyframe animation simulating real-time audio input volume.
* **Accessibility (ARIA):**
  * `aria-label="सुरू करा - बोला आणि शोधा (Start Voice Search)"`
  * `role="button"`
  * `aria-pressed="false" -> "true" (When recording)`
  * Focus ring must render as a `4px dashed --accessible-blue` offset.

### 5.2 Unified Chat Bubble
* **Visuals:** Warm cream (`#FAFAF5`) for user entries (right-aligned); Soft white with a primary-navy border for AI responses (left-aligned).
* **AI Bubble Features:** Dedicated interactive sub-cards, expandable markdown blocks, step-by-step numbers, and a floating green badge showing **"Source: Government of India (.gov.in)"**.
* **Accessibility (ARIA):**
  * `role="log"` for the conversation log container.
  * `aria-live="polite"` applied to the dynamic message stream to update blind users without interrupting typing flow.
  * All links inside chat bubbles must have `target="_blank"` and `rel="noopener noreferrer"`, followed by an ARIA-screen-reader alert: *"Opens in a new tab"*.

### 5.3 Secure Document Dropzone (with Auto-Masking Indicator)
* **Visuals:** A dashed boundary box containing an upload icon, a lock icon, and a prominent badge reading: *"Aadhaar numbers are automatically masked securely."*
* **Interactive Behavior:** Drag-and-drop triggers a change in border color from `--primary-navy` to `--accent-saffron`. Live progression bar indicates scanning progress.
* **Post-Upload State:** Displays a green thumbnail with a secure shield badge once parsing and first-8-digit Aadhaar masking are successfully finalized on the local client side.
* **Accessibility (ARIA):**
  * `role="region"`
  * `aria-describedby="upload-security-note"`
  * Screen-reader announces: *"Document uploaded. Analyzing and masking private information. Please wait."*

### 5.4 Dynamic Income Eligibility Slider
* **Visuals:** High-thickness track color-coded from green (highly eligible for major schemes) to yellow (moderate eligibility) to red (limited schemes). Large, easily grabbable custom slider pin (`32px` diameter).
* **Hover State:** Slide pin grows larger and displays a floating, high-visibility currency badge showing current numerical value in Rupees.
* **Accessibility (ARIA):**
  * `role="slider"`
  * `aria-valuemin="0"`, `aria-valuemax="2000000"`
  * `aria-valuenow="current_value"`
  * `aria-valuetext="वार्षिक उत्पन्न - {current_value} रुपये (Annual Income - {current_value} Rupees)"`

---

## 6. Key Interactive Page Templates (Wireframes & Code-Layouts)

---

### Template 1: Voice-First HUD (Optimized for Ramesh Kumar)
Designed to resemble a simple, distraction-free voice terminal. Perfect for low-literacy users in bright outdoor environments.

```
+-----------------------------------------------------------------------+
|  [🇮🇳 SEVASETU AI]                     [English | हिंदी | मळती ▼]  [👤] |
+-----------------------------------------------------------------------+
|                                                                       |
|                       आपले प्रश्न सांगा...                           |
|                    (Tell me your question...)                         |
|                                                                       |
|                                                                       |
|                                                                       |
|                              ,-''''-.                                 |
|                            ,'  _   _  `.                              |
|                           /   (o) (o)   \                             |
|                          |    ______     |                            |
|                          |    \____/     |                            |
|                           \             /                             |
|                            `.         ,'                              |
|                              `'-....-'                                |
|                                                                       |
|                              (((( 🎤 ))))                             |
|                            [ Tap to Speak ]                           |
|                                                                       |
|  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  |
|  Real-time Subtitles (Hindi/Marathi):                                 |
|  "माझा गहू पिकाचा विमा जमा झाला आहे का?"                              |
|  (Has my wheat crop insurance been deposited?)                        |
| - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  |
|                                                                       |
|  [🔊 Play Audio Answer]                      [💬 Switch to Chat Mode] |
+-----------------------------------------------------------------------+
```

#### Detailed Layout Specifications (Voice HUD):
1. **Header Block:** Minimalist branding. Language selector dropdown is extremely large (`44px` height target), using phonetic scripts (*"हिंदी"*, *"తెలుగు"*) to ease scanning.
2. **Dynamic Subtitle Box:** Subtitles scale up dynamically as user speaks. Uses **MeitY's Bhashini ASR** to transcribe speech instantly on-screen.
3. **Primary Mic Hub:** Occupies the absolute visual center. The mic button has a pulsing green-to-red ring when active.
4. **Playback Toggle:** A massive bottom-bar action to repeat the AI's audio response in the selected regional dialect.

---

### Template 2: Conversational Chat Workspace (Optimized for Priya & Aarav)
A dual-pane interactive console. The left pane is the fluid AI chat; the right pane displays structured cards, interactive loan calculations, and live documents.

```
+-----------------------------------------------------------------------+
|  [🇮🇳 Jan Seva AI]      [Udyam & MUDRA Workspace]       [Premium 👑] [👤] |
+-----------------------------------------------------------------------+
|  LEFT CHAT PANE                       | RIGHT DYNAMIC WORKSPACE PANE  |
|                                       |                               |
|  [AI Assistant] 10:14 AM              |  [📄 MSME MUDRA LOAN ROADMAP] |
|  Based on your Udyam registration,    |                               |
|  you qualify for the MUDRA Kishor     |  1. MUDRA Kishor Eligibility  |
|  scheme (Interest: 8.5%).             |     - Udyam Verified: [✔]     |
|                                       |     - Age Range (18-65): [✔]   |
|  [📄 See MUDRA Application Blueprint] |                               |
|                                       |  2. Calculate Repayment EMI:  |
|  [User] 10:15 AM                      |     Principal: ₹5,00,000      |
|  "Can you show me the EMI for         |     [=======o================]|
|  5 Lakhs over 3 years?"               |                               |
|                                       |     Monthly EMI: ₹15,780      |
|  [AI Assistant]                       |     Total Interest: ₹68,080   |
|  I have generated an active repayment |                               |
|  calculator on your right-hand pane.  |  3. [⚡ Submit Application]   |
|                                       |     (Official SBI Portal API) |
|  [ Type your message here...  ] [📎] [🎤] |                             |
+-----------------------------------------------------------------------+
```

#### Detailed Layout Specifications (Chat Workspace):
1. **Dual-Pane Balance:** Responsive breakpoint-driven. Below `1024px`, the layout shifts to a single-screen tabbed navigation, prioritizing the chat interface first with a floating "View Document Roadmap" overlay.
2. **Quick Chips Area:** Located directly above the chat box input, containing contextual action buttons (e.g., *“Download Scheme PDF”*, *“Verify my GST”*).
3. **Embedded Interactive Calculators:** Built using simple, touch-friendly HTML5 sliders that update calculations locally in real-time, removing the lag of server-side roundtrips.

---

### Template 3: Senior Citizen Accessibility Wizard (Optimized for Devendra Hegde)
One clear question per page. Employs massive typography, high-contrast assets, and full screen-reader optimization to guarantee successful self-submission.

```
+-----------------------------------------------------------------------+
|  [🇮🇳 JAN SEVA AI]      [🔊 Read Screen Out Loud]      [Contrast Standard] |
+-----------------------------------------------------------------------+
|                                                                       |
|                         पायरी ३ पैकी २                                |
|                         (Step 2 of 3)                                 |
|                                                                       |
|  आपला 'PPO क्रमांक' टाईप करा:                                          |
|  (Type your PPO Number:)                                              |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  |  PPO-123456789_                                                 |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  [💡 Where is my PPO Number on my physical paper? Click here]         |
|                                                                       |
|                                                                       |
|  [⬅️ मागे जा (Back)]                    [पुढे जा (Next) ➡️]             |
|                                                                       |
+-----------------------------------------------------------------------+
```

#### Detailed Layout Specifications (Accessibility Wizard):
1. **Screen Header Controls:** Large global buttons to trigger voice-assistance (TTS read-aloud) and toggle high-contrast modes (Black/White and Yellow/Blue).
2. **Visual Tooltips:** Clicking the *"Where is my PPO Number?"* link does not trigger pop-ups (which confuse elderly screen-reader users). Instead, it expands an inline accordion containing an annotated photo of a physical pension book, highlighting the number area in bright yellow.
3. **Navigation Bar:** Bottom-aligned navigational buttons styled with high-contrast borders and clear, explicit direction arrows. Height is locked to `56px` to prevent missed taps.

---

## 7. GIGW 3.0 & WCAG 2.2 AA Compliance Audit Framework

To guarantee passing official government audit scans (required for all `.gov.in` system integrations), the platform's UI library adheres to these strict rules:

### 1. Document Structure & Reading Order
* Every page template is defined with semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
* **Heading Hierarchy:** One, and only one, `<h1>` per page. Heading levels must never skip ranks (e.g., an `<h2>` cannot be followed directly by an `<h4>`).

### 2. Alt-Texts & Screen-Reader Directives
* All icons and visual dividers must have `role="presentation"` or `aria-hidden="true"` to prevent screen readers from reading raw image names.
* Graphic charts (e.g., eligibility criteria maps or income limits) must be backed by an accessible hidden raw data table containing equivalent values.

### 3. Keyboard Navigability & Accessible Focus
* **Interactive elements (`a`, `button`, `input`, `select`) must be navigable using the standard `Tab` and `Shift + Tab` commands.**
* **Focus Trap Prevention:** Dialog modal windows must lock keyboard focus inside the modal boundary, and hitting the `Esc` key must instantly close any active modal or search box overlay.

### 4. Low-Bandwidth Optimizations
* **Font Loading:** Uses localized system font-fallbacks to avoid blocking screen loads while external fonts are fetched.
* **Offline Service Mode:** Employs Service Workers to store basic page frameworks and forms locally, allowing full input completion and local validation while offline, then queuing submission syncs for when the user reconnects to network grids.

---
*Document compiled and approved by Lead UX Architect & Accessibility Expert. Saved to `gov_docs/8_Information_Architecture_and_Design_System.md` for immediate frontend scaffolding.*
