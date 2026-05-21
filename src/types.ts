export type JalurType = 'Domisili' | 'Afirmasi' | 'Prestasi' | 'Mutasi';

export type StatusPendaftaran = 'Menunggu' | 'Diverifikasi' | 'Ditolak' | 'Diterima';

export interface DataSiswa {
  nisn: string;
  namaLengkap: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  asalSekolah: string;
  noHpSiswa: string;
  alamatLengkap: string;
}

export interface DataOrangTua {
  namaAyah: string;
  namaIbu: string;
  noHpOrtu: string;
}

export interface BerkasUpload {
  kkName: string;
  kkContent: string; // Base64
  aktaName: string;
  aktaContent: string; // Base64
  fotoName: string;
  fotoContent: string; // Base64
  prestasiName?: string;
  prestasiContent?: string; // Base64
}

export interface BerkasUrls {
  kkUrl: string;
  aktaUrl: string;
  fotoUrl: string;
  prestasiUrl?: string;
}

export interface Pendaftar {
  id: string; // SPMB2026-XXXX
  timestamp: string;
  jalur: JalurType;
  siswa: DataSiswa;
  orangTua: DataOrangTua;
  berkas: BerkasUrls;
  status: StatusPendaftaran;
  catatanAdmin?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface DashboardStats {
  total: number;
  perJalur: Record<JalurType, number>;
  diterima: number;
  belumDiverifikasi: number;
  ditolak: number;
}
