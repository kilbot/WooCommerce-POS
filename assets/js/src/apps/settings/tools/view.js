var ItemView = require('lib/config/item-view');
var POS = require('lib/utilities/global');
var TranslationUpdateModal = ('../modals/translation-update');
var Tooltip = require('lib/components/tooltip/behavior');
var $ = require('jquery');

var View = ItemView.extend({

  initialize: function() {
    this.template = function(){
      return $('script[data-id="tools"]').html();
    };
  },

  behaviors: {
    Tooltip: {
      behaviorClass: Tooltip
    }
  },

  ui: {
    translation: '*[data-action="translation"]'
  },

  onRender: function(){

  },

  triggers: {
    'click @ui.translation': 'translation:update'
  },

  onTranslationUpdate: function(){

  }

  //translationUpdate: function(e) {
  //  e.preventDefault();
  //  var title = $(e.target).parent('td').prev('th').html();
  //
  //  new TranslationUpdateModal({
  //    model: new Backbone.Model({
  //      title: title
  //    })
  //  });
  //}

});

module.exports = View;
POS.attach('SettingsApp.Tools.View');