import { FastifyInstance } from 'fastify';
import {
    createAttendant,
    softDeleteAttendant,
    patchAttendant,
    getAttendants,
    generateToken,
    getAttendantId,
    listCallsByStatus
} from 'src/controllers/attendantControlller';

const attendantRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/attendants', getAttendants);
    fastify.post('/attendants', createAttendant);
    fastify.delete('/attendants/:attendantId', softDeleteAttendant);
    fastify.patch('/attendants/:attendantId', patchAttendant);
    fastify.get('/attendants/:attendantId/token', generateToken);
    fastify.get('/attendants/:attendantId', getAttendantId);
    fastify.get('/attendants/:attendantId/calls', listCallsByStatus);
};

export default attendantRoutes;