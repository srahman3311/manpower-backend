import * as fs from 'fs';
import { join } from 'path';
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository, In, DataSource } from "typeorm";
import { renderFile } from 'ejs';
import puppeteer from "puppeteer";
import { toWords } from 'number-to-words';
import { Passenger } from "./entities/passenger.entity";
import { Medical } from "./entities/medical.entity";
import { Passport } from "./entities/passport.entity";
import { CreatePassengerDTO } from "./dto/create-passenger.dto";
import { QueryDTO } from "src/global/dto/param-query.dto";
import { AddressService } from "src/global/addresses/addresses.service";
import { TenantService } from 'src/tenants/tenants.service';
import { Flight } from './entities/flight.entity';

import { JwtPayload } from "src/global/types/JwtPayload";

@Injectable()
export class PassengerService {

    constructor(
        @InjectRepository(Passenger) private passengerRepository: Repository<Passenger>,
        private readonly addressService: AddressService,
        private readonly tenantService: TenantService,
        private dataSource: DataSource
    ) {}
    
    getPassengerById(id: number): Promise<Passenger | null> {
        const passenger = this.passengerRepository.findOne(
            { 
                where: { id },
                relations: ["address", "medical", "passport", "job", "agent", "flights"] 
            },
            
        );
        return passenger;
    }

    getPassengersByJobId(jobId: number): Promise<Passenger[]> {
        const passenger = this.passengerRepository.find(
            { 
                where: { jobId },
                relations: ["medical", "passport", "agent", "flights"] 
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
                            .leftJoinAndSelect("passenger.flights", "flights")
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

    async createPassengerInvoice(tenantId: number, body: { passengerIds: number[] }): Promise<string> {

        const tenant = await this.tenantService.getTenantById(tenantId);
        if(!tenant) throw new BadRequestException("Something went wrong");

        // Remove old invoice file.
        const unlinkFile = `invoice${tenant.id}${tenant.passengerInvoiceCount}.pdf`;
        const unlinkfilePath = join(__dirname, "../../public", unlinkFile);

        if(fs.existsSync(unlinkfilePath)) {
            fs.unlink(unlinkfilePath, (error) => {
                if(error) {
                    console.log(error);
                }
            })
        }

        const { passengerIds } = body;

        const passengerList = await this.passengerRepository.find({ 
            where: { id: In(passengerIds)},
            relations: ["tenant", "passport", "job", "agent"] 
        });

        const totalSale = passengerList.reduce((sum, currentPassenger) => {
            return sum + currentPassenger.sale;
        }, 0);
        
        const totalCost = passengerList.reduce((sum, currentPassenger) => {
        return sum + currentPassenger.cost;
        }, 0);

        let invoiceNumber: number | string = tenant.passengerInvoiceCount + 1;
        if(tenant.passengerInvoiceCount < 10) invoiceNumber = "00" + invoiceNumber 
        if(tenant.passengerInvoiceCount >= 10 && tenant.passengerInvoiceCount < 100) invoiceNumber = "0" + invoiceNumber 
        
        const profit = totalSale - totalCost;
        const amountinWords = toWords(totalSale);
        const date = new Date();
        const options: any = {
            day: "2-digit",
            month: "short",
            year: "numeric",
        };

        const formattedDate = date.toLocaleDateString("en-GB", options);
        const fileName = `invoice${tenant.id}${tenant.passengerInvoiceCount + 1}.pdf`
        const outputPath = join(__dirname, "../../public", fileName);

        const html = await renderFile(
            join(__dirname, "../../views/passenger-invoice.ejs"),
            {
                data: passengerList,
                formattedDate,
                uniqueId: "INV" + invoiceNumber,
                profit,
                amountinWords,
                totalSale,
                totalCost,
            }
        );

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);

        await page.pdf({
            path: outputPath,
            format: "A4",
            printBackground: true,
            margin: { top: "2cm", bottom: "2cm", left: "1cm", right: "1cm" },
            preferCSSPageSize: true,
        });

        await this.tenantService.updatePassengerInvoiceCount(
            tenantId, 
            tenant.passengerInvoiceCount + 1
        )

        await browser.close();

        return fileName;

    }

    
    async getUrgentPassengers(query: QueryDTO, ctx: JwtPayload): Promise<{ passengers: Passenger[], total: number }> {

        const { 
            limit = "100000" 
        } = query;

        const now = new Date();
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + 30);

        const [passengers, total] = await this.passengerRepository
                                    .createQueryBuilder('passenger')
                                    .leftJoinAndSelect("passenger.tenant", "tenant")
                                    .leftJoinAndSelect("passenger.address", "address")
                                    .leftJoinAndSelect("passenger.job", "job")
                                    .leftJoinAndSelect("passenger.agent", "agent")
                                    .leftJoinAndSelect("passenger.medical", "medical")
                                    .leftJoinAndSelect("passenger.passport", "passport")
                                    .where(
                                        `
                                            passenger.deleted = false AND
                                            passenger.status = 'processing' AND
                                            passenger.tenantId = ${ctx.tenantId}
                                        `
                                    )
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

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            const address = await this.addressService.createAddressWithTransaction(
                queryRunner, 
                createPassengerDto.address
            )

            const medical = queryRunner.manager.create(Medical, createPassengerDto.medical)
            await queryRunner.manager.save(medical);

            const passport = queryRunner.manager.create(Passport, createPassengerDto.passport);
            await queryRunner.manager.save(passport);

            const passenger = queryRunner.manager.create(Passenger, {
                ...createPassengerDto,
                tenantId,
                address,
                medical,
                passport
            });
            const savedPassenger = await queryRunner.manager.save(passenger);
            await queryRunner.commitTransaction();
            return savedPassenger;
           
        } catch(error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }

    }

