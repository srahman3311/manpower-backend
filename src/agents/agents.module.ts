import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AgentController } from "./agents.controller";
import { AgentService } from "./agents.service";
import { Agent } from "./agent.entity";
import { AddressModule } from "src/global/addresses/addresses.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Agent]), 
        AddressModule
    ],
    controllers: [AgentController],
    providers: [AgentService]
})

export class AgentModule {}