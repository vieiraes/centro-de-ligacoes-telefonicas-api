import { FastifyPluginAsync } from 'fastify';
import {
    getPersons,
    createPerson,
    addPhonesToPerson,
    deletePerson
} from '../controllers/personController';

const personRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/persons', getPersons);
    fastify.post('/persons', createPerson);
    fastify.post('/persons/:personId/phones', addPhonesToPerson);
    fastify.delete('/persons/:personId', deletePerson);
};

export default personRoutes;