# Médiathèque

Next.js 15 + Prisma (SQLite) + Bootstrap 5.

## Installation

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

Application sur http://localhost:3000
Base de données : `prisma/dev.db` (visualisable avec `npx prisma studio`).
