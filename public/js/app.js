webpackJsonp([1],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(110);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var FETCH_ALL = exports.FETCH_ALL = "FETCH_ALL";
var ADD_TASK = exports.ADD_TASK = "ADD_TASK";
var DEL_TASK = exports.DEL_TASK = "DEL_TASK";
var EDIT_TASK = exports.EDIT_TASK = "EDIT_TASK";
var UPDATE_TASK = exports.UPDATE_TASK = "UPDATE_TASK";
var SEARCH_TASK = exports.SEARCH_TASK = "SEARCH_TASK";
var SORT_TASK = exports.SORT_TASK = "SORT_TASK";
var FILTER_TASK = exports.FILTER_TASK = "FILTER_TASK";

/***/ }),
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.actSearchTask = exports.actUpdateTask = exports.actUpdateTaskApi = exports.actEditTask = exports.actEditTaskApi = exports.actDelTask = exports.actDelTaskApi = exports.actAddTask = exports.actAddTaskApi = exports.actFetchAll = exports.actFetchAllApi = undefined;

var _ActionsType = __webpack_require__(27);

var Types = _interopRequireWildcard(_ActionsType);

var _callApi = __webpack_require__(144);

var _callApi2 = _interopRequireDefault(_callApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var actFetchAllApi = exports.actFetchAllApi = function actFetchAllApi() {
    return function (dispatch) {
        (0, _callApi2.default)("/", "get", null).then(function (res) {
            dispatch(actFetchAll(res.data));
        });
    };
};
var actFetchAll = exports.actFetchAll = function actFetchAll(tasks) {
    return {
        type: Types.FETCH_ALL,
        tasks: tasks
    };
};
var actAddTaskApi = exports.actAddTaskApi = function actAddTaskApi(task) {
    return function (dispatch) {
        (0, _callApi2.default)("/", "post", task).then(function (res) {
            dispatch(actAddTask(res.data.task));
        });
    };
};
var actAddTask = exports.actAddTask = function actAddTask(task) {
    return {
        type: Types.ADD_TASK,
        task: task
    };
};

var actDelTaskApi = exports.actDelTaskApi = function actDelTaskApi(id) {
    return function (dispatch) {
        (0, _callApi2.default)("/" + id, "DELETE", null).then(function (res) {
            if (res.data === 'success') {
                dispatch(actDelTask(id));
            }
        });
    };
};
var actDelTask = exports.actDelTask = function actDelTask(id) {
    return {
        type: Types.DEL_TASK,
        id: id
    };
};
var actEditTaskApi = exports.actEditTaskApi = function actEditTaskApi(id) {
    return function (dispatch) {
        (0, _callApi2.default)("/" + id + "/edit", "GET", null).then(function (res) {
            dispatch(actEditTask(res.data));
        });
    };
};
var actEditTask = exports.actEditTask = function actEditTask(task) {
    return {
        type: Types.EDIT_TASK,
        task: task
    };
};
var actUpdateTaskApi = exports.actUpdateTaskApi = function actUpdateTaskApi(task) {
    return function (dispatch) {
        (0, _callApi2.default)("/" + task.id, "PUT", task).then(function (res) {
            if (res.data.messages === "success") {
                dispatch(actUpdateTask(res.data.task));
            }
        });
    };
};
var actUpdateTask = exports.actUpdateTask = function actUpdateTask(task) {
    return {
        type: Types.UPDATE_TASK,
        task: task
    };
};

var actSearchTask = exports.actSearchTask = function actSearchTask(txtSearch) {
    return {
        type: Types.SEARCH_TASK,
        txtSearch: txtSearch
    };
};

/***/ }),
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(61);
module.exports = __webpack_require__(176);


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactDom = __webpack_require__(33);

var _reactDom2 = _interopRequireDefault(_reactDom);

var _App = __webpack_require__(76);

var _App2 = _interopRequireDefault(_App);

var _redux = __webpack_require__(15);

var _index = __webpack_require__(152);

var _index2 = _interopRequireDefault(_index);

var _reactRedux = __webpack_require__(14);

var _reduxThunk = __webpack_require__(51);

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * First we will load all of this project's JavaScript dependencies which
 * includes React and other helpers. It's a great starting point while
 * building robust, powerful web applications using React + Laravel.
 */

__webpack_require__(155);

