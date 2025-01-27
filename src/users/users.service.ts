import { 
    Injectable, 
    NotFoundException, 
    BadRequestException,  
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./users.entity";
import { CreateUserDTO } from "./dto/create-user.dto";
import { QueryDTO } from "src/common/dto/param-query.dto";
import { ParamDTO } from "src/common/dto/param-query.dto";
import { hashPassword } from "../auth/utils/hash.util";

@Injectable()

export class UserService {

    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

    async getUserById(id: number): Promise<User | null> {
        return await this.userRepository.findOne({ where: { id } });
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { email } });
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

                                ) AND deleted = false`, 
                                {
                                    searchText: `%${searchText}%`
                                }
                            )
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

        const hash = await hashPassword(createUserDto.password)
        const user = this.userRepository.create({
            ...createUserDto,
            password: hash
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
            role,
            password
        } = paramsBody;

        const parsedId = parseInt(id as string);

        let fieldsToUpdate: Partial<User> = {
            firstName,
            lastName,
            phone,
            email,
            role
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

        return this.userRepository.findOne({ where: { id: parsedId } });
        
    }

    async deleteUser(id?: string): Promise<void> {
        await this.userRepository.update({ id: parseInt(id as string) }, { deleted: true })
    }

}