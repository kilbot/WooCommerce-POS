describe('lib/config/filtered-collection/parser.js', function () {

  before(function () {
    var Parser = require('lib/config/filtered-collection/parser');
    this.parser = new Parser();
  });

  it('should have parse method', function () {
    this.parser.should.respondTo('parse');
  });

  describe('simple queries', function () {

    describe('one argument', function () {

      it('should parse empty argument', function () {
        this.parser.parse('').should.eql([]);
      });

      it('should parse undefined argument', function () {
        this.parser.parse(undefined).should.eql([]);
      });

      it('should parse string as simple string argument', function () {
        this.parser.parse('abcdef').should.eql([{
          type: 'string',
          query: 'abcdef'
        }]);
      });

      it('should parse prefixed string as prefixed string argument', function () {
        this.parser.parse('abc:def').should.eql([{
          type: 'prefix',
          prefix: 'abc',
          query: 'def'
        }]);
      });

      it('should parse several quoted words as single argument', function () {
        this.parser.parse('"abc def qqq"').should.eql([{
          type: 'string',
          query: 'abc def qqq'
        }]);
      });

      it('should correctly treat unclosed quote', function () {
        this.parser.parse('"abc def qqq').should.eql([{
          type: 'string',
          query: 'abc def qqq'
        }]);
      });

      it('should parse range arguments', function () {
        this.parser.parse('15-25').should.eql([{
          type: 'range',
          from: '15',
          to: '25'
        }]);
      });

      it('should parse left range arguments', function () {
        this.parser.parse('15-').should.eql([{
          type: 'range',
          from: '15',
          to: ''
        }]);
      });

      it('should parse right range arguments', function () {
        this.parser.parse('-25').should.eql([{
          type: 'range',
          from: '',
          to: '25'
        }]);
      });

      it('should parse prefixed range arguments', function () {
        this.parser.parse('pref:15-25').should.eql([{
          type: 'prange',
          prefix: 'pref',
          from: '15',
          to: '25'
        }]);
      });

      it('should parse string arguments with flags', function () {
        this.parser.parse('+*/!#~abcdef').should.eql([{
          flags: ['+', '*', '/', '!', '#', '~'],
          type: 'string',
          query: 'abcdef'
        }]);
      });

      it('should parse several prefixed quoted words with flags', function () {
        this.parser.parse('+*/!#e:"abcdef qwerty"').should.eql([{
          flags: ['+', '*', '/', '!', '#'],
          type: 'prefix',
          prefix: 'e',
          query: 'abcdef qwerty'
        }]);
      });

      it('should screen special symbols with \\', function() {
        this.parser.parse('\\+abcdef').should.eql([{
          type: 'string',
          query: '+abcdef'
        }]);
      });

      it('should correctly process flags separated with spaces', function() {
        this.parser.parse('   +   abcdef   ').should.eql([{
          flags: ['+'],
          type: 'string',
          query: 'abcdef'
        }]);
      });

    });

    describe('several arguments', function() {

      it('should parse two prefixed quoted arguments with flags', function() {
        this.parser.parse('+*/!#e:"abcdef qwerty" +#q:"foo bar"').should.eql([
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
        this.parser.parse('(abc def)').should.eql([
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
        this.parser.parse('def) abc').should.eql([
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
        this.parser.parse('(def abc').should.eql([
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
        this.parser.parse('\\(abc def\\)').should.eql([
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
        this.parser.parse('abc|def').should.eql([
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
        this.parser.parse('(abc def)|qwe').should.eql([
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
        this.parser.parse('(!e:"abc def" #15-25)|(+q:"qwe rty" simple)').should.eql([
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
                    type: "range",
                    from: "15",
                    to: "25"
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
        this.parser.parse("(abc ('def q' +qwe))").should.eql([
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
        this.parser.parse("abc def|qwe rty").should.eql([
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
        this.parser.parse("abc [def qwe rty]").should.eql([
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
        this.parser.parse("[abc (+def e:10-15 p:qwe) rty]").should.eql([
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
                    type: "prange",
                    prefix: "e",
                    from: "10",
                    to: "15"
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

    describe('nested queries', function() {

      //it('should parse nested queries', function() {
      //  this.parser.parse("address:postcode:90210").should.eql([
      //    {
      //      type: 'nested',
      //      prefix: 'address',
      //      query: {
      //        type: 'string',
      //        prefix: 'postcode',
      //        query: '90210'
      //      }
      //    }
      //  ]);
      //});

    });

  });

});