import SqlToMigrationContext from "./SqlToMigrationContext";
import SqlToMigrationTemplate from "./SqlToMigrationTemplate";
import {QuerySchemaContract} from "./contract";
import MysqlQueryManger from "./Databases/MySQL/QueryManager";
import PGQueryManger from "./Databases/PostgreSQL/QueryManager";

export default class SqlToMigrationService {

  private client: any;
  private dbName = 'vale_finance';
  private args: any;
  private sqlToMigrationContext: SqlToMigrationContext;
  private migrationFiles: object[] = [];
  private manager: QuerySchemaContract;
  private connectionType: string


  constructor(private config: any, private db: any, args: any) {
    this.args = args;
    this.sqlToMigrationContext = new SqlToMigrationContext();
  }


  public async handler(): Promise<object[]> {
    this.connectionType = this.config.get('database.connection');
    this.dbName = this.args.dbname ?? this.config.get('database.connections')[this.connectionType]['connection']['database'];
    this.client = this.db.connection(this.connectionType, {mode: 'read'});
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
