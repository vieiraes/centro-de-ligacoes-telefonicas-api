import { z } from 'zod';

// Zod Schema para o modelo Attendant
export const ZAttendantSchema = z.object({
    attendantId: z.string().optional(), // ID do atendente, pode ser opcional para criação
    name: z.string().min(1, "O nome é obrigatório."), // Nome do atendente
    isOnline: z.boolean().optional().default(false), // Se o atendente está online
    tokenId: z.string().optional(), // Token ID do atendente
    tokenExpiresAt: z.date().optional(), // Data de expiração do token
    createdAt: z.date().optional(), // Data de criação
    deletedAt: z.date().optional(), // Data de deleção (soft delete)
});