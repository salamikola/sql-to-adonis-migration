import Config from "@ioc:Adonis/Core/Config";
import Database from '@ioc:Adonis/Lucid/Database'
import SqlToMigrationContext from "App/services/SqlToMigrationContext";
import SqlToMigrationTemplate from "App/services/SqlToMigrationTemplate";
import {QuerySchemaContract} from "App/services/contract";
import MysqlQueryManger from "App/services/Databases/MySQL/QueryManager";
import PGQueryManger from "App/services/Databases/PostgreSQL/QueryManager";

export default class SqlToMigrationService {

  private client: any;
  private dbName: string = 'vale_finance';
  private args: any;
  private sqlToMigrationContext: SqlToMigrationContext;
  private migrationFiles: object[] = [];
  private manager : QuerySchemaContract;
  private connectionType : string


  constructor(args: any) {
    this.args = args;
    this.sqlToMigrationContext = new SqlToMigrationContext();
  }


  public async handler(): Promise<object[]> {
    this.dbName = 'e_doc';
    this.connectionType = Config.get('database.connection');
    this.client = Database.connection(this.connectionType, {mode: 'read'});
    this.manager = SqlToMigrationService.getDatabaseQueryManager(this.connectionType);
    this.manager.setClient(this.client);
    this.manager.setDbName(this.dbName);
    const tables = await this.manager.getTables();
    const filteredTables = await this.filterTables(tables);
    await this.startMigration(filteredTables);
    return this.migrationFiles;
  }


  private async filterTables(tables: string[]): Promise<string[]> {
    if (this.args.ignores) {
      return tables.filter((table) => {
        return !this.args.ignores.includes(table);
      });
    }
    if (this.args.tables) {
      return tables.filter((table) => {
        return this.args.tables.includes(table);
      });
    }
    return tables;
  }

  private async startMigration(tables: string[]) {

    for (const table of tables) {
      await this.createTable(table);
    }

    for (const table of tables) {
      await this.alterTable(table);
    }


  }

  private async createTable(table) {
    this.sqlToMigrationContext = new SqlToMigrationContext();
    this.sqlToMigrationContext.setDbType(this.connectionType)
    this.sqlToMigrationContext.setTableName(table);
    const tableInfo = await this.manager.getTableInfo(table);
    this.sqlToMigrationContext.setTableDefinitionContext(tableInfo);
    const tableSchema = await this.manager.getTableSchema(table);
    await this.sqlToMigrationContext.setTableSchemaContext(tableSchema);
    const sqlToMigrationTemplate = new SqlToMigrationTemplate();
    const migrationContext = await sqlToMigrationTemplate.generateCreateMigrationContent(this.sqlToMigrationContext);
    const migrationFileName = SqlToMigrationService.generateMigrationFileName(table, 'create');
    await this.saveMigrationForTable(migrationContext, migrationFileName)
  }

  private async alterTable(table) {
    this.sqlToMigrationContext = new SqlToMigrationContext();
    this.sqlToMigrationContext.setDbType(this.connectionType)
    this.sqlToMigrationContext.setTableName(table);
    const indexes = await this.manager.getTableIndexes(table);
    await this.sqlToMigrationContext.setTableIndexContext(indexes);
    const tableForeignConstraint = await this.manager.getTableConstraints(table);
    await this.sqlToMigrationContext.setTableForeignContext(tableForeignConstraint);
    const sqlToMigrationTemplate = new SqlToMigrationTemplate();
    const migrationContext = await sqlToMigrationTemplate.generateUpdateMigrationContent(this.sqlToMigrationContext);
    const migrationFileName = SqlToMigrationService.generateMigrationFileName(table, 'alter');
    await this.saveMigrationForTable(migrationContext, migrationFileName)
  }


  private async saveMigrationForTable(content: string, fileName: string): Promise<void> {
    this.migrationFiles.push({fileName: fileName, fileContent: content});
  }

  private static generateMigrationFileName(tableName: string, operation: string): string {
    const unixTimestamp = Math.floor(Date.now() / 1000);
    return `${unixTimestamp}_${operation}_${tableName}.ts`;
  }



  private static getDatabaseQueryManager(dbConnectionType: string): QuerySchemaContract {

    let querySchemaManager;
    switch (dbConnectionType) {
      case 'mysql': {
        querySchemaManager = new MysqlQueryManger();
        break;
      }
      case 'pg' : {
        querySchemaManager = new PGQueryManger();
        break;
      }
      default: {
        querySchemaManager = new MysqlQueryManger();
        break;
      }
    }
    return querySchemaManager;


  }
}
