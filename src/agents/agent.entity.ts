import { 
    Column, 
    Entity, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn 
} from "typeorm";
import { IsOptional, IsString } from "class-validator";

export enum AgentCategory {
    A = "A",
    B = "B",
    C = "C",
    D = "D"
}

@Entity("agents")

export class Agent {

    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date

    @Column({ type: "char" })
    @IsString()
    category: AgentCategory

    @Column()
    @IsString()
    name: string

    @Column({ unique: true })
    @IsString()
    phone: string 

    @Column({ nullable: true, default: null })
    @IsOptional()
    @IsString()
    email?: string
    
    @Column({ nullable: true, default: null })
    address?: string 

}