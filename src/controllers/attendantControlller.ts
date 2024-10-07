import { v4 as uuidv4 } from 'uuid';

import prisma from "../database/prismaClient";
import { ZAttendantSchema } from "../schemas/attendantSchema";
import { formatErrorResponse } from "../handlers/errorHandler";

// Função para listar atendentes
export const getAttendants = async (request, reply) => {
    try {
        const attendants = await prisma.attendant.findMany();

        if (attendants.length === 0) {
            return reply.status(404).send({ message: 'No attendants found' });
        }

        return reply.status(200).send(attendants.map(attendant => ({
            attendantId: attendant.attendantId,
            name: attendant.name,
            isOnline: attendant.isOnline,
            createdAt: attendant.createdAt,
            deletedAt: attendant.deletedAt,
            tokenId: attendant.tokenId,
            tokenExpiresAt: attendant.tokenExpiresAt,
        })));
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};

// Função para criar um novo atendente
export const createAttendant = async (request, reply) => {
    const parseResult = ZAttendantSchema.safeParse(request.body);

    if (!parseResult.success) {
        console.error(parseResult.error);
        return reply.status(400).send(formatErrorResponse(parseResult.error));
    }

    const { name, isOnline } = parseResult.data;

    const returnData = await prisma.attendant.create({
        data: {
            name,
            isOnline
        }
    });

    return reply.status(201).send(returnData);
};

// Função para deletar um atendente logicamente
export const softDeleteAttendant = async (request, reply) => {
    const { attendantId } = request.params; // Tente receber normalmente em produção
    
    // Validação do ID
    if (!attendantId || typeof attendantId !== 'string') {
        return reply.status(400).send({ message: 'Invalid attendant ID' });
    }

    try {
        // Busca o atendente para verificar se já foi deletado
        const attendant = await prisma.attendant.findUnique({
            where: { attendantId: attendantId },
            select: { deletedAt: true }
        });

        if (!attendant) {
            return reply.status(404).send({ message: 'Attendant not found' });
        }

        if (attendant.deletedAt) {
            return reply.status(400).send({ message: 'The record has already been deleted previously.' });
        }

        // Soft delete
        const deletedAttendant = await prisma.attendant.update({
            where: { attendantId: attendantId },
            data: { deletedAt: new Date() }
        });

        return reply.status(200).send({
            message: 'Register logically deleted.',
            deletedAttendant
        });
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};

// Função para atualizar dados de um atendente
export const patchAttendant = async (request, reply) => {
    const { attendantId } = request.params; // Obter o ID da URL
    const parseResult = ZAttendantSchema.partial().safeParse(request.body); // Aceita campos opcionalmente

    if (!parseResult.success) {
        console.error(parseResult.error);
        return reply.status(400).send(formatErrorResponse(parseResult.error));
    }

    // Verifique se o ID está sendo enviado no corpo da requisição
    if (parseResult.data.attendantId && parseResult.data.attendantId !== attendantId) {
        return reply.status(400).send({ message: 'Attendant ID cannot be changed.' });
    }

    // Verifique se tokenId e tokenExpiresAt estão sendo enviados
    if (parseResult.data.tokenId) {
        return reply.status(400).send({ message: 'Token ID cannot be changed.' });
    }

    if (parseResult.data.tokenExpiresAt) {
        return reply.status(400).send({ message: 'Token expiration date cannot be changed.' });
    }

    // Define tokenExpiresAt se não fornecido (padrão de 24 horas)
    if (!parseResult.data.tokenExpiresAt) {
        const now = new Date();
        parseResult.data.tokenExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas a partir de agora
    }

    try {
        // Atualiza o atendente, garantindo que o attendantId, tokenId e tokenExpiresAt não sejam alterados
        const updatedAttendant = await prisma.attendant.update({
            where: { attendantId: attendantId },
            data: {
                name: parseResult.data.name, // Atualiza apenas os campos permitidos
                isOnline: parseResult.data.isOnline,
            }, // Note que não estamos incluindo tokenId e tokenExpiresAt aqui
        });

        return reply.status(200).send(updatedAttendant);
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};

// Função para gerar um novo token para um atendente
export const generateToken = async (request, reply) => {
    const { attendantId } = request.params;
    
    try {
        // Verifica se o atendente existe
        const attendant = await prisma.attendant.findUnique({
            where: { attendantId },
            select: { tokenId: true, tokenExpiresAt: true }
        });

        if (!attendant) {
            return reply.status(404).send({ message: 'Attendant not found' });
        }

        // Gera um novo UUID para tokenId
        const newTokenId = uuidv4();
        
        // Define a data de expiração para 24 horas a partir de agora
        const now = new Date();
        const tokenExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas

        // Atualiza o atendente com o novo tokenId e tokenExpiresAt
        const updatedAttendant = await prisma.attendant.update({
            where: { attendantId },
            data: {
                tokenId: newTokenId,
                tokenExpiresAt: tokenExpiresAt
            }
        });

        return reply.status(200).send({
            attendantId: updatedAttendant.attendantId,
            tokenId: updatedAttendant.tokenId,
            tokenExpiresAt: updatedAttendant.tokenExpiresAt
        });

    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};

// Função para obter detalhes de um atendente e seu histórico de chamadas
export const getAttendantId = async (request, reply) => {
    const { attendantId } = request.params;

    try {
        // Busca o atendente e inclui seu histórico de chamadas
        const attendant = await prisma.attendant.findUnique({
            where: { attendantId },
            include: {
                calls: { // Supõe-se que você tenha uma relação chamada 'calls' no modelo Attendant
                    select: {
                        callId: true,
                        startTime: true,
                        endTime: true,
                        status: true,
                        // Inclua outros campos que deseja retornar
                    }
                }
            }
        });

        if (!attendant) {
            return reply.status(404).send({ message: 'Attendant not found' });
        }

        return reply.status(200).send({
            attendantId: attendant.attendantId,
            name: attendant.name,
            isOnline: attendant.isOnline,
            tokenId: attendant.tokenId,
            tokenExpiresAt: attendant.tokenExpiresAt,
            calls: attendant.calls // Retorna o histórico de chamadas
        });
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};