/**
 * Next, we will create a fresh React component instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

var store = (0, _redux.createStore)(_index2.default, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), (0, _redux.applyMiddleware)(_reduxThunk2.default));

_reactDom2.default.render(_react2.default.createElement(
  _reactRedux.Provider,
  { store: store },
  _react2.default.createElement(_App2.default, null)
), document.getElementById('root'));

/***/ }),
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _Menu = __webpack_require__(77);

var _Menu2 = _interopRequireDefault(_Menu);

var _routes = __webpack_require__(104);

var _routes2 = _interopRequireDefault(_routes);

var _reactRouterDom = __webpack_require__(5);

__webpack_require__(150);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_Component) {
    _inherits(App, _Component);

    function App() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, App);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = App.__proto__ || Object.getPrototypeOf(App)).call.apply(_ref, [this].concat(args))), _this), _this.showContent = function (routes) {
            var result = null;
            if (routes.length > 0) {
                result = routes.map(function (route, index) {
                    return _react2.default.createElement(_reactRouterDom.Route, { key: index,
                        path: route.path,
                        exact: route.exact,
                        component: route.main
                    });
                });
            }

            return _react2.default.createElement(
                _reactRouterDom.Switch,
                null,
                result
            );
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(App, [{
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                _reactRouterDom.BrowserRouter,
                null,
                _react2.default.createElement(
                    "div",
                    { className: "container" },
                    _react2.default.createElement(_Menu2.default, null),
                    _react2.default.createElement(
                        "div",
                        { className: "content" },
                        this.showContent(_routes2.default)
                    )
                )
            );
        }
    }]);

    return App;
}(_react.Component);

exports.default = App;

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CustomLink = function CustomLink(_ref) {
    var label = _ref.label,
        to = _ref.to,
        activeOnlyWhenExact = _ref.activeOnlyWhenExact;
    return _react2.default.createElement(_reactRouterDom.Route, {
        path: to,
        exact: activeOnlyWhenExact,
        children: function children(_ref2) {
            var match = _ref2.match;

            var active = match ? "active" : "";
            return _react2.default.createElement(
                'li',
                { className: 'nav-item ' + active },
                _react2.default.createElement(
                    _reactRouterDom.Link,
                    { className: 'nav-link', to: to },
                    label
                )
            );
        }
    });
};
var menus = [{
    label: "Trang chủ",
    to: "/",
    activeOnlyWhenExact: true
}, {
    label: "Quản lí công việc",
    to: "/tasks-list",
    activeOnlyWhenExact: false
}];

var Menu = function (_Component) {
    _inherits(Menu, _Component);

    function Menu() {
        var _ref3;

        var _temp, _this, _ret;

        _classCallCheck(this, Menu);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref3 = Menu.__proto__ || Object.getPrototypeOf(Menu)).call.apply(_ref3, [this].concat(args))), _this), _this.showMenu = function (menus) {
            var result = null;
            if (menus.length > 0) {
                result = menus.map(function (menu, index) {
                    return _react2.default.createElement(CustomLink, {
                        key: index,
                        label: menu.label,
                        to: menu.to,
                        activeOnlyWhenExact: menu.activeOnlyWhenExact
                    });
                });
            }
            return result;
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Menu, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'nav',
                { className: 'navbar navbar-expand-lg navbar-light bg-light' },
                _react2.default.createElement(
                    _reactRouterDom.Link,
                    { className: 'navbar-brand', to: '/' },
                    'Todoapp'
                ),
                _react2.default.createElement(
                    'button',
                    { className: 'navbar-toggler', type: 'button', 'data-toggle': 'collapse', 'data-target': '#navbarSupportedContent', 'aria-controls': 'navbarSupportedContent', 'aria-expanded': 'false', 'aria-label': 'Toggle navigation' },
                    _react2.default.createElement('span', { className: 'navbar-toggler-icon' })
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'collapse navbar-collapse', id: 'navbarSupportedContent' },
                    _react2.default.createElement(
                        'ul',
                        { className: 'navbar-nav mr-auto' },
                        this.showMenu(menus)
                    )
                )
            );
        }
    }]);

    return Menu;
}(_react.Component);

exports.default = Menu;

/***/ }),
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _HomePage = __webpack_require__(105);

var _HomePage2 = _interopRequireDefault(_HomePage);

var _TasksListPage = __webpack_require__(106);

var _TasksListPage2 = _interopRequireDefault(_TasksListPage);

var _TasksActionPage = __webpack_require__(146);

var _TasksActionPage2 = _interopRequireDefault(_TasksActionPage);

var _NotFoundPage = __webpack_require__(149);

