POS.module('Components.Customer', function(Customer, POS, Backbone, Marionette, $, _){

    // API
    Customer.channel = Backbone.Radio.channel('customer');

    Customer.channel.reply( 'customer:select', function(options) {
        return new Customer.Select(options);
    });

    // Select view
    Customer.Select = Marionette.ItemView.extend({
        template: _.template('<input name="customer" type="hidden" class="select2">'),

        initialize: function(options) {

        },

        behaviors: {
            Select2: {
                minimumInputLength: 2,
                ajax: {
                    url: function() {
                        return POS.getOption('ajaxurl');
                    },
                    dataType: 'json',
                    quietMillis: 250,
                    data: function( term ) {
                        return {
                            term: term,
                            action: 'wc_pos_json_search_customers',
                            security: POS.getOption('nonce')
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
                    var customer = POS.getOption('default_customer');
                    callback( customer );
                }
            }
        },

        events: {
            'change #select-customer' : 'updateCustomer'
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
        }

    });


});