export type PGSchemaColumnBuilderType = {
  columnName: string,
  default: string,
  isNullable: boolean,
  dataType: string,
  length: number,
  charSet: string | null,
  collation: string | null,
  columnType: string,
  comment: string | null,
  is_enum: boolean,
  enum_values: string[] | null

}
