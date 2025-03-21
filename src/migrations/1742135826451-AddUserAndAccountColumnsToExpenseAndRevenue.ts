import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserAndAccountColumnsToExpenseAndRevenue1742135826451 implements MigrationInterface {
    name = 'AddUserAndAccountColumnsToExpenseAndRevenue1742135826451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`expenses\` ADD \`debitedFromAccountId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`expenses\` ADD \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`revenues\` ADD \`creditedToAccountId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`revenues\` ADD \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`expenses\` ADD CONSTRAINT \`FK_12050bb40e8a820649f62a2a87b\` FOREIGN KEY (\`debitedFromAccountId\`) REFERENCES \`accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`expenses\` ADD CONSTRAINT \`FK_3d211de716f0f14ea7a8a4b1f2c\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`revenues\` ADD CONSTRAINT \`FK_8a1e7a20de242adc0bc766b1d7b\` FOREIGN KEY (\`creditedToAccountId\`) REFERENCES \`accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`revenues\` ADD CONSTRAINT \`FK_ce7e6f779e984069294ad9bb303\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`revenues\` DROP FOREIGN KEY \`FK_ce7e6f779e984069294ad9bb303\``);
        await queryRunner.query(`ALTER TABLE \`revenues\` DROP FOREIGN KEY \`FK_8a1e7a20de242adc0bc766b1d7b\``);
        await queryRunner.query(`ALTER TABLE \`expenses\` DROP FOREIGN KEY \`FK_3d211de716f0f14ea7a8a4b1f2c\``);
        await queryRunner.query(`ALTER TABLE \`expenses\` DROP FOREIGN KEY \`FK_12050bb40e8a820649f62a2a87b\``);
        await queryRunner.query(`ALTER TABLE \`revenues\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`revenues\` DROP COLUMN \`creditedToAccountId\``);
        await queryRunner.query(`ALTER TABLE \`expenses\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`expenses\` DROP COLUMN \`debitedFromAccountId\``);
    }

}
