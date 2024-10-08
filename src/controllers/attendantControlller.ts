import { v4 as uuidv4 } from 'uuid';
import prisma from "../database/prismaClient";
import { ZAttendantSchema } from "../schemas/attendantSchema";
import { formatErrorResponseHandler } from "../handlers/errorHandler";
import { CallStatusENUM } from 'src/schemas/callStatus';

// Função para listar atendentes
export const getAttendants = async (request, reply) => {
    try {
        const attendants = await prisma.attendant.findMany();

        if (attendants.length === 0) {
            return reply.status(404).send({ message: 'No attendants found' });
        }

        // Criação de estrutura de dados organizada
        const structuredData = attendants.map(attendant => ({
            attendantId: attendant.attendantId,
            name: attendant.name,
            isOnline: attendant.isOnline,
            createdAt: attendant.createdAt,
            deletedAt: attendant.deletedAt,
            tokenId: attendant.tokenId,
            tokenExpiresAt: attendant.tokenExpiresAt,
        }));

        return reply.status(200).send(structuredData); // Retorna a estrutura organizada
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
        return reply.status(400).send(formatErrorResponseHandler(parseResult.error));
    }

    const { name, isOnline } = parseResult.data;

    const structuredData = await prisma.attendant.create({
        data: {
            name,
            isOnline
        }
    });

    return reply.status(201).send(structuredData);
};

// Função para deletar um atendente logicamente
export const softDeleteAttendant = async (request, reply) => {
    const { attendantId } = request.params;

    if (!attendantId || typeof attendantId !== 'string') {
        return reply.status(400).send({ message: 'Invalid attendant ID' });
    }

    try {
        const attendant = await prisma.attendant.findUnique({
            where: { attendantId },
            select: { deletedAt: true, name: true, isOnline: true } // Seleciona campos adicionais que você pode querer retornar
        });

        if (!attendant) {
            return reply.status(404).send({ message: 'Attendant not found' });
        }

        if (attendant.deletedAt) {
            return reply.status(400).send({ message: 'The record has already been deleted previously.' });
        }

        const deletedAttendant = await prisma.attendant.update({
            where: { attendantId },
            data: { deletedAt: new Date() }
        });

        // Prepare a estrutura de retorno
        const structuredData = {
            attendantId: deletedAttendant.attendantId,
            name: deletedAttendant.name,
            isOnline: deletedAttendant.isOnline,
            deletedAt: deletedAttendant.deletedAt
        };

        return reply.status(200).send({
            message: 'Register logically deleted.',
            deletedAttendant: structuredData
        });
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};

// Função para atualizar dados de um atendente
export const patchAttendant = async (request, reply) => {
    const { attendantId } = request.params;
    const parseResult = ZAttendantSchema.partial().safeParse(request.body);

    if (!parseResult.success) {
        console.error(parseResult.error);
        return reply.status(400).send(formatErrorResponseHandler(parseResult.error));
    }

    if (parseResult.data.attendantId && parseResult.data.attendantId !== attendantId) {
        return reply.status(400).send({ message: 'Attendant ID cannot be changed.' });
    }

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
        const updatedAttendant = await prisma.attendant.update({
            where: { attendantId },
            data: {
                name: parseResult.data.name,
                isOnline: parseResult.data.isOnline,
            },
        });

        // Retorno estruturado
        const structuredData = {
            attendantId: updatedAttendant.attendantId,
            name: updatedAttendant.name,
            isOnline: updatedAttendant.isOnline,
            tokenId: updatedAttendant.tokenId,
            tokenExpiresAt: updatedAttendant.tokenExpiresAt,
            deletedAt: updatedAttendant.deletedAt // Caso você deseje retornar também
        };

        return reply.status(200).send(structuredData);
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};

// Função para gerar um novo token para um atendente
export const generateToken = async (request, reply) => {
    const { attendantId } = request.params;

    try {
        const attendant = await prisma.attendant.findUnique({
            where: { attendantId },
            select: { tokenId: true, tokenExpiresAt: true, attendantId: true } // Inclua attendantId para a resposta
        });

        if (!attendant) {
            return reply.status(404).send({ message: 'Attendant not found' });
        }

        const newTokenId = uuidv4();
        const now = new Date();
        const tokenExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas

        const updatedAttendant = await prisma.attendant.update({
            where: { attendantId },
            data: {
                tokenId: newTokenId,
                tokenExpiresAt: tokenExpiresAt
            }
        });

        // Retorno estruturado
        const structuredData = {
            attendantId: updatedAttendant.attendantId,
            tokenId: updatedAttendant.tokenId,
            tokenExpiresAt: updatedAttendant.tokenExpiresAt
        };

        return reply.status(200).send(structuredData);
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};

// Função para obter detalhes de um atendente e seu histórico de chamadas
export const getAttendantId = async (request, reply) => {
    const { attendantId } = request.params;

    try {
        const attendant = await prisma.attendant.findUnique({
            where: { attendantId },
            include: {
                calls: { // Inclui histórico de chamadas
                    select: {
                        callId: true,
                        startTime: true,
                        endTime: true,
                        status: true,
                    }
                }
            }
        });

        if (!attendant) {
            return reply.status(404).send({ message: 'Attendant not found' });
        }

        // Estrutura de dados a ser retornada
        const structuredData = {
            attendantId: attendant.attendantId,
            name: attendant.name,
            isOnline: attendant.isOnline,
            tokenId: attendant.tokenId,
            tokenExpiresAt: attendant.tokenExpiresAt,
            calls: attendant.calls // Inclui o histórico de chamadas
        };

        return reply.status(200).send(structuredData);
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};


// Função para listar todas as chamadas de um atendente específico filtradas por status
export const listCallsByStatus = async (request, reply) => {
    const { attendantId } = request.params;
    const { status } = request.query; // O status a partir dos parâmetros de consulta

    try {
        const whereConditions = { attendantId: attendantId };

        // Validação simplificada do status usando o enum
        if (status && !(status in CallStatusENUM)) {
            return reply.status(400).send({ message: 'Invalid call status.' });
        }

        if (status) {
            whereConditions.status = status; // Filtra pelo status fornecido
        }

        const calls = await prisma.call.findMany({
            where: whereConditions,
            include: { phone: true } // Inclui referências ao telefone se necessário
        });

        if (calls.length === 0) {
            return reply.status(404).send({ message: 'No calls found for this attendant.' });
        }

        const structuredData = calls.map(call => ({
            callId: call.callId,
            startTime: call.startTime,
            endTime: call.endTime,
            status: call.status,
            phoneId: call.phoneId,
        }));

        return reply.status(200).send(structuredData);
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};