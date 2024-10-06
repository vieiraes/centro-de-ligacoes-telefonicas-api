import prisma from "../database/prismaClient";
import { ZPhonesArraySchema } from "../schemas/phoneSchema";

// Função para pesquisar telefones por number
export const searchPhoneNumber = async (request, reply) => {
    const { phoneNumber } = request.query; // Supondo que você vai passar o phoneNumber como query param

    if (!phoneNumber) {
        return reply.status(400).send({ message: 'Phone number is required.' });
    }

    const phones = await prisma.phone.findMany({
        where: { phoneNumber: phoneNumber },
        include: { person: true } // Incluindo as pessoas associadas ao telefone
    });

    if (phones.length === 0) {
        return reply.status(404).send({ message: 'No phone number found.' });
    }

    return reply.status(200).send(phones);
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
            return reply.status(404).send({ message: 'Phone not found.' });
        }

        // Delete apenas o telefone
        const deletedPhone = await prisma.phone.delete({
            where: { phoneId: phoneId }
        });

        return reply.status(200).send({
            message: 'Phone number deleted successfully.',
            deletedPhone
        });
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
            return reply.status(404).send({ message: 'Phone not found.' });
        }

        return reply.status(200).send({
            phoneId: phone.phoneId,
            area: phone.area,
            phoneNumber: phone.phoneNumber,
            calls: phone.calls
        });
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};