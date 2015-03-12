define(['app', 'handlebars'], function(POS, Handlebars){

	POS.module('CustomerApp.List.View', function(View, POS, Backbone, Marionette, $, _){

		View.Layout = Marionette.LayoutView.extend({
			template: '#tmpl-customers-layout',

			regions: {
				customersHeaderRegion: '#customers-header',
				customersRegion: '#customers',
				customersFooterRegion: '#customers-footer'
			},

		});

		/**
		 * User Collection
		 */
		var NoUsersView = Marionette.ItemView.extend({
			tagName: 'li',
			template: '#tmpl-customers-empty',
		});

		View.CustomerHeaderView = Marionette.ItemView.extend({
			template: '#tmpl-customers-header',
		});

		View.CustomerFooterView = Marionette.ItemView.extend({
			template: '#tmpl-customers-footer',

			events: {
        'click #add-customer' : 'addCustomer'
			},

      addCustomer: function(e) {
        data = {
          name: $('#add-customer-name').val(),
          email: $('#add-customer-email').val()
        };
        $.post(
          pos_params.ajax_url,
          {
            action: 'pos_add_customer',
            data: data,
            security: pos_params.nonce
          },
          function(response){
            if(response.error)
              alert(response.error);
            else {
              $('#add-customer-name').val('');
              $('#add-customer-email').val('');
              POS.navigate('#customers/' + response.ID);
            }
          }
        );
      },
		});

		View.Customer = Marionette.ItemView.extend({
			tagName: 'tr',
			template: Handlebars.compile( $('#tmpl-customer').html() ),
			events: {
        'click .edit-customer' : 'editCustomer',
        'click .submit-customer' : 'submitCustomer',
        'click .close-customer' : 'closeCustomer',

			},
      editCustomer: function(e) {
      	this.template = Handlebars.compile( $('#tmpl-customer-edit').html() );
      	this.render();
      },
      closeCustomer: function(e) {
      	this.template = Handlebars.compile( $('#tmpl-customer').html() );
      	this.render();
      },
      submitCustomer: function(e) {
      	$.ajax({
      			url: '/wp-json/users/' + $('#customer_id').val(),
						dataType: 'json',
						method: 'POST',
						data: {
							data: {
		      			name: $('#customer_name').val(),
								username: $('#customer_username').val(),
								first_name: $('#customer_first_name').val(),
								last_name: $('#customer_last_name').val(),
								nickname: $('#customer_nickname').val(),
								URL: $('#customer_URL').val(),
								avatar: $('#customer_avatar').val(),
								email: $('#customer_email').val(),
							},
							_wp_json_nonce: pos_params.WP_API_Settings.nonce
						},
						error: function(response) {
							alert('Customer not saved: ' + response);
						},
						success: function(response){
							$('.close-customer').trigger('click');
						}
      		}
      	)
      },
		});

		View.Customers = Marionette.CompositeView.extend({
			childView: View.Customer,
			emptyView: NoUsersView,
			childViewContainer: 'tbody',
			template: '#tmpl-customers-table'
		});

		/**
		 * Component for user selection on the cart
		 */
		View.CartComponent = Marionette.ItemView.extend({
			template: Handlebars.compile( $('#tmpl-cart-customer').html() ),

			initialize: function(options) {

			},

			behaviors: {
				Select2: {
					ajax: {
						url: pos_params.ajax_url,
						dataType: 'json',
						data: function( term ) {
	    					return {
	    						term: term,
	    						action: 'pos_json_search_customers',
								security: this.data('nonce')
	    					};
	    				},
	    				results: function( data ) {
	    					var customers = [];
	    					_( data ).each( function( obj ) {
	    						customers.push( obj );
	    					});
	    					return { results: customers };
	    				}
					},
					initSelection: function( element, callback ) {
	    				var data = { id: element.val(), display_name: element.data('customer') };
						callback( data );
	    			},
				}
			},

			events: {
				'change #select-customer' : 'updateCustomer',
        'click #add-customer' : 'addCustomer'
			},

      addCustomer: function(e) {
        data = {
          name: $('#add-customer-name').val(),
          email: $('#add-customer-email').val()
        };
        $.post(
          pos_params.ajax_url,
          {
            action: 'pos_add_customer',
            data: data,
            security: pos_params.nonce
          },
          function(response){
            if(response.error)
              alert(response.error);
            else {
              $('#add-customer-name').val('');
              $('#add-customer-email').val('');
              $('#select-customer').select2('data', {
                id: response.ID,
                display_name: response.data.display_name
              });
            }
          }
        );
      },

			updateCustomer: function(e) {
				this.trigger( 'customer:select', e.added.id, this.formatSelection( e.added ) );
			},

			formatResult: function( customer ) {
				var output = '';
				if( ! _.isEmpty( customer.first_name ) ) { output = customer.first_name + ' '; }
				if( ! _.isEmpty( customer.last_name ) ) { output += customer.last_name + ' '; }
				if( output === '' ) { output = customer.display_name + ' '; }
				if( ! _.isEmpty( customer.user_email ) ) { output += '(' + customer.user_email + ')'; }
				return output;
			},

			formatSelection: function( customer ) {
				var output = '';
				if( ! _.isEmpty( customer.first_name ) ) { output = customer.first_name + ' '; }
				if( ! _.isEmpty( customer.last_name ) ) { output += customer.last_name + ' '; }
				if( output === '' ) { output = customer.display_name; }
				return output;
			},

		});


	});

	return POS.CustomerApp.List.View;

});
