import * as dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();
import { DataSource } from 'typeorm';
import { Passenger } from './passengers/entities/passenger.entity';
import { User } from './users/entities/user.entity';
import { Job } from './jobs/job.entity';
import { Medical } from './passengers/entities/medical.entity';
import { Passport } from './passengers/entities/passport.entity';
import { Flight } from './passengers/entities/flight.entity';
import { Expense } from './expenses/expense.entity';
import { Revenue } from './revenues/revenue.entity';
import { Agent } from './agents/agent.entity';
import { Tenant } from './tenants/tenant.entity';
import { Address } from './global/addresses/address.entity';
import { Company } from './companies/company.entity';
import { Role } from './users/entities/role.entity';
import { Permission } from './users/entities/permission.entity';
import { Account } from './accounts/account.entity';
import { Transaction } from './transactions/transaction.entity';

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
  entities: [
    User, 
    Passenger, 
    Tenant, 
    Address, 
    Agent, 
    Job, 
    Medical, 
    Passport, 
    Flight,
    Company,
    Expense,
    Revenue,
    Role,
    Permission,
    Account,
    Transaction
  ],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
});
