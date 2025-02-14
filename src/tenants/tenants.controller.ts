import { Controller, Post, Body } from "@nestjs/common";
import { TenantService } from "./tenants.service";
import { CreateTenantDTO } from "./dto/create-tenant.dto";

@Controller("api/tenants")
export class TenantController {
    constructor(private readonly tenantService: TenantService) {}

    @Post("create")
    createTenant(@Body() createTenantDto: CreateTenantDTO) {
        return this.tenantService.createTenant(createTenantDto);
    }

}