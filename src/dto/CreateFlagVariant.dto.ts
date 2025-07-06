import { z } from "zod";

export const CreateFlagVariantRequest = z.object({
  flagId: z.string(),
  environmentId: z.string(),
  enabled: z.boolean(),
  defaultValue: z.string(),
});
export type CreateFlagVariantRequest = z.infer<typeof CreateFlagVariantRequest>; 