'use strict';

var rx = require('rx');

var Store = require('./lib/Store')

module.exports = new function () {

    var actions = [];

    this.Constants = {};
    this.ActionStream = this.Dispatcher = new rx.Subject();
    this.Dispatcher.emit = function (name) {

        this.onNext({
            name: name,
            arguments: Array.prototype.splice.call(arguments, 1, arguments.length)
        })
    };

    this.ActionStream.subscribe(function (action) {
        if (actions[action.name])
            actions[action.name].apply(this, action.arguments);
    })

    this.createAction = function (name, callback) {

        actions[name] = callback;
        return this;
    };

    this.createStore = function (name, options) {

        return new Store(name, options);
    };

    this.setConstants = function () {

        Array.prototype.forEach.call(arguments, function(constant) {
        
            this.Constants[constant] = constant;
            
        }.bind(this))
        
        return this;
    };
};
