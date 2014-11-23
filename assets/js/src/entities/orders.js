POS.module('Entities', function(Entities, POS, Backbone, Marionette, $, _){

    Entities.channel.reply('order', function(id) {
        return new Entities.Orders.Model(id);
    });

    Entities.channel.reply('orders', function() {
        return new Entities.Orders.Collection();
    });

});