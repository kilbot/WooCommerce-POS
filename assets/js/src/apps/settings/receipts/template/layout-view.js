var LayoutView = require('lib/config/layout-view');
var App = require('lib/config/application');
var hbs = require('handlebars');

var languageMap = {
  'html'      : 'html',
  'epos-print': 'xml',
  'escp'      : 'javascript'
};

var View = LayoutView.extend({

  initialize: function(options){
    options = options || {};
    this.template = hbs.compile( options._template );
  },

  ui: {
    editor: '#wc_pos-ace-editor'
  },

  regions: {
    editorActions   :
      '.wc_pos-receipt-template-editor .wc_pos-settings-panel-footer',
    preview         :
      '.wc_pos-receipt-template-preview .wc_pos-settings-panel-body',
    previewActions  :
      '.wc_pos-receipt-template-preview .wc_pos-settings-panel-footer'
  },

  onShow: function(){
    this.editor = window.ace.edit( this.ui.editor[0] );
    var mode = 'ace/mode/' + languageMap[this.model.get('type')];
    this.editor.$blockScrolling = Infinity;
    this.editor.getSession().setMode(mode);
    this.editor.setValue( this.model.get('template'), 1 );
  }

});

module.exports = View;
App.prototype.set('SettingsApp.Receipts.Template.View', View);