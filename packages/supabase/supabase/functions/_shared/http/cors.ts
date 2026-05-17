export function getDefaultCorsConfig() {
  return {
    origin: '*',
    allowHeaders: ['Authorization', 'Content-Type', 'apikey', 'x-client-info'],
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  };
}
