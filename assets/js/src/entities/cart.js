POS.module('Entities', function(Entities){

    Entities.channel.reply('cart', function( options ) {
        return new Entities.Cart.Collection( [], options );
    });

});