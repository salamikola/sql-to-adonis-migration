import {TableIndexValueType} from "App/services/types";

export default class PGMigrationIndexStringBuilder {

  public async buildIndex(adonisSchema:TableIndexValueType): Promise<string> {
    let definition = '        table';
    const deferred = adonisSchema.IS_DEFFERABLE ? 'deferred' : 'immediate';
    const indexType = PGMigrationIndexStringBuilder.getIndexType(adonisSchema);
    const columnName = PGMigrationIndexStringBuilder.formatColumnName(adonisSchema.COLUMN_NAME)
    if (indexType === "primary") {
      definition = `${definition}.${indexType}([${columnName}],{constraintName:'${adonisSchema.INDEX_NAME}',deferrable:'${deferred}'})`;
    }
    if (indexType === "index") {
      definition = `${definition}.${indexType}([${columnName}],'${adonisSchema.INDEX_NAME}',{indexType:'${adonisSchema.INDEX_TYPE}'})`;
    }
    if (indexType === "unique") {
      definition = `${definition}.${indexType}([${columnName}],{indexName:'${adonisSchema.INDEX_NAME}',deferrable:'${deferred}'})`;
    }
    return definition;
  }

  private static getIndexType(adonisSchema): string {
    if (adonisSchema.IS_PRIMARY) {
      return 'primary';
    }
    if (adonisSchema.NON_UNIQUE) {
      return 'index';
    }
    return 'unique';
  }

  private static formatColumnName(columnName:string) : string {
    let arr = columnName.split(",");
    arr = arr.map(item => {
      item = item.replace(/^['"]+|['"]+$/g, '');
      return "'" + item + "'";
    });
    return arr.join(",");
  }



}
