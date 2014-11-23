POS.module('HeaderApp', function(HeaderApp, POS, Backbone, Marionette, $, _, Handlebars) {

    HeaderApp.startWithParent = false;

    HeaderApp.on('start', function() {
        this.view = new HeaderApp.View();
        this.menu = new HeaderApp.Menu();
    });

    HeaderApp.View = Marionette.ItemView.extend({
        el: $('#header'),

        ui: {
            'menu': '#menu-btn'
        },

        events: {
            'click @ui.menu': 'toggleMenu'
        },

        keyEvents: {
            'help': 'showHelpModal'
        },

        behaviors: {
            HotKeys: {}
        },

        toggleMenu: function(e) {
            e.preventDefault();
            $('body').toggleClass('menu-open');
        },

        showHelpModal: function() {
            new HeaderApp.HelpModal();
        }

    });

    HeaderApp.HelpModal = Marionette.ItemView.extend({

        behaviors: {
            Modal: {},
            Tooltip: {}
        },

        initialize: function () {
            this.template = Handlebars.compile( $('#tmpl-wc-pos-help-modal').html() );
            this.collection = POS.Entities.channel.request('hotkeys');
            this.trigger('modal:open');
        },

        serializeData: function() {
            return { hotkeys: this.collection.toJSON() };
        },

        events: {
            'click .save' : 'save',
            'click .close' : 'cancel'
        },

        save: function() {
            var data = Backbone.Syphon.serialize( this );
            this.collection.set( data );
            this.collection.save();
        },

        cancel: function () {
            this.trigger('modal:close');
        }

    });

    HeaderApp.Menu = Marionette.ItemView.extend({
        el: $('#menu'),

        events: {
            'click ul li a': 'menuItemClicked'
        },

        menuItemClicked: function(e){
            $('body').toggleClass('menu-open');
        }

    });

}, Handlebars);