import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, AlertCircle, FileText, Calendar, ShieldCheck } from 'lucide-react';
import { FAQItem } from '../types';

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqList: FAQItem[] = [
    {
      question: 'Bagaimana cara mendaftarkan siswa baru secara online di SMPN 1 Manonjaya?',
      answer: 'Caranya sangat mudah: 1) Masuk ke menu "Pendaftaran", 2) Isi formulir lengkap mencakup Data Siswa, Data Orang Tua, dan pilihan Jalur, 3) Unggah hasil scan KK, Akta Lahir, dan Pas Foto resmi, 4) Periksa kembali lalu kirim. Setelah terkirim, Anda akan mendapatkan Nomor Registrasi untuk diunduh sebagai bukti pendaftaran.'
    },
    {
      question: 'Apa saja berkas utama yang wajib disiapkan dan diunggah?',
      answer: 'Berkas wajib yang perlu diunggah antara lain: Kartu Keluarga (KK) asli, Akta Kelahiran asli, dan Pas Foto resmi siswa berwarna dengan seragam SD. Opsional: Sertifikat/Piagam kejuaraan jika mendaftar lewat jalur Prestasi. File harus berformat PDF, JPG, atau PNG dengan ukuran maksimal masing-masing berkas 2 MB.'
    },
    {
      question: 'Bagaimana jika saya lupa atau kehilangan Nomor Pendaftaran siswa?',
      answer: 'Anda tidak perlu panik. Anda dapat mengecek status pendaftaran dengan menggunakan Nomor Indul Siswa Nasional (NISN) 10 digit di menu "Cek Status" halaman utama. Sistem kami akan mendeteksi NISN dan menampilkan kembali data bukti registrasi anak Anda.'
    },
    {
      question: 'Apakah calon peserta didik boleh mendaftar lebih dari satu jalur seleksi?',
      answer: 'Tidak boleh. Setiap akun pendaftar / nomor NISN hanya berhak memilih satu jalur pendaftaran utama dalam satu masa pendaftaran. Pilihlah jalur yang paling sesuai dengan domisili atau prestasi yang dimiliki putra-putri Anda.'
    },
    {
      question: 'Berapa lama proses verifikasi berkas pendaftaran dilakukan?',
      answer: 'Proses pencocokan dan pengabsahan berkas oleh Panitia Pembimbing PPDB SMPN 1 Manonjaya memakan waktu maksimal 2x24 jam kerja. Anda dapat memantau perkembangan status verifikasi pendaftaran di menu "Cek Status" secara berkala.'
    },
    {
      question: 'Bagaimana proses pencocoan zonasi dalam Jalur Domisili?',
      answer: 'Panitia menggunakan sistem penentuan koordinat jarak domisili tinggal pendaftar sesuai alamat lengkap yang tercantum di KK menuju ke gerbang utama sekolah SMPN 1 Manonjaya. Usahakan mengunggah scan KK sekurangnya setahun terbit untuk keabsahan zonasi.'
    }
  ];

  return (
    <div id="faq-section-container" className="max-w-4xl mx-auto px-4 py-12">
      {/* FAQ Headings */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex justify-center items-center gap-2">
          <HelpCircle className="w-8 h-8 text-blue-600" />
          <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
        </h2>
        <p className="text-slate-500 text-sm font-medium">Temukan jawaban cepat atas pertanyaan administratif seputar penerimaan murid baru di SMPN 1 Manonjaya.</p>
      </div>

      {/* Accordion List cards */}
      <div className="space-y-4">
        {faqList.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div 
              key={idx} 
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen 
                  ? 'border-blue-400 shadow-lg shadow-blue-50/25' 
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                id={`faq-btn-${idx}`}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
              >
                <span className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                  {item.question}
                </span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isOpen ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-6 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-50 font-medium">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bantuan contact bottom card */}
      <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm shadow-blue-50">
        <h3 className="font-bold text-slate-800 text-lg">Masih Menghadapi Masalah Administrasi?</h3>
        <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-xl mx-auto">
          Jika Anda mengalami kesulitan teknis dalam pengunggahan berkas atau memiliki pertanyaan spesifik lainnya, hubungi Panitia PPDB Online SMPN 1 Manonjaya melalui layanan WhatsApp Center kami.
        </p>
        <div className="pt-2">
          <a
            href="https://wa.me/6281234567890?text=Halo%20Panitia%20PPDB%20SMPN%201%20Manonjaya,%20saya%20terkendala%20saat%20pendaftaran"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-100 hover:shadow-emerald-200 active:scale-95 transition-all text-sm"
          >
            Hubungi Panitia WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
