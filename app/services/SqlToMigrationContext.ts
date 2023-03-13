import {TableIndexType, TableSchemaType} from "App/services/types";
import {MigrationSchemaContract} from "App/services/contract";
import MySqlToMigrationSchema from "App/services/Databases/MySQL/MigrationSchema";
import PGToMigrationSchema from "App/services/Databases/PostgreSQL/MigrationSchema";


export default class SqlToMigrationContext {

  private _tableName: string;
  private _tableSchema: string;
  private _tableIndex: string;
  private _tableForeignConstraint: string;
  private _tableComment: string;
  private _tableCollation: string;
  private _engine: string;
  private _dbType: string;

  public get tableName(): string {
    return this._tableName;
  }

  get tableSchema(): string {
    return this._tableSchema;
  }

  get tableIndex(): string {
    return this._tableIndex;
  }

  get tableComment(): string {
    return this._tableComment;
  }

  get tableCollation(): string {
    return this._tableCollation;
  }

  get tableForeignConstraint(): string {
    return this._tableForeignConstraint;
  }

  get engine(): string {
    return this._engine;
  }


  public setTableName(tableName): void {
    this._tableName = tableName;
  }


  public setDbType(dbType): void {
    this._dbType = dbType;
  }

  public setTableDefinitionContext(tableInfo: any): void {
    this._tableCollation = tableInfo.TABLE_COLLATION;
    this._tableComment = tableInfo.TABLE_COMMENT;
    this._engine = tableInfo.ENGINE;
  }

  public async setTableSchemaContext(tableSchemas: TableSchemaType[]): Promise<void> {
    const sqlToMigrationSchema = SqlToMigrationContext.getSchemaManager(this._dbType);
    let columnDefinitionStringBuilder = '';
    for (const tableSchema of tableSchemas) {
      const columnDefinition = await sqlToMigrationSchema.convertTableDefinitionToAdonisBuilder(tableSchema);
      columnDefinitionStringBuilder = columnDefinitionStringBuilder + '\n' + columnDefinition;
    }
    this._tableSchema = columnDefinitionStringBuilder;
  }

  public async setTableIndexContext(tableIndexes: TableIndexType[]): Promise<void> {
    const sqlToMigrationSchema = SqlToMigrationContext.getSchemaManager(this._dbType);
    let indexDefinitionStringBuilder = '';
    for (const indexSchema of tableIndexes) {
      // @ts-ignore
      console.log('ff')
      const columnDefinition = await sqlToMigrationSchema.convertIndexDefinitionToAdonisBuilder(indexSchema.value);
      indexDefinitionStringBuilder = indexDefinitionStringBuilder + '\n' + columnDefinition;
    }
    console.log(indexDefinitionStringBuilder);
    this._tableIndex = indexDefinitionStringBuilder;
  }

  public async setTableForeignContext(tableForeignConstraints: object[]): Promise<void> {
    const sqlToMigrationSchema =  SqlToMigrationContext.getSchemaManager(this._dbType);
    let constraintDefinitionStringBuilder = '';
    for (const constraintSchema of tableForeignConstraints) {
      // @ts-ignore
      const columnDefinition = await sqlToMigrationSchema.convertForeignDefinitionToAdonisBuilder(constraintSchema);
      constraintDefinitionStringBuilder = constraintDefinitionStringBuilder + '\n' + columnDefinition;
    }
    this._tableForeignConstraint = constraintDefinitionStringBuilder;

  }

  private static getSchemaManager(dbConnectionType: string): MigrationSchemaContract {
    let querySchemaManager;
    switch (dbConnectionType) {
      case 'mysql': {
        querySchemaManager = new MySqlToMigrationSchema();
        break;
      }
      case 'pg' : {
        querySchemaManager = new PGToMigrationSchema();
        break;
      }
      default: {
        querySchemaManager = new MySqlToMigrationSchema();
        break;
      }
    }
    return querySchemaManager;
  }

}
