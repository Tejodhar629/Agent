# Database Schema (ERD): Seva Setu Platform

This document details the Information Architecture and Database Schema for the Seva Setu platform. It is designed to strictly fulfill the **Functional Requirements** (Role-Based Access Control, AI Chat context tracking, Consultant CRM, Action Plan Checklists) and **Non-Functional Requirements** (PostgreSQL + Prisma, high scalability).

## 1. Schema Overview & Strategy

The database uses a robust relational model designed for **PostgreSQL** and managed via **Prisma ORM**. 
*(Note: Unstructured embeddings for the RAG document pipeline will live in a specialized Vector Database such as Qdrant or Pinecone. This relational schema interacts with it via scheme metadata and chat citations).*

Core domains include:
*   **Identity & Profiling:** Handles Auth (OTP/OAuth), Citizens, Verified Consultants, CMS Editors, and B2B Client Sub-profiles.
*   **AI Context & History:** Stores multi-turn chat sessions, voice note references, and explicit source citations.
*   **Action Plans & Checklists:** Manages saved scheme applications, Kanban statuses, and granular document checklists.
*   **Consultation Booking:** Manages appointments, payment statuses, and tracking between citizens and consultants.

---

## 2. Prisma Schema (`schema.prisma`)

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ---------------------------------------------------------
// ENUMS
// ---------------------------------------------------------

enum Role {
  CITIZEN
  CONSULTANT
  EDITOR
  ADMIN
}

enum ApplicationStatus {
  TODO
  GATHERING_DOCUMENTS
  APPLIED
  APPROVED
  REJECTED
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}

// ---------------------------------------------------------
// AUTHENTICATION & USERS
// ---------------------------------------------------------

model User {
  id                 String   @id @default(uuid())
  phoneNumber        String?  @unique // Used for OTP Login
  email              String?  @unique // Used for Google OAuth
  name               String?
  role               Role     @default(CITIZEN)
  languagePreference String   @default("hi") // Localization (Hindi, English, etc.)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // Relationships
  citizenProfile       CitizenProfile?
  consultantProfile    ConsultantProfile?
  consultantClients    ClientProfile[]    @relation("ConsultantClients")
  
  chatSessions         ChatSession[]
  savedApplications    SavedApplication[]
  sentBookings         Booking[]          @relation("CitizenBookings")
  receivedBookings     Booking[]          @relation("ConsultantBookings")
  payments             Payment[]
  notifications        Notification[]
  blogPosts            BlogPost[]
}

// ---------------------------------------------------------
// PROFILING MODULE
// ---------------------------------------------------------

