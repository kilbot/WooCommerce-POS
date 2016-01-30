describe('entities/orders/model.js', function () {

  var dummy_order = require('./../../../data/order.json');
  var OrderModel = require('entities/orders/model');
  var Utils = require('lib/utilities/utils');

  var dummy_tax_GB = {
    '': {
      1: {rate: '20.0000', label: 'VAT', shipping: 'yes', compound: 'yes'}
    },
    'reduced-rate': {
      2: {rate: '5.0000', label: 'VAT', shipping: 'yes', compound: 'yes'}
    },
    'zero-rate': {
      3: {rate: '0.0000', label: 'VAT', shipping: 'yes', compound: 'yes'}
    }
  }

  var dummy_tax_US = {
    '': {
      4: {rate: '10.0000', label: 'VAT', shipping: 'yes', compound: 'no'},
      5: {rate: '2.0000', label: 'VAT', shipping: 'yes', compound: 'yes'}
    }
  }

  it('should be in a valid state', function () {
    var model = new OrderModel();
    expect(model).to.be.ok;
  });

  it('should parse orders, with or without \'order\' node', function() {

    // parse is not an option on set, only on init .. also automatically on fetch and save
    //this.model.set( dummy_order, { parse: true } );
    var model = new OrderModel( dummy_order, { parse: true } );
    expect(model.attributes).to.have.property('id');

    var model = new OrderModel( dummy_order.order, { parse: true } );
    expect(model.attributes).to.have.property('id');

  });

  it('should not change order on export', function(){
    var model = new OrderModel( dummy_order, { parse: true } );
    expect( model.toJSON() ).to.eql( dummy_order.order );
  });

  it('should parse line_items, shipping_lines and fee_lines into a Cart collection (if isEditable)', function(){

    // change status to CREATE_FAILED
    var order = _.defaults( { status: 'CREATE_FAILED' }, dummy_order.order );
    var model = new OrderModel( order, { parse: true }  );
    expect( model.cart ).to.be.instanceOf( Backbone.Collection );

    expect( model.cart.length ).to.equal( order.line_items.length + order.shipping_lines.length + order.fee_lines.length );

  });

  /**
   * Removed test: POS changes strings to floats and add extra data, such as item_price
   */
    //it('should export line_items, shipping_lines and fee_lines from Cart collection (if Editable)', function(){
    //
    //  // change status to UPDATE_FAILED
    //  var order = _.defaults( { status: 'UPDATE_FAILED' }, dummy_order.order );
    //  var model = new OrderModel( order, { parse: true }  );
    //
    //  expect( model.toJSON() ).to.containSubset( order );
    //
    //});

  it('should save on change to the cart', function(){

    var order = _.defaults( { status: 'UPDATE_FAILED', local_id: 1 }, dummy_order.order );
    var model = new OrderModel( order, { parse: true }  );

    model.sync = sinon.stub();

    var cart_item = model.cart.at(0);
    cart_item.set({ quantity: 3 });

    expect( model.sync ).to.have.been.calledWith( 'update' );

  });

  it('should save on add item to cart', function(){

    var order = _.defaults( { status: 'UPDATE_FAILED', local_id: 1 }, dummy_order.order );
    var model = new OrderModel( order, { parse: true }  );

    model.sync = sinon.stub();

    model.cart.add({ id: 123 });

    expect( model.sync ).to.have.been.calledWith( 'update' );

  });

  it('should save on remove item to cart', function(){

    var order = _.defaults( { status: 'UPDATE_FAILED', local_id: 1 }, dummy_order.order );
    var model = new OrderModel( order, { parse: true }  );

    model.sync = sinon.stub();

    var cart_item = model.cart.at(0);
    model.cart.remove(cart_item);

    expect( model.sync ).to.have.been.calledWith( 'update' );

  });

  it('should destroy order if cart is empty', function(){

    var order = _.defaults( { status: 'UPDATE_FAILED', local_id: 1 }, dummy_order.order );
    var model = new OrderModel( order, { parse: true }  );

    model.sync = sinon.stub();

    // http://stackoverflow.com/questions/10858935/cleanest-way-to-destroy-every-model-in-a-collection-in-backbone

    //_.each( model.cart.toArray(), function(cart_item) {
    //  if( model.cart.length > 1 ){
    //    model.cart.remove(cart_item, { silent: true });
    //  } else {
    //    model.cart.remove(cart_item);
    //  }
    //});
// OR
    while (cart_item = model.cart.first()) {
      if( model.cart.length > 1 ){
        model.cart.remove(cart_item, { silent: true });
      } else {
        model.cart.remove(cart_item);
      }
    }

    expect( model.sync ).to.have.been.calledWith( 'delete' );

  });

  it('should have a convience method to combine itemized taxes', function(){

    var model = new OrderModel();

    var itemizedTaxes1 = [{
      compound: true,
      rate: "20.0000",
      rate_id: "1",
      shipping: true,
      subtotal: _.random(10, true),
      title: "TAX 1",
      total: _.random(10, true)
    }, {
      compound: true,
      rate: "5.0000",
      rate_id: "2",
      shipping: true,
      subtotal: _.random(10, true),
      title: "TAX 2",
      total: _.random(10, true)
    }];

    var itemizedTaxes2 = [{
      compound: true,
      rate: "20.0000",
      rate_id: "1",
      shipping: true,
      subtotal: _.random(10, true),
      title: "TAX 1",
      total: _.random(10, true)
    }, {
      compound: true,
      rate: "2.0000",
      rate_id: "3",
      shipping: true,
      subtotal: _.random(10, true),
      title: "TAX 3",
      total: _.random(10, true)
    }];

    // make clone so originals are preserved for check
    var total = itemizedTaxes1[0].total + itemizedTaxes2[0].total;
    var subtotal = itemizedTaxes1[0].subtotal + itemizedTaxes2[0].subtotal;

    expect( model.mergeItemizedTaxes( [itemizedTaxes1, itemizedTaxes2] ) ).to.eql(
      [{
        compound: true,
        rate: "20.0000",
        rate_id: "1",
        shipping: true,
        subtotal: subtotal,
        title: "TAX 1",
        total: total
      }, {
        compound: true,
        rate: "5.0000",
        rate_id: "2",
        shipping: true,
        subtotal: itemizedTaxes1[1].subtotal,
        title: "TAX 2",
        total: itemizedTaxes1[1].total
      }, {
        compound: true,
        rate: "2.0000",
        rate_id: "3",
        shipping: true,
        subtotal: itemizedTaxes2[1].subtotal,
        title: "TAX 3",
        total: itemizedTaxes2[1].total
      }]
    );

  });

  it('should have a convience method to sum itemized taxes', function() {

    var model = new OrderModel();

    var itemizedTaxes = [{
      compound: true,
      rate: "20.0000",
      rate_id: "1",
      shipping: true,
      subtotal: _.random(10, true),
      title: "TAX 1",
      total: _.random(10, true)
    }, {
      compound: true,
      rate: "2.0000",
      rate_id: "3",
      shipping: true,
      subtotal: _.random(10, true),
      title: "TAX 3",
      total: _.random(10, true)
    }];

    // make clone so originals are preserved for check
    var total = itemizedTaxes[0].total + itemizedTaxes[1].total;
    var subtotal = itemizedTaxes[0].subtotal + itemizedTaxes[1].subtotal;

    expect( model.sumItemizedTaxes( itemizedTaxes ) ).equals( total );
    expect( model.sumItemizedTaxes( itemizedTaxes, 'subtotal' ) ).equals( subtotal );

  });

  it('should be match the dummy order', function(){

    var Model = OrderModel.extend({
      getSettings: function(name){
        if( name === 'tax' ){
          return {
            calc_taxes: 'yes',
            prices_include_tax: 'no'
          };
        }
        if( name === 'tax_rates' ){
          return {
            '': {
              4: {rate: '5.0000', label: 'Standard', shipping: 'yes', compound: 'no'},
            },
            'reduced-rate': {
              5: {rate: '10.0000', label: 'Tax', shipping: 'yes', compound: 'no'}
            }
          };
        }
      },
      sync: stub()
    });

    var model = new Model(null, { parse: true });

    expect( model.cart ).to.be.instanceOf( Backbone.Collection );

    // 2 x 546
    model.cart.add( {
      id: 546,
      price: '21.99',
      regular_price: '21.99',
      tax_class: "reduced-rate",
      taxable: true,
      title: 'Premium Quality'
    }, { parse: true } );

    model.cart.add( {
      id: 546,
      price: '21.99',
      regular_price: '21.99',
      tax_class: 'reduced-rate',
      taxable: true,
      title: 'Premium Quality'
    }, { parse: true } );

    // 1 x 613
    model.cart.add( {
      id: 613,
      price: '19.99',
      regular_price: '19.99',
      tax_class: '',
      taxable: true,
      title: 'Ship Your Idea',
      attributes: [{
        name: 'Color',
        option: 'Black'
      }]
    }, { parse: true } );

    // 1 x shipping
    model.cart.add( {
      price: '10.00',
      tax_class: '',
      taxable: true,
      method_id: 'flat_rate',
      method_title: 'Flat Rate'
    }, { parse: true, type: 'shipping' } );

    expect( Utils.round( model.get('total'), 2 ) ).equals( parseFloat( dummy_order.order.total ) );

    // POS subtotal includes shipping and fees
    var subtotal = parseFloat( dummy_order.order.subtotal ) + parseFloat( dummy_order.order.total_shipping );
    expect( Utils.round( model.get('subtotal'), 2 ) ).equals( subtotal );

    expect( Utils.round( model.get('total_tax'), 2 ) ).equals( parseFloat( dummy_order.order.total_tax ) );

  });

  it('should parse tax rates', function(){
    var model = new OrderModel();
    model.getSettings = function(name){
      if( name === 'tax_rates' ){
        return dummy_tax_GB;
      }
    };
    expect( model.parseTaxRates() ).eqls({
      all: true,
      rate_1: true,
      rate_2: true,
      rate_3: true
    });

  });

  it('should return an array of tax rates for a given tax_class', function(){
    var model = new OrderModel();
    model.getSettings = function(name){
      if( name === 'tax_rates' ){
        return dummy_tax_GB;
      }
    };
    model.parseTaxRates();
    expect( model.getTaxRates('') ).eqls([{
      rate_id: '1',
      rate: '20.0000',
      title: 'VAT',
      shipping: true,
      compound: true,
      enabled: true,
      total: 0,
      subtotal: 0
    }]);
    expect( model.getTaxRates('reduced-rate') ).eqls([{
      rate_id: '2',
      rate: '5.0000',
      title: 'VAT',
      shipping: true,
      compound: true,
      enabled: true,
      total: 0,
      subtotal: 0
    }]);
  });

});