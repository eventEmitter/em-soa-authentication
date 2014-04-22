
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
                log('authenticate request in "SoaAuthentication" middleware!');

                // var requestToken = 'fefb283a297327723d40927b6c7d9c68c7dca6887633a0548d5dddceae55d4049b96a33f1dfa394908dceb3f65bb8af926d455c1d2a7d7f8992c23a29f1dc2dd';
                // this.root.requestToken(['*'], {token: requestToken}).getAccessToken(['*']).getUser(['*']).findOne(function(err, token) {
                //     if(err) log(err);

                //     if(token) {
                //         log(token);
                //         next();
                //     }

                // }.bind(this));

            }

        });

    }();
