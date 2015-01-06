POS.module('Components.Numpad', function(Numpad, POS, Backbone, Marionette, $, _){

    Numpad.Model = Backbone.Model.extend({
        defaults: {
            title   : 'Numpad',     // eg: Item Price
            value   : '0',          // eg: 4.25
            type    : 'standard',   // eg: quantity, discount
            mode    : 'value'      // eg: amount, percentage
        },

        initialize: function(options){

            if( options.target.data('numpad') === 'money_discount' ){
                this.on( 'change:value', this.calcPercentage );
                this.on( 'change:percentage', this.calcValue );
            }

            this.on('all', function(e){
                console.log(e);
            } );

            this.set({
                title   : options.target.data('title'),
                type    : options.target.data('numpad'),
                name    : options.target.attr('name'),
                original: options.target.data('original'),
                value   : POS.Utils.unformat( options.target.val() )
            });
        },

        calcPercentage: function() {
            var original = this.get('original'),
                value = this.get('value'),
                percentage;

            if( _.isNaN( value ) ) {
                value = 0;
            }

            if( this.get('type') === 'money_discount' ) {
                percentage = 100 * ( 1 - ( value / original ) );
            } else {
                percentage = 100 * ( value / original );
            }

            if( !_.isFinite( percentage ) || _.isNaN( percentage ) ) {
                percentage = 0;
            }

            percentage = parseFloat( POS.Utils.round( percentage, 0 ) );
            this.set({ percentage: percentage }, { silent: true });

        },

        calcValue: function() {
            var original = this.get('original'),
                percentage = this.get('percentage'),
                value;

            if( _.isNaN( percentage ) ) {
                percentage = 0;
            }

            if( this.get('type') === 'money_discount' ) {
                value = original * ( 1 - ( percentage / 100 ) );
            } else {
                value = original * ( percentage / 100 );
            }

            value = parseFloat( POS.Utils.round( value ) );
            this.set({ value: value }, { silent: true });
        }

    });

});