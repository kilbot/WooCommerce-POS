describe('entities/orders/model.js', function () {

  var dummy_order = require('./../../../data/order.json');
  var OrderCollection = require('entities/orders/collection');
  var OrderModel = require('entities/orders/model');
  var Utils = require('lib/utilities/utils');

  // order model needs to be part of an order collection
  OrderModel = OrderModel.extend({
    collection: {
      db: true,
      states: OrderCollection.prototype.states
    }
  });

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
    // var model = new OrderModel( dummy_order );
    // expect(model.attributes).to.have.property('id');

    var model = new OrderModel( dummy_order.order );
    expect(model.attributes).to.have.property('id');

  });

  it('should not change order on export', function(){
    var model = new OrderModel( dummy_order.order, { parse: true } );
    expect( model.toJSON() ).to.eql( dummy_order.order );
  });

  it('should parse line_items, shipping_lines and fee_lines into a Cart collection (if isEditable)', function(){

    // change state to CREATE_FAILED
    var order = _.defaults( { _state: 'CREATE_FAILED' }, dummy_order.order );
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
    //  var order = _.defaults( { _state: 'UPDATE_FAILED' }, dummy_order.order );
    //  var model = new OrderModel( order, { parse: true }  );
    //
    //  expect( model.toJSON() ).to.containSubset( order );
    //
    //});

  it('should save on change to the cart', function( done ){

    var order = _.defaults( { _state: 'UPDATE_FAILED', local_id: 1 }, dummy_order.order );
    var model = new OrderModel( order, { parse: true }  );


    // Note: stubbing w/ my own function because sinon is weird with debounce
    model.sync = function( method ){
      expect( method ).equals( 'update' );
      done();
    };

    var cart_item = model.cart.at(0);
    cart_item.set({ quantity: 3 });

  });

  it('should save on add item to cart', function( done ){

    var order = _.defaults( { _state: 'UPDATE_FAILED', local_id: 1 }, dummy_order.order );
    var model = new OrderModel( order, { parse: true }  );

    // Note: stubbing w/ my own function because sinon is weird with debounce
    model.sync = function( method ){
      expect( method ).equals( 'update' );
      done();
    };

    model.cart.add({ id: 123 });

  });

  //it('should debounce save on add items to cart', function( done ){
  //
  //  // need to add editable order to attach gateways
  //  var order = _.defaults( { _state: 'UPDATE_FAILED', local_id: 1 }, dummy_order.order );
  //  var model = new OrderModel( order, { parse: true }  );
  //
  //  var callCount = 0;
  //
  //  // Note: stubbing w/ my own function because sinon is weird with debounce
  //  model.sync = function( method ){
  //    callCount++;
  //    expect( method ).equals( 'update' );
  //  };
  //
  //  // trigger change
  //  for( var i = 0; i < 10; i++ ){
  //    model.cart.add({ id: i });
  //  }
  //
  //  expect( callCount ).equals( 0 );
  //
  //  setTimeout(function() {
  //    expect( callCount ).equals( 1 );
  //    done();
  //  }, 150);
  //
  //});

  it('should save on remove item to cart', function( done ){

    var order = _.defaults( { _state: 'UPDATE_FAILED', local_id: 1 }, dummy_order.order );
    var model = new OrderModel( order, { parse: true }  );

    // Note: stubbing w/ my own function because sinon is weird with debounce
    model.sync = function( method ){
      expect( method ).equals( 'update' );
      done();
    };

    var cart_item = model.cart.at(0);
    model.cart.remove(cart_item);

  });

  //it('should destroy order if cart is empty', function( done ){
  //
  //  var order = _.defaults( { _state: 'UPDATE_FAILED', local_id: 1 }, dummy_order.order );
  //  var model = new OrderModel( order, { parse: true }  );
  //
  //  // Note: stubbing w/ my own function because sinon is weird with debounce
  //  model.sync = function( method ){
  //    expect( method ).equals( 'delete' );
  //    done();
  //  };
  //
  //  while (cart_item = model.cart.first()) {
  //    model.cart.remove(cart_item);
  //  }
  //
  //});

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

  it('should be match the dummy order', function( done ){

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
      }
    });

    var model = new Model({ _state: 'CREATE_FAILED' }, { parse: true });

    expect( model.cart ).to.be.instanceOf( Backbone.Collection );

    // Note: stubbing w/ my own function because sinon is weird with debounce
    model.sync = function(){
      expect( Utils.round( model.get('total'), 2 ) ).equals( parseFloat( dummy_order.order.total ) );
      // POS subtotal includes shipping and fees
      var subtotal = parseFloat( dummy_order.order.subtotal ) + parseFloat( dummy_order.order.total_shipping );
      expect( Utils.round( model.get('subtotal'), 2 ) ).equals( subtotal );
      expect( Utils.round( model.get('total_tax'), 2 ) ).equals( parseFloat( dummy_order.order.total_tax ) );
      done();
    };

    // 2 x 546
    model.cart.add( [{
      id: 546,
      price: '21.99',
      regular_price: '21.99',
      tax_class: "reduced-rate",
      taxable: true,
      title: 'Premium Quality'
    }, {
      id: 546,
      price: '21.99',
      regular_price: '21.99',
      tax_class: 'reduced-rate',
      taxable: true,
      title: 'Premium Quality'
    }, {
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
    }], { parse: true, silent: true } );

    // 1 x shipping
    model.cart.add( {
      price: '10.00',
      tax_class: '',
      taxable: true,
      method_id: 'flat_rate',
      method_title: 'Flat Rate'
    }, { parse: true, type: 'shipping' } );

  });

  it('should parse tax rates', function(){
    var model = new OrderModel();
    model.getSettings = function(name){
      if( name === 'tax_rates' ){
        return dummy_tax_GB;
      }
    };
    expect( model.attachTaxes() ).eqls({
      all: true,
      rate_1: true,
      rate_2: true,
      rate_3: true
    });

  });

  it('should return an array of tax rates for a given tax_class', function(){
    var model = new OrderModel();

    //no taxes
    model.attachTaxes();
    expect( model.getTaxRates('') ).to.be.undefined;

    // GB taxes
    model.getSettings = function(name){
      if( name === 'tax_rates' ){
        return dummy_tax_GB;
      }
    };
    model.attachTaxes();

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

  it('should attach and init gateways (if Editable)', function(){

    // need to add editable order to attach gateways
    var order = _.defaults( { _state: 'UPDATE_FAILED', local_id: 1 }, dummy_order.order );
    var model = new OrderModel( order, { parse: true }  );

    model.sync = sinon.stub();

    expect( model.gateways ).to.be.instanceOf( Backbone.Collection );
    // expect one gateway parsed from payment_details
    expect( model.gateways.length ).equals(1);
    expect( model.gateways.at( 0).id ).equals( dummy_order.order.payment_details.method_id );

  });

  it('should save on change to the gateways', function( done ){

    // need to add editable order to attach gateways
    var order = _.defaults( { _state: 'UPDATE_FAILED', local_id: 1 }, dummy_order.order );
    var model = new OrderModel( order, { parse: true }  );

    // Note: stubbing w/ my own function because sinon is weird with debounce
    model.sync = function( method ){
      expect( method ).equals( 'update' );
      done();
    };

    // trigger change
    model.gateways.trigger('change');

  });

  //it('should debounce save on changes to the gateways', function( done ){
  //
  //  // need to add editable order to attach gateways
  //  var order = _.defaults( { _state: 'UPDATE_FAILED', local_id: 1 }, dummy_order.order );
  //  var model = new OrderModel( order, { parse: true }  );
  //
  //  var callCount = 0;
  //
  //  // Note: stubbing w/ my own function because sinon is weird with debounce
  //  model.sync = function( method ){
  //    callCount++;
  //    expect( method ).equals( 'update' );
  //  };
  //
  //  // trigger change
  //  for( var i = 0; i < 10; i++ ){
  //    model.gateways.trigger('change');
  //  }
  //
  //  expect( callCount ).equals( 0 );
  //
  //  setTimeout(function() {
  //    expect( callCount ).equals( 1 );
  //    done();
  //  }, 150);
  //
  //});

});