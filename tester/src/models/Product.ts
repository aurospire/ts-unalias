import { z } from "zod";

export const Product = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number()
});

export type Product = z.infer<typeof Product>;