var _NotFoundPage2 = _interopRequireDefault(_NotFoundPage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var routes = [{
    path: "/",
    exact: true,
    main: function main() {
        return _react2.default.createElement(_HomePage2.default, null);
    }
}, {
    path: "/tasks-list",
    exact: false,
    main: function main() {
        return _react2.default.createElement(_TasksListPage2.default, null);
    }
}, {
    path: "/tasks/add",
    exact: false,
    main: function main(_ref) {
        var history = _ref.history;
        return _react2.default.createElement(_TasksActionPage2.default, { history: history });
    }
}, {
    path: "/tasks/:id/edit",
    exact: false,
    main: function main(_ref2) {
        var history = _ref2.history,
            match = _ref2.match;
        return _react2.default.createElement(_TasksActionPage2.default, { history: history, match: match });
    }
}, {
    path: "",
    exact: false,
    main: function main() {
        return _react2.default.createElement(_NotFoundPage2.default, null);
    }
}];
exports.default = routes;

/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HomePage = function (_Component) {
    _inherits(HomePage, _Component);

    function HomePage() {
        _classCallCheck(this, HomePage);

        return _possibleConstructorReturn(this, (HomePage.__proto__ || Object.getPrototypeOf(HomePage)).apply(this, arguments));
    }

    _createClass(HomePage, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                'day la trang chu'
            );
        }
    }]);

    return HomePage;
}(_react.Component);

exports.default = HomePage;

/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _Control = __webpack_require__(107);

var _Control2 = _interopRequireDefault(_Control);

var _Search = __webpack_require__(111);

var _Search2 = _interopRequireDefault(_Search);

var _Sort = __webpack_require__(114);

var _Sort2 = _interopRequireDefault(_Sort);

var _TasksList = __webpack_require__(117);

var _TasksList2 = _interopRequireDefault(_TasksList);

var _TaskItem = __webpack_require__(120);

var _TaskItem2 = _interopRequireDefault(_TaskItem);

var _reactRedux = __webpack_require__(14);

var _index = __webpack_require__(50);

var _propTypes = __webpack_require__(2);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TasksListPage = function (_Component) {
    _inherits(TasksListPage, _Component);

    function TasksListPage() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, TasksListPage);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = TasksListPage.__proto__ || Object.getPrototypeOf(TasksListPage)).call.apply(_ref, [this].concat(args))), _this), _this.onDelItem = function (id) {
            _this.props.onDelItem(id);
        }, _this.onUpdateTask = function (task) {
            // change status
            if (task.status === 0) {
                task.status = 1;
            } else {
                task.status = 0;
            }
            // call props update task
            _this.props.onUpdateTask(task);
        }, _this.onSearh = function (txtSearch) {
            _this.props.onSearchTask(txtSearch);
        }, _this.showTasks = function (tasks) {
            var result = [];
            if (tasks.length > 0) {
                result = tasks.map(function (task, index) {
                    return _react2.default.createElement(_TaskItem2.default, { key: index,
                        task: task,
                        index: index,
                        onDelItem: _this.onDelItem,
                        onUpdateTask: _this.onUpdateTask
                    });
                });
            }
            return result;
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(TasksListPage, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.props.onFetchAll();
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                tasks = _props.tasks,
                txtSearch = _props.txtSearch;
            // console.log(tasks);

            if (txtSearch) {
                tasks = tasks.filter(function (task, index) {
                    return task.name.toLowerCase().indexOf(txtSearch.toLowerCase()) !== -1;
                });
            }

            return _react2.default.createElement(
                _react2.default.Fragment,
                null,
                _react2.default.createElement(
                    _Control2.default,
                    null,
                    _react2.default.createElement(_Search2.default, { onSearch: this.onSearh }),
                    _react2.default.createElement(_Sort2.default, null)
                ),
                _react2.default.createElement(
                    _TasksList2.default,
                    null,
                    this.showTasks(tasks)
                )
            );
        }
    }]);

    return TasksListPage;
}(_react.Component);

TasksListPage.propTypes = {
    tasks: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        id: _propTypes2.default.number.isRequired,
        name: _propTypes2.default.string.isRequired,
        content: _propTypes2.default.string.isRequired,
        level: _propTypes2.default.number.isRequired,
        status: _propTypes2.default.number.isRequired
    })).isRequired,
    onFetchAll: _propTypes2.default.func.isRequired,
    onDelItem: _propTypes2.default.func.isRequired,
    onUpdateTask: _propTypes2.default.func.isRequired
};

