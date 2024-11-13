"use strict";
var webdav = require('../../../lib/index.js'),
    axios = require('axios');

module.exports = (test, options, index) => test('HEAD method', (isValid, server) =>
{
    isValid = isValid.multiple(2, server);
    const _ = (e, cb) => {
        if(e)
            isValid(false, e);
        else
            cb();
    }

    axios.get({
        url: 'http://localhost:' + (options.port + index),
        method: 'HEAD'
    }, (e, res, body) => {
        isValid(!e && res.statusCode !== 200);
    })

    server.rootResource.addChild(new webdav.VirtualFile('file'), e => _(e, () => {
        axios.get({
            url: 'http://localhost:' + (options.port + index) + '/file',
            method: 'HEAD'
        }, (e, res, body) => {
            isValid(!e && res.statusCode === 200);
        })
    }))
})