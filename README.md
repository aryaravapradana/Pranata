<div align="center">
  <a href="https://pranata.online" target="_blank">
    <img src="frontend/public/logos/basic/logo-white.webp" alt="Pranata Logo" width="280" />
  </a>
  <br />
  <a href="https://pranata.online" target="_blank"><b>pranata.online</b></a>
  <br /><br />
  <p>
    <a href="#tentang-pranata">Tentang</a> •
    <a href="#akun-demo">Akun Demo</a> •
    <a href="#fitur-utama">Fitur Utama</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#cara-menjalankan">Cara Menjalankan</a>
  </p>
</div>

---

## Tentang Pranata

**Pranata** adalah platform ekosistem digital peternakan terpadu yang menghubungkan peternak lokal secara langsung dengan konsumen dan pembeli bisnis (*B2B/B2C*) tanpa perantara tengkulak. Dibuat untuk menciptakan rantai pasok hasil ternak yang transparan dan efisien, memberikan harga yang lebih adil bagi peternak, serta memberdayakan operasional harian peternak melalui manajemen transaksi digital, pencatatan produksi, dan analisis bisnis berbasis *Artificial Intelligence* (AI Assistant).

---

## Akun Demo

Gunakan akun dummy berikut untuk mencoba dan mendemonstrasikan seluruh fitur pada platform **Pranata**:

| Role | Username | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Peternak (Producer)** | `peternak_dummy` | `password123` | Akun demo peternak lengkap dengan data toko, transaksi, dan jadwal operasional |
| **Peternak (Alternatif)** | `aryaternak1` | `password123` | Akun peternak dengan katalog produk siap jual |

---

## Fitur Utama

Pranata menyediakan 3 modul utama yang saling terintegrasi dalam satu platform:

<br />

<img src="frontend/public/logos/market/market-white.webp" alt="Pranata Market Logo" style="height: 44px; max-height: 44px; width: auto;" />

* **Katalog Produk Segar**  
  Penjualan langsung hasil peternakan (daging segar, telur, susu, hingga ternak hidup).
* **Filter & Pencarian Pintar**  
  Pencarian berdasarkan kategori produk, wilayah/lokasi peternak, serta *grade* kualitas (Premium, Grade A, Grade B, Grade C).
* **Keranjang Belanja & Checkout**  
  Transaksi yang efisien dan langsung terhubung dengan profil peternak.
* **Profil Penjual & Transparansi**  
  Halaman publik toko peternak untuk melihat asal-usul peternakan dan riwayat produk.

<br />

<img src="frontend/public/logos/hub/hub-white.webp" alt="Pranata Hub Logo" style="height: 44px; max-height: 44px; width: auto;" />

* **Manajemen Produk & Stok**  
  Tambah, edit, atur variasi harga, unit (*kg*, *ekor*, *liter*), dan stok barang.
* **Pencatatan Keuangan & Pesanan**  
  Monitoring transaksi masuk (*revenue*) dan pengeluaran operasional (*pakan, vaksin, utilitas*).
* **Kalender Operasional Peternakan**  
  Penjadwalan rutinitas peternakan (jadwal panen, pemberian vaksin, dan tugas harian).
* **Peta Interaktif Peternakan**  
  Visualisasi peta lokasi peternakan lokal terintegrasi.
* **Pantauan Harga Komoditas Real-Time**  
  Monitoring simulasi data harga komoditas pangan nasional (jagung, dedak padi, kedelai).

<br />

<img src="frontend/public/logos/intelligence/intelligence-white.webp" alt="Pranata Intelligence Logo" style="height: 44px; max-height: 44px; width: auto;" />

* **Asisten AI Interaktif**  
  Konsultasi peternakan 24/7 didukung oleh *Large Language Model* (Google Gemini AI).
* **Analisis Keputusan Bisnis**  
  Rekomendasi optimalisasi produksi, proyeksi pakan, dan penanganan kesehatan hewan.
* **Gradasi Kualitas Otomatis**  
  Pemrosesan AI untuk membantu penentuan *grade* produk dan estimasi nilai jual hasil ternak.

---

## Tech Stack

Platform Pranata dibangun menggunakan arsitektur modern yang responsif, cepat, dan scalable:

### Frontend
- ![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) **Framework React App Router**
- ![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) **UI Library**
- ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) **Type-Safe Language**
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) **Styling & Design System**
- ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white) **Animations & UI Transitions**
- ![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white) **Advanced Scroll & Micro-Animations**
- ![MapLibre](https://img.shields.io/badge/MapLibre_GL-0477BF?style=for-the-badge&logo=maplibre&logoColor=white) **Interactive Geographic Maps**

### Backend & Database
- ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) **JavaScript Runtime Environment**
- ![Express.js](https://img.shields.io/badge/Express.js_v5-000000?style=for-the-badge&logo=express&logoColor=white) **Web Framework**
- ![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white) **Next-generation ORM**
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) **Relational Database**
- ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white) **Storage & Backend Infrastructure**

### Artificial Intelligence
- ![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white) **LLM Engine & AI SDK Integrations**

---

## Cara Menjalankan

### 1. Clone Repository & Install Dependencies

```bash
# Install dependencies frontend
cd frontend
npm install

# Install dependencies backend
cd ../backend
npm install
```

### 2. Setup Environment Variables

Buat file `.env` pada folder `backend` dan `.env.local` pada folder `frontend` sesuai petunjuk konfigurasi masing-masing folder.

### 3. Database Migration & Seed Data

```bash
cd backend
npx prisma db push
npm run seed
```

### 4. Jalankan Server Development

```bash
# Backend Server
cd backend
npm run dev

# Frontend Server (di terminal terpisah)
cd frontend
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda untuk mengakses aplikasi **Pranata**.
