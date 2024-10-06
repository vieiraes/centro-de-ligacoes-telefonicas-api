import { z } from 'zod';
import { ZPhoneSchema } from './phoneSchema';

export const ZPersonSchema = z.object({
    name: z.string().min(1),
    taxId: z.string().length(11),
    phones: z.array(ZPhoneSchema)
});