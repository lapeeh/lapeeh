# CLI Tools & Scripts

lapeeh Framework dilengkapi dengan berbagai script CLI untuk mempercepat proses development, mulai dari generate code hingga manajemen database.

Semua perintah dijalankan menggunakan `npm run <command>`.

> **Info:** Di balik layar, script `npm run` ini memanggil CLI internal framework (`lapeeh`). Anda juga bisa menjalankan perintah ini secara langsung menggunakan `npx lapeeh <command>`.

## Core Commands

Perintah utama untuk menjalankan aplikasi:

### 1. Inisialisasi Project (`init`)

Membuat project baru dari awal.

```bash
npx lapeeh@latest init <nama-project> [flags]
```

**Flag Tersedia:**

- `--full`: Inisialisasi dengan setup lengkap (termasuk dummy user, role, permission).
- `--default`: Inisialisasi dengan konfigurasi default (PostgreSQL) melewati prompt interaktif.
- `--y`: Alias untuk `--default`.

**Contoh:**

```bash
# Mode Interaktif
npx lapeeh init my-app

# Setup Lengkap (Disarankan untuk belajar)
npx lapeeh init my-app --full

# Setup Cepat (Default Postgres)
npx lapeeh init my-app --y
```

### 2. Upgrade Framework (`upgrade`)

Memperbarui framework lapeeh ke versi terbaru di project yang sudah ada.

```bash
npx lapeeh upgrade
```

**Fitur:**

- Secara otomatis memperbarui dependensi `package.json`.
- Menyinkronkan file inti framework sambil menjaga kode kustom Anda.
- **Smart Dependency Handling**: Mempertahankan dependensi `file:` lokal jika Anda mengembangkan framework secara lokal, jika tidak akan mengupdate ke versi npm terbaru.

### 3. Development Server (`dev`)

Menjalankan server dalam mode development dengan fitur hot-reload.

```bash
npm run dev
# atau
npx lapeeh dev
```

### 2. Production Server (`start`)

Menjalankan server dalam mode production (pastikan sudah dibuild).

```bash
npm run start
# atau
npx lapeeh start
```

### 3. Build Project (`build`)

Mengompilasi kode TypeScript ke JavaScript di folder `dist`.

```bash
npm run build
# atau
npx lapeeh build
```

## Code Generators

Gunakan perintah ini untuk membuat file boilerplate secara otomatis.

### 1. Membuat Module Lengkap (`make:module`)

Membuat Controller dan Route sekaligus.

```bash
npm run make:module <nama-module>
```

**Contoh:** `npm run make:module Product`

Output:

- `src/controllers/productController.ts`
- `src/routes/product.ts`

### 2. Membuat Controller (`make:controller`)

Hanya membuat file controller dengan method CRUD dasar.

```bash
npm run make:controller <nama-controller>
```

**Contoh:** `npm run make:controller Order` (Akan membuat `src/controllers/orderController.ts`)

## Code Quality & Utilities

### 1. Linting (`lint`)

Memeriksa kode dari error, variabel tidak terpakai, dan gaya penulisan.

```bash
npm run lint
```

Gunakan `npm run lint:fix` untuk memperbaiki error otomatis.

### 2. Type Check (`typecheck`)

Memeriksa error tipe data TypeScript tanpa melakukan compile.

```bash
npm run typecheck
```

### 3. Generate JWT Secret (`generate:jwt`)

Membuat random string aman untuk `JWT_SECRET` di file `.env`.

```bash
npm run generate:jwt
```
