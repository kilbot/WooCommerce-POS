var ReceiptView = require('lib/config/receipt-view');

module.exports = ReceiptView.extend({

  template: function(){},

  onShow: function(){

  },

  print: function(){

  }

});

/* jshint -W101 */
//// Create a print document
//function sendDocument() {
//  var request = '<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">';
//  request += '<text lang="en" smooth="true"/>';
//  request += '<text font="font_a"/>';
//  request += '<text width="3" height="3">Hello, World!&#10;</text>';
//  request += '<cut type="feed"/>';
//  request += '</epos-print>';
//  //Create a SOAP envelop
//  var soap = '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">' +
//    '<s:Body>' + request + '</s:Body></s:Envelope>';
//  //Create an XMLHttpRequest object
//  var xhr = new XMLHttpRequest();
//  //Set the end point address
//  var url = 'http://192.168.192.168/cgi-bin/epos/service.cgi?devid=local_printer&timeout=10000';
//  //Open an XMLHttpRequest object
//  xhr.open('POST', url, true);
//  //<Header settings>
//  xhr.setRequestHeader('Content-Type', 'text/xml; charset=utf-8');
//  xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
//  //xhr.setRequestHeader('SOAPAction', '""'); // required?
//  // Send print document
//  xhr.send(soap);
//}
//
//// Check printer status
//function checkStatus(){
//  //Set the end point address
//  var url = 'http://192.168.192.168/cgi-bin/epos/service.cgi?devid=local_printer&timeout=10000';
////Create an empty print document to check the printer status
//  var soap = '<?xml version="1.0" encoding="UTF-8"?>' +
//    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" >' +
//    '<s:Body>' +
//    '<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print"/>' +
//    '</s:Body>' +
//    '</s:Envelope>';
////Create an XMLHttpRequest object
//  var xhr = new XMLHttpRequest();
////<Open an XMLHttpRequest object>
//  xhr.open('POST', url, true);
////<Header settings>
//  xhr.setRequestHeader('Content-Type', 'text/xml; charset=utf-8');
//  xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jan 1970 00:00:00 GMT');
////Set a response reception callback function for checking
//  xhr.onreadystatechange = function () {
//    if (xhr.readyState == 4){
//      if (xhr.status == 200){
//        var res = xhr.responseXML;
//        var success = res.getElementsByTagName('response')[0].getAttribute('success');
//        if (!/^(1|true)$/.test(success)) {
//          alert('Success');
//        }
//      }
//    }
//  };
////Send empty print data
//  xhr.send(soap);
//}
//
//// response codes
//// Set a response receipt callback function
//xhr.onreadystatechange = function () {
//  // Obtain the print result and error code
//  var res = xhr.responseXML;
//  var msg = 'Print' + (res[0].getAttribute('success') ? 'Success' : 'Failure') +
//    '\nCode:' + res[0].getAttribute('code') +
//    '\nStatus:\n';
//  // Obtain the printer status
//  var asb = res[0].getAttribute('status');
//  if (asb & 0x00000001) {
//    msg += ' No printer response\n';
//  }
//  if (asb & 0x00000002) {
//    msg += ' Print complete\n';
//  }
//  if (asb & 0x00000004) {
//    msg += ' Status of the drawer kick number 3 connector pin = "H"\n';
//  }
//  if (asb & 0x00000008) {
//    msg += ' Offline status\n';
//  }
//  if (asb & 0x00000020) {
//    msg += ' Cover is open\n';
//  }
//  if (asb & 0x00000040) {
//    msg += ' Paper feed switch is feeding paper\n';
//  }
//  if (asb & 0x00000100) {
//    msg += ' Waiting for online recovery\n';
//  }
//  if (asb & 0x00000200) {
//    msg += ' Panel switch is ON\n';
//  }
//  if (asb & 0x00000400) {
//    msg += ' Mechanical error generated\n';
//  }
//  if (asb & 0x00000800) {
//    msg += ' Auto cutter error generated\n';
//  }
//  if (asb & 0x00002000) {
//    msg += ' Unrecoverable error generated\n';
//  }
//  if (asb & 0x00004000) {
//    msg += ' Auto recovery error generated\n';
//  }
//  if (asb & 0x00020000) {
//    msg += ' No paper in the roll paper near end detector\n';
//  }
//  if (asb & 0x00080000) {
//    msg += ' No paper in the roll paper end detector\n';
//  }
//  if (asb & 0x80000000) {
//    msg += ' Stop the spooler\n';
//  }
//  //Display in the dialog box
//  alert(msg);
//}
/* jshint +W101 */