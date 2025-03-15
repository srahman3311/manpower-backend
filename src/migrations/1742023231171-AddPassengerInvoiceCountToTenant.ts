import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPassengerInvoiceCountToTenant1742023231171 implements MigrationInterface {
    name = 'AddPassengerInvoiceCountToTenant1742023231171'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tenants\` ADD \`passengerInvoiceCount\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tenants\` DROP COLUMN \`passengerInvoiceCount\``);
    }

}
