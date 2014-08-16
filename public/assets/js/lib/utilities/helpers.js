define(['app', 'handlebars', 'accounting'], function (POS, Handlebars, accounting) {
	
	accounting.settings = pos_params.accounting;

	Handlebars.registerHelper('is', function (value, test, options) {
		if (value === test) {
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