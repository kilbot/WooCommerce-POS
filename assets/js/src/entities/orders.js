POS.module('Entities', function(Entities){

    this.channel.reply({
        'order': function(id) {
            return new Entities.Order(id);
        },
        'orders': function() {
            return new Entities.Orders();
        }
    });

});