import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './companies/companies.module';
import { JobModule } from './jobs/jobs.module';
import { AgentModule } from './agents/agents.module';
import { UserModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true // Make ConfigModule globally available
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], 
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<"mysql">("DATABASE_TYPE"),
        host: configService.get<string>("DATABASE_HOST"),
        port: configService.get<number>("DATABASE_PORT"),
        username: configService.get<string>("DATABASE_USERNAME"),
        password: configService.get<string>("DATABASE_PASSWORD"),
        database: configService.get<string>("DATABASE_NAME"),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>("TYPEORM_SYNCHRONIZE"),
        migrations: [__dirname + "/migrations/**/*{.ts, .js}"]
      })
    }),
    AuthModule,
    CompanyModule,
    AgentModule,
    JobModule,
    UserModule
  ]
})

export class AppModule {}
