import { FastifyPluginAsync } from 'fastify';
import {
    searchPhoneNumber,
    deletePhone,
    getCallsByPhoneId
} from '../controllers/phoneControler';

const phoneRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/phones/search', searchPhoneNumber); // Rota para pesquisar número de telefone
    fastify.delete('/phones/:phoneId', deletePhone); // Rota para deletar telefone por phoneId
    fastify.get('/phones/:phoneId/calls', getCallsByPhoneId); // Rota para obter chamadas por phoneId
};

export default phoneRoutes;