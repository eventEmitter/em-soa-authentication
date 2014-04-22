
    !function() {
        'use strict';

        var Class     = require('ee-class')
            , log     = require('ee-log');

        module.exports = new Class({

            init: function(options) {
                this.options = options || {};
                
                this.orm     = options.orm || null;
                if(this.orm && this.options.dbName) {
                    this.root = this.orm[this.options.dbName];
                }
            }

            , registerService: function(service) {
                log('[SoaServiceRegistration] try to register Service ' + service.name);

                //TODO: check with id_application too
                this.root.service(['*'], {name: service.name}).findOne(function(err, entity) {
                    if(err) return log(err);

                    if(entity) {
                        log('[SoaServiceRegistration] Service `' + entity.name + '` already registered!');
                        this._registerControllers(service.getControllers(), entity);
                    }
                    else {
                        var newEntity = new this.root.service({name: service.name});

                        newEntity.save(function(err, newRecord) {
                            if(err) return log(err);

                            log('[SoaServiceRegistration] Service `' + newRecord.name + '` is now registered!');
                            this._registerControllers(service.getControllers(), newRecord);

                        }.bind(this));
                    }

                }.bind(this));
            }

            , _registerControllers: function(controllers, service) {
                Object.keys(controllers).forEach(function(controllerName) {
                    var controller = controllers[controllerName];

                    this.root.controller(['*'], {id_service: service.id, name: controllerName}).findOne(function(err, entity) {
                        if(err) return log(err);

                        if(entity) {
                            log('[SoaServiceRegistration] Controller `' + service.name + '|' + entity.name + '` already registered!');
                            this._registerControllerActions(controller.controllerActions, entity);
                        }
                        else {
                            var newEntity = new this.root.controller({id_service: service.id, name: controllerName});

                            newEntity.save(function(err, newRecord) {
                                if(err) return log(err);

                                log('[SoaServiceRegistration] Controller `' + service.name + '|' + newRecord.name + '` is now registered!');
                                this._registerControllerActions(controller.controllerActions, newRecord);

                            }.bind(this));
                        }

                    }.bind(this));

                }.bind(this));
            }

            , _registerControllerActions: function(controllerActions, controller) {
                controllerActions.forEach(function(controllerActionName) {

                    this.root.controllerAction(['*'], {name: controllerActionName}).findOne(function(err, entity) {
                        if(err) return log(err);

                        if(entity) {
                            log('[SoaServiceRegistration] ControllerAction `' + entity.name + '` already registered!');
                            this._addControllerActionToController(entity, controller);
                        }
                        else {
                            var newEntity = new this.root.controllerAction({name: controllerActionName});

                            newEntity.save(function(err, newRecord) {
                                if(err) return log(err);

                                log('[SoaServiceRegistration] ControllerAction `' + newRecord.name + '` is now registered!');
                                this._addControllerActionToController(newRecord, controller);

                            }.bind(this));
                        }

                    }.bind(this));
                
                }.bind(this));
            }

            , _addControllerActionToController: function(controllerAction, controller) {
                this.root.controller_controllerAction(['*'], {id_controllerAction: controllerAction.id, id_controller: controller.id}).findOne(function(err, entity) {
                    if(err) return log(err);

                    if(entity) {
                        log('[SoaServiceRegistration] ControllerAction `' + controllerAction.name + '` already combined with Controller `' + controller.name + '`!');
                    }
                    else {
                        var newEntity = new this.root.controller_controllerAction({id_controllerAction: controllerAction.id, id_controller: controller.id});

                        newEntity.save(function(err, newRecord) {
                            if(err) return log(err);

                            log('[SoaServiceRegistration] ControllerAction `' + controllerAction.name + '` id now combined with Controller `' + controller.name + '`!');

                        }.bind(this));
                    }

                }.bind(this));
            }

        });

    }();
