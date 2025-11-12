import { z } from 'zod';

export const emailSchema = z.email();
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long');

export const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = credentialsSchema;

export type SignInInput = z.infer<typeof signInSchema>;
