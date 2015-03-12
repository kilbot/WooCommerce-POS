define(['app', 'apps/customer/list/view', 'entities/customers'], function(POS, View){

	POS.module('CustomerApp.List', function(List, POS, Backbone, Marionette, $, _){

		List.Controller = Marionette.Controller.extend({

			initialize: function(options){
				this.layout = new View.Layout();
				this.customers = POS.Entities.channel.request('customer:entities', options);
				this.customers.fetch();
			},

			show: function(){
				POS.leftRegion.show(this.layout);
				this._showList(this.customers);
				this._showHeader();
				this._showFooter();
			},

			_showList: function(customers){
				this.layout.customersRegion.show( this.listCustomers({
					collection: customers
				}));
			},

			_showHeader: function(){
				this.layout.customersHeaderRegion.show( new View.CustomerHeaderView() );
			},

			_showFooter: function(){
				this.layout.customersFooterRegion.show( new View.CustomerFooterView() );
			},

			getCartComponent: function(options) {
				var view = new View.CartComponent(options);
				return view;
			},

			listCustomers: function(options) {
				var view = new View.Customers(options);
				return view;
			},

		});

	});

});
