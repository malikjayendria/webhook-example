import { DataSource } from "typeorm";
import { env } from "./env";
import { EventEntity } from "../domain/event.entity";
import { GuestProfile } from "../domain/guest_profile.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.pass,
  database: env.db.name,
  entities: [EventEntity, GuestProfile],
  migrations: ["src/db/migrations/*.ts"],
  synchronize: false,
  logging: false,
});
