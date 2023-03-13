export type TableInfoType = {
  ENGINE: string,
  TABLE_COLLATION: string,
  TABLE_COMMENT: string
}

export type TableSchemaType = {
  COLUMN_NAME: string,
  ENUM_LABEL?: string,
  CHARACTER_SET_NAME: string,
  COLUMN_TYPE: string,
  DATA_TYPE: string,
  CHARACTER_MAXIMUM_LENGTH: number,
  COLUMN_DEFAULT: string,
  IS_NULLABLE: string,
  COLUMN_COMMENT: string,
  ENUM_VALUES?: string[],
  EXTRA?: string,
  COLUMN_KEY?: string,
  COLLATION_NAME: string
}

export type TableIndexValueType = {
  NON_UNIQUE: boolean,
  INDEX_NAME: string,
  COLUMN_NAME: string,
  INDEX_TYPE: string,
  COMMENT: string,
  IS_PRIMARY: boolean,
  IS_DEFFERABLE?: boolean
}

export type TableIndexType = {
  name: string,
  value: TableIndexValueType
}

export type ForeignConstraintType = {
  COLUMN_NAME:string,
  CONSTRAINT_NAME:string,
  REFERENCED_COLUMN_NAME:string,
  REFERENCED_TABLE_NAME:string,
  DELETE_RULE:string,
  UPDATE_RULE:string,
  IS_DEFERRABLE?:boolean

}



