import { IsString, IsOptional } from "class-validator";
import { AgentCategory } from "../agent.entity";

export class CreateAgentDTO {

    @IsString()
    category: AgentCategory

    @IsString()
    name: string

    @IsString()
    phone: string

    @IsOptional()
    @IsString()
    email?: string

    @IsOptional()
    @IsString()
    address?: string

}