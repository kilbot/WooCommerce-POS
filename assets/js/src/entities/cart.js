POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

    Entities.channel.reply('cart', function( options ) {
        return new Entities.Cart.Collection( [], options );
    });

});