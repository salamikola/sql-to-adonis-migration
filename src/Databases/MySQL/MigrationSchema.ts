import {MigrationSchemaContract} from "../../contract";
import MysqlMigrationForeignConstraintStringBuilder from "../MySQL/MysqlMigrationForeignConstraintStringBuilder";
import MysqlMigrationColumnStringBuilder from "../MySQL/MysqlMigrationColumnStringBuilder";
import MysqlMigrationIndexStringBuilder from "./MysqlMigrationIndexStringBuilder";

export default class MySqlToMigrationSchema implements MigrationSchemaContract{
  private columnStringBuilder: MysqlMigrationColumnStringBuilder;
  private indexStringBuilder: MysqlMigrationIndexStringBuilder;
  private foreignConstraintStringBuilder: MysqlMigrationForeignConstraintStringBuilder;

  public constructor() {
    this.columnStringBuilder = new MysqlMigrationColumnStringBuilder();
    this.indexStringBuilder = new MysqlMigrationIndexStringBuilder();
    this.foreignConstraintStringBuilder = new MysqlMigrationForeignConstraintStringBuilder();
  }

  public async convertTableDefinitionToAdonisBuilder(columnDefinitions) {
    const adonisSchemaKey = {
      "columnName": columnDefinitions.COLUMN_NAME,
      "default": columnDefinitions.COLUMN_DEFAULT,
      "isNullable": columnDefinitions.IS_NULLABLE == "YES",
      "dataType": columnDefinitions.DATA_TYPE,
      "length": columnDefinitions.CHARACTER_MAXIMUM_LENGTH,
      "charSet": columnDefinitions.CHARACTER_SET_NAME,
      "collation": columnDefinitions.COLLATION_NAME,
      "columnType": columnDefinitions.COLUMN_TYPE,
      "key": columnDefinitions.COLUMN_KEY,
      "extra": columnDefinitions.EXTRA,
      "comment": columnDefinitions.COLUMN_COMMENT
    };
    return this.columnStringBuilder.buildColumn(adonisSchemaKey);
  }

  public async convertIndexDefinitionToAdonisBuilder(columnDefinitions) {
    const adonisIndex = {
      "isUnique": columnDefinitions.NON_UNIQUE == 0,
      "name": columnDefinitions.INDEX_NAME,
      "column": columnDefinitions.COLUMN_NAME,
      "type": columnDefinitions.INDEX_TYPE,
      "comment": columnDefinitions.COMMENT
    };
    return this.indexStringBuilder.buildIndex(adonisIndex);
  }

  public async convertForeignDefinitionToAdonisBuilder(columnDefinitions) {
    const adonisIndex = {
      "constraintName": columnDefinitions.CONSTRAINT_NAME,
      "columnName": columnDefinitions.COLUMN_NAME,
      "referenceTableSchema": columnDefinitions.REFERENCED_TABLE_SCHEMA,
      "referencedTableName": columnDefinitions.REFERENCED_TABLE_NAME,
      "referencedColumnName": columnDefinitions.REFERENCED_COLUMN_NAME,
      "tableName" :  columnDefinitions.TABLE_NAME,
      "updateRule" : columnDefinitions.UPDATE_RULE,
      "deleteRule" : columnDefinitions.DELETE_RULE,
    }
    return await this.foreignConstraintStringBuilder.buildForeignReference(adonisIndex);
  }

}
