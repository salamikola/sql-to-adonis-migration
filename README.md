
# Adonis-sql-to-migration

Adonis-sql-to-migration is a powerful and flexible package that simplifies the process of managing database schema changes in Adonis5 applications. It provides developers with an easy and efficient way to generate migration files from an existing database schema.


### NOTE
Only MySQL and PostgreSQL are supported as and now. SQLite and MSSQL are currently in the works.



## Motivation

This package is inspired by my love for creating database schema using DB GUIs such as Pgadmin, workbench and the likes because it saves time and increases productivity. Migration importance can't be overstated, so I needed a script tha can create migration from an existing DB, the script has morphed into a package.
## Installation


To get the latest version of adonis-sql-to-migration on your project, require it from "npm":

```bash
  $ npm i @skolawole/adonis-sql-to-migration
```
    
Or you can add it directly in your composer.json file:

```bash
 {
    "require": {
        "@skolawole/adonis-sql-to-migration": "^1.0.0"
    }
}
```
## Usage


Go to the your project root terminal and register the command in your adonis project using the command 

```
node ace configure adonis-sql-to-migration

```

Run the command to generate migration files from your database

```
node ace sql:to_migration

```

### Flags

Exclude some tables from being parsed by the migration generator by using --ignores

--ignores can take multiple inputs

```
node ace sql:to_migration --ignores="users"

```

```
node ace sql:to_migration --ignores="users" --ignores="accounts"

```


Add tables to be parsed by the migration generator by using --tables

--tables can take multiple inputs just like ignores

```
node ace sql:to_migration --tables="transactions"

```


Add the path of the folder to create the migrations files in by using the --path flag

If path is not specified, default database/migration will be used

```
node ace sql:to_migration  --path="database/custom_migration"

```

Specify the name of the database to generate migration files for by using the --dbname flag 

If dbname is not specified, the set database for the project will be used

```
node ace sql:to_migration  --dbname="vale_bill_service"

```

#### Note

This package will select your set database connection from the env configuration.

## Authors

- [@salamikola](https://www.github.com/salamikola)

## License

[MIT](https://choosealicense.com/licenses/mit/)
## ISSUES

If you encounter any issues or bugs relating to this package please report through our github issues.

[issues](https://github.com/salamikola/sql-to-adonis-migration/issues)

## 🚀 About Me
You can catch me goofing around on my webspace www.weekreed.com
## Acknowledgement

## Acknowledgements

 - [The Adonis Team / Ecosysytem](https://adonisjs.com/)
 - [Adocast](https://adocasts.com/)
 - [Adomastery](https://adonismastery.com/)
 - [Vale App](https://vale.ng)