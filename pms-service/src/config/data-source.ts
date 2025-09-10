import { DataSource } from "typeorm";
import { env } from "./env";
import { Guest } from "../domain/guest.entity";
import { Reservation } from "../domain/reservation.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.pass,
  database: env.db.name,
  entities: [Guest, Reservation],
  migrations: ["src/db/migrations/*.ts"],
  synchronize: false, // gunakan migration, bukan sync otomatis
  logging: false,
});
