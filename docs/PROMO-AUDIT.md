# Audit menu Promo

Tanggal: 17 Oktober 2026. Lingkup: frontend demo lokal, bukan implementasi Supabase atau otorisasi produksi.

## Baseline dan acuan

Susunan desktop pengguna dipertahankan: breadcrumb/judul, tombol Tambah Promo, empat KPI BoardUI, lalu tabel dengan filter dan pencarian. Acuan density, hierarchy, filter, dan tabel diperiksa pada `reference-marketing.html`, `reference-dashboard.html`, dan `reference-finance.html`; aturan PRD §6 dan §13 menjadi prioritas. Skill BoardUI dibaca dan MCP `get_usage_examples` dipakai untuk `data-table` serta `input`. Komposisi memakai primitive Free yang telah terpasang: Input, Select, Switch, Button, IconButton, Chip, Table, Pagination; drawer/SoftScroll lokal yang sudah ada dipakai kembali.

## Perbaikan

- Pencarian nama/kode diperlebar menjadi 256 px di tablet/desktop, full-width di mobile. Filter jenis/status memperlihatkan nilai yang benar, bukan label statis. Search, jenis, status, dan halaman tersimpan di query URL bertipe, dinormalisasi bila invalid, dan bertahan saat refresh.
- Pagination kini benar-benar memotong hasil (5 per halaman); jumlah halaman berasal dari hasil filter, bukan angka tetap 5. Filter/search kembali ke halaman pertama; jumlah/halaman terjepit aman bila data berkurang. Empty state menyediakan Reset Filter.
- Reset/filter/search mengembalikan scroll horizontal tabel ke awal agar kolom nama/kode tidak tersembunyi setelah browser menggulir untuk memfokuskan tombol empty state. Bug direproduksi mobile 390 px (`scrollLeft=499`, kolom awal di luar layar); guard hanya mengubah panel tabel saat filter berubah, bukan scroll halaman/manual biasa.
- Status berasal dari periode WIB, aktif/nonaktif dan kuota: Aktif, Terjadwal, Berakhir, Nonaktif, Kuota Habis. Batas waktu dibaca sampai menit yang ditampilkan, inklusif; status disegarkan saat fokus dan tiap 30 detik. KPI dihitung ulang dari dataset yang sama, tanpa angka pertumbuhan rekaan.
- Tambah, detail, edit, dan nonaktifkan kini memiliki logic nyata **untuk demo lokal**. Drawer tidak meninggalkan halaman dan mempertahankan focus management/Escape serta progressive scroll-edge blur. Perubahan yang belum disimpan meminta konfirmasi buang.
- Nama 2–100 karakter; kode unik case-insensitive, disimpan uppercase 3–30 karakter; persen bilangan bulat 1–100; nominal/minimum/cap rupiah bulat aman; cap opsional positif; tanggal valid dan berakhir setelah mulai; kuota opsional positif dan tidak kurang dari pemakaian. Nilai scientific notation/desimal/negatif/unsafe integer ditolak.
- Pratinjau subtotal Rp50.000 mengikuti minimum belanja dan batas diskon; diskon tidak melebihi subtotal. Simulasi ini tidak mengaku memverifikasi periode/kuota saat checkout.
- Hapus diganti Nonaktifkan dengan konfirmasi; ID/pemakaian tersimpan dan transaksi lunas tidak ditulis ulang. Contoh ongkir/member/BOGO dihapus dari fixture karena bukan domain MVP; diganti promo persen/nominal biasa, bukan menambah engine syarat fiktif.
- Dataset dibaca/ditulis ke key `alco.promo-demo.v1`, envelope versi tervalidasi, maksimal 500 promo. Data rusak tidak ditimpa otomatis. Kegagalan baca/tulis menampilkan error/retry, tidak ada sukses palsu, dan draft tetap ada. Offline menonaktifkan mutasi. Perubahan tab lain menonaktifkan mutasi sampai muat ulang; sebelum menulis juga dibandingkan snapshot storage terakhir.
- Seluruh contoh diberi label Contoh Data/lokal browser; teks sukses hanya menyatakan tersimpan lokal dan belum dikirim server. Tabel boleh bergulir horizontal di panelnya; halaman/drawer tidak overflow mobile.

## Verifikasi

```sh
node --experimental-strip-types --test src/features/promo/promo-demo.test.ts
npx tsc --noEmit
PROMO_BASE_URL=http://127.0.0.1:3002 PROMO_PLAYWRIGHT_MODULE=/private/tmp/alco-ui-audit.W164ZN/node_modules/playwright/index.mjs node scripts/test-promo-ui.mjs
```

Playwright bersifat opsional/terisolasi, bukan dependency produksi. Runner dapat memakai instalasi Playwright lain melalui `PROMO_PLAYWRIGHT_MODULE`; URL default port 3000, override sesuai server yang dipakai.

- 7 unit test lulus: query tidak tepercaya, pergantian hari WIB/status, kode/persen/integer, tanggal tidak valid/tahun baru, edit ID/pemakaian/kuota, pratinjau minimum/cap, serta storage rusak/duplikat/versi.
- Browser pada lebar 360, 390, 768, 820, 1024, 1280, 1440: overflow halaman/drawer, KPI, search, form membuka/menutup. Screenshot mobile390 dan desktop1440 ditinjau; screenshot dark mode juga direkam.
- Search kode, pagination, empty/reset, dropdown jenis/status dan refresh filter; tambah invalid/duplikat/101%, tambah valid/save/reload/edit/nonaktifkan; guard perubahan/Escape; offline; perubahan lintas tab; storage rusak dan retry diuji. Kegagalan tulis diinjeksi melalui `QuotaExceededError`: draft tetap ada, storage tidak berubah, tidak ada klaim sukses, lalu retry memulihkan keadaan. Tidak ada runtime page error pada run yang berhasil.
- `tsc --noEmit` dan `git diff --check` lulus pada pemeriksaan scoped/integrasi terakhir; build final dikelola agent utama agar tidak berbenturan dengan development paralel.

## Batas yang masih diperlukan saat integrasi

Ini bukan backend siap produksi. Dataset Promo ini **belum terhubung ke katalog/promo POS demo** (POS masih memiliki fixture sendiri). Tidak ada klaim kuota produksi, history audit database, SQL transaction/RLS/admin authorization, request idempotency, lintas perangkat, atau server pagination. Compare-before-write dan event storage merupakan guard demo best-effort, bukan lock atomik antar-tab.

Saat integrasi Supabase: RPC admin harus memvalidasi kode unik/store scope, menghitung promo pada checkout atomik dan mengunci kuota, mengikat quote yang disetujui, menerapkan satu promo per order, tidak mereservasi kuota saat simpan unpaid, tidak mengembalikan kuota otomatis setelah refund, dan tidak mengubah snapshot transaksi paid. Ganti fixture lokal dengan query/mutasi tervalidasi, status loading/error riil, serta invalidasi cache POS/Dashboard; uji role dan concurrency di SQL. Jangan memasukkan persistence lokal demo sebagai offline-sync produksi.