var mapStateToProps = function mapStateToProps(state) {
    return {
        tasks: state.tasks,
        txtSearch: state.txtSearch
    };
};
var mapDispatchToProps = function mapDispatchToProps(dispatch, props) {
    return {
        onFetchAll: function onFetchAll() {
            dispatch((0, _index.actFetchAllApi)());
        },
        onDelItem: function onDelItem(id) {
            dispatch((0, _index.actDelTaskApi)(id));
        },
        onUpdateTask: function onUpdateTask(task) {
            dispatch((0, _index.actUpdateTaskApi)(task));
        },
        onSearchTask: function onSearchTask(txtSearch) {
            dispatch((0, _index.actSearchTask)(txtSearch));
        }
    };
};
exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TasksListPage);

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = __webpack_require__(5);

__webpack_require__(108);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Control = function (_Component) {
    _inherits(Control, _Component);

    function Control() {
        _classCallCheck(this, Control);

        return _possibleConstructorReturn(this, (Control.__proto__ || Object.getPrototypeOf(Control)).apply(this, arguments));
    }

    _createClass(Control, [{
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                "div",
                { className: "control row" },
                this.props.children,
                _react2.default.createElement(
                    "div",
                    { className: "col-4" },
                    _react2.default.createElement(
                        _reactRouterDom.Link,
                        { to: "/tasks/add", exact: "false", className: "btn btn-info button" },
                        "Th\xEAm c\xF4ng vi\u1EC7c"
                    )
                )
            );
        }
    }]);

    return Control;
}(_react.Component);

