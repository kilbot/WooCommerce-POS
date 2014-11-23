POS.Controller = {};

POS.Controller.Base = Marionette.Controller.extend({

    constructor: function(options) {
        options || (options = {});
        this.region = options.region || POS.channel.request('default:region');

        this._instance_id = _.uniqueId('controller');
        POS.channel.command( 'register:instance', this, this._instance_id );

        return Marionette.Controller.prototype.constructor.apply(this, arguments);
    },

    destroy: function() {
        POS.channel.command( 'unregister:instance', this, this._instance_id );
        return Marionette.Controller.prototype.destroy.apply(this, arguments);
    },

    show: function(view, options) {
        options || (options = {});
        _.defaults(options, {
            loading: false,
            region: this.region
        });

        this._setMainView(view);
        this._manageView(view, options);
    },

    _setMainView: function(view) {
        if( this._mainView ) return;

        this._mainView = view;
        this.listenTo( view, 'destroy', this.destroy );

    },

    _manageView: function(view, options) {
        if(options.loading) {
            return POS.Components.Loading.channel.command( 'show:loading', view, options );
        } else {
            options.region.show(view);
        }
    }

});