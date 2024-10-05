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
    fastify.get('/persons', { preHandler: authEmailMiddleware }, getPersons); // Adicionando o middleware
    fastify.post('/persons', { preHandler: authEmailMiddleware },createPerson);
    fastify.post('/persons/:personId/phones', { preHandler: authEmailMiddleware }, addPhonesToPerson);
    fastify.delete('/persons/:personId', { preHandler: authEmailMiddleware }, deletePerson);
    fastify.get('/persons/:id', { preHandler: authEmailMiddleware }, getPersonId); // Adicionando o middleware
};

export default personRoutes;

