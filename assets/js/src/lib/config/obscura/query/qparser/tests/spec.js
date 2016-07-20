var QParser = require('../qparser');
var qparser = new QParser();

describe('simple queries', function () {

  describe('one argument', function () {

    it('should parse empty argument', function () {
      qparser.parse('').should.eql([]);
    });

    it('should parse undefined argument', function () {
      qparser.parse(undefined).should.eql([]);
    });

    it('should parse string as simple string argument', function () {
      qparser.parse('abcdef').should.eql([{
        type: 'string',
        query: 'abcdef'
      }]);
    });

    it('should parse prefixed string as prefixed string argument', function () {
      qparser.parse('abc:def').should.eql([{
        type: 'prefix',
        prefix: 'abc',
        query: 'def'
      }]);
    });

    it('should parse several quoted words as single argument', function () {
      qparser.parse('"abc def qqq"').should.eql([{
        type: 'string',
        query: 'abc def qqq'
      }]);
    });

    it('should correctly treat unclosed quote', function () {
      qparser.parse('"abc def qqq').should.eql([{
        type: 'string',
        query: 'abc def qqq'
      }]);
    });

    //it('should parse range arguments', function () {
    //  qparser.parse('15-25').should.eql([{
    //    type: 'range',
    //    from: '15',
    //    to: '25'
    //  }]);
    //});
    //
    //it('should parse left range arguments', function () {
    //  qparser.parse('15-').should.eql([{
    //    type: 'range',
    //    from: '15',
    //    to: ''
    //  }]);
    //});
    //
    //it('should parse right range arguments', function () {
    //  qparser.parse('-25').should.eql([{
    //    type: 'range',
    //    from: '',
    //    to: '25'
    //  }]);
    //});
    //
    //it('should parse prefixed range arguments', function () {
    //  qparser.parse('pref:15-25').should.eql([{
    //    type: 'prange',
    //    prefix: 'pref',
    //    from: '15',
    //    to: '25'
    //  }]);
    //});

    it('should parse string arguments with flags', function () {
      qparser.parse('+*/!#~abcdef').should.eql([{
        flags: ['+', '*', '/', '!', '#', '~'],
        type: 'string',
        query: 'abcdef'
      }]);
    });

    it('should parse several prefixed quoted words with flags', function () {
      qparser.parse('+*/!#e:"abcdef qwerty"').should.eql([{
        flags: ['+', '*', '/', '!', '#'],
        type: 'prefix',
        prefix: 'e',
        query: 'abcdef qwerty'
      }]);
    });

    it('should screen special symbols with \\', function() {
      qparser.parse('\\+abcdef').should.eql([{
        type: 'string',
        query: '+abcdef'
      }]);
    });

    it('should correctly process flags separated with spaces', function() {
      qparser.parse('   +   abcdef   ').should.eql([{
        flags: ['+'],
        type: 'string',
        query: 'abcdef'
      }]);
    });

  });

  describe('several arguments', function() {

    it('should parse two prefixed quoted arguments with flags', function() {
      qparser.parse('+*/!#e:"abcdef qwerty" +#q:"foo bar"').should.eql([
        {
          flags: ['+', '*', '/', '!', '#'],
          type: 'prefix',
          prefix: 'e',
          query: 'abcdef qwerty'
        },
        {
          flags: ['+', '#'],
          type: 'prefix',
          prefix: 'q',
          query: 'foo bar'
        }
      ])
    });

  });

});

