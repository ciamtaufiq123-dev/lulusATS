export type PricingPlan = 'single' | 'bundle';

export interface UserProfile {
    id: string;
    email: string;
    phone?: string;
    name: string;
    avatarUrl?: string;
    subscriptionPlan: 'FREE' | 'MONTHLY';
    remainingQuota: number;
}

export type KeywordCategory = 'HARD_SKILL' | 'EXPERIENCE' | 'SOFT_SKILL';

export interface MasterKeyword {
    id: string;
    keyword: string;
    description: string;
    category: KeywordCategory;
    points: number;
}

export interface Experience {
    id: string;
    role: string;
    company: string;
    period: string;
    description: string[];
}

export interface Education {
    id: string;
    degree: string;
    institution: string;
    priod: string;
}

export interface CVData {
    name: string;
    title: string;
    location: string;
    email: string;
    phone: string;
    links: string;
    summary: string;
    experiences: Experience[];
    educations: Education[];
}

export interface AppState {
    currentStep: number;
    user: UserProfile | null;
    cvFile: File | null;
    jobDescription: string;
    parsedCV: CVData | null;
    baseScore: number;
    finalScore: number;
    recommendedKeywords: MasterKeyword[];
    selectedKeywords: MasterKeyword[];
    isPaymentModalOpen: boolean;
    isProcessingPayment: boolean;
    isUnlocked: boolean;
    hasDownloadedCurrentCv: boolean;
    selectedPlan: PricingPlan | null;
    checkoutIdempotencyKey: string | null;
}

export interface ExtractedPDFData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  summary: string;
  experienceLines: string[];
  educationLines: string[];
}

export interface PdfTextItem {
  str?: string;
  transform?: number[];
}

export interface PdfPage {
  getTextContent: () => Promise<{ items: PdfTextItem[] }>;
}

export interface PdfDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
}

export interface PdfJsLib {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (params: { data: ArrayBuffer }) => {
    promise: Promise<PdfDocument>;
  };
}