    async editPassenger(passengerId: string, requestBody: CreatePassengerDTO): Promise<Passenger | null> {

        const id = parseInt(passengerId);
        const { 
            birthDate, 
            visaExpiryDate, 
            visaIssueDate, 
            visaApplicationDate,
            visaApplicationFingerDate,
            visaBMETFingerDate,
            jobId,
            medical,
            passport,
            flights, 
        } = requestBody;

        const passenger = await this.getPassengerById(id);
        if(!passenger) throw new NotFoundException("Passenger Not Found")

        let fieldsToUpdate: Partial<Passenger> = { 
            ...requestBody,
            birthDate: birthDate ? new Date(birthDate) : undefined,
            visaExpiryDate: visaExpiryDate ? new Date(visaExpiryDate) : undefined,
            visaIssueDate: visaIssueDate ? new Date(visaIssueDate) : undefined,
            visaApplicationDate: visaApplicationDate ? new Date(visaApplicationDate) : undefined,
            visaApplicationFingerDate: visaApplicationFingerDate ? new Date(visaApplicationFingerDate) : undefined,
            visaBMETFingerDate: visaBMETFingerDate ? new Date(visaBMETFingerDate) : undefined,
            address: undefined,
            passport: undefined,
            medical: undefined,
            flights: undefined
        };
        const medicalFieldsToUpdate: Partial<Medical> = { 
            ...medical, 
            date: medical.date ? new Date(medical.date) : undefined,
            expiryDate: medical.expiryDate ? new Date(medical.expiryDate) : undefined
        };
       
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            if(requestBody.address) {
                await this.addressService.editAddressWithTransaction(
                    passenger.address.id,
                    queryRunner,
                    requestBody.address
                );
            }
        
            await queryRunner.manager.update(
                Medical, 
                { id: passenger.medical.id }, 
                medicalFieldsToUpdate
            )
            
            if(passport) {
                const passportFieldsToUpdate: Partial<Passport> = { 
                    ...passport, 
                    date: passport?.date ? new Date(passport.date) : undefined,
                    expiryDate: passport?.expiryDate ? new Date(passport.expiryDate) : undefined
                };
                await queryRunner.manager.update(
                    Passport, 
                    { id: passenger.passport.id }, 
                    passportFieldsToUpdate
                )
            }

            const flightsToDelete = passenger.flights.filter(flight => {
                const doesExist = flights.some(item => item.id && item.id === flight.id);
                return !doesExist
            }).map(flight => flight.id);

            if(flightsToDelete.length) {
                await queryRunner.manager.delete(Flight, { id: In(flightsToDelete) });      
            }

            const flightsToAdd = flights.filter(flight => !flight.id).map(flight => {
                return queryRunner.manager.create(Flight, { ...flight, passenger: { id } });
            });
            
            if(flightsToAdd.length) {
                await queryRunner.manager.save(flightsToAdd);
            }
          
            if(passenger.job && !jobId) {
                passenger.job = null;
                await queryRunner.manager.save(passenger);
            }

            await queryRunner.manager.update(
                Passenger, 
                { id: passenger.id }, 
                fieldsToUpdate
            )
          
            await queryRunner.commitTransaction();
            return await this.getPassengerById(id);

        } catch(error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }

    }

    async deletePassenger(id?: string): Promise<void> {
        await this.passengerRepository.update({ id: parseInt(id as string) }, { deleted: true })
    }

}