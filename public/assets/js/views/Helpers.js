define(['handlebars', 'accounting'], function (Handlebars, accounting) {
	
	accounting.settings = pos_params.accounting;

	Handlebars.registerHelper('money', function(num, options){
		if(options.hash.negative) {
			num = num * -1;
		}
		return accounting.formatMoney(num);
	});

	Handlebars.registerHelper('number', function(num, options){
		if(options.hash.negative) {
			num = num * -1;
		}
		return accounting.formatNumber(num);
	});

});