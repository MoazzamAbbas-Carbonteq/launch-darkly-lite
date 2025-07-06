import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "../config";
import { User } from "../entities/User.entity";
import { Flag } from "../entities/Flag.entity";
import { FeatureFlag } from "../entities/FeatureFlag.entity";
import { FlagRule } from "../entities/FlagRule.entity";
import { FlagCondition } from "../entities/FlagCondition.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  synchronize: config.nodeEnv === "development", // Only in development
  logging: config.nodeEnv === "development",
  entities: [User, Flag, FeatureFlag, FlagRule, FlagCondition],
  migrations: ["src/database/migrations/*.ts"],
  subscribers: ["src/database/subscribers/*.ts"],
}); 