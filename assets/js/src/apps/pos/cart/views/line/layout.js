var LayoutView = require('lib/config/layout-view');
var ItemView = require('./views/item');
var DrawerView = require('./views/drawer');
//var bb = require('backbone');

module.exports = LayoutView.extend({
  tagName: 'li',
  className: function() { return this.model.get('type'); },
  template: function() {
    return '<div class="item"></div><div class="drawer"></div>';
  },
  regions: {
    item: '.item',
    drawer: '.drawer'
  },

  modelEvents: {
    'pulse': 'pulse'
  },

  onRender: function(){
    var view = new ItemView({ model: this.model });

    this.listenTo( view, 'drawer:open', this.openDrawer );
    this.listenTo( view, 'drawer:close', this.closeDrawer );
    this.listenTo( view, 'drawer:toggle', this.toggleDrawer );

    this.getRegion('item').show(view);
  },

  openDrawer: function(){
    var view = new DrawerView({ model: this.model });
    this.getRegion('drawer').show(view);
    this.$el.addClass('drawer-open');
  },

  closeDrawer: function(){
    this.getRegion('drawer').empty();
    this.$el.removeClass('drawer-open');
  },

  toggleDrawer: function(){
    if( this.getRegion('drawer').hasView() ){
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  },

  pulse: function(opt) {
    if(opt === 'remove'){ return; }
    var self = this,
        list        = this.$el.closest('.list'),
        scrollTop   = list.scrollTop(),
        listTop     = list.position().top,
        listBottom  = list.height() + listTop,
        itemTop     = this.$el.position().top,
        itemBottom  = this.$el.height() + itemTop,
        type        = self.model.get( 'type' );

    if( itemTop < listTop ) {
      scrollTop -= ( listTop - itemTop );
    }

    if( itemBottom > listBottom ) {
      scrollTop += ( itemTop - list.height() + 4 );
    }

    // scroll to row
    this.$el.addClass('bg-success')
      .closest('.list')
      .animate({scrollTop: scrollTop}, 'fast', function() {
        // focus title if shipping or fee
        if( type === 'fee' || type === 'shipping' ) {
          self.$('.title strong.action-edit-title').focus();
        }

        // pulse
        self.$el.animate({backgroundColor: 'transparent'}, 500, function() {
          self.$el.removeClass('bg-success').removeAttr('style');
        });
      }
    );
  }
});