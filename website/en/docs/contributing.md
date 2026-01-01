# Panduan Kontribusi (Contributing Guide)

Terima kasih atas ketertarikan Anda untuk berkontribusi pada pengembangan **lapeeh Framework**! 🎉

Proyek ini bersifat **Open Source** dan kami sangat menghargai setiap bentuk kontribusi, baik itu perbaikan bug, penambahan fitur, dokumentasi, maupun sekadar laporan error (issue).

Dokumen ini akan memandu Anda tentang cara berkontribusi dengan benar dan efisien.

## 🚀 Memulai Kontribusi

### 1. Persiapan Lingkungan (Prerequisites)

Pastikan Anda sudah menginstal:

- **Node.js** (v18 ke atas)
- **Git**
- **Code Editor** (VS Code disarankan, dengan ekstensi ESLint & Prettier)

### 2. Fork & Clone Repository

    git clone https://github.com/USERNAME_ANDA/lapeeh.git
    cd lapeeh
    ```bash
    git clone https://github.com/USERNAME_ANDA/lapeeh.git
    cd lapeeh
    git remote add upstream https://github.com/robyajo/lapeeh.git

3.  **Tambahkan Remote Upstream** (agar bisa sinkron dengan repo asli):
    ```bash
    git remote add upstream https://github.com/robyajo/lapeeh.git
    ```

### 3. Instalasi Dependencies

```bash
npm install
```

Jangan lupa jalankan setup awal:

```bash
cp .env.example .env
# Konfigurasi .env sesuai kebutuhan (terutama bagian Database)
```

## 🛠️ Workflow Pengembangan

### 1. Buat Branch Baru

Jangan bekerja langsung di branch `main`. Buat branch baru yang deskriptif:

```bash
git checkout -b feature/tambah-validasi-email
# atau
git checkout -b fix/typo-dokumentasi
```

### 2. Standar Koding (Coding Standards)

Kami menerapkan aturan yang ketat demi menjaga kualitas kode.

- **TypeScript**: Gunakan tipe data eksplisit. Hindari `any` sebisa mungkin.
- **Linter**: Pastikan tidak ada error ESLint. Variabel tidak terpakai harus dihapus atau diberi prefix `_`.
- **Formatter**: Kode harus rapi.

Sebelum commit, **WAJIB** jalankan perintah ini untuk memastikan kode Anda bersih:

```bash
npm run typecheck  # Cek error TypeScript
npm run lint       # Cek error Linter
```

### 3. Commit Message Convention

Gunakan format **Conventional Commits** agar history mudah dibaca:

- `feat: ...` untuk fitur baru.
- `fix: ...` untuk perbaikan bug.
- `docs: ...` untuk perubahan dokumentasi.
- `chore: ...` untuk perubahan kecil (config, script).
- `refactor: ...` untuk perbaikan struktur kode tanpa mengubah fitur.

**Contoh:**

```text
feat: add email validation rule to validator
fix: resolve EADDRINUSE error on windows
docs: update installation guide
```

## 📮 Mengirim Pull Request (PR)

1.  **Push** branch Anda ke GitHub:
    ```bash
    git push origin feature/nama-fitur
    ```
2.  Buka repository fork Anda di GitHub, lalu klik **Compare & pull request**.
3.  Isi judul dan deskripsi PR dengan jelas:
    - Jelaskan apa yang Anda ubah.
    - Sertakan screenshot (jika ada perubahan visual/output).
    - Referensikan Issue jika ada (contoh: `Closes #123`).
4.  Tunggu review dari maintainer. Kami mungkin akan meminta revisi kecil.
5.  Setelah disetujui, kode Anda akan di-merge! 🚀

## 🐛 Melaporkan Bug (Issues)

Jika Anda menemukan bug tapi belum bisa memperbaikinya, silakan buat **Issue** baru.

- Gunakan judul yang jelas.
- Jelaskan langkah-langkah untuk mereproduksi bug (Steps to Reproduce).
- Sertakan log error atau screenshot.
- Sebutkan versi Node.js dan OS yang digunakan.

## 💡 Ide & Diskusi

Punya ide fitur baru? Jangan ragu untuk membukanya di **GitHub Discussions** atau buat Issue dengan label `enhancement` sebelum mulai koding, agar kita bisa mendiskusikan desainnya terlebih dahulu.

---

Selamat berkontribusi! Kode Anda akan membantu developer lain membangun aplikasi dengan lebih cepat dan menyenangkan. ❤️
