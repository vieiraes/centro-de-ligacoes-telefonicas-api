import { PrismaClient } from "@prisma/client"
import fastify from "fastify"
import { z } from 'zod'


const app = fastify();

const prisma = new PrismaClient()


app.get('/pessoas', async () => {

    const pessoas = await prisma.pessoa.findMany()

    return { pessoas }
})



app.post('/pessoas', async (request, reply) => {

    //validacao
    const createUserSchema = z.object({
        nome: z.string(),
        telefone: z.string(),
        email: z.string().email()
    })

    const { nome, telefone, email } = createUserSchema.parse(request.body)

    //cadastrar usuario no banco

    const returno = await prisma.pessoa.create({
        data: {
            nome, telefone, email
        }
    })

    return reply.status(201).send(returno)



})


app.listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3344
}).then(() => {
    console.log('HTTP SERVER RUNNING.')
})