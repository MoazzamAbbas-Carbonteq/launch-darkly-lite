import { z } from "zod";

export const CreateEvaluationRuleRequest = z.object({
  flagId: z.string(),
  targetType: z.enum(["user", "role"]),
  targetKey: z.string(),
  operator: z.enum(["=", "!=", "contains"]),
  value: z.string(),
});
export type CreateEvaluationRuleRequest = z.infer<typeof CreateEvaluationRuleRequest>; 