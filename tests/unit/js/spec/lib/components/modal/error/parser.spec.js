describe('lib/components/modal/error/parser.js', function () {

  var parser = require('lib/components/modal/error/parser');

  var wooErrorJSON = {
    errors: [{
      code: 'woocommerce_api_error',
      message: 'WooCommerce REST API error'
    }]
  };

  // mock Woo API error
  var wooErrorArgs = [{
    statusText: 'Not Found',
    responseJSON: wooErrorJSON,
    responseText: window.JSON.stringify(wooErrorJSON),
    promise: function(){},
    setRequestHeader: function(){}
  }, 'error', 'Not Found'];

  // mock jQuery AJAX parse error
  var parseError = [{
    statusText: 'OK',
    responseText: '<br />PHP error',
    promise: function(){},
    setRequestHeader: function(){}
  }, 'parsererror', new SyntaxError( 'Unexpected token <' )];

  // mock idb-wrapper error
  var idbWrapperError = new Error('The version number provided is lower than the existing one.');

  // mock IDBTransaction error in Firefox
  var errorEvent = {
    target: {
      error: {
        message: 'A mutation operation was attempted on a database that did not allow mutations.',
        name: 'InvalidStateError'
      }
    }
  }


  it('should return an object', function(){
    expect( parser() ).eqls({});
  });

  it('should parse a simple string error', function(){
    expect( parser('Hello World') ).eqls({
      message: 'Hello World'
    });
  });

  it('should parse a Woo REST API error', function(){
    expect( parser( wooErrorArgs ) ).eqls({
      title: 'Not Found',
      message: ['WooCommerce REST API error'],
      raw: window.JSON.stringify(wooErrorJSON)
    });
  });

  it('should parse a syntax error, ie: PHP error message in API response', function(){
    expect( parser( parseError ) ).eqls({
      title: 'SyntaxError',
      message: 'Unexpected token <',
      raw: '<br />PHP error'
    });
  });

  it('should parse an error from idb-wrapper', function(){
    expect( parser( idbWrapperError ) ).eqls({
      title: 'Error',
      message: 'The version number provided is lower than the existing one.'
    });
  });

  it('should parse an Event error, eg: IDBTransaction', function(){
    expect( parser( errorEvent ) ).eqls({
      title: 'InvalidStateError',
      message: 'A mutation operation was attempted on a database that did not allow mutations. messages.private-browsing'
    });
  });

});