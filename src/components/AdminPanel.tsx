import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  Lock, LayoutDashboard, Users, CheckSquare, ShieldCheck, 
  ShieldAlert, Settings, FileSpreadsheet, Search, RefreshCw, 
  CheckCircle, XCircle, Clock, ExternalLink, Download, FileText,
  ToggleLeft, ToggleRight, Trash2, Edit2, Check, Printer, AlertTriangle, Eye
} from 'lucide-react';
import { Pendaftar, DashboardStats, JalurType, StatusPendaftaran } from '../types';

interface AdminPanelProps {
  onSelectReceipt: (pendaftar: Pendaftar) => void;
  isAdminLoggedIn: boolean;
  onAdminLoginSuccess: () => void;
  isMaintenance: boolean;
  onToggleMaintenance: (enable: boolean) => void;
  spreadsheetUrl: string;
  onUpdateSpreadsheetUrl: (url: string) => void;
}

export default function AdminPanel({ 
  onSelectReceipt, 
  isAdminLoggedIn, 
  onAdminLoginSuccess, 
  isMaintenance, 
  onToggleMaintenance,
  spreadsheetUrl,
  onUpdateSpreadsheetUrl
}: AdminPanelProps) {
  
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Core Data States
  const [pendaftaranList, setPendaftaranList] = useState<Pendaftar[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJalur, setFilterJalur] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Selected Student detail action state
  const [selectedStudent, setSelectedStudent] = useState<Pendaftar | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Configuration management
  const [sheetUrlInput, setSheetUrlInput] = useState(spreadsheetUrl);
  const [configSuccessMsg, setConfigSuccessMsg] = useState<string | null>(null);

  // Fetch data
  const fetchAdminData = async () => {
    setLoadingData(true);
    setDataError(null);
    try {
      // 1. Fetch stats
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch list (Authorization header required)
      const listRes = await fetch('/api/pendaftar', {
        headers: {
          'Authorization': 'admin_session_token_smpn1mjy_2026'
        }
      });
      if (!listRes.ok) {
        throw new Error('Sesi verifikasi gagal. Silakan masuk kembali.');
      }
      const listData = await listRes.json();
      setPendaftaranList(listData);
    } catch (err: any) {
      setDataError(err.message || 'Gagal memuat data dari server.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchAdminData();
    }
  }, [isAdminLoggedIn]);

  useEffect(() => {
    setSheetUrlInput(spreadsheetUrl);
  }, [spreadsheetUrl]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setLoginError('Kata sandi harus diisi.');
      return;
    }
    setLoginLoading(true);
    setLoginError(null);

    try {
      const resp = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const res = await resp.json();
      if (!resp.ok) {
        throw new Error(res.error || 'Autentikasi gagal.');
      }
      onAdminLoginSuccess();
    } catch (err: any) {
      setLoginError(err.message || 'Terjadi kesalahan login.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Status adjustment
  const handleUpdateStatus = async (id: string, newStatus: StatusPendaftaran) => {
    setActionLoading(true);
    try {
      const resp = await fetch(`/api/pendaftar/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin_session_token_smpn1mjy_2026'
        },
        body: JSON.stringify({ status: newStatus, catatanAdmin: adminNote })
      });
      if (!resp.ok) {
        throw new Error('Gagal memperbarui status verifikasi.');
      }
      const updated = await resp.json();
      
      // Update local state list
      setPendaftaranList(prev => prev.map(p => p.id === id ? updated : p));
      
      // Update statistic numbers
      fetchAdminData();
      
      // Update selected
      setSelectedStudent(updated);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveConfig = async (e: FormEvent) => {
    e.preventDefault();
    setConfigSuccessMsg(null);
    try {
      const resp = await fetch('/api/admin/spreadsheet-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'admin_session_token_smpn1mjy_2026',
          url: sheetUrlInput
        })
      });
      if (!resp.ok) {
        throw new Error('Gagal menyimpan webhook spreedsheet.');
      }
      onUpdateSpreadsheetUrl(sheetUrlInput);
      setConfigSuccessMsg('Sinkronisasi Google Spreadsheet berhasil disimpan.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleMaintenanceMode = async () => {
    const nextState = !isMaintenance;
    try {
      const resp = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'admin_session_token_smpn1mjy_2026',
          enable: nextState
        })
      });
      if (!resp.ok) throw new Error();
      onToggleMaintenance(nextState);
    } catch (e) {
      alert('Gagal mengubah status pemeliharaan.');
    }
  };

  // Export dataset function
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pendaftaranList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Data_SPMB_SMPN_1_Manonjaya_2026.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "No Pendaftaran,Tanggal,NISN,Nama Lengkap,Jenis Kelamin,Asal Sekolah,Jalur,Status,Kontak HP\n";
    pendaftaranList.forEach(p => {
      const row = [
        p.id,
        new Date(p.timestamp).toLocaleDateString(),
        p.siswa.nisn,
        `"${p.siswa.namaLengkap}"`,
        p.siswa.jenisKelamin,
        `"${p.siswa.asalSekolah}"`,
        p.jalur,
        p.status,
        p.siswa.noHpSiswa
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Laporan_Kelulusan_PPDB_2026.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Filtering list locally
  const filteredList = pendaftaranList.filter(p => {
    const matchesSearch = 
      p.siswa.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.siswa.nisn.includes(searchQuery) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.siswa.asalSekolah.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesJalur = filterJalur === 'Semua' || p.jalur === filterJalur;
    const matchesStatus = filterStatus === 'Semua' || p.status === filterStatus;

    return matchesSearch && matchesJalur && matchesStatus;
  });

  // Render Login state first
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Masuk Sesi Administrator</h3>
            <p className="text-xs text-slate-500 font-medium">Isi kata pental kunci khusus untuk memulai pemantauan data PPDB.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 label-required">
                Kunci Akses Admin (Password)
              </label>
              <input
                type="password"
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-mono font-bold text-slate-800"
                id="admin-password-input"
              />
              <p className="text-[10px] text-slate-400 mt-1">Hint: Akses default adalah `admin` atau `smpn1manonjaya2026`.</p>
            </div>

            {loginError && (
              <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              id="btn-admin-login-submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Memeriksa Kunci...
                </>
              ) : (
                'Masuk Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-panel-main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* SECTION 1: HEADER CONTROLS & WEBHOOKS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
            <span>Dashboard Kontrol Utama PPDB</span>
          </h2>
          <p className="text-slate-400 text-xs font-semibold">Tahun Ajaran 2026/2027 • Akses Administrator Resmi</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Toggle Maintenance Button */}
          <button
            onClick={handleToggleMaintenanceMode}
            id="toggle-maintenance-mode"
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isMaintenance 
                ? 'bg-amber-100 border-amber-300 text-amber-800' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            {isMaintenance ? <ToggleRight className="w-5 h-5 text-amber-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
            <span>Mode Maintenance: {isMaintenance ? 'AKTIF' : 'NON-AKTIF'}</span>
          </button>

          <button
            onClick={fetchAdminData}
            id="btn-refresh-admin-data"
            className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SECTION 2: STATS WIDGETS CARDS */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Total Pendaftar</p>
            <p className="text-2xl font-black text-blue-700 mt-1 font-mono">{stats.total}</p>
            <span className="text-[9px] text-slate-400 font-medium font-mono leading-none">pangkalan data lokal</span>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Belum Diuji</p>
            <p className="text-2xl font-black text-amber-600 mt-1 font-mono">{stats.belumDiverifikasi}</p>
            <span className="text-[9px] text-slate-400 font-medium font-mono leading-none">perlu ditindak</span>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Berkas Sah</p>
            <p className="text-2xl font-black text-blue-500 mt-1 font-mono">{stats.diverifikasi}</p>
            <span className="text-[9px] text-slate-400 font-medium font-mono leading-none">siap seleksi tahap 2</span>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Siswa Diterima</p>
            <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{stats.diterima}</p>
            <span className="text-[9px] text-slate-400 font-medium font-mono leading-none">resmi menjadi murid baru</span>
          </div>

          <div className="bg-white border border-emerald-100 p-4 rounded-2xl shadow-xs bg-emerald-50/15">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Siswa Ditolak</p>
            <p className="text-2xl font-black text-red-600 mt-1 font-mono">{stats.ditolak}</p>
            <span className="text-[9px] text-slate-400 font-medium font-mono leading-none">berkas/zonasi tidak lolos</span>
          </div>
        </div>
      )}

      {/* SECTION 3: GOOGLE SPREADSHEET BACKEND LINK AREA */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Integrasi Sinkronisasi Spreadsheet Utama</span>
          </h3>
          <p className="text-slate-400 text-xs">Semua data calon murid baru otomatis tersinkron ke file Google Spreadsheet eksternal secara realtime via Google Apps Script (GAS).</p>
        </div>

        <form onSubmit={handleSaveConfig} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            placeholder="Masukkan URL Webhook Google Apps Script (e.g., https://script.google.com/macros/s/.../exec)"
            value={sheetUrlInput}
            onChange={(e) => setSheetUrlInput(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-mono text-xs text-slate-600 placeholder-slate-400 bg-slate-50 focus:bg-white"
          />
          <button
            type="submit"
            id="btn-save-spreadsheet-sync"
            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Simpan Link Sinkronisasi
          </button>
        </form>

        {configSuccessMsg && (
          <p className="text-xs font-bold text-center text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">
            {configSuccessMsg}
          </p>
        )}
      </div>

      {/* SECTION 4: TABLE OF REGISTRANTS & SEARCH */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Search header area */}
        <div className="p-5 border-b border-rose-100/40 bg-slate-50/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-1 flex-col sm:flex-row gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 w-4.5 h-4.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari Murid via Nama, NISN, atau No SPMB..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold placeholder-slate-400 bg-white"
                id="admin-search-query"
              />
            </div>

            {/* Path filter select */}
            <select
              value={filterJalur}
              onChange={(e) => setFilterJalur(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
            >
              <option value="Semua">Jalur: Semua</option>
              <option value="Domisili">Domisili</option>
              <option value="Afirmasi">Afirmasi</option>
              <option value="Prestasi">Prestasi</option>
              <option value="Mutasi">Mutasi</option>
            </select>

            {/* Status filter select */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
            >
              <option value="Semua">Status: Semua</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Diverifikasi">Diverifikasi</option>
              <option value="Ditolak">Ditolak</option>
              <option value="Diterima">Diterima</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 font-bold mr-2">{filteredList.length} Ditemukan</span>
            <button
              onClick={handleExportCSV}
              id="export-csv-action"
              className="px-4 py-2 border border-dashed border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={handleExportJSON}
              id="export-json-action"
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* DATA TABLE WRAPPER */}
        {loadingData ? (
          <div className="p-12 text-center text-slate-500 font-semibold flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs">Memuat daftar registrasi resmi...</p>
          </div>
        ) : dataError ? (
          <div className="p-12 text-center text-slate-500">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-700">{dataError}</p>
            <button onClick={fetchAdminData} className="mt-3 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold">Coba Lagi</button>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-semibold text-xs">
            Tidak ada data pendaftar yang cocok dengan filter atau kueri pencarian Anda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-700 text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-500 uppercase font-mono text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-4 border-b border-rose-100/30">No SPMB</th>
                  <th className="p-4 border-b border-rose-100/30">NISN</th>
                  <th className="p-4 border-b border-rose-100/30">Nama Calon Siswa</th>
                  <th className="p-4 border-b border-rose-100/30">Asal SD</th>
                  <th className="p-4 border-b border-rose-100/30">Rute Jalur</th>
                  <th className="p-4 border-b border-rose-100/30">Status</th>
                  <th className="p-4 border-b border-rose-100/30 text-right">Kelola Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredList.map((p) => {
                  const statusStyles: Record<string, string> = {
                    Menunggu: 'bg-amber-100 text-amber-800',
                    Diverifikasi: 'bg-blue-100 text-blue-800',
                    Ditolak: 'bg-red-100 text-red-800',
                    Diterima: 'bg-emerald-100 text-emerald-800'
                  };

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-blue-700">{p.id}</td>
                      <td className="p-4 font-mono text-slate-500">{p.siswa.nisn}</td>
                      <td className="p-4 font-bold text-slate-900">{p.siswa.namaLengkap}</td>
                      <td className="p-4">{p.siswa.asalSekolah}</td>
                      <td className="p-4 font-bold text-indigo-700 uppercase tracking-tight">{p.jalur}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold font-mono ${statusStyles[p.status] || 'bg-slate-100'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedStudent(p);
                              setAdminNote(p.catatanAdmin || '');
                            }}
                            className="px-2.5 py-1.5 bg-slate-150 border border-slate-200 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 font-bold cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Periksa</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL DRAWER / POPUP FOR STUDENT SELECTION */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header selection card */}
            <div className="bg-slate-50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800">
                  Verifikasi Berkas Calon Siswa: <span className="font-mono text-blue-700 font-extrabold">{selectedStudent.id}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Inner scroll detail body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 text-xs sm:text-sm">
              
              {/* Left Column: Student Details */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-3 font-mono">Biodata Siswa</h4>
                  <div className="space-y-2 mt-2">
                    <p><strong className="text-slate-500 font-semibold inline-block w-28">Nama Lengkap:</strong> <span className="font-bold text-slate-800">{selectedStudent.siswa.namaLengkap}</span></p>
                    <p><strong className="text-slate-500 font-semibold inline-block w-28">NISN Siswa:</strong> <span className="font-mono font-bold text-slate-700">{selectedStudent.siswa.nisn}</span></p>
                    <p><strong className="text-slate-500 font-semibold inline-block w-28">Jenis Kelamin:</strong> <span>{selectedStudent.siswa.jenisKelamin}</span></p>
                    <p><strong className="text-slate-500 font-semibold inline-block w-28">Agama:</strong> <span>{selectedStudent.siswa.agama}</span></p>
                    <p><strong className="text-slate-500 font-semibold inline-block w-28">Tempat, TTL:</strong> <span>{selectedStudent.siswa.tempatLahir}, {selectedStudent.siswa.tanggalLahir}</span></p>
                    <p><strong className="text-slate-500 font-semibold inline-block w-28">Asal Sekolah:</strong> <span className="font-semibold text-slate-700">{selectedStudent.siswa.asalSekolah}</span></p>
                    <p><strong className="text-slate-500 font-semibold inline-block w-28">Nomor HP Siswa:</strong> <span className="font-mono">{selectedStudent.siswa.noHpSiswa}</span></p>
                    <p><strong className="text-slate-500 font-semibold inline-block w-28 text-top">Alamat Rumah:</strong> <span className="inline-block leading-relaxed max-w-sm font-medium">{selectedStudent.siswa.alamatLengkap}</span></p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-3 font-mono">Biodata Orang Tua</h4>
                  <div className="space-y-2 mt-2">
                    <p><strong className="text-slate-500 font-semibold inline-block w-28">Nama Ayah:</strong> <span className="font-semibold">{selectedStudent.orangTua.namaAyah}</span></p>
                    <p><strong className="text-slate-500 font-semibold inline-block w-28">Nama Ibu:</strong> <span className="font-semibold">{selectedStudent.orangTua.namaIbu}</span></p>
                    <p><strong className="text-slate-500 font-semibold inline-block w-28">No HP Ortu:</strong> <span className="font-mono font-bold text-slate-750">{selectedStudent.orangTua.noHpOrtu}</span></p>
                  </div>
                </div>

                {/* File Download Section */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-3 font-mono">Unduhan Berkas Pendukung</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <a 
                      href={selectedStudent.berkas.kkUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between text-slate-755 font-bold"
                    >
                      <span className="truncate max-w-[150px]">File Kartu Keluarga (KK)</span>
                      <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                    </a>
                    <a 
                      href={selectedStudent.berkas.aktaUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between text-slate-755 font-bold"
                    >
                      <span className="truncate max-w-[150px]">File Akta Kelahiran</span>
                      <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                    </a>
                    <a 
                      href={selectedStudent.berkas.fotoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between text-slate-755 font-bold"
                    >
                      <span className="truncate max-w-[150px]">Pas Foto Siswa Resmi</span>
                      <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                    </a>
                    {selectedStudent.berkas.prestasiUrl ? (
                      <a 
                        href={selectedStudent.berkas.prestasiUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between text-slate-755 font-bold"
                      >
                        <span className="truncate max-w-[150px]">Sertifikat Prestasi</span>
                        <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                      </a>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 font-semibold italic text-[11px] flex items-center justify-center">
                        Tanpa Sertifikat Prestasi
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Decisions Maker and Notes */}
              <div className="md:col-span-5 bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Verifikator Panel</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">Tentukan keputusan seleksi berkas fisik disini.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Catatan Verifikasi Admin (Opsional)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Contoh: Dokumen lengkap jarak zonasi 450 meter dari gerbang utama."
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:border-blue-500 font-bold text-slate-800 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-550 uppercase tracking-widest">Keputusan Status Siswa:</label>
                    
                    <button
                      onClick={() => handleUpdateStatus(selectedStudent.id, 'Diterima')}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-350 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Terima Masuk Sekolah (Diterima)
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(selectedStudent.id, 'Diverifikasi')}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-350 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Berkas Sah (Diverifikasi)
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(selectedStudent.id, 'Ditolak')}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-red-650 hover:bg-red-700 disabled:bg-slate-350 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      Tolak Pengajuan (Ditolak)
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(selectedStudent.id, 'Menunggu')}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-350 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Clock className="w-4 h-4" />
                      Setel Ulang (Menunggu Seleksi)
                    </button>
                  </div>
                </div>

                {/* Print button preview within detail */}
                <div className="border-t border-slate-200/80 pt-4 mt-4">
                  <button
                    onClick={() => {
                      onSelectReceipt(selectedStudent);
                      setSelectedStudent(null);
                    }}
                    className="w-full py-2 bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>Cetak Kartu Bukti Siswa</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
