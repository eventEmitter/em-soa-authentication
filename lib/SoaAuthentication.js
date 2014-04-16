
    !function() {
        'use strict';

        var Class     = require('ee-class')
            , log     = require('ee-log');

        module.exports = new Class({

            init: function(options) {
                this.options = options || {};
                
                this.orm     = options.orm || null;
                this.user = {};

            }

            , request: function(req, res, next) {
                log('authenticate request in "SoaAuthentication" middleware!');
                next();
            }

        });

    }();
