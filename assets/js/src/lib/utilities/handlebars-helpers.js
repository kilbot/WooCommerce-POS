var _ = require('lodash');
var hbs = require('handlebars');
var accounting = require('accounting');
var moment = require('moment');
var Utils = require('lib/utilities/utils');
//var Radio = require('backbone.radio');

/**
 * is, compare helpers taken from
 * https://github.com/assemble/handlebars-helpers
 */

hbs.registerHelper('is', function (value, test, options) {
  if ( value && _.includes(test.split('|'), value) ) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

/*jshint -W071, -W074: suppress warnings  */
hbs.registerHelper('compare', function(left, operator, right, options) {

  if (arguments.length < 3) {
    throw new Error('Handlebars Helper "compare" needs 2 parameters');
  }

  if (options === undefined) {
    options = right;
    right = operator;
    operator = '===';
  }

  var operators = {
    //'==': function(l, r) {
    //  return l == r;
    //},
    '===': function(l, r) {
      return l === r;
    },
    //'!=': function(l, r) {
    //  return l != r;
    //},
    '!==': function(l, r) {
      return l !== r;
    },
    '<': function(l, r) {
      return l < r;
    },
    '>': function(l, r) {
      return l > r;
    },
    '<=': function(l, r) {
      return l <= r;
    },
    '>=': function(l, r) {
      return l >= r;
    }
    //'typeof': function(l, r) {
    //  return typeof l == r;
    //}
  };

  if (!operators[operator]) {
    throw new Error(
      'Handlebars Helper "compare" doesn\'t know the operator ' + operator
    );
  }

  var result = operators[operator](left, right);

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});
/*jshint +W071, +W074 */

hbs.registerHelper('list', function(items, sep, options) {
  if( _.isArray(items) || _.isObject(items) ){
    var list = _.map(items, options.fn);
    return list.join(sep);
  }
  return options.fn(items);
});

hbs.registerHelper('csv', function(items, options) {
  return options.fn(items.join(', '));
});

hbs.registerHelper('money', function(num, options){
  var defaultPrecision = accounting.settings.currency.precision,
      precision = options.hash.precision || defaultPrecision;

  if( precision === 'auto' ) {
    precision = Utils.decimalPlaces(num);
  }

  // round the number to even
  num = Utils.round(num, precision);

  if(options.hash.negative) {
    num = num * -1;
  }

  return accounting.formatMoney(num);
});

hbs.registerHelper('number', function(num, options){
  var defaultPrecision = accounting.settings.number.precision,
      precision = options.hash.precision || defaultPrecision;

  if( precision === 'auto' ) {
    precision = Utils.decimalPlaces(num);
  }

  if(options.hash.negative) {
    num = num * -1;
  }

  return accounting.formatNumber(num, precision);
});

hbs.registerHelper('formatAddress', function(a, options){
  a = a || {};

  var format = [
    [a.first_name, a.last_name],
    [a.company],
    [a.address_1],
    [a.address_2],
    [a.city, a.state, a.postcode]
  ];

  // format address
  var address = _.chain(format)
    .map(function(line) { return _.compact(line).join(' '); })
    .compact()
    .join('<br>\n')
    .value();

  // prepend title
  if( address !== '' && options.hash.title ) {
    address = '<h3>' + options.hash.title + '</h3>\n' + address;
  }

  return new hbs.SafeString(address);
});

hbs.registerHelper('formatDate', function(date, options){
  var f = options.hash.format || '';
  return moment(date).format(f);
});

hbs.registerHelper('formatDay', function(day, options){
  var f = options.hash.format || '';
  var idx = parseInt(day, 10) + 1;
  return moment().isoWeekday(idx).format(f);
});

hbs.registerHelper('debug', function(optionalValue) {
  console.log('Current Context');
  console.log('====================');
  console.log(this);

  if (optionalValue) {
    console.log('Value');
    console.log('====================');
    console.log(optionalValue);
  }
});

//hbs.registerHelper('getOption', function(key){
//  var lookup = key.split('.');
//  var option = Radio.request( 'entities', 'get', {
//    type: 'option',
//    name: lookup.shift()
//  });
//  for(var i = 0; i < lookup.length; i++) {
//    option = option[lookup[i]];
//  }
//  return option;
//});