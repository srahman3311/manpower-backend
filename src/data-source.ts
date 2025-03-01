import * as dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Tenant } from './tenants/tenant.entity';
import { Address } from './global/addresses/address.entity';
import { Role } from './users/entities/role.entity';
import { Permission } from './users/entities/permission.entity';

// Make sure all the related entities are also included in the entities field.
// For example if you want to run a migration (e.g. add a new column) on User
// entity all the related entities must also be included like Tenant, Address etc.

// logging: true is only needed if you want to log the migration to console. For
// example when you run npm run migration:generate command then full migration
// operation will be logged to the console. 
export const AppDataSource = new DataSource({
  type: process.env.DATABASE_TYPE as 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Tenant, Address, Role, Permission],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
});
