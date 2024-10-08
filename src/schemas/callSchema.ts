import { z } from 'zod';

// Zod Schema para o modelo Call
export const ZCallSchema = z.object({
    callId: z.string().optional(), // ID da chamada (opcional ao criar)
    startTime: z.date().optional(), // Hora de início da chamada (opcional ao criar)
    endTime: z.date().optional(), // Hora de término da chamada (opcional ao criar)
    phoneId: z.string().min(1, "Phone ID is required."), // ID do telefone para a chamada
    attendantId: z.string().min(1, "Attendant ID is required."), // ID do atendente que fez a chamada
    status: z.enum(["PENDING", "QUEUED", "IN_PROGRESS", "COMPLETED", "MISSED", "NOT_COMPLETED", "CANCELED"]).optional() // Status da chamada
});