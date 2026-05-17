import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().trim().url(),
  SUPABASE_ANON_KEY: z.string().trim().min(1),
});

export const getEnvConfig = () =>
  envSchema.parse({
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  });

export type EnvConfig = z.infer<typeof envSchema>;
