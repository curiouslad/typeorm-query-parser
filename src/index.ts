import { Like, IsNull, LessThan, LessThanOrEqual, MoreThan, In, Between, MoreThanOrEqual, Not } from "typeorm";

interface OptionsObject{
    LOOKUP_DELIMITER:string;
    RELATION_DELIMITER:string;
    EXACT:string;
    NOT:string;
    CONTAINS:string;
    IS_NULL:string;
    GT:string;
    GTE:string;
    LT:string;
    LTE:string;
    STARTS_WITH: string;
    ENDS_WITH: string;
    IN:string;
    BETWEEN:string;
    OR:string;
    CONDITION_DELIMITER:string;
    VALUE_DELIMITER: string;
    DEFAULT_LIMIT:string;
}
interface QueryTypeOrm {
    select?: string[];
    relations?: string[];
    where?: [] | {};
    order?: {};
    skip?: number;
    take?: number;
    cache?: boolean;
}
interface QueryObject {
    select?: string;
    join?:string;
    sort?: string;
    cache?:string;
    limit?:string;
    page?:string;
    filter?:string;
}
interface LooseObject {
    [key: string]: any
}

export class QueryBuilder{
    constructor(private options:OptionsObject={
            LOOKUP_DELIMITER:'||',
            RELATION_DELIMITER:'.',
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
        ){}

    build(query:QueryObject){
        const output:QueryTypeOrm = {};
        if(!this.notValid(query.select)){
            const select = query.select as string;
            output.select = select.split(this.options.VALUE_DELIMITER);
        }
        if(!this.notValid(query.join)){
            const join = query.join as string;
            output.relations = join.split(this.options.VALUE_DELIMITER);
        }  
        if(!this.notValid(query.sort)){
            output.order = this.createOrderArray(query.sort as string);
        }
        if(!this.notValid(query.cache)){
            const cache = query.cache as string;
            output.cache = JSON.parse(cache.toLowerCase());
        } 
        if(!this.notValid(query.limit)){
            const limit = parseInt(query.limit as string)
            // if(!limit){
            //     throw new Error('Limit must be a number.');
            // }
            output.take = limit;
        } 
        if(!this.notValid(query.page)){
            let limit = query.limit || this.options.DEFAULT_LIMIT;
            const limitnum = parseInt(limit);
            output.skip =  limitnum * (parseInt(query.page as string) - 1);
            output.take = limitnum;
        }
        if(!this.notValid(query.filter)){
            output.where = this.createWhere(query.filter as string);
        }
        
        return output;
    }
    notValid(value:string|undefined):boolean{
        if(!value){return true;}
        return false;
    }

    createOrderArray(sortString:string):{[key:string]:string}{
        const sortConditions = sortString.split(this.options.CONDITION_DELIMITER);
        const order:LooseObject ={};

        sortConditions.forEach(condition=>{
            let [key, value] = condition.split(this.options.VALUE_DELIMITER);
            if(key){
                if(!value)value='ASC';
                order[key] = value.toUpperCase();
            }
        })
        return order;
    }
    createWhere(filterString:string):object[]{
        const queryToAdd:object[]=[];
        const orArray = filterString.split(this.options.LOOKUP_DELIMITER+this.options.OR+this.options.LOOKUP_DELIMITER);
        orArray.forEach(item=>{
            let obj = {};
            const condition = item.split(this.options.CONDITION_DELIMITER);
            const parsedCondition = condition.map(q=>q.split(this.options.LOOKUP_DELIMITER));
            parsedCondition.forEach(item=>{
                let notOperator=false;
                if(item[1].startsWith(this.options.NOT)){
                    notOperator=true;
                    const index =this.options.NOT.length;
                    item[1] = item[1].slice(index);
                }

                obj = {...obj,...this.createWhereObject(item[0],item[1],item[2],notOperator)}
            })
            queryToAdd.push(obj);
        })
        
        return queryToAdd;
    }

    createWhereObject(field:string,task:string,value:string,notOperator:boolean){
        const obj:LooseObject ={};
        switch(task) {
            case this.options.EXACT:
                obj[field] = value;
                break;
            case this.options.CONTAINS:
                obj[field] =  Like(`%${value}%`);
                break;
            case this.options.STARTS_WITH:
                obj[field] = Like(`${value}%`) ;
                break;
            case this.options.ENDS_WITH:
                obj[field] = Like(`%${value}`) ;
                break;
            case this.options.IS_NULL:
                obj[field]  = IsNull();
                break;
            case this.options.LT:
                obj[field]  = LessThan(+value);
                break;
            case this.options.LTE:
                obj[field]  = LessThanOrEqual(+value);
                break;
            case this.options.GT:
                obj[field]  = MoreThan(+value);
                break;
            case this.options.GTE:
                obj[field]  = MoreThanOrEqual(+value);
                break;
            case this.options.IN:
                obj[field]  =  In(value.split(this.options.VALUE_DELIMITER));
                break;
            case this.options.BETWEEN:
                const rangeValues = value.split(this.options.VALUE_DELIMITER);
                obj[field]  = Between(+rangeValues[0], +rangeValues[1]);
                break;
            }
            if(notOperator) {
                obj[field] = Not(obj[field]);
              }
            return obj;
    }
    getOptions(){
        return this.options;
    }
}
