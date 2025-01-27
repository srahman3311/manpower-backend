import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./users.controller";
import { UserService } from "./users.service";
import { User } from "./users.entity";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]), 
        // UserModule and AuthModule both depends on each other which causes circular
        // dependency. To resolve this we need to use forwardRef
        forwardRef(() => AuthModule)
    ],
    controllers: [UserController],
    providers: [UserService],
    // So that other modules can use it like AuthModule
    exports: [UserService] 
})

export class UserModule {}