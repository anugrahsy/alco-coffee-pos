# Coffee Shop POS — Product Requirements Document (PRD)

> **Versi:** 1.1 — POS operasional dan Dashboard audit  
> **Tanggal:** 15 Oktober 2026  
> **Status:** Acuan implementasi MVP; menggantikan versi 1.0  
> **Bahasa:** Indonesia · **Zona waktu:** `Asia/Jakarta` (WIB) · **Mata uang:** IDR  
> **Dokumen terkait:** [TECH-STACK.md](./TECH-STACK.md) · [UI-UX-GUIDELINES.md](./UI-UX-GUIDELINES.md)

## 0. Cara menggunakan dokumen ini

- Desainer membaca PRD dan UI/UX Guidelines; implementer membaca ketiga dokumen.
- Ada tepat **dua role: `admin` dan `cashier`**, serta **dua halaman utama: `/pos` dan `/dashboard`**. Login dan state sistem adalah pendukung.
- Menu, tab, drawer, dan modal di dalam halaman utama tidak menjadi halaman aplikasi baru.
- Prioritas: transaksi benar, akses aman, lalu kemudahan operasional. Hindari alur akuntansi yang membebani kasir.
- Fitur MVP di bawah wajib ada; fitur P1 tidak boleh menjadi prasyarat transaksi.
- Angka contoh hanya untuk desain/seed pengembangan dan harus berlabel `Contoh Data`.

## 1. Ringkasan dan batas produk

Aplikasi web untuk satu coffee shop dengan sekitar 40 produk dan 1–3 kasir. Kasir dapat melayani pelanggan yang langsung membayar atau menyimpan pesanan untuk dibayar setelah nongkrong, mencatat uang masuk/keluar, serta memantau performa toko. Admin memakai POS yang sama dan Dashboard yang lebih lengkap untuk pengelolaan dan audit bulanan.

**MVP:** katalog, keranjang, promo sederhana, simpan order, pembayaran, struk browser, daftar penjualan, rekap jumlah produk, monitor analitik POS, pemasukan/pengeluaran, Dashboard admin, master data, refund penuh sederhana, serta ekspor CSV dan Excel `.xlsx`.

**Batas yang dipertahankan:** satu outlet, online-only, tunai/QRIS manual/transfer manual, satu metode pembayaran per order, HPP estimasi per produk. Tidak ada akun pelanggan.

**Di luar MVP:** inventory/resep otomatis, supplier/purchase order, akuntansi double-entry, pajak otomatis, hutang-piutang formal, split bill/cicilan, payment gateway, pemesanan pelanggan online, printer ESC/POS, offline sync, multi-outlet, partial refund, dan penutupan buku bulanan dengan approval berlapis. Buka/tutup shift serta rekonsiliasi laci merupakan P1, bukan syarat kasir menyimpan atau membayar order.

## 2. Role dan hak akses

### 2.1 Dua role

- **Admin:** pengelola/pemilik usaha. Bisa mengakses POS dan Dashboard, mengelola produk/HPP/promo/pengguna, melihat seluruh keuangan, mengoreksi catatan, dan mengunduh laporan audit.
- **Cashier:** akses hanya ke POS beserta seluruh menu operasionalnya. Bisa melihat penjualan dan analitik toko, termasuk estimasi laba kotor dan laba bersih. Tidak terbatas pada pesanan yang dibuat sendiri agar pergantian kasir tetap lancar.

Pemilik usaha memakai role `admin`; tidak ada role atau permission khusus `owner`.

### 2.2 Matriks akses

| Aksi | Admin | Cashier |
|---|:---:|:---:|
| Halaman POS dan semua menu operasionalnya | ✓ | ✓ |
| Halaman Dashboard dan semua menu audit/pengelolaannya | ✓ | — |
| Buat, simpan, ubah, batalkan order belum dibayar | ✓ | ✓ |
| Lihat dan bayar order tersimpan dari kasir lain | ✓ | ✓ |
| Lihat seluruh penjualan toko di POS | ✓ | ✓ |
| Lihat periode hari/minggu/bulan/tahun dan monitor analitik POS | ✓ | ✓ |
| Lihat estimasi laba kotor/bersih agregat di POS | ✓ | ✓ |
| Input pemasukan dan pengeluaran hari ini dari POS | ✓ | ✓ |
| Lihat daftar pemasukan/pengeluaran toko di POS | ✓ | ✓ |
| Koreksi/batalkan catatan keuangan yang sudah disimpan | ✓, alasan wajib | — |
| Refund penuh order dibayar | ✓ | — |
| Kelola produk, kategori, HPP, promo | ✓ | — |
| Ekspor penjualan/rekap produk dari POS | ✓ | ✓ |
| Buku kas, rincian HPP/margin produk, laporan audit dan ekspor lengkap | ✓ | — |
| Pengaturan toko/pengguna dan input tanggal lampau | ✓ | — |
| Profil sendiri, ganti password, keluar | ✓ | ✓ |

Cashier memperoleh angka laba agregat lewat report yang diizinkan; tidak perlu mendapat akses tabel HPP mentah atau rincian margin produk. Hak akses ditegakkan di server/RLS/RPC, termasuk ekspor, bukan hanya lewat menu tersembunyi.

## 3. Dua halaman utama dan navigasi

| Route | Fungsi | Akses |
|---|---|---|
| `/login` | Autentikasi pendukung | Publik |
| `/` | Redirect sesuai role | Admin → `/dashboard`; cashier → `/pos` |
| `/pos` | Operasional kasir dan monitor toko | Admin, cashier |
| `/dashboard` | Pengelolaan dan audit lebih lengkap | Admin |

**Menu internal POS:** `Kasir`, `Tersimpan`, `Penjualan`, `Monitor`, `Pengeluaran`, `Pemasukan`. Profil/logout ada pada menu akun. Admin mendapat tombol `Buka Dashboard`; cashier tidak.