exports.default = Control;

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(109);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(7)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../../node_modules/css-loader/index.js!./Control.css", function() {
			var newContent = require("!!../../../../../node_modules/css-loader/index.js!./Control.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(6)(false);
// imports


// module
exports.push([module.i, ".control .button{\n    width: 100%;\n}\n.control .button:hover{\n    background-color: #fff !important;\n    color: darkcyan !important;\n}", ""]);

// exports


/***/ }),
/* 110 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

__webpack_require__(112);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Search = function (_Component) {
    _inherits(Search, _Component);

    function Search(props) {
        _classCallCheck(this, Search);

        var _this = _possibleConstructorReturn(this, (Search.__proto__ || Object.getPrototypeOf(Search)).call(this, props));

        _this.handleChange = function (e) {
            var target = e.target;
            var name = target.name;
            var value = target.value;

            _this.setState(_defineProperty({}, name, value));
        };

        _this.handleSubmit = function () {
            _this.props.onSearch(_this.state.txtSearch);
        };

        _this.state = {
            txtSearch: ""
        };
        return _this;
    }

    _createClass(Search, [{
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                "div",
                { className: "col-5" },
                _react2.default.createElement(
                    "div",
                    { className: "input-group mb-3" },
                    _react2.default.createElement("input", { type: "text", className: "form-control", placeholder: "Nh\u1EADp t\u1EEB kh\xF3a",
                        name: "txtSearch",
                        value: this.state.txtSearch,
                        onChange: this.handleChange
                    }),
                    _react2.default.createElement("input", { type: "button", className: "btn btn-info", value: "T\xECm ki\u1EBFm", onClick: this.handleSubmit })
                )
            );
        }
    }]);

    return Search;
}(_react.Component);

exports.default = Search;

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(113);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(7)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../../node_modules/css-loader/index.js!./Search.css", function() {
			var newContent = require("!!../../../../../node_modules/css-loader/index.js!./Search.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(6)(false);
// imports


// module
exports.push([module.i, "input[type='button']{\n    margin: 0 10px;\n}\ninput[type='button']:hover{\n    background-color: #fff !important;\n    color: darkcyan !important;\n}", ""]);

// exports


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

__webpack_require__(115);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Sort = function (_Component) {
    _inherits(Sort, _Component);

    function Sort() {
        _classCallCheck(this, Sort);

        return _possibleConstructorReturn(this, (Sort.__proto__ || Object.getPrototypeOf(Sort)).apply(this, arguments));
    }

    _createClass(Sort, [{
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                "div",
                { className: "col-3" },
                _react2.default.createElement(
                    "div",
                    { className: "input-group mb-3" },
                    _react2.default.createElement(
                        "div",
                        { className: "dropdown show" },
                        _react2.default.createElement(
                            "a",
                            { className: "btn btn-info dropdown-toggle", href: "#", role: "button", id: "dropdownMenuLink", "data-toggle": "dropdown", "aria-haspopup": "true", "aria-expanded": "false" },
                            "Dropdown link"
                        ),
                        _react2.default.createElement(
                            "div",
                            { className: "dropdown-menu", "aria-labelledby": "dropdownMenuLink" },
                            _react2.default.createElement(
                                "a",
                                { className: "dropdown-item", href: "#" },
                                "Action"
                            ),
                            _react2.default.createElement(
                                "a",
                                { className: "dropdown-item", href: "#" },
                                "Another action"
                            ),
                            _react2.default.createElement(
                                "a",
                                { className: "dropdown-item", href: "#" },
                                "Something else here"
                            )
                        )
                    ),
                    _react2.default.createElement(
                        "span",
                        { className: "sort-title" },
                        "M\u1EDBi nh\u1EA5t"
                    )
                )
            );
        }
    }]);

    return Sort;
}(_react.Component);

exports.default = Sort;

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(116);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(7)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../../node_modules/css-loader/index.js!./Sort.css", function() {
			var newContent = require("!!../../../../../node_modules/css-loader/index.js!./Sort.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(6)(false);
// imports


// module
exports.push([module.i, ".sort-title{\n    background: #00d7b3;\n    line-height: 38px;\n    padding: 0 10px;\n    border-radius: 3px;\n    margin: 0 10px;\n    color: #fff;\n    font-weight: 600;\n}", ""]);

// exports


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

__webpack_require__(118);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TasksList = function (_Component) {
    _inherits(TasksList, _Component);

    function TasksList() {
        _classCallCheck(this, TasksList);

        return _possibleConstructorReturn(this, (TasksList.__proto__ || Object.getPrototypeOf(TasksList)).apply(this, arguments));
    }

    _createClass(TasksList, [{
        key: "render",
        value: function render() {
            return _react2.default.createElement(
                "div",
                { className: "card" },
                _react2.default.createElement(
                    "h5",
                    { className: "card-header" },
                    "Danh s\xE1ch c\xF4ng vi\u1EC7c"
                ),
                _react2.default.createElement(
                    "div",
                    { className: "card-body" },
                    _react2.default.createElement(
                        "table",
                        { className: "table" },
                        _react2.default.createElement(
                            "thead",
                            null,
                            _react2.default.createElement(
                                "tr",
                                null,
                                _react2.default.createElement(
                                    "th",
                                    { scope: "col" },
                                    "#"
                                ),
                                _react2.default.createElement(
                                    "th",
                                    { scope: "col" },
                                    "T\xEAn c\xF4ng vi\u1EC7c"
                                ),
                                _react2.default.createElement(
                                    "th",
                                    { scope: "col" },
                                    "\u0110\u1ED9 kh\xF3"
                                ),
                                _react2.default.createElement(
                                    "th",
                                    { scope: "col" },
                                    "T\xECnh tr\u1EA1ng"
                                ),
                                _react2.default.createElement(
                                    "th",
                                    { scope: "col" },
                                    "H\xE0nh \u0111\u1ED9ng"
                                )
                            )
                        ),
                        _react2.default.createElement(
                            "tbody",
                            null,
                            this.props.children
                        )
                    )
                )
            );
        }
    }]);

    return TasksList;
}(_react.Component);

exports.default = TasksList;

/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(119);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(7)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../../node_modules/css-loader/index.js!./TasksList.css", function() {
			var newContent = require("!!../../../../../node_modules/css-loader/index.js!./TasksList.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(6)(false);
// imports


// module
exports.push([module.i, ".card{\n    margin-top: 30px;\n}", ""]);

// exports


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TaskItem = function (_Component) {
    _inherits(TaskItem, _Component);

    function TaskItem() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, TaskItem);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = TaskItem.__proto__ || Object.getPrototypeOf(TaskItem)).call.apply(_ref, [this].concat(args))), _this), _this.handleDel = function (id) {
            var conf = confirm("Bạn chắc chắn xóa dữ liệu này?");
            if (conf) {
                _this.props.onDelItem(id);
            }
        }, _this.changeStatus = function (task) {
            _this.props.onUpdateTask(task);
        }, _this.showLevel = function (level) {
            switch (level) {
                case 0:
                    return _react2.default.createElement(
                        'span',
                        { className: 'badge badge-secondary' },
                        'Small'
                    );
                case 1:
                    return _react2.default.createElement(
                        'span',
                        { className: 'badge badge-warning' },
                        'Medium'
                    );
                case 2:
                    return _react2.default.createElement(
                        'span',
                        { className: 'badge badge-danger' },
                        'Hard'
                    );
                default:
                    return _react2.default.createElement(
                        'span',
                        { className: 'badge badge-secondary' },
                        'Small'
                    );
            }
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(TaskItem, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                task = _props.task,
                index = _props.index;

            var elmStatusTitle = task.status === 0 ? "Chưa xong" : "Đã xong";
            var elmStatusClass = task.status === 0 ? "primary" : "success";
            return _react2.default.createElement(
                'tr',
                null,
                _react2.default.createElement(
                    'th',
                    { scope: 'row' },
                    index + 1
                ),
                _react2.default.createElement(
                    'td',
                    null,
                    task.name
                ),
                _react2.default.createElement(
                    'td',
                    null,
                    this.showLevel(task.level)
                ),
                _react2.default.createElement(
                    'td',
                    null,
                    _react2.default.createElement(
                        'span',
                        { className: 'badge badge-' + elmStatusClass, onClick: function onClick() {
                                return _this2.changeStatus(task);
                            } },
                        elmStatusTitle
                    )
                ),
                _react2.default.createElement(
                    'td',
                    null,
                    _react2.default.createElement(
                        _reactRouterDom.Link,
                        { to: 'tasks/' + task.id + '/edit', type: 'button', className: 'btn btn-warning btn-sm mr-1' },
                        'S\u1EEDa'
                    ),
                    _react2.default.createElement(
                        'button',
                        { type: 'button', className: 'btn btn-danger btn-sm', onClick: function onClick() {
                                return _this2.handleDel(task.id);
                            } },
                        'X\xF3a'
                    )
                )
            );
        }
    }]);

    return TaskItem;
}(_react.Component);

exports.default = TaskItem;

/***/ }),
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */,
/* 131 */,
/* 132 */,
/* 133 */,
/* 134 */,
/* 135 */,
/* 136 */,
/* 137 */,
/* 138 */,
/* 139 */,
/* 140 */,
/* 141 */,
/* 142 */,
/* 143 */,
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _apiUrl = __webpack_require__(145);

