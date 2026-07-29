# API Specifications Document
## Project: Seva Setu - AI-Powered Government Services Platform

### 1. Introduction
This document outlines the Application Programming Interface (API) specifications for the Seva Setu platform. The architecture utilizes a **hybrid approach**:
*   **RESTful endpoints** for actions involving binary data, streams, authentication, and simple webhooks (e.g., OTP auth, file uploads, LLM streaming, payments).
*   **GraphQL** for complex, relational data querying (e.g., deeply nested user profiles, dashboards, schemes, consultant CRMs, and action plans) to prevent over-fetching and improve frontend performance.

---

### 2. Base URL & Authentication
- **Base URL (REST):** `https://api.sevasetu.in/v1`
- **Base URL (GraphQL):** `https://api.sevasetu.in/graphql`
- **Authentication:** All secured endpoints require a JWT Bearer token in the `Authorization` header.
  - `Authorization: Bearer <JWT_TOKEN>`

---

### 3. REST API Specifications

#### 3.1 Authentication & User Management (AUTH)
*   **POST `/auth/send-otp`**
    *   **Description:** Sends an OTP via SMS to the provided mobile number.
    *   **Request Body:** `{ "mobile": "+919876543210" }`
    *   **Response (200 OK):** `{ "success": true, "message": "OTP sent successfully", "referenceId": "abc-123" }`
*   **POST `/auth/verify-otp`**
    *   **Description:** Verifies the OTP and issues access and refresh tokens.
    *   **Request Body:** `{ "mobile": "+919876543210", "otp": "123456", "referenceId": "abc-123" }`
    *   **Response (200 OK):** `{ "accessToken": "eyJhb...", "refreshToken": "def...", "user": { "id": "uuid-1", "role": "CITIZEN" } }`
*   **POST `/auth/oauth/google`**
    *   **Description:** Handles Google OAuth login/registration.
    *   **Request Body:** `{ "idToken": "header.payload.signature" }`
    *   **Response (200 OK):** Returns standard token response.

#### 3.2 AI Conversational Interface (CHAT)
*   **POST `/chat/completions` (Server-Sent Events - SSE)**
    *   **Description:** Multi-turn chat interface integrated with the RAG pipeline. Streams text responses to reduce perceived latency.
    *   **Headers:** `Accept: text/event-stream`
    *   **Request Body:**
        ```json
        {
          "sessionId": "sess-456",
          "messages": [
            { "role": "user", "content": "I am a farmer from Maharashtra looking for tractor subsidies." }
          ],
          "language": "mr"
        }
        ```
    *   **Response (200 OK - Stream):**
        ```text
        data: {"chunk": "म"}
        data: {"chunk": "हा"}
        data: {"chunk": "रा"}
        ```
*   **POST `/chat/speech-to-text`**
    *   **Description:** Transcribes user voice audio to text (Whisper API integration).
    *   **Content-Type:** `multipart/form-data`
    *   **Payload:** `audio_file` (e.g., `.wav`, `.mp3`)
    *   **Response (200 OK):** `{ "text": "What are the schemes for women?", "detectedLanguage": "en" }`

#### 3.3 File Uploads & Document Management (DOC)
*   **POST `/documents/upload`**
    *   **Description:** Uploads circulars or user documents to cloud storage. Triggers vectorization if uploaded by an Admin.
    *   **Content-Type:** `multipart/form-data`
    *   **Payload:** `file`
    *   **Response (201 Created):** `{ "url": "https://s3.aws.com/bucket/doc.pdf", "id": "doc-789" }`

#### 3.4 Action Plan Export (ACT)
*   **GET `/action-plans/{planId}/export/pdf`**
    *   **Description:** Generates and returns a localized PDF report of an Action Plan.
    *   **Query Params:** `?lang=hi` (e.g., Hindi output)
    *   **Response (200 OK):** `Content-Type: application/pdf`

#### 3.5 Payments (CONS)
*   **POST `/payments/create-order`**
    *   **Description:** Creates a payment order for consultancy fees (Razorpay).
    *   **Request Body:** `{ "amount": 50000, "consultationId": "cons-123" }` *(amount in paise)*
    *   **Response (200 OK):** `{ "orderId": "order_xxx", "amount": 50000, "currency": "INR" }`
*   **POST `/payments/webhook`**
    *   **Description:** Webhook endpoint for Razorpay payment success/failure events.

---

### 4. GraphQL API Specifications

GraphQL manages structured queries for dashboards, CRM, and dynamic profile retrieval.

