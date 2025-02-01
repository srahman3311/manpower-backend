import { IsString, IsOptional } from "class-validator";
import { AgentCategory } from "../agent.entity";
import { AddressDTO } from "src/common/addresses/address.dto";

export class CreateAgentDTO {

    @IsString()
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

}