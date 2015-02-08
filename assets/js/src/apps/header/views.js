var Views = {};
var ItemView = require('lib/config/item-view');
var Backbone = require('backbone');
var headerChannel = Backbone.Radio.channel('header');
var entitiesChannel = Backbone.Radio.channel('entities');
var $ = require('jquery');
var HotKeys = require('lib/components/hotkeys/behavior');
var Tooltip = require('lib/components/tooltip/behavior');
var Dropdown = require('lib/components/dropdown/behavior');

Views.HelpModal = ItemView.extend({
  tagName: 'form',

  behaviors: {
    //Modal: {
    //  behaviorClass: Modal
    //},
    Tooltip: {
      behaviorClass: Tooltip
    }
  },

  initialize: function () {
    this.template = Handlebars.compile( $('#tmpl-wc-pos-help-modal').html() );
    this.collection = entitiesChannel.request('hotkeys');

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

Views.Header = ItemView.extend({

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
    HotKeys: {
      behaviorClass: HotKeys
    }
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
    new Views.HelpModal();
  }

});

Views.Menu = ItemView.extend({

  events: {
    'click ul li a': 'menuItemClicked'
  },

  menuItemClicked: function(){
    headerChannel.command('close:menu');
  }

});

module.exports = Views;