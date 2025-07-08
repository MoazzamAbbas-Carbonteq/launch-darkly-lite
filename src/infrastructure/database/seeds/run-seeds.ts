import "reflect-metadata";
import { AppDataSource } from "../DataSource.config";
import { seedInitialData } from "./initial-data";

async function runSeeds() {
  try {
    console.log('🔗 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    console.log('🌱 Running initial data seeds...');
    await seedInitialData();
    console.log('✅ All seeds completed successfully');

  } catch (error) {
    console.error('❌ Error running seeds:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the seeds
runSeeds(); 