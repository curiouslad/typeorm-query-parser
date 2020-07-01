import { Between, In, IsNull, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not } from "typeorm";

interface IOptionsObject{
    LOOKUP_DELIMITER?:string;
    RELATION_DELIMITER?:string;
    EXACT?:string;
    NOT?:string;
    CONTAINS?:string;
    IS_NULL?:string;
    GT?:string;
    GTE?:string;
    LT?:string;
    LTE?:string;
    STARTS_WITH?: string;
    ENDS_WITH?: string;
    IN?:string;
    BETWEEN?:string;
    OR?:string;
    CONDITION_DELIMITER?:string;
    VALUE_DELIMITER?: string;
    DEFAULT_LIMIT?:string;
}
interface IQueryTypeOrm {
    select?: string[];
    relations?: string[];
    where?: {};
    order?: {};
    skip?: number;
    take?: number;
    cache?: boolean;
}
interface IQueryObject {
    select?: string;
    join?:string;
    sort?: string;
    cache?:string;
    limit?:string;
    page?:string;
    filter?:string;
}
interface ILooseObject {
    [key: string]: any
}

export class QueryBuilder{
    constructor(private options:IOptionsObject={
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

    public getOptions(){
        return this.options;
    }
    public build(query:IQueryObject){
        const output:IQueryTypeOrm = {};
        if(!this.notValid(query.select)){
            const select = query.select as string;
            output.select = select.split(this.options.VALUE_DELIMITER as string);
        }
        if(!this.notValid(query.join)){
            const join = query.join as string;
            output.relations = join.split(this.options.VALUE_DELIMITER as string);
        }  
        if(!this.notValid(query.sort)){
            output.order = this.createOrderArray(query.sort as string);
        }
        if(!this.notValid(query.cache)){
            const cache = query.cache as string;
            output.cache = JSON.parse(cache.toLowerCase());
        } 
        if(!this.notValid(query.limit)){
            const limit = parseInt(query.limit as string,10)
            // if(!limit){
            //     throw new Error('Limit must be a number.');
            // }
            output.take = limit;
        } 
        if(!this.notValid(query.page)){
            const limit = query.limit || this.options.DEFAULT_LIMIT as string;
            const limitnum = parseInt(limit,10);
            output.skip =  limitnum * (parseInt(query.page as string,10) - 1);
            output.take = limitnum;
        }
        if(!this.notValid(query.filter)){
            output.where = this.createWhere(query.filter as string);
        }
        
        return output;
    }
    private notValid(value:string|undefined):boolean{
        if(!value){return true;}
        return false;
    }

    private createOrderArray(sortString:string):{[key:string]:string}{
        const sortConditions = sortString.split(this.options.CONDITION_DELIMITER as string);
        const order:ILooseObject ={};

        sortConditions.forEach(condition=>{
            const [key, value] = condition.split(this.options.VALUE_DELIMITER as string);
            if(key){
                order[key] = (value || 'ASC').toUpperCase();
            }
        })
        return order;
    }
    private createWhere(filterString:string):object[]{
        const queryToAdd:object[]=[];
        const orArray = filterString.split(this.options.LOOKUP_DELIMITER as string+this.options.OR+this.options.LOOKUP_DELIMITER);
        orArray.forEach(item=>{
            let obj = {};
            const condition = item.split(this.options.CONDITION_DELIMITER as string);
            const parsedCondition = condition.map(q=>q.split(this.options.LOOKUP_DELIMITER as string));
            parsedCondition.forEach(cond=>{
                let notOperator=false;
                if(cond[1].startsWith(this.options.NOT as string)){
                    notOperator=true;
                    const index =(this.options.NOT as string).length;
                    cond[1] = cond[1].slice(index);
                }

                obj = {...obj,...this.createWhereObject(cond[0],cond[1],cond[2],notOperator)}
            })
            queryToAdd.push(obj);
        })
        
        return queryToAdd;
    }

    private createWhereObject(field:string,task:string,value:string,notOperator:boolean){
        const obj:ILooseObject ={};
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
                obj[field]  =  In(value.split(this.options.VALUE_DELIMITER as string));
                break;
            case this.options.BETWEEN:
                const rangeValues = value.split(this.options.VALUE_DELIMITER as string);
                obj[field]  = Between(+rangeValues[0], +rangeValues[1]);
                break;
            }
            if(notOperator) {
                obj[field] = Not(obj[field]);
              }
            return obj;
    }
}
