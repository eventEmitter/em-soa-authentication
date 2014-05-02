
    !function() {
        'use strict';

        var Class     = require('ee-class')
            , log     = require('ee-log');

        module.exports = new Class({

            init: function(options) {
                this.options = options || {};
                
                this.orm  = options.orm || null;
                this.root = this.orm[this.options.dbName];
            }

            , request: function(req, res, next) {
                
                var requestToken = req.getRequestToken();
                var type         = requestToken.type;
                var tokenValue   = requestToken.value;

                if(!tokenValue) {
                    //TODO: send error on res!
                    res.send(res.status.ACCESS_MALFORMED);
                    return;
                }

                log('[SoaAuthentication] try to auth user with requestToken ' + tokenValue);
                log('[SoaAuthentication] request for ' + req.getCollection() + '.' + req.getActionName());

                var query = this.root.user(['*']);
                query.getAccessToken().getRequestToken({token: tokenValue});
                query.getRole(['*']).getControllerAction(['*']).fetchController(['*']).fetchControllerActionName(['*']);

                query.findOne(function(err, data) {
                    log(err, data);

                }.bind(this));

                // this.root.requestToken(['*'], {token: tokenValue}).find(function(err, data) {
                //     log(err, data);

                // }.bind(this));

                //next();

            }

        });

    }();
