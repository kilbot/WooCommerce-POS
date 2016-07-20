module.exports = function (grunt) {
  grunt.initConfig({

    watch: {
      build: {
        files: ['index.js'],
        tasks: ['browserify', 'umd']
      },
      test: {
        files: ['index.js', 'test/*.js'],
        tasks: ['simplemocha']
      }
    },

    browserify: {
      basic: {
        src: [],
        dest: './backbone-paginated-collection.js',
        options: {
          external: [ 'underscore', 'backbone' ],
          alias: ['./index.js:backbone-paginated-collection']
        }
      }
    },

    umd: {
      default: {
        src: './backbone-paginated-collection.js',
        template: './templates/umd.hbs',
        objectToExport: "require('backbone-paginated-collection')",
        globalAlias: 'PaginatedCollection',
        deps: {
          'default': ['_', 'Backbone'],
          amd: ['underscore', 'backbone'],
          cjs: ['underscore', 'backbone'],
          global: ['_', 'Backbone']
        },
        browserifyMapping: '{"backbone":Backbone,"underscore":_}'
      }
    },

    // tests
    simplemocha: {
      options: {
        globals: ['should'],
        timeout: 3000,
        //ignoreLeaks: false,
        //grep: '*-test',
        //ui: 'bdd',
        reporter: 'spec'
        //slow: 100 // doesn't work :(
      },

      all: {
        src: [
          'test/setup.js',
          'test/test.js'
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-umd');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.registerTask('default', ['browserify', 'umd', 'simplemocha', 'watch']);
};
