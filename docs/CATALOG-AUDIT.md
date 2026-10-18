# Audit Produk & Kategori — 17 Oktober 2026

Scope: frontend demo dashboard; desain tabel, thumbnail kategori, KPI, shell dan susunan halaman pengguna dipertahankan. Bukan implementasi backend master-data produksi.

## Acuan

PRD §4, §6, §9 dan Catatan Development §13, TECH-STACK, UI-UX-GUIDELINES, AGENTS, skill BoardUI dibaca. Pola KPI/table/filter/density diperiksa pada `reference-dashboard.html`; hierarchy control/form pada `reference-setting.html`. BoardUI MCP `get_usage_examples(data-table)` dipakai untuk mengecek pola Free. Primitive terpasang dipakai: Table, Checkbox, Switch, Input, Select, Pagination, Chip, Button/IconButton; drawer focus-managed dan SoftScroll yang sudah ada digunakan untuk detail/form. Tidak ada komponen Pro yang disalin atau dependency baru untuk katalog.

## Temuan dan perbaikan

- Tambah/detail/edit semula tidak berfungsi. Kini membuka drawer pada halaman yang sama; field tervalidasi dan perubahan demo tersimpan setelah browser storage berhasil menulis. Label `Contoh Data`/lokal browser selalu terlihat; tidak mengaku server sukses.
- Pagination Produk semula menampilkan 3 halaman tetapi semua 10 baris selalu sama. Kini slicing, jumlah halaman, pengembalian ke halaman pertama saat filter berubah, page-size Produk dan clamp halaman benar.
- Pencarian nama/kode, filter kategori/status/ketersediaan dan reset empty state berfungsi. Filter tervalidasi memakai query TanStack sehingga refresh mempertahankan filter, tanpa reload dokumen ketika mengubahnya. Search desktop 256px dan full-width mobile; mobile squeeze pada toolbar direproduksi lalu diperbaiki.
- Reset filter pada tabel mobile semula dapat mempertahankan horizontal offset setelah fokus tombol empty state, menyembunyikan kolom nama. Filter/reset kini mengembalikan scroll tabel ke kolom pertama; scroll halaman tidak diubah.
- KPI sebelumnya tetap walau switch berubah, dengan growth palsu; kini ringkasan mengikuti master saat ini, chip pertumbuhan netral `—` tanpa histori buatan. Ringkasan seluruh katalog dibedakan dari jumlah hasil filter.
- Kategori sebelumnya mengklaim 15 produk dari angka manual, sedangkan master punya 10. Jumlah per kategori/KPI kini dihitung dari product ID/category ID yang sama. Rename kategori tidak memisahkan relasi.
- Harga jual >0 dan HPP ≥0 sebagai rupiah bulat aman. HPP >harga boleh dengan peringatan. Pecahan/eksponen/angka tidak aman ditolak. Kode/nama unik dinormalisasi; kategori aktif wajib untuk produk baru/perpindahan kategori.
- Aktif/nonaktif dan tersedia/habis terpisah. Switch/nonaktifkan membuka form konfirmasi yang harus disimpan; ikon hapus permanen diganti aksi nonaktifkan. Tidak ada hard delete; snapshot order/histori tidak disentuh.
- Kategori punya urutan tampilan, edit/status; kategori nonaktif tidak ditawarkan untuk produk baru. Produk terkait tidak otomatis dihapus/dinonaktifkan. Konsekuensi dijelaskan pada form.
- URL foto HTTPS opsional dengan placeholder bila gagal dan lazy loading; upload Storage belum diklaim tersedia.
- Loading, empty/filter-empty, retry error penyimpanan, offline (mutasi dinonaktifkan), success demo, Escape/focus-managed drawer, warning discard form, validasi storage dan konflik revision ditangani. Data rusak tidak diam-diam ditimpa atau di-reset.

## Verifikasi

```sh
node --experimental-strip-types --test src/features/catalog/catalog-demo.test.ts src/features/catalog/catalog-search.test.ts
npx tsc --noEmit
CATALOG_BASE_URL=http://127.0.0.1:3002 CATALOG_PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/test-catalog-ui.mjs
```

- 9 pure unit tests lulus: harga/HPP, normalisasi unik, foto, kategori nonaktif, histori/identity, relasi/counts, pagination, storage invalid, query validation.
- TypeScript lulus pada workspace gabungan saat pengujian.
- Browser matrix Produk/Kategori di 360, 390, 768, 820, 1024, 1280 dan 1440px: tidak ada overflow halaman; search/empty/reset/drawer responsif. Tabel sengaja memiliki scroll horizontal di panel, bukan dokumen.
- Functional browser suite lulus: checkbox/selection, tambah produk, harga invalid, peringatan HPP, edit ketersediaan, simpan/reload, pagination yang benar, jumlah produk terkait, tambah kategori/urutan, nonaktifkan kategori dan opsi kategori aktif, refresh query, dark mode, offline lock, konflik revision tidak menimpa data, quota/storage write error mempertahankan form, storage rusak tidak ditimpa. Tidak ada `pageerror` pada rangkaian browser.

## Batas integrasi berikutnya

Data demo katalog terpisah dari fixture POS; form menjelaskan perubahan belum memengaruhi POS. Hubungkan katalog POS, master admin dan report melalui query/RPC Supabase yang sama, bukan menjadikan localStorage sebagai DB kedua. Server wajib menegakkan admin-only/RLS, validasi harga/HPP/unik/category, histori snapshot, konflik lintas perangkat dan audit. Check revision browser hanya guard best-effort, bukan transaksi atomik atau jaminan multi-device. Upload foto, role auth/akses ditolak yang sebenarnya, server-side pagination/filter, cache invalidation, retry request key dan data/error server tetap belum tersedia. Tidak ada auth atau backend baru pada audit ini.
