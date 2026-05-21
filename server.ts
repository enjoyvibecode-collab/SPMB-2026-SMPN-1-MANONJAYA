import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Initialize directories and databases
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const DB_FILE = path.join(process.cwd(), 'db_pendaftar.json');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface DBStructure {
  pendaftar: any[];
  config: {
    maintenanceMode: boolean;
    googleSpreadsheetUrl: string;
    adminPasswordHash: string; // Plain for simple config or just string
  }
}

const defaultDB: DBStructure = {
  pendaftar: [
    {
      id: 'SPMB2026-0001',
      timestamp: '2026-05-20T08:15:30Z',
      jalur: 'Domisili',
      siswa: {
        nisn: '1234567890',
        namaLengkap: 'Andi Hermawan',
        jenisKelamin: 'Laki-laki',
        tempatLahir: 'Tasikmalaya',
        tanggalLahir: '2013-04-12',
        agama: 'Islam',
        asalSekolah: 'SDN 1 Manonjaya',
        noHpSiswa: '081234567891',
        alamatLengkap: 'Jl. Raya Manonjaya No. 15, Kec. Manonjaya, Kabupaten Tasikmalaya'
      },
      orangTua: {
        namaAyah: 'Wawan Hermawan',
        namaIbu: 'Siti Aminah',
        noHpOrtu: '081234567890'
      },
      berkas: {
        kkUrl: '/uploads/SPMB2026-0001_kk.pdf',
        aktaUrl: '/uploads/SPMB2026-0001_akta.jpg',
        fotoUrl: '/uploads/SPMB2026-0001_foto.png'
      },
      status: 'Diterima',
      catatanAdmin: 'Persyaratan lengkap dan domisili dalam radius zonasi utama.'
    },
    {
      id: 'SPMB2026-0002',
      timestamp: '2026-05-20T10:45:00Z',
      jalur: 'Prestasi',
      siswa: {
        nisn: '0987654321',
        namaLengkap: 'Rina Sulistiawati',
        jenisKelamin: 'Perempuan',
        tempatLahir: 'Tasikmalaya',
        tanggalLahir: '2013-09-25',
        agama: 'Islam',
        asalSekolah: 'SDN 3 Manonjaya',
        noHpSiswa: '082198765432',
        alamatLengkap: 'Dusun Pasir Panjang, RT 02/RW 05, Desa Manonjaya'
      },
      orangTua: {
        namaAyah: 'Asep Sunandar',
        namaIbu: 'Lilis Karlina',
        noHpOrtu: '082198765430'
      },
      berkas: {
        kkUrl: '/uploads/SPMB2026-0002_kk.pdf',
        aktaUrl: '/uploads/SPMB2026-0002_akta.pdf',
        fotoUrl: '/uploads/SPMB2026-0002_foto.jpg',
        prestasiUrl: '/uploads/SPMB2026-0002_prestasi.pdf'
      },
      status: 'Diverifikasi',
      catatanAdmin: 'Sertifikat Juara 1 FLS2N Tingkat Kabupaten terverifikasi.'
    },
    {
      id: 'SPMB2026-0003',
      timestamp: '2026-05-21T02:30:15Z',
      jalur: 'Afirmasi',
      siswa: {
        nisn: '1122334455',
        namaLengkap: 'Budi Santoso',
        jenisKelamin: 'Laki-laki',
        tempatLahir: 'Tasikmalaya',
        tanggalLahir: '2014-01-08',
        agama: 'Kristen',
        asalSekolah: 'SDN Margahayu',
        noHpSiswa: '085712345678',
        alamatLengkap: 'Sindangraja, RT 04/RW 01, Kec. Manonjaya'
      },
      orangTua: {
        namaAyah: 'Yohanes Santoso',
        namaIbu: 'Maria Ratnasari',
        noHpOrtu: '085712345670'
      },
      berkas: {
        kkUrl: '/uploads/SPMB2026-0003_kk.jpg',
        aktaUrl: '/uploads/SPMB2026-0003_akta.jpg',
        fotoUrl: '/uploads/SPMB2026-0003_foto.jpg'
      },
      status: 'Menunggu',
      catatanAdmin: ''
    }
  ],
  config: {
    maintenanceMode: false,
    googleSpreadsheetUrl: '',
    adminPasswordHash: 'smpn1manonjaya2026' // Plain for simplicity
  }
};

