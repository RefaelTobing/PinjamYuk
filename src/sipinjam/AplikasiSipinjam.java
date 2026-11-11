package sipinjam;

import javax.swing.SwingUtilities;
import javax.swing.UIManager;

import sipinjam.tampilan.FormLogin;
import sipinjam.tampilan.KomponenUI;

/** Kelas utama aplikasi SIPINJAM. */
public class AplikasiSipinjam {

    public static void main(String[] args) {
        String folderData = "data";
        for (int i = 0; i < args.length - 1; i++) {
            if ("--data".equals(args[i])) {
                folderData = args[i + 1];
            }
        }

        KomponenUI.pasangTema();
        final KonteksAplikasi konteks = new KonteksAplikasi(folderData);

        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                try {
                    UIManager.setLookAndFeel("javax.swing.plaf.nimbus.NimbusLookAndFeel");
                } catch (Exception e) {
                    KomponenUI.pasangTema();
                }
                new FormLogin(konteks).setVisible(true);
            }
        });
    }
}
