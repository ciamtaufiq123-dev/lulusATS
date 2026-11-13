'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useAppStore } from '@/src/store/useAppStore';

export default function LandingScreen() {
    const setStep = useAppStore((state) => state.setStep);

    return (
        <section className="flex-1 flex flex-col justify-between bg-linear-to-b from-slate-50 via-white to-slate-100">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10 space-y-8 lg:space-y-10">
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                        <Image src="/LA.jpeg" alt="Logo Lulus ATS" width={32} height={32} className="h-8 w-8 object-contain rounded-md shadow-sm" />
                        <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 uppercase">
                            LULUS<span className="text-indigo-600">ATS</span>
                        </span>
                    </div>
                </div>

                <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
                    <div className="pt-3 text-center lg:text-left space-y-4 lg:space-y-5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            98% Berhasil Tembus Screening HRD
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-xl lg:max-w-none mx-auto lg:mx-0">
                            Mau Lolos Seleksi Berkas ATS Tanpa Ribet? di {' '}
                            <span className="text-indigo-700">
                                LulusATS
                            </span>{' '}
                            Solusinya
                        </h1>
                        <p className='text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0'>
                            Optimalkan CV Anda dengan kata kunci relevan sesuai deskripsi lowongan kerja impian hanya dalam hitungan menit.
                        </p>

                        <div className='inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-2xl shadow-xs mx-auto lg:mx-0'>
                            <span className='text-xs sm:text-sm font-semibold text-slate-700'>Biaya Akses:</span>
                            <span className='text-xs sm:text-sm font-black text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-indigo-100 shadow-2xs'>
                                Hanya Rp 2.000 / dokumen
                            </span>
                        </div>
                    </div>

                    <div className='text-center space-y-3 lg:justify-self-end lg:w-full lg:max-w-md'>
                        <div className='relative rounded-3xl overflow-hidden mx-auto p-1.5 bg-white shadow-lg ring-1 ring-slate-200/80'>
                            <Image src='/cv-sample.jpeg' alt='sample cv ats' width={800} height={1000} className='w-full h-auto object-cover rounded-2xl block' />
                        </div>
                        <div className='text-sm font-medium text-slate-500'>
                            Preview hasil CV Standar ATS
                        </div>
                    </div>
                </div>

                <div className='grid gap-4 lg:grid-cols-[1.2fr_0.8fr] items-start'>
                    <div className='bg-white rounded-3xl p-4 sm:p-5 lg:p-6 space-y-4 shadow-sm ring-1 ring-slate-200'>
                        <h2 className='text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider'>
                            3 Langkah Mudah
                        </h2>
                        <div className='grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3'>
                            <div className='flex items-start gap-3'>
                                <div className='w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-sm flex items-center justify-center shrink-0 border border-indigo-200'>
                                    1
                                </div>
                                <div>
                                    <h3 className='text-sm font-bold text-slate-900'>Upload CV dan salin Loker</h3>
                                    <p className='text-xs text-slate-500 leading-snug mt-1'>
                                        Unggah file CV PDF master Anda dan tempel kualifikasi posisi sasaran.
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3'>
                                <div className='w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-sm flex items-center justify-center shrink-0 border border-indigo-200'>
                                    2
                                </div>
                                <div>
                                    <h3 className='text-sm font-bold text-slate-900'>Centang Kata Kunci ATS</h3>
                                    <p className='text-xs text-slate-500 leading-snug mt-1'>
                                        Sistem merekomendasikan skill &amp; pengalaman penting yang wajib ada.
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3'>
                                <div className='w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-sm flex items-center justify-center shrink-0 border border-indigo-200'>
                                    3
                                </div>
                                <div>
                                    <h3 className='text-sm font-bold text-slate-900'>Unduh CV ATS Friendly</h3>
                                    <p className='text-xs text-slate-500 leading-snug mt-1'>
                                        Dapatkan PDF standar 1-kolom berstandar internasional siap lamar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex items-center justify-center lg:justify-end'>
                        <button onClick={() => setStep(1)} type='button' className='w-full max-w-md lg:max-w-none min-h-14 inline-flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:from-indigo-800 active:to-blue-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all cursor-pointer text-sm sm:text-base'>
                            <span>Mulai Buat CV Sekarang</span>
                            <ArrowRight className='w-4 h-4' />
                        </button>
                    </div>
                </div>
            </div>

            <footer className="mt-8 border-t border-blue-700 bg-blue-600 px-4 py-8 text-blue-100 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-blue-500/50">
                        <div className="flex items-center gap-2">
                            <Image
                                alt="Logo LulusATS"
                                className="h-6 w-6 object-contain rounded bg-white p-0.5 shadow-xs"
                                src="/LA.jpeg"
                                width={24}
                                height={24}
                            />
                            <span className="text-sm font-black tracking-tight uppercase text-white">
                                LULUS<span className="text-blue-200">ATS</span>
                            </span>
                        </div>
                        <span className="text-[11px] font-medium text-blue-200">
                            Platform Optimasi CV ATS
                        </span>
                    </div>

                    <div className="grid gap-3 text-xs sm:grid-cols-2">
                        <p className="text-blue-200 flex items-center gap-2">
                            <svg
                                className="w-5 h-5 shrink-0 text-blue-200"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
                                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"></path>
                            </svg>
                            <a
                                className="font-medium text-blue-200 hover:text-white hover:underline transition-all"
                                href="https://wa.me/6285215095835"
                                target="_blank"
                                rel="noreferrer"
                            >
                                085215095835
                            </a>
                        </p>
                        <p className="text-blue-200 flex items-center gap-2">
                            <svg
                                className="w-5 h-5 shrink-0 text-blue-200"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <rect height="16" rx="2" width="20" x="2" y="4"></rect>
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                            </svg>
                            <a
                                className="font-medium text-blue-200 hover:text-white hover:underline transition-all"
                                href="mailto:atslulus@gmail.com"
                            >
                                atslulus@gmail.com
                            </a>
                        </p>
                    </div>

                    <div className="pt-4 border-t border-blue-500/50 flex flex-col items-center justify-center gap-2 text-center text-[11px] text-blue-200">
                        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                            <a className="text-blue-100 hover:text-white transition-colors" href="#">
                                Syarat &amp; Ketentuan
                            </a>
                            <span className="hidden sm:inline">•</span>
                            <a className="text-blue-100 hover:text-white transition-colors" href="#">
                                Kebijakan Privasi
                            </a>
                        </div>
                        <p className="text-[10.5px] text-blue-200/90">
                            © 2026 LulusATS. Hak Cipta Dilindungi.
                        </p>
                    </div>
                </div>
            </footer>
        </section>
    )
};