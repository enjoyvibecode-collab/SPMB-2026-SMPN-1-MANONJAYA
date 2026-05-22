import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, School, Search, Navigation, Info, CheckCircle2, 
  AlertTriangle, XCircle, Compass, Crosshair, HelpCircle 
} from 'lucide-react';

interface VillageData {
  nama: string;
  lat: number;
  lng: number;
  desc: string;
}

// Bounding box for Kecamatan Manonjaya
const MAP_BOX = {
  minLat: -7.4000,
  maxLat: -7.3100,
  minLng: 108.2700,
  maxLng: 108.3600
};

// Coordinate of SMPN 1 Manonjaya
const SCHOOL_COORDS = {
  lat: -7.35231,
  lng: 108.31174,
  nama: 'SMP Negeri 1 Manonjaya'
};

// List of villages in Kecamatan Manonjaya with their centered coordinates
const VILLAGES: VillageData[] = [
  { nama: 'Desa Manonjaya (Pusat)', lat: -7.3512, lng: 108.3125, desc: 'Kawasan terdekat dengan akses langsung ke sekolah.' },
  { nama: 'Desa Margahayu', lat: -7.3480, lng: 108.3020, desc: 'Sisi barat laut, berbatasan langsung dengan pusat pendidikan.' },
  { nama: 'Desa Margaluyu', lat: -7.3620, lng: 108.3180, desc: 'Sisi selatan pusat kecamatan, memiliki akses jalan raya langsung.' },
  { nama: 'Desa Cihaur', lat: -7.3380, lng: 108.3220, desc: 'Sisi timur laut dengan persawahan dan pemukiman padat.' },
  { nama: 'Desa Pasirpanjang', lat: -7.3750, lng: 108.3100, desc: 'Sisi selatan, daerah perbukitan dengan zonasi lingkar luar.' },
  { nama: 'Desa Cibeuti', lat: -7.3410, lng: 108.2910, desc: 'Sisi barat, berdekatan dengan perbatasan kota Tasikmalaya.' },
  { nama: 'Desa Cilangkap', lat: -7.3680, lng: 108.2880, desc: 'Sisi barat selatan dengan bentang alam asri.' },
  { nama: 'Desa Kalimanggis', lat: -7.3310, lng: 108.3090, desc: 'Sisi utara, dilewati jalur transportasi utama kecamatan.' },
  { nama: 'Desa Gunungsari', lat: -7.3210, lng: 108.3240, desc: 'Kawasan utara timur, relatif berjarak sedang.' },
  { nama: 'Desa Kamulyan', lat: -7.3880, lng: 108.3325, desc: 'Wilayah tenggara, berada di rute menuju arah Cineam.' },
  { nama: 'Desa Batusumur', lat: -7.3600, lng: 108.3490, desc: 'Sisi paling timur, berbatasan dengan daerah pegunungan.' },
  { nama: 'Desa Salawangi', lat: -7.3820, lng: 108.2950, desc: 'Kawasan selatan-barat, di lingkar luar batas zonasi aman.' }
];

// Haversine formula to compute geodesic distance in meters between two points
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

// Convert absolute latitude and longitude coordinates into 500x500 map canvas pixels
function coordsToPixels(lat: number, lng: number) {
  const y = ((MAP_BOX.maxLat - lat) / (MAP_BOX.maxLat - MAP_BOX.minLat)) * 500;
  const x = ((lng - MAP_BOX.minLng) / (MAP_BOX.maxLng - MAP_BOX.minLng)) * 500;
  return { x, y };
}

interface PetaZonasiProps {
  onApplyCoordinates?: (lat: number, lng: number, distance: number, address: string) => void;
  activeTab?: string;
  setActiveTab?: (tab: 'home' | 'register' | 'track' | 'faq' | 'admin' | 'verifikasi') => void;
}

