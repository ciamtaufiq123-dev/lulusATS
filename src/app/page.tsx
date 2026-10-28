'use client';

import React, { useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useAppStore } from '@/src/store/useAppStore';
import type { PersistedPreviewSession } from '@/src/store/useAppStore';
import { syncUserWithDatabase, processPaymentInDb } from '@/src/lib/userActions';
import MobileWrapper from '@/src/components/layout/MobileWrapper';
import LandingScreen from '@/src/components/screens/LandingScreen';
import LoginScreen from '@/src/components/screens/LoginScreen';
import DashboardScreen from '@/src/components/screens/DashboardScreen';
import MatchingScreen from '@/src/components/screens/MatchingScreen';
import PreviewScreen from '@/src/components/screens/PreviewScreen';

function restorePreviewSession(): void {
  const sessionKey = 'lulusats_preview_session';
  const savedSession = window.sessionStorage.getItem(sessionKey);
  if (!savedSession) return;

  try {
    const parsed = JSON.parse(savedSession) as Partial<PersistedPreviewSession>;
    if (
      parsed.currentStep !== 4 ||
      typeof parsed.jobDescription !== 'string' ||
      typeof parsed.baseScore !== 'number' ||
      typeof parsed.finalScore !== 'number' ||
      !Array.isArray(parsed.recommendedKeywords) ||
      !Array.isArray(parsed.selectedKeywords) ||
      typeof parsed.isUnlocked !== 'boolean' ||
      typeof parsed.hasDownloadedCurrentCv !== 'boolean'
    ) {
      window.sessionStorage.removeItem(sessionKey);
      return;
    }

    useAppStore.getState().restorePreviewSession({
      currentStep: 4,
      jobDescription: parsed.jobDescription,
      baseScore: parsed.baseScore,
      finalScore: parsed.finalScore,
      recommendedKeywords: parsed.recommendedKeywords,
      selectedKeywords: parsed.selectedKeywords,
      isUnlocked: parsed.isUnlocked,
      hasDownloadedCurrentCv: parsed.hasDownloadedCurrentCv,
      selectedPlan:
        parsed.selectedPlan === 'single' || parsed.selectedPlan === 'bundle'
          ? parsed.selectedPlan
          : null,
      checkoutIdempotencyKey:
        typeof parsed.checkoutIdempotencyKey === 'string'
          ? parsed.checkoutIdempotencyKey
          : null,
      cvFileName:
        typeof parsed.cvFileName === 'string' ? parsed.cvFileName : null,
    });
  } catch (error) {
    console.error('Gagal memulihkan sesi Preview:', error);
    window.sessionStorage.removeItem(sessionKey);
  }
}

export default function HomePage() {
  const { currentStep, setStep, setUser, processSelectedPayment } =
    useAppStore();

  useEffect(() => {
    restorePreviewSession();
    let handledSessionUserId: string | null = null;

    const handleSessionUser = async (sessionUser: {
      id: string;
      email?: string;
      user_metadata?: {
        full_name?: string;
        name?: string;
        avatar_url?: string;
        picture?: string;
      };
    }) => {
      if (handledSessionUserId === sessionUser.id) return;
      handledSessionUserId = sessionUser.id;

      try {
      const email = sessionUser.email || '';
      const name =
        sessionUser.user_metadata?.full_name ||
        sessionUser.user_metadata?.name ||
        'Pengguna LulusATS';
      const avatarUrl =
        sessionUser.user_metadata?.avatar_url ||
        sessionUser.user_metadata?.picture ||
        '';

      // Cek apakah baru saja kembali dari redirect pembayaran Midtrans (seperti DANA)
      const params = new URLSearchParams(window.location.search);
      const isMidtransPaid = params.get('midtrans_paid') === '1';
      const paidPlan = params.get('plan') as 'single' | 'bundle' | null;
      const orderId = params.get('order_id');

      // 1. Sinkronkan user dengan PostgreSQL
      const dbUser = await syncUserWithDatabase({
        id: sessionUser.id,
        email,
        name,
        avatarUrl,
      });

      if (!dbUser) {
        handledSessionUserId = null;
        alert(
          'Data akun gagal disinkronkan. Kuota belum dapat dimuat; silakan coba muat ulang halaman.'
        );
        return;
      }

      let finalQuota = dbUser.remainingQuota;
      let finalPlan =
        (dbUser.subscriptionPlan as 'FREE' | 'MONTHLY') || 'FREE';

      // 2. Jika kembali dari pembayaran sukses Midtrans (DANA/QRIS/VA)
      if (
        isMidtransPaid &&
        (paidPlan === 'single' || paidPlan === 'bundle') &&
        orderId
      ) {
        const processedKey = `processed_${orderId}`;
        const processingKey = `processing_${orderId}`;

        if (
          !sessionStorage.getItem(processedKey) &&
          !sessionStorage.getItem(processingKey)
        ) {
          sessionStorage.setItem(processingKey, 'true');
          sessionStorage.setItem(processedKey, 'true');

          const payRes = await processPaymentInDb({
            userId: sessionUser.id,
            planType: paidPlan,
          });

          sessionStorage.removeItem(processingKey);

          if (payRes.success && typeof payRes.remainingQuota === 'number') {
            finalQuota = payRes.remainingQuota;
            finalPlan =
              (payRes.subscriptionPlan as 'FREE' | 'MONTHLY') || finalPlan;
          } else {
            sessionStorage.removeItem(processedKey);
            console.error('Pembayaran berhasil, tetapi kuota gagal disimpan.');
            setUser({
              id: sessionUser.id,
              email,
              name: dbUser.name || name,
              avatarUrl: dbUser.avatarUrl || avatarUrl,
              subscriptionPlan: finalPlan,
              remainingQuota: finalQuota,
            });
            alert(
              'Pembayaran berhasil, tetapi kuota belum tersimpan. Akses unduh belum dibuka agar kuota tidak terpakai secara keliru. Muat ulang halaman untuk mencoba sinkronisasi kembali; jangan membayar ulang.'
            );
            return;
          }
        }

        // Buka akses hanya setelah pembelian berhasil tercatat (atau sudah diproses).
        processSelectedPayment(paidPlan);
        setStep(4);

        // Bersihkan parameter URL hanya setelah pemrosesan berhasil.
        window.history.replaceState({}, '', window.location.pathname);
      } else if (isMidtransPaid) {
        alert(
          'Data paket atau ID pesanan pembayaran tidak ditemukan. Kuota tidak diubah; silakan hubungi dukungan.'
        );
        return;
      } else {
        const stepNow = useAppStore.getState().currentStep;
        if (stepNow <= 1) {
          setStep(2);
        }
      }

      // 3. Simpan data user & kuota terbaru ke Zustand
      setUser({
        id: sessionUser.id,
        email,
        name: dbUser?.name || name,
        avatarUrl: dbUser?.avatarUrl || avatarUrl,
        subscriptionPlan: finalPlan,
        remainingQuota: finalQuota,
      });
      } catch (error) {
        handledSessionUserId = null;
        console.error('Gagal memproses sesi pengguna:', error);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleSessionUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        handleSessionUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        handledSessionUserId = null;
        setStep(0);
      }
    });

    return () => subscription.unsubscribe();
  }, [setStep, setUser, processSelectedPayment]);

  return (
    <MobileWrapper>
      {currentStep === 0 && <LandingScreen />}
      {currentStep === 1 && <LoginScreen />}
      {currentStep === 2 && <DashboardScreen />}
      {currentStep === 3 && <MatchingScreen />}
      {currentStep === 4 && <PreviewScreen />}
    </MobileWrapper>
  );
}