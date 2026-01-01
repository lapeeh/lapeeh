# Dokumentasi Perubahan lapeeh Framework

File ini mencatat semua perubahan, pembaruan, dan perbaikan yang dilakukan pada framework lapeeh, diurutkan berdasarkan tanggal.

## [1.0.6] - 2026-01-01

### 🚀 Fitur & Perbaikan

- **Testing**: Menambahkan perintah `npx lapeeh tes` yang menjalankan Jest dan JSON Server secara bersamaan dengan database terisolasi (`database.test.json`).
- **Refactor Modul**: Restrukturisasi modul bawaan (`Auth` & `Rbac`) mengikuti standar `make:module` (Controller, Service, Route dalam satu folder).
- **Cleanup**: Menghapus file route lama di `src/routes/` dan memindahkannya ke dalam modul masing-masing.
- **CLI**: Update help message untuk perintah `test`.

## [1.0.5] - 2026-01-01

### 🚀 Fitur & Perbaikan

- **Standardisasi**: Penyesuaian standar framework lapeeh.
- **CLI**: Perbaikan perintah `make:module` dan `init`.
- **Dokumentasi**: Pembersihan referensi versi lama yang membingungkan.

## [1.0.0] - 2026-01-01

- Rilis Publik Pertama.
