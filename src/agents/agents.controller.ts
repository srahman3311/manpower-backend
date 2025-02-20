import { Body, Controller, Get, Post, Patch, Delete, Query, Param } from "@nestjs/common";
import { AgentService } from "./agents.service";
import { Agent } from "./agent.entity";
import { CreateAgentDTO } from "./dto/create-agent.dto";
import { QueryDTO, ParamDTO } from "src/global/dto/param-query.dto";
import { RequestContext } from "src/global/decorators/RequestContext.decorator";
import { JwtPayload } from "src/global/types/JwtPayload";

@Controller("api/agents") 

export class AgentController {

    constructor(private readonly agentService: AgentService) {}

    @Get("")
    getAgents(
        @Query() query: QueryDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<{ agents: Agent[], total: number }> {
        return this.agentService.getAgents(query, ctx);
    }

    @Post("create")
    createAgent(
        @Body() createAgentDto: CreateAgentDTO,
        @RequestContext() ctx: JwtPayload
    ) {
        return this.agentService.createAgent(ctx.tenantId, createAgentDto)
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