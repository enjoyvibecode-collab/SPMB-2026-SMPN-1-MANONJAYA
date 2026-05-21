import { useState, FormEvent, ChangeEvent } from 'react';
import { Search, Loader2, AlertCircle, FileCheck, Landmark, CheckCircle, XCircle, Printer, Download } from 'lucide-react';
import { Pendaftar } from '../types';

interface TrackingSectionProps {
  onSelectReceipt: (pendaftar: Pendaftar) => void;
}

export default function TrackingSection({ onSelectReceipt }: TrackingSectionProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Pendaftar | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setError('Masukkan nomor pendaftaran atau NISN siswa.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/pendaftar/${encodeURIComponent(cleanQuery)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan sistem.');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Data tidak ditemukan. Silakan periksa kembali nomor pendaftaran Anda.');
    } finally {
      setLoading(false);
    }
  };

  const statusIcons: Record<string, any> = {
    Menunggu: {
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      label: 'Menunggu Verifikasi Berkas',
      badge: 'bg-amber-100 text-amber-800',
      desc: 'Berkas pendaftaran Anda telah tersimpan dengan aman di database sekolah. Panitia SPMB segera melakukan pencocokan fisik berkas Anda dalam waktu 2x24 jam.'
    },
    Diverifikasi: {
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      label: 'Berkas Terverifikasi',
      badge: 'bg-blue-100 text-blue-800',
      desc: 'Panitia telah memeriksa dokumen administratif pendaftaran Anda (KK, Akta, Pas Foto) dan dinyatakan VALID serta sesuai persyaratan jalur.'
    },
    Ditolak: {
      color: 'text-red-600 bg-red-50 border-red-200',
      label: 'Pendaftaran Ditolak / Tidak Memenuhi Syarat',
      badge: 'bg-red-100 text-red-800',
      desc: 'Mohon maaf, berkas fisik Anda dinyatakan tidak memenuhi kriteria kelulusan administrasi sekolah atau di luar jangkauan zonasi utama.'
    },
    Diterima: {
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      label: 'SELAMAT! Calon Siswa DITERIMA',
      badge: 'bg-emerald-100 text-emerald-800',
      desc: 'Selamat! Anda dinyatakan LULUS SELEKSI sebagai murid baru di SMPN 1 Manonjaya Tahun Ajaran 2026/2027. Silakan unduh Bukti Pendaftaran & lakukan proses daftar ulang.'
    }
  };

  const getStatusStyle = (status: string) => {
    return statusIcons[status] || statusIcons['Menunggu'];
  };

  return (
    <div id="tracking-section-container" className="max-w-3xl mx-auto px-4 py-12">
      {/* Search Bar header card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-100/50 mb-8">
        <div className="max-w-xl mx-auto text-center mb-6 space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Pantau Status Kelulusan & Verifikasi</h2>
          <p className="text-sm text-slate-500 font-medium">Masukkan nomor pendaftaran (contoh: SPMB2026-0001) atau 10 digit NISN murid.</p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Masukkan Nomor Pendaftaran / NISN..."
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-semibold text-slate-800 placeholder-slate-400"
              id="input-tracking-query"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            id="btn-search-tracking"
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md shadow-blue-150 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mencari...
              </>
            ) : (
              <>
                <Search className="w-4.5 h-4.5" />
                Cek Status
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-red-800">Pencarian Tidak Ditemukan</p>
              <p className="text-xs text-red-600 font-semibold">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Result presentation Card */}
      {result && (
        <div 
          id="tracking-result-card"
          className="bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden"
        >
          {/* Header Status Bar */}
          <div className={`p-4 sm:p-5 border-b font-bold text-sm sm:text-base flex items-center justify-between gap-3 ${getStatusStyle(result.status).color}`}>
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-5 h-5" />
              <span>{getStatusStyle(result.status).label}</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${getStatusStyle(result.status).badge}`}>
              {result.status}
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Status explanation block */}
            <p className="text-slate-600 font-medium text-xs sm:text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {getStatusStyle(result.status).desc}
              {result.catatanAdmin && (
                <span className="block mt-2.5 pt-2 border-t border-slate-200/60 text-xs italic text-slate-500 font-semibold font-mono">
                  Catatan Panitia: "{result.catatanAdmin}"
                </span>
              )}
            </p>

            {/* Students metadata tables */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono pb-2 border-b border-slate-100">Identitas Pendaftar</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="block text-slate-400 font-semibold">Nomor Pendaftaran</span>
                  <span className="font-mono font-bold text-blue-700 text-base">{result.id}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold">Tanggal Daftar</span>
                  <span className="font-semibold text-slate-700 font-mono">{new Date(result.timestamp).toLocaleString('id-ID')}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold">Nama Lengkap Siswa</span>
                  <span className="font-bold text-slate-800">{result.siswa.namaLengkap}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold">Jalur Pendaftaran</span>
                  <span className="font-extrabold text-indigo-700">{result.jalur}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold">NISN Siswa</span>
                  <span className="font-mono font-bold text-slate-700">{result.siswa.nisn}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-semibold">Sekolah AsalSD</span>
                  <span className="font-semibold text-slate-700">{result.siswa.asalSekolah}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-slate-400 font-semibold">Alamat Tempat Tinggal</span>
                  <span className="font-medium text-slate-700 leading-relaxed block mt-0.5">{result.siswa.alamatLengkap}</span>
                </div>
              </div>
            </div>

            {/* Actions button checklist */}
            <div className="pt-6 border-t border-slate-150/80 flex flex-wrap gap-3 justify-end bg-slate-50/50 -mx-6 -mb-6 p-6">
              <button
                onClick={() => onSelectReceipt(result)}
                id="btn-print-receipt-from-track"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-150 flex items-center gap-2 transition-all cursor-pointer text-xs"
              >
                <Printer className="w-4 h-4" />
                Cetak Bukti Pendaftaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
