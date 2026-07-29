# UI/UX Design System: Seva Setu

## 1. Design Philosophy
The Seva Setu design system ("Setu UI") prioritizes **Accessibility, Trust, and Localization**. It is built on Tailwind CSS and Radix UI / Shadcn UI for robust headless accessibility.

## 2. Color Palette
To establish trust (government associations) and clarity:
*   **Primary (Trust Blue):** `#1E3A8A` (Deep Blue) - Used for primary actions, top nav, and active states.
*   **Secondary (Govt Saffron/Orange Accent):** `#F97316` - Used sparingly for highlights, notifications, and key CTAs.
*   **Success (Green):** `#16A34A` - For successful verifications, completed checklist items, and approved schemes.
*   **Background (Light Gray/Off-White):** `#F8FAFC` - Reduces eye strain compared to pure white.
*   **Text (Charcoal):** `#1E293B` - Ensures high contrast ratio against backgrounds.

## 3. Typography
*   **Primary Font:** `Inter` (Sans-serif) for English interfaces. clean, modern, and highly readable.
*   **Indic Fonts:** Integration with Google Fonts for regional languages (e.g., `Noto Sans Devanagari`, `Noto Sans Tamil`) to ensure native readability and rendering.
*   **Hierarchy:** Strict `h1` to `h6` scaling optimized for mobile devices (large touch targets).

## 4. Key UI Components
*   **Voice-First Input (Bhashini Integration):** A prominent, pulsing microphone FAB (Floating Action Button) present in the chat and search interfaces. Uses visual wave-form feedback when listening.
*   **Kanban Cards:** Soft-shadow cards (`shadow-md`) with rounded corners (`rounded-xl`). Color-coded left-borders indicating status (Yellow = Pending, Green = Eligible, Gray = Draft).
*   **Progressive Disclosure Forms:** Instead of long scrolling forms, user profiling is chunked into visually distinct, single-focus steps with iconography (e.g., "Income Level" represented by coins).
*   **Language Toggle:** Persistently available at the top right, featuring an icon and the current language in its native script (e.g., "A/अ").

## 5. Accessibility (A11y) & NFRs
*   **WCAG 2.1 AA Compliance:** Minimum contrast ratios enforced.
*   **Screen Reader Support:** Complete `aria-labels` on all interactive elements, especially dynamic chat updates (using `aria-live`).
*   **Touch Targets:** Minimum 44x44px for all clickable elements to aid elderly or less tech-savvy users.
*   **Graceful Degradation:** The UI functions without JS for basic scheme browsing, ensuring availability on low-end devices.