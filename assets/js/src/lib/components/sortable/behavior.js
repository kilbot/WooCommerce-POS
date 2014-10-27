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
                    $('input.gateway_order', this).each(function(idx) {
                        $(this).val(idx);
                    });
                }
            });

        },

        ui: {
            sortable: '.sortable'
        },

        onShow: function() {
            if( this.ui.sortable.length > 0 ) {

                // Custom sorting for checkout settings table
                // TODO: move this to view callback
                var table = this.ui.sortable;
                var rows = table.find('tbody tr').get();

                // sort according to input
                table.append(rows.sort(function(a, b) {
                    return parseInt($(a).find('input.gateway_order').val(), 10)
                    - parseInt($(b).find('input.gateway_order').val(), 10);
                }));

                table.sortable( this.options );
            }

        }

    });

    return App;

})(POS || {}, jQuery);