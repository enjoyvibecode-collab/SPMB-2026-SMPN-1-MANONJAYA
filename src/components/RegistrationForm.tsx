import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Users, Upload, AlertCircle, CheckCircle2, MapPin, Trophy, ShieldAlert, Milestone, Loader2, ArrowLeft, ArrowRight, FileCheck } from "lucide-react";
import { DataSiswa, DataOrangTua, JalurType, BerkasUpload, Pendaftar } from "../types";

interface RegistrationFormProps {
  onSuccess: (pendaftar: Pendaftar) => void;
  isMaintenance: boolean;
  spreadsheetUrl?: string;
}

export default function RegistrationForm({ onSuccess, isMaintenance, spreadsheetUrl }: RegistrationFormProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Form States
  const [jalur, setJalur] = useState<JalurType>("Domisili");

  // Load prefilled coordinates from zoning map helper component
  useEffect(() => {
    const prefilledAddress = sessionStorage.getItem('spmb_prefilled_address');
    const prefilledJalur = sessionStorage.getItem('spmb_prefilled_jalur') as JalurType | null;
    
    if (prefilledAddress) {
      setSiswa(prev => ({
        ...prev,
        alamatLengkap: prefilledAddress
      }));
      if (prefilledJalur) {
        setJalur(prefilledJalur);
      }
      // Clear after read so it's fresh
      sessionStorage.removeItem('spmb_prefilled_address');
      sessionStorage.removeItem('spmb_prefilled_coords');
      sessionStorage.removeItem('spmb_prefilled_distance');
      sessionStorage.removeItem('spmb_prefilled_jalur');
    }
  }, []);

  const [siswa, setSiswa] = useState<DataSiswa>({
    nisn: "",
    namaLengkap: "",
    jenisKelamin: "Laki-laki",
    tempatLahir: "",
    tanggalLahir: "",
    agama: "Islam",
    asalSekolah: "",
    noHpSiswa: "",
    alamatLengkap: "",
  });

  const [orangTua, setOrangTua] = useState<DataOrangTua>({
    namaAyah: "",
    namaIbu: "",
    noHpOrtu: "",
  });

  // Base64 & Upload states
  const [berkas, setBerkas] = useState<BerkasUpload>({
    kkName: "",
    kkContent: "",
    aktaName: "",
    aktaContent: "",
    fotoName: "",
    fotoContent: "",
    prestasiName: "",
    prestasiContent: "",
  });

  // Check upload sizes and status messages
  const [uploadErrors, setUploadErrors] = useState<{
    kk?: string;
    akta?: string;
    foto?: string;
    prestasi?: string;
  }>({});
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);

  const [uploading, setUploading] = useState<{
    kk?: boolean;
    akta?: boolean;
    foto?: boolean;
    prestasi?: boolean;
  }>({});

  const MAX_FILE_SIZE = 500 * 1024; // 500 KB // 2 MB

  const handleSiswaChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Allow numbers only for NISN and HP
    if ((name === "nisn" || name === "noHpSiswa") && value !== "" && !/^\d+$/.test(value)) {
      return;
    }
    setSiswa((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrangTuaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "noHpOrtu" && value !== "" && !/^\d+$/.test(value)) {
      return;
    }
    setOrangTua((prev) => ({ ...prev, [name]: value }));
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const compressImage = (file: File, quality = 0.7, maxWidth = 1200): Promise<File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(file);
        return;
      }

      const img = new Image();
      const reader = new FileReader();

      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const compressedFile = new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
              type: "image/jpeg",
            });

            resolve(compressedFile);
          },
          "image/jpeg",
          quality,
        );
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, fieldName: "kk" | "akta" | "foto" | "prestasi") => {
    const file = e.target.files?.[0];

    if (!file) return;
    setUploadingFile(fieldName);

    setUploading((prev) => ({
      ...prev,
      [fieldName]: true,
    }));

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      setUploadErrors((prev) => ({
        ...prev,
        [fieldName]: "Format file harus PDF/JPG/PNG",
      }));

      setUploading((prev) => ({
        ...prev,
        [fieldName]: false,
      }));

      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const processedFile = file.type.startsWith("image/") ? await compressImage(file) : file;

      if (processedFile.size > MAX_FILE_SIZE) {
        setUploadErrors((prev) => ({
          ...prev,
          [fieldName]: "Ukuran file masih terlalu besar setelah dikompres.",
        }));

        setUploading((prev) => ({
          ...prev,
          [fieldName]: false,
        }));

        return;
      }

      const base64 = await toBase64(processedFile);

      setUploadErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldName];
        return copy;
      });

      setBerkas((prev) => ({
        ...prev,
        [`${fieldName}Name`]: processedFile.name,
        [`${fieldName}Content`]: base64,
      }));
      setUploadingFile(null);
    } catch (err) {
      setUploadErrors((prev) => ({
        ...prev,
        [fieldName]: "Gagal membaca file.",
      }));
    } finally {
      setUploading((prev) => ({
        ...prev,
        [fieldName]: false,
      }));
    }
  };

  const validateStep1 = () => {
    if (!/^\d{10}$/.test(siswa.nisn)) {
      setGlobalError("NISN harus diisi lengkap (10 digit).");
      return false;
    }
    if (!siswa.namaLengkap.trim()) {
      setGlobalError("Nama lengkap siswa belum diisi.");
      return false;
    }
    if (!siswa.tempatLahir.trim() || !siswa.tanggalLahir) {
      setGlobalError("Tempat dan Tanggal lahir wajib diisi.");
      return false;
    }
    if (!siswa.asalSekolah.trim()) {
      setGlobalError("Asal sekolah dasar (SD/MI) wajib diisi.");
      return false;
    }
    if (!/^(08)[0-9]{8,13}$/.test(siswa.noHpSiswa)) {
      setGlobalError("Nomor HP siswa tidak valid.");
      return false;
    }
    if (!siswa.alamatLengkap.trim()) {
      setGlobalError("Alamat lengkap pendaftar wajib diisi.");
      return false;
    }
    setGlobalError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!orangTua.namaAyah.trim() || !orangTua.namaIbu.trim()) {
      setGlobalError("Nama Ayah dan Nama Ibu kandung wajib diisi.");
      return false;
    }
    if (!/^(08)[0-9]{8,13}$/.test(orangTua.noHpOrtu)) {
      setGlobalError("Nomor HP Orang Tua/Wali tidak lengkap atau tidak valid.");
      return false;
    }
    setGlobalError(null);
    return true;
  };

  const validateStep3 = () => {
    // Selection path is always valid since it defaults to 'Domisili'
    setGlobalError(null);
    return true;
  };

  const validateStep4 = () => {
    if (!berkas.kkContent) {
      setGlobalError("Unduhan scan Kartu Keluarga wajib diunggah.");
      return false;
    }
    if (!berkas.aktaContent) {
      setGlobalError("Unduhan scan Akta Kelahiran wajib diunggah.");
      return false;
    }
    if (!berkas.fotoContent) {
      setGlobalError("Unduhan Pas Foto resmi siswa wajib diunggah.");
      return false;
    }
    if (Object.keys(uploadErrors).length > 0) {
      setGlobalError("Selesaikan atau perbaiki berkas yang bermasalah sebelum menyerahkan.");
      return false;
    }
    setGlobalError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
    if (step === 3 && validateStep3()) setStep(4);
  };

  const handlePrev = () => {
    setGlobalError(null);

    setStep((prev) => {
      if (prev === 1) return 1;
      return (prev - 1) as 1 | 2 | 3 | 4;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isMaintenance) {
      setGlobalError("Sistem masih dalam pemeliharaan berkala. Pengiriman formulir dinonaktifkan.");
      return;
    }
    if (!validateStep4()) return;

    setLoading(true);
    setGlobalError(null);

    // Prepare JSON payload according to Apps Script backend requirements
    const getCleanBase64 = (dataUrl: string) => {
      if (!dataUrl) return "";
      const commaIndex = dataUrl.indexOf(",");
      return commaIndex !== -1 ? dataUrl.substring(commaIndex + 1) : dataUrl;
    };

    const getMimeType = (dataUrl: string) => {
      if (!dataUrl) return "";
      const match = dataUrl.match(/^data:(.*?);base64,/);
      return match ? match[1] : "";
    };

    const payload = {
      nisn: siswa.nisn,
      nama: siswa.namaLengkap,
      jk: siswa.jenisKelamin,
      ttl: `${siswa.tempatLahir}, ${siswa.tanggalLahir}`,
      agama: siswa.agama,
      asalSekolah: siswa.asalSekolah,
      hpSiswa: siswa.noHpSiswa,
      alamat: siswa.alamatLengkap,
      namaAyah: orangTua.namaAyah,
      namaIbu: orangTua.namaIbu,
      hpOrtu: orangTua.noHpOrtu,
      jalur: jalur,

      // Clean base64 strings (mandatory so Apps Script's base64Decode works without non-base64 characters)
      linkKK: getCleanBase64(berkas.kkContent) || "",
      linkAkta: getCleanBase64(berkas.aktaContent) || "",
      linkFoto: getCleanBase64(berkas.fotoContent) || "",
      linkPrestasi: getCleanBase64(berkas.prestasiContent) || "",

      // File parameters for GAS script customization
      kkName: berkas.kkName || "KK.pdf",
      kkNama: berkas.kkName || "KK.pdf",
      kkType: getMimeType(berkas.kkContent) || "application/pdf",

      aktaName: berkas.aktaName || "Akta.pdf",
      aktaNama: berkas.aktaName || "Akta.pdf",
      aktaType: getMimeType(berkas.aktaContent) || "application/pdf",

      fotoName: berkas.fotoName || "Foto.jpg",
      fotoNama: berkas.fotoName || "Foto.jpg",
      fotoType: getMimeType(berkas.fotoContent) || "image/jpeg",

      prestasiName: berkas.prestasiName || "",
      prestasiNama: berkas.prestasiName || "",
      prestasiType: getMimeType(berkas.prestasiContent) || "",
    };

    const targetScriptUrl = spreadsheetUrl && spreadsheetUrl.trim().startsWith("https://script.google.com/") 
      ? spreadsheetUrl.trim() 
      : "https://script.google.com/macros/s/AKfycbwR2ftsrLLFdw19crOEnlW_P5DS_re6d4UyQf32cDfxGpuiKRTzWsdC4rS5mF87KO_z/exec";

    console.log("DEBUG [SPMB SPMN 1 Manonjaya]: Submitting to Google Apps Script Backend...");
    console.log("DEBUG [SPMB SPMN 1 Manonjaya]: Apps Script Target URL:", targetScriptUrl);
    console.log("DEBUG Payload Ready:", {
      nisn: payload.nisn,
      nama: payload.nama,
      jalur: payload.jalur,
    });

    let registrationId = "";
    let isSyncedToSpreadsheet = false;
    let spreadsheetWarning = "";

    try {
      console.log("DEBUG [SPMB]: Contacting Google Apps Script at:", targetScriptUrl);
      const response = await fetch(targetScriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      console.log("DEBUG [SPMB]: HTTP response status:", response.status);

      if (response.ok) {
        const responseText = await response.text();
        console.log("DEBUG [SPMB]: Raw response string received:", responseText);

        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseErr) {
          console.warn("DEBUG [SPMB]: Failed to parse Apps Script JSON:", responseText);
        }

        console.log("DEBUG [SPMB]: Parsed Apps Script result:", result);

        if (result && result.success && result.nomor_pendaftaran) {
          registrationId = result.nomor_pendaftaran;
          isSyncedToSpreadsheet = true;
          if (result.warning || result.fileError) {
            spreadsheetWarning = result.warning || result.fileError;
          }
        } else {
          const errorMsg = (result && result.error) || "Apps Script memproses data namun mengindikasikan status tidak sukses.";
          throw new Error(errorMsg);
        }
      } else {
        throw new Error(`Koneksi ke Web App Google Apps Script mengembalikan HTTP status ${response.status}.`);
      }
    } catch (gasErr: any) {
      console.warn("DEBUG [SPMB]: Google Apps Script direct submit failed / blocked by CORS. Error message:", gasErr.message);
      
      // Detail the warning for Google Drive permission issues specifically
      if (gasErr.message && (
        gasErr.message.includes("permission") || 
        gasErr.message.includes("DriveApp") || 
        gasErr.message.includes("Folder") || 
        gasErr.message.includes("fetch")
      )) {
        spreadsheetWarning = "Format Google Spreadsheet terhubung, namun terjadi kegagalan otorisasi Google Drive pada Script Anda (Kurang Izin Akses Drive/DriveApp).";
      } else {
        spreadsheetWarning = `Google Apps Script tidak dapat dihubungi langsung (${gasErr.message || "Failed to fetch"}). Jalur sinkronisasi sekunder kami akan dicoba oleh server utama.`;
      }
    }

    // Now, we register and sync utilizing our Node.js local database (/api/pendaftar)
    try {
      console.log("DEBUG [SPMB]: Syncing or creating registration record on local Node server...");
      const syncResponse = await fetch("/api/pendaftar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: registrationId || undefined, // Send registration ID if computed by GAS, or let Node generate it if GAS was bypassed
          jalur,
          siswa,
          orangTua,
          berkas,
        }),
      });

      if (!syncResponse.ok) {
        const errResult = await syncResponse.json();
        throw new Error(errResult.error || "Server utama gagal merekam pendaftaran.");
      }

      const syncResult = await syncResponse.json();
      console.log("DEBUG [SPMB]: Local server registration successful:", syncResult);

      const resolvedId = syncResult.id;

      // Construct standard Pendaftar representation so existing widgets function seamlessly
      const newRecord: Pendaftar = {
        id: resolvedId,
        timestamp: syncResult.timestamp || new Date().toISOString(),
        jalur,
        siswa,
        orangTua,
        berkas: {
          kkUrl: syncResult.berkas?.kkUrl || berkas.kkContent,
          aktaUrl: syncResult.berkas?.aktaUrl || berkas.aktaContent,
          fotoUrl: syncResult.berkas?.fotoUrl || berkas.fotoContent,
          ...(berkas.prestasiContent ? { prestasiUrl: syncResult.berkas?.prestasiUrl || berkas.prestasiContent } : {}),
        },
        status: syncResult.status || "Menunggu",
        catatanAdmin: spreadsheetWarning ? `[Peringatan Integrasi]: ${spreadsheetWarning}` : "",
      };

      // Show friendly guidance if Google integration was partially restricted
      if (spreadsheetWarning) {
        alert(
          `🎉 PENDAFTARAN BERHASIL!\n\n` +
          `Nomor Pendaftaran Anda: ${resolvedId}\n\n` +
          `INFO INTEGRASI:\n${spreadsheetWarning}\n\n` +
          `Tenang saja, data pendaftaran Anda sudah AMAN tersimpan di server database kami. Panitia dapat melihat berkas Anda.`
        );
      }

      // Trigger success callback - saves the nomor pendaftaran to state & shows receipt/success screen
      onSuccess(newRecord);
    } catch (localErr: any) {
      console.error("DEBUG [SPMB]: Local Server registration fatal:", localErr);
      setGlobalError(localErr.message || "Gagal memproses pendaftaran pada server utama. Periksa koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  };

  if (isMaintenance) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-2xl mx-auto my-12 text-center shadow-lg">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Pendaftaran Ditutup Sementara</h3>
        <p className="text-slate-600 mb-6 font-medium leading-relaxed">
          Mohon maaf, sistem PPDB Online SMPN 1 Manonjaya sedang dalam proses pemeliharaan database rutin (Maintenance Mode). Silakan menghubungi kontak panitia kami di WhatsApp untuk pelayanan darurat.
        </p>
      </div>
    );
  }

  const stepIndicators = [
    { title: "Data Siswa", desc: "Identitas Diri", step: 1, icon: User },
    { title: "Orang Tua", desc: "Identitas Wali", step: 2, icon: Users },
    { title: "Pilih Jalur", desc: "Rute Seleksi", step: 3, icon: Milestone },
    { title: "Upload Berkas", desc: "Evaluasi Syarat", step: 4, icon: Upload },
  ];

  return (
    <div id="spmb-form-container" className="max-w-4xl mx-auto px-4 py-12">
      {/* Title Header */}
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Formulir Pendaftaran Siswa Baru</h2>
        <p className="text-slate-500 text-sm font-medium">Isi formulir pendaftaran di bawah ini secara teliti dan lampirkan scan dokumen terkait.</p>
      </div>

      {/* Progress Indicators */}
      <div className="hidden md:grid grid-cols-4 gap-4 mb-10">
        {stepIndicators.map((s) => {
          const StepIcon = s.icon;
          const isDone = step > s.step;
          const isCurrent = step === s.step;
          return (
            <div
              key={s.step}
              className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                isCurrent ? "border-blue-600 bg-blue-50/50 shadow-sm shadow-blue-50" : isDone ? "border-emerald-200 bg-emerald-50/20" : "border-slate-200 bg-slate-50/50"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${isCurrent ? "bg-blue-600 text-white shadow-md" : isDone ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
              </div>
              <div className="text-left font-semibold">
                <p className={`text-xs uppercase tracking-wider ${isCurrent ? "text-blue-600 font-bold" : isDone ? "text-emerald-700" : "text-slate-400"}`}>Langkah {s.step}</p>
                <p className={`text-sm tracking-tight ${isCurrent ? "text-blue-800" : "text-slate-600"}`}>{s.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile progress indicator bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-100 p-4 rounded-xl mb-6 border border-slate-200">
        <span className="text-sm font-bold text-slate-700">Langkah {step} dari 4</span>
        <span className="text-sm font-mono font-bold text-blue-600">{stepIndicators[step - 1].title}</span>
        <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
      </div>

      {/* Primary Form Card container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-100 overflow-hidden">
        {globalError && (
          <div className="bg-red-50 border-b border-red-100 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">Perhatikan Kesalahan Berikut:</p>
              <p className="text-xs text-red-600 font-semibold">{globalError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: DATA SISWA */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">
                <div className="border-b border-slate-100 pb-4 mb-4 flex items-center gap-2 text-slate-800 font-extrabold text-lg">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Informasi Identitas Calon Siswa Baru</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 label-required">Nomor Induk Siswa Nasional (NISN) *</label>
                    <input
                      type="text"
                      name="nisn"
                      maxLength={10}
                      value={siswa.nisn}
                      onChange={handleSiswaChange}
                      placeholder="Contoh: 0123456789"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-mono font-bold text-slate-800"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Sesuai dengan data resmi pusdatin Kemendikbudristek (10 digit angka).</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 label-required">Nama Lengkap Calon Siswa *</label>
                    <input
                      type="text"
                      name="namaLengkap"
                      value={siswa.namaLengkap}
                      onChange={handleSiswaChange}
                      placeholder="Masukkan nama lengkap anak"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-semibold"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Isi sesuai dengan dokumen resmi Akta Lahir (Gunakan Huruf Kapital jika perlu).</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 label-required">Jenis Kelamin *</label>
                    <select
                      name="jenisKelamin"
                      value={siswa.jenisKelamin}
                      onChange={handleSiswaChange}
                      className="w-full h-[50px] px-4 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-semibold bg-white"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 label-required">Agama *</label>
                    <select name="agama" value={siswa.agama} onChange={handleSiswaChange} className="w-full h-[50px] px-4 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-semibold bg-white">
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 label-required">Tempat Lahir *</label>
                    <input
                      type="text"
                      name="tempatLahir"
                      value={siswa.tempatLahir}
                      onChange={handleSiswaChange}
                      placeholder="Kota/Kabupaten Lahir"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 label-required">Tanggal Lahir *</label>
                    <input
                      type="date"
                      name="tanggalLahir"
                      value={siswa.tanggalLahir}
                      onChange={handleSiswaChange}
                      className="w-full h-[50px] px-4 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 label-required">Asal Sekolah Dasar (SD/MI) *</label>
                    <input
                      type="text"
                      name="asalSekolah"
                      value={siswa.asalSekolah}
                      onChange={handleSiswaChange}
                      placeholder="Contoh: SDN 1 Manonjaya"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 label-required">Nomor HP Siswa (WhatsApp) *</label>
                    <input
                      type="text"
                      name="noHpSiswa"
                      value={siswa.noHpSiswa}
                      onChange={handleSiswaChange}
                      placeholder="Contoh: 0812345678"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 label-required">Alamat Lengkap Rumah (Sesuai KK) *</label>
                  <textarea
                    rows={3}
                    name="alamatLengkap"
                    value={siswa.alamatLengkap}
                    onChange={handleSiswaChange}
                    placeholder="Masukkan nama dusun/jalan, RT/RW, kelurahan/desa, dan kecamatan tempat tinggal saat ini"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Pastikan nama kelurahan/desa dan RT/RW tertulis lengkap demi kelancaran verifikasi jarak Zonasi.</p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DATA ORANG TUA */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">
                <div className="border-b border-slate-100 pb-4 mb-4 flex items-center gap-2 text-slate-800 font-extrabold text-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Informasi Orang Tua / Wali Calon Siswa Baru</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 label-required">Nama Lengkap Ayah Kandung *</label>
                    <input
                      type="text"
                      name="namaAyah"
                      value={orangTua.namaAyah}
                      onChange={handleOrangTuaChange}
                      placeholder="Masukkan nama lengkap ayah"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 label-required">Nama Lengkap Ibu Kandung *</label>
                    <input
                      type="text"
                      name="namaIbu"
                      value={orangTua.namaIbu}
                      onChange={handleOrangTuaChange}
                      placeholder="Masukkan nama lengkap ibu"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 label-required">Nomor HP Orang Tua (WhatsApp Aktif) *</label>
                    <input
                      type="text"
                      name="noHpOrtu"
                      value={orangTua.noHpOrtu}
                      onChange={handleOrangTuaChange}
                      placeholder="Contoh: 081xxxxxxxxxx"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 font-bold"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Digunakan untuk mengirimkan pemberitahuan verifikasi penting dari panitia sekolah.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PILIHAN JALUR */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">
                <div className="border-b border-slate-100 pb-4 mb-4 flex items-center gap-2 text-slate-800 font-extrabold text-lg">
                  <Milestone className="w-5 h-5 text-blue-600" />
                  <span>Pilihan Jalur Penerimaan Siswa Baru</span>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 label-required">Pilih Jalur Pendaftaran *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "Domisili", icon: MapPin, title: "Domisili (Zonasi)", desc: "Kuota 50%. Radius domisili tinggal terdekat.", bg: "hover:border-blue-500 hover:bg-blue-50/20" },
                      { id: "Afirmasi", icon: ShieldAlert, title: "Afirmasi (KETM)", desc: "Kuota 15%. Kurang mampu/Program Bantuan.", bg: "hover:border-indigo-500 hover:bg-indigo-50/20" },
                      { id: "Prestasi", icon: Trophy, title: "Prestasi Akademik/Non", desc: "Kuota 30%. Piagam atau Nilai Rapor tinggi.", bg: "hover:border-emerald-500 hover:bg-emerald-50/20" },
                      { id: "Mutasi", icon: Milestone, title: "Mutasi Orang Tua", desc: "Kuota 5%. Perpindahan dinas/pekerjaan ortu.", bg: "hover:border-amber-500 hover:bg-amber-50/20" },
                    ].map((opt) => {
                      const OptIcon = opt.icon;
                      const isSelected = jalur === opt.id;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => setJalur(opt.id as JalurType)}
                          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected ? "border-blue-600 bg-blue-50/40 shadow-md shadow-blue-50" : "border-slate-100 bg-slate-50/60"
                          } ${opt.bg}`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                              <OptIcon className="w-4.5 h-4.5" />
                            </div>
                            <span className="font-bold text-slate-850 text-sm">{opt.title}</span>
                          </div>
                          <p className="text-slate-500 text-xs leading-relaxed font-medium">{opt.desc}</p>
                          <div className="mt-3 flex justify-end">
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"}`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: UPLOAD BERKAS */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-6">
                <div className="border-b border-slate-100 pb-4 mb-4 flex items-center gap-2 text-slate-800 font-extrabold text-lg">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span>Unggah Berkas Pendukung PPDB</span>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 leading-relaxed font-medium mb-4">
                  <p className="font-bold mb-1">KETENTUAN UPLOAD DOKUMEN:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Dukungan format file: <strong>PDF, JPG, JPEG, atau PNG</strong>
                    </li>
                    <li>
                      Ukuran masing-masing file maksimal <strong>2 MB</strong>
                    </li>
                    <li>Pastikan resolusi dokumen jelas dan mudah dibaca oleh Panitia Verifikatur</li>
                  </ul>
                </div>

                <div className="space-y-5">
                  {/* File 1: KK */}
                  <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest label-required">Scan Kartu Keluarga (KK) *</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Wajib berisikan nama calon siswa bersangkutan.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-800 cursor-pointer bg-white transition-colors flex items-center gap-2">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih Berkas</span>
                          <input type="file" accept=".pdf, .jpg, .jpeg, .png" onChange={(e) => handleFileUpload(e, "kk")} className="hidden" />
                        </label>
                      </div>
                    </div>
                    {uploadingFile === "kk" && <p className="text-xs text-blue-600 font-bold mt-2 animate-pulse">Mengupload berkas KK...</p>}
                    {berkas.kkName && (
                      <div className="mt-2.5 flex items-center gap-2 bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-xs text-emerald-800">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-mono truncate max-w-xs">{berkas.kkName}</span>
                        <span className="ml-auto text-[10px] font-bold text-emerald-600 uppercase">Siap</span>
                      </div>
                    )}
                    {uploadErrors.kk && <p className="text-xs text-red-500 font-bold mt-1">{uploadErrors.kk}</p>}
                  </div>
                  {/* File 2: Akta */}
                  <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest label-required">Scan Akta Kelahiran *</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Digunakan untuk konfirmasi validitas TTL (Tempat Tanggal Lahir).</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-800 cursor-pointer bg-white transition-colors flex items-center gap-2">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih Berkas</span>
                          <input type="file" accept=".pdf, .jpg, .jpeg, .png" onChange={(e) => handleFileUpload(e, "akta")} className="hidden" />
                        </label>
                      </div>
                    </div>
                    {uploadingFile === "akta" && <p className="text-xs text-blue-600 font-bold mt-2 animate-pulse">Mengupload Akta...</p>}
                    {berkas.aktaName && (
                      <div className="mt-2.5 flex items-center gap-2 bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-xs text-emerald-800">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-mono truncate max-w-xs">{berkas.aktaName}</span>
                        <span className="ml-auto text-[10px] font-bold text-emerald-600 uppercase">Siap</span>
                      </div>
                    )}
                    {uploadErrors.akta && <p className="text-xs text-red-500 font-bold mt-1">{uploadErrors.akta}</p>}
                  </div>
                  {/* File 3: Pas Foto */}
                  <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest label-required">Pas Foto Siswa (Baju Sekolah SD) *</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Foto resmi menggunakan seragam merah putih atau pramuka.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-800 cursor-pointer bg-white transition-colors flex items-center gap-2">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih Berkas</span>
                          <input type="file" accept=".pdf, .jpg, .jpeg, .png" onChange={(e) => handleFileUpload(e, "foto")} className="hidden" />
                        </label>
                      </div>
                    </div>
                    {berkas.fotoName && (
                      <div className="mt-2.5 flex items-center gap-2 bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-xs text-emerald-800">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-mono truncate max-w-xs">{berkas.fotoName}</span>
                        <span className="ml-auto text-[10px] font-bold text-emerald-600 uppercase">Siap</span>
                      </div>
                    )}
                    {uploading.foto && <div className="mt-2 text-xs text-blue-600 font-bold animate-pulse">Mengompres & mengupload foto...</div>}

                    {berkas.fotoContent && (
                      <div className="mt-3">
                        <img src={berkas.fotoContent} alt="Preview Foto" className="w-28 h-36 object-cover rounded-lg border border-slate-200" />
                      </div>
                    )}
                    {uploadErrors.foto && <p className="text-xs text-red-500 font-bold mt-1">{uploadErrors.foto}</p>}
                  </div>
                  {/* File 4: Piagam Prestasi (Opsional) */}
                  <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sertifikat/Piagam Prestasi (Opsional)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Sangat disarankan bagi yang memilih jalur Prestasi.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-800 cursor-pointer bg-white transition-colors flex items-center gap-2">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih Berkas</span>
                          <input type="file" accept=".pdf, .jpg, .jpeg, .png" onChange={(e) => handleFileUpload(e, "prestasi")} className="hidden" />
                        </label>
                      </div>
                    </div>
                    {berkas.prestasiName && (
                      <div className="mt-2.5 flex items-center gap-2 bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-xs text-emerald-800">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-mono truncate max-w-xs">{berkas.prestasiName}</span>
                        <span className="ml-auto text-[10px] font-bold text-emerald-600 uppercase">Siap</span>
                      </div>
                    )}
                    {uploadErrors.prestasi && <p className="text-xs text-red-500 font-bold mt-1">{uploadErrors.prestasi}</p>}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Actions buttons */}
          <div className="border-t border-slate-100 pt-6 flex justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                id="btn-prev-step"
                onClick={handlePrev}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 hover:border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Sebelumnya
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                id="btn-next-step"
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-150 transition-all cursor-pointer text-sm"
              >
                Lanjutkan
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                id="btn-submit-registration"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 disabled:shadow-none hover:shadow-emerald-300 transition-all cursor-pointer text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Kirim Pendaftaran Resmi"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
