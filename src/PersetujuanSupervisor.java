
public class PersetujuanSupervisor {
    private String nomorPengajuan;
    private String namaSupervisor;
    private String catatan;
    private String jenisPengajuan;
    private String keputusan;
    private String status;

    public PersetujuanSupervisor(String nomorPengajuan,
                                 String namaSupervisor,
                                 String jenisPengajuan) {
        this.nomorPengajuan = nomorPengajuan;
        this.namaSupervisor = namaSupervisor;
        this.jenisPengajuan = jenisPengajuan;
        this.status = "Menunggu Supervisor";
    }

    public void setujui(String catatan) {
        if (!validasiCatatan(catatan)) {
            return;
        }

        this.catatan = catatan;
        this.keputusan = "Setuju";

        if (jenisPengajuan.equalsIgnoreCase("Cuti")) {
            status = "Menunggu HR";
        } else if (jenisPengajuan.equalsIgnoreCase("Reimbursement")) {
            status = "Menunggu Finance";
        } else {
            status = "Menunggu Pemeriksa Berikutnya";
        }

        System.out.println("Pengajuan berhasil disetujui.");
    }

    public void tolak(String catatan) {
        if (!validasiCatatan(catatan)) {
            return;
        }

        this.catatan = catatan;
        this.keputusan = "Tolak";
        this.status = "Ditolak";

        System.out.println("Pengajuan berhasil ditolak.");
    }

    public void kembalikan(String catatan) {
        if (!validasiCatatan(catatan)) {
            return;
        }

        this.catatan = catatan;
        this.keputusan = "Kembalikan";
        this.status = "Dikembalikan untuk Perbaikan";

        System.out.println("Pengajuan dikembalikan untuk perbaikan.");
    }

    private boolean validasiCatatan(String catatan) {
        if (catatan == null || catatan.trim().isEmpty()) {
            System.out.println("Catatan pemeriksa wajib diisi.");
            return false;
        }
        return true;
    }

    public String getNomorPengajuan() {
        return nomorPengajuan;
    }

    public String getNamaSupervisor() {
        return namaSupervisor;
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
