import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/users/users.service";
import { comparePassword } from "src/auth/utils/hash.util";
import { AuthPayloadDTO } from "./dto/auth-payload.dto";
import { CreateUserDTO } from "src/users/dto/create-user.dto";
import { CreateTenantDTO } from "src/tenants/dto/create-tenant.dto";
import { TenantService } from "src/tenants/tenants.service";
import { UserPermission, UserRole } from "src/users/entities/user.entity";

@Injectable()

export class AuthService {

    constructor(
        private userService: UserService,
        private tenantService: TenantService,
        private jwtService: JwtService
    ) {}

    async login(authPayloadDto: AuthPayloadDTO): Promise<{ token: string }> {
        
        const { email, password } = authPayloadDto;

        const user = await this.userService.getUserByEmail(email);

        if(!user) throw new UnauthorizedException();

        const payload = { 
            sub: user.id, 
            tenantId: user.tenant.id,
            email: user.email,
            roles: user.roles,
            permissions: user.permissions  
        }

        const isMatch = await comparePassword(password, user.password);
        if(!isMatch) throw new UnauthorizedException();

        return {
            token: await this.jwtService.signAsync(payload)
        }

    }

    async register(registerDto: CreateTenantDTO & CreateUserDTO): Promise<{ token: string }> {
        
        const { firstName, lastName, email, phone, businessName, password } = registerDto;
        const tenant = await this.tenantService.createTenant({ businessName });

        const user = await this.userService.createUser(tenant.id, {
            firstName,
            lastName,
            email,
            phone,
            roles: [UserRole.Tenant],
            permissions: [UserPermission.Read, UserPermission.Write, UserPermission.Delete],
            password,
            balance: 0
        });

        if(!user) throw new UnauthorizedException();

        const payload = { 
            sub: user.id, 
            tenantId: tenant.id, 
            email: user.email,
            roles: user.roles,
            permissions: user.permissions 
        }

        return {
            token: await this.jwtService.signAsync(payload)
        }

    }

}