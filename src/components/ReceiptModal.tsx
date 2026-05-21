import { X, Printer, Download, Eye, GraduationCap, Calendar, UserCheck } from 'lucide-react';
import { Pendaftar } from '../types';

interface ReceiptModalProps {
  pendaftar: Pendaftar | null;
  onClose: () => void;
}

export default function ReceiptModal({ pendaftar, onClose }: ReceiptModalProps) {
  if (!pendaftar) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="receipt-modal-overlay" className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-xs">
      <div 
        id="receipt-modal-container"
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Toolbar (hidden in printed document) */}
        <div className="bg-slate-50 px-6 py-4 border-b border-rose-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Bukti Pendaftaran Resmi</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="btn-print-action"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              id="btn-close-receipt-modal"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE AREA CONTENT */}
        <div 
          id="print-proof-sheet"
          className="p-6 sm:p-10 font-sans text-slate-800 overflow-y-auto flex-1 bg-white print:p-0 print:overflow-visible print:max-h-full"
        >
          {/* Official Letterhead */}
          <div className="border-b-4 border-double border-slate-950 pb-5 mb-6 text-center">
            <div className="flex items-center justify-center gap-4">
              {/* Seal Cap Mock */}
              <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold">
                <GraduationCap className="w-10 h-10" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold tracking-widest text-slate-800 uppercase">PEMERINTAH KABUPATEN TASIKMALAYA</h4>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">DINAS PENDIDIKAN DAN KEBUDAYAAN</h1>
                <h2 className="text-lg font-extrabold text-blue-800 leading-tight">SMP NEGERI 1 MANONJAYA</h2>
                <p className="text-[10px] text-slate-500 font-medium">Jl. Jend. Urip Sumoharjo No.54, Manonjaya, Kab. Tasikmalaya, Jawa Barat 46161</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-md font-bold tracking-wider uppercase text-slate-900 underline">KARTU BUKTI PENDAFTARAN PPDB ONLINE</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Tahun Ajaran 2026/2027</p>
          </div>

          {/* Registration Code Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nomor Registrasi Siswa</span>
              <p className="text-xl font-black text-blue-700 tracking-wider font-mono">{pendaftar.id}</p>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Jalur Pilihan</span>
              <p className="text-sm font-extrabold text-indigo-700 uppercase tracking-wide">{pendaftar.jalur}</p>
            </div>
          </div>

          {/* Grid Information detail split */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start mb-8 text-xs sm:text-sm">
            {/* Table Details */}
            <div className="sm:col-span-8 space-y-3.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 font-mono">Biodata Calon Siswa</h4>
              
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">NISN Siswa</span>
                <span className="col-span-2 font-mono font-bold text-slate-800">: {pendaftar.siswa.nisn}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">Nama Lengkap</span>
                <span className="col-span-2 font-bold text-slate-900">: {pendaftar.siswa.namaLengkap}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">Jenis Kelamin</span>
                <span className="col-span-2 font-semibold text-slate-700">: {pendaftar.siswa.jenisKelamin}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">TTL</span>
                <span className="col-span-2 font-semibold text-slate-700">: {pendaftar.siswa.tempatLahir}, {pendaftar.siswa.tanggalLahir}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">Sekolah Asal</span>
                <span className="col-span-2 font-semibold text-slate-700">: {pendaftar.siswa.asalSekolah}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">No HP Kontak</span>
                <span className="col-span-2 font-mono font-bold text-slate-700">: {pendaftar.siswa.noHpSiswa}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 grid-rows-1">
                <span className="text-slate-500 font-semibold">Alamat Rumah</span>
                <span className="col-span-2 font-medium text-slate-700 leading-relaxed">: {pendaftar.siswa.alamatLengkap}</span>
              </div>

              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 pt-3 font-mono">Biodata Wali</h4>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">Orang Tua / Wali</span>
                <span className="col-span-2 font-semibold text-slate-800">: Bpk. {pendaftar.orangTua.namaAyah} / Ibu {pendaftar.orangTua.namaIbu}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold font-mono">No HP Ortu</span>
                <span className="col-span-2 font-mono font-bold text-slate-700">: {pendaftar.orangTua.noHpOrtu}</span>
              </div>
            </div>

            {/* Logo/QR Code alignment & Passport validation Photo */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-150/80 rounded-2xl gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-slate-400">QR CODE VALIDATOR</span>
              
              {/* Custom SVG QR Code for absolute fidelity */}
              <svg className="w-28 h-28 text-slate-800 bg-white p-2 rounded-lg border border-slate-200" viewBox="0 0 100 100">
                <rect x="0" y="0" width="100" height="100" fill="white" />
                {/* Simulated high density QR patterns */}
                <rect x="5" y="5" width="25" height="25" fill="#1e293b" />
                <rect x="10" y="10" width="15" height="15" fill="white" />
                <rect x="12" y="12" width="11" height="11" fill="#1e293b" />

                <rect x="70" y="5" width="25" height="25" fill="#1e293b" />
                <rect x="75" y="10" width="15" height="15" fill="white" />
                <rect x="77" y="12" width="11" height="11" fill="#1e293b" />

                <rect x="5" y="70" width="25" height="25" fill="#1e293b" />
                <rect x="10" y="75" width="15" height="15" fill="white" />
                <rect x="12" y="77" width="11" height="11" fill="#1e293b" />

                {/* Random center noise representation */}
                <rect x="40" y="40" width="10" height="10" fill="#1e293b" />
                <rect x="40" y="55" width="5" height="15" fill="#1e293b" />
                <rect x="55" y="40" width="15" height="5" fill="#1e293b" />
                <rect x="50" y="50" width="20" height="20" fill="#1e293b" />
                <rect x="55" y="55" width="10" height="10" fill="white" />
                <rect x="60" y="60" width="5" height="5" fill="#1e293b" />
                
                <rect x="35" y="10" width="5" height="20" fill="#1e293b" />
                <rect x="45" y="20" width="15" height="5" fill="#1e293b" />
                <rect x="40" y="75" width="15" height="10" fill="#1e293b" />
                <rect x="65" y="75" width="10" height="15" fill="#1e293b" />
                <rect x="75" y="55" width="15" height="5" fill="#1e293b" />
              </svg>
              
              <p className="text-[9px] text-center text-slate-400 font-mono italic max-w-[150px]">
                Pindai sandi QR di atas untuk verifikasi otentikasi pangkalan data sekolah.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-3.5 mb-8">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Catatan Dan Petunjuk Daftar Ulang:</h4>
            <ul className="list-decimal list-inside text-[10px] sm:text-xs text-slate-600 space-y-1 font-medium leading-relaxed">
              <li>Kartu Bukti ini berkekuatan hukum sementara dan wajib dibawa saat seleksi fisik.</li>
              <li>Siswa diwajibkan menyiapkan fotokopi dokumen penunjang seperti KK, Akta Lahir, dan Ijazah dalam map plastik.</li>
              <li>Lihat tanggal jadwal pencocokan berkas sesuai petunjuk jalur di menu Linimasa Beranda.</li>
            </ul>
          </div>

          {/* Validation section footer */}
          <div className="grid grid-cols-2 gap-4 items-end mt-12 text-xs sm:text-sm">
            <div className="text-center">
              <span className="block italic text-slate-400">Tanda Tangan Ortu / Wali</span>
              <div className="h-16"></div>
              <span className="block font-bold text-slate-800 underline">_____________________</span>
              <span className="block text-[10px] text-slate-400">Nama Terang</span>
            </div>
            <div className="text-center">
              <span className="block text-slate-500 font-medium">Manonjaya, {new Date(pendaftar.timestamp).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="block font-semibold text-slate-600">Panitia SPMB SMPN 1 Manonjaya</span>
              <div className="h-16 flex items-center justify-center relative">
                {/* Sealed graphic representation overlay */}
                <div className="absolute border-2 border-dashed border-blue-500/35 text-blue-500/40 font-black text-[10px] tracking-widest uppercase py-1 px-2 rounded-md rotate-[-12deg] pointer-events-none select-none">
                  SMPN 1 MANONJAYA VALID
                </div>
              </div>
              <span className="block font-bold text-blue-950 underline">PANITIA PENERIMAAN</span>
              <span className="block text-[10px] font-bold text-slate-400 font-mono">NIP. 19780512 200801 1 012</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
