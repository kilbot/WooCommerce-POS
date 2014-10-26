var POS = (function(App, $) {

    App.Behaviors.Sortable = Marionette.Behavior.extend({

        initialize: function(options){

            this.options = _.defaults(options, {
                items:'tr',
                cursor:'move',
                axis:'y',
                handle: 'td',
                scrollSensitivity:40,
                helper:function(e,ui){
                    ui.children().each(function(){
                        $(this).width($(this).width());
                    });
                    return ui;
                },
                start:function(event,ui){
                    ui.item.css('background-color','#f6f6f6');
                },
                stop:function(event,ui){
                    ui.item.removeAttr('style');
                }
            });

        },

        ui: {
            sortable: '.sortable'
        },

        onRender: function() {
            this.ui.sortable.sortable( this.options );
        }

    });

    return POS;

})(POS || {}, jQuery);