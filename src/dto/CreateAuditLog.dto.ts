import { z } from "zod";

export const CreateAuditLogRequest = z.object({
  userId: z.string(),
  flagId: z.string(),
  action: z.string(),
  metadata: z.string(),
});
export type CreateAuditLogRequest = z.infer<typeof CreateAuditLogRequest>; 