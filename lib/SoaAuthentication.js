
    !function() {
        'use strict';

        var Class       = require('ee-class')
            , log       = require('ee-log')
            , UserModel = require('./UserModel');

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

                log('[SoaAuthentication] request for ' + req.getCollection() + '.' + req.getActionName());
                log('[SoaAuthentication] type: ' + type + ' | tokenValue: ' + tokenValue);

                //ANONYMOUS
                if(!tokenValue) {
                    this.authAnonymous(req, res, next);
                }
                //USER
                else {
                    this.authUser(req, res, next, tokenValue);
                }
            }

            , authAnonymous: function(req, res, next) {
                log('[SoaAuthentication] try to auth anonymous');

                var query = this.root.role(['*'], {name: 'Role_Anonymous'}).getControllerAction(['*']).fetchControllerActionName(['*']).getController(['*']).getService(['*']).getApplication(['*']);

                this.auth(req, res, query, next, true);
            }

            , authUser: function(req, res, next, tokenValue) {
                log('[SoaAuthentication] try to auth user with requestToken ' + tokenValue);

                var query = this.root.user(['*']).fetchUserProfile(['*']).fetchUserLoginEmail(['*']);
                query.getAccessToken().getRequestToken({token: tokenValue});
                query.getRole(['*']).getControllerAction(['*']).fetchControllerActionName(['*']).getController(['*']).getService(['*']).getApplication(['*']);

                this.auth(req, res, query, next);
            }

            , auth: function(req, res, query, next, anonymous) {
                query.findOne(function(err, data) {
                    if(err || !data) return res.send(res.statusCodes.ACCESS_FORBIDDEN);

                    var id         = anonymous ? null : (data.id || null);
                    var profile    = data.userProfile ? (data.userProfile[0] ? data.userProfile[0] : null) : null;
                    var loginEmail = data.userLoginEmail ? (data.userLoginEmail[0] ? data.userLoginEmail[0] : null) : null;

                    var user = new UserModel({
                        id           : id
                        , profile    : profile
                        , loginEmail : loginEmail
                    });

                    var roles = [];
                    if(!anonymous && data.role && data.role.length) roles = data.role;
                    else roles.push(data);

                    //ROLES
                    if(roles.length) {
                        roles.forEach(function(role) {

                            user.addRole(role);

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

                                    user.addAction(action, controller)

                                }.bind(this));
                            }

                        }.bind(this));
                    }

                    //have rights?
                    var controller = req.getCollection();
                    var action     = req.getActionName();
                    if(user.hasRight(controller, action)) {
                        req.user = user;
                        next();
                    }
                    else
                    {
                        log('[SoaAuthentication] ' + controller + '|' + action + ' not allowed for user!', user);
                        res.send(res.statusCodes.ACCESS_FORBIDDEN);
                    }

                }.bind(this));

            }

        });

    }();
