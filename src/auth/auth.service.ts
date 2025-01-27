import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/users/users.service";
import { comparePassword } from "src/auth/utils/hash.util";
import { AuthPayloadDTO } from "./dto/auth-payload.dto";

@Injectable()

export class AuthService {

    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    async login(authPayloadDto: AuthPayloadDTO): Promise<{ token: string }> {
        
        const { email, password } = authPayloadDto;

        const user = await this.userService.getUserByEmail(email);

        if(!user) throw new UnauthorizedException();

        const payload = { sub: user.id, email: user.email }

        const isMatch = await comparePassword(password, user.password);
        if(!isMatch) throw new UnauthorizedException();

        return {
            token: await this.jwtService.signAsync(payload)
        }

    }

}