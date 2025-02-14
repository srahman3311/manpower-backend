import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "src/users/users.module";
import { TenantModule } from "src/tenants/tenants.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

@Module({
    imports: [
        // We are using UserService on AuthService, so need to explicitly import it.
        // UserModule and AuthModule both depends on each other which causes circular
        // dependency. To resolve this we need to use forwardRef
        forwardRef(() => UserModule),
        TenantModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                global: true,
                secret: configService.get<string>("JWT_SECRET"),
                signOptions: {
                    expiresIn: "1d"
                }
            })
        })
    ],
    controllers: [AuthController],
    providers: [AuthService],
    // So that other modules can use it like UserModule
    exports: [AuthService, JwtModule] 
})

export class AuthModule {}
