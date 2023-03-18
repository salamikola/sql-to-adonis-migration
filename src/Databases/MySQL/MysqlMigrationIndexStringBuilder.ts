
export default class MysqlMigrationIndexStringBuilder {

    public async buildIndex(adonisSchema): Promise<string> {
        let definition = '        table';
        const indexType = MysqlMigrationIndexStringBuilder.getIndexType(adonisSchema);
        if (indexType === "primary") {
            definition = `${definition}.${indexType}(['${adonisSchema.column}'],{constraintName:'${adonisSchema.name}'})`;
        }
        if (indexType === "index") {
            definition = `${definition}.${indexType}(['${adonisSchema.column}'],'${adonisSchema.name}',{indexType:'${adonisSchema.type}'})`;
        }
        if (indexType === "unique") {
            definition = `${definition}.${indexType}(['${adonisSchema.column}'],{indexName:'${adonisSchema.name}'})`;
        }
        return definition;
    }

    private static getIndexType(adonisSchema): string {
        if (adonisSchema.name === "PRIMARY") {
            return 'primary';
        }
        if (adonisSchema.isUnique) {
            return 'unique';
        }
        return 'index';
    }



}
