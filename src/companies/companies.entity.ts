import { 
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column
} from "typeorm";
import { 
    IsNotEmpty, 
    Length, 
    IsOptional,
    IsEmail,
    IsPhoneNumber
} from "class-validator";

@Entity("companies")

export class Company {

    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date

    @Column({ nullable: false, unique: true })
    @IsNotEmpty()
    @Length(1, 255)
    name: string

    @Column({ type: "varchar", nullable: true })
    @IsOptional()
    category: string | null

    @Column({ nullable: false, unique: true })
    @IsNotEmpty()
    @IsEmail()
    @Length(1, 255)
    email: string

    // null is considered an object. So if we must use null as data type then we must
    // explicitly tell inside Column decorator that it's of type text or varchar or char

    // Phone field is optional, which means it can be omitted from request body. 
    // But if provided it can't be an empty string and length must be between 1 to 255
    @Column({ 
        type: "varchar", 
        length: 20, 
        nullable: true, 
        unique: true 
    })
    @IsOptional()
    @IsPhoneNumber()
    @Length(1, 255)
    phone: string | null

    // null is considered an object. So if we must use null as data type then we must
    // explicitly tell inside Column decorator that it's of type text or varchar or char

    // Address field is optional, which means it can be omitted from request body. 
    // But if provided it can't be an empty string and length must be between 1 to 500
    @Column({ type: "varchar", length: 500,  nullable: true, default: null })
    @IsOptional()
    @IsNotEmpty()
    @Length(1, 500)
    address: string | null

    @Column({ default: false })
    isActive: boolean
    
    @Column({ default: false })
    deleted: boolean

}