**Menu internal Dashboard:** `Ringkasan`, `Penjualan`, `Keuangan`, `Produk & Kategori`, `Promo`, `Laporan`, `Pengaturan`. Detail/CRUD memakai panel atau modal pada halaman ini. `Keuangan` memiliki tab laba rugi, pengeluaran, pemasukan, dan buku kas. Pengguna dikelola dari `Pengaturan`.

State navigasi dapat memakai query string, misalnya `/pos?menu=tersimpan&order=...`, `/pos?menu=monitor&period=month`, `/dashboard?menu=keuangan&tab=pengeluaran`. Jangan membuat route mandiri `/orders`, `/products`, `/finance/*`, `/analytics/*`, `/reports`, atau `/shifts` untuk MVP ini.

Session/profile diperiksa sebelum menampilkan konten. Cashier yang membuka `/dashboard` diarahkan ke `/pos` dengan pesan akses terbatas; API admin tetap menolak akses. Refresh mempertahankan menu/filter/detail yang valid. Mengubah menu tidak membuang keranjang aktif.

## 4. Login dan standar interaksi

- Login email/password, tanpa registrasi publik; footer `Hubungi admin untuk akses akun`.
- Admin → Dashboard, cashier → POS. User nonaktif atau tanpa profile aktif ditolak.
- Logout membersihkan cache data dan keranjang lokal. Tidak menyimpan password/token pada log.
- Semua daftar/form menyediakan loading, kosong, hasil filter kosong, error/retry, sukses, akses ditolak, dan offline. Sukses hanya setelah server mengonfirmasi.
- Uang disimpan sebagai rupiah bulat; UI `Rp18.000`. Waktu database UTC, seluruh tanggal bisnis WIB.
- Daftar besar memakai pencarian/filter/pagination server-side. Ekspor memuat seluruh hasil sesuai filter.
- Saat offline, simpan/bayar/input uang dinonaktifkan. Jika request timeout, cek hasil request yang sama sebelum mencoba lagi agar tidak ganda.

## 5. Halaman POS

### 5.1 Menu Kasir

**Layout:** katalog kiri dan keranjang kanan pada desktop/tablet landscape. Mobile memakai katalog dan tombol keranjang yang membuka sheet. Header menampilkan nama toko, kasir, status koneksi, serta **Pendapatan Hari Ini** dengan tanggal WIB dan waktu pembaruan.

**Katalog:** cari produk, filter kategori, nama/harga/foto opsional, badge `Habis`. Produk nonaktif tidak ditawarkan. Tambah produk berulang menaikkan jumlah.

**Keranjang:** nama produk, jumlah +/−, hapus item, harga, subtotal, catatan item/order, nama pelanggan atau nomor meja opsional, promo, diskon, total. Salah satu identitas pelanggan/meja atau label pesanan wajib diisi ketika menyimpan order agar mudah ditemukan. Default biaya layanan/pajak otomatis = 0.

**Dua aksi jelas:** `Simpan Order` dan `Bayar Sekarang`.

### 5.2 Simpan order dan menu Tersimpan

Fitur ini **wajib dalam MVP**, bukan draft opsional. Contoh: pelanggan memesan dua kopi, nongkrong, lalu menambah snack dan membayar saat pulang.

1. Isi item dan identitas singkat → klik `Simpan Order`.
2. Server menyimpan order berstatus `unpaid` / label **Belum Dibayar**, dengan nomor order, pembuat, waktu, item, dan total. Belum ada payment atau uang masuk.
3. Kosongkan keranjang setelah server sukses; badge `Tersimpan (n)` diperbarui.
4. Menu `Tersimpan` menampilkan **seluruh order belum dibayar**, termasuk dari hari sebelumnya, dengan label pelanggan/meja, umur pesanan, waktu, ringkasan item, total, dan kasir pembuat. Order lama diberi badge `Dari hari sebelumnya`.
5. Aksi: `Buka/Ubah`, `Bayar`, `Batalkan`. Ubah boleh menambah/mengurangi item, catatan, dan identitas. Pembatalan memerlukan alasan, tanpa efek kas/penjualan.
6. Saat pelanggan siap membayar, buka order yang sama → cek tagihan → konfirmasi pembayaran → berubah menjadi `paid`. Jangan membuat order baru untuk pembayaran order tersimpan.

**Aturan sederhana tetapi aman:**

- Order tersimpan boleh lintas hari dan lintas kasir; tidak otomatis dibatalkan ketika logout atau berganti hari.
- Harga item yang sudah disimpan tetap memakai harga saat disimpan. Tambahan item memakai harga saat ditambahkan. Snapshot HPP diambil saat item pertama kali disimpan/ditambahkan; perubahan master tidak mengubah item lama. Perubahan jumlah memakai harga/HPP snapshot baris yang sama.
- Produk yang sudah dipesan tetap dapat dibayar meskipun kemudian nonaktif/habis; menambah produk baru tetap mengikuti ketersediaan terkini.
- Promo ditinjau ulang saat bayar dan kuota baru dipakai setelah pembayaran sukses. Jika promo tidak berlaku atau total berubah, kasir harus melihat dan menyetujui tagihan terbaru sebelum konfirmasi.
- Dua perangkat tidak boleh saling menimpa perubahan: jika versi order berubah, tampilkan `Pesanan sudah diperbarui. Muat ulang untuk melanjutkan.`
- Hanya order `unpaid` yang dapat diubah/dibatalkan. Bayar dua kali atau bayar bersamaan dengan pembatalan harus dicegah di server.
- Unpaid tidak masuk pendapatan, HPP penjualan, laba, best seller, atau rekap produk terjual. Nilai tagihan unpaid ditampilkan terpisah.

### 5.3 Pembayaran dan struk

