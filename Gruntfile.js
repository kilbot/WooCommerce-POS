module.exports = function(grunt) {

  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);
  var webpack = require('webpack');

  var pkg = grunt.file.readJSON('package.json');

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
      tmp: '/tmp/woocommerce-pos',

      // files to package for staging
      include: [
        '**/*',
        '!node_modules/**',
        '!tests/**',
        '!Gruntfile.js',
        '!package.json',
        '!locales.json',
        '!phpunit.xml',
        '!phpunit.xml.dist',
        '!phpunit.int.xml',
        '!pioneer.json',
        '!<%= app.css.src %>/**',
        '!<%= app.js.src %>/**',
        '!README.md',
        '!coverage/**',
        '!styleguide/**'
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
          '<%= app.css.src %>/admin.css'
        ],
        tasks: ['cssmin']
      },
      js: {
        files: ['<%= jshint.app %>', '<%= app.js.src %>/**/*.hbs'],
        tasks: ['webpack:dev', 'simplemocha', 'jshint:app']
      },
      uglify: {
        files: ['assets/js/src/products.js'],
        tasks: ['uglify:simple']
      },
      test: {
        files: ['tests/unit/js/**/*.js'],
        tasks: ['jshint:tests', 'simplemocha']
      },
      symlink: {
        files: ['<%= jshint.app %>'],
        options: {
          event: ['added', 'deleted']
        },
        tasks: ['symlink']
      }
    },

    // compass
    compass: {
      options: {
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
        }
      }
    },

    // javascript linting with jshint
    jshint: {
      options: {
        jshintrc : true,
        reporter: require('jshint-stylish'),
        verbose: true
      },
      app: [
        './assets/js/src/**/*.js',
        '!./assets/js/vendor/**/*.js',
        '!./assets/js/src/lib/config/obscura/filtered/**/*.js',
        '!./assets/js/src/lib/config/obscura/paginated/**/*.js',
        '!./assets/js/src/lib/config/obscura/query/**/*.js',
        '!./assets/js/src/lib/config/obscura/sorted/**/*.js',
        '!./assets/js/src/lib/config/deep-model/**/*.js',
        '!./assets/js/src/lib/config/idb/**/*.js',
        '!./assets/js/src/lib/config/dual/**/*.js'
      ],
      tests: [
        './test/**/*.js'
      ]
    },

    webpack: {
      options: {
        entry: {
          app: './<%= app.js.src %>/app.js',
          'admin-settings': './<%= app.js.src %>/admin-settings.js',
          'admin-system-status': './<%= app.js.src %>/admin-system-status.js'
        },
        module: {
          loaders: [
            { test: /\.hbs$/, loader: 'raw-loader' }
          ]
        },
        //plugins: [
        //  new webpack.DefinePlugin({
        //    __VERSION__: JSON.stringify( idbVersion() )
        //  })
        //],
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
          pathinfo: true,
          library: 'POS'
        },
        devtool: 'eval-source-map',
        debug: true
      },
      deploy: {
        output: {
          path: './<%= app.js.build %>/',
          filename: '[name].build.js',
          library: 'POS'
        }
      }
    },

    // minify js
    uglify: {
      simple: {
        files: {
          'assets/js/products.min.js': 'assets/js/src/products.js'
        }
      },
      app: {
        files: {
          'assets/js/app.min.js': 'assets/js/app.build.js',
          'assets/js/admin-settings.min.js': 'assets/js/admin-settings.build.js',
          'assets/js/admin-system-status.min.js': 'assets/js/admin-system-status.build.js'
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
            'assets',
            'languages',
            'styleguide',
            'tests',
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
      //admin: {
      //  options: {
      //    potFilename: 'woocommerce-pos-admin.pot',
      //    exclude: [
      //      'styleguide'
      //    ],
      //    include: [
      //      'includes/admin/.*',
      //      'includes/products/.*',
      //      'includes/class-wc-pos-activator.php',
      //      'includes/class-wc-pos-deactivator.php'
      //    ],
      //    processPot: function( pot ) {
      //      var translation,
      //        excluded_meta = [
      //          'Plugin Name of the plugin/theme',
      //          'Plugin URI of the plugin/theme',
      //          'Author of the plugin/theme',
      //          'Author URI of the plugin/theme',
      //          'Description of the plugin/theme',
      //          'translators: woocommerce-pos',
      //          'translators: woocommerce',
      //          'translators: woocommerce-admin',
      //          'translators: wordpress'
      //        ];
      //
      //      for ( translation in pot.translations[''] ) {
      //        if ( 'undefined' !== typeof pot.translations[''][ translation ].comments.extracted ) {
      //          if ( excluded_meta.indexOf( pot.translations[''][ translation ].comments.extracted ) >= 0 ) {
      //            //console.log( 'Excluded meta: ' + pot.translations[''][ translation ].comments.extracted );
      //            delete pot.translations[''][ translation ];
      //          }
      //        }
      //      }
      //
      //      return pot;
      //    }
      //  }
      //}
    },

    // copy staging build to staging site, excluding dev files
    copy: {
      deploy: {
        files: [
          {
            expand: true,
            src: ['<%= app.include %>'],
            dest: '<%= app.tmp %>'
          }
        ]
      }
    },

    //tests
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

    mocha_istanbul: {
      coverage: {
        src: [
          'tests/unit/js/setup/node.js',
          'tests/unit/js/setup/helpers.js',
          'tests/unit/js/spec/**/*.spec.js'
        ],
        options: {
          coverage: true,
          root: './assets/js/src',
          reportFormats: ['cobertura']
        }
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
              '**/*.hbs',
              '!lib/config/obscura/**/*',
              'lib/config/obscura/*.js',
              'lib/config/obscura/filtered/index.js',
              'lib/config/obscura/paginated/index.js',
              'lib/config/obscura/sorted/index.js',
              'lib/config/obscura/query/query.js',
              'lib/config/obscura/query/qparser/qparser.js',
              '!lib/config/deep-model/**/*',
              'lib/config/deep-model/src/index.js',
              '!lib/config/idb/**/*',
              'lib/config/idb/src/**/*'
            ],
            dest: 'node_modules'
          }
        ]
      }
    },

    // Zip
    compress: {
      main: {
        options: {
          archive: '../woocommerce-pos-<%= pkg.version %>.zip'
        },
        files: [
          {
            expand: true,
            cwd: '<%= app.tmp %>',
            src: ['**/*'],
            dest: 'woocommerce-pos/'
          }
        ]
      }
    },

    clean: {
      options: {
        force: true
      },
      deploy: ['<%= app.tmp %>']
    },

    phpunit: {
      unit: {
        options: {
          configuration: 'phpunit.xml'
        }
      },
      integration: {
        options: {
          configuration: 'phpunit.int.xml'
        }
      }
    }

  });

  // test
  grunt.registerTask('test', 'Run unit tests', ['symlink', 'simplemocha']);

  // dev
  grunt.registerTask('dev', 'Development build', ['compass', 'cssmin', 'jshint', 'test', 'webpack:dev', 'uglify', 'watch']);

  // deploy
  grunt.registerTask('deploy', 'Production build', ['test', 'makepot', 'webpack:deploy', 'js_locales', 'uglify', 'copy', 'compress', 'clean']);

  // coverage
  grunt.registerTask('coverage', ['mocha_istanbul']);

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

  grunt.event.on('coverage', function(lcov, done){
    require('coveralls').handleInput(lcov, function(err){
      if (err) {
        return done(err);
      }
      done();
    });
  });

};