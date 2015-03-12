define([
	'app',
	'paginator',
	'entities/customers/db',
	'entities/customers/customer'
], function(
	POS,
	PageableCollection
){

	POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

		Entities.Customers = Backbone.Collection.extend({
			url: '/wp-json/users/?_wp_json_nonce=' + pos_params.WP_API_Settings.nonce,
			model: Entities.Customer,

			// this must be overridden since we are using WP-API rather than localStorage
			sync: function(method, model, options){
				$.ajax(this.url, options);
			}

		});

	});

	return;
});