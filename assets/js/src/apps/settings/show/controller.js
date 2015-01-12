POS.module('SettingsApp.Show', function(Show, POS, Backbone, Marionette, $, _) {

  Show.Controller = POS.Controller.Base.extend({

    initialize: function (options) {

      this.settingsCollection = POS.Entities.channel.request('options');

      this.settingsRegion = new Marionette.Region({
        el: '#wc-pos-settings'
      });

      this.showTabs(options);
      this.showSettings(options);

    },

    showTabs: function (options) {
      var view = new Show.Tabs(options);

      // tab clicked
      this.listenTo(view, 'settings:tab:clicked', function (tab) {
        POS.navigate(tab);
        this.showSettings({tab: tab});
      }, this);

    },

    showSettings: function (options) {

      // init
      var model = this.settingsCollection.add({ id: options.tab });

      var view = new Show.Settings({
        collection: this.settingsCollection,
        model: model
      });

      if( options.tab === 'general' ) {
        this.listenTo( view, 'show', this.customerSelect );
      }

      // if model is empty we need to load the settings
      if( _.isEmpty( model.previousAttributes() ) && options.tab !== 'tools' ){
        POS.Components.Loading.channel.command( 'show:loading', view, {
          region: this.settingsRegion,
          loading: {
            entities: model.fetch()
          }
        });

      // else just show them
      } else {
        this.settingsRegion.show(view);
      }

    },

    customerSelect: function() {
      var view = POS.Components.Customer.channel.request('customer:select', {
        el: this.settingsRegion.currentView.$('.default_customer td')
      });
      view.render();
    }

  });

});