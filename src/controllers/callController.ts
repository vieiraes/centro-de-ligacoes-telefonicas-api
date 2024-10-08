import { $Enums } from "@prisma/client";
import prisma from "../database/prismaClient"; // Importa o cliente Prisma
import { formatErrorResponseHandler } from "../handlers/errorHandler";
import { ZCallSchema } from "src/schemas/callSchema";

// Função para abrir uma nova chamada
export const openCall = async (request, reply) => {
    const parseResult = ZCallSchema.safeParse(request.body); // Validar o corpo da requisição com o novo schema

    try {
        // Verifica se o atendente existe e está online
        const attendant = await prisma.attendant.findUnique({
            where: { attendantId },
            select: { isOnline: true, tokenExpiresAt: true },
        });


        if (!parseResult.success) {
            console.error(parseResult.error);
            return reply.status(400).send(formatErrorResponseHandler(parseResult.error));
        }
        const { attendantId, phoneId } = parseResult.data; // Extraia os dados validados


        if (!attendant) {
            return reply.status(404).send({ message: 'Attendant not found' });
        }

        // Valida se o atendente está online
        if (!attendant.isOnline) {
            return reply.status(400).send({ message: 'Attendant must be online to create a call' });
        }

        // Valida se o token está válido
        const now = new Date();
        if (attendant.tokenExpiresAt && attendant.tokenExpiresAt <= now) {
            return reply.status(400).send({ message: 'Attendant token is invalid or expired' });
        }

        // Cria a nova chamada
        const structuredData = await prisma.call.create({
            data: {
                startTime: now,
                endTime: null, // A chamada ainda não terminou
                phoneId,
                attendantId,
                status: $Enums.CallStatus.PENDING, // Status inicial da chamada
            }
        });

        return reply.status(201).send(structuredData);
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};

// Função para fechar uma chamada
export const closeCall = async (request, reply) => {
    const { callId } = request.params; // Obtém o ID da chamada da URL
    const { status } = request.body; // O status final deve ser passado no corpo

    // Validação do status
    const validStatuses = ["PENDING", "QUEUED", "IN_PROGRESS", "COMPLETED", "MISSED", "NOT_COMPLETED", "CANCELED"];
    if (!validStatuses.includes(status)) {
        return reply.status(400).send({ message: 'Invalid call status.' });
    }

    try {
        // Atualiza a chamada com o novo status e a data de término
        const structuredData = await prisma.call.update({
            where: { callId },
            data: {
                endTime: new Date(), // Define a data final como a data atual
                status: status // Atualiza o status da chamada
            }
        });

        return reply.status(200).send(structuredData);
    } catch (error) {
        console.error(error);

        if ((error as any).code === 'P2025') { // Este código é retornado pelo Prisma se a chamada não for encontrada
            return reply.status(404).send({ message: 'Call not found' });
        }

        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};

