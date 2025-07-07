import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "../config/Server.config";
import { UserModel } from "../models/User.model";
import { FlagModel } from "../models/Flag.model";
import { FeatureFlagModel } from "../models/FeatureFlag.model";
import { FlagRuleModel } from "../models/FlagRule.model";
import { FlagConditionModel } from "../models/FlagCondition.model";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  synchronize: config.nodeEnv === "development", // Only in development
  logging: config.nodeEnv === "development",
  entities: [UserModel, FlagModel, FeatureFlagModel, FlagRuleModel, FlagConditionModel],
  // migrations: config.nodeEnv === "development" 
  //   ? ["src/database/migrations/*.ts"]
  //   : ["dist/database/migrations/*.js"],
  // subscribers: config.nodeEnv === "development"
  //   ? ["src/database/subscribers/*.ts"]
  //   : ["dist/database/subscribers/*.js"],
}); 