# Audit optimasi UI — 17 Oktober 2026

## Batas pekerjaan

Desain pengguna tetap menjadi baseline. Tidak mengganti framework, menyusun ulang route, mengganti konten demo, atau mengimplementasikan backend/transaksi. BoardUI skill dan MCP dipakai untuk memeriksa pola komponen; sidebar, tabel, kalender, Settings, kartu, dan keranjang yang sudah ada tetap digunakan. Penyesuaian layout dibatasi untuk responsive dan bug.

## Temuan dan perbaikan

| Temuan | Perbaikan |
|---|---|
| Sidebar memakai anchor yang memuat ulang dokumen ketika berpindah menu | TanStack Router `Link`; preload intent yang sudah dikonfigurasi tetap digunakan |
| Settings ikut dimuat saat membuka dashboard/POS | Dynamic import; preload saat hover/focus tombol Settings; isi dan animasi modal dipertahankan |
| Devtools aktif pada setiap sesi development | Opt-in melalui `VITE_DEVTOOLS=true`; bukan klaim penghematan production karena devtools sebelumnya sudah dibuang oleh build |
| Sidebar desktop serta keranjang 420px membuat katalog POS kehilangan ruang di mobile | Komponen yang sama ditampilkan melalui drawer pada layar kecil; layout desktop tetap |
| Tabel, toolbar filter, dan header chart mendorong lebar halaman | Scroll horizontal dibatasi pada panel tabel; toolbar/header dapat wrap; kartu reflow sesuai breakpoint |
| Input aksesibilitas tersembunyi di tabel berpotensi menambah scroll halaman | Scroll container tabel menjadi positioned containing block (`relative`) |
| Pencarian kosong pada Produk/Kategori/Promo memakai baris dengan jumlah sel tidak sesuai; muncul recovery error React | `renderEmptyState` React Aria dan deklarasi `isRowHeader` pada kolom identitas |
| Kalender dua bulan terlalu lebar untuk mobile/tablet | Satu bulan di bawah 900px; dua bulan dan shortcut tetap di desktop; footer dapat wrap; trigger diberi label aksesibel |
| Scroll katalog, keranjang dan kolom board memotong tepi konten | Progressive blur/fade sesuai aturan BoardUI; diperbarui melalui CSS variable tanpa rerender konten |
| Latar katalog POS memakai warna literal dan tidak mengikuti dark mode | Semantic token dengan warna light yang sama; fade memakai token permukaan yang sama |

## Verifikasi lokal

- Chromium headless, viewport 360, 390, 768, 820, 1024, dan 1440 px, tinggi 900 px.
- Delapan tampilan: Dashboard, Penjualan, Monitor, Produk, Kategori, Promo, POS, dan Pesanan Tersimpan. Seluruh 48 kombinasi menghasilkan overflow dokumen 0px; tabel/board tetap boleh scroll di dalam panelnya.
- Login juga diperiksa pada 360, 768, dan 1440 px: overflow dokumen 0px.
- Interaksi lolos: navigasi drawer, pencarian kosong tiga tabel, kalender pada mobile/tablet/desktop, pemilihan dan Apply rentang tanggal pada 360px, tambah produk dan buka/tutup keranjang melalui Escape, Settings setelah lazy load, scroll fade/reset dalam mode gelap.
- Tidak ada page error pada rangkaian regresi interaksi final. Screenshot desktop sebelum/sesudah dibandingkan secara visual, bukan klaim pixel-identical atau audit seluruh state aplikasi.
- `npx tsc --noEmit`, `npm run build`, dan `git diff --check` lolos. Build masih menampilkan warning sourcemap CSS nonfatal.
- Package/lockfile, auth, router config, generated route tree, dan route POS pengguna tidak diubah dalam optimasi ini. Pengujian Playwright dijalankan terisolasi di direktori sementara, bukan menambah dependency project atau mengklaim sudah ada test suite permanen.

## Pengukuran

| Pemeriksaan | Sebelum | Sesudah |
|---|---:|---:|
| Request dokumen saat Dashboard → Penjualan | 1 | 0, termasuk production preview |
| Durasi navigasi contoh lokal development | 214ms | 115ms |
| JavaScript awal Dashboard production, decoded/uncompressed | 1.079.612 byte | 824.782 byte (turun sekitar 24%) |
| Overflow Dashboard pada 390px | 612px | 0px |
| Overflow Produk pada 390px | 757px | 0px |
| Overflow Kategori pada 390px | 576px | 0px |

Angka navigasi merupakan sampel lokal, bukan benchmark median atau jaminan server production. Ukuran JavaScript berasal dari resource yang dimuat browser pada build sebelum/sesudah, bukan penjumlahan ukuran seluruh chunk, bukan byte gzip jaringan. Development memuat modul/debug code yang berbeda dari production; jangan membandingkan ukurannya langsung.

## SSR atau SPA?

Rekomendasi saat ini: **tetap TanStack Start dengan client rendering dan client-side navigation**. Root route sebelumnya sudah `ssr: false` dan tidak diubah. Jangan mengganti ke React/Vite standalone, dan jangan menganggap konfigurasi ini otomatis static SPA deployment: adapter/server entry Start tetap dibangun.

SSR selektif dapat dipertimbangkan untuk initial load setelah ada pengukuran production dan rancangan auth/data server yang siap. Itu keputusan lanjutan, bukan obat untuk anchor reload atau overflow layout. SSR anak juga tidak bisa diaktifkan di bawah parent yang menonaktifkannya tanpa meninjau konfigurasi parent. Rujukan: [Selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr), [Router preloading](https://tanstack.com/router/latest/docs/framework/react/guide/preloading).

## Belum menjadi klaim selesai

- Belum deployment atau mengukur perangkat fisik, Safari/iOS, jaringan toko, CPU mobile lemah, dan data Supabase nyata.
- Placeholder seperti pembayaran, simpan order, CRUD, ekspor, dan auth guard bukan otomatis berfungsi karena UI sudah responsif. Logika tersebut tidak ditambahkan dalam pekerjaan optimasi ini.
- Audit ini bukan sertifikasi aksesibilitas/dark mode seluruh komponen dan seluruh state. Pengujian unit, finansial, konkurensi, RLS, serta integrasi backend tetap harus dilakukan sesuai PRD.

Backup dan artefak audit sementara: `/private/tmp/alco-ui-audit.W164ZN/` (dapat dihapus otomatis oleh sistem). Backup `before-optimization.tgz` menyimpan kondisi source sebelum pekerjaan optimasi ini; bukan pengganti version control.
