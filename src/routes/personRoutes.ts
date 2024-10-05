import { FastifyPluginAsync } from 'fastify';
import { authEmailMiddleware } from '../middlewares/authEmailMiddleware'; // Importando o middleware

import {
    getPersons,
    createPerson,
    addPhonesToPerson,
    deletePerson,
    getPersonId
} from '../controllers/personController';

const personRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/persons', { preHandler: authEmailMiddleware }, getPersons);
    fastify.post('/persons', { preHandler: authEmailMiddleware },createPerson);
    fastify.post('/persons/:personId/phones', { preHandler: authEmailMiddleware }, addPhonesToPerson);
    fastify.delete('/persons/:personId', { preHandler: authEmailMiddleware }, deletePerson);
    fastify.get('/persons/:personId', { preHandler: authEmailMiddleware }, getPersonId); 
};

export default personRoutes;

