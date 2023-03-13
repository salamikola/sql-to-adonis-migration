
export default class SqlToMigrationForeignConstraintStringBuilder {


  public async buildForeignReference(adonisSchema): Promise<string> {
     return `        table.foreign('${adonisSchema.columnName}','${adonisSchema.constraintName}').references('${adonisSchema.referencedColumnName}').inTable('${adonisSchema.referencedTableName}').onDelete('${adonisSchema.deleteRule}').onUpdate('${adonisSchema.updateRule}')`;
  }

}
