POS.module('CustomerApp.Select', function(Select, POS, Backbone, Marionette, $, _){

    Select.Controller = Marionette.Controller.extend({

        initialize: function(options){


        },

        getSelectView: function() {
            var view = new Select.View();
            return view;
        }

    });

});