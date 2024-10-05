import { FastifyPluginAsync } from 'fastify';
import { authEmailMiddleware } from '../middlewares/authEmailMiddleware'; // Importando o middleware

import {
    getPersons,
    createPerson,
    addPhonesToPerson,
    deletePerson
} from '../controllers/personController';

const personRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/persons', { preHandler: authEmailMiddleware }, getPersons); // Adicionando o middleware
    fastify.post('/persons', createPerson);
    fastify.post('/persons/:personId/phones', addPhonesToPerson);
    fastify.delete('/persons/:personId', deletePerson);
};

export default personRoutes;

