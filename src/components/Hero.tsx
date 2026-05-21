import { CalendarClock, Award, Users, CheckCircle2, UserCheck, Flame, ChevronRight, Landmark } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { DashboardStats } from '../types';

interface HeroProps {
  onRegisterClick: () => void;
  onTrackClick: () => void;
}

export default function Hero({ onRegisterClick, onTrackClick }: HeroProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden bg-radial from-slate-50 to-blue-50/50 py-16 sm:py-20 lg:py-24 border-b border-slate-100">
      {/* Decorative Grid SVG */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/10 blur-3xl rounded-full pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider shadow-xs"
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              Sistem Resmi PPDB Online 2026/2027
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-3"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                SPMB SMPN 1 Manonjaya <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Tahun Ajaran 2026/2027
                </span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 font-medium">
                Pendaftaran Murid Baru SMPN 1 Manonjaya secara mandiri, aman, dan online. Dirancang memudahkan orang tua siswa mendaftarkan putra-putri tercayangnya ke jenjang SMP.
              </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
            >
              <button
                id="hero-cta-register"
                onClick={onRegisterClick}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-0.5 transition-all cursor-pointer text-base"
              >
                Daftar Sekarang
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                id="hero-cta-track"
                onClick={onTrackClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transform hover:-translate-y-0.5 transition-all cursor-pointer text-base"
              >
                Cek Status Pendaftaran
              </button>
            </motion.div>

            {/* Directives and badging */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-md mx-auto lg:mx-0"
            >
              <div className="text-center lg:text-left">
                <p className="text-2xl font-black text-blue-700">100%</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Online</p>
              </div>
              <div className="text-center lg:text-left border-x border-slate-200 px-4">
                <p className="text-2xl font-black text-blue-700">Mudah</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Bagi Orang Tua</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-2xl font-black text-blue-700">Transparan</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Verifikasi</p>
              </div>
            </motion.div>
          </div>

          {/* Right Side Card Illustration or Stats Dashboard representation */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-6 relative overflow-hidden"
            >
              {/* Pattern Background details */}
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-5 rounded-bl-full"></div>

              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Statistik Kuota Realtime</h3>
                  <p className="text-[11px] font-mono text-slate-400 font-bold">MUTAKHIR • HARI INI</p>
                </div>
              </div>

              {/* Path items list */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>Zonasi Domisili (50%)</span>
                    <span>{stats ? stats.perJalur.Domisili : 43} / 160 Terisi</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                      style={{ width: `${stats ? Math.min((stats.perJalur.Domisili / 160) * 100, 100) : 26.8}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>Afirmasi Ekonomi (15%)</span>
                    <span>{stats ? stats.perJalur.Afirmasi : 18} / 48 Terisi</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                      style={{ width: `${stats ? Math.min((stats.perJalur.Afirmasi / 48) * 100, 100) : 37.5}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>Prestasi Akademik (30%)</span>
                    <span>{stats ? stats.perJalur.Prestasi : 31} / 96 Terisi</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 rounded-full transition-all duration-1000" 
                      style={{ width: `${stats ? Math.min((stats.perJalur.Prestasi / 96) * 100, 100) : 32.2}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>Mutasi Tugas Ortu (5%)</span>
                    <span>{stats ? stats.perJalur.Mutasi : 4} / 16 Terisi</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${stats ? Math.min((stats.perJalur.Mutasi / 16) * 100, 100) : 25}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Simple Stats Grid */}
              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-50 text-center">
                  <p className="text-xs text-slate-500 font-semibold mb-0.5">Total Pendaftar</p>
                  <p className="text-xl font-bold text-blue-700 font-mono">
                    {stats ? stats.total : 96} <span className="text-xs font-normal text-slate-400">Siswa</span>
                  </p>
                </div>
                <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-50 text-center">
                  <p className="text-xs text-slate-500 font-semibold mb-0.5">Sudah Diterima</p>
                  <p className="text-xl font-bold text-emerald-700 font-mono">
                    {stats ? stats.diterima : 42} <span className="text-xs font-normal text-slate-400">Siswa</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
