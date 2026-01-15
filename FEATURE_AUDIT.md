# Audit & Upgrade Plan: FlyHan Application

Berdasarkan review kode pada fitur `Flights` dan `Checkout`, aplikasi saat ini sudah fungsional sebagai MVP (_Minimum Viable Product_), namun masih memiliki beberapa kekurangan mendasar dibandingkan standar aplikasi _Online Travel Agent_ (OTA).

Berikut adalah saran upgrade untuk memperkuat fitur yang sudah ada agar lebih _"kompleks"_ dan _robust_:

## 1. Upgrade Search Form (Prioritas Utama)

Saat ini formulir pencarian perjalanan sangat sederhana hanya mencakup _Departure_, _Arrival_, dan _Date_.

**Kekurangan:**

- **Tidak ada Jumlah Penumpang:** User tidak bisa menentukan di awal berapa tiket yang dicari. Jika user butuh 5 tiket tapi sisa kursi hanya 2, user baru akan sadar saat checkout (gagal).
- **Tidak ada Pilihan Kelas:** User harusnya bisa filter _Economy, Business, First_ sejak awal.
- **Single Trip Only:** Belum support _Round Trip_ (Pulang-Pergi).

**Saran Implementasi:**

- Tambahkan **Counter Input** untuk Guest/Passenger (Adult/Child/Infant).
- Tambahkan **Dropdown Class** pada form pencarian.
- Validasi hasil pencarian agar hanya menampilkan penerbangan yang memiliki sisa kursi >= jumlah penumpang yang dicari.

## 2. Admin Flight Management (Seat Generator)

Fitur `Create Flight` di admin tampaknya mengharuskan admin menginput konfigurasi kursi secara manual (JSON atau string). Ini sangat rawan kesalahan dan menyulitkan admin.

**Saran Implementasi:**

- Buat **Visual Seat Generator UI**.
- Admin cukup input:
  - Jumlah Baris (misal: 30)
  - Layout Kolom (misal: "ABC-DEF" untuk 3-3, atau "AC-DF" untuk 2-2)
- Sistem akan otomatis men-generate ratusan kursi (1A, 1B... 30F) tanpa admin perlu mengetik satu-satu.

## 3. Booking Reliability (Seat Locking)

Saat ini sistem menggunakan prinsip "Siapa Cepat Dia Dapat" hingga detik terakhir pembayaran/checkout.

**Kekurangan:**

- **Race Condition:** Jika User A dan User B memilih kursi "1A" secara bersamaan dan masuk ke checkout, keduanya bisa mengisi data. Namun user yang klik "Pay" belakangan akan error. Ini pengalaman pengguna yang buruk.

**Saran Implementasi:**

- **Seat Locking / Hold System:** Saat User A memilih kursi dan klik "Lanjut ke Checkout", status kursi tersebut ditandai _ON HOLD_ di database selama 5-10 menit.
- User B akan melihat kursi tersebut sebagai _Unavailable_ selama masa hold.
- Jika User A tidak bayar dalam 10 menit, kursi otomatis dilepas kembali.

## 4. Passenger Details Complexity

Formulir data penumpang di checkout masih sangat sederhana.

**Saran Implementasi:**

- **Title Validation:** (Mr, Mrs, Ms, Mstr, Miss) sesuaikan dengan umur/gender.
- **Seat Assignment:** Pastikan data penumpang terhubung spesifik ke kursi yang dipilih (misal: Budi -> 1A, Siti -> 1B). Sekarang mungkin sudah ada, tapi perlu dipertegas UI-nya.
- **Addon per Pax:** Karena kita baru fitur Addon, pastikan Addon (misal Makanan) dipilih _per penumpang_, bukan per transaksi global, agar data manifest penerbangan akurat.

---

**Rekomendasi Langkah Awal:**
Saya menyarankan kita mulai dengan **Poin 2 (Admin Visual Seat Generator)** atau **Poin 1 (Upgrade Search Form)** karena ini adalah pondasi data yang paling sering berinteraksi dengan user.