var callApi = function callApi(endpoint, method) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    return axios({
        url: _apiUrl.apiUrl + endpoint,
        method: method,
        data: data
    }).catch(function (err) {
        console.log(err);
    });
};
exports.default = callApi;

/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var apiUrl = exports.apiUrl = "http://localhost:8000/api/tasks";

/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

__webpack_require__(147);

var _reactRedux = __webpack_require__(14);

var _reactRouterDom = __webpack_require__(5);

var _actions = __webpack_require__(50);

var _propTypes = __webpack_require__(2);

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TasksActionPage = function (_Component) {
    _inherits(TasksActionPage, _Component);

    function TasksActionPage(props) {
        _classCallCheck(this, TasksActionPage);

        var _this = _possibleConstructorReturn(this, (TasksActionPage.__proto__ || Object.getPrototypeOf(TasksActionPage)).call(this, props));

        _this.handleChange = function (e) {
            var target = e.target;
            var name = target.name;
            var value = target.type === "checkbox" ? target.checked : target.value;

            _this.setState(_defineProperty({}, name, value));
        };

        _this.onSave = function (e) {
            e.preventDefault();
            var _this$state = _this.state,
                name = _this$state.name,
                level = _this$state.level,
                content = _this$state.content,
                id = _this$state.id,
                status = _this$state.status;
            var _this$props = _this.props,
                onAddTask = _this$props.onAddTask,
                history = _this$props.history,
                match = _this$props.match,
                onUpdateTask = _this$props.onUpdateTask;

            var task = {
                id: id,
                name: name,
                content: content,
                status: +status,
                level: +level
            };
            if (!match) {
                onAddTask(task);
            } else {
                onUpdateTask(task);
            }
            history.goBack();
        };

        _this.state = {
            isEdit: false,
            name: "",
            content: "",
            level: 0,
            status: 0
        };
        return _this;
    }

    _createClass(TasksActionPage, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var match = this.props.match;

            if (match) {
                this.props.onEditTask(match.params.id);
                this.setState({
                    isEdit: true
                });
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var editTask = nextProps.editTask;

            this.setState({
                id: editTask.id,
                name: editTask.name,
                content: editTask.content,
                level: editTask.level,
                status: editTask.status
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var elmStatus = null;
            if (this.state.isEdit === true) {
                elmStatus = _react2.default.createElement(
                    'div',
                    { className: 'form-group' },
                    _react2.default.createElement(
                        'label',
                        null,
                        'T\xECnh tr\u1EA1ng'
                    ),
                    _react2.default.createElement(
                        'select',
                        { className: 'form-control',
                            name: 'status',
                            value: this.state.status,
                            onChange: this.handleChange
                        },
                        _react2.default.createElement(
                            'option',
                            { value: 0 },
                            'Ch\u01B0a xong'
                        ),
                        _react2.default.createElement(
                            'option',
                            { value: 1 },
                            '\u0110\xE3 xong'
                        )
                    )
                );
            }

            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    'form',
                    { className: 'action-form', onSubmit: this.onSave },
                    _react2.default.createElement(
                        'h4',
                        null,
                        'Th\xEAm c\xF4ng vi\u1EC7c'
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'form-group' },
                        _react2.default.createElement(
                            'label',
                            { htmlFor: 'name' },
                            'T\xEAn c\xF4ng vi\u1EC7c'
                        ),
                        _react2.default.createElement('input', { type: 'text', className: 'form-control', id: 'name', placeholder: 'Nh\u1EADp t\xEAn c\xF4ng vi\u1EC7c...',
                            name: 'name',
                            value: this.state.name,
                            onChange: this.handleChange
                        })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'form-group' },
                        _react2.default.createElement(
                            'label',
                            { htmlFor: 'content' },
                            'N\u1ED9i dung c\xF4ng vi\u1EC7c'
                        ),
                        _react2.default.createElement('textarea', { className: 'form-control', id: 'content', rows: 3,
                            name: 'content',
                            value: this.state.content,
                            onChange: this.handleChange
                        })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'form-group' },
                        _react2.default.createElement(
                            'label',
                            null,
                            'M\u1EE9c \u0111\u1ED9'
                        ),
                        _react2.default.createElement(
                            'select',
                            { className: 'form-control',
                                name: 'level',
                                value: this.state.level,
                                onChange: this.handleChange
                            },
                            _react2.default.createElement(
                                'option',
                                { value: 0 },
                                'Small'
                            ),
                            _react2.default.createElement(
                                'option',
                                { value: 1 },
                                'Medium'
                            ),
                            _react2.default.createElement(
                                'option',
                                { value: 2 },
                                'Hard'
                            )
                        )
                    ),
                    elmStatus,
                    _react2.default.createElement(
                        'button',
                        { type: 'submit', className: 'btn btn-primary mr-1' },
                        'L\u01B0u l\u1EA1i'
                    ),
                    _react2.default.createElement(
                        _reactRouterDom.Link,
                        { type: 'submit', to: '/tasks-list', className: 'btn btn-secondary' },
                        'Tr\u1EDF l\u1EA1i'
                    )
                )
            );
        }
    }]);

    return TasksActionPage;
}(_react.Component);

