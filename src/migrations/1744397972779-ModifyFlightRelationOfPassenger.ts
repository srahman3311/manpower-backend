import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyFlightRelationOfPassenger1744397972779 implements MigrationInterface {
    name = 'ModifyFlightRelationOfPassenger1744397972779'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`flights\` ADD \`passengerId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`flights\` ADD CONSTRAINT \`FK_dc586d46f33474db966b0b755a3\` FOREIGN KEY (\`passengerId\`) REFERENCES \`passengers\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`flights\` DROP FOREIGN KEY \`FK_dc586d46f33474db966b0b755a3\``);
        await queryRunner.query(`ALTER TABLE \`flights\` DROP COLUMN \`passengerId\``);
    }

}
