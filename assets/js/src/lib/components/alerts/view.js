POS.module('Components.Alerts', function(Alerts, POS, Backbone, Marionette, $, _) {

    Alerts.View = Marionette.ItemView.extend({
        template: _.template('' +
            '<a class="action-close" href="#"><i class="icon icon-times"></i></a>' +
            '<% if(title) { %><strong><%= title %></strong><br><% } %>' +
            '<%= message %>'
        ),
        className: 'alert alert-popup',

        behaviors: {
            Alerts: {}
        },

        triggers: {
            'click .action-close': 'alert:close'
        },

        initialize: function( options ){
            _.defaults( options, {
                type: 'info'
            });

            this.$el.addClass('alert-' + options.type);
        },

        serializeData: function(){
            var data = {};
            data.title = this.getOption('title');
            data.message = this.getOption('message');
            return data;
        }

    });

});