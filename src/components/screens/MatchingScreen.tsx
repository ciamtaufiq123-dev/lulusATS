'use client';

import React from 'react';
import {
    Gauge,
    Code2,
    Briefcase,
    UserCheck,
    CheckCircle2,
    ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/src/store/useAppStore';
import { MasterKeyword } from '@/types/index';

export default function MatchingScreen() {
    const {
        finalScore,
        recommendedKeywords,
        selectedKeywords,
        toggleKeyword,
        setStep,
    } = useAppStore();

    const allRecommended = (recommendedKeywords || []) as unknown as MasterKeyword[];
    const activeSelected = (selectedKeywords || []) as unknown as MasterKeyword[];

    const hardSkills = allRecommended.filter((k) => k.category === 'HARD_SKILL');
    const expKeywords = allRecommended.filter((k) => k.category === 'EXPERIENCE');
    const softSkills = allRecommended.filter((k) => k.category === 'SOFT_SKILL');

    const isChecked = (id: string) => activeSelected.some((k) => k.id === id);
    
    const circumference = 301.59;
    const strokeDashoffset = circumference - (finalScore / 100) * circumference;

    const strokeColor = finalScore >= 80 ? '#10b981' : finalScore >= 70 ? '#4f4b65' : '#f59e0b';

    return (
        <section className='w-full flex flex-col safe-area-bottom transition-all duration-300 bg-slate-50 flex-1'>
            <div className='p-4 space-y-4'>
                <div className='bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm'>
                    <div className='flex items-center justify-between gap-2 mb-3'>
                        <span className='text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5'>
                        <Gauge className='w-4 h-4 text-indigo-600 shrink-0'/>
                        SKOR KECOCOKAN ATS
                    </span>

                    {finalScore >= 80 ? (
                        <span className='px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 leading-tight text-left'>
                            Sangat Tinggi
                        </span>
                    ) : finalScore >= 70 ? (
                        <span className='px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 leading-tight'>
                            Cukup Kompetitif
                        </span>
                    ) : (
                        <span className='px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700border- border-amber-200 leading-tight'>
                            Perlu Ditingkatkan
                        </span>
                    )}
                    </div>
                    <div>
                        <div className='relative w-24 h-24 shrink-0 flex items-center justify-center'>
                            <svg viewBox='0 0 120 120'>
                                <circle cx='60' cy='60' fill='transparent' r='48' stroke='#f1f5f9' strokeWidth='11'/>
                                <circle className='transition-all duration-500 ease-out' r='48' cx='60' cy='60'  fill='transparent' stroke={strokeColor} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" strokeWidth="11"/>
                            </svg>
                            <div className='absolute inset-0 flex flex-col items-center justify-center text-center'>
                                <span className='text-1xl font-black text-slate-900 tracking-tight'>
                                    {finalScore}%
                                </span>
                                <span className='text-[9px] font-bold uppercase tracking-wider text-emerald-600 font-mono'>
                                    MATCH
                                </span>
                            </div>
                        </div>
                        <div className='flex-1 space-y-1.5'>
                            <p className='text-xs font-bold text-slate-900 flex items-center gap-1.5'>
                                <span className='w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse'></span>
                                Target Aman ATS: &gt; 80%
                            </p>
                            <p className='text-[11px] text-slate-500 leading-snug'>
                                Centang kata kunci yang relevan di bawah untuk memaksmalkan peluang lolos screening otomatis.
                            </p>
                            <div className='w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1 border border-slate-200'>
                                <div className='bg-linear-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500' style={{ width: `${finalScore}%`}}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-3'>
                    <div className='flex items-center justify-between border-b border-slate-100 pb-2.5'>
                        <div className='flex items-center gap-2.5'>
                            <div className='w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0'>
                                <Code2 className='w-4 h-4'/>
                            </div>
                            <div>
                                <h3 className='text-xs font-bold text-slate-900'>
                                    Kata Kunci Keahlian (Hard Skills)
                                </h3>
                                <p className='text-[10.5px] text-slate-400'>
                                    teknologi &amp; keahlian teknis utama yang dicari
                                </p>
                            </div>
                        </div>
                        <span className='text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full shrink-0'>
                            Kategori 1
                        </span>
                    </div>
                    <div>
                        {hardSkills.map((item) => (
                            <label key={item.id} className='flex items-start gap-3 p-3 bg-slate-50/70 hover:bg-indigo-50/30 rounded-xl border border-slate-200/80 transition-all cursor-pointer select-none'>
                                <input type='checkbox' checked={isChecked(item.id)} onChange={() => toggleKeyword(item)} className='mt-0.5 w-4 h-4 rounded-md accent-indigo-600 text-indigo-600 border-slate-300  focus:ring-indigo-500 cursor-pointer'/>
                                <div className='flex-1 min-w-0'>
                                    <div className='flex items-center justify-between gap-2'>
                                        <span className='text-xs font-bold text-slate-900 truncate'>
                                            {item.keyword}
                                        </span>
                                        <span className='text-[10px] font-bold text-emerald-700 bg-emerald-100/90 border-emrald-200 px-2 py-0.5 rounded-md shrink-0'>
                                            +{item.points}% skor
                                        </span>
                                    </div>
                                    <p className='text-[11px] text-slate-500 mt-0.5 leading-snug'>
                                        {item.description}
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
                <div className='bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-3'>
                    <div className='flex items-center justify-between border-b border-slate-100 pb-2.5'>
                        <div className='flex items-center gap-2.5'>
                            <div className='w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0'>
                                <Briefcase className='w-4 h-4'/>
                            </div>
                            <div>
                                <h3 className='text-xs font-bold text-slate-900'>
                                    Kata Kunci Pengalaman
                                </h3>
                                <p className='text-[10.5px] text-slate-400'>
                                    Rekam jejak &amp; konteks proyek terukur
                                </p>
                            </div>
                        </div>
                        <span className='text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full shrink-0'>
                            Kategori 2
                        </span>
                    </div>
                    <div>
                        {expKeywords.map((item) => (
                            <label key={item.id} className='flex items-start gap-3 p-3 bg-slate-50/70 hover:bg-blue-50/30 rounded-xl border border-slate-200/80 transition-all cursor-pointer select-none'>
                                <input type='checkbox' checked={isChecked(item.id)} onChange={() => toggleKeyword(item)} className='mt-0.5 w-4 h-4 rounded-md accent-indigo-600 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer'/>
                                <div className='flex-1 min-w-0'>
                                    <div className='flex items-center justify-between gap-2'>
                                        <span className='text-xs font-bold text-slate-900 truncate'>
                                            {item.keyword}
                                        </span>
                                        <span className='text-[10px] font-bold text-emerald-700 bg-emerald -100/90 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0'>
                                            +{item.points}% Skor
                                        </span>
                                    </div>
                                    <p className='text-[11px] text-slate-500 mt-0.5 leading-snug'>
                                        {item.description}
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
                <div className='bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-3'>
                    <div className='flex items-center justify-between border-b border-slate-100 pb-2.5'>
                        <div className='flex items-center gap-2.5'>
                            <div className='w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0'>
                                <UserCheck className='w-4 h-4'/>
                            </div>
                            <div>
                                <h3 className='text-xs font-bold text-slate-900'>
                                    Kata Kunci Profil &amp; Soft Skills
                                </h3>
                                <p className='text-[10.5px] text-slate-400'>
                                    Karakter kerja &amp; kolaborasi tim
                                </p>
                            </div>
                        </div>
                        <span className='text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0'>
                            Kategori 3
                        </span>
                    </div>
                    <div>
                        {softSkills.map((item) => (
                            <label key={item.id} className='flex items-start gap-3 p-3 bg-slate-50/70 hover:bg-emerald-50/30 rounded-xl border border-slate-200/80 transition-all cursor-pointer select-none'>
                                <input type='checkbox' checked={isChecked(item.id)} onChange={() => toggleKeyword(item)} className='mt-0.5 w-4 h-4 rounded-md accent-indigo-600 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer'/>
                                <div className='flex-1 min-w-0'>
                                    <div className='flex items-center justify-between gap-2'>
                                        <span className='text-xs font-bold text-slate-900 truncate'>
                                            {item.keyword}
                                        </span>
                                        <span className='text-[10px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0'>
                                            +{item.points}% Skor
                                        </span>
                                    </div>
                                    <p className='text-[11px] text-slate-500 mt-0.5 leading-snug'>
                                        {item.description}
                                    </p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className='mt-auto flex items-center justify-between px-1 text-[11px] text-slate-400'>
                <span className='flex items-center gap-1 text-emerald-600 font-semibold'>
                    <CheckCircle2 className='w-3.5 h-3.5 text-emerald-600'/>
                    Sinkron otomatis ke Resume ATS
                </span>
                <span className='text-slate-500 font-mono'>
                    {activeSelected.length} kata kunci aktif
                </span>
            </div>
            <div>
                <button onClick={() => setStep(4)} type='button' className='w-full min-h-12.5 inline-flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:from-indigo-800 active:to-blue-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all text-sm cursor-pointer'>
                    <span>Simpan &amp; Preview CV</span>
                    <ArrowRight className='w-4 h-4'/>
                </button>
            </div>
        </section>
    )
}