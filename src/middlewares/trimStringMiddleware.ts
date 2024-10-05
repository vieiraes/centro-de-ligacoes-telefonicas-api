import { FastifyPluginAsync } from 'fastify';

const trimStringMiddleware: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('preValidation', async (request, reply) => {
        if (request.body && typeof request.body === 'object') {
            // Função para fazer trim em todos os valores string do objeto
            const trimValues = (obj: Record<string, any>) => {
                Object.keys(obj).forEach(key => {
                    if (typeof obj[key] === 'string') {
                        obj[key] = obj[key].trim(); // Remove espaços no início e no final
                    } else if (typeof obj[key] === 'object') {
                        trimValues(obj[key]); // Recursão para objetos aninhados
                    }
                });
            };

            trimValues(request.body);
        }
    });
};

export default trimStringMiddleware;