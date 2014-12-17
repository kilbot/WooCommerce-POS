Handlebars.registerHelper('is', function (value, test, options) {
    if ( _( test.split('|') ).contains( value ) ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('compare', function (left, operator, right, options) {
    if (arguments.length < 3) {
        throw new Error('Handlerbars Helper "compare" needs 2 parameters');
    }

    if (options === undefined) {
        options = right;
        right = operator;
        operator = '===';
    }

    var operators = {
        '==':     function(l, r) {return l == r; },
        '===':    function(l, r) {return l === r; },
        '!=':     function(l, r) {return l != r; },
        '!==':    function(l, r) {return l !== r; },
        '<':      function(l, r) {return l < r; },
        '>':      function(l, r) {return l > r; },
        '<=':     function(l, r) {return l <= r; },
        '>=':     function(l, r) {return l >= r; },
        'typeof': function(l, r) {return typeof l == r; }
    };

    if (!operators[operator]) {
        throw new Error('Handlerbars Helper "compare" doesn\'t know the operator ' + operator);
    }

    var result = operators[operator](left, right);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('csv', function(items, options) {
    return options.fn(items.join(', '));
});

Handlebars.registerHelper('money', function(num, options){
    var precision = options.hash.precision;
    if( precision === undefined ) precision = accounting.settings.currency.precision;

    if( precision === 'auto' ) {
        precision = ((+num).toFixed(4)).replace(/^-?\d*\.?|0+$/g, '').length;
    }

    // round the number to even
    num = POS.Utils.round(num, precision);

    if(options.hash.negative) {
        num = num * -1;
    }
    return accounting.formatMoney(num);
});

Handlebars.registerHelper('number', function(num, options){
    var precision = options.hash.precision;
    if( precision === undefined ) precision = accounting.settings.number.precision;

    if( precision === 'auto' ) {
        precision = ((+num).toFixed(4)).replace(/^-?\d*\.?|0+$/g, '').length;
    }

    if(options.hash.negative) {
        num = num * -1;
    }

    return accounting.formatNumber(num, precision);
});

Handlebars.registerHelper('formatAddress', function(address, options){
    var addr = '';

    if( address.first_name || address.last_name )
        addr += address.first_name + ' ' + address.last_name + '<br>';

    if( address.company )
        addr += address.company + '<br>';

    if( address.address_1 )
        addr += address.address_1 + '<br>';

    if( address.address_2 )
        addr += address.address_2 + '<br>';

    if( address.city || address.state || address.postcode )
        addr += address.city + ' ' + address.state + ' ' + address.postcode;

    if( addr && options.hash.title )
        addr = '<h3>' + options.hash.title + '</h3>' + addr;

    return new Handlebars.SafeString(addr);
});

Handlebars.registerHelper('formatDate', function(date, options){
    var f = options.hash.format || '';
    return moment(date).format(f);
});

Handlebars.registerHelper('getOption', function(key){
    var lookup = key.split('.');
    var option = POS.getOption( lookup.shift() );
    for(var i = 0; i < lookup.length; i++) {
        option = option[lookup[i]];
    }
    return option;
});