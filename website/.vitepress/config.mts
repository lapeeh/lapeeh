import { defineConfig } from "vitepress";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(resolve(__dirname, "../package.json"), "utf-8")
);
const version = pkg.version;
const siteUrl = "https://lapeeh.vercel.app";
const defaultDescription =
  "Lapeeh adalah framework API Node.js berbasis Express dan TypeScript dengan dokumentasi lengkap, CLI generator, struktur modular, keamanan bawaan, dan panduan deployment.";

function buildCanonicalPath(relativePath: string) {
  const cleanPath = relativePath
    .replace(/(^|\/)index\.md$/, "$1")
    .replace(/\.md$/, "")
    .replace(/\/+/g, "/");

  if (!cleanPath || cleanPath === "index") return `${siteUrl}/`;
  return `${siteUrl}/${cleanPath}`.replace(/\/+$/, "");
}

export default defineConfig({
  title: "Lapeeh Framework",
  description: defaultDescription,
  // Shared properties
  cleanUrls: true,
  ignoreDeadLinks: true,
  lastUpdated: true,
  vite: {
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
  },
  sitemap: {
    hostname: siteUrl,
  },
  transformHead({ pageData }) {
    const title = pageData.frontmatter.title
      ? `${pageData.frontmatter.title} | Lapeeh Framework`
      : pageData.title
        ? `${pageData.title} | Lapeeh Framework`
        : "Lapeeh Framework";
    const description =
      pageData.frontmatter.description ||
      pageData.description ||
      defaultDescription;
    const canonical = buildCanonicalPath(pageData.relativePath);
    const locale = pageData.relativePath.startsWith("en/") ? "en_US" : "id_ID";
    const alternateLocale = locale === "id_ID" ? "en_US" : "id_ID";

    return [
      ["link", { rel: "canonical", href: canonical }],
      ["meta", { name: "description", content: description }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: description }],
      ["meta", { property: "og:url", content: canonical }],
      ["meta", { property: "og:locale", content: locale }],
      ["meta", { property: "og:locale:alternate", content: alternateLocale }],
      ["meta", { name: "twitter:title", content: title }],
      ["meta", { name: "twitter:description", content: description }],
    ];
  },

  head: [
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon-96x96.png",
        sizes: "96x96",
      },
    ],
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    ["link", { rel: "shortcut icon", href: "/favicon.ico" }],
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],
    ["meta", { name: "apple-mobile-web-app-title", content: "lapeeh" }],
    ["meta", { name: "theme-color", content: "#3eaf7c" }],
    // SEO Standard
    [
      "meta",
      {
        name: "keywords",
        content:
          "Lapeeh Framework, Node.js framework, Express TypeScript framework, backend framework, REST API boilerplate, API documentation, framework Indonesia, Express API starter",
      },
    ],
    ["meta", { name: "author", content: "robyajo" }],
    ["meta", { name: "robots", content: "index, follow" }],
    [
      "meta",
      {
        name: "google-site-verification",
        content: "wxBUXFsePPf4nmEM6EFDXJZ5PDmI4i0E9v5EROQfXGQ",
      },
    ],
    // Open Graph
    ["meta", { property: "og:site_name", content: "Lapeeh Framework" }],
    ["meta", { property: "og:type", content: "website" }],
    [
      "meta",
      {
        property: "og:image",
        content: `${siteUrl}/ogimage.png`,
      },
    ],
    // Twitter
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    [
      "meta",
      {
        name: "twitter:image",
        content: `${siteUrl}/ogimage.png`,
      },
    ],
  ],

  // Locales Configuration
  locales: {
    root: {
      label: "Indonesia",
      lang: "id-ID",
      description:
        "Dokumentasi resmi framework API Node.js berbasis Express dan TypeScript untuk membangun backend yang cepat, aman, dan terstandarisasi.",
      themeConfig: {
        nav: [
          { text: "Beranda", link: "/" },
          { text: "Dokumentasi", link: "/docs/" },
          { text: "Panduan", link: "/docs/getting-started" },
          { text: "Blog", link: "/blog/" },
          { text: "Referensi", link: "/docs/packages" },
          {
            text: `v${version}`,
            items: [
              { text: "Changelog", link: "/docs/changelog" },
              { text: "Roadmap", link: "/docs/roadmap" },
            ],
          },
        ],
        sidebar: [
          {
            text: "Pengenalan",
            items: [
              { text: "Ringkasan Dokumentasi", link: "/docs/" },
              { text: "Apa itu lapeeh?", link: "/docs/introduction" },
              { text: "Fitur Utama", link: "/docs/features" },
              { text: "Arsitektur", link: "/docs/architecture-guide" },
              { text: "Struktur Project", link: "/docs/structure" },
            ],
          },
          {
            text: "Panduan Utama",
            items: [
              {
                text: "Memulai (Getting Started)",
                link: "/docs/getting-started",
              },
              { text: "Tutorial Lengkap", link: "/docs/tutorial" },
              { text: "CLI Command", link: "/docs/cli" },
              { text: "Deployment (VPS/PM2)", link: "/docs/deployment" },
            ],
          },
          {
            text: "Topik Lanjutan",
            items: [
              { text: "Keamanan (Security)", link: "/docs/security" },
              { text: "Performa", link: "/docs/performance" },
              { text: "Cheatsheet", link: "/docs/cheatsheet" },
              { text: "Paket & Library", link: "/docs/packages" },
            ],
          },
          {
            text: "Komunitas",
            items: [
              { text: "Kontribusi", link: "/docs/contributing" },
              { text: "FAQ", link: "/docs/faq" },
              { text: "Changelog", link: "/docs/changelog" },
              { text: "Roadmap", link: "/docs/roadmap" },
            ],
          },
        ],
        footer: {
          message: "Dirilis di bawah lisensi MIT.",
          copyright: "Copyright © 2025-sekarang robyajo",
        },
        docFooter: {
          prev: "Halaman Sebelumnya",
          next: "Halaman Selanjutnya",
        },
        outline: {
          label: "Di halaman ini",
        },
        search: {
          provider: "local",
          options: {
            locales: {
              root: {
                translations: {
                  button: {
                    buttonText: "Cari dokumentasi",
                    buttonAriaLabel: "Cari dokumentasi",
                  },
                  modal: {
                    noResultsText: "Tidak ada hasil untuk",
                    resetButtonTitle: "Reset pencarian",
                    footer: {
                      selectText: "untuk memilih",
                      navigateText: "untuk navigasi",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    en: {
      label: "English",
      lang: "en-US",
      link: "/en/",
      description:
        "Official documentation for a Node.js API framework built with Express and TypeScript for fast, secure, and standardized backend development.",
      themeConfig: {
        nav: [
          { text: "Home", link: "/en/" },
          { text: "Documentation", link: "/en/docs/" },
          { text: "Guide", link: "/en/docs/getting-started" },
          { text: "Blog", link: "/en/blog/" },
          { text: "Reference", link: "/en/docs/packages" },
          {
            text: `v${version}`,
            items: [
              { text: "Changelog", link: "/en/docs/changelog" },
              { text: "Roadmap", link: "/en/docs/roadmap" },
            ],
          },
        ],
        sidebar: [
          {
            text: "Introduction",
            items: [
              { text: "Documentation Overview", link: "/en/docs/" },
              { text: "What is lapeeh?", link: "/en/docs/introduction" },
              { text: "Key Features", link: "/en/docs/features" },
              { text: "Architecture", link: "/en/docs/architecture-guide" },
              { text: "Project Structure", link: "/en/docs/structure" },
            ],
          },
          {
            text: "Core Guides",
            items: [
              { text: "Getting Started", link: "/en/docs/getting-started" },
              { text: "Full Tutorial", link: "/en/docs/tutorial" },
              { text: "CLI Command", link: "/en/docs/cli" },
              { text: "Deployment (VPS/PM2)", link: "/en/docs/deployment" },
            ],
          },
          {
            text: "Advanced Topics",
            items: [
              { text: "Security", link: "/en/docs/security" },
              { text: "Performance", link: "/en/docs/performance" },
              { text: "Cheatsheet", link: "/en/docs/cheatsheet" },
              { text: "Packages & Libraries", link: "/en/docs/packages" },
            ],
          },
          {
            text: "Community",
            items: [
              { text: "Contributing", link: "/en/docs/contributing" },
              { text: "FAQ", link: "/en/docs/faq" },
              { text: "Changelog", link: "/en/docs/changelog" },
              { text: "Roadmap", link: "/en/docs/roadmap" },
            ],
          },
        ],
        footer: {
          message: "Released under the MIT License.",
          copyright: "Copyright © 2025 Lapeeh Framework",
        },
        docFooter: {
          prev: "Previous Page",
          next: "Next Page",
        },
        outline: {
          label: "On this page",
        },
      },
    },
  },

  themeConfig: {
    logo: "/logo.png",
    socialLinks: [{ icon: "github", link: "https://github.com/lapeeh/lapeeh" }],
    search: {
      provider: "local",
    },
    editLink: {
      pattern: "https://github.com/lapeeh/lapeeh/edit/main/doc/:path",
      text: "Edit page on GitHub",
    },
  },
});
