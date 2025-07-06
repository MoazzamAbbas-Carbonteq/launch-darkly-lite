import { z } from "zod";

export const CreateFlagRequest = z.object({
  name: z.string(),
  key: z.string(),
  description: z.string().optional(),
  projectId: z.string(),
});
export type CreateFlagRequest = z.infer<typeof CreateFlagRequest>; 