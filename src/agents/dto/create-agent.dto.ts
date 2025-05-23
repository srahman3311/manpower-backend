import { IsString, IsOptional, IsEnum } from "class-validator";
import { AgentCategory } from "../agent.entity";
import { AddressDTO } from "src/global/addresses/address.dto";

export class CreateAgentDTO {

    @IsEnum(AgentCategory, { message: "agent category must be of one of following - A, B, C & D"})
    category: AgentCategory

    @IsString()
    firstName: string
    
    @IsString()
    lastName: string

    @IsString()
    phone: string

    @IsOptional()
    @IsString()
    email: string

    @IsOptional()
    address: AddressDTO

    @IsOptional()
    @IsString()
    imageUrl: string


}