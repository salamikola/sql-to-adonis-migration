import {PGSchemaColumnBuilderType} from "../PostgreSQL/types";
import PGColumnTypeModifier from "../PostgreSQL/Modifiers/ColumnTypeModifier";

export default class PGSqlToMigrationColumnStringBuilder {

  private columnTypeModifier: PGColumnTypeModifier;
  private columnName: string;
  // private migrationColumnsWithLengthAndSet = [
  //   'bit',
  //   'bit varying',
  //   'character',
  //   'character varying',
  //   'cidr',
  //   'inet',
  //   'macaddr',
  //   'numeric',
  //   'time',
  //   'timestamp',
  //   'interval',
  //   'varbit',
  //   'varchar'
  // ];
  //
  // private postgresPrecisionScaleTypes = [
  //   'numeric'
  // ];
  //
  // private postgresPrecisionTypes = [
  //   'time',
  //   'timestamp',
  //   'interval'
  // ];

  public constructor() {
    this.columnTypeModifier = new PGColumnTypeModifier();
  }

  public async buildColumn(adonisSchema: PGSchemaColumnBuilderType): Promise<string> {
    let definition = '        table';
    this.columnName = adonisSchema.columnName;
    const columnType = this.getColumnType(adonisSchema);
    const defaultTo = PGSqlToMigrationColumnStringBuilder.getDefault(adonisSchema);
    const isNullable = PGSqlToMigrationColumnStringBuilder.getNullable(adonisSchema);
    const comment = PGSqlToMigrationColumnStringBuilder.getComment(adonisSchema);
    definition = definition + '.' + columnType + '.' + isNullable;
    if (defaultTo != null) definition = definition + '.' + defaultTo;
    if (comment != null) definition = definition + '.' + comment;
    return definition;
  }

  private getColumnType(adonisSchema: PGSchemaColumnBuilderType): string {
    let columnType = this.columnTypeModifier.getColumnType(adonisSchema.dataType);
    if (adonisSchema.is_autoincrement) {
      columnType = 'increments';
      return `${columnType}('${this.columnName}',{ primaryKey: false })`;
    }
    if (adonisSchema.is_enum && adonisSchema.enum_values) {
      columnType = 'enum';
      const castColumnLengthToString = "'" + adonisSchema.enum_values.join("','") + "'";
      const enumType = {
        useNative: true, enumName: adonisSchema.columnType, existingType: false, schemaName: 'public'
      };
      return `${columnType}('${this.columnName}',[${castColumnLengthToString}],${JSON.stringify(enumType)})`;
    }
    if (!PGSqlToMigrationColumnStringBuilder.hasColumnLength(adonisSchema)) {
      return `${columnType}('${this.columnName}')`;
    }
    const columnLength = adonisSchema.length;
    return `${columnType}('${this.columnName}',${columnLength})`;
  }

  private static getDefault(adonisSchema: PGSchemaColumnBuilderType): string | null {
    if (adonisSchema.is_autoincrement) {
      return null;
    }

    return adonisSchema.default != null ? `defaultTo('${adonisSchema.default.replace(/^['"]+|['"]+$/g, '')}')` : null;
  }

  private static getNullable(adonisSchema): string | null {
    return adonisSchema.isNullable ? `nullable()` : `notNullable()`;
  }

  private static getComment(adonisSchema): string | null {
    return adonisSchema.comment != null ? `comment('${adonisSchema.comment}')` : null;
  }

  // private static getCollation(adonisSchema): string | null {
  //   return adonisSchema.collation != null ? `collate('${adonisSchema.collation}')` : null;
  // }
  //
  // private static getCharset(adonisSchema): string | null {
  //   return adonisSchema.charset != null ? `charset('${adonisSchema.charset}')` : null;
  // }

  private static hasColumnLength(adonisSchema): boolean {
    return adonisSchema.length > 0;
  }

}
