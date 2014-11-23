Backbone.IndexedDB = function() {
    //this.name = name;
    //this.serializer = serializer || {
    //    serialize: function(item) {
    //        return isObject(item) ? JSON.stringify(item) : item;
    //    },
    //    // fix for "illegal access" error on Android when JSON.parse is passed null
    //    deserialize: function (data) {
    //        return data && JSON.parse(data);
    //    }
    //};
    //var store = this.localStorage().getItem(this.name);
    //this.records = (store && store.split(",")) || [];
};

_.extend(Backbone.IndexedDB.prototype, {

    open: function(entity, promise){
        var id = entity.database.id,
            migrations = entity.database.migrations,
            newVersion = _.last(migrations).version,
            openRequest = indexedDB.open( id, newVersion),
            promise = $.Deferred(),
            self = this;

        openRequest.onupgradeneeded = function(e) {
            var oldVersion = e.oldVersion,
                db = e.target.result;

            // Safari 8 bugfix
            if( oldVersion === 9223372036854776000 ) {
                oldVersion = 0;
            }

            // run migration
            self.migrate(db, migrations, oldVersion);

            // check store exists after migration
            if(!db.objectStoreNames.contains( entity.storeName )) {
                db.createObjectStore( entity.storeName );
            }
        }

        openRequest.onsuccess = function(e) {
            var db = e.target.result;
            promise.resolve(db);
        }

        openRequest.onerror = function(e) {
            //if(debug) { console.error( 'Could not connect to the database' + e ); }
        }

        openRequest.onabort = function(e) {
            //if(debug) { console.error( 'Connection to the database aborted' + e ); }
        }

        return promise;
    },

    migrate: function(db, migrations, oldVersion) {
        var migration = migrations.shift();

        if( migration ){
            var newVersion = migration.version;
            if( newVersion > oldVersion ) {
                //if(debug) { console.log( 'Upgrading database to version: ' + newVersion ); }
                migration.migrate(db);
                if( migrations.length > 0 ) {
                    this.migrate(db, migrations, newVersion);
                }
            }
        }
    },

    cache: function( entity ){
        var db = this.open(entity);

        db.done( function(db){
            var transaction = db.transaction([ entity.storeName ], 'readwrite'),
                store = transaction.objectStore( entity.storeName),
                request;

            var idAttribute = entity.get( entity.idAttribute ) || guid();

            if( !store.keyPath ) {
                request = store.add( entity.toJSON(), idAttribute );
            } else {
                request = store.add( entity.toJSON() );
            }

            request.onerror = function(e) {
                console.log("Error",e.target.error.name);
                //some type of error handler
            }

            request.onsuccess = function(e) {
                console.log("Woot! Did it");
            }
        });

    }

});