module.exports = function(grunt) {

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        // watch for changes and trigger sass, jshint, uglify and livereload
        watch: {
            compass: {
                files: ['assets/css/src/scss/**/*.scss' ],
                tasks: ['compass:dev']
            },
            cssmin: {
                files: [
                    'assets/css/src/pos.css',
                    'assets/css/src/admin.css',
                    'assets/css/src/icons.css'
                ],
                tasks: ['cssmin']
            },
            js: {
                files: '<%= jshint.all %>',
                tasks: ['jshint', 'uglify']
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
            dev: {
                options: {

                }
            }
        },

        // css minify
        cssmin: {
            options: {
                keepSpecialComments: 1
            },
            minify: {
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
                'reporter': require('jshint-stylish'),
                'bitwise': true,
                'boss' : true,
                'browser' : true,
                'curly' : true,
                'eqeqeq' : true,
                'eqnull' : true,
                'immed' : true,
                'jquery' : true,
                'latedef' : true,
                'newcap' : false,
                'noarg' : true,
                'node': true,
                'sub' : true,
                'trailing': true,
                'undef' : true,
                'unused' : true,
                'globals': {
                    'define': true,
                    'alert': true,
                    'pos_params': true,
                    'Modernizr': true,
                    '_': true
                },
                'strict': false,
                'force': true
            },
            all: [
                'Gruntfile.js',
                'assets/js/src/**/*.js',
                '!assets/js/src/vendor/**/*.js',
                //'tests/data/**/*.json',
                //'tests/specs/**/*.js',
                //'tests/main.js',
            ]
        },

        // minify js
        uglify: {
            core: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'assets/js/maps/core.map'
                },
                files: {
                    'assets/js/core.min.js': [

                        // marionette core (uses Backbone.Radio)
                        'bower_components/backbone.radio/build/backbone.radio.js',
                        'bower_components/backbone.babysitter/lib/backbone.babysitter.js',
                        'bower_components/marionette/lib/core/backbone.marionette.js',
                        'assets/js/src/lib/utilities/radio.shim.js',

                        // backbone extras
                        'bower_components/backbone.syphon/lib/backbone.syphon.js',
                    ]
                }
            },
            settings_app: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'assets/js/maps/settings_app.map'
                },
                files: {
                    'assets/js/settings_app.min.js': [
                        'assets/js/src/apps/settings/settings_app.js',
                        'assets/js/src/apps/settings/admin/controller.js',
                        'assets/js/src/apps/settings/admin/view.js',
                    ]
                }
            },
            admin_components: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'assets/js/maps/admin_components.map'
                },
                files: {
                    'assets/js/admin_components.min.js': [

                        //'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/modal.js',
                        //'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/popover.js',

                        // transition, required for tooltip, popover, modal
                        'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/transition.js',

                        // tooltip
                        'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tooltip.js',
                        'assets/js/src/lib/components/tooltip/behavior.js',

                        // select2
                        'bower_components/select2/select2.min.js',
                        'assets/js/src/lib/components/select2/behavior.js',

                        // sortable
                        'assets/js/src/lib/components/sortable/behavior.js',

                        // moment
                        'bower_components/moment/moment.js',

                        // modal
                        'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/modal.js',
                        'assets/js/src/lib/components/modal/controller.js',
                        'assets/js/src/lib/components/modal/view.js',
                        'assets/js/src/lib/components/modal/behavior.js',
                    ]
                }
            },
            pos: {
                files: {
                    'assets/js/worker.min.js' : 'assets/js/src/worker.js',
                    'assets/js/support.min.js' : 'assets/js/src/support.js',
                    'assets/js/plugins.min.js' : [
                        'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/dropdown.js',
                        'assets/js/src/pushy.js'
                    ]
                }
            },
            admin: {
                files: {
                    'assets/js/admin_app.min.js': 'assets/js/src/admin_app.js',
                    'assets/js/products.min.js': 'assets/js/src/products.js'
                }
            }
        },

        // make .pot file
        makepot: {
            target: {
                options: {
                    cwd: '',
                    domainPath: '/languages',
                    mainFile: 'woocommerce-pos.php',
                    potFilename: 'woocommerce-pos.pot',
                    processPot: function( pot ) {
                        pot.headers['report-msgid-bugs-to'] = 'https://github.com/kilbot/WooCommerce-POS/issues';
                        pot.headers['language-team'] = 'Team Name <team@example.com>';
                        return pot;
                    },
                    type: 'wp-plugin'
                }
            }
        }



    });

    // register tasks
    grunt.registerTask('default', ['makepot', 'compass', 'cssmin', 'jshint', 'uglify', 'watch']);

    grunt.registerTask('js_locales', 'Combine locales.json files', function() {
        var locales = grunt.file.readJSON('locales.json');
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