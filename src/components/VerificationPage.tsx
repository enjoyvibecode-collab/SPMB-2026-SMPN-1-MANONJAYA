import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  User, 
  School, 
  Compass, 
  Clock, 
  ArrowLeft, 
  Printer, 
  Loader2, 
  MessageSquare,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Pendaftar } from '../types';
import { motion } from 'motion/react';

interface VerificationPageProps {
  id: string | null;
  onBackHome: () => void;
  onOpenReceipt: (pendaftar: Pendaftar) => void;
}

export default function VerificationPage({ id, onBackHome, onOpenReceipt }: VerificationPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Pendaftar | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Nomor Registrasi tidak dispesifikasikan.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    console.log(`DEBUG [SPMB Verification]: Fetching registration code: ${id}`);
    
    // Fetch from system backend proxy route
    fetch(`/api/pendaftar/${encodeURIComponent(id)}`)
      .then(async (res) => {
        const responseData = await res.json();
        if (!res.ok) {
          throw new Error(responseData.error || 'Pendaftaran tidak ditemukan.');
        }
        return responseData;
      })
      .then((pendaftarData) => {
        console.log('DEBUG [SPMB Verification]: Valid registrant found:', pendaftarData);
        setData(pendaftarData);
      })
      .catch((err) => {
        console.error('DEBUG [SPMB Verification]: Fetching failed:', err);
        setError(err.message || 'Data pendaftaran tidak terdaftar atau belum disinkronkan.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; text: string; label: string }> = {
      Menunggu: {
        color: 'border-amber-200 text-amber-700',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        label: 'Menunggu Verifikasi Berkas Fisik'
      },
      Diverifikasi: {
        color: 'border-blue-200 text-blue-700',
        bg: 'bg-blue-50 border-blue-100',
        text: 'text-blue-800',
        label: 'Dokumen Fisik Valid (Terverifikasi)'
      },
      Diterima: {
        color: 'border-emerald-200 text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-100',
        text: 'text-emerald-800',
        label: 'Diterima Sebagai Calon Siswa Baru'
      },
      Ditolak: {
        color: 'border-red-200 text-red-700',
        bg: 'bg-red-50 border-red-100',
        text: 'text-red-800',
        label: 'Siswa Tidak Lulus Seleksi Administrasi'
      }
    };
    return configs[status] || configs['Menunggu'];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      {/* Return to Homepage Trigger */}
      <button 
        onClick={onBackHome}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs sm:text-sm font-semibold transition-colors mb-6 cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Portal PPDB
      </button>

      {/* 1. Loading State Screen */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xl shadow-slate-100/50 flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
              <GraduationCap className="w-9 h-9" />
            </div>
            <span className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md border border-slate-100 text-blue-600">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-800">Menghubungi Pangkalan Data...</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs font-semibold">
            Sistem sedang memverifikasi keabsahan Nomor Registrasi <span className="font-mono text-blue-600 font-bold">{id}</span> pada sistem SPMB SMPN 1 Manonjaya.
          </p>

          <div className="w-48 bg-slate-100 h-1.5 rounded-full mt-6 overflow-hidden relative">
            <div className="absolute bg-blue-600 top-0 bottom-0 left-0 right-0 animate-pulse rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {/* 2. Error / Not Found State Screen */}
      {!loading && error && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-rose-100 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Top header accent */}
          <div className="h-2 bg-red-600 w-full"></div>
          
          <div className="p-8 sm:p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 text-red-650 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10" />
            </div>

            <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 border border-rose-100 text-rose-800 mb-3 font-mono">
              ❌ DATA TIDAK DITEMUKAN
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Nomor Registrasi Tidak Terdaftar
            </h2>
            
            <p className="text-sm font-semibold text-slate-500 mt-2 max-w-lg leading-relaxed">
              Sistem scan berhasil diarahkan, tetapi kode pendaftaran <span className="font-mono font-bold text-red-600 bg-rose-50 px-1 py-0.5 rounded border border-rose-100">{id}</span> tidak terdaftar dalam database resmi PPDB SMP Negeri 1 Manonjaya.
            </p>

            {/* Verification Checklist helpful hints */}
            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left max-w-md w-full">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-3">Langkah Rekomendasi:</h4>
              <ul className="text-xs text-slate-600 space-y-2.5 font-medium leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-250 text-slate-600 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">1</span>
                  <span>Periksa kembali kecocokan huruf besar/kecil dan tanda hubung (contoh: <strong className="font-mono">SPMB2026-0001</strong>).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-250 text-slate-600 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">2</span>
                  <span>Jika Anda baru mendaftar, pastikan formulir pendaftaran terkirim sukses melalui internet.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-250 text-slate-600 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">3</span>
                  <span>Hubungi operator PPDB via WhatsApp Center untuk pengecekan koordinat data fisik Anda.</span>
                </li>
              </ul>
            </div>

            {/* Buttons list */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center">
              <button
                onClick={onBackHome}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer w-full"
              >
                Kembali Ke Halaman Utama
              </button>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer w-full"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                CS Operator PPDB
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Valid Registrant State Screen */}
      {!loading && !error && data && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Verified Badge banner card bg-white */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden relative">
            <div className="h-2 bg-emerald-500 w-full"></div>
            
            <div className="p-6 sm:p-8 flex flex-col items-center text-center border-b border-slate-100">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-650 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-10 h-10" />
              </div>
              
              <span className="px-3.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-full text-[10px] font-black uppercase tracking-wider font-mono">
                ✅ DATA VALID & TERVERIFIKASI
              </span>
              
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-3">
                Dokumen Registrasi SPMB Terdaftar
              </h2>
              <p className="text-xs text-slate-400 font-semibold font-mono mt-1">
                Kementerian Pendidikan • SMPN 1 Manonjaya • Tahun Ajaran 2026/2027
              </p>
            </div>

            {/* Layout Grid Details */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Header code bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl items-center text-left">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">No. Registrasi Siswa</span>
                  <span className="font-mono text-base font-black text-blue-700">{data.id}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Metode Jalur Masuk</span>
                  <span className="font-extrabold text-xs sm:text-sm text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">{data.jalur}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Status Dokumen</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${getStatusConfig(data.status).bg} ${getStatusConfig(data.status).text} border ${getStatusConfig(data.status).color}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current scale-90 animate-pulse"></span>
                    {data.status}
                  </span>
                </div>
              </div>

              {/* Status explanation block */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-mono">Penjelasan Status Administrasi:</h4>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  {getStatusConfig(data.status).label}. 
                  {data.status === 'Menunggu' && ' Berkas digital tersimpan secara daring. Silakan lakukan validasi fisik di meja pendaftaran dengan membawa Kartu Bukti ini.'}
                  {data.status === 'Diverifikasi' && ' Berkas fisik and portofolio telah dicocokkan dengan dokumen asli oleh verifikatur panitia sekolah.'}
                  {data.status === 'Diterima' && ' Selamat! Berkas kelulusan seleksi online telah diterbitkan secara resmi. Calon siswa berhak mendaftar ulang.'}
                  {data.status === 'Ditolak' && ' Berkas fisik tidak valid, tidak lengkap, atau zonasi di luar jangkauan wilayah Manonjaya.'}
                </p>
                {data.catatanAdmin && (
                  <div className="mt-3 pt-3 border-t border-slate-200/55">
                    <span className="block text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider mb-0.5">Catatan Resmi Panitia:</span>
                    <p className="text-xs italic font-bold text-indigo-900">"{data.catatanAdmin}"</p>
                  </div>
                )}
              </div>

              {/* Metadata of Student profile layout */}
              <div className="space-y-4 text-left">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-100 font-mono flex items-center gap-2">
                  <UserCheck className="w-4.5 h-4.5 text-blue-600" />
                  Profil Calon Peserta Didik
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-xs sm:text-sm items-start">
                  
                  {/* NISN */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center shrink-0 border border-slate-150">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="block text-slate-450 font-semibold text-xs leading-none">NISN Sekolah</span>
                      <span className="font-mono font-bold text-slate-850 mt-1 block">{data.siswa.nisn}</span>
                    </div>
                  </div>

                  {/* NAMA */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center shrink-0 border border-slate-150">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="block text-slate-450 font-semibold text-xs leading-none">Nama Lengkap Siswa</span>
                      <span className="font-bold text-slate-900 mt-1 block uppercase leading-snug">{data.siswa.namaLengkap}</span>
                    </div>
                  </div>

                  {/* JENIS KELAMIN */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center shrink-0 border border-slate-150">
                      <User className="w-4.5 h-4.5 text-indigo-500" />
                    </div>
                    <div>
                      <span className="block text-slate-450 font-semibold text-xs leading-none">Jenis Kelamin</span>
                      <span className="font-semibold text-slate-850 mt-1 block">{data.siswa.jenisKelamin}</span>
                    </div>
                  </div>

                  {/* ASAL SEKOLAH */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center shrink-0 border border-slate-150">
                      <School className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="block text-slate-450 font-semibold text-xs leading-none">SD/MI Asal Terdaftar</span>
                      <span className="font-bold text-slate-800 mt-1 block">{data.siswa.asalSekolah}</span>
                    </div>
                  </div>

                  {/* TTL */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center shrink-0 border border-slate-150">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="block text-slate-450 font-semibold text-xs leading-none">Tempat & Tanggal Lahir</span>
                      <span className="font-semibold text-slate-800 mt-1 block">
                        {data.siswa.tempatLahir ? `${data.siswa.tempatLahir}, ${data.siswa.tanggalLahir}` : 'Tasikmalaya, Jabar'}
                      </span>
                    </div>
                  </div>

                  {/* TANGGAL DAFTAR */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center shrink-0 border border-slate-150">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="block text-slate-450 font-semibold text-xs leading-none">Waktu Unggah Formulir</span>
                      <span className="font-mono text-xs font-semibold text-slate-700 mt-1 block">
                        {new Date(data.timestamp || Date.now()).toLocaleString('id-ID', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit', 
                          minute: '2-digit',
                          second: '2-digit'
                        })} WIB
                      </span>
                    </div>
                  </div>

                  {/* ALAMAT LENGKAP */}
                  <div className="flex items-start gap-3 md:col-span-2">
                    <div className="w-9 h-9 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center shrink-0 border border-slate-150">
                      <Compass className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="block text-slate-450 font-semibold text-xs leading-none">Wilayah / Koordinat Zonasi Rumah</span>
                      <span className="font-medium text-slate-705 block leading-relaxed mt-1 block">{data.siswa.alamatLengkap}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Ortu card */}
              <div className="pt-6 border-t border-slate-100 text-left">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-100 font-mono">Wali Siswa</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-3">
                  <div>
                    <span className="text-slate-400 font-semibold">Orang Tua / Ayah Kandung:</span>
                    <span className="block font-bold text-slate-850 mt-0.5 uppercase">{data.orangTua.namaAyah}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">Ibu Kandung:</span>
                    <span className="block font-bold text-slate-850 mt-0.5 uppercase">{data.orangTua.namaIbu}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Actions footer buttons list */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-end items-center">
              <span className="text-[10px] text-slate-400 font-medium font-mono pb-2 sm:pb-0">Pangkalan data SMPN 1 Manonjaya terlindungi kriptografi enkripsi SSL.</span>
              <div className="flex gap-2.5 w-full sm:w-auto self-stretch">
                <button
                  onClick={() => onOpenReceipt(data)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer w-full"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Bukti PDF
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
