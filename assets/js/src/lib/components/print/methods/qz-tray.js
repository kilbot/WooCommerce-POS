var qz = window.qz;

module.exports = function(view){

  view.print = function(){
    var config = qz.configs.create('test-printer');
    var data = this.getData();

    if (!qz.websocket.isActive()) {
      return qz.websocket.connect().then(function() {
        return qz.print(config, data);
      });
    }

    return qz.print(config, data);
  };

  return view;
};