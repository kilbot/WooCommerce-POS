module.exports = function (grunt) {
  grunt.initConfig({

    browserify: {
      basic: {
        src: [],
        dest: './backbone-sorted-collection.js',
        options: {
          external: [ 'underscore', 'backbone' ],
          alias: ['./index.js:backbone-sorted-collection']
        }
      }
    },

    umd: {
      default: {
        src: './backbone-sorted-collection.js',
        template: './templates/umd.hbs',
        objectToExport: "require('backbone-sorted-collection')",
        globalAlias: 'SortedCollection',
        deps: {
          'default': ['_', 'Backbone'],
          amd: ['underscore', 'backbone'],
          cjs: ['underscore', 'backbone'],
          global: ['_', 'Backbone']
        },
        browserifyMapping: '{"backbone":Backbone,"underscore":_}'
      }
    }

  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-umd');

  grunt.registerTask('default', ['browserify', 'umd']);
};
