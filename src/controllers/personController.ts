import prisma from "../database/prismaClient";
import { ZPersonSchema } from "../schemas/personSchema";
import { ZPhonesArraySchema } from "../schemas/phoneSchema";

// Função para listar pessoas
export const getPersons = async (request, reply) => {
    const personsWithPhones = await prisma.persons.findMany({
        include: { phones: true }
    });
    return reply.status(200).send(personsWithPhones);
};

// Função para criar uma nova pessoa
export const createPerson = async (request, reply) => {
    const parseResult = ZPersonSchema.safeParse(request.body);
    if (!parseResult.success) {
        console.error(parseResult.error);
        return reply.status(400).send(parseResult.error);
    }
    const { name, tax_id, phones } = parseResult.data;

    const returnData = await prisma.persons.create({
        data: {
            name,
            tax_id,
            phones: { create: phones.map(phone => ({ area: phone.area, phone_number: phone.phone_number })) }
        },
        include: { phones: true }
    });
    return reply.status(201).send(returnData);
};

// Função para adicionar telefones a uma pessoa
export const addPhonesToPerson = async (request, reply) => {
    const parseResult = ZPhonesArraySchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.status(400).send(parseResult.error);
    }
    const { phones } = parseResult.data;
    const personId = request.params.personId;

    const phonesToInsert = new Set();
    for (const phone of phones) {
        const uniqueKey = `${phone.area}-${phone.phone_number}`;
        if (!phonesToInsert.has(uniqueKey)) phonesToInsert.add(uniqueKey);
    }
    
    const createdPhones = await prisma.phones.createMany({
        data: Array.from(phonesToInsert).map(key => {
            const [area, phone_number] = key.split('-');
            return { area, phone_number, person_id: personId };
        }),
        skipDuplicates: true
    });
    return reply.status(201).send({ message: 'Telefones adicionados com sucesso.', createdPhones });
};

// Função para deletar uma pessoa logicamente
export const deletePerson = async (request, reply) => {
    const { personId } = request.params;
    const deletedPerson = await prisma.persons.update({
        where: { person_id: personId },
        data: { deleted_at: new Date() }
    });
    return reply.status(200).send({ message: 'Pessoa deletada logicamente.', deletedPerson });
};