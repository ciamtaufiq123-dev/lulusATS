'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useAppStore } from '@/src/store/useAppStore';

export default function LandingScreen() {
    const setStep = useAppStore((state) => state.setStep);

    return (
        <section className="flex-1 flex flex-col justify-between p-5 bg-linear-to-b from-slate-50 via-white to-sName='late-50">
            <div className="space-y-6">
                <div className="flex items-center jutify-between pt-2">
                    <div className="flex items-center gap-2">
                        <Image src="/LA.jpeg" alt="Logo Lulus ATS" width={28} height={28} className="h-7 w-7 object-contain rounded-md shadow-2xs" />
                        <span className="text-lg font-black tracking-tight text-slate-900 uppercase">
                            LULUS<span className="text-indigo-600">ATS</span>
                        </span>
                    </div>
                </div>

                <div className="pt-3 text-center space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animte-pulse"></span>
                        98% Berhasil Tembus Screening HRD
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                        Mau Lolos Seleksi Berkas ATS Tanpa Ribet? di {''}
                        <span className="text-indigo-700">
                            LulusATS
                        </span>{' '}
                        Solusinya
                    </h1>
                    <p className='text-xs text-slate-600 leading-relaxed max-w-xs mx-auto'>
                        Optimalkan CV Anda dengan kata kunci relevan sesuai deskripsi lowongan kerja impian hanya dalam hitungan menit.
                    </p>

                    <div className='inline-flex items-center gap-2 bg-indigo-50 boredr border-indigo-200 px-3.5 py-1.5 rounded-2xl shadow-xs'>
                        <span className='text-xs font-semibold text-slate-700'>Biaya Akses:</span>
                        <span className='text-xs font-black text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-indigo-100 shadow-2xs'>
                            Hanya Rp 2.000 / dokumen
                        </span>
                    </div>
                </div>

                <div className='text-center space-y-2'>
                    <div className='relative rounded-2xl overflow-hidden max-w-xs mx-auto p-1 group transition-all'>
                        <Image src='/cv-sample.jpeg' alt='sample cv ats' width={800} height={1000} className='w-full h-auto object-cover rounded-xl block'/>
                        <div className='text-slate-500'>
                            <span></span>
                            Preview hasil CV Standar ATS
                        </div>
                    </div>
                </div>

                <div className='bg-white rounded-2xl space-y-3'>
                    <h2 className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
                        3 Langkah Mudah
                    </h2>
                    <div className='space-y-3'>
                        <div className='flex items-start gap-3'>
                            <div className='w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-200'>
                                1
                            </div>
                            <div>
                                <h3 className='text-xs font-bold text-slate-900'>Upload CV dan salin Loker</h3>
                                <p className='text-[11px] text-slate-500 leading-snug'>
                                    Unggah file CV PDF master Anda dan tempel kualifikasi posisi sasaran.
                                </p>
                            </div>
                        </div>

                        <div className='flex items-center gap-3'>
                            <div className='w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-200'>
                                2
                            </div>
                            <div>
                                <h3 className='text-xs font-bold text-slate-900'>Centang Kata Kunci ATS</h3>
                                <p className='text-[11px] text-slate-500 leading-snug'>
                                    Sistem merekomendasikan skill &amp; pengalaman penting yang wajib ada.
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3'>
                            <div className='w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-200'>
                                3
                            </div>
                            <div>
                                <h3 className='text-xs font-bold text-slate-900'>Unduh CV ATS Friendly</h3>
                                <p className='text-[11px] text-slate-500 leading-snug'>
                                    Dapatkan PDF standar 1-kolom berstandar internasional siap lamar.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='p-6 b-2 safe-area-button'>
                <button onClick={() => setStep(1)} type='button' className='w-full min-h-12.5 inline-flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:from-indigo-800 active:to-blue-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all cursor-pointer text-sm'>
                    <span>Mulai Buat CV Sekarang</span>
                    <ArrowRight className='w-4 h-4'/>
                </button>
            </div>
            <footer className="-mx-5 -mb-5 mt-10 border-t border-blue-700 bg-blue-600 px-5 pt-8 pb-10 text-blue-100">
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-blue-500/50">
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

            <div className="space-y-2 text-xs">
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
                href="mailto:ciamtaufiq123@gmail.com"
                >
                ciamtaufiq123@gmail.com
                </a>
            </p>
            </div>

            <div className="pt-4 border-t border-blue-500/50 flex flex-col items-center justify-center gap-2 text-center text-[11px] text-blue-200">
            <div className="flex items-center justify-center gap-3">
                <a className="text-blue-100 hover:text-white transition-colors" href="#">
                Syarat &amp; Ketentuan
                </a>
                <span>•</span>
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