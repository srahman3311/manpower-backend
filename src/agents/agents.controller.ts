import { Body, Controller, Get, Post, Patch, Delete, Query, Param } from "@nestjs/common";
import { AgentService } from "./agents.service";
import { Agent } from "./agent.entity";
import { CreateAgentDTO } from "./dto/create-agent.dto";
import { QueryDTO, ParamDTO } from "src/global/dto/param-query.dto";

@Controller("api/agents") 

export class AgentController {

    constructor(private readonly agentService: AgentService) {}

    @Get("")
    getAgents(@Query() query: QueryDTO): Promise<{ agents: Agent[], total: number }> {
        return this.agentService.getAgents(query);
    }

    @Post("create")
    createAgent(@Body() createAgentDto: CreateAgentDTO) {
        return this.agentService.createAgent(createAgentDto)
    }

    @Patch(":id/edit")
    editAgent(
        @Param() paramDto: ParamDTO, 
        @Body() createAgentDto: CreateAgentDTO
    ) {
        return this.agentService.editAgent({ ...paramDto, ...createAgentDto })
    }

    @Delete(":id/delete")
    deleteAgent(@Param() paramDto: ParamDTO): Promise<void> {
        return this.agentService.deleteAgent(paramDto.id)
    }

}