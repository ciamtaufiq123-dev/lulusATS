'use server';

import { randomUUID } from 'node:crypto';
import { prisma } from '@/src/lib/prisma';

// 1. Sinkronisasi data user saat login Google
export async function syncUserWithDatabase(userData: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
}) {
    try {
    const dbUser = await prisma.user.upsert({
            where: { id: userData.id },
            update: {
            email: userData.email,
            name: userData.name,
            avatarUrl: userData.avatarUrl,
        },
            create: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            avatarUrl: userData.avatarUrl,
            subscriptionPlan: 'FREE',
            remainingQuota: 1,
        },
    });

    return dbUser;
    } catch (error) {
        console.error('Gagal sinkronisasi user ke database:', error);
    return null;
    }
}

// 2. Potong satu kuota saat unduh dan simpan riwayat CV.
export async function consumeQuotaAndSaveCv(payload: {
    userId: string;
    jobTitle: string;
    matchScore: number;
    cvData: { 
    candidateName: string;
    email: string;
    phone: string;
    location: string;
    keywords: string[];
    };
}) {
    try {
    const updatedUser = await prisma.$transaction(async (transaction) => {
        const quotaUpdate = await transaction.user.updateMany({
            where: {
                id: payload.userId,
                remainingQuota: { gt : 0 },
            },
            data: {
                remainingQuota: { decrement: 1 },
            },
        });

        if (quotaUpdate.count === 0) {
            return null;
        }

        await transaction.cvHistory.create({
            data: {
                userId: payload.userId,
                jobTitle: payload.jobTitle,
                matchScore: payload.matchScore,
                cvData: payload.cvData,
            },
        });

        return transaction.user.findUnique({
            where: { id: payload.userId },
        });
    });

    if (!updatedUser) {
        return {
            success: false,
            message: 'Kuota dokumen Anda sudah habis.',
            remainingQuota: 0,
        };
    }

    return {
        success: true,
        remainingQuota: updatedUser.remainingQuota,
    };
    } catch (error) {
    console.error('Gagal mengurangi kuota di database:', error);
    return {
        success: false,
        message: 'Terjadi kesalahan saat memproses kuota.',
    };
    }
}

// 3. Buat Token Transaksi Midtrans Snap (Mode Sandbox)
export async function createMidtransSnapToken(payload: {
    userId: string;
    name: string;
    email: string;
    planType: 'single' | 'bundle';
    originUrl: string;
}) {
    try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
        return {
        success: false,
        message: 'MIDTRANS_SERVER_KEY belum diatur di file .env',
        };
    }

    const isBundle = payload.planType === 'bundle';
    const grossAmount = isBundle ? 50000 : 2000;
    const itemName = isBundle
        ? 'Paket Hemat 50 Kuota CV ATS'
        : 'Buka Kunci 1 Dokumen CV ATS';
    const orderId = `LULUSATS-${payload.planType.toUpperCase()}-${randomUUID().replaceAll('-', '')}`;

    const authString = Buffer.from(`${serverKey}:`).toString('base64');

    // URL tujuan setelah selesai bayar di simulator DANA / E-Wallet
    const finishUrl = `${payload.originUrl}/?midtrans_paid=1&plan=${payload.planType}&order_id=${encodeURIComponent(orderId)}`;

    const response = await fetch(
        'https://app.sandbox.midtrans.com/snap/v1/transactions',
        {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify({
            transaction_details: {
            order_id: orderId,
            gross_amount: grossAmount,
            },
            item_details: [
            {
                id: payload.planType,
                price: grossAmount,
                quantity: 1,
                name: itemName,
            },
            ],
            customer_details: {
            first_name: payload.name || 'Pengguna LulusATS',
            email: payload.email || 'user@lulusats.com',
            },
            callbacks: {
            finish: finishUrl,
            },
        }),
        }
    );

    const data = (await response.json()) as {
        token?: string;
        error_messages?: string[];
    };

    if (!response.ok || !data.token) {
        console.error('Midtrans Error:', data);
        return {
        success: false,
        message: data.error_messages?.[0] || 'Gagal membuat transaksi Midtrans',
        };
    }

    return {
        success: true,
        token: data.token,
        orderId,
    };
    } catch (error) {
    console.error('Gagal menghubungi server Midtrans:', error);
    return {
        success: false,
        message: 'Terjadi kesalahan jaringan ke Midtrans.',
    };
    }
}

// 4. Tambahkan kuota setelah pembayaran Midtrans sukses.
export async function processPaymentInDb(payload: {
    userId: string;
    planType: 'single' | 'bundle';
}) {
    try {
    const updatedUser = await prisma.user.update({
        where: { id: payload.userId },
        data:
        payload.planType === 'bundle'
            ? {
                remainingQuota: { increment: 50 },
                subscriptionPlan: 'MONTHLY',
            }
            : {
                remainingQuota: { increment: 1 },
            },
    });

    return {
        success: true,
        remainingQuota: updatedUser.remainingQuota,
        subscriptionPlan: updatedUser.subscriptionPlan,
    };
    } catch (error) {
        console.error('Gagal menyimpan pembayaran ke database:', error);
        return { success: false };
    }
}