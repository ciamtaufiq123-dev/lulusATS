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
            keyword: 'Micrososft Office & Excel (Data Processing)',
            description: 'Pengolahan data laporan, tabel kerja, dan administrasi.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['admin', 'arsip', 'dokumen', 'administrasi', 'data entry', 'input'],
        item: {
            keyword: 'Administrasi Perkantoran & Pengarsipan',
            description: 'Pengolaan Dokumen, input data akurat, dan tata kelola berkas.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['keuangan', 'kas', 'kasir', 'invoice', 'pembukuan', 'akuntansi', 'pajak'],
        item: {
            keyword: 'Pembukuan, Arus Kas & Laporan Keuangan',
            description: 'Pencatatan transaksi harian, invoice, dan rekapitulas finansial.',
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
        triggers: ['pelanggan', 'customer', 'service', 'melayani', 'komplain', 'hospitality'],
        item: {
            keyword: 'Customer Relationship & Service Exellence',
            description: 'Pelayanan pelanggan prima dan penangana kebutuhan klien.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['sales', 'penjualan', 'target', 'marketing', 'pemasaran', 'promosi'],
        item: {
            keyword: 'Strategi Penjualan & Akuisisis Pelanggan',
            description: 'Pencapaian target penjualan dan perluasan pasar.',
            category: 'HARD_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['sosmed', 'social media', 'konten', 'content', 'iklan', 'ads', 'copywriting', 'desain', 'canva'],
        item: {
            keyword: 'Social media Management & Digital COntent',
            description: 'Pengelolaan sosial media sosial, pembuatan konten, dan kampanye digital.',
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
        triggers: ['tahun', 'pengalaman', 'minimal', 'berpengalaman', 'fresh graduate'],
        item: {
            keyword: 'Kualifikasi & Jam Terbang Terverifikasi',
            description: 'Memenuhi kriteria pengalaman dan latar belakang posisi',
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
        triggers: ['teili', 'rapih', 'detail', 'jujur', 'jujur', 'disiplin', 'bertanggung jawab'],
        item: {
            keyword: 'Teliti, Disipilin, & Detail Oriented',
            description: 'Karakter kerja berintegritas tinggi dengan tingkat akurasi baik.',
            category: 'SOFT_SKILL',
            points: 4,
        },
    },
    {
        triggers: ['tim', 'team', 'komunikasi', 'kolaborasi', 'koordinasi', 'interpersonal', 'public speaking'],
        item: {
            keyword: 'Komunikasi Efektif & Kolaborasi Tim',
            description: 'Mampu bekerja sama secara solid lintas divisi',
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

function extractKeywordsLocally(jobDesc: string): MasterKeyword[] {
    const lower = jobDesc.toLocaleLowerCase();
    const matched: MasterKeyword[] = [];

    UNIVERSAL_DICTIONARY.forEach((entry, idx) => {
        const isHit = entry.triggers.some((t) => lower.includes(t));
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
    return matched;
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
                        Unggah CV Master Anda dan tempel deskripsi loker target.
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