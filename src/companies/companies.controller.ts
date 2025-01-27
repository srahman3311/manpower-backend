import { 
    Controller, 
    Query,
    Body, 
    Get, 
    Post, 
    Param, 
    UseGuards 
} from "@nestjs/common";
import { CompanyService } from "./companies.service";
import { CreateCompanyDTO } from "./dto/create-company.dto";
import { Company } from "./companies.entity";
import { AuthGuard } from "src/auth/auth.guard";
import { ParamDTO, QueryDTO } from "src/common/dto/param-query.dto";

@Controller("api/companies")

export class CompanyController {

    constructor(private readonly companyService: CompanyService) {}

    @UseGuards(AuthGuard)
    @Get("")
    getCompanies(@Query() queryDto: QueryDTO): Promise<{ companies: Company[], total: number }> {
        return this.companyService.getCompanies(queryDto)
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