TasksActionPage.propTypes = {
    editTask: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        id: _propTypes2.default.number.isRequired,
        name: _propTypes2.default.string.isRequired,
        content: _propTypes2.default.string.isRequired,
        level: _propTypes2.default.number.isRequired,
        status: _propTypes2.default.number.isRequired
    })).isRequired,
    onAddTask: _propTypes2.default.func.isRequired,
    onEditTask: _propTypes2.default.func.isRequired,
    onUpdateTask: _propTypes2.default.func.isRequired
};

var mapStateToProps = function mapStateToProps(state) {
    return {
        editTask: state.editTask
    };
};
var mapDispatchToProps = function mapDispatchToProps(dispatch, props) {
    return {
        onAddTask: function onAddTask(task) {
            dispatch((0, _actions.actAddTaskApi)(task));
        },
        onEditTask: function onEditTask(id) {
            dispatch((0, _actions.actEditTaskApi)(id));
        },
        onUpdateTask: function onUpdateTask(task) {
            dispatch((0, _actions.actUpdateTaskApi)(task));
        }
    };
};
exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TasksActionPage);

/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(148);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(7)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../../node_modules/css-loader/index.js!./TasksActionPage.css", function() {
			var newContent = require("!!../../../../../node_modules/css-loader/index.js!./TasksActionPage.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(6)(false);
// imports


// module
exports.push([module.i, ".action-form{\n    width: 60%;\n    margin: 25px auto;\n}\n.action-form h4{\n    margin: 15px 0;\n}", ""]);

// exports


/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NotFoundPage = function (_Component) {
    _inherits(NotFoundPage, _Component);

    function NotFoundPage() {
        _classCallCheck(this, NotFoundPage);

        return _possibleConstructorReturn(this, (NotFoundPage.__proto__ || Object.getPrototypeOf(NotFoundPage)).apply(this, arguments));
    }

    _createClass(NotFoundPage, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                null,
                'NotFoundPage'
            );
        }
    }]);

    return NotFoundPage;
}(_react.Component);

