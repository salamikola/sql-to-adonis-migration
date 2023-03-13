import {BaseCommand, flags} from '@adonisjs/core/build/standalone'
import SqlToMigrationService from "App/services/SqlToMigrationService";


export default class SqlToMigration extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'sql:to_migration'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = ''

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  @flags.array({description: 'Exclude these table from migration generator', name: 'ignores'})
  public ignores: string[]

  @flags.array({description: 'Migration generator will include only these tables', name: 'tables'})
  public tables: string[]

  @flags.array({description: 'Path to write the migration files', name: 'path'})
  public path: string


  public async run() {
    try {
      const allFlags = this.getAllFlags();
      const sqlToMigrationService = new SqlToMigrationService(allFlags);
      const migrationFiles = await sqlToMigrationService.handler();
      await this.createMigrationFiles(migrationFiles);
      this.logger.info('Hello world!')
    } catch (e) {
      this.logger.error(e.message)
    }
  }


  public async createMigrationFiles(files): Promise<void> {
    const path = this.path ?? 'database/migrations'
    for (const file of files) {
      this.generator
        .addFile(file.fileName)
        .appRoot(this.application.appRoot)
        .destinationDir(path)
        .stub(file.fileContent,{raw:true})
    }
    await this.generator.run()

  }

  public getAllFlags() {
    return {ignores: this.ignores, tables: this.tables}
  }

}