- Metode: `Tunai`, `QRIS Manual`, `Transfer Manual`.
- Tunai: uang diterima ≥ tagihan, kembalian otomatis. Tagihan Rp70.000 dibayar Rp100.000 menambah kas Rp70.000, kembalian Rp30.000.
- QRIS/transfer: kasir mengonfirmasi dana telah diterima. Tidak ada verifikasi otomatis.
- Server menghitung tagihan; frontend tidak boleh menentukan harga/total final secara sepihak. Konfirmasi terikat ke versi/tagihan yang dilihat kasir; jika berbeda, minta persetujuan ulang.
- Pembayaran langsung membuat order paid; pembayaran tersimpan memperbarui order unpaid yang sama. Keduanya menyimpan item, payment, arus uang, dan jejak aktivitas dalam satu transaksi database.
- Disable double submit dan gunakan request key yang sama untuk retry. Setelah timeout, cek hasil sebelum membayar ulang.
- Sukses menampilkan nomor order, total, metode, kembalian, tombol `Cetak Struk` dan `Order Baru`.
- Struk HTML print-friendly berisi identitas toko, nomor/waktu bayar, item/jumlah/harga, diskon, total, metode, kasir. Order unpaid hanya dapat dicetak sebagai **Tagihan — Belum Dibayar**, bukan bukti lunas.

### 5.4 Menu Penjualan dan rekap produk

Default **Hari Ini**, tersedia `Minggu Ini`, `Bulan Ini`, `Tahun Ini`, dan rentang tanggal. Data mencakup seluruh toko, bukan hanya kasir login.

**Ringkasan:** pendapatan penjualan, jumlah order dibayar, jumlah item terjual, dan refund periode. Header POS tetap menampilkan pendapatan **hari ini** meskipun filter daftar diganti.

**Daftar transaksi:** waktu bayar WIB, nomor order, label pelanggan/meja bila ada, kasir penerima pembayaran, ringkasan item, jumlah item, total, metode, status `Lunas`/`Dikembalikan`, tombol detail/cetak struk. Detail tampil sebagai drawer/modal; tidak pindah halaman. Order unpaid berada di `Tersimpan`.

**Rekap produk hari ini:** kartu sederhana seperti **Kopi Susu Gula Aren · 6 terjual**, **Americano · 9 terjual**. Tampilkan nama produk dan total jumlah unit, bukan jumlah baris order. Ada `Lihat Semua` bila produknya banyak. Pada filter lain, judul berubah mengikuti periode agar tidak menyesatkan. Identitas produk mengikuti ID produk; perubahan nama tidak memecah jumlahnya.

Kasir bisa mengekspor daftar transaksi dan rekap produk CSV/XLSX sesuai filter. Rincian HPP dan buku kas lengkap hanya di Dashboard.

### 5.5 Menu Monitor — analitik pesanan

Ringkasan operasional yang informatif tanpa memenuhi layar kasir dengan semua laporan audit. Default Hari Ini; filter Hari/Minggu/Bulan/Tahun/Custom berlaku ke seluruh widget Monitor.

| Informasi | Tampilan |
|---|---|
| Pendapatan penjualan | Kartu utama, label periode jelas |
| Estimasi laba kotor | Pendapatan penjualan dikurangi HPP item terjual |
| Estimasi laba bersih | Laba kotor dikurangi biaya operasional tercatat |
| Order dibayar dan item terjual | Kartu angka ringkas |
| Tagihan belum dibayar | Jumlah dan total seluruh unpaid saat ini, label `Saat ini — semua tanggal` |
| Pengeluaran periode | Total uang keluar dari input pengeluaran; rincian bahan vs operasional |
| Rata-rata tagihan | Nilai rata-rata order yang dibayar |
| Best seller | Top 5 produk berdasarkan unit terjual |
| Kontributor pendapatan terbesar | Top 5 produk berdasarkan nilai penjualan, dibedakan dari best seller |
| Tren penjualan | Per jam untuk hari, per hari untuk minggu/bulan, per bulan untuk tahun |
| Jam ramai dan metode pembayaran | Grafik ringkas, tooltip angka dan periode |

Label UI laba selalu **Estimasi Laba Kotor** dan **Estimasi Laba Bersih** dengan tooltip `Berdasarkan HPP dan biaya operasional yang dicatat; belum memperhitungkan pajak/biaya yang belum dicatat`. Kasir boleh melihat angka agregat ini. Rincian margin/HPP produk, buku kas, audit perubahan, dan ekspor audit tetap di Dashboard.

Refund dan unpaid harus dibedakan dari penjualan berhasil. Best seller memakai unit bersih setelah refund; jika tidak ada data, tampilkan empty state. Pertumbuhan vs periode sebelumnya boleh ditambahkan setelah metrik inti selesai, tanpa persentase menyesatkan ketika pembanding nol.

### 5.6 Menu Pengeluaran

Contoh utama: susu habis → kasir membeli susu di warung → catat pengeluaran → langsung muncul pada daftar hari ini dan ringkasan keuangan.

**Form:** tanggal (cashier hari ini, otomatis WIB), kategori, nominal > 0, keterangan singkat wajib, sumber dana `Kas Toko` atau `Bank/QRIS Toko`, bukti foto opsional. Sumber dana berarti dana toko yang benar-benar dipakai; pembelian pribadi yang belum diganti tidak dimodelkan sebagai kas toko keluar pada MVP.

**Kategori awal:** Bahan Baku, Kemasan, Gaji, Sewa, Listrik & Air, Internet, Kebersihan, Perbaikan, Transport, Lain-lain. Kategori punya aturan perhitungan bawaan; kasir cukup memilih kategori, tidak mengisi istilah akuntansi.