export default function PetaZonasi({ onApplyCoordinates, setActiveTab }: PetaZonasiProps) {
  // Map settings
  const [selectedVillageName, setSelectedVillageName] = useState<string>('');
  const [customLat, setCustomLat] = useState<string>('');
  const [customLng, setCustomLng] = useState<string>('');
  
  // Current pinned residence state (Defaults to Village Pusat on initiation)
  const [homePoint, setHomePoint] = useState<{ lat: number; lng: number; isCustom: boolean }>({
    lat: -7.3512,
    lng: 108.3125,
    isCustom: false
  });

  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; distance?: string } | null>(null);
  const mapRef = useRef<SVGSVGElement | null>(null);

  // Compute live distance
  const distanceMeters = Math.round(getHaversineDistance(homePoint.lat, homePoint.lng, SCHOOL_COORDS.lat, SCHOOL_COORDS.lng));

  // Determine Zoning prediction
  let prediction: { 
    ring: number; 
    title: string; 
    bg: string; 
    border: string; 
    text: string; 
    percentageText: string;
    chance: 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Rendah/Luar';
    icon: typeof CheckCircle2; 
    desc: string; 
  };

  if (distanceMeters <= 1000) {
    prediction = {
      ring: 1,
      title: 'Ring 1 (Zonasi Prioritas Utama)',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      border: 'border-emerald-500',
      text: 'text-emerald-700',
      percentageText: '95% - 100%',
      chance: 'Sangat Tinggi',
      icon: CheckCircle2,
      desc: 'Sangat dekat dengan sekolah. Peluang kelulusan di jalur zonasi hampir dapat dipastikan aman sepenuhnya jika syarat administrasi lengkap.'
    };
  } else if (distanceMeters <= 2550) {
    prediction = {
      ring: 2,
      title: 'Ring 2 (Zonasi Inti Kecamatan)',
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      border: 'border-blue-500',
      text: 'text-blue-700',
      percentageText: '70% - 90%',
      chance: 'Tinggi',
      icon: CheckCircle2,
      desc: 'Peluang besar diterima masih terbuka sangat lebar. Mayoritas kuota zonasi biasanya terpenuhi dari jangkauan Ring 2 ini.'
    };
  } else if (distanceMeters <= 5000) {
    prediction = {
      ring: 3,
      title: 'Ring 3 (Zonasi Batas Sedang)',
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      border: 'border-amber-500',
      text: 'text-amber-700',
      percentageText: '30% - 60%',
      chance: 'Sedang',
      icon: AlertTriangle,
      desc: 'Peluang lolos berada di kategori sedang/kondisional. Sangat dipengaruhi oleh total jumlah pendaftar lain di Ring 1 & 2. Pertimbangkan piagam prestasi sebagai cadangan.'
    };
  } else {
    prediction = {
      ring: 0,
      title: 'Di Luar Batas Zonasi Utama (> 5 KM)',
      bg: 'bg-red-50 text-red-800 border-red-200',
      border: 'border-red-500',
      text: 'text-red-700',
      percentageText: 'Di bawah 15%',
      chance: 'Rendah/Luar',
      icon: XCircle,
      desc: 'Sangat rentan tersisih pada jalur zonasi. Kami sangat menyarankan Anda mendaftar melalui jalur alternatif seperti Jalur Prestasi atau Afirmas (KETM).'
    };
  }

  // Handle Dropdown Select Village
  const handleSelectVillage = (name: string) => {
    const v = VILLAGES.find(item => item.nama === name);
    if (v) {
      setSelectedVillageName(name);
      setCustomLat(v.lat.toFixed(6));
      setCustomLng(v.lng.toFixed(6));
      setHomePoint({ lat: v.lat, lng: v.lng, isCustom: false });
    }
  };

  // Convert map click pixels back to geographical coordinates
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Scale to standard coordinates
    const scaleX = (clickX / rect.width) * 500;
    const scaleY = (clickY / rect.height) * 500;

    // Invert pixels to Coordinates mapbox projection
    const mapLng = MAP_BOX.minLng + (scaleX / 500) * (MAP_BOX.maxLng - MAP_BOX.minLng);
    const mapLat = MAP_BOX.maxLat - (scaleY / 500) * (MAP_BOX.maxLat - MAP_BOX.minLat);

    setHomePoint({ lat: mapLat, lng: mapLng, isCustom: true });
    setCustomLat(mapLat.toFixed(6));
    setCustomLng(mapLng.toFixed(6));
    setSelectedVillageName('Lokasi Kustom (Klik Peta)');
  };

  // Manual Coordinates Button Check
  const handleCheckCustomCoords = () => {
    const latNum = parseFloat(customLat);
    const lngNum = parseFloat(customLng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      alert('Format koordinat tidak valid. Harap gunakan angka desimal.');
      return;
    }

    if (latNum < -8.0 || latNum > -6.0 || lngNum < 107.5 || lngNum > 109.0) {
      alert('Koordinat di luar jangkauan wilayah Manonjaya, Tasikmalaya (Harap pastikan wilayah Jawa Barat).');
      return;
    }

    setHomePoint({ lat: latNum, lng: lngNum, isCustom: true });
    setSelectedVillageName('Lokasi Kustom (Input Manual)');
  };

  // Pre-fill coordinate detail and push to registration state
  const handleApplyToRegistration = () => {
    const coordinateString = `${homePoint.lat.toFixed(6)}, ${homePoint.lng.toFixed(6)}`;
    const addressString = `Desa Terdekat/Terpilih: ${selectedVillageName || 'Manonjaya'} (Kecamatan Manonjaya). Estimasi Jarak Zonasi Sekitar ${distanceMeters} Meter. [Koordinat Terverifikasi: ${coordinateString}]`;
    
    // Store in SessionStorage so RegistrationForm can automatically load it on mount
    sessionStorage.setItem('spmb_prefilled_coords', coordinateString);
    sessionStorage.setItem('spmb_prefilled_address', addressString);
    sessionStorage.setItem('spmb_prefilled_distance', distanceMeters.toString());
    sessionStorage.setItem('spmb_prefilled_jalur', distanceMeters <= 2500 ? 'Domisili' : 'Prestasi');
    
    if (onApplyCoordinates) {
      onApplyCoordinates(homePoint.lat, homePoint.lng, distanceMeters, addressString);
    }

    if (setActiveTab) {
      setActiveTab('register');
      setTimeout(() => {
        window.scrollTo({ top: 350, behavior: 'smooth' });
      }, 300);
      alert(`Lokasi rumah berhasil dikunci!\nKoordinat: ${coordinateString}\nTelah disinkronkan ke halaman pendaftaran online.`);
    }
  };

  // Static conversion pixels for UI
  const schoolPixels = coordsToPixels(SCHOOL_COORDS.lat, SCHOOL_COORDS.lng);
  const homePixels = coordsToPixels(homePoint.lat, homePoint.lng);

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-7xl mx-auto my-6 p-4 sm:p-8" id="peta-zonasi-container">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 mb-8 gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>FITUR PPDB MANDIRI</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Peta Kontrol Radar Zonasi Interaktif
          </h3>
          <p className="text-slate-500 text-sm font-semibold">
            Klik pada peta wilayah untuk drop pin rumah Anda, atau pilih nama desa untuk mengkalkulasi kelayakan Zonasi.
          </p>
        </div>
        
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3.5 max-w-sm self-start">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold shrink-0 shadow-md">
            <School className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <h4 className="font-bold text-slate-800">SMPN 1 Manonjaya (Titik Pusat)</h4>
            <p className="font-mono text-slate-500 text-[10px] tracking-tight">{SCHOOL_COORDS.lat}, {SCHOOL_COORDS.lng}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Dynamic checking control form (Left 5-columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Select Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Pilih Desa Keanggotaan</span>
            </h4>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Desa / Kelurahan (Manonjaya)</label>
              <select
                value={selectedVillageName}
                onChange={(e) => handleSelectVillage(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl h-[48px] px-4 font-bold text-sm text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 cursor-pointer"
              >
                <option value="" disabled>-- Pilih Desa Pemukiman Anda --</option>
                {VILLAGES.map((v) => (
                  <option key={v.nama} value={v.nama}>
                    {v.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-[11px] text-slate-500 font-medium leading-normal bg-white p-3 rounded-xl border border-slate-100 flex gap-2">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>
                {selectedVillageName && VILLAGES.find(v => v.nama === selectedVillageName)?.desc 
                 ? VILLAGES.find(v => v.nama === selectedVillageName)?.desc 
                 : 'Anda juga dapat melakukan klik bebas langsung di area peta visual sebelah kanan untuk menentukan letak presisi atap rumah.'}
              </span>
            </div>
          </div>

          {/* Precision manual coordinates form */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-emerald-600" />
              <span>Input Koordinat Presisi GPS (Opsional)</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Latitude</label>
                <input
                  type="text"
                  placeholder="Contoh: -7.351234"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl h-[42px] px-3 font-mono text-xs font-bold text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Longitude</label>
                <input
                  type="text"
                  placeholder="Contoh: 108.312345"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl h-[42px] px-3 font-mono text-xs font-bold text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
            </div>

            <button
              onClick={handleCheckCustomCoords}
              className="w-full py-2.5 bg-slate-850 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-transform transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
            >
              <Navigation className="w-4 h-4" />
              <span>Kalkulasi Koordinat Saya</span>
            </button>
          </div>

          {/* RADAR COUPLING RESULTS AND DECISION WIDGET */}
          <div className={`p-6 rounded-3xl border-2 ${prediction.border} ${prediction.bg} space-y-5 transition-all duration-300 shadow-md`}>
            
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black tracking-wider uppercase opacity-80 font-mono">STATUS KALKULASI DEKADE</p>
                <h4 className="text-xl font-extrabold tracking-tight">
                  {prediction.title}
                </h4>
              </div>
              <div className="p-2.5 rounded-full bg-white/85 shadow-sm text-slate-850">
                <prediction.icon className="w-6 h-6" />
              </div>
            </div>

            {/* Distance Display */}
            <div className="grid grid-cols-2 gap-4 bg-white/90 p-4 rounded-2xl border border-slate-100/50 shadow-xs">
              <div className="space-y-0.5 border-r border-slate-150">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">JARAK DIAGRAM</p>
                <p className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                  {distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(2)} km` : `${distanceMeters} m`}
                </p>
              </div>
              <div className="pl-2 space-y-0.5">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">Peluang Lolos</p>
                <span className={`text-base font-black px-2 py-0.5 rounded-md inline-block leading-normal ${
                  prediction.chance === 'Sangat Tinggi' ? 'bg-emerald-100 text-emerald-800' :
                  prediction.chance === 'Tinggi' ? 'bg-blue-100 text-blue-800' :
                  prediction.chance === 'Sedang' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                }`}>
                  {prediction.chance} ({prediction.percentageText})
                </span>
              </div>
            </div>

            {/* Text description */}
            <p className="text-xs font-semibold leading-relaxed opacity-95">
              {prediction.desc}
            </p>

            {/* Application shortcut integration */}
            <button
              onClick={handleApplyToRegistration}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer border border-blue-500"
            >
              <Navigation className="w-5 h-5 animate-pulse" />
              <span>Gunakan Lokasi Ini di Formulir PPDB</span>
            </button>
          </div>

        </div>

        {/* Dynamic Topography zoning vector map (Right 7-columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-slate-200 rounded-3xl p-3 sm:p-5 bg-slate-950 relative overflow-hidden shadow-2xl">
            
            {/* Legend label overlay top right */}
            <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md rounded-xl p-3 border border-slate-800/80 text-[10px] text-slate-300 space-y-2 pointer-events-none font-medium">
              <h5 className="font-bold text-white tracking-wider uppercase border-b border-slate-800 pb-1.5 mb-1.5">LEGENDA RADAR PPDB</h5>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-400"></span><span>Ring 1 (≤ 1.0 km) - Sangat Aman</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 border border-indigo-400"></span><span>Ring 2 (≤ 2.5 km) - Peluang Tinggi</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-400"></span><span>Ring 3 (≤ 5.0 km) - Sedang / Riskan</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 border border-red-400"></span><span>Luar Zonasi (&gt; 5.0 km) - Tidak Disarankan</span></div>
            </div>

            {/* Instruction Banner Bottom Left */}
            <div className="absolute bottom-4 right-4 z-10 bg-slate-900/85 backdrop-blur-lg rounded-lg px-2.5 py-1.5 border border-slate-700/50 text-[9px] text-slate-350 pointer-events-none font-mono tracking-tight flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
              <span>Dukung Klik Bebas pada Area Peta</span>
            </div>

            <div className="aspect-square bg-slate-900 rounded-2xl relative border border-slate-800/60 overflow-hidden cursor-crosshair">
              {/* Actual inline custom designed SVG MAP */}
              <svg 
                ref={mapRef}
                viewBox="0 0 500 500" 
                className="w-full h-full select-none"
                onClick={handleMapClick}
              >
                {/* Background grid */}
                <defs>
                  <pattern id="mapPattern" width="25" height="25" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="25" y2="0" stroke="#1e293b" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2="25" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="#020617" />
                <rect width="100%" height="100%" fill="url(#mapPattern)" />

                {/* Concentric zoning circles representing coordinates scale physically */}
                {/* School is centered at (231.8, 235) */}
                
                {/* Ring 3 - Outer Circle (5000 meters -> Radius 250 pixels) */}
                <circle 
                  cx={schoolPixels.x} 
                  cy={schoolPixels.y} 
                  r="250" 
                  fill="rgba(245, 158, 11, 0.015)" 
                  stroke="rgba(245, 158, 11, 0.4)" 
                  strokeWidth="1.5" 
                  strokeDasharray="4,4"
                />
                
                {/* Ring 2 - Mid Circle (2500 meters -> Radius 125 pixels) */}
                <circle 
                  cx={schoolPixels.x} 
                  cy={schoolPixels.y} 
                  r="125" 
                  fill="rgba(79, 70, 229, 0.02)" 
                  stroke="rgba(99, 102, 241, 0.55)" 
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                />

                {/* Ring 1 - Inner Circle (1000 meters -> Radius 50 pixels) */}
                <circle 
                  cx={schoolPixels.x} 
                  cy={schoolPixels.y} 
                  r="50" 
                  fill="rgba(16, 185, 129, 0.03)" 
                  stroke="rgba(16, 185, 129, 0.75)" 
                  strokeWidth="2"
                />
                
                {/* Dynamic radar scanner simulation sweep angle */}
                <circle
                  cx={schoolPixels.x}
                  cy={schoolPixels.y}
                  r="250"
                  fill="none"
                  stroke="rgba(37, 99, 235, 0.15)"
                  className="stroke-cyan-500/20"
                  strokeWidth="4"
                  strokeDasharray="16, 500"
                  style={{ transformOrigin: '232px 235px', animation: 'spin 12s linear infinite' }}
                />

                {/* Core school zones connection vector overlay */}
                <line 
                  x1={schoolPixels.x} 
                  y1={schoolPixels.y} 
                  x2={homePixels.x} 
                  y2={homePixels.y} 
                  stroke={distanceMeters <= 1000 ? '#10b981' : distanceMeters <= 2500 ? '#6366f1' : distanceMeters <= 5000 ? '#f59e0b' : '#ef4444'} 
                  strokeWidth="2" 
                  strokeDasharray="6,4"
                  className="animate-pulse"
                />

                {/* Reference static spots for major villages around Kecamatan Manonjaya */}
                {VILLAGES.map((v) => {
                  const p = coordsToPixels(v.lat, v.lng);
                  const isCurrentSelection = v.nama === selectedVillageName;
                  return (
                    <g 
                      key={v.nama}
                      onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, label: v.nama, distance: `${(getHaversineDistance(v.lat, v.lng, SCHOOL_COORDS.lat, SCHOOL_COORDS.lng) / 1000).toFixed(2)} km` })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVillageName(v.nama);
                        setCustomLat(v.lat.toFixed(6));
                        setCustomLng(v.lng.toFixed(6));
                        setHomePoint({ lat: v.lat, lng: v.lng, isCustom: false });
                      }}
                      className="group cursor-pointer"
                    >
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r={isCurrentSelection ? "6" : "3.5"} 
                        fill={isCurrentSelection ? "#6366f1" : "#475569"} 
                        className="transition-all duration-300 group-hover:fill-indigo-300 group-hover:scale-125"
                      />
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r="10" 
                        fill="transparent" 
                      />
                    </g>
                  );
                })}

                {/* Floating dynamic distance marker box above connection line */}
                <g transform={`translate(${(schoolPixels.x + homePixels.x) / 2}, ${(schoolPixels.y + homePixels.y) / 2})`}>
                  <rect 
                    x="-45" 
                    y="-12" 
                    width="90" 
                    height="20" 
                    rx="5" 
                    fill="#1e293b" 
                    stroke="#475569" 
                    strokeWidth="1"
                  />
                  <text 
                    fill="#f8fafc" 
                    fontSize="9" 
                    fontFamily="monospace" 
                    fontWeight="bold"
                    textAnchor="middle" 
                    y="1"
                    className="select-none pointer-events-none"
                  >
                    {distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(2)} km` : `${distanceMeters} m`}
                  </text>
                </g>

                {/* Home/Residence chosen Pin */}
                <g 
                  transform={`translate(${homePixels.x}, ${homePixels.y})`}
                  className="cursor-pointer"
                >
                  <circle cx="0" cy="0" r="16" fill="rgba(37,99,235,0.2)" className="animate-ping" style={{ animationDuration: '3s' }} />
                  <path 
                    d="M 0 -12 Q -8 -20 -8 -28 A 8 8 0 1 1 8 -28 Q 8 -20 0 -12" 
                    fill={distanceMeters <= 2500 ? '#3b82f6' : '#94a3b8'} 
                    stroke="#ffffff" 
                    strokeWidth="1.5"
                  />
                  <circle cx="0" cy="-28" r="3.5" fill="#ffffff" />
                  <text 
                    y="-38" 
                    fill="#ffffff" 
                    fontSize="9" 
                    fontWeight="black" 
                    textAnchor="middle"
                    fontFamily="sans-serif"
                    className="bg-slate-900 border border-slate-800 rounded-sm"
                  >
                    RUMAH
                  </text>
                </g>

                {/* Central school core marker flag pin with gorgeous glow */}
                <g transform={`translate(${schoolPixels.x}, ${schoolPixels.y})`}>
                  {/* Glowing pulses */}
                  <circle cx="0" cy="0" r="28" fill="rgba(16,185,129,0.15)" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                  <circle cx="0" cy="0" r="15" fill="rgba(16,185,129,0.25)" />
                  <circle cx="0" cy="0" r="6" fill="#10b981" />
                  <polygon 
                    points="0,-8 -12,-32 12,-32" 
                    fill="#10b981" 
                    stroke="#ffffff" 
                    strokeWidth="1.5"
                  />
                  <rect x="-35" y="-48" width="70" height="15" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
                  <text 
                    x="0" 
                    y="-38" 
                    fill="#ffffff" 
                    fontSize="7" 
                    fontWeight="black" 
                    textAnchor="middle"
                    className="pointer-events-none select-none font-mono"
                  >
                    SMPN 1 MJY
                  </text>
                </g>

                {/* SVG Live tooltip for village points when hovered */}
                {hoveredPoint && (
                  <g transform={`translate(${hoveredPoint.x + 10}, ${hoveredPoint.y - 15})`} className="pointer-events-none">
                    <rect 
                      width="160" 
                      height="38" 
                      rx="6" 
                      fill="#0f172a" 
                      stroke="#334155" 
                      strokeWidth="1.5" 
                    />
                    <text x="8" y="15" fill="#f8fafc" fontSize="10" fontWeight="bold">{hoveredPoint.label}</text>
                    <text x="8" y="28" fill="#94a3b8" fontSize="9" fontWeight="medium">Jarak ke Sekolah: {hoveredPoint.distance}</text>
                  </g>
                )}
              </svg>

            </div>

            {/* Scale guide bar footer */}
            <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">📍 Barat Manonjaya (Perbatasan Kota)</span>
              <span className="flex items-center gap-1">Skala Visual: 1 Kotak Grid ≈ 500 Meter</span>
              <span className="flex items-center gap-1">Timur Manonjaya (Arah Cineam) 📍</span>
            </div>

          </div>

          {/* Core Info banner regarding zoning standards */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex gap-4 text-xs">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 leading-relaxed text-slate-600">
              <h5 className="font-extrabold text-slate-800">Catatan Regulasi Jarak PPDB</h5>
              <p className="font-semibold text-slate-500 leading-normal">
                Peta ini menggunakan model perhitungan garis lurus (geodesik) sesuai norma regulasi kementerian terkait. Jarak penentu mutlak yang sah akan dihitung kembali oleh Panitia Verifikatur menggunakan koordinat titik tumpu pada Kartu Keluarga resmi yang sah saat pemberkasan berkas asli fisik.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
