# 🌟 VedaAI - AI-Powered Teacher's Toolkit

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)

VedaAI is a modern, decoupled full-stack application designed to empower educators by automating the creation of high-quality assessments, quizzes, and question papers. By leveraging Google's Gemini AI, asynchronous background processing, and real-time WebSockets, VedaAI delivers customized educational content instantly without locking up the user interface.

---

## 🚀 Features

* **AI Assessment Generation:** Generate structured question papers based on custom prompts and uploaded files.
* **Real-Time UI Updates:** Watch assignments generate in the background with live UI updates via WebSockets.
* **Smart Background Processing:** Heavy AI workloads are offloaded to a Redis-backed BullMQ queue system, ensuring the Node.js event loop is never blocked.
* **Interactive Editor:** Review, edit, and adjust the generated question papers directly in the browser.
* **High-Quality PDF Export:** Download pixel-perfect, print-ready A4 PDFs of the generated assessments using a custom renderer.
* **Premium Typography & UI:** Built with Next.js, Tailwind CSS, and the beautiful Bricolage Grotesque font.

---

## 🛠️ Tech Stack

### **Frontend (Vercel)**
* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **State Management:** Zustand
* **Real-time:** Socket.io-client
* **PDF Generation:** jsPDF + html2canvas-pro

### **Backend (Render)**
* **Runtime:** Node.js + Express
* **Language:** TypeScript
* **Database:** MongoDB (Mongoose)
* **Queue System:** BullMQ
* **Real-time:** Socket.io
* **AI Integration:** Google Generative AI (@google/generative-ai)

### **Infrastructure**
* **Redis Database:** Upstash (Serverless Redis)
* **Main Database:** MongoDB Atlas

---

## 🔄 System Architecture & Data Flow

VedaAI uses an asynchronous worker architecture to handle long-running AI requests. GitHub will automatically render the diagram below:

```mermaid
sequenceDiagram
    participant C as Next.js Frontend
    participant A as Express API
    participant DB as MongoDB
    participant R as Upstash Redis
    participant W as BullMQ Worker
    participant G as Gemini 2.5 Flash
    
    C->>A: 1. POST /assessments (Prompt + File)
    A->>DB: 2. Create Assessment (Status: PENDING)
    A->>R: 3. Add Job to Queue
    A-->>C: 4. Return 202 Accepted & Assessment ID
    C->>A: 5. Join Socket.io Room (Assessment ID)
    
    Note over R, W: Asynchronous Background Processing
    R->>W: 6. Consume Job
    W->>G: 7. Request Content Generation
    G-->>W: 8. Return Structured JSON
    
    W->>DB: 9. Update Assessment (Status: COMPLETED)
    W->>A: 10. Trigger Socket Event
    A-->>C: 11. Emit 'generation-success' to Room
    Note over C: 12. Frontend dynamically updates UI
