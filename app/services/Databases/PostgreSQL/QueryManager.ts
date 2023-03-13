import {QuerySchemaContract} from "App/services/contract";
import {QueryClient} from "@adonisjs/lucid/build/src/QueryClient";
import {ForeignConstraintType, TableIndexType, TableInfoType, TableSchemaType} from "App/services/types";

export default class PGQueryManger implements QuerySchemaContract {

  client: QueryClient;
  dbName: string;

  async getTableConstraints(table: string): Promise<ForeignConstraintType[]> {
    const foreignConstraints = await this.client.rawQuery(`SELECT
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name,
    tc.is_deferrable,
    rc.update_rule,
    rc.delete_rule,
    rc.match_option
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.tables AS t
      ON t.table_schema = tc.table_schema
      AND t.table_name = tc.table_name
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
      AND rc.constraint_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY' AND
    t.table_catalog = ? AND
    tc.table_name = ? AND
    tc.table_schema = ?
    `, [this.dbName, table, 'public']);
    const foreignConstraintsTypeArr: ForeignConstraintType[] = [];
    for (const foreignConstraint of foreignConstraints.rows) {
      const constraints: ForeignConstraintType = {
        COLUMN_NAME: foreignConstraint.column_name,
        REFERENCED_TABLE_NAME: foreignConstraint.foreign_table_name,
        REFERENCED_COLUMN_NAME: foreignConstraint.foreign_column_name,
        UPDATE_RULE: foreignConstraint.update_rule,
        DELETE_RULE: foreignConstraint.delete_rule,
        CONSTRAINT_NAME: foreignConstraint.constraint_name,
        IS_DEFERRABLE: foreignConstraint.is_deferrable
      }
      foreignConstraintsTypeArr.push(constraints);
    }
    return foreignConstraintsTypeArr;
  }

  async getTableIndexes(table: string): Promise<TableIndexType[]> {
    const tableIndex = await this.client.rawQuery(`SELECT
            con.condeferrable,
            n.nspname AS schema_name,
            c.relname AS table_name,
            des.description AS index_comment,
            i.relname AS index_name,
            regexp_replace(idx.indexdef, '.*\\((.*)\\)', '\\1') AS column_name,
            CASE
                WHEN idx.indexdef LIKE '% USING btree%' THEN 'BTREE'
                WHEN idx.indexdef LIKE '% USING hash%' THEN 'HASH'
                WHEN idx.indexdef LIKE '% USING gist%' THEN 'GiST'
                WHEN idx.indexdef LIKE '% USING gin%' THEN 'GIN'
                ELSE 'Unknown'
            END AS index_structure,
            CASE
                WHEN idx.indexdef LIKE 'CREATE UNIQUE INDEX%' THEN 'Unique'
                ELSE 'Non-Unique'
            END AS index_type,
            CASE
                WHEN con.contype = 'p' THEN 'Primary Key'
                ELSE ''
            END AS index_key_type
      FROM
            pg_class c
      INNER JOIN
            pg_namespace n ON n.oid = c.relnamespace
      INNER JOIN
            pg_indexes idx ON idx.tablename = c.relname AND idx.schemaname = n.nspname
      INNER JOIN
            pg_class i ON i.relname = idx.indexname AND i.relnamespace = n.oid
      LEFT JOIN
            pg_constraint con ON con.conrelid = c.oid AND con.conindid = i.oid
      INNER JOIN
            pg_database d ON d.datname = ?
      LEFT JOIN
            pg_description des ON des.objoid = i.oid AND des.objsubid = 0
      WHERE
            c.relname = ?
            AND n.nspname = ?;
      `, [this.dbName, table, 'public']);
    const mergedTableIndex: TableIndexType[] = [];
    for (const index of tableIndex.rows) {
      const item: TableIndexType = {
        name: index['index_name'], value: {
          INDEX_NAME: index.index_name,
          COLUMN_NAME: index.column_name,
          INDEX_TYPE: index.index_structure,
          NON_UNIQUE: index.index_type === 'Non-Unique',
          COMMENT: index.index_comment,
          IS_PRIMARY: index.index_key_type === 'Primary Key',
          IS_DEFFERABLE: index.condeferrable == true
        }
      };
      mergedTableIndex.push(item);
    }
    return mergedTableIndex;
  }

