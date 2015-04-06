/* jshint -W071, -W074 */
var _ = require('lodash');

/**
 *
 * @param options
 * @constructor
 */
function Parser(options){
  this.options = options || {};
}

/**
 * Regex for special characters
 */
var regex = {
  QUOTES      : /['"`]/,       // quotes
  SPACES      : /[ \t\r\n]/,   // spaces
  FLAGS       : /[~\+#!\*\/]/, // flags
  SCREEN      : /[\\]/,        // screen
  GROUP_OPEN  : /\(/,          // group openers
  GROUP_CLOSE : /\)/,          // group endings
  OR          : /\|/,          // logical OR
  PREFIX      : /:/,           // divider between prefix and value
  RANGE       : /-/,           // divider between values in range
  OR_OPEN     : /\[/,          // OR group openers
  OR_CLOSE    : /]/            // OR group endings
};

/**
 * Returns first regex match for given character
 * note: order is important!
 * @param character
 */
function matchRegex(character){
  var match;

  _.any([
    'SCREEN',
    'OR_OPEN',
    'OR_CLOSE',
    'GROUP_OPEN',
    'GROUP_CLOSE',
    'OR',
    'PREFIX',
    'RANGE',
    'SPACES',
    'QUOTES',
    'FLAGS'
  ], function(key){
    if(regex[key].test(character)){
      match = key; return true;
    } else {
      match = undefined; return false;
    }
  });

  return match;
}

/**
 *
 */
function logicalOr(parts){
  var p2 = parts.pop(),
    p1 = parts.pop();

  parts.push({
    type: 'or',
    queries: [ p1, p2 ]
  });
}

/**
 *
 * @param options
 */
function appendPart(opts){
  var part = opts.part || {};

  if(!opts.hasarg){ return; }

  if (['range', 'prange'].indexOf(part.type) >= 0) {
    part.to = opts.buffer;
  } else if (opts.buffer && opts.buffer.length) {
    part.query = opts.buffer;
  }

  if (!part.type) {
    part.type = part.prefix ? 'prefix' : 'string';
  }

  opts.parts.push(part);

  if (opts.or_at_next_arg && (opts.or_at_next_arg + 1 === opts.parts.length)){
    logicalOr(opts.parts);
    opts.or_at_next_arg = 0;
  }

  opts.part = {};
  opts.buffer = '';
  opts.hasarg = false;

}

/**
 *
 * @param options
 * @param quote
 */
function inQuote(opts, quote){
  if(this._input.length === 0){
    return;
  }

  opts.character = this._input.shift();

  if (opts.character === quote) {
    appendPart.call(this, opts);
  } else {
    opts.buffer += opts.character;
    opts.hasarg = true;
    inQuote.call(this, opts, quote);
  }
}

/**
 *
 */
var matches = {

  screen: function(opts){
    opts.screen = true;
  },

  or_open: function(opts){
    if (opts.hasarg) {
      opts.buffer += opts.character;
    } else {
      opts.part.type = 'or';
      opts.part.queries = this.parse(this._input.join(''), true);
      if (opts.part.queries && opts.part.queries.length) {
        opts.hasarg = true;
        appendPart.call(this, opts);
      }
    }
  },

  or_close: function(opts){
    opts.close = true;
  },

  group_open: function(opts){
    if (opts.hasarg) {
      opts.buffer += opts.character;
    } else {
      opts.part.type = 'and';
      opts.part.queries = this.parse(this._input.join(''), true);
      if (opts.part.queries && opts.part.queries.length) {
        opts.hasarg = true;
        appendPart.call(this, opts);
      }
    }
  },

  group_close: function(opts){
    if(opts.open){
      opts.close = true;
      opts.open = undefined;
    } else {
      opts.buffer += opts.character;
    }
  },

  or: function(opts){
    opts.or_at_next_arg = opts.parts.length;
    if (opts.hasarg) {
      opts.or_at_next_arg += 1;
      appendPart.call(this, opts);
    }
  },

  prefix: function(opts){
    opts.part.prefix = opts.buffer;
    opts.part.type = 'prefix';
    opts.buffer = '';
    opts.hasarg = true;
  },

  range: function(opts){
    if (opts.part.type && (opts.part.type === 'prefix')) {
      opts.part.type = 'prange';
    } else {
      opts.part.type = 'range';
    }
    opts.part.from = opts.buffer;
    opts.buffer = '';
    opts.hasarg = true;
  },

  spaces: function(opts){
    appendPart.call(this, opts);
  },

  quotes: function(opts){
    if (opts.buffer.length) {
      opts.buffer += opts.character;
      opts.hasarg = true;
    } else {
      inQuote.call(this, opts, opts.character);
    }
  },

  flags: function(opts){
    if (!opts.buffer.length) {
      if (!opts.part.flags) { opts.part.flags = []; }
      opts.part.flags.push(opts.character);
    } else {
      opts.buffer += opts.character;
    }
  }
};

/**
 *
 * @param options
 */
function next(opts){
  opts.character = this._input.shift();
  var match = matchRegex.call(this, opts.character);
  if(match && !opts.screen){
    matches[match.toLowerCase()].call(this, opts);
  } else {
    opts.buffer += opts.character;
    opts.hasarg = true;
    opts.screen = false;
  }
  if(this._input.length > 0 && !opts.close){
    next.call(this, opts);
  } else {
    opts.close = undefined;
    return;
  }
}

/**
 *
 */
var methods = {

  parse: function(input, open) {
    var opts = {
      parts   : [],
      part    : {},
      open    : open,
      buffer  : '',
      hasarg  : false
    };

    if (!input || !input.length || (typeof input !== 'string')) {
      return opts.parts;
    }

    this._input = input.split('');
    next.call(this, opts);
    appendPart.call(this, opts);
    return opts.parts;
  }

};

_.extend(Parser.prototype, methods);

module.exports = Parser;
/* jshint +W071, +W074 */