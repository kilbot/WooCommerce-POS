/**
 * Display localised string, eg: 2,55
 * Set float 2.55
 */
Backbone.Stickit.addHandler({
    selector: 'input[data-numpad="discount"]',
    onGet: POS.Utils.formatNumber,
    onSet: POS.Utils.unformat,
    events: ['blur'],
    afterUpdate: function($el, val, options){
        $el.trigger('input');
    }
});

Backbone.Stickit.addHandler({
    selector: 'input[data-numpad="quantity"]',
    onGet: POS.Utils.formatNumber,
    onSet: POS.Utils.unformat,
    events: ['blur'],
    afterUpdate: function($el, val, options){
        $el.trigger('input');
    }
});

/**
 * Custom Stickit handler for nested customer address
 */
Backbone.Stickit.addHandler({
    selector: 'input[data-handler="address"]',
    onGet: function( value, options ){
        var key = options.selector.match(/\w+\[(\w+)\]/)[1];
        if( _(value).has(key) ){
            return value[key];
        } else {
            return '';
        }

    },
    onSet: function( value, options ){
        var key = options.selector.match(/\w+\[(\w+)\]/)[1];
        var address = options.view.model.get( options.observe );
        address = address || {};
        address[key] = value;
        return address;
    }
});