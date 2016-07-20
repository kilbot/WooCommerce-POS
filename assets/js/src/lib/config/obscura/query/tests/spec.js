var Backbone = require('backbone');

var model = new Backbone.Model({
  title: 'Woo Logo Hy-phen "spécîäl" доступ مدفوع',
  id: 5,
  bool: true,
  boolean: false,
  barcode: 'SKU12345',
  address: {
    country: 'US',
    postcode: '90210'
  },
  categories: [
    'Music',
    'Posters'
  ],
  complex: [{
    name: 'Color',
    slug: 'color',
    option: 'Black'
  },{
    name: 'Size',
    slug: 'size',
    option: 'XL'
  }],
  variable: [{
    name: 'Color',
    slug: 'color',
    variation: true,
    options: [
      'Black',
      'Green'
    ]
  },{
    name: 'Size',
    slug: 'size',
    variation: true,
    options: [
      'S', 'M', 'L'
    ]
  }]
});

var query = require('../query');


describe('simple queries', function(){

  it('should match simple query on title', function () {
    query('woo', model).should.be.true;
    query('foo', model).should.be.false;
  });

  it('should match capitalized query on title', function () {
    query('WOO', model).should.be.true;
    query('Log', model).should.be.true;
  });

  it('should match spaced query on title', function () {
    query('woo lo', model).should.be.true;
    query('woo foo', model).should.be.false;
  });

  it('should match dashed query on title', function () {
    query('hy-phen', model).should.be.true;
  });

  it('should match special characters query on title', function () {
    query('spéc', model).should.be.true;
  });

  it('should match foreign characters query on title', function () {
    query('مدفوع', model).should.be.true;
  });

  it('should match an attribute with string value', function () {
    query('barcode:sku12345', model).should.be.true;
    query('barcode:sku', model).should.be.false;
  });

  it('should match an attribute with numeric value', function () {
    query('id:5', model).should.be.true;
    query('id:6', model).should.be.false;
  });

  it('should match an attribute with boolean value', function () {
    query('bool:true', model).should.be.true;
    query('bool:false', model).should.be.false;
    query('bool:tru', model).should.be.false;
    query('boolean:TRUE', model).should.be.false;
    query('boolean:FALSE', model).should.be.true;
    query('boolean:FAL', model).should.be.false;
    query('bool:1', model).should.be.false;
  });

  it('should match an attribute with an array value', function () {
    query('categories:Music', model).should.be.true;
    query('categories:Mus', model).should.be.false;
    query('categories:posters', model).should.be.true;
  });

});

describe('complex queries', function(){

  it('should match piped queries on title', function () {
    query('woo|foo', model).should.be.true;
    query('foo|bar', model).should.be.false;
  });

  it('should match piped queries on attribute', function () {
    query('id:5|id:6', model).should.be.true;
    query('id:1|id:7', model).should.be.false;
  });

});