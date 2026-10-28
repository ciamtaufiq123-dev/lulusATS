'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, LogOut, Ticket } from 'lucide-react';
import { useAppStore } from '@/src/store/useAppStore';
import { supabase } from '@/src/lib/supabase';

export default function MobileWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const { currentStep, logout, setStep, user } = useAppStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleBack = () => {
    if (currentStep > 2) {
        setStep(currentStep - 1);
    }
    };

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await supabase.auth.signOut();
        logout();
        setStep(0);
    };

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    };

    const activeStepNumber = currentStep - 1;

    return (
    <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative border-x border-slate-200/90 shadow-xl overflow-x-hidden">
        {currentStep >= 2 && (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 print:hidden">
            <div className="flex items-center justify-between relative">
            <div className="flex items-center min-w-10">
                {currentStep > 2 && (
                <button
                    onClick={handleBack}
                    aria-label="Kembali"
                    type="button"
                    className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition-colors border border-slate-200 shadow-xs cursor-pointer active:scale-95"
                >
                    <ChevronLeft
                        className="w-5 h-5 text-slate-700"
                        strokeWidth={2.5}
                    />
                </button>
                )}
            </div>

            <div className="flex flex-col items-center text-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
                <span className="text-xs font-black tracking-tight text-slate-900 uppercase">
                LULUS<span className="text-indigo-600">ATS</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                Langkah {activeStepNumber} dari 3
                </span>
            </div>

            {/* Kanan: Avatar User & Dropdown */}
            <div className="relative min-w-10 flex justify-end">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    type="button"
                    className="w-9 h-9 rounded-full bg-linear-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm border-2 border-white hover:ring-2 hover:ring-indigo-300 transition-all focus:outline-none relative active:scale-95 cursor-pointer"
                >
                {user?.avatarUrl ? (
                    <Image
                        src={user.avatarUrl}
                        width={36}
                        height={36}
                        unoptimized
                        alt={user.name || 'Profil'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover"
                    />
                ) : (
                    <span className="select-none font-bold">
                        {getInitials(user?.name)}
                    </span>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                </button>

              {/* Menu Dropdown Profil */}
                {isMenuOpen && (
                <div className="absolute right-0 top-11 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 transition-all">
                    <div className="flex items-center gap-3 pb-3 mb-2.5 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm overflow-hidden">
                        {user?.avatarUrl ? (
                        <Image
                            src={user.avatarUrl}
                            width={40}
                            height={40}
                            unoptimized
                            alt={user.name || 'Profil'}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                        />
                        ) : (
                            getInitials(user?.name)
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                        {user?.name || 'Pengguna LulusATS'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                        {user?.email || 'Belum ada email'}
                        </p>
                    </div>
                    </div>

                  {/* Info Sisa Kuota Dokumen */}
                    <div className="mb-2.5 px-3 py-2 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-indigo-600" />
                        Sisa Kuota CV:
                    </span>
                    <span className="text-xs font-black text-indigo-700">
                        {user?.remainingQuota || 0} Dokumen
                    </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        type="button"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Keluar (Log Out)</span>
                    </button>
                </div>
                )}
            </div>
            </div>

          {/* 3 Garis Progress Bar */}
            <div className="grid grid-cols-3 gap-1.5 mt-2.5 px-0.5">
            <div
                className={`h-1 rounded-full transition-all duration-300 ${
                activeStepNumber >= 1 ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
            />
            <div
                className={`h-1 rounded-full transition-all duration-300 ${
                    activeStepNumber >= 2 ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
            />
            <div
                className={`h-1 rounded-full transition-all duration-300 ${
                    activeStepNumber >= 3 ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
            />
            </div>
        </header>
        )}

      {/* Tempat merender konten layar (Screen 0 s.d. 4) */}
        <main className="flex-1 flex flex-col">{children}</main>
    </div>
    );
}