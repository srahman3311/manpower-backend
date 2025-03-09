import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Passenger } from "./entities/passenger.entity";
import { Medical } from "./entities/medical.entity";
import { Passport } from "./entities/passport.entity";
import { CreatePassengerDTO } from "./dto/create-passenger.dto";
import { QueryDTO, ParamDTO } from "src/global/dto/param-query.dto";
import { MedicalDTO } from "./dto/medical.dto";
import { AddressService } from "src/global/addresses/addresses.service";
import { PassportDTO } from "./dto/passport.dto";
import { JwtPayload } from "src/global/types/JwtPayload";

@Injectable()
export class PassengerService {

    constructor(
        @InjectRepository(Passenger) private passengerRepository: Repository<Passenger>,
        @InjectRepository(Medical) private medicalRepository: Repository<Medical>,
        @InjectRepository(Passport) private passportRepository: Repository<Passport>,
        private readonly addressService: AddressService
    ) {}
    
    getPassengerById(id: number): Promise<Passenger | null> {
        const passenger = this.passengerRepository.findOne(
            { 
                where: { id },
                relations: ["address", "medical", "passport", "job", "agent"] 
            },
            
        );
        return passenger;
    }

    async getPassengers(query: QueryDTO, ctx: JwtPayload): Promise<{ passengers: Passenger[], total: number }> {
    
        const { 
            searchText = "", 
            skip = "0", 
            limit = "100000" 
        } = query;

        const [passengers, total] = await this.passengerRepository
                            .createQueryBuilder("passenger")
                            .leftJoinAndSelect("passenger.tenant", "tenant")
                            .leftJoinAndSelect("passenger.address", "address")
                            .leftJoinAndSelect("passenger.job", "job")
                            .leftJoinAndSelect("passenger.agent", "agent")
                            .leftJoinAndSelect("passenger.medical", "medical")
                            .leftJoinAndSelect("passenger.passport", "passport")
                            .where(
                                `(
                                    passenger.name LIKE :searchText OR 
                                    passenger.phone LIKE :searchText OR
                                    passport.number LIKE :searchText OR
                                    passenger.fatherName LIKE :searchText

                                ) AND passenger.deleted = false AND passenger.tenantId = ${ctx.tenantId}`, 
                                {
                                    searchText: `%${searchText}%`
                                }
                            )
                            .orderBy("passenger.createdAt", "DESC")
                            .skip(parseInt(skip))
                            .take(parseInt(limit))
                            .getManyAndCount()

        return { passengers, total };
    
    }

    
    async getUrgentPassengers(query: QueryDTO, ctx: JwtPayload): Promise<{ passengers: Passenger[], total: number }> {

        const { 
            limit = "100000" 
        } = query;

        const now = new Date();
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + 30);

        const [passengers, total] = await this.passengerRepository
                            .createQueryBuilder("passenger")
                            .leftJoinAndSelect("passenger.tenant", "tenant")
                            .leftJoinAndSelect("passenger.address", "address")
                            .leftJoinAndSelect("passenger.job", "job")
                            .leftJoinAndSelect("passenger.agent", "agent")
                            .leftJoinAndSelect("passenger.medical", "medical")
                            .leftJoinAndSelect("passenger.passport", "passport")
                            .where("passenger.status = :status", { status: "processing" })
                            .andWhere((new Brackets((qb) => {
                                qb.where("passenger.visaExpiryDate IS NOT NULL AND passenger.visaExpiryDate < :targetDate", { targetDate })
                                .orWhere("passport.expiryDate IS NOT NULL AND passport.expiryDate < :targetDate", { targetDate })
                                .orWhere("medical.expiryDate IS NOT NULL AND medical.expiryDate < :targetDate", { targetDate })
                                
                            })))
                            .orderBy("passenger.createdAt", "ASC")
                            .take(parseInt(limit))
                            .getManyAndCount()

        return { passengers, total };
    
    }

    async createPassenger(tenantId: number, createPassengerDto: CreatePassengerDTO): Promise<Passenger> {

        let address = await this.addressService.createAddress(createPassengerDto.address);

        const medical = this.medicalRepository.create(createPassengerDto.medical);
        await this.medicalRepository.save(medical);

        const passport = this.passportRepository.create(createPassengerDto.passport);
        await this.passportRepository.save(passport);

        const passenger = this.passengerRepository.create({
            ...createPassengerDto,
            tenantId,
            email: createPassengerDto.email ?? null,
            address,
            medical,
            passport
        });
        
        return this.passengerRepository.save(passenger);

    }

    private async editPassport(passportId: number, passport: PassportDTO) {

        const passportFieldsToUpdate: Partial<Passport> = { 
            ...passport, 
            date: passport.date ? new Date(passport.date) : undefined,
            expiryDate: passport.expiryDate ? new Date(passport.expiryDate) : undefined
        };
        
        const result = await this.passportRepository.update(
            { id: passportId },
            passportFieldsToUpdate
        );

        if(result.affected === 0) {
            throw new NotFoundException("Passport Record Not Found")
        }
    }

    private async editMedical(medicalId: number, medical: MedicalDTO) {

        const medicalFieldsToUpdate: Partial<Passport> = { 
            ...medical, 
            date: medical.date ? new Date(medical.date) : undefined,
            expiryDate: medical.expiryDate ? new Date(medical.expiryDate) : undefined
        };
        
        const result = await this.medicalRepository.update(
            { id: medicalId },
            medicalFieldsToUpdate
        );

        if(result.affected === 0) {
            throw new NotFoundException("Medical Record Not Found")
        }
    }

    async editPassenger(passengerId: string, requestBody: CreatePassengerDTO): Promise<Passenger | null> {

        const id = parseInt(passengerId);
        const { birthDate, visaExpiryDate, visaIssueDate, jobId } = requestBody;

        const passenger = await this.getPassengerById(id);
        if(!passenger) throw new NotFoundException("Passenger Not Found")

        let fieldsToUpdate: Partial<Passenger> = { 
            ...requestBody,
            birthDate: birthDate ? new Date(birthDate) : undefined,
            visaExpiryDate: visaExpiryDate ? new Date(visaExpiryDate) : undefined,
            visaIssueDate: visaIssueDate ? new Date(visaIssueDate) : undefined,
            address: undefined,
            passport: undefined,
            medical: undefined
        };

        await this.addressService.editAddress(
            passenger?.address.id,
            requestBody.address
        );

        if(requestBody.passport) {
            await this.editPassport(passenger.passport.id, requestBody.passport);
        }

        if(requestBody.medical) {
            await this.editMedical(passenger.medical.id, requestBody.medical);
        }

        const result = await this.passengerRepository.update(
            { id },
            fieldsToUpdate
        );

        if(result.affected === 0) {
            throw new NotFoundException("Passenger Not Found")
        }

        if(passenger.job && !jobId) {
            passenger.job = null;
            await this.passengerRepository.save(passenger);
        }

        return this.passengerRepository.findOne({ where: { id } });

    }

    async deletePassenger(id?: string): Promise<void> {
        await this.passengerRepository.update({ id: parseInt(id as string) }, { deleted: true })
    }

}