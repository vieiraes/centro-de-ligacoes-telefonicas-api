import prisma from "../database/prismaClient";
import { ZPersonSchema } from "../schemas/personSchema";
import { ZPhonesArraySchema } from "../schemas/phoneSchema";

// Função para listar pessoas
export const getPersons = async (request, reply) => {
    const personsWithPhones = await prisma.persons.findMany({
        include: {
            phones: {
                select: { // Selecionar apenas os campos que queremos
                    phone_id: true,
                    area: true,
                    phone_number: true,
                    person_id: true,
                    created_at: true,
                    deleted_at: true // Incluindo /campo created_at nos telefones
                }
            }
        }
    });

    const formattedResponse = personsWithPhones.map(person => ({
        person_id: person.person_id,
        name: person.name,
        tax_id: person.tax_id,
        created_at: person.created_at, // Incluindo created_at da pessoa
        phones: person.phones.map(phone => ({
            phone_id: phone.phone_id,
            area: phone.area,
            phone_number: phone.phone_number,
            person_id: phone.person_id,
            created_at: phone.created_at,
            deleted_at: phone.deleted_at // Incluindo created_at do telefone
        }))
    }));

    return reply.status(200).send(formattedResponse);
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
            phones: {
                create: phones.map(phone => ({
                    area: phone.area,
                    phone_number: phone.phone_number
                }))
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
        return reply.status(400).send(parseResult.error);
    }
    const { phones } = parseResult.data;
    const personId = request.params.personId;


    // Filtrar telefones existentes para verificar unicidade
    const existingPhones = await prisma.phones.findMany({
        where: { person_id: personId },
        select: { phone_number: true } // Apenas obtenha o número do telefone
    });
    const existingPhoneNumbers = new Set(existingPhones.map(phone => phone.phone_number));


    const phonesToInsert = [];

    for (const phone of phones) {
        // Verificar se o telefone já existe para a pessoa
        if (!existingPhoneNumbers.has(phone.phone_number)) {
            phonesToInsert.push({
                area: phone.area,
                phone_number: phone.phone_number,
                person_id: personId // Associar ao personId
            });
        }
    }

    // Insere os telefones que não existem ainda
    if (phonesToInsert.length > 0) {
        await prisma.phones.createMany({
            data: phonesToInsert,
            skipDuplicates: true // Ignora se houver algumas duplicatas devido a outra verificação
        });
    }
    return reply.status(201).send({
        message: 'Telefones adicionados com sucesso.',
        phonesToInsert
    });
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