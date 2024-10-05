import { FastifyReply, FastifyRequest } from 'fastify';

export const authEmailMiddleware = (request: FastifyRequest, reply: FastifyReply, done: Function) => {
    // O valor do cabeçalho pode ser string ou undefined, por isso definimos um tipo condicional
    const authEmail: string | undefined = request.headers['x-auth-email'] as string | undefined;

    if (!authEmail) {
        return reply.status(401).send({ message: 'Email token required' });
    }

    // Obter lista de emails válidos do ambiente
    const validEmails = process.env.X_AUTH_EMAIL ? process.env.X_AUTH_EMAIL.split(',') : [];

    // Verifica se o email está na lista de válidos
    if (!validEmails.includes(authEmail)) {
        return reply.status(403).send({ message: 'Invalid email token' }); // 403 Forbidden
    }

    done(); // Chama done() para continuar para a próxima função
};