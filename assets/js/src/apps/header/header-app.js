var Module = require('lib/config/module.js');



POS.module('HeaderApp', function(HeaderApp, POS, Backbone, Marionette, $, _, Handlebars) {

  HeaderApp.startWithParent = false;

  HeaderApp.channel = Backbone.Radio.channel('header');

  HeaderApp.on('start', function() {
    var view = new HeaderApp.View({ el: $('#header') });
    var menu = new HeaderApp.Menu({ el: $('#menu') });

    HeaderApp.channel.comply( 'open:menu', view.openMenu, view );
    HeaderApp.channel.comply( 'close:menu', view.closeMenu, view );
  });

  HeaderApp.View = Marionette.ItemView.extend({

    ui: {
      'menu': '#menu-btn'
    },

    events: {
      'click @ui.menu': 'openMenu'
    },

    keyEvents: {
      'help': 'showHelpModal'
    },

    behaviors: {
      HotKeys: {}
    },

    openMenu: function(e){
      if(e) {
        e.preventDefault();
      }

      // open menu & append backdrop
      $('body').addClass('menu-open');
      this.backdrop = $('<div class="modal-backdrop in"></div>');
      this.backdrop.height('100%');
      $('body').append(this.backdrop);

      // listen for clicks on backdrop
      this.backdrop.on('click', function(e){
        this.closeMenu();
      }.bind(this));
    },

    closeMenu: function(){

      // close menu
      $('body').removeClass('menu-open');

      // teardown backdrop
      if(this.backdrop) {
        this.backdrop.remove();
        delete this.backdrop;
      }
    },

    showHelpModal: function() {
      new HeaderApp.HelpModal();
    }

  });

  HeaderApp.HelpModal = Marionette.ItemView.extend({
    tagName: 'form',

    behaviors: {
      Modal: {},
      Tooltip: {}
    },

    initialize: function () {
      this.template = Handlebars.compile( $('#tmpl-wc-pos-help-modal').html() );
      this.collection = POS.Entities.channel.request('hotkeys');

      // bit of a hack
      // get the translated title from the template element
      this.title = $('#tmpl-wc-pos-help-modal').data('title');

      // listen for button clicks
      this.on( 'button:clicked', this.onButtonClick );

      this.trigger( 'modal:open' );
    },

    serializeData: function() {
      return { hotkeys: this.collection.toJSON() };
    },

    onButtonClick: function(e){
      if( $(e.target).hasClass('action-save') ){
        this.save();
      }
    },

    save: function() {
      var data = Backbone.Syphon.serialize( this );
      this.collection.set( data );
      this.collection.save();
    }

  });

  HeaderApp.Menu = Marionette.ItemView.extend({

    events: {
      'click ul li a': 'menuItemClicked'
    },

    menuItemClicked: function(){
      HeaderApp.channel.command('close:menu');
    }

  });

}, Handlebars);