import { 
    Controller, 
    Body, 
    Get, 
    Post, 
    Param 
} from "@nestjs/common";
import { CompanyService } from "./companies.service";
import { CreateCompanyDTO } from "./dto/create-company.dto";
import { Company } from "./companies.entity";

@Controller("api/companies")

export class CompanyController {

    constructor(private readonly companyService: CompanyService) {}

    @Get("") 
    getCompanies(): Promise<Company[]> {
        return this.companyService.getCompanies()
    }

    @Get(":id") 
    getCompanyById(@Param() params: { id: number }): Promise<Company | null> {
        return this.companyService.getCompanyById(params.id)
    }

    @Post("create")
    createCompany(@Body() createCompanyDto: CreateCompanyDTO): Promise<Company> {
        return this.companyService.createCompany(createCompanyDto);
    }

}