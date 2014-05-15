
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


                var query = this.root.user(['*']).fetchUserProfile(['*']).fetchUserLoginEmail(['*']);
                query.getAccessToken().getRequestToken({token: tokenValue});
                query.getRole(['*']).getControllerAction(['*']).fetchControllerActionName(['*']).getController(['*']).getService(['*']).getApplication(['*']);

                var user = {
                    roles: []
                    , rights: {}
                };
                query.findOne(function(err, data) {
                    if(err || !data) return res.send(res.status.ACCESS_FORBIDDEN);

                    // ID
                    user.id         = data.id;
                    user.profile    = data.userProfile[0] || {};
                    user.loginEmail = data.userLoginEmail[0] || {};

                    //ROLES
                    if(data.role.length) {
                        data.role.forEach(function(role) {
                            user.roles.push(role.name);

                            if(role.controllerAction.length) {
                                role.controllerAction.forEach(function(controllerAction) {
                                    // TODO: REPLACE LATER IF APPLICATION AND SERVICE IS AVAILABLE
                                    // var application = controllerAction.controller.service.application.name;
                                    // var service     = controllerAction.controller.service.name;
                                    var controller  = controllerAction.controller.name;
                                    var action      = controllerAction.controllerActionName.name;

                                    // if(!user.rights[application]) 
                                    //     user.rights[application] = { services: {} };                                    
                                    // if(!user.rights[application].services[service]) 
                                    //     user.rights[application].services[service] = { controllers: {} };
                                    // if(!user.rights[application].services[service].controllers[controller]) 
                                    //     user.rights[application].services[service].controllers[controller] = { actions: [] };
                                    // if(user.rights[application].services[service].controllers[controller].actions.indexOf(action) < 0) 
                                    //     user.rights[application].services[service].controllers[controller].actions.push(action);

                                    if(!user.rights[controller]) 
                                        user.rights[controller] = { actions: [] };
                                    if(user.rights[controller].actions.indexOf(action) < 0) 
                                        user.rights[controller].actions.push(action);

                                }.bind(this));
                            }

                        }.bind(this));
                    }
                
                    //have rights?
                    var controller = req.getCollection();
                    var action     = req.getActionName();
                    if(this.userHasRight(user, controller, action)) {
                        req.user = user;
                        next();
                    }
                    else
                    {
                        res.send(res.status.ACCESS_FORBIDDEN);
                    }

                }.bind(this));

            }

            , userHasRight: function(user, collection, action) {
                if(Object.hasOwnProperty.call(user.rights, collection)) {
                    if(user.rights[collection].actions.indexOf(action) >= 0) return true;
                }

                return false;
            }

        });

    }();
