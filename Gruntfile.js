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

      // point to WordPress staging install
      staging : '/Users/kilbot/Sites/staging.woopos.com.au/wp-content/plugins/woocommerce-pos',

      // files to package for production
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
        files: ['<%= app.js.src %>/**/*.js'],
        tasks: ['webpack:dev', 'simplemocha', 'jshint:app']
      },
      hbs: {
        files: ['<%= app.js.src %>/**/*.hbs'],
        tasks: ['jshint', 'handlebars']
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
        require: ['susy', 'breakpoint'],
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

    handlebars: {
      compilerOptions: {
        knownHelpers: {
          'number': true,
          'money': true,
          'is': true,
          'getOption': true
        },
        knownHelpersOnly: true
      },
      compile: {
        options: {
          namespace: function(filename) {
            var names = filename.replace(/assets\/js\/src\/lib\/(.*)(\/\w+\.hbs)/, '$1').split('/');
            var array = names.map( function(name) {
              return name.charAt(0).toUpperCase() + name.slice(1);
            });
            return 'POS.' + array.join('.');
          },
          processName: function(filePath) {
            var pieces = filePath.split("/");
            var filename = pieces[pieces.length - 1];
            var name = filename.replace('.hbs', 'Tmpl');
            return name.charAt(0).toUpperCase() + name.slice(1);
          }
        },
        files: {
          'assets/js/src/lib/components/numpad/templates.jst':
            [
              'assets/js/src/lib/components/numpad/header.hbs',
              'assets/js/src/lib/components/numpad/numkeys.hbs',
            ]
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
          core: './<%= app.js.src %>/core.js',
          app: './<%= app.js.src %>/app.js',
          admin: './<%= app.js.src %>/admin.js'
        },
        module: {

        },
        resolve: {
          alias: {
            //handlebars: 'handlebars/dist/handlebars.runtime.js',
            //marionette: 'backbone.marionette',
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
          handlebars: 'Handlebars',
          accounting: 'accounting',
          moment: 'moment',
          select2: 'select2'
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
      prod: {
        output: {
          path: './<%= app.js.build %>/',
          filename: '[name].build.js'
        }
      }
    },

    // minify js
    uglify: {
      //pos: {
      //    files: {
      //        'assets/js/worker.min.js' : 'assets/js/src/worker.js',
      //        'assets/js/support.min.js' : 'assets/js/src/support.js',
      //    }
      //},
      //admin: {
      //    files: {
      //        'assets/js/products.min.js': 'assets/js/src/products.js'
      //    }
      //}
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

    // copy prod build to staging site, excluding dev files
    copy: {
      prod: {
        files: [
          {
            expand: true,
            src: ['<%= app.include %>'],
            dest: '<%= app.staging %>'
          },
        ]
      }
    },

    // deploy to WordPress repo
    wp_deploy: {
      deploy: {
        options: {
          plugin_slug: 'your-plugin-slug',
          svn_user: 'your-wp-repo-username',
          build_dir: '<%= app.staging %>', //relative path to your build directory
          assets_dir: 'wp-assets' //relative path to your assets directory (optional).
        }
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
          'tests/js/setup/node.js',
          'tests/js/setup/helpers.js',
          'tests/js/unit/**/*.spec.js'
        ]
      }
    },

    phpunit: {
      classes: {
        dir: 'tests/php/'
      },
      options: {
        //bin: 'tests/php/bin/',
        bootstrap: 'tests/php/bootstrap.php',
        colors: true
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
              '**/*.html'
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
  grunt.registerTask('dev', 'Development build', ['compass', 'cssmin', 'handlebars:compile', 'jshint', 'test', 'webpack:dev', 'watch']);

  // prod
  grunt.registerTask('prod', 'Production build', ['test', 'makepot', 'js_locales', 'webpack:prod', 'uglify:prod', 'copy']);

  // deploy
  grunt.registerTask('deploy', 'Deploy plugin to WordPress.org', ['prod', 'wp_deploy']);

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