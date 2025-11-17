
# 🚀 NextJS Frontend — Modern Chat Interface

A modern, elegant, and scalable **Next.js (App Router)** frontend designed to work with a FastAPI backend.  
The UI replicates a ChatGPT-style chat interface, supports file uploads, and manages global state using **Zustand**.

---

## ✨ Features

- ⚡ **Next.js 15+ (App Router)**
- 💬 **ChatGPT-like UI**
- 📁 **File upload support**
- 🔄 **Service layer for API requests**
- 🧠 **Global state management with Zustand**
- 🎨 **TailwindCSS styling**
- 📁 **Clean, scalable folder structure**
- 🚀 **Optimized for integration with FastAPI backend**



## 🗂️ Project Structure

```

/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   │
│   ├── services/
│   │   └── api.ts
│   │
│   ├── store/
│   │   └── chatStore.ts
│   │
│   ├── hooks/
│   │   └── useChat.ts
│   │
│   ├── components/
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatContainer.tsx
│   │   ├── FileUpload.tsx
│   │   └── Loader.tsx
│
├── public/
│   └── assets…
│
├── next.config.ts
├── package.json
└── tsconfig.json

````

---

## 🧩 Tech Stack

| Tool | Purpose |
|------|---------|
| **Next.js** | App Router, Server Components |
| **React 18+** | Core UI |
| **Zustand** | Global state store |
| **TailwindCSS** | Styling |
| **TypeScript** | Type-safe frontend |
| **pnpm** | Package manager |
| **FastAPI (External)** | Backend API |

---

## 🔌 API Integration

The frontend communicates with the FastAPI backend via a **service class** located in:

`app/services/api.ts`

Example:

```ts
export const API_BASE = "http://localhost:8000/api/v1";

export async function sendMessage(message: string) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return res.json();
}
````

---

## 🧠 State Management with Zustand

Example store:

```ts
import { create } from "zustand";

export const useChatStore = create((set) => ({
  messages: [],
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
}));
```

---

## 🎨 UI Overview

### 💬 Chat Interface

* Displays messages from user + system
* Smooth scrolling
* Clean “message bubble” design

### 📝 Input Area

* Text input
* File upload
* “Send” button

### 📁 File Upload

* Drag & drop or click
* Preview before sending

---

## 📦 Installation

```bash
pnpm install
pnpm dev
```

Frontend runs at:

👉 [http://localhost:3000](http://localhost:3000)

---

## 🔧 Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 🔥 Production Build

```bash
pnpm build
pnpm start
```