  async getTableInfo(table: string): Promise<TableInfoType> {
    const tableinfo = await this.client.rawQuery(`SELECT
      pg_class.relpersistence AS ENGINE,
      pg_database.datcollate AS TABLE_COLLATION,
      pg_description.description AS TABLE_COMMENT
FROM
    pg_class
    LEFT JOIN pg_database ON pg_database.datname = ?
    LEFT JOIN pg_description ON pg_description.objoid = pg_class.oid
WHERE
    pg_class.relname = ?`,
      [this.dbName, table]);
    return {
      'ENGINE': tableinfo.rows[0].engine,
      'TABLE_COLLATION': tableinfo.rows[0].table_collation,
      'TABLE_COMMENT': tableinfo.rows[0].table_comment
    };
  }

  async getTableSchema(table: string): Promise<TableSchemaType[]> {

    const tableSchema = await this.client.rawQuery(`select pg_enum.enumlabel, column_name, character_set_name, udt_name, data_type, character_maximum_length, column_default, is_nullable,
        col_description((table_schema||'.'||table_name)::regclass::oid, ordinal_position) as column_comment
        from information_schema.columns c
        LEFT JOIN pg_type t ON t.typname = c.udt_name
        LEFT JOIN pg_enum ON pg_enum.enumtypid = t.oid
        where table_catalog = ? AND table_schema = ? and table_name = ?`
      , [this.dbName, 'public', table]);

    const newTableSchema: any[] = [];
    let i = 0;
    while (i < tableSchema.rows.length - 1) {
      if (tableSchema.rows[i]['data_type'] === 'USER-DEFINED') {
        const enumValues: string[] = [];
        let z = i;
        for (let j = i; j < tableSchema.rows.length; j++) {
          if (tableSchema.rows[j]['udt_name'] === tableSchema.rows[i]['udt_name'] && tableSchema.rows[j]['column_name'] === tableSchema.rows[i]['column_name']) {
            enumValues.push(tableSchema.rows[j]['enumlabel'])
            z = j;
            continue;
          }
          z = j;
          break;
        }
        tableSchema.rows[i]['enum_values'] = enumValues;
        newTableSchema.push(tableSchema.rows[i]);
        i = z;
      } else {
        newTableSchema.push(tableSchema.rows[i]);
        i++;
      }
    }

    return newTableSchema.map((columnSchema) => {
      return this.convertToTableSchema(columnSchema)
    });

  }

  async getTables(): Promise<string[]> {
    return await this.client.getAllTables(['public']);
  }

  setClient(client): void {
    this.client = client;
  }

  setDbName(dbName): void {
    this.dbName = dbName;
  }

  convertToTableSchema(obj: any): TableSchemaType {
    return {
      COLUMN_NAME: obj.column_name,
      ENUM_LABEL: obj.enumlabel,
      CHARACTER_SET_NAME: obj.character_set_name,
      COLUMN_TYPE: obj.udt_name,
      DATA_TYPE: obj.data_type,
      CHARACTER_MAXIMUM_LENGTH: obj.character_maximum_length || 0,
      COLUMN_DEFAULT: obj.column_default,
      IS_NULLABLE: obj.is_nullable,
      COLUMN_COMMENT: obj.column_comment,
      ENUM_VALUES: obj.enum_values,
      EXTRA: obj.extra ?? null,
      COLUMN_KEY: obj.column_key ?? null,
      COLLATION_NAME: obj.collation_name,
    };

  }

}
