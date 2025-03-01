import { MigrationInterface, QueryRunner } from "typeorm";

export class AddModifyColumnToPassengers1740838466625 implements MigrationInterface {
    name = 'AddModifyColumnToPassengers1740838466625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`passengers\` ADD \`cost\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`passengers\` ADD \`sale\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`passengers\` DROP FOREIGN KEY \`FK_71bdaad9a2ca33d8c138c8b48f5\``);
        await queryRunner.query(`ALTER TABLE \`passengers\` CHANGE \`jobId\` \`jobId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`passengers\` ADD CONSTRAINT \`FK_71bdaad9a2ca33d8c138c8b48f5\` FOREIGN KEY (\`jobId\`) REFERENCES \`jobs\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`passengers\` DROP FOREIGN KEY \`FK_71bdaad9a2ca33d8c138c8b48f5\``);
        await queryRunner.query(`ALTER TABLE \`passengers\` CHANGE \`jobId\` \`jobId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`passengers\` ADD CONSTRAINT \`FK_71bdaad9a2ca33d8c138c8b48f5\` FOREIGN KEY (\`jobId\`) REFERENCES \`jobs\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`passengers\` DROP COLUMN \`sale\``);
        await queryRunner.query(`ALTER TABLE \`passengers\` DROP COLUMN \`cost\``);
    }

}
