import { Request } from "express";
import { 
    CanActivate, 
    ExecutionContext, 
    Injectable, 
    UnauthorizedException, 
    ForbiddenException 
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { RolesAuth } from "../decorators/RolesAuth.decorator";
import { Reflector } from "@nestjs/core";
import { Public } from "../decorators/Public.decorator";

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private reflector: Reflector
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest<Request>();

        // Allow access to public routes like login and signup because RolesGuard has been used
        // globall with APP_GUARD
        const isPublic = this.reflector.get(Public, context.getHandler());
        if (isPublic) return true; 

        const token = this.extractTokenFromHeader(request);
        if(!token) throw new UnauthorizedException();

        let payload;

        try {

            payload = await this.jwtService.verifyAsync(
                token,
                { secret: this.configService.get<string>("JWT_SECRET") }
            );

            (request as any)["user"] = payload;

        } catch {
            throw new UnauthorizedException();
        }

        const requiredRoles = this.reflector.get(RolesAuth, context.getHandler());

        // It means that @RolesAuth() hasn't been used at the controller from where this RolesGuard
        // guard is being called, so logged in user with any role can access. For example users/me 
        // controller is not using RolesAuth decorator but as RolesGuard has been applied globally
        // so RolesGuard is being called on users/me controller as well. As users/me is not specifying
        // user roles by using RolesAuth([...roles]) so logged in user with any role can accesss the
        // users/me route.
        if(!requiredRoles) return true;
       
        const hasRole = payload.roles.some((role: any) => requiredRoles.includes(role.name));

        if (!hasRole) {
            throw new ForbiddenException("Insufficient permissions");
        }
       
        return true
        
    }

    private extractTokenFromHeader(request: Request) {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }

}