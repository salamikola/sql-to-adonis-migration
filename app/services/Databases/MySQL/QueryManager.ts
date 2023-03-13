import {QuerySchemaContract} from "App/services/contract";
import {QueryClient} from "@adonisjs/lucid/build/src/QueryClient";
import {TableInfoType, TableSchemaType} from "App/services/types";

export default class MysqlQueryManger implements QuerySchemaContract {

  client: QueryClient;
  dbName: string;

  async getTableConstraints(table: string): Promise<any> {
    return this.client.rawQuery(`SELECT
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE.REFERENCED_TABLE_NAME,
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE.CONSTRAINT_NAME,
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE.COLUMN_NAME,
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE.TABLE_NAME,
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE.REFERENCED_COLUMN_NAME,
    INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS.UPDATE_RULE,
    INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS.DELETE_RULE
FROM
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
LEFT JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS ON
    INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS.CONSTRAINT_SCHEMA = INFORMATION_SCHEMA.KEY_COLUMN_USAGE.TABLE_SCHEMA AND INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS.TABLE_NAME = INFORMATION_SCHEMA.KEY_COLUMN_USAGE.TABLE_NAME
    AND INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS.REFERENCED_TABLE_NAME = INFORMATION_SCHEMA.KEY_COLUMN_USAGE.REFERENCED_TABLE_NAME
WHERE
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE.TABLE_SCHEMA = ? AND INFORMATION_SCHEMA.KEY_COLUMN_USAGE.TABLE_NAME = ? AND INFORMATION_SCHEMA.KEY_COLUMN_USAGE.REFERENCED_TABLE_SCHEMA IS NOT NULL`,
      [this.dbName, table])
  }

  async getTableIndexes(table: string): Promise<any> {
    const tableIndex = await this.client.rawQuery(`SELECT NON_UNIQUE,INDEX_NAME,COLUMN_NAME,INDEX_TYPE,COMMENT FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [this.dbName, table]);
    const mergedTableIndex: object[] = [];
    for (const tableInd of tableIndex[0]) {
      // @ts-ignore
      const matchIndex = mergedTableIndex.findIndex(e => e.name === tableInd['INDEX_NAME']);
      if (matchIndex > -1) {
        const columnName = mergedTableIndex[matchIndex]['value']['COLUMN_NAME'];
        mergedTableIndex[matchIndex]['value']['COLUMN_NAME'] = `'${columnName}','${tableInd['COLUMN_NAME']}'`;
        break;
      }
      const item = {name: tableInd['INDEX_NAME'], value: tableInd};
      mergedTableIndex.push(item);
    }
    return mergedTableIndex;
  }

  async getTableInfo(table: string): Promise<TableInfoType> {
    const tableinfo = await this.client.rawQuery(`SELECT TABLE_COLLATION,ENGINE,TABLE_COMMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [this.dbName, table]);

    return tableinfo[0][0];
  }

  async getTableSchema(table: string): Promise<TableSchemaType[]> {
    return this.client.rawQuery(`SELECT COLUMN_NAME,COLUMN_DEFAULT,IS_NULLABLE,DATA_TYPE,CHARACTER_MAXIMUM_LENGTH,CHARACTER_SET_NAME,COLLATION_NAME,COLUMN_TYPE,COLUMN_KEY,EXTRA,COLUMN_COMMENT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [this.dbName, table])
  }

  async getTables(): Promise<string[]> {
    return await this.client.getAllTables();
  }

  setClient(client): void {
    this.client = client;
  }

  setDbName(dbName): void {
    this.dbName = dbName;
  }

}
