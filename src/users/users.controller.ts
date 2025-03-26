import { 
    Controller, 
    Req,
    Get, 
    Post, 
    Patch, 
    Body,
    Query,
    Param,
    Delete
} from "@nestjs/common";
import { Request } from "express";
import { UserService } from "./users.service";
import { CreateUserDTO } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";
import { ParamDTO, QueryDTO } from "src/global/dto/param-query.dto";
import { RequestContext } from "src/global/decorators/RequestContext.decorator";
import { RolesAuth } from "src/global/decorators/RolesAuth.decorator";
import { JwtPayload } from "src/global/types/JwtPayload";

@Controller("api/users")

export class UserController {

    constructor(private readonly userService: UserService) {}

    @Get("me")
    getAuthUser(@Req() request: Request) {
        const id = (request as any).user.sub;
        return this.userService.getUserById(id)
    }
   
    @Get("")
    @RolesAuth(["admin", "tenant"])
    getUsers(
        @Query() queryDto: QueryDTO, 
        @RequestContext() ctx: JwtPayload
    ): Promise<{ users: User[], total: number }> {
        return this.userService.getUsers(queryDto, ctx)
    }

    @Post("create")
    @RolesAuth(["admin", "tenant"])
    createUser(
        @Body() createUserDto: CreateUserDTO,
        @RequestContext() ctx: JwtPayload
    ): Promise<User> {
        return this.userService.createUser(ctx.tenantId, createUserDto);
    }

    @Patch(":id/edit")
    @RolesAuth(["admin", "tenant"])
    editUser(
        @Param() paramDto: ParamDTO, 
        @Body() createUserDto: CreateUserDTO
    ): Promise<User | null> {
        return this.userService.editUser({
            ...paramDto,
            ...createUserDto
        })
    }

    @Delete(":id/delete")
    @RolesAuth(["admin", "tenant"])
    deleteUser(@Param() paramDto: ParamDTO): Promise<void> {
        return this.userService.deleteUser(paramDto.id)
    }

}