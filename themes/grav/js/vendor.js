var Grav =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	var parentJsonpFunction = window["webpackJsonpGrav"];
/******/ 	window["webpackJsonpGrav"] = function webpackJsonpCallback(chunkIds, moreModules) {
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, callbacks = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId])
/******/ 				callbacks.push.apply(callbacks, installedChunks[chunkId]);
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			modules[moduleId] = moreModules[moduleId];
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(chunkIds, moreModules);
/******/ 		while(callbacks.length)
/******/ 			callbacks.shift().call(null, __webpack_require__);
/******/ 		if(moreModules[0]) {
/******/ 			installedModules[0] = 0;
/******/ 			return __webpack_require__(0);
/******/ 		}
/******/ 	};
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// "0" means "already loaded"
/******/ 	// Array means "loading", array contains callbacks
/******/ 	var installedChunks = {
/******/ 		1:0
/******/ 	};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId, callback) {
/******/ 		// "0" is the signal for "already loaded"
/******/ 		if(installedChunks[chunkId] === 0)
/******/ 			return callback.call(null, __webpack_require__);
/******/
/******/ 		// an array means "currently loading".
/******/ 		if(installedChunks[chunkId] !== undefined) {
/******/ 			installedChunks[chunkId].push(callback);
/******/ 		} else {
/******/ 			// start chunk loading
/******/ 			installedChunks[chunkId] = [callback];
/******/ 			var head = document.getElementsByTagName('head')[0];
/******/ 			var script = document.createElement('script');
/******/ 			script.type = 'text/javascript';
/******/ 			script.charset = 'utf-8';
/******/ 			script.async = true;
/******/
/******/ 			script.src = __webpack_require__.p + "" + chunkId + ".admin.js";
/******/ 			head.appendChild(script);
/******/ 		}
/******/ 	};
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(208);
	__webpack_require__(217);
	__webpack_require__(239);
	__webpack_require__(195);
	__webpack_require__(240);
	__webpack_require__(212);
	__webpack_require__(252);
	module.exports = __webpack_require__(225);


/***/ },

/***/ 195:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	 * Toastr
	 * Copyright 2012-2015
	 * Authors: John Papa, Hans Fjällemark, and Tim Ferrell.
	 * All Rights Reserved.
	 * Use, reproduction, distribution, and modification of this code is subject to the terms and
	 * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
	 *
	 * ARIA Support: Greta Krafsig
	 *
	 * Project: https://github.com/CodeSeven/toastr
	 */
	/* global define */
	; (function (define) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(196)], __WEBPACK_AMD_DEFINE_RESULT__ = function ($) {
	        return (function () {
	            var $container;
	            var listener;
	            var toastId = 0;
	            var toastType = {
	                error: 'error',
	                info: 'info',
	                success: 'success',
	                warning: 'warning'
	            };
	
	            var toastr = {
	                clear: clear,
	                remove: remove,
	                error: error,
	                getContainer: getContainer,
	                info: info,
	                options: {},
	                subscribe: subscribe,
	                success: success,
	                version: '2.1.2',
	                warning: warning
	            };
	
	            var previousToast;
	
	            return toastr;
	
	            ////////////////
	
	            function error(message, title, optionsOverride) {
	                return notify({
	                    type: toastType.error,
	                    iconClass: getOptions().iconClasses.error,
	                    message: message,
	                    optionsOverride: optionsOverride,
	                    title: title
	                });
	            }
	
	            function getContainer(options, create) {
	                if (!options) { options = getOptions(); }
	                $container = $('#' + options.containerId);
	                if ($container.length) {
	                    return $container;
	                }
	                if (create) {
	                    $container = createContainer(options);
	                }
	                return $container;
	            }
	
	            function info(message, title, optionsOverride) {
	                return notify({
	                    type: toastType.info,
	                    iconClass: getOptions().iconClasses.info,
	                    message: message,
	                    optionsOverride: optionsOverride,
	                    title: title
	                });
	            }
	
	            function subscribe(callback) {
	                listener = callback;
	            }
	
	            function success(message, title, optionsOverride) {
	                return notify({
	                    type: toastType.success,
	                    iconClass: getOptions().iconClasses.success,
	                    message: message,
	                    optionsOverride: optionsOverride,
	                    title: title
	                });
	            }
	
	            function warning(message, title, optionsOverride) {
	                return notify({
	                    type: toastType.warning,
	                    iconClass: getOptions().iconClasses.warning,
	                    message: message,
	                    optionsOverride: optionsOverride,
	                    title: title
	                });
	            }
	
	            function clear($toastElement, clearOptions) {
	                var options = getOptions();
	                if (!$container) { getContainer(options); }
	                if (!clearToast($toastElement, options, clearOptions)) {
	                    clearContainer(options);
	                }
	            }
	
	            function remove($toastElement) {
	                var options = getOptions();
	                if (!$container) { getContainer(options); }
	                if ($toastElement && $(':focus', $toastElement).length === 0) {
	                    removeToast($toastElement);
	                    return;
	                }
	                if ($container.children().length) {
	                    $container.remove();
	                }
	            }
	
	            // internal functions
	
	            function clearContainer (options) {
	                var toastsToClear = $container.children();
	                for (var i = toastsToClear.length - 1; i >= 0; i--) {
	                    clearToast($(toastsToClear[i]), options);
	                }
	            }
	
	            function clearToast ($toastElement, options, clearOptions) {
	                var force = clearOptions && clearOptions.force ? clearOptions.force : false;
	                if ($toastElement && (force || $(':focus', $toastElement).length === 0)) {
	                    $toastElement[options.hideMethod]({
	                        duration: options.hideDuration,
	                        easing: options.hideEasing,
	                        complete: function () { removeToast($toastElement); }
	                    });
	                    return true;
	                }
	                return false;
	            }
	
	            function createContainer(options) {
	                $container = $('<div/>')
	                    .attr('id', options.containerId)
	                    .addClass(options.positionClass)
	                    .attr('aria-live', 'polite')
	                    .attr('role', 'alert');
	
	                $container.appendTo($(options.target));
	                return $container;
	            }
	
	            function getDefaults() {
	                return {
	                    tapToDismiss: true,
	                    toastClass: 'toast',
	                    containerId: 'toast-container',
	                    debug: false,
	
	                    showMethod: 'fadeIn', //fadeIn, slideDown, and show are built into jQuery
	                    showDuration: 300,
	                    showEasing: 'swing', //swing and linear are built into jQuery
	                    onShown: undefined,
	                    hideMethod: 'fadeOut',
	                    hideDuration: 1000,
	                    hideEasing: 'swing',
	                    onHidden: undefined,
	                    closeMethod: false,
	                    closeDuration: false,
	                    closeEasing: false,
	
	                    extendedTimeOut: 1000,
	                    iconClasses: {
	                        error: 'toast-error',
	                        info: 'toast-info',
	                        success: 'toast-success',
	                        warning: 'toast-warning'
	                    },
	                    iconClass: 'toast-info',
	                    positionClass: 'toast-top-right',
	                    timeOut: 5000, // Set timeOut and extendedTimeOut to 0 to make it sticky
	                    titleClass: 'toast-title',
	                    messageClass: 'toast-message',
	                    escapeHtml: false,
	                    target: 'body',
	                    closeHtml: '<button type="button">&times;</button>',
	                    newestOnTop: true,
	                    preventDuplicates: false,
	                    progressBar: false
	                };
	            }
	
	            function publish(args) {
	                if (!listener) { return; }
	                listener(args);
	            }
	
	            function notify(map) {
	                var options = getOptions();
	                var iconClass = map.iconClass || options.iconClass;
	
	                if (typeof (map.optionsOverride) !== 'undefined') {
	                    options = $.extend(options, map.optionsOverride);
	                    iconClass = map.optionsOverride.iconClass || iconClass;
	                }
	
	                if (shouldExit(options, map)) { return; }
	
	                toastId++;
	
	                $container = getContainer(options, true);
	
	                var intervalId = null;
	                var $toastElement = $('<div/>');
	                var $titleElement = $('<div/>');
	                var $messageElement = $('<div/>');
	                var $progressElement = $('<div/>');
	                var $closeElement = $(options.closeHtml);
	                var progressBar = {
	                    intervalId: null,
	                    hideEta: null,
	                    maxHideTime: null
	                };
	                var response = {
	                    toastId: toastId,
	                    state: 'visible',
	                    startTime: new Date(),
	                    options: options,
	                    map: map
	                };
	
	                personalizeToast();
	
	                displayToast();
	
	                handleEvents();
	
	                publish(response);
	
	                if (options.debug && console) {
	                    console.log(response);
	                }
	
	                return $toastElement;
	
	                function escapeHtml(source) {
	                    if (source == null)
	                        source = "";
	
	                    return new String(source)
	                        .replace(/&/g, '&amp;')
	                        .replace(/"/g, '&quot;')
	                        .replace(/'/g, '&#39;')
	                        .replace(/</g, '&lt;')
	                        .replace(/>/g, '&gt;');
	                }
	
	                function personalizeToast() {
	                    setIcon();
	                    setTitle();
	                    setMessage();
	                    setCloseButton();
	                    setProgressBar();
	                    setSequence();
	                }
	
	                function handleEvents() {
	                    $toastElement.hover(stickAround, delayedHideToast);
	                    if (!options.onclick && options.tapToDismiss) {
	                        $toastElement.click(hideToast);
	                    }
	
	                    if (options.closeButton && $closeElement) {
	                        $closeElement.click(function (event) {
	                            if (event.stopPropagation) {
	                                event.stopPropagation();
	                            } else if (event.cancelBubble !== undefined && event.cancelBubble !== true) {
	                                event.cancelBubble = true;
	                            }
	                            hideToast(true);
	                        });
	                    }
	
	                    if (options.onclick) {
	                        $toastElement.click(function (event) {
	                            options.onclick(event);
	                            hideToast();
	                        });
	                    }
	                }
	
	                function displayToast() {
	                    $toastElement.hide();
	
	                    $toastElement[options.showMethod](
	                        {duration: options.showDuration, easing: options.showEasing, complete: options.onShown}
	                    );
	
	                    if (options.timeOut > 0) {
	                        intervalId = setTimeout(hideToast, options.timeOut);
	                        progressBar.maxHideTime = parseFloat(options.timeOut);
	                        progressBar.hideEta = new Date().getTime() + progressBar.maxHideTime;
	                        if (options.progressBar) {
	                            progressBar.intervalId = setInterval(updateProgress, 10);
	                        }
	                    }
	                }
	
	                function setIcon() {
	                    if (map.iconClass) {
	                        $toastElement.addClass(options.toastClass).addClass(iconClass);
	                    }
	                }
	
	                function setSequence() {
	                    if (options.newestOnTop) {
	                        $container.prepend($toastElement);
	                    } else {
	                        $container.append($toastElement);
	                    }
	                }
	
	                function setTitle() {
	                    if (map.title) {
	                        $titleElement.append(!options.escapeHtml ? map.title : escapeHtml(map.title)).addClass(options.titleClass);
	                        $toastElement.append($titleElement);
	                    }
	                }
	
	                function setMessage() {
	                    if (map.message) {
	                        $messageElement.append(!options.escapeHtml ? map.message : escapeHtml(map.message)).addClass(options.messageClass);
	                        $toastElement.append($messageElement);
	                    }
	                }
	
	                function setCloseButton() {
	                    if (options.closeButton) {
	                        $closeElement.addClass('toast-close-button').attr('role', 'button');
	                        $toastElement.prepend($closeElement);
	                    }
	                }
	
	                function setProgressBar() {
	                    if (options.progressBar) {
	                        $progressElement.addClass('toast-progress');
	                        $toastElement.prepend($progressElement);
	                    }
	                }
	
	                function shouldExit(options, map) {
	                    if (options.preventDuplicates) {
	                        if (map.message === previousToast) {
	                            return true;
	                        } else {
	                            previousToast = map.message;
	                        }
	                    }
	                    return false;
	                }
	
	                function hideToast(override) {
	                    var method = override && options.closeMethod !== false ? options.closeMethod : options.hideMethod;
	                    var duration = override && options.closeDuration !== false ?
	                        options.closeDuration : options.hideDuration;
	                    var easing = override && options.closeEasing !== false ? options.closeEasing : options.hideEasing;
	                    if ($(':focus', $toastElement).length && !override) {
	                        return;
	                    }
	                    clearTimeout(progressBar.intervalId);
	                    return $toastElement[method]({
	                        duration: duration,
	                        easing: easing,
	                        complete: function () {
	                            removeToast($toastElement);
	                            if (options.onHidden && response.state !== 'hidden') {
	                                options.onHidden();
	                            }
	                            response.state = 'hidden';
	                            response.endTime = new Date();
	                            publish(response);
	                        }
	                    });
	                }
	
	                function delayedHideToast() {
	                    if (options.timeOut > 0 || options.extendedTimeOut > 0) {
	                        intervalId = setTimeout(hideToast, options.extendedTimeOut);
	                        progressBar.maxHideTime = parseFloat(options.extendedTimeOut);
	                        progressBar.hideEta = new Date().getTime() + progressBar.maxHideTime;
	                    }
	                }
	
	                function stickAround() {
	                    clearTimeout(intervalId);
	                    progressBar.hideEta = 0;
	                    $toastElement.stop(true, true)[options.showMethod](
	                        {duration: options.showDuration, easing: options.showEasing}
	                    );
	                }
	
	                function updateProgress() {
	                    var percentage = ((progressBar.hideEta - (new Date().getTime())) / progressBar.maxHideTime) * 100;
	                    $progressElement.width(percentage + '%');
	                }
	            }
	
	            function getOptions() {
	                return $.extend({}, getDefaults(), toastr.options);
	            }
	
	            function removeToast($toastElement) {
	                if (!$container) { $container = getContainer(); }
	                if ($toastElement.is(':visible')) {
	                    return;
	                }
	                $toastElement.remove();
	                $toastElement = null;
	                if ($container.children().length === 0) {
	                    $container.remove();
	                    previousToast = undefined;
	                }
	            }
	
	        })();
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}(__webpack_require__(197)));


/***/ },

/***/ 196:
/***/ function(module, exports) {

	module.exports = jQuery;

/***/ },

/***/ 197:
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },

/***/ 208:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
	  if (true) {
	    // AMD. Register as an anonymous module unless amdModuleId is set
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return (root['Chartist'] = factory());
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports === 'object') {
	    // Node. Does not work with strict CommonJS, but
	    // only CommonJS-like environments that support module.exports,
	    // like Node.
	    module.exports = factory();
	  } else {
	    root['Chartist'] = factory();
	  }
	}(this, function () {
	
	/* Chartist.js 0.9.5
	 * Copyright © 2015 Gion Kunz
	 * Free to use under the WTFPL license.
	 * http://www.wtfpl.net/
	 */
	/**
	 * The core module of Chartist that is mainly providing static functions and higher level functions for chart modules.
	 *
	 * @module Chartist.Core
	 */
	var Chartist = {
	  version: '0.9.5'
	};
	
	(function (window, document, Chartist) {
	  'use strict';
	
	  /**
	   * Helps to simplify functional style code
	   *
	   * @memberof Chartist.Core
	   * @param {*} n This exact value will be returned by the noop function
	   * @return {*} The same value that was provided to the n parameter
	   */
	  Chartist.noop = function (n) {
	    return n;
	  };
	
	  /**
	   * Generates a-z from a number 0 to 26
	   *
	   * @memberof Chartist.Core
	   * @param {Number} n A number from 0 to 26 that will result in a letter a-z
	   * @return {String} A character from a-z based on the input number n
	   */
	  Chartist.alphaNumerate = function (n) {
	    // Limit to a-z
	    return String.fromCharCode(97 + n % 26);
	  };
	
	  /**
	   * Simple recursive object extend
	   *
	   * @memberof Chartist.Core
	   * @param {Object} target Target object where the source will be merged into
	   * @param {Object...} sources This object (objects) will be merged into target and then target is returned
	   * @return {Object} An object that has the same reference as target but is extended and merged with the properties of source
	   */
	  Chartist.extend = function (target) {
	    target = target || {};
	
	    var sources = Array.prototype.slice.call(arguments, 1);
	    sources.forEach(function(source) {
	      for (var prop in source) {
	        if (typeof source[prop] === 'object' && source[prop] !== null && !(source[prop] instanceof Array)) {
	          target[prop] = Chartist.extend({}, target[prop], source[prop]);
	        } else {
	          target[prop] = source[prop];
	        }
	      }
	    });
	
	    return target;
	  };
	
	  /**
	   * Replaces all occurrences of subStr in str with newSubStr and returns a new string.
	   *
	   * @memberof Chartist.Core
	   * @param {String} str
	   * @param {String} subStr
	   * @param {String} newSubStr
	   * @return {String}
	   */
	  Chartist.replaceAll = function(str, subStr, newSubStr) {
	    return str.replace(new RegExp(subStr, 'g'), newSubStr);
	  };
	
	  /**
	   * Converts a number to a string with a unit. If a string is passed then this will be returned unmodified.
	   *
	   * @memberof Chartist.Core
	   * @param {Number} value
	   * @param {String} unit
	   * @return {String} Returns the passed number value with unit.
	   */
	  Chartist.ensureUnit = function(value, unit) {
	    if(typeof value === 'number') {
	      value = value + unit;
	    }
	
	    return value;
	  };
	
	  /**
	   * Converts a number or string to a quantity object.
	   *
	   * @memberof Chartist.Core
	   * @param {String|Number} input
	   * @return {Object} Returns an object containing the value as number and the unit as string.
	   */
	  Chartist.quantity = function(input) {
	    if (typeof input === 'string') {
	      var match = (/^(\d+)\s*(.*)$/g).exec(input);
	      return {
	        value : +match[1],
	        unit: match[2] || undefined
	      };
	    }
	    return { value: input };
	  };
	
	  /**
	   * This is a wrapper around document.querySelector that will return the query if it's already of type Node
	   *
	   * @memberof Chartist.Core
	   * @param {String|Node} query The query to use for selecting a Node or a DOM node that will be returned directly
	   * @return {Node}
	   */
	  Chartist.querySelector = function(query) {
	    return query instanceof Node ? query : document.querySelector(query);
	  };
	
	  /**
	   * Functional style helper to produce array with given length initialized with undefined values
	   *
	   * @memberof Chartist.Core
	   * @param length
	   * @return {Array}
	   */
	  Chartist.times = function(length) {
	    return Array.apply(null, new Array(length));
	  };
	
	  /**
	   * Sum helper to be used in reduce functions
	   *
	   * @memberof Chartist.Core
	   * @param previous
	   * @param current
	   * @return {*}
	   */
	  Chartist.sum = function(previous, current) {
	    return previous + (current ? current : 0);
	  };
	
	  /**
	   * Multiply helper to be used in `Array.map` for multiplying each value of an array with a factor.
	   *
	   * @memberof Chartist.Core
	   * @param {Number} factor
	   * @returns {Function} Function that can be used in `Array.map` to multiply each value in an array
	   */
	  Chartist.mapMultiply = function(factor) {
	    return function(num) {
	      return num * factor;
	    };
	  };
	
	  /**
	   * Add helper to be used in `Array.map` for adding a addend to each value of an array.
	   *
	   * @memberof Chartist.Core
	   * @param {Number} addend
	   * @returns {Function} Function that can be used in `Array.map` to add a addend to each value in an array
	   */
	  Chartist.mapAdd = function(addend) {
	    return function(num) {
	      return num + addend;
	    };
	  };
	
	  /**
	   * Map for multi dimensional arrays where their nested arrays will be mapped in serial. The output array will have the length of the largest nested array. The callback function is called with variable arguments where each argument is the nested array value (or undefined if there are no more values).
	   *
	   * @memberof Chartist.Core
	   * @param arr
	   * @param cb
	   * @return {Array}
	   */
	  Chartist.serialMap = function(arr, cb) {
	    var result = [],
	        length = Math.max.apply(null, arr.map(function(e) {
	          return e.length;
	        }));
	
	    Chartist.times(length).forEach(function(e, index) {
	      var args = arr.map(function(e) {
	        return e[index];
	      });
	
	      result[index] = cb.apply(null, args);
	    });
	
	    return result;
	  };
	
	  /**
	   * This helper function can be used to round values with certain precision level after decimal. This is used to prevent rounding errors near float point precision limit.
	   *
	   * @memberof Chartist.Core
	   * @param {Number} value The value that should be rounded with precision
	   * @param {Number} [digits] The number of digits after decimal used to do the rounding
	   * @returns {number} Rounded value
	   */
	  Chartist.roundWithPrecision = function(value, digits) {
	    var precision = Math.pow(10, digits || Chartist.precision);
	    return Math.round(value * precision) / precision;
	  };
	
	  /**
	   * Precision level used internally in Chartist for rounding. If you require more decimal places you can increase this number.
	   *
	   * @memberof Chartist.Core
	   * @type {number}
	   */
	  Chartist.precision = 8;
	
	  /**
	   * A map with characters to escape for strings to be safely used as attribute values.
	   *
	   * @memberof Chartist.Core
	   * @type {Object}
	   */
	  Chartist.escapingMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    '\'': '&#039;'
	  };
	
	  /**
	   * This function serializes arbitrary data to a string. In case of data that can't be easily converted to a string, this function will create a wrapper object and serialize the data using JSON.stringify. The outcoming string will always be escaped using Chartist.escapingMap.
	   * If called with null or undefined the function will return immediately with null or undefined.
	   *
	   * @memberof Chartist.Core
	   * @param {Number|String|Object} data
	   * @return {String}
	   */
	  Chartist.serialize = function(data) {
	    if(data === null || data === undefined) {
	      return data;
	    } else if(typeof data === 'number') {
	      data = ''+data;
	    } else if(typeof data === 'object') {
	      data = JSON.stringify({data: data});
	    }
	
	    return Object.keys(Chartist.escapingMap).reduce(function(result, key) {
	      return Chartist.replaceAll(result, key, Chartist.escapingMap[key]);
	    }, data);
	  };
	
	  /**
	   * This function de-serializes a string previously serialized with Chartist.serialize. The string will always be unescaped using Chartist.escapingMap before it's returned. Based on the input value the return type can be Number, String or Object. JSON.parse is used with try / catch to see if the unescaped string can be parsed into an Object and this Object will be returned on success.
	   *
	   * @memberof Chartist.Core
	   * @param {String} data
	   * @return {String|Number|Object}
	   */
	  Chartist.deserialize = function(data) {
	    if(typeof data !== 'string') {
	      return data;
	    }
	
	    data = Object.keys(Chartist.escapingMap).reduce(function(result, key) {
	      return Chartist.replaceAll(result, Chartist.escapingMap[key], key);
	    }, data);
	
	    try {
	      data = JSON.parse(data);
	      data = data.data !== undefined ? data.data : data;
	    } catch(e) {}
	
	    return data;
	  };
	
	  /**
	   * Create or reinitialize the SVG element for the chart
	   *
	   * @memberof Chartist.Core
	   * @param {Node} container The containing DOM Node object that will be used to plant the SVG element
	   * @param {String} width Set the width of the SVG element. Default is 100%
	   * @param {String} height Set the height of the SVG element. Default is 100%
	   * @param {String} className Specify a class to be added to the SVG element
	   * @return {Object} The created/reinitialized SVG element
	   */
	  Chartist.createSvg = function (container, width, height, className) {
	    var svg;
	
	    width = width || '100%';
	    height = height || '100%';
	
	    // Check if there is a previous SVG element in the container that contains the Chartist XML namespace and remove it
	    // Since the DOM API does not support namespaces we need to manually search the returned list http://www.w3.org/TR/selectors-api/
	    Array.prototype.slice.call(container.querySelectorAll('svg')).filter(function filterChartistSvgObjects(svg) {
	      return svg.getAttributeNS('http://www.w3.org/2000/xmlns/', Chartist.xmlNs.prefix);
	    }).forEach(function removePreviousElement(svg) {
	      container.removeChild(svg);
	    });
	
	    // Create svg object with width and height or use 100% as default
	    svg = new Chartist.Svg('svg').attr({
	      width: width,
	      height: height
	    }).addClass(className).attr({
	      style: 'width: ' + width + '; height: ' + height + ';'
	    });
	
	    // Add the DOM node to our container
	    container.appendChild(svg._node);
	
	    return svg;
	  };
	
	
	  /**
	   * Reverses the series, labels and series data arrays.
	   *
	   * @memberof Chartist.Core
	   * @param data
	   */
	  Chartist.reverseData = function(data) {
	    data.labels.reverse();
	    data.series.reverse();
	    for (var i = 0; i < data.series.length; i++) {
	      if(typeof(data.series[i]) === 'object' && data.series[i].data !== undefined) {
	        data.series[i].data.reverse();
	      } else if(data.series[i] instanceof Array) {
	        data.series[i].reverse();
	      }
	    }
	  };
	
	  /**
	   * Convert data series into plain array
	   *
	   * @memberof Chartist.Core
	   * @param {Object} data The series object that contains the data to be visualized in the chart
	   * @param {Boolean} reverse If true the whole data is reversed by the getDataArray call. This will modify the data object passed as first parameter. The labels as well as the series order is reversed. The whole series data arrays are reversed too.
	   * @param {Boolean} multi Create a multi dimensional array from a series data array where a value object with `x` and `y` values will be created.
	   * @return {Array} A plain array that contains the data to be visualized in the chart
	   */
	  Chartist.getDataArray = function (data, reverse, multi) {
	    // If the data should be reversed but isn't we need to reverse it
	    // If it's reversed but it shouldn't we need to reverse it back
	    // That's required to handle data updates correctly and to reflect the responsive configurations
	    if(reverse && !data.reversed || !reverse && data.reversed) {
	      Chartist.reverseData(data);
	      data.reversed = !data.reversed;
	    }
	
	    // Recursively walks through nested arrays and convert string values to numbers and objects with value properties
	    // to values. Check the tests in data core -> data normalization for a detailed specification of expected values
	    function recursiveConvert(value) {
	      if(Chartist.isFalseyButZero(value)) {
	        // This is a hole in data and we should return undefined
	        return undefined;
	      } else if((value.data || value) instanceof Array) {
	        return (value.data || value).map(recursiveConvert);
	      } else if(value.hasOwnProperty('value')) {
	        return recursiveConvert(value.value);
	      } else {
	        if(multi) {
	          var multiValue = {};
	
	          // Single series value arrays are assumed to specify the Y-Axis value
	          // For example: [1, 2] => [{x: undefined, y: 1}, {x: undefined, y: 2}]
	          // If multi is a string then it's assumed that it specified which dimension should be filled as default
	          if(typeof multi === 'string') {
	            multiValue[multi] = Chartist.getNumberOrUndefined(value);
	          } else {
	            multiValue.y = Chartist.getNumberOrUndefined(value);
	          }
	
	          multiValue.x = value.hasOwnProperty('x') ? Chartist.getNumberOrUndefined(value.x) : multiValue.x;
	          multiValue.y = value.hasOwnProperty('y') ? Chartist.getNumberOrUndefined(value.y) : multiValue.y;
	
	          return multiValue;
	
	        } else {
	          return Chartist.getNumberOrUndefined(value);
	        }
	      }
	    }
	
	    return data.series.map(recursiveConvert);
	  };
	
	  /**
	   * Converts a number into a padding object.
	   *
	   * @memberof Chartist.Core
	   * @param {Object|Number} padding
	   * @param {Number} [fallback] This value is used to fill missing values if a incomplete padding object was passed
	   * @returns {Object} Returns a padding object containing top, right, bottom, left properties filled with the padding number passed in as argument. If the argument is something else than a number (presumably already a correct padding object) then this argument is directly returned.
	   */
	  Chartist.normalizePadding = function(padding, fallback) {
	    fallback = fallback || 0;
	
	    return typeof padding === 'number' ? {
	      top: padding,
	      right: padding,
	      bottom: padding,
	      left: padding
	    } : {
	      top: typeof padding.top === 'number' ? padding.top : fallback,
	      right: typeof padding.right === 'number' ? padding.right : fallback,
	      bottom: typeof padding.bottom === 'number' ? padding.bottom : fallback,
	      left: typeof padding.left === 'number' ? padding.left : fallback
	    };
	  };
	
	  Chartist.getMetaData = function(series, index) {
	    var value = series.data ? series.data[index] : series[index];
	    return value ? Chartist.serialize(value.meta) : undefined;
	  };
	
	  /**
	   * Calculate the order of magnitude for the chart scale
	   *
	   * @memberof Chartist.Core
	   * @param {Number} value The value Range of the chart
	   * @return {Number} The order of magnitude
	   */
	  Chartist.orderOfMagnitude = function (value) {
	    return Math.floor(Math.log(Math.abs(value)) / Math.LN10);
	  };
	
	  /**
	   * Project a data length into screen coordinates (pixels)
	   *
	   * @memberof Chartist.Core
	   * @param {Object} axisLength The svg element for the chart
	   * @param {Number} length Single data value from a series array
	   * @param {Object} bounds All the values to set the bounds of the chart
	   * @return {Number} The projected data length in pixels
	   */
	  Chartist.projectLength = function (axisLength, length, bounds) {
	    return length / bounds.range * axisLength;
	  };
	
	  /**
	   * Get the height of the area in the chart for the data series
	   *
	   * @memberof Chartist.Core
	   * @param {Object} svg The svg element for the chart
	   * @param {Object} options The Object that contains all the optional values for the chart
	   * @return {Number} The height of the area in the chart for the data series
	   */
	  Chartist.getAvailableHeight = function (svg, options) {
	    return Math.max((Chartist.quantity(options.height).value || svg.height()) - (options.chartPadding.top +  options.chartPadding.bottom) - options.axisX.offset, 0);
	  };
	
	  /**
	   * Get highest and lowest value of data array. This Array contains the data that will be visualized in the chart.
	   *
	   * @memberof Chartist.Core
	   * @param {Array} data The array that contains the data to be visualized in the chart
	   * @param {Object} options The Object that contains the chart options
	   * @param {String} dimension Axis dimension 'x' or 'y' used to access the correct value and high / low configuration
	   * @return {Object} An object that contains the highest and lowest value that will be visualized on the chart.
	   */
	  Chartist.getHighLow = function (data, options, dimension) {
	    // TODO: Remove workaround for deprecated global high / low config. Axis high / low configuration is preferred
	    options = Chartist.extend({}, options, dimension ? options['axis' + dimension.toUpperCase()] : {});
	
	    var highLow = {
	        high: options.high === undefined ? -Number.MAX_VALUE : +options.high,
	        low: options.low === undefined ? Number.MAX_VALUE : +options.low
	      };
	    var findHigh = options.high === undefined;
	    var findLow = options.low === undefined;
	
	    // Function to recursively walk through arrays and find highest and lowest number
	    function recursiveHighLow(data) {
	      if(data === undefined) {
	        return undefined;
	      } else if(data instanceof Array) {
	        for (var i = 0; i < data.length; i++) {
	          recursiveHighLow(data[i]);
	        }
	      } else {
	        var value = dimension ? +data[dimension] : +data;
	
	        if (findHigh && value > highLow.high) {
	          highLow.high = value;
	        }
	
	        if (findLow && value < highLow.low) {
	          highLow.low = value;
	        }
	      }
	    }
	
	    // Start to find highest and lowest number recursively
	    if(findHigh || findLow) {
	      recursiveHighLow(data);
	    }
	
	    // Overrides of high / low based on reference value, it will make sure that the invisible reference value is
	    // used to generate the chart. This is useful when the chart always needs to contain the position of the
	    // invisible reference value in the view i.e. for bipolar scales.
	    if (options.referenceValue || options.referenceValue === 0) {
	      highLow.high = Math.max(options.referenceValue, highLow.high);
	      highLow.low = Math.min(options.referenceValue, highLow.low);
	    }
	
	    // If high and low are the same because of misconfiguration or flat data (only the same value) we need
	    // to set the high or low to 0 depending on the polarity
	    if (highLow.high <= highLow.low) {
	      // If both values are 0 we set high to 1
	      if (highLow.low === 0) {
	        highLow.high = 1;
	      } else if (highLow.low < 0) {
	        // If we have the same negative value for the bounds we set bounds.high to 0
	        highLow.high = 0;
	      } else {
	        // If we have the same positive value for the bounds we set bounds.low to 0
	        highLow.low = 0;
	      }
	    }
	
	    return highLow;
	  };
	
	  /**
	   * Checks if the value is a valid number or string with a number.
	   *
	   * @memberof Chartist.Core
	   * @param value
	   * @returns {Boolean}
	   */
	  Chartist.isNum = function(value) {
	    return !isNaN(value) && isFinite(value);
	  };
	
	  /**
	   * Returns true on all falsey values except the numeric value 0.
	   *
	   * @memberof Chartist.Core
	   * @param value
	   * @returns {boolean}
	   */
	  Chartist.isFalseyButZero = function(value) {
	    return !value && value !== 0;
	  };
	
	  /**
	   * Returns a number if the passed parameter is a valid number or the function will return undefined. On all other values than a valid number, this function will return undefined.
	   *
	   * @memberof Chartist.Core
	   * @param value
	   * @returns {*}
	   */
	  Chartist.getNumberOrUndefined = function(value) {
	    return isNaN(+value) ? undefined : +value;
	  };
	
	  /**
	   * Gets a value from a dimension `value.x` or `value.y` while returning value directly if it's a valid numeric value. If the value is not numeric and it's falsey this function will return undefined.
	   *
	   * @param value
	   * @param dimension
	   * @returns {*}
	   */
	  Chartist.getMultiValue = function(value, dimension) {
	    if(Chartist.isNum(value)) {
	      return +value;
	    } else if(value) {
	      return value[dimension || 'y'] || 0;
	    } else {
	      return 0;
	    }
	  };
	
	  /**
	   * Pollard Rho Algorithm to find smallest factor of an integer value. There are more efficient algorithms for factorization, but this one is quite efficient and not so complex.
	   *
	   * @memberof Chartist.Core
	   * @param {Number} num An integer number where the smallest factor should be searched for
	   * @returns {Number} The smallest integer factor of the parameter num.
	   */
	  Chartist.rho = function(num) {
	    if(num === 1) {
	      return num;
	    }
	
	    function gcd(p, q) {
	      if (p % q === 0) {
	        return q;
	      } else {
	        return gcd(q, p % q);
	      }
	    }
	
	    function f(x) {
	      return x * x + 1;
	    }
	
	    var x1 = 2, x2 = 2, divisor;
	    if (num % 2 === 0) {
	      return 2;
	    }
	
	    do {
	      x1 = f(x1) % num;
	      x2 = f(f(x2)) % num;
	      divisor = gcd(Math.abs(x1 - x2), num);
	    } while (divisor === 1);
	
	    return divisor;
	  };
	
	  /**
	   * Calculate and retrieve all the bounds for the chart and return them in one array
	   *
	   * @memberof Chartist.Core
	   * @param {Number} axisLength The length of the Axis used for
	   * @param {Object} highLow An object containing a high and low property indicating the value range of the chart.
	   * @param {Number} scaleMinSpace The minimum projected length a step should result in
	   * @param {Boolean} onlyInteger
	   * @return {Object} All the values to set the bounds of the chart
	   */
	  Chartist.getBounds = function (axisLength, highLow, scaleMinSpace, onlyInteger) {
	    var i,
	      optimizationCounter = 0,
	      newMin,
	      newMax,
	      bounds = {
	        high: highLow.high,
	        low: highLow.low
	      };
	
	    bounds.valueRange = bounds.high - bounds.low;
	    bounds.oom = Chartist.orderOfMagnitude(bounds.valueRange);
	    bounds.step = Math.pow(10, bounds.oom);
	    bounds.min = Math.floor(bounds.low / bounds.step) * bounds.step;
	    bounds.max = Math.ceil(bounds.high / bounds.step) * bounds.step;
	    bounds.range = bounds.max - bounds.min;
	    bounds.numberOfSteps = Math.round(bounds.range / bounds.step);
	
	    // Optimize scale step by checking if subdivision is possible based on horizontalGridMinSpace
	    // If we are already below the scaleMinSpace value we will scale up
	    var length = Chartist.projectLength(axisLength, bounds.step, bounds);
	    var scaleUp = length < scaleMinSpace;
	    var smallestFactor = onlyInteger ? Chartist.rho(bounds.range) : 0;
	
	    // First check if we should only use integer steps and if step 1 is still larger than scaleMinSpace so we can use 1
	    if(onlyInteger && Chartist.projectLength(axisLength, 1, bounds) >= scaleMinSpace) {
	      bounds.step = 1;
	    } else if(onlyInteger && smallestFactor < bounds.step && Chartist.projectLength(axisLength, smallestFactor, bounds) >= scaleMinSpace) {
	      // If step 1 was too small, we can try the smallest factor of range
	      // If the smallest factor is smaller than the current bounds.step and the projected length of smallest factor
	      // is larger than the scaleMinSpace we should go for it.
	      bounds.step = smallestFactor;
	    } else {
	      // Trying to divide or multiply by 2 and find the best step value
	      while (true) {
	        if (scaleUp && Chartist.projectLength(axisLength, bounds.step, bounds) <= scaleMinSpace) {
	          bounds.step *= 2;
	        } else if (!scaleUp && Chartist.projectLength(axisLength, bounds.step / 2, bounds) >= scaleMinSpace) {
	          bounds.step /= 2;
	          if(onlyInteger && bounds.step % 1 !== 0) {
	            bounds.step *= 2;
	            break;
	          }
	        } else {
	          break;
	        }
	
	        if(optimizationCounter++ > 1000) {
	          throw new Error('Exceeded maximum number of iterations while optimizing scale step!');
	        }
	      }
	    }
	
	    // Narrow min and max based on new step
	    newMin = bounds.min;
	    newMax = bounds.max;
	    while(newMin + bounds.step <= bounds.low) {
	      newMin += bounds.step;
	    }
	    while(newMax - bounds.step >= bounds.high) {
	      newMax -= bounds.step;
	    }
	    bounds.min = newMin;
	    bounds.max = newMax;
	    bounds.range = bounds.max - bounds.min;
	
	    bounds.values = [];
	    for (i = bounds.min; i <= bounds.max; i += bounds.step) {
	      bounds.values.push(Chartist.roundWithPrecision(i));
	    }
	
	    return bounds;
	  };
	
	  /**
	   * Calculate cartesian coordinates of polar coordinates
	   *
	   * @memberof Chartist.Core
	   * @param {Number} centerX X-axis coordinates of center point of circle segment
	   * @param {Number} centerY X-axis coordinates of center point of circle segment
	   * @param {Number} radius Radius of circle segment
	   * @param {Number} angleInDegrees Angle of circle segment in degrees
	   * @return {{x:Number, y:Number}} Coordinates of point on circumference
	   */
	  Chartist.polarToCartesian = function (centerX, centerY, radius, angleInDegrees) {
	    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
	
	    return {
	      x: centerX + (radius * Math.cos(angleInRadians)),
	      y: centerY + (radius * Math.sin(angleInRadians))
	    };
	  };
	
	  /**
	   * Initialize chart drawing rectangle (area where chart is drawn) x1,y1 = bottom left / x2,y2 = top right
	   *
	   * @memberof Chartist.Core
	   * @param {Object} svg The svg element for the chart
	   * @param {Object} options The Object that contains all the optional values for the chart
	   * @param {Number} [fallbackPadding] The fallback padding if partial padding objects are used
	   * @return {Object} The chart rectangles coordinates inside the svg element plus the rectangles measurements
	   */
	  Chartist.createChartRect = function (svg, options, fallbackPadding) {
	    var hasAxis = !!(options.axisX || options.axisY);
	    var yAxisOffset = hasAxis ? options.axisY.offset : 0;
	    var xAxisOffset = hasAxis ? options.axisX.offset : 0;
	    // If width or height results in invalid value (including 0) we fallback to the unitless settings or even 0
	    var width = svg.width() || Chartist.quantity(options.width).value || 0;
	    var height = svg.height() || Chartist.quantity(options.height).value || 0;
	    var normalizedPadding = Chartist.normalizePadding(options.chartPadding, fallbackPadding);
	
	    // If settings were to small to cope with offset (legacy) and padding, we'll adjust
	    width = Math.max(width, yAxisOffset + normalizedPadding.left + normalizedPadding.right);
	    height = Math.max(height, xAxisOffset + normalizedPadding.top + normalizedPadding.bottom);
	
	    var chartRect = {
	      padding: normalizedPadding,
	      width: function () {
	        return this.x2 - this.x1;
	      },
	      height: function () {
	        return this.y1 - this.y2;
	      }
	    };
	
	    if(hasAxis) {
	      if (options.axisX.position === 'start') {
	        chartRect.y2 = normalizedPadding.top + xAxisOffset;
	        chartRect.y1 = Math.max(height - normalizedPadding.bottom, chartRect.y2 + 1);
	      } else {
	        chartRect.y2 = normalizedPadding.top;
	        chartRect.y1 = Math.max(height - normalizedPadding.bottom - xAxisOffset, chartRect.y2 + 1);
	      }
	
	      if (options.axisY.position === 'start') {
	        chartRect.x1 = normalizedPadding.left + yAxisOffset;
	        chartRect.x2 = Math.max(width - normalizedPadding.right, chartRect.x1 + 1);
	      } else {
	        chartRect.x1 = normalizedPadding.left;
	        chartRect.x2 = Math.max(width - normalizedPadding.right - yAxisOffset, chartRect.x1 + 1);
	      }
	    } else {
	      chartRect.x1 = normalizedPadding.left;
	      chartRect.x2 = Math.max(width - normalizedPadding.right, chartRect.x1 + 1);
	      chartRect.y2 = normalizedPadding.top;
	      chartRect.y1 = Math.max(height - normalizedPadding.bottom, chartRect.y2 + 1);
	    }
	
	    return chartRect;
	  };
	
	  /**
	   * Creates a grid line based on a projected value.
	   *
	   * @memberof Chartist.Core
	   * @param position
	   * @param index
	   * @param axis
	   * @param offset
	   * @param length
	   * @param group
	   * @param classes
	   * @param eventEmitter
	   */
	  Chartist.createGrid = function(position, index, axis, offset, length, group, classes, eventEmitter) {
	    var positionalData = {};
	    positionalData[axis.units.pos + '1'] = position;
	    positionalData[axis.units.pos + '2'] = position;
	    positionalData[axis.counterUnits.pos + '1'] = offset;
	    positionalData[axis.counterUnits.pos + '2'] = offset + length;
	
	    var gridElement = group.elem('line', positionalData, classes.join(' '));
	
	    // Event for grid draw
	    eventEmitter.emit('draw',
	      Chartist.extend({
	        type: 'grid',
	        axis: axis,
	        index: index,
	        group: group,
	        element: gridElement
	      }, positionalData)
	    );
	  };
	
	  /**
	   * Creates a label based on a projected value and an axis.
	   *
	   * @memberof Chartist.Core
	   * @param position
	   * @param length
	   * @param index
	   * @param labels
	   * @param axis
	   * @param axisOffset
	   * @param labelOffset
	   * @param group
	   * @param classes
	   * @param useForeignObject
	   * @param eventEmitter
	   */
	  Chartist.createLabel = function(position, length, index, labels, axis, axisOffset, labelOffset, group, classes, useForeignObject, eventEmitter) {
	    var labelElement;
	    var positionalData = {};
	
	    positionalData[axis.units.pos] = position + labelOffset[axis.units.pos];
	    positionalData[axis.counterUnits.pos] = labelOffset[axis.counterUnits.pos];
	    positionalData[axis.units.len] = length;
	    positionalData[axis.counterUnits.len] = axisOffset - 10;
	
	    if(useForeignObject) {
	      // We need to set width and height explicitly to px as span will not expand with width and height being
	      // 100% in all browsers
	      var content = '<span class="' + classes.join(' ') + '" style="' +
	        axis.units.len + ': ' + Math.round(positionalData[axis.units.len]) + 'px; ' +
	        axis.counterUnits.len + ': ' + Math.round(positionalData[axis.counterUnits.len]) + 'px">' +
	        labels[index] + '</span>';
	
	      labelElement = group.foreignObject(content, Chartist.extend({
	        style: 'overflow: visible;'
	      }, positionalData));
	    } else {
	      labelElement = group.elem('text', positionalData, classes.join(' ')).text(labels[index]);
	    }
	
	    eventEmitter.emit('draw', Chartist.extend({
	      type: 'label',
	      axis: axis,
	      index: index,
	      group: group,
	      element: labelElement,
	      text: labels[index]
	    }, positionalData));
	  };
	
	  /**
	   * Helper to read series specific options from options object. It automatically falls back to the global option if
	   * there is no option in the series options.
	   *
	   * @param {Object} series Series object
	   * @param {Object} options Chartist options object
	   * @param {string} key The options key that should be used to obtain the options
	   * @returns {*}
	   */
	  Chartist.getSeriesOption = function(series, options, key) {
	    if(series.name && options.series && options.series[series.name]) {
	      var seriesOptions = options.series[series.name];
	      return seriesOptions.hasOwnProperty(key) ? seriesOptions[key] : options[key];
	    } else {
	      return options[key];
	    }
	  };
	
	  /**
	   * Provides options handling functionality with callback for options changes triggered by responsive options and media query matches
	   *
	   * @memberof Chartist.Core
	   * @param {Object} options Options set by user
	   * @param {Array} responsiveOptions Optional functions to add responsive behavior to chart
	   * @param {Object} eventEmitter The event emitter that will be used to emit the options changed events
	   * @return {Object} The consolidated options object from the defaults, base and matching responsive options
	   */
	  Chartist.optionsProvider = function (options, responsiveOptions, eventEmitter) {
	    var baseOptions = Chartist.extend({}, options),
	      currentOptions,
	      mediaQueryListeners = [],
	      i;
	
	    function updateCurrentOptions(preventChangedEvent) {
	      var previousOptions = currentOptions;
	      currentOptions = Chartist.extend({}, baseOptions);
	
	      if (responsiveOptions) {
	        for (i = 0; i < responsiveOptions.length; i++) {
	          var mql = window.matchMedia(responsiveOptions[i][0]);
	          if (mql.matches) {
	            currentOptions = Chartist.extend(currentOptions, responsiveOptions[i][1]);
	          }
	        }
	      }
	
	      if(eventEmitter && !preventChangedEvent) {
	        eventEmitter.emit('optionsChanged', {
	          previousOptions: previousOptions,
	          currentOptions: currentOptions
	        });
	      }
	    }
	
	    function removeMediaQueryListeners() {
	      mediaQueryListeners.forEach(function(mql) {
	        mql.removeListener(updateCurrentOptions);
	      });
	    }
	
	    if (!window.matchMedia) {
	      throw 'window.matchMedia not found! Make sure you\'re using a polyfill.';
	    } else if (responsiveOptions) {
	
	      for (i = 0; i < responsiveOptions.length; i++) {
	        var mql = window.matchMedia(responsiveOptions[i][0]);
	        mql.addListener(updateCurrentOptions);
	        mediaQueryListeners.push(mql);
	      }
	    }
	    // Execute initially so we get the correct options
	    updateCurrentOptions(true);
	
	    return {
	      removeMediaQueryListeners: removeMediaQueryListeners,
	      getCurrentOptions: function getCurrentOptions() {
	        return Chartist.extend({}, currentOptions);
	      }
	    };
	  };
	
	}(window, document, Chartist));
	;/**
	 * Chartist path interpolation functions.
	 *
	 * @module Chartist.Interpolation
	 */
	/* global Chartist */
	(function(window, document, Chartist) {
	  'use strict';
	
	  Chartist.Interpolation = {};
	
	  /**
	   * This interpolation function does not smooth the path and the result is only containing lines and no curves.
	   *
	   * @example
	   * var chart = new Chartist.Line('.ct-chart', {
	   *   labels: [1, 2, 3, 4, 5],
	   *   series: [[1, 2, 8, 1, 7]]
	   * }, {
	   *   lineSmooth: Chartist.Interpolation.none({
	   *     fillHoles: false
	   *   })
	   * });
	   *
	   *
	   * @memberof Chartist.Interpolation
	   * @return {Function}
	   */
	  Chartist.Interpolation.none = function(options) {
	    var defaultOptions = {
	      fillHoles: false
	    };
	    options = Chartist.extend({}, defaultOptions, options);
	    return function none(pathCoordinates, valueData) {
	      var path = new Chartist.Svg.Path();
	      var hole = true;
	
	      for(var i = 0; i < pathCoordinates.length; i += 2) {
	        var currX = pathCoordinates[i];
	        var currY = pathCoordinates[i + 1];
	        var currData = valueData[i / 2];
	
	        if(currData.value !== undefined) {
	
	          if(hole) {
	            path.move(currX, currY, false, currData);
	          } else {
	            path.line(currX, currY, false, currData);
	          }
	
	          hole = false;
	        } else if(!options.fillHoles) {
	          hole = true;
	        }
	      }
	
	      return path;
	    };
	  };
	
	  /**
	   * Simple smoothing creates horizontal handles that are positioned with a fraction of the length between two data points. You can use the divisor option to specify the amount of smoothing.
	   *
	   * Simple smoothing can be used instead of `Chartist.Smoothing.cardinal` if you'd like to get rid of the artifacts it produces sometimes. Simple smoothing produces less flowing lines but is accurate by hitting the points and it also doesn't swing below or above the given data point.
	   *
	   * All smoothing functions within Chartist are factory functions that accept an options parameter. The simple interpolation function accepts one configuration parameter `divisor`, between 1 and ∞, which controls the smoothing characteristics.
	   *
	   * @example
	   * var chart = new Chartist.Line('.ct-chart', {
	   *   labels: [1, 2, 3, 4, 5],
	   *   series: [[1, 2, 8, 1, 7]]
	   * }, {
	   *   lineSmooth: Chartist.Interpolation.simple({
	   *     divisor: 2,
	   *     fillHoles: false
	   *   })
	   * });
	   *
	   *
	   * @memberof Chartist.Interpolation
	   * @param {Object} options The options of the simple interpolation factory function.
	   * @return {Function}
	   */
	  Chartist.Interpolation.simple = function(options) {
	    var defaultOptions = {
	      divisor: 2,
	      fillHoles: false
	    };
	    options = Chartist.extend({}, defaultOptions, options);
	
	    var d = 1 / Math.max(1, options.divisor);
	
	    return function simple(pathCoordinates, valueData) {
	      var path = new Chartist.Svg.Path();
	      var prevX, prevY, prevData;
	
	      for(var i = 0; i < pathCoordinates.length; i += 2) {
	        var currX = pathCoordinates[i];
	        var currY = pathCoordinates[i + 1];
	        var length = (currX - prevX) * d;
	        var currData = valueData[i / 2];
	
	        if(currData.value !== undefined) {
	
	          if(prevData === undefined) {
	            path.move(currX, currY, false, currData);
	          } else {
	            path.curve(
	              prevX + length,
	              prevY,
	              currX - length,
	              currY,
	              currX,
	              currY,
	              false,
	              currData
	            );
	          }
	
	          prevX = currX;
	          prevY = currY;
	          prevData = currData;
	        } else if(!options.fillHoles) {
	          prevX = currX = prevData = undefined;
	        }
	      }
	
	      return path;
	    };
	  };
	
	  /**
	   * Cardinal / Catmull-Rome spline interpolation is the default smoothing function in Chartist. It produces nice results where the splines will always meet the points. It produces some artifacts though when data values are increased or decreased rapidly. The line may not follow a very accurate path and if the line should be accurate this smoothing function does not produce the best results.
	   *
	   * Cardinal splines can only be created if there are more than two data points. If this is not the case this smoothing will fallback to `Chartist.Smoothing.none`.
	   *
	   * All smoothing functions within Chartist are factory functions that accept an options parameter. The cardinal interpolation function accepts one configuration parameter `tension`, between 0 and 1, which controls the smoothing intensity.
	   *
	   * @example
	   * var chart = new Chartist.Line('.ct-chart', {
	   *   labels: [1, 2, 3, 4, 5],
	   *   series: [[1, 2, 8, 1, 7]]
	   * }, {
	   *   lineSmooth: Chartist.Interpolation.cardinal({
	   *     tension: 1,
	   *     fillHoles: false
	   *   })
	   * });
	   *
	   * @memberof Chartist.Interpolation
	   * @param {Object} options The options of the cardinal factory function.
	   * @return {Function}
	   */
	  Chartist.Interpolation.cardinal = function(options) {
	    var defaultOptions = {
	      tension: 1,
	      fillHoles: false
	    };
	
	    options = Chartist.extend({}, defaultOptions, options);
	
	    var t = Math.min(1, Math.max(0, options.tension)),
	      c = 1 - t;
	
	    // This function will help us to split pathCoordinates and valueData into segments that also contain pathCoordinates
	    // and valueData. This way the existing functions can be reused and the segment paths can be joined afterwards.
	    // This functionality is necessary to treat "holes" in the line charts
	    function splitIntoSegments(pathCoordinates, valueData) {
	      var segments = [];
	      var hole = true;
	
	      for(var i = 0; i < pathCoordinates.length; i += 2) {
	        // If this value is a "hole" we set the hole flag
	        if(valueData[i / 2].value === undefined) {
	          if(!options.fillHoles) {
	            hole = true;
	          }
	        } else {
	          // If it's a valid value we need to check if we're coming out of a hole and create a new empty segment
	          if(hole) {
	            segments.push({
	              pathCoordinates: [],
	              valueData: []
	            });
	            // As we have a valid value now, we are not in a "hole" anymore
	            hole = false;
	          }
	
	          // Add to the segment pathCoordinates and valueData
	          segments[segments.length - 1].pathCoordinates.push(pathCoordinates[i], pathCoordinates[i + 1]);
	          segments[segments.length - 1].valueData.push(valueData[i / 2]);
	        }
	      }
	
	      return segments;
	    }
	
	    return function cardinal(pathCoordinates, valueData) {
	      // First we try to split the coordinates into segments
	      // This is necessary to treat "holes" in line charts
	      var segments = splitIntoSegments(pathCoordinates, valueData);
	
	      // If the split resulted in more that one segment we need to interpolate each segment individually and join them
	      // afterwards together into a single path.
	      if(segments.length > 1) {
	        var paths = [];
	        // For each segment we will recurse the cardinal function
	        segments.forEach(function(segment) {
	          paths.push(cardinal(segment.pathCoordinates, segment.valueData));
	        });
	        // Join the segment path data into a single path and return
	        return Chartist.Svg.Path.join(paths);
	      } else {
	        // If there was only one segment we can proceed regularly by using pathCoordinates and valueData from the first
	        // segment
	        pathCoordinates = segments[0].pathCoordinates;
	        valueData = segments[0].valueData;
	
	        // If less than two points we need to fallback to no smoothing
	        if(pathCoordinates.length <= 4) {
	          return Chartist.Interpolation.none()(pathCoordinates, valueData);
	        }
	
	        var path = new Chartist.Svg.Path().move(pathCoordinates[0], pathCoordinates[1], false, valueData[0]),
	          z;
	
	        for (var i = 0, iLen = pathCoordinates.length; iLen - 2 * !z > i; i += 2) {
	          var p = [
	            {x: +pathCoordinates[i - 2], y: +pathCoordinates[i - 1]},
	            {x: +pathCoordinates[i], y: +pathCoordinates[i + 1]},
	            {x: +pathCoordinates[i + 2], y: +pathCoordinates[i + 3]},
	            {x: +pathCoordinates[i + 4], y: +pathCoordinates[i + 5]}
	          ];
	          if (z) {
	            if (!i) {
	              p[0] = {x: +pathCoordinates[iLen - 2], y: +pathCoordinates[iLen - 1]};
	            } else if (iLen - 4 === i) {
	              p[3] = {x: +pathCoordinates[0], y: +pathCoordinates[1]};
	            } else if (iLen - 2 === i) {
	              p[2] = {x: +pathCoordinates[0], y: +pathCoordinates[1]};
	              p[3] = {x: +pathCoordinates[2], y: +pathCoordinates[3]};
	            }
	          } else {
	            if (iLen - 4 === i) {
	              p[3] = p[2];
	            } else if (!i) {
	              p[0] = {x: +pathCoordinates[i], y: +pathCoordinates[i + 1]};
	            }
	          }
	
	          path.curve(
	            (t * (-p[0].x + 6 * p[1].x + p[2].x) / 6) + (c * p[2].x),
	            (t * (-p[0].y + 6 * p[1].y + p[2].y) / 6) + (c * p[2].y),
	            (t * (p[1].x + 6 * p[2].x - p[3].x) / 6) + (c * p[2].x),
	            (t * (p[1].y + 6 * p[2].y - p[3].y) / 6) + (c * p[2].y),
	            p[2].x,
	            p[2].y,
	            false,
	            valueData[(i + 2) / 2]
	          );
	        }
	
	        return path;
	      }
	    };
	  };
	
	  /**
	   * Step interpolation will cause the line chart to move in steps rather than diagonal or smoothed lines. This interpolation will create additional points that will also be drawn when the `showPoint` option is enabled.
	   *
	   * All smoothing functions within Chartist are factory functions that accept an options parameter. The step interpolation function accepts one configuration parameter `postpone`, that can be `true` or `false`. The default value is `true` and will cause the step to occur where the value actually changes. If a different behaviour is needed where the step is shifted to the left and happens before the actual value, this option can be set to `false`.
	   *
	   * @example
	   * var chart = new Chartist.Line('.ct-chart', {
	   *   labels: [1, 2, 3, 4, 5],
	   *   series: [[1, 2, 8, 1, 7]]
	   * }, {
	   *   lineSmooth: Chartist.Interpolation.step({
	   *     postpone: true,
	   *     fillHoles: false
	   *   })
	   * });
	   *
	   * @memberof Chartist.Interpolation
	   * @param options
	   * @returns {Function}
	   */
	  Chartist.Interpolation.step = function(options) {
	    var defaultOptions = {
	      postpone: true,
	      fillHoles: false
	    };
	
	    options = Chartist.extend({}, defaultOptions, options);
	
	    return function step(pathCoordinates, valueData) {
	      var path = new Chartist.Svg.Path();
	
	      var prevX, prevY, prevData;
	
	      for (var i = 0; i < pathCoordinates.length; i += 2) {
	        var currX = pathCoordinates[i];
	        var currY = pathCoordinates[i + 1];
	        var currData = valueData[i / 2];
	
	        // If the current point is also not a hole we can draw the step lines
	        if(currData.value !== undefined) {
	          if(prevData === undefined) {
	            path.move(currX, currY, false, currData);
	          } else {
	            if(options.postpone) {
	              // If postponed we should draw the step line with the value of the previous value
	              path.line(currX, prevY, false, prevData);
	            } else {
	              // If not postponed we should draw the step line with the value of the current value
	              path.line(prevX, currY, false, currData);
	            }
	            // Line to the actual point (this should only be a Y-Axis movement
	            path.line(currX, currY, false, currData);
	          }
	
	          prevX = currX;
	          prevY = currY;
	          prevData = currData;
	        } else if(!options.fillHoles) {
	          prevX = prevY = prevData = undefined;
	        }
	      }
	
	      return path;
	    };
	  };
	
	}(window, document, Chartist));
	;/**
	 * A very basic event module that helps to generate and catch events.
	 *
	 * @module Chartist.Event
	 */
	/* global Chartist */
	(function (window, document, Chartist) {
	  'use strict';
	
	  Chartist.EventEmitter = function () {
	    var handlers = [];
	
	    /**
	     * Add an event handler for a specific event
	     *
	     * @memberof Chartist.Event
	     * @param {String} event The event name
	     * @param {Function} handler A event handler function
	     */
	    function addEventHandler(event, handler) {
	      handlers[event] = handlers[event] || [];
	      handlers[event].push(handler);
	    }
	
	    /**
	     * Remove an event handler of a specific event name or remove all event handlers for a specific event.
	     *
	     * @memberof Chartist.Event
	     * @param {String} event The event name where a specific or all handlers should be removed
	     * @param {Function} [handler] An optional event handler function. If specified only this specific handler will be removed and otherwise all handlers are removed.
	     */
	    function removeEventHandler(event, handler) {
	      // Only do something if there are event handlers with this name existing
	      if(handlers[event]) {
	        // If handler is set we will look for a specific handler and only remove this
	        if(handler) {
	          handlers[event].splice(handlers[event].indexOf(handler), 1);
	          if(handlers[event].length === 0) {
	            delete handlers[event];
	          }
	        } else {
	          // If no handler is specified we remove all handlers for this event
	          delete handlers[event];
	        }
	      }
	    }
	
	    /**
	     * Use this function to emit an event. All handlers that are listening for this event will be triggered with the data parameter.
	     *
	     * @memberof Chartist.Event
	     * @param {String} event The event name that should be triggered
	     * @param {*} data Arbitrary data that will be passed to the event handler callback functions
	     */
	    function emit(event, data) {
	      // Only do something if there are event handlers with this name existing
	      if(handlers[event]) {
	        handlers[event].forEach(function(handler) {
	          handler(data);
	        });
	      }
	
	      // Emit event to star event handlers
	      if(handlers['*']) {
	        handlers['*'].forEach(function(starHandler) {
	          starHandler(event, data);
	        });
	      }
	    }
	
	    return {
	      addEventHandler: addEventHandler,
	      removeEventHandler: removeEventHandler,
	      emit: emit
	    };
	  };
	
	}(window, document, Chartist));
	;/**
	 * This module provides some basic prototype inheritance utilities.
	 *
	 * @module Chartist.Class
	 */
	/* global Chartist */
	(function(window, document, Chartist) {
	  'use strict';
	
	  function listToArray(list) {
	    var arr = [];
	    if (list.length) {
	      for (var i = 0; i < list.length; i++) {
	        arr.push(list[i]);
	      }
	    }
	    return arr;
	  }
	
	  /**
	   * Method to extend from current prototype.
	   *
	   * @memberof Chartist.Class
	   * @param {Object} properties The object that serves as definition for the prototype that gets created for the new class. This object should always contain a constructor property that is the desired constructor for the newly created class.
	   * @param {Object} [superProtoOverride] By default extens will use the current class prototype or Chartist.class. With this parameter you can specify any super prototype that will be used.
	   * @return {Function} Constructor function of the new class
	   *
	   * @example
	   * var Fruit = Class.extend({
	     * color: undefined,
	     *   sugar: undefined,
	     *
	     *   constructor: function(color, sugar) {
	     *     this.color = color;
	     *     this.sugar = sugar;
	     *   },
	     *
	     *   eat: function() {
	     *     this.sugar = 0;
	     *     return this;
	     *   }
	     * });
	   *
	   * var Banana = Fruit.extend({
	     *   length: undefined,
	     *
	     *   constructor: function(length, sugar) {
	     *     Banana.super.constructor.call(this, 'Yellow', sugar);
	     *     this.length = length;
	     *   }
	     * });
	   *
	   * var banana = new Banana(20, 40);
	   * console.log('banana instanceof Fruit', banana instanceof Fruit);
	   * console.log('Fruit is prototype of banana', Fruit.prototype.isPrototypeOf(banana));
	   * console.log('bananas prototype is Fruit', Object.getPrototypeOf(banana) === Fruit.prototype);
	   * console.log(banana.sugar);
	   * console.log(banana.eat().sugar);
	   * console.log(banana.color);
	   */
	  function extend(properties, superProtoOverride) {
	    var superProto = superProtoOverride || this.prototype || Chartist.Class;
	    var proto = Object.create(superProto);
	
	    Chartist.Class.cloneDefinitions(proto, properties);
	
	    var constr = function() {
	      var fn = proto.constructor || function () {},
	        instance;
	
	      // If this is linked to the Chartist namespace the constructor was not called with new
	      // To provide a fallback we will instantiate here and return the instance
	      instance = this === Chartist ? Object.create(proto) : this;
	      fn.apply(instance, Array.prototype.slice.call(arguments, 0));
	
	      // If this constructor was not called with new we need to return the instance
	      // This will not harm when the constructor has been called with new as the returned value is ignored
	      return instance;
	    };
	
	    constr.prototype = proto;
	    constr.super = superProto;
	    constr.extend = this.extend;
	
	    return constr;
	  }
	
	  // Variable argument list clones args > 0 into args[0] and retruns modified args[0]
	  function cloneDefinitions() {
	    var args = listToArray(arguments);
	    var target = args[0];
	
	    args.splice(1, args.length - 1).forEach(function (source) {
	      Object.getOwnPropertyNames(source).forEach(function (propName) {
	        // If this property already exist in target we delete it first
	        delete target[propName];
	        // Define the property with the descriptor from source
	        Object.defineProperty(target, propName,
	          Object.getOwnPropertyDescriptor(source, propName));
	      });
	    });
	
	    return target;
	  }
	
	  Chartist.Class = {
	    extend: extend,
	    cloneDefinitions: cloneDefinitions
	  };
	
	}(window, document, Chartist));
	;/**
	 * Base for all chart types. The methods in Chartist.Base are inherited to all chart types.
	 *
	 * @module Chartist.Base
	 */
	/* global Chartist */
	(function(window, document, Chartist) {
	  'use strict';
	
	  // TODO: Currently we need to re-draw the chart on window resize. This is usually very bad and will affect performance.
	  // This is done because we can't work with relative coordinates when drawing the chart because SVG Path does not
	  // work with relative positions yet. We need to check if we can do a viewBox hack to switch to percentage.
	  // See http://mozilla.6506.n7.nabble.com/Specyfing-paths-with-percentages-unit-td247474.html
	  // Update: can be done using the above method tested here: http://codepen.io/gionkunz/pen/KDvLj
	  // The problem is with the label offsets that can't be converted into percentage and affecting the chart container
	  /**
	   * Updates the chart which currently does a full reconstruction of the SVG DOM
	   *
	   * @param {Object} [data] Optional data you'd like to set for the chart before it will update. If not specified the update method will use the data that is already configured with the chart.
	   * @param {Object} [options] Optional options you'd like to add to the previous options for the chart before it will update. If not specified the update method will use the options that have been already configured with the chart.
	   * @param {Boolean} [override] If set to true, the passed options will be used to extend the options that have been configured already. Otherwise the chart default options will be used as the base
	   * @memberof Chartist.Base
	   */
	  function update(data, options, override) {
	    if(data) {
	      this.data = data;
	      // Event for data transformation that allows to manipulate the data before it gets rendered in the charts
	      this.eventEmitter.emit('data', {
	        type: 'update',
	        data: this.data
	      });
	    }
	
	    if(options) {
	      this.options = Chartist.extend({}, override ? this.options : this.defaultOptions, options);
	
	      // If chartist was not initialized yet, we just set the options and leave the rest to the initialization
	      // Otherwise we re-create the optionsProvider at this point
	      if(!this.initializeTimeoutId) {
	        this.optionsProvider.removeMediaQueryListeners();
	        this.optionsProvider = Chartist.optionsProvider(this.options, this.responsiveOptions, this.eventEmitter);
	      }
	    }
	
	    // Only re-created the chart if it has been initialized yet
	    if(!this.initializeTimeoutId) {
	      this.createChart(this.optionsProvider.getCurrentOptions());
	    }
	
	    // Return a reference to the chart object to chain up calls
	    return this;
	  }
	
	  /**
	   * This method can be called on the API object of each chart and will un-register all event listeners that were added to other components. This currently includes a window.resize listener as well as media query listeners if any responsive options have been provided. Use this function if you need to destroy and recreate Chartist charts dynamically.
	   *
	   * @memberof Chartist.Base
	   */
	  function detach() {
	    // Only detach if initialization already occurred on this chart. If this chart still hasn't initialized (therefore
	    // the initializationTimeoutId is still a valid timeout reference, we will clear the timeout
	    if(!this.initializeTimeoutId) {
	      window.removeEventListener('resize', this.resizeListener);
	      this.optionsProvider.removeMediaQueryListeners();
	    } else {
	      window.clearTimeout(this.initializeTimeoutId);
	    }
	
	    return this;
	  }
	
	  /**
	   * Use this function to register event handlers. The handler callbacks are synchronous and will run in the main thread rather than the event loop.
	   *
	   * @memberof Chartist.Base
	   * @param {String} event Name of the event. Check the examples for supported events.
	   * @param {Function} handler The handler function that will be called when an event with the given name was emitted. This function will receive a data argument which contains event data. See the example for more details.
	   */
	  function on(event, handler) {
	    this.eventEmitter.addEventHandler(event, handler);
	    return this;
	  }
	
	  /**
	   * Use this function to un-register event handlers. If the handler function parameter is omitted all handlers for the given event will be un-registered.
	   *
	   * @memberof Chartist.Base
	   * @param {String} event Name of the event for which a handler should be removed
	   * @param {Function} [handler] The handler function that that was previously used to register a new event handler. This handler will be removed from the event handler list. If this parameter is omitted then all event handlers for the given event are removed from the list.
	   */
	  function off(event, handler) {
	    this.eventEmitter.removeEventHandler(event, handler);
	    return this;
	  }
	
	  function initialize() {
	    // Add window resize listener that re-creates the chart
	    window.addEventListener('resize', this.resizeListener);
	
	    // Obtain current options based on matching media queries (if responsive options are given)
	    // This will also register a listener that is re-creating the chart based on media changes
	    this.optionsProvider = Chartist.optionsProvider(this.options, this.responsiveOptions, this.eventEmitter);
	    // Register options change listener that will trigger a chart update
	    this.eventEmitter.addEventHandler('optionsChanged', function() {
	      this.update();
	    }.bind(this));
	
	    // Before the first chart creation we need to register us with all plugins that are configured
	    // Initialize all relevant plugins with our chart object and the plugin options specified in the config
	    if(this.options.plugins) {
	      this.options.plugins.forEach(function(plugin) {
	        if(plugin instanceof Array) {
	          plugin[0](this, plugin[1]);
	        } else {
	          plugin(this);
	        }
	      }.bind(this));
	    }
	
	    // Event for data transformation that allows to manipulate the data before it gets rendered in the charts
	    this.eventEmitter.emit('data', {
	      type: 'initial',
	      data: this.data
	    });
	
	    // Create the first chart
	    this.createChart(this.optionsProvider.getCurrentOptions());
	
	    // As chart is initialized from the event loop now we can reset our timeout reference
	    // This is important if the chart gets initialized on the same element twice
	    this.initializeTimeoutId = undefined;
	  }
	
	  /**
	   * Constructor of chart base class.
	   *
	   * @param query
	   * @param data
	   * @param defaultOptions
	   * @param options
	   * @param responsiveOptions
	   * @constructor
	   */
	  function Base(query, data, defaultOptions, options, responsiveOptions) {
	    this.container = Chartist.querySelector(query);
	    this.data = data;
	    this.defaultOptions = defaultOptions;
	    this.options = options;
	    this.responsiveOptions = responsiveOptions;
	    this.eventEmitter = Chartist.EventEmitter();
	    this.supportsForeignObject = Chartist.Svg.isSupported('Extensibility');
	    this.supportsAnimations = Chartist.Svg.isSupported('AnimationEventsAttribute');
	    this.resizeListener = function resizeListener(){
	      this.update();
	    }.bind(this);
	
	    if(this.container) {
	      // If chartist was already initialized in this container we are detaching all event listeners first
	      if(this.container.__chartist__) {
	        this.container.__chartist__.detach();
	      }
	
	      this.container.__chartist__ = this;
	    }
	
	    // Using event loop for first draw to make it possible to register event listeners in the same call stack where
	    // the chart was created.
	    this.initializeTimeoutId = setTimeout(initialize.bind(this), 0);
	  }
	
	  // Creating the chart base class
	  Chartist.Base = Chartist.Class.extend({
	    constructor: Base,
	    optionsProvider: undefined,
	    container: undefined,
	    svg: undefined,
	    eventEmitter: undefined,
	    createChart: function() {
	      throw new Error('Base chart type can\'t be instantiated!');
	    },
	    update: update,
	    detach: detach,
	    on: on,
	    off: off,
	    version: Chartist.version,
	    supportsForeignObject: false
	  });
	
	}(window, document, Chartist));
	;/**
	 * Chartist SVG module for simple SVG DOM abstraction
	 *
	 * @module Chartist.Svg
	 */
	/* global Chartist */
	(function(window, document, Chartist) {
	  'use strict';
	
	  var svgNs = 'http://www.w3.org/2000/svg',
	    xmlNs = 'http://www.w3.org/2000/xmlns/',
	    xhtmlNs = 'http://www.w3.org/1999/xhtml';
	
	  Chartist.xmlNs = {
	    qualifiedName: 'xmlns:ct',
	    prefix: 'ct',
	    uri: 'http://gionkunz.github.com/chartist-js/ct'
	  };
	
	  /**
	   * Chartist.Svg creates a new SVG object wrapper with a starting element. You can use the wrapper to fluently create sub-elements and modify them.
	   *
	   * @memberof Chartist.Svg
	   * @constructor
	   * @param {String|Element} name The name of the SVG element to create or an SVG dom element which should be wrapped into Chartist.Svg
	   * @param {Object} attributes An object with properties that will be added as attributes to the SVG element that is created. Attributes with undefined values will not be added.
	   * @param {String} className This class or class list will be added to the SVG element
	   * @param {Object} parent The parent SVG wrapper object where this newly created wrapper and it's element will be attached to as child
	   * @param {Boolean} insertFirst If this param is set to true in conjunction with a parent element the newly created element will be added as first child element in the parent element
	   */
	  function Svg(name, attributes, className, parent, insertFirst) {
	    // If Svg is getting called with an SVG element we just return the wrapper
	    if(name instanceof Element) {
	      this._node = name;
	    } else {
	      this._node = document.createElementNS(svgNs, name);
	
	      // If this is an SVG element created then custom namespace
	      if(name === 'svg') {
	        this._node.setAttributeNS(xmlNs, Chartist.xmlNs.qualifiedName, Chartist.xmlNs.uri);
	      }
	    }
	
	    if(attributes) {
	      this.attr(attributes);
	    }
	
	    if(className) {
	      this.addClass(className);
	    }
	
	    if(parent) {
	      if (insertFirst && parent._node.firstChild) {
	        parent._node.insertBefore(this._node, parent._node.firstChild);
	      } else {
	        parent._node.appendChild(this._node);
	      }
	    }
	  }
	
	  /**
	   * Set attributes on the current SVG element of the wrapper you're currently working on.
	   *
	   * @memberof Chartist.Svg
	   * @param {Object|String} attributes An object with properties that will be added as attributes to the SVG element that is created. Attributes with undefined values will not be added. If this parameter is a String then the function is used as a getter and will return the attribute value.
	   * @param {String} ns If specified, the attributes will be set as namespace attributes with ns as prefix.
	   * @return {Object|String} The current wrapper object will be returned so it can be used for chaining or the attribute value if used as getter function.
	   */
	  function attr(attributes, ns) {
	    if(typeof attributes === 'string') {
	      if(ns) {
	        return this._node.getAttributeNS(ns, attributes);
	      } else {
	        return this._node.getAttribute(attributes);
	      }
	    }
	
	    Object.keys(attributes).forEach(function(key) {
	      // If the attribute value is undefined we can skip this one
	      if(attributes[key] === undefined) {
	        return;
	      }
	
	      if(ns) {
	        this._node.setAttributeNS(ns, [Chartist.xmlNs.prefix, ':', key].join(''), attributes[key]);
	      } else {
	        this._node.setAttribute(key, attributes[key]);
	      }
	    }.bind(this));
	
	    return this;
	  }
	
	  /**
	   * Create a new SVG element whose wrapper object will be selected for further operations. This way you can also create nested groups easily.
	   *
	   * @memberof Chartist.Svg
	   * @param {String} name The name of the SVG element that should be created as child element of the currently selected element wrapper
	   * @param {Object} [attributes] An object with properties that will be added as attributes to the SVG element that is created. Attributes with undefined values will not be added.
	   * @param {String} [className] This class or class list will be added to the SVG element
	   * @param {Boolean} [insertFirst] If this param is set to true in conjunction with a parent element the newly created element will be added as first child element in the parent element
	   * @return {Chartist.Svg} Returns a Chartist.Svg wrapper object that can be used to modify the containing SVG data
	   */
	  function elem(name, attributes, className, insertFirst) {
	    return new Chartist.Svg(name, attributes, className, this, insertFirst);
	  }
	
	  /**
	   * Returns the parent Chartist.SVG wrapper object
	   *
	   * @memberof Chartist.Svg
	   * @return {Chartist.Svg} Returns a Chartist.Svg wrapper around the parent node of the current node. If the parent node is not existing or it's not an SVG node then this function will return null.
	   */
	  function parent() {
	    return this._node.parentNode instanceof SVGElement ? new Chartist.Svg(this._node.parentNode) : null;
	  }
	
	  /**
	   * This method returns a Chartist.Svg wrapper around the root SVG element of the current tree.
	   *
	   * @memberof Chartist.Svg
	   * @return {Chartist.Svg} The root SVG element wrapped in a Chartist.Svg element
	   */
	  function root() {
	    var node = this._node;
	    while(node.nodeName !== 'svg') {
	      node = node.parentNode;
	    }
	    return new Chartist.Svg(node);
	  }
	
	  /**
	   * Find the first child SVG element of the current element that matches a CSS selector. The returned object is a Chartist.Svg wrapper.
	   *
	   * @memberof Chartist.Svg
	   * @param {String} selector A CSS selector that is used to query for child SVG elements
	   * @return {Chartist.Svg} The SVG wrapper for the element found or null if no element was found
	   */
	  function querySelector(selector) {
	    var foundNode = this._node.querySelector(selector);
	    return foundNode ? new Chartist.Svg(foundNode) : null;
	  }
	
	  /**
	   * Find the all child SVG elements of the current element that match a CSS selector. The returned object is a Chartist.Svg.List wrapper.
	   *
	   * @memberof Chartist.Svg
	   * @param {String} selector A CSS selector that is used to query for child SVG elements
	   * @return {Chartist.Svg.List} The SVG wrapper list for the element found or null if no element was found
	   */
	  function querySelectorAll(selector) {
	    var foundNodes = this._node.querySelectorAll(selector);
	    return foundNodes.length ? new Chartist.Svg.List(foundNodes) : null;
	  }
	
	  /**
	   * This method creates a foreignObject (see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject) that allows to embed HTML content into a SVG graphic. With the help of foreignObjects you can enable the usage of regular HTML elements inside of SVG where they are subject for SVG positioning and transformation but the Browser will use the HTML rendering capabilities for the containing DOM.
	   *
	   * @memberof Chartist.Svg
	   * @param {Node|String} content The DOM Node, or HTML string that will be converted to a DOM Node, that is then placed into and wrapped by the foreignObject
	   * @param {String} [attributes] An object with properties that will be added as attributes to the foreignObject element that is created. Attributes with undefined values will not be added.
	   * @param {String} [className] This class or class list will be added to the SVG element
	   * @param {Boolean} [insertFirst] Specifies if the foreignObject should be inserted as first child
	   * @return {Chartist.Svg} New wrapper object that wraps the foreignObject element
	   */
	  function foreignObject(content, attributes, className, insertFirst) {
	    // If content is string then we convert it to DOM
	    // TODO: Handle case where content is not a string nor a DOM Node
	    if(typeof content === 'string') {
	      var container = document.createElement('div');
	      container.innerHTML = content;
	      content = container.firstChild;
	    }
	
	    // Adding namespace to content element
	    content.setAttribute('xmlns', xhtmlNs);
	
	    // Creating the foreignObject without required extension attribute (as described here
	    // http://www.w3.org/TR/SVG/extend.html#ForeignObjectElement)
	    var fnObj = this.elem('foreignObject', attributes, className, insertFirst);
	
	    // Add content to foreignObjectElement
	    fnObj._node.appendChild(content);
	
	    return fnObj;
	  }
	
	  /**
	   * This method adds a new text element to the current Chartist.Svg wrapper.
	   *
	   * @memberof Chartist.Svg
	   * @param {String} t The text that should be added to the text element that is created
	   * @return {Chartist.Svg} The same wrapper object that was used to add the newly created element
	   */
	  function text(t) {
	    this._node.appendChild(document.createTextNode(t));
	    return this;
	  }
	
	  /**
	   * This method will clear all child nodes of the current wrapper object.
	   *
	   * @memberof Chartist.Svg
	   * @return {Chartist.Svg} The same wrapper object that got emptied
	   */
	  function empty() {
	    while (this._node.firstChild) {
	      this._node.removeChild(this._node.firstChild);
	    }
	
	    return this;
	  }
	
	  /**
	   * This method will cause the current wrapper to remove itself from its parent wrapper. Use this method if you'd like to get rid of an element in a given DOM structure.
	   *
	   * @memberof Chartist.Svg
	   * @return {Chartist.Svg} The parent wrapper object of the element that got removed
	   */
	  function remove() {
	    this._node.parentNode.removeChild(this._node);
	    return this.parent();
	  }
	
	  /**
	   * This method will replace the element with a new element that can be created outside of the current DOM.
	   *
	   * @memberof Chartist.Svg
	   * @param {Chartist.Svg} newElement The new Chartist.Svg object that will be used to replace the current wrapper object
	   * @return {Chartist.Svg} The wrapper of the new element
	   */
	  function replace(newElement) {
	    this._node.parentNode.replaceChild(newElement._node, this._node);
	    return newElement;
	  }
	
	  /**
	   * This method will append an element to the current element as a child.
	   *
	   * @memberof Chartist.Svg
	   * @param {Chartist.Svg} element The Chartist.Svg element that should be added as a child
	   * @param {Boolean} [insertFirst] Specifies if the element should be inserted as first child
	   * @return {Chartist.Svg} The wrapper of the appended object
	   */
	  function append(element, insertFirst) {
	    if(insertFirst && this._node.firstChild) {
	      this._node.insertBefore(element._node, this._node.firstChild);
	    } else {
	      this._node.appendChild(element._node);
	    }
	
	    return this;
	  }
	
	  /**
	   * Returns an array of class names that are attached to the current wrapper element. This method can not be chained further.
	   *
	   * @memberof Chartist.Svg
	   * @return {Array} A list of classes or an empty array if there are no classes on the current element
	   */
	  function classes() {
	    return this._node.getAttribute('class') ? this._node.getAttribute('class').trim().split(/\s+/) : [];
	  }
	
	  /**
	   * Adds one or a space separated list of classes to the current element and ensures the classes are only existing once.
	   *
	   * @memberof Chartist.Svg
	   * @param {String} names A white space separated list of class names
	   * @return {Chartist.Svg} The wrapper of the current element
	   */
	  function addClass(names) {
	    this._node.setAttribute('class',
	      this.classes(this._node)
	        .concat(names.trim().split(/\s+/))
	        .filter(function(elem, pos, self) {
	          return self.indexOf(elem) === pos;
	        }).join(' ')
	    );
	
	    return this;
	  }
	
	  /**
	   * Removes one or a space separated list of classes from the current element.
	   *
	   * @memberof Chartist.Svg
	   * @param {String} names A white space separated list of class names
	   * @return {Chartist.Svg} The wrapper of the current element
	   */
	  function removeClass(names) {
	    var removedClasses = names.trim().split(/\s+/);
	
	    this._node.setAttribute('class', this.classes(this._node).filter(function(name) {
	      return removedClasses.indexOf(name) === -1;
	    }).join(' '));
	
	    return this;
	  }
	
	  /**
	   * Removes all classes from the current element.
	   *
	   * @memberof Chartist.Svg
	   * @return {Chartist.Svg} The wrapper of the current element
	   */
	  function removeAllClasses() {
	    this._node.setAttribute('class', '');
	
	    return this;
	  }
	
	  /**
	   * "Save" way to get property value from svg BoundingBox.
	   * This is a workaround. Firefox throws an NS_ERROR_FAILURE error if getBBox() is called on an invisible node.
	   * See [NS_ERROR_FAILURE: Component returned failure code: 0x80004005](http://jsfiddle.net/sym3tri/kWWDK/)
	   *
	   * @memberof Chartist.Svg
	   * @param {SVGElement} node The svg node to
	   * @param {String} prop The property to fetch (ex.: height, width, ...)
	   * @returns {Number} The value of the given bbox property
	   */
	  function getBBoxProperty(node, prop) {
	    try {
	      return node.getBBox()[prop];
	    } catch(e) {}
	
	    return 0;
	  }
	
	  /**
	   * Get element height with fallback to svg BoundingBox or parent container dimensions:
	   * See [bugzilla.mozilla.org](https://bugzilla.mozilla.org/show_bug.cgi?id=530985)
	   *
	   * @memberof Chartist.Svg
	   * @return {Number} The elements height in pixels
	   */
	  function height() {
	    return this._node.clientHeight || Math.round(getBBoxProperty(this._node, 'height')) || this._node.parentNode.clientHeight;
	  }
	
	  /**
	   * Get element width with fallback to svg BoundingBox or parent container dimensions:
	   * See [bugzilla.mozilla.org](https://bugzilla.mozilla.org/show_bug.cgi?id=530985)
	   *
	   * @memberof Chartist.Core
	   * @return {Number} The elements width in pixels
	   */
	  function width() {
	    return this._node.clientWidth || Math.round(getBBoxProperty(this._node, 'width')) || this._node.parentNode.clientWidth;
	  }
	
	  /**
	   * The animate function lets you animate the current element with SMIL animations. You can add animations for multiple attributes at the same time by using an animation definition object. This object should contain SMIL animation attributes. Please refer to http://www.w3.org/TR/SVG/animate.html for a detailed specification about the available animation attributes. Additionally an easing property can be passed in the animation definition object. This can be a string with a name of an easing function in `Chartist.Svg.Easing` or an array with four numbers specifying a cubic Bézier curve.
	   * **An animations object could look like this:**
	   * ```javascript
	   * element.animate({
	   *   opacity: {
	   *     dur: 1000,
	   *     from: 0,
	   *     to: 1
	   *   },
	   *   x1: {
	   *     dur: '1000ms',
	   *     from: 100,
	   *     to: 200,
	   *     easing: 'easeOutQuart'
	   *   },
	   *   y1: {
	   *     dur: '2s',
	   *     from: 0,
	   *     to: 100
	   *   }
	   * });
	   * ```
	   * **Automatic unit conversion**
	   * For the `dur` and the `begin` animate attribute you can also omit a unit by passing a number. The number will automatically be converted to milli seconds.
	   * **Guided mode**
	   * The default behavior of SMIL animations with offset using the `begin` attribute is that the attribute will keep it's original value until the animation starts. Mostly this behavior is not desired as you'd like to have your element attributes already initialized with the animation `from` value even before the animation starts. Also if you don't specify `fill="freeze"` on an animate element or if you delete the animation after it's done (which is done in guided mode) the attribute will switch back to the initial value. This behavior is also not desired when performing simple one-time animations. For one-time animations you'd want to trigger animations immediately instead of relative to the document begin time. That's why in guided mode Chartist.Svg will also use the `begin` property to schedule a timeout and manually start the animation after the timeout. If you're using multiple SMIL definition objects for an attribute (in an array), guided mode will be disabled for this attribute, even if you explicitly enabled it.
	   * If guided mode is enabled the following behavior is added:
	   * - Before the animation starts (even when delayed with `begin`) the animated attribute will be set already to the `from` value of the animation
	   * - `begin` is explicitly set to `indefinite` so it can be started manually without relying on document begin time (creation)
	   * - The animate element will be forced to use `fill="freeze"`
	   * - The animation will be triggered with `beginElement()` in a timeout where `begin` of the definition object is interpreted in milli seconds. If no `begin` was specified the timeout is triggered immediately.
	   * - After the animation the element attribute value will be set to the `to` value of the animation
	   * - The animate element is deleted from the DOM
	   *
	   * @memberof Chartist.Svg
	   * @param {Object} animations An animations object where the property keys are the attributes you'd like to animate. The properties should be objects again that contain the SMIL animation attributes (usually begin, dur, from, and to). The property begin and dur is auto converted (see Automatic unit conversion). You can also schedule multiple animations for the same attribute by passing an Array of SMIL definition objects. Attributes that contain an array of SMIL definition objects will not be executed in guided mode.
	   * @param {Boolean} guided Specify if guided mode should be activated for this animation (see Guided mode). If not otherwise specified, guided mode will be activated.
	   * @param {Object} eventEmitter If specified, this event emitter will be notified when an animation starts or ends.
	   * @return {Chartist.Svg} The current element where the animation was added
	   */
	  function animate(animations, guided, eventEmitter) {
	    if(guided === undefined) {
	      guided = true;
	    }
	
	    Object.keys(animations).forEach(function createAnimateForAttributes(attribute) {
	
	      function createAnimate(animationDefinition, guided) {
	        var attributeProperties = {},
	          animate,
	          timeout,
	          easing;
	
	        // Check if an easing is specified in the definition object and delete it from the object as it will not
	        // be part of the animate element attributes.
	        if(animationDefinition.easing) {
	          // If already an easing Bézier curve array we take it or we lookup a easing array in the Easing object
	          easing = animationDefinition.easing instanceof Array ?
	            animationDefinition.easing :
	            Chartist.Svg.Easing[animationDefinition.easing];
	          delete animationDefinition.easing;
	        }
	
	        // If numeric dur or begin was provided we assume milli seconds
	        animationDefinition.begin = Chartist.ensureUnit(animationDefinition.begin, 'ms');
	        animationDefinition.dur = Chartist.ensureUnit(animationDefinition.dur, 'ms');
	
	        if(easing) {
	          animationDefinition.calcMode = 'spline';
	          animationDefinition.keySplines = easing.join(' ');
	          animationDefinition.keyTimes = '0;1';
	        }
	
	        // Adding "fill: freeze" if we are in guided mode and set initial attribute values
	        if(guided) {
	          animationDefinition.fill = 'freeze';
	          // Animated property on our element should already be set to the animation from value in guided mode
	          attributeProperties[attribute] = animationDefinition.from;
	          this.attr(attributeProperties);
	
	          // In guided mode we also set begin to indefinite so we can trigger the start manually and put the begin
	          // which needs to be in ms aside
	          timeout = Chartist.quantity(animationDefinition.begin || 0).value;
	          animationDefinition.begin = 'indefinite';
	        }
	
	        animate = this.elem('animate', Chartist.extend({
	          attributeName: attribute
	        }, animationDefinition));
	
	        if(guided) {
	          // If guided we take the value that was put aside in timeout and trigger the animation manually with a timeout
	          setTimeout(function() {
	            // If beginElement fails we set the animated attribute to the end position and remove the animate element
	            // This happens if the SMIL ElementTimeControl interface is not supported or any other problems occured in
	            // the browser. (Currently FF 34 does not support animate elements in foreignObjects)
	            try {
	              animate._node.beginElement();
	            } catch(err) {
	              // Set animated attribute to current animated value
	              attributeProperties[attribute] = animationDefinition.to;
	              this.attr(attributeProperties);
	              // Remove the animate element as it's no longer required
	              animate.remove();
	            }
	          }.bind(this), timeout);
	        }
	
	        if(eventEmitter) {
	          animate._node.addEventListener('beginEvent', function handleBeginEvent() {
	            eventEmitter.emit('animationBegin', {
	              element: this,
	              animate: animate._node,
	              params: animationDefinition
	            });
	          }.bind(this));
	        }
	
	        animate._node.addEventListener('endEvent', function handleEndEvent() {
	          if(eventEmitter) {
	            eventEmitter.emit('animationEnd', {
	              element: this,
	              animate: animate._node,
	              params: animationDefinition
	            });
	          }
	
	          if(guided) {
	            // Set animated attribute to current animated value
	            attributeProperties[attribute] = animationDefinition.to;
	            this.attr(attributeProperties);
	            // Remove the animate element as it's no longer required
	            animate.remove();
	          }
	        }.bind(this));
	      }
	
	      // If current attribute is an array of definition objects we create an animate for each and disable guided mode
	      if(animations[attribute] instanceof Array) {
	        animations[attribute].forEach(function(animationDefinition) {
	          createAnimate.bind(this)(animationDefinition, false);
	        }.bind(this));
	      } else {
	        createAnimate.bind(this)(animations[attribute], guided);
	      }
	
	    }.bind(this));
	
	    return this;
	  }
	
	  Chartist.Svg = Chartist.Class.extend({
	    constructor: Svg,
	    attr: attr,
	    elem: elem,
	    parent: parent,
	    root: root,
	    querySelector: querySelector,
	    querySelectorAll: querySelectorAll,
	    foreignObject: foreignObject,
	    text: text,
	    empty: empty,
	    remove: remove,
	    replace: replace,
	    append: append,
	    classes: classes,
	    addClass: addClass,
	    removeClass: removeClass,
	    removeAllClasses: removeAllClasses,
	    height: height,
	    width: width,
	    animate: animate
	  });
	
	  /**
	   * This method checks for support of a given SVG feature like Extensibility, SVG-animation or the like. Check http://www.w3.org/TR/SVG11/feature for a detailed list.
	   *
	   * @memberof Chartist.Svg
	   * @param {String} feature The SVG 1.1 feature that should be checked for support.
	   * @return {Boolean} True of false if the feature is supported or not
	   */
	  Chartist.Svg.isSupported = function(feature) {
	    return document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#' + feature, '1.1');
	  };
	
	  /**
	   * This Object contains some standard easing cubic bezier curves. Then can be used with their name in the `Chartist.Svg.animate`. You can also extend the list and use your own name in the `animate` function. Click the show code button to see the available bezier functions.
	   *
	   * @memberof Chartist.Svg
	   */
	  var easingCubicBeziers = {
	    easeInSine: [0.47, 0, 0.745, 0.715],
	    easeOutSine: [0.39, 0.575, 0.565, 1],
	    easeInOutSine: [0.445, 0.05, 0.55, 0.95],
	    easeInQuad: [0.55, 0.085, 0.68, 0.53],
	    easeOutQuad: [0.25, 0.46, 0.45, 0.94],
	    easeInOutQuad: [0.455, 0.03, 0.515, 0.955],
	    easeInCubic: [0.55, 0.055, 0.675, 0.19],
	    easeOutCubic: [0.215, 0.61, 0.355, 1],
	    easeInOutCubic: [0.645, 0.045, 0.355, 1],
	    easeInQuart: [0.895, 0.03, 0.685, 0.22],
	    easeOutQuart: [0.165, 0.84, 0.44, 1],
	    easeInOutQuart: [0.77, 0, 0.175, 1],
	    easeInQuint: [0.755, 0.05, 0.855, 0.06],
	    easeOutQuint: [0.23, 1, 0.32, 1],
	    easeInOutQuint: [0.86, 0, 0.07, 1],
	    easeInExpo: [0.95, 0.05, 0.795, 0.035],
	    easeOutExpo: [0.19, 1, 0.22, 1],
	    easeInOutExpo: [1, 0, 0, 1],
	    easeInCirc: [0.6, 0.04, 0.98, 0.335],
	    easeOutCirc: [0.075, 0.82, 0.165, 1],
	    easeInOutCirc: [0.785, 0.135, 0.15, 0.86],
	    easeInBack: [0.6, -0.28, 0.735, 0.045],
	    easeOutBack: [0.175, 0.885, 0.32, 1.275],
	    easeInOutBack: [0.68, -0.55, 0.265, 1.55]
	  };
	
	  Chartist.Svg.Easing = easingCubicBeziers;
	
	  /**
	   * This helper class is to wrap multiple `Chartist.Svg` elements into a list where you can call the `Chartist.Svg` functions on all elements in the list with one call. This is helpful when you'd like to perform calls with `Chartist.Svg` on multiple elements.
	   * An instance of this class is also returned by `Chartist.Svg.querySelectorAll`.
	   *
	   * @memberof Chartist.Svg
	   * @param {Array<Node>|NodeList} nodeList An Array of SVG DOM nodes or a SVG DOM NodeList (as returned by document.querySelectorAll)
	   * @constructor
	   */
	  function SvgList(nodeList) {
	    var list = this;
	
	    this.svgElements = [];
	    for(var i = 0; i < nodeList.length; i++) {
	      this.svgElements.push(new Chartist.Svg(nodeList[i]));
	    }
	
	    // Add delegation methods for Chartist.Svg
	    Object.keys(Chartist.Svg.prototype).filter(function(prototypeProperty) {
	      return ['constructor',
	          'parent',
	          'querySelector',
	          'querySelectorAll',
	          'replace',
	          'append',
	          'classes',
	          'height',
	          'width'].indexOf(prototypeProperty) === -1;
	    }).forEach(function(prototypeProperty) {
	      list[prototypeProperty] = function() {
	        var args = Array.prototype.slice.call(arguments, 0);
	        list.svgElements.forEach(function(element) {
	          Chartist.Svg.prototype[prototypeProperty].apply(element, args);
	        });
	        return list;
	      };
	    });
	  }
	
	  Chartist.Svg.List = Chartist.Class.extend({
	    constructor: SvgList
	  });
	}(window, document, Chartist));
	;/**
	 * Chartist SVG path module for SVG path description creation and modification.
	 *
	 * @module Chartist.Svg.Path
	 */
	/* global Chartist */
	(function(window, document, Chartist) {
	  'use strict';
	
	  /**
	   * Contains the descriptors of supported element types in a SVG path. Currently only move, line and curve are supported.
	   *
	   * @memberof Chartist.Svg.Path
	   * @type {Object}
	   */
	  var elementDescriptions = {
	    m: ['x', 'y'],
	    l: ['x', 'y'],
	    c: ['x1', 'y1', 'x2', 'y2', 'x', 'y'],
	    a: ['rx', 'ry', 'xAr', 'lAf', 'sf', 'x', 'y']
	  };
	
	  /**
	   * Default options for newly created SVG path objects.
	   *
	   * @memberof Chartist.Svg.Path
	   * @type {Object}
	   */
	  var defaultOptions = {
	    // The accuracy in digit count after the decimal point. This will be used to round numbers in the SVG path. If this option is set to false then no rounding will be performed.
	    accuracy: 3
	  };
	
	  function element(command, params, pathElements, pos, relative, data) {
	    var pathElement = Chartist.extend({
	      command: relative ? command.toLowerCase() : command.toUpperCase()
	    }, params, data ? { data: data } : {} );
	
	    pathElements.splice(pos, 0, pathElement);
	  }
	
	  function forEachParam(pathElements, cb) {
	    pathElements.forEach(function(pathElement, pathElementIndex) {
	      elementDescriptions[pathElement.command.toLowerCase()].forEach(function(paramName, paramIndex) {
	        cb(pathElement, paramName, pathElementIndex, paramIndex, pathElements);
	      });
	    });
	  }
	
	  /**
	   * Used to construct a new path object.
	   *
	   * @memberof Chartist.Svg.Path
	   * @param {Boolean} close If set to true then this path will be closed when stringified (with a Z at the end)
	   * @param {Object} options Options object that overrides the default objects. See default options for more details.
	   * @constructor
	   */
	  function SvgPath(close, options) {
	    this.pathElements = [];
	    this.pos = 0;
	    this.close = close;
	    this.options = Chartist.extend({}, defaultOptions, options);
	  }
	
	  /**
	   * Gets or sets the current position (cursor) inside of the path. You can move around the cursor freely but limited to 0 or the count of existing elements. All modifications with element functions will insert new elements at the position of this cursor.
	   *
	   * @memberof Chartist.Svg.Path
	   * @param {Number} [pos] If a number is passed then the cursor is set to this position in the path element array.
	   * @return {Chartist.Svg.Path|Number} If the position parameter was passed then the return value will be the path object for easy call chaining. If no position parameter was passed then the current position is returned.
	   */
	  function position(pos) {
	    if(pos !== undefined) {
	      this.pos = Math.max(0, Math.min(this.pathElements.length, pos));
	      return this;
	    } else {
	      return this.pos;
	    }
	  }
	
	  /**
	   * Removes elements from the path starting at the current position.
	   *
	   * @memberof Chartist.Svg.Path
	   * @param {Number} count Number of path elements that should be removed from the current position.
	   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
	   */
	  function remove(count) {
	    this.pathElements.splice(this.pos, count);
	    return this;
	  }
	
	  /**
	   * Use this function to add a new move SVG path element.
	   *
	   * @memberof Chartist.Svg.Path
	   * @param {Number} x The x coordinate for the move element.
	   * @param {Number} y The y coordinate for the move element.
	   * @param {Boolean} [relative] If set to true the move element will be created with relative coordinates (lowercase letter)
	   * @param {*} [data] Any data that should be stored with the element object that will be accessible in pathElement
	   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
	   */
	  function move(x, y, relative, data) {
	    element('M', {
	      x: +x,
	      y: +y
	    }, this.pathElements, this.pos++, relative, data);
	    return this;
	  }
	
	  /**
	   * Use this function to add a new line SVG path element.
	   *
	   * @memberof Chartist.Svg.Path
	   * @param {Number} x The x coordinate for the line element.
	   * @param {Number} y The y coordinate for the line element.
	   * @param {Boolean} [relative] If set to true the line element will be created with relative coordinates (lowercase letter)
	   * @param {*} [data] Any data that should be stored with the element object that will be accessible in pathElement
	   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
	   */
	  function line(x, y, relative, data) {
	    element('L', {
	      x: +x,
	      y: +y
	    }, this.pathElements, this.pos++, relative, data);
	    return this;
	  }
	
	  /**
	   * Use this function to add a new curve SVG path element.
	   *
	   * @memberof Chartist.Svg.Path
	   * @param {Number} x1 The x coordinate for the first control point of the bezier curve.
	   * @param {Number} y1 The y coordinate for the first control point of the bezier curve.
	   * @param {Number} x2 The x coordinate for the second control point of the bezier curve.
	   * @param {Number} y2 The y coordinate for the second control point of the bezier curve.
	   * @param {Number} x The x coordinate for the target point of the curve element.
	   * @param {Number} y The y coordinate for the target point of the curve element.
	   * @param {Boolean} [relative] If set to true the curve element will be created with relative coordinates (lowercase letter)
	   * @param {*} [data] Any data that should be stored with the element object that will be accessible in pathElement
	   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
	   */
	  function curve(x1, y1, x2, y2, x, y, relative, data) {
	    element('C', {
	      x1: +x1,
	      y1: +y1,
	      x2: +x2,
	      y2: +y2,
	      x: +x,
	      y: +y
	    }, this.pathElements, this.pos++, relative, data);
	    return this;
	  }
	
	  /**
	   * Use this function to add a new non-bezier curve SVG path element.
	   *
	   * @memberof Chartist.Svg.Path
	   * @param {Number} rx The radius to be used for the x-axis of the arc.
	   * @param {Number} ry The radius to be used for the y-axis of the arc.
	   * @param {Number} xAr Defines the orientation of the arc
	   * @param {Number} lAf Large arc flag
	   * @param {Number} sf Sweep flag
	   * @param {Number} x The x coordinate for the target point of the curve element.
	   * @param {Number} y The y coordinate for the target point of the curve element.
	   * @param {Boolean} [relative] If set to true the curve element will be created with relative coordinates (lowercase letter)
	   * @param {*} [data] Any data that should be stored with the element object that will be accessible in pathElement
	   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
	   */
	  function arc(rx, ry, xAr, lAf, sf, x, y, relative, data) {
	    element('A', {
	      rx: +rx,
	      ry: +ry,
	      xAr: +xAr,
	      lAf: +lAf,
	      sf: +sf,
	      x: +x,
	      y: +y
	    }, this.pathElements, this.pos++, relative, data);
	    return this;
	  }
	
	  /**
	   * Parses an SVG path seen in the d attribute of path elements, and inserts the parsed elements into the existing path object at the current cursor position. Any closing path indicators (Z at the end of the path) will be ignored by the parser as this is provided by the close option in the options of the path object.
	   *
	   * @memberof Chartist.Svg.Path
	   * @param {String} path Any SVG path that contains move (m), line (l) or curve (c) components.
	   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
	   */
	  function parse(path) {
	    // Parsing the SVG path string into an array of arrays [['M', '10', '10'], ['L', '100', '100']]
	    var chunks = path.replace(/([A-Za-z])([0-9])/g, '$1 $2')
	      .replace(/([0-9])([A-Za-z])/g, '$1 $2')
	      .split(/[\s,]+/)
	      .reduce(function(result, element) {
	        if(element.match(/[A-Za-z]/)) {
	          result.push([]);
	        }
	
	        result[result.length - 1].push(element);
	        return result;
	      }, []);
	
	    // If this is a closed path we remove the Z at the end because this is determined by the close option
	    if(chunks[chunks.length - 1][0].toUpperCase() === 'Z') {
	      chunks.pop();
	    }
	
	    // Using svgPathElementDescriptions to map raw path arrays into objects that contain the command and the parameters
	    // For example {command: 'M', x: '10', y: '10'}
	    var elements = chunks.map(function(chunk) {
	        var command = chunk.shift(),
	          description = elementDescriptions[command.toLowerCase()];
	
	        return Chartist.extend({
	          command: command
	        }, description.reduce(function(result, paramName, index) {
	          result[paramName] = +chunk[index];
	          return result;
	        }, {}));
	      });
	
	    // Preparing a splice call with the elements array as var arg params and insert the parsed elements at the current position
	    var spliceArgs = [this.pos, 0];
	    Array.prototype.push.apply(spliceArgs, elements);
	    Array.prototype.splice.apply(this.pathElements, spliceArgs);
	    // Increase the internal position by the element count
	    this.pos += elements.length;
	
	    return this;
	  }
	
	  /**
	   * This function renders to current SVG path object into a final SVG string that can be used in the d attribute of SVG path elements. It uses the accuracy option to round big decimals. If the close parameter was set in the constructor of this path object then a path closing Z will be appended to the output string.
	   *
	   * @memberof Chartist.Svg.Path
	   * @return {String}
	   */
	  function stringify() {
	    var accuracyMultiplier = Math.pow(10, this.options.accuracy);
	
	    return this.pathElements.reduce(function(path, pathElement) {
	        var params = elementDescriptions[pathElement.command.toLowerCase()].map(function(paramName) {
	          return this.options.accuracy ?
	            (Math.round(pathElement[paramName] * accuracyMultiplier) / accuracyMultiplier) :
	            pathElement[paramName];
	        }.bind(this));
	
	        return path + pathElement.command + params.join(',');
	      }.bind(this), '') + (this.close ? 'Z' : '');
	  }
	
	  /**
	   * Scales all elements in the current SVG path object. There is an individual parameter for each coordinate. Scaling will also be done for control points of curves, affecting the given coordinate.
	   *
	   * @memberof Chartist.Svg.Path
	   * @param {Number} x The number which will be used to scale the x, x1 and x2 of all path elements.
	   * @param {Number} y The number which will be used to scale the y, y1 and y2 of all path elements.
	   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
	   */
	  function scale(x, y) {
	    forEachParam(this.pathElements, function(pathElement, paramName) {
	      pathElement[paramName] *= paramName[0] === 'x' ? x : y;
	    });
	    return this;
	  }
	
	  /**
	   * Translates all elements in the current SVG path object. The translation is relative and there is an individual parameter for each coordinate. Translation will also be done for control points of curves, affecting the given coordinate.
	   *
	   * @memberof Chartist.Svg.Path
	   * @param {Number} x The number which will be used to translate the x, x1 and x2 of all path elements.
	   * @param {Number} y The number which will be used to translate the y, y1 and y2 of all path elements.
	   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
	   */
	  function translate(x, y) {
	    forEachParam(this.pathElements, function(pathElement, paramName) {
	      pathElement[paramName] += paramName[0] === 'x' ? x : y;
	    });
	    return this;
	  }
	
	  /**
	   * This function will run over all existing path elements and then loop over their attributes. The callback function will be called for every path element attribute that exists in the current path.
	   * The method signature of the callback function looks like this:
	   * ```javascript
	   * function(pathElement, paramName, pathElementIndex, paramIndex, pathElements)
	   * ```
	   * If something else than undefined is returned by the callback function, this value will be used to replace the old value. This allows you to build custom transformations of path objects that can't be achieved using the basic transformation functions scale and translate.
	   *
	   * @memberof Chartist.Svg.Path
	   * @param {Function} transformFnc The callback function for the transformation. Check the signature in the function description.
	   * @return {Chartist.Svg.Path} The current path object for easy call chaining.
	   */
	  function transform(transformFnc) {
	    forEachParam(this.pathElements, function(pathElement, paramName, pathElementIndex, paramIndex, pathElements) {
	      var transformed = transformFnc(pathElement, paramName, pathElementIndex, paramIndex, pathElements);
	      if(transformed || transformed === 0) {
	        pathElement[paramName] = transformed;
	      }
	    });
	    return this;
	  }
	
	  /**
	   * This function clones a whole path object with all its properties. This is a deep clone and path element objects will also be cloned.
	   *
	   * @memberof Chartist.Svg.Path
	   * @param {Boolean} [close] Optional option to set the new cloned path to closed. If not specified or false, the original path close option will be used.
	   * @return {Chartist.Svg.Path}
	   */
	  function clone(close) {
	    var c = new Chartist.Svg.Path(close || this.close);
	    c.pos = this.pos;
	    c.pathElements = this.pathElements.slice().map(function cloneElements(pathElement) {
	      return Chartist.extend({}, pathElement);
	    });
	    c.options = Chartist.extend({}, this.options);
	    return c;
	  }
	
	  /**
	   * Split a Svg.Path object by a specific command in the path chain. The path chain will be split and an array of newly created paths objects will be returned. This is useful if you'd like to split an SVG path by it's move commands, for example, in order to isolate chunks of drawings.
	   *
	   * @memberof Chartist.Svg.Path
	   * @param {String} command The command you'd like to use to split the path
	   * @return {Array<Chartist.Svg.Path>}
	   */
	  function splitByCommand(command) {
	    var split = [
	      new Chartist.Svg.Path()
	    ];
	
	    this.pathElements.forEach(function(pathElement) {
	      if(pathElement.command === command.toUpperCase() && split[split.length - 1].pathElements.length !== 0) {
	        split.push(new Chartist.Svg.Path());
	      }
	
	      split[split.length - 1].pathElements.push(pathElement);
	    });
	
	    return split;
	  }
	
	  /**
	   * This static function on `Chartist.Svg.Path` is joining multiple paths together into one paths.
	   *
	   * @memberof Chartist.Svg.Path
	   * @param {Array<Chartist.Svg.Path>} paths A list of paths to be joined together. The order is important.
	   * @param {boolean} close If the newly created path should be a closed path
	   * @param {Object} options Path options for the newly created path.
	   * @return {Chartist.Svg.Path}
	   */
	
	  function join(paths, close, options) {
	    var joinedPath = new Chartist.Svg.Path(close, options);
	    for(var i = 0; i < paths.length; i++) {
	      var path = paths[i];
	      for(var j = 0; j < path.pathElements.length; j++) {
	        joinedPath.pathElements.push(path.pathElements[j]);
	      }
	    }
	    return joinedPath;
	  }
	
	  Chartist.Svg.Path = Chartist.Class.extend({
	    constructor: SvgPath,
	    position: position,
	    remove: remove,
	    move: move,
	    line: line,
	    curve: curve,
	    arc: arc,
	    scale: scale,
	    translate: translate,
	    transform: transform,
	    parse: parse,
	    stringify: stringify,
	    clone: clone,
	    splitByCommand: splitByCommand
	  });
	
	  Chartist.Svg.Path.elementDescriptions = elementDescriptions;
	  Chartist.Svg.Path.join = join;
	}(window, document, Chartist));
	;/* global Chartist */
	(function (window, document, Chartist) {
	  'use strict';
	
	  var axisUnits = {
	    x: {
	      pos: 'x',
	      len: 'width',
	      dir: 'horizontal',
	      rectStart: 'x1',
	      rectEnd: 'x2',
	      rectOffset: 'y2'
	    },
	    y: {
	      pos: 'y',
	      len: 'height',
	      dir: 'vertical',
	      rectStart: 'y2',
	      rectEnd: 'y1',
	      rectOffset: 'x1'
	    }
	  };
	
	  function Axis(units, chartRect, ticks, options) {
	    this.units = units;
	    this.counterUnits = units === axisUnits.x ? axisUnits.y : axisUnits.x;
	    this.chartRect = chartRect;
	    this.axisLength = chartRect[units.rectEnd] - chartRect[units.rectStart];
	    this.gridOffset = chartRect[units.rectOffset];
	    this.ticks = ticks;
	    this.options = options;
	  }
	
	  function createGridAndLabels(gridGroup, labelGroup, useForeignObject, chartOptions, eventEmitter) {
	    var axisOptions = chartOptions['axis' + this.units.pos.toUpperCase()];
	    var projectedValues = this.ticks.map(this.projectValue.bind(this));
	    var labelValues = this.ticks.map(axisOptions.labelInterpolationFnc);
	
	    projectedValues.forEach(function(projectedValue, index) {
	      var labelOffset = {
	        x: 0,
	        y: 0
	      };
	
	      // TODO: Find better solution for solving this problem
	      // Calculate how much space we have available for the label
	      var labelLength;
	      if(projectedValues[index + 1]) {
	        // If we still have one label ahead, we can calculate the distance to the next tick / label
	        labelLength = projectedValues[index + 1] - projectedValue;
	      } else {
	        // If we don't have a label ahead and we have only two labels in total, we just take the remaining distance to
	        // on the whole axis length. We limit that to a minimum of 30 pixel, so that labels close to the border will
	        // still be visible inside of the chart padding.
	        labelLength = Math.max(this.axisLength - projectedValue, 30);
	      }
	
	      // Skip grid lines and labels where interpolated label values are falsey (execpt for 0)
	      if(!labelValues[index] && labelValues[index] !== 0) {
	        return;
	      }
	
	      // Transform to global coordinates using the chartRect
	      // We also need to set the label offset for the createLabel function
	      if(this.units.pos === 'x') {
	        projectedValue = this.chartRect.x1 + projectedValue;
	        labelOffset.x = chartOptions.axisX.labelOffset.x;
	
	        // If the labels should be positioned in start position (top side for vertical axis) we need to set a
	        // different offset as for positioned with end (bottom)
	        if(chartOptions.axisX.position === 'start') {
	          labelOffset.y = this.chartRect.padding.top + chartOptions.axisX.labelOffset.y + (useForeignObject ? 5 : 20);
	        } else {
	          labelOffset.y = this.chartRect.y1 + chartOptions.axisX.labelOffset.y + (useForeignObject ? 5 : 20);
	        }
	      } else {
	        projectedValue = this.chartRect.y1 - projectedValue;
	        labelOffset.y = chartOptions.axisY.labelOffset.y - (useForeignObject ? labelLength : 0);
	
	        // If the labels should be positioned in start position (left side for horizontal axis) we need to set a
	        // different offset as for positioned with end (right side)
	        if(chartOptions.axisY.position === 'start') {
	          labelOffset.x = useForeignObject ? this.chartRect.padding.left + chartOptions.axisY.labelOffset.x : this.chartRect.x1 - 10;
	        } else {
	          labelOffset.x = this.chartRect.x2 + chartOptions.axisY.labelOffset.x + 10;
	        }
	      }
	
	      if(axisOptions.showGrid) {
	        Chartist.createGrid(projectedValue, index, this, this.gridOffset, this.chartRect[this.counterUnits.len](), gridGroup, [
	          chartOptions.classNames.grid,
	          chartOptions.classNames[this.units.dir]
	        ], eventEmitter);
	      }
	
	      if(axisOptions.showLabel) {
	        Chartist.createLabel(projectedValue, labelLength, index, labelValues, this, axisOptions.offset, labelOffset, labelGroup, [
	          chartOptions.classNames.label,
	          chartOptions.classNames[this.units.dir],
	          chartOptions.classNames[axisOptions.position]
	        ], useForeignObject, eventEmitter);
	      }
	    }.bind(this));
	  }
	
	  Chartist.Axis = Chartist.Class.extend({
	    constructor: Axis,
	    createGridAndLabels: createGridAndLabels,
	    projectValue: function(value, index, data) {
	      throw new Error('Base axis can\'t be instantiated!');
	    }
	  });
	
	  Chartist.Axis.units = axisUnits;
	
	}(window, document, Chartist));
	;/**
	 * The auto scale axis uses standard linear scale projection of values along an axis. It uses order of magnitude to find a scale automatically and evaluates the available space in order to find the perfect amount of ticks for your chart.
	 * **Options**
	 * The following options are used by this axis in addition to the default axis options outlined in the axis configuration of the chart default settings.
	 * ```javascript
	 * var options = {
	 *   // If high is specified then the axis will display values explicitly up to this value and the computed maximum from the data is ignored
	 *   high: 100,
	 *   // If low is specified then the axis will display values explicitly down to this value and the computed minimum from the data is ignored
	 *   low: 0,
	 *   // This option will be used when finding the right scale division settings. The amount of ticks on the scale will be determined so that as many ticks as possible will be displayed, while not violating this minimum required space (in pixel).
	 *   scaleMinSpace: 20,
	 *   // Can be set to true or false. If set to true, the scale will be generated with whole numbers only.
	 *   onlyInteger: true,
	 *   // The reference value can be used to make sure that this value will always be on the chart. This is especially useful on bipolar charts where the bipolar center always needs to be part of the chart.
	 *   referenceValue: 5
	 * };
	 * ```
	 *
	 * @module Chartist.AutoScaleAxis
	 */
	/* global Chartist */
	(function (window, document, Chartist) {
	  'use strict';
	
	  function AutoScaleAxis(axisUnit, data, chartRect, options) {
	    // Usually we calculate highLow based on the data but this can be overriden by a highLow object in the options
	    var highLow = options.highLow || Chartist.getHighLow(data.normalized, options, axisUnit.pos);
	    this.bounds = Chartist.getBounds(chartRect[axisUnit.rectEnd] - chartRect[axisUnit.rectStart], highLow, options.scaleMinSpace || 20, options.onlyInteger);
	    this.range = {
	      min: this.bounds.min,
	      max: this.bounds.max
	    };
	
	    Chartist.AutoScaleAxis.super.constructor.call(this,
	      axisUnit,
	      chartRect,
	      this.bounds.values,
	      options);
	  }
	
	  function projectValue(value) {
	    return this.axisLength * (+Chartist.getMultiValue(value, this.units.pos) - this.bounds.min) / this.bounds.range;
	  }
	
	  Chartist.AutoScaleAxis = Chartist.Axis.extend({
	    constructor: AutoScaleAxis,
	    projectValue: projectValue
	  });
	
	}(window, document, Chartist));
	;/**
	 * The fixed scale axis uses standard linear projection of values along an axis. It makes use of a divisor option to divide the range provided from the minimum and maximum value or the options high and low that will override the computed minimum and maximum.
	 * **Options**
	 * The following options are used by this axis in addition to the default axis options outlined in the axis configuration of the chart default settings.
	 * ```javascript
	 * var options = {
	 *   // If high is specified then the axis will display values explicitly up to this value and the computed maximum from the data is ignored
	 *   high: 100,
	 *   // If low is specified then the axis will display values explicitly down to this value and the computed minimum from the data is ignored
	 *   low: 0,
	 *   // If specified then the value range determined from minimum to maximum (or low and high) will be divided by this number and ticks will be generated at those division points. The default divisor is 1.
	 *   divisor: 4,
	 *   // If ticks is explicitly set, then the axis will not compute the ticks with the divisor, but directly use the data in ticks to determine at what points on the axis a tick need to be generated.
	 *   ticks: [1, 10, 20, 30]
	 * };
	 * ```
	 *
	 * @module Chartist.FixedScaleAxis
	 */
	/* global Chartist */
	(function (window, document, Chartist) {
	  'use strict';
	
	  function FixedScaleAxis(axisUnit, data, chartRect, options) {
	    var highLow = options.highLow || Chartist.getHighLow(data.normalized, options, axisUnit.pos);
	    this.divisor = options.divisor || 1;
	    this.ticks = options.ticks || Chartist.times(this.divisor).map(function(value, index) {
	      return highLow.low + (highLow.high - highLow.low) / this.divisor * index;
	    }.bind(this));
	    this.ticks.sort(function(a, b) {
	      return a - b;
	    });
	    this.range = {
	      min: highLow.low,
	      max: highLow.high
	    };
	
	    Chartist.FixedScaleAxis.super.constructor.call(this,
	      axisUnit,
	      chartRect,
	      this.ticks,
	      options);
	
	    this.stepLength = this.axisLength / this.divisor;
	  }
	
	  function projectValue(value) {
	    return this.axisLength * (+Chartist.getMultiValue(value, this.units.pos) - this.range.min) / (this.range.max - this.range.min);
	  }
	
	  Chartist.FixedScaleAxis = Chartist.Axis.extend({
	    constructor: FixedScaleAxis,
	    projectValue: projectValue
	  });
	
	}(window, document, Chartist));
	;/**
	 * The step axis for step based charts like bar chart or step based line charts. It uses a fixed amount of ticks that will be equally distributed across the whole axis length. The projection is done using the index of the data value rather than the value itself and therefore it's only useful for distribution purpose.
	 * **Options**
	 * The following options are used by this axis in addition to the default axis options outlined in the axis configuration of the chart default settings.
	 * ```javascript
	 * var options = {
	 *   // Ticks to be used to distribute across the axis length. As this axis type relies on the index of the value rather than the value, arbitrary data that can be converted to a string can be used as ticks.
	 *   ticks: ['One', 'Two', 'Three'],
	 *   // If set to true the full width will be used to distribute the values where the last value will be at the maximum of the axis length. If false the spaces between the ticks will be evenly distributed instead.
	 *   stretch: true
	 * };
	 * ```
	 *
	 * @module Chartist.StepAxis
	 */
	/* global Chartist */
	(function (window, document, Chartist) {
	  'use strict';
	
	  function StepAxis(axisUnit, data, chartRect, options) {
	    Chartist.StepAxis.super.constructor.call(this,
	      axisUnit,
	      chartRect,
	      options.ticks,
	      options);
	
	    this.stepLength = this.axisLength / (options.ticks.length - (options.stretch ? 1 : 0));
	  }
	
	  function projectValue(value, index) {
	    return this.stepLength * index;
	  }
	
	  Chartist.StepAxis = Chartist.Axis.extend({
	    constructor: StepAxis,
	    projectValue: projectValue
	  });
	
	}(window, document, Chartist));
	;/**
	 * The Chartist line chart can be used to draw Line or Scatter charts. If used in the browser you can access the global `Chartist` namespace where you find the `Line` function as a main entry point.
	 *
	 * For examples on how to use the line chart please check the examples of the `Chartist.Line` method.
	 *
	 * @module Chartist.Line
	 */
	/* global Chartist */
	(function(window, document, Chartist){
	  'use strict';
	
	  /**
	   * Default options in line charts. Expand the code view to see a detailed list of options with comments.
	   *
	   * @memberof Chartist.Line
	   */
	  var defaultOptions = {
	    // Options for X-Axis
	    axisX: {
	      // The offset of the labels to the chart area
	      offset: 30,
	      // Position where labels are placed. Can be set to `start` or `end` where `start` is equivalent to left or top on vertical axis and `end` is equivalent to right or bottom on horizontal axis.
	      position: 'end',
	      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
	      labelOffset: {
	        x: 0,
	        y: 0
	      },
	      // If labels should be shown or not
	      showLabel: true,
	      // If the axis grid should be drawn or not
	      showGrid: true,
	      // Interpolation function that allows you to intercept the value from the axis label
	      labelInterpolationFnc: Chartist.noop,
	      // Set the axis type to be used to project values on this axis. If not defined, Chartist.StepAxis will be used for the X-Axis, where the ticks option will be set to the labels in the data and the stretch option will be set to the global fullWidth option. This type can be changed to any axis constructor available (e.g. Chartist.FixedScaleAxis), where all axis options should be present here.
	      type: undefined
	    },
	    // Options for Y-Axis
	    axisY: {
	      // The offset of the labels to the chart area
	      offset: 40,
	      // Position where labels are placed. Can be set to `start` or `end` where `start` is equivalent to left or top on vertical axis and `end` is equivalent to right or bottom on horizontal axis.
	      position: 'start',
	      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
	      labelOffset: {
	        x: 0,
	        y: 0
	      },
	      // If labels should be shown or not
	      showLabel: true,
	      // If the axis grid should be drawn or not
	      showGrid: true,
	      // Interpolation function that allows you to intercept the value from the axis label
	      labelInterpolationFnc: Chartist.noop,
	      // Set the axis type to be used to project values on this axis. If not defined, Chartist.AutoScaleAxis will be used for the Y-Axis, where the high and low options will be set to the global high and low options. This type can be changed to any axis constructor available (e.g. Chartist.FixedScaleAxis), where all axis options should be present here.
	      type: undefined,
	      // This value specifies the minimum height in pixel of the scale steps
	      scaleMinSpace: 20,
	      // Use only integer values (whole numbers) for the scale steps
	      onlyInteger: false
	    },
	    // Specify a fixed width for the chart as a string (i.e. '100px' or '50%')
	    width: undefined,
	    // Specify a fixed height for the chart as a string (i.e. '100px' or '50%')
	    height: undefined,
	    // If the line should be drawn or not
	    showLine: true,
	    // If dots should be drawn or not
	    showPoint: true,
	    // If the line chart should draw an area
	    showArea: false,
	    // The base for the area chart that will be used to close the area shape (is normally 0)
	    areaBase: 0,
	    // Specify if the lines should be smoothed. This value can be true or false where true will result in smoothing using the default smoothing interpolation function Chartist.Interpolation.cardinal and false results in Chartist.Interpolation.none. You can also choose other smoothing / interpolation functions available in the Chartist.Interpolation module, or write your own interpolation function. Check the examples for a brief description.
	    lineSmooth: true,
	    // Overriding the natural low of the chart allows you to zoom in or limit the charts lowest displayed value
	    low: undefined,
	    // Overriding the natural high of the chart allows you to zoom in or limit the charts highest displayed value
	    high: undefined,
	    // Padding of the chart drawing area to the container element and labels as a number or padding object {top: 5, right: 5, bottom: 5, left: 5}
	    chartPadding: {
	      top: 15,
	      right: 15,
	      bottom: 5,
	      left: 10
	    },
	    // When set to true, the last grid line on the x-axis is not drawn and the chart elements will expand to the full available width of the chart. For the last label to be drawn correctly you might need to add chart padding or offset the last label with a draw event handler.
	    fullWidth: false,
	    // If true the whole data is reversed including labels, the series order as well as the whole series data arrays.
	    reverseData: false,
	    // Override the class names that get used to generate the SVG structure of the chart
	    classNames: {
	      chart: 'ct-chart-line',
	      label: 'ct-label',
	      labelGroup: 'ct-labels',
	      series: 'ct-series',
	      line: 'ct-line',
	      point: 'ct-point',
	      area: 'ct-area',
	      grid: 'ct-grid',
	      gridGroup: 'ct-grids',
	      vertical: 'ct-vertical',
	      horizontal: 'ct-horizontal',
	      start: 'ct-start',
	      end: 'ct-end'
	    }
	  };
	
	  /**
	   * Creates a new chart
	   *
	   */
	  function createChart(options) {
	    var data = {
	      raw: this.data,
	      normalized: Chartist.getDataArray(this.data, options.reverseData, true)
	    };
	
	    // Create new svg object
	    this.svg = Chartist.createSvg(this.container, options.width, options.height, options.classNames.chart);
	    // Create groups for labels, grid and series
	    var gridGroup = this.svg.elem('g').addClass(options.classNames.gridGroup);
	    var seriesGroup = this.svg.elem('g');
	    var labelGroup = this.svg.elem('g').addClass(options.classNames.labelGroup);
	
	    var chartRect = Chartist.createChartRect(this.svg, options, defaultOptions.padding);
	    var axisX, axisY;
	
	    if(options.axisX.type === undefined) {
	      axisX = new Chartist.StepAxis(Chartist.Axis.units.x, data, chartRect, Chartist.extend({}, options.axisX, {
	        ticks: data.raw.labels,
	        stretch: options.fullWidth
	      }));
	    } else {
	      axisX = options.axisX.type.call(Chartist, Chartist.Axis.units.x, data, chartRect, options.axisX);
	    }
	
	    if(options.axisY.type === undefined) {
	      axisY = new Chartist.AutoScaleAxis(Chartist.Axis.units.y, data, chartRect, Chartist.extend({}, options.axisY, {
	        high: Chartist.isNum(options.high) ? options.high : options.axisY.high,
	        low: Chartist.isNum(options.low) ? options.low : options.axisY.low
	      }));
	    } else {
	      axisY = options.axisY.type.call(Chartist, Chartist.Axis.units.y, data, chartRect, options.axisY);
	    }
	
	    axisX.createGridAndLabels(gridGroup, labelGroup, this.supportsForeignObject, options, this.eventEmitter);
	    axisY.createGridAndLabels(gridGroup, labelGroup, this.supportsForeignObject, options, this.eventEmitter);
	
	    // Draw the series
	    data.raw.series.forEach(function(series, seriesIndex) {
	      var seriesElement = seriesGroup.elem('g');
	
	      // Write attributes to series group element. If series name or meta is undefined the attributes will not be written
	      seriesElement.attr({
	        'series-name': series.name,
	        'meta': Chartist.serialize(series.meta)
	      }, Chartist.xmlNs.uri);
	
	      // Use series class from series data or if not set generate one
	      seriesElement.addClass([
	        options.classNames.series,
	        (series.className || options.classNames.series + '-' + Chartist.alphaNumerate(seriesIndex))
	      ].join(' '));
	
	      var pathCoordinates = [],
	        pathData = [];
	
	      data.normalized[seriesIndex].forEach(function(value, valueIndex) {
	        var p = {
	          x: chartRect.x1 + axisX.projectValue(value, valueIndex, data.normalized[seriesIndex]),
	          y: chartRect.y1 - axisY.projectValue(value, valueIndex, data.normalized[seriesIndex])
	        };
	        pathCoordinates.push(p.x, p.y);
	        pathData.push({
	          value: value,
	          valueIndex: valueIndex,
	          meta: Chartist.getMetaData(series, valueIndex)
	        });
	      }.bind(this));
	
	      var seriesOptions = {
	        lineSmooth: Chartist.getSeriesOption(series, options, 'lineSmooth'),
	        showPoint: Chartist.getSeriesOption(series, options, 'showPoint'),
	        showLine: Chartist.getSeriesOption(series, options, 'showLine'),
	        showArea: Chartist.getSeriesOption(series, options, 'showArea'),
	        areaBase: Chartist.getSeriesOption(series, options, 'areaBase')
	      };
	
	      var smoothing = typeof seriesOptions.lineSmooth === 'function' ?
	        seriesOptions.lineSmooth : (seriesOptions.lineSmooth ? Chartist.Interpolation.cardinal() : Chartist.Interpolation.none());
	      // Interpolating path where pathData will be used to annotate each path element so we can trace back the original
	      // index, value and meta data
	      var path = smoothing(pathCoordinates, pathData);
	
	      // If we should show points we need to create them now to avoid secondary loop
	      // Points are drawn from the pathElements returned by the interpolation function
	      // Small offset for Firefox to render squares correctly
	      if (seriesOptions.showPoint) {
	
	        path.pathElements.forEach(function(pathElement) {
	          var point = seriesElement.elem('line', {
	            x1: pathElement.x,
	            y1: pathElement.y,
	            x2: pathElement.x + 0.01,
	            y2: pathElement.y
	          }, options.classNames.point).attr({
	            'value': [pathElement.data.value.x, pathElement.data.value.y].filter(function(v) {
	                return v;
	              }).join(','),
	            'meta': pathElement.data.meta
	          }, Chartist.xmlNs.uri);
	
	          this.eventEmitter.emit('draw', {
	            type: 'point',
	            value: pathElement.data.value,
	            index: pathElement.data.valueIndex,
	            meta: pathElement.data.meta,
	            series: series,
	            seriesIndex: seriesIndex,
	            axisX: axisX,
	            axisY: axisY,
	            group: seriesElement,
	            element: point,
	            x: pathElement.x,
	            y: pathElement.y
	          });
	        }.bind(this));
	      }
	
	      if(seriesOptions.showLine) {
	        var line = seriesElement.elem('path', {
	          d: path.stringify()
	        }, options.classNames.line, true);
	
	        this.eventEmitter.emit('draw', {
	          type: 'line',
	          values: data.normalized[seriesIndex],
	          path: path.clone(),
	          chartRect: chartRect,
	          index: seriesIndex,
	          series: series,
	          seriesIndex: seriesIndex,
	          axisX: axisX,
	          axisY: axisY,
	          group: seriesElement,
	          element: line
	        });
	      }
	
	      // Area currently only works with axes that support a range!
	      if(seriesOptions.showArea && axisY.range) {
	        // If areaBase is outside the chart area (< min or > max) we need to set it respectively so that
	        // the area is not drawn outside the chart area.
	        var areaBase = Math.max(Math.min(seriesOptions.areaBase, axisY.range.max), axisY.range.min);
	
	        // We project the areaBase value into screen coordinates
	        var areaBaseProjected = chartRect.y1 - axisY.projectValue(areaBase);
	
	        // In order to form the area we'll first split the path by move commands so we can chunk it up into segments
	        path.splitByCommand('M').filter(function onlySolidSegments(pathSegment) {
	          // We filter only "solid" segments that contain more than one point. Otherwise there's no need for an area
	          return pathSegment.pathElements.length > 1;
	        }).map(function convertToArea(solidPathSegments) {
	          // Receiving the filtered solid path segments we can now convert those segments into fill areas
	          var firstElement = solidPathSegments.pathElements[0];
	          var lastElement = solidPathSegments.pathElements[solidPathSegments.pathElements.length - 1];
	
	          // Cloning the solid path segment with closing option and removing the first move command from the clone
	          // We then insert a new move that should start at the area base and draw a straight line up or down
	          // at the end of the path we add an additional straight line to the projected area base value
	          // As the closing option is set our path will be automatically closed
	          return solidPathSegments.clone(true)
	            .position(0)
	            .remove(1)
	            .move(firstElement.x, areaBaseProjected)
	            .line(firstElement.x, firstElement.y)
	            .position(solidPathSegments.pathElements.length + 1)
	            .line(lastElement.x, areaBaseProjected);
	
	        }).forEach(function createArea(areaPath) {
	          // For each of our newly created area paths, we'll now create path elements by stringifying our path objects
	          // and adding the created DOM elements to the correct series group
	          var area = seriesElement.elem('path', {
	            d: areaPath.stringify()
	          }, options.classNames.area, true).attr({
	            'values': data.normalized[seriesIndex]
	          }, Chartist.xmlNs.uri);
	
	          // Emit an event for each area that was drawn
	          this.eventEmitter.emit('draw', {
	            type: 'area',
	            values: data.normalized[seriesIndex],
	            path: areaPath.clone(),
	            series: series,
	            seriesIndex: seriesIndex,
	            axisX: axisX,
	            axisY: axisY,
	            chartRect: chartRect,
	            index: seriesIndex,
	            group: seriesElement,
	            element: area
	          });
	        }.bind(this));
	      }
	    }.bind(this));
	
	    this.eventEmitter.emit('created', {
	      bounds: axisY.bounds,
	      chartRect: chartRect,
	      axisX: axisX,
	      axisY: axisY,
	      svg: this.svg,
	      options: options
	    });
	  }
	
	  /**
	   * This method creates a new line chart.
	   *
	   * @memberof Chartist.Line
	   * @param {String|Node} query A selector query string or directly a DOM element
	   * @param {Object} data The data object that needs to consist of a labels and a series array
	   * @param {Object} [options] The options object with options that override the default options. Check the examples for a detailed list.
	   * @param {Array} [responsiveOptions] Specify an array of responsive option arrays which are a media query and options object pair => [[mediaQueryString, optionsObject],[more...]]
	   * @return {Object} An object which exposes the API for the created chart
	   *
	   * @example
	   * // Create a simple line chart
	   * var data = {
	   *   // A labels array that can contain any sort of values
	   *   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
	   *   // Our series array that contains series objects or in this case series data arrays
	   *   series: [
	   *     [5, 2, 4, 2, 0]
	   *   ]
	   * };
	   *
	   * // As options we currently only set a static size of 300x200 px
	   * var options = {
	   *   width: '300px',
	   *   height: '200px'
	   * };
	   *
	   * // In the global name space Chartist we call the Line function to initialize a line chart. As a first parameter we pass in a selector where we would like to get our chart created. Second parameter is the actual data object and as a third parameter we pass in our options
	   * new Chartist.Line('.ct-chart', data, options);
	   *
	   * @example
	   * // Use specific interpolation function with configuration from the Chartist.Interpolation module
	   *
	   * var chart = new Chartist.Line('.ct-chart', {
	   *   labels: [1, 2, 3, 4, 5],
	   *   series: [
	   *     [1, 1, 8, 1, 7]
	   *   ]
	   * }, {
	   *   lineSmooth: Chartist.Interpolation.cardinal({
	   *     tension: 0.2
	   *   })
	   * });
	   *
	   * @example
	   * // Create a line chart with responsive options
	   *
	   * var data = {
	   *   // A labels array that can contain any sort of values
	   *   labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
	   *   // Our series array that contains series objects or in this case series data arrays
	   *   series: [
	   *     [5, 2, 4, 2, 0]
	   *   ]
	   * };
	   *
	   * // In adition to the regular options we specify responsive option overrides that will override the default configutation based on the matching media queries.
	   * var responsiveOptions = [
	   *   ['screen and (min-width: 641px) and (max-width: 1024px)', {
	   *     showPoint: false,
	   *     axisX: {
	   *       labelInterpolationFnc: function(value) {
	   *         // Will return Mon, Tue, Wed etc. on medium screens
	   *         return value.slice(0, 3);
	   *       }
	   *     }
	   *   }],
	   *   ['screen and (max-width: 640px)', {
	   *     showLine: false,
	   *     axisX: {
	   *       labelInterpolationFnc: function(value) {
	   *         // Will return M, T, W etc. on small screens
	   *         return value[0];
	   *       }
	   *     }
	   *   }]
	   * ];
	   *
	   * new Chartist.Line('.ct-chart', data, null, responsiveOptions);
	   *
	   */
	  function Line(query, data, options, responsiveOptions) {
	    Chartist.Line.super.constructor.call(this,
	      query,
	      data,
	      defaultOptions,
	      Chartist.extend({}, defaultOptions, options),
	      responsiveOptions);
	  }
	
	  // Creating line chart type in Chartist namespace
	  Chartist.Line = Chartist.Base.extend({
	    constructor: Line,
	    createChart: createChart
	  });
	
	}(window, document, Chartist));
	;/**
	 * The bar chart module of Chartist that can be used to draw unipolar or bipolar bar and grouped bar charts.
	 *
	 * @module Chartist.Bar
	 */
	/* global Chartist */
	(function(window, document, Chartist){
	  'use strict';
	
	  /**
	   * Default options in bar charts. Expand the code view to see a detailed list of options with comments.
	   *
	   * @memberof Chartist.Bar
	   */
	  var defaultOptions = {
	    // Options for X-Axis
	    axisX: {
	      // The offset of the chart drawing area to the border of the container
	      offset: 30,
	      // Position where labels are placed. Can be set to `start` or `end` where `start` is equivalent to left or top on vertical axis and `end` is equivalent to right or bottom on horizontal axis.
	      position: 'end',
	      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
	      labelOffset: {
	        x: 0,
	        y: 0
	      },
	      // If labels should be shown or not
	      showLabel: true,
	      // If the axis grid should be drawn or not
	      showGrid: true,
	      // Interpolation function that allows you to intercept the value from the axis label
	      labelInterpolationFnc: Chartist.noop,
	      // This value specifies the minimum width in pixel of the scale steps
	      scaleMinSpace: 30,
	      // Use only integer values (whole numbers) for the scale steps
	      onlyInteger: false
	    },
	    // Options for Y-Axis
	    axisY: {
	      // The offset of the chart drawing area to the border of the container
	      offset: 40,
	      // Position where labels are placed. Can be set to `start` or `end` where `start` is equivalent to left or top on vertical axis and `end` is equivalent to right or bottom on horizontal axis.
	      position: 'start',
	      // Allows you to correct label positioning on this axis by positive or negative x and y offset.
	      labelOffset: {
	        x: 0,
	        y: 0
	      },
	      // If labels should be shown or not
	      showLabel: true,
	      // If the axis grid should be drawn or not
	      showGrid: true,
	      // Interpolation function that allows you to intercept the value from the axis label
	      labelInterpolationFnc: Chartist.noop,
	      // This value specifies the minimum height in pixel of the scale steps
	      scaleMinSpace: 20,
	      // Use only integer values (whole numbers) for the scale steps
	      onlyInteger: false
	    },
	    // Specify a fixed width for the chart as a string (i.e. '100px' or '50%')
	    width: undefined,
	    // Specify a fixed height for the chart as a string (i.e. '100px' or '50%')
	    height: undefined,
	    // Overriding the natural high of the chart allows you to zoom in or limit the charts highest displayed value
	    high: undefined,
	    // Overriding the natural low of the chart allows you to zoom in or limit the charts lowest displayed value
	    low: undefined,
	    // Use only integer values (whole numbers) for the scale steps
	    onlyInteger: false,
	    // Padding of the chart drawing area to the container element and labels as a number or padding object {top: 5, right: 5, bottom: 5, left: 5}
	    chartPadding: {
	      top: 15,
	      right: 15,
	      bottom: 5,
	      left: 10
	    },
	    // Specify the distance in pixel of bars in a group
	    seriesBarDistance: 15,
	    // If set to true this property will cause the series bars to be stacked. Check the `stackMode` option for further stacking options.
	    stackBars: false,
	    // If set to 'overlap' this property will force the stacked bars to draw from the zero line.
	    // If set to 'accumulate' this property will form a total for each series point. This will also influence the y-axis and the overall bounds of the chart. In stacked mode the seriesBarDistance property will have no effect.
	    stackMode: 'accumulate',
	    // Inverts the axes of the bar chart in order to draw a horizontal bar chart. Be aware that you also need to invert your axis settings as the Y Axis will now display the labels and the X Axis the values.
	    horizontalBars: false,
	    // If set to true then each bar will represent a series and the data array is expected to be a one dimensional array of data values rather than a series array of series. This is useful if the bar chart should represent a profile rather than some data over time.
	    distributeSeries: false,
	    // If true the whole data is reversed including labels, the series order as well as the whole series data arrays.
	    reverseData: false,
	    // Override the class names that get used to generate the SVG structure of the chart
	    classNames: {
	      chart: 'ct-chart-bar',
	      horizontalBars: 'ct-horizontal-bars',
	      label: 'ct-label',
	      labelGroup: 'ct-labels',
	      series: 'ct-series',
	      bar: 'ct-bar',
	      grid: 'ct-grid',
	      gridGroup: 'ct-grids',
	      vertical: 'ct-vertical',
	      horizontal: 'ct-horizontal',
	      start: 'ct-start',
	      end: 'ct-end'
	    }
	  };
	
	  /**
	   * Creates a new chart
	   *
	   */
	  function createChart(options) {
	    var data = {
	      raw: this.data,
	      normalized: options.distributeSeries ? Chartist.getDataArray(this.data, options.reverseData, options.horizontalBars ? 'x' : 'y').map(function(value) {
	        return [value];
	      }) : Chartist.getDataArray(this.data, options.reverseData, options.horizontalBars ? 'x' : 'y')
	    };
	
	    var highLow;
	
	    // Create new svg element
	    this.svg = Chartist.createSvg(
	      this.container,
	      options.width,
	      options.height,
	      options.classNames.chart + (options.horizontalBars ? ' ' + options.classNames.horizontalBars : '')
	    );
	
	    // Drawing groups in correct order
	    var gridGroup = this.svg.elem('g').addClass(options.classNames.gridGroup);
	    var seriesGroup = this.svg.elem('g');
	    var labelGroup = this.svg.elem('g').addClass(options.classNames.labelGroup);
	
	    if(options.stackBars) {
	      // If stacked bars we need to calculate the high low from stacked values from each series
	      var serialSums = Chartist.serialMap(data.normalized, function serialSums() {
	        return Array.prototype.slice.call(arguments).map(function(value) {
	          return value;
	        }).reduce(function(prev, curr) {
	          return {
	            x: prev.x + curr.x || 0,
	            y: prev.y + curr.y || 0
	          };
	        }, {x: 0, y: 0});
	      });
	
	      highLow = Chartist.getHighLow([serialSums], Chartist.extend({}, options, {
	        referenceValue: 0
	      }), options.horizontalBars ? 'x' : 'y');
	    } else {
	      highLow = Chartist.getHighLow(data.normalized, Chartist.extend({}, options, {
	        referenceValue: 0
	      }), options.horizontalBars ? 'x' : 'y');
	    }
	    // Overrides of high / low from settings
	    highLow.high = +options.high || (options.high === 0 ? 0 : highLow.high);
	    highLow.low = +options.low || (options.low === 0 ? 0 : highLow.low);
	
	    var chartRect = Chartist.createChartRect(this.svg, options, defaultOptions.padding);
	
	    var valueAxis,
	      labelAxisTicks,
	      labelAxis,
	      axisX,
	      axisY;
	
	    // We need to set step count based on some options combinations
	    if(options.distributeSeries && options.stackBars) {
	      // If distributed series are enabled and bars need to be stacked, we'll only have one bar and therefore should
	      // use only the first label for the step axis
	      labelAxisTicks = data.raw.labels.slice(0, 1);
	    } else {
	      // If distributed series are enabled but stacked bars aren't, we should use the series labels
	      // If we are drawing a regular bar chart with two dimensional series data, we just use the labels array
	      // as the bars are normalized
	      labelAxisTicks = data.raw.labels;
	    }
	
	    // Set labelAxis and valueAxis based on the horizontalBars setting. This setting will flip the axes if necessary.
	    if(options.horizontalBars) {
	      if(options.axisX.type === undefined) {
	        valueAxis = axisX = new Chartist.AutoScaleAxis(Chartist.Axis.units.x, data, chartRect, Chartist.extend({}, options.axisX, {
	          highLow: highLow,
	          referenceValue: 0
	        }));
	      } else {
	        valueAxis = axisX = options.axisX.type.call(Chartist, Chartist.Axis.units.x, data, chartRect, Chartist.extend({}, options.axisX, {
	          highLow: highLow,
	          referenceValue: 0
	        }));
	      }
	
	      if(options.axisY.type === undefined) {
	        labelAxis = axisY = new Chartist.StepAxis(Chartist.Axis.units.y, data, chartRect, {
	          ticks: labelAxisTicks
	        });
	      } else {
	        labelAxis = axisY = options.axisY.type.call(Chartist, Chartist.Axis.units.y, data, chartRect, options.axisY);
	      }
	    } else {
	      if(options.axisX.type === undefined) {
	        labelAxis = axisX = new Chartist.StepAxis(Chartist.Axis.units.x, data, chartRect, {
	          ticks: labelAxisTicks
	        });
	      } else {
	        labelAxis = axisX = options.axisX.type.call(Chartist, Chartist.Axis.units.x, data, chartRect, options.axisX);
	      }
	
	      if(options.axisY.type === undefined) {
	        valueAxis = axisY = new Chartist.AutoScaleAxis(Chartist.Axis.units.y, data, chartRect, Chartist.extend({}, options.axisY, {
	          highLow: highLow,
	          referenceValue: 0
	        }));
	      } else {
	        valueAxis = axisY = options.axisY.type.call(Chartist, Chartist.Axis.units.y, data, chartRect, Chartist.extend({}, options.axisY, {
	          highLow: highLow,
	          referenceValue: 0
	        }));
	      }
	    }
	
	    // Projected 0 point
	    var zeroPoint = options.horizontalBars ? (chartRect.x1 + valueAxis.projectValue(0)) : (chartRect.y1 - valueAxis.projectValue(0));
	    // Used to track the screen coordinates of stacked bars
	    var stackedBarValues = [];
	
	    labelAxis.createGridAndLabels(gridGroup, labelGroup, this.supportsForeignObject, options, this.eventEmitter);
	    valueAxis.createGridAndLabels(gridGroup, labelGroup, this.supportsForeignObject, options, this.eventEmitter);
	
	    // Draw the series
	    data.raw.series.forEach(function(series, seriesIndex) {
	      // Calculating bi-polar value of index for seriesOffset. For i = 0..4 biPol will be -1.5, -0.5, 0.5, 1.5 etc.
	      var biPol = seriesIndex - (data.raw.series.length - 1) / 2;
	      // Half of the period width between vertical grid lines used to position bars
	      var periodHalfLength;
	      // Current series SVG element
	      var seriesElement;
	
	      // We need to set periodHalfLength based on some options combinations
	      if(options.distributeSeries && !options.stackBars) {
	        // If distributed series are enabled but stacked bars aren't, we need to use the length of the normaizedData array
	        // which is the series count and divide by 2
	        periodHalfLength = labelAxis.axisLength / data.normalized.length / 2;
	      } else if(options.distributeSeries && options.stackBars) {
	        // If distributed series and stacked bars are enabled we'll only get one bar so we should just divide the axis
	        // length by 2
	        periodHalfLength = labelAxis.axisLength / 2;
	      } else {
	        // On regular bar charts we should just use the series length
	        periodHalfLength = labelAxis.axisLength / data.normalized[seriesIndex].length / 2;
	      }
	
	      // Adding the series group to the series element
	      seriesElement = seriesGroup.elem('g');
	
	      // Write attributes to series group element. If series name or meta is undefined the attributes will not be written
	      seriesElement.attr({
	        'series-name': series.name,
	        'meta': Chartist.serialize(series.meta)
	      }, Chartist.xmlNs.uri);
	
	      // Use series class from series data or if not set generate one
	      seriesElement.addClass([
	        options.classNames.series,
	        (series.className || options.classNames.series + '-' + Chartist.alphaNumerate(seriesIndex))
	      ].join(' '));
	
	      data.normalized[seriesIndex].forEach(function(value, valueIndex) {
	        var projected,
	          bar,
	          previousStack,
	          labelAxisValueIndex;
	
	        // We need to set labelAxisValueIndex based on some options combinations
	        if(options.distributeSeries && !options.stackBars) {
	          // If distributed series are enabled but stacked bars aren't, we can use the seriesIndex for later projection
	          // on the step axis for label positioning
	          labelAxisValueIndex = seriesIndex;
	        } else if(options.distributeSeries && options.stackBars) {
	          // If distributed series and stacked bars are enabled, we will only get one bar and therefore always use
	          // 0 for projection on the label step axis
	          labelAxisValueIndex = 0;
	        } else {
	          // On regular bar charts we just use the value index to project on the label step axis
	          labelAxisValueIndex = valueIndex;
	        }
	
	        // We need to transform coordinates differently based on the chart layout
	        if(options.horizontalBars) {
	          projected = {
	            x: chartRect.x1 + valueAxis.projectValue(value && value.x ? value.x : 0, valueIndex, data.normalized[seriesIndex]),
	            y: chartRect.y1 - labelAxis.projectValue(value && value.y ? value.y : 0, labelAxisValueIndex, data.normalized[seriesIndex])
	          };
	        } else {
	          projected = {
	            x: chartRect.x1 + labelAxis.projectValue(value && value.x ? value.x : 0, labelAxisValueIndex, data.normalized[seriesIndex]),
	            y: chartRect.y1 - valueAxis.projectValue(value && value.y ? value.y : 0, valueIndex, data.normalized[seriesIndex])
	          }
	        }
	
	        // If the label axis is a step based axis we will offset the bar into the middle of between two steps using
	        // the periodHalfLength value. Also we do arrange the different series so that they align up to each other using
	        // the seriesBarDistance. If we don't have a step axis, the bar positions can be chosen freely so we should not
	        // add any automated positioning.
	        if(labelAxis instanceof Chartist.StepAxis) {
	          // Offset to center bar between grid lines, but only if the step axis is not stretched
	          if(!labelAxis.options.stretch) {
	            projected[labelAxis.units.pos] += periodHalfLength * (options.horizontalBars ? -1 : 1);
	          }
	          // Using bi-polar offset for multiple series if no stacked bars or series distribution is used
	          projected[labelAxis.units.pos] += (options.stackBars || options.distributeSeries) ? 0 : biPol * options.seriesBarDistance * (options.horizontalBars ? -1 : 1);
	        }
	
	        // Enter value in stacked bar values used to remember previous screen value for stacking up bars
	        previousStack = stackedBarValues[valueIndex] || zeroPoint;
	        stackedBarValues[valueIndex] = previousStack - (zeroPoint - projected[labelAxis.counterUnits.pos]);
	
	        // Skip if value is undefined
	        if(value === undefined) {
	          return;
	        }
	
	        var positions = {};
	        positions[labelAxis.units.pos + '1'] = projected[labelAxis.units.pos];
	        positions[labelAxis.units.pos + '2'] = projected[labelAxis.units.pos];
	
	        if(options.stackBars && (options.stackMode === 'accumulate' || !options.stackMode)) {
	          // Stack mode: accumulate (default)
	          // If bars are stacked we use the stackedBarValues reference and otherwise base all bars off the zero line
	          // We want backwards compatibility, so the expected fallback without the 'stackMode' option
	          // to be the original behaviour (accumulate)
	          positions[labelAxis.counterUnits.pos + '1'] = previousStack;
	          positions[labelAxis.counterUnits.pos + '2'] = stackedBarValues[valueIndex];
	        } else {
	          // Draw from the zero line normally
	          // This is also the same code for Stack mode: overlap
	          positions[labelAxis.counterUnits.pos + '1'] = zeroPoint;
	          positions[labelAxis.counterUnits.pos + '2'] = projected[labelAxis.counterUnits.pos];
	        }
	
	        // Limit x and y so that they are within the chart rect
	        positions.x1 = Math.min(Math.max(positions.x1, chartRect.x1), chartRect.x2);
	        positions.x2 = Math.min(Math.max(positions.x2, chartRect.x1), chartRect.x2);
	        positions.y1 = Math.min(Math.max(positions.y1, chartRect.y2), chartRect.y1);
	        positions.y2 = Math.min(Math.max(positions.y2, chartRect.y2), chartRect.y1);
	
	        // Create bar element
	        bar = seriesElement.elem('line', positions, options.classNames.bar).attr({
	          'value': [value.x, value.y].filter(function(v) {
	            return v;
	          }).join(','),
	          'meta': Chartist.getMetaData(series, valueIndex)
	        }, Chartist.xmlNs.uri);
	
	        this.eventEmitter.emit('draw', Chartist.extend({
	          type: 'bar',
	          value: value,
	          index: valueIndex,
	          meta: Chartist.getMetaData(series, valueIndex),
	          series: series,
	          seriesIndex: seriesIndex,
	          axisX: axisX,
	          axisY: axisY,
	          chartRect: chartRect,
	          group: seriesElement,
	          element: bar
	        }, positions));
	      }.bind(this));
	    }.bind(this));
	
	    this.eventEmitter.emit('created', {
	      bounds: valueAxis.bounds,
	      chartRect: chartRect,
	      axisX: axisX,
	      axisY: axisY,
	      svg: this.svg,
	      options: options
	    });
	  }
	
	  /**
	   * This method creates a new bar chart and returns API object that you can use for later changes.
	   *
	   * @memberof Chartist.Bar
	   * @param {String|Node} query A selector query string or directly a DOM element
	   * @param {Object} data The data object that needs to consist of a labels and a series array
	   * @param {Object} [options] The options object with options that override the default options. Check the examples for a detailed list.
	   * @param {Array} [responsiveOptions] Specify an array of responsive option arrays which are a media query and options object pair => [[mediaQueryString, optionsObject],[more...]]
	   * @return {Object} An object which exposes the API for the created chart
	   *
	   * @example
	   * // Create a simple bar chart
	   * var data = {
	   *   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
	   *   series: [
	   *     [5, 2, 4, 2, 0]
	   *   ]
	   * };
	   *
	   * // In the global name space Chartist we call the Bar function to initialize a bar chart. As a first parameter we pass in a selector where we would like to get our chart created and as a second parameter we pass our data object.
	   * new Chartist.Bar('.ct-chart', data);
	   *
	   * @example
	   * // This example creates a bipolar grouped bar chart where the boundaries are limitted to -10 and 10
	   * new Chartist.Bar('.ct-chart', {
	   *   labels: [1, 2, 3, 4, 5, 6, 7],
	   *   series: [
	   *     [1, 3, 2, -5, -3, 1, -6],
	   *     [-5, -2, -4, -1, 2, -3, 1]
	   *   ]
	   * }, {
	   *   seriesBarDistance: 12,
	   *   low: -10,
	   *   high: 10
	   * });
	   *
	   */
	  function Bar(query, data, options, responsiveOptions) {
	    Chartist.Bar.super.constructor.call(this,
	      query,
	      data,
	      defaultOptions,
	      Chartist.extend({}, defaultOptions, options),
	      responsiveOptions);
	  }
	
	  // Creating bar chart type in Chartist namespace
	  Chartist.Bar = Chartist.Base.extend({
	    constructor: Bar,
	    createChart: createChart
	  });
	
	}(window, document, Chartist));
	;/**
	 * The pie chart module of Chartist that can be used to draw pie, donut or gauge charts
	 *
	 * @module Chartist.Pie
	 */
	/* global Chartist */
	(function(window, document, Chartist) {
	  'use strict';
	
	  /**
	   * Default options in line charts. Expand the code view to see a detailed list of options with comments.
	   *
	   * @memberof Chartist.Pie
	   */
	  var defaultOptions = {
	    // Specify a fixed width for the chart as a string (i.e. '100px' or '50%')
	    width: undefined,
	    // Specify a fixed height for the chart as a string (i.e. '100px' or '50%')
	    height: undefined,
	    // Padding of the chart drawing area to the container element and labels as a number or padding object {top: 5, right: 5, bottom: 5, left: 5}
	    chartPadding: 5,
	    // Override the class names that are used to generate the SVG structure of the chart
	    classNames: {
	      chartPie: 'ct-chart-pie',
	      chartDonut: 'ct-chart-donut',
	      series: 'ct-series',
	      slicePie: 'ct-slice-pie',
	      sliceDonut: 'ct-slice-donut',
	      label: 'ct-label'
	    },
	    // The start angle of the pie chart in degrees where 0 points north. A higher value offsets the start angle clockwise.
	    startAngle: 0,
	    // An optional total you can specify. By specifying a total value, the sum of the values in the series must be this total in order to draw a full pie. You can use this parameter to draw only parts of a pie or gauge charts.
	    total: undefined,
	    // If specified the donut CSS classes will be used and strokes will be drawn instead of pie slices.
	    donut: false,
	    // Specify the donut stroke width, currently done in javascript for convenience. May move to CSS styles in the future.
	    // This option can be set as number or string to specify a relative width (i.e. 100 or '30%').
	    donutWidth: 60,
	    // If a label should be shown or not
	    showLabel: true,
	    // Label position offset from the standard position which is half distance of the radius. This value can be either positive or negative. Positive values will position the label away from the center.
	    labelOffset: 0,
	    // This option can be set to 'inside', 'outside' or 'center'. Positioned with 'inside' the labels will be placed on half the distance of the radius to the border of the Pie by respecting the 'labelOffset'. The 'outside' option will place the labels at the border of the pie and 'center' will place the labels in the absolute center point of the chart. The 'center' option only makes sense in conjunction with the 'labelOffset' option.
	    labelPosition: 'inside',
	    // An interpolation function for the label value
	    labelInterpolationFnc: Chartist.noop,
	    // Label direction can be 'neutral', 'explode' or 'implode'. The labels anchor will be positioned based on those settings as well as the fact if the labels are on the right or left side of the center of the chart. Usually explode is useful when labels are positioned far away from the center.
	    labelDirection: 'neutral',
	    // If true the whole data is reversed including labels, the series order as well as the whole series data arrays.
	    reverseData: false
	  };
	
	  /**
	   * Determines SVG anchor position based on direction and center parameter
	   *
	   * @param center
	   * @param label
	   * @param direction
	   * @return {string}
	   */
	  function determineAnchorPosition(center, label, direction) {
	    var toTheRight = label.x > center.x;
	
	    if(toTheRight && direction === 'explode' ||
	      !toTheRight && direction === 'implode') {
	      return 'start';
	    } else if(toTheRight && direction === 'implode' ||
	      !toTheRight && direction === 'explode') {
	      return 'end';
	    } else {
	      return 'middle';
	    }
	  }
	
	  /**
	   * Creates the pie chart
	   *
	   * @param options
	   */
	  function createChart(options) {
	    var seriesGroups = [],
	      labelsGroup,
	      chartRect,
	      radius,
	      labelRadius,
	      totalDataSum,
	      startAngle = options.startAngle,
	      dataArray = Chartist.getDataArray(this.data, options.reverseData);
	
	    // Create SVG.js draw
	    this.svg = Chartist.createSvg(this.container, options.width, options.height,options.donut ? options.classNames.chartDonut : options.classNames.chartPie);
	    // Calculate charting rect
	    chartRect = Chartist.createChartRect(this.svg, options, defaultOptions.padding);
	    // Get biggest circle radius possible within chartRect
	    radius = Math.min(chartRect.width() / 2, chartRect.height() / 2);
	    // Calculate total of all series to get reference value or use total reference from optional options
	    totalDataSum = options.total || dataArray.reduce(function(previousValue, currentValue) {
	      return previousValue + currentValue;
	    }, 0);
	
	    var donutWidth = Chartist.quantity(options.donutWidth);
	    if (donutWidth.unit === '%') {
	      donutWidth.value *= radius / 100;
	    }
	
	    // If this is a donut chart we need to adjust our radius to enable strokes to be drawn inside
	    // Unfortunately this is not possible with the current SVG Spec
	    // See this proposal for more details: http://lists.w3.org/Archives/Public/www-svg/2003Oct/0000.html
	    radius -= options.donut ? donutWidth.value / 2  : 0;
	
	    // If labelPosition is set to `outside` or a donut chart is drawn then the label position is at the radius,
	    // if regular pie chart it's half of the radius
	    if(options.labelPosition === 'outside' || options.donut) {
	      labelRadius = radius;
	    } else if(options.labelPosition === 'center') {
	      // If labelPosition is center we start with 0 and will later wait for the labelOffset
	      labelRadius = 0;
	    } else {
	      // Default option is 'inside' where we use half the radius so the label will be placed in the center of the pie
	      // slice
	      labelRadius = radius / 2;
	    }
	    // Add the offset to the labelRadius where a negative offset means closed to the center of the chart
	    labelRadius += options.labelOffset;
	
	    // Calculate end angle based on total sum and current data value and offset with padding
	    var center = {
	      x: chartRect.x1 + chartRect.width() / 2,
	      y: chartRect.y2 + chartRect.height() / 2
	    };
	
	    // Check if there is only one non-zero value in the series array.
	    var hasSingleValInSeries = this.data.series.filter(function(val) {
	      return val.hasOwnProperty('value') ? val.value !== 0 : val !== 0;
	    }).length === 1;
	
	    //if we need to show labels we create the label group now
	    if(options.showLabel) {
	      labelsGroup = this.svg.elem('g', null, null, true);
	    }
	
	    // Draw the series
	    // initialize series groups
	    for (var i = 0; i < this.data.series.length; i++) {
	      var series = this.data.series[i];
	      seriesGroups[i] = this.svg.elem('g', null, null, true);
	
	      // If the series is an object and contains a name or meta data we add a custom attribute
	      seriesGroups[i].attr({
	        'series-name': series.name
	      }, Chartist.xmlNs.uri);
	
	      // Use series class from series data or if not set generate one
	      seriesGroups[i].addClass([
	        options.classNames.series,
	        (series.className || options.classNames.series + '-' + Chartist.alphaNumerate(i))
	      ].join(' '));
	
	      var endAngle = startAngle + dataArray[i] / totalDataSum * 360;
	      // If we need to draw the arc for all 360 degrees we need to add a hack where we close the circle
	      // with Z and use 359.99 degrees
	      if(endAngle - startAngle === 360) {
	        endAngle -= 0.01;
	      }
	
	      var start = Chartist.polarToCartesian(center.x, center.y, radius, startAngle - (i === 0 || hasSingleValInSeries ? 0 : 0.2)),
	        end = Chartist.polarToCartesian(center.x, center.y, radius, endAngle);
	
	      // Create a new path element for the pie chart. If this isn't a donut chart we should close the path for a correct stroke
	      var path = new Chartist.Svg.Path(!options.donut)
	        .move(end.x, end.y)
	        .arc(radius, radius, 0, endAngle - startAngle > 180, 0, start.x, start.y);
	
	      // If regular pie chart (no donut) we add a line to the center of the circle for completing the pie
	      if(!options.donut) {
	        path.line(center.x, center.y);
	      }
	
	      // Create the SVG path
	      // If this is a donut chart we add the donut class, otherwise just a regular slice
	      var pathElement = seriesGroups[i].elem('path', {
	        d: path.stringify()
	      }, options.donut ? options.classNames.sliceDonut : options.classNames.slicePie);
	
	      // Adding the pie series value to the path
	      pathElement.attr({
	        'value': dataArray[i],
	        'meta': Chartist.serialize(series.meta)
	      }, Chartist.xmlNs.uri);
	
	      // If this is a donut, we add the stroke-width as style attribute
	      if(options.donut) {
	        pathElement.attr({
	          'style': 'stroke-width: ' + donutWidth.value + 'px'
	        });
	      }
	
	      // Fire off draw event
	      this.eventEmitter.emit('draw', {
	        type: 'slice',
	        value: dataArray[i],
	        totalDataSum: totalDataSum,
	        index: i,
	        meta: series.meta,
	        series: series,
	        group: seriesGroups[i],
	        element: pathElement,
	        path: path.clone(),
	        center: center,
	        radius: radius,
	        startAngle: startAngle,
	        endAngle: endAngle
	      });
	
	      // If we need to show labels we need to add the label for this slice now
	      if(options.showLabel) {
	        // Position at the labelRadius distance from center and between start and end angle
	        var labelPosition = Chartist.polarToCartesian(center.x, center.y, labelRadius, startAngle + (endAngle - startAngle) / 2),
	          interpolatedValue = options.labelInterpolationFnc(this.data.labels ? this.data.labels[i] : dataArray[i], i);
	
	        if(interpolatedValue || interpolatedValue === 0) {
	          var labelElement = labelsGroup.elem('text', {
	            dx: labelPosition.x,
	            dy: labelPosition.y,
	            'text-anchor': determineAnchorPosition(center, labelPosition, options.labelDirection)
	          }, options.classNames.label).text('' + interpolatedValue);
	
	          // Fire off draw event
	          this.eventEmitter.emit('draw', {
	            type: 'label',
	            index: i,
	            group: labelsGroup,
	            element: labelElement,
	            text: '' + interpolatedValue,
	            x: labelPosition.x,
	            y: labelPosition.y
	          });
	        }
	      }
	
	      // Set next startAngle to current endAngle. Use slight offset so there are no transparent hairline issues
	      // (except for last slice)
	      startAngle = endAngle;
	    }
	
	    this.eventEmitter.emit('created', {
	      chartRect: chartRect,
	      svg: this.svg,
	      options: options
	    });
	  }
	
	  /**
	   * This method creates a new pie chart and returns an object that can be used to redraw the chart.
	   *
	   * @memberof Chartist.Pie
	   * @param {String|Node} query A selector query string or directly a DOM element
	   * @param {Object} data The data object in the pie chart needs to have a series property with a one dimensional data array. The values will be normalized against each other and don't necessarily need to be in percentage. The series property can also be an array of value objects that contain a value property and a className property to override the CSS class name for the series group.
	   * @param {Object} [options] The options object with options that override the default options. Check the examples for a detailed list.
	   * @param {Array} [responsiveOptions] Specify an array of responsive option arrays which are a media query and options object pair => [[mediaQueryString, optionsObject],[more...]]
	   * @return {Object} An object with a version and an update method to manually redraw the chart
	   *
	   * @example
	   * // Simple pie chart example with four series
	   * new Chartist.Pie('.ct-chart', {
	   *   series: [10, 2, 4, 3]
	   * });
	   *
	   * @example
	   * // Drawing a donut chart
	   * new Chartist.Pie('.ct-chart', {
	   *   series: [10, 2, 4, 3]
	   * }, {
	   *   donut: true
	   * });
	   *
	   * @example
	   * // Using donut, startAngle and total to draw a gauge chart
	   * new Chartist.Pie('.ct-chart', {
	   *   series: [20, 10, 30, 40]
	   * }, {
	   *   donut: true,
	   *   donutWidth: 20,
	   *   startAngle: 270,
	   *   total: 200
	   * });
	   *
	   * @example
	   * // Drawing a pie chart with padding and labels that are outside the pie
	   * new Chartist.Pie('.ct-chart', {
	   *   series: [20, 10, 30, 40]
	   * }, {
	   *   chartPadding: 30,
	   *   labelOffset: 50,
	   *   labelDirection: 'explode'
	   * });
	   *
	   * @example
	   * // Overriding the class names for individual series as well as a name and meta data.
	   * // The name will be written as ct:series-name attribute and the meta data will be serialized and written
	   * // to a ct:meta attribute.
	   * new Chartist.Pie('.ct-chart', {
	   *   series: [{
	   *     value: 20,
	   *     name: 'Series 1',
	   *     className: 'my-custom-class-one',
	   *     meta: 'Meta One'
	   *   }, {
	   *     value: 10,
	   *     name: 'Series 2',
	   *     className: 'my-custom-class-two',
	   *     meta: 'Meta Two'
	   *   }, {
	   *     value: 70,
	   *     name: 'Series 3',
	   *     className: 'my-custom-class-three',
	   *     meta: 'Meta Three'
	   *   }]
	   * });
	   */
	  function Pie(query, data, options, responsiveOptions) {
	    Chartist.Pie.super.constructor.call(this,
	      query,
	      data,
	      defaultOptions,
	      Chartist.extend({}, defaultOptions, options),
	      responsiveOptions);
	  }
	
	  // Creating pie chart type in Chartist namespace
	  Chartist.Pie = Chartist.Base.extend({
	    constructor: Pie,
	    createChart: createChart,
	    determineAnchorPosition: determineAnchorPosition
	  });
	
	}(window, document, Chartist));
	
	return Chartist;
	
	}));


/***/ },

/***/ 212:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/**!
	 * Sortable
	 * @author	RubaXa   <trash@rubaxa.org>
	 * @license MIT
	 */
	
	
	(function (factory) {
		"use strict";
	
		if (true) {
			!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}
		else if (typeof module != "undefined" && typeof module.exports != "undefined") {
			module.exports = factory();
		}
		else if (typeof Package !== "undefined") {
			Sortable = factory();  // export for Meteor.js
		}
		else {
			/* jshint sub:true */
			window["Sortable"] = factory();
		}
	})(function () {
		"use strict";
	
		var dragEl,
			parentEl,
			ghostEl,
			cloneEl,
			rootEl,
			nextEl,
	
			scrollEl,
			scrollParentEl,
	
			lastEl,
			lastCSS,
			lastParentCSS,
	
			oldIndex,
			newIndex,
	
			activeGroup,
			autoScroll = {},
	
			tapEvt,
			touchEvt,
	
			moved,
	
			/** @const */
			RSPACE = /\s+/g,
	
			expando = 'Sortable' + (new Date).getTime(),
	
			win = window,
			document = win.document,
			parseInt = win.parseInt,
	
			supportDraggable = !!('draggable' in document.createElement('div')),
			supportCssPointerEvents = (function (el) {
				el = document.createElement('x');
				el.style.cssText = 'pointer-events:auto';
				return el.style.pointerEvents === 'auto';
			})(),
	
			_silent = false,
	
			abs = Math.abs,
			slice = [].slice,
	
			touchDragOverListeners = [],
	
			_autoScroll = _throttle(function (/**Event*/evt, /**Object*/options, /**HTMLElement*/rootEl) {
				// Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=505521
				if (rootEl && options.scroll) {
					var el,
						rect,
						sens = options.scrollSensitivity,
						speed = options.scrollSpeed,
	
						x = evt.clientX,
						y = evt.clientY,
	
						winWidth = window.innerWidth,
						winHeight = window.innerHeight,
	
						vx,
						vy
					;
	
					// Delect scrollEl
					if (scrollParentEl !== rootEl) {
						scrollEl = options.scroll;
						scrollParentEl = rootEl;
	
						if (scrollEl === true) {
							scrollEl = rootEl;
	
							do {
								if ((scrollEl.offsetWidth < scrollEl.scrollWidth) ||
									(scrollEl.offsetHeight < scrollEl.scrollHeight)
								) {
									break;
								}
								/* jshint boss:true */
							} while (scrollEl = scrollEl.parentNode);
						}
					}
	
					if (scrollEl) {
						el = scrollEl;
						rect = scrollEl.getBoundingClientRect();
						vx = (abs(rect.right - x) <= sens) - (abs(rect.left - x) <= sens);
						vy = (abs(rect.bottom - y) <= sens) - (abs(rect.top - y) <= sens);
					}
	
	
					if (!(vx || vy)) {
						vx = (winWidth - x <= sens) - (x <= sens);
						vy = (winHeight - y <= sens) - (y <= sens);
	
						/* jshint expr:true */
						(vx || vy) && (el = win);
					}
	
	
					if (autoScroll.vx !== vx || autoScroll.vy !== vy || autoScroll.el !== el) {
						autoScroll.el = el;
						autoScroll.vx = vx;
						autoScroll.vy = vy;
	
						clearInterval(autoScroll.pid);
	
						if (el) {
							autoScroll.pid = setInterval(function () {
								if (el === win) {
									win.scrollTo(win.pageXOffset + vx * speed, win.pageYOffset + vy * speed);
								} else {
									vy && (el.scrollTop += vy * speed);
									vx && (el.scrollLeft += vx * speed);
								}
							}, 24);
						}
					}
				}
			}, 30),
	
			_prepareGroup = function (options) {
				var group = options.group;
	
				if (!group || typeof group != 'object') {
					group = options.group = {name: group};
				}
	
				['pull', 'put'].forEach(function (key) {
					if (!(key in group)) {
						group[key] = true;
					}
				});
	
				options.groups = ' ' + group.name + (group.put.join ? ' ' + group.put.join(' ') : '') + ' ';
			}
		;
	
	
	
		/**
		 * @class  Sortable
		 * @param  {HTMLElement}  el
		 * @param  {Object}       [options]
		 */
		function Sortable(el, options) {
			if (!(el && el.nodeType && el.nodeType === 1)) {
				throw 'Sortable: `el` must be HTMLElement, and not ' + {}.toString.call(el);
			}
	
			this.el = el; // root element
			this.options = options = _extend({}, options);
	
	
			// Export instance
			el[expando] = this;
	
	
			// Default options
			var defaults = {
				group: Math.random(),
				sort: true,
				disabled: false,
				store: null,
				handle: null,
				scroll: true,
				scrollSensitivity: 30,
				scrollSpeed: 10,
				draggable: /[uo]l/i.test(el.nodeName) ? 'li' : '>*',
				ghostClass: 'sortable-ghost',
				chosenClass: 'sortable-chosen',
				ignore: 'a, img',
				filter: null,
				animation: 0,
				setData: function (dataTransfer, dragEl) {
					dataTransfer.setData('Text', dragEl.textContent);
				},
				dropBubble: false,
				dragoverBubble: false,
				dataIdAttr: 'data-id',
				delay: 0,
				forceFallback: false,
				fallbackClass: 'sortable-fallback',
				fallbackOnBody: false
			};
	
	
			// Set default options
			for (var name in defaults) {
				!(name in options) && (options[name] = defaults[name]);
			}
	
			_prepareGroup(options);
	
			// Bind all private methods
			for (var fn in this) {
				if (fn.charAt(0) === '_') {
					this[fn] = this[fn].bind(this);
				}
			}
	
			// Setup drag mode
			this.nativeDraggable = options.forceFallback ? false : supportDraggable;
	
			// Bind events
			_on(el, 'mousedown', this._onTapStart);
			_on(el, 'touchstart', this._onTapStart);
	
			if (this.nativeDraggable) {
				_on(el, 'dragover', this);
				_on(el, 'dragenter', this);
			}
	
			touchDragOverListeners.push(this._onDragOver);
	
			// Restore sorting
			options.store && this.sort(options.store.get(this));
		}
	
	
		Sortable.prototype = /** @lends Sortable.prototype */ {
			constructor: Sortable,
	
			_onTapStart: function (/** Event|TouchEvent */evt) {
				var _this = this,
					el = this.el,
					options = this.options,
					type = evt.type,
					touch = evt.touches && evt.touches[0],
					target = (touch || evt).target,
					originalTarget = target,
					filter = options.filter;
	
	
				if (type === 'mousedown' && evt.button !== 0 || options.disabled) {
					return; // only left button or enabled
				}
	
				target = _closest(target, options.draggable, el);
	
				if (!target) {
					return;
				}
	
				// get the index of the dragged element within its parent
				oldIndex = _index(target);
	
				// Check filter
				if (typeof filter === 'function') {
					if (filter.call(this, evt, target, this)) {
						_dispatchEvent(_this, originalTarget, 'filter', target, el, oldIndex);
						evt.preventDefault();
						return; // cancel dnd
					}
				}
				else if (filter) {
					filter = filter.split(',').some(function (criteria) {
						criteria = _closest(originalTarget, criteria.trim(), el);
	
						if (criteria) {
							_dispatchEvent(_this, criteria, 'filter', target, el, oldIndex);
							return true;
						}
					});
	
					if (filter) {
						evt.preventDefault();
						return; // cancel dnd
					}
				}
	
	
				if (options.handle && !_closest(originalTarget, options.handle, el)) {
					return;
				}
	
	
				// Prepare `dragstart`
				this._prepareDragStart(evt, touch, target);
			},
	
			_prepareDragStart: function (/** Event */evt, /** Touch */touch, /** HTMLElement */target) {
				var _this = this,
					el = _this.el,
					options = _this.options,
					ownerDocument = el.ownerDocument,
					dragStartFn;
	
				if (target && !dragEl && (target.parentNode === el)) {
					tapEvt = evt;
	
					rootEl = el;
					dragEl = target;
					parentEl = dragEl.parentNode;
					nextEl = dragEl.nextSibling;
					activeGroup = options.group;
	
					dragStartFn = function () {
						// Delayed drag has been triggered
						// we can re-enable the events: touchmove/mousemove
						_this._disableDelayedDrag();
	
						// Make the element draggable
						dragEl.draggable = true;
	
						// Chosen item
						_toggleClass(dragEl, _this.options.chosenClass, true);
	
						// Bind the events: dragstart/dragend
						_this._triggerDragStart(touch);
					};
	
					// Disable "draggable"
					options.ignore.split(',').forEach(function (criteria) {
						_find(dragEl, criteria.trim(), _disableDraggable);
					});
	
					_on(ownerDocument, 'mouseup', _this._onDrop);
					_on(ownerDocument, 'touchend', _this._onDrop);
					_on(ownerDocument, 'touchcancel', _this._onDrop);
	
					if (options.delay) {
						// If the user moves the pointer or let go the click or touch
						// before the delay has been reached:
						// disable the delayed drag
						_on(ownerDocument, 'mouseup', _this._disableDelayedDrag);
						_on(ownerDocument, 'touchend', _this._disableDelayedDrag);
						_on(ownerDocument, 'touchcancel', _this._disableDelayedDrag);
						_on(ownerDocument, 'mousemove', _this._disableDelayedDrag);
						_on(ownerDocument, 'touchmove', _this._disableDelayedDrag);
	
						_this._dragStartTimer = setTimeout(dragStartFn, options.delay);
					} else {
						dragStartFn();
					}
				}
			},
	
			_disableDelayedDrag: function () {
				var ownerDocument = this.el.ownerDocument;
	
				clearTimeout(this._dragStartTimer);
				_off(ownerDocument, 'mouseup', this._disableDelayedDrag);
				_off(ownerDocument, 'touchend', this._disableDelayedDrag);
				_off(ownerDocument, 'touchcancel', this._disableDelayedDrag);
				_off(ownerDocument, 'mousemove', this._disableDelayedDrag);
				_off(ownerDocument, 'touchmove', this._disableDelayedDrag);
			},
	
			_triggerDragStart: function (/** Touch */touch) {
				if (touch) {
					// Touch device support
					tapEvt = {
						target: dragEl,
						clientX: touch.clientX,
						clientY: touch.clientY
					};
	
					this._onDragStart(tapEvt, 'touch');
				}
				else if (!this.nativeDraggable) {
					this._onDragStart(tapEvt, true);
				}
				else {
					_on(dragEl, 'dragend', this);
					_on(rootEl, 'dragstart', this._onDragStart);
				}
	
				try {
					if (document.selection) {
						document.selection.empty();
					} else {
						window.getSelection().removeAllRanges();
					}
				} catch (err) {
				}
			},
	
			_dragStarted: function () {
				if (rootEl && dragEl) {
					// Apply effect
					_toggleClass(dragEl, this.options.ghostClass, true);
	
					Sortable.active = this;
	
					// Drag start event
					_dispatchEvent(this, rootEl, 'start', dragEl, rootEl, oldIndex);
				}
			},
	
			_emulateDragOver: function () {
				if (touchEvt) {
					if (this._lastX === touchEvt.clientX && this._lastY === touchEvt.clientY) {
						return;
					}
	
					this._lastX = touchEvt.clientX;
					this._lastY = touchEvt.clientY;
	
					if (!supportCssPointerEvents) {
						_css(ghostEl, 'display', 'none');
					}
	
					var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY),
						parent = target,
						groupName = ' ' + this.options.group.name + '',
						i = touchDragOverListeners.length;
	
					if (parent) {
						do {
							if (parent[expando] && parent[expando].options.groups.indexOf(groupName) > -1) {
								while (i--) {
									touchDragOverListeners[i]({
										clientX: touchEvt.clientX,
										clientY: touchEvt.clientY,
										target: target,
										rootEl: parent
									});
								}
	
								break;
							}
	
							target = parent; // store last element
						}
						/* jshint boss:true */
						while (parent = parent.parentNode);
					}
	
					if (!supportCssPointerEvents) {
						_css(ghostEl, 'display', '');
					}
				}
			},
	
	
			_onTouchMove: function (/**TouchEvent*/evt) {
				if (tapEvt) {
					// only set the status to dragging, when we are actually dragging
					if (!Sortable.active) {
						this._dragStarted();
					}
	
					// as well as creating the ghost element on the document body
					this._appendGhost();
	
					var touch = evt.touches ? evt.touches[0] : evt,
						dx = touch.clientX - tapEvt.clientX,
						dy = touch.clientY - tapEvt.clientY,
						translate3d = evt.touches ? 'translate3d(' + dx + 'px,' + dy + 'px,0)' : 'translate(' + dx + 'px,' + dy + 'px)';
	
					moved = true;
					touchEvt = touch;
	
					_css(ghostEl, 'webkitTransform', translate3d);
					_css(ghostEl, 'mozTransform', translate3d);
					_css(ghostEl, 'msTransform', translate3d);
					_css(ghostEl, 'transform', translate3d);
	
					evt.preventDefault();
				}
			},
	
			_appendGhost: function () {
				if (!ghostEl) {
					var rect = dragEl.getBoundingClientRect(),
						css = _css(dragEl),
						options = this.options,
						ghostRect;
	
					ghostEl = dragEl.cloneNode(true);
	
					_toggleClass(ghostEl, options.ghostClass, false);
					_toggleClass(ghostEl, options.fallbackClass, true);
	
					_css(ghostEl, 'top', rect.top - parseInt(css.marginTop, 10));
					_css(ghostEl, 'left', rect.left - parseInt(css.marginLeft, 10));
					_css(ghostEl, 'width', rect.width);
					_css(ghostEl, 'height', rect.height);
					_css(ghostEl, 'opacity', '0.8');
					_css(ghostEl, 'position', 'fixed');
					_css(ghostEl, 'zIndex', '100000');
					_css(ghostEl, 'pointerEvents', 'none');
	
					options.fallbackOnBody && document.body.appendChild(ghostEl) || rootEl.appendChild(ghostEl);
	
					// Fixing dimensions.
					ghostRect = ghostEl.getBoundingClientRect();
					_css(ghostEl, 'width', rect.width * 2 - ghostRect.width);
					_css(ghostEl, 'height', rect.height * 2 - ghostRect.height);
				}
			},
	
			_onDragStart: function (/**Event*/evt, /**boolean*/useFallback) {
				var dataTransfer = evt.dataTransfer,
					options = this.options;
	
				this._offUpEvents();
	
				if (activeGroup.pull == 'clone') {
					cloneEl = dragEl.cloneNode(true);
					_css(cloneEl, 'display', 'none');
					rootEl.insertBefore(cloneEl, dragEl);
				}
	
				if (useFallback) {
	
					if (useFallback === 'touch') {
						// Bind touch events
						_on(document, 'touchmove', this._onTouchMove);
						_on(document, 'touchend', this._onDrop);
						_on(document, 'touchcancel', this._onDrop);
					} else {
						// Old brwoser
						_on(document, 'mousemove', this._onTouchMove);
						_on(document, 'mouseup', this._onDrop);
					}
	
					this._loopId = setInterval(this._emulateDragOver, 50);
				}
				else {
					if (dataTransfer) {
						dataTransfer.effectAllowed = 'move';
						options.setData && options.setData.call(this, dataTransfer, dragEl);
					}
	
					_on(document, 'drop', this);
					setTimeout(this._dragStarted, 0);
				}
			},
	
			_onDragOver: function (/**Event*/evt) {
				var el = this.el,
					target,
					dragRect,
					revert,
					options = this.options,
					group = options.group,
					groupPut = group.put,
					isOwner = (activeGroup === group),
					canSort = options.sort;
	
				if (evt.preventDefault !== void 0) {
					evt.preventDefault();
					!options.dragoverBubble && evt.stopPropagation();
				}
	
				moved = true;
	
				if (activeGroup && !options.disabled &&
					(isOwner
						? canSort || (revert = !rootEl.contains(dragEl)) // Reverting item into the original list
						: activeGroup.pull && groupPut && (
							(activeGroup.name === group.name) || // by Name
							(groupPut.indexOf && ~groupPut.indexOf(activeGroup.name)) // by Array
						)
					) &&
					(evt.rootEl === void 0 || evt.rootEl === this.el) // touch fallback
				) {
					// Smart auto-scrolling
					_autoScroll(evt, options, this.el);
	
					if (_silent) {
						return;
					}
	
					target = _closest(evt.target, options.draggable, el);
					dragRect = dragEl.getBoundingClientRect();
	
					if (revert) {
						_cloneHide(true);
	
						if (cloneEl || nextEl) {
							rootEl.insertBefore(dragEl, cloneEl || nextEl);
						}
						else if (!canSort) {
							rootEl.appendChild(dragEl);
						}
	
						return;
					}
	
	
					if ((el.children.length === 0) || (el.children[0] === ghostEl) ||
						(el === evt.target) && (target = _ghostIsLast(el, evt))
					) {
	
						if (target) {
							if (target.animated) {
								return;
							}
	
							targetRect = target.getBoundingClientRect();
						}
	
						_cloneHide(isOwner);
	
						if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect) !== false) {
							if (!dragEl.contains(el)) {
								el.appendChild(dragEl);
								parentEl = el; // actualization
							}
	
							this._animate(dragRect, dragEl);
							target && this._animate(targetRect, target);
						}
					}
					else if (target && !target.animated && target !== dragEl && (target.parentNode[expando] !== void 0)) {
						if (lastEl !== target) {
							lastEl = target;
							lastCSS = _css(target);
							lastParentCSS = _css(target.parentNode);
						}
	
	
						var targetRect = target.getBoundingClientRect(),
							width = targetRect.right - targetRect.left,
							height = targetRect.bottom - targetRect.top,
							floating = /left|right|inline/.test(lastCSS.cssFloat + lastCSS.display)
								|| (lastParentCSS.display == 'flex' && lastParentCSS['flex-direction'].indexOf('row') === 0),
							isWide = (target.offsetWidth > dragEl.offsetWidth),
							isLong = (target.offsetHeight > dragEl.offsetHeight),
							halfway = (floating ? (evt.clientX - targetRect.left) / width : (evt.clientY - targetRect.top) / height) > 0.5,
							nextSibling = target.nextElementSibling,
							moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect),
							after
						;
	
						if (moveVector !== false) {
							_silent = true;
							setTimeout(_unsilent, 30);
	
							_cloneHide(isOwner);
	
							if (moveVector === 1 || moveVector === -1) {
								after = (moveVector === 1);
							}
							else if (floating) {
								var elTop = dragEl.offsetTop,
									tgTop = target.offsetTop;
	
								if (elTop === tgTop) {
									after = (target.previousElementSibling === dragEl) && !isWide || halfway && isWide;
								} else {
									after = tgTop > elTop;
								}
							} else {
								after = (nextSibling !== dragEl) && !isLong || halfway && isLong;
							}
	
							if (!dragEl.contains(el)) {
								if (after && !nextSibling) {
									el.appendChild(dragEl);
								} else {
									target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
								}
							}
	
							parentEl = dragEl.parentNode; // actualization
	
							this._animate(dragRect, dragEl);
							this._animate(targetRect, target);
						}
					}
				}
			},
	
			_animate: function (prevRect, target) {
				var ms = this.options.animation;
	
				if (ms) {
					var currentRect = target.getBoundingClientRect();
	
					_css(target, 'transition', 'none');
					_css(target, 'transform', 'translate3d('
						+ (prevRect.left - currentRect.left) + 'px,'
						+ (prevRect.top - currentRect.top) + 'px,0)'
					);
	
					target.offsetWidth; // repaint
	
					_css(target, 'transition', 'all ' + ms + 'ms');
					_css(target, 'transform', 'translate3d(0,0,0)');
	
					clearTimeout(target.animated);
					target.animated = setTimeout(function () {
						_css(target, 'transition', '');
						_css(target, 'transform', '');
						target.animated = false;
					}, ms);
				}
			},
	
			_offUpEvents: function () {
				var ownerDocument = this.el.ownerDocument;
	
				_off(document, 'touchmove', this._onTouchMove);
				_off(ownerDocument, 'mouseup', this._onDrop);
				_off(ownerDocument, 'touchend', this._onDrop);
				_off(ownerDocument, 'touchcancel', this._onDrop);
			},
	
			_onDrop: function (/**Event*/evt) {
				var el = this.el,
					options = this.options;
	
				clearInterval(this._loopId);
				clearInterval(autoScroll.pid);
				clearTimeout(this._dragStartTimer);
	
				// Unbind events
				_off(document, 'mousemove', this._onTouchMove);
	
				if (this.nativeDraggable) {
					_off(document, 'drop', this);
					_off(el, 'dragstart', this._onDragStart);
				}
	
				this._offUpEvents();
	
				if (evt) {
					if (moved) {
						evt.preventDefault();
						!options.dropBubble && evt.stopPropagation();
					}
	
					ghostEl && ghostEl.parentNode.removeChild(ghostEl);
	
					if (dragEl) {
						if (this.nativeDraggable) {
							_off(dragEl, 'dragend', this);
						}
	
						_disableDraggable(dragEl);
	
						// Remove class's
						_toggleClass(dragEl, this.options.ghostClass, false);
						_toggleClass(dragEl, this.options.chosenClass, false);
	
						if (rootEl !== parentEl) {
							newIndex = _index(dragEl);
	
							if (newIndex >= 0) {
								// drag from one list and drop into another
								_dispatchEvent(null, parentEl, 'sort', dragEl, rootEl, oldIndex, newIndex);
								_dispatchEvent(this, rootEl, 'sort', dragEl, rootEl, oldIndex, newIndex);
	
								// Add event
								_dispatchEvent(null, parentEl, 'add', dragEl, rootEl, oldIndex, newIndex);
	
								// Remove event
								_dispatchEvent(this, rootEl, 'remove', dragEl, rootEl, oldIndex, newIndex);
							}
						}
						else {
							// Remove clone
							cloneEl && cloneEl.parentNode.removeChild(cloneEl);
	
							if (dragEl.nextSibling !== nextEl) {
								// Get the index of the dragged element within its parent
								newIndex = _index(dragEl);
	
								if (newIndex >= 0) {
									// drag & drop within the same list
									_dispatchEvent(this, rootEl, 'update', dragEl, rootEl, oldIndex, newIndex);
									_dispatchEvent(this, rootEl, 'sort', dragEl, rootEl, oldIndex, newIndex);
								}
							}
						}
	
						if (Sortable.active) {
							if (newIndex === null || newIndex === -1) {
								newIndex = oldIndex;
							}
	
							_dispatchEvent(this, rootEl, 'end', dragEl, rootEl, oldIndex, newIndex);
	
							// Save sorting
							this.save();
						}
					}
	
					// Nulling
					rootEl =
					dragEl =
					parentEl =
					ghostEl =
					nextEl =
					cloneEl =
	
					scrollEl =
					scrollParentEl =
	
					tapEvt =
					touchEvt =
	
					moved =
					newIndex =
	
					lastEl =
					lastCSS =
	
					activeGroup =
					Sortable.active = null;
				}
			},
	
	
			handleEvent: function (/**Event*/evt) {
				var type = evt.type;
	
				if (type === 'dragover' || type === 'dragenter') {
					if (dragEl) {
						this._onDragOver(evt);
						_globalDragOver(evt);
					}
				}
				else if (type === 'drop' || type === 'dragend') {
					this._onDrop(evt);
				}
			},
	
	
			/**
			 * Serializes the item into an array of string.
			 * @returns {String[]}
			 */
			toArray: function () {
				var order = [],
					el,
					children = this.el.children,
					i = 0,
					n = children.length,
					options = this.options;
	
				for (; i < n; i++) {
					el = children[i];
					if (_closest(el, options.draggable, this.el)) {
						order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
					}
				}
	
				return order;
			},
	
	
			/**
			 * Sorts the elements according to the array.
			 * @param  {String[]}  order  order of the items
			 */
			sort: function (order) {
				var items = {}, rootEl = this.el;
	
				this.toArray().forEach(function (id, i) {
					var el = rootEl.children[i];
	
					if (_closest(el, this.options.draggable, rootEl)) {
						items[id] = el;
					}
				}, this);
	
				order.forEach(function (id) {
					if (items[id]) {
						rootEl.removeChild(items[id]);
						rootEl.appendChild(items[id]);
					}
				});
			},
	
	
			/**
			 * Save the current sorting
			 */
			save: function () {
				var store = this.options.store;
				store && store.set(this);
			},
	
	
			/**
			 * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
			 * @param   {HTMLElement}  el
			 * @param   {String}       [selector]  default: `options.draggable`
			 * @returns {HTMLElement|null}
			 */
			closest: function (el, selector) {
				return _closest(el, selector || this.options.draggable, this.el);
			},
	
	
			/**
			 * Set/get option
			 * @param   {string} name
			 * @param   {*}      [value]
			 * @returns {*}
			 */
			option: function (name, value) {
				var options = this.options;
	
				if (value === void 0) {
					return options[name];
				} else {
					options[name] = value;
	
					if (name === 'group') {
						_prepareGroup(options);
					}
				}
			},
	
	
			/**
			 * Destroy
			 */
			destroy: function () {
				var el = this.el;
	
				el[expando] = null;
	
				_off(el, 'mousedown', this._onTapStart);
				_off(el, 'touchstart', this._onTapStart);
	
				if (this.nativeDraggable) {
					_off(el, 'dragover', this);
					_off(el, 'dragenter', this);
				}
	
				// Remove draggable attributes
				Array.prototype.forEach.call(el.querySelectorAll('[draggable]'), function (el) {
					el.removeAttribute('draggable');
				});
	
				touchDragOverListeners.splice(touchDragOverListeners.indexOf(this._onDragOver), 1);
	
				this._onDrop();
	
				this.el = el = null;
			}
		};
	
	
		function _cloneHide(state) {
			if (cloneEl && (cloneEl.state !== state)) {
				_css(cloneEl, 'display', state ? 'none' : '');
				!state && cloneEl.state && rootEl.insertBefore(cloneEl, dragEl);
				cloneEl.state = state;
			}
		}
	
	
		function _closest(/**HTMLElement*/el, /**String*/selector, /**HTMLElement*/ctx) {
			if (el) {
				ctx = ctx || document;
				selector = selector.split('.');
	
				var tag = selector.shift().toUpperCase(),
					re = new RegExp('\\s(' + selector.join('|') + ')(?=\\s)', 'g');
	
				do {
					if (
						(tag === '>*' && el.parentNode === ctx) || (
							(tag === '' || el.nodeName.toUpperCase() == tag) &&
							(!selector.length || ((' ' + el.className + ' ').match(re) || []).length == selector.length)
						)
					) {
						return el;
					}
				}
				while (el !== ctx && (el = el.parentNode));
			}
	
			return null;
		}
	
	
		function _globalDragOver(/**Event*/evt) {
			if (evt.dataTransfer) {
				evt.dataTransfer.dropEffect = 'move';
			}
			evt.preventDefault();
		}
	
	
		function _on(el, event, fn) {
			el.addEventListener(event, fn, false);
		}
	
	
		function _off(el, event, fn) {
			el.removeEventListener(event, fn, false);
		}
	
	
		function _toggleClass(el, name, state) {
			if (el) {
				if (el.classList) {
					el.classList[state ? 'add' : 'remove'](name);
				}
				else {
					var className = (' ' + el.className + ' ').replace(RSPACE, ' ').replace(' ' + name + ' ', ' ');
					el.className = (className + (state ? ' ' + name : '')).replace(RSPACE, ' ');
				}
			}
		}
	
	
		function _css(el, prop, val) {
			var style = el && el.style;
	
			if (style) {
				if (val === void 0) {
					if (document.defaultView && document.defaultView.getComputedStyle) {
						val = document.defaultView.getComputedStyle(el, '');
					}
					else if (el.currentStyle) {
						val = el.currentStyle;
					}
	
					return prop === void 0 ? val : val[prop];
				}
				else {
					if (!(prop in style)) {
						prop = '-webkit-' + prop;
					}
	
					style[prop] = val + (typeof val === 'string' ? '' : 'px');
				}
			}
		}
	
	
		function _find(ctx, tagName, iterator) {
			if (ctx) {
				var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;
	
				if (iterator) {
					for (; i < n; i++) {
						iterator(list[i], i);
					}
				}
	
				return list;
			}
	
			return [];
		}
	
	
	
		function _dispatchEvent(sortable, rootEl, name, targetEl, fromEl, startIndex, newIndex) {
			var evt = document.createEvent('Event'),
				options = (sortable || rootEl[expando]).options,
				onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1);
	
			evt.initEvent(name, true, true);
	
			evt.to = rootEl;
			evt.from = fromEl || rootEl;
			evt.item = targetEl || rootEl;
			evt.clone = cloneEl;
	
			evt.oldIndex = startIndex;
			evt.newIndex = newIndex;
	
			rootEl.dispatchEvent(evt);
	
			if (options[onName]) {
				options[onName].call(sortable, evt);
			}
		}
	
	
		function _onMove(fromEl, toEl, dragEl, dragRect, targetEl, targetRect) {
			var evt,
				sortable = fromEl[expando],
				onMoveFn = sortable.options.onMove,
				retVal;
	
			evt = document.createEvent('Event');
			evt.initEvent('move', true, true);
	
			evt.to = toEl;
			evt.from = fromEl;
			evt.dragged = dragEl;
			evt.draggedRect = dragRect;
			evt.related = targetEl || toEl;
			evt.relatedRect = targetRect || toEl.getBoundingClientRect();
	
			fromEl.dispatchEvent(evt);
	
			if (onMoveFn) {
				retVal = onMoveFn.call(sortable, evt);
			}
	
			return retVal;
		}
	
	
		function _disableDraggable(el) {
			el.draggable = false;
		}
	
	
		function _unsilent() {
			_silent = false;
		}
	
	
		/** @returns {HTMLElement|false} */
		function _ghostIsLast(el, evt) {
			var lastEl = el.lastElementChild,
					rect = lastEl.getBoundingClientRect();
	
			return ((evt.clientY - (rect.top + rect.height) > 5) || (evt.clientX - (rect.right + rect.width) > 5)) && lastEl; // min delta
		}
	
	
		/**
		 * Generate id
		 * @param   {HTMLElement} el
		 * @returns {String}
		 * @private
		 */
		function _generateId(el) {
			var str = el.tagName + el.className + el.src + el.href + el.textContent,
				i = str.length,
				sum = 0;
	
			while (i--) {
				sum += str.charCodeAt(i);
			}
	
			return sum.toString(36);
		}
	
		/**
		 * Returns the index of an element within its parent
		 * @param  {HTMLElement} el
		 * @return {number}
		 */
		function _index(el) {
			var index = 0;
	
			if (!el || !el.parentNode) {
				return -1;
			}
	
			while (el && (el = el.previousElementSibling)) {
				if (el.nodeName.toUpperCase() !== 'TEMPLATE') {
					index++;
				}
			}
	
			return index;
		}
	
		function _throttle(callback, ms) {
			var args, _this;
	
			return function () {
				if (args === void 0) {
					args = arguments;
					_this = this;
	
					setTimeout(function () {
						if (args.length === 1) {
							callback.call(_this, args[0]);
						} else {
							callback.apply(_this, args);
						}
	
						args = void 0;
					}, ms);
				}
			};
		}
	
		function _extend(dst, src) {
			if (dst && src) {
				for (var key in src) {
					if (src.hasOwnProperty(key)) {
						dst[key] = src[key];
					}
				}
			}
	
			return dst;
		}
	
	
		// Export utils
		Sortable.utils = {
			on: _on,
			off: _off,
			css: _css,
			find: _find,
			is: function (el, selector) {
				return !!_closest(el, selector, el);
			},
			extend: _extend,
			throttle: _throttle,
			closest: _closest,
			toggleClass: _toggleClass,
			index: _index
		};
	
	
		/**
		 * Create sortable instance
		 * @param {HTMLElement}  el
		 * @param {Object}      [options]
		 */
		Sortable.create = function (el, options) {
			return new Sortable(el, options);
		};
	
	
		// Export
		Sortable.version = '1.4.2';
		return Sortable;
	});


/***/ },

/***/ 217:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * selectize.js (v0.12.1)
	 * Copyright (c) 2013–2015 Brian Reavis & contributors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
	 * file except in compliance with the License. You may obtain a copy of the License at:
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
	 * ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 *
	 * @author Brian Reavis <brian@thirdroute.com>
	 */
	
	/*jshint curly:false */
	/*jshint browser:true */
	
	(function(root, factory) {
		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(196),__webpack_require__(218),__webpack_require__(219)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (typeof exports === 'object') {
			module.exports = factory(require('jquery'), require('sifter'), require('microplugin'));
		} else {
			root.Selectize = factory(root.jQuery, root.Sifter, root.MicroPlugin);
		}
	}(this, function($, Sifter, MicroPlugin) {
		'use strict';
	
		var highlight = function($element, pattern) {
			if (typeof pattern === 'string' && !pattern.length) return;
			var regex = (typeof pattern === 'string') ? new RegExp(pattern, 'i') : pattern;
		
			var highlight = function(node) {
				var skip = 0;
				if (node.nodeType === 3) {
					var pos = node.data.search(regex);
					if (pos >= 0 && node.data.length > 0) {
						var match = node.data.match(regex);
						var spannode = document.createElement('span');
						spannode.className = 'highlight';
						var middlebit = node.splitText(pos);
						var endbit = middlebit.splitText(match[0].length);
						var middleclone = middlebit.cloneNode(true);
						spannode.appendChild(middleclone);
						middlebit.parentNode.replaceChild(spannode, middlebit);
						skip = 1;
					}
				} else if (node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
					for (var i = 0; i < node.childNodes.length; ++i) {
						i += highlight(node.childNodes[i]);
					}
				}
				return skip;
			};
		
			return $element.each(function() {
				highlight(this);
			});
		};
		
		var MicroEvent = function() {};
		MicroEvent.prototype = {
			on: function(event, fct){
				this._events = this._events || {};
				this._events[event] = this._events[event] || [];
				this._events[event].push(fct);
			},
			off: function(event, fct){
				var n = arguments.length;
				if (n === 0) return delete this._events;
				if (n === 1) return delete this._events[event];
		
				this._events = this._events || {};
				if (event in this._events === false) return;
				this._events[event].splice(this._events[event].indexOf(fct), 1);
			},
			trigger: function(event /* , args... */){
				this._events = this._events || {};
				if (event in this._events === false) return;
				for (var i = 0; i < this._events[event].length; i++){
					this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
				}
			}
		};
		
		/**
		 * Mixin will delegate all MicroEvent.js function in the destination object.
		 *
		 * - MicroEvent.mixin(Foobar) will make Foobar able to use MicroEvent
		 *
		 * @param {object} the object which will support MicroEvent
		 */
		MicroEvent.mixin = function(destObject){
			var props = ['on', 'off', 'trigger'];
			for (var i = 0; i < props.length; i++){
				destObject.prototype[props[i]] = MicroEvent.prototype[props[i]];
			}
		};
		
		var IS_MAC        = /Mac/.test(navigator.userAgent);
		
		var KEY_A         = 65;
		var KEY_COMMA     = 188;
		var KEY_RETURN    = 13;
		var KEY_ESC       = 27;
		var KEY_LEFT      = 37;
		var KEY_UP        = 38;
		var KEY_P         = 80;
		var KEY_RIGHT     = 39;
		var KEY_DOWN      = 40;
		var KEY_N         = 78;
		var KEY_BACKSPACE = 8;
		var KEY_DELETE    = 46;
		var KEY_SHIFT     = 16;
		var KEY_CMD       = IS_MAC ? 91 : 17;
		var KEY_CTRL      = IS_MAC ? 18 : 17;
		var KEY_TAB       = 9;
		
		var TAG_SELECT    = 1;
		var TAG_INPUT     = 2;
		
		// for now, android support in general is too spotty to support validity
		var SUPPORTS_VALIDITY_API = !/android/i.test(window.navigator.userAgent) && !!document.createElement('form').validity;
		
		var isset = function(object) {
			return typeof object !== 'undefined';
		};
		
		/**
		 * Converts a scalar to its best string representation
		 * for hash keys and HTML attribute values.
		 *
		 * Transformations:
		 *   'str'     -> 'str'
		 *   null      -> ''
		 *   undefined -> ''
		 *   true      -> '1'
		 *   false     -> '0'
		 *   0         -> '0'
		 *   1         -> '1'
		 *
		 * @param {string} value
		 * @returns {string|null}
		 */
		var hash_key = function(value) {
			if (typeof value === 'undefined' || value === null) return null;
			if (typeof value === 'boolean') return value ? '1' : '0';
			return value + '';
		};
		
		/**
		 * Escapes a string for use within HTML.
		 *
		 * @param {string} str
		 * @returns {string}
		 */
		var escape_html = function(str) {
			return (str + '')
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;');
		};
		
		/**
		 * Escapes "$" characters in replacement strings.
		 *
		 * @param {string} str
		 * @returns {string}
		 */
		var escape_replace = function(str) {
			return (str + '').replace(/\$/g, '$$$$');
		};
		
		var hook = {};
		
		/**
		 * Wraps `method` on `self` so that `fn`
		 * is invoked before the original method.
		 *
		 * @param {object} self
		 * @param {string} method
		 * @param {function} fn
		 */
		hook.before = function(self, method, fn) {
			var original = self[method];
			self[method] = function() {
				fn.apply(self, arguments);
				return original.apply(self, arguments);
			};
		};
		
		/**
		 * Wraps `method` on `self` so that `fn`
		 * is invoked after the original method.
		 *
		 * @param {object} self
		 * @param {string} method
		 * @param {function} fn
		 */
		hook.after = function(self, method, fn) {
			var original = self[method];
			self[method] = function() {
				var result = original.apply(self, arguments);
				fn.apply(self, arguments);
				return result;
			};
		};
		
		/**
		 * Wraps `fn` so that it can only be invoked once.
		 *
		 * @param {function} fn
		 * @returns {function}
		 */
		var once = function(fn) {
			var called = false;
			return function() {
				if (called) return;
				called = true;
				fn.apply(this, arguments);
			};
		};
		
		/**
		 * Wraps `fn` so that it can only be called once
		 * every `delay` milliseconds (invoked on the falling edge).
		 *
		 * @param {function} fn
		 * @param {int} delay
		 * @returns {function}
		 */
		var debounce = function(fn, delay) {
			var timeout;
			return function() {
				var self = this;
				var args = arguments;
				window.clearTimeout(timeout);
				timeout = window.setTimeout(function() {
					fn.apply(self, args);
				}, delay);
			};
		};
		
		/**
		 * Debounce all fired events types listed in `types`
		 * while executing the provided `fn`.
		 *
		 * @param {object} self
		 * @param {array} types
		 * @param {function} fn
		 */
		var debounce_events = function(self, types, fn) {
			var type;
			var trigger = self.trigger;
			var event_args = {};
		
			// override trigger method
			self.trigger = function() {
				var type = arguments[0];
				if (types.indexOf(type) !== -1) {
					event_args[type] = arguments;
				} else {
					return trigger.apply(self, arguments);
				}
			};
		
			// invoke provided function
			fn.apply(self, []);
			self.trigger = trigger;
		
			// trigger queued events
			for (type in event_args) {
				if (event_args.hasOwnProperty(type)) {
					trigger.apply(self, event_args[type]);
				}
			}
		};
		
		/**
		 * A workaround for http://bugs.jquery.com/ticket/6696
		 *
		 * @param {object} $parent - Parent element to listen on.
		 * @param {string} event - Event name.
		 * @param {string} selector - Descendant selector to filter by.
		 * @param {function} fn - Event handler.
		 */
		var watchChildEvent = function($parent, event, selector, fn) {
			$parent.on(event, selector, function(e) {
				var child = e.target;
				while (child && child.parentNode !== $parent[0]) {
					child = child.parentNode;
				}
				e.currentTarget = child;
				return fn.apply(this, [e]);
			});
		};
		
		/**
		 * Determines the current selection within a text input control.
		 * Returns an object containing:
		 *   - start
		 *   - length
		 *
		 * @param {object} input
		 * @returns {object}
		 */
		var getSelection = function(input) {
			var result = {};
			if ('selectionStart' in input) {
				result.start = input.selectionStart;
				result.length = input.selectionEnd - result.start;
			} else if (document.selection) {
				input.focus();
				var sel = document.selection.createRange();
				var selLen = document.selection.createRange().text.length;
				sel.moveStart('character', -input.value.length);
				result.start = sel.text.length - selLen;
				result.length = selLen;
			}
			return result;
		};
		
		/**
		 * Copies CSS properties from one element to another.
		 *
		 * @param {object} $from
		 * @param {object} $to
		 * @param {array} properties
		 */
		var transferStyles = function($from, $to, properties) {
			var i, n, styles = {};
			if (properties) {
				for (i = 0, n = properties.length; i < n; i++) {
					styles[properties[i]] = $from.css(properties[i]);
				}
			} else {
				styles = $from.css();
			}
			$to.css(styles);
		};
		
		/**
		 * Measures the width of a string within a
		 * parent element (in pixels).
		 *
		 * @param {string} str
		 * @param {object} $parent
		 * @returns {int}
		 */
		var measureString = function(str, $parent) {
			if (!str) {
				return 0;
			}
		
			var $test = $('<test>').css({
				position: 'absolute',
				top: -99999,
				left: -99999,
				width: 'auto',
				padding: 0,
				whiteSpace: 'pre'
			}).text(str).appendTo('body');
		
			transferStyles($parent, $test, [
				'letterSpacing',
				'fontSize',
				'fontFamily',
				'fontWeight',
				'textTransform'
			]);
		
			var width = $test.width();
			$test.remove();
		
			return width;
		};
		
		/**
		 * Sets up an input to grow horizontally as the user
		 * types. If the value is changed manually, you can
		 * trigger the "update" handler to resize:
		 *
		 * $input.trigger('update');
		 *
		 * @param {object} $input
		 */
		var autoGrow = function($input) {
			var currentWidth = null;
		
			var update = function(e, options) {
				var value, keyCode, printable, placeholder, width;
				var shift, character, selection;
				e = e || window.event || {};
				options = options || {};
		
				if (e.metaKey || e.altKey) return;
				if (!options.force && $input.data('grow') === false) return;
		
				value = $input.val();
				if (e.type && e.type.toLowerCase() === 'keydown') {
					keyCode = e.keyCode;
					printable = (
						(keyCode >= 97 && keyCode <= 122) || // a-z
						(keyCode >= 65 && keyCode <= 90)  || // A-Z
						(keyCode >= 48 && keyCode <= 57)  || // 0-9
						keyCode === 32 // space
					);
		
					if (keyCode === KEY_DELETE || keyCode === KEY_BACKSPACE) {
						selection = getSelection($input[0]);
						if (selection.length) {
							value = value.substring(0, selection.start) + value.substring(selection.start + selection.length);
						} else if (keyCode === KEY_BACKSPACE && selection.start) {
							value = value.substring(0, selection.start - 1) + value.substring(selection.start + 1);
						} else if (keyCode === KEY_DELETE && typeof selection.start !== 'undefined') {
							value = value.substring(0, selection.start) + value.substring(selection.start + 1);
						}
					} else if (printable) {
						shift = e.shiftKey;
						character = String.fromCharCode(e.keyCode);
						if (shift) character = character.toUpperCase();
						else character = character.toLowerCase();
						value += character;
					}
				}
		
				placeholder = $input.attr('placeholder');
				if (!value && placeholder) {
					value = placeholder;
				}
		
				width = measureString(value, $input) + 4;
				if (width !== currentWidth) {
					currentWidth = width;
					$input.width(width);
					$input.triggerHandler('resize');
				}
			};
		
			$input.on('keydown keyup update blur', update);
			update();
		};
		
		var Selectize = function($input, settings) {
			var key, i, n, dir, input, self = this;
			input = $input[0];
			input.selectize = self;
		
			// detect rtl environment
			var computedStyle = window.getComputedStyle && window.getComputedStyle(input, null);
			dir = computedStyle ? computedStyle.getPropertyValue('direction') : input.currentStyle && input.currentStyle.direction;
			dir = dir || $input.parents('[dir]:first').attr('dir') || '';
		
			// setup default state
			$.extend(self, {
				order            : 0,
				settings         : settings,
				$input           : $input,
				tabIndex         : $input.attr('tabindex') || '',
				tagType          : input.tagName.toLowerCase() === 'select' ? TAG_SELECT : TAG_INPUT,
				rtl              : /rtl/i.test(dir),
		
				eventNS          : '.selectize' + (++Selectize.count),
				highlightedValue : null,
				isOpen           : false,
				isDisabled       : false,
				isRequired       : $input.is('[required]'),
				isInvalid        : false,
				isLocked         : false,
				isFocused        : false,
				isInputHidden    : false,
				isSetup          : false,
				isShiftDown      : false,
				isCmdDown        : false,
				isCtrlDown       : false,
				ignoreFocus      : false,
				ignoreBlur       : false,
				ignoreHover      : false,
				hasOptions       : false,
				currentResults   : null,
				lastValue        : '',
				caretPos         : 0,
				loading          : 0,
				loadedSearches   : {},
		
				$activeOption    : null,
				$activeItems     : [],
		
				optgroups        : {},
				options          : {},
				userOptions      : {},
				items            : [],
				renderCache      : {},
				onSearchChange   : settings.loadThrottle === null ? self.onSearchChange : debounce(self.onSearchChange, settings.loadThrottle)
			});
		
			// search system
			self.sifter = new Sifter(this.options, {diacritics: settings.diacritics});
		
			// build options table
			if (self.settings.options) {
				for (i = 0, n = self.settings.options.length; i < n; i++) {
					self.registerOption(self.settings.options[i]);
				}
				delete self.settings.options;
			}
		
			// build optgroup table
			if (self.settings.optgroups) {
				for (i = 0, n = self.settings.optgroups.length; i < n; i++) {
					self.registerOptionGroup(self.settings.optgroups[i]);
				}
				delete self.settings.optgroups;
			}
		
			// option-dependent defaults
			self.settings.mode = self.settings.mode || (self.settings.maxItems === 1 ? 'single' : 'multi');
			if (typeof self.settings.hideSelected !== 'boolean') {
				self.settings.hideSelected = self.settings.mode === 'multi';
			}
		
			self.initializePlugins(self.settings.plugins);
			self.setupCallbacks();
			self.setupTemplates();
			self.setup();
		};
		
		// mixins
		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		
		MicroEvent.mixin(Selectize);
		MicroPlugin.mixin(Selectize);
		
		// methods
		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
		
		$.extend(Selectize.prototype, {
		
			/**
			 * Creates all elements and sets up event bindings.
			 */
			setup: function() {
				var self      = this;
				var settings  = self.settings;
				var eventNS   = self.eventNS;
				var $window   = $(window);
				var $document = $(document);
				var $input    = self.$input;
		
				var $wrapper;
				var $control;
				var $control_input;
				var $dropdown;
				var $dropdown_content;
				var $dropdown_parent;
				var inputMode;
				var timeout_blur;
				var timeout_focus;
				var classes;
				var classes_plugins;
		
				inputMode         = self.settings.mode;
				classes           = $input.attr('class') || '';
		
				$wrapper          = $('<div>').addClass(settings.wrapperClass).addClass(classes).addClass(inputMode);
				$control          = $('<div>').addClass(settings.inputClass).addClass('items').appendTo($wrapper);
				$control_input    = $('<input type="text" autocomplete="off" />').appendTo($control).attr('tabindex', $input.is(':disabled') ? '-1' : self.tabIndex);
				$dropdown_parent  = $(settings.dropdownParent || $wrapper);
				$dropdown         = $('<div>').addClass(settings.dropdownClass).addClass(inputMode).hide().appendTo($dropdown_parent);
				$dropdown_content = $('<div>').addClass(settings.dropdownContentClass).appendTo($dropdown);
		
				if(self.settings.copyClassesToDropdown) {
					$dropdown.addClass(classes);
				}
		
				$wrapper.css({
					width: $input[0].style.width
				});
		
				if (self.plugins.names.length) {
					classes_plugins = 'plugin-' + self.plugins.names.join(' plugin-');
					$wrapper.addClass(classes_plugins);
					$dropdown.addClass(classes_plugins);
				}
		
				if ((settings.maxItems === null || settings.maxItems > 1) && self.tagType === TAG_SELECT) {
					$input.attr('multiple', 'multiple');
				}
		
				if (self.settings.placeholder) {
					$control_input.attr('placeholder', settings.placeholder);
				}
		
				// if splitOn was not passed in, construct it from the delimiter to allow pasting universally
				if (!self.settings.splitOn && self.settings.delimiter) {
					var delimiterEscaped = self.settings.delimiter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
					self.settings.splitOn = new RegExp('\\s*' + delimiterEscaped + '+\\s*');
				}
		
				if ($input.attr('autocorrect')) {
					$control_input.attr('autocorrect', $input.attr('autocorrect'));
				}
		
				if ($input.attr('autocapitalize')) {
					$control_input.attr('autocapitalize', $input.attr('autocapitalize'));
				}
		
				self.$wrapper          = $wrapper;
				self.$control          = $control;
				self.$control_input    = $control_input;
				self.$dropdown         = $dropdown;
				self.$dropdown_content = $dropdown_content;
		
				$dropdown.on('mouseenter', '[data-selectable]', function() { return self.onOptionHover.apply(self, arguments); });
				$dropdown.on('mousedown click', '[data-selectable]', function() { return self.onOptionSelect.apply(self, arguments); });
				watchChildEvent($control, 'mousedown', '*:not(input)', function() { return self.onItemSelect.apply(self, arguments); });
				autoGrow($control_input);
		
				$control.on({
					mousedown : function() { return self.onMouseDown.apply(self, arguments); },
					click     : function() { return self.onClick.apply(self, arguments); }
				});
		
				$control_input.on({
					mousedown : function(e) { e.stopPropagation(); },
					keydown   : function() { return self.onKeyDown.apply(self, arguments); },
					keyup     : function() { return self.onKeyUp.apply(self, arguments); },
					keypress  : function() { return self.onKeyPress.apply(self, arguments); },
					resize    : function() { self.positionDropdown.apply(self, []); },
					blur      : function() { return self.onBlur.apply(self, arguments); },
					focus     : function() { self.ignoreBlur = false; return self.onFocus.apply(self, arguments); },
					paste     : function() { return self.onPaste.apply(self, arguments); }
				});
		
				$document.on('keydown' + eventNS, function(e) {
					self.isCmdDown = e[IS_MAC ? 'metaKey' : 'ctrlKey'];
					self.isCtrlDown = e[IS_MAC ? 'altKey' : 'ctrlKey'];
					self.isShiftDown = e.shiftKey;
				});
		
				$document.on('keyup' + eventNS, function(e) {
					if (e.keyCode === KEY_CTRL) self.isCtrlDown = false;
					if (e.keyCode === KEY_SHIFT) self.isShiftDown = false;
					if (e.keyCode === KEY_CMD) self.isCmdDown = false;
				});
		
				$document.on('mousedown' + eventNS, function(e) {
					if (self.isFocused) {
						// prevent events on the dropdown scrollbar from causing the control to blur
						if (e.target === self.$dropdown[0] || e.target.parentNode === self.$dropdown[0]) {
							return false;
						}
						// blur on click outside
						if (!self.$control.has(e.target).length && e.target !== self.$control[0]) {
							self.blur(e.target);
						}
					}
				});
		
				$window.on(['scroll' + eventNS, 'resize' + eventNS].join(' '), function() {
					if (self.isOpen) {
						self.positionDropdown.apply(self, arguments);
					}
				});
				$window.on('mousemove' + eventNS, function() {
					self.ignoreHover = false;
				});
		
				// store original children and tab index so that they can be
				// restored when the destroy() method is called.
				this.revertSettings = {
					$children : $input.children().detach(),
					tabindex  : $input.attr('tabindex')
				};
		
				$input.attr('tabindex', -1).hide().after(self.$wrapper);
		
				if ($.isArray(settings.items)) {
					self.setValue(settings.items);
					delete settings.items;
				}
		
				// feature detect for the validation API
				if (SUPPORTS_VALIDITY_API) {
					$input.on('invalid' + eventNS, function(e) {
						e.preventDefault();
						self.isInvalid = true;
						self.refreshState();
					});
				}
		
				self.updateOriginalInput();
				self.refreshItems();
				self.refreshState();
				self.updatePlaceholder();
				self.isSetup = true;
		
				if ($input.is(':disabled')) {
					self.disable();
				}
		
				self.on('change', this.onChange);
		
				$input.data('selectize', self);
				$input.addClass('selectized');
				self.trigger('initialize');
		
				// preload options
				if (settings.preload === true) {
					self.onSearchChange('');
				}
		
			},
		
			/**
			 * Sets up default rendering functions.
			 */
			setupTemplates: function() {
				var self = this;
				var field_label = self.settings.labelField;
				var field_optgroup = self.settings.optgroupLabelField;
		
				var templates = {
					'optgroup': function(data) {
						return '<div class="optgroup">' + data.html + '</div>';
					},
					'optgroup_header': function(data, escape) {
						return '<div class="optgroup-header">' + escape(data[field_optgroup]) + '</div>';
					},
					'option': function(data, escape) {
						return '<div class="option">' + escape(data[field_label]) + '</div>';
					},
					'item': function(data, escape) {
						return '<div class="item">' + escape(data[field_label]) + '</div>';
					},
					'option_create': function(data, escape) {
						return '<div class="create">Add <strong>' + escape(data.input) + '</strong>&hellip;</div>';
					}
				};
		
				self.settings.render = $.extend({}, templates, self.settings.render);
			},
		
			/**
			 * Maps fired events to callbacks provided
			 * in the settings used when creating the control.
			 */
			setupCallbacks: function() {
				var key, fn, callbacks = {
					'initialize'      : 'onInitialize',
					'change'          : 'onChange',
					'item_add'        : 'onItemAdd',
					'item_remove'     : 'onItemRemove',
					'clear'           : 'onClear',
					'option_add'      : 'onOptionAdd',
					'option_remove'   : 'onOptionRemove',
					'option_clear'    : 'onOptionClear',
					'optgroup_add'    : 'onOptionGroupAdd',
					'optgroup_remove' : 'onOptionGroupRemove',
					'optgroup_clear'  : 'onOptionGroupClear',
					'dropdown_open'   : 'onDropdownOpen',
					'dropdown_close'  : 'onDropdownClose',
					'type'            : 'onType',
					'load'            : 'onLoad',
					'focus'           : 'onFocus',
					'blur'            : 'onBlur'
				};
		
				for (key in callbacks) {
					if (callbacks.hasOwnProperty(key)) {
						fn = this.settings[callbacks[key]];
						if (fn) this.on(key, fn);
					}
				}
			},
		
			/**
			 * Triggered when the main control element
			 * has a click event.
			 *
			 * @param {object} e
			 * @return {boolean}
			 */
			onClick: function(e) {
				var self = this;
		
				// necessary for mobile webkit devices (manual focus triggering
				// is ignored unless invoked within a click event)
				if (!self.isFocused) {
					self.focus();
					e.preventDefault();
				}
			},
		
			/**
			 * Triggered when the main control element
			 * has a mouse down event.
			 *
			 * @param {object} e
			 * @return {boolean}
			 */
			onMouseDown: function(e) {
				var self = this;
				var defaultPrevented = e.isDefaultPrevented();
				var $target = $(e.target);
		
				if (self.isFocused) {
					// retain focus by preventing native handling. if the
					// event target is the input it should not be modified.
					// otherwise, text selection within the input won't work.
					if (e.target !== self.$control_input[0]) {
						if (self.settings.mode === 'single') {
							// toggle dropdown
							self.isOpen ? self.close() : self.open();
						} else if (!defaultPrevented) {
							self.setActiveItem(null);
						}
						return false;
					}
				} else {
					// give control focus
					if (!defaultPrevented) {
						window.setTimeout(function() {
							self.focus();
						}, 0);
					}
				}
			},
		
			/**
			 * Triggered when the value of the control has been changed.
			 * This should propagate the event to the original DOM
			 * input / select element.
			 */
			onChange: function() {
				this.$input.trigger('change');
			},
		
			/**
			 * Triggered on <input> paste.
			 *
			 * @param {object} e
			 * @returns {boolean}
			 */
			onPaste: function(e) {
				var self = this;
				if (self.isFull() || self.isInputHidden || self.isLocked) {
					e.preventDefault();
				} else {
					// If a regex or string is included, this will split the pasted
					// input and create Items for each separate value
					if (self.settings.splitOn) {
						setTimeout(function() {
							var splitInput = $.trim(self.$control_input.val() || '').split(self.settings.splitOn);
							for (var i = 0, n = splitInput.length; i < n; i++) {
								self.createItem(splitInput[i]);
							}
						}, 0);
					}
				}
			},
		
			/**
			 * Triggered on <input> keypress.
			 *
			 * @param {object} e
			 * @returns {boolean}
			 */
			onKeyPress: function(e) {
				if (this.isLocked) return e && e.preventDefault();
				var character = String.fromCharCode(e.keyCode || e.which);
				if (this.settings.create && this.settings.mode === 'multi' && character === this.settings.delimiter) {
					this.createItem();
					e.preventDefault();
					return false;
				}
			},
		
			/**
			 * Triggered on <input> keydown.
			 *
			 * @param {object} e
			 * @returns {boolean}
			 */
			onKeyDown: function(e) {
				var isInput = e.target === this.$control_input[0];
				var self = this;
		
				if (self.isLocked) {
					if (e.keyCode !== KEY_TAB) {
						e.preventDefault();
					}
					return;
				}
		
				switch (e.keyCode) {
					case KEY_A:
						if (self.isCmdDown) {
							self.selectAll();
							return;
						}
						break;
					case KEY_ESC:
						if (self.isOpen) {
							e.preventDefault();
							e.stopPropagation();
							self.close();
						}
						return;
					case KEY_N:
						if (!e.ctrlKey || e.altKey) break;
					case KEY_DOWN:
						if (!self.isOpen && self.hasOptions) {
							self.open();
						} else if (self.$activeOption) {
							self.ignoreHover = true;
							var $next = self.getAdjacentOption(self.$activeOption, 1);
							if ($next.length) self.setActiveOption($next, true, true);
						}
						e.preventDefault();
						return;
					case KEY_P:
						if (!e.ctrlKey || e.altKey) break;
					case KEY_UP:
						if (self.$activeOption) {
							self.ignoreHover = true;
							var $prev = self.getAdjacentOption(self.$activeOption, -1);
							if ($prev.length) self.setActiveOption($prev, true, true);
						}
						e.preventDefault();
						return;
					case KEY_RETURN:
						if (self.isOpen && self.$activeOption) {
							self.onOptionSelect({currentTarget: self.$activeOption});
							e.preventDefault();
						}
						return;
					case KEY_LEFT:
						self.advanceSelection(-1, e);
						return;
					case KEY_RIGHT:
						self.advanceSelection(1, e);
						return;
					case KEY_TAB:
						if (self.settings.selectOnTab && self.isOpen && self.$activeOption) {
							self.onOptionSelect({currentTarget: self.$activeOption});
		
							// Default behaviour is to jump to the next field, we only want this
							// if the current field doesn't accept any more entries
							if (!self.isFull()) {
								e.preventDefault();
							}
						}
						if (self.settings.create && self.createItem()) {
							e.preventDefault();
						}
						return;
					case KEY_BACKSPACE:
					case KEY_DELETE:
						self.deleteSelection(e);
						return;
				}
		
				if ((self.isFull() || self.isInputHidden) && !(IS_MAC ? e.metaKey : e.ctrlKey)) {
					e.preventDefault();
					return;
				}
			},
		
			/**
			 * Triggered on <input> keyup.
			 *
			 * @param {object} e
			 * @returns {boolean}
			 */
			onKeyUp: function(e) {
				var self = this;
		
				if (self.isLocked) return e && e.preventDefault();
				var value = self.$control_input.val() || '';
				if (self.lastValue !== value) {
					self.lastValue = value;
					self.onSearchChange(value);
					self.refreshOptions();
					self.trigger('type', value);
				}
			},
		
			/**
			 * Invokes the user-provide option provider / loader.
			 *
			 * Note: this function is debounced in the Selectize
			 * constructor (by `settings.loadDelay` milliseconds)
			 *
			 * @param {string} value
			 */
			onSearchChange: function(value) {
				var self = this;
				var fn = self.settings.load;
				if (!fn) return;
				if (self.loadedSearches.hasOwnProperty(value)) return;
				self.loadedSearches[value] = true;
				self.load(function(callback) {
					fn.apply(self, [value, callback]);
				});
			},
		
			/**
			 * Triggered on <input> focus.
			 *
			 * @param {object} e (optional)
			 * @returns {boolean}
			 */
			onFocus: function(e) {
				var self = this;
				var wasFocused = self.isFocused;
		
				if (self.isDisabled) {
					self.blur();
					e && e.preventDefault();
					return false;
				}
		
				if (self.ignoreFocus) return;
				self.isFocused = true;
				if (self.settings.preload === 'focus') self.onSearchChange('');
		
				if (!wasFocused) self.trigger('focus');
		
				if (!self.$activeItems.length) {
					self.showInput();
					self.setActiveItem(null);
					self.refreshOptions(!!self.settings.openOnFocus);
				}
		
				self.refreshState();
			},
		
			/**
			 * Triggered on <input> blur.
			 *
			 * @param {object} e
			 * @param {Element} dest
			 */
			onBlur: function(e, dest) {
				var self = this;
				if (!self.isFocused) return;
				self.isFocused = false;
		
				if (self.ignoreFocus) {
					return;
				} else if (!self.ignoreBlur && document.activeElement === self.$dropdown_content[0]) {
					// necessary to prevent IE closing the dropdown when the scrollbar is clicked
					self.ignoreBlur = true;
					self.onFocus(e);
					return;
				}
		
				var deactivate = function() {
					self.close();
					self.setTextboxValue('');
					self.setActiveItem(null);
					self.setActiveOption(null);
					self.setCaret(self.items.length);
					self.refreshState();
		
					// IE11 bug: element still marked as active
					(dest || document.body).focus();
		
					self.ignoreFocus = false;
					self.trigger('blur');
				};
		
				self.ignoreFocus = true;
				if (self.settings.create && self.settings.createOnBlur) {
					self.createItem(null, false, deactivate);
				} else {
					deactivate();
				}
			},
		
			/**
			 * Triggered when the user rolls over
			 * an option in the autocomplete dropdown menu.
			 *
			 * @param {object} e
			 * @returns {boolean}
			 */
			onOptionHover: function(e) {
				if (this.ignoreHover) return;
				this.setActiveOption(e.currentTarget, false);
			},
		
			/**
			 * Triggered when the user clicks on an option
			 * in the autocomplete dropdown menu.
			 *
			 * @param {object} e
			 * @returns {boolean}
			 */
			onOptionSelect: function(e) {
				var value, $target, $option, self = this;
		
				if (e.preventDefault) {
					e.preventDefault();
					e.stopPropagation();
				}
		
				$target = $(e.currentTarget);
				if ($target.hasClass('create')) {
					self.createItem(null, function() {
						if (self.settings.closeAfterSelect) {
							self.close();
						}
					});
				} else {
					value = $target.attr('data-value');
					if (typeof value !== 'undefined') {
						self.lastQuery = null;
						self.setTextboxValue('');
						self.addItem(value);
						if (self.settings.closeAfterSelect) {
							self.close();
						} else if (!self.settings.hideSelected && e.type && /mouse/.test(e.type)) {
							self.setActiveOption(self.getOption(value));
						}
					}
				}
			},
		
			/**
			 * Triggered when the user clicks on an item
			 * that has been selected.
			 *
			 * @param {object} e
			 * @returns {boolean}
			 */
			onItemSelect: function(e) {
				var self = this;
		
				if (self.isLocked) return;
				if (self.settings.mode === 'multi') {
					e.preventDefault();
					self.setActiveItem(e.currentTarget, e);
				}
			},
		
			/**
			 * Invokes the provided method that provides
			 * results to a callback---which are then added
			 * as options to the control.
			 *
			 * @param {function} fn
			 */
			load: function(fn) {
				var self = this;
				var $wrapper = self.$wrapper.addClass(self.settings.loadingClass);
		
				self.loading++;
				fn.apply(self, [function(results) {
					self.loading = Math.max(self.loading - 1, 0);
					if (results && results.length) {
						self.addOption(results);
						self.refreshOptions(self.isFocused && !self.isInputHidden);
					}
					if (!self.loading) {
						$wrapper.removeClass(self.settings.loadingClass);
					}
					self.trigger('load', results);
				}]);
			},
		
			/**
			 * Sets the input field of the control to the specified value.
			 *
			 * @param {string} value
			 */
			setTextboxValue: function(value) {
				var $input = this.$control_input;
				var changed = $input.val() !== value;
				if (changed) {
					$input.val(value).triggerHandler('update');
					this.lastValue = value;
				}
			},
		
			/**
			 * Returns the value of the control. If multiple items
			 * can be selected (e.g. <select multiple>), this returns
			 * an array. If only one item can be selected, this
			 * returns a string.
			 *
			 * @returns {mixed}
			 */
			getValue: function() {
				if (this.tagType === TAG_SELECT && this.$input.attr('multiple')) {
					return this.items;
				} else {
					return this.items.join(this.settings.delimiter);
				}
			},
		
			/**
			 * Resets the selected items to the given value.
			 *
			 * @param {mixed} value
			 */
			setValue: function(value, silent) {
				var events = silent ? [] : ['change'];
		
				debounce_events(this, events, function() {
					this.clear(silent);
					this.addItems(value, silent);
				});
			},
		
			/**
			 * Sets the selected item.
			 *
			 * @param {object} $item
			 * @param {object} e (optional)
			 */
			setActiveItem: function($item, e) {
				var self = this;
				var eventName;
				var i, idx, begin, end, item, swap;
				var $last;
		
				if (self.settings.mode === 'single') return;
				$item = $($item);
		
				// clear the active selection
				if (!$item.length) {
					$(self.$activeItems).removeClass('active');
					self.$activeItems = [];
					if (self.isFocused) {
						self.showInput();
					}
					return;
				}
		
				// modify selection
				eventName = e && e.type.toLowerCase();
		
				if (eventName === 'mousedown' && self.isShiftDown && self.$activeItems.length) {
					$last = self.$control.children('.active:last');
					begin = Array.prototype.indexOf.apply(self.$control[0].childNodes, [$last[0]]);
					end   = Array.prototype.indexOf.apply(self.$control[0].childNodes, [$item[0]]);
					if (begin > end) {
						swap  = begin;
						begin = end;
						end   = swap;
					}
					for (i = begin; i <= end; i++) {
						item = self.$control[0].childNodes[i];
						if (self.$activeItems.indexOf(item) === -1) {
							$(item).addClass('active');
							self.$activeItems.push(item);
						}
					}
					e.preventDefault();
				} else if ((eventName === 'mousedown' && self.isCtrlDown) || (eventName === 'keydown' && this.isShiftDown)) {
					if ($item.hasClass('active')) {
						idx = self.$activeItems.indexOf($item[0]);
						self.$activeItems.splice(idx, 1);
						$item.removeClass('active');
					} else {
						self.$activeItems.push($item.addClass('active')[0]);
					}
				} else {
					$(self.$activeItems).removeClass('active');
					self.$activeItems = [$item.addClass('active')[0]];
				}
		
				// ensure control has focus
				self.hideInput();
				if (!this.isFocused) {
					self.focus();
				}
			},
		
			/**
			 * Sets the selected item in the dropdown menu
			 * of available options.
			 *
			 * @param {object} $object
			 * @param {boolean} scroll
			 * @param {boolean} animate
			 */
			setActiveOption: function($option, scroll, animate) {
				var height_menu, height_item, y;
				var scroll_top, scroll_bottom;
				var self = this;
		
				if (self.$activeOption) self.$activeOption.removeClass('active');
				self.$activeOption = null;
		
				$option = $($option);
				if (!$option.length) return;
		
				self.$activeOption = $option.addClass('active');
		
				if (scroll || !isset(scroll)) {
		
					height_menu   = self.$dropdown_content.height();
					height_item   = self.$activeOption.outerHeight(true);
					scroll        = self.$dropdown_content.scrollTop() || 0;
					y             = self.$activeOption.offset().top - self.$dropdown_content.offset().top + scroll;
					scroll_top    = y;
					scroll_bottom = y - height_menu + height_item;
		
					if (y + height_item > height_menu + scroll) {
						self.$dropdown_content.stop().animate({scrollTop: scroll_bottom}, animate ? self.settings.scrollDuration : 0);
					} else if (y < scroll) {
						self.$dropdown_content.stop().animate({scrollTop: scroll_top}, animate ? self.settings.scrollDuration : 0);
					}
		
				}
			},
		
			/**
			 * Selects all items (CTRL + A).
			 */
			selectAll: function() {
				var self = this;
				if (self.settings.mode === 'single') return;
		
				self.$activeItems = Array.prototype.slice.apply(self.$control.children(':not(input)').addClass('active'));
				if (self.$activeItems.length) {
					self.hideInput();
					self.close();
				}
				self.focus();
			},
		
			/**
			 * Hides the input element out of view, while
			 * retaining its focus.
			 */
			hideInput: function() {
				var self = this;
		
				self.setTextboxValue('');
				self.$control_input.css({opacity: 0, position: 'absolute', left: self.rtl ? 10000 : -10000});
				self.isInputHidden = true;
			},
		
			/**
			 * Restores input visibility.
			 */
			showInput: function() {
				this.$control_input.css({opacity: 1, position: 'relative', left: 0});
				this.isInputHidden = false;
			},
		
			/**
			 * Gives the control focus.
			 */
			focus: function() {
				var self = this;
				if (self.isDisabled) return;
		
				self.ignoreFocus = true;
				self.$control_input[0].focus();
				window.setTimeout(function() {
					self.ignoreFocus = false;
					self.onFocus();
				}, 0);
			},
		
			/**
			 * Forces the control out of focus.
			 *
			 * @param {Element} dest
			 */
			blur: function(dest) {
				this.$control_input[0].blur();
				this.onBlur(null, dest);
			},
		
			/**
			 * Returns a function that scores an object
			 * to show how good of a match it is to the
			 * provided query.
			 *
			 * @param {string} query
			 * @param {object} options
			 * @return {function}
			 */
			getScoreFunction: function(query) {
				return this.sifter.getScoreFunction(query, this.getSearchOptions());
			},
		
			/**
			 * Returns search options for sifter (the system
			 * for scoring and sorting results).
			 *
			 * @see https://github.com/brianreavis/sifter.js
			 * @return {object}
			 */
			getSearchOptions: function() {
				var settings = this.settings;
				var sort = settings.sortField;
				if (typeof sort === 'string') {
					sort = [{field: sort}];
				}
		
				return {
					fields      : settings.searchField,
					conjunction : settings.searchConjunction,
					sort        : sort
				};
			},
		
			/**
			 * Searches through available options and returns
			 * a sorted array of matches.
			 *
			 * Returns an object containing:
			 *
			 *   - query {string}
			 *   - tokens {array}
			 *   - total {int}
			 *   - items {array}
			 *
			 * @param {string} query
			 * @returns {object}
			 */
			search: function(query) {
				var i, value, score, result, calculateScore;
				var self     = this;
				var settings = self.settings;
				var options  = this.getSearchOptions();
		
				// validate user-provided result scoring function
				if (settings.score) {
					calculateScore = self.settings.score.apply(this, [query]);
					if (typeof calculateScore !== 'function') {
						throw new Error('Selectize "score" setting must be a function that returns a function');
					}
				}
		
				// perform search
				if (query !== self.lastQuery) {
					self.lastQuery = query;
					result = self.sifter.search(query, $.extend(options, {score: calculateScore}));
					self.currentResults = result;
				} else {
					result = $.extend(true, {}, self.currentResults);
				}
		
				// filter out selected items
				if (settings.hideSelected) {
					for (i = result.items.length - 1; i >= 0; i--) {
						if (self.items.indexOf(hash_key(result.items[i].id)) !== -1) {
							result.items.splice(i, 1);
						}
					}
				}
		
				return result;
			},
		
			/**
			 * Refreshes the list of available options shown
			 * in the autocomplete dropdown menu.
			 *
			 * @param {boolean} triggerDropdown
			 */
			refreshOptions: function(triggerDropdown) {
				var i, j, k, n, groups, groups_order, option, option_html, optgroup, optgroups, html, html_children, has_create_option;
				var $active, $active_before, $create;
		
				if (typeof triggerDropdown === 'undefined') {
					triggerDropdown = true;
				}
		
				var self              = this;
				var query             = $.trim(self.$control_input.val());
				var results           = self.search(query);
				var $dropdown_content = self.$dropdown_content;
				var active_before     = self.$activeOption && hash_key(self.$activeOption.attr('data-value'));
		
				// build markup
				n = results.items.length;
				if (typeof self.settings.maxOptions === 'number') {
					n = Math.min(n, self.settings.maxOptions);
				}
		
				// render and group available options individually
				groups = {};
				groups_order = [];
		
				for (i = 0; i < n; i++) {
					option      = self.options[results.items[i].id];
					option_html = self.render('option', option);
					optgroup    = option[self.settings.optgroupField] || '';
					optgroups   = $.isArray(optgroup) ? optgroup : [optgroup];
		
					for (j = 0, k = optgroups && optgroups.length; j < k; j++) {
						optgroup = optgroups[j];
						if (!self.optgroups.hasOwnProperty(optgroup)) {
							optgroup = '';
						}
						if (!groups.hasOwnProperty(optgroup)) {
							groups[optgroup] = [];
							groups_order.push(optgroup);
						}
						groups[optgroup].push(option_html);
					}
				}
		
				// sort optgroups
				if (this.settings.lockOptgroupOrder) {
					groups_order.sort(function(a, b) {
						var a_order = self.optgroups[a].$order || 0;
						var b_order = self.optgroups[b].$order || 0;
						return a_order - b_order;
					});
				}
		
				// render optgroup headers & join groups
				html = [];
				for (i = 0, n = groups_order.length; i < n; i++) {
					optgroup = groups_order[i];
					if (self.optgroups.hasOwnProperty(optgroup) && groups[optgroup].length) {
						// render the optgroup header and options within it,
						// then pass it to the wrapper template
						html_children = self.render('optgroup_header', self.optgroups[optgroup]) || '';
						html_children += groups[optgroup].join('');
						html.push(self.render('optgroup', $.extend({}, self.optgroups[optgroup], {
							html: html_children
						})));
					} else {
						html.push(groups[optgroup].join(''));
					}
				}
		
				$dropdown_content.html(html.join(''));
		
				// highlight matching terms inline
				if (self.settings.highlight && results.query.length && results.tokens.length) {
					for (i = 0, n = results.tokens.length; i < n; i++) {
						highlight($dropdown_content, results.tokens[i].regex);
					}
				}
		
				// add "selected" class to selected options
				if (!self.settings.hideSelected) {
					for (i = 0, n = self.items.length; i < n; i++) {
						self.getOption(self.items[i]).addClass('selected');
					}
				}
		
				// add create option
				has_create_option = self.canCreate(query);
				if (has_create_option) {
					$dropdown_content.prepend(self.render('option_create', {input: query}));
					$create = $($dropdown_content[0].childNodes[0]);
				}
		
				// activate
				self.hasOptions = results.items.length > 0 || has_create_option;
				if (self.hasOptions) {
					if (results.items.length > 0) {
						$active_before = active_before && self.getOption(active_before);
						if ($active_before && $active_before.length) {
							$active = $active_before;
						} else if (self.settings.mode === 'single' && self.items.length) {
							$active = self.getOption(self.items[0]);
						}
						if (!$active || !$active.length) {
							if ($create && !self.settings.addPrecedence) {
								$active = self.getAdjacentOption($create, 1);
							} else {
								$active = $dropdown_content.find('[data-selectable]:first');
							}
						}
					} else {
						$active = $create;
					}
					self.setActiveOption($active);
					if (triggerDropdown && !self.isOpen) { self.open(); }
				} else {
					self.setActiveOption(null);
					if (triggerDropdown && self.isOpen) { self.close(); }
				}
			},
		
			/**
			 * Adds an available option. If it already exists,
			 * nothing will happen. Note: this does not refresh
			 * the options list dropdown (use `refreshOptions`
			 * for that).
			 *
			 * Usage:
			 *
			 *   this.addOption(data)
			 *
			 * @param {object|array} data
			 */
			addOption: function(data) {
				var i, n, value, self = this;
		
				if ($.isArray(data)) {
					for (i = 0, n = data.length; i < n; i++) {
						self.addOption(data[i]);
					}
					return;
				}
		
				if (value = self.registerOption(data)) {
					self.userOptions[value] = true;
					self.lastQuery = null;
					self.trigger('option_add', value, data);
				}
			},
		
			/**
			 * Registers an option to the pool of options.
			 *
			 * @param {object} data
			 * @return {boolean|string}
			 */
			registerOption: function(data) {
				var key = hash_key(data[this.settings.valueField]);
				if (!key || this.options.hasOwnProperty(key)) return false;
				data.$order = data.$order || ++this.order;
				this.options[key] = data;
				return key;
			},
		
			/**
			 * Registers an option group to the pool of option groups.
			 *
			 * @param {object} data
			 * @return {boolean|string}
			 */
			registerOptionGroup: function(data) {
				var key = hash_key(data[this.settings.optgroupValueField]);
				if (!key) return false;
		
				data.$order = data.$order || ++this.order;
				this.optgroups[key] = data;
				return key;
			},
		
			/**
			 * Registers a new optgroup for options
			 * to be bucketed into.
			 *
			 * @param {string} id
			 * @param {object} data
			 */
			addOptionGroup: function(id, data) {
				data[this.settings.optgroupValueField] = id;
				if (id = this.registerOptionGroup(data)) {
					this.trigger('optgroup_add', id, data);
				}
			},
		
			/**
			 * Removes an existing option group.
			 *
			 * @param {string} id
			 */
			removeOptionGroup: function(id) {
				if (this.optgroups.hasOwnProperty(id)) {
					delete this.optgroups[id];
					this.renderCache = {};
					this.trigger('optgroup_remove', id);
				}
			},
		
			/**
			 * Clears all existing option groups.
			 */
			clearOptionGroups: function() {
				this.optgroups = {};
				this.renderCache = {};
				this.trigger('optgroup_clear');
			},
		
			/**
			 * Updates an option available for selection. If
			 * it is visible in the selected items or options
			 * dropdown, it will be re-rendered automatically.
			 *
			 * @param {string} value
			 * @param {object} data
			 */
			updateOption: function(value, data) {
				var self = this;
				var $item, $item_new;
				var value_new, index_item, cache_items, cache_options, order_old;
		
				value     = hash_key(value);
				value_new = hash_key(data[self.settings.valueField]);
		
				// sanity checks
				if (value === null) return;
				if (!self.options.hasOwnProperty(value)) return;
				if (typeof value_new !== 'string') throw new Error('Value must be set in option data');
		
				order_old = self.options[value].$order;
		
				// update references
				if (value_new !== value) {
					delete self.options[value];
					index_item = self.items.indexOf(value);
					if (index_item !== -1) {
						self.items.splice(index_item, 1, value_new);
					}
				}
				data.$order = data.$order || order_old;
				self.options[value_new] = data;
		
				// invalidate render cache
				cache_items = self.renderCache['item'];
				cache_options = self.renderCache['option'];
		
				if (cache_items) {
					delete cache_items[value];
					delete cache_items[value_new];
				}
				if (cache_options) {
					delete cache_options[value];
					delete cache_options[value_new];
				}
		
				// update the item if it's selected
				if (self.items.indexOf(value_new) !== -1) {
					$item = self.getItem(value);
					$item_new = $(self.render('item', data));
					if ($item.hasClass('active')) $item_new.addClass('active');
					$item.replaceWith($item_new);
				}
		
				// invalidate last query because we might have updated the sortField
				self.lastQuery = null;
		
				// update dropdown contents
				if (self.isOpen) {
					self.refreshOptions(false);
				}
			},
		
			/**
			 * Removes a single option.
			 *
			 * @param {string} value
			 * @param {boolean} silent
			 */
			removeOption: function(value, silent) {
				var self = this;
				value = hash_key(value);
		
				var cache_items = self.renderCache['item'];
				var cache_options = self.renderCache['option'];
				if (cache_items) delete cache_items[value];
				if (cache_options) delete cache_options[value];
		
				delete self.userOptions[value];
				delete self.options[value];
				self.lastQuery = null;
				self.trigger('option_remove', value);
				self.removeItem(value, silent);
			},
		
			/**
			 * Clears all options.
			 */
			clearOptions: function() {
				var self = this;
		
				self.loadedSearches = {};
				self.userOptions = {};
				self.renderCache = {};
				self.options = self.sifter.items = {};
				self.lastQuery = null;
				self.trigger('option_clear');
				self.clear();
			},
		
			/**
			 * Returns the jQuery element of the option
			 * matching the given value.
			 *
			 * @param {string} value
			 * @returns {object}
			 */
			getOption: function(value) {
				return this.getElementWithValue(value, this.$dropdown_content.find('[data-selectable]'));
			},
		
			/**
			 * Returns the jQuery element of the next or
			 * previous selectable option.
			 *
			 * @param {object} $option
			 * @param {int} direction  can be 1 for next or -1 for previous
			 * @return {object}
			 */
			getAdjacentOption: function($option, direction) {
				var $options = this.$dropdown.find('[data-selectable]');
				var index    = $options.index($option) + direction;
		
				return index >= 0 && index < $options.length ? $options.eq(index) : $();
			},
		
			/**
			 * Finds the first element with a "data-value" attribute
			 * that matches the given value.
			 *
			 * @param {mixed} value
			 * @param {object} $els
			 * @return {object}
			 */
			getElementWithValue: function(value, $els) {
				value = hash_key(value);
		
				if (typeof value !== 'undefined' && value !== null) {
					for (var i = 0, n = $els.length; i < n; i++) {
						if ($els[i].getAttribute('data-value') === value) {
							return $($els[i]);
						}
					}
				}
		
				return $();
			},
		
			/**
			 * Returns the jQuery element of the item
			 * matching the given value.
			 *
			 * @param {string} value
			 * @returns {object}
			 */
			getItem: function(value) {
				return this.getElementWithValue(value, this.$control.children());
			},
		
			/**
			 * "Selects" multiple items at once. Adds them to the list
			 * at the current caret position.
			 *
			 * @param {string} value
			 * @param {boolean} silent
			 */
			addItems: function(values, silent) {
				var items = $.isArray(values) ? values : [values];
				for (var i = 0, n = items.length; i < n; i++) {
					this.isPending = (i < n - 1);
					this.addItem(items[i], silent);
				}
			},
		
			/**
			 * "Selects" an item. Adds it to the list
			 * at the current caret position.
			 *
			 * @param {string} value
			 * @param {boolean} silent
			 */
			addItem: function(value, silent) {
				var events = silent ? [] : ['change'];
		
				debounce_events(this, events, function() {
					var $item, $option, $options;
					var self = this;
					var inputMode = self.settings.mode;
					var i, active, value_next, wasFull;
					value = hash_key(value);
		
					if (self.items.indexOf(value) !== -1) {
						if (inputMode === 'single') self.close();
						return;
					}
		
					if (!self.options.hasOwnProperty(value)) return;
					if (inputMode === 'single') self.clear(silent);
					if (inputMode === 'multi' && self.isFull()) return;
		
					$item = $(self.render('item', self.options[value]));
					wasFull = self.isFull();
					self.items.splice(self.caretPos, 0, value);
					self.insertAtCaret($item);
					if (!self.isPending || (!wasFull && self.isFull())) {
						self.refreshState();
					}
		
					if (self.isSetup) {
						$options = self.$dropdown_content.find('[data-selectable]');
		
						// update menu / remove the option (if this is not one item being added as part of series)
						if (!self.isPending) {
							$option = self.getOption(value);
							value_next = self.getAdjacentOption($option, 1).attr('data-value');
							self.refreshOptions(self.isFocused && inputMode !== 'single');
							if (value_next) {
								self.setActiveOption(self.getOption(value_next));
							}
						}
		
						// hide the menu if the maximum number of items have been selected or no options are left
						if (!$options.length || self.isFull()) {
							self.close();
						} else {
							self.positionDropdown();
						}
		
						self.updatePlaceholder();
						self.trigger('item_add', value, $item);
						self.updateOriginalInput({silent: silent});
					}
				});
			},
		
			/**
			 * Removes the selected item matching
			 * the provided value.
			 *
			 * @param {string} value
			 */
			removeItem: function(value, silent) {
				var self = this;
				var $item, i, idx;
		
				$item = (typeof value === 'object') ? value : self.getItem(value);
				value = hash_key($item.attr('data-value'));
				i = self.items.indexOf(value);
		
				if (i !== -1) {
					$item.remove();
					if ($item.hasClass('active')) {
						idx = self.$activeItems.indexOf($item[0]);
						self.$activeItems.splice(idx, 1);
					}
		
					self.items.splice(i, 1);
					self.lastQuery = null;
					if (!self.settings.persist && self.userOptions.hasOwnProperty(value)) {
						self.removeOption(value, silent);
					}
		
					if (i < self.caretPos) {
						self.setCaret(self.caretPos - 1);
					}
		
					self.refreshState();
					self.updatePlaceholder();
					self.updateOriginalInput({silent: silent});
					self.positionDropdown();
					self.trigger('item_remove', value, $item);
				}
			},
		
			/**
			 * Invokes the `create` method provided in the
			 * selectize options that should provide the data
			 * for the new item, given the user input.
			 *
			 * Once this completes, it will be added
			 * to the item list.
			 *
			 * @param {string} value
			 * @param {boolean} [triggerDropdown]
			 * @param {function} [callback]
			 * @return {boolean}
			 */
			createItem: function(input, triggerDropdown) {
				var self  = this;
				var caret = self.caretPos;
				input = input || $.trim(self.$control_input.val() || '');
		
				var callback = arguments[arguments.length - 1];
				if (typeof callback !== 'function') callback = function() {};
		
				if (typeof triggerDropdown !== 'boolean') {
					triggerDropdown = true;
				}
		
				if (!self.canCreate(input)) {
					callback();
					return false;
				}
		
				self.lock();
		
				var setup = (typeof self.settings.create === 'function') ? this.settings.create : function(input) {
					var data = {};
					data[self.settings.labelField] = input;
					data[self.settings.valueField] = input;
					return data;
				};
		
				var create = once(function(data) {
					self.unlock();
		
					if (!data || typeof data !== 'object') return callback();
					var value = hash_key(data[self.settings.valueField]);
					if (typeof value !== 'string') return callback();
		
					self.setTextboxValue('');
					self.addOption(data);
					self.setCaret(caret);
					self.addItem(value);
					self.refreshOptions(triggerDropdown && self.settings.mode !== 'single');
					callback(data);
				});
		
				var output = setup.apply(this, [input, create]);
				if (typeof output !== 'undefined') {
					create(output);
				}
		
				return true;
			},
		
			/**
			 * Re-renders the selected item lists.
			 */
			refreshItems: function() {
				this.lastQuery = null;
		
				if (this.isSetup) {
					this.addItem(this.items);
				}
		
				this.refreshState();
				this.updateOriginalInput();
			},
		
			/**
			 * Updates all state-dependent attributes
			 * and CSS classes.
			 */
			refreshState: function() {
				var invalid, self = this;
				if (self.isRequired) {
					if (self.items.length) self.isInvalid = false;
					self.$control_input.prop('required', invalid);
				}
				self.refreshClasses();
			},
		
			/**
			 * Updates all state-dependent CSS classes.
			 */
			refreshClasses: function() {
				var self     = this;
				var isFull   = self.isFull();
				var isLocked = self.isLocked;
		
				self.$wrapper
					.toggleClass('rtl', self.rtl);
		
				self.$control
					.toggleClass('focus', self.isFocused)
					.toggleClass('disabled', self.isDisabled)
					.toggleClass('required', self.isRequired)
					.toggleClass('invalid', self.isInvalid)
					.toggleClass('locked', isLocked)
					.toggleClass('full', isFull).toggleClass('not-full', !isFull)
					.toggleClass('input-active', self.isFocused && !self.isInputHidden)
					.toggleClass('dropdown-active', self.isOpen)
					.toggleClass('has-options', !$.isEmptyObject(self.options))
					.toggleClass('has-items', self.items.length > 0);
		
				self.$control_input.data('grow', !isFull && !isLocked);
			},
		
			/**
			 * Determines whether or not more items can be added
			 * to the control without exceeding the user-defined maximum.
			 *
			 * @returns {boolean}
			 */
			isFull: function() {
				return this.settings.maxItems !== null && this.items.length >= this.settings.maxItems;
			},
		
			/**
			 * Refreshes the original <select> or <input>
			 * element to reflect the current state.
			 */
			updateOriginalInput: function(opts) {
				var i, n, options, label, self = this;
				opts = opts || {};
		
				if (self.tagType === TAG_SELECT) {
					options = [];
					for (i = 0, n = self.items.length; i < n; i++) {
						label = self.options[self.items[i]][self.settings.labelField] || '';
						options.push('<option value="' + escape_html(self.items[i]) + '" selected="selected">' + escape_html(label) + '</option>');
					}
					if (!options.length && !this.$input.attr('multiple')) {
						options.push('<option value="" selected="selected"></option>');
					}
					self.$input.html(options.join(''));
				} else {
					self.$input.val(self.getValue());
					self.$input.attr('value',self.$input.val());
				}
		
				if (self.isSetup) {
					if (!opts.silent) {
						self.trigger('change', self.$input.val());
					}
				}
			},
		
			/**
			 * Shows/hide the input placeholder depending
			 * on if there items in the list already.
			 */
			updatePlaceholder: function() {
				if (!this.settings.placeholder) return;
				var $input = this.$control_input;
		
				if (this.items.length) {
					$input.removeAttr('placeholder');
				} else {
					$input.attr('placeholder', this.settings.placeholder);
				}
				$input.triggerHandler('update', {force: true});
			},
		
			/**
			 * Shows the autocomplete dropdown containing
			 * the available options.
			 */
			open: function() {
				var self = this;
		
				if (self.isLocked || self.isOpen || (self.settings.mode === 'multi' && self.isFull())) return;
				self.focus();
				self.isOpen = true;
				self.refreshState();
				self.$dropdown.css({visibility: 'hidden', display: 'block'});
				self.positionDropdown();
				self.$dropdown.css({visibility: 'visible'});
				self.trigger('dropdown_open', self.$dropdown);
			},
		
			/**
			 * Closes the autocomplete dropdown menu.
			 */
			close: function() {
				var self = this;
				var trigger = self.isOpen;
		
				if (self.settings.mode === 'single' && self.items.length) {
					self.hideInput();
				}
		
				self.isOpen = false;
				self.$dropdown.hide();
				self.setActiveOption(null);
				self.refreshState();
		
				if (trigger) self.trigger('dropdown_close', self.$dropdown);
			},
		
			/**
			 * Calculates and applies the appropriate
			 * position of the dropdown.
			 */
			positionDropdown: function() {
				var $control = this.$control;
				var offset = this.settings.dropdownParent === 'body' ? $control.offset() : $control.position();
				offset.top += $control.outerHeight(true);
		
				this.$dropdown.css({
					width : $control.outerWidth(),
					top   : offset.top,
					left  : offset.left
				});
			},
		
			/**
			 * Resets / clears all selected items
			 * from the control.
			 *
			 * @param {boolean} silent
			 */
			clear: function(silent) {
				var self = this;
		
				if (!self.items.length) return;
				self.$control.children(':not(input)').remove();
				self.items = [];
				self.lastQuery = null;
				self.setCaret(0);
				self.setActiveItem(null);
				self.updatePlaceholder();
				self.updateOriginalInput({silent: silent});
				self.refreshState();
				self.showInput();
				self.trigger('clear');
			},
		
			/**
			 * A helper method for inserting an element
			 * at the current caret position.
			 *
			 * @param {object} $el
			 */
			insertAtCaret: function($el) {
				var caret = Math.min(this.caretPos, this.items.length);
				if (caret === 0) {
					this.$control.prepend($el);
				} else {
					$(this.$control[0].childNodes[caret]).before($el);
				}
				this.setCaret(caret + 1);
			},
		
			/**
			 * Removes the current selected item(s).
			 *
			 * @param {object} e (optional)
			 * @returns {boolean}
			 */
			deleteSelection: function(e) {
				var i, n, direction, selection, values, caret, option_select, $option_select, $tail;
				var self = this;
		
				direction = (e && e.keyCode === KEY_BACKSPACE) ? -1 : 1;
				selection = getSelection(self.$control_input[0]);
		
				if (self.$activeOption && !self.settings.hideSelected) {
					option_select = self.getAdjacentOption(self.$activeOption, -1).attr('data-value');
				}
		
				// determine items that will be removed
				values = [];
		
				if (self.$activeItems.length) {
					$tail = self.$control.children('.active:' + (direction > 0 ? 'last' : 'first'));
					caret = self.$control.children(':not(input)').index($tail);
					if (direction > 0) { caret++; }
		
					for (i = 0, n = self.$activeItems.length; i < n; i++) {
						values.push($(self.$activeItems[i]).attr('data-value'));
					}
					if (e) {
						e.preventDefault();
						e.stopPropagation();
					}
				} else if ((self.isFocused || self.settings.mode === 'single') && self.items.length) {
					if (direction < 0 && selection.start === 0 && selection.length === 0) {
						values.push(self.items[self.caretPos - 1]);
					} else if (direction > 0 && selection.start === self.$control_input.val().length) {
						values.push(self.items[self.caretPos]);
					}
				}
		
				// allow the callback to abort
				if (!values.length || (typeof self.settings.onDelete === 'function' && self.settings.onDelete.apply(self, [values]) === false)) {
					return false;
				}
		
				// perform removal
				if (typeof caret !== 'undefined') {
					self.setCaret(caret);
				}
				while (values.length) {
					self.removeItem(values.pop());
				}
		
				self.showInput();
				self.positionDropdown();
				self.refreshOptions(true);
		
				// select previous option
				if (option_select) {
					$option_select = self.getOption(option_select);
					if ($option_select.length) {
						self.setActiveOption($option_select);
					}
				}
		
				return true;
			},
		
			/**
			 * Selects the previous / next item (depending
			 * on the `direction` argument).
			 *
			 * > 0 - right
			 * < 0 - left
			 *
			 * @param {int} direction
			 * @param {object} e (optional)
			 */
			advanceSelection: function(direction, e) {
				var tail, selection, idx, valueLength, cursorAtEdge, $tail;
				var self = this;
		
				if (direction === 0) return;
				if (self.rtl) direction *= -1;
		
				tail = direction > 0 ? 'last' : 'first';
				selection = getSelection(self.$control_input[0]);
		
				if (self.isFocused && !self.isInputHidden) {
					valueLength = self.$control_input.val().length;
					cursorAtEdge = direction < 0
						? selection.start === 0 && selection.length === 0
						: selection.start === valueLength;
		
					if (cursorAtEdge && !valueLength) {
						self.advanceCaret(direction, e);
					}
				} else {
					$tail = self.$control.children('.active:' + tail);
					if ($tail.length) {
						idx = self.$control.children(':not(input)').index($tail);
						self.setActiveItem(null);
						self.setCaret(direction > 0 ? idx + 1 : idx);
					}
				}
			},
		
			/**
			 * Moves the caret left / right.
			 *
			 * @param {int} direction
			 * @param {object} e (optional)
			 */
			advanceCaret: function(direction, e) {
				var self = this, fn, $adj;
		
				if (direction === 0) return;
		
				fn = direction > 0 ? 'next' : 'prev';
				if (self.isShiftDown) {
					$adj = self.$control_input[fn]();
					if ($adj.length) {
						self.hideInput();
						self.setActiveItem($adj);
						e && e.preventDefault();
					}
				} else {
					self.setCaret(self.caretPos + direction);
				}
			},
		
			/**
			 * Moves the caret to the specified index.
			 *
			 * @param {int} i
			 */
			setCaret: function(i) {
				var self = this;
		
				if (self.settings.mode === 'single') {
					i = self.items.length;
				} else {
					i = Math.max(0, Math.min(self.items.length, i));
				}
		
				if(!self.isPending) {
					// the input must be moved by leaving it in place and moving the
					// siblings, due to the fact that focus cannot be restored once lost
					// on mobile webkit devices
					var j, n, fn, $children, $child;
					$children = self.$control.children(':not(input)');
					for (j = 0, n = $children.length; j < n; j++) {
						$child = $($children[j]).detach();
						if (j <  i) {
							self.$control_input.before($child);
						} else {
							self.$control.append($child);
						}
					}
				}
		
				self.caretPos = i;
			},
		
			/**
			 * Disables user input on the control. Used while
			 * items are being asynchronously created.
			 */
			lock: function() {
				this.close();
				this.isLocked = true;
				this.refreshState();
			},
		
			/**
			 * Re-enables user input on the control.
			 */
			unlock: function() {
				this.isLocked = false;
				this.refreshState();
			},
		
			/**
			 * Disables user input on the control completely.
			 * While disabled, it cannot receive focus.
			 */
			disable: function() {
				var self = this;
				self.$input.prop('disabled', true);
				self.$control_input.prop('disabled', true).prop('tabindex', -1);
				self.isDisabled = true;
				self.lock();
			},
		
			/**
			 * Enables the control so that it can respond
			 * to focus and user input.
			 */
			enable: function() {
				var self = this;
				self.$input.prop('disabled', false);
				self.$control_input.prop('disabled', false).prop('tabindex', self.tabIndex);
				self.isDisabled = false;
				self.unlock();
			},
		
			/**
			 * Completely destroys the control and
			 * unbinds all event listeners so that it can
			 * be garbage collected.
			 */
			destroy: function() {
				var self = this;
				var eventNS = self.eventNS;
				var revertSettings = self.revertSettings;
		
				self.trigger('destroy');
				self.off();
				self.$wrapper.remove();
				self.$dropdown.remove();
		
				self.$input
					.html('')
					.append(revertSettings.$children)
					.removeAttr('tabindex')
					.removeClass('selectized')
					.attr({tabindex: revertSettings.tabindex})
					.show();
		
				self.$control_input.removeData('grow');
				self.$input.removeData('selectize');
		
				$(window).off(eventNS);
				$(document).off(eventNS);
				$(document.body).off(eventNS);
		
				delete self.$input[0].selectize;
			},
		
			/**
			 * A helper method for rendering "item" and
			 * "option" templates, given the data.
			 *
			 * @param {string} templateName
			 * @param {object} data
			 * @returns {string}
			 */
			render: function(templateName, data) {
				var value, id, label;
				var html = '';
				var cache = false;
				var self = this;
				var regex_tag = /^[\t \r\n]*<([a-z][a-z0-9\-_]*(?:\:[a-z][a-z0-9\-_]*)?)/i;
		
				if (templateName === 'option' || templateName === 'item') {
					value = hash_key(data[self.settings.valueField]);
					cache = !!value;
				}
		
				// pull markup from cache if it exists
				if (cache) {
					if (!isset(self.renderCache[templateName])) {
						self.renderCache[templateName] = {};
					}
					if (self.renderCache[templateName].hasOwnProperty(value)) {
						return self.renderCache[templateName][value];
					}
				}
		
				// render markup
				html = self.settings.render[templateName].apply(this, [data, escape_html]);
		
				// add mandatory attributes
				if (templateName === 'option' || templateName === 'option_create') {
					html = html.replace(regex_tag, '<$1 data-selectable');
				}
				if (templateName === 'optgroup') {
					id = data[self.settings.optgroupValueField] || '';
					html = html.replace(regex_tag, '<$1 data-group="' + escape_replace(escape_html(id)) + '"');
				}
				if (templateName === 'option' || templateName === 'item') {
					html = html.replace(regex_tag, '<$1 data-value="' + escape_replace(escape_html(value || '')) + '"');
				}
		
				// update cache
				if (cache) {
					self.renderCache[templateName][value] = html;
				}
		
				return html;
			},
		
			/**
			 * Clears the render cache for a template. If
			 * no template is given, clears all render
			 * caches.
			 *
			 * @param {string} templateName
			 */
			clearCache: function(templateName) {
				var self = this;
				if (typeof templateName === 'undefined') {
					self.renderCache = {};
				} else {
					delete self.renderCache[templateName];
				}
			},
		
			/**
			 * Determines whether or not to display the
			 * create item prompt, given a user input.
			 *
			 * @param {string} input
			 * @return {boolean}
			 */
			canCreate: function(input) {
				var self = this;
				if (!self.settings.create) return false;
				var filter = self.settings.createFilter;
				return input.length
					&& (typeof filter !== 'function' || filter.apply(self, [input]))
					&& (typeof filter !== 'string' || new RegExp(filter).test(input))
					&& (!(filter instanceof RegExp) || filter.test(input));
			}
		
		});
		
		
		Selectize.count = 0;
		Selectize.defaults = {
			options: [],
			optgroups: [],
		
			plugins: [],
			delimiter: ',',
			splitOn: null, // regexp or string for splitting up values from a paste command
			persist: true,
			diacritics: true,
			create: false,
			createOnBlur: false,
			createFilter: null,
			highlight: true,
			openOnFocus: true,
			maxOptions: 1000,
			maxItems: null,
			hideSelected: null,
			addPrecedence: false,
			selectOnTab: false,
			preload: false,
			allowEmptyOption: false,
			closeAfterSelect: false,
		
			scrollDuration: 60,
			loadThrottle: 300,
			loadingClass: 'loading',
		
			dataAttr: 'data-data',
			optgroupField: 'optgroup',
			valueField: 'value',
			labelField: 'text',
			optgroupLabelField: 'label',
			optgroupValueField: 'value',
			lockOptgroupOrder: false,
		
			sortField: '$order',
			searchField: ['text'],
			searchConjunction: 'and',
		
			mode: null,
			wrapperClass: 'selectize-control',
			inputClass: 'selectize-input',
			dropdownClass: 'selectize-dropdown',
			dropdownContentClass: 'selectize-dropdown-content',
		
			dropdownParent: null,
		
			copyClassesToDropdown: true,
		
			/*
			load                 : null, // function(query, callback) { ... }
			score                : null, // function(search) { ... }
			onInitialize         : null, // function() { ... }
			onChange             : null, // function(value) { ... }
			onItemAdd            : null, // function(value, $item) { ... }
			onItemRemove         : null, // function(value) { ... }
			onClear              : null, // function() { ... }
			onOptionAdd          : null, // function(value, data) { ... }
			onOptionRemove       : null, // function(value) { ... }
			onOptionClear        : null, // function() { ... }
			onOptionGroupAdd     : null, // function(id, data) { ... }
			onOptionGroupRemove  : null, // function(id) { ... }
			onOptionGroupClear   : null, // function() { ... }
			onDropdownOpen       : null, // function($dropdown) { ... }
			onDropdownClose      : null, // function($dropdown) { ... }
			onType               : null, // function(str) { ... }
			onDelete             : null, // function(values) { ... }
			*/
		
			render: {
				/*
				item: null,
				optgroup: null,
				optgroup_header: null,
				option: null,
				option_create: null
				*/
			}
		};
		
		
		$.fn.selectize = function(settings_user) {
			var defaults             = $.fn.selectize.defaults;
			var settings             = $.extend({}, defaults, settings_user);
			var attr_data            = settings.dataAttr;
			var field_label          = settings.labelField;
			var field_value          = settings.valueField;
			var field_optgroup       = settings.optgroupField;
			var field_optgroup_label = settings.optgroupLabelField;
			var field_optgroup_value = settings.optgroupValueField;
		
			/**
			 * Initializes selectize from a <input type="text"> element.
			 *
			 * @param {object} $input
			 * @param {object} settings_element
			 */
			var init_textbox = function($input, settings_element) {
				var i, n, values, option;
		
				var data_raw = $input.attr(attr_data);
		
				if (!data_raw) {
					var value = $.trim($input.val() || '');
					if (!settings.allowEmptyOption && !value.length) return;
					values = value.split(settings.delimiter);
					for (i = 0, n = values.length; i < n; i++) {
						option = {};
						option[field_label] = values[i];
						option[field_value] = values[i];
						settings_element.options.push(option);
					}
					settings_element.items = values;
				} else {
					settings_element.options = JSON.parse(data_raw);
					for (i = 0, n = settings_element.options.length; i < n; i++) {
						settings_element.items.push(settings_element.options[i][field_value]);
					}
				}
			};
		
			/**
			 * Initializes selectize from a <select> element.
			 *
			 * @param {object} $input
			 * @param {object} settings_element
			 */
			var init_select = function($input, settings_element) {
				var i, n, tagName, $children, order = 0;
				var options = settings_element.options;
				var optionsMap = {};
		
				var readData = function($el) {
					var data = attr_data && $el.attr(attr_data);
					if (typeof data === 'string' && data.length) {
						return JSON.parse(data);
					}
					return null;
				};
		
				var addOption = function($option, group) {
					$option = $($option);
		
					var value = hash_key($option.attr('value'));
					if (!value && !settings.allowEmptyOption) return;
		
					// if the option already exists, it's probably been
					// duplicated in another optgroup. in this case, push
					// the current group to the "optgroup" property on the
					// existing option so that it's rendered in both places.
					if (optionsMap.hasOwnProperty(value)) {
						if (group) {
							var arr = optionsMap[value][field_optgroup];
							if (!arr) {
								optionsMap[value][field_optgroup] = group;
							} else if (!$.isArray(arr)) {
								optionsMap[value][field_optgroup] = [arr, group];
							} else {
								arr.push(group);
							}
						}
						return;
					}
		
					var option             = readData($option) || {};
					option[field_label]    = option[field_label] || $option.text();
					option[field_value]    = option[field_value] || value;
					option[field_optgroup] = option[field_optgroup] || group;
		
					optionsMap[value] = option;
					options.push(option);
		
					if ($option.is(':selected')) {
						settings_element.items.push(value);
					}
				};
		
				var addGroup = function($optgroup) {
					var i, n, id, optgroup, $options;
		
					$optgroup = $($optgroup);
					id = $optgroup.attr('label');
		
					if (id) {
						optgroup = readData($optgroup) || {};
						optgroup[field_optgroup_label] = id;
						optgroup[field_optgroup_value] = id;
						settings_element.optgroups.push(optgroup);
					}
		
					$options = $('option', $optgroup);
					for (i = 0, n = $options.length; i < n; i++) {
						addOption($options[i], id);
					}
				};
		
				settings_element.maxItems = $input.attr('multiple') ? null : 1;
		
				$children = $input.children();
				for (i = 0, n = $children.length; i < n; i++) {
					tagName = $children[i].tagName.toLowerCase();
					if (tagName === 'optgroup') {
						addGroup($children[i]);
					} else if (tagName === 'option') {
						addOption($children[i]);
					}
				}
			};
		
			return this.each(function() {
				if (this.selectize) return;
		
				var instance;
				var $input = $(this);
				var tag_name = this.tagName.toLowerCase();
				var placeholder = $input.attr('placeholder') || $input.attr('data-placeholder');
				if (!placeholder && !settings.allowEmptyOption) {
					placeholder = $input.children('option[value=""]').text();
				}
		
				var settings_element = {
					'placeholder' : placeholder,
					'options'     : [],
					'optgroups'   : [],
					'items'       : []
				};
		
				if (tag_name === 'select') {
					init_select($input, settings_element);
				} else {
					init_textbox($input, settings_element);
				}
		
				instance = new Selectize($input, $.extend(true, {}, defaults, settings_element, settings_user));
			});
		};
		
		$.fn.selectize.defaults = Selectize.defaults;
		$.fn.selectize.support = {
			validity: SUPPORTS_VALIDITY_API
		};
		
		
		Selectize.define('drag_drop', function(options) {
			if (!$.fn.sortable) throw new Error('The "drag_drop" plugin requires jQuery UI "sortable".');
			if (this.settings.mode !== 'multi') return;
			var self = this;
		
			self.lock = (function() {
				var original = self.lock;
				return function() {
					var sortable = self.$control.data('sortable');
					if (sortable) sortable.disable();
					return original.apply(self, arguments);
				};
			})();
		
			self.unlock = (function() {
				var original = self.unlock;
				return function() {
					var sortable = self.$control.data('sortable');
					if (sortable) sortable.enable();
					return original.apply(self, arguments);
				};
			})();
		
			self.setup = (function() {
				var original = self.setup;
				return function() {
					original.apply(this, arguments);
		
					var $control = self.$control.sortable({
						items: '[data-value]',
						forcePlaceholderSize: true,
						disabled: self.isLocked,
						start: function(e, ui) {
							ui.placeholder.css('width', ui.helper.css('width'));
							$control.css({overflow: 'visible'});
						},
						stop: function() {
							$control.css({overflow: 'hidden'});
							var active = self.$activeItems ? self.$activeItems.slice() : null;
							var values = [];
							$control.children('[data-value]').each(function() {
								values.push($(this).attr('data-value'));
							});
							self.setValue(values);
							self.setActiveItem(active);
						}
					});
				};
			})();
		
		});
		
		Selectize.define('dropdown_header', function(options) {
			var self = this;
		
			options = $.extend({
				title         : 'Untitled',
				headerClass   : 'selectize-dropdown-header',
				titleRowClass : 'selectize-dropdown-header-title',
				labelClass    : 'selectize-dropdown-header-label',
				closeClass    : 'selectize-dropdown-header-close',
		
				html: function(data) {
					return (
						'<div class="' + data.headerClass + '">' +
							'<div class="' + data.titleRowClass + '">' +
								'<span class="' + data.labelClass + '">' + data.title + '</span>' +
								'<a href="javascript:void(0)" class="' + data.closeClass + '">&times;</a>' +
							'</div>' +
						'</div>'
					);
				}
			}, options);
		
			self.setup = (function() {
				var original = self.setup;
				return function() {
					original.apply(self, arguments);
					self.$dropdown_header = $(options.html(options));
					self.$dropdown.prepend(self.$dropdown_header);
				};
			})();
		
		});
		
		Selectize.define('optgroup_columns', function(options) {
			var self = this;
		
			options = $.extend({
				equalizeWidth  : true,
				equalizeHeight : true
			}, options);
		
			this.getAdjacentOption = function($option, direction) {
				var $options = $option.closest('[data-group]').find('[data-selectable]');
				var index    = $options.index($option) + direction;
		
				return index >= 0 && index < $options.length ? $options.eq(index) : $();
			};
		
			this.onKeyDown = (function() {
				var original = self.onKeyDown;
				return function(e) {
					var index, $option, $options, $optgroup;
		
					if (this.isOpen && (e.keyCode === KEY_LEFT || e.keyCode === KEY_RIGHT)) {
						self.ignoreHover = true;
						$optgroup = this.$activeOption.closest('[data-group]');
						index = $optgroup.find('[data-selectable]').index(this.$activeOption);
		
						if(e.keyCode === KEY_LEFT) {
							$optgroup = $optgroup.prev('[data-group]');
						} else {
							$optgroup = $optgroup.next('[data-group]');
						}
		
						$options = $optgroup.find('[data-selectable]');
						$option  = $options.eq(Math.min($options.length - 1, index));
						if ($option.length) {
							this.setActiveOption($option);
						}
						return;
					}
		
					return original.apply(this, arguments);
				};
			})();
		
			var getScrollbarWidth = function() {
				var div;
				var width = getScrollbarWidth.width;
				var doc = document;
		
				if (typeof width === 'undefined') {
					div = doc.createElement('div');
					div.innerHTML = '<div style="width:50px;height:50px;position:absolute;left:-50px;top:-50px;overflow:auto;"><div style="width:1px;height:100px;"></div></div>';
					div = div.firstChild;
					doc.body.appendChild(div);
					width = getScrollbarWidth.width = div.offsetWidth - div.clientWidth;
					doc.body.removeChild(div);
				}
				return width;
			};
		
			var equalizeSizes = function() {
				var i, n, height_max, width, width_last, width_parent, $optgroups;
		
				$optgroups = $('[data-group]', self.$dropdown_content);
				n = $optgroups.length;
				if (!n || !self.$dropdown_content.width()) return;
		
				if (options.equalizeHeight) {
					height_max = 0;
					for (i = 0; i < n; i++) {
						height_max = Math.max(height_max, $optgroups.eq(i).height());
					}
					$optgroups.css({height: height_max});
				}
		
				if (options.equalizeWidth) {
					width_parent = self.$dropdown_content.innerWidth() - getScrollbarWidth();
					width = Math.round(width_parent / n);
					$optgroups.css({width: width});
					if (n > 1) {
						width_last = width_parent - width * (n - 1);
						$optgroups.eq(n - 1).css({width: width_last});
					}
				}
			};
		
			if (options.equalizeHeight || options.equalizeWidth) {
				hook.after(this, 'positionDropdown', equalizeSizes);
				hook.after(this, 'refreshOptions', equalizeSizes);
			}
		
		
		});
		
		Selectize.define('remove_button', function(options) {
			if (this.settings.mode === 'single') return;
		
			options = $.extend({
				label     : '&times;',
				title     : 'Remove',
				className : 'remove',
				append    : true
			}, options);
		
			var self = this;
			var html = '<a href="javascript:void(0)" class="' + options.className + '" tabindex="-1" title="' + escape_html(options.title) + '">' + options.label + '</a>';
		
			/**
			 * Appends an element as a child (with raw HTML).
			 *
			 * @param {string} html_container
			 * @param {string} html_element
			 * @return {string}
			 */
			var append = function(html_container, html_element) {
				var pos = html_container.search(/(<\/[^>]+>\s*)$/);
				return html_container.substring(0, pos) + html_element + html_container.substring(pos);
			};
		
			this.setup = (function() {
				var original = self.setup;
				return function() {
					// override the item rendering method to add the button to each
					if (options.append) {
						var render_item = self.settings.render.item;
						self.settings.render.item = function(data) {
							return append(render_item.apply(this, arguments), html);
						};
					}
		
					original.apply(this, arguments);
		
					// add event listener
					this.$control.on('click', '.' + options.className, function(e) {
						e.preventDefault();
						if (self.isLocked) return;
		
						var $item = $(e.currentTarget).parent();
						self.setActiveItem($item);
						if (self.deleteSelection()) {
							self.setCaret(self.items.length);
						}
					});
		
				};
			})();
		
		});
		
		Selectize.define('restore_on_backspace', function(options) {
			var self = this;
		
			options.text = options.text || function(option) {
				return option[this.settings.labelField];
			};
		
			this.onKeyDown = (function() {
				var original = self.onKeyDown;
				return function(e) {
					var index, option;
					if (e.keyCode === KEY_BACKSPACE && this.$control_input.val() === '' && !this.$activeItems.length) {
						index = this.caretPos - 1;
						if (index >= 0 && index < this.items.length) {
							option = this.options[this.items[index]];
							if (this.deleteSelection(e)) {
								this.setTextboxValue(options.text.apply(this, [option]));
								this.refreshOptions(true);
							}
							e.preventDefault();
							return;
						}
					}
					return original.apply(this, arguments);
				};
			})();
		});
		
	
		return Selectize;
	}));

/***/ },

/***/ 218:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * sifter.js
	 * Copyright (c) 2013 Brian Reavis & contributors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
	 * file except in compliance with the License. You may obtain a copy of the License at:
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
	 * ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 *
	 * @author Brian Reavis <brian@thirdroute.com>
	 */
	
	(function(root, factory) {
		if (true) {
			!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (typeof exports === 'object') {
			module.exports = factory();
		} else {
			root.Sifter = factory();
		}
	}(this, function() {
	
		/**
		 * Textually searches arrays and hashes of objects
		 * by property (or multiple properties). Designed
		 * specifically for autocomplete.
		 *
		 * @constructor
		 * @param {array|object} items
		 * @param {object} items
		 */
		var Sifter = function(items, settings) {
			this.items = items;
			this.settings = settings || {diacritics: true};
		};
	
		/**
		 * Splits a search string into an array of individual
		 * regexps to be used to match results.
		 *
		 * @param {string} query
		 * @returns {array}
		 */
		Sifter.prototype.tokenize = function(query) {
			query = trim(String(query || '').toLowerCase());
			if (!query || !query.length) return [];
	
			var i, n, regex, letter;
			var tokens = [];
			var words = query.split(/ +/);
	
			for (i = 0, n = words.length; i < n; i++) {
				regex = escape_regex(words[i]);
				if (this.settings.diacritics) {
					for (letter in DIACRITICS) {
						if (DIACRITICS.hasOwnProperty(letter)) {
							regex = regex.replace(new RegExp(letter, 'g'), DIACRITICS[letter]);
						}
					}
				}
				tokens.push({
					string : words[i],
					regex  : new RegExp(regex, 'i')
				});
			}
	
			return tokens;
		};
	
		/**
		 * Iterates over arrays and hashes.
		 *
		 * ```
		 * this.iterator(this.items, function(item, id) {
		 *    // invoked for each item
		 * });
		 * ```
		 *
		 * @param {array|object} object
		 */
		Sifter.prototype.iterator = function(object, callback) {
			var iterator;
			if (is_array(object)) {
				iterator = Array.prototype.forEach || function(callback) {
					for (var i = 0, n = this.length; i < n; i++) {
						callback(this[i], i, this);
					}
				};
			} else {
				iterator = function(callback) {
					for (var key in this) {
						if (this.hasOwnProperty(key)) {
							callback(this[key], key, this);
						}
					}
				};
			}
	
			iterator.apply(object, [callback]);
		};
	
		/**
		 * Returns a function to be used to score individual results.
		 *
		 * Good matches will have a higher score than poor matches.
		 * If an item is not a match, 0 will be returned by the function.
		 *
		 * @param {object|string} search
		 * @param {object} options (optional)
		 * @returns {function}
		 */
		Sifter.prototype.getScoreFunction = function(search, options) {
			var self, fields, tokens, token_count;
	
			self        = this;
			search      = self.prepareSearch(search, options);
			tokens      = search.tokens;
			fields      = search.options.fields;
			token_count = tokens.length;
	
			/**
			 * Calculates how close of a match the
			 * given value is against a search token.
			 *
			 * @param {mixed} value
			 * @param {object} token
			 * @return {number}
			 */
			var scoreValue = function(value, token) {
				var score, pos;
	
				if (!value) return 0;
				value = String(value || '');
				pos = value.search(token.regex);
				if (pos === -1) return 0;
				score = token.string.length / value.length;
				if (pos === 0) score += 0.5;
				return score;
			};
	
			/**
			 * Calculates the score of an object
			 * against the search query.
			 *
			 * @param {object} token
			 * @param {object} data
			 * @return {number}
			 */
			var scoreObject = (function() {
				var field_count = fields.length;
				if (!field_count) {
					return function() { return 0; };
				}
				if (field_count === 1) {
					return function(token, data) {
						return scoreValue(data[fields[0]], token);
					};
				}
				return function(token, data) {
					for (var i = 0, sum = 0; i < field_count; i++) {
						sum += scoreValue(data[fields[i]], token);
					}
					return sum / field_count;
				};
			})();
	
			if (!token_count) {
				return function() { return 0; };
			}
			if (token_count === 1) {
				return function(data) {
					return scoreObject(tokens[0], data);
				};
			}
	
			if (search.options.conjunction === 'and') {
				return function(data) {
					var score;
					for (var i = 0, sum = 0; i < token_count; i++) {
						score = scoreObject(tokens[i], data);
						if (score <= 0) return 0;
						sum += score;
					}
					return sum / token_count;
				};
			} else {
				return function(data) {
					for (var i = 0, sum = 0; i < token_count; i++) {
						sum += scoreObject(tokens[i], data);
					}
					return sum / token_count;
				};
			}
		};
	
		/**
		 * Returns a function that can be used to compare two
		 * results, for sorting purposes. If no sorting should
		 * be performed, `null` will be returned.
		 *
		 * @param {string|object} search
		 * @param {object} options
		 * @return function(a,b)
		 */
		Sifter.prototype.getSortFunction = function(search, options) {
			var i, n, self, field, fields, fields_count, multiplier, multipliers, get_field, implicit_score, sort;
	
			self   = this;
			search = self.prepareSearch(search, options);
			sort   = (!search.query && options.sort_empty) || options.sort;
	
			/**
			 * Fetches the specified sort field value
			 * from a search result item.
			 *
			 * @param  {string} name
			 * @param  {object} result
			 * @return {mixed}
			 */
			get_field = function(name, result) {
				if (name === '$score') return result.score;
				return self.items[result.id][name];
			};
	
			// parse options
			fields = [];
			if (sort) {
				for (i = 0, n = sort.length; i < n; i++) {
					if (search.query || sort[i].field !== '$score') {
						fields.push(sort[i]);
					}
				}
			}
	
			// the "$score" field is implied to be the primary
			// sort field, unless it's manually specified
			if (search.query) {
				implicit_score = true;
				for (i = 0, n = fields.length; i < n; i++) {
					if (fields[i].field === '$score') {
						implicit_score = false;
						break;
					}
				}
				if (implicit_score) {
					fields.unshift({field: '$score', direction: 'desc'});
				}
			} else {
				for (i = 0, n = fields.length; i < n; i++) {
					if (fields[i].field === '$score') {
						fields.splice(i, 1);
						break;
					}
				}
			}
	
			multipliers = [];
			for (i = 0, n = fields.length; i < n; i++) {
				multipliers.push(fields[i].direction === 'desc' ? -1 : 1);
			}
	
			// build function
			fields_count = fields.length;
			if (!fields_count) {
				return null;
			} else if (fields_count === 1) {
				field = fields[0].field;
				multiplier = multipliers[0];
				return function(a, b) {
					return multiplier * cmp(
						get_field(field, a),
						get_field(field, b)
					);
				};
			} else {
				return function(a, b) {
					var i, result, a_value, b_value, field;
					for (i = 0; i < fields_count; i++) {
						field = fields[i].field;
						result = multipliers[i] * cmp(
							get_field(field, a),
							get_field(field, b)
						);
						if (result) return result;
					}
					return 0;
				};
			}
		};
	
		/**
		 * Parses a search query and returns an object
		 * with tokens and fields ready to be populated
		 * with results.
		 *
		 * @param {string} query
		 * @param {object} options
		 * @returns {object}
		 */
		Sifter.prototype.prepareSearch = function(query, options) {
			if (typeof query === 'object') return query;
	
			options = extend({}, options);
	
			var option_fields     = options.fields;
			var option_sort       = options.sort;
			var option_sort_empty = options.sort_empty;
	
			if (option_fields && !is_array(option_fields)) options.fields = [option_fields];
			if (option_sort && !is_array(option_sort)) options.sort = [option_sort];
			if (option_sort_empty && !is_array(option_sort_empty)) options.sort_empty = [option_sort_empty];
	
			return {
				options : options,
				query   : String(query || '').toLowerCase(),
				tokens  : this.tokenize(query),
				total   : 0,
				items   : []
			};
		};
	
		/**
		 * Searches through all items and returns a sorted array of matches.
		 *
		 * The `options` parameter can contain:
		 *
		 *   - fields {string|array}
		 *   - sort {array}
		 *   - score {function}
		 *   - filter {bool}
		 *   - limit {integer}
		 *
		 * Returns an object containing:
		 *
		 *   - options {object}
		 *   - query {string}
		 *   - tokens {array}
		 *   - total {int}
		 *   - items {array}
		 *
		 * @param {string} query
		 * @param {object} options
		 * @returns {object}
		 */
		Sifter.prototype.search = function(query, options) {
			var self = this, value, score, search, calculateScore;
			var fn_sort;
			var fn_score;
	
			search  = this.prepareSearch(query, options);
			options = search.options;
			query   = search.query;
	
			// generate result scoring function
			fn_score = options.score || self.getScoreFunction(search);
	
			// perform search and sort
			if (query.length) {
				self.iterator(self.items, function(item, id) {
					score = fn_score(item);
					if (options.filter === false || score > 0) {
						search.items.push({'score': score, 'id': id});
					}
				});
			} else {
				self.iterator(self.items, function(item, id) {
					search.items.push({'score': 1, 'id': id});
				});
			}
	
			fn_sort = self.getSortFunction(search, options);
			if (fn_sort) search.items.sort(fn_sort);
	
			// apply limits
			search.total = search.items.length;
			if (typeof options.limit === 'number') {
				search.items = search.items.slice(0, options.limit);
			}
	
			return search;
		};
	
		// utilities
		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	
		var cmp = function(a, b) {
			if (typeof a === 'number' && typeof b === 'number') {
				return a > b ? 1 : (a < b ? -1 : 0);
			}
			a = asciifold(String(a || ''));
			b = asciifold(String(b || ''));
			if (a > b) return 1;
			if (b > a) return -1;
			return 0;
		};
	
		var extend = function(a, b) {
			var i, n, k, object;
			for (i = 1, n = arguments.length; i < n; i++) {
				object = arguments[i];
				if (!object) continue;
				for (k in object) {
					if (object.hasOwnProperty(k)) {
						a[k] = object[k];
					}
				}
			}
			return a;
		};
	
		var trim = function(str) {
			return (str + '').replace(/^\s+|\s+$|/g, '');
		};
	
		var escape_regex = function(str) {
			return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
		};
	
		var is_array = Array.isArray || (typeof $ !== 'undefined' && $.isArray) || function(object) {
			return Object.prototype.toString.call(object) === '[object Array]';
		};
	
		var DIACRITICS = {
			'a': '[aÀÁÂÃÄÅàáâãäåĀāąĄ]',
			'c': '[cÇçćĆčČ]',
			'd': '[dđĐďĎð]',
			'e': '[eÈÉÊËèéêëěĚĒēęĘ]',
			'i': '[iÌÍÎÏìíîïĪī]',
			'l': '[lłŁ]',
			'n': '[nÑñňŇńŃ]',
			'o': '[oÒÓÔÕÕÖØòóôõöøŌō]',
			'r': '[rřŘ]',
			's': '[sŠšśŚ]',
			't': '[tťŤ]',
			'u': '[uÙÚÛÜùúûüůŮŪū]',
			'y': '[yŸÿýÝ]',
			'z': '[zŽžżŻźŹ]'
		};
	
		var asciifold = (function() {
			var i, n, k, chunk;
			var foreignletters = '';
			var lookup = {};
			for (k in DIACRITICS) {
				if (DIACRITICS.hasOwnProperty(k)) {
					chunk = DIACRITICS[k].substring(2, DIACRITICS[k].length - 1);
					foreignletters += chunk;
					for (i = 0, n = chunk.length; i < n; i++) {
						lookup[chunk.charAt(i)] = k;
					}
				}
			}
			var regexp = new RegExp('[' +  foreignletters + ']', 'g');
			return function(str) {
				return str.replace(regexp, function(foreignletter) {
					return lookup[foreignletter];
				}).toLowerCase();
			};
		})();
	
	
		// export
		// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	
		return Sifter;
	}));
	


/***/ },

/***/ 219:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * microplugin.js
	 * Copyright (c) 2013 Brian Reavis & contributors
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
	 * file except in compliance with the License. You may obtain a copy of the License at:
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software distributed under
	 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
	 * ANY KIND, either express or implied. See the License for the specific language
	 * governing permissions and limitations under the License.
	 *
	 * @author Brian Reavis <brian@thirdroute.com>
	 */
	
	(function(root, factory) {
		if (true) {
			!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		} else if (typeof exports === 'object') {
			module.exports = factory();
		} else {
			root.MicroPlugin = factory();
		}
	}(this, function() {
		var MicroPlugin = {};
	
		MicroPlugin.mixin = function(Interface) {
			Interface.plugins = {};
	
			/**
			 * Initializes the listed plugins (with options).
			 * Acceptable formats:
			 *
			 * List (without options):
			 *   ['a', 'b', 'c']
			 *
			 * List (with options):
			 *   [{'name': 'a', options: {}}, {'name': 'b', options: {}}]
			 *
			 * Hash (with options):
			 *   {'a': { ... }, 'b': { ... }, 'c': { ... }}
			 *
			 * @param {mixed} plugins
			 */
			Interface.prototype.initializePlugins = function(plugins) {
				var i, n, key;
				var self  = this;
				var queue = [];
	
				self.plugins = {
					names     : [],
					settings  : {},
					requested : {},
					loaded    : {}
				};
	
				if (utils.isArray(plugins)) {
					for (i = 0, n = plugins.length; i < n; i++) {
						if (typeof plugins[i] === 'string') {
							queue.push(plugins[i]);
						} else {
							self.plugins.settings[plugins[i].name] = plugins[i].options;
							queue.push(plugins[i].name);
						}
					}
				} else if (plugins) {
					for (key in plugins) {
						if (plugins.hasOwnProperty(key)) {
							self.plugins.settings[key] = plugins[key];
							queue.push(key);
						}
					}
				}
	
				while (queue.length) {
					self.require(queue.shift());
				}
			};
	
			Interface.prototype.loadPlugin = function(name) {
				var self    = this;
				var plugins = self.plugins;
				var plugin  = Interface.plugins[name];
	
				if (!Interface.plugins.hasOwnProperty(name)) {
					throw new Error('Unable to find "' +  name + '" plugin');
				}
	
				plugins.requested[name] = true;
				plugins.loaded[name] = plugin.fn.apply(self, [self.plugins.settings[name] || {}]);
				plugins.names.push(name);
			};
	
			/**
			 * Initializes a plugin.
			 *
			 * @param {string} name
			 */
			Interface.prototype.require = function(name) {
				var self = this;
				var plugins = self.plugins;
	
				if (!self.plugins.loaded.hasOwnProperty(name)) {
					if (plugins.requested[name]) {
						throw new Error('Plugin has circular dependency ("' + name + '")');
					}
					self.loadPlugin(name);
				}
	
				return plugins.loaded[name];
			};
	
			/**
			 * Registers a plugin.
			 *
			 * @param {string} name
			 * @param {function} fn
			 */
			Interface.define = function(name, fn) {
				Interface.plugins[name] = {
					'name' : name,
					'fn'   : fn
				};
			};
		};
	
		var utils = {
			isArray: Array.isArray || function(vArg) {
				return Object.prototype.toString.call(vArg) === '[object Array]';
			}
		};
	
		return MicroPlugin;
	}));

/***/ },

/***/ 225:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {
	/*
	 *
	 * More info at [www.dropzonejs.com](http://www.dropzonejs.com)
	 *
	 * Copyright (c) 2012, Matias Meno
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in
	 * all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 * THE SOFTWARE.
	 *
	 */
	
	(function() {
	  var Dropzone, Emitter, camelize, contentLoaded, detectVerticalSquash, drawImageIOSFix, noop, without,
	    __slice = [].slice,
	    __hasProp = {}.hasOwnProperty,
	    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };
	
	  noop = function() {};
	
	  Emitter = (function() {
	    function Emitter() {}
	
	    Emitter.prototype.addEventListener = Emitter.prototype.on;
	
	    Emitter.prototype.on = function(event, fn) {
	      this._callbacks = this._callbacks || {};
	      if (!this._callbacks[event]) {
	        this._callbacks[event] = [];
	      }
	      this._callbacks[event].push(fn);
	      return this;
	    };
	
	    Emitter.prototype.emit = function() {
	      var args, callback, callbacks, event, _i, _len;
	      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	      this._callbacks = this._callbacks || {};
	      callbacks = this._callbacks[event];
	      if (callbacks) {
	        for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
	          callback = callbacks[_i];
	          callback.apply(this, args);
	        }
	      }
	      return this;
	    };
	
	    Emitter.prototype.removeListener = Emitter.prototype.off;
	
	    Emitter.prototype.removeAllListeners = Emitter.prototype.off;
	
	    Emitter.prototype.removeEventListener = Emitter.prototype.off;
	
	    Emitter.prototype.off = function(event, fn) {
	      var callback, callbacks, i, _i, _len;
	      if (!this._callbacks || arguments.length === 0) {
	        this._callbacks = {};
	        return this;
	      }
	      callbacks = this._callbacks[event];
	      if (!callbacks) {
	        return this;
	      }
	      if (arguments.length === 1) {
	        delete this._callbacks[event];
	        return this;
	      }
	      for (i = _i = 0, _len = callbacks.length; _i < _len; i = ++_i) {
	        callback = callbacks[i];
	        if (callback === fn) {
	          callbacks.splice(i, 1);
	          break;
	        }
	      }
	      return this;
	    };
	
	    return Emitter;
	
	  })();
	
	  Dropzone = (function(_super) {
	    var extend, resolveOption;
	
	    __extends(Dropzone, _super);
	
	    Dropzone.prototype.Emitter = Emitter;
	
	
	    /*
	    This is a list of all available events you can register on a dropzone object.
	    
	    You can register an event handler like this:
	    
	        dropzone.on("dragEnter", function() { });
	     */
	
	    Dropzone.prototype.events = ["drop", "dragstart", "dragend", "dragenter", "dragover", "dragleave", "addedfile", "addedfiles", "removedfile", "thumbnail", "error", "errormultiple", "processing", "processingmultiple", "uploadprogress", "totaluploadprogress", "sending", "sendingmultiple", "success", "successmultiple", "canceled", "canceledmultiple", "complete", "completemultiple", "reset", "maxfilesexceeded", "maxfilesreached", "queuecomplete"];
	
	    Dropzone.prototype.defaultOptions = {
	      url: null,
	      method: "post",
	      withCredentials: false,
	      parallelUploads: 2,
	      uploadMultiple: false,
	      maxFilesize: 256,
	      paramName: "file",
	      createImageThumbnails: true,
	      maxThumbnailFilesize: 10,
	      thumbnailWidth: 120,
	      thumbnailHeight: 120,
	      filesizeBase: 1000,
	      maxFiles: null,
	      params: {},
	      clickable: true,
	      ignoreHiddenFiles: true,
	      acceptedFiles: null,
	      acceptedMimeTypes: null,
	      autoProcessQueue: true,
	      autoQueue: true,
	      addRemoveLinks: false,
	      previewsContainer: null,
	      hiddenInputContainer: "body",
	      capture: null,
	      dictDefaultMessage: "Drop files here to upload",
	      dictFallbackMessage: "Your browser does not support drag'n'drop file uploads.",
	      dictFallbackText: "Please use the fallback form below to upload your files like in the olden days.",
	      dictFileTooBig: "File is too big ({{filesize}}MiB). Max filesize: {{maxFilesize}}MiB.",
	      dictInvalidFileType: "You can't upload files of this type.",
	      dictResponseError: "Server responded with {{statusCode}} code.",
	      dictCancelUpload: "Cancel upload",
	      dictCancelUploadConfirmation: "Are you sure you want to cancel this upload?",
	      dictRemoveFile: "Remove file",
	      dictRemoveFileConfirmation: null,
	      dictMaxFilesExceeded: "You can not upload any more files.",
	      accept: function(file, done) {
	        return done();
	      },
	      init: function() {
	        return noop;
	      },
	      forceFallback: false,
	      fallback: function() {
	        var child, messageElement, span, _i, _len, _ref;
	        this.element.className = "" + this.element.className + " dz-browser-not-supported";
	        _ref = this.element.getElementsByTagName("div");
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	          child = _ref[_i];
	          if (/(^| )dz-message($| )/.test(child.className)) {
	            messageElement = child;
	            child.className = "dz-message";
	            continue;
	          }
	        }
	        if (!messageElement) {
	          messageElement = Dropzone.createElement("<div class=\"dz-message\"><span></span></div>");
	          this.element.appendChild(messageElement);
	        }
	        span = messageElement.getElementsByTagName("span")[0];
	        if (span) {
	          if (span.textContent != null) {
	            span.textContent = this.options.dictFallbackMessage;
	          } else if (span.innerText != null) {
	            span.innerText = this.options.dictFallbackMessage;
	          }
	        }
	        return this.element.appendChild(this.getFallbackForm());
	      },
	      resize: function(file) {
	        var info, srcRatio, trgRatio;
	        info = {
	          srcX: 0,
	          srcY: 0,
	          srcWidth: file.width,
	          srcHeight: file.height
	        };
	        srcRatio = file.width / file.height;
	        info.optWidth = this.options.thumbnailWidth;
	        info.optHeight = this.options.thumbnailHeight;
	        if ((info.optWidth == null) && (info.optHeight == null)) {
	          info.optWidth = info.srcWidth;
	          info.optHeight = info.srcHeight;
	        } else if (info.optWidth == null) {
	          info.optWidth = srcRatio * info.optHeight;
	        } else if (info.optHeight == null) {
	          info.optHeight = (1 / srcRatio) * info.optWidth;
	        }
	        trgRatio = info.optWidth / info.optHeight;
	        if (file.height < info.optHeight || file.width < info.optWidth) {
	          info.trgHeight = info.srcHeight;
	          info.trgWidth = info.srcWidth;
	        } else {
	          if (srcRatio > trgRatio) {
	            info.srcHeight = file.height;
	            info.srcWidth = info.srcHeight * trgRatio;
	          } else {
	            info.srcWidth = file.width;
	            info.srcHeight = info.srcWidth / trgRatio;
	          }
	        }
	        info.srcX = (file.width - info.srcWidth) / 2;
	        info.srcY = (file.height - info.srcHeight) / 2;
	        return info;
	      },
	
	      /*
	      Those functions register themselves to the events on init and handle all
	      the user interface specific stuff. Overwriting them won't break the upload
	      but can break the way it's displayed.
	      You can overwrite them if you don't like the default behavior. If you just
	      want to add an additional event handler, register it on the dropzone object
	      and don't overwrite those options.
	       */
	      drop: function(e) {
	        return this.element.classList.remove("dz-drag-hover");
	      },
	      dragstart: noop,
	      dragend: function(e) {
	        return this.element.classList.remove("dz-drag-hover");
	      },
	      dragenter: function(e) {
	        return this.element.classList.add("dz-drag-hover");
	      },
	      dragover: function(e) {
	        return this.element.classList.add("dz-drag-hover");
	      },
	      dragleave: function(e) {
	        return this.element.classList.remove("dz-drag-hover");
	      },
	      paste: noop,
	      reset: function() {
	        return this.element.classList.remove("dz-started");
	      },
	      addedfile: function(file) {
	        var node, removeFileEvent, removeLink, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
	        if (this.element === this.previewsContainer) {
	          this.element.classList.add("dz-started");
	        }
	        if (this.previewsContainer) {
	          file.previewElement = Dropzone.createElement(this.options.previewTemplate.trim());
	          file.previewTemplate = file.previewElement;
	          this.previewsContainer.appendChild(file.previewElement);
	          _ref = file.previewElement.querySelectorAll("[data-dz-name]");
	          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	            node = _ref[_i];
	            node.textContent = file.name;
	          }
	          _ref1 = file.previewElement.querySelectorAll("[data-dz-size]");
	          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
	            node = _ref1[_j];
	            node.innerHTML = this.filesize(file.size);
	          }
	          if (this.options.addRemoveLinks) {
	            file._removeLink = Dropzone.createElement("<a class=\"dz-remove\" href=\"javascript:undefined;\" data-dz-remove>" + this.options.dictRemoveFile + "</a>");
	            file.previewElement.appendChild(file._removeLink);
	          }
	          removeFileEvent = (function(_this) {
	            return function(e) {
	              e.preventDefault();
	              e.stopPropagation();
	              if (file.status === Dropzone.UPLOADING) {
	                return Dropzone.confirm(_this.options.dictCancelUploadConfirmation, function() {
	                  return _this.removeFile(file);
	                });
	              } else {
	                if (_this.options.dictRemoveFileConfirmation) {
	                  return Dropzone.confirm(_this.options.dictRemoveFileConfirmation, function() {
	                    return _this.removeFile(file);
	                  });
	                } else {
	                  return _this.removeFile(file);
	                }
	              }
	            };
	          })(this);
	          _ref2 = file.previewElement.querySelectorAll("[data-dz-remove]");
	          _results = [];
	          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
	            removeLink = _ref2[_k];
	            _results.push(removeLink.addEventListener("click", removeFileEvent));
	          }
	          return _results;
	        }
	      },
	      removedfile: function(file) {
	        var _ref;
	        if (file.previewElement) {
	          if ((_ref = file.previewElement) != null) {
	            _ref.parentNode.removeChild(file.previewElement);
	          }
	        }
	        return this._updateMaxFilesReachedClass();
	      },
	      thumbnail: function(file, dataUrl) {
	        var thumbnailElement, _i, _len, _ref;
	        if (file.previewElement) {
	          file.previewElement.classList.remove("dz-file-preview");
	          _ref = file.previewElement.querySelectorAll("[data-dz-thumbnail]");
	          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	            thumbnailElement = _ref[_i];
	            thumbnailElement.alt = file.name;
	            thumbnailElement.src = dataUrl;
	          }
	          return setTimeout(((function(_this) {
	            return function() {
	              return file.previewElement.classList.add("dz-image-preview");
	            };
	          })(this)), 1);
	        }
	      },
	      error: function(file, message) {
	        var node, _i, _len, _ref, _results;
	        if (file.previewElement) {
	          file.previewElement.classList.add("dz-error");
	          if (typeof message !== "String" && message.error) {
	            message = message.error;
	          }
	          _ref = file.previewElement.querySelectorAll("[data-dz-errormessage]");
	          _results = [];
	          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	            node = _ref[_i];
	            _results.push(node.textContent = message);
	          }
	          return _results;
	        }
	      },
	      errormultiple: noop,
	      processing: function(file) {
	        if (file.previewElement) {
	          file.previewElement.classList.add("dz-processing");
	          if (file._removeLink) {
	            return file._removeLink.textContent = this.options.dictCancelUpload;
	          }
	        }
	      },
	      processingmultiple: noop,
	      uploadprogress: function(file, progress, bytesSent) {
	        var node, _i, _len, _ref, _results;
	        if (file.previewElement) {
	          _ref = file.previewElement.querySelectorAll("[data-dz-uploadprogress]");
	          _results = [];
	          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	            node = _ref[_i];
	            if (node.nodeName === 'PROGRESS') {
	              _results.push(node.value = progress);
	            } else {
	              _results.push(node.style.width = "" + progress + "%");
	            }
	          }
	          return _results;
	        }
	      },
	      totaluploadprogress: noop,
	      sending: noop,
	      sendingmultiple: noop,
	      success: function(file) {
	        if (file.previewElement) {
	          return file.previewElement.classList.add("dz-success");
	        }
	      },
	      successmultiple: noop,
	      canceled: function(file) {
	        return this.emit("error", file, "Upload canceled.");
	      },
	      canceledmultiple: noop,
	      complete: function(file) {
	        if (file._removeLink) {
	          file._removeLink.textContent = this.options.dictRemoveFile;
	        }
	        if (file.previewElement) {
	          return file.previewElement.classList.add("dz-complete");
	        }
	      },
	      completemultiple: noop,
	      maxfilesexceeded: noop,
	      maxfilesreached: noop,
	      queuecomplete: noop,
	      addedfiles: noop,
	      previewTemplate: "<div class=\"dz-preview dz-file-preview\">\n  <div class=\"dz-image\"><img data-dz-thumbnail /></div>\n  <div class=\"dz-details\">\n    <div class=\"dz-size\"><span data-dz-size></span></div>\n    <div class=\"dz-filename\"><span data-dz-name></span></div>\n  </div>\n  <div class=\"dz-progress\"><span class=\"dz-upload\" data-dz-uploadprogress></span></div>\n  <div class=\"dz-error-message\"><span data-dz-errormessage></span></div>\n  <div class=\"dz-success-mark\">\n    <svg width=\"54px\" height=\"54px\" viewBox=\"0 0 54 54\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n      <title>Check</title>\n      <defs></defs>\n      <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" sketch:type=\"MSPage\">\n        <path d=\"M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z\" id=\"Oval-2\" stroke-opacity=\"0.198794158\" stroke=\"#747474\" fill-opacity=\"0.816519475\" fill=\"#FFFFFF\" sketch:type=\"MSShapeGroup\"></path>\n      </g>\n    </svg>\n  </div>\n  <div class=\"dz-error-mark\">\n    <svg width=\"54px\" height=\"54px\" viewBox=\"0 0 54 54\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n      <title>Error</title>\n      <defs></defs>\n      <g id=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" sketch:type=\"MSPage\">\n        <g id=\"Check-+-Oval-2\" sketch:type=\"MSLayerGroup\" stroke=\"#747474\" stroke-opacity=\"0.198794158\" fill=\"#FFFFFF\" fill-opacity=\"0.816519475\">\n          <path d=\"M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z\" id=\"Oval-2\" sketch:type=\"MSShapeGroup\"></path>\n        </g>\n      </g>\n    </svg>\n  </div>\n</div>"
	    };
	
	    extend = function() {
	      var key, object, objects, target, val, _i, _len;
	      target = arguments[0], objects = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	      for (_i = 0, _len = objects.length; _i < _len; _i++) {
	        object = objects[_i];
	        for (key in object) {
	          val = object[key];
	          target[key] = val;
	        }
	      }
	      return target;
	    };
	
	    function Dropzone(element, options) {
	      var elementOptions, fallback, _ref;
	      this.element = element;
	      this.version = Dropzone.version;
	      this.defaultOptions.previewTemplate = this.defaultOptions.previewTemplate.replace(/\n*/g, "");
	      this.clickableElements = [];
	      this.listeners = [];
	      this.files = [];
	      if (typeof this.element === "string") {
	        this.element = document.querySelector(this.element);
	      }
	      if (!(this.element && (this.element.nodeType != null))) {
	        throw new Error("Invalid dropzone element.");
	      }
	      if (this.element.dropzone) {
	        throw new Error("Dropzone already attached.");
	      }
	      Dropzone.instances.push(this);
	      this.element.dropzone = this;
	      elementOptions = (_ref = Dropzone.optionsForElement(this.element)) != null ? _ref : {};
	      this.options = extend({}, this.defaultOptions, elementOptions, options != null ? options : {});
	      if (this.options.forceFallback || !Dropzone.isBrowserSupported()) {
	        return this.options.fallback.call(this);
	      }
	      if (this.options.url == null) {
	        this.options.url = this.element.getAttribute("action");
	      }
	      if (!this.options.url) {
	        throw new Error("No URL provided.");
	      }
	      if (this.options.acceptedFiles && this.options.acceptedMimeTypes) {
	        throw new Error("You can't provide both 'acceptedFiles' and 'acceptedMimeTypes'. 'acceptedMimeTypes' is deprecated.");
	      }
	      if (this.options.acceptedMimeTypes) {
	        this.options.acceptedFiles = this.options.acceptedMimeTypes;
	        delete this.options.acceptedMimeTypes;
	      }
	      this.options.method = this.options.method.toUpperCase();
	      if ((fallback = this.getExistingFallback()) && fallback.parentNode) {
	        fallback.parentNode.removeChild(fallback);
	      }
	      if (this.options.previewsContainer !== false) {
	        if (this.options.previewsContainer) {
	          this.previewsContainer = Dropzone.getElement(this.options.previewsContainer, "previewsContainer");
	        } else {
	          this.previewsContainer = this.element;
	        }
	      }
	      if (this.options.clickable) {
	        if (this.options.clickable === true) {
	          this.clickableElements = [this.element];
	        } else {
	          this.clickableElements = Dropzone.getElements(this.options.clickable, "clickable");
	        }
	      }
	      this.init();
	    }
	
	    Dropzone.prototype.getAcceptedFiles = function() {
	      var file, _i, _len, _ref, _results;
	      _ref = this.files;
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        file = _ref[_i];
	        if (file.accepted) {
	          _results.push(file);
	        }
	      }
	      return _results;
	    };
	
	    Dropzone.prototype.getRejectedFiles = function() {
	      var file, _i, _len, _ref, _results;
	      _ref = this.files;
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        file = _ref[_i];
	        if (!file.accepted) {
	          _results.push(file);
	        }
	      }
	      return _results;
	    };
	
	    Dropzone.prototype.getFilesWithStatus = function(status) {
	      var file, _i, _len, _ref, _results;
	      _ref = this.files;
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        file = _ref[_i];
	        if (file.status === status) {
	          _results.push(file);
	        }
	      }
	      return _results;
	    };
	
	    Dropzone.prototype.getQueuedFiles = function() {
	      return this.getFilesWithStatus(Dropzone.QUEUED);
	    };
	
	    Dropzone.prototype.getUploadingFiles = function() {
	      return this.getFilesWithStatus(Dropzone.UPLOADING);
	    };
	
	    Dropzone.prototype.getAddedFiles = function() {
	      return this.getFilesWithStatus(Dropzone.ADDED);
	    };
	
	    Dropzone.prototype.getActiveFiles = function() {
	      var file, _i, _len, _ref, _results;
	      _ref = this.files;
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        file = _ref[_i];
	        if (file.status === Dropzone.UPLOADING || file.status === Dropzone.QUEUED) {
	          _results.push(file);
	        }
	      }
	      return _results;
	    };
	
	    Dropzone.prototype.init = function() {
	      var eventName, noPropagation, setupHiddenFileInput, _i, _len, _ref, _ref1;
	      if (this.element.tagName === "form") {
	        this.element.setAttribute("enctype", "multipart/form-data");
	      }
	      if (this.element.classList.contains("dropzone") && !this.element.querySelector(".dz-message")) {
	        this.element.appendChild(Dropzone.createElement("<div class=\"dz-default dz-message\"><span>" + this.options.dictDefaultMessage + "</span></div>"));
	      }
	      if (this.clickableElements.length) {
	        setupHiddenFileInput = (function(_this) {
	          return function() {
	            if (_this.hiddenFileInput) {
	              _this.hiddenFileInput.parentNode.removeChild(_this.hiddenFileInput);
	            }
	            _this.hiddenFileInput = document.createElement("input");
	            _this.hiddenFileInput.setAttribute("type", "file");
	            if ((_this.options.maxFiles == null) || _this.options.maxFiles > 1) {
	              _this.hiddenFileInput.setAttribute("multiple", "multiple");
	            }
	            _this.hiddenFileInput.className = "dz-hidden-input";
	            if (_this.options.acceptedFiles != null) {
	              _this.hiddenFileInput.setAttribute("accept", _this.options.acceptedFiles);
	            }
	            if (_this.options.capture != null) {
	              _this.hiddenFileInput.setAttribute("capture", _this.options.capture);
	            }
	            _this.hiddenFileInput.style.visibility = "hidden";
	            _this.hiddenFileInput.style.position = "absolute";
	            _this.hiddenFileInput.style.top = "0";
	            _this.hiddenFileInput.style.left = "0";
	            _this.hiddenFileInput.style.height = "0";
	            _this.hiddenFileInput.style.width = "0";
	            document.querySelector(_this.options.hiddenInputContainer).appendChild(_this.hiddenFileInput);
	            return _this.hiddenFileInput.addEventListener("change", function() {
	              var file, files, _i, _len;
	              files = _this.hiddenFileInput.files;
	              if (files.length) {
	                for (_i = 0, _len = files.length; _i < _len; _i++) {
	                  file = files[_i];
	                  _this.addFile(file);
	                }
	              }
	              _this.emit("addedfiles", files);
	              return setupHiddenFileInput();
	            });
	          };
	        })(this);
	        setupHiddenFileInput();
	      }
	      this.URL = (_ref = window.URL) != null ? _ref : window.webkitURL;
	      _ref1 = this.events;
	      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
	        eventName = _ref1[_i];
	        this.on(eventName, this.options[eventName]);
	      }
	      this.on("uploadprogress", (function(_this) {
	        return function() {
	          return _this.updateTotalUploadProgress();
	        };
	      })(this));
	      this.on("removedfile", (function(_this) {
	        return function() {
	          return _this.updateTotalUploadProgress();
	        };
	      })(this));
	      this.on("canceled", (function(_this) {
	        return function(file) {
	          return _this.emit("complete", file);
	        };
	      })(this));
	      this.on("complete", (function(_this) {
	        return function(file) {
	          if (_this.getAddedFiles().length === 0 && _this.getUploadingFiles().length === 0 && _this.getQueuedFiles().length === 0) {
	            return setTimeout((function() {
	              return _this.emit("queuecomplete");
	            }), 0);
	          }
	        };
	      })(this));
	      noPropagation = function(e) {
	        e.stopPropagation();
	        if (e.preventDefault) {
	          return e.preventDefault();
	        } else {
	          return e.returnValue = false;
	        }
	      };
	      this.listeners = [
	        {
	          element: this.element,
	          events: {
	            "dragstart": (function(_this) {
	              return function(e) {
	                return _this.emit("dragstart", e);
	              };
	            })(this),
	            "dragenter": (function(_this) {
	              return function(e) {
	                noPropagation(e);
	                return _this.emit("dragenter", e);
	              };
	            })(this),
	            "dragover": (function(_this) {
	              return function(e) {
	                var efct;
	                try {
	                  efct = e.dataTransfer.effectAllowed;
	                } catch (_error) {}
	                e.dataTransfer.dropEffect = 'move' === efct || 'linkMove' === efct ? 'move' : 'copy';
	                noPropagation(e);
	                return _this.emit("dragover", e);
	              };
	            })(this),
	            "dragleave": (function(_this) {
	              return function(e) {
	                return _this.emit("dragleave", e);
	              };
	            })(this),
	            "drop": (function(_this) {
	              return function(e) {
	                noPropagation(e);
	                return _this.drop(e);
	              };
	            })(this),
	            "dragend": (function(_this) {
	              return function(e) {
	                return _this.emit("dragend", e);
	              };
	            })(this)
	          }
	        }
	      ];
	      this.clickableElements.forEach((function(_this) {
	        return function(clickableElement) {
	          return _this.listeners.push({
	            element: clickableElement,
	            events: {
	              "click": function(evt) {
	                if ((clickableElement !== _this.element) || (evt.target === _this.element || Dropzone.elementInside(evt.target, _this.element.querySelector(".dz-message")))) {
	                  _this.hiddenFileInput.click();
	                }
	                return true;
	              }
	            }
	          });
	        };
	      })(this));
	      this.enable();
	      return this.options.init.call(this);
	    };
	
	    Dropzone.prototype.destroy = function() {
	      var _ref;
	      this.disable();
	      this.removeAllFiles(true);
	      if ((_ref = this.hiddenFileInput) != null ? _ref.parentNode : void 0) {
	        this.hiddenFileInput.parentNode.removeChild(this.hiddenFileInput);
	        this.hiddenFileInput = null;
	      }
	      delete this.element.dropzone;
	      return Dropzone.instances.splice(Dropzone.instances.indexOf(this), 1);
	    };
	
	    Dropzone.prototype.updateTotalUploadProgress = function() {
	      var activeFiles, file, totalBytes, totalBytesSent, totalUploadProgress, _i, _len, _ref;
	      totalBytesSent = 0;
	      totalBytes = 0;
	      activeFiles = this.getActiveFiles();
	      if (activeFiles.length) {
	        _ref = this.getActiveFiles();
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	          file = _ref[_i];
	          totalBytesSent += file.upload.bytesSent;
	          totalBytes += file.upload.total;
	        }
	        totalUploadProgress = 100 * totalBytesSent / totalBytes;
	      } else {
	        totalUploadProgress = 100;
	      }
	      return this.emit("totaluploadprogress", totalUploadProgress, totalBytes, totalBytesSent);
	    };
	
	    Dropzone.prototype._getParamName = function(n) {
	      if (typeof this.options.paramName === "function") {
	        return this.options.paramName(n);
	      } else {
	        return "" + this.options.paramName + (this.options.uploadMultiple ? "[" + n + "]" : "");
	      }
	    };
	
	    Dropzone.prototype.getFallbackForm = function() {
	      var existingFallback, fields, fieldsString, form;
	      if (existingFallback = this.getExistingFallback()) {
	        return existingFallback;
	      }
	      fieldsString = "<div class=\"dz-fallback\">";
	      if (this.options.dictFallbackText) {
	        fieldsString += "<p>" + this.options.dictFallbackText + "</p>";
	      }
	      fieldsString += "<input type=\"file\" name=\"" + (this._getParamName(0)) + "\" " + (this.options.uploadMultiple ? 'multiple="multiple"' : void 0) + " /><input type=\"submit\" value=\"Upload!\"></div>";
	      fields = Dropzone.createElement(fieldsString);
	      if (this.element.tagName !== "FORM") {
	        form = Dropzone.createElement("<form action=\"" + this.options.url + "\" enctype=\"multipart/form-data\" method=\"" + this.options.method + "\"></form>");
	        form.appendChild(fields);
	      } else {
	        this.element.setAttribute("enctype", "multipart/form-data");
	        this.element.setAttribute("method", this.options.method);
	      }
	      return form != null ? form : fields;
	    };
	
	    Dropzone.prototype.getExistingFallback = function() {
	      var fallback, getFallback, tagName, _i, _len, _ref;
	      getFallback = function(elements) {
	        var el, _i, _len;
	        for (_i = 0, _len = elements.length; _i < _len; _i++) {
	          el = elements[_i];
	          if (/(^| )fallback($| )/.test(el.className)) {
	            return el;
	          }
	        }
	      };
	      _ref = ["div", "form"];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        tagName = _ref[_i];
	        if (fallback = getFallback(this.element.getElementsByTagName(tagName))) {
	          return fallback;
	        }
	      }
	    };
	
	    Dropzone.prototype.setupEventListeners = function() {
	      var elementListeners, event, listener, _i, _len, _ref, _results;
	      _ref = this.listeners;
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        elementListeners = _ref[_i];
	        _results.push((function() {
	          var _ref1, _results1;
	          _ref1 = elementListeners.events;
	          _results1 = [];
	          for (event in _ref1) {
	            listener = _ref1[event];
	            _results1.push(elementListeners.element.addEventListener(event, listener, false));
	          }
	          return _results1;
	        })());
	      }
	      return _results;
	    };
	
	    Dropzone.prototype.removeEventListeners = function() {
	      var elementListeners, event, listener, _i, _len, _ref, _results;
	      _ref = this.listeners;
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        elementListeners = _ref[_i];
	        _results.push((function() {
	          var _ref1, _results1;
	          _ref1 = elementListeners.events;
	          _results1 = [];
	          for (event in _ref1) {
	            listener = _ref1[event];
	            _results1.push(elementListeners.element.removeEventListener(event, listener, false));
	          }
	          return _results1;
	        })());
	      }
	      return _results;
	    };
	
	    Dropzone.prototype.disable = function() {
	      var file, _i, _len, _ref, _results;
	      this.clickableElements.forEach(function(element) {
	        return element.classList.remove("dz-clickable");
	      });
	      this.removeEventListeners();
	      _ref = this.files;
	      _results = [];
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        file = _ref[_i];
	        _results.push(this.cancelUpload(file));
	      }
	      return _results;
	    };
	
	    Dropzone.prototype.enable = function() {
	      this.clickableElements.forEach(function(element) {
	        return element.classList.add("dz-clickable");
	      });
	      return this.setupEventListeners();
	    };
	
	    Dropzone.prototype.filesize = function(size) {
	      var cutoff, i, selectedSize, selectedUnit, unit, units, _i, _len;
	      selectedSize = 0;
	      selectedUnit = "b";
	      if (size > 0) {
	        units = ['TB', 'GB', 'MB', 'KB', 'b'];
	        for (i = _i = 0, _len = units.length; _i < _len; i = ++_i) {
	          unit = units[i];
	          cutoff = Math.pow(this.options.filesizeBase, 4 - i) / 10;
	          if (size >= cutoff) {
	            selectedSize = size / Math.pow(this.options.filesizeBase, 4 - i);
	            selectedUnit = unit;
	            break;
	          }
	        }
	        selectedSize = Math.round(10 * selectedSize) / 10;
	      }
	      return "<strong>" + selectedSize + "</strong> " + selectedUnit;
	    };
	
	    Dropzone.prototype._updateMaxFilesReachedClass = function() {
	      if ((this.options.maxFiles != null) && this.getAcceptedFiles().length >= this.options.maxFiles) {
	        if (this.getAcceptedFiles().length === this.options.maxFiles) {
	          this.emit('maxfilesreached', this.files);
	        }
	        return this.element.classList.add("dz-max-files-reached");
	      } else {
	        return this.element.classList.remove("dz-max-files-reached");
	      }
	    };
	
	    Dropzone.prototype.drop = function(e) {
	      var files, items;
	      if (!e.dataTransfer) {
	        return;
	      }
	      this.emit("drop", e);
	      files = e.dataTransfer.files;
	      this.emit("addedfiles", files);
	      if (files.length) {
	        items = e.dataTransfer.items;
	        if (items && items.length && (items[0].webkitGetAsEntry != null)) {
	          this._addFilesFromItems(items);
	        } else {
	          this.handleFiles(files);
	        }
	      }
	    };
	
	    Dropzone.prototype.paste = function(e) {
	      var items, _ref;
	      if ((e != null ? (_ref = e.clipboardData) != null ? _ref.items : void 0 : void 0) == null) {
	        return;
	      }
	      this.emit("paste", e);
	      items = e.clipboardData.items;
	      if (items.length) {
	        return this._addFilesFromItems(items);
	      }
	    };
	
	    Dropzone.prototype.handleFiles = function(files) {
	      var file, _i, _len, _results;
	      _results = [];
	      for (_i = 0, _len = files.length; _i < _len; _i++) {
	        file = files[_i];
	        _results.push(this.addFile(file));
	      }
	      return _results;
	    };
	
	    Dropzone.prototype._addFilesFromItems = function(items) {
	      var entry, item, _i, _len, _results;
	      _results = [];
	      for (_i = 0, _len = items.length; _i < _len; _i++) {
	        item = items[_i];
	        if ((item.webkitGetAsEntry != null) && (entry = item.webkitGetAsEntry())) {
	          if (entry.isFile) {
	            _results.push(this.addFile(item.getAsFile()));
	          } else if (entry.isDirectory) {
	            _results.push(this._addFilesFromDirectory(entry, entry.name));
	          } else {
	            _results.push(void 0);
	          }
	        } else if (item.getAsFile != null) {
	          if ((item.kind == null) || item.kind === "file") {
	            _results.push(this.addFile(item.getAsFile()));
	          } else {
	            _results.push(void 0);
	          }
	        } else {
	          _results.push(void 0);
	        }
	      }
	      return _results;
	    };
	
	    Dropzone.prototype._addFilesFromDirectory = function(directory, path) {
	      var dirReader, entriesReader;
	      dirReader = directory.createReader();
	      entriesReader = (function(_this) {
	        return function(entries) {
	          var entry, _i, _len;
	          for (_i = 0, _len = entries.length; _i < _len; _i++) {
	            entry = entries[_i];
	            if (entry.isFile) {
	              entry.file(function(file) {
	                if (_this.options.ignoreHiddenFiles && file.name.substring(0, 1) === '.') {
	                  return;
	                }
	                file.fullPath = "" + path + "/" + file.name;
	                return _this.addFile(file);
	              });
	            } else if (entry.isDirectory) {
	              _this._addFilesFromDirectory(entry, "" + path + "/" + entry.name);
	            }
	          }
	        };
	      })(this);
	      return dirReader.readEntries(entriesReader, function(error) {
	        return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log(error) : void 0 : void 0;
	      });
	    };
	
	    Dropzone.prototype.accept = function(file, done) {
	      if (file.size > this.options.maxFilesize * 1024 * 1024) {
	        return done(this.options.dictFileTooBig.replace("{{filesize}}", Math.round(file.size / 1024 / 10.24) / 100).replace("{{maxFilesize}}", this.options.maxFilesize));
	      } else if (!Dropzone.isValidFile(file, this.options.acceptedFiles)) {
	        return done(this.options.dictInvalidFileType);
	      } else if ((this.options.maxFiles != null) && this.getAcceptedFiles().length >= this.options.maxFiles) {
	        done(this.options.dictMaxFilesExceeded.replace("{{maxFiles}}", this.options.maxFiles));
	        return this.emit("maxfilesexceeded", file);
	      } else {
	        return this.options.accept.call(this, file, done);
	      }
	    };
	
	    Dropzone.prototype.addFile = function(file) {
	      file.upload = {
	        progress: 0,
	        total: file.size,
	        bytesSent: 0
	      };
	      this.files.push(file);
	      file.status = Dropzone.ADDED;
	      this.emit("addedfile", file);
	      this._enqueueThumbnail(file);
	      return this.accept(file, (function(_this) {
	        return function(error) {
	          if (error) {
	            file.accepted = false;
	            _this._errorProcessing([file], error);
	          } else {
	            file.accepted = true;
	            if (_this.options.autoQueue) {
	              _this.enqueueFile(file);
	            }
	          }
	          return _this._updateMaxFilesReachedClass();
	        };
	      })(this));
	    };
	
	    Dropzone.prototype.enqueueFiles = function(files) {
	      var file, _i, _len;
	      for (_i = 0, _len = files.length; _i < _len; _i++) {
	        file = files[_i];
	        this.enqueueFile(file);
	      }
	      return null;
	    };
	
	    Dropzone.prototype.enqueueFile = function(file) {
	      if (file.status === Dropzone.ADDED && file.accepted === true) {
	        file.status = Dropzone.QUEUED;
	        if (this.options.autoProcessQueue) {
	          return setTimeout(((function(_this) {
	            return function() {
	              return _this.processQueue();
	            };
	          })(this)), 0);
	        }
	      } else {
	        throw new Error("This file can't be queued because it has already been processed or was rejected.");
	      }
	    };
	
	    Dropzone.prototype._thumbnailQueue = [];
	
	    Dropzone.prototype._processingThumbnail = false;
	
	    Dropzone.prototype._enqueueThumbnail = function(file) {
	      if (this.options.createImageThumbnails && file.type.match(/image.*/) && file.size <= this.options.maxThumbnailFilesize * 1024 * 1024) {
	        this._thumbnailQueue.push(file);
	        return setTimeout(((function(_this) {
	          return function() {
	            return _this._processThumbnailQueue();
	          };
	        })(this)), 0);
	      }
	    };
	
	    Dropzone.prototype._processThumbnailQueue = function() {
	      if (this._processingThumbnail || this._thumbnailQueue.length === 0) {
	        return;
	      }
	      this._processingThumbnail = true;
	      return this.createThumbnail(this._thumbnailQueue.shift(), (function(_this) {
	        return function() {
	          _this._processingThumbnail = false;
	          return _this._processThumbnailQueue();
	        };
	      })(this));
	    };
	
	    Dropzone.prototype.removeFile = function(file) {
	      if (file.status === Dropzone.UPLOADING) {
	        this.cancelUpload(file);
	      }
	      this.files = without(this.files, file);
	      this.emit("removedfile", file);
	      if (this.files.length === 0) {
	        return this.emit("reset");
	      }
	    };
	
	    Dropzone.prototype.removeAllFiles = function(cancelIfNecessary) {
	      var file, _i, _len, _ref;
	      if (cancelIfNecessary == null) {
	        cancelIfNecessary = false;
	      }
	      _ref = this.files.slice();
	      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	        file = _ref[_i];
	        if (file.status !== Dropzone.UPLOADING || cancelIfNecessary) {
	          this.removeFile(file);
	        }
	      }
	      return null;
	    };
	
	    Dropzone.prototype.createThumbnail = function(file, callback) {
	      var fileReader;
	      fileReader = new FileReader;
	      fileReader.onload = (function(_this) {
	        return function() {
	          if (file.type === "image/svg+xml") {
	            _this.emit("thumbnail", file, fileReader.result);
	            if (callback != null) {
	              callback();
	            }
	            return;
	          }
	          return _this.createThumbnailFromUrl(file, fileReader.result, callback);
	        };
	      })(this);
	      return fileReader.readAsDataURL(file);
	    };
	
	    Dropzone.prototype.createThumbnailFromUrl = function(file, imageUrl, callback, crossOrigin) {
	      var img;
	      img = document.createElement("img");
	      if (crossOrigin) {
	        img.crossOrigin = crossOrigin;
	      }
	      img.onload = (function(_this) {
	        return function() {
	          var canvas, ctx, resizeInfo, thumbnail, _ref, _ref1, _ref2, _ref3;
	          file.width = img.width;
	          file.height = img.height;
	          resizeInfo = _this.options.resize.call(_this, file);
	          if (resizeInfo.trgWidth == null) {
	            resizeInfo.trgWidth = resizeInfo.optWidth;
	          }
	          if (resizeInfo.trgHeight == null) {
	            resizeInfo.trgHeight = resizeInfo.optHeight;
	          }
	          canvas = document.createElement("canvas");
	          ctx = canvas.getContext("2d");
	          canvas.width = resizeInfo.trgWidth;
	          canvas.height = resizeInfo.trgHeight;
	          drawImageIOSFix(ctx, img, (_ref = resizeInfo.srcX) != null ? _ref : 0, (_ref1 = resizeInfo.srcY) != null ? _ref1 : 0, resizeInfo.srcWidth, resizeInfo.srcHeight, (_ref2 = resizeInfo.trgX) != null ? _ref2 : 0, (_ref3 = resizeInfo.trgY) != null ? _ref3 : 0, resizeInfo.trgWidth, resizeInfo.trgHeight);
	          thumbnail = canvas.toDataURL("image/png");
	          _this.emit("thumbnail", file, thumbnail);
	          if (callback != null) {
	            return callback();
	          }
	        };
	      })(this);
	      if (callback != null) {
	        img.onerror = callback;
	      }
	      return img.src = imageUrl;
	    };
	
	    Dropzone.prototype.processQueue = function() {
	      var i, parallelUploads, processingLength, queuedFiles;
	      parallelUploads = this.options.parallelUploads;
	      processingLength = this.getUploadingFiles().length;
	      i = processingLength;
	      if (processingLength >= parallelUploads) {
	        return;
	      }
	      queuedFiles = this.getQueuedFiles();
	      if (!(queuedFiles.length > 0)) {
	        return;
	      }
	      if (this.options.uploadMultiple) {
	        return this.processFiles(queuedFiles.slice(0, parallelUploads - processingLength));
	      } else {
	        while (i < parallelUploads) {
	          if (!queuedFiles.length) {
	            return;
	          }
	          this.processFile(queuedFiles.shift());
	          i++;
	        }
	      }
	    };
	
	    Dropzone.prototype.processFile = function(file) {
	      return this.processFiles([file]);
	    };
	
	    Dropzone.prototype.processFiles = function(files) {
	      var file, _i, _len;
	      for (_i = 0, _len = files.length; _i < _len; _i++) {
	        file = files[_i];
	        file.processing = true;
	        file.status = Dropzone.UPLOADING;
	        this.emit("processing", file);
	      }
	      if (this.options.uploadMultiple) {
	        this.emit("processingmultiple", files);
	      }
	      return this.uploadFiles(files);
	    };
	
	    Dropzone.prototype._getFilesWithXhr = function(xhr) {
	      var file, files;
	      return files = (function() {
	        var _i, _len, _ref, _results;
	        _ref = this.files;
	        _results = [];
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	          file = _ref[_i];
	          if (file.xhr === xhr) {
	            _results.push(file);
	          }
	        }
	        return _results;
	      }).call(this);
	    };
	
	    Dropzone.prototype.cancelUpload = function(file) {
	      var groupedFile, groupedFiles, _i, _j, _len, _len1, _ref;
	      if (file.status === Dropzone.UPLOADING) {
	        groupedFiles = this._getFilesWithXhr(file.xhr);
	        for (_i = 0, _len = groupedFiles.length; _i < _len; _i++) {
	          groupedFile = groupedFiles[_i];
	          groupedFile.status = Dropzone.CANCELED;
	        }
	        file.xhr.abort();
	        for (_j = 0, _len1 = groupedFiles.length; _j < _len1; _j++) {
	          groupedFile = groupedFiles[_j];
	          this.emit("canceled", groupedFile);
	        }
	        if (this.options.uploadMultiple) {
	          this.emit("canceledmultiple", groupedFiles);
	        }
	      } else if ((_ref = file.status) === Dropzone.ADDED || _ref === Dropzone.QUEUED) {
	        file.status = Dropzone.CANCELED;
	        this.emit("canceled", file);
	        if (this.options.uploadMultiple) {
	          this.emit("canceledmultiple", [file]);
	        }
	      }
	      if (this.options.autoProcessQueue) {
	        return this.processQueue();
	      }
	    };
	
	    resolveOption = function() {
	      var args, option;
	      option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
	      if (typeof option === 'function') {
	        return option.apply(this, args);
	      }
	      return option;
	    };
	
	    Dropzone.prototype.uploadFile = function(file) {
	      return this.uploadFiles([file]);
	    };
	
	    Dropzone.prototype.uploadFiles = function(files) {
	      var file, formData, handleError, headerName, headerValue, headers, i, input, inputName, inputType, key, method, option, progressObj, response, updateProgress, url, value, xhr, _i, _j, _k, _l, _len, _len1, _len2, _len3, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
	      xhr = new XMLHttpRequest();
	      for (_i = 0, _len = files.length; _i < _len; _i++) {
	        file = files[_i];
	        file.xhr = xhr;
	      }
	      method = resolveOption(this.options.method, files);
	      url = resolveOption(this.options.url, files);
	      xhr.open(method, url, true);
	      xhr.withCredentials = !!this.options.withCredentials;
	      response = null;
	      handleError = (function(_this) {
	        return function() {
	          var _j, _len1, _results;
	          _results = [];
	          for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
	            file = files[_j];
	            _results.push(_this._errorProcessing(files, response || _this.options.dictResponseError.replace("{{statusCode}}", xhr.status), xhr));
	          }
	          return _results;
	        };
	      })(this);
	      updateProgress = (function(_this) {
	        return function(e) {
	          var allFilesFinished, progress, _j, _k, _l, _len1, _len2, _len3, _results;
	          if (e != null) {
	            progress = 100 * e.loaded / e.total;
	            for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
	              file = files[_j];
	              file.upload = {
	                progress: progress,
	                total: e.total,
	                bytesSent: e.loaded
	              };
	            }
	          } else {
	            allFilesFinished = true;
	            progress = 100;
	            for (_k = 0, _len2 = files.length; _k < _len2; _k++) {
	              file = files[_k];
	              if (!(file.upload.progress === 100 && file.upload.bytesSent === file.upload.total)) {
	                allFilesFinished = false;
	              }
	              file.upload.progress = progress;
	              file.upload.bytesSent = file.upload.total;
	            }
	            if (allFilesFinished) {
	              return;
	            }
	          }
	          _results = [];
	          for (_l = 0, _len3 = files.length; _l < _len3; _l++) {
	            file = files[_l];
	            _results.push(_this.emit("uploadprogress", file, progress, file.upload.bytesSent));
	          }
	          return _results;
	        };
	      })(this);
	      xhr.onload = (function(_this) {
	        return function(e) {
	          var _ref;
	          if (files[0].status === Dropzone.CANCELED) {
	            return;
	          }
	          if (xhr.readyState !== 4) {
	            return;
	          }
	          response = xhr.responseText;
	          if (xhr.getResponseHeader("content-type") && ~xhr.getResponseHeader("content-type").indexOf("application/json")) {
	            try {
	              response = JSON.parse(response);
	            } catch (_error) {
	              e = _error;
	              response = "Invalid JSON response from server.";
	            }
	          }
	          updateProgress();
	          if (!((200 <= (_ref = xhr.status) && _ref < 300))) {
	            return handleError();
	          } else {
	            return _this._finished(files, response, e);
	          }
	        };
	      })(this);
	      xhr.onerror = (function(_this) {
	        return function() {
	          if (files[0].status === Dropzone.CANCELED) {
	            return;
	          }
	          return handleError();
	        };
	      })(this);
	      progressObj = (_ref = xhr.upload) != null ? _ref : xhr;
	      progressObj.onprogress = updateProgress;
	      headers = {
	        "Accept": "application/json",
	        "Cache-Control": "no-cache",
	        "X-Requested-With": "XMLHttpRequest"
	      };
	      if (this.options.headers) {
	        extend(headers, this.options.headers);
	      }
	      for (headerName in headers) {
	        headerValue = headers[headerName];
	        if (headerValue) {
	          xhr.setRequestHeader(headerName, headerValue);
	        }
	      }
	      formData = new FormData();
	      if (this.options.params) {
	        _ref1 = this.options.params;
	        for (key in _ref1) {
	          value = _ref1[key];
	          formData.append(key, value);
	        }
	      }
	      for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
	        file = files[_j];
	        this.emit("sending", file, xhr, formData);
	      }
	      if (this.options.uploadMultiple) {
	        this.emit("sendingmultiple", files, xhr, formData);
	      }
	      if (this.element.tagName === "FORM") {
	        _ref2 = this.element.querySelectorAll("input, textarea, select, button");
	        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
	          input = _ref2[_k];
	          inputName = input.getAttribute("name");
	          inputType = input.getAttribute("type");
	          if (input.tagName === "SELECT" && input.hasAttribute("multiple")) {
	            _ref3 = input.options;
	            for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
	              option = _ref3[_l];
	              if (option.selected) {
	                formData.append(inputName, option.value);
	              }
	            }
	          } else if (!inputType || ((_ref4 = inputType.toLowerCase()) !== "checkbox" && _ref4 !== "radio") || input.checked) {
	            formData.append(inputName, input.value);
	          }
	        }
	      }
	      for (i = _m = 0, _ref5 = files.length - 1; 0 <= _ref5 ? _m <= _ref5 : _m >= _ref5; i = 0 <= _ref5 ? ++_m : --_m) {
	        formData.append(this._getParamName(i), files[i], files[i].name);
	      }
	      return this.submitRequest(xhr, formData, files);
	    };
	
	    Dropzone.prototype.submitRequest = function(xhr, formData, files) {
	      return xhr.send(formData);
	    };
	
	    Dropzone.prototype._finished = function(files, responseText, e) {
	      var file, _i, _len;
	      for (_i = 0, _len = files.length; _i < _len; _i++) {
	        file = files[_i];
	        file.status = Dropzone.SUCCESS;
	        this.emit("success", file, responseText, e);
	        this.emit("complete", file);
	      }
	      if (this.options.uploadMultiple) {
	        this.emit("successmultiple", files, responseText, e);
	        this.emit("completemultiple", files);
	      }
	      if (this.options.autoProcessQueue) {
	        return this.processQueue();
	      }
	    };
	
	    Dropzone.prototype._errorProcessing = function(files, message, xhr) {
	      var file, _i, _len;
	      for (_i = 0, _len = files.length; _i < _len; _i++) {
	        file = files[_i];
	        file.status = Dropzone.ERROR;
	        this.emit("error", file, message, xhr);
	        this.emit("complete", file);
	      }
	      if (this.options.uploadMultiple) {
	        this.emit("errormultiple", files, message, xhr);
	        this.emit("completemultiple", files);
	      }
	      if (this.options.autoProcessQueue) {
	        return this.processQueue();
	      }
	    };
	
	    return Dropzone;
	
	  })(Emitter);
	
	  Dropzone.version = "4.2.0";
	
	  Dropzone.options = {};
	
	  Dropzone.optionsForElement = function(element) {
	    if (element.getAttribute("id")) {
	      return Dropzone.options[camelize(element.getAttribute("id"))];
	    } else {
	      return void 0;
	    }
	  };
	
	  Dropzone.instances = [];
	
	  Dropzone.forElement = function(element) {
	    if (typeof element === "string") {
	      element = document.querySelector(element);
	    }
	    if ((element != null ? element.dropzone : void 0) == null) {
	      throw new Error("No Dropzone found for given element. This is probably because you're trying to access it before Dropzone had the time to initialize. Use the `init` option to setup any additional observers on your Dropzone.");
	    }
	    return element.dropzone;
	  };
	
	  Dropzone.autoDiscover = true;
	
	  Dropzone.discover = function() {
	    var checkElements, dropzone, dropzones, _i, _len, _results;
	    if (document.querySelectorAll) {
	      dropzones = document.querySelectorAll(".dropzone");
	    } else {
	      dropzones = [];
	      checkElements = function(elements) {
	        var el, _i, _len, _results;
	        _results = [];
	        for (_i = 0, _len = elements.length; _i < _len; _i++) {
	          el = elements[_i];
	          if (/(^| )dropzone($| )/.test(el.className)) {
	            _results.push(dropzones.push(el));
	          } else {
	            _results.push(void 0);
	          }
	        }
	        return _results;
	      };
	      checkElements(document.getElementsByTagName("div"));
	      checkElements(document.getElementsByTagName("form"));
	    }
	    _results = [];
	    for (_i = 0, _len = dropzones.length; _i < _len; _i++) {
	      dropzone = dropzones[_i];
	      if (Dropzone.optionsForElement(dropzone) !== false) {
	        _results.push(new Dropzone(dropzone));
	      } else {
	        _results.push(void 0);
	      }
	    }
	    return _results;
	  };
	
	  Dropzone.blacklistedBrowsers = [/opera.*Macintosh.*version\/12/i];
	
	  Dropzone.isBrowserSupported = function() {
	    var capableBrowser, regex, _i, _len, _ref;
	    capableBrowser = true;
	    if (window.File && window.FileReader && window.FileList && window.Blob && window.FormData && document.querySelector) {
	      if (!("classList" in document.createElement("a"))) {
	        capableBrowser = false;
	      } else {
	        _ref = Dropzone.blacklistedBrowsers;
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	          regex = _ref[_i];
	          if (regex.test(navigator.userAgent)) {
	            capableBrowser = false;
	            continue;
	          }
	        }
	      }
	    } else {
	      capableBrowser = false;
	    }
	    return capableBrowser;
	  };
	
	  without = function(list, rejectedItem) {
	    var item, _i, _len, _results;
	    _results = [];
	    for (_i = 0, _len = list.length; _i < _len; _i++) {
	      item = list[_i];
	      if (item !== rejectedItem) {
	        _results.push(item);
	      }
	    }
	    return _results;
	  };
	
	  camelize = function(str) {
	    return str.replace(/[\-_](\w)/g, function(match) {
	      return match.charAt(1).toUpperCase();
	    });
	  };
	
	  Dropzone.createElement = function(string) {
	    var div;
	    div = document.createElement("div");
	    div.innerHTML = string;
	    return div.childNodes[0];
	  };
	
	  Dropzone.elementInside = function(element, container) {
	    if (element === container) {
	      return true;
	    }
	    while (element = element.parentNode) {
	      if (element === container) {
	        return true;
	      }
	    }
	    return false;
	  };
	
	  Dropzone.getElement = function(el, name) {
	    var element;
	    if (typeof el === "string") {
	      element = document.querySelector(el);
	    } else if (el.nodeType != null) {
	      element = el;
	    }
	    if (element == null) {
	      throw new Error("Invalid `" + name + "` option provided. Please provide a CSS selector or a plain HTML element.");
	    }
	    return element;
	  };
	
	  Dropzone.getElements = function(els, name) {
	    var e, el, elements, _i, _j, _len, _len1, _ref;
	    if (els instanceof Array) {
	      elements = [];
	      try {
	        for (_i = 0, _len = els.length; _i < _len; _i++) {
	          el = els[_i];
	          elements.push(this.getElement(el, name));
	        }
	      } catch (_error) {
	        e = _error;
	        elements = null;
	      }
	    } else if (typeof els === "string") {
	      elements = [];
	      _ref = document.querySelectorAll(els);
	      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
	        el = _ref[_j];
	        elements.push(el);
	      }
	    } else if (els.nodeType != null) {
	      elements = [els];
	    }
	    if (!((elements != null) && elements.length)) {
	      throw new Error("Invalid `" + name + "` option provided. Please provide a CSS selector, a plain HTML element or a list of those.");
	    }
	    return elements;
	  };
	
	  Dropzone.confirm = function(question, accepted, rejected) {
	    if (window.confirm(question)) {
	      return accepted();
	    } else if (rejected != null) {
	      return rejected();
	    }
	  };
	
	  Dropzone.isValidFile = function(file, acceptedFiles) {
	    var baseMimeType, mimeType, validType, _i, _len;
	    if (!acceptedFiles) {
	      return true;
	    }
	    acceptedFiles = acceptedFiles.split(",");
	    mimeType = file.type;
	    baseMimeType = mimeType.replace(/\/.*$/, "");
	    for (_i = 0, _len = acceptedFiles.length; _i < _len; _i++) {
	      validType = acceptedFiles[_i];
	      validType = validType.trim();
	      if (validType.charAt(0) === ".") {
	        if (file.name.toLowerCase().indexOf(validType.toLowerCase(), file.name.length - validType.length) !== -1) {
	          return true;
	        }
	      } else if (/\/\*$/.test(validType)) {
	        if (baseMimeType === validType.replace(/\/.*$/, "")) {
	          return true;
	        }
	      } else {
	        if (mimeType === validType) {
	          return true;
	        }
	      }
	    }
	    return false;
	  };
	
	  if (typeof jQuery !== "undefined" && jQuery !== null) {
	    jQuery.fn.dropzone = function(options) {
	      return this.each(function() {
	        return new Dropzone(this, options);
	      });
	    };
	  }
	
	  if (typeof module !== "undefined" && module !== null) {
	    module.exports = Dropzone;
	  } else {
	    window.Dropzone = Dropzone;
	  }
	
	  Dropzone.ADDED = "added";
	
	  Dropzone.QUEUED = "queued";
	
	  Dropzone.ACCEPTED = Dropzone.QUEUED;
	
	  Dropzone.UPLOADING = "uploading";
	
	  Dropzone.PROCESSING = Dropzone.UPLOADING;
	
	  Dropzone.CANCELED = "canceled";
	
	  Dropzone.ERROR = "error";
	
	  Dropzone.SUCCESS = "success";
	
	
	  /*
	  
	  Bugfix for iOS 6 and 7
	  Source: http://stackoverflow.com/questions/11929099/html5-canvas-drawimage-ratio-bug-ios
	  based on the work of https://github.com/stomita/ios-imagefile-megapixel
	   */
	
	  detectVerticalSquash = function(img) {
	    var alpha, canvas, ctx, data, ey, ih, iw, py, ratio, sy;
	    iw = img.naturalWidth;
	    ih = img.naturalHeight;
	    canvas = document.createElement("canvas");
	    canvas.width = 1;
	    canvas.height = ih;
	    ctx = canvas.getContext("2d");
	    ctx.drawImage(img, 0, 0);
	    data = ctx.getImageData(0, 0, 1, ih).data;
	    sy = 0;
	    ey = ih;
	    py = ih;
	    while (py > sy) {
	      alpha = data[(py - 1) * 4 + 3];
	      if (alpha === 0) {
	        ey = py;
	      } else {
	        sy = py;
	      }
	      py = (ey + sy) >> 1;
	    }
	    ratio = py / ih;
	    if (ratio === 0) {
	      return 1;
	    } else {
	      return ratio;
	    }
	  };
	
	  drawImageIOSFix = function(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
	    var vertSquashRatio;
	    vertSquashRatio = detectVerticalSquash(img);
	    return ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
	  };
	
	
	  /*
	   * contentloaded.js
	   *
	   * Author: Diego Perini (diego.perini at gmail.com)
	   * Summary: cross-browser wrapper for DOMContentLoaded
	   * Updated: 20101020
	   * License: MIT
	   * Version: 1.2
	   *
	   * URL:
	   * http://javascript.nwbox.com/ContentLoaded/
	   * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
	   */
	
	  contentLoaded = function(win, fn) {
	    var add, doc, done, init, poll, pre, rem, root, top;
	    done = false;
	    top = true;
	    doc = win.document;
	    root = doc.documentElement;
	    add = (doc.addEventListener ? "addEventListener" : "attachEvent");
	    rem = (doc.addEventListener ? "removeEventListener" : "detachEvent");
	    pre = (doc.addEventListener ? "" : "on");
	    init = function(e) {
	      if (e.type === "readystatechange" && doc.readyState !== "complete") {
	        return;
	      }
	      (e.type === "load" ? win : doc)[rem](pre + e.type, init, false);
	      if (!done && (done = true)) {
	        return fn.call(win, e.type || e);
	      }
	    };
	    poll = function() {
	      var e;
	      try {
	        root.doScroll("left");
	      } catch (_error) {
	        e = _error;
	        setTimeout(poll, 50);
	        return;
	      }
	      return init("poll");
	    };
	    if (doc.readyState !== "complete") {
	      if (doc.createEventObject && root.doScroll) {
	        try {
	          top = !win.frameElement;
	        } catch (_error) {}
	        if (top) {
	          poll();
	        }
	      }
	      doc[add](pre + "DOMContentLoaded", init, false);
	      doc[add](pre + "readystatechange", init, false);
	      return win[add](pre + "load", init, false);
	    }
	  };
	
	  Dropzone._autoDiscoverFunction = function() {
	    if (Dropzone.autoDiscover) {
	      return Dropzone.discover();
	    }
	  };
	
	  contentLoaded(window, Dropzone._autoDiscoverFunction);
	
	}).call(this);
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(226)(module)))

/***/ },

/***/ 226:
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },

/***/ 238:
/***/ function(module, exports) {

	/* ========================================================================
	 * Bootstrap: dropdown.js v3.3.6
	 * http://getbootstrap.com/javascript/#dropdowns
	 * ========================================================================
	 * Copyright 2011-2015 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // DROPDOWN CLASS DEFINITION
	  // =========================
	
	  var backdrop = '.dropdown-backdrop'
	  var toggle   = '[data-toggle="dropdown"]'
	  var Dropdown = function (element) {
	    $(element).on('click.bs.dropdown', this.toggle)
	  }
	
	  Dropdown.VERSION = '3.3.6'
	
	  function getParent($this) {
	    var selector = $this.attr('data-target')
	
	    if (!selector) {
	      selector = $this.attr('href')
	      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
	    }
	
	    var $parent = selector && $(selector)
	
	    return $parent && $parent.length ? $parent : $this.parent()
	  }
	
	  function clearMenus(e) {
	    if (e && e.which === 3) return
	    $(backdrop).remove()
	    $(toggle).each(function () {
	      var $this         = $(this)
	      var $parent       = getParent($this)
	      var relatedTarget = { relatedTarget: this }
	
	      if (!$parent.hasClass('open')) return
	
	      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return
	
	      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
	
	      if (e.isDefaultPrevented()) return
	
	      $this.attr('aria-expanded', 'false')
	      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
	    })
	  }
	
	  Dropdown.prototype.toggle = function (e) {
	    var $this = $(this)
	
	    if ($this.is('.disabled, :disabled')) return
	
	    var $parent  = getParent($this)
	    var isActive = $parent.hasClass('open')
	
	    clearMenus()
	
	    if (!isActive) {
	      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
	        // if mobile we use a backdrop because click events don't delegate
	        $(document.createElement('div'))
	          .addClass('dropdown-backdrop')
	          .insertAfter($(this))
	          .on('click', clearMenus)
	      }
	
	      var relatedTarget = { relatedTarget: this }
	      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))
	
	      if (e.isDefaultPrevented()) return
	
	      $this
	        .trigger('focus')
	        .attr('aria-expanded', 'true')
	
	      $parent
	        .toggleClass('open')
	        .trigger($.Event('shown.bs.dropdown', relatedTarget))
	    }
	
	    return false
	  }
	
	  Dropdown.prototype.keydown = function (e) {
	    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return
	
	    var $this = $(this)
	
	    e.preventDefault()
	    e.stopPropagation()
	
	    if ($this.is('.disabled, :disabled')) return
	
	    var $parent  = getParent($this)
	    var isActive = $parent.hasClass('open')
	
	    if (!isActive && e.which != 27 || isActive && e.which == 27) {
	      if (e.which == 27) $parent.find(toggle).trigger('focus')
	      return $this.trigger('click')
	    }
	
	    var desc = ' li:not(.disabled):visible a'
	    var $items = $parent.find('.dropdown-menu' + desc)
	
	    if (!$items.length) return
	
	    var index = $items.index(e.target)
	
	    if (e.which == 38 && index > 0)                 index--         // up
	    if (e.which == 40 && index < $items.length - 1) index++         // down
	    if (!~index)                                    index = 0
	
	    $items.eq(index).trigger('focus')
	  }
	
	
	  // DROPDOWN PLUGIN DEFINITION
	  // ==========================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this = $(this)
	      var data  = $this.data('bs.dropdown')
	
	      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
	      if (typeof option == 'string') data[option].call($this)
	    })
	  }
	
	  var old = $.fn.dropdown
	
	  $.fn.dropdown             = Plugin
	  $.fn.dropdown.Constructor = Dropdown
	
	
	  // DROPDOWN NO CONFLICT
	  // ====================
	
	  $.fn.dropdown.noConflict = function () {
	    $.fn.dropdown = old
	    return this
	  }
	
	
	  // APPLY TO STANDARD DROPDOWN ELEMENTS
	  // ===================================
	
	  $(document)
	    .on('click.bs.dropdown.data-api', clearMenus)
	    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
	    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
	    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
	    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)
	
	}(jQuery);


/***/ },

/***/ 239:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	 *  Remodal - v1.0.6
	 *  Responsive, lightweight, fast, synchronized with CSS animations, fully customizable modal window plugin with declarative configuration and hash tracking.
	 *  http://vodkabears.github.io/remodal/
	 *
	 *  Made by Ilya Makarov
	 *  Under MIT License
	 */
	
	!(function(root, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(196)], __WEBPACK_AMD_DEFINE_RESULT__ = function($) {
	      return factory(root, $);
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports === 'object') {
	    factory(root, require('jquery'));
	  } else {
	    factory(root, root.jQuery || root.Zepto);
	  }
	})(this, function(global, $) {
	
	  'use strict';
	
	  /**
	   * Name of the plugin
	   * @private
	   * @const
	   * @type {String}
	   */
	  var PLUGIN_NAME = 'remodal';
	
	  /**
	   * Namespace for CSS and events
	   * @private
	   * @const
	   * @type {String}
	   */
	  var NAMESPACE = global.REMODAL_GLOBALS && global.REMODAL_GLOBALS.NAMESPACE || PLUGIN_NAME;
	
	  /**
	   * Animationstart event with vendor prefixes
	   * @private
	   * @const
	   * @type {String}
	   */
	  var ANIMATIONSTART_EVENTS = $.map(
	    ['animationstart', 'webkitAnimationStart', 'MSAnimationStart', 'oAnimationStart'],
	
	    function(eventName) {
	      return eventName + '.' + NAMESPACE;
	    }
	
	  ).join(' ');
	
	  /**
	   * Animationend event with vendor prefixes
	   * @private
	   * @const
	   * @type {String}
	   */
	  var ANIMATIONEND_EVENTS = $.map(
	    ['animationend', 'webkitAnimationEnd', 'MSAnimationEnd', 'oAnimationEnd'],
	
	    function(eventName) {
	      return eventName + '.' + NAMESPACE;
	    }
	
	  ).join(' ');
	
	  /**
	   * Default settings
	   * @private
	   * @const
	   * @type {Object}
	   */
	  var DEFAULTS = $.extend({
	    hashTracking: true,
	    closeOnConfirm: true,
	    closeOnCancel: true,
	    closeOnEscape: true,
	    closeOnOutsideClick: true,
	    modifier: ''
	  }, global.REMODAL_GLOBALS && global.REMODAL_GLOBALS.DEFAULTS);
	
	  /**
	   * States of the Remodal
	   * @private
	   * @const
	   * @enum {String}
	   */
	  var STATES = {
	    CLOSING: 'closing',
	    CLOSED: 'closed',
	    OPENING: 'opening',
	    OPENED: 'opened'
	  };
	
	  /**
	   * Reasons of the state change.
	   * @private
	   * @const
	   * @enum {String}
	   */
	  var STATE_CHANGE_REASONS = {
	    CONFIRMATION: 'confirmation',
	    CANCELLATION: 'cancellation'
	  };
	
	  /**
	   * Is animation supported?
	   * @private
	   * @const
	   * @type {Boolean}
	   */
	  var IS_ANIMATION = (function() {
	    var style = document.createElement('div').style;
	
	    return style.animationName !== undefined ||
	      style.WebkitAnimationName !== undefined ||
	      style.MozAnimationName !== undefined ||
	      style.msAnimationName !== undefined ||
	      style.OAnimationName !== undefined;
	  })();
	
	  /**
	   * Is iOS?
	   * @private
	   * @const
	   * @type {Boolean}
	   */
	  var IS_IOS = /iPad|iPhone|iPod/.test(navigator.platform);
	
	  /**
	   * Current modal
	   * @private
	   * @type {Remodal}
	   */
	  var current;
	
	  /**
	   * Scrollbar position
	   * @private
	   * @type {Number}
	   */
	  var scrollTop;
	
	  /**
	   * Returns an animation duration
	   * @private
	   * @param {jQuery} $elem
	   * @returns {Number}
	   */
	  function getAnimationDuration($elem) {
	    if (
	      IS_ANIMATION &&
	      $elem.css('animation-name') === 'none' &&
	      $elem.css('-webkit-animation-name') === 'none' &&
	      $elem.css('-moz-animation-name') === 'none' &&
	      $elem.css('-o-animation-name') === 'none' &&
	      $elem.css('-ms-animation-name') === 'none'
	    ) {
	      return 0;
	    }
	
	    var duration = $elem.css('animation-duration') ||
	      $elem.css('-webkit-animation-duration') ||
	      $elem.css('-moz-animation-duration') ||
	      $elem.css('-o-animation-duration') ||
	      $elem.css('-ms-animation-duration') ||
	      '0s';
	
	    var delay = $elem.css('animation-delay') ||
	      $elem.css('-webkit-animation-delay') ||
	      $elem.css('-moz-animation-delay') ||
	      $elem.css('-o-animation-delay') ||
	      $elem.css('-ms-animation-delay') ||
	      '0s';
	
	    var iterationCount = $elem.css('animation-iteration-count') ||
	      $elem.css('-webkit-animation-iteration-count') ||
	      $elem.css('-moz-animation-iteration-count') ||
	      $elem.css('-o-animation-iteration-count') ||
	      $elem.css('-ms-animation-iteration-count') ||
	      '1';
	
	    var max;
	    var len;
	    var num;
	    var i;
	
	    duration = duration.split(', ');
	    delay = delay.split(', ');
	    iterationCount = iterationCount.split(', ');
	
	    // The 'duration' size is the same as the 'delay' size
	    for (i = 0, len = duration.length, max = Number.NEGATIVE_INFINITY; i < len; i++) {
	      num = parseFloat(duration[i]) * parseInt(iterationCount[i], 10) + parseFloat(delay[i]);
	
	      if (num > max) {
	        max = num;
	      }
	    }
	
	    return num;
	  }
	
	  /**
	   * Returns a scrollbar width
	   * @private
	   * @returns {Number}
	   */
	  function getScrollbarWidth() {
	    if ($(document.body).height() <= $(window).height()) {
	      return 0;
	    }
	
	    var outer = document.createElement('div');
	    var inner = document.createElement('div');
	    var widthNoScroll;
	    var widthWithScroll;
	
	    outer.style.visibility = 'hidden';
	    outer.style.width = '100px';
	    document.body.appendChild(outer);
	
	    widthNoScroll = outer.offsetWidth;
	
	    // Force scrollbars
	    outer.style.overflow = 'scroll';
	
	    // Add inner div
	    inner.style.width = '100%';
	    outer.appendChild(inner);
	
	    widthWithScroll = inner.offsetWidth;
	
	    // Remove divs
	    outer.parentNode.removeChild(outer);
	
	    return widthNoScroll - widthWithScroll;
	  }
	
	  /**
	   * Locks the screen
	   * @private
	   */
	  function lockScreen() {
	    if (IS_IOS) {
	      return;
	    }
	
	    var $html = $('html');
	    var lockedClass = namespacify('is-locked');
	    var paddingRight;
	    var $body;
	
	    if (!$html.hasClass(lockedClass)) {
	      $body = $(document.body);
	
	      // Zepto does not support '-=', '+=' in the `css` method
	      paddingRight = parseInt($body.css('padding-right'), 10) + getScrollbarWidth();
	
	      $body.css('padding-right', paddingRight + 'px');
	      $html.addClass(lockedClass);
	    }
	  }
	
	  /**
	   * Unlocks the screen
	   * @private
	   */
	  function unlockScreen() {
	    if (IS_IOS) {
	      return;
	    }
	
	    var $html = $('html');
	    var lockedClass = namespacify('is-locked');
	    var paddingRight;
	    var $body;
	
	    if ($html.hasClass(lockedClass)) {
	      $body = $(document.body);
	
	      // Zepto does not support '-=', '+=' in the `css` method
	      paddingRight = parseInt($body.css('padding-right'), 10) - getScrollbarWidth();
	
	      $body.css('padding-right', paddingRight + 'px');
	      $html.removeClass(lockedClass);
	    }
	  }
	
	  /**
	   * Sets a state for an instance
	   * @private
	   * @param {Remodal} instance
	   * @param {STATES} state
	   * @param {Boolean} isSilent If true, Remodal does not trigger events
	   * @param {String} Reason of a state change.
	   */
	  function setState(instance, state, isSilent, reason) {
	
	    var newState = namespacify('is', state);
	    var allStates = [namespacify('is', STATES.CLOSING),
	                     namespacify('is', STATES.OPENING),
	                     namespacify('is', STATES.CLOSED),
	                     namespacify('is', STATES.OPENED)].join(' ');
	
	    instance.$bg
	      .removeClass(allStates)
	      .addClass(newState);
	
	    instance.$overlay
	      .removeClass(allStates)
	      .addClass(newState);
	
	    instance.$wrapper
	      .removeClass(allStates)
	      .addClass(newState);
	
	    instance.$modal
	      .removeClass(allStates)
	      .addClass(newState);
	
	    instance.state = state;
	    !isSilent && instance.$modal.trigger({
	      type: state,
	      reason: reason
	    }, [{ reason: reason }]);
	  }
	
	  /**
	   * Synchronizes with the animation
	   * @param {Function} doBeforeAnimation
	   * @param {Function} doAfterAnimation
	   * @param {Remodal} instance
	   */
	  function syncWithAnimation(doBeforeAnimation, doAfterAnimation, instance) {
	    var runningAnimationsCount = 0;
	
	    var handleAnimationStart = function(e) {
	      if (e.target !== this) {
	        return;
	      }
	
	      runningAnimationsCount++;
	    };
	
	    var handleAnimationEnd = function(e) {
	      if (e.target !== this) {
	        return;
	      }
	
	      if (--runningAnimationsCount === 0) {
	
	        // Remove event listeners
	        $.each(['$bg', '$overlay', '$wrapper', '$modal'], function(index, elemName) {
	          instance[elemName].off(ANIMATIONSTART_EVENTS + ' ' + ANIMATIONEND_EVENTS);
	        });
	
	        doAfterAnimation();
	      }
	    };
	
	    $.each(['$bg', '$overlay', '$wrapper', '$modal'], function(index, elemName) {
	      instance[elemName]
	        .on(ANIMATIONSTART_EVENTS, handleAnimationStart)
	        .on(ANIMATIONEND_EVENTS, handleAnimationEnd);
	    });
	
	    doBeforeAnimation();
	
	    // If the animation is not supported by a browser or its duration is 0
	    if (
	      getAnimationDuration(instance.$bg) === 0 &&
	      getAnimationDuration(instance.$overlay) === 0 &&
	      getAnimationDuration(instance.$wrapper) === 0 &&
	      getAnimationDuration(instance.$modal) === 0
	    ) {
	
	      // Remove event listeners
	      $.each(['$bg', '$overlay', '$wrapper', '$modal'], function(index, elemName) {
	        instance[elemName].off(ANIMATIONSTART_EVENTS + ' ' + ANIMATIONEND_EVENTS);
	      });
	
	      doAfterAnimation();
	    }
	  }
	
	  /**
	   * Closes immediately
	   * @private
	   * @param {Remodal} instance
	   */
	  function halt(instance) {
	    if (instance.state === STATES.CLOSED) {
	      return;
	    }
	
	    $.each(['$bg', '$overlay', '$wrapper', '$modal'], function(index, elemName) {
	      instance[elemName].off(ANIMATIONSTART_EVENTS + ' ' + ANIMATIONEND_EVENTS);
	    });
	
	    instance.$bg.removeClass(instance.settings.modifier);
	    instance.$overlay.removeClass(instance.settings.modifier).hide();
	    instance.$wrapper.hide();
	    unlockScreen();
	    setState(instance, STATES.CLOSED, true);
	  }
	
	  /**
	   * Parses a string with options
	   * @private
	   * @param str
	   * @returns {Object}
	   */
	  function parseOptions(str) {
	    var obj = {};
	    var arr;
	    var len;
	    var val;
	    var i;
	
	    // Remove spaces before and after delimiters
	    str = str.replace(/\s*:\s*/g, ':').replace(/\s*,\s*/g, ',');
	
	    // Parse a string
	    arr = str.split(',');
	    for (i = 0, len = arr.length; i < len; i++) {
	      arr[i] = arr[i].split(':');
	      val = arr[i][1];
	
	      // Convert a string value if it is like a boolean
	      if (typeof val === 'string' || val instanceof String) {
	        val = val === 'true' || (val === 'false' ? false : val);
	      }
	
	      // Convert a string value if it is like a number
	      if (typeof val === 'string' || val instanceof String) {
	        val = !isNaN(val) ? +val : val;
	      }
	
	      obj[arr[i][0]] = val;
	    }
	
	    return obj;
	  }
	
	  /**
	   * Generates a string separated by dashes and prefixed with NAMESPACE
	   * @private
	   * @param {...String}
	   * @returns {String}
	   */
	  function namespacify() {
	    var result = NAMESPACE;
	
	    for (var i = 0; i < arguments.length; ++i) {
	      result += '-' + arguments[i];
	    }
	
	    return result;
	  }
	
	  /**
	   * Handles the hashchange event
	   * @private
	   * @listens hashchange
	   */
	  function handleHashChangeEvent() {
	    var id = location.hash.replace('#', '');
	    var instance;
	    var $elem;
	
	    if (!id) {
	
	      // Check if we have currently opened modal and animation was completed
	      if (current && current.state === STATES.OPENED && current.settings.hashTracking) {
	        current.close();
	      }
	    } else {
	
	      // Catch syntax error if your hash is bad
	      try {
	        $elem = $(
	          '[data-' + PLUGIN_NAME + '-id="' + id + '"]'
	        );
	      } catch (err) {}
	
	      if ($elem && $elem.length) {
	        instance = $[PLUGIN_NAME].lookup[$elem.data(PLUGIN_NAME)];
	
	        if (instance && instance.settings.hashTracking) {
	          instance.open();
	        }
	      }
	
	    }
	  }
	
	  /**
	   * Remodal constructor
	   * @constructor
	   * @param {jQuery} $modal
	   * @param {Object} options
	   */
	  function Remodal($modal, options) {
	    var $body = $(document.body);
	    var remodal = this;
	
	    remodal.settings = $.extend({}, DEFAULTS, options);
	    remodal.index = $[PLUGIN_NAME].lookup.push(remodal) - 1;
	    remodal.state = STATES.CLOSED;
	
	    remodal.$overlay = $('.' + namespacify('overlay'));
	
	    if (!remodal.$overlay.length) {
	      remodal.$overlay = $('<div>').addClass(namespacify('overlay') + ' ' + namespacify('is', STATES.CLOSED)).hide();
	      $body.append(remodal.$overlay);
	    }
	
	    remodal.$bg = $('.' + namespacify('bg')).addClass(namespacify('is', STATES.CLOSED));
	
	    remodal.$modal = $modal
	      .addClass(
	        NAMESPACE + ' ' +
	        namespacify('is-initialized') + ' ' +
	        remodal.settings.modifier + ' ' +
	        namespacify('is', STATES.CLOSED))
	      .attr('tabindex', '-1');
	
	    remodal.$wrapper = $('<div>')
	      .addClass(
	        namespacify('wrapper') + ' ' +
	        remodal.settings.modifier + ' ' +
	        namespacify('is', STATES.CLOSED))
	      .hide()
	      .append(remodal.$modal);
	    $body.append(remodal.$wrapper);
	
	    // Add the event listener for the close button
	    remodal.$wrapper.on('click.' + NAMESPACE, '[data-' + PLUGIN_NAME + '-action="close"]', function(e) {
	      e.preventDefault();
	
	      remodal.close();
	    });
	
	    // Add the event listener for the cancel button
	    remodal.$wrapper.on('click.' + NAMESPACE, '[data-' + PLUGIN_NAME + '-action="cancel"]', function(e) {
	      e.preventDefault();
	
	      remodal.$modal.trigger(STATE_CHANGE_REASONS.CANCELLATION);
	
	      if (remodal.settings.closeOnCancel) {
	        remodal.close(STATE_CHANGE_REASONS.CANCELLATION);
	      }
	    });
	
	    // Add the event listener for the confirm button
	    remodal.$wrapper.on('click.' + NAMESPACE, '[data-' + PLUGIN_NAME + '-action="confirm"]', function(e) {
	      e.preventDefault();
	
	      remodal.$modal.trigger(STATE_CHANGE_REASONS.CONFIRMATION);
	
	      if (remodal.settings.closeOnConfirm) {
	        remodal.close(STATE_CHANGE_REASONS.CONFIRMATION);
	      }
	    });
	
	    // Add the event listener for the overlay
	    remodal.$wrapper.on('click.' + NAMESPACE, function(e) {
	      var $target = $(e.target);
	
	      if (!$target.hasClass(namespacify('wrapper'))) {
	        return;
	      }
	
	      if (remodal.settings.closeOnOutsideClick) {
	        remodal.close();
	      }
	    });
	  }
	
	  /**
	   * Opens a modal window
	   * @public
	   */
	  Remodal.prototype.open = function() {
	    var remodal = this;
	    var id;
	
	    // Check if the animation was completed
	    if (remodal.state === STATES.OPENING || remodal.state === STATES.CLOSING) {
	      return;
	    }
	
	    id = remodal.$modal.attr('data-' + PLUGIN_NAME + '-id');
	
	    if (id && remodal.settings.hashTracking) {
	      scrollTop = $(window).scrollTop();
	      location.hash = id;
	    }
	
	    if (current && current !== remodal) {
	      halt(current);
	    }
	
	    current = remodal;
	    lockScreen();
	    remodal.$bg.addClass(remodal.settings.modifier);
	    remodal.$overlay.addClass(remodal.settings.modifier).show();
	    remodal.$wrapper.show().scrollTop(0);
	    remodal.$modal.focus();
	
	    syncWithAnimation(
	      function() {
	        setState(remodal, STATES.OPENING);
	      },
	
	      function() {
	        setState(remodal, STATES.OPENED);
	      },
	
	      remodal);
	  };
	
	  /**
	   * Closes a modal window
	   * @public
	   * @param {String} reason
	   */
	  Remodal.prototype.close = function(reason) {
	    var remodal = this;
	
	    // Check if the animation was completed
	    if (remodal.state === STATES.OPENING || remodal.state === STATES.CLOSING) {
	      return;
	    }
	
	    if (
	      remodal.settings.hashTracking &&
	      remodal.$modal.attr('data-' + PLUGIN_NAME + '-id') === location.hash.substr(1)
	    ) {
	      location.hash = '';
	      $(window).scrollTop(scrollTop);
	    }
	
	    syncWithAnimation(
	      function() {
	        setState(remodal, STATES.CLOSING, false, reason);
	      },
	
	      function() {
	        remodal.$bg.removeClass(remodal.settings.modifier);
	        remodal.$overlay.removeClass(remodal.settings.modifier).hide();
	        remodal.$wrapper.hide();
	        unlockScreen();
	
	        setState(remodal, STATES.CLOSED, false, reason);
	      },
	
	      remodal);
	  };
	
	  /**
	   * Returns a current state of a modal
	   * @public
	   * @returns {STATES}
	   */
	  Remodal.prototype.getState = function() {
	    return this.state;
	  };
	
	  /**
	   * Destroys a modal
	   * @public
	   */
	  Remodal.prototype.destroy = function() {
	    var lookup = $[PLUGIN_NAME].lookup;
	    var instanceCount;
	
	    halt(this);
	    this.$wrapper.remove();
	
	    delete lookup[this.index];
	    instanceCount = $.grep(lookup, function(instance) {
	      return !!instance;
	    }).length;
	
	    if (instanceCount === 0) {
	      this.$overlay.remove();
	      this.$bg.removeClass(
	        namespacify('is', STATES.CLOSING) + ' ' +
	        namespacify('is', STATES.OPENING) + ' ' +
	        namespacify('is', STATES.CLOSED) + ' ' +
	        namespacify('is', STATES.OPENED));
	    }
	  };
	
	  /**
	   * Special plugin object for instances
	   * @public
	   * @type {Object}
	   */
	  $[PLUGIN_NAME] = {
	    lookup: []
	  };
	
	  /**
	   * Plugin constructor
	   * @constructor
	   * @param {Object} options
	   * @returns {JQuery}
	   */
	  $.fn[PLUGIN_NAME] = function(opts) {
	    var instance;
	    var $elem;
	
	    this.each(function(index, elem) {
	      $elem = $(elem);
	
	      if ($elem.data(PLUGIN_NAME) == null) {
	        instance = new Remodal($elem, opts);
	        $elem.data(PLUGIN_NAME, instance.index);
	
	        if (
	          instance.settings.hashTracking &&
	          $elem.attr('data-' + PLUGIN_NAME + '-id') === location.hash.substr(1)
	        ) {
	          instance.open();
	        }
	      } else {
	        instance = $[PLUGIN_NAME].lookup[$elem.data(PLUGIN_NAME)];
	      }
	    });
	
	    return instance;
	  };
	
	  $(document).ready(function() {
	
	    // data-remodal-target opens a modal window with the special Id
	    $(document).on('click', '[data-' + PLUGIN_NAME + '-target]', function(e) {
	      e.preventDefault();
	
	      var elem = e.currentTarget;
	      var id = elem.getAttribute('data-' + PLUGIN_NAME + '-target');
	      var $target = $('[data-' + PLUGIN_NAME + '-id="' + id + '"]');
	
	      $[PLUGIN_NAME].lookup[$target.data(PLUGIN_NAME)].open();
	    });
	
	    // Auto initialization of modal windows
	    // They should have the 'remodal' class attribute
	    // Also you can write the `data-remodal-options` attribute to pass params into the modal
	    $(document).find('.' + NAMESPACE).each(function(i, container) {
	      var $container = $(container);
	      var options = $container.data(PLUGIN_NAME + '-options');
	
	      if (!options) {
	        options = {};
	      } else if (typeof options === 'string' || options instanceof String) {
	        options = parseOptions(options);
	      }
	
	      $container[PLUGIN_NAME](options);
	    });
	
	    // Handles the keydown event
	    $(document).on('keydown.' + NAMESPACE, function(e) {
	      if (current && current.settings.closeOnEscape && current.state === STATES.OPENED && e.keyCode === 27) {
	        current.close();
	      }
	    });
	
	    // Handles the hashchange event
	    $(window).on('hashchange.' + NAMESPACE, handleHashChangeEvent);
	  });
	});


/***/ },

/***/ 240:
/***/ function(module, exports, __webpack_require__) {

	// This file is autogenerated via the `commonjs` Grunt task. You can require() this file in a CommonJS environment.
	__webpack_require__(241)
	__webpack_require__(242)
	__webpack_require__(243)
	__webpack_require__(244)
	__webpack_require__(245)
	__webpack_require__(238)
	__webpack_require__(246)
	__webpack_require__(247)
	__webpack_require__(248)
	__webpack_require__(249)
	__webpack_require__(250)
	__webpack_require__(251)

/***/ },

/***/ 241:
/***/ function(module, exports) {

	/* ========================================================================
	 * Bootstrap: transition.js v3.3.6
	 * http://getbootstrap.com/javascript/#transitions
	 * ========================================================================
	 * Copyright 2011-2015 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
	  // ============================================================
	
	  function transitionEnd() {
	    var el = document.createElement('bootstrap')
	
	    var transEndEventNames = {
	      WebkitTransition : 'webkitTransitionEnd',
	      MozTransition    : 'transitionend',
	      OTransition      : 'oTransitionEnd otransitionend',
	      transition       : 'transitionend'
	    }
	
	    for (var name in transEndEventNames) {
	      if (el.style[name] !== undefined) {
	        return { end: transEndEventNames[name] }
	      }
	    }
	
	    return false // explicit for ie8 (  ._.)
	  }
	
	  // http://blog.alexmaccaw.com/css-transitions
	  $.fn.emulateTransitionEnd = function (duration) {
	    var called = false
	    var $el = this
	    $(this).one('bsTransitionEnd', function () { called = true })
	    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
	    setTimeout(callback, duration)
	    return this
	  }
	
	  $(function () {
	    $.support.transition = transitionEnd()
	
	    if (!$.support.transition) return
	
	    $.event.special.bsTransitionEnd = {
	      bindType: $.support.transition.end,
	      delegateType: $.support.transition.end,
	      handle: function (e) {
	        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
	      }
	    }
	  })
	
	}(jQuery);


/***/ },

/***/ 242:
/***/ function(module, exports) {

	/* ========================================================================
	 * Bootstrap: alert.js v3.3.6
	 * http://getbootstrap.com/javascript/#alerts
	 * ========================================================================
	 * Copyright 2011-2015 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // ALERT CLASS DEFINITION
	  // ======================
	
	  var dismiss = '[data-dismiss="alert"]'
	  var Alert   = function (el) {
	    $(el).on('click', dismiss, this.close)
	  }
	
	  Alert.VERSION = '3.3.6'
	
	  Alert.TRANSITION_DURATION = 150
	
	  Alert.prototype.close = function (e) {
	    var $this    = $(this)
	    var selector = $this.attr('data-target')
	
	    if (!selector) {
	      selector = $this.attr('href')
	      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
	    }
	
	    var $parent = $(selector)
	
	    if (e) e.preventDefault()
	
	    if (!$parent.length) {
	      $parent = $this.closest('.alert')
	    }
	
	    $parent.trigger(e = $.Event('close.bs.alert'))
	
	    if (e.isDefaultPrevented()) return
	
	    $parent.removeClass('in')
	
	    function removeElement() {
	      // detach from parent, fire event then clean up data
	      $parent.detach().trigger('closed.bs.alert').remove()
	    }
	
	    $.support.transition && $parent.hasClass('fade') ?
	      $parent
	        .one('bsTransitionEnd', removeElement)
	        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
	      removeElement()
	  }
	
	
	  // ALERT PLUGIN DEFINITION
	  // =======================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this = $(this)
	      var data  = $this.data('bs.alert')
	
	      if (!data) $this.data('bs.alert', (data = new Alert(this)))
	      if (typeof option == 'string') data[option].call($this)
	    })
	  }
	
	  var old = $.fn.alert
	
	  $.fn.alert             = Plugin
	  $.fn.alert.Constructor = Alert
	
	
	  // ALERT NO CONFLICT
	  // =================
	
	  $.fn.alert.noConflict = function () {
	    $.fn.alert = old
	    return this
	  }
	
	
	  // ALERT DATA-API
	  // ==============
	
	  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)
	
	}(jQuery);


/***/ },

/***/ 243:
/***/ function(module, exports) {

	/* ========================================================================
	 * Bootstrap: button.js v3.3.6
	 * http://getbootstrap.com/javascript/#buttons
	 * ========================================================================
	 * Copyright 2011-2015 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // BUTTON PUBLIC CLASS DEFINITION
	  // ==============================
	
	  var Button = function (element, options) {
	    this.$element  = $(element)
	    this.options   = $.extend({}, Button.DEFAULTS, options)
	    this.isLoading = false
	  }
	
	  Button.VERSION  = '3.3.6'
	
	  Button.DEFAULTS = {
	    loadingText: 'loading...'
	  }
	
	  Button.prototype.setState = function (state) {
	    var d    = 'disabled'
	    var $el  = this.$element
	    var val  = $el.is('input') ? 'val' : 'html'
	    var data = $el.data()
	
	    state += 'Text'
	
	    if (data.resetText == null) $el.data('resetText', $el[val]())
	
	    // push to event loop to allow forms to submit
	    setTimeout($.proxy(function () {
	      $el[val](data[state] == null ? this.options[state] : data[state])
	
	      if (state == 'loadingText') {
	        this.isLoading = true
	        $el.addClass(d).attr(d, d)
	      } else if (this.isLoading) {
	        this.isLoading = false
	        $el.removeClass(d).removeAttr(d)
	      }
	    }, this), 0)
	  }
	
	  Button.prototype.toggle = function () {
	    var changed = true
	    var $parent = this.$element.closest('[data-toggle="buttons"]')
	
	    if ($parent.length) {
	      var $input = this.$element.find('input')
	      if ($input.prop('type') == 'radio') {
	        if ($input.prop('checked')) changed = false
	        $parent.find('.active').removeClass('active')
	        this.$element.addClass('active')
	      } else if ($input.prop('type') == 'checkbox') {
	        if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
	        this.$element.toggleClass('active')
	      }
	      $input.prop('checked', this.$element.hasClass('active'))
	      if (changed) $input.trigger('change')
	    } else {
	      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
	      this.$element.toggleClass('active')
	    }
	  }
	
	
	  // BUTTON PLUGIN DEFINITION
	  // ========================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.button')
	      var options = typeof option == 'object' && option
	
	      if (!data) $this.data('bs.button', (data = new Button(this, options)))
	
	      if (option == 'toggle') data.toggle()
	      else if (option) data.setState(option)
	    })
	  }
	
	  var old = $.fn.button
	
	  $.fn.button             = Plugin
	  $.fn.button.Constructor = Button
	
	
	  // BUTTON NO CONFLICT
	  // ==================
	
	  $.fn.button.noConflict = function () {
	    $.fn.button = old
	    return this
	  }
	
	
	  // BUTTON DATA-API
	  // ===============
	
	  $(document)
	    .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
	      var $btn = $(e.target)
	      if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
	      Plugin.call($btn, 'toggle')
	      if (!($(e.target).is('input[type="radio"]') || $(e.target).is('input[type="checkbox"]'))) e.preventDefault()
	    })
	    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
	      $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
	    })
	
	}(jQuery);


/***/ },

/***/ 244:
/***/ function(module, exports) {

	/* ========================================================================
	 * Bootstrap: carousel.js v3.3.6
	 * http://getbootstrap.com/javascript/#carousel
	 * ========================================================================
	 * Copyright 2011-2015 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // CAROUSEL CLASS DEFINITION
	  // =========================
	
	  var Carousel = function (element, options) {
	    this.$element    = $(element)
	    this.$indicators = this.$element.find('.carousel-indicators')
	    this.options     = options
	    this.paused      = null
	    this.sliding     = null
	    this.interval    = null
	    this.$active     = null
	    this.$items      = null
	
	    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))
	
	    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
	      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
	      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
	  }
	
	  Carousel.VERSION  = '3.3.6'
	
	  Carousel.TRANSITION_DURATION = 600
	
	  Carousel.DEFAULTS = {
	    interval: 5000,
	    pause: 'hover',
	    wrap: true,
	    keyboard: true
	  }
	
	  Carousel.prototype.keydown = function (e) {
	    if (/input|textarea/i.test(e.target.tagName)) return
	    switch (e.which) {
	      case 37: this.prev(); break
	      case 39: this.next(); break
	      default: return
	    }
	
	    e.preventDefault()
	  }
	
	  Carousel.prototype.cycle = function (e) {
	    e || (this.paused = false)
	
	    this.interval && clearInterval(this.interval)
	
	    this.options.interval
	      && !this.paused
	      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))
	
	    return this
	  }
	
	  Carousel.prototype.getItemIndex = function (item) {
	    this.$items = item.parent().children('.item')
	    return this.$items.index(item || this.$active)
	  }
	
	  Carousel.prototype.getItemForDirection = function (direction, active) {
	    var activeIndex = this.getItemIndex(active)
	    var willWrap = (direction == 'prev' && activeIndex === 0)
	                || (direction == 'next' && activeIndex == (this.$items.length - 1))
	    if (willWrap && !this.options.wrap) return active
	    var delta = direction == 'prev' ? -1 : 1
	    var itemIndex = (activeIndex + delta) % this.$items.length
	    return this.$items.eq(itemIndex)
	  }
	
	  Carousel.prototype.to = function (pos) {
	    var that        = this
	    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))
	
	    if (pos > (this.$items.length - 1) || pos < 0) return
	
	    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
	    if (activeIndex == pos) return this.pause().cycle()
	
	    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
	  }
	
	  Carousel.prototype.pause = function (e) {
	    e || (this.paused = true)
	
	    if (this.$element.find('.next, .prev').length && $.support.transition) {
	      this.$element.trigger($.support.transition.end)
	      this.cycle(true)
	    }
	
	    this.interval = clearInterval(this.interval)
	
	    return this
	  }
	
	  Carousel.prototype.next = function () {
	    if (this.sliding) return
	    return this.slide('next')
	  }
	
	  Carousel.prototype.prev = function () {
	    if (this.sliding) return
	    return this.slide('prev')
	  }
	
	  Carousel.prototype.slide = function (type, next) {
	    var $active   = this.$element.find('.item.active')
	    var $next     = next || this.getItemForDirection(type, $active)
	    var isCycling = this.interval
	    var direction = type == 'next' ? 'left' : 'right'
	    var that      = this
	
	    if ($next.hasClass('active')) return (this.sliding = false)
	
	    var relatedTarget = $next[0]
	    var slideEvent = $.Event('slide.bs.carousel', {
	      relatedTarget: relatedTarget,
	      direction: direction
	    })
	    this.$element.trigger(slideEvent)
	    if (slideEvent.isDefaultPrevented()) return
	
	    this.sliding = true
	
	    isCycling && this.pause()
	
	    if (this.$indicators.length) {
	      this.$indicators.find('.active').removeClass('active')
	      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
	      $nextIndicator && $nextIndicator.addClass('active')
	    }
	
	    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
	    if ($.support.transition && this.$element.hasClass('slide')) {
	      $next.addClass(type)
	      $next[0].offsetWidth // force reflow
	      $active.addClass(direction)
	      $next.addClass(direction)
	      $active
	        .one('bsTransitionEnd', function () {
	          $next.removeClass([type, direction].join(' ')).addClass('active')
	          $active.removeClass(['active', direction].join(' '))
	          that.sliding = false
	          setTimeout(function () {
	            that.$element.trigger(slidEvent)
	          }, 0)
	        })
	        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
	    } else {
	      $active.removeClass('active')
	      $next.addClass('active')
	      this.sliding = false
	      this.$element.trigger(slidEvent)
	    }
	
	    isCycling && this.cycle()
	
	    return this
	  }
	
	
	  // CAROUSEL PLUGIN DEFINITION
	  // ==========================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.carousel')
	      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
	      var action  = typeof option == 'string' ? option : options.slide
	
	      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
	      if (typeof option == 'number') data.to(option)
	      else if (action) data[action]()
	      else if (options.interval) data.pause().cycle()
	    })
	  }
	
	  var old = $.fn.carousel
	
	  $.fn.carousel             = Plugin
	  $.fn.carousel.Constructor = Carousel
	
	
	  // CAROUSEL NO CONFLICT
	  // ====================
	
	  $.fn.carousel.noConflict = function () {
	    $.fn.carousel = old
	    return this
	  }
	
	
	  // CAROUSEL DATA-API
	  // =================
	
	  var clickHandler = function (e) {
	    var href
	    var $this   = $(this)
	    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
	    if (!$target.hasClass('carousel')) return
	    var options = $.extend({}, $target.data(), $this.data())
	    var slideIndex = $this.attr('data-slide-to')
	    if (slideIndex) options.interval = false
	
	    Plugin.call($target, options)
	
	    if (slideIndex) {
	      $target.data('bs.carousel').to(slideIndex)
	    }
	
	    e.preventDefault()
	  }
	
	  $(document)
	    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
	    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)
	
	  $(window).on('load', function () {
	    $('[data-ride="carousel"]').each(function () {
	      var $carousel = $(this)
	      Plugin.call($carousel, $carousel.data())
	    })
	  })
	
	}(jQuery);


/***/ },

/***/ 245:
/***/ function(module, exports) {

	/* ========================================================================
	 * Bootstrap: collapse.js v3.3.6
	 * http://getbootstrap.com/javascript/#collapse
	 * ========================================================================
	 * Copyright 2011-2015 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // COLLAPSE PUBLIC CLASS DEFINITION
	  // ================================
	
	  var Collapse = function (element, options) {
	    this.$element      = $(element)
	    this.options       = $.extend({}, Collapse.DEFAULTS, options)
	    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
	                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
	    this.transitioning = null
	
	    if (this.options.parent) {
	      this.$parent = this.getParent()
	    } else {
	      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
	    }
	
	    if (this.options.toggle) this.toggle()
	  }
	
	  Collapse.VERSION  = '3.3.6'
	
	  Collapse.TRANSITION_DURATION = 350
	
	  Collapse.DEFAULTS = {
	    toggle: true
	  }
	
	  Collapse.prototype.dimension = function () {
	    var hasWidth = this.$element.hasClass('width')
	    return hasWidth ? 'width' : 'height'
	  }
	
	  Collapse.prototype.show = function () {
	    if (this.transitioning || this.$element.hasClass('in')) return
	
	    var activesData
	    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')
	
	    if (actives && actives.length) {
	      activesData = actives.data('bs.collapse')
	      if (activesData && activesData.transitioning) return
	    }
	
	    var startEvent = $.Event('show.bs.collapse')
	    this.$element.trigger(startEvent)
	    if (startEvent.isDefaultPrevented()) return
	
	    if (actives && actives.length) {
	      Plugin.call(actives, 'hide')
	      activesData || actives.data('bs.collapse', null)
	    }
	
	    var dimension = this.dimension()
	
	    this.$element
	      .removeClass('collapse')
	      .addClass('collapsing')[dimension](0)
	      .attr('aria-expanded', true)
	
	    this.$trigger
	      .removeClass('collapsed')
	      .attr('aria-expanded', true)
	
	    this.transitioning = 1
	
	    var complete = function () {
	      this.$element
	        .removeClass('collapsing')
	        .addClass('collapse in')[dimension]('')
	      this.transitioning = 0
	      this.$element
	        .trigger('shown.bs.collapse')
	    }
	
	    if (!$.support.transition) return complete.call(this)
	
	    var scrollSize = $.camelCase(['scroll', dimension].join('-'))
	
	    this.$element
	      .one('bsTransitionEnd', $.proxy(complete, this))
	      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
	  }
	
	  Collapse.prototype.hide = function () {
	    if (this.transitioning || !this.$element.hasClass('in')) return
	
	    var startEvent = $.Event('hide.bs.collapse')
	    this.$element.trigger(startEvent)
	    if (startEvent.isDefaultPrevented()) return
	
	    var dimension = this.dimension()
	
	    this.$element[dimension](this.$element[dimension]())[0].offsetHeight
	
	    this.$element
	      .addClass('collapsing')
	      .removeClass('collapse in')
	      .attr('aria-expanded', false)
	
	    this.$trigger
	      .addClass('collapsed')
	      .attr('aria-expanded', false)
	
	    this.transitioning = 1
	
	    var complete = function () {
	      this.transitioning = 0
	      this.$element
	        .removeClass('collapsing')
	        .addClass('collapse')
	        .trigger('hidden.bs.collapse')
	    }
	
	    if (!$.support.transition) return complete.call(this)
	
	    this.$element
	      [dimension](0)
	      .one('bsTransitionEnd', $.proxy(complete, this))
	      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
	  }
	
	  Collapse.prototype.toggle = function () {
	    this[this.$element.hasClass('in') ? 'hide' : 'show']()
	  }
	
	  Collapse.prototype.getParent = function () {
	    return $(this.options.parent)
	      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
	      .each($.proxy(function (i, element) {
	        var $element = $(element)
	        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
	      }, this))
	      .end()
	  }
	
	  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
	    var isOpen = $element.hasClass('in')
	
	    $element.attr('aria-expanded', isOpen)
	    $trigger
	      .toggleClass('collapsed', !isOpen)
	      .attr('aria-expanded', isOpen)
	  }
	
	  function getTargetFromTrigger($trigger) {
	    var href
	    var target = $trigger.attr('data-target')
	      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7
	
	    return $(target)
	  }
	
	
	  // COLLAPSE PLUGIN DEFINITION
	  // ==========================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.collapse')
	      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)
	
	      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
	      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
	      if (typeof option == 'string') data[option]()
	    })
	  }
	
	  var old = $.fn.collapse
	
	  $.fn.collapse             = Plugin
	  $.fn.collapse.Constructor = Collapse
	
	
	  // COLLAPSE NO CONFLICT
	  // ====================
	
	  $.fn.collapse.noConflict = function () {
	    $.fn.collapse = old
	    return this
	  }
	
	
	  // COLLAPSE DATA-API
	  // =================
	
	  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
	    var $this   = $(this)
	
	    if (!$this.attr('data-target')) e.preventDefault()
	
	    var $target = getTargetFromTrigger($this)
	    var data    = $target.data('bs.collapse')
	    var option  = data ? 'toggle' : $this.data()
	
	    Plugin.call($target, option)
	  })
	
	}(jQuery);


/***/ },

/***/ 246:
/***/ function(module, exports) {

	/* ========================================================================
	 * Bootstrap: modal.js v3.3.6
	 * http://getbootstrap.com/javascript/#modals
	 * ========================================================================
	 * Copyright 2011-2015 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // MODAL CLASS DEFINITION
	  // ======================
	
	  var Modal = function (element, options) {
	    this.options             = options
	    this.$body               = $(document.body)
	    this.$element            = $(element)
	    this.$dialog             = this.$element.find('.modal-dialog')
	    this.$backdrop           = null
	    this.isShown             = null
	    this.originalBodyPad     = null
	    this.scrollbarWidth      = 0
	    this.ignoreBackdropClick = false
	
	    if (this.options.remote) {
	      this.$element
	        .find('.modal-content')
	        .load(this.options.remote, $.proxy(function () {
	          this.$element.trigger('loaded.bs.modal')
	        }, this))
	    }
	  }
	
	  Modal.VERSION  = '3.3.6'
	
	  Modal.TRANSITION_DURATION = 300
	  Modal.BACKDROP_TRANSITION_DURATION = 150
	
	  Modal.DEFAULTS = {
	    backdrop: true,
	    keyboard: true,
	    show: true
	  }
	
	  Modal.prototype.toggle = function (_relatedTarget) {
	    return this.isShown ? this.hide() : this.show(_relatedTarget)
	  }
	
	  Modal.prototype.show = function (_relatedTarget) {
	    var that = this
	    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })
	
	    this.$element.trigger(e)
	
	    if (this.isShown || e.isDefaultPrevented()) return
	
	    this.isShown = true
	
	    this.checkScrollbar()
	    this.setScrollbar()
	    this.$body.addClass('modal-open')
	
	    this.escape()
	    this.resize()
	
	    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))
	
	    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
	      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
	        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
	      })
	    })
	
	    this.backdrop(function () {
	      var transition = $.support.transition && that.$element.hasClass('fade')
	
	      if (!that.$element.parent().length) {
	        that.$element.appendTo(that.$body) // don't move modals dom position
	      }
	
	      that.$element
	        .show()
	        .scrollTop(0)
	
	      that.adjustDialog()
	
	      if (transition) {
	        that.$element[0].offsetWidth // force reflow
	      }
	
	      that.$element.addClass('in')
	
	      that.enforceFocus()
	
	      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })
	
	      transition ?
	        that.$dialog // wait for modal to slide in
	          .one('bsTransitionEnd', function () {
	            that.$element.trigger('focus').trigger(e)
	          })
	          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
	        that.$element.trigger('focus').trigger(e)
	    })
	  }
	
	  Modal.prototype.hide = function (e) {
	    if (e) e.preventDefault()
	
	    e = $.Event('hide.bs.modal')
	
	    this.$element.trigger(e)
	
	    if (!this.isShown || e.isDefaultPrevented()) return
	
	    this.isShown = false
	
	    this.escape()
	    this.resize()
	
	    $(document).off('focusin.bs.modal')
	
	    this.$element
	      .removeClass('in')
	      .off('click.dismiss.bs.modal')
	      .off('mouseup.dismiss.bs.modal')
	
	    this.$dialog.off('mousedown.dismiss.bs.modal')
	
	    $.support.transition && this.$element.hasClass('fade') ?
	      this.$element
	        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
	        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
	      this.hideModal()
	  }
	
	  Modal.prototype.enforceFocus = function () {
	    $(document)
	      .off('focusin.bs.modal') // guard against infinite focus loop
	      .on('focusin.bs.modal', $.proxy(function (e) {
	        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
	          this.$element.trigger('focus')
	        }
	      }, this))
	  }
	
	  Modal.prototype.escape = function () {
	    if (this.isShown && this.options.keyboard) {
	      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
	        e.which == 27 && this.hide()
	      }, this))
	    } else if (!this.isShown) {
	      this.$element.off('keydown.dismiss.bs.modal')
	    }
	  }
	
	  Modal.prototype.resize = function () {
	    if (this.isShown) {
	      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
	    } else {
	      $(window).off('resize.bs.modal')
	    }
	  }
	
	  Modal.prototype.hideModal = function () {
	    var that = this
	    this.$element.hide()
	    this.backdrop(function () {
	      that.$body.removeClass('modal-open')
	      that.resetAdjustments()
	      that.resetScrollbar()
	      that.$element.trigger('hidden.bs.modal')
	    })
	  }
	
	  Modal.prototype.removeBackdrop = function () {
	    this.$backdrop && this.$backdrop.remove()
	    this.$backdrop = null
	  }
	
	  Modal.prototype.backdrop = function (callback) {
	    var that = this
	    var animate = this.$element.hasClass('fade') ? 'fade' : ''
	
	    if (this.isShown && this.options.backdrop) {
	      var doAnimate = $.support.transition && animate
	
	      this.$backdrop = $(document.createElement('div'))
	        .addClass('modal-backdrop ' + animate)
	        .appendTo(this.$body)
	
	      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
	        if (this.ignoreBackdropClick) {
	          this.ignoreBackdropClick = false
	          return
	        }
	        if (e.target !== e.currentTarget) return
	        this.options.backdrop == 'static'
	          ? this.$element[0].focus()
	          : this.hide()
	      }, this))
	
	      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow
	
	      this.$backdrop.addClass('in')
	
	      if (!callback) return
	
	      doAnimate ?
	        this.$backdrop
	          .one('bsTransitionEnd', callback)
	          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
	        callback()
	
	    } else if (!this.isShown && this.$backdrop) {
	      this.$backdrop.removeClass('in')
	
	      var callbackRemove = function () {
	        that.removeBackdrop()
	        callback && callback()
	      }
	      $.support.transition && this.$element.hasClass('fade') ?
	        this.$backdrop
	          .one('bsTransitionEnd', callbackRemove)
	          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
	        callbackRemove()
	
	    } else if (callback) {
	      callback()
	    }
	  }
	
	  // these following methods are used to handle overflowing modals
	
	  Modal.prototype.handleUpdate = function () {
	    this.adjustDialog()
	  }
	
	  Modal.prototype.adjustDialog = function () {
	    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight
	
	    this.$element.css({
	      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
	      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
	    })
	  }
	
	  Modal.prototype.resetAdjustments = function () {
	    this.$element.css({
	      paddingLeft: '',
	      paddingRight: ''
	    })
	  }
	
	  Modal.prototype.checkScrollbar = function () {
	    var fullWindowWidth = window.innerWidth
	    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
	      var documentElementRect = document.documentElement.getBoundingClientRect()
	      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
	    }
	    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
	    this.scrollbarWidth = this.measureScrollbar()
	  }
	
	  Modal.prototype.setScrollbar = function () {
	    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
	    this.originalBodyPad = document.body.style.paddingRight || ''
	    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
	  }
	
	  Modal.prototype.resetScrollbar = function () {
	    this.$body.css('padding-right', this.originalBodyPad)
	  }
	
	  Modal.prototype.measureScrollbar = function () { // thx walsh
	    var scrollDiv = document.createElement('div')
	    scrollDiv.className = 'modal-scrollbar-measure'
	    this.$body.append(scrollDiv)
	    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
	    this.$body[0].removeChild(scrollDiv)
	    return scrollbarWidth
	  }
	
	
	  // MODAL PLUGIN DEFINITION
	  // =======================
	
	  function Plugin(option, _relatedTarget) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.modal')
	      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)
	
	      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
	      if (typeof option == 'string') data[option](_relatedTarget)
	      else if (options.show) data.show(_relatedTarget)
	    })
	  }
	
	  var old = $.fn.modal
	
	  $.fn.modal             = Plugin
	  $.fn.modal.Constructor = Modal
	
	
	  // MODAL NO CONFLICT
	  // =================
	
	  $.fn.modal.noConflict = function () {
	    $.fn.modal = old
	    return this
	  }
	
	
	  // MODAL DATA-API
	  // ==============
	
	  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
	    var $this   = $(this)
	    var href    = $this.attr('href')
	    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
	    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())
	
	    if ($this.is('a')) e.preventDefault()
	
	    $target.one('show.bs.modal', function (showEvent) {
	      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
	      $target.one('hidden.bs.modal', function () {
	        $this.is(':visible') && $this.trigger('focus')
	      })
	    })
	    Plugin.call($target, option, this)
	  })
	
	}(jQuery);


/***/ },

/***/ 247:
/***/ function(module, exports) {

	/* ========================================================================
	 * Bootstrap: tooltip.js v3.3.6
	 * http://getbootstrap.com/javascript/#tooltip
	 * Inspired by the original jQuery.tipsy by Jason Frame
	 * ========================================================================
	 * Copyright 2011-2015 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // TOOLTIP PUBLIC CLASS DEFINITION
	  // ===============================
	
	  var Tooltip = function (element, options) {
	    this.type       = null
	    this.options    = null
	    this.enabled    = null
	    this.timeout    = null
	    this.hoverState = null
	    this.$element   = null
	    this.inState    = null
	
	    this.init('tooltip', element, options)
	  }
	
	  Tooltip.VERSION  = '3.3.6'
	
	  Tooltip.TRANSITION_DURATION = 150
	
	  Tooltip.DEFAULTS = {
	    animation: true,
	    placement: 'top',
	    selector: false,
	    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
	    trigger: 'hover focus',
	    title: '',
	    delay: 0,
	    html: false,
	    container: false,
	    viewport: {
	      selector: 'body',
	      padding: 0
	    }
	  }
	
	  Tooltip.prototype.init = function (type, element, options) {
	    this.enabled   = true
	    this.type      = type
	    this.$element  = $(element)
	    this.options   = this.getOptions(options)
	    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
	    this.inState   = { click: false, hover: false, focus: false }
	
	    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
	      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
	    }
	
	    var triggers = this.options.trigger.split(' ')
	
	    for (var i = triggers.length; i--;) {
	      var trigger = triggers[i]
	
	      if (trigger == 'click') {
	        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
	      } else if (trigger != 'manual') {
	        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
	        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'
	
	        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
	        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
	      }
	    }
	
	    this.options.selector ?
	      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
	      this.fixTitle()
	  }
	
	  Tooltip.prototype.getDefaults = function () {
	    return Tooltip.DEFAULTS
	  }
	
	  Tooltip.prototype.getOptions = function (options) {
	    options = $.extend({}, this.getDefaults(), this.$element.data(), options)
	
	    if (options.delay && typeof options.delay == 'number') {
	      options.delay = {
	        show: options.delay,
	        hide: options.delay
	      }
	    }
	
	    return options
	  }
	
	  Tooltip.prototype.getDelegateOptions = function () {
	    var options  = {}
	    var defaults = this.getDefaults()
	
	    this._options && $.each(this._options, function (key, value) {
	      if (defaults[key] != value) options[key] = value
	    })
	
	    return options
	  }
	
	  Tooltip.prototype.enter = function (obj) {
	    var self = obj instanceof this.constructor ?
	      obj : $(obj.currentTarget).data('bs.' + this.type)
	
	    if (!self) {
	      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
	      $(obj.currentTarget).data('bs.' + this.type, self)
	    }
	
	    if (obj instanceof $.Event) {
	      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
	    }
	
	    if (self.tip().hasClass('in') || self.hoverState == 'in') {
	      self.hoverState = 'in'
	      return
	    }
	
	    clearTimeout(self.timeout)
	
	    self.hoverState = 'in'
	
	    if (!self.options.delay || !self.options.delay.show) return self.show()
	
	    self.timeout = setTimeout(function () {
	      if (self.hoverState == 'in') self.show()
	    }, self.options.delay.show)
	  }
	
	  Tooltip.prototype.isInStateTrue = function () {
	    for (var key in this.inState) {
	      if (this.inState[key]) return true
	    }
	
	    return false
	  }
	
	  Tooltip.prototype.leave = function (obj) {
	    var self = obj instanceof this.constructor ?
	      obj : $(obj.currentTarget).data('bs.' + this.type)
	
	    if (!self) {
	      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
	      $(obj.currentTarget).data('bs.' + this.type, self)
	    }
	
	    if (obj instanceof $.Event) {
	      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
	    }
	
	    if (self.isInStateTrue()) return
	
	    clearTimeout(self.timeout)
	
	    self.hoverState = 'out'
	
	    if (!self.options.delay || !self.options.delay.hide) return self.hide()
	
	    self.timeout = setTimeout(function () {
	      if (self.hoverState == 'out') self.hide()
	    }, self.options.delay.hide)
	  }
	
	  Tooltip.prototype.show = function () {
	    var e = $.Event('show.bs.' + this.type)
	
	    if (this.hasContent() && this.enabled) {
	      this.$element.trigger(e)
	
	      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
	      if (e.isDefaultPrevented() || !inDom) return
	      var that = this
	
	      var $tip = this.tip()
	
	      var tipId = this.getUID(this.type)
	
	      this.setContent()
	      $tip.attr('id', tipId)
	      this.$element.attr('aria-describedby', tipId)
	
	      if (this.options.animation) $tip.addClass('fade')
	
	      var placement = typeof this.options.placement == 'function' ?
	        this.options.placement.call(this, $tip[0], this.$element[0]) :
	        this.options.placement
	
	      var autoToken = /\s?auto?\s?/i
	      var autoPlace = autoToken.test(placement)
	      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'
	
	      $tip
	        .detach()
	        .css({ top: 0, left: 0, display: 'block' })
	        .addClass(placement)
	        .data('bs.' + this.type, this)
	
	      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
	      this.$element.trigger('inserted.bs.' + this.type)
	
	      var pos          = this.getPosition()
	      var actualWidth  = $tip[0].offsetWidth
	      var actualHeight = $tip[0].offsetHeight
	
	      if (autoPlace) {
	        var orgPlacement = placement
	        var viewportDim = this.getPosition(this.$viewport)
	
	        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
	                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
	                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
	                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
	                    placement
	
	        $tip
	          .removeClass(orgPlacement)
	          .addClass(placement)
	      }
	
	      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)
	
	      this.applyPlacement(calculatedOffset, placement)
	
	      var complete = function () {
	        var prevHoverState = that.hoverState
	        that.$element.trigger('shown.bs.' + that.type)
	        that.hoverState = null
	
	        if (prevHoverState == 'out') that.leave(that)
	      }
	
	      $.support.transition && this.$tip.hasClass('fade') ?
	        $tip
	          .one('bsTransitionEnd', complete)
	          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
	        complete()
	    }
	  }
	
	  Tooltip.prototype.applyPlacement = function (offset, placement) {
	    var $tip   = this.tip()
	    var width  = $tip[0].offsetWidth
	    var height = $tip[0].offsetHeight
	
	    // manually read margins because getBoundingClientRect includes difference
	    var marginTop = parseInt($tip.css('margin-top'), 10)
	    var marginLeft = parseInt($tip.css('margin-left'), 10)
	
	    // we must check for NaN for ie 8/9
	    if (isNaN(marginTop))  marginTop  = 0
	    if (isNaN(marginLeft)) marginLeft = 0
	
	    offset.top  += marginTop
	    offset.left += marginLeft
	
	    // $.fn.offset doesn't round pixel values
	    // so we use setOffset directly with our own function B-0
	    $.offset.setOffset($tip[0], $.extend({
	      using: function (props) {
	        $tip.css({
	          top: Math.round(props.top),
	          left: Math.round(props.left)
	        })
	      }
	    }, offset), 0)
	
	    $tip.addClass('in')
	
	    // check to see if placing tip in new offset caused the tip to resize itself
	    var actualWidth  = $tip[0].offsetWidth
	    var actualHeight = $tip[0].offsetHeight
	
	    if (placement == 'top' && actualHeight != height) {
	      offset.top = offset.top + height - actualHeight
	    }
	
	    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)
	
	    if (delta.left) offset.left += delta.left
	    else offset.top += delta.top
	
	    var isVertical          = /top|bottom/.test(placement)
	    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
	    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'
	
	    $tip.offset(offset)
	    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
	  }
	
	  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
	    this.arrow()
	      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
	      .css(isVertical ? 'top' : 'left', '')
	  }
	
	  Tooltip.prototype.setContent = function () {
	    var $tip  = this.tip()
	    var title = this.getTitle()
	
	    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
	    $tip.removeClass('fade in top bottom left right')
	  }
	
	  Tooltip.prototype.hide = function (callback) {
	    var that = this
	    var $tip = $(this.$tip)
	    var e    = $.Event('hide.bs.' + this.type)
	
	    function complete() {
	      if (that.hoverState != 'in') $tip.detach()
	      that.$element
	        .removeAttr('aria-describedby')
	        .trigger('hidden.bs.' + that.type)
	      callback && callback()
	    }
	
	    this.$element.trigger(e)
	
	    if (e.isDefaultPrevented()) return
	
	    $tip.removeClass('in')
	
	    $.support.transition && $tip.hasClass('fade') ?
	      $tip
	        .one('bsTransitionEnd', complete)
	        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
	      complete()
	
	    this.hoverState = null
	
	    return this
	  }
	
	  Tooltip.prototype.fixTitle = function () {
	    var $e = this.$element
	    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
	      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
	    }
	  }
	
	  Tooltip.prototype.hasContent = function () {
	    return this.getTitle()
	  }
	
	  Tooltip.prototype.getPosition = function ($element) {
	    $element   = $element || this.$element
	
	    var el     = $element[0]
	    var isBody = el.tagName == 'BODY'
	
	    var elRect    = el.getBoundingClientRect()
	    if (elRect.width == null) {
	      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
	      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
	    }
	    var elOffset  = isBody ? { top: 0, left: 0 } : $element.offset()
	    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
	    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null
	
	    return $.extend({}, elRect, scroll, outerDims, elOffset)
	  }
	
	  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
	    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
	           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
	           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
	        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }
	
	  }
	
	  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
	    var delta = { top: 0, left: 0 }
	    if (!this.$viewport) return delta
	
	    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
	    var viewportDimensions = this.getPosition(this.$viewport)
	
	    if (/right|left/.test(placement)) {
	      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
	      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
	      if (topEdgeOffset < viewportDimensions.top) { // top overflow
	        delta.top = viewportDimensions.top - topEdgeOffset
	      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
	        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
	      }
	    } else {
	      var leftEdgeOffset  = pos.left - viewportPadding
	      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
	      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
	        delta.left = viewportDimensions.left - leftEdgeOffset
	      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
	        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
	      }
	    }
	
	    return delta
	  }
	
	  Tooltip.prototype.getTitle = function () {
	    var title
	    var $e = this.$element
	    var o  = this.options
	
	    title = $e.attr('data-original-title')
	      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)
	
	    return title
	  }
	
	  Tooltip.prototype.getUID = function (prefix) {
	    do prefix += ~~(Math.random() * 1000000)
	    while (document.getElementById(prefix))
	    return prefix
	  }
	
	  Tooltip.prototype.tip = function () {
	    if (!this.$tip) {
	      this.$tip = $(this.options.template)
	      if (this.$tip.length != 1) {
	        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
	      }
	    }
	    return this.$tip
	  }
	
	  Tooltip.prototype.arrow = function () {
	    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
	  }
	
	  Tooltip.prototype.enable = function () {
	    this.enabled = true
	  }
	
	  Tooltip.prototype.disable = function () {
	    this.enabled = false
	  }
	
	  Tooltip.prototype.toggleEnabled = function () {
	    this.enabled = !this.enabled
	  }
	
	  Tooltip.prototype.toggle = function (e) {
	    var self = this
	    if (e) {
	      self = $(e.currentTarget).data('bs.' + this.type)
	      if (!self) {
	        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
	        $(e.currentTarget).data('bs.' + this.type, self)
	      }
	    }
	
	    if (e) {
	      self.inState.click = !self.inState.click
	      if (self.isInStateTrue()) self.enter(self)
	      else self.leave(self)
	    } else {
	      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
	    }
	  }
	
	  Tooltip.prototype.destroy = function () {
	    var that = this
	    clearTimeout(this.timeout)
	    this.hide(function () {
	      that.$element.off('.' + that.type).removeData('bs.' + that.type)
	      if (that.$tip) {
	        that.$tip.detach()
	      }
	      that.$tip = null
	      that.$arrow = null
	      that.$viewport = null
	    })
	  }
	
	
	  // TOOLTIP PLUGIN DEFINITION
	  // =========================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.tooltip')
	      var options = typeof option == 'object' && option
	
	      if (!data && /destroy|hide/.test(option)) return
	      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
	      if (typeof option == 'string') data[option]()
	    })
	  }
	
	  var old = $.fn.tooltip
	
	  $.fn.tooltip             = Plugin
	  $.fn.tooltip.Constructor = Tooltip
	
	
	  // TOOLTIP NO CONFLICT
	  // ===================
	
	  $.fn.tooltip.noConflict = function () {
	    $.fn.tooltip = old
	    return this
	  }
	
	}(jQuery);


/***/ },

/***/ 248:
/***/ function(module, exports) {

	/* ========================================================================
	 * Bootstrap: popover.js v3.3.6
	 * http://getbootstrap.com/javascript/#popovers
	 * ========================================================================
	 * Copyright 2011-2015 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // POPOVER PUBLIC CLASS DEFINITION
	  // ===============================
	
	  var Popover = function (element, options) {
	    this.init('popover', element, options)
	  }
	
	  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')
	
	  Popover.VERSION  = '3.3.6'
	
	  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
	    placement: 'right',
	    trigger: 'click',
	    content: '',
	    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
	  })
	
	
	  // NOTE: POPOVER EXTENDS tooltip.js
	  // ================================
	
	  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)
	
	  Popover.prototype.constructor = Popover
	
	  Popover.prototype.getDefaults = function () {
	    return Popover.DEFAULTS
	  }
	
	  Popover.prototype.setContent = function () {
	    var $tip    = this.tip()
	    var title   = this.getTitle()
	    var content = this.getContent()
	
	    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
	    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
	      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
	    ](content)
	
	    $tip.removeClass('fade top bottom left right in')
	
	    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
	    // this manually by checking the contents.
	    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
	  }
	
	  Popover.prototype.hasContent = function () {
	    return this.getTitle() || this.getContent()
	  }
	
	  Popover.prototype.getContent = function () {
	    var $e = this.$element
	    var o  = this.options
	
	    return $e.attr('data-content')
	      || (typeof o.content == 'function' ?
	            o.content.call($e[0]) :
	            o.content)
	  }
	
	  Popover.prototype.arrow = function () {
	    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
	  }
	
	
	  // POPOVER PLUGIN DEFINITION
	  // =========================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.popover')
	      var options = typeof option == 'object' && option
	
	      if (!data && /destroy|hide/.test(option)) return
	      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
	      if (typeof option == 'string') data[option]()
	    })
	  }
	
	  var old = $.fn.popover
	
	  $.fn.popover             = Plugin
	  $.fn.popover.Constructor = Popover
	
	
	  // POPOVER NO CONFLICT
	  // ===================
	
	  $.fn.popover.noConflict = function () {
	    $.fn.popover = old
	    return this
	  }
	
	}(jQuery);


/***/ },

/***/ 249:
/***/ function(module, exports) {

	/* ========================================================================
	 * Bootstrap: scrollspy.js v3.3.6
	 * http://getbootstrap.com/javascript/#scrollspy
	 * ========================================================================
	 * Copyright 2011-2015 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // SCROLLSPY CLASS DEFINITION
	  // ==========================
	
	  function ScrollSpy(element, options) {
	    this.$body          = $(document.body)
	    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
	    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
	    this.selector       = (this.options.target || '') + ' .nav li > a'
	    this.offsets        = []
	    this.targets        = []
	    this.activeTarget   = null
	    this.scrollHeight   = 0
	
	    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
	    this.refresh()
	    this.process()
	  }
	
	  ScrollSpy.VERSION  = '3.3.6'
	
	  ScrollSpy.DEFAULTS = {
	    offset: 10
	  }
	
	  ScrollSpy.prototype.getScrollHeight = function () {
	    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
	  }
	
	  ScrollSpy.prototype.refresh = function () {
	    var that          = this
	    var offsetMethod  = 'offset'
	    var offsetBase    = 0
	
	    this.offsets      = []
	    this.targets      = []
	    this.scrollHeight = this.getScrollHeight()
	
	    if (!$.isWindow(this.$scrollElement[0])) {
	      offsetMethod = 'position'
	      offsetBase   = this.$scrollElement.scrollTop()
	    }
	
	    this.$body
	      .find(this.selector)
	      .map(function () {
	        var $el   = $(this)
	        var href  = $el.data('target') || $el.attr('href')
	        var $href = /^#./.test(href) && $(href)
	
	        return ($href
	          && $href.length
	          && $href.is(':visible')
	          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
	      })
	      .sort(function (a, b) { return a[0] - b[0] })
	      .each(function () {
	        that.offsets.push(this[0])
	        that.targets.push(this[1])
	      })
	  }
	
	  ScrollSpy.prototype.process = function () {
	    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
	    var scrollHeight = this.getScrollHeight()
	    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
	    var offsets      = this.offsets
	    var targets      = this.targets
	    var activeTarget = this.activeTarget
	    var i
	
	    if (this.scrollHeight != scrollHeight) {
	      this.refresh()
	    }
	
	    if (scrollTop >= maxScroll) {
	      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
	    }
	
	    if (activeTarget && scrollTop < offsets[0]) {
	      this.activeTarget = null
	      return this.clear()
	    }
	
	    for (i = offsets.length; i--;) {
	      activeTarget != targets[i]
	        && scrollTop >= offsets[i]
	        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
	        && this.activate(targets[i])
	    }
	  }
	
	  ScrollSpy.prototype.activate = function (target) {
	    this.activeTarget = target
	
	    this.clear()
	
	    var selector = this.selector +
	      '[data-target="' + target + '"],' +
	      this.selector + '[href="' + target + '"]'
	
	    var active = $(selector)
	      .parents('li')
	      .addClass('active')
	
	    if (active.parent('.dropdown-menu').length) {
	      active = active
	        .closest('li.dropdown')
	        .addClass('active')
	    }
	
	    active.trigger('activate.bs.scrollspy')
	  }
	
	  ScrollSpy.prototype.clear = function () {
	    $(this.selector)
	      .parentsUntil(this.options.target, '.active')
	      .removeClass('active')
	  }
	
	
	  // SCROLLSPY PLUGIN DEFINITION
	  // ===========================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.scrollspy')
	      var options = typeof option == 'object' && option
	
	      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
	      if (typeof option == 'string') data[option]()
	    })
	  }
	
	  var old = $.fn.scrollspy
	
	  $.fn.scrollspy             = Plugin
	  $.fn.scrollspy.Constructor = ScrollSpy
	
	
	  // SCROLLSPY NO CONFLICT
	  // =====================
	
	  $.fn.scrollspy.noConflict = function () {
	    $.fn.scrollspy = old
	    return this
	  }
	
	
	  // SCROLLSPY DATA-API
	  // ==================
	
	  $(window).on('load.bs.scrollspy.data-api', function () {
	    $('[data-spy="scroll"]').each(function () {
	      var $spy = $(this)
	      Plugin.call($spy, $spy.data())
	    })
	  })
	
	}(jQuery);


/***/ },

/***/ 250:
/***/ function(module, exports) {

	/* ========================================================================
	 * Bootstrap: tab.js v3.3.6
	 * http://getbootstrap.com/javascript/#tabs
	 * ========================================================================
	 * Copyright 2011-2015 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // TAB CLASS DEFINITION
	  // ====================
	
	  var Tab = function (element) {
	    // jscs:disable requireDollarBeforejQueryAssignment
	    this.element = $(element)
	    // jscs:enable requireDollarBeforejQueryAssignment
	  }
	
	  Tab.VERSION = '3.3.6'
	
	  Tab.TRANSITION_DURATION = 150
	
	  Tab.prototype.show = function () {
	    var $this    = this.element
	    var $ul      = $this.closest('ul:not(.dropdown-menu)')
	    var selector = $this.data('target')
	
	    if (!selector) {
	      selector = $this.attr('href')
	      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
	    }
	
	    if ($this.parent('li').hasClass('active')) return
	
	    var $previous = $ul.find('.active:last a')
	    var hideEvent = $.Event('hide.bs.tab', {
	      relatedTarget: $this[0]
	    })
	    var showEvent = $.Event('show.bs.tab', {
	      relatedTarget: $previous[0]
	    })
	
	    $previous.trigger(hideEvent)
	    $this.trigger(showEvent)
	
	    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return
	
	    var $target = $(selector)
	
	    this.activate($this.closest('li'), $ul)
	    this.activate($target, $target.parent(), function () {
	      $previous.trigger({
	        type: 'hidden.bs.tab',
	        relatedTarget: $this[0]
	      })
	      $this.trigger({
	        type: 'shown.bs.tab',
	        relatedTarget: $previous[0]
	      })
	    })
	  }
	
	  Tab.prototype.activate = function (element, container, callback) {
	    var $active    = container.find('> .active')
	    var transition = callback
	      && $.support.transition
	      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)
	
	    function next() {
	      $active
	        .removeClass('active')
	        .find('> .dropdown-menu > .active')
	          .removeClass('active')
	        .end()
	        .find('[data-toggle="tab"]')
	          .attr('aria-expanded', false)
	
	      element
	        .addClass('active')
	        .find('[data-toggle="tab"]')
	          .attr('aria-expanded', true)
	
	      if (transition) {
	        element[0].offsetWidth // reflow for transition
	        element.addClass('in')
	      } else {
	        element.removeClass('fade')
	      }
	
	      if (element.parent('.dropdown-menu').length) {
	        element
	          .closest('li.dropdown')
	            .addClass('active')
	          .end()
	          .find('[data-toggle="tab"]')
	            .attr('aria-expanded', true)
	      }
	
	      callback && callback()
	    }
	
	    $active.length && transition ?
	      $active
	        .one('bsTransitionEnd', next)
	        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
	      next()
	
	    $active.removeClass('in')
	  }
	
	
	  // TAB PLUGIN DEFINITION
	  // =====================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this = $(this)
	      var data  = $this.data('bs.tab')
	
	      if (!data) $this.data('bs.tab', (data = new Tab(this)))
	      if (typeof option == 'string') data[option]()
	    })
	  }
	
	  var old = $.fn.tab
	
	  $.fn.tab             = Plugin
	  $.fn.tab.Constructor = Tab
	
	
	  // TAB NO CONFLICT
	  // ===============
	
	  $.fn.tab.noConflict = function () {
	    $.fn.tab = old
	    return this
	  }
	
	
	  // TAB DATA-API
	  // ============
	
	  var clickHandler = function (e) {
	    e.preventDefault()
	    Plugin.call($(this), 'show')
	  }
	
	  $(document)
	    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
	    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)
	
	}(jQuery);


/***/ },

/***/ 251:
/***/ function(module, exports) {

	/* ========================================================================
	 * Bootstrap: affix.js v3.3.6
	 * http://getbootstrap.com/javascript/#affix
	 * ========================================================================
	 * Copyright 2011-2015 Twitter, Inc.
	 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
	 * ======================================================================== */
	
	
	+function ($) {
	  'use strict';
	
	  // AFFIX CLASS DEFINITION
	  // ======================
	
	  var Affix = function (element, options) {
	    this.options = $.extend({}, Affix.DEFAULTS, options)
	
	    this.$target = $(this.options.target)
	      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
	      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))
	
	    this.$element     = $(element)
	    this.affixed      = null
	    this.unpin        = null
	    this.pinnedOffset = null
	
	    this.checkPosition()
	  }
	
	  Affix.VERSION  = '3.3.6'
	
	  Affix.RESET    = 'affix affix-top affix-bottom'
	
	  Affix.DEFAULTS = {
	    offset: 0,
	    target: window
	  }
	
	  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
	    var scrollTop    = this.$target.scrollTop()
	    var position     = this.$element.offset()
	    var targetHeight = this.$target.height()
	
	    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false
	
	    if (this.affixed == 'bottom') {
	      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
	      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
	    }
	
	    var initializing   = this.affixed == null
	    var colliderTop    = initializing ? scrollTop : position.top
	    var colliderHeight = initializing ? targetHeight : height
	
	    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
	    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'
	
	    return false
	  }
	
	  Affix.prototype.getPinnedOffset = function () {
	    if (this.pinnedOffset) return this.pinnedOffset
	    this.$element.removeClass(Affix.RESET).addClass('affix')
	    var scrollTop = this.$target.scrollTop()
	    var position  = this.$element.offset()
	    return (this.pinnedOffset = position.top - scrollTop)
	  }
	
	  Affix.prototype.checkPositionWithEventLoop = function () {
	    setTimeout($.proxy(this.checkPosition, this), 1)
	  }
	
	  Affix.prototype.checkPosition = function () {
	    if (!this.$element.is(':visible')) return
	
	    var height       = this.$element.height()
	    var offset       = this.options.offset
	    var offsetTop    = offset.top
	    var offsetBottom = offset.bottom
	    var scrollHeight = Math.max($(document).height(), $(document.body).height())
	
	    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
	    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
	    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)
	
	    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)
	
	    if (this.affixed != affix) {
	      if (this.unpin != null) this.$element.css('top', '')
	
	      var affixType = 'affix' + (affix ? '-' + affix : '')
	      var e         = $.Event(affixType + '.bs.affix')
	
	      this.$element.trigger(e)
	
	      if (e.isDefaultPrevented()) return
	
	      this.affixed = affix
	      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null
	
	      this.$element
	        .removeClass(Affix.RESET)
	        .addClass(affixType)
	        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
	    }
	
	    if (affix == 'bottom') {
	      this.$element.offset({
	        top: scrollHeight - height - offsetBottom
	      })
	    }
	  }
	
	
	  // AFFIX PLUGIN DEFINITION
	  // =======================
	
	  function Plugin(option) {
	    return this.each(function () {
	      var $this   = $(this)
	      var data    = $this.data('bs.affix')
	      var options = typeof option == 'object' && option
	
	      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
	      if (typeof option == 'string') data[option]()
	    })
	  }
	
	  var old = $.fn.affix
	
	  $.fn.affix             = Plugin
	  $.fn.affix.Constructor = Affix
	
	
	  // AFFIX NO CONFLICT
	  // =================
	
	  $.fn.affix.noConflict = function () {
	    $.fn.affix = old
	    return this
	  }
	
	
	  // AFFIX DATA-API
	  // ==============
	
	  $(window).on('load', function () {
	    $('[data-spy="affix"]').each(function () {
	      var $spy = $(this)
	      var data = $spy.data()
	
	      data.offset = data.offset || {}
	
	      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
	      if (data.offsetTop    != null) data.offset.top    = data.offsetTop
	
	      Plugin.call($spy, data)
	    })
	  })
	
	}(jQuery);


/***/ },

/***/ 252:
/***/ function(module, exports) {

	/*! jquery-slugify - v1.2.3 - 2015-12-23
	* Copyright (c) 2015 madflow; Licensed  */
	!function(a){a.fn.slugify=function(b,c){return this.each(function(){var d=a(this),e=a(b);d.on("keyup change",function(){""!==d.val()&&void 0!==d.val()?d.data("locked",!0):d.data("locked",!1)}),e.on("keyup change",function(){!0!==d.data("locked")&&(d.is("input")||d.is("textarea")?d.val(a.slugify(e.val(),c)):d.text(a.slugify(e.val(),c)))})})},a.slugify=function(b,c){return c=a.extend({},a.slugify.options,c),c.lang=c.lang||a("html").prop("lang"),"function"==typeof c.preSlug&&(b=c.preSlug(b)),b=c.slugFunc(b,c),"function"==typeof c.postSlug&&(b=c.postSlug(b)),b},a.slugify.options={preSlug:null,postSlug:null,slugFunc:function(a,b){return window.getSlug(a,b)}}}(jQuery);

/***/ }

/******/ });
//# sourceMappingURL=vendor.js.map