import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransactionEntity1742654213479 implements MigrationInterface {
    name = 'CreateTransactionEntity1742654213479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`transactions\` (\`tenantId\` int NOT NULL, \`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`debitedFromAccountId\` int NULL, \`creditedToAccountId\` int NULL, \`debitedFromUserId\` int NULL, \`creditedToUserId\` int NULL, \`userId\` int NOT NULL, \`amount\` int NOT NULL DEFAULT '0', \`deleted\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_948098d3c352bcd1d25c429a33b\` FOREIGN KEY (\`tenantId\`) REFERENCES \`tenants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_6daf781b363cb681d34f769c57e\` FOREIGN KEY (\`debitedFromAccountId\`) REFERENCES \`accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_c82c46b0b4aa867df45fe0596f3\` FOREIGN KEY (\`creditedToAccountId\`) REFERENCES \`accounts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_4d58b45a4bcc455b588393a13f9\` FOREIGN KEY (\`debitedFromUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_14991ffa7e6534ecd4b385ca520\` FOREIGN KEY (\`creditedToUserId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transactions\` ADD CONSTRAINT \`FK_6bb58f2b6e30cb51a6504599f41\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_6bb58f2b6e30cb51a6504599f41\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_14991ffa7e6534ecd4b385ca520\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_4d58b45a4bcc455b588393a13f9\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_c82c46b0b4aa867df45fe0596f3\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_6daf781b363cb681d34f769c57e\``);
        await queryRunner.query(`ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_948098d3c352bcd1d25c429a33b\``);
        await queryRunner.query(`DROP TABLE \`transactions\``);
    }

}
