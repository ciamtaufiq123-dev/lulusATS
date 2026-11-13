'use client';

import React, { useRef, useState } from 'react';
import { FileText, UploadCloud, Folder, Check, Lock, Briefcase, ArrowRight, AlertCircle, Trash2, } from 'lucide-react';
import { useAppStore } from '@/src/store/useAppStore';
import { MasterKeyword } from '@/types/index';

export const UNIVERSAL_DICTIONARY: {
    triggers: string[];
    item: Omit<MasterKeyword, 'id'>;
}[] = [
    {
        triggers: ['excel', 'spreadsheet', 'vlookup', 'pivot', 'office', 'word'],
        item: {
            keyword: 'Microsoft Office & Excel (Data Processing)',
            description: 'Pengolahan data, penyusunan laporan, dan administrasi perkantoran.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['admin', 'arsip', 'dokumen', 'administrasi', 'data entry', 'input'],
        item: {
            keyword: 'Administrasi Perkantoran & Pengarsipan',
            description: 'Pengelolaan dokumen, input data akurat, dan tata kelola berkas.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['stock', 'inventaris', 'gudang', 'logistik', 'operasional', 'barang', 'outlet'],
        item: {
            keyword: 'Manajemen Inventaris & Operasional harian',
            description: 'Pengawasan stok barang, alur distribusi, dan standar operasional.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['pelanggan', 'customer', 'service', 'melayani', 'komplain', 'complaint', 'hospitality', 'frontliner', 'nasabah', 'teller', 'crm', 'cs'],
        item: {
        keyword: 'Customer Relationship & Service Excellence',
        description: 'Pelayanan pelanggan, penanganan keluhan, dan pemeliharaan kepuasan klien.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['hr', 'hrd', 'human resource', 'rekrutmen', 'recruitment', 'interview', 'wawancara', 'psikotes', 'onboarding', 'karyawan', 'absensi'],
        item: {
            keyword: 'Human Resources, Rekrutmen & Administrasi Personalia',
            description: 'Penyaringan kandidat, penjadwalan wawancara, dan pengelolaan data karyawan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['keuangan', 'finance', 'akuntansi', 'accounting', 'pembukuan', 'kasir', 'cashier', 'pajak', 'invoice', 'jurnal', 'rekonsiliasi', 'bank', 'rekening'],
        item: {
            keyword: 'Administrasi Keuangan, Pembukuan & Transaksi Kas',
            description: 'Pengelolaan laporan keluar-masuk kas, verifikasi transaksi, pembukuan dan penagihan (invoicing).',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['guru', 'pengajar', 'pendidik', 'tentor', 'tutor', 'mengajar', 'kelas', 'siswa', 'murid', 'peserta didik', 'pedagogik', 'sekolah', 'madrasah', 'bimbel'],
        item: {
            keyword: 'Manajemen Kelas & Metode Pembelajaran Aktif (Pedagogik)',
            description: 'Pengelolaan suasana kelas yang kondusif, interaktif, dan berpusat pada pemahaman siswa.',
            category: 'HARD_SKILL',
            points: 5,
        },
    },
    {
        triggers: ['kurikulum', 'kurikulum merdeka', 'rpp', 'modul ajar', 'silabus', 'bahan ajar', 'materi', 'lesson plan', 'prota', 'promes'],
        item: {
            keyword: 'Penyusunan RPP, Modul Ajar & Implementasi Kurikulum',
            description: 'Perancangan perangkat pembelajaran, silabus, dan materi ajar sesuai standar kurikulum.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['asesmen', 'evaluasi', 'penilaian', 'ujian', 'ulangan', 'rapor', 'nilai', 'remedial', 'pengayaan', 'akademik'],
        item: {
            keyword: 'Evaluasi Pembelajaran, Asesmen Diagnostik & Penilaian Akademik',
            description: 'Pengukuran pencapaian belajar, analisis hasil ujian, dan penyusunan laporan hasil belajar.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['media pembelajaran', 'alat peraga', 'e-learning', 'interaktif', 'presentasi', 'quizizz', 'google classroom', 'edukasi'],
        item: {
            keyword: 'Pengembangan Media Pembelajaran Digital & Interaktif',
            description: 'Pemanfaatan teknologi pendidikan dan media visual untuk meningkatkan minat belajar peserta didik.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['desain', 'design', 'canva', 'photoshop', 'illustrator', 'grafis', 'graphic', 'video', 'capcut', 'premiere', 'visual', 'kreatif'],
        item: {
            keyword: 'Desain Grafis, Produksi Konten Visual (Canva / Editing)',
            description: 'Pembuatan aset visual branding, desain materi promosi, dan penyuntingan video pendek.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['sosmed', 'social media', 'media sosial', 'instagram', 'tiktok', 'youtube', 'konten', 'content', 'copywriting', 'iklan', 'ads', 'seo', 'engagement', 'desain', 'canva'],
        item: {
            keyword: 'Social Media Management, Copywriting & Digital Content',
            description: 'Perencanaan kalender konten, copywriting, optimasi SEO, dan kampanye media sosial.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['sales', 'penjualan', 'target', 'marketing', 'pemasaran', 'promosi', 'negosiasi', 'prospek', 'b2b', 'b2c', 'closing', 'promoter'],
        item: {
            keyword: 'Strategi Penjualan, Negosiasi, dan Akuisisi Pelanggan',
            description: 'Pencapaian target penjualan, negosiasi komersial, dan perluasan jaringan pelanggan baru.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['outlet', 'crew', 'kru', 'store', 'toko', 'f&b', 'pos', 'food', 'barista', 'waiter', 'produksi', 'kebersihan', 'hygiene'],
        item: {
            keyword: 'Operasional Outlet, Point Of Sales (POS) & Quality Control',
            description: 'Pelayanan transaksi langsung di outlet, persiapan produk, dan penjagaan standar kebersihan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['react', 'next', 'javascript', 'typescript', 'frontend', 'web', 'html', 'tailwind css', 'css', 'php', 'laravel', 'python'],
        item: {
            keyword: 'Modern Web Development (JS / TS / React)',
            description: 'Pengembang aplikasi web responsif dan terstruktur.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers:['tailwind', 'ui', 'ux', 'figma', 'responsive', 'mobile'],
        item: {
            keyword: 'Responsive UI/UX & Styling Architecture',
            description: 'Implementasi antarmuka pengguna modern yang mobile-friendly',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['api', 'database', 'sql', 'supabase', 'prisma', 'backend', 'git', 'postgresql', 'laragon', 'xampp'],
        item: {
            keyword: 'RESTful API & database Integration',
            description: 'Pengolaan struktur data, integrasi API, dan version control.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['data analyst', 'data analytics', 'business intelligence', 'power bi', 'tableau', 'looker studio', 'dashboard', 'statistik', 'visualisasi data'],
        item: {
            keyword: 'Analisis Data, Business Intelligence & Visualisasi',
            description: 'Analisis data, penyusunan dashboard, dan penyajian insight untuk mendukung keputusan bisnis.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['data engineer', 'etl', 'data warehouse', 'data pipeline', 'spark', 'kafka', 'airflow', 'dbt'],
        item: {
            keyword: 'Data Engineering, ETL & Data Pipeline',
            description: 'Perancangan pipeline, integrasi sumber data, dan pengelolaan data warehouse.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['data scientist', 'machine learning', 'deep learning', 'artificial intelligence', 'kecerdasan buatan', 'tensorflow', 'pytorch', 'nlp', 'computer vision'],
        item: {
            keyword: 'Data Science, Machine Learning & AI',
            description: 'Pemodelan prediktif, machine learning, dan penerapan AI untuk kebutuhan produk atau bisnis.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['cybersecurity', 'cyber security', 'keamanan siber', 'penetration testing', 'penetration tester', 'soc analyst', 'siem', 'incident response', 'vulnerability assessment'],
        item: {
            keyword: 'Cybersecurity, Security Operations & Incident Response',
            description: 'Pemantauan ancaman, penilaian kerentanan, dan respons insiden keamanan informasi.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['cloud engineer', 'aws', 'azure', 'google cloud', 'gcp', 'devops', 'kubernetes', 'docker', 'terraform', 'ci/cd'],
        item: {
            keyword: 'Cloud Computing, DevOps & Infrastructure as Code',
            description: 'Pengelolaan infrastruktur cloud, otomasi deployment, container, dan pipeline CI/CD.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['network engineer', 'network administrator', 'system administrator', 'sysadmin', 'helpdesk', 'it support', 'jaringan komputer', 'linux', 'windows server'],
        item: {
            keyword: 'IT Support, Administrasi Sistem & Jaringan',
            description: 'Dukungan teknis, pemeliharaan server, dan pengelolaan jaringan serta perangkat pengguna.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['quality assurance', 'quality control', 'software tester', 'qa engineer', 'testing', 'automation testing', 'selenium', 'playwright', 'bug tracking'],
        item: {
            keyword: 'Quality Assurance, Software Testing & Test Automation',
            description: 'Pengujian fungsional, pencatatan bug, dan otomasi pengujian untuk menjaga kualitas aplikasi.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['mobile developer', 'android developer', 'ios developer', 'react native', 'flutter', 'swift', 'kotlin android', 'aplikasi mobile'],
        item: {
            keyword: 'Pengembangan Aplikasi Mobile Android & iOS',
            description: 'Pengembangan, pengujian, dan pemeliharaan aplikasi mobile lintas platform.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['product manager', 'product owner', 'business analyst', 'system analyst', 'analisis bisnis', 'user story', 'requirement gathering', 'scrum master', 'agile'],
        item: {
            keyword: 'Product Management, Business Analysis & Agile',
            description: 'Penggalian kebutuhan, penyusunan prioritas produk, dan koordinasi pengembangan lintas fungsi.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['ux researcher', 'user research', 'usability testing', 'interaction design', 'design system', 'prototyping', 'wireframe'],
        item: {
            keyword: 'UX Research, Usability Testing & Design System',
            description: 'Riset pengguna, pengujian usability, dan perancangan pengalaman serta sistem desain.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['procurement', 'pengadaan', 'vendor management', 'tender', 'negosiasi vendor', 'sourcing'],
        item: {
            keyword: 'Procurement, Pengadaan & Manajemen Vendor',
            description: 'Seleksi pemasok, negosiasi, proses tender, dan pengendalian pembelian barang atau jasa.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['supply chain', 'rantai pasok', 'demand planning', 'forecasting', 'distribution planning', 's&op'],
        item: {
            keyword: 'Supply Chain, Demand Planning & Distribusi',
            description: 'Perencanaan kebutuhan, koordinasi rantai pasok, dan pengendalian distribusi.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['quality assurance manufacturing', 'iso 9001', 'iso 22000', 'haccp', 'gmp', 'kalibrasi', 'quality inspector'],
        item: {
            keyword: 'Quality Assurance, Inspeksi & Standar Mutu',
            description: 'Inspeksi proses dan produk, dokumentasi mutu, serta penerapan standar kualitas industri.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['maintenance engineer', 'maintenance technician', 'preventive maintenance', 'troubleshooting mesin', 'mesin produksi', 'mekatronika', 'plc', 'otomasi industri'],
        item: {
            keyword: 'Pemeliharaan Mesin, Troubleshooting & Otomasi Industri',
            description: 'Perawatan preventif, perbaikan mesin, dan pemantauan peralatan produksi.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['civil engineer', 'teknik sipil', 'site engineer', 'quantity surveyor', 'bim', 'revit', 'autocad', 'struktur bangunan'],
        item: {
            keyword: 'Teknik Sipil, Konstruksi & Building Information Modeling',
            description: 'Perencanaan dan pengawasan konstruksi, pengukuran volume, serta pemodelan BIM.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['arsitek', 'architect', 'architectural design', 'desain interior', 'interior designer', 'sketchup', '3d modeling'],
        item: {
            keyword: 'Arsitektur, Desain Interior & Pemodelan 3D',
            description: 'Penyusunan konsep ruang, gambar kerja, visualisasi, dan koordinasi desain bangunan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['mechanical engineer', 'electrical engineer', 'teknik mesin', 'teknik elektro', 'hvac', 'piping', 'rotating equipment'],
        item: {
            keyword: 'Rekayasa Mekanikal, Elektrikal & HVAC',
            description: 'Perancangan, instalasi, dan pemeliharaan sistem mekanikal serta elektrikal.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['chemical engineer', 'process engineer', 'teknik kimia', 'process safety', 'process optimization', 'lab analyst', 'laboratorium kimia'],
        item: {
            keyword: 'Rekayasa Proses, Teknik Kimia & Analisis Laboratorium',
            description: 'Pengendalian parameter proses, optimasi produksi, dan pengujian sampel laboratorium.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['renewable energy', 'energi terbarukan', 'solar pv', 'panel surya', 'plts', 'energy audit', 'efisiensi energi'],
        item: {
            keyword: 'Energi Terbarukan, PLTS & Efisiensi Energi',
            description: 'Perencanaan atau pemeliharaan sistem energi terbarukan dan evaluasi konsumsi energi.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['mining engineer', 'pertambangan', 'mine planning', 'geotechnical', 'drilling', 'blasting', 'mining safety'],
        item: {
            keyword: 'Operasi Pertambangan, Mine Planning & Keselamatan Tambang',
            description: 'Perencanaan dan pemantauan operasi tambang, pengeboran, serta keselamatan kerja lapangan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['geologist', 'geologi', 'geophysics', 'geofisika', 'geodesi', 'survey pemetaan', 'gis', 'arcgis'],
        item: {
            keyword: 'Geologi, Geospasial & Sistem Informasi Geografis',
            description: 'Survei lapangan, analisis data geospasial, pemetaan, dan interpretasi kondisi bumi.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['hse', 'k3', 'safety officer', 'safety inspector', 'environmental health', 'iso 45001', 'iso 14001', 'jha', 'jsa'],
        item: {
            keyword: 'HSE, K3, Manajemen Risiko & Kepatuhan Lingkungan',
            description: 'Identifikasi bahaya, inspeksi keselamatan, investigasi insiden, dan pemantauan kepatuhan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['environmental engineer', 'lingkungan hidup', 'waste management', 'pengelolaan limbah', 'amdal', 'ukl upl', 'konservasi'],
        item: {
            keyword: 'Pengelolaan Lingkungan, AMDAL & Pengendalian Limbah',
            description: 'Pemantauan dampak lingkungan, pengelolaan limbah, dan pemenuhan dokumen lingkungan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['agronomi', 'agronomist', 'agriculture', 'pertanian', 'hortikultura', 'perkebunan', 'crop management', 'pest control'],
        item: {
            keyword: 'Agronomi, Budidaya Tanaman & Manajemen Pertanian',
            description: 'Pemantauan budidaya, kesehatan tanaman, produktivitas lahan, dan pengendalian hama.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['perikanan', 'aquaculture', 'akuakultur', 'budidaya ikan', 'kelautan', 'perikanan tangkap', 'hatchery'],
        item: {
            keyword: 'Perikanan, Akuakultur & Pengelolaan Budidaya',
            description: 'Pengelolaan kualitas air, pemeliharaan komoditas, dan operasional budidaya perikanan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['dokter', 'physician', 'medical doctor', 'dokter umum', 'dokter gigi', 'clinical practice', 'rekam medis'],
        item: {
            keyword: 'Pelayanan Klinis, Diagnosis & Rekam Medis',
            description: 'Pelayanan pasien, dokumentasi klinis, dan koordinasi penanganan sesuai standar profesi.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['perawat', 'nurse', 'nursing', 'asuhan keperawatan', 'bidan', 'midwife', 'kebidanan', 'puskesmas'],
        item: {
            keyword: 'Asuhan Keperawatan, Kebidanan & Edukasi Pasien',
            description: 'Pemantauan kondisi pasien, tindakan keperawatan, edukasi, dan dokumentasi pelayanan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['apoteker', 'pharmacist', 'farmasi', 'pharmacy', 'asisten apoteker', 'dispensing obat', 'bpom'],
        item: {
            keyword: 'Pelayanan Farmasi, Dispensing & Pengelolaan Obat',
            description: 'Penyiapan dan penyerahan obat, pengelolaan persediaan, serta konseling penggunaan obat.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['analis laboratorium', 'medical laboratory', 'laboratorium klinik', 'mikrobiologi', 'hematologi', 'patologi klinik', 'phlebotomy'],
        item: {
            keyword: 'Analisis Laboratorium Klinis & Pengendalian Mutu Sampel',
            description: 'Pengambilan dan pengujian sampel, validasi hasil, serta penerapan prosedur laboratorium.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['radiografer', 'radiographer', 'radiologi', 'radiology', 'medical imaging', 'ct scan', 'mri', 'ultrasonografi'],
        item: {
            keyword: 'Radiologi, Radiografi & Pencitraan Medis',
            description: 'Persiapan pasien, pengoperasian peralatan pencitraan, dan pengelolaan hasil pemeriksaan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['fisioterapis', 'physiotherapist', 'physiotherapy', 'terapi okupasi', 'occupational therapist', 'rehabilitasi medik', 'terapi wicara'],
        item: {
            keyword: 'Fisioterapi, Rehabilitasi & Terapi Pasien',
            description: 'Asesmen fungsi gerak, penyusunan program terapi, dan evaluasi perkembangan pasien.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['nutritionist', 'dietitian', 'ahli gizi', 'dietisien', 'gizi klinis', 'meal planning', 'konseling gizi'],
        item: {
            keyword: 'Asuhan Gizi, Perencanaan Diet & Konseling Nutrisi',
            description: 'Asesmen kebutuhan gizi, penyusunan diet, dan edukasi nutrisi sesuai kondisi klien.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['psikolog', 'psychologist', 'konselor', 'counselor', 'konseling psikologi', 'mental health', 'psikometri'],
        item: {
            keyword: 'Konseling, Asesmen Psikologis & Kesehatan Mental',
            description: 'Wawancara, asesmen, pendampingan, dan dokumentasi sesuai etika serta kompetensi profesi.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['legal counsel', 'lawyer', 'advokat', 'pengacara', 'paralegal', 'legal drafting', 'kontrak hukum', 'litigasi'],
        item: {
            keyword: 'Legal Research, Contract Drafting & Kepatuhan Hukum',
            description: 'Riset regulasi, penelaahan kontrak, penyusunan dokumen hukum, dan dukungan proses litigasi.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['internal auditor', 'auditor', 'audit internal', 'audit eksternal', 'risk management', 'manajemen risiko', 'compliance officer', 'kepatuhan regulasi'],
        item: {
            keyword: 'Audit, Manajemen Risiko & Kepatuhan',
            description: 'Evaluasi kontrol internal, pemetaan risiko, audit proses, dan pemantauan kepatuhan regulasi.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['tax consultant', 'tax officer', 'konsultan pajak', 'pajak penghasilan', 'ppn', 'e-faktur', 'e-bupot', 'spt tahunan'],
        item: {
            keyword: 'Administrasi Pajak, Pelaporan SPT & Kepatuhan Fiskal',
            description: 'Perhitungan pajak, rekonsiliasi fiskal, dan penyusunan dokumen pelaporan pajak.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['credit analyst', 'credit risk', 'analis kredit', 'underwriter', 'underwriting', 'klaim asuransi', 'insurance claim'],
        item: {
            keyword: 'Analisis Kredit, Underwriting & Klaim Asuransi',
            description: 'Analisis kelayakan, penilaian risiko, pemeriksaan dokumen, dan pemrosesan klaim.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['actuary', 'aktuaris', 'aktuaria', 'statistical modeling', 'model aktuaria', 'pricing insurance'],
        item: {
            keyword: 'Aktuaria, Pemodelan Statistik & Analisis Risiko',
            description: 'Pemodelan data statistik untuk estimasi risiko, penetapan harga, dan proyeksi keuangan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['social worker', 'pekerja sosial', 'community development', 'pemberdayaan masyarakat', 'ngo', 'organisasi nirlaba', 'pendamping masyarakat'],
        item: {
            keyword: 'Pendampingan Sosial, Pemberdayaan & Pengembangan Komunitas',
            description: 'Asesmen kebutuhan, pendampingan kelompok, dan koordinasi program pemberdayaan masyarakat.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['penerjemah', 'translator', 'interpreter', 'translation', 'localization', 'proofreading', 'penyunting naskah'],
        item: {
            keyword: 'Penerjemahan, Penyuntingan & Lokalisasi Konten',
            description: 'Penerjemahan dan penyuntingan materi dengan menjaga akurasi istilah serta konteks budaya.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['journalist', 'jurnalis', 'reporter', 'wartawan', 'news writing', 'jurnalistik', 'fact checking'],
        item: {
            keyword: 'Jurnalistik, Riset Berita & Verifikasi Fakta',
            description: 'Riset narasumber, penulisan berita, wawancara, dan verifikasi informasi.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['video editor', 'videographer', 'videografi', 'motion graphic', 'animator', 'animation', 'fotografer', 'photographer', 'after effects'],
        item: {
            keyword: 'Produksi Video, Fotografi, Animasi & Motion Graphics',
            description: 'Pengambilan gambar, penyuntingan video, animasi, dan penyelesaian aset visual.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['chef', 'cook', 'koki', 'juru masak', 'pastry', 'baker', 'baking', 'food preparation', 'food safety'],
        item: {
            keyword: 'Operasional Dapur, Pengolahan Makanan & Food Safety',
            description: 'Persiapan bahan, produksi makanan, pengendalian kualitas, dan penerapan keamanan pangan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['hotel operations', 'front office', 'housekeeping', 'reservasi hotel', 'hotel receptionist', 'guest relations', 'akomodasi'],
        item: {
            keyword: 'Operasional Hotel, Front Office & Guest Relations',
            description: 'Layanan tamu, reservasi, koordinasi antarbagian, dan penanganan kebutuhan pengunjung.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['event organizer', 'event management', 'penyelenggara acara', 'wedding organizer', 'protokoler', 'event coordinator'],
        item: {
            keyword: 'Manajemen Acara, Protokoler & Koordinasi Vendor',
            description: 'Perencanaan acara, koordinasi vendor, pengaturan jadwal, dan pelaksanaan kegiatan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['flight attendant', 'pramugari', 'pramugara', 'aviation', 'ground handling', 'airport operations', 'penerbangan'],
        item: {
            keyword: 'Layanan Penerbangan, Keselamatan & Operasional Bandara',
            description: 'Pelayanan penumpang, kepatuhan prosedur keselamatan, dan koordinasi operasional penerbangan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['welding', 'welder', 'pengelasan', 'juru las', 'pipe fitter', 'pipefitter', 'fabrication', 'fabrikasi'],
        item: {
            keyword: 'Pengelasan, Fabrikasi & Instalasi Perpipaan',
            description: 'Pengerjaan fabrikasi dan pengelasan sesuai gambar kerja, standar mutu, dan prosedur keselamatan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['electrician', 'teknisi listrik', 'instalasi listrik', 'electrical maintenance', 'plc programming', 'panel listrik'],
        item: {
            keyword: 'Instalasi Listrik, Panel & Pemeliharaan Elektrikal',
            description: 'Pemasangan, pemeriksaan, dan perbaikan instalasi serta panel elektrikal.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['e-commerce', 'ecommerce', 'marketplace', 'shopee', 'tokopedia', 'lazada', 'product listing', 'conversion rate'],
        item: {
            keyword: 'Operasional E-commerce, Marketplace & Optimasi Konversi',
            description: 'Pengelolaan katalog, promosi marketplace, pesanan, dan analisis performa penjualan digital.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['training and development', 'learning and development', 'learning development', 'corporate training', 'training needs analysis', 'l&d', 'pengembangan kompetensi'],
        item: {
            keyword: 'Learning & Development, Pelatihan & Pengembangan Kompetensi',
            description: 'Analisis kebutuhan pelatihan, penyusunan materi, fasilitasi pembelajaran, dan evaluasi hasil.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['clinical research coordinator', 'clinical trial', 'uji klinis', 'good clinical practice', 'gcp study', 'monitoring uji klinis'],
        item: {
            keyword: 'Riset Klinis, Uji Klinis & Good Clinical Practice',
            description: 'Koordinasi subjek dan dokumen penelitian, pemantauan studi, serta kepatuhan terhadap protokol klinis.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['biomedical engineer', 'biomedical engineering', 'teknik biomedis', 'medical device', 'alat kesehatan', 'kalibrasi alat medis'],
        item: {
            keyword: 'Rekayasa Biomedis, Peralatan Medis & Kalibrasi',
            description: 'Pengujian, pemeliharaan, dan kalibrasi peralatan medis serta dukungan teknis fasilitas kesehatan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['archivist', 'arsiparis', 'archival management', 'records management', 'manajemen arsip', 'preservasi dokumen'],
        item: {
            keyword: 'Kearsipan, Records Management & Preservasi Dokumen',
            description: 'Klasifikasi, retensi, digitalisasi, dan pemeliharaan arsip serta rekod organisasi.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['archaeologist', 'arkeolog', 'arkeologi', 'anthropologist', 'antropologi', 'cultural heritage', 'cagar budaya'],
        item: {
            keyword: 'Arkeologi, Antropologi & Pelestarian Cagar Budaya',
            description: 'Survei lapangan, dokumentasi temuan, analisis artefak, dan pelestarian warisan budaya.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['forensic analyst', 'forensik digital', 'digital forensics', 'forensic accounting', 'investigasi forensik', 'chain of custody'],
        item: {
            keyword: 'Investigasi Forensik, Analisis Bukti & Chain of Custody',
            description: 'Pengumpulan dan analisis bukti serta dokumentasi temuan dengan prosedur yang dapat ditelusuri.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['metrologist', 'metrologi', 'measurement system', 'measurement uncertainty', 'kalibrasi instrumen', 'alat ukur'],
        item: {
            keyword: 'Metrologi, Kalibrasi Instrumen & Sistem Pengukuran',
            description: 'Kalibrasi alat ukur, pengendalian ketertelusuran, dan evaluasi akurasi pengukuran.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['forester', 'kehutanan', 'forestry', 'silvikultur', 'forest management', 'konservasi hutan', 'wildlife conservation'],
        item: {
            keyword: 'Kehutanan, Silvikultur & Konservasi Keanekaragaman Hayati',
            description: 'Pemantauan kawasan, pengelolaan sumber daya hutan, dan kegiatan konservasi lapangan.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['accessibility specialist', 'web accessibility', 'wcag', 'aksesibilitas digital', 'inclusive design', 'assistive technology'],
        item: {
            keyword: 'Aksesibilitas Digital, WCAG & Inclusive Design',
            description: 'Audit aksesibilitas produk digital dan rekomendasi perbaikan untuk kebutuhan pengguna yang beragam.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['marine surveyor', 'naval architecture', 'arsitektur kapal', 'ship operations', 'operasi kapal', 'port operations', 'pelabuhan'],
        item: {
            keyword: 'Operasi Maritim, Survei Kapal & Manajemen Pelabuhan',
            description: 'Pemeriksaan kapal, koordinasi kegiatan pelabuhan, dan pemantauan prosedur operasional maritim.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['tahun', 'pengalaman', 'minimal', 'berpengalaman', 'fresh graduate'],
        item: {
            keyword: 'Kualifikasi & Jam Terbang Terverifikasi',
            description: 'Memenuhi kriteria pengalaman dan latar belakang posisi',
            category: 'EXPERIENCE',
            points: 4,
        },
    },
    {
        triggers: ['kbm', 'belajar mengajar', 'wali kelas', 'bimbingan', 'pembinaan', 'ekstrakulikuler', 'karakter', 'wali murid', 'orang tua'],
        item: {
            keyword: 'Pelaksanaan Kegiatan Belajar Mengajar (KBM) & Pembinaan Siswa',
            description: 'Rekam jejak mendampingi perkembangan akademik, karakter siswa, serta komunikasi aktif dengan orang tua/wali',
            category: 'EXPERIENCE',
            points: 4,
        },
    },
    {
        triggers: ['target', 'kpi', 'produktivitas', 'efisiensi', 'kinerja', 'performa', 'pencapaian', 'deadline', 'hasil'],
        item: {
            keyword: 'Pencapaian Target Harian (KPI) & Efisisensi Operasional',
            description: 'Terbukti konsisten menyelesaikan tanggung jawab  kerjatepat waktu sesuai indikator kinerja utama.',
            category: 'EXPERIENCE',
            points: 4,
        },
    },
    {
        triggers: ['sop', 'standar', 'kualitas', 'prosedur', 'aturan', 'shift'],
        item: {
            keyword: 'Kepatuhan Prosedur Kerja (SOP) & Kualitas',
            description: 'Terbiasa bekerja mengikuti stamdar mutu dan regulasi perusahaan.',
            category: 'EXPERIENCE',
            points: 4,
        },
    },
    {
        triggers:['cepat', 'dinamis', 'tekanan', 'deadline', 'multitasking', 'target'],
        item: {
            keyword: 'Adaptif di Lingkungan Kerja Cepat & Berorientasi Target',
            description: 'Mampu menjaga performa optimal sesuai tenggat waktu',
            category: 'EXPERIENCE',
            points: 4,
        },
    },
    {
        triggers: ['teliti', 'teili', 'rapi', 'rapih', 'detail', 'jujur', 'disiplin', 'bertanggung jawab'],
        item: {
            keyword: 'Teliti, Disiplin & Detail Oriented',
            description: 'Karakter kerja berintegritas tinggi dengan tingkat akurasi baik.',
            category: 'SOFT_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['komunikasi', 'komunikatif', 'tim', 'team', 'teamwork', 'kerja sama', 'kerjasama', 'interpersonal', 'ramah', 'kolaborasi', 'koordinasi', 'public speaking'],
        item: {
            keyword: 'Komunikasi Efektif, Kerja Sama & Kolaborasi Tim',
            description: 'Mampu menyampaikan informasi secara jelas, persuasif, dan bersinergi di dalam tim',
            category: 'SOFT_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['adaptif', 'cepat belajar', 'fast learner', 'tekanan', 'pressure', 'multitasking', 'waktu', 'time management', 'fleksibet'],
        item: {
            keyword: 'Fast Learner, Adaptif & Management Waktu yang Baik',
            description: 'Cepat menguasai alur kerja baru dan mampu mengatur prioritas tugas di bawah tekanan deadline.',
            category: 'SOFT_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['sabar', 'empati', 'mendidik', 'motivasi', 'komunikatif', 'anak', 'teladan', 'disiplin'],
        item: {
            keyword: 'Komunikasi Edukatif, Empati Tinggi & Pembimbing yang Sabar',
            description: 'Mampu membimbing beragam karakter siswa dengan pendekatan yang sabar, suportif, dan memotivasi.',
            category: 'SOFT_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['masalah', 'solusi', 'problem', 'analitis', 'inisiatif', 'mandiri', 'kreatif'],
        item: {
            keyword: 'Problem Solving & Inisiatif Kerja Proaktif',
            description: 'Cepat tanggap menyelesaikan kendala operasional sehari-hari.',
            category: 'SOFT_SKILL',
            points: 4,
        },
    },
];

function triggerMatches(text: string, trigger: string): boolean {
    const normalizedTrigger = trigger.toLowerCase();
    if (normalizedTrigger.length > 3) {
        return text.includes(normalizedTrigger);
    }

    const escapedTrigger = normalizedTrigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${escapedTrigger}($|[^a-z0-9])`, 'i').test(text);
}

function normalizeKeyword(keyword: string): string {
    return keyword.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function extractKeywordsLocally(jobDesc: string): MasterKeyword[] {
    const lower = jobDesc.toLowerCase();
    const matched: MasterKeyword[] = [];

    UNIVERSAL_DICTIONARY.forEach((entry, idx) => {
        const isHit = entry.triggers.some((trigger) => triggerMatches(lower, trigger));
        if (isHit) {
            matched.push({
                id: `kw-${idx}`,
                ...entry.item
            });
        }
    });

    const hasHard = matched.some((m) => m.category === 'HARD_SKILL');
    const hasExp = matched.some((m) => m.category === 'EXPERIENCE');
    const hasSoft = matched.some((m) => m.category === 'SOFT_SKILL');

    if (!hasHard) {
        matched.push(
            {
                id: 'gen-hard-1',
                keyword: 'Penguasaan teknis & Perangkat kerja Utama',
                description: 'Kompetensi teknis inti sesuai bidang posisi yang dilamar.',
                category: 'HARD_SKILL',
                points: 4
            },
            {
                id: 'gen-hard-2',
                keyword: 'Penyusunan laporan & Manajemen Data Kerja',
                description: 'Dokumentasi dan pelaporam hasil pekerjaan secara terstruktur.',
                category: 'HARD_SKILL',
                points: 4,
            }
        );
    }

    if (!hasExp) {
        matched.push(
            {
                id: 'gen-exp-1',
                keyword: 'Rekam jejak Eksekusi Kerja sesuai SOP',
                description: 'Pengalaman menjalankan tugas operasional dengan standar terukur.',
                category: 'EXPERIENCE',
                points: 4,
            },
            {
                id: 'gen-exp-2',
                keyword: 'Pencapaian Target & Produktivitas Harian',
                description: 'Konsisten menyelesaikan tanggung jawab tepat waktu',
                category: 'EXPERIENCE',
                points: 4,
            }
        );
    }

    if (!hasSoft) {
        matched.push(
            {
                id: 'gen-soft-1',
                keyword: 'Problem Solver, teliti & Bertanggung Jawab',
                description: 'etos kerja profesional dengan ketelitian tinggi.',
                category: 'SOFT_SKILL',
                points: 4,
            },
            {
                id: 'geb-soft-2',
                keyword: 'Komunikasi & kerja sama tim yang sangat kuat',
                description: 'Mudah beradaptasi dan bersinergi di lingkunagn kerja.',
                category: 'SOFT_SKILL',
                points: 4,
            }
        );
    }
    const seenKeywords = new Set<string>();
    return matched.filter((item) => {
        const key = normalizeKeyword(item.keyword);
        if (seenKeywords.has(key)) return false;
        seenKeywords.add(key);
        return true;
    });
}

export default function DashboardScreen() {
    const {
        cvFile,
        setCvFile,
        jobDescription,
        setJobDescription,
        setAnalysisResult,
        toggleKeyword,
    } = useAppStore();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [errorMessage, setErrormessage] = useState<string | null>(null);

    const wordCount = jobDescription.trim()
    ? jobDescription.trim().split(/\s+/).length : 0;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setErrormessage('Format file harus berupa PDF(.pdf).');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrormessage('Ukuran file PDF aksimal adalah 5MB.');
            return;
        }

        setErrormessage(null);
        setCvFile(file);
    };

    const handleAnalyze = () => {
        if (!cvFile) {
            setErrormessage('Silakan unggah file CV PDF Anda terlebih dahulu.');
            return;
        }

        setErrormessage(null);

        const recommendations = extractKeywordsLocally(jobDescription);
        const baseScore = 64;

        setAnalysisResult(baseScore, recommendations);

        recommendations.forEach((kw) => {
            toggleKeyword(kw);
        });
    };

    return (
        <section className='w-full flex flex-col safe-area-bottom transition-all duration-300 bg-slate-50 flex-1'>
            <div className='p-4 space-y-4'>
                <div className='mt-auto'>
                    <h2 className='text-xl font-extrabold tracking-tight text-slate-900'>
                        Input data &amp; Lowongan
                    </h2>
                    <p className='text-xs text-slate-500 mt-1'>
                        Unggah Pdf profil linkedin Anda dan tempel deskripsi loker target.
                    </p>
                </div>

                {errorMessage && (
                    <div className='p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-semibold'>
                        <AlertCircle className='w-4 h-4 shrink-0 text-rose-600'/>
                        <span>{errorMessage}</span>
                    </div>
                )}

                <div className='bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm'>
                    <div className='flex items-center justify-between mb-3'>
                        <label className='font-bold text-slate-900 text-sm flex items-center gap-2'>
                            <FileText className='w-4 h-4 text-indigo-600'/>
                            Upload CV Master
                        </label>
                        <span className='text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full'>
                            PDF wajib
                        </span>
                    </div>
                    <input type="file" ref={fileInputRef} accept=".pdf,application/pdf" onChange={handleFileChange} className="hidden"/>
                    <div onClick={() => fileInputRef.current?.click()} className='group relative border-2 border-dashed border-indigo-200 hover:border-indigo-500 active:border-indigo-600 bg-indigo-50/20 rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center'>
                        {!cvFile ? (
                            <div className='flex flex-col items-center'>
                                <div className='w-12 h-12 rounded-2xl bg-white shadow-sm border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2.5 group-hover:scale-105 transition-transform'>
                                    <UploadCloud className='w-6 h-6'/>
                                </div>
                                <p className='text-xs font-bold text-slate-900'>
                                    Ketuk untuk pilih file PDF
                                </p>
                                <p className='text-[11px] text-slate-400 mt-0.5'>
                                    Maksimum ukuran file 5MB
                                </p>
                                <span className='mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-indigo-700 border border-indigo-200 shadow-2xs'>
                                    <Folder className='2-3.5 h-3.5'/>
                                    Pilih Dokumen
                                </span>
                            </div>
                        ) : (
                            <div className='flex flex-col items-center w-full py-1'>
                                <div className='w-10 h-10 flex items-center justify-center mb-1.5text-emerald-500'>
                                    <Check className='w-8 h-8 text-emerald-500' strokeWidth={2.5}/>
                                </div>
                                <p className='text-xs font-bold text-slate-900 truncate max-w-65'>
                                    {cvFile.name}
                                </p>
                                    <span className='mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline'>
                                        Ganti Dokumen
                                    </span>
                            </div>
                        )}
                    </div>
                    <div className='mt-3 flex items-center justify-between text-[11px] text-slate-400'>
                        <span className='flex items-center gap-1 text-slate-500'>
                            <Lock className='w-3 h-3 text-slate-400'/> Tersimpan lokal aman
                        </span>
                    </div>
                </div>
                <div className='bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm'>
                    <div className='flex items-center justify-between mb-2.5'>
                        <label className='font-bold text-slate-900 text-sm items-center gap-2' htmlFor='job-desc'>
                            <Briefcase className='w-4 h-4 text-indigo-600'/>
                            Deskripsi Loker
                        </label>
                        {jobDescription.trim().length > 0 && (
                            <button onClick={() => setJobDescription('')} type='button' className='inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer'>
                                <Trash2 className='w-3 h-3'/>
                                <span>Bersihkan</span>
                            </button>
                        )}
                    </div>

                    <textarea 
                        id='job-desc'
                        rows={6}
                        value={jobDescription}
                        onChange={(e) => {
                            setJobDescription(e.target.value);
                            if (errorMessage) setErrormessage(null);
                        }}
                        placeholder={`Tempel kulaifikasi dan deskripsi lowongan pekerjaan yang ingin Anda lamar di suppressHydrationWarning...\n\nTips: Sertakan nama posisi (contoh: Posisi: Staff Admin) beserta daftar persyarannya agar kata kunci terdeteksi maksimal.`}
                        className='w-full p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none foxus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 resize-none leading-relaxed custom-scrollbar bg-slate-50/60'
                    />

                    <div className='mt-2.5 flex items-center justify-between text-[11px] text-slate-400'>
                        <span>Sistem mengekstrak kata kunci otomatis</span>
                        <span className='font-momo text-indigo-600 font-semibold'>
                            {wordCount} kata terdeteksi
                        </span>
                    </div>
                </div>
            </div>
            <div>
                <button onClick={handleAnalyze} type='button' className='w-full min-h-12.5 inline-flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:from-indigo-800 active:to-blue-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-indigo-500/25 active:scale-[0.98] transition-all cursor-pointer text-sm'>
                    <span>Analisis Kecocokan ATS</span>
                    <ArrowRight className='w-4 h-4'/>
                </button>
            </div>
        </section>
    )
}