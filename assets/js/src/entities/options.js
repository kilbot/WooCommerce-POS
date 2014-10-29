var POS = (function(App) {

    /*
     * Model
     */
    var WP_Option = Backbone.Model.extend({
        url: ajaxurl,
        sync: function (method, model, options) {
            var id       = 'id=' + model.get('id'),
                action   = 'action=wc_pos_admin_settings',
                security = 'security=' + model.get('security');


            options.emulateHTTP = true;
            options.url = model.url + '?' + action + '&' + id + '&' + security;
            return Backbone.sync(method, model, options);
        }
    });

    /*
     * Collection
     */
    var WP_Options = Backbone.Collection.extend({
        model: WP_Option
    });

    /*
     * API
     */
    App.Entities.channel.reply('wp_option:entities', function( options ) {
        return new WP_Options( [], options );
    });

    return App;

})(POS || {});