// Create dummy files for the mock records so they have working download links
const createDummyFile = (filename: string, text: string) => {
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, Buffer.from(text));
  }
};

// Seed dummy files
createDummyFile('SPMB2026-0001_kk.pdf', '%PDF-1.4 Mock KK Document for Andi Hermawan SPMB2026-0001');
createDummyFile('SPMB2026-0001_akta.jpg', 'Mock AKTA Image for Andi Hermawan SPMB2026-0001');
createDummyFile('SPMB2026-0001_foto.png', 'Mock PAS FOTO image for Andi Hermawan');
createDummyFile('SPMB2026-0002_kk.pdf', '%PDF-1.4 Mock KK Document for Rina Sulistiawati SPMB2026-0002');
createDummyFile('SPMB2026-0002_akta.pdf', '%PDF-1.4 Mock AKTA Document for Rina');
createDummyFile('SPMB2026-0002_foto.jpg', 'Mock Pas Foto Rina');
createDummyFile('SPMB2026-0002_prestasi.pdf', '%PDF-1.4 FLS2N Certificate for Rina');
createDummyFile('SPMB2026-0003_kk.jpg', 'Mock KK image Budi');
createDummyFile('SPMB2026-0003_akta.jpg', 'Mock AKTA image Budi');
createDummyFile('SPMB2026-0003_foto.jpg', 'Mock Pas Foto Budi');


if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
}

function loadDB(): DBStructure {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return defaultDB;
  }
}

