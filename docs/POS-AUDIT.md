# Audit POS — 17 Oktober 2026

## Lingkup dan baseline

PRD §5.1–5.3, §7 dan §13 menjadi acuan. Layout katalog kiri, keranjang kanan, drawer mobile, warna/typography, serta board empat kolom tetap mengikuti implementasi pengguna. Board `docs/reference-boardui-design-task.html` dipertahankan: kolom status, kartu pesanan, chip, avatar kasir, ringkasan dan waktu. Konten task-ticket contoh diganti konteks pesanan; tidak ada status dapur baru.

Skill BoardUI dan MCP `get_usage_examples(input)` digunakan. Seluruh kontrol menggunakan komponen Free terpasang (`Button`, `Input`, `Checkbox`, `Chip`, `Avatar`) dan drawer/SoftScroll yang sudah ada. Tidak ada perubahan framework, dependency, auth, Supabase atau payment gateway.

## Alur frontend yang tersedia

- Katalog: pencarian/kategori, penambahan berulang menaikkan jumlah, batas 99 unit/30 baris, dukungan produk nonaktif/habis, gambar lazy-load. Produk contoh tetap memakai foto baseline yang sama.
- Keranjang: jumlah, hapus, catatan item/order, identitas pelanggan/meja, subtotal/diskon/total. Kontrol sentuh minimal 44px. Promo **contoh** `HEMAT10`: 10%, minimum Rp50.000, maksimal Rp15.000; bukan kontrak promo produksi.
- Simpan/Ubah: identitas wajib; menjadi `unpaid`, keranjang dikosongkan hanya setelah penulisan lokal berhasil. Buka/Ubah memuat snapshot; simpan ulang dan bayar mempertahankan ID/nomor order. Pergantian menu tidak membuang draft aktif. Draft belum disimpan tidak dipersist setelah reload.
- Board: semua tanggal untuk unpaid, pencarian nomor/identitas/produk, badge pesanan hari sebelumnya, aksi buka/bayar/batalkan, alasan batal wajib. Kolom status: Belum Dibayar, Lunas, Dibatalkan, Dikembalikan; refund belum diimplementasikan.
- Bayar: Tunai dengan input rupiah bulat dan kembalian; QRIS Manual/Transfer Manual memerlukan checkbox dana diterima. Tidak membuat QR/rekening palsu atau mengaku terverifikasi gateway.
- Struk/tagihan: popup browser print berisi nomor, tanggal WIB, kasir Demo, item, diskon, total, metode dan kembalian. Unpaid bertuliskan `TAGIHAN — BELUM DIBAYAR`; semuanya bertanda `CONTOH DATA`, `BUKAN BUKTI PEMBAYARAN`.
- Header pendapatan **contoh hari ini WIB** hanya menjumlah pembayaran lokal hari ini, bukan unpaid/cancelled. Tidak terikat filter board. Offline menonaktifkan simpan/bayar; draft tidak dihapus. Kegagalan storage tidak mengosongkan keranjang/menimpa data rusak.

## Batas demo yang wajib dipertahankan

Data diberi label **Contoh Data · Lokal browser · Belum terhubung Supabase**. Key localStorage: `alco-pos-local-demo-v1`; gunakan data contoh, bukan informasi pelanggan nyata. Penyimpanan ini hanya untuk rehearsal UI pada browser yang sama, bukan online/offline sync, lintas perangkat/kasir terautentikasi, atau sumber laporan resmi. Order lokal tetap ada setelah refresh; tidak dikirim ke server.

Validasi schema dan pengecekan versi terhadap storage terakhir mendeteksi konflik yang sudah terlihat, tetapi **localStorage bukan transaksi/lock lintas tab**. Guard klik lokal dan status order bukan pengganti idempotency key, quote server, RLS, row lock, kuota promo, payment/cash movement atomik, atau rekonsiliasi timeout. Belum ada jaminan konkurensi produksi. Supabase RPC harus menghitung ulang semua nilai; tidak boleh menerima total frontend sebagai nilai final.

Menu POS Penjualan/Monitor/Pengeluaran/Pemasukan dan integrasi report/header bersama belum disambungkan oleh slice ini. Auth/dua role, logout/cache, HPP snapshots server, refund admin, ekspor, profil toko/struk nyata dan pengujian transaksi database masih memerlukan implementasi/integrasi tersendiri. Karena itu, pekerjaan seluruh MVP **belum selesai** dan tidak sekadar mengganti URL database.

## Verifikasi

- `node --experimental-strip-types --test src/features/pos/pos-demo.test.ts`: 6 test; WIB tengah malam, kontinuitas ID/snapshot, kembalian dan cash invalid, verifikasi metode manual, versi/identitas/pembatalan, promo dan schema storage.
- `npx tsc --noEmit`: lolos setelah perubahan POS.
- Browser Chromium lokal: desktop simpan → reload → buka/ubah → bayar memakai ID sama; Rp36.000 diterima Rp50.000 → kembali Rp14.000; nominal kurang menonaktifkan konfirmasi; print popup bertanda contoh dan nominal benar; batal tanpa alasan dinonaktifkan.
- Lebar 360, 390, 768, 1024, 1440px: akses keranjang, gate konfirmasi QRIS, offline disable, katalog/board tanpa overflow dokumen; 0 page errors. Dark mode screenshot 390px diperiksa dengan token yang sama.
- Wheel pada sidebar POS desktop: posisi sidebar dan scroll dokumen tetap. Katalog/keranjang/board tetap memakai scroll internal, bukan menggeser sidebar.
- Artefak browser lokal: `/private/tmp/alco-ui-audit.W164ZN/pos-flow-test.mjs`, `pos-core-{width}.png`, `pos-board-core-{width}.png`, `pos-board-core-dark.png`. Bukan pengujian deployment/jaringan produksi atau printer fisik.
