import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "qwer",
  port: 5432,
});

pool.connect()
  .then(() => console.log("Conectou!"))
  .catch(err => console.error("Erro:", err));