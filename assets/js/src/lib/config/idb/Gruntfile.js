module.exports = function(grunt) {

  grunt.initConfig({

    watch: {
      js: {
        files: ['src/*.js'],
        tasks: ['jshint']
      },
      test: {
        files: ['test/spec.js']
      }
    },

    jshint: {
      options: {
        jshintrc: true,
        reporter: require('jshint-stylish'),
        verbose: true
      },
      files: ['src/*.js']
    },

    webpack: {
      options: {
        entry: {
          'backbone-idb': './index.js'
        },
        resolve: {
          modulesDirectories: ['node_modules']
        },
        externals: {
          jquery: 'jQuery',
          underscore: '_',
          backbone: 'Backbone',
          'idb-wrapper': 'IDBStore'
        },
        cache: true,
        watch: true
      },
      build: {
        output: {
          path: './',
          filename: '[name].js'
        }
      }
    }

  });

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('default', ['jshint', 'webpack']);
  grunt.registerTask('dev', ['default', 'watch']);
}