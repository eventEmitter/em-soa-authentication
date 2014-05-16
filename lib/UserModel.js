
    !function() {
        'use strict';

        var Class     = require('ee-class')
            , log     = require('ee-log');

        module.exports = new Class({

            init: function(options) {
                this.options = options || {};

                this.id         = options.id || null;
                this.roles      = options.roles || [];
                this.rights     = options.rights || {};
                this.profile    = options.profile || {};
                this.loginEmail = options.loginEmail || {};
            }

            , addAction: function(action, controller) {
                if(!this.hasController(controller)) {
                    this.addController(controller);
                }
                if(!this.hasControllerAction(controller, action)) {
                    this.rights[controller].actions.push(action);
                }
            }

            , hasControllerAction: function(controller, action) {
                 return this.rights[controller] && this.rights[controller].actions.indexOf(action) >= 0;
            }

            , addController: function(controller) {
                if(!this.hasController(controller)) {
                    this.rights[controller] = {
                        actions: []
                    };
                }
            }

            , hasController: function(controller) {
                return this.rights[controller] || false;
            }

            , addRole: function(role) {
                if(this.roles.indexOf(role) < 0) this.roles.push(role);
            }

            , hasRight: function(controller, action) {
                if(Object.hasOwnProperty.call(this.rights, controller)) {
                    if(this.rights[controller].actions.indexOf(action) >= 0) return true;
                }

                return false;
            }

        });

    }();
