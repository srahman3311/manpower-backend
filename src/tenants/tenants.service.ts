import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateTenantDTO } from "./dto/create-tenant.dto";
import { Tenant } from "./tenant.entity";

@Injectable()
export class TenantService {
    constructor(
        @InjectRepository(Tenant) private readonly tenantRepository: Repository<Tenant>
    ) {}

    async createTenant(createTenantDto: CreateTenantDTO): Promise<Tenant> {
        const user = this.tenantRepository.create({ 
            ...createTenantDto,
            name: createTenantDto.businessName 
        });
        return await this.tenantRepository.save(user);
    }

    getTenantById(id: number): Promise<Tenant | null> {
        const tenant = this.tenantRepository.findOne(
            { where: { id } },
        );
        return tenant;
    }

    async updatePassengerInvoiceCount(id: number, count: number): Promise<void> {
          
        let fieldsToUpdate: Partial<Tenant> = { 
            passengerInvoiceCount: count
        };

        try {
            await this.tenantRepository.update(
                { id },
                fieldsToUpdate
            );
        } catch(error) {
            console.log(error);
        }
    
    }

}