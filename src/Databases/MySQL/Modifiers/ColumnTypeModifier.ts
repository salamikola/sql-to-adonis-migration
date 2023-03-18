export default class ColumnTypeModifier {

  private columnType = {

    "BIGINT": "bigInteger",
    "BINARY": "binary",
    "BOOLEAN": "boolean",
    "CHAR": "char",
    "DATE": "date",
    "DATETIME": "dateTime",
    "DATETIMETZ": "dateTimeTz",
    "DECIMAL": "decimal",
    "DOUBLE": "double",
    "ENUM": "enum",
    "FLOAT": "float",
    "GEOMETRY": "geometry",
    "GEOMETRYCOLLECTION": "geometryCollection",
    "INCREMENTS": "increments",
    "INT": "integer",
    "IPADDRESS": "ipAddress",
    "JSON": "json",
    "JSONB": "jsonb",
    "LINESTRING": "lineString",
    "LONGTEXT": "text",
    "MACADDRESS": "macAddress",
    "MEDIUMINT": "mediumInteger",
    "MEDIUMTEXT": "text",
    "MULTILINESTRING": "multiLineString",
    "MULTIPOINT": "multiPoint",
    "MULTIPOLYGON": "multiPolygon",
    "POINT": "point",
    "POLYGON": "polygon",
    "SET": "set",
    "SMALLINT": "smallInteger",
    "STRING": "string",
    "TEXT": "text",
    "TIME": "time",
    "TIMETZ": "timeTz",
    "TIMESTAMP": "timestamp",
    "TIMESTAMPS": "timestamps",
    "TIMESTAMPTZ": "timestampTz",
    "TIMESTAMPSTZ": "timestampsTz",
    "TINYINT": "integer",
    "VARCHAR":"string",
    "UUID": "uuid",
    "YEAR": "year"
  }

  public getColumnType(key: string): string {
    return this.columnType[key.toUpperCase()] ?? new Error('cant find column type:' + key )
  }
}
