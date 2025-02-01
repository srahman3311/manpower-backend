import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AgentController } from "./agent.controller";
import { AgentService } from "./agents.service";
import { Agent } from "./agent.entity";
import { AddressModule } from "src/common/addresses/address.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Agent]), 
        AddressModule
    ],
    controllers: [AgentController],
    providers: [AgentService]
})

export class AgentModule {}