import { sql } from 'drizzle-orm';

export const up = async (db) => {
  // Apagar a tabela 'goals' se ela existir
  await db.execute(sql`DROP TABLE IF EXISTS goals CASCADE`);
};

export const down = async (db) => {
  // Criar a tabela 'goals' novamente se for feito rollback
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "goals" (
      "id" text PRIMARY KEY NOT NULL,
      "title" text NOT NULL,
      "desired_weekly_frequency" integer NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `);
};
