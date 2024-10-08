import { FastifyInstance } from 'fastify';
import {
    openCall,
    closeCall,
} from 'src/controllers/callController';

const callRoutes = async (fastify: FastifyInstance) => {
    fastify.post('/calls/open', openCall);
    fastify.post('/calls/:callId/close', closeCall);
};

export default callRoutes;