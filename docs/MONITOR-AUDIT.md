# Monitor — kesesuaian PRD dan perbaikan UI

Acuan: PRD §5.5, §7.1–7.3, Catatan Development; UI-UX Guidelines §6.2–6.3; layout chart/card pada `reference-dashboard.html`, gauge/legend pada `reference-marketing.html`, dan rincian pengeluaran pada `reference-finance.html`. Shell, bahasa visual, dan susunan kartu utama dipertahankan; bukan penggantian template/dashboard.

## Yang perlu diperbaiki atau ditambahkan

| Ketentuan PRD | Kekurangan sebelumnya | Implementasi preview sekarang |
|---|---|---|
| Hari/Minggu/Bulan/Tahun/Custom; default Hari Ini | Segmen Weekly aktif tetapi label bulan, data tahunan, dan filter tidak tersambung | Satu state periode mengubah semua widget; minggu Senin–Minggu, kalender WIB, custom rentang inklusif |
| KPI dan chart memakai angka yang sama | Pendapatan KPI Rp56,8jt, grafik menjumlah Rp60,8jt; bar hanya tinggi SVG contoh | Fixture agregat tunggal; total tren, produk, kategori dan KPI direkonsiliasi |
| Informasi laba estimasi dan pembanding KPI | Tooltip definisi belum ada; pertumbuhan statis | Label/tooltip estimasi sesuai PRD; pill naik/turun model lama dikembalikan, dihitung dari report periode kalender sebelumnya, bukan persentase tetap |
| Order dibayar, item bersih, refund | Belum ada ringkasan lengkap | Empat kartu operasional tambahan termasuk unpaid |
| Unpaid semua tanggal | Belum ada | Jumlah/nilai unpaid terpisah; tidak berubah saat filter periode diubah |
| Pengeluaran bahan vs operasional | Belum ada | Rincian terpisah dan penjelasan bahwa bahan tidak dipotong dua kali dari laba |
| Best seller vs kontributor pendapatan | Hanya satu daftar campuran | Tab Unit/Nilai; masing-masing mengurutkan top 5 sesuai metrik dan tie-breaker |
| Jam ramai | Belum ada | Grafik order per jam WIB, headline jam puncak, jumlah order pada jam tersebut |
| Metode pembayaran informatif | Headline `3 metode`; angka legenda tanpa unit/basis | Total pembayaran sebelum refund, jumlah transaksi, tiga metode berlabel tepat, nominal/persentase dan tooltip |
| Chart proporsional dan interaktif | Gauge kategori berupa path tetap; label Rupiah terpotong; tooltip disembunyikan; tinggi chart kolaps pada layout kolom | Gauge data-driven, skala/axis yang terbaca, tooltip nominal lengkap via hover/keyboard, container berukuran definitif dan empty states |

## Komponen

- `MonitorHome`: isi Monitor yang dapat dipakai kembali tanpa shell; route lama tetap memakai `AppLayout` dan tidak diubah menjadi skema routing lain.
- `RevenueChartCard`: BoardUI Free terpasang, diperbaiki tanpa mengganti visual area/garis hijau.
- `OrdersChartCard`: dipasang melalui BoardUI MCP dari registry Free; disesuaikan menjadi seri tunggal agar rounded bars/grey tracks Monitor tetap dipertahankan. Tidak memasang Pro.
- `MonitorPaymentsCard`, `MonitorDistribution`, `MonitorOperations`/`MonitorExpensesCard`, dan chart readout/table: komposisi khusus dari primitive BoardUI yang tersedia, karena registry tidak memiliki kartu metode pembayaran Free yang sesuai. Gauge Pro tidak disalin.
- Daftar produk/kategori tetap memakai pola kartu lama. Tinggi minimum kartu breakdown disesuaikan agar lima produk/legenda tidak terpotong atau menabrak baris berikutnya.

## Data dan batas integrasi

Semua angka berlabel **Contoh Data**, bukan data toko. `monitor-demo.ts` hanya fixture deterministik untuk menguji UI/kontrak agregat. Tidak menambahkan backend, mengambil transaksi sungguhan, atau memindahkan perhitungan produksi ke browser.

