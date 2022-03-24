module.exports = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV,
  DB: {
    PGHOST: process.env.PGHOST || process.env.DATABASE_URL,
    PGUSER: process.env.PGUSER,
    PGDATABASE: process.env.PGDATABASE,
    PGPASSWORD: process.env.PGPASSWORD,
    PGPORT: process.env.PGPORT
  },
  SESSION_SECRET: process.env.SESSION_SECRET,
  OAUTH2: {
    GOOGLE: {
      CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL
    }
  }
}