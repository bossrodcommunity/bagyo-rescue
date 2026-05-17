export type EnvConfig = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  APP_AUTH_ACCESS_TOKEN_SECRET: string;
  APP_AUTH_REFRESH_TOKEN_SECRET: string;
};

function getRequiredEnv(name: keyof EnvConfig) {
  const value = Deno.env.get(name)?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getEnvConfig(): EnvConfig {
  return {
    SUPABASE_URL: getRequiredEnv('SUPABASE_URL'),
    SUPABASE_ANON_KEY: getRequiredEnv('SUPABASE_ANON_KEY'),
    SUPABASE_SERVICE_ROLE_KEY: getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    APP_AUTH_ACCESS_TOKEN_SECRET: getRequiredEnv('APP_AUTH_ACCESS_TOKEN_SECRET'),
    APP_AUTH_REFRESH_TOKEN_SECRET: getRequiredEnv('APP_AUTH_REFRESH_TOKEN_SECRET'),
  };
}
