import { z } from "zod";

export const CreateEnvironmentRequest = z.object({
  name: z.enum(["dev", "prod"]),
  projectId: z.string(),
});
export type CreateEnvironmentRequest = z.infer<typeof CreateEnvironmentRequest>; 