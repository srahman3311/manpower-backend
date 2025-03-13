import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMoreBankRelatedColumnsToAccountsTable1741714860426 implements MigrationInterface {
    name = 'AddMoreBankRelatedColumnsToAccountsTable1741714860426'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`accounts\` ADD \`bankBranchName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`accounts\` ADD \`bankAccountHolderName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`accounts\` ADD \`bankAccountNumber\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`accounts\` DROP COLUMN \`bankAccountNumber\``);
        await queryRunner.query(`ALTER TABLE \`accounts\` DROP COLUMN \`bankAccountHolderName\``);
        await queryRunner.query(`ALTER TABLE \`accounts\` DROP COLUMN \`bankBranchName\``);
    }

}
