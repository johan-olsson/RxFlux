'use strict';
var assert = require('assert');
var RxFlux = require('../');

var Store = RxFlux.createStore('STORE', {
    localStorage: true
})

RxFlux
    .createAction('insert', function(data) {
        Store.insert(data)
    })
    .createAction('delete', function(query) {
        Store.delete(query)
    })
    .createAction('update', function() {
        Store.update.apply(Store, arguments)
    })
    .createAction('replace', function() {
        Store.replace.apply(Store, arguments)
    })


describe('ReFlux reactive store Flux flow.', function() {
    
    it('should add to queue stream when action is fired.', function(done) {
    
        Store.Stream.forEach(function(change) {
        
            if (change.foo == 'bar')
                if (change.test == 'fest')
                    done();
        })
        
        RxFlux.Dispatcher.emit('insert', {
        
            foo: 'bar',
            test: 'fest'
            
        })
    })
    
    it('should update all matching enteries when running update.', function(done) {
    
        RxFlux.Dispatcher.emit('insert', {
        
            foo: 'bar',
            test: 'fest2'
            
        })
        
        var result = [];
        
        Store.Stream.map(function(change) {
            
            result.push(change);
            return change;
            
        })
        .debounce(30)
        .subscribe(function() {

            if (result.every(function(item) {
                return item.foo == 'bar' && item.test == 'hest';
            })) done();
            
        })
        
        RxFlux.Dispatcher.emit('update', {
            foo: 'bar'
        }, {
            test: 'hest'
        })
    })
    
    it('should replace all matching enteries when running replace.', function(done) {
        
        var result = [];
        
        Store.Stream.map(function(change) {
            result.push(change);
            return change;
            
        })
        .debounce(60)
        .subscribe(function() {

            if (result.every(function(item) {
                return item.foo != 'bar' && item.test != 'hest' && item.lol == 'pop';
            })) done();
            
        })
        
        RxFlux.Dispatcher.emit('replace', {
            foo: 'bar'
        }, {
            lol: 'pop'
        })
    })
    
    
    it('should delete all matching enteries when running delete.', function(done) {
        
        var result = [];
        
        Store.Stream.map(function(change) {
            result.push(change);
            return change;
            
        })
        
        setTimeout(function() {
            
            if (result.length == 0)
                done();
            
        }, 30)

        RxFlux.Dispatcher.emit('delete', {
            lol: 'pop'
        })
    }) 
})







