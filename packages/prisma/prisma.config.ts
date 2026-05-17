import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const withPublicSchema = (databaseUrl?: string) => {
  if (!databaseUrl || /[?&]schema=/.test(databaseUrl)) {
    return databaseUrl;
  }

  return `${databaseUrl}${databaseUrl.includes('?') ? '&' : '?'}schema=public`;
};

const databaseUrl = withPublicSchema(process.env['DATABASE_URL']);
const shadowDatabaseUrl = withPublicSchema(process.env['SHADOW_DATABASE_URL']);

export default defineConfig({
  schema: './schema.prisma',
  migrations: {
    path: './migrations',
  },
  datasource: {
    url: databaseUrl,
    shadowDatabaseUrl: shadowDatabaseUrl === databaseUrl ? undefined : shadowDatabaseUrl,
  },
});