#### 4.1 Schema Definitions (Types)
```graphql
type User {
  id: ID!
  mobile: String
  email: String
  role: Role!
  profile: Profile
  savedSchemes: [SavedScheme!]
  consultations: [Consultation!]
}

enum Role {
  CITIZEN
  CONSULTANT
  EDITOR
  ADMIN
}

type Profile {
  age: Int
  gender: String
  state: String
  casteCategory: String
  annualIncome: Float
  occupation: String
  disabilityStatus: Boolean
}

type Scheme {
  id: ID!
  title: String!
  description: String
  ministry: String
  tags: [String!]
  officialLink: String
  eligibilityCriteria: String
  benefits: String
  documentsRequired: [String!]
}

type SavedScheme {
  id: ID!
  scheme: Scheme!
  status: ApplicationStatus!
  actionPlan: ActionPlan
  savedAt: String!
}

enum ApplicationStatus {
  TODO
  GATHERING_DOCUMENTS
  APPLIED
  APPROVED
  REJECTED
}

type ActionPlan {
  id: ID!
  steps: [String!]!
  checklist: [ChecklistItem!]!
  rejectionReasons: [String!]
}

type ChecklistItem {
  name: String!
  isCompleted: Boolean!
}

type Consultant {
  id: ID!
  user: User!
  specialties: [String!]!
  rating: Float
  hourlyRate: Float
  isVerified: Boolean!
}

type Consultation {
  id: ID!
  citizen: User!
  consultant: Consultant!
  scheduledAt: String!
  status: ConsultationStatus!
  meetingLink: String
}

enum ConsultationStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}
```

#### 4.2 Queries (Read Operations)
```graphql
type Query {
  # User Profile & Citizen Dashboard
  me: User!
  
  # Scheme Discovery Engine
  searchSchemes(query: String, state: String, tags: [String!]): [Scheme!]!
  getSchemeById(id: ID!): Scheme
  
  # Consultant CRM & Directory
  getConsultants(specialty: String, state: String): [Consultant!]!
  getConsultationDetails(id: ID!): Consultation
  
  # Super Admin Analytics
  getPlatformMetrics: PlatformMetrics!
}

type PlatformMetrics {
  dailyActiveUsers: Int!
  totalApplicationsTracked: Int!
  topSearchedSchemes: [Scheme!]!
}
```

#### 4.3 Mutations (Write Operations)
```graphql
type Mutation {
  # Profile Management
  updateProfile(input: ProfileInput!): User!
  
  # Dashboard / Action Plan Tracking
  saveScheme(schemeId: ID!): SavedScheme!
  updateApplicationStatus(savedSchemeId: ID!, status: ApplicationStatus!): SavedScheme!
  toggleChecklistItem(actionPlanId: ID!, itemName: String!, isCompleted: Boolean!): ActionPlan!
  
  # Consultations & Booking
  bookConsultation(consultantId: ID!, scheduledAt: String!): Consultation!
  cancelConsultation(consultationId: ID!): Consultation!
  
  # Admin Configuration
  updateScheme(id: ID!, input: SchemeInput!): Scheme!
}

input ProfileInput {
  age: Int
  gender: String
  state: String
  casteCategory: String
  annualIncome: Float
  occupation: String
  disabilityStatus: Boolean
}

input SchemeInput {
  title: String
  description: String
  ministry: String
  officialLink: String
  eligibilityCriteria: String
  benefits: String
  documentsRequired: [String!]
}
```

---

### 5. Error Handling
All API responses follow a standardized error structure.
*   **REST Standard Error Response:**
    ```json
    {
      "error": {
        "code": "UNAUTHORIZED",
        "message": "Invalid JWT Token. Please log in again."
      }
    }
    ```
*   **GraphQL Errors:** Errors are returned in the standard `errors` array alongside a `null` data field, utilizing Apollo Server error extensions for specific codes (e.g., `BAD_USER_INPUT`, `FORBIDDEN`).

---

### 6. Rate Limiting, Security & Adherence to NFRs
*   **Rate Limits:** High-cost endpoints like `POST /chat/completions` (LLM processing) and `POST /auth/send-otp` are rate-limited via Redis to 10 req/min per IP/User to prevent abuse.
*   **Security (DPDP Compliance):** 
    *   Personally Identifiable Information (PII) like mobile numbers and exact incomes are obfuscated in logs and transmitted over strictly forced `HTTPS (TLS 1.3)`. 
    *   Data is encrypted at rest using `AES-256`.
*   **Auth Lifecycle:** Short-lived access tokens (15-minute expiry) with Refresh tokens stored securely in `HttpOnly, Secure, SameSite=Strict` browser cookies to mitigate XSS and CSRF attacks.