import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/launch_darkly_lite",
  synchronize: false,
  logging: true,
  entities: ["src/entities/*.ts"],
  migrations: ["src/database/migrations/*.ts"],
  subscribers: ["src/database/subscribers/*.ts"],
}); 