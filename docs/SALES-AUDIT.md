# Audit Penjualan

Tanggal: 17 Oktober 2026. Lingkup: perbaikan frontend demo; bukan ledger, autentikasi, atau transaksi server.

## Baseline dan acuan

PRD §5.4, §6–8, Catatan Development; TECH-STACK §6–7; pedoman tabel/detail/responsive pada UI-UX Guidelines. Referensi HTML `reference-dashboard.html` dan `reference-finance.html` diperiksa untuk pola tabel/filter/KPI, serta `reference-boardui-design-task.html` untuk batas bahasa visual shell. Susunan empat KPI, deretan kartu produk, tabel, warna/chip/icon dan navigasi pengguna dipertahankan, bukan diganti template.

Skill BoardUI dan MCP `get_usage_examples`/`get_component` dipakai untuk `data-table` dan `date-range-picker`. Registry Data Table adalah contoh aplikasi berbasis API TanStack Table v8 (`useReactTable`), sedangkan workspace sudah memakai v9 yang tidak mengekspor API itu. Tidak menurunkan versi library atau menyalin lookalike: tabel yang sudah terpasang tetap dikomposisi dari primitive BoardUI Free `Table`, `Input`, `Select`, `Button`, `Chip`, `Pagination`. Detail memakai `ResponsiveDrawer` dan `SoftScroll` yang sudah terpasang.

## Perbaikan

| Sebelumnya | Sekarang |
|---|---|
| Pencarian 153px tanpa logic | Lebar 224px desktop, full-width mobile; nomor/label/kasir/produk, kata pencarian digabung |
| Delapan baris tetap, 660 transaksi dan 55 halaman rekaan | Pagination 20 hasil/halaman, hitungan dan penjepitan halaman dari hasil filter |
| Filter periode/KPI/rekap tidak berhubungan | Satu scope kalender WIB mengendalikan seluruh widget dan ekspor |
| Jumlah item = banyak baris produk | Jumlah unit; ringkasan produk dan rincian harga/diskon snapshot |
| KPI omzet/laba/order tidak konsisten | Pendapatan bersih, order dibayar, unit bersih, refund; pembanding kalender dihitung, bukan persen tetap |
| Tidak ada kasir/label/status/refund | Kolom/rincian sesuai PRD; Tunai/QRIS Manual/Transfer Manual; unpaid/cancelled terpisah |
| Portal modal tanpa focus trap/Escape | Modal terpusat dengan fokus terkelola, URL detail, keyboard/Escape, scroll tepi lembut |
| Aksi cetak/unduh kosong | Print browser bertanda contoh; CSV aman dan XLSX asli dengan Ringkasan/Transaksi/Rekap Produk |
| Belum ada state kosong/error/offline | Hasil filter kosong/reset, storage rusak/retry, write failure, dan offline lock untuk refund |

Dashboard default **Bulan Ini** menurut PRD §6; nantinya pemakaian Penjualan di POS default **Hari Ini**. Preset Senin–Minggu, kalender bulan/tahun; custom tanggal inklusif maksimal 366 hari untuk demo. Filter/search/page/detail bertahan lewat URL bertipe; input URL yang tidak valid dinormalisasi. Tidak menambah route utama atau mengubah framework TanStack Start.

Arahan tampilan terakhir: baris tanggal/status Supabase, `Muat ulang contoh`, dan CTA `Lihat belum dibayar` dihapus. Filter dipersingkat menjadi `Metode`, `Jenis`, `Lunas + Refund`, `Kasir`, `Produk` tanpa mengubah scope. Unpaid tetap tersedia dari pilihan status; retry hanya muncul ketika error nyata. Label `Contoh Data` dipertahankan agar fixture tidak disangka transaksi toko.

Penyederhanaan lanjutan 18 Oktober: paragraf pembanding/unit/refund di bawah KPI dihapus; semua filter dan search berbagi satu kelompok toolbar (sejajar desktop, reflow mobile); reset berupa `IconButton` dengan aria-label/title. Menu memakai `Detail`/`Cetak`. `SalesOrderModal` menggantikan drawer: komposisi React Aria Dialog/Modal yang sudah menjadi fondasi komponen Free lokal, semantic token BoardUI dan `SoftScroll`; katalog MCP tidak menyediakan modal detail generik. Tidak memasang template Settings yang tidak relevan atau menambah library. Modal tanpa animasi/backdrop blur berat; tidak mengklaim bahwa modal selalu lebih cepat daripada drawer tanpa pengukuran.

Tanggal penjualan berasal dari pembayaran, bukan pembuatan order. Refund penuh merupakan event terpisah pada tanggal pengembalian; transaksi yang sudah berstatus refunded tetap berkontribusi pada tanggal bayar aslinya. Unit/nilai periode bisa negatif. Rekap menyatukan ID produk, bukan nama snapshot; alokasi diskon per item menjumlah tepat ke total. Pilihan produk mencocokkan pesanan yang mengandung produk tersebut, **bukan** subtotal item-only; UI dan ekspor menjelaskan scope ini.

Unpaid adalah snapshot semua tanggal yang dapat ditinjau admin, dengan label tanggal dibuat; tidak masuk ringkasan/rekap. Filter status default hanya lunas/dikembalikan. Pembanding KPI memakai filter yang sama pada kalender sebelumnya; periode berjalan dibandingkan kalender penuh dengan catatan eksplisit. Refund meningkat memakai warna peringatan, bukan dianggap peningkatan pendapatan.

