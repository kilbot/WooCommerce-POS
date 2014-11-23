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
                'unused' : false,
                'globals': {
                    'define': true,
                    'alert': true,
                    'Modernizr': true,
                    '$': true,
                    '_': true,
                    'Backbone': true,
                    'Marionette': true,
                    'Handlebars': true,
                    'POS': true
                },
                'strict': false,
                'force': true
            },
            all: [
                'Gruntfile.js',
                'assets/js/src/**/*.js',
                '!assets/js/vendor/**/*.js',
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
                        'assets/js/src/lib/config/sync.js',
                        'bower_components/backbone.syphon/lib/backbone.syphon.js',
                        'bower_components/backbone-poller/backbone.poller.min.js',
                        //'bower_components/backbone.paginator/lib/backbone.paginator.min.js',
                        'bower_components/idb-wrapper/idbstore.js',
                        'bower_components/backbone-idb/backbone-idb.js',
                        'bower_components/backbone-dualStorage/backbone.dualstorage.js',
                        'bower_components/backbone-filtered-collection/backbone-filtered-collection.js',

                        // templating
                        //'bower_components/handlebars/handlebars.min.js', // cndjs
                        'assets/js/src/lib/utilities/handlebars-helpers.js',

                        // bootstrap js
                        'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/modal.js',
                        'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tooltip.js',
                        'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/popover.js',
                        'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/transition.js',
                        'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/dropdown.js',

                        // other vendor plugins
                        //'bower_components/select2/select2.min.js', // cndjs
                        //'bower_components/moment/moment.js', // cndjs
                        //'bower_components/accounting/accounting.min.js', // cndjs
                        'bower_components/jquery.hotkeys/jquery.hotkeys.js'

                    ]
                }
            },
            app: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'assets/js/maps/app.map'
                },
                files: {
                    'assets/js/app.min.js': [

                        // main app & config
                        'assets/js/src/lib/config/application.js',
                        'assets/js/src/app.js',
                        'assets/js/src/lib/config/ajax.js',
                        'assets/js/src/lib/config/controller_base.js',

                        // entities
                        'assets/js/src/entities/db.js',
                        'assets/js/src/entities/products.js',
                        'assets/js/src/entities/orders.js',
                        'assets/js/src/entities/orders/model.js',
                        'assets/js/src/entities/orders/collection.js',
                        'assets/js/src/entities/customers.js',
                        'assets/js/src/entities/coupons.js',
                        'assets/js/src/entities/cart.js',
                        'assets/js/src/entities/cart/model.js',
                        'assets/js/src/entities/cart/collection.js',

                        'assets/js/src/entities/settings.js',
                        //'assets/js/src/entities/settings/user.js',

                        // components
                        'assets/js/src/lib/components/hotkeys/behavior.js',
                        'assets/js/src/lib/components/loading/controller.js',
                        'assets/js/src/lib/components/loading/view.js',
                        'assets/js/src/lib/components/modal/controller.js',
                        'assets/js/src/lib/components/modal/view.js',
                        'assets/js/src/lib/components/modal/behavior.js',
                        'assets/js/src/lib/components/tooltip/behavior.js',
                        'assets/js/src/lib/components/filter/behavior.js',
                        'assets/js/src/lib/components/pulse/behavior.js',
                        'assets/js/src/lib/components/autogrow/behavior.js',
                        'assets/js/src/lib/components/tabs/controller.js',
                        'assets/js/src/lib/components/tabs/view.js',
                        'assets/js/src/lib/components/tabs/entities.js',

                        // sub apps
                        'assets/js/src/apps/header/header_app.js',

                        'assets/js/src/apps/pos/pos_app.js',
                        'assets/js/src/apps/pos/products/controller.js',
                        'assets/js/src/apps/pos/products/view.js',
                        'assets/js/src/apps/pos/cart/controller.js',
                        'assets/js/src/apps/pos/cart/view.js',
                        'assets/js/src/apps/pos/checkout/controller.js',
                        'assets/js/src/apps/pos/checkout/view.js',
                        'assets/js/src/apps/pos/receipt/controller.js',
                        'assets/js/src/apps/pos/receipt/view.js',

                        'assets/js/src/apps/support/support_app.js',
                        'assets/js/src/apps/support/show/controller.js',
                        'assets/js/src/apps/support/show/view.js',

                    ]
                }
            },
            admin_app: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'assets/js/maps/admin_app.map'
                },
                files: {
                    'assets/js/admin_app.min.js': [

                        // main app & config
                        'assets/js/src/lib/config/application.js',
                        'assets/js/src/admin_app.js',
                        'assets/js/src/lib/config/ajax.js',
                        'assets/js/src/lib/config/controller_base.js',

                        // entities
                        'assets/js/src/entities/settings.js',

                        // components
                        'assets/js/src/lib/components/tooltip/behavior.js',
                        'assets/js/src/lib/components/select2/behavior.js',
                        'assets/js/src/lib/components/sortable/behavior.js',
                        'assets/js/src/lib/components/modal/controller.js',
                        'assets/js/src/lib/components/modal/view.js',
                        'assets/js/src/lib/components/modal/behavior.js',
                        'assets/js/src/lib/components/loading/controller.js',
                        'assets/js/src/lib/components/loading/view.js',

                        // subapps
                        'assets/js/src/apps/settings/settings_app.js',
                        'assets/js/src/apps/settings/show/controller.js',
                        'assets/js/src/apps/settings/show/view.js',
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
                    'assets/js/products.min.js': 'assets/js/src/products.js'
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