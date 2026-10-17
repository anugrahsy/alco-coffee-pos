# Coffee Shop POS — UI/UX Guidelines & Page Blueprint

> **Versi:** 1.0 · **Tanggal:** 15 Oktober 2026  
> **Design system utama:** [BoardUI](https://www.boardui.com/) **Free components** + Tailwind CSS v4 + React  
> **Untuk siapa:** UI Design Agent, frontend Coding Agent, QA Agent  
> **Dokumen wajib dibaca:** [PRD.md](./PRD.md) · [TECH-STACK.md](./TECH-STACK.md)

## 0. Instruksi spesifik untuk AI UI/UX Agent

Buat sistem aplikasi **coffee shop POS operasional**, bukan landing page marketing atau template dashboard generik. UI harus dapat digunakan oleh kasir di tablet, owner di desktop, dan staf lain yang tidak teknis. Prioritas: **jelas, cepat, error-proof, hemat klik**.

**Penting:** Gunakan komponen dan *design tokens* **BoardUI Free** yang benar-benar tersedia pada versi saat mengimplementasikan. Jika sebuah visualisasi/template contoh BoardUI memerlukan lisensi Pro, buat komposisi sendiri dari **free primitives** dan `Recharts`; jangan menyertakan asset/template Pro tanpa lisensi. Rujukan pemasangan: https://www.boardui.com/getting-started, katalog: https://www.boardui.com/components.

**Hasil yang diharapkan dari agent desain:**

1. *Sitemap* serta navigation mapping per role.
2. Low-fidelity wireframe seluruh route di PRD.
3. High-fidelity responsive screens untuk desktop 1440, tablet 1024/768, mobile 390.
4. UI states per halaman (default, empty, loading, error, success, permission denied, offline).
5. Komponen reusable & interaction spec termasuk keyboard/focus.
6. Spec data chart/table dan export, bukan grafik dekorasi.
7. Handoff ke coding agent: komponen BoardUI apa yang dipakai, route, interaksi, query/mutation & permission.

**Jangan** invent fitur inventory, produk pelanggan, POS offline, QRIS auto confirmation, komisi pegawai, multistore, dark dashboard berlebihan, atau CTA premium.

---

## 1. Prinsip visual produk

| Prinsip | Penerapan |
|---|---|
| **Operational first** | Kasir bisa memilih item dan bayar tanpa berpindah banyak halaman |
| **Calm & readable** | Dashboard padat data tetapi jelas, whitespace cukup, hierarki konsisten |
| **Trustworthy finance** | Tampilkan sumber & waktu update, beda omzet vs profit vs cash flow |
| **Role-first** | UI menampilkan hanya menu/kontrol sesuai akses pengguna |
| **Predictable actions** | Primary untuk aksi utama, danger hanya refund/reversal, dialog untuk konsekuensi permanen |
| **Responsive POS** | Tablet landscape first, mobile tetap bisa transaksi |
| **Accessibility** | Keyboard, focus ring, labels, status tidak hanya warna |
| **Semantic tokens** | Warna dan spacing memakai BoardUI semantic tokens, bukan raw random hex |

### 1.1 Gaya visual

- Arah desain: **modern SaaS / minimal / coffee-shop friendly**, tidak berlebihan dengan motif kopi atau hero banner.
- Default **light theme** yang terang dan mudah dibaca di area kasir. Dark mode opsional P1, token harus compatible sejak awal.
- Gunakan font bawaan BoardUI atau sans-serif UI mudah dibaca; angka monospaced/tabular untuk uang dan tabel.
- Icon satu keluarga (Lucide bila BoardUI tidak memasok icon yang cocok) 16–20px secara konsisten.
- Palet gunakan semantic token BoardUI (`surface`, `text`, `border`, `primary`, success, danger). Set brand accent *sekali* di token tema setelah owner memilih identitas merek; jangan mematok warna brand dari agent.
- Status badge selalu menyertakan label: `Lunas`, `Dikembalikan`, `Habis`, `Aktif`, `Nonaktif`.
- Angka uang UI Indonesia: `Rp 18.000`, digit selaras (`tabular-nums`). Negative expense/return: `−Rp 50.000`; jangan hanya merah tanpa label.

### 1.2 Layout foundations

| Token / konsep | Anjuran |
|---|---|
| Desktop sidebar | ~240–260px expanded, ~64–72px collapsed |
| Desktop topbar | ~64–72px tinggi |
| Page content max width | ~1440px; POS dapat lebih lebar saat diperlukan |
| Page horizontal padding | desktop 24–32px, tablet 16–24px, mobile 12–16px |
| Card padding | 16–24px |
| Input/control min-height | ~40–44px; POS tap target >=44px |
| Border radius | gunakan token BoardUI; konsisten card vs button |
| Density | normal untuk forms/dashboard, compact mode untuk table dan POS cart |
| Table scroll | horizontal pada viewport sempit, sticky header pada daftar besar |
| Chart | selalu memiliki label, tooltip, no-data, dan konteks periode |

**Hindari:** overly-animated dashboard, glassmorphism berat, gambar besar pada halaman kasir, jumlah kartu berlebihan, ikon tanpa label, grafik pie untuk puluhan kategori, data dummy yang tampak nyata pada produk live.

---

## 2. Navigasi dan responsivitas

### 2.1 App shell desktop

```text
┌──────────────────── Sidebar ───────────────────┬────────── Topbar ──────────────────────────┐
│ [Logo]  Coffee POS                            │ [Breadcrumb]         [Status] [User Menu] │
│                                               ├─────────────────────────────────────────────┤
│ UTAMA                                         │ [Title]                 [Primary Action]   │
│ Dashboard                                     │ [Subtitle / last update]                    │
│ Kasir                                         │                                             │
│ Pesanan                                       │ [Filter / Search / Date Range]              │
│                                               │                                             │
│ MASTER DATA (Owner/Admin)                     │ [Main page content]                         │
│ Produk                                        │                                             │
│ Kategori                                      │                                             │
│ Promo                                         │                                             │
│                                               │                                             │
│ KEUANGAN (Owner)                              │                                             │
│ Ringkasan / Pemasukan / Pengeluaran / Kas     │                                             │
│                                               │                                             │
│ ANALITIK & LAPORAN                            │                                             │
│ Analitik Penjualan / Produk / Export          │                                             │
│                                               │                                             │
│ OPERASIONAL                                   │                                             │
│ Shift                                         │                                             │
│                                               │                                             │
│ PENGATURAN                                    │                                             │
│ Profil / Toko / Pengguna                      │                                             │
│                                               │                                             │
│ [Logout]                                      │                                             │
└───────────────────────────────────────────────┴─────────────────────────────────────────────┘
```

- Active sidebar item memakai token semantik, icon dan label.
- Kelompok navigasi tidak tampil bila role tak punya satupun item di dalamnya.
- Sidebar collapsible tetap menyediakan tooltip setiap icon.
- Untuk `Cashier`, navigasi *simplified*, default landing `/pos`.
- Pada mobile, sidebar menjadi drawer menu; toggle pada topbar.
- Focus order logis dari menu ke konten; esc menutup drawer.

### 2.2 Layout POS khusus

Jangan memaksa POS memakai pola dashboard 3-column yang sempit.

**Desktop/tablet landscape**:

```text
┌─────────────────────── POS HEADER / CASHIER / SHIFT ───────────────────────┐
│ [Search produk________________]  [Minuman] [Snack] [Makanan] [Status shift]│
├─────────────────────────────────────┬──────────────────────────────────────┤
│ CATALOG                             │ CART / BILL                          │
│ [Card] [Card] [Card] [Card]          │ Americano   [-] 2 [+]     Rp36.000  │
│ [Card] [Card] [Card] [Card]          │ Cookies     [-] 1 [+]     Rp15.000  │
│ ...                                 │ Notes                               │
│                                     │ ----------------------------------- │
│                                     │ Promo  [CODE_______] [Terapkan]     │
│                                     │ Subtotal                  Rp51.000  │
│                                     │ Discount                  -Rp5.000  │
│                                     │ TOTAL                     Rp46.000  │
│                                     │ [LANJUT PEMBAYARAN]                 │
└─────────────────────────────────────┴──────────────────────────────────────┘
```

**Mobile:** Search/categories/catalog full width; sticky bottom `Keranjang (3) · Rp46.000`; klik membuka cart bottom sheet full-height; step payment dalam sheet/dialog terpisah dengan tombol utama sticky.

### 2.3 Breakpoint behavior

- **>=1280**: full sidebar + 4-col product cards where fit, sticky cart ~340–400px.
- **768–1279**: sidebar collapsed/drawer, catalog 2–3 columns, cart right if landscape, drawer if cramped.
- **<768**: drawer nav, POS cart bottom sheet, dashboard KPI 1–2 columns, filters stack, table horizontally scroll / card summary where justified.
- Tidak menggunakan hover-only controls untuk aksi penting; perangkat kasir sering touchscreen.

---

## 3. Reusable design components

| Komponen | Fungsi | BoardUI building blocks / implementation |
|---|---|---|
| `AppShell` | Sidebar/topbar + responsive drawer | BoardUI navigation primitives, custom shell |
| `PageHeader` | Breadcrumb/title/description/actions | Typography, Button, Dropdown |
| `DateRangeFilter` | Preset/Custom | Date Picker, Segmented Control, Popover |
| `StatCard` | KPI, delta, tooltip definisi | Card wrapper + text/icons |
| `DataTable` | Search, sort, pagination | Table + Pagination + Input + Select |
| `EmptyState` | Empty/filter empty/error | Custom from BoardUI typography/buttons |
| `ConfirmDialog` | Refund/reversal/destructive action | Accessible dialog primitive from compatible free library if BoardUI lacks |
| `MoneyText` | Rupiah format, negative display | Utility component + tabular nums |
| `StatusBadge` | Paid/refunded/available/etc | BoardUI Chip or Badge equivalent |
| `FormField` | Label/description/error | BoardUI Input/Select/Textarea + RHF |
| `ExportMenu` | Download CSV / Excel | Dropdown + Button, not export all formats at once |
| `FilterBar` | Search and filter chips | Input/Select/Date Picker |
| `OrderReceipt` | Printer-friendly order | Semantic HTML + print CSS |
| `NetworkStatus` | Offline, syncing, failed | Banner/notification |
| `ChartCard` | Title, subtitle, metrics, tooltip | BoardUI card + Recharts |
| `ProductCard` | Fast add to cart | Custom card/button |
| `CartItem` | Quantity, note, remove | Button Group/Icon Button/Input |

### 3.1 Standard form behavior

- Label above input; required marker, validation message below.
- Error messages in Bahasa Indonesia and specific (`Harga harus lebih dari Rp0`, not `Invalid input`).
- Numeric `type=number` with no scientific notation acceptance; parse integer IDR safely.
- Submit disabled if invalid, pending, or no changes; preserve form values on server error.
- Warn user if leaving unsaved edit form (except POS draft order when intentionally discard).
- A destructive action always asks confirmation; refund asks reason and amount.
- Toast success communicates **completed server action**, not optimistic assumption.

### 3.2 Data table behavior

- Header (list title + row count + main CTA).
- Search debounce ~300ms; filter sync in URL query params.
- Default page size 20 (select 20/50/100), server-side sort & pagination.
- Empty filter state `Tidak ada data yang sesuai. [Reset Filter]`.
- Export uses active filters, **not page size**; label `Ekspor seluruh hasil`.
- Use skeleton rows while initial loading; subtle spinner during filter change.
- Long descriptions truncate with tooltip; numbers align right.

---

## 4. Spesifikasi UI per halaman

> Setiap halaman menyebut **isi UI**, **aksi**, **state**, dan **responsive**. Business rules detail di PRD §5 dan API di Tech Stack.

### 4.1 Login `/login`

**Screen composition:** white/neutral background, brand logo, compact centered form (max-width ~420px), title “Masuk ke Coffee POS”, helper “Gunakan akun yang diberikan pengelola”.

**Fields/buttons:** Email, Kata sandi, icon tampilkan/sembunyikan sandi, `Masuk`, muted footer “Hubungi Owner jika belum punya akses.”

**States:**

- Initial: empty fields.
- Invalid: inline red error for incorrect email format / empty password.
- Submit: button spinner “Memproses...” and disable.
- Failed auth: neutral error alert “Email atau kata sandi tidak sesuai”.
- Account disabled: “Akun ini tidak aktif. Hubungi Owner.”
- Already logged in: redirect automatically.
- Offline: notice to reconnect; no fake success.

**After submit:** Owner/Admin → `/dashboard`, Cashier → `/pos`.

### 4.2 Dashboard `/dashboard`

**Hierarchy:** Page header → global date range → KPI cards → charts row → best sellers/last transactions row.

**Owner KPI:** Penjualan Bersih, Jumlah Order, AOV, Est. Laba Kotor, Est. Laba Operasional, Pengeluaran.

**Admin KPI:** Penjualan Bersih, Jumlah Order, AOV, Diskon, Refund, Produk Terjual. **Never** show cost/margin cards or cost data in network response.

**Charts:**

- Main line/area: `Tren Penjualan Bersih`, x=date/time period, y=IDR.
- Small bar: `Penjualan per Kategori` (Minuman, Snack, Makanan).
- Top 5: product rank, net qty and net revenue.
- Recent 5: order time, order number, payment, total, status.
- Owner-only: Op expense category ranked.

**Actions:** filter period `Hari Ini`, `7 Hari`, `Bulan Ini`, `Tahun Ini`, `Custom`; optional compare previous equivalent period; export summary via menu CSV/XLSX; link drilldowns.

**States:** loading skeleton, no sales placeholder `Belum ada penjualan pada periode ini`, no expenses yet, analytics API error with `Coba lagi`, connection indicator and timestamp.

**Responsive:** desktop 3 KPI columns; tablet 2; mobile 1–2. Charts full width mobile with scroll/responsive axes; no horizontal clipping of Rupiah numbers.

### 4.3 POS `/pos`

**Before operation:** if no open shift: top banner `Belum ada shift aktif`, button `Buka Shift` (opening cash amount). Catalog can remain visible, payment disabled until shift open.

**Catalog controls:** search, category tabs/chips, product card with title/photo optional and price, `Habis` overlay disabled. Use stable product grid.

**Cart panel:** sticky on desktop, drawer on mobile. Each row with qty buttons, notes edit and remove. Summary shows subtotal, discount, grand total, clear-cart action (confirmation if nonempty).

**Payment dialog flow:**

1. Review Order (list, subtotal, applied promo, current total).
2. Choose `Tunai`, `QRIS (Manual)`, `Transfer (Manual)`.
3. Cash input `Uang diterima`, quick chips (pas, Rp50k, Rp100k), show `Kembalian`.
4. QRIS/Transfer: info “Pastikan dana sudah diterima sebelum menekan konfirmasi”; checkbox `Saya sudah memeriksa pembayaran`.
5. Primary button `Konfirmasi & Bayar`.
6. Processing state lock UI; success screen receipt number/time/total/change with `Cetak Struk`, `Pesanan Baru`, `Lihat Detail`.

**Error variants:** insufficient tendered, expired promo, price updated (show changed items and CTA `Perbarui Total`), product no longer available, network timeout (`Periksa Status Transaksi`), shift closed.

**Crucial copy:** never “Pembayaran QRIS berhasil diverifikasi” because no gateway. Use “Pembayaran dicatat setelah konfirmasi kasir”.

**Responsive:** prioritize 44px tap targets; sticky checkout; one-hand mobile use; keyboard shortcut `/` focus search and `Esc` close modal optional P1 if tests pass.

### 4.4 Orders List `/orders`

**Header:** `Pesanan` + export dropdown (Owner/Admin), filter status, search order no, payment method, cashiers (authorized), date range.

**Table:** Waktu (WIB), Nomor, Kasir, Item, Metode, Total, Status, Aksi. Cashier view limited; show own transactions only, no export if unauthorized.

**Row actions:** `Lihat Detail`; Owner-only `Refund` on paid orders, with dialog. Admin may see status, no refund button.

**States:** no orders yet; no matches; loading; server error; forbidden path.

**Responsive:** mobile cards: number+status on first row, time/cashier, total aligned, detail CTA.

### 4.5 Order Detail `/orders/$orderId`

**Header:** `Pesanan #...` + status chip + paid timestamp, buttons `Cetak` and Owner-only `Refund`.

**Sections:** Receipt summary; product lines (name snapshot, qty, unit price, discount, subtotal); payment details; cashier/shift; promo; notes; refund event block; audit trail (Owner).

**Refund modal:** danger heading `Kembalikan seluruh pembayaran?`, show immutable amount, required reason input, account of refund, checkbox `Dana sudah dikembalikan`, two buttons `Batal` / `Konfirmasi Refund`. Disable when already refunded.

**Print:** hide global nav, use 80mm-friendly print layout (browser printing; not hardware integration); legible grayscale, no buttons, actual store data/ID.

### 4.6 Products List `/products`

**Header:** `Produk` + `Tambah Produk`.

**Filters:** search, category, availability, active; table with image, name, category, selling price, HPP only if Owner (from separate secured API), availability, last update, actions.

**Row controls:** `Edit`, toggle `Tersedia/Habis`, `Nonaktifkan` with confirmation. Hard delete absent.

**Empty:** no products: illustration/icon + `Tambah Produk Pertama`; no matches: reset filters.

**Responsive:** table becomes stacked cards if data readability suffers; status controls still accessible.

### 4.7 Add/Edit Product `/products/new`, `/products/$productId/edit`

**Form groups:** Informasi Produk (nama, kategori, deskripsi), Harga (harga jual; HPP field visible **Owner only**), Media (photo dropzone), Ketersediaan (aktif/tersedia switches).

**Primary:** `Simpan Produk` or `Simpan Perubahan`, secondary `Batal`.

**UI validation:** name required 2–100, category, positive integer rupiah, HPP nonnegative, image type/size supported. Warning if HPP > selling price, don't auto-correct.

**Edit behavior:** show last updated; banner `Perubahan harga tidak mengubah transaksi yang sudah terjadi`.

### 4.8 Categories `/categories`

**Simple layout:** list/table category, sort order, active product count, status. Button `Tambah Kategori` opens small dialog (no need extra page).

**Actions:** Edit name/order, `Nonaktifkan` (warn associated products will no longer be selectable if that's enforced); no hard deletion when linked.

**Default:** Minuman, Snack, Makanan.

### 4.9 Promotions List `/promotions`

**Header:** `Promo & Kupon`, `Buat Promo`.

**Table:** code, name, benefit, period, uses/limit, status (Scheduled/Active/Expired/Disabled), action edit.

**Useful empty state:** “Belum ada kupon promosi” plus CTA.

### 4.10 Create/Edit Promotion `/promotions/new`, `/promotions/$promotionId/edit`

**Form:** nama, kode, jenis diskon `%`/`Rp`, nilai, max discount when %, min subtotal, start/end date-time WIB, usage limit, active. Preview callout with example order Rp50.000 calculating expected discount (preview only).

**Validation:** code unique/uppercase; percentage 1–100; end after start; max discount positive if set; no stacking; start-end shown WIB.

**Note:** category-scope optional P1, MVP apply all products. Don't render category selectors unless implemented backend.

### 4.11 Finance Overview `/finance/overview`

**Header:** `Ringkasan Keuangan`, date range, `Ekspor CSV` / `Ekspor Excel`, small text “Estimasi berdasarkan HPP per produk”.

**Top KPI:** Net Sales, HPP, Laba Kotor, Biaya Operasional, **Estimasi Laba Operasional**, Net Cash Movement.

**Main sections:** chart Penjualan vs Biaya; breakdown waterfall (can be stacked values/cards instead of paid chart), category expense ranked, account book balances, latest 10 cash movements.

**Help text:** mini info tooltip distinguishing Revenue ≠ Cash Inflow; HPP estimate vs bought ingredient cash out. No misleading “Laba Bersih Final” label.

**Action:** `Tambah Pengeluaran`, `Catat Pemasukan`, `Lihat Arus Kas`.

**Owner-only:** unauthorized direct URL → 403, not blank sensitive skeleton.

### 4.12 Income `/finance/income`

**Header:** `Pemasukan Nonpenjualan` + `Tambah Pemasukan` + export.

**Notice:** “Penjualan dari kasir tercatat otomatis dan tidak perlu dimasukkan di sini”.

**Table:** tanggal, jenis (Setoran Modal / Pemasukan Lain), akun, nominal, deskripsi, user, status.

**Dialog/Form:** tanggal, jenis, account, nominal, description, optional receipt; save with confirmation. Any posted correction must be reversal, not inline edit.

### 4.13 Expenses `/finance/expenses`

**Header:** `Pengeluaran` + `Tambah Pengeluaran` + export.

**Tabs/filter:** all, operating expenses, inventory purchases; period, category, account, search description.

**Table:** date, category, description, account, nominal, treatment badge (`Biaya Operasional` / `Pembelian Stok - Arus Kas Saja`), created by.

**Form:** date, expense category, amount, source financial account, description, optional proof. Show *live helper panel*:

- If category stock purchase: “Mengurangi kas. Tidak dihitung lagi sebagai biaya operasional pada laba estimasi.”
- If operating category: “Mengurangi kas dan estimasi laba operasional.”

**Actions:** Owner reverse with required reason; no Delete.

### 4.14 Cash Flow `/finance/cash-flow`

**Header:** `Arus Kas`, account filter, date range, export.

**KPI:** Saldo awal, Uang Masuk, Uang Keluar, Saldo Akhir (scope account). Top segment `Tunai`, `Bank/QRIS`, `Semua Akun`.

**Table:** date/time, reference, category/description, account, Masuk, Keluar, Saldo Berjalan. Negative balance allowed only if business records demand; show warning instead of silently preventing historical reports.

**Clarifier:** “Saldo buku, bukan verifikasi saldo rekening bank.”

### 4.15 Sales Analytics `/analytics/sales`

**Filter bar:** date range, category, payment method, cashier; export menu.

**KPI:** Net Sales, count orders, average order value, refund amount, comparison to previous period where meaningful.

**Charts:**

- Trend: line chart WIB bucket.
- Revenue by category: horizontal bars.
- Payment share: compact donut only if 2–3 methods.
- Orders by hour: column chart hours 07–23 or available hours only, label all hour buckets.

**Table:** date bucket, total orders, gross, discount, refund, net, AOV.

**UI microcopy:** if a net value is negative due to refunds from prior periods, show why in tooltip.

### 4.16 Product Analytics `/analytics/products`

**Header:** `Analitik Produk`, date range, category filter, sort `Terlaris (Unit)` / `Pendapatan`, export.

**Hero:** Top 1 product + net quantity, 3 top-selling list, net sales by product bars.

**Table:** rank, name, category, qty sold, qty refunded, net qty, net revenue. Owner additionally unit margin/HPP estimate; Admin never cost.

**Zero/negative net qty:** show `0` or negative actual and tooltip; no fake product ranks for no sales.

### 4.17 Reports `/reports`

**Header:** `Laporan & Ekspor`, subtitle `Unduh data bisnis sesuai periode dan hak akses`.

**Wizard-like single page (not multi-screen):**

1. Choose report type (select/list cards grouped `Penjualan`, `Produk`, `Keuangan`, `Operasional`).
2. Choose dates and aggregation (Day/Week/Month/Year where applicable).
3. Preview summary count and first 20 rows.
4. Buttons `Unduh CSV` and `Unduh Excel (.xlsx)`.

**UX messages:** display row estimate; for >50k rows show warning `Rentang terlalu besar, pilih periode lebih pendek`; after export show filename.

**Permissions:** Admin list excludes private finance types; Cashier has no Reports nav. Don't allow selecting owner report type via URL/API.

**Export quality:** header column ordering, date timezone, currency numeric, quoted CSV, proper XLSX sheet styles. Make labels visible before download so users understand included filters.

### 4.18 Shifts `/shifts` / POS shift controls

**Open shift dialog:** `Buka Shift`, current cashier, opening cash input, timestamp WIB, optional note, primary `Mulai Shift`.

**Active shift compact:** top POS badge `Shift Aktif` + started timestamp; quick menu `Kas Masuk`, `Kas Keluar`, `Tutup Shift`.

**Cash adjustment modal:** choose cash in/out, amount, reason, show if affects owner finance cash; avoid duplication.

**Close shift dialog:** breakdown opening, net cash sales, cash refunds, in/out, expected, required input actual, variance. If variance nonzero, required explanation appears. Primary `Konfirmasi Tutup Shift` (consequential).

**History table:** cashier, opened/closed WIB, opening, expected, actual, variance, status. Owner/Admin filter by date/staff, export; Cashier sees own active or last shift only.

### 4.19 Profile `/settings/profile`

**Content:** name, email, role chip, change password action via Supabase-supported flow, logout button. Use distinct sections; avoid meaningless settings.

### 4.20 Store `/settings/store`

**Content:** store name/logo/address/contact, receipt footer preview, fixed IDR/WIB read-only indicators, save button. Show example receipt live (mock only).

### 4.21 Users `/settings/users`

**Table:** display name, email, role, active status, last access only if data actually exists. For MVP if invitation cannot be safely executed in app, show owner read-only directory + text `Akun baru dikelola melalui Admin Supabase`; don't present a fake user creation CTA.

**Danger action:** deactivate account with explicit confirmation, show role and impact. Protect against deactivating the last active Owner.

### 4.22 Errors & system states

| Screen | Message | Action |
|---|---|---|
| 403 | “Kamu tidak punya akses ke halaman ini.” | Kembali ke POS/Dashboard |
| 404 | “Halaman tidak ditemukan.” | Dashboard/Pos |
| Offline | “Koneksi terputus. Pembayaran sementara dinonaktifkan.” | Coba sambungkan kembali |
| Uncertain checkout | “Status transaksi belum dapat dipastikan.” | Periksa status dengan request ID |
| Failed report | “Data laporan gagal dimuat.” | Coba lagi |
| Quota/maintenance | “Layanan sementara tidak tersedia. Catat transaksi secara manual dan lakukan rekonsiliasi setelah pulih.” | Hubungi Owner |

---

## 5. Peta data tiap halaman (untuk handoff coding)

| Page | Input / filter | Data source | Mutation | Export |
|---|---|---|---|---|
| Login | email, password | Supabase Auth + profile | signIn | — |
| Dashboard | date range | secure summary RPCs | — | CSV/XLSX |
| POS | product/category, cart, payment | products/cats + checkout RPC | checkout, shift open | — |
| Orders | date, status, method, search | restricted orders API | refund owner | CSV/XLSX Owner/Admin |
| Order Detail | order ID | restricted detail query | refund owner / print | Print receipt |
| Products | search/category/status | products + owner-only costs | CRUD/status | — |
| Categories | search | categories | create/edit/deactivate | — |
| Promo | search/status | promotions | create/edit | usage export via Reports |
| Finance Overview | date range | finance summary RPC owner | — | CSV/XLSX |
| Income | date/type/account | other_inflows | post/reverse | CSV/XLSX |
| Expenses | date/category/treatment | expenses | post/reverse | CSV/XLSX |
| Cash Flow | date/account | cash_movement report RPC | — | CSV/XLSX |
| Sales Analytics | date/category/method | grouped sales RPC | — | CSV/XLSX |
| Product Analytics | date/category/sort | ranked products RPC | — | CSV/XLSX |
| Reports | type/range/group | report RPC | generate files | CSV/XLSX |
| Shifts | date/cashier | shifts + payments + movements | open/close/adjust | CSV/XLSX Owner/Admin |
| Profile | profile | profile/Auth | update profile | — |
| Store | store ID | store_settings | owner update | — |
| Users | role/status | owner-safe profiles | deactivate trusted flow | — |

**Query rule:** all list/report API calls should include server-side scopes and filters; do not fetch restricted rows and filter them in JS.

---

## 6. Analytics UI & truthfulness

### 6.1 Required labels

Use **“Penjualan Bersih”**, **“Laba Kotor Estimasi”**, **“Laba Operasional Estimasi”**, **“Arus Kas Bersih”** rather than generic “Pendapatan” everywhere.

- `Penjualan Bersih`: net sale events, including discounts and refund events for period.
- `Laba Kotor`: net sales − HPP snapshot of items sold (with refund reversal).
- `Laba Operasional`: laba kotor − expense operasional.
- `Arus Kas Bersih`: cash inflow − outflow, **includes owner deposits and inventory purchase**.

### 6.2 Date-range pattern

A single `DateRangeFilter` reusable across dashboard, expenses, analytics, reports. Controls: `Hari Ini`, `Minggu Ini`, `Bulan Ini`, `Tahun Ini`, `Custom`. In reports also grouping day/week/month/year. Display `Zona waktu: WIB` once in filter or tooltip. The label and export filename use business dates selected.

### 6.3 Chart interactions

- X axis shows unit periods clearly; Y axis compact Rupiah (`Rp500rb`, `Rp1jt`) with exact `Rp1.234.567` tooltip.
- Hover/focus tooltip accessible; bars and lines have legends and textual table equivalent below where possible.
- Empty chart uses zero-state component, not flat lines that mislead the user.
- Comparisons only shown if previous range is meaningful; avoid showing 100% growth from a 0 base.

---

## 7. Export visual and technical handoff

**Buttons**: export dropdown accessible from relevant page, with `CSV (.csv)` and `Excel (.xlsx)`. Reports center has two explicit buttons.

**File content checklist:**

- Same applied date range, filters, role, timezone as screen.
- Full filtered data, not only paginated rows.
- Proper numeric data for money in Excel.
- Safe text escaping to prevent spreadsheet formula injection.
- Filename describes type/range; Excel workbook includes summary+details if relevant.
- `Pemasukan` report means **non-sales inflow** and cash-flow separately; avoid implying manual income equals revenue.

**Export states:** `Menyiapkan...` disabled double click, progress row count if practical, download success; error toast with retry. If count > threshold, show guidance to shorten range.

---

## 8. Accessibility & interactions

- Keyboard: Tab navigation, Enter/Space button, Escape to close modal; manage focus on open/close.
- Error text `aria-describedby`, inputs have accessible labels.
- Disabled product marked by text and color, not color alone.
- Charts include associated summary table or screen-reader description.
- Confirm destructive actions with short specific copy; don't use generic “Are you sure?” only.
- Touch tap targets >=44px in POS.
- Small screen financial tables: stacked rows or horizontal scroll with first column sticky when helpful; user must always see totals.
- Ensure document title changes per route (`Coffee POS — Pesanan`).
- Animation subtle (<250ms typical) and respect prefers-reduced-motion.

---

## 9. Mock data & preview contract

Mock data may be used for design screenshots and development storybook-style previews, but must be easy to replace through typed feature APIs. **Do not** hardcode example sales amounts inside production components.

**Illustrative product seed (can be replaced by owner):**

- Minuman: Americano, Kopi Susu, Latte, Matcha Latte.
- Snack: Cookies Classic, French Fries, Brownies.
- Makanan: Nasi Goreng, Chicken Rice.

**Illustrative sample report (fake/demo only):**

- Sale cash: Americano 2×18k, discount 6k, net 30k, item cost total 16k, gross profit 14k.
- Cash tendered 50k → change 20k; drawer net increase 30k.
- Setoran modal 100k → cash increase, sales/profit unchanged.
- Pembelian bahan untuk stok 500k → cash out, no additional operating expense (HPP already item-based).

When demo data is visible, label it **“Contoh Data”** and remove from production once real records exist.

---

## 10. Agent handoff checklist

### AI Design Agent — completion checklist

- [ ] All PRD routes have wireframes and states.
- [ ] Owner/Admin/Cashier sidebar differs correctly.
- [ ] Login → Dashboard/POS role landing is visible in screen flow.
- [ ] POS end-to-end shows cart, promo, method selection, confirmation and success.
- [ ] Finance clearly differentiates sales, gross profit, operating profit, cash flow.
- [ ] All eligible reports expose CSV and XLSX exports.
- [ ] Refund/modal and cash reconciliation have explicit confirmation.
- [ ] Design is tablet usable and accessible.
- [ ] BoardUI Free components/tokens identified; no Pro assumptions.

### AI Coding Agent — completion checklist

- [ ] Reused BoardUI components and token system, rather than ad-hoc redesign.
- [ ] Every route enforces frontend role access; RLS/RPC enforces backend permission.
- [ ] Forms have errors, in-progress, success, empty, network error states.
- [ ] Content responsive at desktop, tablet, mobile.
- [ ] Reports/export obey same period filter and SQL financial definitions.
- [ ] Payment confirmation always awaits server.
- [ ] Demo data does not leak into production.
- [ ] Basic accessibility checks and e2e flows pass.

---

## 11. Release UI QA matrix

| Scenario | Desktop | Tablet | Mobile |
|---|:---:|:---:|:---:|
| Login, errors, disabled submit | ✓ | ✓ | ✓ |
| Owner dashboard and custom dates | ✓ | ✓ | ✓ |
| Cashier catalog & cart | ✓ | ✓ | ✓ |
| Checkout cash/QRIS manual/transfer manual | ✓ | ✓ | ✓ |
| Price-change/expired-promo messages | ✓ | ✓ | ✓ |
| Orders table/detail/receipt | ✓ | ✓ | ✓ |
| Product create/edit form | ✓ | ✓ | ✓ |
| Finance overview/expenses/income/cash flow | ✓ | ✓ | ✓ |
| Charts with tooltip & no-data state | ✓ | ✓ | ✓ |
| Reports CSV/XLSX filters | ✓ | ✓ | ✓ |
| Shift open/close and variance dialog | ✓ | ✓ | ✓ |
| Offline banner/retry & 403/404 | ✓ | ✓ | ✓ |

---

## 12. Design-system reference

- BoardUI Getting Started: https://www.boardui.com/getting-started
- BoardUI Components: https://www.boardui.com/components
- BoardUI free source: https://github.com/BoardUI/boardui
- Tailwind CSS: https://tailwindcss.com/docs
- Recharts: https://recharts.org/

## 13. Must Install for code
- npx boardui@latest init
- codex mcp add boardui -- npx -y boardui@latest mcp
- npx boardui@latest skill --client codex
- https://www.boardui.com/mcp