**Daftar:** default hari ini; filter Hari/Minggu/Bulan/Tahun/Custom, kategori dan sumber dana. Kolom tanggal, kategori, keterangan, nominal, sumber dana, pencatat, status, bukti bila ada. Tampilkan total periode dan detail. Cashier dapat melihat seluruh daftar toko, tetapi tidak mengedit/menghapus catatan yang sudah disimpan. Salah input: minta admin membatalkan dengan alasan, kemudian input pengganti.

**Hindari biaya dihitung dua kali:** pembelian susu/bahan/cup dicatat sebagai uang keluar dan tetap tampil pada total pengeluaran, tetapi tidak dipotong lagi dari laba bersih karena sudah diwakili HPP per porsi. Gaji/sewa/listrik dan biaya operasional lain mengurangi laba bersih. Penjelasan cukup berupa bantuan singkat pada kategori. Rincian teknis ada di §7.

### 5.7 Menu Pemasukan

Input **uang masuk di luar penjualan**, misalnya tambahan modal atau dana operasional. Penjualan yang dibayar sudah tercatat otomatis dan tidak diinput ulang di sini.

**Form:** tanggal (cashier hari ini), kategori `Tambahan Modal`/`Pemasukan Lain`, nominal > 0, keterangan wajib, tujuan `Kas Toko`/`Bank/QRIS Toko`, bukti opsional.

**Daftar:** tanggal, kategori, keterangan, nominal, tujuan dana, pencatat, status; filter periode sama dengan pengeluaran, total periode, dan detail. Cashier boleh melihat seluruh daftar toko. Koreksi oleh admin dengan alasan.

Pemasukan manual menambah saldo buku, bukan pendapatan penjualan atau laba. UI menampilkan bantuan `Pembayaran pesanan tercatat otomatis di Penjualan`.

## 6. Dashboard admin — pengelolaan dan audit

Dashboard memakai angka dasar yang sama dengan POS, dengan detail/filter/ekspor lebih lengkap. Default **Bulan Ini** untuk audit, tetap tersedia Hari/Minggu/Bulan/Tahun/Custom. Admin bisa berpindah ke POS.

| Menu internal | Isi dan aksi |
|---|---|
| Ringkasan | Pendapatan, order, unit, estimasi laba kotor/bersih, pengeluaran, pemasukan nonpenjualan, tagihan unpaid saat ini, tren, best seller, pembanding periode |
| Penjualan | Semua transaksi dan detail item, refund, unpaid lintas hari, filter tanggal/metode/kasir/produk/status; tanggal bayar untuk paid dan tanggal dibuat untuk unpaid, diberi label jelas |
| Keuangan | Tab laba rugi estimasi, daftar pemasukan/pengeluaran, buku kas menurut akun, koreksi catatan dan alasan |
| Produk & Kategori | Nama, kategori, harga jual, HPP estimasi per porsi, foto opsional, aktif/tersedia, tambah/edit/nonaktifkan; kategori dan urutannya |
| Promo | Kode unik, persen/nominal, minimal belanja, batas diskon opsional, periode, batas pakai opsional, status |
| Laporan | Preview, filter, ekspor CSV/XLSX penjualan, detail item, rekap produk/periode, laba rugi, pengeluaran, pemasukan, buku kas dan aktivitas koreksi |
| Pengaturan | Profil toko/struk, akun pengguna dengan role admin/cashier dan status aktif, profil sendiri |

**Audit bulanan:** pilih bulan → cocokkan penjualan per metode, pengeluaran dan pemasukan → lihat estimasi laba dan saldo buku → tinjau order lama belum dibayar, refund, dan koreksi → unduh laporan. Tidak ada mekanisme closing bulanan yang mengunci periode pada MVP.

**Produk/HPP:** harga > 0, HPP ≥ 0; HPP lebih besar dari harga boleh dengan peringatan. Tidak ada hard delete produk yang pernah dipakai. Perubahan master tidak mengubah snapshot order lama. Kategori nonaktif tidak ditawarkan untuk produk baru.

**Promo:** satu promo per order, tidak melebihi subtotal. Server memeriksa periode dan kuota saat pembayaran. Order tersimpan tidak mereservasi kuota; refund tidak mengembalikan kuota otomatis. Edit promo tidak mengubah transaksi paid.

**Pengguna:** tidak ada signup publik. Akun awal dibuat admin melalui Supabase Dashboard/prosedur teknis aman; UI tidak boleh menampilkan tombol undang yang belum berfungsi. Pembuatan akun dari aplikasi bisa P1 dengan server tepercaya. Perubahan role/status harus terlindungi; user tidak bisa menaikkan rolenya sendiri.

### 6.1 Refund penuh yang sederhana

Admin membuka detail order lunas → klik `Refund Penuh` → isi alasan → konfirmasi uang telah dikembalikan → selesai. Nominal otomatis sebesar pembayaran asli dan dikembalikan melalui sumber pembayaran yang sama. Cashier menghubungi admin bila perlu refund.

Sistem mengubah status menjadi `Dikembalikan`, memperbarui ringkasan penjualan/laba/kas, dan menyimpan siapa, kapan, serta alasannya. Tidak ada edit item setelah lunas, partial refund, form jurnal, atau pilihan periode koreksi. Satu order hanya bisa direfund sekali. Kasir tidak perlu memahami proses akuntansi di baliknya; aturan perhitungan internal ada di §7 dan Tech Stack.

## 7. Definisi angka dan periode

### 7.1 Istilah dan rumus bersama

