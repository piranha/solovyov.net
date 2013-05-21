window.byId = document.getElementById.bind(document);

String.prototype.format = function (data) {
    var s = this;
    return s.replace(/\{([^\}]+)\}/g, function(match, k) {
        return data[k];
    });
};

if (!('toISOString' in Date.prototype)) {
    Date.prototype.toISOString = function () {
        function pad(n, hundred) {
            n = n < 10 ? '0' + n : n;
            return hundred && n < 100 ? n + '0' : n;
        }
        return '{y}-{m}-{d}T{h}:{M}:{s}Z'.format({
            y: this.getUTCFullYear(),
            m: pad(this.getUTCMonth() + 1),
            d: pad(this.getUTCDate()),
            h: pad(this.getUTCHours()),
            M: pad(this.getUTCMinutes()),
            s: pad(this.getUTCSeconds(), true)
        });
    };
}

Date.monthNames = ('January February March April May June July August' +
                   'September October November December').split(' ');
Date.prototype.getMonthName = function() {
    return Date.monthNames[this.getMonth()];
};
Date.prototype.getMonthShort = function() {
    return this.getMonthName().slice(0, 3);
};

Date.prototype.format = function(s) {
    var self = this;
    return s.replace(/\{([^\}]+)\}/g, function(match, k) {
        return self['get' + k]();
    });
};

/*
* Anchorify without jQuery
* Rewritten from https://github.com/willdurand/anchorify.js/
*/

var anchorify = (function() {
    var specialCharsRe = /[ ;,.'?!_]/g;

    function generateId(text) {
        return text
            .trim()
            .replace(specialCharsRe, '-')
            .replace(/[\-]+/g, '-')
            .replace(/-$/, '')
            .toLowerCase();
    }

    function uniqId(id) {
        var inc = 1,
            original = id;

        while (document.getElementById(id)) {
            id = original + '-' + inc++;
        }

        return id;
    }

})();

/*
* Lightweight JSONP fetcher
* Copyright 2010-2012 Erik Karlsson. All rights reserved.
* BSD licensed
*/

var JSONP = (function(){
    var counter = 0, head, window = this, config = {};

    function load(url, pfnError) {
        var script = document.createElement('script'),
        done = false;
        script.src = url;
        script.async = true;

        var errorHandler = pfnError || config.error;
        if (typeof errorHandler === 'function') {
            script.onerror = function(ex){
                errorHandler({url: url, event: ex});
            };
        }

        script.onload = script.onreadystatechange = function() {
            if (!done && (!this.readyState ||
                          this.readyState === "loaded" ||
                          this.readyState === "complete") ) {
                done = true;
                script.onload = script.onreadystatechange = null;
                if (script && script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            }
        };

        if ( !head ) {
            head = document.getElementsByTagName('head')[0];
        }
        head.appendChild( script );
    }

    function jsonp(url, params, callback, callbackName) {
        var query = (url||'').indexOf('?') === -1 ? '?' : '&', key;

        callbackName = (callbackName || config.callbackName || 'callback');
        var uniqueName = callbackName + "_json" + (++counter);

        params = params || {};
        for (key in params) {
            if ( params.hasOwnProperty(key) ) {
                query += encodeURIComponent(key) + "=" +
                    encodeURIComponent(params[key]) + "&";
            }
        }

        window[uniqueName] = function(data){
            callback(data);
            window[uniqueName] = null;
            try {
                delete window[uniqueName];
            } catch (e) {}
        };

        load(url + query + callbackName + '=' + uniqueName);
        return uniqueName;
    }

    function setDefaults(obj){
        config = obj;
    }

    return {get: jsonp, init: setDefaults};
}());
