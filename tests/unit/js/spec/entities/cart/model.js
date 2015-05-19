describe('entities/cart/model.js', function () {

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

  describe('product line items', function () {

    beforeEach(function () {

      var dummy = require('./../../../data/products.json');
      this.products = dummy.products;

      var Model = require('entities/cart/model').extend({
        url: '?',
        collection: { tax_rates: {} }
      });
      this.model = new Model(this.products[0]);

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

    describe('cart/model using GB dummy tax', function () {

      beforeEach(function () {
        this.model.tax_rates = dummy_tax_GB;
      });

      it("should calculate the correct exclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'no'
        };

        // dummy product id 99, quantity 2, regular price $3, on sale for $2
        this.model.set({ 'taxable': true, 'tax_class': '' });

        expect(this.model.get('item_price')).equal(2);
        expect(this.model.get('subtotal')).equal(3);
        expect(this.model.get('subtotal_tax')).equal(0.6);
        expect(this.model.get('total')).equal(2);
        expect(this.model.get('total_tax')).equal(0.4);

        // itemized
        var tax = this.model.get('tax');
        expect(tax[1].total).equal(0.4);
        expect(tax[1].subtotal).equal(0.6);

      });

      it("should calculate the correct inclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'yes'
        };

        // dummy product id 99, quantity 2, regular price $3, on sale for $2
        this.model.set({ 'taxable': true, 'tax_class': '' });

        expect(this.model.get('item_price')).equal(2);
        expect(this.model.get('subtotal')).equal(2.5);
        expect(this.model.get('subtotal_tax')).equal(0.5);
        expect(this.model.get('total')).equal(1.6667);
        expect(this.model.get('total_tax')).equal(0.3333);

        // itemized
        var tax = this.model.get('tax');
        expect(tax[1].total).equal(0.3333);
        expect(tax[1].subtotal).equal(0.5);

      });

      it("should recalculate the correct exclusive tax on change to tax_class", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'no'
        };

        // dummy product id 99, quantity 2, regular price $3, on sale for $2
        this.model.set({ 'taxable': true, 'tax_class': '' });
        this.model.set({ 'tax_class': 'reduced-rate' });

        expect(this.model.get('item_price')).equal(2);
        expect(this.model.get('subtotal')).equal(3);
        expect(this.model.get('subtotal_tax')).equal(0.15);
        expect(this.model.get('total')).equal(2);
        expect(this.model.get('total_tax')).equal(0.1);

        // itemized
        var tax = this.model.get('tax');
        expect(tax[1]).to.be.undefined;
        expect(tax[2].total).equal(0.1);
        expect(tax[2].subtotal).equal(0.15);

      });

      it("should recalculate the correct inclusive tax on change to tax_class", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'yes'
        };

        // dummy product id 99, quantity 2, regular price $3, on sale for $2
        this.model.set({ 'taxable': true, 'tax_class': '' });
        this.model.set({ 'tax_class': 'reduced-rate' });

        expect(this.model.get('item_price')).equal(2);
        expect(this.model.get('subtotal')).equal(2.8571);
        expect(this.model.get('subtotal_tax')).equal(0.1429);
        expect(this.model.get('total')).equal(1.9048);
        expect(this.model.get('total_tax')).equal(0.0952);

        // itemized
        var tax = this.model.get('tax');
        expect(tax[1]).to.be.undefined;
        expect(tax[2].total).equal(0.0952);
        expect(tax[2].subtotal).equal(0.1429);

      });

      it("should recalculate the correct exclusive tax on change to zero rate", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'no'
        };

        // dummy product id 99, quantity 2, regular price $3, on sale for $2
        this.model.set({ 'taxable': true, 'tax_class': '' });
        this.model.set({ 'tax_class': 'zero-rate' });

        expect(this.model.get('item_price')).equal(2);
        expect(this.model.get('subtotal')).equal(3);
        expect(this.model.get('subtotal_tax')).equal(0);
        expect(this.model.get('total')).equal(2);
        expect(this.model.get('total_tax')).equal(0);

        // itemized
        var tax = this.model.get('tax');
        expect(tax[3].total).equal(0);
        expect(tax[3].subtotal).equal(0);

      });

      it("should recalculate the correct inclusive tax on change to zero rate", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'yes'
        };

        // dummy product id 99, quantity 2, regular price $3, on sale for $2
        this.model.set({ 'taxable': true, 'tax_class': '' });
        this.model.set({ 'tax_class': 'zero-rate' });

        expect(this.model.get('item_price')).equal(2);
        expect(this.model.get('subtotal')).equal(3);
        expect(this.model.get('subtotal_tax')).equal(0);
        expect(this.model.get('total')).equal(2);
        expect(this.model.get('total_tax')).equal(0);

        // itemized
        var tax = this.model.get('tax');
        expect(tax[3].total).equal(0);
        expect(tax[3].subtotal).equal(0);

      });

    });

    describe('cart/model using US dummy tax', function () {

      beforeEach(function () {
        this.model.tax_rates = dummy_tax_US;
      });

      it("should calculate the correct compound exclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'no'
        };

        // dummy product id 99, quantity 2, regular price $3, on sale for $2
        this.model.set({ 'taxable': true, 'tax_class': '' });

        expect(this.model.get('item_price')).equal(2);
        expect(this.model.get('subtotal')).equal(3);
        expect(this.model.get('subtotal_tax')).equal(0.366);
        expect(this.model.get('total')).equal(2);
        expect(this.model.get('total_tax')).equal(0.244);

        // itemized
        var tax = this.model.get('tax');
        expect(tax[4].total).equal(0.2);
        expect(tax[4].subtotal).equal(0.3);
        expect(tax[5].total).equal(0.044);
        expect(tax[5].subtotal).equal(0.066);

      });

      it("should calculate the correct compound inclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'yes'
        };

        // dummy product id 99, quantity 2, regular price $3, on sale for $2
        this.model.set({ 'taxable': true, 'tax_class': '' });

        expect(this.model.get('item_price')).equal(2);
        expect(this.model.get('subtotal')).equal(2.6738);
        expect(this.model.get('subtotal_tax')).equal(0.3262);
        expect(this.model.get('total')).equal(1.7825);
        expect(this.model.get('total_tax')).equal(0.2175);

        // itemized
        var tax = this.model.get('tax');
        expect(tax[4].total).equal(0.1783);
        expect(tax[4].subtotal).equal(0.2674);
        expect(tax[5].total).equal(0.0392);
        expect(tax[5].subtotal).equal(0.0588);

      });

      it("should calculate the correct non-compound exclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'no'
        };
        this.model.tax_rates['']['4'].compound = 'no';
        this.model.tax_rates['']['5'].compound = 'no';

        // dummy product id 99, quantity 2, regular price $3, on sale for $2
        this.model.set({ 'taxable': true, 'tax_class': '' });

        expect(this.model.get('item_price')).equal(2);
        expect(this.model.get('subtotal')).equal(3);
        expect(this.model.get('subtotal_tax')).equal(0.36);
        expect(this.model.get('total')).equal(2);
        expect(this.model.get('total_tax')).equal(0.24);

        // itemized
        var tax = this.model.get('tax');
        expect(tax[4].total).equal(0.2);
        expect(tax[4].subtotal).equal(0.3);
        expect(tax[5].total).equal(0.04);
        expect(tax[5].subtotal).equal(0.06);

      });

      it("should calculate the correct non-compound inclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'yes'
        };
        this.model.tax_rates['']['4'].compound = 'no';
        this.model.tax_rates['']['5'].compound = 'no';

        // dummy product id 99, quantity 2, regular price $3, on sale for $2
        this.model.set({ 'taxable': true, 'tax_class': '' });

        expect(this.model.get('item_price')).equal(2);
        expect(this.model.get('subtotal')).equal(2.6786);
        expect(this.model.get('subtotal_tax')).equal(0.3214);
        expect(this.model.get('total')).equal(1.7857);
        expect(this.model.get('total_tax')).equal(0.2143);

        // itemized
        var tax = this.model.get('tax');
        expect(tax[4].total).equal(0.1786);
        expect(tax[4].subtotal).equal(0.2679);
        expect(tax[5].total).equal(0.0357);
        expect(tax[5].subtotal).equal(0.0536);

      });

      it("should calculate the correct compound exclusive tax on change to tax_class", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'no'
        };

        // dummy product id 99, quantity 2, regular price $3, on sale for $2
        this.model.set({ 'taxable': true, 'tax_class': '' });
        this.model.set({ 'tax_class': 'reduced-rate' });

        expect(this.model.get('item_price')).equal(2);
        expect(this.model.get('subtotal')).equal(3);
        expect(this.model.get('subtotal_tax')).equal(0);
        expect(this.model.get('total')).equal(2);
        expect(this.model.get('total_tax')).equal(0);

        // itemized
        var tax = this.model.get('tax');
        expect(tax).to.be.undefined;

      });

    });

    describe('Woo Unit Tests', function () {

      it("should match the Woo unit test for inclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'yes'
        };
        this.model.tax_rates = dummy_tax_GB;
        this.model.set({
          'taxable': true,
          'tax_class': '',
          item_price: 9.99
        });
        expect(this.model.get('total')).equal(8.325);
        expect(this.model.get('total_tax')).equal(1.665);
      });

      it("should match the Woo unit test for exclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'no'
        };
        this.model.tax_rates = dummy_tax_GB;
        this.model.set({
          'taxable': true,
          'tax_class': '',
          item_price: 9.99
        });
        expect(this.model.get('total')).equal(9.99);
        expect(this.model.get('total_tax')).equal(1.998);
      });

      it("should match the Woo unit test for compound exclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'no'
        };
        this.model.tax_rates = {
          '': {
            1: {rate: '5.0000', label: 'GST', shipping: 'yes', compound: 'no'},
            2: {rate: '8.5000', label: 'PST', shipping: 'yes', compound: 'yes'}
          }
        };
        this.model.set({
          'taxable': true,
          'tax_class': '',
          item_price: 100
        });

        expect(this.model.get('total')).equal(100);
        expect(this.model.get('total_tax')).equal(13.925);

        // itemized
        var tax = this.model.get('tax');
        expect(tax[1].total).equal(5.0000);
        expect(tax[2].total).equal(8.925);
      });

      it("should match the Woo unit test for compound inclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'yes'
        };
        this.model.tax_rates = {
          '': {
            1: {rate: '5.0000', label: 'GST', shipping: 'yes', compound: 'no'},
            2: {rate: '8.5000', label: 'PST', shipping: 'yes', compound: 'yes'}
          }
        };
        this.model.set({
          'taxable': true,
          'tax_class': '',
          item_price: 100
        });

        expect(this.model.get('total')).equal(87.777);
        expect(this.model.get('total_tax')).equal(12.223);

        // itemized
        var tax = this.model.get('tax');
        expect(tax[1].total).equal(4.3889);
        expect(tax[2].total).equal(7.8341);
      });

    });

  });

  describe('shipping line items', function () {

    beforeEach(function () {

      var Model = require('entities/cart/model').extend({
        url: '?',
        collection: { tax_rates: {} }
      });
      this.model = new Model({
        type: 'shipping'
      });

    });

    describe('shipping line using GB dummy tax', function () {

      beforeEach(function () {
        this.model.tax_rates = dummy_tax_GB;
      });

      it("should calculate the correct exclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'no'
        };

        // 20% tax for $10 shipping
        this.model.set({ 'item_price': 10 });

        this.model.get('item_price').should.eql(10);
        this.model.get('total').should.eql(10);
        this.model.get('total_tax').should.eql(2);

        var tax = this.model.get('tax');
        tax[1].total.should.eql(2);
      });

      it("should calculate the correct inclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'yes'
        };

        // 20% tax for $10 shipping
        this.model.set({ 'item_price': 10 });

        this.model.get('item_price').should.eql(10);
        this.model.get('total').should.eql(8.3333);
        this.model.get('total_tax').should.eql(1.6667);

        var tax = this.model.get('tax');
        tax[1].total.should.eql(1.6667);
      });

      it("should honour the shipping='no' setting for exclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'no'
        };
        this.model.tax_rates[''][1]['shipping'] = 'no';

        // 20% tax for $10 shipping
        this.model.set({ 'item_price': 10 });

        this.model.get('item_price').should.eql(10);
        this.model.get('total').should.eql(10);
        this.model.get('total_tax').should.eql(0);

        expect(this.model.get('tax')).to.be.undefined;
      });

      it("should honour the shipping='no' setting for inclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'yes'
        };
        this.model.tax_rates[''][1]['shipping'] = 'no';

        // 20% tax for $10 shipping
        this.model.set({ 'item_price': 10 });

        this.model.get('item_price').should.eql(10);
        this.model.get('total').should.eql(10);
        this.model.get('total_tax').should.eql(0);

        expect(this.model.get('tax')).to.be.undefined;
      });

    });

    describe('shipping line using US dummy tax', function () {

      beforeEach(function () {
        this.model.tax_rates = dummy_tax_US;
      });

      it("should calculate the correct exclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'no'
        };

        // 10% + 2% tax for $10 shipping
        this.model.set({ 'item_price': 10 });

        this.model.get('item_price').should.eql(10);
        this.model.get('total').should.eql(10);
        this.model.get('total_tax').should.eql(1.2);

        var tax = this.model.get('tax');
        tax[4].total.should.eql(1);
        tax[5].total.should.eql(0.2);
      });

      it("should calculate the correct inclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'yes'
        };

        // 10% + 2% incl tax for $10 shipping
        this.model.set({ 'item_price': 10 });

        this.model.get('item_price').should.eql(10);
        this.model.get('total').should.eql(8.9286);
        this.model.get('total_tax').should.eql(1.0714);

        var tax = this.model.get('tax');
        tax[4].total.should.eql(0.8929);
        tax[5].total.should.eql(0.1786);
      });

      it("should honour the shipping='no' setting for exclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'no'
        };
        this.model.tax_rates[''][4]['shipping'] = 'yes';
        this.model.tax_rates[''][5]['shipping'] = 'no';

        // 10% tax for $10 shipping
        this.model.set({ 'item_price': 10 });

        this.model.get('item_price').should.eql(10);
        this.model.get('total').should.eql(10);
        this.model.get('total_tax').should.eql(1);

        var tax = this.model.get('tax');
        tax[4].total.should.eql(1);
        expect(tax[5]).to.be.undefined;
      });

      it("should honour the shipping='no' setting for inclusive tax", function() {
        this.model.tax = {
          calc_taxes: 'yes',
          prices_include_tax: 'yes'
        };
        this.model.tax_rates[''][4]['shipping'] = 'no';
        this.model.tax_rates[''][5]['shipping'] = 'yes';

        // 2% incl tax for $10 shipping
        this.model.set({ 'item_price': 10 });

        this.model.get('item_price').should.eql(10);
        this.model.get('total').should.eql(9.8039);
        this.model.get('total_tax').should.eql(0.1961);

        var tax = this.model.get('tax');
        expect(tax[4]).to.be.undefined;
        tax[5].total.should.eql(0.1961);
      });

    });

  });

});