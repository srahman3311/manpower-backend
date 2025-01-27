import { 
    Controller, 
    Req,
    Get, 
    Post, 
    Patch, 
    Body,
    UseGuards, 
    Query,
    Param,
    Delete
} from "@nestjs/common";
import { Request } from "express";
import { UserService } from "./users.service";
import { CreateUserDTO } from "./dto/create-user.dto";
import { User } from "./users.entity";
import { AuthGuard } from "src/auth/auth.guard";
import { ParamDTO, QueryDTO } from "src/common/dto/param-query.dto";

@Controller("api/users")

export class UserController {

    constructor(private readonly userService: UserService) {}

    @UseGuards(AuthGuard)
    @Get("me")
    getAuthUser(@Req() request: Request) {
        const id = (request as any).user.sub;
        return this.userService.getUserById(id)
    }

    @UseGuards(AuthGuard)
    @Get("")
    getUsers(@Query() queryDto: QueryDTO): Promise<{ users: User[], total: number }> {
        return this.userService.getUsers(queryDto)
    }

    @UseGuards(AuthGuard)
    @Post("create")
    createUser(@Body() createUserDto: CreateUserDTO): Promise<User> {
        return this.userService.createUser(createUserDto);
    }

    @UseGuards(AuthGuard)
    @Patch(":id/edit")
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
    deleteUser(@Param() paramDto: ParamDTO): Promise<void> {
        return this.userService.deleteUser(paramDto.id)
    }

}