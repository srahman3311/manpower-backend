import { 
    Column, 
    Entity, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn,
    ManyToOne,
    JoinColumn 
} from "typeorm";
import { Address } from "src/common/addresses/address.entity";

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
    category: AgentCategory

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column({ unique: true })
    phone: string 

    @Column({ nullable: true })
    email?: string

    @Column({ nullable: true })
    imageUrl?: string

    // This is a plain column in the database.
    // It stores the foreign key referencing the id column of the address table.
    @Column()
    addressId: number
    
    // This is a virtual field created by TypeORM.
    // It is not stored in the database but is used to define the relationship.
    // When you query the Agent entity and include the Address relation, TypeORM will 
    // automatically fetch and populate the address field.
    // @ManyToOne decorator to define this relationship on the Agent side, 
    // because the same address can be assigned to multiple agents.
    @ManyToOne(() => Address, { nullable: true }) 
    @JoinColumn({ name: "addressId" }) 
    address: Address

    @Column({ default: false })
    deleted: boolean

}