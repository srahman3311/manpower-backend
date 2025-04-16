import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyPassengerEntity1744822468556 implements MigrationInterface {
    name = 'ModifyPassengerEntity1744822468556'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`passengers\` CHANGE \`visaBMATFingerDate\` \`visaBMETFingerDate\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`passengers\` CHANGE \`visaBMETFingerDate\` \`visaBMATFingerDate\` datetime NULL`);
    }

}
