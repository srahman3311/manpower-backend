import { 
    // Unique,
    Entity, 
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinColumn,
    JoinTable
} from "typeorm";
import { Tenant } from "src/tenants/tenant.entity";
import { Address } from "src/global/addresses/address.entity";
import { Role } from "./role.entity";
import { Permission } from "./permission.entity";

export enum UserRole {
    Tenant = "tenant",
    Admin = "admin",
    Director = "director",
    ManagingDirector = "managing_director"
}

export enum UserPermission {
    Read = "read",
    Write = "write",
    Delete = "delete"
}

// Instead of field levels we can define unique fields at entity level
// @Unique(['email', 'tenantId']) 
@Entity("users")
export class User {

    @Column()
    tenantId: number

    @ManyToOne(() => Tenant) 
    @JoinColumn({ name: "tenantId" }) 
    tenant: Tenant

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
    email: string

    @Column({ unique: true })
    phone: string

    @Column({ nullable: true })
    phone2: string

    @Column()
    password: string

    // This is a plain column in the database.
    // It stores the foreign key referencing the id column of the address table.
    @Column()
    addressId: number
    
    // This is a virtual field created by TypeORM.
    // It is not stored in the database but is used to define the relationship.
    // When you query the User entity and include the Address relation, TypeORM will 
    // automatically fetch and populate the address field.
    // @ManyToOne decorator to define this relationship on the User side, 
    // because the same address can be assigned to multiple users.
    @ManyToOne(() => Address, { nullable: true }) 
    @JoinColumn({ name: "addressId" }) 
    address: Address

    // No cascade since roles already exist
    @ManyToMany(() => Role, { cascade: false }) 
    @JoinTable({
        name: "user_roles", // Custom join table name
        joinColumn: { name: "userId", referencedColumnName: "id" }, // FK referencing User
        inverseJoinColumn: { name: "roleId", referencedColumnName: "id" } // FK referencing Permission
    })
    roles: Role[];

    // No cascade since permissions already exist
    @ManyToMany(() => Permission, { cascade: false }) 
    @JoinTable({
        name: "user_permissions", // Custom join table name
        joinColumn: { name: "userId", referencedColumnName: "id" }, // FK referencing User
        inverseJoinColumn: { name: "permissionId", referencedColumnName: "id" } // FK referencing Permission
    })
    permissions: Permission[];

    @Column({ nullable: true })
    imageUrl: string

    @Column({ default: false })
    deleted: boolean

}
