import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Agent } from "./agent.entity";
import { CreateAgentDTO } from "./dto/create-agent.dto";

@Injectable()

export class AgentService {

    constructor(@InjectRepository(Agent) private readonly agentReposity: Repository<Agent>) {}

    getAgents(): Promise<Agent[]> {
        const agents = this.agentReposity.find();
        return agents;
    }

    createAgent(createAgentDto: CreateAgentDTO): Promise<Agent> {
        const agent = this.agentReposity.create(createAgentDto);
        return this.agentReposity.save(agent);
    }

}