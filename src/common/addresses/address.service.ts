import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { QueryDTO } from "src/common/dto/param-query.dto";
import { AddressDTO } from "./address.dto";
import { Address } from "src/common/addresses/address.entity";

@Injectable()

export class AddressService {

    constructor(@InjectRepository(Address) private addressRepository: Repository<Address>) {}
    
    getAddressById(id: number): Promise<Address | null> {
        const address = this.addressRepository.findOne({ where: { id } });
        return address;
    }

    async getAddresses(query: QueryDTO): Promise<{ addresses: Address[], total: number }> {
    
        const { 
            searchText = "", 
            skip = "0", 
            limit = "100000" 
        } = query;

        const [addresses, total] = await this.addressRepository
                            .createQueryBuilder("address")
                            .where(
                                `(
                                    address.line1 LIKE :searchText OR 
                                    address.line2 LIKE :searchText OR
                                    address.postalCode LIKE :searchText OR 
                                    address.city LIKE :searchText OR 
                                    address.state LIKE :searchText OR 
                                    address.country LIKE :searchText

                                ) AND deleted = false`, 
                                {
                                    searchText: `%${searchText}%`
                                }
                            )
                            .orderBy("address.createdAt", "DESC")
                            .skip(parseInt(skip))
                            .take(parseInt(limit))
                            .getManyAndCount()

        return { addresses, total };
    
    }

    async createAddress(addressDto?: AddressDTO): Promise<Address> {
        const address = this.addressRepository.create({ ...addressDto });
        return this.addressRepository.save(address);
    }

    async editAddress(addressId?: number, addressDto?: AddressDTO): Promise<Address | null> {

        const addressFieldsToUpdate: Partial<Address> = { ...addressDto };

        const result = await this.addressRepository.update(
            { id: addressId },
            addressFieldsToUpdate
        );

        if(result.affected === 0) {
            throw new NotFoundException("Address Not Found")
        }

        return this.addressRepository.findOne({ where: { id: addressId } });

    }

    async deleteAddress(id?: string): Promise<void> {
        await this.addressRepository.update({ id: parseInt(id as string) }, { deleted: true })
    }

}