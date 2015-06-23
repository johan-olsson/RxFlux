'use strict';

var rx = require('rx');
var uuid = require('uuid-js');

var Store = function() {
    
    var store = [];
    var StoreStream = new rx.Subject();

    this.emitChange = function (result) {

        StoreStream.onNext(result);
    }

    this.insert = function (item) {

        item._id = uuid.create(1).hex;
        store.push(item);

        return this.last();
    }

    this.update = function (query, to) {

        var result = store.filter(function (crate) {

            for (var key in query) {
                if (crate[key] !== query[key])
                    return false;
            }

            for (var key in to)
                crate[key] = to[key];

            return true;

        })

        if (result.length)
            return result;

        return null;
    }

    this.find = function (query) {

        if (typeof query === 'undefined')
            if (store.length)
                return store;
            return null;


        var result = store.filter(function (crate) {

            for (var key in query) {
                if (crate[key] !== query[key])
                    return false;
            }
            return true;

        })

        if (result.length)
            return result;

        return null;

    }
    
    this.delete = function (query) {
        
        if (typeof query === 'undefined')
            return store = [];

        store = store.filter(function (crate) {

            for (var key in query) {
                if (crate[key] === query[key])
                    return false;
            }
            return true;

        })

        return null;
    }

    this.first = function () {
        if (store[0])
            return store[0];

        return null;
    }

    this.last = function () {
        if (store[store.length - 1])
            return store[store.length - 1];

        return null;
    }

    this.Stream = StoreStream;
}

module.exports = new function () {

    var ActionStream = new rx.Subject();
    
    this.Dispatcher = ActionStream;

    this.Dispatcher.emit = function (target, type) {
        
        ActionStream.onNext({
            target: target,
            type: type,
            arguments: Array.prototype.splice.call(arguments, 2, arguments.length)
        })
    }

    this.createStore = function (options) {
        
        var store = new Store();
        
        for (var key in options)
            store[key] = options[key];

        if (store.actions instanceof Function)
            store.actions = store.actions.call(store);
        
        var actions = store.actions;   
        
        this.Dispatcher.subscribe(function (action) {

            if (action.target !== store.id)
                return false;

            if (typeof store.actions[action.type] === 'function') {
                store.emitChange(store.actions[action.type].apply(store, action.arguments));
                
            }

        })
        
        return store;
    }
}


