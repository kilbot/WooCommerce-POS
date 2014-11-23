/**
 * Little ajax helper for server requests
 * - adds ajaxurl
 * - adds security nonce
 * - adds request header
 */
Backbone.$.wc_pos_ajax = function(options) {
    _.merge( options, {
        url: POS.ajaxurl,
        data: { security: POS.nonce },
        beforeSend: function(xhr){xhr.setRequestHeader('X-WC-POS', 1);}
    });
    return Backbone.$.ajax(options);
}