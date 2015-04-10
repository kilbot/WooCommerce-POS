describe('lib/config/filtered-collection/query.js', function () {

  before(function () {
    this.query = require('lib/config/filtered-collection/query');
    this.model = new Backbone.Model({
      title: 'Woo Logo',
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
  });

  describe('simple queries', function(){

    it('should match simple query on title', function () {
      this.query('woo', this.model).should.be.true;
      this.query('foo', this.model).should.be.false;
    });

    it('should match capitalized query on title', function () {
      this.query('WOO', this.model).should.be.true;
      this.query('Log', this.model).should.be.true;
    });

    it('should match spaced query on title', function () {
      this.query('woo lo', this.model).should.be.true;
      this.query('woo foo', this.model).should.be.false;
    });

    it('should match an attribute with string value', function () {
      this.query('barcode:sku12345', this.model).should.be.true;
      this.query('barcode:sku', this.model).should.be.false;
    });

    it('should match an attribute with numeric value', function () {
      this.query('id:5', this.model).should.be.true;
      this.query('id:6', this.model).should.be.false;
    });

    it('should match an attribute with boolean value', function () {
      this.query('bool:true', this.model).should.be.true;
      this.query('bool:false', this.model).should.be.false;
      this.query('bool:tru', this.model).should.be.false;
      this.query('boolean:TRUE', this.model).should.be.false;
      this.query('boolean:FALSE', this.model).should.be.true;
      this.query('boolean:FAL', this.model).should.be.false;
      this.query('bool:1', this.model).should.be.false;
    });

    it('should match an attribute with an array value', function () {
      this.query('categories:Music', this.model).should.be.true;
      this.query('categories:Mus', this.model).should.be.false;
      this.query('categories:posters', this.model).should.be.true;
    });

  });

  describe('complex queries', function(){

    it('should match piped queries on title', function () {
      this.query('woo|foo', this.model).should.be.true;
      this.query('foo|bar', this.model).should.be.false;
    });

    it('should match piped queries on attribute', function () {
      this.query('id:5|id:6', this.model).should.be.true;
      this.query('id:1|id:7', this.model).should.be.false;
    });

  });


});