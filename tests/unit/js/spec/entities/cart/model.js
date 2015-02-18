describe('entities/cart/model.js', function () {

  beforeEach(function () {

    var dummy = require('./../../../data/products.json');
    this.products = dummy.products;

    var Model = require('entities/cart/model').extend({
      url: '?'
    });
    this.model = new Model(this.products[0]);

    this.model.tax_rates = {
      '': {
        2: {
          rate: '9.0000',
            label: 'Tax 1',
            shipping: 'yes',
            compound: 'yes'
        },
        3: {
          rate: '5.0000',
            label: 'Tax 2',
            shipping: 'yes',
            compound: 'yes'
        }
      }
    };

  });

  it('should be in a valid state', function() {
    expect(this.model).to.be.ok;
  });

  it('should have a quantity convenience method ', function() {
    expect(this.model.get('quantity')).equals(0);
    this.model.quantity('increase');
    expect(this.model.get('quantity')).equals(1);
    this.model.quantity('decrease');
    expect(this.model.get('quantity')).equals(0);
  });

  it('should have sum convenience method ', function() {
    this.model.set({
      total: 1.23,
      subtotal: 4.56
    });
    var sum = this.model.sum(['total', 'subtotal']);
    expect(sum).equals(5.79);
  });

  it("should initiate with the correct values", function() {

    expect(this.model.get('quantity')).equal(0);
    expect(this.model.get('item_price')).equal(2);
    expect(this.model.get('total')).equal(0);

  });

  it("should re-calculate on quantity change to any floating point number", function() {

    var quantity = _.random(10, true);
    this.model.set( { 'quantity': quantity } );

    expect(this.model.get('quantity')).equal(quantity);
    expect(this.model.get('total')).equal( parseFloat( (2 * quantity).toFixed(4) ) );

  });

  it("should calculate the correct exclusive tax", function() {

    // pos params
    this.model.tax = {
      calc_taxes: 'yes',
      prices_include_tax: 'no',
      //tax_total_display: 'itemized'
    };

    // dummy product id 99, quantity 2, regular price $3, on sale for $2
    this.model.set( this.products[0] );
    this.model.set({ 'quantity': 2, 'taxable': true });

    expect(this.model.get('item_price')).equal(2);
    expect(this.model.get('subtotal')).equal(6);
    expect(this.model.get('subtotal_tax')).equal(0.84);
    expect(this.model.get('total')).equal(4);
    expect(this.model.get('total_tax')).equal(0.56);
    //expect(this.model.get('line_tax_2')).equal(0.36);
    //expect(this.model.get('line_tax_3')).equal(0.2);

  });

  it("should calculate the correct inclusive tax", function() {

    // pos params
    this.model.tax = {
      calc_taxes: 'yes',
      prices_include_tax: 'yes',
      //tax_total_display: 'itemized'
    };

    // dummy product id 99, quantity 2, regular price $3, on sale for $2
    this.model.set({ 'quantity': 2, 'taxable': true });

    expect(this.model.get('item_price')).equal(2);
    expect(this.model.get('subtotal')).equal(5.2632);
    expect(this.model.get('subtotal_tax')).equal(0.7368);
    expect(this.model.get('total')).equal(3.5088);
    expect(this.model.get('total_tax')).equal(0.4912);
    //expect(this.model.get('line_tax_2')).equal(0.3158);
    //expect(this.model.get('line_tax_3')).equal(0.1754);

  });
  //
  //it("should re-calculate exclusive tax with change to quantity", function() {
  //
  //  // pos params
  //  this.model.tax = {
  //    calc_taxes: 'yes',
  //    prices_include_tax: 'no',
  //    tax_total_display: 'itemized'
  //  };
  //
  //  this.model.set({ 'quantity': 3, 'taxable': true });
  //
  //  expect(this.model.get('item_tax')).equal(0.28);
  //  expect(this.model.get('item_tax_2')).equal(0.18);
  //  expect(this.model.get('item_tax_3')).equal(0.1);
  //  expect(this.model.get('total_tax')).equal(0.84);
  //  expect(this.model.get('line_tax_2')).equal(0.54);
  //  expect(this.model.get('line_tax_3')).equal(0.3);
  //
  //});
  //
  //it("should re-calculate inclusive tax with change to quantity", function() {
  //
  //  // pos params
  //  this.model.tax = {
  //    calc_taxes: 'yes',
  //    prices_include_tax: 'yes',
  //    tax_total_display: 'itemized'
  //  };
  //
  //  this.model.set({ 'quantity': 3, 'taxable': true });
  //
  //  expect(this.model.get('item_tax')).equal(0.2456);
  //  expect(this.model.get('item_tax_2')).equal(0.1579);
  //  expect(this.model.get('item_tax_3')).equal(0.0877);
  //  expect(this.model.get('total_tax')).equal(0.7368);
  //  expect(this.model.get('line_tax_2')).equal(0.4737);
  //  expect(this.model.get('line_tax_3')).equal(0.2632);
  //
  //});
  //
  //it("should re-calculate exclusive tax with item discount", function() {
  //
  //  // pos params
  //  this.model.tax = {
  //    calc_taxes: 'yes',
  //    prices_include_tax: 'no',
  //    tax_total_display: 'itemized'
  //  };
  //
  //  // set new price to $1.50
  //  this.model.set( { 'taxable': true, 'quantity': 2, 'item_price': 1.5 } );
  //
  //  expect(this.model.get('total_tax')).equal(0.42);
  //  expect(this.model.get('line_tax_2')).equal(0.27);
  //  expect(this.model.get('line_tax_3')).equal(0.15);
  //
  //});
  //
  //it("should re-calculate inclusive tax with item discount", function() {
  //
  //  // pos params
  //  this.model.tax = {
  //    calc_taxes: 'yes',
  //    prices_include_tax: 'yes',
  //    tax_total_display: 'itemized'
  //  };
  //
  //  // set new price to $1.50
  //  this.model.set( { 'taxable': true, 'quantity': 2, 'item_price': 1.5 } );
  //
  //  expect(this.model.get('total_tax')).equal(0.3684);
  //  expect(this.model.get('line_tax_2')).equal(0.2368);
  //  expect(this.model.get('line_tax_3')).equal(0.1316);
  //
  //});

});