import {ForeignConstraintType} from "App/services/types";

export default class PGMigrationForeignConstraintStringBuilder {


  public async buildForeignReference(adonisSchema:ForeignConstraintType): Promise<string> {
    const deferred = adonisSchema.IS_DEFERRABLE ? "deferred" : "immediate";
    return `        table.foreign('${adonisSchema.COLUMN_NAME}','${adonisSchema.CONSTRAINT_NAME}').references('${adonisSchema.REFERENCED_COLUMN_NAME}').inTable('${adonisSchema.REFERENCED_TABLE_NAME}').onDelete('${adonisSchema.DELETE_RULE}').onUpdate('${adonisSchema.UPDATE_RULE}').deferrable('${deferred}')`;
  }

}
