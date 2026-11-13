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

interface PositionedPdfTextItem {
  text: string;
  x: number;
  y: number;
  endX: number;
  fontSize: number;
}

interface PdfTextBlock {
  text: string;
  x: number;
  endX: number;
}

interface PdfVisualLine {
  y: number;
  fontSize: number;
  blocks: PdfTextBlock[];
}

interface ExtractedPdfLine {
  text: string;
  fontSize: number;
  page: number;
  y: number;
}

type ResumeSection = 'summary' | 'experience' | 'education' | 'other';

function getResumeSection(line: string): ResumeSection | null {
  const heading = line
    .trim()
    .replace(/^[•*#\-\s]+/, '')
    .replace(/^\d+[\s.)-]+/, '')
    .replace(/[:：\-–—\s]+$/, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();

  if (
    /^(summary|professional summary|profile summary|profile|professional profile|about(?: me)?|ringkasan|tentang saya|profil(?: singkat)?|career objective|objective|tujuan karier)$/.test(
      heading
    )
  ) {
    return 'summary';
  }

  if (
    /^(experience|work experience|professional experience|relevant experience|employment(?: history)?|work history|career history|pengalaman(?: kerja| profesional)?|riwayat pekerjaan)$/.test(
      heading
    )
  ) {
    return 'experience';
  }

  if (
    /^(education|educational background|academic background|pendidikan|riwayat pendidikan|edukasi)$/.test(
      heading
    )
  ) {
    return 'education';
  }

  if (
    /^(skills?|technical skills|core skills|keahlian(?: teknis)?|competencies|certifications?|licenses?|sertifikasi|lisensi|languages?|bahasa|awards?|honors?(?: and awards?)?|penghargaan|projects?|proyek|portfolio|volunteer(?: experience)?|sukarelawan|publications?|publikasi|references?|referensi|contact|kontak|personal details|data diri|interests?|minat)$/.test(
      heading
    )
  ) {
    return 'other';
  }

  return null;
}

function createPdfVisualLines(
  items: PositionedPdfTextItem[]
): PdfVisualLine[] {
  const sortedItems = [...items].sort(
    (a, b) => b.y - a.y || a.x - b.x
  );
  const rows: Array<{
    y: number;
    fontSize: number;
    items: PositionedPdfTextItem[];
  }> = [];

  for (const item of sortedItems) {
    const row = rows[rows.length - 1];
    const verticalTolerance = Math.max(
      2,
      Math.min(item.fontSize, row?.fontSize ?? item.fontSize) * 0.45
    );

    if (!row || Math.abs(row.y - item.y) > verticalTolerance) {
      rows.push({ y: item.y, fontSize: item.fontSize, items: [item] });
      continue;
    }

    row.items.push(item);
    row.y =
      row.items.reduce((sum, rowItem) => sum + rowItem.y, 0) /
      row.items.length;
    row.fontSize = Math.max(row.fontSize, item.fontSize);
  }

  return rows.map((row) => {
    const blocks: PdfTextBlock[] = [];
    let blockItems: PositionedPdfTextItem[] = [];

    const flushBlock = () => {
      if (blockItems.length === 0) return;
      blocks.push({
        text: blockItems.map((item) => item.text).join(' ').trim(),
        x: blockItems[0].x,
        endX: blockItems[blockItems.length - 1].endX,
      });
      blockItems = [];
    };

    for (const item of row.items.sort((a, b) => a.x - b.x)) {
      const previousItem = blockItems[blockItems.length - 1];
      const columnGap = previousItem ? item.x - previousItem.endX : 0;
      if (
        previousItem &&
        columnGap > Math.max(28, Math.min(item.fontSize, previousItem.fontSize) * 3.5)
      ) {
        flushBlock();
      }
      blockItems.push(item);
    }
    flushBlock();

    return { y: row.y, fontSize: row.fontSize, blocks };
  });
}

function detectColumnDivider(
  lines: PdfVisualLine[],
  pageLeft: number,
  pageWidth: number
): number | null {
  if (lines.length < 8 || pageWidth <= 0) return null;

  let bestDivider: number | null = null;
  let bestScore = 0;

  for (let fraction = 0.3; fraction <= 0.7; fraction += 0.02) {
    const divider = pageLeft + pageWidth * fraction;
    let leftLineCount = 0;
    let rightLineCount = 0;
    let crossingLineCount = 0;

    for (const line of lines) {
      const hasLeft = line.blocks.some((block) => block.endX <= divider);
      const hasRight = line.blocks.some((block) => block.x >= divider);
      const crossesDivider = line.blocks.some(
        (block) => block.x < divider && block.endX > divider
      );
      if (hasLeft) leftLineCount += 1;
      if (hasRight) rightLineCount += 1;
      if (crossesDivider) crossingLineCount += 1;
    }

    const balancedLines = Math.min(leftLineCount, rightLineCount);
    const crossingRatio = crossingLineCount / lines.length;
    if (
      balancedLines < Math.max(3, Math.floor(lines.length * 0.12)) ||
      crossingRatio > 0.2
    ) {
      continue;
    }

    const score =
      balancedLines -
      crossingLineCount * 2 -
      Math.abs(leftLineCount - rightLineCount) * 0.1;
    if (score > bestScore) {
      bestScore = score;
      bestDivider = divider;
    }
  }

  return bestDivider;
}

function orderPageLines(
  lines: PdfVisualLine[],
  pageNumber: number,
  divider: number | null
): ExtractedPdfLine[] {
  const makeLine = (
    line: PdfVisualLine,
    blocks: PdfTextBlock[]
  ): ExtractedPdfLine | null => {
    const text = blocks.map((block) => block.text).join(' ').trim();
    return text
      ? { text, fontSize: line.fontSize, page: pageNumber, y: line.y }
      : null;
  };

  if (divider === null) {
    return lines
      .map((line) => makeLine(line, line.blocks))
      .filter((line): line is ExtractedPdfLine => line !== null);
  }

  const spanningLines = lines
    .filter((line) =>
      line.blocks.some(
        (block) => block.x < divider && block.endX > divider
      )
    )
    .sort((a, b) => b.y - a.y);
  const ordered: ExtractedPdfLine[] = [];
  let regionTop = Number.POSITIVE_INFINITY;

  const appendColumns = (regionBottom: number) => {
    for (const isLeftColumn of [true, false]) {
      for (const line of lines) {
        if (
          line.y >= regionTop ||
          line.y <= regionBottom ||
          spanningLines.includes(line)
        ) {
          continue;
        }

        const blocks = line.blocks.filter((block) =>
          isLeftColumn
            ? (block.x + block.endX) / 2 < divider
            : (block.x + block.endX) / 2 >= divider
        );
        const extractedLine = makeLine(line, blocks);
        if (extractedLine) ordered.push(extractedLine);
      }
    }
  };

  for (const line of spanningLines) {
    appendColumns(line.y);
    const extractedLine = makeLine(line, line.blocks);
    if (extractedLine) ordered.push(extractedLine);
    regionTop = line.y;
  }
  appendColumns(Number.NEGATIVE_INFINITY);

  return ordered;
}

// Reads text from common single- and multi-column resume layouts.
async function extractDataFromPdfFile(file: File): Promise<ExtractedPDFData> {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const allLines: ExtractedPdfLine[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const positionedItems = content.items.flatMap((item) => {
      const text = item.str?.replace(/\s+/g, ' ').trim();
      if (!text) return [];

      const transform = item.transform ?? [10, 0, 0, 10, 0, 0];
      const fontSize =
        Math.hypot(transform[0] ?? 0, transform[1] ?? 0) ||
        Math.abs(transform[3] ?? 0) ||
        item.height ||
        10;
      const x = transform[4] ?? 0;
      const y = transform[5] ?? 0;
      const width =
        item.width && item.width > 0
          ? item.width
          : Math.max(fontSize * 0.25, text.length * fontSize * 0.5);

      return [{ text, x, y, endX: x + width, fontSize }];
    });

    if (positionedItems.length === 0) continue;

    const visualLines = createPdfVisualLines(positionedItems);
    const pageLeft = page.view?.[0] ?? 0;
    const pageRight = page.view?.[2] ?? 595;
    const divider = detectColumnDivider(
      visualLines,
      pageLeft,
      pageRight - pageLeft
    );
    allLines.push(...orderPageLines(visualLines, pageNum, divider));
  }

  if (allLines.length === 0) {
    throw new Error('PDF_NO_EXTRACTABLE_TEXT');
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
      l.text.length <= 60 &&
      !ignoredHeaders.test(l.text.trim()) &&
      !getResumeSection(l.text) &&
      !l.text.includes('@') &&
      !l.text.toLowerCase().includes('linkedin.com') &&
      !l.text.toLowerCase().includes('http') &&
      !/^[+\d\s\-()]+$/.test(l.text)
  );

  const sortedByFont = [...page1Candidates].sort(
    (a, b) => b.fontSize - a.fontSize || b.y - a.y
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
  const cleanLines = (lines: string[]) =>
    lines
      .map((line) => line.replace(/^[•●▪◦\-–]\s*/, '').trim())
      .filter(
        (line) =>
          line.length > 0 &&
          !/^page \d+(?: of \d+)?$/i.test(line) &&
          !/^(contact|kontak|top skills|languages|bahasa|certifications?)$/i.test(
            line
          )
      );

  const extractSection = (
    section: 'summary' | 'experience' | 'education',
    maxLines: number
  ) => {
    const startIndex = allLines.findIndex(
      (line) => getResumeSection(line.text) === section
    );
    if (startIndex === -1) return [];

    const sectionLines: string[] = [];
    for (let index = startIndex + 1; index < allLines.length; index += 1) {
      if (getResumeSection(allLines[index].text)) break;
      sectionLines.push(allLines[index].text);
      if (sectionLines.length >= maxLines) break;
    }
    return cleanLines(sectionLines);
  };

  let summaryText = extractSection('summary', 7).join(' ').trim();
  if (!summaryText) {
    const firstSectionIndex = allLines.findIndex((line) =>
      getResumeSection(line.text)
    );
    if (firstSectionIndex > 0) {
      summaryText = cleanLines(
        allLines
          .slice(1, firstSectionIndex)
          .map((line) => line.text)
          .filter(
            (line) =>
              !line.includes('@') &&
              !/linkedin\.com|https?:\/\//i.test(line) &&
              !/(?:\+62|62|08)[0-9\s\-]{8,16}/.test(line)
          )
      )
        .slice(0, 5)
        .join(' ');
    }
  }

  const experienceLines = extractSection('experience', 10).slice(0, 7);
  let educationLines = extractSection('education', 8).slice(0, 5);
  if (educationLines.length === 0) {
    const schoolIdx = allLines.findIndex((l) =>
      /(universitas|institut|politeknik|sekolah tinggi|sma |smk |man |ma |sarjana|bachelor|d3|d4|smp|sd)/i.test(
        l.text
      )
    );
    if (schoolIdx !== -1) {
      educationLines = cleanLines(
        allLines.slice(schoolIdx, schoolIdx + 5).map((l) => l.text)
      ).slice(0, 5);
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
  const [pdfReadError, setPdfReadError] = useState<string | null>(null);
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
          if (!isMounted) return null;
          setPdfData(null);
          setPdfReadError(null);
          setIsReadingPdf(true);
          sessionStorage.removeItem('lulusats_extracted_pdf');
          return extractDataFromPdfFile(cvFile);
        })
        .then((data) => {
          if (isMounted && data) {
            setPdfData(data);
            sessionStorage.setItem(
              'lulusats_extracted_pdf',
              JSON.stringify(data)
            );
          }
        })
        .catch((err) => {
          console.error('Gagal mengekstrak PDF di Preview:', err);
          if (isMounted) {
            setPdfData(null);
            setPdfReadError(
              err instanceof Error &&
                err.message === 'PDF_NO_EXTRACTABLE_TEXT'
                ? 'Teks tidak ditemukan di PDF ini. Pastikan PDF memiliki teks yang bisa dipilih; PDF hasil scan belum didukung.'
                : 'PDF belum bisa dibaca. Coba ekspor ulang sebagai PDF berbasis teks, lalu unggah kembali.'
            );
          }
        })
        .finally(() => {
          if (isMounted) setIsReadingPdf(false);
        });
    } else {
      const cachedPdf = sessionStorage.getItem('lulusats_extracted_pdf');
      queueMicrotask(() => {
        if (!isMounted) return;
        if (cachedPdf) {
          try {
            setPdfData(JSON.parse(cachedPdf) as ExtractedPDFData);
            setPdfReadError(null);
          } catch (err) {
            console.error('Gagal membaca cache PDF:', err);
            setPdfData(null);
            setPdfReadError(
              'Data hasil pembacaan CV tidak ditemukan. Silakan unggah ulang file PDF Anda.'
            );
          }
          return;
        }

        setPdfData(null);
        setPdfReadError(
          'Data hasil pembacaan CV tidak ditemukan. Silakan unggah ulang file PDF Anda.'
        );
      });
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
    if (isReadingPdf || !pdfData || pdfReadError) {
      alert(
        pdfReadError ||
          'Tunggu sampai file CV selesai dibaca sebelum mengunduh PDF.'
      );
      return;
    }

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
        {pdfReadError && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 print:hidden"
          >
            {pdfReadError}
          </div>
        )}

        {/* Card Status Atas */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold text-slate-900">
                {pdfReadError
                  ? 'CV Belum Bisa Diproses'
                  : isReadingPdf
                    ? 'Membaca CV...'
                    : 'CV ATS Siap Diterbitkan'}
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
                  disabled={isReadingPdf || !pdfData || Boolean(pdfReadError)}
                  type="button"
                  className="w-full min-h-13 inline-flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all text-sm cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>
                    Lanjutkan dengan Kuota ( Sisa: {user.remainingQuota} )
                  </span>
                </button>
                <button
                  onClick={openPaymentModal}
                  disabled={isReadingPdf || !pdfData || Boolean(pdfReadError)}
                  type="button"
                  className="w-full py-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 text-center disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  + Top Up Paket Kuota (Rp 2.000 / Rp 50.000)
                </button>
              </div>
            ) : (
              <button
                onClick={openPaymentModal}
                disabled={
                  isProcessingPayment ||
                  isLoadingSnap ||
                  isReadingPdf ||
                  !pdfData ||
                  Boolean(pdfReadError)
                }
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
              disabled={isUsingQuota || isReadingPdf || !pdfData || Boolean(pdfReadError)}
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
                  QRIS / DANA / Virtual Account
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