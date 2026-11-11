
import java.time.LocalDate;

public class PengajuanCuti {
    private String nomorPengajuan;
    private String namaPemohon;
    private String jenisCuti;
    private String judul;
    private LocalDate tanggalMulai;
    private LocalDate tanggalSelesai;
    private String keterangan;
    private String dokumenPendukung;
    private String status;

    public PengajuanCuti(String nomorPengajuan, String namaPemohon,
                         String jenisCuti, String judul,
                         LocalDate tanggalMulai, LocalDate tanggalSelesai,
                         String keterangan, String dokumenPendukung) {
        this.nomorPengajuan = nomorPengajuan;
        this.namaPemohon = namaPemohon;
        this.jenisCuti = jenisCuti;
        this.judul = judul;
        this.tanggalMulai = tanggalMulai;
        this.tanggalSelesai = tanggalSelesai;
        this.keterangan = keterangan;
        this.dokumenPendukung = dokumenPendukung;
        this.status = "Draft";
    }

    public void simpanDraft() {
        status = "Draft";
        System.out.println("Draf cuti berhasil disimpan.");
    }

    public void ajukanCuti() {
        if (judul == null || judul.isEmpty()
                || keterangan == null || keterangan.isEmpty()
                || tanggalMulai == null || tanggalSelesai == null) {
            System.out.println("Data cuti belum lengkap.");
            return;
        }

        if (tanggalSelesai.isBefore(tanggalMulai)) {
            System.out.println("Tanggal selesai tidak boleh sebelum tanggal mulai.");
            return;
        }

        status = "Menunggu Supervisor";
        System.out.println("Pengajuan cuti berhasil dikirim.");
    }

    public String getStatus() {
        return status;
    }

    public String getNomorPengajuan() {
        return nomorPengajuan;
    }

    public String getNamaPemohon() {
        return namaPemohon;
    }

    public String getJenisCuti() {
        return jenisCuti;
    }

    public String getJudul() {
        return judul;
    }

    public LocalDate getTanggalMulai() {
        return tanggalMulai;
    }

    public LocalDate getTanggalSelesai() {
        return tanggalSelesai;
    }

    public String getKeterangan() {
        return keterangan;
    }

    public String getDokumenPendukung() {
        return dokumenPendukung;
    }
}
