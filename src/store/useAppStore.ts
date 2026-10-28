"use client";

import { create } from 'zustand';
import { AppState, CVData, MasterKeyword, PricingPlan, UserProfile } from '@/types';

interface AppStore extends AppState {
    restoredCvFileName: string | null;
    markCurrentCvDownloaded: () => void;
    setStep: (step: number) => void;
    setUser: (user: UserProfile | null) => void;
    logout: () => void;
    setCvFile: (file: File | null) => void;
    restorePreviewSession: (session: PersistedPreviewSession) => void;
    setJobDescription: (desc: string) => void;
    setParsedCV: (cv: CVData | null) => void;
    setAnalysisResult: (baseScore: number, recommendations: MasterKeyword[]) => void;
    toggleKeyword: (keyword: MasterKeyword) => void;
    openPaymentModal: () => void;
    closePaymentModal: () => void;
    processSelectedPayment: (plan: PricingPlan) => void;
    useQuotaToUnlock: () => void;
    resetSession: () => void;

} 

export interface PersistedPreviewSession {
  currentStep: 4;
  jobDescription: string;
  baseScore: number;
  finalScore: number;
  recommendedKeywords: MasterKeyword[];
  selectedKeywords: MasterKeyword[];
  isUnlocked: boolean;
  hasDownloadedCurrentCv: boolean;
  selectedPlan: PricingPlan | null;
  checkoutIdempotencyKey: string | null;
  cvFileName: string | null;
}

const PREVIEW_SESSION_KEY = 'lulusats_preview_session';

export const useAppStore = create<AppStore>((set, get) => ({
    currentStep: 0,
    user: null,
    cvFile: null,
    restoredCvFileName: null,
    jobDescription: '',
    parsedCV: null,
    baseScore: 0,
    finalScore: 0,
    recommendedKeywords: [],
    selectedKeywords: [],

    isPaymentModalOpen: false,
    isProcessingPayment: false,
    isUnlocked: false,
    hasDownloadedCurrentCv: false,
    selectedPlan: null,
    checkoutIdempotencyKey: null,

  setStep: (step) => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const currentKey = get().checkoutIdempotencyKey;
    const newKey =
      step === 4 && !currentKey
        ? `lulusats-chk-${crypto.randomUUID()}`
        : currentKey;

    set({ currentStep: step, checkoutIdempotencyKey: newKey });
  },

    setUser: (user) => set({ user }),
    setCvFile: (file) =>
      set({
        cvFile: file,
        restoredCvFileName: file?.name ?? null,
        hasDownloadedCurrentCv: false,
      }),
    restorePreviewSession: (session) =>
      set({
        ...session,
        cvFile: null,
        restoredCvFileName: session.cvFileName,
      }),
    markCurrentCvDownloaded: () => set({ hasDownloadedCurrentCv: true }),
    setJobDescription: (desc) => set({ jobDescription: desc }),
    setParsedCV: (cv) => set({ parsedCV: cv }),

  setAnalysisResult: (baseScore, recommendations) =>
    set({
      baseScore,
      finalScore: baseScore,
      recommendedKeywords: recommendations as unknown as AppState['recommendedKeywords'],
      selectedKeywords: [],
      isUnlocked: false,
      hasDownloadedCurrentCv: false,
      checkoutIdempotencyKey: `lulusats-chk-${crypto.randomUUID()}`,
      currentStep: 3,
    }),

  toggleKeyword: (keyword) => {
    const { selectedKeywords: selectedKeywordValues, baseScore } = get();
    const selectedKeywords = selectedKeywordValues as unknown as MasterKeyword[];
    const isAlreadyChecked = selectedKeywords.some((k) => k.id === keyword.id);

    const updatedSelected = isAlreadyChecked
      ? selectedKeywords.filter((k) => k.id !== keyword.id)
      : [...selectedKeywords, keyword];

    const additionalScore = updatedSelected.reduce((sum, item) => sum + item.points, 0);
    const newFinalScore = Math.min(100, baseScore + additionalScore);

    set({
      selectedKeywords: updatedSelected as unknown as AppState['selectedKeywords'],
      finalScore: newFinalScore,
    });
  },

  openPaymentModal: () => set({ isPaymentModalOpen: true }),
  closePaymentModal: () => set({ isPaymentModalOpen: false }),

  processSelectedPayment: (plan) => {
    set({
      isPaymentModalOpen: false,
      isProcessingPayment: false,
      isUnlocked: true,
      selectedPlan: plan,
    });
  },

  useQuotaToUnlock: () => {
    const { user, isUnlocked } = get();
    if (!user || user.remainingQuota <= 0 || isUnlocked) return;

    set({ isUnlocked: true });
  },

  resetSession: () =>
    set({
      cvFile: null,
      restoredCvFileName: null,
      jobDescription: '',
      parsedCV: null,
      baseScore: 0,
      finalScore: 0,
      recommendedKeywords: [],
      selectedKeywords: [],
      isUnlocked: false,
      hasDownloadedCurrentCv: false,
      selectedPlan: null,
      checkoutIdempotencyKey: null,
      currentStep: 2,
    }),

  logout: () =>
    set({
      currentStep: 0,
      user: null,
      cvFile: null,
      restoredCvFileName: null,
      jobDescription: '',
      parsedCV: null,
      baseScore: 0,
      finalScore: 0,
      recommendedKeywords: [],
      selectedKeywords: [],
      isUnlocked: false,
      hasDownloadedCurrentCv: false,
      selectedPlan: null,
      checkoutIdempotencyKey: null,
    }),
}));

useAppStore.subscribe((state) => {
  if (typeof window === 'undefined') return;

  try {
    if (state.currentStep !== 4) {
      window.sessionStorage.removeItem(PREVIEW_SESSION_KEY);
      return;
    }

    const previewSession: PersistedPreviewSession = {
      currentStep: 4,
      jobDescription: state.jobDescription,
      baseScore: state.baseScore,
      finalScore: state.finalScore,
      recommendedKeywords: state.recommendedKeywords,
      selectedKeywords: state.selectedKeywords,
      isUnlocked: state.isUnlocked,
      hasDownloadedCurrentCv: state.hasDownloadedCurrentCv,
      selectedPlan: state.selectedPlan,
      checkoutIdempotencyKey: state.checkoutIdempotencyKey,
      cvFileName: state.cvFile?.name ?? state.restoredCvFileName,
    };
    window.sessionStorage.setItem(
      PREVIEW_SESSION_KEY,
      JSON.stringify(previewSession)
    );
  } catch (error) {
    console.error('Gagal menyimpan sesi Preview:', error);
  }
});