import * as dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();
import { DataSource } from 'typeorm';
import { Company } from './companies/company.entity';
import { Job } from './jobs/job.entity';

export const AppDataSource = new DataSource({
  type: process.env.DATABASE_TYPE as 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  logging: true,
  entities: [Company, Job], // Include your entities here
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
});
