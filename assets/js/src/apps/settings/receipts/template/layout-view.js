var LayoutView = require('lib/config/layout-view');
var App = require('lib/config/application');
var hbs = require('handlebars');

var View = LayoutView.extend({

  initialize: function(){
    this.template = hbs.compile( this.model.template );
  },

  templateHelpers: function(){
    return this.options.template_data;
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
    var editor = window.ace.edit( this.ui.editor[0] );
    editor.$blockScrolling = Infinity;
    editor.getSession().setMode('ace/mode/html');
    editor.setValue( this.options.template_data.template, 1 );
    if( ! this.options.template_data.custom ){
      editor.setReadOnly(true);
    }
  }

});

module.exports = View;
App.prototype.set('SettingsApp.Receipts.Template.View', View);