import { Pool } from "pg";

export const db = new Pool({
  user: "postgres",
  host: "localhost",
  database: "projeto-confeccao",
  password: "qwer",
  port: 5432,
});