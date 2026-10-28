'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Lock,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  X,
  Ticket,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/src/store/useAppStore';
import { MasterKeyword, ExtractedPDFData, PdfJsLib } from '@/types/index';
import {
  consumeQuotaAndSaveCv,
  processPaymentInDb,
  createMidtransSnapToken,
} from '@/src/lib/userActions';

// Tipe untuk Window Midtrans Snap agar bebas error TypeScript
interface MidtransSnap {
  pay: (
    token: string,
    options: {
      onSuccess?: (result: unknown) => void;
      onPending?: (result: unknown) => void;
      onError?: (result: unknown) => void;
      onClose?: () => void;
    }
  ) => void;
}

// Memuat PDF.js di browser
async function loadPdfJs(): Promise<PdfJsLib> {
  const win = window as unknown as { pdfjsLib?: PdfJsLib };
  if (win.pdfjsLib) {
    return win.pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const loadedLib = (window as unknown as { pdfjsLib?: PdfJsLib }).pdfjsLib;
      if (loadedLib) {
        loadedLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(loadedLib);
      } else {
        reject(new Error('Gagal memuat PDF.js'));
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Fungsi pembaca isi PDF (Mendukung LinkedIn Profile.pdf 2-kolom & CV Reguler)
async function extractDataFromPdfFile(file: File): Promise<ExtractedPDFData> {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const allLines: { text: string; fontSize: number; page: number }[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    let currentY: number | null = null;
    let lastX: number | null = null;
    let currentText = '';
    let maxFontInLine = 0;

    for (const item of content.items) {
      const str = (item.str || '').trim();
      if (!str) continue;

      const transform = item.transform || [10, 0, 0, 10, 0, 0];
      const x = Math.round(transform[4]);
      const y = Math.round(transform[5]);
      const fontSize = Math.round(
        Math.abs(transform[0]) || Math.abs(transform[3]) || 10
      );

      // Pisahkan baris jika pindah kolom jauh (seperti sidebar kiri vs kolom kanan LinkedIn PDF)
      const isSameLine =
        currentY !== null &&
        Math.abs(y - currentY) <= 3 &&
        (lastX === null || Math.abs(x - lastX) < 140);

      if (isSameLine) {
        currentText = currentText ? `${currentText} ${str}` : str;
        if (fontSize > maxFontInLine) maxFontInLine = fontSize;
        currentY = y;
        lastX = x;
      } else {
        if (currentText.trim()) {
          allLines.push({
            text: currentText.trim(),
            fontSize: maxFontInLine,
            page: pageNum,
          });
        }
        currentText = str;
        maxFontInLine = fontSize;
        currentY = y;
        lastX = x;
      }
    }

    if (currentText.trim()) {
      allLines.push({
        text: currentText.trim(),
        fontSize: maxFontInLine,
        page: pageNum,
      });
    }
  }

  const fullText = allLines.map((l) => l.text).join('\n');

  // 1. Ekstrak Email, No Telepon, & LinkedIn
  const emailMatch = fullText.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  );
  const phoneMatch = fullText.match(/(?:\+62|62|08)[0-9\s\-]{8,16}/);
  const linkedinMatch = fullText
    .replace(/\s+/g, '')
    .match(/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_]+/i);

  // 2. Deteksi Nama Kandidat (Huruf paling besar di halaman 1)
  const ignoredHeaders =
    /^(contact|kontak|top skills|keahlian|skills|languages|bahasa|certifications|sertifikasi|honors-awards|summary|ringkasan|experience|pengalaman|pengalaman kerja|education|pendidikan|riwayat pendidikan|curriculum vitae|resume|cv|profile|profil|page\s*\d+.*)$/i;

  const page1Candidates = allLines.filter(
    (l) =>
      l.page === 1 &&
      l.text.length >= 3 &&
      l.text.length <= 45 &&
      !ignoredHeaders.test(l.text.trim()) &&
      !l.text.includes('@') &&
      !l.text.toLowerCase().includes('linkedin.com') &&
      !l.text.toLowerCase().includes('http') &&
      !/^[+\d\s\-()]+$/.test(l.text)
  );

  const sortedByFont = [...page1Candidates].sort(
    (a, b) => b.fontSize - a.fontSize
  );
  let detectedName = sortedByFont[0]?.text || '';

  if (!detectedName && linkedinMatch) {
    const slug = linkedinMatch[0].split('/in/')[1] || '';
    detectedName = slug
      .replace(/-[0-9a-f]{5,}$/i, '')
      .replace(/-/g, ' ')
      .trim();
  }

  // 3. Deteksi Lokasi
  const locationLine = allLines.find(
    (l) =>
      /(indonesia|jakarta|tangerang|depok|bogor|bekasi|bandung|surabaya|yogyakarta|semarang|banten|jawa)/i.test(
        l.text
      ) &&
      l.text.length < 55 &&
      !l.text.includes('@')
  );

  // 4. Deteksi Ringkasan, Pengalaman Kerja, & Riwayat Pendidikan
  const sumIndex = allLines.findIndex((l) =>
    /^(summary|ringkasan|tentang saya|profil|about|about me)$/i.test(
      l.text.trim()
    )
  );
  const expIndex = allLines.findIndex((l) =>
    /^(experience|pengalaman|pengalaman kerja|work experience|riwayat pekerjaan)$/i.test(
      l.text.trim()
    )
  );
  const eduIndex = allLines.findIndex((l) =>
    /^(education|pendidikan|riwayat pendidikan|edukasi|latar belakang pendidikan)$/i.test(
      l.text.trim()
    )
  );

  const cleanLines = (lines: string[]) =>
    lines.filter(
      (t) =>
        !/^page \d+ of \d+$/i.test(t.trim()) &&
        !/^(contact|top skills|languages|certifications)$/i.test(t.trim())
    );

  // Ambil Ringkasan
  let summaryText = '';
  if (sumIndex !== -1) {
    const endSum = expIndex > sumIndex ? expIndex : sumIndex + 5;
    summaryText = cleanLines(
      allLines.slice(sumIndex + 1, endSum).map((l) => l.text)
    )
      .join(' ')
      .trim();
  }

  // Ambil Pengalaman Kerja
  let experienceLines: string[] = [];
  if (expIndex !== -1) {
    const endExp = eduIndex > expIndex ? eduIndex : expIndex + 10;
    experienceLines = cleanLines(
      allLines.slice(expIndex + 1, endExp).map((l) => l.text)
    ).slice(0, 7);
  }

  // Ambil Riwayat Pendidikan
  let educationLines: string[] = [];
  if (eduIndex !== -1) {
    educationLines = cleanLines(
      allLines.slice(eduIndex + 1, eduIndex + 8).map((l) => l.text)
    ).slice(0, 5);
  } else {
    const schoolIdx = allLines.findIndex((l) =>
      /(universitas|institut|politeknik|sekolah tinggi|sma |smk |man |ma |sarjana|bachelor|d3|d4|smp|sd)/i.test(
        l.text
      )
    );
    if (schoolIdx !== -1) {
      educationLines = cleanLines(
        allLines.slice(schoolIdx, schoolIdx + 4).map((l) => l.text)
      );
    }
  }

  return {
    name: detectedName ? detectedName.toUpperCase() : '',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0].trim() : '',
    linkedin: linkedinMatch ? linkedinMatch[0].replace(/\(.*$/, '') : '',
    location: locationLine ? locationLine.text : 'Indonesia',
    summary: summaryText,
    experienceLines,
    educationLines,
  };
}

export default function PreviewScreen() {
  const {
    finalScore,
    selectedKeywords,
    cvFile,
    restoredCvFileName,
    jobDescription,
    user,
    setUser,
    isUnlocked,
    hasDownloadedCurrentCv,
    markCurrentCvDownloaded,
    isPaymentModalOpen,
    isProcessingPayment,
    openPaymentModal,
    closePaymentModal,
    processSelectedPayment,
    useQuotaToUnlock: unlockWithQuota,
    resetSession,
  } = useAppStore();

  const [pdfData, setPdfData] = useState<ExtractedPDFData | null>(null);
  const [isReadingPdf, setIsReadingPdf] = useState(false);
  const [isUsingQuota, setIsUsingQuota] = useState(false);
  const [isLoadingSnap, setIsLoadingSnap] = useState(false);
  const downloadLockRef = useRef(false);

  // 1. Muat Script Midtrans Snap Sandbox saat halaman Preview dibuka
  useEffect(() => {
    const snapSrcUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';

    if (document.querySelector(`script[src="${snapSrcUrl}"]`)) return;

    const script = document.createElement('script');
    script.src = snapSrcUrl;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // 2. Baca isi file PDF saat halaman Preview dibuka (atau pulihkan dari sessionStorage seusai redirect DANA)
  useEffect(() => {
    let isMounted = true;
    if (cvFile) {
      Promise.resolve()
        .then(() => {
          if (isMounted) setIsReadingPdf(true);
          return extractDataFromPdfFile(cvFile);
        })
        .then((data) => {
          if (isMounted) {
            setPdfData(data);
            sessionStorage.setItem(
              'lulusats_extracted_pdf',
              JSON.stringify(data)
            );
          }
        })
        .catch((err) => {
          console.error('Gagal mengekstrak PDF di Preview:', err);
        })
        .finally(() => {
          if (isMounted) setIsReadingPdf(false);
        });
    } else {
      const cachedPdf = sessionStorage.getItem('lulusats_extracted_pdf');
      if (cachedPdf) {
        queueMicrotask(() => {
          if (!isMounted) return;
          try {
            setPdfData(JSON.parse(cachedPdf) as ExtractedPDFData);
          } catch (err) {
            console.error('Gagal membaca cache PDF:', err);
          }
        });
      }
    }
    return () => {
      isMounted = false;
    };
  }, [cvFile]);

  const activeKeywords = (selectedKeywords || []) as unknown as MasterKeyword[];

  const checkedHardSkills = activeKeywords
    .filter((k) => k.category === 'HARD_SKILL')
    .map((k) => k.keyword);

  const checkedExp = activeKeywords
    .filter((k) => k.category === 'EXPERIENCE')
    .map((k) => k.keyword);

  const checkedSoftSkills = activeKeywords
    .filter((k) => k.category === 'SOFT_SKILL')
    .map((k) => k.keyword);

  // Deteksi nama posisi dari input loker
  const detectRoleFromJob = (): string => {
    const match = jobDescription.match(
      /(?:Posisi|Role|Lowongan|Jabatan)\s*:\s*([^\n,;]+)/i
    );
    if (match && match[1]) {
      return match[1].trim();
    }
    if (jobDescription.trim()) {
      const firstLine = jobDescription
        .trim()
        .split('\n')[0]
        .split(',')[0]
        .replace(/^(?:Posisi|Role|Lowongan|Jabatan)\s*:\s*/i, '')
        .trim();
      if (firstLine.length > 0 && firstLine.length < 45) return firstLine;
    }
    return 'Profesional Berkualitas';
  };

  // Deteksi nama kandidat dari hasil ekstraksi PDF
  const detectCandidateName = (): string => {
    if (pdfData?.name) {
      return pdfData.name.toUpperCase();
    }
    const fileName = cvFile?.name || restoredCvFileName;
    if (fileName && !/^profile\.pdf$/i.test(fileName)) {
      const cleanName = fileName
        .replace(/\.pdf$/i, '')
        .replace(/^CV[_\-\s]*/i, '')
        .replace(/[_\-]+/g, ' ')
        .trim();
      if (cleanName) return cleanName.toUpperCase();
    }
    return 'NAMA KANDIDAT';
  };

  const roleTitle = detectRoleFromJob();
  const candidateName = detectCandidateName();
  const candidateEmail = pdfData?.email || 'email.kandidat@gmail.com';
  const candidatePhone = pdfData?.phone || '+62 812-xxxx-xxxx';
  const candidateLocation = pdfData?.location || 'Indonesia';
  const candidateLinkedin =
    pdfData?.linkedin || 'linkedin.com/in/profil-kandidat';

  // Buka Preview menggunakan kuota; kuota baru dipotong saat CV diunduh.
  const handleUseQuota = () => {
    if (!user) return;
    unlockWithQuota();
  };

  // Fungsi membuka Window Snap Midtrans Sandbox saat memilih paket Rp 2.000 / Rp 50.000
  const handleSelectPayment = async (planType: 'single' | 'bundle') => {
    if (!user || isLoadingSnap) return;
    setIsLoadingSnap(true);

    const tokenRes = await createMidtransSnapToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      planType,
      originUrl: window.location.origin,
    });

    setIsLoadingSnap(false);

    if (!tokenRes.success || !tokenRes.token) {
      alert(tokenRes.message || 'Gagal membuka Midtrans Snap.');
      return;
    }

    closePaymentModal();

    const win = window as unknown as { snap?: MidtransSnap };
    if (win.snap) {
      win.snap.pay(tokenRes.token, {
        onSuccess: async () => {
          const processedKey = `processed_${tokenRes.orderId}`;
          const processingKey = `processing_${tokenRes.orderId}`;
          if (
            sessionStorage.getItem(processedKey) ||
            sessionStorage.getItem(processingKey)
          ) {
            return;
          }
          sessionStorage.setItem(processingKey, 'true');
          sessionStorage.setItem(processedKey, 'true');

          try {
            const dbRes = await processPaymentInDb({
              userId: user.id,
              planType,
            });

            if (!dbRes.success || typeof dbRes.remainingQuota !== 'number') {
              sessionStorage.removeItem(processedKey);
              alert(
                'Pembayaran berhasil, tetapi kuota belum tersimpan. Silakan hubungi dukungan sebelum mencoba membayar kembali.'
              );
              return;
            }

            processSelectedPayment(planType);
            setUser({
              ...(useAppStore.getState().user || user),
              remainingQuota: dbRes.remainingQuota,
              subscriptionPlan:
                (dbRes.subscriptionPlan as 'FREE' | 'MONTHLY') ||
                user.subscriptionPlan,
            });
          } finally {
            sessionStorage.removeItem(processingKey);
          }
        },
        onPending: () => {
          alert(
            'Menunggu pembayaran diselesaikan. Silakan selesaikan pembayaran Anda.'
          );
        },
        onError: () => {
          alert('Pembayaran gagal diproses oleh Midtrans.');
        },
        onClose: () => {
          console.log('Jendela Midtrans ditutup oleh pengguna.');
        },
      });
    } else {
      alert('Script Midtrans Snap belum siap, silakan coba klik sekali lagi.');
    }
  };

  const handleDownloadPDF = async () => {
    if (
      typeof window === 'undefined' ||
      !user ||
      downloadLockRef.current
    ) {
      return;
    }

    downloadLockRef.current = true;
    setIsUsingQuota(true);

    try {
      if (!hasDownloadedCurrentCv) {
        const res = await consumeQuotaAndSaveCv({
          userId: user.id,
          jobTitle: roleTitle,
          matchScore: finalScore,
          cvData: {
            candidateName,
            email: candidateEmail,
            phone: candidatePhone,
            location: candidateLocation,
            keywords: activeKeywords.map((k) => k.keyword),
          },
        });

        if (!res.success || typeof res.remainingQuota !== 'number') {
          alert(res.message || 'Kuota tidak dapat digunakan untuk mengunduh CV.');
          return;
        }

        setUser({
          ...(useAppStore.getState().user || user),
          remainingQuota: res.remainingQuota,
        });
        markCurrentCvDownloaded();
      }

      window.print();
    } catch (error) {
      console.error('Gagal memproses unduhan CV:', error);
      alert('Terjadi kesalahan saat memproses unduhan CV. Silakan coba lagi.');
    } finally {
      downloadLockRef.current = false;
      setIsUsingQuota(false);
    }
  };

  return (
    <section className="w-full flex flex-col pb-36 transition-all duration-300 bg-slate-50 flex-1">
      <div className="p-4 space-y-4">
        {/* Card Status Atas */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold text-slate-900">
                CV ATS Siap Diterbitkan
              </h2>
              <p className="text-[11px] text-slate-500">
                Standar 1-Kolom ATS • A4 Vector
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg font-black text-emerald-600 leading-none block">
              {finalScore}%
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              SKOR ATS
            </span>
          </div>
        </div>

        {/* Bingkai Luar Kartu Preview */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden print:border-none print:shadow-none">
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-2.5 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>PREVIEW CV A4</span>
            </div>
            {isReadingPdf ? (
              <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Membaca PDF...</span>
              </span>
            ) : (
              isUnlocked && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Siap Unduh</span>
                </span>
              )
            )}
          </div>

          {/* AREA DOKUMEN CV A4 YANG DICETAK KE PDF */}
          <div className="preview-cv-a4 p-5 space-y-4 text-slate-800">
            {/* 1. Kop Biodata Dinamis */}
            <div className="text-center border-b border-slate-200 pb-3.5">
              <h1 className="text-base font-black tracking-tight text-slate-900 uppercase">
                {candidateName}
              </h1>
              <p className="text-xs font-bold text-slate-700 mt-0.5 capitalize">
                {roleTitle}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {candidateLocation} • {candidatePhone} • {candidateEmail}
              </p>
              <p className="text-[10px] text-indigo-600 font-medium mt-0.5">
                {candidateLinkedin}
              </p>
            </div>

            {/* 2. Ringkasan Profesional */}
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                ABOUT ME
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {pdfData?.summary && pdfData.summary.length > 25 ? (
                  pdfData.summary
                ) : (
                  <>
                    Profesional terdedikasi sebagai{' '}
                    <span className="font-semibold text-slate-800 capitalize">
                      {roleTitle}
                    </span>{' '}
                    dengan keahlian adaptif dan berorientasi pada pencapaian
                    target perusahaan. Memiliki kompetensi yang diperkuat dengan
                    penguasaan{' '}
                    {checkedHardSkills.length > 0
                      ? checkedHardSkills.slice(0, 3).join(', ')
                      : 'standar operasional dan teknis industri'}
                    , serta terbukti handal dalam kolaborasi tim dan pemecahan
                    masalah secara analitis.
                  </>
                )}
              </p>
            </div>

            {/* 3. Keahlian Teknis & Kata Kunci ATS */}
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                KEAHLIAN TEKNIS
              </h3>
              <div className="space-y-1 text-[11px] leading-snug text-slate-600">
                <p>
                  <strong className="text-slate-900">
                    Hard Skills :{' '}
                  </strong>
                  {checkedHardSkills.length > 0
                    ? checkedHardSkills.join(', ')
                    : 'Penguasaan Teknis Utama, Pengolahan Data & Pelaporan Kerja'}
                </p>
                <p>
                  <strong className="text-slate-900">
                    Konteks &amp; Pengalaman :{' '}
                  </strong>
                  {checkedExp.length > 0
                    ? checkedExp.join(', ')
                    : 'Pengalaman kerja sesuai bidang lowongan.'}
                </p>
                <p>
                  <strong className="text-slate-900">
                    Kompetensi Profesional :{' '}
                  </strong>
                  {checkedSoftSkills.length > 0
                    ? checkedSoftSkills.join(', ')
                    : 'Problem Solver & Detail Oriented.'}
                </p>
              </div>
            </div>

            {/* 4. Pengalaman Kerja */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                PENGALAMAN KERJA
              </h3>
              {pdfData?.experienceLines &&
              pdfData.experienceLines.length > 0 ? (
                <div className="space-y-1 text-[11px] text-slate-700 leading-snug">
                  {pdfData.experienceLines.map((line, idx) => (
                    <p
                      key={idx}
                      className={
                        idx === 0 || idx === 1
                          ? 'font-bold text-slate-900'
                          : 'text-slate-600'
                      }
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900 capitalize">
                      {roleTitle}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Pengalaman Kerja
                    </span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-slate-600 mt-1 space-y-1 leading-snug">
                    <li>
                      Bertanggung jawab penuh dalam mengeksekusi tugas dan
                      target harian menggunakan keahlian{' '}
                      {checkedHardSkills[0] ||
                        'standar kompetensi profesional'}
                      .
                    </li>
                    <li>
                      Menjaga efisiensi operasional dan koordinasi tim secara
                      proaktif untuk mendukung produktivitas perusahaan.
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* 5. Riwayat Pendidikan */}
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                RIWAYAT PENDIDIKAN
              </h3>
              {pdfData?.educationLines && pdfData.educationLines.length > 0 ? (
                <div className="space-y-0.5 text-[11px] text-slate-700 leading-snug">
                  {pdfData.educationLines.map((line, idx) => (
                    <p
                      key={idx}
                      className={
                        idx === 0
                          ? 'font-bold text-slate-900'
                          : 'text-slate-600'
                      }
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-slate-600 leading-snug">
                  <p className="font-bold text-slate-900">
                    Pendidikan Formal Terverifikasi
                  </p>
                  <p className="text-[10.5px] text-slate-500">
                    Lulusan Kualifikasi Akademik Sesuai Posisi Target
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Checkout / Download Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 safe-area-bottom z-30 shadow-xl print:hidden">
        {!isUnlocked ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">
                  Total Buka Kunci:
                </span>
                <span className="text-xs text-slate-400 line-through font-semibold">
                  Rp 10.000
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900">
                  Rp 2.000
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-md shadow-2xs">
                  Hemat 80%
                </span>
              </div>
            </div>

            {user && user.remainingQuota > 0 ? (
              <div className="space-y-2">
                <button
                  onClick={handleUseQuota}
                  type="button"
                  className="w-full min-h-13 inline-flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all text-sm cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>
                    Lanjutkan dengan Kuota ( Sisa: {user.remainingQuota} )
                  </span>
                </button>
                <button
                  onClick={openPaymentModal}
                  type="button"
                  className="w-full py-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 text-center cursor-pointer"
                >
                  + Top Up Paket Kuota via Midtrans (Rp 2.000 / Rp 50.000)
                </button>
              </div>
            ) : (
              <button
                onClick={openPaymentModal}
                disabled={isProcessingPayment || isLoadingSnap}
                type="button"
                className="w-full min-h-13 inline-flex items-center justify-center gap-2.5 bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:scale-[0.98] disabled:opacity-60 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-teal-600/30 transition-all text-sm cursor-pointer group"
              >
                {isProcessingPayment || isLoadingSnap ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Menyiapkan Midtrans Snap...</span>
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                    <span>Buka Kunci PDF (Rp 2.000)</span>
                    <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isUsingQuota}
              type="button"
              className="w-full min-h-13 inline-flex items-center justify-center gap-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] disabled:opacity-60 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all text-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {isUsingQuota
                  ? 'Memproses Unduh...'
                  : 'Unduh PDF Standar ATS Sekarang'}
              </span>
            </button>

            <button
              onClick={resetSession}
              type="button"
              className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Buat CV untuk Lowongan Lain</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal Pilihan Paket Pembayaran */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 print:hidden">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-black text-slate-900">
                  Pilih Paket Akses CV ATS
                </h3>
                <p className="text-[10px] text-slate-500">
                  Midtrans Sandbox • QRIS / DANA / Virtual Account
                </p>
              </div>
              <button
                onClick={closePaymentModal}
                type="button"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer shrink-0 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoadingSnap ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-indigo-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-bold">
                  Membuka Jendela Midtrans...
                </span>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button
                  onClick={() => handleSelectPayment('single')}
                  type="button"
                  className="w-full text-left p-3 rounded-2xl border-2 border-teal-500 bg-teal-50/40 hover:bg-teal-50 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between"
                >
                  <span className="block">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800">
                      Sekali Unduh
                    </span>
                    <span className="block text-xs font-bold text-slate-900 mt-1">
                      1 Dokumen CV ATS
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      Cocok untuk melamar cepat hari ini
                    </span>
                  </span>
                  <span className="block text-right shrink-0 ml-2">
                    <span className="text-xs font-black text-teal-700 block">
                      Rp 2.000
                    </span>
                    <span className="text-[9px] text-slate-400 line-through">
                      Rp 10.000
                    </span>
                  </span>
                </button>

                <button
                  onClick={() => handleSelectPayment('bundle')}
                  type="button"
                  className="w-full text-left p-3 rounded-2xl border-2 border-indigo-600 bg-indigo-50/40 hover:bg-indigo-50 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between relative"
                >
                  <div>
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-indigo-600 text-white">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Paling Hemat</span>
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">
                      Paket 50 Kuota CV
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Rp 1.000 / CV • Bebas 50 loker
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs font-black text-indigo-700 block">
                      Rp 50.000
                    </span>
                    <span className="text-[9px] text-emerald-600 font-bold">
                      50 Token
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}