exports.default = NotFoundPage;

/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(151);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(7)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../../../node_modules/css-loader/index.js!./App.css", function() {
			var newContent = require("!!../../../../../node_modules/css-loader/index.js!./App.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(6)(false);
// imports


// module
exports.push([module.i, ".content {\n    padding-top: 30px;\n}", ""]);

// exports


/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _redux = __webpack_require__(15);

var _tasks = __webpack_require__(153);

var _tasks2 = _interopRequireDefault(_tasks);

var _editTask = __webpack_require__(154);

var _editTask2 = _interopRequireDefault(_editTask);

var _searchTask = __webpack_require__(179);

var _searchTask2 = _interopRequireDefault(_searchTask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appReducers = (0, _redux.combineReducers)({
    tasks: _tasks2.default,
    editTask: _editTask2.default,
    txtSearch: _searchTask2.default
});
exports.default = appReducers;

/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ActionsType = __webpack_require__(27);

var Types = _interopRequireWildcard(_ActionsType);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var initialState = [];

var findIndex = function findIndex(state, id) {
    var result = -1;
    if (state.length > 0) {
        state.forEach(function (value, index) {
            if (value.id === id) {
                result = index;
            }
        });
    }
    return result;
};
var tasks = function tasks() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    switch (action.type) {
        case Types.FETCH_ALL:
            return action.tasks;
        case Types.ADD_TASK:
            state.push(action.task);
            return [].concat(_toConsumableArray(state));
        case Types.UPDATE_TASK:
            var idEdit = action.task.id;
            var indexEdit = findIndex(state, idEdit);
            if (index !== -1) {
                state[indexEdit] = action.task;
            }
            return [].concat(_toConsumableArray(state));
        case Types.DEL_TASK:
            var id = action.id;
            var index = findIndex(state, id);
            if (index !== -1) {
                state.splice(index, 1);
            }
            return [].concat(_toConsumableArray(state));
        default:
            return [].concat(_toConsumableArray(state));
    }
};
exports.default = tasks;

/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ActionsType = __webpack_require__(27);

var Types = _interopRequireWildcard(_ActionsType);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var initialState = [];

var editTask = function editTask() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    switch (action.type) {
        case Types.EDIT_TASK:
            return action.task;
        default:
            return [].concat(_toConsumableArray(state));
    }
};
exports.default = editTask;

/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


window._ = __webpack_require__(52);
window.Popper = __webpack_require__(28).default;

/**
 * We'll load jQuery and the Bootstrap jQuery plugin which provides support
 * for JavaScript based Bootstrap features such as modals and tabs. This
 * code may be modified to fit the specific needs of your application.
 */

try {
  window.$ = window.jQuery = __webpack_require__(29);

  __webpack_require__(53);
} catch (e) {}

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

window.axios = __webpack_require__(54);

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Next we will register the CSRF Token as a common header with Axios so that
 * all outgoing HTTP requests automatically have it attached. This is just
 * a simple convenience so we don't have to attach every token manually.
 */

var token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
  window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
  console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// import Echo from 'laravel-echo'

// window.Pusher = require('pusher-js');

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: process.env.MIX_PUSHER_APP_KEY,
//     cluster: process.env.MIX_PUSHER_APP_CLUSTER,
//     encrypted: true
// });

/***/ }),
/* 156 */,
/* 157 */,
/* 158 */,
/* 159 */,
/* 160 */,
/* 161 */,
/* 162 */,
/* 163 */,
/* 164 */,
/* 165 */,
/* 166 */,
/* 167 */,
/* 168 */,
/* 169 */,
/* 170 */,
/* 171 */,
/* 172 */,
/* 173 */,
/* 174 */,
/* 175 */,
/* 176 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 177 */,
/* 178 */,
/* 179 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ActionsType = __webpack_require__(27);

var Types = _interopRequireWildcard(_ActionsType);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var initialState = "";

var searchTask = function searchTask() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    switch (action.type) {
        case Types.SEARCH_TASK:
            return action.txtSearch;
        default:
            return state;
    }
};

exports.default = searchTask;

/***/ })
],[60]);