import { FastifyPluginAsync } from 'fastify';
import {
    searchPhoneNumber,
    deletePhone,
    getCallsByPhoneId,
    getAllPhones
} from '../controllers/phoneControler';

const phoneRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/phones/search', searchPhoneNumber); 
    fastify.delete('/phones/:phoneId', deletePhone);
    fastify.get('/phones/:phoneId/calls', getCallsByPhoneId);
    fastify.get('/phones', getAllPhones);

};

export default phoneRoutes;