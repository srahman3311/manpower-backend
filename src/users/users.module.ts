import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./users.controller";
import { UserService } from "./users.service";
import { User } from "./entities/user.entity";
import { Role } from "./entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { AuthModule } from "src/auth/auth.module";
import { AddressModule } from "src/global/addresses/addresses.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Role, Permission]), 
        // UserModule and AuthModule both depends on each other which causes circular
        // dependency. To resolve this we need to use forwardRef
        forwardRef(() => AuthModule),
        AddressModule
    ],
    controllers: [UserController],
    providers: [UserService],
    // So that other modules can use it like AuthModule
    exports: [UserService] 
})

export class UserModule {}