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
    expect(this.model.get('quantity')).equals(1);
    this.model.quantity('increase');
    expect(this.model.get('quantity')).equals(2);
    this.model.quantity('decrease');
    expect(this.model.get('quantity')).equals(1);
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

    this.model.set({quantity: 1});
    expect(this.model.get('item_price')).equal(2);
    expect(this.model.get('total')).equal(2);

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
      prices_include_tax: 'no'
    };

    // dummy product id 99, quantity 2, regular price $3, on sale for $2
    this.model.set( this.products[0] );
    this.model.set({ 'quantity': 2, 'taxable': true });

    expect(this.model.get('item_price')).equal(2);
    expect(this.model.get('subtotal')).equal(6);
    expect(this.model.get('subtotal_tax')).equal(0.84);
    expect(this.model.get('total')).equal(4);
    expect(this.model.get('total_tax')).equal(0.56);

    // itemized
    var tax = this.model.get('tax');
    expect(tax[2].total).equal(0.36);
    expect(tax[2].subtotal).equal(0.54);
    expect(tax[3].total).equal(0.2);
    expect(tax[3].subtotal).equal(0.3);

  });

  it("should calculate the correct inclusive tax", function() {

    // pos params
    this.model.tax = {
      calc_taxes: 'yes',
      prices_include_tax: 'yes'
    };

    // dummy product id 99, quantity 2, regular price $3, on sale for $2
    this.model.set({ 'quantity': 2, 'taxable': true });

    expect(this.model.get('item_price')).equal(2);
    expect(this.model.get('subtotal')).equal(5.2632);
    //expect(this.model.get('subtotal_tax')).equal(0.7369); // todo: woo gives different rounding!
    expect(this.model.get('subtotal_tax')).equal(0.7368);
    expect(this.model.get('total')).equal(3.5088);
    expect(this.model.get('total_tax')).equal(0.4912);


    // itemized
    var tax = this.model.get('tax');
    expect(tax[2].total).equal(0.3158);
    expect(tax[2].subtotal).equal(0.4737);
    expect(tax[3].total).equal(0.1754);
    expect(tax[3].subtotal).equal(0.2632);

  });

});