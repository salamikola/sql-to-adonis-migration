import {BaseCommand, flags} from '@adonisjs/core/build/standalone'
import {DatabaseContract} from '@ioc:Adonis/Lucid/Database'
import SqlToMigrationService from "../src/SqlToMigrationService";
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { KernelContract } from '@adonisjs/ace/build/src/Contracts'
import { ConfigContract } from '@ioc:Adonis/Core/Config'


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
  private config: ConfigContract
  private dbInstance: DatabaseContract

  @flags.array({description: 'Exclude these table from migration generator', name: 'ignores'})
  public ignores: string[]

  @flags.array({description: 'Migration generator will include only these tables', name: 'tables'})
  public tables: string[]

  @flags.array({description: 'Path to write the migration files', name: 'path'})
  public path: string

  @flags.array({description: 'The name of the database to generate the migration for', name: 'dbname'})
  public dbname: string



  constructor(application: ApplicationContract, kernel: KernelContract) {
    super(application, kernel)
    this.config = application.container.use('Adonis/Core/Config')
    this.dbInstance = application.container.use('Adonis/Lucid/Database')
  }

  public async run() {
    try {
      const allFlags = this.getAllFlags();
      const sqlToMigrationService = new SqlToMigrationService(this.config,this.dbInstance,allFlags);
      const migrationFiles = await sqlToMigrationService.handler();
      await this.createMigrationFiles(migrationFiles)
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
