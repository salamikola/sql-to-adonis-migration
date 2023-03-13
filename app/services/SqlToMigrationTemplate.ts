import SqlToMigrationContext from "App/services/SqlToMigrationContext";

export default class SqlToMigrationTemplate {

  public async generateCreateMigrationContent(sqlToMigrationContext: SqlToMigrationContext): Promise<string> {

    return `
import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Create${this.toPascalCase(sqlToMigrationContext.tableName)} extends BaseSchema {
  protected tableName = '${sqlToMigrationContext.tableName}';

  public async up() {
    this.schema.createTable(this.tableName, table => {
        ${sqlToMigrationContext.tableSchema}
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
    `;
  }


  public async generateUpdateMigrationContent(sqlToMigrationContext: SqlToMigrationContext): Promise<string> {

    return `
import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Alter${this.toPascalCase(sqlToMigrationContext.tableName)} extends BaseSchema {
  protected tableName = '${sqlToMigrationContext.tableName}';

  public async up() {
    this.schema.alterTable(this.tableName, table => {
        ${sqlToMigrationContext.tableIndex}
        ${sqlToMigrationContext.tableForeignConstraint}
    });
  }

  public async down() {

  }
}
    `;
  }

  public toPascalCase(word) {
    // Split the word into individual words
    const words = word.split('_');
    // Capitalize the first letter of each word
    const capitalizedWords = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    // Join the words back together
    return capitalizedWords.join('');
  }

}
