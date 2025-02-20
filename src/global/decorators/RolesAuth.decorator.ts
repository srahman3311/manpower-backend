import { Reflector } from "@nestjs/core";

export const RolesAuth = Reflector.createDecorator<string[]>()
