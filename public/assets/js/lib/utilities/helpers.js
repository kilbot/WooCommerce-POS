define(['app', 'handlebars', 'accounting', 'moment'], function (POS, Handlebars, accounting, moment) {
	
	accounting.settings = pos_params.accounting;

	Handlebars.registerHelper('is', function (value, test, options) {
		if (value === test) {
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

		// round the number to even
		num = evenRound(num, accounting.settings.currency.precision);

		if(options.hash.negative) {
			num = num * -1;
		}
		return accounting.formatMoney(num);
	});

	Handlebars.registerHelper('number', function(num, options){
		var precision = accounting.settings.number.precision;
		if(options.hash.negative) {
			num = num * -1;
		}
		if( _.isNumber(options.hash.precision) ) {
			precision = options.hash.precision;
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

	// accounting.js does not seem to do Bankers Rounding
	// ie: 0.925 should be 0.92 not 0.93
	// this function rounds to even
	function evenRound(num, decimalPlaces) {
		var d = decimalPlaces || 0;
		var m = Math.pow(10, d);
		var n = +(d ? num * m : num).toFixed(8); // Avoid rounding errors
		var i = Math.floor(n), f = n - i;
		var e = 1e-8; // Allow for rounding errors in f
		var r = (f > 0.5 - e && f < 0.5 + e) ?
		((i % 2 === 0) ? i : i + 1) : Math.round(n);
			return d ? r / m : r;
	}

});