- Penjualan bersih = pembayaran setelah diskon − refund. Kartu pembayaran menjumlah penerimaan **sebelum refund**, sehingga selisihnya dengan pendapatan bersih harus cocok dengan refund yang ditampilkan.
- AOV memakai nilai order sebelum refund ÷ jumlah order dibayar. Hanya biaya operasional mengurangi estimasi laba bersih; pembelian bahan/kemasan tetap terlihat sebagai pengeluaran.
- Empat KPI membandingkan nilai metriknya sendiri terhadap hari/minggu/bulan/tahun kalender sebelumnya dalam WIB. Periode berjalan dapat belum lengkap; tooltip menyebut tanggal pembanding serta batas data periode ini. Custom memakai interval sebelumnya berdurasi sama. Pembanding nol menghasilkan `—` (kecuali keduanya nol: `0%`); nilai negatif memakai besar absolut pembanding agar arah perubahan tidak terbalik.
- Tren menjumlah tepat ke headline. Hari memakai jam operasional contoh 07.00–21.00; minggu/bulan per tanggal, tahun per bulan. Data tanggal mendatang tidak diisi penjualan palsu. Rentang custom preview dibatasi 366 hari.
- Ranking mengikuti unit/nilai bersih; no-data bukan produk/ranking dummy. Unpaid merupakan snapshot saat ini, bukan bagian dari total penjualan.

Yang masih perlu saat integrasi: report RPC Supabase agregat yang sama untuk POS/Dashboard; guard admin/cashier; pemakaian Monitor di menu POS; loading/error/retry/offline dan waktu sinkronisasi nyata; data refund/koreksi lintas periode dan nilai negatif; verifikasi akses cashier tanpa HPP mentah. Hasil audit UI bukan klaim bahwa poin-poin backend tersebut sudah selesai.

Nilai penjualan negatif tetap boleh digambar di sumbu negatif. Bila unit bersih kategori negatif akibat refund lintas periode, UI tidak mengubahnya menjadi nol atau persentase pie; rincian unit sebenarnya ditampilkan dengan penjelasan. Persistensi filter ke URL dan pemulihan filter setelah refresh masih perlu dihubungkan bersama menu POS, bukan dianggap selesai oleh state preview lokal.

## Pengujian yang dapat diulang

```bash
# Node dengan dukungan TypeScript stripping (misalnya Node 22.18+)
node --experimental-strip-types --test src/features/monitor/monitor-demo.test.ts
node --experimental-strip-types --test src/features/monitor/monitor-comparison.test.ts
npx tsc --noEmit
npm run build

# Jalankan dev server terlebih dahulu; runner browser memerlukan Playwright.
node scripts/test-monitor-ui.mjs
```

Playwright tidak ditambahkan ke dependency produksi. Bila terpasang secara terisolasi, berikan `MONITOR_PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs`. Untuk preview production gunakan `MONITOR_BASE_URL=http://127.0.0.1:3001`. Screenshot ditulis ke direktori sementara dan lokasinya dicetak runner.

Unit test memeriksa batas kalender, konsistensi agregat/chart, AOV/laba/pengeluaran, refund, unpaid tetap, pembagian integer, dan periode kosong. Browser memeriksa 28 kombinasi (empat periode × tujuh viewport 360–1440px), geometri SVG, overflow, hover/keyboard tooltip, ranking, dark mode, dan custom tanggal kosong. Bukan pengujian perangkat fisik atau audit seluruh aplikasi.

Hasil lokal: 10 unit test Monitor lolos; seluruh 28 kombinasi viewport/periode dan interaksi browser lolos tanpa page error atau warning chart berukuran nol; TypeScript dan build production TanStack Start lolos. Build masih memiliki warning sourcemap CSS nonfatal yang juga ada sebelumnya.

Penyempurnaan berikutnya menambahkan 5 unit test pembanding kalender (termasuk pergantian tahun, Februari kabisat, nol/negatif dan tiap metrik). Baris pembayaran memakai slot ikon tetap, gap 12px, grid label/nominal, padding lebih lega, serta tinggi minimum 56px. Bug scroll sidebar direproduksi: wheel di atas panel sebelumnya meneruskan scroll halaman 600px. Hook wheel non-passive dibatasi pada sidebar desktop; tidak memasang scroll lock global dan tidak menghalangi zoom, keyboard, atau sentuhan mobile.

Tindak lanjut scroll konten: `AppLayout` kini dibatasi setinggi viewport dan memakai `SoftScroll` yang sudah terpasang untuk panel konten utama. Dokumen halaman tidak ikut menggulir; sidebar bukan lagi bergantung pada `sticky`. Regresi browser memeriksa posisi sidebar tetap sama saat wheel di konten serta saat konten mencapai bagian bawah pada tinggi layar 520px dan 900px, dokumen tetap pada scroll 0, dan chart/tooltip tetap berfungsi pada seluruh 28 kombinasi viewport/periode. Progressive blur/fade di tepi atas mengikuti token permukaan shell, bukan warna literal.