Refund contoh hanya pada order paid, alasan wajib, konfirmasi melalui metode pembayaran asal, tanggal aksi, dan ID order sama. Cek status ulang sebelum menulis localStorage; hasil dibaca ulang setelah write berhasil. Double submit/refund yang sudah teramati ditolak. Storage tidak atomik antar-tab; ini **bukan** idempotensi, row lock, RBAC, atau pengembalian dana nyata.

## Ekspor dan performa

- Semua hasil terfilter, bukan 20 baris halaman; batas 50.000 hasil. CSV transaksi dan rekap terpisah, `.xlsx` berisi tiga sheet lengkap dengan filter/periode/sumber contoh.
- CSV BOM/CRLF, koma/kutip/newline di-escape, teks formula diberi apostrof; nilai uang negatif tetap numerik. XLSX memberikan string plain (bukan objek formula), angka asli, freeze header, autofilter, format IDR.
- ExcelJS 4.4.0 dimuat melalui `import()` hanya saat ekspor. Workbook/penulisan mengikuti [dokumentasi resmi ExcelJS](https://github.com/exceljs/exceljs#writing-xlsx). Tidak menambahkan Excel ke initial-load bundle atau mengganti SSR/SPA/framework.
- Pemasangan awal menemukan advisory `uuid` transitive; override sempit 11.1.1 diuji roundtrip XLSX. `npm install --ignore-scripts` terakhir melaporkan 0 vulnerabilities; bukan audit keamanan aplikasi menyeluruh. Tidak menjalankan auto-fix downgrade ExcelJS atau upgrade framework.
- Fixture agregasi browser hanya untuk demo. Produksi harus memakai report SQL/RPC dan pagination server; jangan memuat seluruh transaksi nyata ke React.

## Verifikasi berulang

```sh
node --experimental-strip-types --test src/features/sales/sales-demo.test.ts
npx tsc --noEmit
npm run build
# Dev/preview server sudah berjalan; Playwright opsional/terisolasi.
SALES_BASE_URL=http://127.0.0.1:3002 SALES_PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/test-sales-ui.mjs
```

9 unit test memeriksa WIB/URL, konsistensi seluruh preset dan ekspor, refund lintas periode/negatif, pencarian/filter/page, unpaid lintas hari, identitas produk/diskon, validasi refund/storage, formula CSV, dan roundtrip XLSX lengkap/numerik. Run gabungan 41 unit test (termasuk Promo, Produk/Kategori, POS, Monitor) lolos, serta TypeScript dan build production lolos. Warning sourcemap CSS nonfatal yang sudah ada sebelumnya tetap muncul.

Browser Penjualan: seluruh 28 kombinasi ukuran/periode 360–1440px lolos tanpa overflow dokumen/KPI atau runtime page error. Search/pagination/reset/refresh, filter gabungan, posisi sidebar, detail URL/Escape, print bertanda contoh, refund/validasi/persistensi, offline, periode kosong/future, unpaid semua tanggal, dark mode, korupsi storage dan ekspor lengkap diuji. Tambahan regresi mobile memastikan reset hasil kosong mengembalikan scroll horizontal ke kolom pertama dan pengetikan cepat tidak kehilangan karakter. Aksi search browser lokal terukur sekitar 132–210ms pada beberapa run development; mencakup automation/URL/render, bukan jaminan latency server/perangkat produksi. Screenshot ditulis runner ke direktori sementara.

Run preview production final juga lolos seluruh suite, termasuk label ringkas, tidak adanya CTA/baris yang dihapus, CSV/XLSX lengkap, serta `QuotaExceededError` yang diinjeksi: alasan refund tetap ada, storage tidak berubah, dan tidak ada sukses palsu. Aksi search pada run production lokal sekitar 72ms (angka indikatif, bukan benchmark server). Penantian scroll selesai diperlukan sebelum membuka popover dalam automation; kegagalan awal pada langkah unduh berasal dari popover tertutup saat auto-scroll, bukan kegagalan workbook. Screenshot production: direktori sementara `alco-sales-kiFrII` yang dicetak runner.

## Batas integrasi

Seluruh data berlabel **Contoh Data · Belum terhubung Supabase**. Fixture Penjualan memakai produk baseline sendiri dan belum terhubung fixture Monitor, POS atau master katalog/promo; tidak mengklaim angka lintas modul sudah identik. Key refund contoh `alco-sales-refunds-demo-v1`, gunakan informasi contoh saja. Draft/master paid tidak diedit oleh refund demo; popup print bertanda `BUKAN BUKTI PEMBAYARAN`.

Masih diperlukan: query/RPC role/store-scoped yang sama untuk POS/Dashboard/ekspor; auth admin/cashier dan RLS; source of truth snapshot/kuota/harga/HPP; transaksi refund+kas+audit atomik; idempotensi/timeout/concurrency; server pagination/cursor ekspor; sinkronisasi header POS hari ini; identitas toko/kasir/struk nyata. UX online-only produksi tidak digantikan penyimpanan browser/offline sync. Penyelesaian frontend ini tidak berarti seluruh MVP tinggal mengganti koneksi database.
