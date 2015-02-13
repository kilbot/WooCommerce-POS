module.exports = function(grunt) {

  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // file paths
    app: {
      version: '<%= pkg.version %>',
      css: {
        src: 'assets/css/src',
        sass: 'assets/css/src/scss'
      },
      js: {
        src: 'assets/js/src',
        build: 'assets/js'
      },

      // point to staging folder
      staging : '/Users/kilbot/Sites/staging.woopos.com.au/wp-content/plugins/woocommerce-pos',

      // files to package for staging
      include: [
        '**/*',
        '!node_modules/**',
        '!test/**',
        '!Gruntfile.js',
        '!package.json',
        '!locales.json',
        '!<%= app.css.src %>/**',
        '!<%= app.js.src %>/**',
        '!README.md'
      ]
    },

    // watch for changes and trigger sass, jshint etc
    watch: {
      grunt: {
        files: ['Gruntfile.js']
      },
      compass: {
        files: ['<%= app.css.src %>/scss/**/*.scss' ],
        tasks: ['compass']
      },
      cssmin: {
        files: [
          '<%= app.css.src %>/pos.css',
          '<%= app.css.src %>/admin.css',
          '<%= app.css.src %>/icons.css'
        ],
        tasks: ['cssmin']
      },
      js: {
        files: ['<%= app.js.src %>/**/*.js', '<%= app.js.src %>/**/*.hbs'],
        tasks: ['webpack:dev', 'simplemocha', 'jshint:app']
      },
      test: {
        files: ['tests/js/**/*.js'],
        tasks: ['jshint:tests', 'simplemocha']
      },
      symlink: {
        files: ['<%= app.js.src %>/**/*.js'],
        options: {
          event: ['added', 'deleted']
        },
        tasks: ['symlink']
      }
    },

    // compass
    compass: {
      options: {
        require: ['breakpoint'],
        sassDir: 'assets/css/src/scss',
        cssDir: 'assets/css/src',
        fontsDir: 'assets/fonts',
        javascriptsDir: 'assets/js',
        imagesDir: 'assets',
        relativeAssets: true,
        raw: "Sass::Script::Number.precision = 10\n"
      },
      main: {
        options: {

        }
      }
    },

    // css minify
    cssmin: {
      options: {
        keepSpecialComments: 1
      },
      main: {
        files: {
          'assets/css/pos.min.css': ['assets/css/src/pos.css'],
          'assets/css/admin.min.css':['assets/css/src/admin.css'],
          'assets/css/icons.min.css':['assets/css/src/icons.css']
        }
      }
    },

    // javascript linting with jshint
    jshint: {
      options: {
        jshintrc : true,
        reporter: require('jshint-stylish'),
        verbose: true,
        force: true
      },
      app: [
        './assets/js/src/**/*.js',
        '!assets/js/vendor/**/*.js'
      ],
      tests: [
        './test/**/*.js'
      ]
    },

    webpack: {
      options: {
        entry: {
          app: './<%= app.js.src %>/app.js',
          admin: './<%= app.js.src %>/admin.js'
        },
        module: {
          loaders: [
            { test: /\.hbs$/, loader: 'raw-loader' }
          ]
        },
        resolve: {
          alias: {
            marionette: 'backbone.marionette',
            'backbone.wreqr': 'backbone.radio',
            radio: 'backbone.radio',
            underscore: 'lodash'
          },
          modulesDirectories: ['node_modules', './<%= app.js.src %>']
        },
        externals: {
          jquery: 'jQuery',
          lodash: '_',
          underscore: '_',
          backbone: 'Backbone',
          'backbone.radio': 'Backbone.Radio',
          radio: 'Backbone.Radio',
          'backbone.marionette': 'Marionette',
          marionette: 'Marionette',
          handlebars: 'Handlebars',
          accounting: 'accounting',
          moment: 'moment',
          select2: 'select2',
          'idb-wrapper': 'IDBStore'
        },
        cache: true,
        watch: true
      },
      dev: {
        output: {
          path: './<%= app.js.build %>/',
          filename: '[name].build.js',
          pathinfo: true
        },
        devtool: 'eval-source-map',
        debug: true
      },
      staging: {
        output: {
          path: './<%= app.js.build %>/',
          filename: '[name].build.js'
        }
      }
    },

    // minify js
    uglify: {
      staging: {
        files: {
          'assets/js/app.min.js': 'assets/js/app.build.js',
          'assets/js/admin.min.js': 'assets/js/admin.build.js'
        }
      }
    },

    // make .pot file
    makepot: {
      options: {
        type: 'wp-plugin',
        potHeaders: {
          'report-msgid-bugs-to': 'https://github.com/kilbot/WooCommerce-POS-Language-Packs/issues',
          'language-team': 'Team Name <team@example.com>'
        }
      },
      frontend: {
        options: {
          potFilename: 'woocommerce-pos.pot',
          exclude: [
            'includes/admin/.*',
            'includes/class-wc-pos-activator.php',
            'includes/class-wc-pos-deactivator.php'
          ],
          processPot: function( pot ) {
            var translation,
              excluded_meta = [
                'Plugin Name of the plugin/theme',
                'Plugin URI of the plugin/theme',
                'Author of the plugin/theme',
                'Author URI of the plugin/theme',
                'translators: woocommerce',
                'translators: woocommerce-admin',
                'translators: wordpress'
              ];

            for ( translation in pot.translations[''] ) {
              if ( 'undefined' !== typeof pot.translations[''][ translation ].comments.extracted ) {
                if ( excluded_meta.indexOf( pot.translations[''][ translation ].comments.extracted ) >= 0 ) {
                  //console.log( 'Excluded meta: ' + pot.translations[''][ translation ].comments.extracted );
                  delete pot.translations[''][ translation ];
                }
              }
            }

            return pot;
          }
        }
      },
      admin: {
        options: {
          potFilename: 'woocommerce-pos-admin.pot',
          include: [
            'includes/admin/.*',
            'includes/class-wc-pos-activator.php',
            'includes/class-wc-pos-deactivator.php'
          ],
          processPot: function( pot ) {
            var translation,
              excluded_meta = [
                'Plugin Name of the plugin/theme',
                'Plugin URI of the plugin/theme',
                'Author of the plugin/theme',
                'Author URI of the plugin/theme',
                'Description of the plugin/theme',
                'translators: woocommerce-pos',
                'translators: woocommerce',
                'translators: woocommerce-admin',
                'translators: wordpress'
              ];

            for ( translation in pot.translations[''] ) {
              if ( 'undefined' !== typeof pot.translations[''][ translation ].comments.extracted ) {
                if ( excluded_meta.indexOf( pot.translations[''][ translation ].comments.extracted ) >= 0 ) {
                  //console.log( 'Excluded meta: ' + pot.translations[''][ translation ].comments.extracted );
                  delete pot.translations[''][ translation ];
                }
              }
            }

            return pot;
          }
        }
      }
    },

    // copy staging build to staging site, excluding dev files
    copy: {
      staging: {
        files: [
          {
            expand: true,
            src: ['<%= app.include %>'],
            dest: '<%= app.staging %>'
          }
        ]
      }
    },

    // tests
    simplemocha: {
      options: {
        globals: ['should'],
        //timeout: 3000,
        //ignoreLeaks: false,
        //grep: '*-test',
        //ui: 'bdd',
        reporter: 'spec'
      },

      all: {
        src: [
          'tests/unit/js/setup/node.js',
          'tests/unit/js/setup/helpers.js',
          'tests/unit/js/spec/**/*.spec.js'
        ]
      }
    },

    // create symlink from node_modules to assets/js/src (for tests)
    symlink: {
      options: {
        overwrite: false
      },
      expanded: {
        files: [
          {
            expand: true,
            overwrite: false,
            cwd: 'assets/js/src',
            src: [
              '**/*.js',
              '**/*.html',
              '**/*.hbs'
            ],
            dest: 'node_modules'
          }
        ]
      }
    }

  });

  // test
  grunt.registerTask('test', 'Run unit tests', ['symlink', 'simplemocha']);

  // dev
  grunt.registerTask('dev', 'Development build', ['compass', 'cssmin', 'jshint', 'test', 'webpack:dev', 'watch']);

  // staging
  grunt.registerTask('staging', 'Production build', ['test', 'makepot', 'js_locales', 'webpack:staging', 'uglify:staging', 'copy']);

  // default = test
  grunt.registerTask('default', ['test']);

  // special task for building js i18n files
  grunt.registerTask('js_locales', 'Combine locales.json files', function() {
    var locales = grunt.file.readJSON('languages/locales.json');
    var _ = grunt.util._;
    var files = {};

    _(locales).each(function(locale, key){
      if( !_.isEmpty(locale) ) {
        var target = 'languages/js/' + key + '.js';
        files[target] = locale;
      }
    });

    grunt.config('uglify.js_locales', { 'files': files } );
    grunt.task.run('uglify:js_locales');
  });

};