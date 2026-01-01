# Panduan Arsitektur: Menuju "Framework as a Dependency" (Next.js Style)

Saat ini, lapeeh menggunakan pendekatan **Boilerplate** (seperti Laravel), di mana pengguna mendapatkan seluruh kode sumber (`src/`) dan bertanggung jawab atas `express`, `driver database`, dll.

Untuk mengubahnya menjadi seperti **Next.js** (di mana pengguna hanya menginstall `lapeeh` dan `package.json` mereka bersih), kita perlu mengubah arsitektur menjadi **Library**.

## 1. Perbedaan Utama

| Fitur            | Boilerplate (lapeeh Saat Ini)              | Library (Next.js Style)              |
| :--------------- | :----------------------------------------- | :----------------------------------- |
| **Instalasi**    | `git clone` / `npx create-lapeeh`          | `npm install lapeeh`                 |
| **package.json** | Banyak dependency (`express`, `cors`, dll) | Sedikit (`lapeeh`, `react`)          |
| **Scripts**      | Panjang (`nodemon src/index.ts`)           | Pendek (`lapeeh dev`)                |
| **Core Code**    | Terbuka di `src/core/`                     | Tersembunyi di `node_modules/lapeeh` |
| **Update**       | Susah (harus merge manual)                 | Mudah (`npm update lapeeh`)          |

## 2. Langkah Implementasi

Saya telah memulai langkah pertama dengan menambahkan **CLI Runner** di `bin/index.js`.

### A. Update CLI (`bin/index.js`) ✅ (Sudah Dilakukan)

Saya sudah menambahkan command `dev`, `start`, dan `build` ke dalam CLI lapeeh. Ini memungkinkan pengguna menjalankan server tanpa tahu perintah aslinya.
I have added `dev`, `start`, and `build` commands to the Lapeeh CLI. This allows users to run the server without knowing the underlying commands.

// Contoh penggunaan nanti:
// Example usage later:
"dev": "lapeeh dev",
"build": "lapeeh build",
"start": "lapeeh start"
"start": "lapeeh start"
}

````
### B. Struktur Project Pengguna (Target)
Nantinya, project pengguna lapeeh hanya akan berisi file bisnis mereka:

Eventually, the Lapeeh user project will only contain their business files:

```text
my-app/
├── src/
│   ├── controllers/
├── lapeeh.config.ts  <-- Konfigurasi framework (pengganti edit core)
│   └── models/
├── lapeeh.config.ts  <-- Framework configuration (replaces core edits)
└── package.json
Dan `package.json` mereka akan terlihat seperti ini:

And their `package.json` will look like this:

```json
{
    "lapeeh": "^2.0.0"
  "dependencies": {
    "@lapeeh/lapeeh": "^2.0.0"
    "dev": "lapeeh dev",
    "build": "lapeeh build",
    "start": "lapeeh start"
    "build": "lapeeh build",
    "start": "lapeeh start"
  }
}
### C. Apa yang Harus Dilakukan Selanjutnya?

1.  **Publish Package**: Anda perlu mempublish folder framework ini ke NPM (atau private registry).
    *   Pastikan `express`, `cors`, `helmet`, dll ada di `dependencies` (bukan `devDependencies`).
2.  **Abstraksi `src/index.ts`**:
    *   Saat ini `src/index.ts` adalah entry point yang diedit user.
    *   Ubah agar `lapeeh dev` menjalankan server internal yang **mengimpor** routes/controller user secara dinamis (seperti Next.js pages router).
    - Currently `src/index.ts` is the entry point edited by the user.
    *   Buat sistem pembacaan `lapeeh.config.ts` untuk mengatur Port, Database URL, dll tanpa mengedit kode core.
3.  **Config Loader**:
## 3. Kesimpulan
Perubahan yang saya lakukan di `bin/index.js` adalah fondasi untuk CLI style. Untuk mencapai "Clean package.json" sepenuhnya, Anda harus memisahkan **Framework Core** (repo ini) dengan **User Project** (repo baru yang menginstall framework ini).
## 3. Conclusion

The changes I made in `bin/index.js` are the foundation for the CLI style. To achieve "Clean package.json" fully, you must separate **Framework Core** (this repo) with **User Project** (new repo installing this framework).
````
