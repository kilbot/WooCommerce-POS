POS.module('SupportApp.Show', function(Show, POS, Backbone, Marionette, $, _, Handlebars) {

    Show.Layout = Marionette.LayoutView.extend({
        template: _.template('' +
            '<section id="support-form" class="module leftcol"></section>' +
            '<section id="system-status" class="module rightcol"></section>'
        ),
        regions: {
            leftRegion: '#support-form',
            rightRegion: '#system-status'
        }
    });

    Show.Form = Marionette.ItemView.extend({
        template: '#tmpl-support-form',
        tagName: 'form',

        events: {
            'submit': 'send'
        },

        send: function(e) {
            e.preventDefault();
            var data = Backbone.Syphon.serialize( this );
            this.trigger( 'send:email', data );
        }
    });

    Show.Status = Marionette.ItemView.extend({
        initialize: function(options) {
            this.template = Handlebars.compile( $('#tmpl-pos-status').html() );
            this.results = options;
        },
        serializeData: function() {
            return this.results.responseJSON;
        }
    });

}, Handlebars);