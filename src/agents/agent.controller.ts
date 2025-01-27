import { Body, Controller, Get, Post } from "@nestjs/common";
import { AgentService } from "./agents.service";
import { Agent } from "./agent.entity";
import { CreateAgentDTO } from "./dto/create-agent.dto";

@Controller("api/agents") 

export class AgentController {

    constructor(private readonly agentService: AgentService) {}

    @Get("")
    getAgents(): Promise<Agent[]> {
        return this.agentService.getAgents();
    }

    @Post("create")
    createAgent(@Body() createAgentDto: CreateAgentDTO) {
        return this.agentService.createAgent(createAgentDto)
    }

}