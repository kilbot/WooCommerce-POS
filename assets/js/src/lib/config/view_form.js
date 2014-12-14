POS.View = POS.View || {};

POS.View.Form = Marionette.ItemView.extend({

    constructor: function(options) {
        //options || (options = {});
        //return Marionette.ItemView.prototype.constructor.apply(this, arguments);
    },

    bindings: {},

    render: function(){
        // Invoke original render function
        var args = Array.prototype.slice.apply(arguments);
        var result = Marionette.ItemView.prototype.render.apply(this, args);

        // Apply stickit
        this.stickit();

        // Return render result
        return result;
    }

});