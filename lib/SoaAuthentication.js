
    !function() {
        'use strict';

        var Class     = require('ee-class')
            , log     = require('ee-log');

        module.exports = new Class({

            init: function(options) {
                this.options = options || {};

            }

            , request: function(req, res, next) {
                log('authenticate request in "SoaAuthentication" middleware!');
                next();
            }

        });

    }();
