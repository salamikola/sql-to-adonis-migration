import {QueryClient} from "@adonisjs/lucid/build/src/QueryClient";
import {
  ForeignConstraintType,
  TableIndexType,
  TableIndexValueType,
  TableInfoType,
  TableSchemaType
} from "App/services/types";

export interface QuerySchemaContract {

  client :  QueryClient;

  dbName : string;

  setClient(client): void;

  setDbName(client): void;

  getTables(): Promise<string[]>;

  getTableSchema(table: string): Promise<TableSchemaType[]>;

  getTableIndexes(table: string): Promise<TableIndexType[]>;

  getTableConstraints(table: string): Promise<ForeignConstraintType[]>;

  getTableInfo(table: string): Promise<TableInfoType>

}

export interface ColumnBuilderContract {

  buildColumn(adonisSchema: string): Promise<string>;

}

export interface IndexBuilderContract {

  buildIndex(adonisSchema: string): Promise<string>;

}

export interface ForeignConstraintBuilderContract {

  buildForeignReference(adonisSchema: string): Promise<string>;

}

export interface MigrationSchemaContract {

  convertTableDefinitionToAdonisBuilder(columnDefinitions: TableSchemaType): Promise<string>;

  convertIndexDefinitionToAdonisBuilder(columnDefinitions: TableIndexValueType): Promise<string>;

  convertForeignDefinitionToAdonisBuilder(columnDefinitions: ForeignConstraintType): Promise<string>;

}
