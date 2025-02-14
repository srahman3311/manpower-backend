import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TenantController } from "./tenants.controller";
import { TenantService } from "./tenants.service";
import { Tenant } from "./tenant.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Tenant])],
    controllers: [TenantController],
    providers: [TenantService],
    exports: [TenantService]
})

export class TenantModule {}