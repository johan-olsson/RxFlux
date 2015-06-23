#!/usr/bin/env node
'use strict';
var meow = require('meow');
var rxflux = require('./');

var cli = meow({
  help: [
    'Usage',
    '  rxflux <input>',
    '',
    'Example',
    '  rxflux Unicorn'
  ].join('\n')
});

rxflux(cli.input[0]);
