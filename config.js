module.exports = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_DOMAIN: process.env.FRONTEND_DOMAIN,
  DB: {
    URL: process.env.DATABASE_URL,
    PGHOST: process.env.PGHOST,
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
    },
    FACEBOOK: {
      CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
      CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
      CALLBACK_URL: process.env.FACEBOOK_CALLBACK_URL
    }
  },
  STRIPE: {
    CLIENT_SECRET: process.env.STRIPE_CLIENT_SECRET,
    WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
  }
}