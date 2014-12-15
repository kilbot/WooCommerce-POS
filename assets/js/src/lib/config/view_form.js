POS.View = POS.View || {};

POS.View.Form = Marionette.ItemView.extend({

    constructor: function(options) {
        options || (options = {});
        return Marionette.ItemView.prototype.constructor.apply(this, arguments);
    },

    bindings: {},

    render: function(){
        // Invoke original render function
        var args = Array.prototype.slice.apply(arguments);
        var result = Marionette.ItemView.prototype.render.apply(this, args);

        // Apply validation
        Backbone.Validation.bind(this, {
            model: this.model,
            valid: function(view, attr) {
                view
                    .$('input[name="' + attr + '"]')
                    .parent()
                    .removeClass('error');
            },
            invalid: function(view, attr, error) {
                view
                    .$('input[name="' + attr + '"]')
                    .parent()
                    .addClass('error');
            }
        });

        // Apply stickit
        this.stickit();

        // Return render result
        return result;
    },

    remove: function() {
        // Remove the validation binding
        Backbone.Validation.unbind(this);
        return Backbone.View.prototype.remove.apply(this, arguments);
    }

});