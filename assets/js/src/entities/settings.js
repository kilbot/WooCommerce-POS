var Settings = {};
var Collection = require('lib/config/collection');
var Model = require('lib/config/model');
var bb = require('backbone');
var entitiesChannel = bb.Radio.channel('entities');
var $ = require('jquery');
var _ = require('lodash');

// Data from wpdb->usermeta
Settings.Usermeta = Collection.extend({

    initialize: function( models, options ) {
        this.id = options.id;
    },

    save: function () {
        var data = this.toJSON();
        var payload = {
            id: this.id,
            action: 'wc_pos_user_settings',
            data: data[0]
        };

        $.post(
            entitiesChannel.request( 'get:options', 'ajaxurl' ),
            payload,
            function( response ) {
                console.log(response);
            }
        );
    }

});

// Data from wpdb->options
Settings.Option = Model.extend({
    initialize: function() {
        this.url = entitiesChannel.request( 'get:options', 'ajaxurl' );
        this._saving = false;
    },
    sync: function (method, model, options) {
        var id       = 'id=' + model.get('id'),
            action   = 'action=wc_pos_admin_settings';

        options.emulateHTTP = true;
        options.url = model.url + '?' + action + '&' + id;

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

        return bb.sync(method, model, options);
    }
});

Settings.Options = Collection.extend({
    model: Settings.Option
});

module.exports = Settings;