import prisma from '../database/prismaClient'; // Não esqueça de ajustar o caminho
import { v4 as uuidv4 } from 'uuid';

export const createAttendant = async (data: any) => {
    return await prisma.attendant.create({
        data: { ...data },
    });
};

export const softDeleteAttendant = async (attendantId: string) => {
    await prisma.attendant.update({
        where: { attendantId },
        data: { deletedAt: new Date() },
    });
};

export const patchAttendant = async (attendantId: string, data: any) => {
    return await prisma.attendant.update({
        where: { attendantId },
        data: { ...data },
    });
};

export const generateToken = async (attendantId: string) => {
    const tokenId = uuidv4();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas a partir de agora

    await prisma.attendant.update({
        where: { attendantId },
        data: {
            tokenId,
            tokenExpiresAt,
        },
    });

    return tokenId;
};