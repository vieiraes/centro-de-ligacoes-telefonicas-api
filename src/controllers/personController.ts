import prisma from "../database/prismaClient";
import { ZPersonSchema } from "../schemas/personSchema";
import { ZPhonesArraySchema } from "../schemas/phoneSchema";
import { formatErrorResponse } from "../handlers/errorHandler"

// Função para listar pessoas
export const getPersons = async (request, reply) => {
    try {
        const personsWithPhones = await prisma.person.findMany({
            include: {
                phones: {
                    select: {
                        phoneId: true,
                        area: true,
                        phoneNumber: true,
                        createdAt: true,
                        deletedAt: true,
                    }
                }
            }
        });

        if (personsWithPhones.length === 0) {
            return reply.status(404).send({ message: 'No person found' });
        }

        const formattedResponse = personsWithPhones.map(person => ({
            personId: person.personId,
            name: person.name,
            taxId: person.taxId,
            createdAt: person.createdAt,
            deletedAt: person.deletedAt,
            phones: person.phones.map(phone => ({
                phoneId: phone.phoneId,
                area: phone.area,
                phoneNumber: phone.phoneNumber,
            }))
        }));

        return reply.status(200).send(formattedResponse);
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};

// Função para criar uma nova pessoa
export const createPerson = async (request, reply) => {
    const parseResult = ZPersonSchema.safeParse(request.body);

    if (!parseResult.success) {
        console.error(parseResult.error);
        return reply.status(400).send(formatErrorResponse(parseResult.error)); // Formata a resposta de erro
    }

    const { name, taxId, phones } = parseResult.data;

    // Validação para permitir até 5 números de telefone e checar duplicatas
    if (phones.length > 5) {
        return reply.status(400).send({ error: "Você pode adicionar no máximo 5 números de telefone." });
    }

    const uniquePhones = new Set();
    const validPhones = [];
    const duplicatePhones = [];

    for (const phone of phones) {
        if (uniquePhones.has(phone.phoneNumber)) {
            duplicatePhones.push(phone.phoneNumber);
        } else {
            uniquePhones.add(phone.phoneNumber);
            validPhones.push({
                area: phone.area,
                phoneNumber: phone.phoneNumber
            });
        }
    }

    if (duplicatePhones.length > 0) {
        return reply.status(400).send({ error: "The following numbers are duplicated: " + duplicatePhones.join(", ") });
    }

    const returnData = await prisma.person.create({
        data: {
            name,
            taxId,
            phones: {
                create: validPhones
            }
        },
        include: { phones: true }
    });

    return reply.status(201).send(returnData);
};

// Função para adicionar telefones a uma pessoa
export const addPhonesToPerson = async (request, reply) => {
    const parseResult = ZPhonesArraySchema.safeParse(request.body);

    if (!parseResult.success) {
        console.error(parseResult.error);
        return reply.status(400).send(formatErrorResponse(parseResult.error)); // Formata a resposta de erro
    }

    const { phones } = parseResult.data;
    const personId = request.params.personId;

    const existingPhones = await prisma.phone.findMany({
        where: { personId: personId },
        select: { phoneNumber: true }
    });

    const existingPhoneNumbers = new Set(existingPhones.map(phone => phone.phoneNumber));

    const phonesToInsert = [];
    for (const phone of phones) {
        if (!existingPhoneNumbers.has(phone.phoneNumber)) {
            phonesToInsert.push({
                area: phone.area,
                phoneNumber: phone.phoneNumber
            });
        }
    }

    const insertedPhones = [];
    for (const phone of phonesToInsert) {
        const insertedPhone = await prisma.phone.create({
            data: {
                area: phone.area,
                phoneNumber: phone.phoneNumber,
                personId: personId
            }
        });
        insertedPhones.push(insertedPhone);
    }

    return reply.status(201).send({ phonesNumbers: insertedPhones });
};

// Função para deletar uma pessoa logicamente
export const deletePerson = async (request, reply) => {
    const { personId } = request.params;

    try {
        // Busca a pessoa para verificar se já foi deletada
        const person = await prisma.person.findUnique({
            where: { personId: personId },
            select: { deletedAt: true } // Somente selecionando o campo deletedAt
        });

        if (!person) {
            return reply.status(404).send({ message: 'Person not found' }); // Se a pessoa não existir
        }

        if (person.deletedAt) {
            // Se já foi deletada anteriormente
            return reply.status(400).send({ message: 'The record has already been deleted previously.' });
        }

        // Soft delete
        const deletedPerson = await prisma.person.update({
            where: { personId: personId },
            data: { deletedAt: new Date() }
        });

        return reply.status(200).send({
            message: 'Register logically deleted.',
            deletedPerson
        });
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};

// Função para obter uma pessoa pelo ID
export const getPersonId = async (request, reply) => {
    const { personId } = request.params;

    try {
        const person = await prisma.person.findUnique({
            where: { personId: personId },
            include: {
                phones: {
                    select: {
                        phoneId: true,
                        area: true,
                        phoneNumber: true,
                        createdAt: true,
                        deletedAt: true
                    }
                }
            }
        });

        if (!person) {
            return reply.status(404).send({ message: 'Person not found' });
        }

        return reply.status(200).send({
            personId: person.personId,
            name: person.name,
            taxId: person.taxId,
            createdAt: person.createdAt,
            deletedAt: person.deletedAt,
            phones: person.phones.map(phone => ({
                phoneId: phone.phoneId,
                area: phone.area,
                phoneNumber: phone.phoneNumber,
                createdAt: phone.createdAt,
                deletedAt: phone.deletedAt
            }))
        });
    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
};