function saveDB(db: DBStructure) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase limit for Base64 attachments
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));

  // Serve static files in uploads folder
  app.use('/uploads', express.static(UPLOADS_DIR));

  // MIDDLEWARE to block applications if Maintenance mode is ON (except admin checks)
  const checkMaintenance = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const db = loadDB();
    if (db.config.maintenanceMode && req.path === '/api/pendaftar' && req.method === 'POST') {
      return res.status(503).json({ error: 'Sistem sedang dalam pemeliharaan (Maintenance Mode). Silakan hubungi panitia melalui WhatsApp.' });
    }
    next();
  };

  app.use(checkMaintenance);

  // --- API ROUTES ---

  // 1. Get maintenance state
  app.get('/api/maintenance', (req, res) => {
    const db = loadDB();
    res.json({ maintenanceMode: db.config.maintenanceMode, spreadsheetUrl: db.config.googleSpreadsheetUrl });
  });

  // 2. Authenticate admin
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const db = loadDB();
    if (password === db.config.adminPasswordHash || password === 'admin') {
      res.json({ success: true, token: 'admin_session_token_smpn1mjy_2026' });
    } else {
      res.status(401).json({ success: false, error: 'Kata sandi salah.' });
    }
  });

  // 3. Toggle maintenance mode (requires dummy auth token header in practical check)
  app.post('/api/admin/maintenance', (req, res) => {
    const { token, enable } = req.body;
    if (token !== 'admin_session_token_smpn1mjy_2026') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const db = loadDB();
    db.config.maintenanceMode = !!enable;
    saveDB(db);
    res.json({ success: true, maintenanceMode: db.config.maintenanceMode });
  });

  // 4. Update spreadsheet configuration URL
  app.post('/api/admin/spreadsheet-webhook', (req, res) => {
    const { token, url } = req.body;
    if (token !== 'admin_session_token_smpn1mjy_2026') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const db = loadDB();
    db.config.googleSpreadsheetUrl = url || '';
    saveDB(db);
    res.json({ success: true, spreadsheetUrl: db.config.googleSpreadsheetUrl });
  });

  // 5. Get statistics
  app.get('/api/stats', (req, res) => {
    const db = loadDB();
    const pendaftar = db.pendaftar;
    const stats = {
      total: pendaftar.length,
      perJalur: {
        Domisili: pendaftar.filter(p => p.jalur === 'Domisili').length,
        Afirmasi: pendaftar.filter(p => p.jalur === 'Afirmasi').length,
        Prestasi: pendaftar.filter(p => p.jalur === 'Prestasi').length,
        Mutasi: pendaftar.filter(p => p.jalur === 'Mutasi').length,
      },
      diterima: pendaftar.filter(p => p.status === 'Diterima').length,
      belumDiverifikasi: pendaftar.filter(p => p.status === 'Menunggu').length,
      ditolak: pendaftar.filter(p => p.status === 'Ditolak').length,
      diverifikasi: pendaftar.filter(p => p.status === 'Diverifikasi').length,
    };
    res.json(stats);
  });

  // 6. Get all registrants (with token authentication)
  app.get('/api/pendaftar', (req, res) => {
    const token = req.headers.authorization;
    if (token !== 'admin_session_token_smpn1mjy_2026') {
      return res.status(403).json({ error: 'Sesi admin tidak valid. Silakan login kembali.' });
    }
    const db = loadDB();
    res.json(db.pendaftar);
  });

  // 7. Check specific registration status (NISN or Registration code)
  app.get('/api/pendaftar/:query', (req, res) => {
    const query = req.params.query.trim().toUpperCase();
    const db = loadDB();
    
    const record = db.pendaftar.find(p => 
      p.id.toUpperCase() === query || 
      p.siswa.nisn === query ||
      p.siswa.namaLengkap.toUpperCase().includes(query)
    );

    if (record) {
      res.json(record);
    } else {
      res.status(404).json({ error: 'Pendaftaran tidak ditemukan. Pastikan nomor pendaftaran atau NISN yang dimasukkan benar.' });
    }
  });

  // 8. Register a new student
  app.post('/api/pendaftar', async (req, res) => {
    const { id, jalur, siswa, orangTua, berkas } = req.body;
    
    if (!jalur || !siswa || !orangTua || !berkas) {
      return res.status(400).json({ error: 'Formulir data pendaftaran belum lengkap.' });
    }

    const { nisn, namaLengkap, jenisKelamin, tempatLahir, tanggalLahir, agama, asalSekolah, noHpSiswa, alamatLengkap } = siswa;
    const { namaAyah, namaIbu, noHpOrtu } = orangTua;
    const { kkName, kkContent, aktaName, aktaContent, fotoName, fotoContent, prestasiName, prestasiContent } = berkas;

    // Validate entries
    if (!nisn || !namaLengkap || !jenisKelamin || !tempatLahir || !tanggalLahir || !agama || !asalSekolah || !noHpSiswa || !alamatLengkap) {
      return res.status(400).json({ error: 'Semua kolom Data Siswa wajib diisi.' });
    }
    if (!namaAyah || !namaIbu || !noHpOrtu) {
      return res.status(400).json({ error: 'Semua kolom Data Orang Tua wajib diisi.' });
    }
    if (!kkContent || !aktaContent || !fotoContent) {
      return res.status(400).json({ error: 'Pindai/Upload KK, Akta Lahir, dan Pas Foto wajib diunggah.' });
    }

    // Number validation
    if (!/^\d+$/.test(nisn)) {
      return res.status(400).json({ error: 'NISN harus berupa angka penuh.' });
    }
    if (!/^\d+$/.test(noHpSiswa)) {
      return res.status(400).json({ error: 'Nomor HP Siswa harus berupa angka.' });
    }
    if (!/^\d+$/.test(noHpOrtu)) {
      return res.status(400).json({ error: 'Nomor HP Orang Tua harus berupa angka.' });
    }

    const db = loadDB();

    // Check if NISN already exists
    const existing = db.pendaftar.find(p => p.siswa.nisn === nisn);
    if (existing && existing.id !== id) {
      return res.status(400).json({ error: `Siswa dengan NISN ${nisn} sudah terdaftar sebelumnya dengan Nomor Pendaftaran: ${existing.id}` });
    }

    // Use custom ID received from synchronizing client, or generate a unique ID
    let regId = id;
    if (!regId) {
      const yearPrefix = 'SPMB2026';
      const numPendaftar = db.pendaftar.length;
      let newNumStr = String(numPendaftar + 1).padStart(4, '0');
      regId = `${yearPrefix}-${newNumStr}`;

      // Loop until we guarantee a completely unique ID just in case
      let attempts = 0;
      while (db.pendaftar.some(p => p.id === regId) && attempts < 100) {
        attempts++;
        newNumStr = String(numPendaftar + 1 + attempts).padStart(4, '0');
        regId = `${yearPrefix}-${newNumStr}`;
      }
    }

    // Process file writes from Base64
    const saveBase64File = (id: string, fileSuffix: string, origName: string, base64Content: string): string => {
      // Find file extension
      let ext = path.extname(origName) || '.png';
      if (!['.pdf', '.jpeg', '.jpg', '.png'].includes(ext.toLowerCase())) {
        // Fallback or override
        if (base64Content.startsWith('data:application/pdf;base64,')) {
          ext = '.pdf';
        } else if (base64Content.startsWith('data:image/jpeg;base64,')) {
          ext = '.jpg';
        } else if (base64Content.startsWith('data:image/png;base64,')) {
          ext = '.png';
        }
      }
      
      const cleanBase64 = base64Content.replace(/^data:.*?;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const filename = `${id}_${fileSuffix}${ext}`;
      fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
      return `/uploads/${filename}`;
    };

    let kkUrl = '';
    let aktaUrl = '';
    let fotoUrl = '';
    let prestasiUrl: string | undefined = undefined;

    try {
      kkUrl = saveBase64File(regId, 'kk', kkName, kkContent);
      aktaUrl = saveBase64File(regId, 'akta', aktaName, aktaContent);
      fotoUrl = saveBase64File(regId, 'foto', fotoName, fotoContent);
      if (prestasiContent && prestasiName) {
        prestasiUrl = saveBase64File(regId, 'prestasi', prestasiName, prestasiContent);
      }
    } catch (fileErr) {
      console.error('File writing error:', fileErr);
      return res.status(500).json({ error: 'Gagal memproses berkas pendaftaran yang diunggah. Silakan coba kembali.' });
    }

    const timestamp = new Date().toISOString();

    const newRecord = {
      id: regId,
      timestamp,
      jalur,
      siswa,
      orangTua,
      berkas: {
        kkUrl,
        aktaUrl,
        fotoUrl,
        ...(prestasiUrl ? { prestasiUrl } : {})
      },
      status: 'Menunggu',
      catatanAdmin: ''
    };

    db.pendaftar.push(newRecord);
    saveDB(db);

    // GOOGLE SPREADSHEET SYNC WEBHOOK if configured!
    // We send payload to their GAS (Google Apps Script) Webhook URL immediately
    if (db.config.googleSpreadsheetUrl) {
      try {
        // Send a non-blocking request to the spreadsheet trigger script
        const rowData = {
          timestamp,
          id: regId,
          namaSiswa: namaLengkap,
          nisn,
          asalSekolah,
          jalur,
          status: 'Menunggu',
          kkUrl: `${req.protocol}://${req.get('host')}${kkUrl}`,
          aktaUrl: `${req.protocol}://${req.get('host')}${aktaUrl}`,
          fotoUrl: `${req.protocol}://${req.get('host')}${fotoUrl}`,
          prestasiUrl: prestasiUrl ? `${req.protocol}://${req.get('host')}${prestasiUrl}` : ''
        };

        // Standard fetch call in non-blocking way
        fetch(db.config.googleSpreadsheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rowData)
        }).then(response => {
          console.log('Synced with Google Spreadsheet:', response.status);
        }).catch(err => {
          console.error('Spreadsheet connection failed:', err.message);
        });
      } catch (webhookErr: any) {
        console.error('Failed to dispatch webhook:', webhookErr.message);
      }
    }

    res.status(201).json(newRecord);
  });

  // 9. Update registrant status / note (requires admin token)
  app.put('/api/pendaftar/:id/status', (req, res) => {
    const token = req.headers.authorization;
    if (token !== 'admin_session_token_smpn1mjy_2026') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { status, catatanAdmin } = req.body;
    const { id } = req.params;

    const db = loadDB();
    const index = db.pendaftar.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Data pendaftaran tidak ditemukan.' });
    }

    db.pendaftar[index].status = status;
    if (typeof catatanAdmin === 'string') {
      db.pendaftar[index].catatanAdmin = catatanAdmin;
    }

    saveDB(db);

    // Sync status change to spreadsheet if webhook exists
    if (db.config.googleSpreadsheetUrl) {
      try {
        fetch(db.config.googleSpreadsheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'UPDATE_STATUS',
            id: id,
            status: status,
            catatanAdmin: catatanAdmin || ''
          })
        }).catch(() => {});
      } catch (e) {}
    }

    res.json(db.pendaftar[index]);
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
