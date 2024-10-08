import prisma from "../database/prismaClient";
import { ZPhonesArraySchema } from "../schemas/phoneSchema";

// Função para pesquisar telefones por número
export const searchPhoneNumber = async (request, reply) => {
    const { phoneNumber } = request.query;

    if (!phoneNumber) {
        return reply.status(400).send({ message: 'Phone number is required.' });
    }

    try {
        const phones = await prisma.phone.findMany({
            where: { phoneNumber: phoneNumber },
            include: { person: true } // Incluindo as pessoas associadas ao telefone
        });

        if (phones.length === 0) {
            return reply.status(404).send({ message: 'No phone number found.' });
        }

        // Estrutura de dados organizada
        const structuredData = phones.map(phone => ({
            phoneId: phone.phoneId,
            area: phone.area,
            phoneNumber: phone.phoneNumber,
            createdAt: phone.createdAt,
            deletedAt: phone.deletedAt,
            person: phone.person // Inclui as informações da pessoa associada
        }));

        return reply.status(200).send(structuredData); // Retorna a estrutura organizada
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};

// Função para deletar um phone pelo phoneId
export const deletePhone = async (request, reply) => {
    const { phoneId } = request.params;

    try {
        // Verifica se o telefone existe antes de deletar
        const phone = await prisma.phone.findUnique({
            where: { phoneId: phoneId },
            include: { calls: true } // Incluindo chamadas associadas para garantir que não sejam removidas
        });

        if (!phone) {
            return reply.status(404).send({ message: 'phoneId not found.' });
        }

        // Delete apenas o telefone
        const deletedPhone = await prisma.phone.delete({
            where: { phoneId: phoneId }
        });

        // Estrutura de dados organizada
        const structuredData = {
            message: 'Phone number deleted successfully.',
            phoneId: deletedPhone.phoneId,
            area: deletedPhone.area,
            phoneNumber: deletedPhone.phoneNumber,
            deletedAt: new Date(), // Adiciona a data de deleção
        };

        return reply.status(200).send(structuredData); // Retorna a estrutura organizada
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};

// Função para abrir um phoneId e retornar todas as calls
export const getCallsByPhoneId = async (request, reply) => {
    const { phoneId } = request.params;

    try {
        const phone = await prisma.phone.findUnique({
            where: { phoneId: phoneId },
            include: { calls: true } // Incluindo as calls associadas ao telefone
        });

        if (!phone) {
            return reply.status(404).send({ message: 'phoneId not found.' });
        }

        // Estrutura de dados organizada
        const structuredData = {
            phoneId: phone.phoneId,
            area: phone.area,
            phoneNumber: phone.phoneNumber,
            calls: phone.calls // Inclui o histórico de chamadas
        };

        return reply.status(200).send(structuredData); // Retorna a estrutura organizada
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};


// Função para listar todos os telefones
export const getAllPhones = async (request, reply) => {
    try {
        const phones = await prisma.phone.findMany({
            include: { person: true } // Inclui as pessoas associadas aos telefones
        });

        if (phones.length === 0) {
            return reply.status(404).send({ message: 'No phones found.' });
        }

        // Estrutura de dados organizada
        const structuredData = phones.map(phone => ({
            phoneId: phone.phoneId,
            area: phone.area,
            phoneNumber: phone.phoneNumber,
            createdAt: phone.createdAt,
            deletedAt: phone.deletedAt,
            person: phone.person // Inclui informações da pessoa associada
        }));

        return reply.status(200).send(structuredData); // Retorna a estrutura organizada
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};