# SEO Strategy: Programmatic & Content-Driven

Since many rural and semi-urban users will discover schemes via Google searches (e.g., "How to apply for PM Kisan scheme online"), strong SEO is critical.

## 1. Programmatic SEO for Schemes
*   **Dynamic Routes:** Next.js App Router will generate localized pages for every scheme in the database.
    *   `sevasetu.in/schemes/pm-kisan-samman-nidhi`
    *   `sevasetu.in/hi/schemes/pm-kisan-samman-nidhi` (Hindi)
*   **Server-Side Rendering (SSR) / Static Site Generation (SSG):** All public scheme directories will be pre-rendered using Incremental Static Regeneration (ISR) to ensure ultra-fast TTFB (Time to First Byte) and instant crawler indexing.

## 2. Structured Data (Schema Markup)
We will inject JSON-LD into the `<head>` of our pages:
*   **GovernmentService Schema:** Explicitly defining the schemes as government services, listing eligibility requirements and operator details.
*   **FAQPage Schema:** Extracting common questions from the RAG pipeline and displaying them on scheme pages to capture Google "People Also Ask" (PAA) rich snippets.
*   **BreadcrumbList Schema:** For clear site hierarchy navigation.

## 3. Multilingual SEO (Hreflang)
*   Implementation of correct `<link rel="alternate" hreflang="x" href="..."/>` tags to map regional pages accurately. This prevents duplicate content penalties and ensures Google serves the Hindi page to users searching in Hindi.

## 4. Content & Link Strategy
*   **Consultant Profiles:** Public landing pages for verified consultants (e.g., `sevasetu.in/consultants/amit-kumar-pune`) to rank for local keywords like "Government scheme consultant in Pune".
*   **Canonical URLs:** Strict canonicalization to handle query parameters (e.g., filtering schemes by state).
*   **Core Web Vitals:** Strict adherence to Next.js image optimization (`next/image`), font loading (`next/font`), and minimizing JS payloads to pass LCP, CLS, and INP metrics.