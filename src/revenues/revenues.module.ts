import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Revenue } from "./revenue.entity";
import { RevenueController } from "./revenues.controller";
import { RevenueService } from "./revenues.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Revenue])
    ],
    controllers: [RevenueController],
    providers: [RevenueService]
})

export class RevenueModule {}