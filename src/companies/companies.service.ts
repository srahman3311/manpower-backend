import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { validate } from "class-validator";
import { CreateCompanyDTO } from "./dto/create-company.dto";
import { Company } from "./company.entity";
import { QueryDTO } from "src/global/dto/param-query.dto";
import { ParamDTO } from "src/global/dto/param-query.dto";
import { AddressService } from "src/global/addresses/addresses.service";
import { Tenant } from "src/tenants/tenant.entity";

@Injectable()

export class CompanyService {

    constructor(
        @InjectRepository(Company) private companyRepository: Repository<Company>,
        private readonly addressService: AddressService
    ) {}

    getCompanyById(id: number): Promise<Company | null> {
        const company = this.companyRepository.findOne({ 
            where: { id },
            relations: ["address", "tenants"]  
        });
        return company;
    }

    async getCompanies(query: QueryDTO): Promise<{ companies: Company[], total: number }> {
    
        const { 
            searchText = "", 
            skip = "0", 
            limit = "100000" 
        } = query;

        const [companies, total] = await this.companyRepository
                            .createQueryBuilder("company")
                            .where(
                                `(
                                    company.name LIKE :searchText OR 
                                    company.email LIKE :searchText OR 
                                    company.phone LIKE :searchText OR 
                                    company.address LIKE :searchText 

                                ) AND deleted = false`, 
                                {
                                    searchText: `%${searchText}%`
                                }
                            )
                            .orderBy("company.createdAt", "DESC")
                            .skip(parseInt(skip))
                            .take(parseInt(limit))
                            .getManyAndCount()

        return { companies, total };
    
    }

    async createCompany(createCompanyDto: CreateCompanyDTO): Promise<Company> {
        const { 
            tenantId
        } = createCompanyDto;
        const address = await this.addressService.createAddress(createCompanyDto.address);
        const company = this.companyRepository.create({
            ...createCompanyDto,
            phone: createCompanyDto.phone ?? null,
            tenant: { id: tenantId } as Tenant,
            address
        });
        // const errors = await validate(company);
        // console.log(errors);
        return this.companyRepository.save(company);
    }

    async editCompany(paramsBody: CreateCompanyDTO & ParamDTO): Promise<Company | null> {
    
        const { 
            id,
            name, 
            email, 
            phone
        } = paramsBody;

        const parsedId = parseInt(id as string);

        const company = await this.getCompanyById(parsedId);

        let fieldsToUpdate: Partial<Company> = {
            name, 
            email, 
            phone
        };

        await this.addressService.editAddress(
            company?.address.id,
            paramsBody.address
        );

        const result = await this.companyRepository.update(
            { id: parsedId },
            fieldsToUpdate
        );

        if(result.affected === 0) {
            throw new NotFoundException("Company Not Found")
        }

        return this.companyRepository.findOne({ where: { id: parsedId } });
            
    }
    
    async deleteCompany(id?: string): Promise<void> {
        await this.companyRepository.update({ id: parseInt(id as string) }, { deleted: true })
    }

}