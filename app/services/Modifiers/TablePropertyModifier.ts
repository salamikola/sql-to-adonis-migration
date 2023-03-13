export default class TablePropertyModifier {

  private tableProperty = {

    "CHARSET": 'charset',
    "COLLATION": 'collation',
    "ENGINE": 'engine',
    "COMMENT": 'comment'
  }

  public getTableProp(key: string): string {
    return this.tableProperty[key] ?? new Error('cant find table prop')
  }
}
