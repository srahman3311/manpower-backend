import { 
    Controller, 
    Query,
    Body, 
    Get, 
    Post,
    Patch,
    Delete, 
    Param, 
    UseGuards 
} from "@nestjs/common";
import { CompanyService } from "./companies.service";
import { CreateCompanyDTO } from "./dto/create-company.dto";
import { Company } from "./company.entity";
import { AuthGuard } from "src/auth/auth.guard";
import { ParamDTO, QueryDTO } from "src/global/dto/param-query.dto";
import { RequestContext } from "src/global/decorators/RequestContext.decorator";
import { JwtPayload } from "src/global/types/JwtPayload";

@Controller("api/companies")

export class CompanyController {

    constructor(private readonly companyService: CompanyService) {}

    // @UseGuards(AuthGuard)
    @Get("")
    getCompanies(
        @Query() queryDto: QueryDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<{ companies: Company[], total: number }> {
        return this.companyService.getCompanies(queryDto, ctx)
    }

    // @UseGuards(AuthGuard)
    @Get(":id") 
    getCompanyById(@Param() params: { id: number }): Promise<Company | null> {
        return this.companyService.getCompanyById(params.id)
    }

    // @UseGuards(AuthGuard)
    @Post("create")
    createCompany(
        @Body() createCompanyDto: CreateCompanyDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<Company> {
        return this.companyService.createCompany(ctx.tenantId, createCompanyDto);
    }

    // @UseGuards(AuthGuard)
    @Patch(":id/edit")
    editCompany(
        @Param() paramDto: ParamDTO, 
        @Body() createCompanyDto: CreateCompanyDTO
    ): Promise<Company | null> {
        return this.companyService.editCompany({
            ...paramDto,
            ...createCompanyDto
        })
    }

    // @UseGuards(AuthGuard)
    @Delete(":id/delete")
    deleteCompany(@Param() paramDto: ParamDTO): Promise<void> {
        return this.companyService.deleteCompany(paramDto.id)
    }

}