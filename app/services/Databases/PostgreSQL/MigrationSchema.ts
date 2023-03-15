import {MigrationSchemaContract} from "App/services/contract";
import PGSqlToMigrationColumnStringBuilder from "App/services/Databases/PostgreSQL/SqlToMigrationColumnStringBuilder";
import {TableIndexValueType, TableSchemaType} from "App/services/types";
import {PGSchemaColumnBuilderType} from "App/services/Databases/PostgreSQL/types";
import PGMigrationIndexStringBuilder from "App/services/Databases/PostgreSQL/PGMigrationIndexStringBuilder";
import PGMigrationForeignConstraintStringBuilder
  from "App/services/Databases/PostgreSQL/PGMigrationForeignConstraintStringBuilder";

export default class PGToMigrationSchema implements MigrationSchemaContract{
  private columnStringBuilder: PGSqlToMigrationColumnStringBuilder;
  private indexStringBuilder: PGMigrationIndexStringBuilder;
  private foreignConstraintStringBuilder: PGMigrationForeignConstraintStringBuilder;

  public constructor() {
    this.columnStringBuilder = new PGSqlToMigrationColumnStringBuilder();
    this.indexStringBuilder = new PGMigrationIndexStringBuilder();
    this.foreignConstraintStringBuilder = new PGMigrationForeignConstraintStringBuilder();
  }

  public async convertTableDefinitionToAdonisBuilder(columnDefinitions:TableSchemaType) {
    const adonisSchemaKey : PGSchemaColumnBuilderType = {
      "columnName": columnDefinitions.COLUMN_NAME,
      "default": columnDefinitions.COLUMN_DEFAULT,
      "isNullable": columnDefinitions.IS_NULLABLE == "YES",
      "dataType": columnDefinitions.DATA_TYPE,
      "length": columnDefinitions.CHARACTER_MAXIMUM_LENGTH,
      "charSet": columnDefinitions.CHARACTER_SET_NAME,
      "collation": columnDefinitions.COLLATION_NAME,
      "columnType": columnDefinitions.COLUMN_TYPE,
      "comment": columnDefinitions.COLUMN_COMMENT,
      "is_enum" : typeof columnDefinitions.ENUM_VALUES != "undefined",
      "enum_values" : columnDefinitions.ENUM_VALUES ?? null,
      "is_autoincrement":columnDefinitions.IS_AUTO_INCREMENT
    };
    return this.columnStringBuilder.buildColumn(adonisSchemaKey);
  }

  public async convertIndexDefinitionToAdonisBuilder(indexDefinitions:TableIndexValueType) {

    return this.indexStringBuilder.buildIndex(indexDefinitions);
  }

  public async convertForeignDefinitionToAdonisBuilder(foreignConstraintDefinitions) {

    return await this.foreignConstraintStringBuilder.buildForeignReference(foreignConstraintDefinitions);
  }
}
