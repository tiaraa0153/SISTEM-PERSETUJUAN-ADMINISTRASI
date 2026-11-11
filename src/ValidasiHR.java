
public class ValidasiHR {
    private String nomorPengajuan;
    private String namaHR;
    private boolean identitasSesuai;
    private boolean periodeSesuai;
    private boolean dokumenTerbaca;
    private String catatan;
    private String keputusan;
    private String status;

    public ValidasiHR(String nomorPengajuan, String namaHR) {
        this.nomorPengajuan = nomorPengajuan;
        this.namaHR = namaHR;
        this.status = "Menunggu HR";
    }

    public void periksaDokumen(boolean identitas,
                               boolean periode,
                               boolean dokumen) {
        this.identitasSesuai = identitas;
        this.periodeSesuai = periode;
        this.dokumenTerbaca = dokumen;

        System.out.println("Pemeriksaan dokumen HR selesai.");
    }

    public void setujuiAkhir(String catatan) {
        if (!identitasSesuai || !periodeSesuai || !dokumenTerbaca) {
            System.out.println("Daftar pemeriksaan belum lengkap.");
            return;
        }

        if (catatan == null || catatan.trim().isEmpty()) {
            System.out.println("Catatan HR wajib diisi.");
            return;
        }

        this.catatan = catatan;
        this.keputusan = "Setuju";
        this.status = "Disetujui";

        System.out.println("Pengajuan berhasil disetujui oleh HR.");
    }

    public void tolak(String catatan) {
        if (catatan == null || catatan.trim().isEmpty()) {
            System.out.println("Alasan penolakan wajib diisi.");
            return;
        }

        this.catatan = catatan;
        this.keputusan = "Tolak";
        this.status = "Ditolak";

        System.out.println("Pengajuan ditolak oleh HR.");
    }

    public void kembalikan(String catatan) {
        if (catatan == null || catatan.trim().isEmpty()) {
            System.out.println("Instruksi perbaikan wajib diisi.");
            return;
        }

        this.catatan = catatan;
        this.keputusan = "Kembalikan";
        this.status = "Dikembalikan untuk Perbaikan";

        System.out.println("Pengajuan dikembalikan oleh HR.");
    }

    public String getNomorPengajuan() {
        return nomorPengajuan;
    }

    public String getNamaHR() {
        return namaHR;
    }

    public String getCatatan() {
        return catatan;
    }

    public String getKeputusan() {
        return keputusan;
    }

    public String getStatus() {
        return status;
    }
}
