var bb = require('backbone');

/* jshint -W074 */
module.exports = function(method, entity, options) {
  options = options || {};
  var isModel = entity instanceof bb.Model;
  var data = entity.toJSON();

  return entity.db.open()
    .then(function(){
      switch(method){
        case 'read':
          if( isModel ){
            return entity.db.get( entity.id, options );
          }
          return entity.db.getAll( options );
        case 'create':
          return entity.db.create( data, options );
        case 'update':
          return entity.db.update( data, options );
        case 'delete':
          if( isModel ){
            return entity.db.delete( entity.id, options );
          }
          return;
      }
    })
    .then(function(resp){
      if(options.success){
        options.success(resp);
      }
      return resp;
    })
    .catch(function(resp){
      if( options.error ){
        options.error(resp);
      }
    });

};
/* jshint +W074 */