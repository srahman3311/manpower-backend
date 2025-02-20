import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const RequestContext = createParamDecorator((name: string, ctx: ExecutionContext) => {

    const request = ctx.switchToHttp().getRequest<Request>();

    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    if (type !== "Bearer" || !token) return undefined;

    const payload = JSON.parse(Buffer.from(token?.split('.')[1], 'base64').toString());
    return payload;

})