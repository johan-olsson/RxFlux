'use strict';

var rx = require('rx');
var uuid = require('uuid-js');

module.exports = function (name, options) {

  var store = [];
  var StoreStreams = [];
  var options = options || {};
  var timer;
  
  var Result = function () {
    this.joinAll = function (joinStore, query, joinCallback) {
      
      this.forEach(function (crate) {
        
        if (query instanceof Function)
          query = query(crate);
        
        joinCallback(crate, joinStore.find(query))
        
      })
      return this;
    }
    return this;
  }

  if (typeof localStorage !== 'undefined' && options.localStorage)
    store = JSON.parse(localStorage.getItem(name)) || [];

  this.observe = function () {
    var stream = new rx.Subject();
    StoreStreams.push(stream);
    return stream;
  }

  this.emitChange = function (result) {


    if (typeof localStorage !== 'undefined' && options.localStorage)
      localStorage.setItem(name, JSON.stringify(store));

    if (options.debounce)
      clearTimeout(timer);

    timer = setTimeout(function () {
      result.forEach(function (change) {
        StoreStreams.forEach(function (StoreStream, key) {

          if (StoreStream.isDisposed)
            return delete StoreStream[key];
          StoreStream.onNext(change);
        })
      })
    }, (options.debounce) ? options.debounce : 0)
  };

  this.insert = function (item) {

    item._id = uuid.create(1).hex;
    store.push(item);

    this.emitChange([this.last()]);
  };

  this.replace = function (query, to) {

    var result = store.filter(function (crate) {

      for (var key in query) {
        if (query[key] instanceof Array) {
          if (query[key].indexOf(crate[key]) == -1)
            return false;
        } else if (crate[key] != query[key])
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
        if (query[key] instanceof Array) {
          if (query[key].indexOf(crate[key]) == -1)
            return false;
        } else if (crate[key] != query[key])
          return false;
      }

      for (var key in to)
        crate[key] = to[key];

      return true;

    })

    this.emitChange(result);
  };

  this.upsert = function (query, to) {

    var result = store.filter(function (crate) {

      for (var key in query) {
        if (query[key] instanceof Array) {
          if (query[key].indexOf(crate[key]) == -1)
            return false;
        } else if (crate[key] != query[key])
          return false;
      }

      for (var key in to)
        crate[key] = to[key];

      return true;

    })

    if (!result.length) {
      to._id = uuid.create(1).hex;
      store.push(to);
      result = [to];
    }

    this.emitChange(result);
  }

  this.find = function (query) {

    if (typeof query === 'undefined') {
      Result.call(store);
    }

    var result = store.filter(function (crate) {

      for (var key in query) {
        if (query[key] instanceof Array) {
          if (query[key].indexOf(crate[key]) == -1)
            return false;
        } else if (crate[key] != query[key])
          return false;
      }
      return true;

    })

    return Result.call(result);
  };

  this.delete = function (query) {

    if (typeof query === 'undefined') {
      store = [];
      return this.emitChange([{}]);
    }

    store = store.filter(function (crate) {

      for (var key in query) {
        if (query[key] instanceof Array) {
          if (query[key].indexOf(crate[key]) == -1)
            return true;
        } else if (crate[key] != query[key])
          return true;
      }
      return false;

    })

    this.emitChange([{}]);
  };


  this.filter = function (query) {

    if (typeof query === 'undefined')
      return store = store;

    store = store.filter(function (crate) {

      for (var key in query) {
        if (query[key] instanceof Array) {
          if (query[key].indexOf(crate[key]) == -1)
            return false;
        } else if (crate[key] != query[key])
          return false;
      }
      return true;

    })

    this.emitChange([{}]);
  };

  this.length = function () {

    return store.length;

  };

  this.first = function (query) {
    var result = null;

    if (typeof query === 'undefined') {
      if (store.length)
        return store[0];
      return result;
    }

    store.some(function (crate) {

      for (var key in query) {
        if (query[key] instanceof Array) {
          if (query[key].indexOf(crate[key]) == -1)
            return false;
        } else if (crate[key] != query[key])
          return false;
      }
      result = crate;
      return true;

    })

    return result;
  };

  this.last = function (query) {
    var result = null;

    if (typeof query === 'undefined') {
      if (store.length)
        return store[store.length - 1];
      return result;
    }

    store.reverse().some(function (crate) {

      for (var key in query) {
        if (query[key] instanceof Array) {
          if (query[key].indexOf(crate[key]) == -1)
            return false;
        } else if (crate[key] != query[key])
          return false;
      }
      result = crate;
      return true;

    })

    return result;
  };
};