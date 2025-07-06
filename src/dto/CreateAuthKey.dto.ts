import { z } from "zod";

export const CreateAuthKeyRequest = z.object({
  key: z.string(),
  environmentId: z.string(),
  permissions: z.string(),
});
export type CreateAuthKeyRequest = z.infer<typeof CreateAuthKeyRequest>; 