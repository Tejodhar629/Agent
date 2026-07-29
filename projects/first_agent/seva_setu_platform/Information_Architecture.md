# Information Architecture (IA): Seva Setu Platform

This Information Architecture outlines the structure, navigation, and content hierarchy of the Seva Setu platform. It is designed to be mobile-first, highly accessible (WCAG 2.2 AA), and intuitive across all user personas—from rural beneficiaries to verified consultants.

---

## 1. Global Elements (Persistent Navigation)
**Header (Top Navigation)**
*   Logo (Links to Home/Dashboard based on auth state)
*   Global Language Toggle (English, Hindi, Marathi, Gujarati, etc. - Visual Icon + Text)
*   Voice-Search Quick Access (Microphone Icon)
*   Login / Profile Dropdown (Hamburger menu on mobile)

**Footer**
*   About Seva Setu
*   Privacy Policy & DPDP Act Compliance
*   Terms of Service
*   Help Center & FAQ
*   Contact & Support

---

## 2. Public Facing Website (Unauthenticated)
**1.0 Home Page**
*   1.1 Hero Section: "How can we help you today?" (Prominent Chat/Voice Input Bar)
*   1.2 Visual Persona Pathways ("I am a: Farmer | Small Business | Student | Worker")
*   1.3 Top 10 Popular Schemes Carousel (PM-KISAN, Ayushman Bharat, e-Shram, etc.)
*   1.4 Benefits/Features Overview

**2.0 Scheme & Service Directory (SEO / Browse)**
*   2.1 Categorized Grid (Agriculture, Health, Business, Education, Identity)
*   2.2 Scheme Detail Pages (Overview, Eligibility, Documents Needed - mostly readable static versions of RAG data)

**3.0 Consultant Hub (Marketing B2B)**
*   3.1 Benefits of joining as a Verified Consultant
*   3.2 Pricing & Features
*   3.3 "Apply to be a Consultant" CTA

---

## 3. Authentication & Onboarding
**4.0 Auth Flow**
*   4.1 Mobile Number + OTP Login / Signup (Frictionless entry)
*   4.2 OAuth (Google) 
*   4.3 Role Selection (Citizen/Business vs. Consultant)

**5.0 Visual Profiling (Onboarding for Citizens)**
*   5.1 Step 1: Basic Demographics (Age, Gender - large icons)
*   5.2 Step 2: Location & Occupation (Rural/Urban, State, Job type)
*   5.3 Step 3: Income Bracket (Visual ranges)
*   5.4 Success Screen: "Your Profile is Ready" -> Transition to Dashboard

---

## 4. Core Application (Citizen / Entrepreneur View)
**6.0 Citizen Dashboard (The Hub)**
*   6.1 Proactive Recommendations ("Schemes you qualify for")
*   6.2 Application Tracker (Kanban style: Drafts / In Progress / Completed)
*   6.3 Upcoming Deadlines Widget (Calendar/List view for Tax/Compliance)
*   6.4 Recent AI Chats History

**7.0 Seva Chat (The Core AI Assistant Interface)**
*   7.1 Active Chat Interface (Text input, Voice record button, TTS playback)
*   7.2 Contextual Tooltips (Explainers for complex terms)
*   7.3 Actionable Outputs (Save Checklist, Add to Tracker, Export to PDF)
*   7.4 Source Citations Widget (Links to official .gov.in URLs)

**8.0 My Profile & Settings**
*   8.1 Edit Demographic Data (Updates trigger new RAG recommendations)
*   8.2 Notification Preferences (SMS, WhatsApp, Email)
*   8.3 Language Preferences

---

## 5. Consultant Portal (B2B / Verified Service Provider View)
**9.0 Consultant Dashboard**
*   9.1 KPI Overview (Total Clients, Active Applications, Expiring Deadlines)
*   9.2 Quick Actions (Add New Client, Start Policy Query)

**10.0 Client CRM (My Clients)**
*   10.1 Client List View (Search, Filter by Scheme/Status)
*   10.2 Individual Client Profile (Sub-profile containing demographic data)
*   10.3 Client's Application Tracker
*   10.4 Client's Generated Checklists & Chat History

**11.0 Consultant AI Knowledge Base**
*   11.1 Professional Chat Interface (Tuned for policy deep-dives & latest updates)
*   11.2 White-label Report Generator (Export summaries for clients)

**12.0 Consultant Settings**
*   12.1 Business Profile Verification Details
*   12.2 Subscription/Billing

---

## 6. Admin CMS & Control Panel (Internal Super Admins)
**13.0 Admin Dashboard**
*   13.1 Platform Analytics (User growth, queries handled, popular schemes)

**14.0 Knowledge Base & RAG Management**
*   14.1 Data Sources Manager (Upload new scheme PDFs, link new .gov.in endpoints)
*   14.2 Sync/Index Trigger (Pushing updates to Qdrant/Pinecone)
*   14.3 Hallucination/Feedback Review (Reviewing flagged AI responses)

**15.0 User Management**
*   15.1 Citizen User Directory (Anonymized/Metadata views)
*   15.2 Consultant Approvals (Reviewing verification documents)

**16.0 CMS Module**
*   16.1 System Announcements / Banner Alerts
*   16.2 Static Content Manager (Terms, Privacy, SEO Pages)
