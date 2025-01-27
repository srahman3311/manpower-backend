import { 
    Entity, 
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column
} from "typeorm";
import { 
    IsEmail, 
    IsOptional, 
    IsString 
} from "class-validator";

export enum UserRole {
    Admin = "admin",
    Director = "director",
    ManagingDirector = "managing_director"
}

@Entity("users")

export class User {

    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column({ unique: true })
    @IsString()
    phone: string

    @Column({ 
        type: "varchar", 
        unique: true 
    })
    @IsEmail()
    email: string

    @Column()
    @IsString()
    password: string

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.Admin
    })
    @IsString()
    role: UserRole

    // null is considered an object. So if we must use null as data type then we must
    // explicitly tell inside Column decorator that it's of type text or varchar or char
    @Column({ 
        type: "varchar", 
        nullable: true, 
        default: null 
    })
    @IsOptional()
    @IsString()
    imageUrl: string | null

    @Column({ default: false })
    deleted: boolean

}
