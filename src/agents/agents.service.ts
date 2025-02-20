import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Agent } from "./agent.entity";
import { QueryDTO, ParamDTO } from "src/global/dto/param-query.dto";
import { CreateAgentDTO } from "./dto/create-agent.dto";
import { AddressService } from "src/global/addresses/addresses.service";
import { Tenant } from "src/tenants/tenant.entity";
import { JwtPayload } from "src/global/types/JwtPayload";

@Injectable()
export class AgentService {

    constructor(
        @InjectRepository(Agent) private agentRepository: Repository<Agent>,
        private readonly addressService: AddressService
    ) {}
    
    getAgentById(id: number): Promise<Agent | null> {
        const agent = this.agentRepository.findOne(
            { 
                where: { id },
                relations: ["address"] 
            },
            
        );
        return agent;
    }

    async getAgents(query: QueryDTO, ctx: JwtPayload): Promise<{ agents: Agent[], total: number }> {
    
        const { 
            searchText = "", 
            skip = "0", 
            limit = "100000" 
        } = query;

        const [agents, total] = await this.agentRepository
                            .createQueryBuilder("agent")
                            .leftJoinAndSelect("agent.address", "address")
                            .where(
                                `(
                                    agent.firstName LIKE :searchText OR 
                                    agent.lastName LIKE :searchText OR
                                    agent.email LIKE :searchText OR 
                                    agent.phone LIKE :searchText

                                ) AND agent.deleted = false AND agent.tenantId = ${ctx.tenantId}`, 
                                {
                                    searchText: `%${searchText}%`
                                }
                            )
                            .orderBy("agent.createdAt", "DESC")
                            .skip(parseInt(skip))
                            .take(parseInt(limit))
                            .getManyAndCount()

        return { agents, total };
    
    }

    async createAgent(tenantId: number, createAgentDto: CreateAgentDTO): Promise<Agent> {

        const { 
            firstName,
            lastName,
            email,
            phone, 
            category,
        } = createAgentDto;

        let address = await this.addressService.createAddress(createAgentDto.address);

        const agent = this.agentRepository.create({
            firstName,
            lastName,
            phone,
            category,
            tenant: { id: tenantId } as Tenant,
            email: email ?? null,
            address
        });
        
        return this.agentRepository.save(agent);

    }

    async editAgent(params: CreateAgentDTO & ParamDTO): Promise<Agent | null> {

        const {
            id,
            firstName,
            lastName,
            email,
            phone,
        } = params;

        const parsedId = parseInt(id as string)

        const agent = await this.getAgentById(parsedId);

        let fieldsToUpdate: Partial<Agent> = {
            firstName,
            lastName,
            email,
            phone,
        };

        await this.addressService.editAddress(
            agent?.address.id,
            params.address
        );

        const result = await this.agentRepository.update(
            { id: parsedId },
            fieldsToUpdate
        );

        if(result.affected === 0) {
            throw new NotFoundException("Agent Not Found")
        }
    
        return this.agentRepository.findOne({ where: { id: parsedId } });

    }

    async deleteAgent(id?: string): Promise<void> {
        await this.agentRepository.update({ id: parseInt(id as string) }, { deleted: true })
    }

}