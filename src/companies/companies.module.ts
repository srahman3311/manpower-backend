import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { Company } from "./companies.entity";
import { CompanyService } from "./companies.service";
import { CompanyController } from "./companies.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Company]), AuthModule],
    controllers: [CompanyController],
    providers: [CompanyService]
})

export class CompanyModule {}