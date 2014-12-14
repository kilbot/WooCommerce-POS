POS.Utils = {

    /**
     * Number and Currency helpers
     */
    round: function( num, precision ) {
        if( precision === undefined ) precision = accounting.settings.number.precision;
        return parseFloat( accounting.toFixed( num, precision ) );
    },

    unformat: function( num ) {
        return accounting.unformat( num, accounting.settings.number.decimal );
    },

    formatNumber: function( num, precision ) {
        if( precision === undefined ) precision = accounting.settings.number.precision;
        if( precision === 'auto' ) {
            precision = ((+num).toFixed(4)).replace(/^-?\d*\.?|0+$/g, '').length;
        }
        return accounting.formatNumber(num, precision);
    },

    isPositiveInteger: function( num, allowZero ){
        var n = ~~Number(num);
        if(allowZero) {
            return String(n) === num && n >= 0;
        } else {
            return String(n) === num && n > 0;
        }
    },

    /**
     * Parse error messages from the server
     */
    parseErrorResponse: function( jqXHR ){
        var resp = jqXHR.responseJSON;
        if( resp.errors ){
            return resp.errors[0].message;
        }

        return jqXHR.responseText;
    }

};