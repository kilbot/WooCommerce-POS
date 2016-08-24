var qz = window.qz;

var dataMap = {
  'html': {
    type    : 'html',
    format  : 'plain'
  },
  'epos-print': {
    type    : 'raw',
    format  : 'xml'
  },
  'escp': {
    type    : 'raw'
  }
};

module.exports = function(view){

  view.print = function(){
    var data = dataMap[view.getReceiptType()] || dataMap['html'];
    data.data = this.getData();

    return Promise.resolve()
      .then(function(){
        if(!qz.websocket.isActive()){
          return qz.websocket.connect();
        }
      })
      .then(function() {
        return qz.printers.getDefault();
      })
      .then(function(defaultPrinter){
        var config = qz.configs.create(defaultPrinter);
        return qz.print(config, [data]);
      });
  };

  return view;
};