| Label UI / metrik | Definisi |
|---|---|
| Pendapatan Penjualan / `net_sales` | Penjualan sebelum diskon − diskon − refund dalam periode; bukan seluruh uang masuk |
| HPP Penjualan / `cogs` | Jumlah HPP snapshot × unit dibayar, dikurangi HPP item yang direfund pada periode |
| Estimasi Laba Kotor / `gross_profit` | Pendapatan penjualan − HPP penjualan |
| Biaya Operasional / `operating_expenses` | Pengeluaran operasional pada tanggal pencatatan dikurangi pembatalan pada tanggal koreksi dalam periode; tanpa pembelian bahan/kemasan yang sudah diwakili HPP |
| Estimasi Laba Bersih / `estimated_net_profit` | Estimasi laba kotor − biaya operasional; estimasi operasional, belum laba bersih akuntansi/pajak final |
| Total Pengeluaran | Pengeluaran tercatat dikurangi pembatalan yang terjadi dalam periode, termasuk bahan baku/kemasan; rincian pengeluaran dan koreksi tetap terlihat |
| Pemasukan Nonpenjualan | Input manual dikurangi pembatalan dalam periode; menambah uang, tidak menambah penjualan/laba pada MVP |
| Order Dibayar | Jumlah pembayaran berhasil pada periode; jumlah refund ditampilkan terpisah |
| Item Terjual / `net_qty_sold` | Unit dibayar dikurangi unit refund dalam periode |
| Rata-rata Tagihan / `aov` | Total nilai order setelah diskon sebelum refund ÷ jumlah order dibayar; jika kosong tampil 0 |
| Best Seller | Unit bersih terbesar; jika sama, nilai penjualan terbesar lalu nama produk |
| Kontributor Pendapatan | Nilai penjualan produk setelah alokasi diskon/refund terbesar |
| Tagihan Belum Dibayar | Jumlah/nilai semua unpaid saat ini, terpisah dari metrik periode |
| Saldo Buku | Saldo awal akun + uang masuk − uang keluar kumulatif sampai batas akhir yang dipilih |

Diskon order dialokasikan konsisten ke item agar total analitik produk sama dengan total transaksi. POS, Dashboard, dan ekspor memakai rumus/query yang sama.

### 7.2 Tanggal dan histori — aturan internal

- Penjualan dihitung pada **waktu pembayaran**, bukan saat order dibuat/disimpan. Order disimpan 15 Oktober dan dibayar 16 Oktober masuk penjualan 16 Oktober.
- Refund dicatat pada tanggal uang dikembalikan; penjualan lama tetap ada pada tanggal pembayaran aslinya. Sistem mengurangi nilai penjualan, HPP terkait, dan saldo akun pada tanggal refund secara otomatis. Tidak perlu alur koreksi periode di UI.
- Contoh refund lintas bulan: penjualan September tetap tercatat; pengembalian Oktober tampil di Oktober. Angka bersih dapat negatif pada periode tanpa penjualan; jangan dipaksa menjadi nol.
- Kartu produk/best seller berdasarkan peristiwa bayar/refund dalam periode. Unit refund dari penjualan lama dapat membuat unit bersih periode negatif; tampilkan rincian/tooltip yang jelas.
- Koreksi pemasukan/pengeluaran oleh admin membatalkan catatan dengan alasan dan membuat gerak uang balik pada tanggal koreksi, tanpa menghapus catatan asal. Laporan periode lama tetap menyimpan peristiwa asal. Jika beda periode, tampilkan koreksi terpisah pada periode koreksi. Perbaikan nominal memakai catatan pengganti.
- Kategori Bahan Baku/Kemasan menggunakan aturan internal `stock_purchase`; biaya lain `operating_expense`. Jangan meminta kasir memilih treatment.
- Contoh: beli susu Rp100.000 → kas berkurang Rp100.000, total pengeluaran bertambah Rp100.000. Jual 6 kopi dengan HPP Rp5.000 → HPP penjualan Rp30.000. Pembelian susu tidak dipotong lagi sebagai biaya operasional.
- Karena HPP diisi manual dan stok tidak dihitung, laba selalu estimasi. Pemasukan lain default hanya arus uang; pendapatan lain untuk P&L belum dimodelkan.

### 7.3 Preset periode WIB

- **Hari Ini:** 00.00 sampai sebelum 00.00 hari berikutnya WIB.
- **Minggu Ini:** Senin–Minggu, bukan tujuh hari bergulir.
- **Bulan Ini:** tanggal 1 sampai akhir bulan.
- **Tahun Ini:** 1 Januari–31 Desember.
- **Custom:** tanggal awal/akhir inklusif. Query memakai batas awal inklusif dan awal hari setelah tanggal akhir eksklusif.
- Grafik hari per jam; minggu/bulan per hari; tahun per bulan. Rekap/ekspor mendukung pengelompokan harian, mingguan, bulanan, tahunan.

## 8. Laporan dan ekspor

| Laporan | Lokasi / akses | Kolom inti |
|---|---|---|
| Penjualan per transaksi | POS kedua role; Dashboard admin | Waktu bayar, nomor, kasir, metode, subtotal, diskon, total dibayar, refund, status |
| Rekap produk | POS kedua role; Dashboard admin | Produk, unit dibayar/refund/bersih, nilai penjualan |
| Rekap periode | POS kedua role; Dashboard admin | Periode, pendapatan, order, unit, refund, rata-rata tagihan |
| Detail item dan margin/HPP | Dashboard admin | Order, produk snapshot, qty, harga, diskon, HPP, margin |
| Laba rugi estimasi | Dashboard admin | Penjualan, diskon, refund, HPP, laba kotor, biaya operasional, estimasi laba bersih |
| Pengeluaran/pemasukan/buku kas | Dashboard admin | Tanggal, kategori/jenis, sumber/tujuan, nominal, pencatat, status dan koreksi |
| Aktivitas koreksi/refund | Dashboard admin | Referensi, waktu, aktor, aksi, alasan |

Semua laporan menawarkan **CSV UTF-8** dan **Excel `.xlsx`**, memuat seluruh hasil terfilter, bukan hanya halaman tabel. Nominal dalam sel berupa angka; format Rupiah hanya tampilan. CSV harus meng-escape koma/kutip/baris baru dan teks formula; XLSX memakai angka asli dan string aman. Sertakan periode/WIB pada nama file atau sheet ringkasan. Maksimum awal 50.000 baris per ekspor, beri pesan untuk memperkecil rentang bila lebih besar. Jangan memberikan data admin melalui ekspor POS.

