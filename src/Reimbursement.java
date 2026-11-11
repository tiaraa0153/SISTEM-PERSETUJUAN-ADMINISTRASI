
import java.time.LocalDate;
import java.math.BigDecimal;

public class Reimbursement {
    private String nomorPengajuan;
    private String namaPemohon;
    private String judul;
    private LocalDate tanggalTransaksi;
    private String jenisPengeluaran;
    private BigDecimal nominalKlaim;
    private String keterangan;
    private String dokumenPendukung;
    private String status;

    public Reimbursement(String nomorPengajuan, String namaPemohon,
                         String judul, LocalDate tanggalTransaksi,
                         String jenisPengeluaran, BigDecimal nominalKlaim,
                         String keterangan, String dokumenPendukung) {
        this.nomorPengajuan = nomorPengajuan;
        this.namaPemohon = namaPemohon;
        this.judul = judul;
        this.tanggalTransaksi = tanggalTransaksi;
        this.jenisPengeluaran = jenisPengeluaran;
        this.nominalKlaim = nominalKlaim;
        this.keterangan = keterangan;
        this.dokumenPendukung = dokumenPendukung;
        this.status = "Draft";
    }

    public void simpanDraft() {
        status = "Draft";
        System.out.println("Draf reimbursement berhasil disimpan.");
    }

    public void ajukanReimbursement() {
        if (judul == null || judul.isEmpty()
                || tanggalTransaksi == null
                || jenisPengeluaran == null || jenisPengeluaran.isEmpty()
                || nominalKlaim == null || nominalKlaim.compareTo(BigDecimal.ZERO) <= 0
                || keterangan == null || keterangan.isEmpty()) {
            System.out.println("Data reimbursement belum lengkap.");
            return;
        }

        status = "Menunggu Supervisor";
        System.out.println("Pengajuan reimbursement berhasil dikirim.");
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

    public String getJudul() {
        return judul;
    }

    public LocalDate getTanggalTransaksi() {
        return tanggalTransaksi;
    }

    public String getJenisPengeluaran() {
        return jenisPengeluaran;
    }

    public BigDecimal getNominalKlaim() {
        return nominalKlaim;
    }

    public String getKeterangan() {
        return keterangan;
    }

    public String getDokumenPendukung() {
        return dokumenPendukung;
    }
}
