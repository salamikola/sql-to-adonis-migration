import {TableIndexValueType} from "App/services/types";

export default class PGMigrationIndexStringBuilder {

  public async buildIndex(adonisSchema:TableIndexValueType): Promise<string> {
    let definition = '        table';
    const deferred = adonisSchema.IS_DEFFERABLE ? 'deferred' : 'immediate';
    const indexType = PGMigrationIndexStringBuilder.getIndexType(adonisSchema);
    if (indexType === "primary") {
      definition = `${definition}.${indexType}(['${adonisSchema.COLUMN_NAME}'],{constraintName:'${adonisSchema.INDEX_NAME}',deferrable:'${deferred}'})`;
    }
    if (indexType === "index") {
      definition = `${definition}.${indexType}(['${adonisSchema.COLUMN_NAME}'],'${adonisSchema.INDEX_NAME}',{indexType:'${adonisSchema.INDEX_TYPE}'})`;
    }
    if (indexType === "unique") {
      definition = `${definition}.${indexType}(['${adonisSchema.COLUMN_NAME}'],{indexName:'${adonisSchema.INDEX_NAME}',deferrable:'${deferred}'})`;
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



}
