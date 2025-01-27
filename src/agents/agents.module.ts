import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AgentController } from "./agent.controller";
import { AgentService } from "./agents.service";
import { Agent } from "./agent.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Agent])],
    controllers: [AgentController],
    providers: [AgentService]
})

export class AgentModule {}