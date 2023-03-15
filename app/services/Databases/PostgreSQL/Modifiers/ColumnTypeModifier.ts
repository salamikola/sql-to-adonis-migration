export default class PGColumnTypeModifier {

   postgresToKnexTypes = {
     'array':'array',
    'bigint': 'bigInteger',
    'boolean': 'boolean',
    'char': 'char',
    'character varying': 'string',
    'date': 'date',
    'double precision': 'double',
    'integer': 'integer',
    'json': 'json',
    'jsonb': 'jsonb',
    'real': 'float',
    'smallint': 'smallint',
    'text': 'text',
    'time': 'time',
    'timestamp': 'timestamp',
    'uuid': 'uuid',
    'byte': 'binary',
    'interval': 'interval',
    'numeric': 'decimal',
    'point': 'point',
    'my_custom_type': 'myCustomType',
    'timestamp with time zone': 'timestamp',
    'timestamp without time zone': 'timestamp'

  };


  public getColumnType(key: string): string | null {
    return this.postgresToKnexTypes[key] ?? null
  }
}
