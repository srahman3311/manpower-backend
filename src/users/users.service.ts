import { 
    Injectable, 
    NotFoundException, 
    BadRequestException,  
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { User } from "./entities/user.entity";
import { Role } from "./entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { Tenant } from "src/tenants/tenant.entity";
import { CreateUserDTO } from "./dto/create-user.dto";
import { QueryDTO } from "src/global/dto/param-query.dto";
import { ParamDTO } from "src/global/dto/param-query.dto";
import { hashPassword } from "../auth/utils/hash.util";
import { AddressService } from "src/global/addresses/addresses.service";

@Injectable()

export class UserService {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
        @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
        private readonly addressService: AddressService

    ) {}

    async getUserById(id: number): Promise<User | null> {
        return await this.userRepository.findOne({ 
            where: { id },
            relations: ["address", "roles", "permissions", "tenant"]  
        });
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({ 
            where: { email },
            relations: ["address", "roles", "permissions", "tenant"] 
        });
    }

    async getUsers(query: QueryDTO): Promise<{ users: User[], total: number }> {

        const { 
            searchText = "", 
            skip = "0", 
            limit = "100000" 
        } = query;

        const [users, total] = await this.userRepository
                            .createQueryBuilder("user")
                            .where(
                                `(
                                    user.firstName LIKE :searchText OR 
                                    user.lastName LIKE :searchText OR 
                                    user.email LIKE :searchText OR 
                                    user.phone LIKE :searchText 

                                ) AND user.deleted = false`, 
                                {
                                    searchText: `%${searchText}%`
                                }
                            )
                            .leftJoinAndSelect("user.tenant", "tenant")
                            .leftJoinAndSelect("user.roles", "roles")
                            .leftJoinAndSelect("user.permissions", "permissions")
                            .orderBy("user.createdAt", "DESC")
                            .skip(parseInt(skip))
                            .take(parseInt(limit))
                            .getManyAndCount()

        return { users, total };

    }

    async createUser(createUserDto: CreateUserDTO): Promise<User> {

        // Password is optional for editing user so in dto password has been marked as optional
        // But as it is mandatory for creating a new one so we must do a validation here
        if(!createUserDto.password) {
            throw new BadRequestException("password Required")
        }

        const { 
            tenantId,
            firstName,
            lastName,
            email,
            phone,
            roles, 
            permissions 
        } = createUserDto;

        const address = await this.addressService.createAddress(createUserDto.address);

        const foundRroles = await this.roleRepository.find({ 
            where: roles.map(role => ({ name: role })) 
        });
        const foundPermissions = await this.permissionRepository.find({
            where: permissions.map(permission => ({ name: permission }))
        });

        const hash = await hashPassword(createUserDto.password)
        const user = this.userRepository.create({
            tenant: { id: tenantId } as Tenant,
            firstName,
            lastName,
            email,
            phone,
            password: hash,
            roles: foundRroles,
            permissions: foundPermissions,
            address
        });

        return this.userRepository.save(user);

    }

    async editUser(paramsBody: CreateUserDTO & ParamDTO): Promise<User | null> {

        const { 
            id,
            firstName,
            lastName,
            phone,
            email,
            roles,
            permissions,
            password
        } = paramsBody;
        console.log(paramsBody)

        const parsedId = parseInt(id as string);

        const user = await this.getUserById(parsedId)

        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.addressService.editAddress(
            user.address.id,
            paramsBody.address
        );

        const foundRoles = await this.roleRepository.find({ 
            where: roles.map(role => ({ name: role })) 
        });
    
        const foundPermissions = await this.permissionRepository.find({
            where: permissions.map(permission => ({ name: permission }))
        });

        let fieldsToUpdate: Partial<User> = {
            firstName,
            lastName,
            phone,
            email
        };

        if(password) {
            const hash = await hashPassword(password);
            fieldsToUpdate.password = hash;
        }

        const result = await this.userRepository.update(
            { id: parsedId },
            fieldsToUpdate
        );

        if(result.affected === 0) {
            throw new NotFoundException("User Not Found")
        }

        await this.userRepository.createQueryBuilder()
            .relation(User, "roles")
            .of(user)
            .addAndRemove(foundRoles, user.roles);

        await this.userRepository.createQueryBuilder()
            .relation(User, "permissions")
            .of(user)
            .addAndRemove(foundPermissions, user.permissions);


        return this.userRepository.findOne({ where: { id: parsedId } });
        
    }

    async deleteUser(id?: string): Promise<void> {
        await this.userRepository.update({ id: parseInt(id as string) }, { deleted: true })
    }

}