model CitizenProfile {
  id               String   @id @default(uuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Dynamic Profiling Fields for AI Eligibility Engine
  age              Int?
  gender           String?
  state            String?
  district         String?
  income           Float?
  caste            String?
  maritalStatus    String?
  occupation       String?
  disabilityStatus Boolean?
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model ConsultantProfile {
  id                 String   @id @default(uuid())
  userId             String   @unique
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  agencyName         String?
  verificationStatus Boolean  @default(false)
  specializations    String[] // e.g., ["Tax", "Legal", "Agriculture"]
  rating             Float    @default(0.0)
  
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model ClientProfile {
  // B2B CRM Sub-profiles (Created by Consultants for offline clients)
  id                String   @id @default(uuid())
  consultantId      String
  consultant        User     @relation("ConsultantClients", fields: [consultantId], references: [id], onDelete: Cascade)
  
  name              String
  phoneNumber       String?
  age               Int?
  gender            String?
  state             String?
  income            Float?
  caste             String?
  occupation        String?
  
  savedApplications SavedApplication[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// ---------------------------------------------------------
// SCHEMES, DASHBOARD & ACTION PLANS
// ---------------------------------------------------------

model Scheme {
  id               String    @id @default(uuid())
  title            String
  description      String
  category         String
  state            String?   // Null implies Central/National scheme
  officialLink     String?
  deadline         DateTime? // Drives dashboard calendar widgets
  
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  savedApplications SavedApplication[]
}

model SavedApplication {
  id              String            @id @default(uuid())
  
  // Belongs to either a direct Citizen OR a Consultant's Sub-Client
  userId          String?           
  user            User?             @relation(fields: [userId], references: [id], onDelete: Cascade)
  clientProfileId String?           
  clientProfile   ClientProfile?    @relation(fields: [clientProfileId], references: [id], onDelete: Cascade)
  
  schemeId        String
  scheme          Scheme            @relation(fields: [schemeId], references: [id], onDelete: Cascade)
  
  status          ApplicationStatus @default(TODO) // Drives Kanban board
  actionPlanJson  Json?             // Stores the cached AI-generated Action Plan
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  checklistItems  ChecklistItem[]
}

model ChecklistItem {
  id                 String           @id @default(uuid())
  savedApplicationId String
  savedApplication   SavedApplication @relation(fields: [savedApplicationId], references: [id], onDelete: Cascade)
  
  itemName           String
  isCompleted        Boolean          @default(false)
  
  createdAt          DateTime         @default(now())
  updatedAt          DateTime         @updatedAt
}

// ---------------------------------------------------------
// AI CHAT & RAG TRACKING
// ---------------------------------------------------------

model ChatSession {
  id           String        @id @default(uuid())
  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title        String?
  contextId    String?       // Optional: Allows a consultant to link a chat to a specific ClientProfile ID
  
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  messages     ChatMessage[]
}

model ChatMessage {
  id            String      @id @default(uuid())
  chatSessionId String
  chatSession   ChatSession @relation(fields: [chatSessionId], references: [id], onDelete: Cascade)
  
  role          String      // USER, AI, SYSTEM
  content       String      @db.Text
  audioUrl      String?     // S3 link for Voice-to-Text / Text-to-Voice 
  citedSources  Json?       // Array of .gov.in URLs to prevent hallucination
  
  createdAt     DateTime    @default(now())
}

// ---------------------------------------------------------
// BOOKINGS & NOTIFICATIONS
// ---------------------------------------------------------

model Booking {
  id           String        @id @default(uuid())
  citizenId    String
  citizen      User          @relation("CitizenBookings", fields: [citizenId], references: [id])
  consultantId String
  consultant   User          @relation("ConsultantBookings", fields: [consultantId], references: [id])
  
  status       BookingStatus @default(PENDING)
  scheduledAt  DateTime
  meetingLink  String?       // Video link or map coordinates
  
  paymentId    String?       @unique
  payment      Payment?      @relation(fields: [paymentId], references: [id])
  
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Payment {
  id                    String        @id @default(uuid())
  userId                String
  user                  User          @relation(fields: [userId], references: [id])
  
  amount                Float
  currency              String        @default("INR")
  status                PaymentStatus @default(PENDING)
  gatewayTransactionId  String?       @unique // Razorpay Order/Txn ID
  
  booking               Booking?
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type      String   // DEADLINE, SCHEME_UPDATE, BOOKING_REMINDER
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model BlogPost {
  // For the SEO Blog / Knowledge Base CMS
  id          String   @id @default(uuid())
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  
  title       String
  slug        String   @unique
  content     String   @db.Text
  isPublished Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 3. Key Architectural Design Decisions

### A. Role-Specific Profile Splitting
The core `User` model manages global authentication constraints (OTP vs OAuth) while delegating persona-specific metadata to `CitizenProfile` and `ConsultantProfile`. This normalizes shared table columns while enforcing clean boundaries for role-based access control (e.g., verifying a consultant agency vs. matching a citizen's caste/income to scheme parameters).

### B. Consultant CRM (B2B Multi-tenancy)
To satisfy the requirements of **Epic 4 (Consultant CRM)**, the `ClientProfile` model is introduced. Consultants can create sub-profiles for citizens who walk into their physical centers. By utilizing a polymorphic-like schema design in `SavedApplication`, a single scheme application logic applies to both *direct citizens* (`userId`) and *consultant-managed citizens* (`clientProfileId`).

### C. Conversational Integrity & Voice-First UX
For **Epic 1 (Multilingual & Voice-First)** and strict anti-hallucination policies, `ChatMessage` enforces detailed accountability:
*   **`audioUrl`:** Connects user audio uploads (stored in S3) and generated TTS responses directly to chat history.
*   **`citedSources`:** An enforced JSON array storing `.gov.in` links that the AI used via the RAG pipeline to generate its answer, ensuring users always see verifiable government proof.

### D. Actionable Checklists (Kanban Ready)
For **Epic 3 (Dashboards)**, `SavedApplication` acts as the master tracker. It utilizes an `ApplicationStatus` enum to directly map to the frontend Kanban board components. Additionally, rather than dumping document requirements into text, the `ChecklistItem` model enables a granular, 1-to-many relationship—allowing users to definitively check off boxes across multiple sessions without losing state.
