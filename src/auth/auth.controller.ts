import { Controller, Body, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthPayloadDTO } from "./dto/auth-payload.dto";
import { CreateUserDTO } from "src/users/dto/create-user.dto";
import { CreateTenantDTO } from "src/tenants/dto/create-tenant.dto";

@Controller("api/auth")

export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post("login")
    async login(@Body() authPayloadDto: AuthPayloadDTO): Promise<{ token: string }> {
        return await this.authService.login(authPayloadDto)
    }

    @Post("register")
    async register(@Body() registerDTO: CreateUserDTO & CreateTenantDTO): Promise<{ token: string }> {
        return await this.authService.register(registerDTO)
    }
    
}