## 9. Data dan kebutuhan teknis minimum

Entitas utama: `stores`, `profiles`, `categories`, `products`, `product_costs`, `promotions`, `orders`, `order_items`, `order_item_costs`, `payments`, `refunds`, `expense_categories`, `expenses`, `other_inflows`, `financial_accounts`, `cash_movements`, `operation_requests`, `audit_logs`. `cashier_shifts` ditunda P1.

Status order hanya `unpaid`, `paid`, `cancelled`, `refunded`. Catatan keuangan memiliki status `posted`/`reversed`; gerak uang dan audit tidak dihapus. Detail rancangan di Tech Stack.

- Transaksi dan laporan diproses PostgreSQL/Supabase; browser hanya preview/render.
- Simpan, ubah order, bayar, refund dan input uang aman terhadap double submit/retry serta konflik antar perangkat.
- RLS/grants/RPC memeriksa profile aktif, role dan satu outlet; rahasia server tidak masuk bundle frontend.
- Kasir dapat membaca data operasional toko dan laporan laba agregat yang disetujui; perubahan master, data mentah HPP, koreksi dan audit penuh hanya admin.
- Target respons katalog setelah cache hangat <2 detik pada jaringan toko yang baik. Laporan memakai agregasi SQL, bukan memuat semua transaksi ke browser.
- Tampilkan waktu sinkronisasi, refresh saat fokus/manual; jangan mengklaim realtime sebelum tersedia.
- Backup database dan file terjadwal, dengan uji restore di nonproduksi. Ekspor laporan bukan backup.
- UI responsif desktop/tablet/mobile, target sentuh POS ≥44px, fokus keyboard dan label jelas, status tidak hanya warna.

## 10. Urutan implementasi

1. Fondasi stack, login, dua role, dua halaman, RLS dan data master.
2. POS katalog/keranjang, simpan/ubah/batalkan unpaid, pembayaran langsung/tersimpan dan struk.
3. Penjualan, rekap produk hari ini, pemasukan/pengeluaran, monitor agregat untuk kedua role.
4. Dashboard admin, keuangan, refund sederhana, pengelolaan dan laporan CSV/XLSX.
5. Verifikasi akses, transaksi bersamaan, konsistensi angka, responsive, backup/restore dan deployment.

**P1:** shift opsional dan rekonsiliasi laci, undangan akun dari aplikasi, reset password mandiri, transfer antar akun, promo kategori, realtime lintas perangkat, PDF/thermal print. Tidak ditambahkan sebelum kebutuhan inti stabil.

## 11. Acceptance criteria MVP

- [ ] Hanya role admin/cashier; admin dapat membuka POS/Dashboard, cashier hanya POS. Akses API admin tetap ditolak untuk cashier.
- [ ] Semua menu/modul berada di dua halaman utama; login dan state sistem sebagai pendukung.
- [ ] Kasir dapat simpan order, keluar/login lagi, menemukan order yang sama, menambah item dan membayarnya nanti.
- [ ] Kasir lain bisa melanjutkan order tersimpan; order kemarin tetap terlihat sebagai belum dibayar.
- [ ] Unpaid/cancelled tidak menambah pendapatan, laba, best seller, atau unit terjual.
- [ ] Pembayaran order tersimpan memakai order yang sama dan tanggal bayar; double click/retry/dua perangkat tidak membuat pembayaran ganda.
- [ ] Konflik perubahan order meminta muat ulang; harga/HPP snapshot dan konfirmasi tagihan terbaru konsisten.
- [ ] Tunai menghitung kembalian; QRIS/transfer dikonfirmasi manual; struk sesuai pembayaran.
- [ ] POS menampilkan pendapatan hari ini, daftar penjualan, dan rekap seperti Kopi Susu Gula Aren 6 serta Americano 9 berdasarkan unit.
- [ ] POS dan Dashboard mendukung penjualan/pendapatan Hari/Minggu/Bulan/Tahun dengan angka sama untuk filter sama.
- [ ] Cashier melihat Monitor dengan estimasi laba kotor/bersih, best seller, tren, tagihan unpaid, dan ringkasan pengeluaran.
- [ ] Cashier dapat mencatat pembelian susu dan pemasukan nonpenjualan, lalu melihat catatannya pada daftar periode yang sesuai.
- [ ] Pembelian bahan tidak membuat biaya dihitung dua kali; pemasukan manual tidak menambah omzet/laba.
- [ ] Refund penuh oleh admin cukup pilih order, alasan, konfirmasi; total diperbarui otomatis dan tidak bisa direfund dua kali.
- [ ] Koreksi catatan menyimpan catatan asal, alasan dan pencatat, serta tidak memposting gerak uang dua kali.
- [ ] Dashboard menyediakan rincian audit bulanan dan ekspor lengkap; ekspor POS sesuai izin.
- [ ] CSV/XLSX mengikuti filter dan seluruh hasil, aman untuk teks formula, serta cocok dengan angka layar.
- [ ] State error/offline/empty/loading dan responsive terverifikasi; transaksi tidak mengaku sukses sebelum konfirmasi server.
- [ ] Tidak perlu membuka/menutup shift untuk transaksi MVP; backup/restore telah diuji.

## 12. Keputusan implementasi awal

- Pengelola akun awal: admin lewat Supabase Dashboard/prosedur aman; undangan aplikasi P1.
- HPP: admin mengisi estimasi per porsi; cashier hanya membaca laba agregat.
- Saldo awal kas/bank: admin mengisi saat go-live; default nol jika belum ada.
- Kas dan Bank/QRIS adalah saldo buku toko; belum ada settlement/fee otomatis. Fee yang benar-benar dibayar dicatat sebagai biaya operasional.
- Admin dapat memasukkan tanggal lampau untuk catatan keuangan dengan alasan; cashier hanya hari ini. Refund/koreksi terjadi pada waktu aksi, tidak memilih tanggal lampau.
- Tidak ada approval pengeluaran kasir atau alur jurnal manual dalam MVP. Semua input tetap memiliki pencatat dan waktu.

