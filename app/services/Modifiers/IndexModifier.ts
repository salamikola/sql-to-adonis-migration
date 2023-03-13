export default class IndexModifier {

  private columnProperty = {
    "ALWAYS": "always",
    "AUTO_INCREMENT": "autoIncrement",
    "CHARSET": "charset",
    "COLLATION": "collation",
    "COMMENT": "comment",
    "DEFAULT": "default",
    "GENERATED_AS": "generatedAs",
    "NULLABLE": "nullable",
    "STORED_AS": "storedAs",
    "UNSIGNED": "unsigned",
    "USE_CURRENT": "useCurrent",
    "USE_CURRENT_ON_UPDATE": "useCurrentOnUpdate",
    "VIRTUAL_AS": "virtualAs"
  }


  public getColumnProperty(key: string): string {
    return this.columnProperty[key] ?? new Error('cant find column type')
  }
}
