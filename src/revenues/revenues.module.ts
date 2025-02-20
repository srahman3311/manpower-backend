import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Revenue } from "./revenue.entity";
import { RevenueController } from "./revenues.controller";
import { RevenueService } from "./revenues.service";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Revenue]),
        AuthModule
    ],
    controllers: [RevenueController],
    providers: [RevenueService]
})

export class RevenueModule {}