describe('complex queries', function() {

  describe('logical operators', function() {

    it('should group arguments in braces with AND', function() {
      qparser.parse('(abc def)').should.eql([
        {
          type: "and",
          queries: [
            {
              type: "string",
              query: "abc"
            },
            {
              type: "string",
              query: "def"
            }
          ]
        }
      ])
    });

    it('should correctly process closing brace', function() {
      qparser.parse('def) abc').should.eql([
        {
          type: "string",
          query: "def)"
        },
        {
          type: "string",
          query: "abc"
        },
      ])
    });

    it('should correctly process opening brace', function() {
      qparser.parse('(def abc').should.eql([
        {
          type: "and",
          queries: [
            {
              type: "string",
              query: "def"
            },
            {
              type: "string",
              query: "abc"
            }
          ]
        }
      ])
    });

    it('should not group arguments in screened braces', function() {
      qparser.parse('\\(abc def\\)').should.eql([
        {
          type: "string",
          query: "(abc"
        },
        {
          type: "string",
          query: "def)"
        }
      ])
    });

    it('should OR arguments separated by |', function() {
      qparser.parse('abc|def').should.eql([
        {
          type: "or",
          queries: [
            {
              type: "string",
              query: "abc"
            },
            {
              type: "string",
              query: "def"
            }
          ]
        }
      ])
    });

    it('should OR arguments in braces separated by |', function() {
      qparser.parse('(abc def)|qwe').should.eql([
        {
          type: "or",
          queries: [
            {
              type: "and",
              queries: [
                {
                  type: "string",
                  query: "abc"
                },
                {
                  type: "string",
                  query: "def"
                }
              ]
            },
            {
              type: "string",
              query: "qwe"
            }
          ]
        }
      ])
    });

    it('should OR and AND complex arguments', function() {
      qparser.parse('(!e:"abc def" #15)|(+q:"qwe rty" simple)').should.eql([
        {
          type: "or",
          queries: [
            {
              type: "and",
              queries: [
                {
                  flags: ["!"],
                  type: "prefix",
                  prefix: "e",
                  query: "abc def"
                },
                {
                  flags: ["#"],
                  type: "string",
                  query: "15"
                }
              ]
            },
            {
              type: "and",
              queries: [
                {
                  flags: ["+"],
                  type: "prefix",
                  prefix: "q",
                  query: "qwe rty"
                },
                {
                  type: "string",
                  query: "simple"
                }
              ]
            }
          ]
        }
      ])
    });

    it('should do two-level AND grouping', function() {
      qparser.parse("(abc ('def q' +qwe))").should.eql([
        {
          type: "and",
          queries: [
            {
              type: "string",
              query: "abc"
            },
            {
              type: "and",
              queries: [
                {
                  type: "string",
                  query: "def q"
                },
                {
                  flags: ["+"],
                  type: "string",
                  query: "qwe"
                }
              ]
            }
          ]
        }
      ])
    });

    it('should do OR grouping in the middle', function() {
      qparser.parse("abc def|qwe rty").should.eql([
        {
          type: "string",
          query: "abc"
        },
        {
          type: "or",
          queries: [
            {
              type: "string",
              query: "def"
            },
            {
              type: "string",
              query: "qwe"
            }
          ]
        },
        {
          type: "string",
          query: "rty"
        }
      ])
    });

    it('should OR simple terms in square braces', function() {
      qparser.parse("abc [def qwe rty]").should.eql([
        {
          type: "string",
          query: "abc"
        },
        {
          type: "or",
          queries: [
            {
              type: "string",
              query: "def"
            },
            {
              type: "string",
              query: "qwe"
            },
            {
              type: "string",
              query: "rty"
            }
          ]
        }
      ])
    });

    it('should OR complex terms in square braces', function() {
      qparser.parse("[abc (+def e:10 p:qwe) rty]").should.eql([
        {
          type: "or",
          queries: [
            {
              type: "string",
              query: "abc"
            },
            {
              type: "and",
              queries: [
                {
                  flags: ["+"],
                  type: "string",
                  query: "def"
                },
                {
                  type: "prefix",
                  prefix: "e",
                  query: "10"
                },
                {
                  type: "prefix",
                  prefix: "p",
                  query: "qwe"
                }
              ]
            },
            {
              type: "string",
              query: "rty"
            }
          ]
        }
      ])
    });

  });

});
