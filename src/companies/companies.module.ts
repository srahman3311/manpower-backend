import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { Company } from "./company.entity";
import { CompanyService } from "./companies.service";
import { CompanyController } from "./companies.controller";
import { AddressModule } from "src/global/addresses/addresses.module";

@Module({
    imports: [TypeOrmModule.forFeature([Company]), AuthModule, AddressModule],
    controllers: [CompanyController],
    providers: [CompanyService]
})

export class CompanyModule {}