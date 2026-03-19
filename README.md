# 📚 Libri: The Interactive AI Library

**Libri** is a cutting-edge SaaS platform designed to transform static PDF content into dynamic, conversational experiences. By leveraging Retrieval-Augmented Generation (RAG) and low-latency voice orchestration, it allows users to "talk" to their library through specialized AI personas.

-----

## 📖 Table of Contents

* [Project Overview]
* [Tech Stack]
* [Key Features]
* [Folder Structure]
* [Lessons Learned]
* [Getting Started]
-----

## 🎯 Project Overview

Libri solves the problem of information density in long-form documents. Instead of manually searching through hundreds of pages, users can verbally ask questions and receive context-aware, human-like responses based solely on the uploaded material. This project demonstrates my ability to build multi-modal AI applications that are ready for production use.

-----

## 🛠 Tech Stack

<img src="https://img.shields.io/badge/-Next.js_16-000000?style=for-the-badge&logo=Next.js&logoColor=white" alt="Next.js 16" />
<img src="https://img.shields.io/badge/-ElevenLabs-FFFFFF?style=for-the-badge&logo=ElevenLabs&logoColor=black" alt="ElevenLabs" />
<img src="https://img.shields.io/badge/-Vapi-62F6B5?style=for-the-badge&logo=Vapi&logoColor=black" alt="Vapi" />
<img src="https://img.shields.io/badge/-Clerk-6C47FF?style=for-the-badge&logo=Clerk&logoColor=white" alt="Clerk" />
<img src="https://img.shields.io/badge/-MongoDB-47A248?style=for-the-badge&logo=MongoDB&logoColor=white" alt="MongoDB" />
<img src="https://img.shields.io/badge/-Typescript-3178C6?style=for-the-badge&logo=Typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/-Tailwind-06B6D4?style=for-the-badge&logo=Tailwind-CSS&logoColor=white" alt="Tailwind CSS" />
<img src="https://img.shields.io/badge/-Shadcn/UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="Shadcn UI" />

### **Why these choices?**

* **Next.js 16 (App Router):** Chosen for its superior performance and the ability to leverage **Server Actions** for secure, server-side PDF processing.
* **Vapi & ElevenLabs:** Integrated to provide a seamless, low-latency voice interface that handles speech-to-text and text-to-speech concurrently.
* **Clerk:** Used to manage enterprise-grade authentication and usage-based subscription tiers for up to 50,000 users.
* **MongoDB & Mongoose:** Selected for their flexible schema design, allowing for efficient storage of complex document metadata and segmented text.

-----

## ✨ Key Features

* **Real-time Voice Calls:** Hands-free interaction with AI mentors using high-fidelity voices.
* **Multi-Page PDF Parsing:** Extracts and segments text from massive documents to ensure accuracy during RAG retrieval.
* **Subscription Management:** Tiered access (Free/Pro) logic built directly into the authentication flow.
* **Production Quality Code:** Refined with AI senior reviewers like **Code Rabbit** to ensure architectural integrity.

-----

## 📂 Folder Structure

```text
libri/
├── app/               # Next.js 16 App Router (Layouts, Pages, Server Actions)
├── components/        # Optimized UI components (Shadcn + Custom BookCard)
├── lib/               # Utility functions & Database connection logic
├── models/            # Mongoose schemas for Books and Users
├── types/             # Global TypeScript definitions (types.d.ts)
├── public/            # Static assets and brand imagery
└── next.config.ts     # Configuration for image domains and server action limits
```

-----

## 🎓 Lessons Learned

* **Scaling Server Actions:** During testing with massive textbooks, I hit the default 1MB Server Action limit. I learned to optimize the `bodySizeLimit` in `next.config.ts` to handle up to 100MB for robust file processing.
* **Engineering Mindset:** Utilizing AI agents like **Juni** within **WebStorm** allowed me to focus on business logic and architecture rather than repetitive boilerplate, significantly speeding up the development lifecycle.
* **Type-Safe Development:** Building global interfaces in `types.d.ts` prevented critical runtime errors, especially when managing complex MongoDB ObjectIDs and AI response schemas.

-----

## 🚀 Getting Started

1.  **Clone & Install:**
    ```bash
    git clone https://github.com/your-username/libri.git
    cd libri
    npm install
    ```
2.  **Environment Variables:** Create a `.env` file with your Clerk, MongoDB, Vapi, and Vercel Blob keys.
3.  **Run Development:**
    ```bash
    npm run dev
    ```
4.  **Visit:** `http://localhost:3000` to start interacting with your library.

-----

