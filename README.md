# SISTEM-PERSETUJUAN-ADMINISTRASI
Project Java Sistem Manajemen Persetujuan Administrasi Berjenjang

## Prototipe antarmuka HTML

Buka `login.html` atau `index.html` di browser. Halaman `atasan.html`,
`pemohon.html`, `hr.html`, dan `finance.html` mengarah ke aplikasi yang sama;
menu dan data ditentukan oleh akun yang masuk. Tidak ada pemilih peran di sidebar.
Seluruh halaman memakai gaya ungu, komponen, serta ikon dari halaman atasan awal.

Untuk mencoba melalui server lokal, jalankan `node serve.cjs`, lalu buka
<http://127.0.0.1:8080/login.html>. Tidak perlu memasang dependensi.

| Akun | NIP | Kata sandi demo | Menu utama |
| --- | --- | --- | --- |
| Budi Santoso | KRY-001 | Budi123! | Pengajuan |
| Siti Handayani | KRY-002 | Siti123! | Pengajuan saya |
| Mira Lestari | KRY-003 | Mira123! | Antrian Approval |
| Nadya Putri | KRY-004 | Nadya123! | Antrian Approval, laporan akhir |
| Wira Aditya | KRY-101 | Wira123! | Pengajuan masuk |
| Laras Utami | KRY-102 | Laras123! | Pengajuan masuk |

Login juga menerima email contoh yang ditampilkan pada Profil saya. Tombol akun
contoh di halaman login hanya mengisi kredensial; pengguna tetap menekan Masuk.
Keluar terlebih dahulu sebelum mencoba akun lain. Sesi masuk disimpan per tab.

### Menu dan daftar pengajuan

- **Pemohon:** menu Pengajuan memuat kartu total dan status, tab Pengajuan baru
  untuk draf/pengajuan aktif/perlu perbaikan, serta tab Riwayat pengajuan untuk
  pengajuan yang telah disetujui akhir atau ditolak.
- **Supervisor:** satu menu Pengajuan saya memuat dua tab pengajuan pribadi di
  atas, serta tab Persetujuan tim dan Riwayat keputusan untuk tugas pemeriksa.
- **HR dan Finance:** antrean dan riwayat keputusan berada dalam satu menu
  Antrian Approval, dengan tab Menunggu pemeriksaan dan Riwayat keputusan.
- **Manager dan Direktur:** antrean serta riwayat keputusan berada dalam satu
  menu Pengajuan masuk dengan dua tab yang sama.

Formulir bukan menu sidebar. Pemohon dan Supervisor membukanya melalui tombol
**Pengajuan baru** pada halaman daftar. Setelah draf disimpan atau pengajuan
dikirim, aplikasi membuka kembali tab Pengajuan baru, menghapus filter sebelumnya,
dan memperbarui daftar serta kartu statistik. Tombol Kembali ke daftar tersedia
pada halaman formulir. Menu induk tetap ditandai aktif selama formulir terbuka.

Tab mendukung tombol panah kiri/kanan, Home, dan End. Pilihan tab disimpan pada
URL sehingga muat ulang dan navigasi kembali browser mempertahankan tab tersebut.
Tautan lama ke beranda atau riwayat tetap diarahkan ke halaman daftar gabungan.

### Alur pengajuan

- Sesuai instruksi pengguna, **semua jenis pengajuan pribadi Supervisor langsung
  ke HR**, termasuk pengajuan keuangan dan operasional. Supervisor tidak dapat
  memeriksa pengajuan miliknya sendiri.
- Pengajuan staf mengikuti rancangan PDF: cuti/lembur/izin melalui Supervisor → HR;
  reimbursement/pengajuan biaya melalui Supervisor → Finance; perjalanan dinas,
  pembelian barang, dan kebutuhan operasional melalui Supervisor → Manager → Direktur.
- Pengajuan yang dikembalikan diperbaiki oleh pemiliknya dan dikirim ulang ke
  tahap yang meminta perbaikan. Jenis, jalur, dan riwayat awal tetap dipertahankan.
- Catatan wajib untuk setiap keputusan. Persetujuan akhir HR dan Finance juga
  mewajibkan seluruh daftar periksa. Riwayat memisahkan keputusan pemeriksa dari
  status terkini dokumen. Laporan akhir hanya tersedia untuk akun Finance.

Formulir menyediakan delapan jenis pengajuan pada rancangan, simpan draf,
unggah/unduh PDF atau JPG maksimal 5 MB per berkas, serta validasi tanggal,
jam, jumlah, dan nominal. Pencarian, filter jenis/status/tanggal, pengurutan,
notifikasi, profil, dan ekspor CSV menggunakan data yang boleh dilihat akun aktif.

### Penyimpanan dan cakupan

Ini adalah prototipe frontend lokal, belum terhubung ke kelas Java, database,
atau layanan autentikasi server. Kredensial demo terlihat di sumber dan tidak
boleh dipakai untuk sistem produksi. Pembatasan peran pada antarmuka harus
diterapkan kembali di backend saat integrasi.

Pengajuan dan keputusan disimpan di `localStorage`, lampiran di `IndexedDB`,
dan akun aktif di `sessionStorage`. Bila penyimpanan diblokir atau penuh, halaman
menampilkan keterbatasannya. Gunakan browser, profil browser, dan alamat yang sama
untuk mencoba alur lintas akun. Tombol **Pulihkan data contoh** mereset perubahan
semua akun setelah konfirmasi. Data dari prototipe `atasan.html` versi pertama
tidak dihapus atau ditimpa.

Rujukan: `Rancangan_Layar_RPL_Kelompok_4 (2).pdf`, terutama halaman 4, 6,
8–17, dan 21–29. Aturan semua pengajuan pribadi Supervisor langsung ke HR
mengikuti klarifikasi pengguna dan merupakan pengecualian terhadap alur umum PDF.
