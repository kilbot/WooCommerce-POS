describe('lib/components/customer-select/view.js', function () {

  beforeEach(function () {

    // dummy customer
    var file = fs.readFileSync( 'tests/unit/js/data/customers.json' );
    var dummy = JSON.parse( file );
    this.customer = dummy.customers[0];

    var View = proxyquire('lib/components/customer-select/view',{
      'lib/components/select2/behavior': stub(),
      'lib/config/item-view': Backbone.View
    });
    this.view = new View();

  });

  it('should be in a valid state', function() {
    expect(this.view).to.be.ok;
  });

  describe('formatResult method', function () {

    before(function(){
      expect(this.view).to.have.property('formatResult')
        .that.is.a('function');
    });

    it('should return customer as "first_name last_name (email_address)"', function(){
      var formattedResult = this.view.formatResult(this.customer);
      expect(formattedResult).to.be.a('string')
        .that.equals('' +
        this.customer.first_name + ' ' +
        this.customer.last_name + ' (' +
        this.customer.email + ')'
      );
    });

    it('should return "username (email_address)" if no names present', function(){
      this.customer.first_name = this.customer.last_name = '';
      var formattedResult = this.view.formatResult(this.customer);
      expect(formattedResult).to.be.a('string')
        .that.equals('' +
        this.customer.username + ' (' + this.customer.email + ')'
      );
    });

  });

  describe('formatSelection method', function () {

    before(function(){
      expect(this.view).to.have.property('formatSelection')
        .that.is.a('function');
    });

    it('should return customer as "first_name last_name"', function(){
      var formattedResult = this.view.formatSelection(this.customer);
      expect(formattedResult).to.be.a('string')
        .that.equals('' +
        this.customer.first_name + ' ' +
        this.customer.last_name
      );
    });

    it('should return "username" if no names present', function(){
      this.customer.first_name = this.customer.last_name = '';
      var formattedResult = this.view.formatSelection(this.customer);
      expect(formattedResult).to.be.a('string')
        .that.equals(this.customer.username);
    });

  });

});