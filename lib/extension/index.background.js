(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var pingType="08937245-bb3b-4d47-8215-623851c36b3c",makeRequestType="f7f34d94-67be-4dad-b297-9fd890dd25ba",observeTransactionsType="a34a46f4-fd1d-4f8e-94fc-69ed030a6fe3";exports.pingType=pingType,exports.makeRequestType=makeRequestType,exports.observeTransactionsType=observeTransactionsType;


},{}],2:[function(require,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _applyDecoratedDescriptor(e,r,t,o,i){var s={};return Object.keys(o).forEach(function(e){s[e]=o[e]}),s.enumerable=!!s.enumerable,s.configurable=!!s.configurable,("value"in s||s.initializer)&&(s.writable=!0),s=t.slice().reverse().reduce(function(t,o){return o(e,r,t)||t},s),i&&void 0!==s.initializer&&(s.value=s.initializer?s.initializer.call(i):void 0,s.initializer=void 0),void 0===s.initializer&&(Object.defineProperty(e,r,s),s=null),s}Object.defineProperty(exports,"__esModule",{value:!0}),exports.canarySecret=exports.MakeRequest=void 0;var _desc,_value,_class,_class2,_temp,_getOwnPropertyDescriptor=require("babel-runtime/core-js/object/get-own-property-descriptor"),_getOwnPropertyDescriptor2=_interopRequireDefault(_getOwnPropertyDescriptor),_slicedToArray2=require("babel-runtime/helpers/slicedToArray"),_slicedToArray3=_interopRequireDefault(_slicedToArray2),_entries=require("babel-runtime/core-js/object/entries"),_entries2=_interopRequireDefault(_entries),_stringify=require("babel-runtime/core-js/json/stringify"),_stringify2=_interopRequireDefault(_stringify),_keys=require("babel-runtime/core-js/object/keys"),_keys2=_interopRequireDefault(_keys),_objectWithoutProperties2=require("babel-runtime/helpers/objectWithoutProperties"),_objectWithoutProperties3=_interopRequireDefault(_objectWithoutProperties2),_classCallCheck2=require("babel-runtime/helpers/classCallCheck"),_classCallCheck3=_interopRequireDefault(_classCallCheck2),_createClass2=require("babel-runtime/helpers/createClass"),_createClass3=_interopRequireDefault(_createClass2),_autoBind=require("react-suite-decorators/lib/auto-bind"),_autoBind2=_interopRequireDefault(_autoBind),_index=require("./index"),canarySecret="canary-secret-"+Date.now()+"-"+Math.random().toString().substring(2),requestUnsafeHeaders=["host","accept-encoding","cookie","cookies2","referer","user-agent","origin"],responseOverrideHeaders=["location","content-location"],MakeRequest=(_temp=_class2=function(){function e(){(0,_classCallCheck3.default)(this,e)}return(0,_createClass3.default)(e,[{key:"onConnect",value:function(e){this.port=e}},{key:"onDisconnect",value:function(){this.port=null}},{key:"resolve",value:function(e,r){this.port.postMessage({type:"resolve",kind:e,resolution:r}),this.port.disconnect()}},{key:"reject",value:function(e,r){r instanceof Error?r=r.message||r.toString():r instanceof ProgressEvent&&"error"===r.type&&(r="ProgressEvent error"),this.port.postMessage({type:"reject",kind:e,rejection:r}),this.port.disconnect()}},{key:"onErrorHandler",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:new Error("Error");this.reject("error",e)}},{key:"onAbortHandler",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:new Error("Abort");this.reject("abort",e)}},{key:"onTimeoutHandler",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:new Error("Timeout");this.reject("timeout",e)}},{key:"onLoadHandler",value:function(){var e=this.xhr.status,r=this.xhr.statusText,t={};this.xhr.getAllResponseHeaders().split("\r\n").filter(function(e){return e.trim().length>0}).forEach(function(e){var r=void 0,o=void 0,i=e.indexOf(":");i<0?(r=e,o=null):(r=e.substring(0,i),o=e.substring(i+1,e.length));var s=canarySecret+"-override-header-";r.substring(0,s.length)===s&&(r=r.substring(s.length,r.length)),o&&" "===o[0]&&(o=o.substring(1)),t.hasOwnProperty(r)?(Array.isArray(t[r])||(t[r]=[t[r]]),t[r].push(o)):t[r]=o});var o=this.xhr.response;this.resolve("response",{responseVersion:"HTTP/1.1",responseCode:e,responseMessage:r,responseHeaders:t,responseBody:o})}},{key:"open",value:function(e){var r=e.method,t=void 0===r?"GET":r,o=e.uri,i=(e.version,e.headers),s=void 0===i?{}:i,n=e.body,a=e.timeout,l=void 0===a?3e4:a,u=e.withCredentials,c=void 0!==u&&u;(0,_objectWithoutProperties3.default)(e,["method","uri","version","headers","body","timeout","withCredentials"]);var p=o;if(!p)throw new Error("Uri not specified");if(p=p.replace(/%00/g,"%u0000"),!/^https?:\/\//i.test(p))throw new Error("Uri protocol not allowed");var d=new XMLHttpRequest;d.open(t,p),(0,_entries2.default)(s).forEach(function(e){var r=(0,_slicedToArray3.default)(e,2),t=r[0],o=r[1];requestUnsafeHeaders.includes(t.toLowerCase().trim())&&(t=canarySecret+"-unsafe-header-"+t),Array.isArray(o)||(o=[o]),o.forEach(function(e){d.setRequestHeader(t,e)})}),d.setRequestHeader(canarySecret,(0,_stringify2.default)({withCredentials:c})),l&&(d.timeout=l),d.responseType="arraybuffer",d.withCredentials&&(d.withCredentials=c),d.onerror=this.onErrorHandler,d.onabort=this.onAbortHandler,d.ontimeout=this.onTimeoutHandler,d.onload=this.onLoadHandler,d.send(n),this.xhr=d}},{key:"abort",value:function(){this.xhr.abort()}},{key:"onMessage",value:function(e){var r=e.type,t=e.options;(0,_objectWithoutProperties3.default)(e,["type","options"]);switch(r){case"open":try{return this.open(t||void 0)}catch(e){return this.reject("error",e)}case"abort":try{return this.abort()}catch(e){return this.reject("error",e)}default:throw new Error("Unrecognized type "+r)}}}]),e}(),_class2.type=_index.makeRequestType,_class=_temp,_applyDecoratedDescriptor(_class.prototype,"onErrorHandler",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class.prototype,"onErrorHandler"),_class.prototype),_applyDecoratedDescriptor(_class.prototype,"onAbortHandler",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class.prototype,"onAbortHandler"),_class.prototype),_applyDecoratedDescriptor(_class.prototype,"onTimeoutHandler",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class.prototype,"onTimeoutHandler"),_class.prototype),_applyDecoratedDescriptor(_class.prototype,"onLoadHandler",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class.prototype,"onLoadHandler"),_class.prototype),_class);exports.default=MakeRequest,exports.MakeRequest=MakeRequest,exports.canarySecret=canarySecret;


},{"./index":1,"babel-runtime/core-js/json/stringify":11,"babel-runtime/core-js/object/entries":14,"babel-runtime/core-js/object/get-own-property-descriptor":15,"babel-runtime/core-js/object/keys":16,"babel-runtime/helpers/classCallCheck":19,"babel-runtime/helpers/createClass":20,"babel-runtime/helpers/objectWithoutProperties":22,"babel-runtime/helpers/slicedToArray":23,"react-suite-decorators/lib/auto-bind":119}],3:[function(require,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _applyDecoratedDescriptor(e,r,t,o,s){var n={};return Object.keys(o).forEach(function(e){n[e]=o[e]}),n.enumerable=!!n.enumerable,n.configurable=!!n.configurable,("value"in n||n.initializer)&&(n.writable=!0),n=t.slice().reverse().reduce(function(t,o){return o(e,r,t)||t},n),s&&void 0!==n.initializer&&(n.value=n.initializer?n.initializer.call(s):void 0,n.initializer=void 0),void 0===n.initializer&&(Object.defineProperty(e,r,n),n=null),n}Object.defineProperty(exports,"__esModule",{value:!0}),exports.ObserveTransactions=void 0;var _desc,_value,_class,_class2,_temp,_getOwnPropertyDescriptor=require("babel-runtime/core-js/object/get-own-property-descriptor"),_getOwnPropertyDescriptor2=_interopRequireDefault(_getOwnPropertyDescriptor),_keys=require("babel-runtime/core-js/object/keys"),_keys2=_interopRequireDefault(_keys),_objectWithoutProperties2=require("babel-runtime/helpers/objectWithoutProperties"),_objectWithoutProperties3=_interopRequireDefault(_objectWithoutProperties2),_extends2=require("babel-runtime/helpers/extends"),_extends3=_interopRequireDefault(_extends2),_slicedToArray2=require("babel-runtime/helpers/slicedToArray"),_slicedToArray3=_interopRequireDefault(_slicedToArray2),_entries=require("babel-runtime/core-js/object/entries"),_entries2=_interopRequireDefault(_entries),_concat=require("babel-runtime/core-js/array/concat"),_concat2=_interopRequireDefault(_concat),_toConsumableArray2=require("babel-runtime/helpers/toConsumableArray"),_toConsumableArray3=_interopRequireDefault(_toConsumableArray2),_classCallCheck2=require("babel-runtime/helpers/classCallCheck"),_classCallCheck3=_interopRequireDefault(_classCallCheck2),_createClass2=require("babel-runtime/helpers/createClass"),_createClass3=_interopRequireDefault(_createClass2),_autoBind=require("react-suite-decorators/lib/auto-bind"),_autoBind2=_interopRequireDefault(_autoBind),_makeRequest=require("./make-request"),_index=require("./index"),ObserveTransactions=(_temp=_class2=function(){function e(){(0,_classCallCheck3.default)(this,e),this.excludes=_concat2.default.apply(Array,(0,_toConsumableArray3.default)(chrome.runtime.getManifest().content_scripts.map(function(e){return e.matches.map(function(e){return new RegExp("^"+e.replace("*",".*"))})})))}return(0,_createClass3.default)(e,[{key:"onConnect",value:function(e){this.port=e,this.transactions=[]}},{key:"onDisconnect",value:function(){this.port=null,this.transactions=null,this.stop()}},{key:"pump",value:function(e,r){this.port.postMessage({type:"pump",kind:e,resolution:r})}},{key:"reject",value:function(e,r){r instanceof Error&&(r=r.message||r.toString()),this.port.postMessage({type:"reject",kind:e,rejection:r}),this.port.disconnect()}},{key:"concatArrayBuffers",value:function(e){var r=e.reduce(function(e,r){return e+r.byteLength},0),t=new Uint8Array(r),o=0;return e.forEach(function(e){t.set(new Uint8Array(e),o),o+=e.byteLength}),t}},{key:"normalizeHeaders",value:function(e){var r={};return e.forEach(function(e){var t=e.name,o=e.value;r.hasOwnProperty(t)?(Array.isArray(r[t])||(r[t]=[r[t]]),r[t].push(o)):r[t]=o}),r}},{key:"normalizeRequestBody",value:function(e){if(e){if(e.raw)return this.concatArrayBuffers(request.requestBody.raw.map(function(e){return e.bytes||new ArrayBuffer}));if(e.formData){var r=[];return(0,_entries2.default)(e.formData).forEach(function(e){var t=(0,_slicedToArray3.default)(e,2),o=t[0],s=t[1];Array.isArray(s)||(s=[s]),s.forEach(function(e){r.push(encodeURIComponent(o)+"="+encodeURIComponent(e))})}),new TextEncoder("utf-8").encode(r.join("&")).buffer}return e.error,new ArrayBuffer}return new ArrayBuffer}},{key:"normalizeResponseBody",value:function(e){return e?this.concatArrayBuffers(e):new ArrayBuffer}},{key:"finalize",value:function(e){if(e.statusLine){0,e.finalized=!0;var r=e.statusLine.split(" "),t=(0,_slicedToArray3.default)(r,3),o=t[0],s=t[1],n=t[2];this.pump("transaction",{method:e.method,uri:e.url,version:o,headers:this.normalizeHeaders(e.requestHeaders),body:this.normalizeRequestBody(e.requestBody),responseVersion:o,responseCode:s,responseMessage:n,responseHeaders:this.normalizeHeaders(e.responseHeaders),responseBody:this.normalizeResponseBody(e.responseBody),_chrome_requestId:e.requestId,_chrome_type:e.type,_chrome_ip:e.ip,_chrome_fromCache:e.fromCache,_chrome_timeStamp:e.timeStamp,_chrome_originUrl:e.originUrl,_chrome_redirectUrl:e.redirectUrl})}}},{key:"onFilterDataHandler",value:function(e,r,t){e.write(t.data),r.responseBody.push(t.data)}},{key:"onFilterStopHandler",value:function(e,r,t){e.disconnect(),this.finalize(r)}},{key:"onBeforeRequestHandler",value:function(e){if(!this.excludes.some(function(r){return r.test(e.url)})&&(this.transactions[e.requestId]=(0,_extends3.default)({},e,{responseBody:[]}),chrome.webRequest&&chrome.webRequest.filterResponseData)){var r=chrome.webRequest.filterResponseData(e.requestId);r.ondata=this.onFilterDataHandler.bind(null,r,this.transactions[e.requestId]),r.onstop=this.onFilterStopHandler.bind(null,r,this.transactions[e.requestId])}}},{key:"onBeforeSendHeadersHandler",value:function(e){this.transactions.hasOwnProperty(e.requestId)&&(e.requestHeaders.some(function(e){return e.name===_makeRequest.canarySecret})?delete this.transactions[e.requestId]:this.transactions[e.requestId].requestHeaders=[].concat((0,_toConsumableArray3.default)(e.requestHeaders)))}},{key:"onBeforeRedirectHandler",value:function(e){if(this.transactions.hasOwnProperty(e.requestId)){var r=this.transactions[e.requestId];r.statusLine=e.statusLine,r.responseHeaders=[].concat((0,_toConsumableArray3.default)(e.responseHeaders)),chrome.webRequest&&chrome.webRequest.filterResponseData||this.finalize(r)}}},{key:"onCompleteHandler",value:function(e){if(this.transactions.hasOwnProperty(e.requestId)){var r=this.transactions[e.requestId];r.statusLine=e.statusLine,r.responseHeaders=[].concat((0,_toConsumableArray3.default)(e.responseHeaders)),chrome.webRequest&&chrome.webRequest.filterResponseData||this.finalize(r)}}},{key:"onErrorOccurredHandler",value:function(e){delete this.transactions[e.requestId]}},{key:"start",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{urls:["http://*/*","https://*/*"]};chrome.webRequest.onBeforeRequest.addListener(this.onBeforeRequestHandler,e,["requestBody","blocking"]),chrome.webRequest.onBeforeSendHeaders.addListener(this.onBeforeSendHeadersHandler,e,["requestHeaders"]),chrome.webRequest.onBeforeRedirect.addListener(this.onBeforeRedirectHandler,e,["responseHeaders"]),chrome.webRequest.onCompleted.addListener(this.onCompleteHandler,e,["responseHeaders"]),chrome.webRequest.onErrorOccurred.addListener(this.onErrorOccurredHandler,e)}},{key:"stop",value:function(){chrome.webRequest.onBeforeRequest.removeListener(this.onBeforeRequestHandler),chrome.webRequest.onBeforeSendHeaders.removeListener(this.onBeforeSendHeadersHandler),chrome.webRequest.onBeforeRedirect.removeListener(this.onBeforeRedirectHandler),chrome.webRequest.onCompleted.removeListener(this.onCompleteHandler),chrome.webRequest.onErrorOccurred.removeListener(this.onErrorOccurredHandler)}},{key:"onMessage",value:function(e){var r=e.type,t=e.options;(0,_objectWithoutProperties3.default)(e,["type","options"]);switch(r){case"start":try{return this.start(t||void 0)}catch(e){return this.reject("error",e)}case"stop":try{return this.stop()}catch(e){return this.reject("error",e)}default:throw new Error("Unrecognized type "+r)}}}]),e}(),_class2.type=_index.observeTransactionsType,_class=_temp,_applyDecoratedDescriptor(_class.prototype,"onFilterDataHandler",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class.prototype,"onFilterDataHandler"),_class.prototype),_applyDecoratedDescriptor(_class.prototype,"onFilterStopHandler",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class.prototype,"onFilterStopHandler"),_class.prototype),_applyDecoratedDescriptor(_class.prototype,"onBeforeRequestHandler",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class.prototype,"onBeforeRequestHandler"),_class.prototype),_applyDecoratedDescriptor(_class.prototype,"onBeforeSendHeadersHandler",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class.prototype,"onBeforeSendHeadersHandler"),_class.prototype),_applyDecoratedDescriptor(_class.prototype,"onBeforeRedirectHandler",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class.prototype,"onBeforeRedirectHandler"),_class.prototype),_applyDecoratedDescriptor(_class.prototype,"onCompleteHandler",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class.prototype,"onCompleteHandler"),_class.prototype),_applyDecoratedDescriptor(_class.prototype,"onErrorOccurredHandler",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class.prototype,"onErrorOccurredHandler"),_class.prototype),_class);exports.default=ObserveTransactions,exports.ObserveTransactions=ObserveTransactions;


},{"./index":1,"./make-request":2,"babel-runtime/core-js/array/concat":7,"babel-runtime/core-js/object/entries":14,"babel-runtime/core-js/object/get-own-property-descriptor":15,"babel-runtime/core-js/object/keys":16,"babel-runtime/helpers/classCallCheck":19,"babel-runtime/helpers/createClass":20,"babel-runtime/helpers/extends":21,"babel-runtime/helpers/objectWithoutProperties":22,"babel-runtime/helpers/slicedToArray":23,"babel-runtime/helpers/toConsumableArray":24,"react-suite-decorators/lib/auto-bind":119}],4:[function(require,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _applyDecoratedDescriptor(e,t,r,i,o){var n={};return Object.keys(i).forEach(function(e){n[e]=i[e]}),n.enumerable=!!n.enumerable,n.configurable=!!n.configurable,("value"in n||n.initializer)&&(n.writable=!0),n=r.slice().reverse().reduce(function(r,i){return i(e,t,r)||r},n),o&&void 0!==n.initializer&&(n.value=n.initializer?n.initializer.call(o):void 0,n.initializer=void 0),void 0===n.initializer&&(Object.defineProperty(e,t,n),n=null),n}Object.defineProperty(exports,"__esModule",{value:!0}),exports.Ping=void 0;var _desc,_value,_class,_class2,_temp,_getOwnPropertyDescriptor=require("babel-runtime/core-js/object/get-own-property-descriptor"),_getOwnPropertyDescriptor2=_interopRequireDefault(_getOwnPropertyDescriptor),_classCallCheck2=require("babel-runtime/helpers/classCallCheck"),_classCallCheck3=_interopRequireDefault(_classCallCheck2),_createClass2=require("babel-runtime/helpers/createClass"),_createClass3=_interopRequireDefault(_createClass2),_autoBind=require("react-suite-decorators/lib/auto-bind"),_autoBind2=_interopRequireDefault(_autoBind),_index=require("./index"),Ping=(_temp=_class2=function(){function e(){(0,_classCallCheck3.default)(this,e)}return(0,_createClass3.default)(e,[{key:"logInfo",value:function(){for(var e,t=arguments.length,r=Array(t),i=0;i<t;i++)r[i]=arguments[i];(e=console).info.apply(e,[Date.now(),this.port.isServer?"server":"client"].concat(r))}},{key:"logError",value:function(){for(var e,t=arguments.length,r=Array(t),i=0;i<t;i++)r[i]=arguments[i];(e=console).error.apply(e,[Date.now(),this.port.isServer?"server":"client"].concat(r))}},{key:"onPingTimeoutHandler",value:function(){this.logError(Error("Ping timeout"))}},{key:"onDisconnectTimeoutHandler",value:function(){this.logError(new Error("Disconnect timeout"))}},{key:"onConnect",value:function(e){this.port=e,this.pingTimeout=setTimeout(this.onPingTimeoutHandler,3e3),this.port.isClient&&this.port.postMessage("ping")}},{key:"onDisconnect",value:function(){this.port=null,this.disconnectTimeout=clearTimeout(this.disconnectTimeout)}},{key:"onMessage",value:function(e){if("ping"!==e)throw new Error("Unexpected message "+e);this.pingTimeout=clearTimeout(this.pingTimeout),this.disconnectTimeout=setTimeout(this.onDisconnectTimeoutHandler,3e3),this.port.postMessage("ping"),this.port.disconnect()}}]),e}(),_class2.type=_index.pingType,_class=_temp,_applyDecoratedDescriptor(_class.prototype,"onPingTimeoutHandler",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class.prototype,"onPingTimeoutHandler"),_class.prototype),_applyDecoratedDescriptor(_class.prototype,"onDisconnectTimeoutHandler",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class.prototype,"onDisconnectTimeoutHandler"),_class.prototype),_class);exports.default=Ping,exports.Ping=Ping;


},{"./index":1,"babel-runtime/core-js/object/get-own-property-descriptor":15,"babel-runtime/helpers/classCallCheck":19,"babel-runtime/helpers/createClass":20,"react-suite-decorators/lib/auto-bind":119}],5:[function(require,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}var _ping=require("./handlers/ping"),_ping2=_interopRequireDefault(_ping),_runtime=require("./lib/runtime"),_makeRequest=require("./handlers/make-request"),_makeRequest2=_interopRequireDefault(_makeRequest),_observeTransactions=require("./handlers/observe-transactions"),_observeTransactions2=_interopRequireDefault(_observeTransactions);var browserRuntime=new _runtime.BrowserRuntime;browserRuntime.listen(_ping2.default.type,_ping2.default),browserRuntime.listen(_makeRequest2.default.type,_makeRequest2.default),browserRuntime.listen(_observeTransactions2.default.type,_observeTransactions2.default);


},{"./handlers/make-request":2,"./handlers/observe-transactions":3,"./handlers/ping":4,"./lib/runtime":6}],6:[function(require,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _applyDecoratedDescriptor(e,t,n,s,o){var r={};return Object.keys(s).forEach(function(e){r[e]=s[e]}),r.enumerable=!!r.enumerable,r.configurable=!!r.configurable,("value"in r||r.initializer)&&(r.writable=!0),r=n.slice().reverse().reduce(function(n,s){return s(e,t,n)||n},r),o&&void 0!==r.initializer&&(r.value=r.initializer?r.initializer.call(o):void 0,r.initializer=void 0),void 0===r.initializer&&(Object.defineProperty(e,t,r),r=null),r}Object.defineProperty(exports,"__esModule",{value:!0}),exports.RuntimeHandler=exports.BrowserRuntime=exports.GenericRuntime=exports.RuntimeProxy=void 0;var _desc,_value,_class2,_class3,_temp,_getOwnPropertyDescriptor=require("babel-runtime/core-js/object/get-own-property-descriptor"),_getOwnPropertyDescriptor2=_interopRequireDefault(_getOwnPropertyDescriptor),_classCallCheck2=require("babel-runtime/helpers/classCallCheck"),_classCallCheck3=_interopRequireDefault(_classCallCheck2),_createClass2=require("babel-runtime/helpers/createClass"),_createClass3=_interopRequireDefault(_createClass2),_oneTime=require("react-suite-decorators/lib/one-time"),_oneTime2=_interopRequireDefault(_oneTime),_autoBind=require("react-suite-decorators/lib/auto-bind"),_autoBind2=_interopRequireDefault(_autoBind),RuntimeHandler=function(){function e(){(0,_classCallCheck3.default)(this,e)}return(0,_createClass3.default)(e,[{key:"onConnect",value:function(){}},{key:"onDisconnect",value:function(){}},{key:"onMessage",value:function(){}}]),e}(),BrowserRuntime=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:chrome.runtime;(0,_classCallCheck3.default)(this,e),this.runtime=t}return(0,_createClass3.default)(e,[{key:"makePort",value:function(e,t,n,s){return e.onMessage.addListener(n),e.onDisconnect.addListener(s),new(function(){function n(){(0,_classCallCheck3.default)(this,n)}return(0,_createClass3.default)(n,[{key:"postMessage",value:function(t){e.postMessage(t)}},{key:"disconnect",value:function(){e.disconnect(),s()}},{key:"isServer",get:function(){return t}},{key:"isClient",get:function(){return!t}}]),n}())}},{key:"listen",value:function(e,t){for(var n=arguments.length,s=Array(n>2?n-2:0),o=2;o<n;o++)s[o-2]=arguments[o];var r=this;this.runtime.onConnect.addListener(function(n){if(n.name===e){var o=new(Function.prototype.bind.apply(t,[null].concat(s))),i=(0,_oneTime2.default)(function(){o.onDisconnect()});o.onConnect(r.makePort(n,!0,function(e){o.onMessage(e)},i))}})}},{key:"connect",value:function(e,t){for(var n=this.runtime.connect({name:e}),s=arguments.length,o=Array(s>2?s-2:0),r=2;r<s;r++)o[r-2]=arguments[r];var i=new(Function.prototype.bind.apply(t,[null].concat(o))),a=(0,_oneTime2.default)(function(){i.onDisconnect()});i.onConnect(this.makePort(n,!1,function(e){i.onMessage(e)},a))}},{key:"disconnect",value:function(){}}]),e}(),GenericRuntime=(_temp=_class3=function(){function e(t){(0,_classCallCheck3.default)(this,e),this.runtime=t,"undefined"!=typeof Window&&this.runtime instanceof Window?(this.runtimePostMessage=this.windowPostMessage,this.runtimeEventValidator=this.windowEventValidator):"undefined"!=typeof Worker&&this.runtime instanceof Worker?(this.runtimePostMessage=this.workerPostMessage,this.runtimeEventValidator=this.workerEventValidator):(this.runtimePostMessage=this.genericPostMessage,this.runtimeEventValidator=this.genericEventValidator),this.messageHandlersHash={},this.disconnectHandlersHash={}}return(0,_createClass3.default)(e,[{key:"windowPostMessage",value:function(e){this.runtime.postMessage(e,"*")}},{key:"workerPostMessage",value:function(e){this.runtime.postMessage(e)}},{key:"genericPostMessage",value:function(e){this.runtime.postMessage(e)}},{key:"windowEventValidator",value:function(e){return e.source===this.runtime}},{key:"workerEventValidator",value:function(e){return!0}},{key:"genericEventValidator",value:function(e){return!0}},{key:"runtimeAddEventListener",value:function(){var e;(e=this.runtime).addEventListener.apply(e,arguments)}},{key:"runtimeRemoveEventListener",value:function(){var e;(e=this.runtime).removeEventListener.apply(e,arguments)}},{key:"makeId",value:function(){return Date.now()+"-"+Math.random().toString().substring(2)}},{key:"handleMessage",value:function(e,t,n,s){if(this.runtimeEventValidator(s)){var o=this.constructor.messageType,r=s.data;r.type===o&&r.port===e&&r.id!==t&&(s.stopPropagation(),n(r.message))}}},{key:"handleDisconnect",value:function(e,t,n,s){if(this.runtimeEventValidator(s)){var o=this.constructor.disconnectType,r=s.data;r.type===o&&r.port===e&&r.id!==t&&(s.stopPropagation(),n())}}},{key:"makePort",value:function(e,t,n,s,o){var r=this,i=this.constructor,a=i.messageType,c=i.disconnectType,u=function(){r.runtimeRemoveEventListener("message",r.messageHandlersHash[e]),r.runtimeRemoveEventListener("message",r.disconnectHandlersHash[e]),delete r.messageHandlersHash[e],delete r.disconnectHandlersHash[e]};o=function(e){return function(){u(),e()}}(o);r.messageHandlersHash[e]=r.handleMessage.bind(r,e,t,s),r.disconnectHandlersHash[e]=r.handleDisconnect.bind(r,e,t,o),r.runtimeAddEventListener("message",r.messageHandlersHash[e]),r.runtimeAddEventListener("message",r.disconnectHandlersHash[e]);var l=this.runtimePostMessage;return new(function(){function s(){(0,_classCallCheck3.default)(this,s)}return(0,_createClass3.default)(s,[{key:"postMessage",value:function(n){l({type:a,port:e,id:t,message:n})}},{key:"disconnect",value:function(){u(),l({type:c,port:e,id:t}),o()}},{key:"isServer",get:function(){return n}},{key:"isClient",get:function(){return!n}}]),s}())}},{key:"listen",value:function(e,t){for(var n=arguments.length,s=Array(n>2?n-2:0),o=2;o<n;o++)s[o-2]=arguments[o];var r=this,i=this.constructor.connectType;this.runtimeAddEventListener("message",function(n){if(r.runtimeEventValidator(n)){var o=n.data;if(o.type===i&&o.name===e){n.stopPropagation();var a=new(Function.prototype.bind.apply(t,[null].concat(s))),c=(0,_oneTime2.default)(function(){a.onDisconnect()});a.onConnect(r.makePort(o.port,r.makeId(),!0,function(e){a.onMessage(e)},c))}}})}},{key:"connect",value:function(e,t){var n=this.constructor.connectType,s=this.makeId();this.runtimePostMessage({type:n,name:e,port:s});for(var o=arguments.length,r=Array(o>2?o-2:0),i=2;i<o;i++)r[i-2]=arguments[i];var a=new(Function.prototype.bind.apply(t,[null].concat(r))),c=(0,_oneTime2.default)(function(){a.onDisconnect()});a.onConnect(this.makePort(s,this.makeId(),!1,function(e){a.onMessage(e)},c))}},{key:"disconnect",value:function(){}}]),e}(),_class3.messageType="45b409ba-788d-4f5c-87ff-14c3c2836ee6",_class3.connectType="3fad0d6b-ae8c-43f0-99d8-3c1b6d6c013e",_class3.disconnectType="b9c899b2-ed95-4b36-af46-c907fbc54026",_class2=_temp,_applyDecoratedDescriptor(_class2.prototype,"windowPostMessage",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class2.prototype,"windowPostMessage"),_class2.prototype),_applyDecoratedDescriptor(_class2.prototype,"workerPostMessage",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class2.prototype,"workerPostMessage"),_class2.prototype),_applyDecoratedDescriptor(_class2.prototype,"genericPostMessage",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class2.prototype,"genericPostMessage"),_class2.prototype),_applyDecoratedDescriptor(_class2.prototype,"windowEventValidator",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class2.prototype,"windowEventValidator"),_class2.prototype),_applyDecoratedDescriptor(_class2.prototype,"workerEventValidator",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class2.prototype,"workerEventValidator"),_class2.prototype),_applyDecoratedDescriptor(_class2.prototype,"genericEventValidator",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class2.prototype,"genericEventValidator"),_class2.prototype),_applyDecoratedDescriptor(_class2.prototype,"runtimeAddEventListener",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class2.prototype,"runtimeAddEventListener"),_class2.prototype),_applyDecoratedDescriptor(_class2.prototype,"runtimeRemoveEventListener",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class2.prototype,"runtimeRemoveEventListener"),_class2.prototype),_applyDecoratedDescriptor(_class2.prototype,"handleMessage",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class2.prototype,"handleMessage"),_class2.prototype),_applyDecoratedDescriptor(_class2.prototype,"handleDisconnect",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class2.prototype,"handleDisconnect"),_class2.prototype),_applyDecoratedDescriptor(_class2.prototype,"makePort",[_autoBind2.default],(0,_getOwnPropertyDescriptor2.default)(_class2.prototype,"makePort"),_class2.prototype),_class2),RuntimeProxy=function(){function e(t,n){(0,_classCallCheck3.default)(this,e),this.firstRuntime=t,this.secondRuntime=n}return(0,_createClass3.default)(e,[{key:"listen",value:function(e){var t=this.firstRuntime,n=this.secondRuntime;t.listen(e,function(){function t(){(0,_classCallCheck3.default)(this,t)}return(0,_createClass3.default)(t,[{key:"onConnect",value:function(t){var s=this;s.firstRuntimePort=t,n.connect(e,function(){function e(){(0,_classCallCheck3.default)(this,e)}return(0,_createClass3.default)(e,[{key:"onConnect",value:function(e){s.secondRuntimePort=e}},{key:"onDisconnect",value:function(){s.firstRuntimePort.disconnect()}},{key:"onMessage",value:function(e){s.firstRuntimePort.postMessage(e)}}]),e}())}},{key:"onDisconnect",value:function(){this.secondRuntimePort.disconnect()}},{key:"onMessage",value:function(e){this.secondRuntimePort.postMessage(e)}}]),t}())}},{key:"disconnect",value:function(){this.firstRuntime.disconnect(),this.secondRuntime.disconnect()}}]),e}();exports.RuntimeProxy=RuntimeProxy,exports.GenericRuntime=GenericRuntime,exports.BrowserRuntime=BrowserRuntime,exports.RuntimeHandler=RuntimeHandler;


},{"babel-runtime/core-js/object/get-own-property-descriptor":15,"babel-runtime/helpers/classCallCheck":19,"babel-runtime/helpers/createClass":20,"react-suite-decorators/lib/auto-bind":119,"react-suite-decorators/lib/one-time":120}],7:[function(require,module,exports){
module.exports={default:require("core-js/library/fn/array/concat"),__esModule:!0};


},{"core-js/library/fn/array/concat":26}],8:[function(require,module,exports){
module.exports={default:require("core-js/library/fn/array/from"),__esModule:!0};


},{"core-js/library/fn/array/from":27}],9:[function(require,module,exports){
module.exports={default:require("core-js/library/fn/get-iterator"),__esModule:!0};


},{"core-js/library/fn/get-iterator":28}],10:[function(require,module,exports){
module.exports={default:require("core-js/library/fn/is-iterable"),__esModule:!0};


},{"core-js/library/fn/is-iterable":29}],11:[function(require,module,exports){
module.exports={default:require("core-js/library/fn/json/stringify"),__esModule:!0};


},{"core-js/library/fn/json/stringify":30}],12:[function(require,module,exports){
module.exports={default:require("core-js/library/fn/object/assign"),__esModule:!0};


},{"core-js/library/fn/object/assign":31}],13:[function(require,module,exports){
module.exports={default:require("core-js/library/fn/object/define-property"),__esModule:!0};


},{"core-js/library/fn/object/define-property":32}],14:[function(require,module,exports){
module.exports={default:require("core-js/library/fn/object/entries"),__esModule:!0};


},{"core-js/library/fn/object/entries":33}],15:[function(require,module,exports){
module.exports={default:require("core-js/library/fn/object/get-own-property-descriptor"),__esModule:!0};


},{"core-js/library/fn/object/get-own-property-descriptor":34}],16:[function(require,module,exports){
module.exports={default:require("core-js/library/fn/object/keys"),__esModule:!0};


},{"core-js/library/fn/object/keys":35}],17:[function(require,module,exports){
module.exports={default:require("core-js/library/fn/symbol"),__esModule:!0};


},{"core-js/library/fn/symbol":36}],18:[function(require,module,exports){
module.exports={default:require("core-js/library/fn/symbol/iterator"),__esModule:!0};


},{"core-js/library/fn/symbol/iterator":37}],19:[function(require,module,exports){
"use strict";exports.__esModule=!0,exports.default=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")};


},{}],20:[function(require,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}exports.__esModule=!0;var _defineProperty=require("../core-js/object/define-property"),_defineProperty2=_interopRequireDefault(_defineProperty);exports.default=function(){function e(e,r){for(var t=0;t<r.length;t++){var n=r[t];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),(0,_defineProperty2.default)(e,n.key,n)}}return function(r,t,n){return t&&e(r.prototype,t),n&&e(r,n),r}}();


},{"../core-js/object/define-property":13}],21:[function(require,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}exports.__esModule=!0;var _assign=require("../core-js/object/assign"),_assign2=_interopRequireDefault(_assign);exports.default=_assign2.default||function(e){for(var r=1;r<arguments.length;r++){var t=arguments[r];for(var s in t)Object.prototype.hasOwnProperty.call(t,s)&&(e[s]=t[s])}return e};


},{"../core-js/object/assign":12}],22:[function(require,module,exports){
"use strict";exports.__esModule=!0,exports.default=function(e,r){var t={};for(var o in e)r.indexOf(o)>=0||Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o]);return t};


},{}],23:[function(require,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}exports.__esModule=!0;var _isIterable2=require("../core-js/is-iterable"),_isIterable3=_interopRequireDefault(_isIterable2),_getIterator2=require("../core-js/get-iterator"),_getIterator3=_interopRequireDefault(_getIterator2);exports.default=function(){return function(e,r){if(Array.isArray(e))return e;if((0,_isIterable3.default)(Object(e)))return function(e,r){var t=[],a=!0,i=!1,u=void 0;try{for(var n,o=(0,_getIterator3.default)(e);!(a=(n=o.next()).done)&&(t.push(n.value),!r||t.length!==r);a=!0);}catch(e){i=!0,u=e}finally{try{!a&&o.return&&o.return()}finally{if(i)throw u}}return t}(e,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();


},{"../core-js/get-iterator":9,"../core-js/is-iterable":10}],24:[function(require,module,exports){
"use strict";function _interopRequireDefault(r){return r&&r.__esModule?r:{default:r}}exports.__esModule=!0;var _from=require("../core-js/array/from"),_from2=_interopRequireDefault(_from);exports.default=function(r){if(Array.isArray(r)){for(var e=0,t=Array(r.length);e<r.length;e++)t[e]=r[e];return t}return(0,_from2.default)(r)};


},{"../core-js/array/from":8}],25:[function(require,module,exports){
"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}exports.__esModule=!0;var _iterator=require("../core-js/symbol/iterator"),_iterator2=_interopRequireDefault(_iterator),_symbol=require("../core-js/symbol"),_symbol2=_interopRequireDefault(_symbol),_typeof="function"==typeof _symbol2.default&&"symbol"==typeof _iterator2.default?function(t){return typeof t}:function(t){return t&&"function"==typeof _symbol2.default&&t.constructor===_symbol2.default&&t!==_symbol2.default.prototype?"symbol":typeof t};exports.default="function"==typeof _symbol2.default&&"symbol"===_typeof(_iterator2.default)?function(t){return void 0===t?"undefined":_typeof(t)}:function(t){return t&&"function"==typeof _symbol2.default&&t.constructor===_symbol2.default&&t!==_symbol2.default.prototype?"symbol":void 0===t?"undefined":_typeof(t)};


},{"../core-js/symbol":17,"../core-js/symbol/iterator":18}],26:[function(require,module,exports){
module.exports=function(){return Function.call.apply(Array.prototype.concat,arguments)};


},{}],27:[function(require,module,exports){
require("../../modules/es6.string.iterator"),require("../../modules/es6.array.from"),module.exports=require("../../modules/_core").Array.from;


},{"../../modules/_core":44,"../../modules/es6.array.from":104,"../../modules/es6.string.iterator":111}],28:[function(require,module,exports){
require("../modules/web.dom.iterable"),require("../modules/es6.string.iterator"),module.exports=require("../modules/core.get-iterator");


},{"../modules/core.get-iterator":102,"../modules/es6.string.iterator":111,"../modules/web.dom.iterable":116}],29:[function(require,module,exports){
require("../modules/web.dom.iterable"),require("../modules/es6.string.iterator"),module.exports=require("../modules/core.is-iterable");


},{"../modules/core.is-iterable":103,"../modules/es6.string.iterator":111,"../modules/web.dom.iterable":116}],30:[function(require,module,exports){
var core=require("../../modules/_core"),$JSON=core.JSON||(core.JSON={stringify:JSON.stringify});module.exports=function(r){return $JSON.stringify.apply($JSON,arguments)};


},{"../../modules/_core":44}],31:[function(require,module,exports){
require("../../modules/es6.object.assign"),module.exports=require("../../modules/_core").Object.assign;


},{"../../modules/_core":44,"../../modules/es6.object.assign":106}],32:[function(require,module,exports){
require("../../modules/es6.object.define-property");var $Object=require("../../modules/_core").Object;module.exports=function(e,r,o){return $Object.defineProperty(e,r,o)};


},{"../../modules/_core":44,"../../modules/es6.object.define-property":107}],33:[function(require,module,exports){
require("../../modules/es7.object.entries"),module.exports=require("../../modules/_core").Object.entries;


},{"../../modules/_core":44,"../../modules/es7.object.entries":113}],34:[function(require,module,exports){
require("../../modules/es6.object.get-own-property-descriptor");var $Object=require("../../modules/_core").Object;module.exports=function(e,r){return $Object.getOwnPropertyDescriptor(e,r)};


},{"../../modules/_core":44,"../../modules/es6.object.get-own-property-descriptor":108}],35:[function(require,module,exports){
require("../../modules/es6.object.keys"),module.exports=require("../../modules/_core").Object.keys;


},{"../../modules/_core":44,"../../modules/es6.object.keys":109}],36:[function(require,module,exports){
require("../../modules/es6.symbol"),require("../../modules/es6.object.to-string"),require("../../modules/es7.symbol.async-iterator"),require("../../modules/es7.symbol.observable"),module.exports=require("../../modules/_core").Symbol;


},{"../../modules/_core":44,"../../modules/es6.object.to-string":110,"../../modules/es6.symbol":112,"../../modules/es7.symbol.async-iterator":114,"../../modules/es7.symbol.observable":115}],37:[function(require,module,exports){
require("../../modules/es6.string.iterator"),require("../../modules/web.dom.iterable"),module.exports=require("../../modules/_wks-ext").f("iterator");


},{"../../modules/_wks-ext":99,"../../modules/es6.string.iterator":111,"../../modules/web.dom.iterable":116}],38:[function(require,module,exports){
module.exports=function(o){if("function"!=typeof o)throw TypeError(o+" is not a function!");return o};


},{}],39:[function(require,module,exports){
module.exports=function(){};


},{}],40:[function(require,module,exports){
var isObject=require("./_is-object");module.exports=function(e){if(!isObject(e))throw TypeError(e+" is not an object!");return e};


},{"./_is-object":62}],41:[function(require,module,exports){
var toIObject=require("./_to-iobject"),toLength=require("./_to-length"),toAbsoluteIndex=require("./_to-absolute-index");module.exports=function(e){return function(t,o,r){var n,u=toIObject(t),i=toLength(u.length),f=toAbsoluteIndex(r,i);if(e&&o!=o){for(;i>f;)if((n=u[f++])!=n)return!0}else for(;i>f;f++)if((e||f in u)&&u[f]===o)return e||f||0;return!e&&-1}};


},{"./_to-absolute-index":91,"./_to-iobject":93,"./_to-length":94}],42:[function(require,module,exports){
var cof=require("./_cof"),TAG=require("./_wks")("toStringTag"),ARG="Arguments"==cof(function(){return arguments}()),tryGet=function(t,e){try{return t[e]}catch(t){}};module.exports=function(t){var e,r,n;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(r=tryGet(e=Object(t),TAG))?r:ARG?cof(e):"Object"==(n=cof(e))&&"function"==typeof e.callee?"Arguments":n};


},{"./_cof":43,"./_wks":100}],43:[function(require,module,exports){
var toString={}.toString;module.exports=function(t){return toString.call(t).slice(8,-1)};


},{}],44:[function(require,module,exports){
var core=module.exports={version:"2.5.1"};"number"==typeof __e&&(__e=core);


},{}],45:[function(require,module,exports){
"use strict";var $defineProperty=require("./_object-dp"),createDesc=require("./_property-desc");module.exports=function(e,r,t){r in e?$defineProperty.f(e,r,createDesc(0,t)):e[r]=t};


},{"./_object-dp":73,"./_property-desc":85}],46:[function(require,module,exports){
var aFunction=require("./_a-function");module.exports=function(n,r,t){if(aFunction(n),void 0===r)return n;switch(t){case 1:return function(t){return n.call(r,t)};case 2:return function(t,u){return n.call(r,t,u)};case 3:return function(t,u,e){return n.call(r,t,u,e)}}return function(){return n.apply(r,arguments)}};


},{"./_a-function":38}],47:[function(require,module,exports){
module.exports=function(o){if(void 0==o)throw TypeError("Can't call method on  "+o);return o};


},{}],48:[function(require,module,exports){
module.exports=!require("./_fails")(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a});


},{"./_fails":53}],49:[function(require,module,exports){
var isObject=require("./_is-object"),document=require("./_global").document,is=isObject(document)&&isObject(document.createElement);module.exports=function(e){return is?document.createElement(e):{}};


},{"./_global":54,"./_is-object":62}],50:[function(require,module,exports){
module.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");


},{}],51:[function(require,module,exports){
var getKeys=require("./_object-keys"),gOPS=require("./_object-gops"),pIE=require("./_object-pie");module.exports=function(e){var r=getKeys(e),t=gOPS.f;if(t)for(var o,u=t(e),g=pIE.f,i=0;u.length>i;)g.call(e,o=u[i++])&&r.push(o);return r};


},{"./_object-gops":78,"./_object-keys":81,"./_object-pie":82}],52:[function(require,module,exports){
var global=require("./_global"),core=require("./_core"),ctx=require("./_ctx"),hide=require("./_hide"),PROTOTYPE="prototype",$export=function(e,r,t){var o,n,p,i=e&$export.F,x=e&$export.G,c=e&$export.S,l=e&$export.P,u=e&$export.B,a=e&$export.W,$=x?core:core[r]||(core[r]={}),P=$[PROTOTYPE],f=x?global:c?global[r]:(global[r]||{})[PROTOTYPE];x&&(t=r);for(o in t)(n=!i&&f&&void 0!==f[o])&&o in $||(p=n?f[o]:t[o],$[o]=x&&"function"!=typeof f[o]?t[o]:u&&n?ctx(p,global):a&&f[o]==p?function(e){var r=function(r,t,o){if(this instanceof e){switch(arguments.length){case 0:return new e;case 1:return new e(r);case 2:return new e(r,t)}return new e(r,t,o)}return e.apply(this,arguments)};return r[PROTOTYPE]=e[PROTOTYPE],r}(p):l&&"function"==typeof p?ctx(Function.call,p):p,l&&(($.virtual||($.virtual={}))[o]=p,e&$export.R&&P&&!P[o]&&hide(P,o,p)))};$export.F=1,$export.G=2,$export.S=4,$export.P=8,$export.B=16,$export.W=32,$export.U=64,$export.R=128,module.exports=$export;


},{"./_core":44,"./_ctx":46,"./_global":54,"./_hide":56}],53:[function(require,module,exports){
module.exports=function(r){try{return!!r()}catch(r){return!0}};


},{}],54:[function(require,module,exports){
var global=module.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=global);


},{}],55:[function(require,module,exports){
var hasOwnProperty={}.hasOwnProperty;module.exports=function(r,e){return hasOwnProperty.call(r,e)};


},{}],56:[function(require,module,exports){
var dP=require("./_object-dp"),createDesc=require("./_property-desc");module.exports=require("./_descriptors")?function(e,r,t){return dP.f(e,r,createDesc(1,t))}:function(e,r,t){return e[r]=t,e};


},{"./_descriptors":48,"./_object-dp":73,"./_property-desc":85}],57:[function(require,module,exports){
var document=require("./_global").document;module.exports=document&&document.documentElement;


},{"./_global":54}],58:[function(require,module,exports){
module.exports=!require("./_descriptors")&&!require("./_fails")(function(){return 7!=Object.defineProperty(require("./_dom-create")("div"),"a",{get:function(){return 7}}).a});


},{"./_descriptors":48,"./_dom-create":49,"./_fails":53}],59:[function(require,module,exports){
var cof=require("./_cof");module.exports=Object("z").propertyIsEnumerable(0)?Object:function(e){return"String"==cof(e)?e.split(""):Object(e)};


},{"./_cof":43}],60:[function(require,module,exports){
var Iterators=require("./_iterators"),ITERATOR=require("./_wks")("iterator"),ArrayProto=Array.prototype;module.exports=function(r){return void 0!==r&&(Iterators.Array===r||ArrayProto[ITERATOR]===r)};


},{"./_iterators":68,"./_wks":100}],61:[function(require,module,exports){
var cof=require("./_cof");module.exports=Array.isArray||function(r){return"Array"==cof(r)};


},{"./_cof":43}],62:[function(require,module,exports){
module.exports=function(o){return"object"==typeof o?null!==o:"function"==typeof o};


},{}],63:[function(require,module,exports){
var anObject=require("./_an-object");module.exports=function(r,t,e,a){try{return a?t(anObject(e)[0],e[1]):t(e)}catch(t){var c=r.return;throw void 0!==c&&anObject(c.call(r)),t}};


},{"./_an-object":40}],64:[function(require,module,exports){
"use strict";var create=require("./_object-create"),descriptor=require("./_property-desc"),setToStringTag=require("./_set-to-string-tag"),IteratorPrototype={};require("./_hide")(IteratorPrototype,require("./_wks")("iterator"),function(){return this}),module.exports=function(r,t,e){r.prototype=create(IteratorPrototype,{next:descriptor(1,e)}),setToStringTag(r,t+" Iterator")};


},{"./_hide":56,"./_object-create":72,"./_property-desc":85,"./_set-to-string-tag":87,"./_wks":100}],65:[function(require,module,exports){
"use strict";var LIBRARY=require("./_library"),$export=require("./_export"),redefine=require("./_redefine"),hide=require("./_hide"),has=require("./_has"),Iterators=require("./_iterators"),$iterCreate=require("./_iter-create"),setToStringTag=require("./_set-to-string-tag"),getPrototypeOf=require("./_object-gpo"),ITERATOR=require("./_wks")("iterator"),BUGGY=!([].keys&&"next"in[].keys()),FF_ITERATOR="@@iterator",KEYS="keys",VALUES="values",returnThis=function(){return this};module.exports=function(e,r,t,i,n,o,s){$iterCreate(t,r,i);var u,a,T,R=function(e){if(!BUGGY&&e in f)return f[e];switch(e){case KEYS:case VALUES:return function(){return new t(this,e)}}return function(){return new t(this,e)}},A=r+" Iterator",E=n==VALUES,c=!1,f=e.prototype,h=f[ITERATOR]||f[FF_ITERATOR]||n&&f[n],I=h||R(n),p=n?E?R("entries"):I:void 0,_="Array"==r?f.entries||h:h;if(_&&(T=getPrototypeOf(_.call(new e)))!==Object.prototype&&T.next&&(setToStringTag(T,A,!0),LIBRARY||has(T,ITERATOR)||hide(T,ITERATOR,returnThis)),E&&h&&h.name!==VALUES&&(c=!0,I=function(){return h.call(this)}),LIBRARY&&!s||!BUGGY&&!c&&f[ITERATOR]||hide(f,ITERATOR,I),Iterators[r]=I,Iterators[A]=returnThis,n)if(u={values:E?I:R(VALUES),keys:o?I:R(KEYS),entries:p},s)for(a in u)a in f||redefine(f,a,u[a]);else $export($export.P+$export.F*(BUGGY||c),r,u);return u};


},{"./_export":52,"./_has":55,"./_hide":56,"./_iter-create":64,"./_iterators":68,"./_library":69,"./_object-gpo":79,"./_redefine":86,"./_set-to-string-tag":87,"./_wks":100}],66:[function(require,module,exports){
var ITERATOR=require("./_wks")("iterator"),SAFE_CLOSING=!1;try{var riter=[7][ITERATOR]();riter.return=function(){SAFE_CLOSING=!0},Array.from(riter,function(){throw 2})}catch(r){}module.exports=function(r,t){if(!t&&!SAFE_CLOSING)return!1;var n=!1;try{var e=[7],u=e[ITERATOR]();u.next=function(){return{done:n=!0}},e[ITERATOR]=function(){return u},r(e)}catch(r){}return n};


},{"./_wks":100}],67:[function(require,module,exports){
module.exports=function(e,n){return{value:n,done:!!e}};


},{}],68:[function(require,module,exports){
module.exports={};


},{}],69:[function(require,module,exports){
module.exports=!0;


},{}],70:[function(require,module,exports){
var META=require("./_uid")("meta"),isObject=require("./_is-object"),has=require("./_has"),setDesc=require("./_object-dp").f,id=0,isExtensible=Object.isExtensible||function(){return!0},FREEZE=!require("./_fails")(function(){return isExtensible(Object.preventExtensions({}))}),setMeta=function(e){setDesc(e,META,{value:{i:"O"+ ++id,w:{}}})},fastKey=function(e,t){if(!isObject(e))return"symbol"==typeof e?e:("string"==typeof e?"S":"P")+e;if(!has(e,META)){if(!isExtensible(e))return"F";if(!t)return"E";setMeta(e)}return e[META].i},getWeak=function(e,t){if(!has(e,META)){if(!isExtensible(e))return!0;if(!t)return!1;setMeta(e)}return e[META].w},onFreeze=function(e){return FREEZE&&meta.NEED&&isExtensible(e)&&!has(e,META)&&setMeta(e),e},meta=module.exports={KEY:META,NEED:!1,fastKey:fastKey,getWeak:getWeak,onFreeze:onFreeze};


},{"./_fails":53,"./_has":55,"./_is-object":62,"./_object-dp":73,"./_uid":97}],71:[function(require,module,exports){
"use strict";var getKeys=require("./_object-keys"),gOPS=require("./_object-gops"),pIE=require("./_object-pie"),toObject=require("./_to-object"),IObject=require("./_iobject"),$assign=Object.assign;module.exports=!$assign||require("./_fails")(function(){var e={},t={},r=Symbol(),s="abcdefghijklmnopqrst";return e[r]=7,s.split("").forEach(function(e){t[e]=e}),7!=$assign({},e)[r]||Object.keys($assign({},t)).join("")!=s})?function(e,t){for(var r=toObject(e),s=arguments.length,i=1,o=gOPS.f,c=pIE.f;s>i;)for(var n,a=IObject(arguments[i++]),g=o?getKeys(a).concat(o(a)):getKeys(a),b=g.length,j=0;b>j;)c.call(a,n=g[j++])&&(r[n]=a[n]);return r}:$assign;


},{"./_fails":53,"./_iobject":59,"./_object-gops":78,"./_object-keys":81,"./_object-pie":82,"./_to-object":95}],72:[function(require,module,exports){
var anObject=require("./_an-object"),dPs=require("./_object-dps"),enumBugKeys=require("./_enum-bug-keys"),IE_PROTO=require("./_shared-key")("IE_PROTO"),Empty=function(){},PROTOTYPE="prototype",createDict=function(){var e,t=require("./_dom-create")("iframe"),r=enumBugKeys.length;for(t.style.display="none",require("./_html").appendChild(t),t.src="javascript:",(e=t.contentWindow.document).open(),e.write("<script>document.F=Object<\/script>"),e.close(),createDict=e.F;r--;)delete createDict[PROTOTYPE][enumBugKeys[r]];return createDict()};module.exports=Object.create||function(e,t){var r;return null!==e?(Empty[PROTOTYPE]=anObject(e),r=new Empty,Empty[PROTOTYPE]=null,r[IE_PROTO]=e):r=createDict(),void 0===t?r:dPs(r,t)};


},{"./_an-object":40,"./_dom-create":49,"./_enum-bug-keys":50,"./_html":57,"./_object-dps":74,"./_shared-key":88}],73:[function(require,module,exports){
var anObject=require("./_an-object"),IE8_DOM_DEFINE=require("./_ie8-dom-define"),toPrimitive=require("./_to-primitive"),dP=Object.defineProperty;exports.f=require("./_descriptors")?Object.defineProperty:function(e,r,t){if(anObject(e),r=toPrimitive(r,!0),anObject(t),IE8_DOM_DEFINE)try{return dP(e,r,t)}catch(e){}if("get"in t||"set"in t)throw TypeError("Accessors not supported!");return"value"in t&&(e[r]=t.value),e};


},{"./_an-object":40,"./_descriptors":48,"./_ie8-dom-define":58,"./_to-primitive":96}],74:[function(require,module,exports){
var dP=require("./_object-dp"),anObject=require("./_an-object"),getKeys=require("./_object-keys");module.exports=require("./_descriptors")?Object.defineProperties:function(e,r){anObject(e);for(var t,o=getKeys(r),c=o.length,i=0;c>i;)dP.f(e,t=o[i++],r[t]);return e};


},{"./_an-object":40,"./_descriptors":48,"./_object-dp":73,"./_object-keys":81}],75:[function(require,module,exports){
var pIE=require("./_object-pie"),createDesc=require("./_property-desc"),toIObject=require("./_to-iobject"),toPrimitive=require("./_to-primitive"),has=require("./_has"),IE8_DOM_DEFINE=require("./_ie8-dom-define"),gOPD=Object.getOwnPropertyDescriptor;exports.f=require("./_descriptors")?gOPD:function(e,r){if(e=toIObject(e),r=toPrimitive(r,!0),IE8_DOM_DEFINE)try{return gOPD(e,r)}catch(e){}if(has(e,r))return createDesc(!pIE.f.call(e,r),e[r])};


},{"./_descriptors":48,"./_has":55,"./_ie8-dom-define":58,"./_object-pie":82,"./_property-desc":85,"./_to-iobject":93,"./_to-primitive":96}],76:[function(require,module,exports){
var toIObject=require("./_to-iobject"),gOPN=require("./_object-gopn").f,toString={}.toString,windowNames="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],getWindowNames=function(e){try{return gOPN(e)}catch(e){return windowNames.slice()}};module.exports.f=function(e){return windowNames&&"[object Window]"==toString.call(e)?getWindowNames(e):gOPN(toIObject(e))};


},{"./_object-gopn":77,"./_to-iobject":93}],77:[function(require,module,exports){
var $keys=require("./_object-keys-internal"),hiddenKeys=require("./_enum-bug-keys").concat("length","prototype");exports.f=Object.getOwnPropertyNames||function(e){return $keys(e,hiddenKeys)};


},{"./_enum-bug-keys":50,"./_object-keys-internal":80}],78:[function(require,module,exports){
exports.f=Object.getOwnPropertySymbols;


},{}],79:[function(require,module,exports){
var has=require("./_has"),toObject=require("./_to-object"),IE_PROTO=require("./_shared-key")("IE_PROTO"),ObjectProto=Object.prototype;module.exports=Object.getPrototypeOf||function(t){return t=toObject(t),has(t,IE_PROTO)?t[IE_PROTO]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?ObjectProto:null};


},{"./_has":55,"./_shared-key":88,"./_to-object":95}],80:[function(require,module,exports){
var has=require("./_has"),toIObject=require("./_to-iobject"),arrayIndexOf=require("./_array-includes")(!1),IE_PROTO=require("./_shared-key")("IE_PROTO");module.exports=function(r,e){var a,t=toIObject(r),u=0,O=[];for(a in t)a!=IE_PROTO&&has(t,a)&&O.push(a);for(;e.length>u;)has(t,a=e[u++])&&(~arrayIndexOf(O,a)||O.push(a));return O};


},{"./_array-includes":41,"./_has":55,"./_shared-key":88,"./_to-iobject":93}],81:[function(require,module,exports){
var $keys=require("./_object-keys-internal"),enumBugKeys=require("./_enum-bug-keys");module.exports=Object.keys||function(e){return $keys(e,enumBugKeys)};


},{"./_enum-bug-keys":50,"./_object-keys-internal":80}],82:[function(require,module,exports){
exports.f={}.propertyIsEnumerable;


},{}],83:[function(require,module,exports){
var $export=require("./_export"),core=require("./_core"),fails=require("./_fails");module.exports=function(e,r){var o=(core.Object||{})[e]||Object[e],t={};t[e]=r(o),$export($export.S+$export.F*fails(function(){o(1)}),"Object",t)};


},{"./_core":44,"./_export":52,"./_fails":53}],84:[function(require,module,exports){
var getKeys=require("./_object-keys"),toIObject=require("./_to-iobject"),isEnum=require("./_object-pie").f;module.exports=function(e){return function(t){for(var r,o=toIObject(t),u=getKeys(o),i=u.length,n=0,c=[];i>n;)isEnum.call(o,r=u[n++])&&c.push(e?[r,o[r]]:o[r]);return c}};


},{"./_object-keys":81,"./_object-pie":82,"./_to-iobject":93}],85:[function(require,module,exports){
module.exports=function(e,r){return{enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:r}};


},{}],86:[function(require,module,exports){
module.exports=require("./_hide");


},{"./_hide":56}],87:[function(require,module,exports){
var def=require("./_object-dp").f,has=require("./_has"),TAG=require("./_wks")("toStringTag");module.exports=function(e,r,o){e&&!has(e=o?e:e.prototype,TAG)&&def(e,TAG,{configurable:!0,value:r})};


},{"./_has":55,"./_object-dp":73,"./_wks":100}],88:[function(require,module,exports){
var shared=require("./_shared")("keys"),uid=require("./_uid");module.exports=function(e){return shared[e]||(shared[e]=uid(e))};


},{"./_shared":89,"./_uid":97}],89:[function(require,module,exports){
var global=require("./_global"),SHARED="__core-js_shared__",store=global[SHARED]||(global[SHARED]={});module.exports=function(o){return store[o]||(store[o]={})};


},{"./_global":54}],90:[function(require,module,exports){
var toInteger=require("./_to-integer"),defined=require("./_defined");module.exports=function(e){return function(r,t){var n,i,d=String(defined(r)),o=toInteger(t),u=d.length;return o<0||o>=u?e?"":void 0:(n=d.charCodeAt(o))<55296||n>56319||o+1===u||(i=d.charCodeAt(o+1))<56320||i>57343?e?d.charAt(o):n:e?d.slice(o,o+2):i-56320+(n-55296<<10)+65536}};


},{"./_defined":47,"./_to-integer":92}],91:[function(require,module,exports){
var toInteger=require("./_to-integer"),max=Math.max,min=Math.min;module.exports=function(e,t){return(e=toInteger(e))<0?max(e+t,0):min(e,t)};


},{"./_to-integer":92}],92:[function(require,module,exports){
var ceil=Math.ceil,floor=Math.floor;module.exports=function(o){return isNaN(o=+o)?0:(o>0?floor:ceil)(o)};


},{}],93:[function(require,module,exports){
var IObject=require("./_iobject"),defined=require("./_defined");module.exports=function(e){return IObject(defined(e))};


},{"./_defined":47,"./_iobject":59}],94:[function(require,module,exports){
var toInteger=require("./_to-integer"),min=Math.min;module.exports=function(e){return e>0?min(toInteger(e),9007199254740991):0};


},{"./_to-integer":92}],95:[function(require,module,exports){
var defined=require("./_defined");module.exports=function(e){return Object(defined(e))};


},{"./_defined":47}],96:[function(require,module,exports){
var isObject=require("./_is-object");module.exports=function(t,e){if(!isObject(t))return t;var r,i;if(e&&"function"==typeof(r=t.toString)&&!isObject(i=r.call(t)))return i;if("function"==typeof(r=t.valueOf)&&!isObject(i=r.call(t)))return i;if(!e&&"function"==typeof(r=t.toString)&&!isObject(i=r.call(t)))return i;throw TypeError("Can't convert object to primitive value")};


},{"./_is-object":62}],97:[function(require,module,exports){
var id=0,px=Math.random();module.exports=function(o){return"Symbol(".concat(void 0===o?"":o,")_",(++id+px).toString(36))};


},{}],98:[function(require,module,exports){
var global=require("./_global"),core=require("./_core"),LIBRARY=require("./_library"),wksExt=require("./_wks-ext"),defineProperty=require("./_object-dp").f;module.exports=function(e){var r=core.Symbol||(core.Symbol=LIBRARY?{}:global.Symbol||{});"_"==e.charAt(0)||e in r||defineProperty(r,e,{value:wksExt.f(e)})};


},{"./_core":44,"./_global":54,"./_library":69,"./_object-dp":73,"./_wks-ext":99}],99:[function(require,module,exports){
exports.f=require("./_wks");


},{"./_wks":100}],100:[function(require,module,exports){
var store=require("./_shared")("wks"),uid=require("./_uid"),Symbol=require("./_global").Symbol,USE_SYMBOL="function"==typeof Symbol,$exports=module.exports=function(o){return store[o]||(store[o]=USE_SYMBOL&&Symbol[o]||(USE_SYMBOL?Symbol:uid)("Symbol."+o))};$exports.store=store;


},{"./_global":54,"./_shared":89,"./_uid":97}],101:[function(require,module,exports){
var classof=require("./_classof"),ITERATOR=require("./_wks")("iterator"),Iterators=require("./_iterators");module.exports=require("./_core").getIteratorMethod=function(r){if(void 0!=r)return r[ITERATOR]||r["@@iterator"]||Iterators[classof(r)]};


},{"./_classof":42,"./_core":44,"./_iterators":68,"./_wks":100}],102:[function(require,module,exports){
var anObject=require("./_an-object"),get=require("./core.get-iterator-method");module.exports=require("./_core").getIterator=function(e){var r=get(e);if("function"!=typeof r)throw TypeError(e+" is not iterable!");return anObject(r.call(e))};


},{"./_an-object":40,"./_core":44,"./core.get-iterator-method":101}],103:[function(require,module,exports){
var classof=require("./_classof"),ITERATOR=require("./_wks")("iterator"),Iterators=require("./_iterators");module.exports=require("./_core").isIterable=function(r){var e=Object(r);return void 0!==e[ITERATOR]||"@@iterator"in e||Iterators.hasOwnProperty(classof(e))};


},{"./_classof":42,"./_core":44,"./_iterators":68,"./_wks":100}],104:[function(require,module,exports){
"use strict";var ctx=require("./_ctx"),$export=require("./_export"),toObject=require("./_to-object"),call=require("./_iter-call"),isArrayIter=require("./_is-array-iter"),toLength=require("./_to-length"),createProperty=require("./_create-property"),getIterFn=require("./core.get-iterator-method");$export($export.S+$export.F*!require("./_iter-detect")(function(e){Array.from(e)}),"Array",{from:function(e){var r,t,o,i,a=toObject(e),c="function"==typeof this?this:Array,n=arguments.length,u=n>1?arguments[1]:void 0,l=void 0!==u,y=0,p=getIterFn(a);if(l&&(u=ctx(u,n>2?arguments[2]:void 0,2)),void 0==p||c==Array&&isArrayIter(p))for(t=new c(r=toLength(a.length));r>y;y++)createProperty(t,y,l?u(a[y],y):a[y]);else for(i=p.call(a),t=new c;!(o=i.next()).done;y++)createProperty(t,y,l?call(i,u,[o.value,y],!0):o.value);return t.length=y,t}});


},{"./_create-property":45,"./_ctx":46,"./_export":52,"./_is-array-iter":60,"./_iter-call":63,"./_iter-detect":66,"./_to-length":94,"./_to-object":95,"./core.get-iterator-method":101}],105:[function(require,module,exports){
"use strict";var addToUnscopables=require("./_add-to-unscopables"),step=require("./_iter-step"),Iterators=require("./_iterators"),toIObject=require("./_to-iobject");module.exports=require("./_iter-define")(Array,"Array",function(e,t){this._t=toIObject(e),this._i=0,this._k=t},function(){var e=this._t,t=this._k,s=this._i++;return!e||s>=e.length?(this._t=void 0,step(1)):"keys"==t?step(0,s):"values"==t?step(0,e[s]):step(0,[s,e[s]])},"values"),Iterators.Arguments=Iterators.Array,addToUnscopables("keys"),addToUnscopables("values"),addToUnscopables("entries");


},{"./_add-to-unscopables":39,"./_iter-define":65,"./_iter-step":67,"./_iterators":68,"./_to-iobject":93}],106:[function(require,module,exports){
var $export=require("./_export");$export($export.S+$export.F,"Object",{assign:require("./_object-assign")});


},{"./_export":52,"./_object-assign":71}],107:[function(require,module,exports){
var $export=require("./_export");$export($export.S+$export.F*!require("./_descriptors"),"Object",{defineProperty:require("./_object-dp").f});


},{"./_descriptors":48,"./_export":52,"./_object-dp":73}],108:[function(require,module,exports){
var toIObject=require("./_to-iobject"),$getOwnPropertyDescriptor=require("./_object-gopd").f;require("./_object-sap")("getOwnPropertyDescriptor",function(){return function(r,e){return $getOwnPropertyDescriptor(toIObject(r),e)}});


},{"./_object-gopd":75,"./_object-sap":83,"./_to-iobject":93}],109:[function(require,module,exports){
var toObject=require("./_to-object"),$keys=require("./_object-keys");require("./_object-sap")("keys",function(){return function(e){return $keys(toObject(e))}});


},{"./_object-keys":81,"./_object-sap":83,"./_to-object":95}],110:[function(require,module,exports){


},{}],111:[function(require,module,exports){
"use strict";var $at=require("./_string-at")(!0);require("./_iter-define")(String,"String",function(t){this._t=String(t),this._i=0},function(){var t,i=this._t,e=this._i;return e>=i.length?{value:void 0,done:!0}:(t=$at(i,e),this._i+=t.length,{value:t,done:!1})});


},{"./_iter-define":65,"./_string-at":90}],112:[function(require,module,exports){
"use strict";var global=require("./_global"),has=require("./_has"),DESCRIPTORS=require("./_descriptors"),$export=require("./_export"),redefine=require("./_redefine"),META=require("./_meta").KEY,$fails=require("./_fails"),shared=require("./_shared"),setToStringTag=require("./_set-to-string-tag"),uid=require("./_uid"),wks=require("./_wks"),wksExt=require("./_wks-ext"),wksDefine=require("./_wks-define"),enumKeys=require("./_enum-keys"),isArray=require("./_is-array"),anObject=require("./_an-object"),toIObject=require("./_to-iobject"),toPrimitive=require("./_to-primitive"),createDesc=require("./_property-desc"),_create=require("./_object-create"),gOPNExt=require("./_object-gopn-ext"),$GOPD=require("./_object-gopd"),$DP=require("./_object-dp"),$keys=require("./_object-keys"),gOPD=$GOPD.f,dP=$DP.f,gOPN=gOPNExt.f,$Symbol=global.Symbol,$JSON=global.JSON,_stringify=$JSON&&$JSON.stringify,PROTOTYPE="prototype",HIDDEN=wks("_hidden"),TO_PRIMITIVE=wks("toPrimitive"),isEnum={}.propertyIsEnumerable,SymbolRegistry=shared("symbol-registry"),AllSymbols=shared("symbols"),OPSymbols=shared("op-symbols"),ObjectProto=Object[PROTOTYPE],USE_NATIVE="function"==typeof $Symbol,QObject=global.QObject,setter=!QObject||!QObject[PROTOTYPE]||!QObject[PROTOTYPE].findChild,setSymbolDesc=DESCRIPTORS&&$fails(function(){return 7!=_create(dP({},"a",{get:function(){return dP(this,"a",{value:7}).a}})).a})?function(e,r,t){var o=gOPD(ObjectProto,r);o&&delete ObjectProto[r],dP(e,r,t),o&&e!==ObjectProto&&dP(ObjectProto,r,o)}:dP,wrap=function(e){var r=AllSymbols[e]=_create($Symbol[PROTOTYPE]);return r._k=e,r},isSymbol=USE_NATIVE&&"symbol"==typeof $Symbol.iterator?function(e){return"symbol"==typeof e}:function(e){return e instanceof $Symbol},$defineProperty=function(e,r,t){return e===ObjectProto&&$defineProperty(OPSymbols,r,t),anObject(e),r=toPrimitive(r,!0),anObject(t),has(AllSymbols,r)?(t.enumerable?(has(e,HIDDEN)&&e[HIDDEN][r]&&(e[HIDDEN][r]=!1),t=_create(t,{enumerable:createDesc(0,!1)})):(has(e,HIDDEN)||dP(e,HIDDEN,createDesc(1,{})),e[HIDDEN][r]=!0),setSymbolDesc(e,r,t)):dP(e,r,t)},$defineProperties=function(e,r){anObject(e);for(var t,o=enumKeys(r=toIObject(r)),i=0,s=o.length;s>i;)$defineProperty(e,t=o[i++],r[t]);return e},$create=function(e,r){return void 0===r?_create(e):$defineProperties(_create(e),r)},$propertyIsEnumerable=function(e){var r=isEnum.call(this,e=toPrimitive(e,!0));return!(this===ObjectProto&&has(AllSymbols,e)&&!has(OPSymbols,e))&&(!(r||!has(this,e)||!has(AllSymbols,e)||has(this,HIDDEN)&&this[HIDDEN][e])||r)},$getOwnPropertyDescriptor=function(e,r){if(e=toIObject(e),r=toPrimitive(r,!0),e!==ObjectProto||!has(AllSymbols,r)||has(OPSymbols,r)){var t=gOPD(e,r);return!t||!has(AllSymbols,r)||has(e,HIDDEN)&&e[HIDDEN][r]||(t.enumerable=!0),t}},$getOwnPropertyNames=function(e){for(var r,t=gOPN(toIObject(e)),o=[],i=0;t.length>i;)has(AllSymbols,r=t[i++])||r==HIDDEN||r==META||o.push(r);return o},$getOwnPropertySymbols=function(e){for(var r,t=e===ObjectProto,o=gOPN(t?OPSymbols:toIObject(e)),i=[],s=0;o.length>s;)!has(AllSymbols,r=o[s++])||t&&!has(ObjectProto,r)||i.push(AllSymbols[r]);return i};USE_NATIVE||(redefine(($Symbol=function(){if(this instanceof $Symbol)throw TypeError("Symbol is not a constructor!");var e=uid(arguments.length>0?arguments[0]:void 0),r=function(t){this===ObjectProto&&r.call(OPSymbols,t),has(this,HIDDEN)&&has(this[HIDDEN],e)&&(this[HIDDEN][e]=!1),setSymbolDesc(this,e,createDesc(1,t))};return DESCRIPTORS&&setter&&setSymbolDesc(ObjectProto,e,{configurable:!0,set:r}),wrap(e)})[PROTOTYPE],"toString",function(){return this._k}),$GOPD.f=$getOwnPropertyDescriptor,$DP.f=$defineProperty,require("./_object-gopn").f=gOPNExt.f=$getOwnPropertyNames,require("./_object-pie").f=$propertyIsEnumerable,require("./_object-gops").f=$getOwnPropertySymbols,DESCRIPTORS&&!require("./_library")&&redefine(ObjectProto,"propertyIsEnumerable",$propertyIsEnumerable,!0),wksExt.f=function(e){return wrap(wks(e))}),$export($export.G+$export.W+$export.F*!USE_NATIVE,{Symbol:$Symbol});for(var es6Symbols="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),j=0;es6Symbols.length>j;)wks(es6Symbols[j++]);for(var wellKnownSymbols=$keys(wks.store),k=0;wellKnownSymbols.length>k;)wksDefine(wellKnownSymbols[k++]);$export($export.S+$export.F*!USE_NATIVE,"Symbol",{for:function(e){return has(SymbolRegistry,e+="")?SymbolRegistry[e]:SymbolRegistry[e]=$Symbol(e)},keyFor:function(e){if(!isSymbol(e))throw TypeError(e+" is not a symbol!");for(var r in SymbolRegistry)if(SymbolRegistry[r]===e)return r},useSetter:function(){setter=!0},useSimple:function(){setter=!1}}),$export($export.S+$export.F*!USE_NATIVE,"Object",{create:$create,defineProperty:$defineProperty,defineProperties:$defineProperties,getOwnPropertyDescriptor:$getOwnPropertyDescriptor,getOwnPropertyNames:$getOwnPropertyNames,getOwnPropertySymbols:$getOwnPropertySymbols}),$JSON&&$export($export.S+$export.F*(!USE_NATIVE||$fails(function(){var e=$Symbol();return"[null]"!=_stringify([e])||"{}"!=_stringify({a:e})||"{}"!=_stringify(Object(e))})),"JSON",{stringify:function(e){if(void 0!==e&&!isSymbol(e)){for(var r,t,o=[e],i=1;arguments.length>i;)o.push(arguments[i++]);return"function"==typeof(r=o[1])&&(t=r),!t&&isArray(r)||(r=function(e,r){if(t&&(r=t.call(this,e,r)),!isSymbol(r))return r}),o[1]=r,_stringify.apply($JSON,o)}}}),$Symbol[PROTOTYPE][TO_PRIMITIVE]||require("./_hide")($Symbol[PROTOTYPE],TO_PRIMITIVE,$Symbol[PROTOTYPE].valueOf),setToStringTag($Symbol,"Symbol"),setToStringTag(Math,"Math",!0),setToStringTag(global.JSON,"JSON",!0);


},{"./_an-object":40,"./_descriptors":48,"./_enum-keys":51,"./_export":52,"./_fails":53,"./_global":54,"./_has":55,"./_hide":56,"./_is-array":61,"./_library":69,"./_meta":70,"./_object-create":72,"./_object-dp":73,"./_object-gopd":75,"./_object-gopn":77,"./_object-gopn-ext":76,"./_object-gops":78,"./_object-keys":81,"./_object-pie":82,"./_property-desc":85,"./_redefine":86,"./_set-to-string-tag":87,"./_shared":89,"./_to-iobject":93,"./_to-primitive":96,"./_uid":97,"./_wks":100,"./_wks-define":98,"./_wks-ext":99}],113:[function(require,module,exports){
var $export=require("./_export"),$entries=require("./_object-to-array")(!0);$export($export.S,"Object",{entries:function(e){return $entries(e)}});


},{"./_export":52,"./_object-to-array":84}],114:[function(require,module,exports){
require("./_wks-define")("asyncIterator");


},{"./_wks-define":98}],115:[function(require,module,exports){
require("./_wks-define")("observable");


},{"./_wks-define":98}],116:[function(require,module,exports){
require("./es6.array.iterator");for(var global=require("./_global"),hide=require("./_hide"),Iterators=require("./_iterators"),TO_STRING_TAG=require("./_wks")("toStringTag"),DOMIterables="CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","),i=0;i<DOMIterables.length;i++){var NAME=DOMIterables[i],Collection=global[NAME],proto=Collection&&Collection.prototype;proto&&!proto[TO_STRING_TAG]&&hide(proto,TO_STRING_TAG,NAME),Iterators[NAME]=Iterators.Array}


},{"./_global":54,"./_hide":56,"./_iterators":68,"./_wks":100,"./es6.array.iterator":105}],117:[function(require,module,exports){
"use strict";module.exports=((e,t)=>{for(const r of Object.getOwnPropertyNames(t).concat(Object.getOwnPropertySymbols(t)))Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))});


},{}],118:[function(require,module,exports){
"use strict";const mimicFn=require("mimic-fn");module.exports=((n,e)=>{if(!0===e)throw new TypeError("The second argument is now an options object");if("function"!=typeof n)throw new TypeError("Expected a function");e=e||{};let o,r=!1;const t=n.displayName||n.name||"<anonymous>",i=function(){if(r){if(!0===e.throw)throw new Error(`Function \`${t}\` can only be called once`);return o}return r=!0,o=n.apply(this,arguments),n=null,o};return mimicFn(i,n),i});


},{"mimic-fn":117}],119:[function(require,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(exports,"__esModule",{value:!0}),exports.autoBind=void 0;var _defineProperty=require("babel-runtime/core-js/object/define-property"),_defineProperty2=_interopRequireDefault(_defineProperty),_typeof2=require("babel-runtime/helpers/typeof"),_typeof3=_interopRequireDefault(_typeof2),autoBind=function(e,t,r){var o=r.value;if("function"!=typeof o)throw new Error("@autoBind decorator can only be applied to methods not: "+(void 0===o?"undefined":(0,_typeof3.default)(o)));return{configurable:!0,get:function(){var e=o.bind(this);return(0,_defineProperty2.default)(this,t,{value:e,configurable:!0,writable:!0}),e}}};exports.default=autoBind,exports.autoBind=autoBind;


},{"babel-runtime/core-js/object/define-property":13,"babel-runtime/helpers/typeof":25}],120:[function(require,module,exports){
"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(exports,"__esModule",{value:!0}),exports.oneTime=void 0;var _onetime=require("onetime"),_onetime2=_interopRequireDefault(_onetime);exports.default=_onetime2.default,exports.oneTime=_onetime2.default;


},{"onetime":118}]},{},[5]);
