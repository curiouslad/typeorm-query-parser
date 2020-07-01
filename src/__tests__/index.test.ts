import { Like, IsNull, LessThan, LessThanOrEqual, MoreThan, In, Between, MoreThanOrEqual, Not } from 'typeorm';
import { QueryBuilder } from '../index';

describe('QueryBuilder test', () => {
  let qb;
  const options = {
    LOOKUP_DELIMITER: '|',
    RELATION_DELIMITER: '.',
    CONDITION_DELIMITER: ',',
    VALUE_DELIMITER: ';',
    EXACT: 'eq',
    NOT: '!',
    CONTAINS: 'cont',
    IS_NULL: 'isnull',
    GT: 'gt',
    GTE: 'gte',
    LT: 'lt',
    LTE: 'lte',
    STARTS_WITH: 'starts',
    ENDS_WITH: 'ends',
    IN: 'in',
    BETWEEN: 'between',
    OR: 'or',
    DEFAULT_LIMIT: '25',
  };
  beforeEach(() => {
    qb = new QueryBuilder();
  });

  describe('basic cases', () => {
    it('No query params should return empty object', () => {
      expect(qb.build({})).toEqual({});
    });

    it('Unknown query param should return empty object', () => {
      expect(qb.build({ unknown: 'anything' })).toEqual({});
    });
  });

  describe('Testing output of query params', () => {
    describe('Select query param', () => {
      it('Testing if .build() returns correct output for basic input', () => {
        expect(qb.build({ select: `name,id` })).toEqual({ select: ['name', 'id'] });
      });
      it('If no string to select is provided it should return empty object', () => {
        expect(qb.build({ select: '' })).toEqual({});
      });
    });

    describe('Sort query param', () => {
      it('should return empty object if sort string not provided', () => {
        expect(qb.build({ sort: '' })).toEqual({});
      });
      it('Testring if it works for one input', () => {
        expect(qb.build({ sort: 'name,ASC' })).toEqual({ order: { name: 'ASC' } });
      });
      it('Testring if it works for two inputs', () => {
        expect(qb.build({ sort: 'name,ASC;id,DESC' })).toEqual({ order: { name: 'ASC', id: 'DESC' } });
      });
      it('Should work with mixed case letters', () => {
        expect(qb.build({ sort: 'name,AsC;id,desC' })).toEqual({ order: { name: 'ASC', id: 'DESC' } });
      });
      it('Order should default to ASC if otherwise is not provided', () => {
        expect(qb.build({ sort: 'name' })).toEqual({ order: { name: 'ASC' } });
      });
      it('Not having value for one field should not break it for others', () => {
        expect(qb.build({ sort: 'name;id,DESC' })).toEqual({ order: { name: 'ASC', id: 'DESC' } });
      });
    });

    describe('Cache query param', () => {
      it('should return empty object if cache string not provided', () => {
        expect(qb.build({ cache: '' })).toEqual({});
      });
      it('should object with cache true', () => {
        expect(qb.build({ cache: 'true' })).toEqual({ cache: true });
      });
      it('should return object with cache false', () => {
        expect(qb.build({ cache: 'false' })).toEqual({ cache: false });
      });
      it('should work with uppercase(TRUE)', () => {
        expect(qb.build({ cache: 'TRUE' })).toEqual({ cache: true });
      });
      it('should work with uppercase(FALSE)', () => {
        expect(qb.build({ cache: 'FALSE' })).toEqual({ cache: false });
      });
    });

    describe('Limit query param', () => {
      it('should return empty object if limit string not provided', () => {
        expect(qb.build({ limit: '' })).toEqual({});
      });
      it('Should set take to specified number', () => {
        expect(qb.build({ limit: '10' })).toEqual({ take: 10 });
      });
      // it('Should throw error if string is passed',()=>{
      //   expect(qb.build({limit:'asd'})).toThrow();
      // });
    });

    describe('Page query param', () => {
      it('should return empty object if page string not provided', () => {
        expect(qb.build({ page: '' })).toEqual({});
      });
      it('Should return correct output for basic input', () => {
        expect(qb.build({ page: '2', limit: '10' })).toEqual({ skip: 10, take: 10 });
      });
      it('If limit is not provided along with page, default is 25', () => {
        expect(qb.build({ page: '2' })).toEqual({ skip: 25, take: 25 });
      });
    });

    describe('Filter query param testing', () => {
      it('should return empty object if filter string not provided', () => {
        expect(qb.build({ filter: '' })).toEqual({});
      });
      it('testing Equal', () => {
        expect(qb.build({ filter: 'name||$eq||mlad' })).toEqual({ where: [{ name: 'mlad' }] });
      });
      it('testing perfix Not', () => {
        expect(qb.build({ filter: 'name||!$eq||mlad' })).toEqual({ where: [{ name: Not('mlad') }] });
      });
      it('testing Contains', () => {
        expect(qb.build({ filter: 'name||$cont||mlad' })).toEqual({ where: [{ name: Like('%mlad%') }] });
      });
      it('testing Starts with', () => {
        expect(qb.build({ filter: 'name||$starts||mlad' })).toEqual({ where: [{ name: Like('mlad%') }] });
      });
      it('testing Ends with', () => {
        expect(qb.build({ filter: 'name||$ends||mlad' })).toEqual({ where: [{ name: Like('%mlad') }] });
      });
      it('testing is null', () => {
        expect(qb.build({ filter: 'name||$isnull||' })).toEqual({ where: [{ name: IsNull() }] });
      });
      it('testing greater than', () => {
        expect(qb.build({ filter: 'name||$gt||10' })).toEqual({ where: [{ name: MoreThan(10) }] });
      });
      it('testing less than', () => {
        expect(qb.build({ filter: 'name||$lt||10' })).toEqual({ where: [{ name: LessThan(10) }] });
      });
      it('testing gte', () => {
        expect(qb.build({ filter: 'name||$gte||10' })).toEqual({ where: [{ name: MoreThanOrEqual(10) }] });
      });
      it('testing lte', () => {
        expect(qb.build({ filter: 'name||$lte||10' })).toEqual({ where: [{ name: LessThanOrEqual(10) }] });
      });
      it('testing in operator', () => {
        expect(qb.build({ filter: 'id||$in||1,2,3' })).toEqual({ where: [{ id: In(['1', '2', '3']) }] });
      });
      it('testing between operator', () => {
        expect(qb.build({ filter: 'id||$between||1,3' })).toEqual({ where: [{ id: Between(1, 3) }] });
      });
    });
    describe('testing join', () => {
      it('should return empty object if join string not provided', () => {
        expect(qb.build({ join: '' })).toEqual({});
      });
      it('testing basic input', () => {
        expect(qb.build({ join: 'name,id' })).toEqual({ relations: ['name', 'id'] });
      });
      it('testing nested input', () => {
        expect(qb.build({ join: 'user.name,id' })).toEqual({ relations: ['user.name', 'id'] });
      });
    });
    describe('Testing options passing', () => {
      it('should be able to set options', () => {
        const qb = new QueryBuilder(options);
        expect(qb.getOptions()).toEqual(options);
      });
      it('should be able to set single option', () => {
        const option = { ...options, DEFAULT_LIMIT: '10' };
        const qb = new QueryBuilder(option);
        expect(qb.getOptions().DEFAULT_LIMIT).toEqual('10');
      });
    });
  });
});
