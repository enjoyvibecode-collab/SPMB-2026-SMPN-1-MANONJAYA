import { MapPin, ShieldAlert, Trophy, Milestone, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function InformasiJalur() {
  const jalurData = [
    {
      id: 'domisili',
      title: 'Zonasi Domisili',
      quota: '50% dari total kuota',
      icon: MapPin,
      iconBg: 'bg-blue-100 text-blue-700',
      desc: 'Jalur seleksi berdasarkan jarak radius tempat tinggal domisili calon siswa baru ke lingkungan sekolah SMPN 1 Manonjaya.',
      syarat: [
        'Kartu Keluarga (KK) minimal diterbitkan 1 tahun',
        'Surat Keterangan Domisili RT/RW (bila KK belum 1 tahun karena bencana)',
        'Akta Kelahiran calon peserta didik',
        'Ijazah/Surat Keterangan Lulus (SKL) SD asli'
      ]
    },
    {
      id: 'afirmasi',
      title: 'Afirmasi KETM',
      quota: '15% dari total kuota',
      icon: ShieldAlert,
      iconBg: 'bg-indigo-100 text-indigo-700',
      desc: 'Jalur khusus untuk keluarga prasejahtera atau penyandang disabilitas (anak berkebutuhan khusus) di area jangkauan sekolah.',
      syarat: [
        'Kartu Program Keluarga Harapan (PKH) / KKS / KIP / KJS',
        'Terdaftar dalam DTKS Dinas Sosial',
        'Keluarga menyatakan surat pertanggungjawaban mutlak (SPTJM)',
        'Akta Kelahiran dan Kartu Keluarga (KK)'
      ]
    },
    {
      id: 'prestasi',
      title: 'Prestasi Akademik / Non',
      quota: '30% dari total kuota',
      icon: Trophy,
      iconBg: 'bg-emerald-100 text-emerald-700',
      desc: 'Seleksi berdasarkan nilai rapor akhir sekolah SD, prestasi kejuaraan akademik, kompetisi olahraga, maupun seni/keagamaan.',
      syarat: [
        'Akumulasi Nilai Rapor 5 semester terakhir minimal 85.00',
        'Piagam/Sertifikat Kejuaraan minimal Tingkat Kecamatan Kategori Juara 1-3',
        'Surat Keputusan (SK) dari Lembaga Penyelenggara Kompetisi',
        'Sertifikat wajib legalisir sekolah asal atau KONI/Dinas'
      ]
    },
    {
      id: 'mutasi',
      title: 'Mutasi Tugas Orang Tua',
      quota: '5% dari total kuota',
      icon: Milestone,
      iconBg: 'bg-amber-100 text-amber-700',
      desc: 'Jalur pendaftaran bagi calon siswa baru yang mengikuti domisili kerja orang tua karena perpindahan instansi kedinasan.',
      syarat: [
        'Surat Keputusan (SK) Mutasi / Perpindahan Tugas dari Instansi resmi',
        'Surat Keterangan Domisili baru dari instansi tempat ortu bertugas',
        'Foto SK Penugasan Orang Tua terbaru',
        'Akta Kelahiran dan Kartu Keluarga lama & baru'
      ]
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-slate-950 to-slate-800">
            Jalur Penerimaan Murid Baru (PPDB)
          </h2>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            Terdapat 4 jalur resmi pendaftaran yang dapat dipilih sesuai dengan kondisi kualifikasi calon peserta didik. Baca baik-baik batasan syarat utamanya.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {jalurData.map((jalur, idx) => {
            const IconComponent = jalur.icon;
            return (
              <motion.div
                key={jalur.id}
                id={`info-jalur-${jalur.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 hover:bg-white hover:border-blue-400 hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Header Card */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-14 h-14 ${jalur.iconBg} rounded-xl flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800">{jalur.title}</h3>
                      <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold font-mono rounded-full uppercase tracking-wide">
                        KUOTA: {jalur.quota}
                      </span>
                    </div>
                  </div>

                  {/* Body Card */}
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                    {jalur.desc}
                  </p>

                  <div className="border-t border-slate-200/80 pt-5 space-y-3">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">
                      Syarat dan Dokumen Utama:
                    </p>
                    <ul className="space-y-2.5">
                      {jalur.syarat.map((req, reqIdx) => (
                        <li key={reqIdx} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium leading-relaxed">
                          <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