## 13. Catatan development wajib

Bagian ini adalah instruksi operasional untuk seluruh pekerjaan desain dan implementasi berikutnya. **Wajib dibaca sebelum mengubah UI, alur, komponen, route, atau fitur.** Jika ada contoh lama di dokumen lain yang bertentangan dengan PRD v1.1, gunakan keputusan produk dan struktur route pada PRD ini. `UI-UX-GUIDELINES.md` tetap menjadi panduan visual/interaksi, tetapi contoh route mandiri, role `owner`, atau shift wajib di dalamnya tidak menggantikan keputusan terbaru pada PRD.

### 13.1 BoardUI wajib menjadi fondasi UI

- Selalu gunakan komponen, primitive, pola, dan semantic token BoardUI. Jangan membuat komponen lookalike sebelum mengecek komponen yang sudah terpasang di `components/base/` dan `components/application/`.
- Pada setiap pekerjaan UI, gunakan **BoardUI MCP** untuk mengecek katalog, API komponen, theme, dan usage example; gunakan juga **skill BoardUI** yang terpasang untuk workflow implementasinya. Jika MCP atau skill belum tersedia pada sesi development, hentikan asumsi tentang API komponen, laporkan keterbatasannya, lalu pasang/aktifkan integrasi BoardUI sebelum membuat pengganti.
- Selalu cek apakah komponen yang terlihat pada referensi Pro juga tersedia pada BoardUI Free. Jika tersedia, instal dan gunakan versi Free tersebut. Instal komponen yang belum ada melalui BoardUI MCP atau CLI resmi; jangan menyalin implementasi Pro.
- Custom composition hanya dibenarkan ketika tampilan referensi Pro tidak tersedia sebagai komponen BoardUI Free. Dalam kondisi itu, susun tampilan dari primitive Free yang tersedia dan implementasikan logic/fungsinya sendiri tanpa menyalin source atau asset berlisensi Pro.
- Ikuti seluruh aturan BoardUI di `AGENTS.md`: semantic color tokens, composite typography utilities, spacing/shape, `DirectionProvider`, logical direction styles, progressive blur pada internal scroll region, `cx()`, ikon `@remixicon/react`, form berbasis `react-aria-components`, dan focus state yang aksesibel.

### 13.2 Referensi visual wajib

Semua file berikut harus diperiksa saat merancang atau mengubah halaman yang relevan. File HTML adalah hasil reverse engineering visual: **UI dan CSS menjadi acuan visual, tetapi logic, state, aksesibilitas, data, dan function harus dibuat sendiri sesuai PRD dan Tech Stack.**

| File referensi | Acuan utama |
|---|---|
| [`reference-boardui-design-task.html`](./reference-boardui-design-task.html) | Acuan utama project board/Kanban, khususnya menu **Pesanan Tersimpan**: kolom adalah status pesanan dan kartu adalah pesanan tersimpan. Implementasi yang harus ditiru dan diekstensikan ada di `src/components/application/pos/pos-saved-orders.tsx`. |
| [`reference-dashboard.html`](./reference-dashboard.html) | Shell dashboard, KPI, chart, recent activity, filter, data table, pagination, hierarchy, dan density. |
| [`reference-finance.html`](./reference-finance.html) | Ringkasan keuangan, cash-flow/spending cards, category breakdown, chart, transaction table, dan filter. |
| [`reference-marketing.html`](./reference-marketing.html) | KPI campaign-like metrics, funnel/breakdown, tabbed analytics, chart, dan table; adaptasikan untuk promo dan analitik tanpa menyalin domain marketing. |
| [`reference-calendar.html`](./reference-calendar.html) | Grid kalender, date navigation, event density, dan visual scheduling bila dibutuhkan oleh date-based UI. |
| [`reference-notif.html`](./reference-notif.html) | Notification panel, unread/read state, grouping/filter, contextual action, dan feedback system. |
| [`reference-setting.html`](./reference-setting.html) | Settings navigation, grouped preferences, control rows, plan/limit-style information blocks, dan hierarchy pengaturan. |
| [`reference-medical-profile.html`](./reference-medical-profile.html) | Profile/detail layout, metric cards, timeline/alerts, activity visualization, dan dense information hierarchy. |

Jangan membuat bahasa visual baru yang terpisah dari kumpulan referensi ini. Pilih pola referensi yang paling cocok dengan kebutuhan fitur, lalu adaptasikan konten dan logic ke domain coffee shop POS.

### 13.3 Route dan struktur aplikasi yang tidak boleh berubah

- `/dashboard` adalah halaman Dashboard admin.
- `/pos` adalah halaman POS untuk admin dan cashier.
- `/login` adalah halaman autentikasi.
- Modul seperti penjualan, pesanan tersimpan, monitor, keuangan, produk, kategori, promo, laporan, dan pengaturan tetap menjadi menu/tab/panel/modal di dalam `/pos` atau `/dashboard`, bukan route aplikasi utama baru.
- Hanya ada role `admin` dan `cashier`. Istilah atau contoh `owner` pada dokumen lama dibaca sebagai admin bila konteksnya masih relevan.
- Shift tetap P1 dan tidak boleh menjadi syarat untuk menyimpan atau membayar order MVP.

### 13.4 Melanjutkan desain dan development yang sudah ada

