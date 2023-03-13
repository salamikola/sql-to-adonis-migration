import ColumnPropertyModifier from "App/services/Modifiers/ColumnPropertyModifier";
import {PGSchemaColumnBuilderType} from "App/services/Databases/PostgreSQL/types";
import PGColumnTypeModifier from "App/services/Databases/PostgreSQL/Modifiers/ColumnTypeModifier";

export default class PGSqlToMigrationColumnStringBuilder {
  private columnPropertyModifier: ColumnPropertyModifier;
  private columnTypeModifier: PGColumnTypeModifier;
  private columnName: string;
  private migrationColumnsWithLengthAndSet = [
    'bit',
    'bit varying',
    'character',
    'character varying',
    'cidr',
    'inet',
    'macaddr',
    'numeric',
    'time',
    'timestamp',
    'interval',
    'varbit',
    'varchar'];

  private postgresPrecisionScaleTypes = [
    'numeric'
  ];

  private postgresPrecisionTypes = [
    'time',
    'timestamp',
    'interval'
  ];

  public constructor() {
    this.columnPropertyModifier = new ColumnPropertyModifier();
    this.columnTypeModifier = new PGColumnTypeModifier();
  }

  public async buildColumn(adonisSchema: PGSchemaColumnBuilderType): Promise<string> {
    let definition = '        table';
    this.columnName = adonisSchema.columnName;
    const columnType = this.getColumnType(adonisSchema);
    const defaultTo = PGSqlToMigrationColumnStringBuilder.getDefault(adonisSchema);
    const isNullable = PGSqlToMigrationColumnStringBuilder.getNullable(adonisSchema);
    const comment = PGSqlToMigrationColumnStringBuilder.getComment(adonisSchema);
    const signedness = PGSqlToMigrationColumnStringBuilder.getSignedness(adonisSchema);
    definition = definition + '.' + columnType + '.' + isNullable;
    if (defaultTo != null) definition = definition + '.' + defaultTo;
    if (comment != null) definition = definition + '.' + comment;
    if (signedness != null) definition = definition + '.' + signedness;
    return definition;
  }

  private getColumnType(adonisSchema): string {
    let columnType = this.columnTypeModifier.getColumnType(adonisSchema.dataType);
    let columnLength = '';
    if (adonisSchema.is_enum) {
      columnType = 'enum';
      const castColumnLengthToString = "'" +  adonisSchema.enum_values.join("','") + "'";
      const enumType = {
        useNative: true,
        enumName: adonisSchema.columnType,
        existingType: false,
        schemaName: 'public'
      };
      return `${columnType}('${this.columnName}',[${castColumnLengthToString}],${JSON.stringify(enumType)})`;
    }
    if (!this.hasColumnLength(adonisSchema)) {
      return `${columnType}('${this.columnName}')`;
    }
    columnLength = adonisSchema.length;
    return `${columnType}('${this.columnName}',${columnLength})`;
  }

  private static getDefault(adonisSchema): string | null {
    return adonisSchema.default != null ? `defaultTo('${adonisSchema.default}')` : null;
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

  private hasColumnLength(adonisSchema): boolean {
    return adonisSchema.length > 0;
  }

  private static getColumnLength(adonisSchema): string {
    const columnTypeProp = PGSqlToMigrationColumnStringBuilder.getColumnTypeProp(adonisSchema);
    // @ts-ignore
    return columnTypeProp.lengthAndSet;
  }

  private static getSignedness(adonisSchema): string | null {
    const columnTypeProp = PGSqlToMigrationColumnStringBuilder.getColumnTypeProp(adonisSchema);
    if (columnTypeProp['attributes'] == null) {
      return null;
    }
    return columnTypeProp['attributes'] === "signed" ? 'signed()' : 'unsigned()';
  }

  private static getColumnTypeProp(adonisSchema): object {
    const columnTypeToArray = adonisSchema.columnType.split(' ');
    const columnTypeObj = {'attributes': columnTypeToArray[1] ?? null, 'lengthAndSet': ''};
    const columnDataType = columnTypeToArray[0];
    const columnDataTypeArray = columnDataType.split('(');
    const columnLength = columnDataTypeArray[1]?.substring(0, columnDataTypeArray[1].length - 1) ?? null;
    columnTypeObj.lengthAndSet = adonisSchema.dataType == 'enum' ? `[${columnLength}]` : columnLength;
    return columnTypeObj;
  }
}
