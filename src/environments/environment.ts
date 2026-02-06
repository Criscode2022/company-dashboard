export const environment = {
  production: false,
  neonAuthUrl: 'https://ep-wispy-lake-aii6akyc.neonauth.c-4.us-east-1.aws.neon.tech/neondb/auth',
  // Use proxy for local development to avoid CORS
  databaseUrl: '/api',
  databaseSchema: 'public',
  apiKey: '' // Add your Neon API key here if not using proxy
};