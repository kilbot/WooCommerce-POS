POS.module('Entities.Settings', function(Settings, POS, Backbone, Marionette, $, _) {

    // Data from wpdb->usermeta
    Settings.Usermeta = Backbone.Collection.extend({

        initialize: function( models, options ) {
            this.id = options.id;
        },

        save: function () {
            var data = this.toJSON();
            var payload = {
                id: this.id,
                action: 'wc_pos_user_settings',
                security: POS.getOption('nonce'),
                data: data[0]
            };

            $.post( POS.getOption('ajaxurl'), payload, function( response ) {
                console.log(response);
            });
        }

    });

    // Data from wpdb->options
    Settings.Option = Backbone.Model.extend({
        initialize: function( options ) {
            this.url = POS.getOption('ajaxurl');
            this._saving = false;
        },
        sync: function (method, model, options) {
            var id       = 'id=' + model.get('id'),
                action   = 'action=wc_pos_admin_settings',
                security = 'security=' + POS.nonce;

            options.emulateHTTP = true;
            options.url = model.url + '?' + action + '&' + id + '&' + security;

            var methods = {
                beforeSend: function(){
                    this.trigger('update:start');
                    this._saving = true;
                },
                complete: function() {
                    this.trigger('update:stop');
                    this._saving = false;
                }
            };

            if( !this._saving && method === 'update' ) {
                _.defaults( options, {
                    beforeSend: _.bind(methods.beforeSend, model),
                    complete:	_.bind(methods.complete, model)
                });
            }

            return Backbone.sync(method, model, options);
        }
    });

    Settings.Options = Backbone.Collection.extend({
        model: Settings.Option
    });

    // API
    POS.Entities.channel.reply('hotkeys', function() {
        return new Settings.Usermeta( POS.getOption('hotkeys'), { id: 'hotkeys' });
    });

    POS.Entities.channel.reply('options', function( options ) {
        return new Settings.Options( [], options );
    });

});