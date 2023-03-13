import ColumnPropertyModifier from "App/services/Modifiers/ColumnPropertyModifier";
import ColumnTypeModifier from "App/services/Modifiers/ColumnTypeModifier";

export default class SqlToMigrationColumnStringBuilder {
  private columnPropertyModifier: ColumnPropertyModifier;
  private columnTypeModifier: ColumnTypeModifier;
  private columnName: string;
  private migrationColumnsWithLengthAndSet = ['string','float','decimal','binary','enum'];

  public constructor() {
    this.columnPropertyModifier = new ColumnPropertyModifier();
    this.columnTypeModifier = new ColumnTypeModifier();
  }

  public async buildColumn(adonisSchema): Promise<string> {
    this.columnName = adonisSchema.columnName;
    let definition = '        table';
    const columnType = this.getColumnType(adonisSchema);
    const defaultTo = SqlToMigrationColumnStringBuilder.getDefault(adonisSchema);
    const isNullable = SqlToMigrationColumnStringBuilder.getNullable(adonisSchema);
    const comment = SqlToMigrationColumnStringBuilder.getComment(adonisSchema);
    const signedness = SqlToMigrationColumnStringBuilder.getSignedness(adonisSchema);
    definition = definition + '.' + columnType + '.' + isNullable;
    if (defaultTo != null) definition = definition + '.' + defaultTo;
    if (comment != null) definition = definition + '.' + comment;
    if (signedness != null) definition = definition + '.' + signedness;
    // const charset = SqlToMigrationColumnStringBuilder.getCharset(adonisSchema);
    // const collation = SqlToMigrationColumnStringBuilder.getCollation(adonisSchema);
    // if (collation != null) definition = definition + '.' + collation;
    // if (charset != null) definition = definition + '.' + charset;

    return definition;
  }

  private getColumnType(adonisSchema): string {
    if (adonisSchema.extra.toUpperCase() === "AUTO_INCREMENT") {
      const ai = this.columnPropertyModifier.getColumnProperty(adonisSchema.extra);
      if (adonisSchema.key === "PRI") {
        return `${ai}('${this.columnName}')`;
      }
      return `${ai}('${this.columnName}', { primaryKey: false })`;
    }
    const columnType = this.columnTypeModifier.getColumnType(adonisSchema.dataType);
    if (!this.hasColumnLength(adonisSchema,columnType)) {
      return `${columnType}('${this.columnName}')`;
    }
    const columnLength = SqlToMigrationColumnStringBuilder.getColumnLength(adonisSchema);
    return `${columnType}('${this.columnName}',${columnLength})`;
  }

  private static getDefault(adonisSchema): string | null {
    return adonisSchema.default != null ? `defaultTo('${adonisSchema.default}')` : null;
  }

  private static getNullable(adonisSchema): string | null {
    return adonisSchema.isNullable ? `nullable()` : `notNullable()`;
  }

  private static getComment(adonisSchema): string | null {
    return adonisSchema.comment != '' ? `comment('${adonisSchema.comment}')` : null;
  }

  // private static getCollation(adonisSchema): string | null {
  //   return adonisSchema.collation != null ? `collate('${adonisSchema.collation}')` : null;
  // }
  //
  // private static getCharset(adonisSchema): string | null {
  //   return adonisSchema.charset != null ? `charset('${adonisSchema.charset}')` : null;
  // }

  private hasColumnLength(adonisSchema,columnType): boolean {
    return  this.migrationColumnsWithLengthAndSet.includes(columnType) && adonisSchema.columnType.split('(').length > 1;
  }

  private static getColumnLength(adonisSchema): string {
    const columnTypeProp = SqlToMigrationColumnStringBuilder.getColumnTypeProp(adonisSchema);
    // @ts-ignore
    return columnTypeProp.lengthAndSet;
  }

  private static getSignedness(adonisSchema): string | null {
    const columnTypeProp = SqlToMigrationColumnStringBuilder.getColumnTypeProp(adonisSchema);
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
