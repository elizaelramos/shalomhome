const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  apps: [
    {
      name: 'shalomhome',
      script: 'npm',
      args: 'start',
      cwd: path.resolve(__dirname),
      env_production: {
        NODE_ENV: 'production',
        PORT: 3008,
        DATABASE_URL: process.env.DATABASE_URL,
        NEXTAUTH_URL: 'https://shalomhome.projetoestrategico.app',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      },
    },
  ],
};
