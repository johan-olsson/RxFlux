'use strict';

var rx = require('rx');
var uuid = require('uuid-js');

module.exports = function (name, options) {

    var StoreStream = new rx.Subject();
    var store = [];
    
    if (typeof localStorage !== 'undefined' && options.localStorage)
        store = JSON.parse(localStorage.getItem(name)) || [];
        
    this.emitChange = function (result) {

        if (typeof localStorage !== 'undefined' && options.localStorage)
            localStorage.setItem(name, JSON.stringify(store));

        result.forEach(function(change) {
            StoreStream.onNext(change);
        })     
    };

    this.insert = function (item) {

        item._id = uuid.create(1).hex;
        store.push(item);
        
        this.emitChange([this.last()]);
    };

    this.replace = function (query, to) {

        var result = store.filter(function (crate) {

            for (var key in query) {
                if (crate[key] !== query[key])
                    return false;
            }

            for (var key in crate)
                if (key !== '_id')
                    delete crate[key];
            
            for (var key in to)
                crate[key] = to[key];

            return true;

        })

        this.emitChange(result);
    };

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

        this.emitChange(result);
    };
    
    this.upsert = function(query, to) {

        var result = store.filter(function (crate) {

            for (var key in query) {
                if (crate[key] !== query[key])
                    return false;
            }

            for (var key in to)
                crate[key] = to[key];

            return true;

        })

        if (!result.length) {
            to._id = uuid.create(1).hex;
            result = [store.push(to)];
        }
            

        this.emitChange(result);
    }

    this.find = function (query) {

        if (typeof query === 'undefined')
            if (store.length)
                return store;
        return [];

        var result = store.filter(function (crate) {

            for (var key in query) {
                if (crate[key] !== query[key])
                    return false;
            }
            return true;

        })

        this.emitChange(result);
    };

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

        this.emitChange([]);
    };

    
    
    this.length = function() {
    
        return store.length;
        
    };
    
    this.first = function () {
        if (store[0])
            return store[0];

        return null;
    };

    this.last = function () {
        if (store[store.length - 1])
            return store[store.length - 1];

        return null;
    };

    this.Stream = StoreStream;
};

