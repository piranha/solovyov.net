'use strict';

window.byId = function(id) {
    return document.getElementById(id);
};
window.qsa = function(sel) {
    return document.querySelectorAll(sel);
};

NodeList.prototype.forEach = Array.prototype.forEach;

String.prototype.format = function (data) {
    var s = this;
    return s.replace(/\{([^\}]+)\}/g, function(match, k) {
        return data[k];
    });
};

/*!
* Lightweight JSONP fetcher
* Copyright 2010-2019 Erik Arenhill. All rights reserved.
* BSD Zero Clause License
*/
var JSONP = (function(window, document){
    var counter = 0, head, config = {};
    function load(url, onTimeout) {
        var script = document.createElement('script'),
            done = false,
            timeoutTimer = null;
        script.src = url;
        script.async = true;

        var errorHandler = config.error;
        if ( typeof errorHandler === 'function' ) {
            script.onerror = function(ex){
                _clearTimeout();
                errorHandler({url: url, event: ex});
            };
        }

        script.onload = script.onreadystatechange = function() {
            if ( !done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') ) {
                done = true;
                _clearTimeout();
                script.onload = script.onreadystatechange = null;
                if ( script && script.parentNode ) {
                    script.parentNode.removeChild( script );
                }
            }
        };

        function _clearTimeout(){
            clearTimeout(timeoutTimer);
            timeoutTimer = null;
        }

        function triggerTimeout() {
            if ( typeof errorHandler === 'function' ) {
                errorHandler({url: url, event: new Error('Timeout')})
                onTimeout();
            }
        }

        if ( config.timeout ) {
            timeoutTimer = setTimeout(triggerTimeout, config.timeout)
        }

        if ( !head ) {
            head = document.getElementsByTagName('head')[0];
        }
        head.appendChild( script );
    }
    function encode(str) {
        return encodeURIComponent(str);
    }
    function jsonp(url, params, callback, callbackName) {
        var query = (url||'').indexOf('?') === -1 ? '?' : '&', key;

        callbackName = (callbackName||config['callbackName']||'callback');
        var uniqueName = callbackName + '_jsonp_' + (++counter);

        params = params || {};
        for ( key in params ) {
            if ( params.hasOwnProperty(key) ) {
                query += encode(key) + '=' + encode(params[key]) + '&';
            }
        }

        var didTimeout = false;
        window[ uniqueName ] = function(data){
            if ( !didTimeout ) {
                callback(data);
            }
            try {
                delete window[ uniqueName ];
            } catch (e) {}
            window[ uniqueName ] = null;
        };

        load(url + query + callbackName + '=' + uniqueName, function(){didTimeout = true;});
        return uniqueName;
    }
    function setDefaults(obj){
        config = obj;
    }
    return {
        get:jsonp,
        init:setDefaults
    }
}(window, document));
