# 🛍️ ProductAdmin Dashboard

> A modern admin dashboard for managing products, built with Next.js and the DummyJSON API.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white)

🔗 **Live Demo:** [product-admin-dashboard-eta-mauve.vercel.app](https://product-admin-dashboard-eta-mauve.vercel.app)
📦 **Repo:** [github.com/pulkitcode-bit/React-Assingment](https://github.com/pulkitcode-bit/React-Assingment)

---

## 📖 Overview

ProductAdmin is a small but complete admin panel — login, browse products, search, filter, sort, paginate, and perform full CRUD — all built against the free [DummyJSON API](https://dummyjson.com), with every network call going through a single shared Axios instance.

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/pulkitcode-bit/React-Assingment.git
cd dashboard

# 2. Install dependencies
npm install

# 3. Run the dev server
npm run dev
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 🔑 Demo Login

| Field | Value |
|---|---|
| Username | `emilys` |
| Password | `emilyspass` |

---

## ✅ Features Completed

**🔐 Authentication**
- [x] Login with error handling for wrong credentials
- [x] Route protection — `/products` redirects to `/login` when logged out
- [x] Logout button
- [x] Double-submit prevention on login (no duplicate requests on rapid clicks)

**📦 Product Listing**
- [x] Table view on desktop, card view on mobile
- [x] Manual pagination — page size selector (10 / 20 / 50), Prev/Next, page numbers
- [x] `"Showing X–Y of Z"` result counter
- [x] Debounced search with **AbortController** race-condition protection
- [x] Category filter + sort by price, rating, or title
- [x] URL state syncing — page, search, category, and sort persist through refresh/share

**🔍 Product Details**
- [x] Full detail page with images, description, price, and reviews
- [x] Custom "Not Found" page for invalid product IDs

**✏️ CRUD**
- [x] Add / Edit product form with validation
- [x] Delete with confirmation modal
- [x] Local overlay so changes persist across the session (see below)

**🛡️ Robustness**
- [x] Loading, empty, and error states with a Retry button
- [x] Invalid URL params (`?page=abc`, `?page=999`) handled without crashing
- [x] Single shared Axios instance with request/response interceptors

---

## 🧠 Key Design Decisions

### 1️⃣ Search vs. Category Filter
DummyJSON doesn't support combining a search query (`q`) with a category filter in one request. Instead of faking it client-side — fetching everything and filtering in memory, which breaks real pagination — the two are **mutually exclusive**: picking a category clears the active search, and typing a search term clears the active category.

### 2️⃣ "Persisting" Add / Edit / Delete
DummyJSON accepts writes but never actually saves them server-side. To make CRUD feel real, a local overlay context (`ProductContext`) merges the API response into in-memory state immediately after a successful write, so the change is visible across the app for the rest of the session — with a toast: *"Change saved locally — DummyJSON does not persist writes."*

### 3️⃣ Auth Token Storage
The token lives in a cookie (not just `localStorage`) so Next.js middleware can check authentication **server-side**, before a protected page even starts rendering.

---

## 🐞 A Problem I Faced

**Symptom:** On first load, `/products` showed *"Unable to Load Products: canceled"* — data only appeared after clicking Retry.

**Root cause:** React Strict Mode double-mounts components in development. My fetch used an `AbortController` to cancel in-flight requests on cleanup (needed to avoid search race conditions) — but that meant the *first* mount's request got aborted by the Strict Mode remount, and the Axios interceptor was treating that cancellation as a real error.

**Fix:** Updated the interceptor to detect cancellations (`axios.isCancel(error)` / `ERR_CANCELED`) and silently ignore aborted requests in the fetch logic, while still surfacing genuine network/API errors with Retry.

---

## 🤖 Where AI Helped

I used an AI coding agent (Antigravity) to scaffold the project and generate an initial implementation feature-by-feature, from a plan I reviewed before each step. I manually tested every flow above, diagnosed the AbortController/Strict Mode bug myself, and directed the fix. I can walk through and explain any part of this codebase, including live changes.

---

## ⚠️ Known Limitations

- Next.js 16 has deprecated `middleware.ts` in favor of `proxy.ts`. This project still uses `middleware.ts` and shows a console deprecation warning, though it works correctly.
- Product writes are session-only, since DummyJSON doesn't support real persistence.

---

## 🛠️ Tech Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| API | [DummyJSON](https://dummyjson.com) |
