# Typeorm-Query-Parser

created by: [Mladen Skrbic](https://github.com/LaMbA3)


Typeorm Query Parser is simple url string parser for typeorm.

# Installation!

```sh
$ npm install typeorm-query-parser
```

# Usage Example

```javascript
import { QueryBuilder } from 'typeorm-query-parser';

const query = req.query;
const options = {};
const parser = new QueryBuilder(options).build(query);

EntityRepository.find(parsedQuery);
```

### This is just an example, you can use it however you like.
### Basicly you just create instance of QueryBuilder and pass query object to .build() it will return you object ready for .find() in typeorm.
### For this to work your url string must follow the documentation below.

# Docs

### Available querys:
- [select](#Select)
- [sort](#Sort)
- [filter](#Filter)
- [limit](#Limit)
- [page](#Page)
- [cache](#Cache)
- [join](#Join)
- [option](#Options)
- [Filter Operators](#Operators)

#### Select
**select what fields you want to get from database**
```example.com?select=field,field2```

#### Sort
**sort results from database by field**
Each sorting condition must be seperated by: ```;```
```example.com?sort=field,ASC;field2,DESC```
##### note: 
```example.com?sort=field;field2,DESC```
**Will produce and error, you must specify order of sorting**

#### Filter
**here you specify conditions (where) of data you request**
```example.com?filter=id||$eq||4;name||$isnull||```

Conditions separated by ```;``` will create ```AND``` statement.
You can also use ```||$or||``` and create ```OR``` statement and you can also combine them.

```example.com?filter=id||$eq||4;name||$isnull||||$or||id||$in||1,2,3```
This is an example of combining both OR and AND in request.

#### Limit
**limits the number of rows you get from database**
```example.com?limit=10```
##### note: Default is 25, you can change default in options. 
&nbsp;
#### Page
**adds pagination functionality**
##### note: WHEN USING PAGE, LIMIT query param is REQUIRED.
```example.com?limit=25&page=2```
page number start from 1. 

#### Cache
**Enables or disables query result caching. See caching for more information and options**
```example.com?cache=true```
default is false.

#### Join
```example.com?join=relation,relation2,relation.nested```
##### note: This feature is still experimental and should NOT be used in production.

## Options
```javascript
const options={
            LOOKUP_DELIMITER:'||',
            CONDITION_DELIMITER:';',
            VALUE_DELIMITER:',',
            EXACT: '$eq',
            NOT: '!',
            CONTAINS: '$cont',
            IS_NULL: '$isnull',
            GT: '$gt',
            GTE: '$gte',
            LT: '$lt',
            LTE: '$lte',
            STARTS_WITH: '$starts',
            ENDS_WITH: '$ends',
            IN: '$in',
            BETWEEN: '$between',
            OR: '$or',
            DEFAULT_LIMIT:'25'
        }
```
you can change anything you want by passing options object to QueryBuilder constructor
example:
```javascript
import { QueryBuilder } from 'typeorm-query-parser';

const query = req.query;
const options = {
    DEFAULT_LIMIT: '15'
};
const parser = new QueryBuilder(options).build(query);
```
##### note: ```VALUE_DELIMITER, CONDITION_DELIMITER, LOOKUP_DELIMITER``` can NOT be the same.

## Operators
```javascript
{
    EXACT: '$eq',
    CONTAINS: '$cont',
    IS_NULL: '$isnull',
    GT: '$gt',
    GTE: '$gte',
    LT: '$lt',
    LTE: '$lte',
    STARTS_WITH: '$starts',
    ENDS_WITH: '$ends',
    IN: '$in',
    BETWEEN: '$between',
}
```
##### you can change operators in options.
###### you can negate every operator by puting ```!``` before it.
&nbsp;
##### Negating example
```example.com?filter=id||!$eq||4;name||!$isnull||||$or||id||!$in||1,2,3```
this will result: **id!=4 && name!=null || id NOT in 1,2,3**
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)