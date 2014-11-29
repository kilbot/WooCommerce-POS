_.extend( Marionette.Application.prototype, {

    debugLog: function( type, message ) {
        if( _.isUndefined( this.debug ) ) {
            this.debug = localStorage.getItem('wc_pos_debug') ? true : false ;
            Backbone.Radio.DEBUG = this.debug;
            console.info('Debugging is ' +  ( this.debug ? 'on' : 'off' )  + ', visit http://woopos.com.au/docs/debugging');
        }
        if( this.debug ) {
            console[type](message);
        }
    },

    navigate: function(route, options){
        options || (options = {});
        Backbone.history.navigate(route, options);
    },

    getCurrentRoute: function(){
        var frag = Backbone.history.fragment;
        return _.isEmpty(frag) ? null : frag ;
    },

    startHistory: function() {
        if( Backbone.history ) {
            return Backbone.history.start();
        }
    },

    register: function(instance, id) {
        this._registry || ( this._registry = {} );
        return this._registry[id] = instance;
    },

    unregister: function(instance, id) {
        return delete this._registry[id];
    },

    resetRegistry: function() {
        var controller, key, msg, oldCount, _ref;
        oldCount = this.getRegistrySize();
        _ref = this._registry;
        for (key in _ref) {
            controller = _ref[key];
            controller.region.close();
        }
        msg = 'There were ' + oldCount + ' controllers in the registry, there are now ' + (this.getRegistrySize());
        if (this.getRegistrySize() > 0) {
            return console.warn(msg, this._registry);
        } else {
            return console.log(msg);
        }
    },

    getRegistrySize: function() {
        return _.size(this._registry);
    }

});