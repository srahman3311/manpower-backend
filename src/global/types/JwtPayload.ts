import { Role } from "src/users/entities/role.entity";
import { Permission } from "src/users/entities/permission.entity";

export interface JwtPayload {
    sub: number
    tenantId: number
    email: string
    roles: Role[]
    permissions: Permission[]
}
