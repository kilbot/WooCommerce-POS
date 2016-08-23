var $ = require('jquery');

module.exports = function(view){

  view.print = function(){
    $.ajax({
      type       : 'post',
      url        : this.network_address,
      // contentType: 'text/xml',
      data       : this.getData(),
      // dataType   : 'xml',
      processData: false,
      beforeSend : function (xhr) {
        xhr.setRequestHeader('SOAPAction', '""');
      }
    });
  };

  return view;
};