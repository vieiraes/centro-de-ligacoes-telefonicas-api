import { z } from 'zod';

export const ZPhoneSchema = z.object({
    area: z.string().length(2).transform(val => val.toUpperCase()),
    phone_number: z.string().length(9)
});

export const ZPhonesArraySchema = z.object({
    phones: z.array(ZPhoneSchema)
});