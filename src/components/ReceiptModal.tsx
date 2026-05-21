import { useState, useEffect } from 'react';
import { X, Printer, Download, GraduationCap, UserCheck } from 'lucide-react';
import { Pendaftar } from '../types';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface ReceiptModalProps {
  pendaftar: Pendaftar | null;
  onClose: () => void;
}

export default function ReceiptModal({ pendaftar, onClose }: ReceiptModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    if (pendaftar?.id) {
      const verifikasiUrl = `https://spmb-2026-smpn-1-manonjaya.vercel.app/verifikasi/${pendaftar.id}`;
      QRCode.toDataURL(verifikasiUrl, {
        width: 256,
        margin: 1,
        color: {
          dark: '#1e293b', // slate-800
          light: '#ffffff' // white
        }
      })
        .then((url) => {
          setQrCodeUrl(url);
          console.log(`DEBUG [SPMB]: Dynamic QR Code generated successfully for ID ${pendaftar.id}`);
        })
        .catch((err) => {
          console.error('DEBUG [SPMB]: Failed to generate QR Code:', err);
        });
    }
  }, [pendaftar?.id]);

  if (!pendaftar) return null;

  const handlePrint = () => {
    try {
      window.print();
    } catch (err: any) {
      alert('Pencetakan gagal atau tidak didukung di perangkat Anda: ' + err.message);
    }
  };

  const handleDownloadPDF = async () => {
    // Target the fixed-dimensions offscreen container for pixel perfect PDF
    const element = document.getElementById('pdf-export-target');
    if (!element) {
      console.error('Element #pdf-export-target not found');
      return;
    }

    setDownloading(true);
    setPdfError(null);
    console.log('DEBUG [SPMB]: Initiating high-resolution PDF download via offscreen target...');

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // High DPI for crystal clear text and graphics
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width inside PDF (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');

      const fileName = `Bukti_Pendaftaran_${pendaftar.id}_${pendaftar.siswa.namaLengkap.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
      console.log('DEBUG [SPMB]: A4 PDF exported successfully:', fileName);
    } catch (err: any) {
      console.error('DEBUG [SPMB]: A4 PDF generation failure:', err);
      setPdfError('Gagal mendownload PDF di peramban ini. Silakan gunakan tombol "Cetak" konvensional.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div id="receipt-modal-overlay" className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-xs print:p-0 print:bg-white print:absolute print:inset-0">
      <div 
        id="receipt-modal-container"
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:w-full print:rounded-none print:border-none print:m-0 print:p-0"
      >
        {/* Modal Toolbar (hidden in printed document) */}
        <div className="bg-slate-50 px-6 py-4 border-b border-rose-100 flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Bukti Pendaftaran Resmi</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              id="btn-pdf-action"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Mengunduh...' : 'Unduh PDF'}</span>
            </button>
            <button
              onClick={handlePrint}
              id="btn-print-action"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
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

        {pdfError && (
          <div className="bg-red-50 text-red-700 px-6 py-2.5 text-xs font-semibold text-center border-b border-red-100 print:hidden">
            ⚠️ {pdfError}
          </div>
        )}

        {/* PRINTABLE AREA CONTENT (RESPONSIVE IN MODAL VIEW) */}
        <div 
          id="print-proof-sheet"
          className="p-6 sm:p-10 font-sans text-slate-800 overflow-y-auto flex-1 bg-white print:p-0 print:overflow-visible print:max-h-full"
        >
          {/* Official Letterhead */}
          <div className="border-b-4 border-double border-slate-950 pb-5 mb-6 text-center">
            <div className="flex items-center justify-center gap-4">
              {/* Seal Cap Mock */}
              <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold shrink-0">
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

            {/* Logo/QR Code alignment */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-150 rounded-2xl gap-4 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-slate-400">QR CODE VALIDATOR</span>
              
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code Verifikasi" 
                  className="w-28 h-28 bg-white p-2 rounded-lg border border-slate-200"
                />
              ) : (
                <div className="w-28 h-28 bg-white flex items-center justify-center rounded-lg border border-slate-200 animate-pulse text-[10px] font-mono text-slate-400">
                  Membuat QR...
                </div>
              )}
              
              <p className="text-[9px] text-center text-slate-400 font-mono italic max-w-[150px]">
                Pindai sandi QR di atas untuk verifikasi otentikasi pangkalan data sekolah.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-8">
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
              <span className="block text-slate-500 font-medium">Manonjaya, {new Date(pendaftar.timestamp || Date.now()).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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

      {/* FIXED OFFSCREEN TARGET FOR HTML2CANAS A4 CONVERSION (794px equivalent to A4 width at 96 DPI) */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '794px', height: 'auto', overflow: 'visible' }}>
        <div 
          id="pdf-export-target"
          style={{ width: '794px', padding: '40px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
          className="font-sans text-slate-800 text-sm"
        >
          {/* Official Letterhead */}
          <div className="border-b-4 border-double border-slate-950 pb-5 mb-6 text-center">
            <div className="flex items-center justify-center gap-4">
              {/* Seal Cap Mock */}
              <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                <GraduationCap className="w-10 h-10" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold tracking-widest text-slate-800 uppercase">PEMERINTAH KABUPATEN TASIKMALAYA</h4>
                <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">DINAS PENDIDIKAN DAN KEBUDAYAAN</h1>
                <h2 className="text-base font-extrabold text-blue-800 leading-tight border-b border-slate-200 pb-0.5">SMP NEGERI 1 MANONJAYA</h2>
                <p className="text-[9px] text-slate-500 font-medium">Jl. Jend. Urip Sumoharjo No.54, Manonjaya, Kab. Tasikmalaya, Jawa Barat 46161</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-sm font-bold tracking-wider uppercase text-slate-900 underline">KARTU BUKTI PENDAFTARAN PPDB ONLINE</h3>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Tahun Ajaran 2026/2027</p>
          </div>

          {/* Registration Code Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Nomor Registrasi Siswa</span>
              <p className="text-lg font-black text-blue-700 tracking-wider font-mono">{pendaftar.id}</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Jalur Pilihan</span>
              <p className="text-xs font-extrabold text-indigo-700 uppercase tracking-wide">{pendaftar.jalur}</p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-12 gap-6 items-start mb-6 text-xs">
            <div className="col-span-8 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 font-mono">Biodata Calon Siswa</h4>
              
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
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">Alamat Rumah</span>
                <span className="col-span-2 font-medium text-slate-700 leading-relaxed">: {pendaftar.siswa.alamatLengkap}</span>
              </div>

              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 pt-2 font-mono">Biodata Wali</h4>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold">Orang Tua / Wali</span>
                <span className="col-span-2 font-semibold text-slate-800">: Bpk. {pendaftar.orangTua.namaAyah} / Ibu {pendaftar.orangTua.namaIbu}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500 font-semibold font-mono">No HP Ortu</span>
                <span className="col-span-2 font-mono font-bold text-slate-700">: {pendaftar.orangTua.noHpOrtu}</span>
              </div>
            </div>

            {/* QR Code section */}
            <div className="col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-xl gap-3">
              <span className="text-[9px] font-bold uppercase tracking-widest font-mono text-slate-400">QR CODE VALIDATOR</span>
              
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code Verifikasi" 
                  className="w-24 h-24 bg-white p-2 rounded-lg border border-slate-200"
                />
              ) : (
                <div className="w-24 h-24 bg-white flex items-center justify-center rounded-lg border border-slate-200 text-[9px] font-mono text-slate-400">
                  Membuat...
                </div>
              )}
              
              <p className="text-[8px] text-center text-slate-400 font-mono italic max-w-[130px]">
                Pindai sandi QR di atas untuk verifikasi otentikasi pangkalan data sekolah.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mb-6 text-xs text-slate-600">
            <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 font-mono">Catatan Dan Petunjuk Daftar Ulang:</h4>
            <ul className="list-decimal list-inside space-y-0.5 font-medium">
              <li>Kartu Bukti ini berkekuatan hukum sementara dan wajib dibawa saat seleksi fisik.</li>
              <li>Siswa diwajibkan menyiapkan fotokopi dokumen penunjang (KK, Akta, Ijazah).</li>
              <li>Lihat jadwal pencocokan berkas asli di menu Linimasa program SPMB.</li>
            </ul>
          </div>

          {/* validation footer */}
          <div className="grid grid-cols-2 gap-4 items-end mt-10 text-xs">
            <div className="text-center">
              <span className="block italic text-slate-400">Tanda Tangan Ortu / Wali</span>
              <div className="h-12"></div>
              <span className="block font-bold text-slate-800 underline">_____________________</span>
              <span className="block text-[9px] text-slate-400">Nama Terang</span>
            </div>
            <div className="text-center">
              <span className="block text-slate-500 font-medium font-mono">Manonjaya, {new Date(pendaftar.timestamp || Date.now()).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="block font-semibold text-slate-600">Panitia SPMB SMPN 1 Manonjaya</span>
              <div className="h-12 flex items-center justify-center relative">
                <div className="absolute border-2 border-dashed border-blue-500/35 text-blue-500/40 font-black text-[9px] tracking-widest uppercase py-0.5 px-1.5 rounded rotate-[-12deg] pointer-events-none select-none">
                  SMPN 1 MANONJAYA VALID
                </div>
              </div>
              <span className="block font-bold text-blue-950 underline">PANITIA PENERIMAAN</span>
              <span className="block text-[9px] font-bold text-slate-400 font-mono">NIP. 19780512 200801 1 012</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

