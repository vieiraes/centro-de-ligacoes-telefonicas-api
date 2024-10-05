import { PrismaClient } from "@prisma/client"
import fastify from "fastify"
import { z, ZodAny, ZodSchema } from 'zod'


const app = fastify();
const prisma = new PrismaClient()


app.get('/persons', async (request, reply) => {
    const personsWithPhones = await prisma.persons.findMany({
        include: {
            phones: true, // Incluir telefones associados a cada pessoa
        },
    });

    return reply.status(200).send(personsWithPhones);
});

app.post('/persons', async (request, reply) => {
    // Define os esquemas de validação
    const ZPhoneSchema = z.object({ //sempre tenho que chamar o z.object
        area: z.string().length(2).toUpperCase(),
        phone_number: z.string().length(9)
    })

    const ZPersonSchema = z.object({
        name: z.string().min(1),
        tax_id: z.string().length(11),
        phones: z.array(ZPhoneSchema)
    })
    //valida os dados do corpo da requisicao
    const parseResult = ZPersonSchema.safeParse(request.body);

    if (!parseResult.success) {
        console.error(parseResult.error);
        return reply.status(400).send(parseResult.error);
    }

    const { name, tax_id, phones } = parseResult.data

    //cadastrar usuario no banco
    const returnData = await prisma.persons.create({
        data: {
            name,
            tax_id,
            phones: {
                create: phones.map(phone => ({
                    area: phone.area,
                    phone_number: phone.phone_number,
                })),
            },

        },
        include: {
            phones: true //para retornar os tenefones cadastrados
        }
    })
    return reply.status(201).send(returnData)
})


app.post('/persons/:personId/phones', async (request, reply) => {
    // Define o schema para validação de telefones
    const ZPhoneSchema = z.object({
        area: z.string().length(2).transform(val => val.toUpperCase()), // Area deve ser em caixa alta
        phone_number: z.string().length(9), // Número do telefone deve ter comprimento fixo
    });

    const ZPhonesArraySchema = z.object({
        phones: z.array(ZPhoneSchema)
    });

    // Valida os dados do corpo da requisição
    const parseResult = ZPhonesArraySchema.safeParse(request.body);
    if (!parseResult.success) {
        // Retorna um erro se a validação falhar
        return reply.status(400).send(parseResult.error);
    }

    const { phones } = parseResult.data;
    const personId = request.params.personId; // Obtém o ID da pessoa a partir da rota

    // Array para armazenar números de telefone que serão inseridos
    const phonesToInsert = new Set();

    // Filtra os números de telefone duplicados
    for (const phone of phones) {
        const uniqueKey = `${phone.area}-${phone.phone_number}`; // Cria uma chave única
        if (!phonesToInsert.has(uniqueKey)) {
            phonesToInsert.add(uniqueKey);
        }
    }
    // Insere os telefones no banco de dados
    const createdPhones = await prisma.phones.createMany({
        data: Array.from(phonesToInsert).map(key => {
            const [area, phone_number] = key.split('-');
            return { area, phone_number};
        }),
        skipDuplicates: true // Ignora duplicatas
    });

    return reply.status(201).send({
        message: 'Telefones adicionados com sucesso.',
        createdPhones,
    });
});








app.delete('/persons/:personId', async (request, reply) => {
    const { personId } = request.params;

    // Marcar como deletado
    const deletedPerson = await prisma.persons.update({
        where: { person_id: personId },
        data: { deleted_at: new Date() },  // Definindo a data de deleção
    });

    return reply.status(200).send({
        message: 'Pessoa deletada logicamente.',
        deletedPerson,
    });
});


app.listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3355
}).then(() => {
    console.log(`Http server running @ port:${String(process.env.PORT)}.`)
})