- Pertahankan pekerjaan yang sudah dibuat dan pahami pola komponennya sebelum mengubahnya. Jangan mengganti keseluruhan layout tanpa alasan produk, usability, atau konsistensi design system yang jelas.
- **Arahan terbaru: jangan mengubah desain pengguna.** Pertahankan tampilan desktop, susunan panel, warna, tipografi, data, dan karakter komponen yang sudah dirancang, termasuk **Penjualan**, **Promo**, **Produk**, dan **Kategori**. Pekerjaan saat ini terbatas pada optimasi, bug/inkonsistensi UI, aksesibilitas, dan responsive desktop/tablet/mobile. Reflow, drawer pada layar kecil, dan scroll tabel diperbolehkan untuk menjaga kegunaan tanpa merancang ulang; perubahan desain lain memerlukan persetujuan.
- Untuk **Pesanan Tersimpan**, jangan membuat layout baru. Ikuti dan ekstensikan `reference-boardui-design-task.html` serta implementasi `src/components/application/pos/pos-saved-orders.tsx` sesuai ketentuan project board/Kanban pada `AGENTS.md`.
- Visual referensi bukan bukti bahwa fitur sudah berfungsi. Setiap filter, form, table, drawer, modal, pagination, status, chart, checkout, refund, export, dan feedback state harus memiliki logic nyata sesuai PRD/Tech Stack.
- Sebelum membuat UI baru: periksa implementasi lokal, cocokkan dengan referensi HTML, cek komponen BoardUI Free melalui MCP/katalog, instal komponen yang tersedia, lalu custom-compose hanya bagian yang benar-benar tidak tersedia.

### 13.5 Urutan sumber kebenaran untuk development

1. Aturan repository pada `AGENTS.md` dan bagian **Catatan development wajib** ini.
2. Keputusan produk, role, route, data, dan acceptance criteria pada `PRD.md` versi terbaru.
3. Arsitektur, keamanan, transaksi, dan kontrak data pada `TECH-STACK.md`.
4. Prinsip visual, responsive, accessibility, dan interaction pada `UI-UX-GUIDELINES.md`, selama tidak bertentangan dengan tiga sumber di atas.
5. File `reference-*.html` sebagai acuan visual/layout, bukan source of truth untuk logic atau permission.
6. Implementasi UI yang sudah ada sebagai baseline yang dipertahankan dan ditingkatkan secara bertahap.

### 13.6 Framework dan performa UI

- Framework yang diputuskan adalah **TanStack Start**, bukan React/Vite SPA standalone. React dan Vite tetap dipakai sebagai library UI serta tooling Start. Jangan mengganti framework untuk memperbaiki delay.
- Navigasi internal memakai TanStack Router `Link`/`navigate`, bukan reload dokumen. Pertahankan preload intent; modul sekunder seperti Settings dimuat saat diperlukan, bukan membebani setiap halaman.
- Rendering awal saat ini client-side (`ssr: false`). Dashboard/POS privat tidak wajib dipindahkan ke SSR tanpa bukti kebutuhan. Evaluasi SSR selektif berdasarkan pengukuran production, kesiapan auth/server data, dan dampak hydration; bukan asumsi bahwa SSR selalu lebih cepat.
- Verifikasi mobile, tablet, desktop: tidak ada overflow halaman; tabel/board boleh scroll di panel masing-masing; katalog dan keranjang POS harus tetap dapat diakses pada layar kecil. Desain referensi dan implementasi pengguna tetap menjadi baseline.
- Catat metrik development dan production secara terpisah. Hasil lokal bukan jaminan kecepatan server/jaringan produksi. Integrasi Supabase serta verifikasi finansial/security tetap pekerjaan tersendiri, tidak dianggap selesai oleh audit UI.

### 13.7 Penyempurnaan Monitor

- Pertahankan desain shell, kartu KPI, baris chart, dan kartu produk yang sudah dibuat. Penyempurnaan desain secara khusus diizinkan untuk kartu **Metode pembayaran**; jangan memperluasnya menjadi redesign seluruh Monitor.
- Headline pembayaran menampilkan nilai pembayaran, bukan teks tetap `3 metode`. Rinci `Tunai`, `QRIS Manual`, `Transfer Manual` dengan nominal, jumlah pembayaran, persentase yang jelas basisnya, dan konteks periode. Bedakan penerimaan sebelum refund dari pendapatan bersih dan saldo akun.
- Seluruh widget periode harus mengikuti filter bersama. Unpaid tetap `Saat ini — semua tanggal`. Kategori/arc/bar/tooltip dihitung dari data yang sama dengan metrik, bukan koordinat atau persentase contoh tetap.
- Preview tanpa backend harus berlabel `Contoh Data`. Agregasi fixture UI tidak menggantikan report RPC, otorisasi, atau perhitungan SQL produksi. Reuse komponen Monitor saat menghubungkan menu POS; jangan memberikan rincian HPP mentah kepada cashier.
- Pill perubahan KPI memakai model BoardUI semula (ikon naik/turun, hijau/merah/netral) dengan persentase dari nilai metrik yang sama pada hari/minggu/bulan/tahun kalender sebelumnya dalam WIB. Custom membandingkan rentang sebelumnya dengan jumlah hari inklusif sama. Tanggal pembanding dan status periode berjalan dijelaskan di tooltip; jangan mengklaim perbandingan durasi setara untuk periode kalender yang belum selesai. Pembanding nol tidak diberi persentase pertumbuhan palsu.
- Scroll mouse/trackpad di atas sidebar desktop tidak boleh menggerakkan sidebar atau meneruskan scroll ke halaman. Scroll konten utama, keyboard, sentuhan pada drawer mobile, dan pinch/zoom browser tetap dipertahankan.
- Shell dashboard dibatasi setinggi viewport; hanya panel konten tengah yang menggulir, bukan dokumen halaman. Sidebar tidak boleh bergeser saat konten digulir sampai bawah. Pertahankan progressive blur/fade di tepi atas area scroll sesuai aturan BoardUI, tanpa mengubah desain kartu atau navigasi.
