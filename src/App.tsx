import { useState, useEffect } from 'react';
import { Calendar, ShieldCheck, HelpCircle, Mail, MessageSquare, Landmark, ArrowRight, BookOpen, GraduationCap, CheckCircle } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import InformasiJalur from './components/InformasiJalur';
import RegistrationForm from './components/RegistrationForm';
import TrackingSection from './components/TrackingSection';
import FAQSection from './components/FAQSection';
import AdminPanel from './components/AdminPanel';
import ReceiptModal from './components/ReceiptModal';
import { Pendaftar } from './types';
import { motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'register' | 'track' | 'faq' | 'admin'>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  
  // Printable selection
  const [selectedReceipt, setSelectedReceipt] = useState<Pendaftar | null>(null);

  // Success screen after submission
  const [submissionSuccess, setSubmissionSuccess] = useState<Pendaftar | null>(null);

  // Retrieve states
  useEffect(() => {
    // Session token check
    const token = localStorage.getItem('smpn1mjy_admin_token');
    if (token === 'admin_session_token_smpn1mjy_2026') {
      setIsAdminLoggedIn(true);
    }

    // Fetch maintenance state
    fetch('/api/maintenance')
      .then(res => res.json())
      .then(data => {
        setIsMaintenance(!!data.maintenanceMode);
        setSpreadsheetUrl(data.spreadsheetUrl || '');
      })
      .catch(() => {});
  }, []);

  const handleAdminLogin = () => {
    localStorage.setItem('smpn1mjy_admin_token', 'admin_session_token_smpn1mjy_2026');
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('smpn1mjy_admin_token');
    setIsAdminLoggedIn(false);
    setActiveTab('home');
  };

  const handleToggleMaintenance = (enable: boolean) => {
    setIsMaintenance(enable);
  };

  const handleUpdateSpreadsheet = (url: string) => {
    setSpreadsheetUrl(url);
  };

  const handleRegistrationSuccess = (newRecord: Pendaftar) => {
    setSubmissionSuccess(newRecord);
    setActiveTab('home'); // Reset view state
  };

  // Timeline Vertical List Items
  const timelineEvents = [
    { title: 'Pembukaan Pendaftaran Online', date: '01 Juni - 15 Juni 2026', desc: 'Pengisian data biodata mandiri dan unggah berkas KK, Akta Lahir, serta Pas Foto resmi secara online.', status: 'mendatang' },
    { title: 'Verifikasi Fisik & Administrasi', date: '16 Juni - 20 Juni 2026', desc: 'Pencocokan dokumen asli (KK & Akta) ke ruangan verifikatur sekolah oleh orang tua calon siswa.', status: 'mendatang' },
    { title: 'Pengumuman Hasil Kelulusan', date: '25 Juni 2026', desc: 'Publikasi terbuka daftar pendaftar yang diterima secara online di dashboard SPMB sekolah.', status: 'mendatang' },
    { title: 'Daftar Ulang Siswa Baru', date: '27 Juni - 30 Juni 2026', desc: 'Penyerahan perlengkapan siswa dan pengabsahan berkas lanjutan bagi siswa yang diterima.', status: 'mendatang' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header component navigation */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdminLoggedIn={isAdminLoggedIn}
        onLogoutAdmin={handleAdminLogout}
        isMaintenance={isMaintenance}
      />

      {/* Main Container Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="space-y-12 pb-16">
            {/* HERO SECTION */}
            <Hero 
              onRegisterClick={() => {
                if (isMaintenance) {
                  alert('Sistem pendaftaran ditutup sementara (Maintenance Mode).');
                } else {
                  setActiveTab('register');
                  setSubmissionSuccess(null);
                }
              }} 
              onTrackClick={() => setActiveTab('track')} 
            />

            {/* Success message widget overlay triggers if registered successfully */}
            {submissionSuccess && (
              <div className="max-w-4xl mx-auto px-4 mt-8">
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center gap-6"
                >
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle className="w-8 h-8 font-extrabold" />
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <h3 className="text-xl font-bold text-emerald-900">Pendaftaran Siswa Berhasil Diserahkan!</h3>
                    <p className="text-sm font-semibold text-emerald-700">
                      Siswa <strong>{submissionSuccess.siswa.namaLengkap}</strong> telah terdaftar dengan Nomor Registrasi: <span className="font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-base">{submissionSuccess.id}</span>
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">Harap simpan Nomor Registrasi di atas atau download Bukti Pendaftaran di bawah untuk ditunjukkan saat verifikasi berkas.</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedReceipt(submissionSuccess)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Download Bukti (PDF)
                    </button>
                    <button
                      onClick={() => setSubmissionSuccess(null)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Selesai
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* PATHWAYS INFORMATION (4 CARDS) */}
            <InformasiJalur />

            {/* TIMELINE SECTION (SPEKTACULAR VERTICAL TIMELINE DESIGN) */}
            <section className="py-16 sm:py-20 bg-slate-50 border-t border-b border-slate-100">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    📅 Jadwal & Linimasa Pendaftaran
                  </h2>
                  <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full mt-3"></div>
                  <p className="text-slate-500 text-sm font-medium mt-2">
                    Pastikan Anda mencatat tanggal-tanggal penting di bawah ini agar pelakasanaan seleksi berkas putra-putri Anda berjalan lancar.
                  </p>
                </div>

                {/* Vertical design pathway */}
                <div className="relative border-l-2 border-slate-200/95 ml-4 sm:ml-6 space-y-12">
                  {timelineEvents.map((ev, lIdx) => (
                    <div key={lIdx} className="relative pl-8 sm:pl-10">
                      {/* Badge Circle node */}
                      <span className="absolute -left-[13px] top-1.5 w-6 h-6 rounded-full bg-white border-2 border-blue-600 text-blue-600 font-mono text-xs font-black flex items-center justify-center shadow-xs">
                        {lIdx + 1}
                      </span>
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase font-mono tracking-wider">{ev.date}</span>
                        <h3 className="font-extrabold text-slate-800 text-base sm:text-lg mt-3">{ev.title}</h3>
                        <p className="text-slate-600 text-xs sm:text-sm mt-1 mb-0.5 leading-relaxed font-semibold">{ev.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab conditionals */}
        {activeTab === 'register' && (
          <RegistrationForm 
            onSuccess={handleRegistrationSuccess}
            isMaintenance={isMaintenance}
          />
        )}

        {activeTab === 'track' && (
          <TrackingSection onSelectReceipt={setSelectedReceipt} />
        )}

        {activeTab === 'faq' && (
          <FAQSection />
        )}

        {activeTab === 'admin' && (
          <AdminPanel 
            onSelectReceipt={setSelectedReceipt}
            isAdminLoggedIn={isAdminLoggedIn}
            onAdminLoginSuccess={handleAdminLogin}
            isMaintenance={isMaintenance}
            onToggleMaintenance={handleToggleMaintenance}
            spreadsheetUrl={spreadsheetUrl}
            onUpdateSpreadsheetUrl={handleUpdateSpreadsheet}
          />
        )}
      </main>

      {/* FLOATING WHATSAPP CHAT BUTTON */}
      <a
        href="https://wa.me/6281234567890?text=Halo%20Panitia%20PPDB%2520SMPN%201%20Manonjaya,%20saya%20butuh%20informasi%20mengenai%20SPMB"
        target="_blank"
        rel="noopener noreferrer"
        id="btn-whatsapp-floating"
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        title="Hubungi Panitia"
      >
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <MessageSquare className="w-5 h-5 shrink-0" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out font-bold text-xs font-sans whitespace-nowrap">
          Hubungi Panitia (WA Center)
        </span>
      </a>

      {/* FOOTER AREA */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs sm:text-sm">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">SMPN 1 Manonjaya</h4>
                <p className="text-[10px] text-slate-500 tracking-wider font-bold">KABUPATEN TASIKMALAYA</p>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed font-medium">
              Sistem resmi pendaftaran mandiri murid baru tingkat sekolah menengah pertama. Integritas tinggi, berkeadilan, transparan, akuntabel, dan bebas dari pungutan liar.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-widest font-mono">LINK TAUTAN MENU</h4>
            <ul className="space-y-2 font-medium">
              <li><button onClick={() => { setActiveTab('home'); window.scrollTo(0,0); }} className="hover:text-blue-450 text-left transition-colors cursor-pointer">Panduan & Linimasa</button></li>
              <li><button onClick={() => { setActiveTab('register'); window.scrollTo(0,0); }} className="hover:text-blue-450 text-left transition-colors cursor-pointer">Daftar Formulir Online</button></li>
              <li><button onClick={() => { setActiveTab('track'); window.scrollTo(0,0); }} className="hover:text-blue-450 text-left transition-colors cursor-pointer">Cek Kelulusan Seleksi</button></li>
              <li><button onClick={() => { setActiveTab('faq'); window.scrollTo(0,0); }} className="hover:text-blue-450 text-left transition-colors cursor-pointer">Pertanyaan Sering Diajukan</button></li>
              <li><button onClick={() => { setActiveTab('admin'); window.scrollTo(0,0); }} className="hover:text-blue-450 text-left transition-colors cursor-pointer">Sistem Login Operator</button></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-widest font-mono">KONTAK INSTITUSI</h4>
            <ul className="space-y-2 text-slate-400 leading-relaxed font-medium">
              <li>📍 Alamat: Jl. Jend. Urip Sumoharjo No.54, Kec. Manonjaya, Kabupaten Tasikmalaya, Jawa Barat 46161</li>
              <li>📞 Telepon / Fax: (0265) 381270</li>
              <li>✉️ Surel: <a href="mailto:info@smpn1manonjaya.sch.id" className="hover:text-blue-400">info@smpn1manonjaya.sch.id</a></li>
              <li>💬 WhatsApp Center SPMB: <a href="https://wa.me/6281234567890" target="_blank" className="hover:text-blue-400 font-mono">+62 812 3456 7890</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} SMP Negeri 1 Manonjaya, Kabupaten Tasikmalaya. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="mt-1 font-mono text-[9px]">Aplikasi Web PPDB Online • Dikembangkan demi kemudahan Orang Tua Siswa SD</p>
        </div>
      </footer>

      {/* SYSTEM PRINTER MODALS */}
      <ReceiptModal 
        pendaftar={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}
