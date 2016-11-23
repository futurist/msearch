(function () {
'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var mithril$1 = createCommonjsModule(function (module) {
(function (global, factory) { // eslint-disable-line
	"use strict";
	/* eslint-disable no-undef */
	var m = factory(global);
	if (typeof module === "object" && module != null && module.exports) {
		module.exports = m;
	} else if (typeof define === "function" && define.amd) {
		define(function () { return m });
	} else {
		global.m = m;
	}
	/* eslint-enable no-undef */
})(typeof window !== "undefined" ? window : commonjsGlobal, function (global, undefined) { // eslint-disable-line
	"use strict";

	m.version = function () {
		return "v0.2.5"
	};

	var hasOwn = {}.hasOwnProperty;
	var type = {}.toString;

	function isFunction(object) {
		return typeof object === "function"
	}

	function isObject(object) {
		return type.call(object) === "[object Object]"
	}

	function isString(object) {
		return type.call(object) === "[object String]"
	}

	var isArray = Array.isArray || function (object) {
		return type.call(object) === "[object Array]"
	};

	function noop() {}

	var voidElements = {
		AREA: 1,
		BASE: 1,
		BR: 1,
		COL: 1,
		COMMAND: 1,
		EMBED: 1,
		HR: 1,
		IMG: 1,
		INPUT: 1,
		KEYGEN: 1,
		LINK: 1,
		META: 1,
		PARAM: 1,
		SOURCE: 1,
		TRACK: 1,
		WBR: 1
	};

	// caching commonly used variables
	var $document, $location, $requestAnimationFrame, $cancelAnimationFrame;

	// self invoking function needed because of the way mocks work
	function initialize(mock) {
		$document = mock.document;
		$location = mock.location;
		$cancelAnimationFrame = mock.cancelAnimationFrame || mock.clearTimeout;
		$requestAnimationFrame = mock.requestAnimationFrame || mock.setTimeout;
	}

	// testing API
	m.deps = function (mock) {
		initialize(global = mock || window);
		return global
	};

	m.deps(global);

	/**
	 * @typedef {String} Tag
	 * A string that looks like -> div.classname#id[param=one][param2=two]
	 * Which describes a DOM node
	 */

	function parseTagAttrs(cell, tag) {
		var classes = [];
		var parser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g;
		var match;

		while ((match = parser.exec(tag))) {
			if (match[1] === "" && match[2]) {
				cell.tag = match[2];
			} else if (match[1] === "#") {
				cell.attrs.id = match[2];
			} else if (match[1] === ".") {
				classes.push(match[2]);
			} else if (match[3][0] === "[") {
				var pair = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/.exec(match[3]);
				cell.attrs[pair[1]] = pair[3] || "";
			}
		}

		return classes
	}

	function getVirtualChildren(args, hasAttrs) {
		var children = hasAttrs ? args.slice(1) : args;

		if (children.length === 1 && isArray(children[0])) {
			return children[0]
		} else {
			return children
		}
	}

	function assignAttrs(target, attrs, classes) {
		var classAttr = "class" in attrs ? "class" : "className";

		for (var attrName in attrs) {
			if (hasOwn.call(attrs, attrName)) {
				if (attrName === classAttr &&
						attrs[attrName] != null &&
						attrs[attrName] !== "") {
					classes.push(attrs[attrName]);
					// create key in correct iteration order
					target[attrName] = "";
				} else {
					target[attrName] = attrs[attrName];
				}
			}
		}

		if (classes.length) { target[classAttr] = classes.join(" "); }
	}

	/**
	 *
	 * @param {Tag} The DOM node tag
	 * @param {Object=[]} optional key-value pairs to be mapped to DOM attrs
	 * @param {...mNode=[]} Zero or more Mithril child nodes. Can be an array,
	 *                      or splat (optional)
	 */
	function m(tag, pairs) {
		var arguments$1 = arguments;

		var args = [];

		for (var i = 1, length = arguments.length; i < length; i++) {
			args[i - 1] = arguments$1[i];
		}

		if (isObject(tag)) { return parameterize(tag, args) }

		if (!isString(tag)) {
			throw new Error("selector in m(selector, attrs, children) should " +
				"be a string")
		}

		var hasAttrs = pairs != null && isObject(pairs) &&
			!("tag" in pairs || "view" in pairs || "subtree" in pairs);

		var attrs = hasAttrs ? pairs : {};
		var cell = {
			tag: "div",
			attrs: {},
			children: getVirtualChildren(args, hasAttrs)
		};

		assignAttrs(cell.attrs, attrs, parseTagAttrs(cell, tag));
		return cell
	}

	function forEach(list, f) {
		for (var i = 0; i < list.length && !f(list[i], i++);) {
			// function called in condition
		}
	}

	function forKeys(list, f) {
		forEach(list, function (attrs, i) {
			return (attrs = attrs && attrs.attrs) &&
				attrs.key != null &&
				f(attrs, i)
		});
	}
	// This function was causing deopts in Chrome.
	function dataToString(data) {
		// data.toString() might throw or return null if data is the return
		// value of Console.log in some versions of Firefox (behavior depends on
		// version)
		try {
			if (data != null && data.toString() != null) { return data }
		} catch (e) {
			// silently ignore errors
		}
		return ""
	}

	// This function was causing deopts in Chrome.
	function injectTextNode(parentElement, first, index, data) {
		try {
			insertNode(parentElement, first, index);
			first.nodeValue = data;
		} catch (e) {
			// IE erroneously throws error when appending an empty text node
			// after a null
		}
	}

	function flatten(list) {
		// recursively flatten array
		for (var i = 0; i < list.length; i++) {
			if (isArray(list[i])) {
				list = list.concat.apply([], list);
				// check current index again and flatten until there are no more
				// nested arrays at that index
				i--;
			}
		}
		return list
	}

	function insertNode(parentElement, node, index) {
		parentElement.insertBefore(node,
			parentElement.childNodes[index] || null);
	}

	var DELETION = 1;
	var INSERTION = 2;
	var MOVE = 3;

	function handleKeysDiffer(data, existing, cached, parentElement) {
		forKeys(data, function (key, i) {
			existing[key = key.key] = existing[key] ? {
				action: MOVE,
				index: i,
				from: existing[key].index,
				element: cached.nodes[existing[key].index] ||
					$document.createElement("div")
			} : {action: INSERTION, index: i};
		});

		var actions = [];
		for (var prop in existing) {
			if (hasOwn.call(existing, prop)) {
				actions.push(existing[prop]);
			}
		}

		var changes = actions.sort(sortChanges);
		var newCached = new Array(cached.length);

		newCached.nodes = cached.nodes.slice();

		forEach(changes, function (change) {
			var index = change.index;
			if (change.action === DELETION) {
				clear(cached[index].nodes, cached[index]);
				newCached.splice(index, 1);
			}
			if (change.action === INSERTION) {
				var dummy = $document.createElement("div");
				dummy.key = data[index].attrs.key;
				insertNode(parentElement, dummy, index);
				newCached.splice(index, 0, {
					attrs: {key: data[index].attrs.key},
					nodes: [dummy]
				});
				newCached.nodes[index] = dummy;
			}

			if (change.action === MOVE) {
				var changeElement = change.element;
				var maybeChanged = parentElement.childNodes[index];
				if (maybeChanged !== changeElement && changeElement !== null) {
					parentElement.insertBefore(changeElement,
						maybeChanged || null);
				}
				newCached[index] = cached[change.from];
				newCached.nodes[index] = changeElement;
			}
		});

		return newCached
	}

	function diffKeys(data, cached, existing, parentElement) {
		var keysDiffer = data.length !== cached.length;

		if (!keysDiffer) {
			forKeys(data, function (attrs, i) {
				var cachedCell = cached[i];
				return keysDiffer = cachedCell &&
					cachedCell.attrs &&
					cachedCell.attrs.key !== attrs.key
			});
		}

		if (keysDiffer) {
			return handleKeysDiffer(data, existing, cached, parentElement)
		} else {
			return cached
		}
	}

	function diffArray(data, cached, nodes) {
		// diff the array itself

		// update the list of DOM nodes by collecting the nodes from each item
		forEach(data, function (_, i) {
			if (cached[i] != null) { nodes.push.apply(nodes, cached[i].nodes); }
		});
		// remove items from the end of the array if the new array is shorter
		// than the old one. if errors ever happen here, the issue is most
		// likely a bug in the construction of the `cached` data structure
		// somewhere earlier in the program
		forEach(cached.nodes, function (node, i) {
			if (node.parentNode != null && nodes.indexOf(node) < 0) {
				clear([node], [cached[i]]);
			}
		});

		if (data.length < cached.length) { cached.length = data.length; }
		cached.nodes = nodes;
	}

	function buildArrayKeys(data) {
		var guid = 0;
		forKeys(data, function () {
			forEach(data, function (attrs) {
				if ((attrs = attrs && attrs.attrs) && attrs.key == null) {
					attrs.key = "__mithril__" + guid++;
				}
			});
			return 1
		});
	}

	function isDifferentEnough(data, cached, dataAttrKeys) {
		if (data.tag !== cached.tag) { return true }

		if (dataAttrKeys.sort().join() !==
				Object.keys(cached.attrs).sort().join()) {
			return true
		}

		if (data.attrs.id !== cached.attrs.id) {
			return true
		}

		if (data.attrs.key !== cached.attrs.key) {
			return true
		}

		if (m.redraw.strategy() === "all") {
			return !cached.configContext || cached.configContext.retain !== true
		}

		if (m.redraw.strategy() === "diff") {
			return cached.configContext && cached.configContext.retain === false
		}

		return false
	}

	function maybeRecreateObject(data, cached, dataAttrKeys) {
		// if an element is different enough from the one in cache, recreate it
		if (isDifferentEnough(data, cached, dataAttrKeys)) {
			if (cached.nodes.length) { clear(cached.nodes); }

			if (cached.configContext &&
					isFunction(cached.configContext.onunload)) {
				cached.configContext.onunload();
			}

			if (cached.controllers) {
				forEach(cached.controllers, function (controller) {
					if (controller.onunload) {
						controller.onunload({preventDefault: noop});
					}
				});
			}
		}
	}

	function getObjectNamespace(data, namespace) {
		if (data.attrs.xmlns) { return data.attrs.xmlns }
		if (data.tag === "svg") { return "http://www.w3.org/2000/svg" }
		if (data.tag === "math") { return "http://www.w3.org/1998/Math/MathML" }
		return namespace
	}

	var pendingRequests = 0;
	m.startComputation = function () { pendingRequests++; };
	m.endComputation = function () {
		if (pendingRequests > 1) {
			pendingRequests--;
		} else {
			pendingRequests = 0;
			m.redraw();
		}
	};

	function unloadCachedControllers(cached, views, controllers) {
		if (controllers.length) {
			cached.views = views;
			cached.controllers = controllers;
			forEach(controllers, function (controller) {
				if (controller.onunload && controller.onunload.$old) {
					controller.onunload = controller.onunload.$old;
				}

				if (pendingRequests && controller.onunload) {
					var onunload = controller.onunload;
					controller.onunload = noop;
					controller.onunload.$old = onunload;
				}
			});
		}
	}

	function scheduleConfigsToBeCalled(configs, data, node, isNew, cached) {
		// schedule configs to be called. They are called after `build` finishes
		// running
		if (isFunction(data.attrs.config)) {
			var context = cached.configContext = cached.configContext || {};

			// bind
			configs.push(function () {
				return data.attrs.config.call(data, node, !isNew, context,
					cached)
			});
		}
	}

	function buildUpdatedNode(
		cached,
		data,
		editable,
		hasKeys,
		namespace,
		views,
		configs,
		controllers
	) {
		var node = cached.nodes[0];

		if (hasKeys) {
			setAttributes(node, data.tag, data.attrs, cached.attrs, namespace);
		}

		cached.children = build(
			node,
			data.tag,
			undefined,
			undefined,
			data.children,
			cached.children,
			false,
			0,
			data.attrs.contenteditable ? node : editable,
			namespace,
			configs
		);

		cached.nodes.intact = true;

		if (controllers.length) {
			cached.views = views;
			cached.controllers = controllers;
		}

		return node
	}

	function handleNonexistentNodes(data, parentElement, index) {
		var nodes;
		if (data.$trusted) {
			nodes = injectHTML(parentElement, index, data);
		} else {
			nodes = [$document.createTextNode(data)];
			if (!(parentElement.nodeName in voidElements)) {
				insertNode(parentElement, nodes[0], index);
			}
		}

		var cached;

		if (typeof data === "string" ||
				typeof data === "number" ||
				typeof data === "boolean") {
			cached = new data.constructor(data);
		} else {
			cached = data;
		}

		cached.nodes = nodes;
		return cached
	}

	function reattachNodes(
		data,
		cached,
		parentElement,
		editable,
		index,
		parentTag
	) {
		var nodes = cached.nodes;
		if (!editable || editable !== $document.activeElement) {
			if (data.$trusted) {
				clear(nodes, cached);
				nodes = injectHTML(parentElement, index, data);
			} else if (parentTag === "textarea") {
				// <textarea> uses `value` instead of `nodeValue`.
				parentElement.value = data;
			} else if (editable) {
				// contenteditable nodes use `innerHTML` instead of `nodeValue`.
				editable.innerHTML = data;
			} else {
				// was a trusted string
				if (nodes[0].nodeType === 1 || nodes.length > 1 ||
						(nodes[0].nodeValue.trim &&
							!nodes[0].nodeValue.trim())) {
					clear(cached.nodes, cached);
					nodes = [$document.createTextNode(data)];
				}

				injectTextNode(parentElement, nodes[0], index, data);
			}
		}
		cached = new data.constructor(data);
		cached.nodes = nodes;
		return cached
	}

	function handleTextNode(
		cached,
		data,
		index,
		parentElement,
		shouldReattach,
		editable,
		parentTag
	) {
		if (!cached.nodes.length) {
			return handleNonexistentNodes(data, parentElement, index)
		} else if (cached.valueOf() !== data.valueOf() || shouldReattach) {
			return reattachNodes(data, cached, parentElement, editable, index,
				parentTag)
		} else {
			return (cached.nodes.intact = true, cached)
		}
	}

	function getSubArrayCount(item) {
		if (item.$trusted) {
			// fix offset of next element if item was a trusted string w/ more
			// than one html element
			// the first clause in the regexp matches elements
			// the second clause (after the pipe) matches text nodes
			var match = item.match(/<[^\/]|\>\s*[^<]/g);
			if (match != null) { return match.length }
		} else if (isArray(item)) {
			return item.length
		}
		return 1
	}

	function buildArray(
		data,
		cached,
		parentElement,
		index,
		parentTag,
		shouldReattach,
		editable,
		namespace,
		configs
	) {
		data = flatten(data);
		var nodes = [];
		var intact = cached.length === data.length;
		var subArrayCount = 0;

		// keys algorithm: sort elements without recreating them if keys are
		// present
		//
		// 1) create a map of all existing keys, and mark all for deletion
		// 2) add new keys to map and mark them for addition
		// 3) if key exists in new list, change action from deletion to a move
		// 4) for each key, handle its corresponding action as marked in
		//    previous steps

		var existing = {};
		var shouldMaintainIdentities = false;

		forKeys(cached, function (attrs, i) {
			shouldMaintainIdentities = true;
			existing[cached[i].attrs.key] = {action: DELETION, index: i};
		});

		buildArrayKeys(data);
		if (shouldMaintainIdentities) {
			cached = diffKeys(data, cached, existing, parentElement);
		}
		// end key algorithm

		var cacheCount = 0;
		// faster explicitly written
		for (var i = 0, len = data.length; i < len; i++) {
			// diff each item in the array
			var item = build(
				parentElement,
				parentTag,
				cached,
				index,
				data[i],
				cached[cacheCount],
				shouldReattach,
				index + subArrayCount || subArrayCount,
				editable,
				namespace,
				configs);

			if (item !== undefined) {
				intact = intact && item.nodes.intact;
				subArrayCount += getSubArrayCount(item);
				cached[cacheCount++] = item;
			}
		}

		if (!intact) { diffArray(data, cached, nodes); }
		return cached
	}

	function makeCache(data, cached, index, parentIndex, parentCache) {
		if (cached != null) {
			if (type.call(cached) === type.call(data)) { return cached }

			if (parentCache && parentCache.nodes) {
				var offset = index - parentIndex;
				var end = offset + (isArray(data) ? data : cached.nodes).length;
				clear(
					parentCache.nodes.slice(offset, end),
					parentCache.slice(offset, end));
			} else if (cached.nodes) {
				clear(cached.nodes, cached);
			}
		}

		cached = new data.constructor();
		// if constructor creates a virtual dom element, use a blank object as
		// the base cached node instead of copying the virtual el (#277)
		if (cached.tag) { cached = {}; }
		cached.nodes = [];
		return cached
	}

	function constructNode(data, namespace) {
		if (data.attrs.is) {
			if (namespace == null) {
				return $document.createElement(data.tag, data.attrs.is)
			} else {
				return $document.createElementNS(namespace, data.tag,
					data.attrs.is)
			}
		} else if (namespace == null) {
			return $document.createElement(data.tag)
		} else {
			return $document.createElementNS(namespace, data.tag)
		}
	}

	function constructAttrs(data, node, namespace, hasKeys) {
		if (hasKeys) {
			return setAttributes(node, data.tag, data.attrs, {}, namespace)
		} else {
			return data.attrs
		}
	}

	function constructChildren(
		data,
		node,
		cached,
		editable,
		namespace,
		configs
	) {
		if (data.children != null && data.children.length > 0) {
			return build(
				node,
				data.tag,
				undefined,
				undefined,
				data.children,
				cached.children,
				true,
				0,
				data.attrs.contenteditable ? node : editable,
				namespace,
				configs)
		} else {
			return data.children
		}
	}

	function reconstructCached(
		data,
		attrs,
		children,
		node,
		namespace,
		views,
		controllers
	) {
		var cached = {
			tag: data.tag,
			attrs: attrs,
			children: children,
			nodes: [node]
		};

		unloadCachedControllers(cached, views, controllers);

		if (cached.children && !cached.children.nodes) {
			cached.children.nodes = [];
		}

		// edge case: setting value on <select> doesn't work before children
		// exist, so set it again after children have been created
		if (data.tag === "select" && "value" in data.attrs) {
			setAttributes(node, data.tag, {value: data.attrs.value}, {},
				namespace);
		}

		return cached
	}

	function getController(views, view, cachedControllers, controller) {
		var controllerIndex;

		if (m.redraw.strategy() === "diff" && views) {
			controllerIndex = views.indexOf(view);
		} else {
			controllerIndex = -1;
		}

		if (controllerIndex > -1) {
			return cachedControllers[controllerIndex]
		} else if (isFunction(controller)) {
			return new controller()
		} else {
			return {}
		}
	}

	var unloaders = [];

	function updateLists(views, controllers, view, controller) {
		if (controller.onunload != null &&
				unloaders.map(function (u) { return u.handler })
					.indexOf(controller.onunload) < 0) {
			unloaders.push({
				controller: controller,
				handler: controller.onunload
			});
		}

		views.push(view);
		controllers.push(controller);
	}

	var forcing = false;
	function checkView(
		data,
		view,
		cached,
		cachedControllers,
		controllers,
		views
	) {
		var controller = getController(
			cached.views,
			view,
			cachedControllers,
			data.controller);

		var key = data && data.attrs && data.attrs.key;

		if (pendingRequests === 0 ||
				forcing ||
				cachedControllers &&
					cachedControllers.indexOf(controller) > -1) {
			data = data.view(controller);
		} else {
			data = {tag: "placeholder"};
		}

		if (data.subtree === "retain") { return data }
		data.attrs = data.attrs || {};
		data.attrs.key = key;
		updateLists(views, controllers, view, controller);
		return data
	}

	function markViews(data, cached, views, controllers) {
		var cachedControllers = cached && cached.controllers;

		while (data.view != null) {
			data = checkView(
				data,
				data.view.$original || data.view,
				cached,
				cachedControllers,
				controllers,
				views);
		}

		return data
	}

	function buildObject( // eslint-disable-line max-statements
		data,
		cached,
		editable,
		parentElement,
		index,
		shouldReattach,
		namespace,
		configs
	) {
		var views = [];
		var controllers = [];

		data = markViews(data, cached, views, controllers);

		if (data.subtree === "retain") { return cached }

		if (!data.tag && controllers.length) {
			throw new Error("Component template must return a virtual " +
				"element, not an array, string, etc.")
		}

		data.attrs = data.attrs || {};
		cached.attrs = cached.attrs || {};

		var dataAttrKeys = Object.keys(data.attrs);
		var hasKeys = dataAttrKeys.length > ("key" in data.attrs ? 1 : 0);

		maybeRecreateObject(data, cached, dataAttrKeys);

		if (!isString(data.tag)) { return }

		var isNew = cached.nodes.length === 0;

		namespace = getObjectNamespace(data, namespace);

		var node;
		if (isNew) {
			node = constructNode(data, namespace);
			// set attributes first, then create children
			var attrs = constructAttrs(data, node, namespace, hasKeys);

			// add the node to its parent before attaching children to it
			insertNode(parentElement, node, index);

			var children = constructChildren(data, node, cached, editable,
				namespace, configs);

			cached = reconstructCached(
				data,
				attrs,
				children,
				node,
				namespace,
				views,
				controllers);
		} else {
			node = buildUpdatedNode(
				cached,
				data,
				editable,
				hasKeys,
				namespace,
				views,
				configs,
				controllers);
		}

		if (!isNew && shouldReattach === true && node != null) {
			insertNode(parentElement, node, index);
		}

		// The configs are called after `build` finishes running
		scheduleConfigsToBeCalled(configs, data, node, isNew, cached);

		return cached
	}

	function build(
		parentElement,
		parentTag,
		parentCache,
		parentIndex,
		data,
		cached,
		shouldReattach,
		index,
		editable,
		namespace,
		configs
	) {
		/*
		 * `build` is a recursive function that manages creation/diffing/removal
		 * of DOM elements based on comparison between `data` and `cached` the
		 * diff algorithm can be summarized as this:
		 *
		 * 1 - compare `data` and `cached`
		 * 2 - if they are different, copy `data` to `cached` and update the DOM
		 *     based on what the difference is
		 * 3 - recursively apply this algorithm for every array and for the
		 *     children of every virtual element
		 *
		 * The `cached` data structure is essentially the same as the previous
		 * redraw's `data` data structure, with a few additions:
		 * - `cached` always has a property called `nodes`, which is a list of
		 *    DOM elements that correspond to the data represented by the
		 *    respective virtual element
		 * - in order to support attaching `nodes` as a property of `cached`,
		 *    `cached` is *always* a non-primitive object, i.e. if the data was
		 *    a string, then cached is a String instance. If data was `null` or
		 *    `undefined`, cached is `new String("")`
		 * - `cached also has a `configContext` property, which is the state
		 *    storage object exposed by config(element, isInitialized, context)
		 * - when `cached` is an Object, it represents a virtual element; when
		 *    it's an Array, it represents a list of elements; when it's a
		 *    String, Number or Boolean, it represents a text node
		 *
		 * `parentElement` is a DOM element used for W3C DOM API calls
		 * `parentTag` is only used for handling a corner case for textarea
		 * values
		 * `parentCache` is used to remove nodes in some multi-node cases
		 * `parentIndex` and `index` are used to figure out the offset of nodes.
		 * They're artifacts from before arrays started being flattened and are
		 * likely refactorable
		 * `data` and `cached` are, respectively, the new and old nodes being
		 * diffed
		 * `shouldReattach` is a flag indicating whether a parent node was
		 * recreated (if so, and if this node is reused, then this node must
		 * reattach itself to the new parent)
		 * `editable` is a flag that indicates whether an ancestor is
		 * contenteditable
		 * `namespace` indicates the closest HTML namespace as it cascades down
		 * from an ancestor
		 * `configs` is a list of config functions to run after the topmost
		 * `build` call finishes running
		 *
		 * there's logic that relies on the assumption that null and undefined
		 * data are equivalent to empty strings
		 * - this prevents lifecycle surprises from procedural helpers that mix
		 *   implicit and explicit return statements (e.g.
		 *   function foo() {if (cond) return m("div")}
		 * - it simplifies diffing code
		 */
		data = dataToString(data);
		if (data.subtree === "retain") { return cached }
		cached = makeCache(data, cached, index, parentIndex, parentCache);

		if (isArray(data)) {
			return buildArray(
				data,
				cached,
				parentElement,
				index,
				parentTag,
				shouldReattach,
				editable,
				namespace,
				configs)
		} else if (data != null && isObject(data)) {
			return buildObject(
				data,
				cached,
				editable,
				parentElement,
				index,
				shouldReattach,
				namespace,
				configs)
		} else if (!isFunction(data)) {
			return handleTextNode(
				cached,
				data,
				index,
				parentElement,
				shouldReattach,
				editable,
				parentTag)
		} else {
			return cached
		}
	}

	function sortChanges(a, b) {
		return a.action - b.action || a.index - b.index
	}

	function copyStyleAttrs(node, dataAttr, cachedAttr) {
		for (var rule in dataAttr) {
			if (hasOwn.call(dataAttr, rule)) {
				if (cachedAttr == null || cachedAttr[rule] !== dataAttr[rule]) {
					node.style[rule] = dataAttr[rule];
				}
			}
		}

		for (rule in cachedAttr) {
			if (hasOwn.call(cachedAttr, rule)) {
				if (!hasOwn.call(dataAttr, rule)) { node.style[rule] = ""; }
			}
		}
	}

	var shouldUseSetAttribute = {
		list: 1,
		style: 1,
		form: 1,
		type: 1,
		width: 1,
		height: 1
	};

	function setSingleAttr(
		node,
		attrName,
		dataAttr,
		cachedAttr,
		tag,
		namespace
	) {
		if (attrName === "config" || attrName === "key") {
			// `config` isn't a real attribute, so ignore it
			return true
		} else if (isFunction(dataAttr) && attrName.slice(0, 2) === "on") {
			// hook event handlers to the auto-redrawing system
			node[attrName] = autoredraw(dataAttr, node);
		} else if (attrName === "style" && dataAttr != null &&
				isObject(dataAttr)) {
			// handle `style: {...}`
			copyStyleAttrs(node, dataAttr, cachedAttr);
		} else if (namespace != null) {
			// handle SVG
			if (attrName === "href") {
				node.setAttributeNS("http://www.w3.org/1999/xlink",
					"href", dataAttr);
			} else {
				node.setAttribute(
					attrName === "className" ? "class" : attrName,
					dataAttr);
			}
		} else if (attrName in node && !shouldUseSetAttribute[attrName]) {
			// handle cases that are properties (but ignore cases where we
			// should use setAttribute instead)
			//
			// - list and form are typically used as strings, but are DOM
			//   element references in js
			//
			// - when using CSS selectors (e.g. `m("[style='']")`), style is
			//   used as a string, but it's an object in js
			//
			// #348 don't set the value if not needed - otherwise, cursor
			// placement breaks in Chrome
			try {
				if (tag !== "input" || node[attrName] !== dataAttr) {
					node[attrName] = dataAttr;
				}
			} catch (e) {
				node.setAttribute(attrName, dataAttr);
			}
		}
		else { node.setAttribute(attrName, dataAttr); }
	}

	function trySetAttr(
		node,
		attrName,
		dataAttr,
		cachedAttr,
		cachedAttrs,
		tag,
		namespace
	) {
		if (!(attrName in cachedAttrs) || (cachedAttr !== dataAttr) || ($document.activeElement === node)) {
			cachedAttrs[attrName] = dataAttr;
			try {
				return setSingleAttr(
					node,
					attrName,
					dataAttr,
					cachedAttr,
					tag,
					namespace)
			} catch (e) {
				// swallow IE's invalid argument errors to mimic HTML's
				// fallback-to-doing-nothing-on-invalid-attributes behavior
				if (e.message.indexOf("Invalid argument") < 0) { throw e }
			}
		} else if (attrName === "value" && tag === "input" &&
				node.value !== dataAttr) {
			// #348 dataAttr may not be a string, so use loose comparison
			node.value = dataAttr;
		}
	}

	function setAttributes(node, tag, dataAttrs, cachedAttrs, namespace) {
		for (var attrName in dataAttrs) {
			if (hasOwn.call(dataAttrs, attrName)) {
				if (trySetAttr(
						node,
						attrName,
						dataAttrs[attrName],
						cachedAttrs[attrName],
						cachedAttrs,
						tag,
						namespace)) {
					continue
				}
			}
		}
		return cachedAttrs
	}

	function clear(nodes, cached) {
		for (var i = nodes.length - 1; i > -1; i--) {
			if (nodes[i] && nodes[i].parentNode) {
				try {
					nodes[i].parentNode.removeChild(nodes[i]);
				} catch (e) {
					/* eslint-disable max-len */
					// ignore if this fails due to order of events (see
					// http://stackoverflow.com/questions/21926083/failed-to-execute-removechild-on-node)
					/* eslint-enable max-len */
				}
				cached = [].concat(cached);
				if (cached[i]) { unload(cached[i]); }
			}
		}
		// release memory if nodes is an array. This check should fail if nodes
		// is a NodeList (see loop above)
		if (nodes.length) {
			nodes.length = 0;
		}
	}

	function unload(cached) {
		if (cached.configContext && isFunction(cached.configContext.onunload)) {
			cached.configContext.onunload();
			cached.configContext.onunload = null;
		}
		if (cached.controllers) {
			forEach(cached.controllers, function (controller) {
				if (isFunction(controller.onunload)) {
					controller.onunload({preventDefault: noop});
				}
			});
		}
		if (cached.children) {
			if (isArray(cached.children)) { forEach(cached.children, unload); }
			else if (cached.children.tag) { unload(cached.children); }
		}
	}

	function appendTextFragment(parentElement, data) {
		try {
			parentElement.appendChild(
				$document.createRange().createContextualFragment(data));
		} catch (e) {
			parentElement.insertAdjacentHTML("beforeend", data);
			replaceScriptNodes(parentElement);
		}
	}

	// Replace script tags inside given DOM element with executable ones.
	// Will also check children recursively and replace any found script
	// tags in same manner.
	function replaceScriptNodes(node) {
		if (node.tagName === "SCRIPT") {
			node.parentNode.replaceChild(buildExecutableNode(node), node);
		} else {
			var children = node.childNodes;
			if (children && children.length) {
				for (var i = 0; i < children.length; i++) {
					replaceScriptNodes(children[i]);
				}
			}
		}

		return node
	}

	// Replace script element with one whose contents are executable.
	function buildExecutableNode(node){
		var scriptEl = document.createElement("script");
		var attrs = node.attributes;

		for (var i = 0; i < attrs.length; i++) {
			scriptEl.setAttribute(attrs[i].name, attrs[i].value);
		}

		scriptEl.text = node.innerHTML;
		return scriptEl
	}

	function injectHTML(parentElement, index, data) {
		var nextSibling = parentElement.childNodes[index];
		if (nextSibling) {
			var isElement = nextSibling.nodeType !== 1;
			var placeholder = $document.createElement("span");
			if (isElement) {
				parentElement.insertBefore(placeholder, nextSibling || null);
				placeholder.insertAdjacentHTML("beforebegin", data);
				parentElement.removeChild(placeholder);
			} else {
				nextSibling.insertAdjacentHTML("beforebegin", data);
			}
		} else {
			appendTextFragment(parentElement, data);
		}

		var nodes = [];

		while (parentElement.childNodes[index] !== nextSibling) {
			nodes.push(parentElement.childNodes[index]);
			index++;
		}

		return nodes
	}

	function autoredraw(callback, object) {
		return function (e) {
			e = e || event;
			m.redraw.strategy("diff");
			m.startComputation();
			try {
				return callback.call(object, e)
			} finally {
				endFirstComputation();
			}
		}
	}

	var html;
	var documentNode = {
		appendChild: function (node) {
			if (html === undefined) { html = $document.createElement("html"); }
			if ($document.documentElement &&
					$document.documentElement !== node) {
				$document.replaceChild(node, $document.documentElement);
			} else {
				$document.appendChild(node);
			}

			this.childNodes = $document.childNodes;
		},

		insertBefore: function (node) {
			this.appendChild(node);
		},

		childNodes: []
	};

	var nodeCache = [];
	var cellCache = {};

	m.render = function (root, cell, forceRecreation) {
		if (!root) {
			throw new Error("Ensure the DOM element being passed to " +
				"m.route/m.mount/m.render is not undefined.")
		}
		var configs = [];
		var id = getCellCacheKey(root);
		var isDocumentRoot = root === $document;
		var node;

		if (isDocumentRoot || root === $document.documentElement) {
			node = documentNode;
		} else {
			node = root;
		}

		if (isDocumentRoot && cell.tag !== "html") {
			cell = {tag: "html", attrs: {}, children: cell};
		}

		if (cellCache[id] === undefined) { clear(node.childNodes); }
		if (forceRecreation === true) { reset(root); }

		cellCache[id] = build(
			node,
			null,
			undefined,
			undefined,
			cell,
			cellCache[id],
			false,
			0,
			null,
			undefined,
			configs);

		forEach(configs, function (config) { config(); });
	};

	function getCellCacheKey(element) {
		var index = nodeCache.indexOf(element);
		return index < 0 ? nodeCache.push(element) - 1 : index
	}

	m.trust = function (value) {
		value = new String(value); // eslint-disable-line no-new-wrappers
		value.$trusted = true;
		return value
	};

	function gettersetter(store) {
		function prop() {
			if (arguments.length) { store = arguments[0]; }
			return store
		}

		prop.toJSON = function () {
			return store
		};

		return prop
	}

	m.prop = function (store) {
		if ((store != null && (isObject(store) || isFunction(store)) || ((typeof Promise !== "undefined") && (store instanceof Promise))) &&
				isFunction(store.then)) {
			return propify(store)
		}

		return gettersetter(store)
	};

	var roots = [];
	var components = [];
	var controllers = [];
	var lastRedrawId = null;
	var lastRedrawCallTime = 0;
	var computePreRedrawHook = null;
	var computePostRedrawHook = null;
	var topComponent;
	var FRAME_BUDGET = 16; // 60 frames per second = 1 call per 16 ms

	function parameterize(component, args) {
		function controller() {
			/* eslint-disable no-invalid-this */
			return (component.controller || noop).apply(this, args) || this
			/* eslint-enable no-invalid-this */
		}

		if (component.controller) {
			controller.prototype = component.controller.prototype;
		}

		function view(ctrl) {
			var arguments$1 = arguments;

			var currentArgs = [ctrl].concat(args);
			for (var i = 1; i < arguments.length; i++) {
				currentArgs.push(arguments$1[i]);
			}

			return component.view.apply(component, currentArgs)
		}

		view.$original = component.view;
		var output = {controller: controller, view: view};
		if (args[0] && args[0].key != null) { output.attrs = {key: args[0].key}; }
		return output
	}

	m.component = function (component) {
		var arguments$1 = arguments;

		var args = new Array(arguments.length - 1);

		for (var i = 1; i < arguments.length; i++) {
			args[i - 1] = arguments$1[i];
		}

		return parameterize(component, args)
	};

	function checkPrevented(component, root, index, isPrevented) {
		if (!isPrevented) {
			m.redraw.strategy("all");
			m.startComputation();
			roots[index] = root;
			var currentComponent;

			if (component) {
				currentComponent = topComponent = component;
			} else {
				currentComponent = topComponent = component = {controller: noop};
			}

			var controller = new (component.controller || noop)();

			// controllers may call m.mount recursively (via m.route redirects,
			// for example)
			// this conditional ensures only the last recursive m.mount call is
			// applied
			if (currentComponent === topComponent) {
				controllers[index] = controller;
				components[index] = component;
			}
			endFirstComputation();
			if (component === null) {
				removeRootElement(root, index);
			}
			return controllers[index]
		} else if (component == null) {
			removeRootElement(root, index);
		}
	}

	m.mount = m.module = function (root, component) {
		if (!root) {
			throw new Error("Please ensure the DOM element exists before " +
				"rendering a template into it.")
		}

		var index = roots.indexOf(root);
		if (index < 0) { index = roots.length; }

		var isPrevented = false;
		var event = {
			preventDefault: function () {
				isPrevented = true;
				computePreRedrawHook = computePostRedrawHook = null;
			}
		};

		forEach(unloaders, function (unloader) {
			unloader.handler.call(unloader.controller, event);
			unloader.controller.onunload = null;
		});

		if (isPrevented) {
			forEach(unloaders, function (unloader) {
				unloader.controller.onunload = unloader.handler;
			});
		} else {
			unloaders = [];
		}

		if (controllers[index] && isFunction(controllers[index].onunload)) {
			controllers[index].onunload(event);
		}

		return checkPrevented(component, root, index, isPrevented)
	};

	function removeRootElement(root, index) {
		roots.splice(index, 1);
		controllers.splice(index, 1);
		components.splice(index, 1);
		reset(root);
		nodeCache.splice(getCellCacheKey(root), 1);
	}

	var redrawing = false;
	m.redraw = function (force) {
		if (redrawing) { return }
		redrawing = true;
		if (force) { forcing = true; }

		try {
			// lastRedrawId is a positive number if a second redraw is requested
			// before the next animation frame
			// lastRedrawId is null if it's the first redraw and not an event
			// handler
			if (lastRedrawId && !force) {
				// when setTimeout: only reschedule redraw if time between now
				// and previous redraw is bigger than a frame, otherwise keep
				// currently scheduled timeout
				// when rAF: always reschedule redraw
				if ($requestAnimationFrame === global.requestAnimationFrame ||
						new Date() - lastRedrawCallTime > FRAME_BUDGET) {
					if (lastRedrawId > 0) { $cancelAnimationFrame(lastRedrawId); }
					lastRedrawId = $requestAnimationFrame(redraw, FRAME_BUDGET);
				}
			} else {
				redraw();
				lastRedrawId = $requestAnimationFrame(function () {
					lastRedrawId = null;
				}, FRAME_BUDGET);
			}
		} finally {
			redrawing = forcing = false;
		}
	};

	m.redraw.strategy = m.prop();
	function redraw() {
		if (computePreRedrawHook) {
			computePreRedrawHook();
			computePreRedrawHook = null;
		}
		forEach(roots, function (root, i) {
			var component = components[i];
			if (controllers[i]) {
				var args = [controllers[i]];
				m.render(root,
					component.view ? component.view(controllers[i], args) : "");
			}
		});
		// after rendering within a routed context, we need to scroll back to
		// the top, and fetch the document title for history.pushState
		if (computePostRedrawHook) {
			computePostRedrawHook();
			computePostRedrawHook = null;
		}
		lastRedrawId = null;
		lastRedrawCallTime = new Date();
		m.redraw.strategy("diff");
	}

	function endFirstComputation() {
		if (m.redraw.strategy() === "none") {
			pendingRequests--;
			m.redraw.strategy("diff");
		} else {
			m.endComputation();
		}
	}

	m.withAttr = function (prop, withAttrCallback, callbackThis) {
		return function (e) {
			e = e || window.event;
			/* eslint-disable no-invalid-this */
			var currentTarget = e.currentTarget || this;
			var _this = callbackThis || this;
			/* eslint-enable no-invalid-this */
			var target = prop in currentTarget ?
				currentTarget[prop] :
				currentTarget.getAttribute(prop);
			withAttrCallback.call(_this, target);
		}
	};

	// routing
	var modes = {pathname: "", hash: "#", search: "?"};
	var redirect = noop;
	var isDefaultRoute = false;
	var routeParams, currentRoute;

	m.route = function (root, arg1, arg2, vdom) { // eslint-disable-line
		// m.route()
		if (arguments.length === 0) { return currentRoute }
		// m.route(el, defaultRoute, routes)
		if (arguments.length === 3 && isString(arg1)) {
			redirect = function (source) {
				var path = currentRoute = normalizeRoute(source);
				if (!routeByValue(root, arg2, path)) {
					if (isDefaultRoute) {
						throw new Error("Ensure the default route matches " +
							"one of the routes defined in m.route")
					}

					isDefaultRoute = true;
					m.route(arg1, true);
					isDefaultRoute = false;
				}
			};

			var listener = m.route.mode === "hash" ?
				"onhashchange" :
				"onpopstate";

			global[listener] = function () {
				var path = $location[m.route.mode];
				if (m.route.mode === "pathname") { path += $location.search; }
				if (currentRoute !== normalizeRoute(path)) { redirect(path); }
			};

			computePreRedrawHook = setScroll;
			global[listener]();

			return
		}

		// config: m.route
		if (root.addEventListener || root.attachEvent) {
			var base = m.route.mode !== "pathname" ? $location.pathname : "";
			root.href = base + modes[m.route.mode] + vdom.attrs.href;
			if (root.addEventListener) {
				root.removeEventListener("click", routeUnobtrusive);
				root.addEventListener("click", routeUnobtrusive);
			} else {
				root.detachEvent("onclick", routeUnobtrusive);
				root.attachEvent("onclick", routeUnobtrusive);
			}

			return
		}
		// m.route(route, params, shouldReplaceHistoryEntry)
		if (isString(root)) {
			var oldRoute = currentRoute;
			currentRoute = root;

			var args = arg1 || {};
			var queryIndex = currentRoute.indexOf("?");
			var params;

			if (queryIndex > -1) {
				params = parseQueryString(currentRoute.slice(queryIndex + 1));
			} else {
				params = {};
			}

			for (var i in args) {
				if (hasOwn.call(args, i)) {
					params[i] = args[i];
				}
			}

			var querystring = buildQueryString(params);
			var currentPath;

			if (queryIndex > -1) {
				currentPath = currentRoute.slice(0, queryIndex);
			} else {
				currentPath = currentRoute;
			}

			if (querystring) {
				currentRoute = currentPath +
					(currentPath.indexOf("?") === -1 ? "?" : "&") +
					querystring;
			}

			var replaceHistory =
				(arguments.length === 3 ? arg2 : arg1) === true ||
				oldRoute === root;

			if (global.history.pushState) {
				var method = replaceHistory ? "replaceState" : "pushState";
				computePreRedrawHook = setScroll;
				computePostRedrawHook = function () {
					try {
						global.history[method](null, $document.title,
							modes[m.route.mode] + currentRoute);
					} catch (err) {
						// In the event of a pushState or replaceState failure,
						// fallback to a standard redirect. This is specifically
						// to address a Safari security error when attempting to
						// call pushState more than 100 times.
						$location[m.route.mode] = currentRoute;
					}
				};
				redirect(modes[m.route.mode] + currentRoute);
			} else {
				$location[m.route.mode] = currentRoute;
				redirect(modes[m.route.mode] + currentRoute);
			}
		}
	};

	m.route.param = function (key) {
		if (!routeParams) {
			throw new Error("You must call m.route(element, defaultRoute, " +
				"routes) before calling m.route.param()")
		}

		if (!key) {
			return routeParams
		}

		return routeParams[key]
	};

	m.route.mode = "search";

	function normalizeRoute(route) {
		return route.slice(modes[m.route.mode].length)
	}

	function routeByValue(root, router, path) {
		routeParams = {};

		var queryStart = path.indexOf("?");
		if (queryStart !== -1) {
			routeParams = parseQueryString(
				path.substr(queryStart + 1, path.length));
			path = path.substr(0, queryStart);
		}

		// Get all routes and check if there's
		// an exact match for the current path
		var keys = Object.keys(router);
		var index = keys.indexOf(path);

		if (index !== -1){
			m.mount(root, router[keys [index]]);
			return true
		}

		for (var route in router) {
			if (hasOwn.call(router, route)) {
				if (route === path) {
					m.mount(root, router[route]);
					return true
				}

				var matcher = new RegExp("^" + route
					.replace(/:[^\/]+?\.{3}/g, "(.*?)")
					.replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$");

				if (matcher.test(path)) {
					/* eslint-disable no-loop-func */
					path.replace(matcher, function () {
						var keys = route.match(/:[^\/]+/g) || [];
						var values = [].slice.call(arguments, 1, -2);
						forEach(keys, function (key, i) {
							routeParams[key.replace(/:|\./g, "")] =
								decodeURIComponent(values[i]);
						});
						m.mount(root, router[route]);
					});
					/* eslint-enable no-loop-func */
					return true
				}
			}
		}
	}

	function routeUnobtrusive(e) {
		e = e || event;
		if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) { return }

		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}

		var currentTarget = e.currentTarget || e.srcElement;
		var args;

		if (m.route.mode === "pathname" && currentTarget.search) {
			args = parseQueryString(currentTarget.search.slice(1));
		} else {
			args = {};
		}

		while (currentTarget && !/a/i.test(currentTarget.nodeName)) {
			currentTarget = currentTarget.parentNode;
		}

		// clear pendingRequests because we want an immediate route change
		pendingRequests = 0;
		m.route(currentTarget[m.route.mode]
			.slice(modes[m.route.mode].length), args);
	}

	function setScroll() {
		if (m.route.mode !== "hash" && $location.hash) {
			$location.hash = $location.hash;
		} else {
			global.scrollTo(0, 0);
		}
	}

	function buildQueryString(object, prefix) {
		var duplicates = {};
		var str = [];

		for (var prop in object) {
			if (hasOwn.call(object, prop)) {
				var key = prefix ? prefix + "[" + prop + "]" : prop;
				var value = object[prop];

				if (value === null) {
					str.push(encodeURIComponent(key));
				} else if (isObject(value)) {
					str.push(buildQueryString(value, key));
				} else if (isArray(value)) {
					var keys = [];
					duplicates[key] = duplicates[key] || {};
					/* eslint-disable no-loop-func */
					forEach(value, function (item) {
						/* eslint-enable no-loop-func */
						if (!duplicates[key][item]) {
							duplicates[key][item] = true;
							keys.push(encodeURIComponent(key) + "=" +
								encodeURIComponent(item));
						}
					});
					str.push(keys.join("&"));
				} else if (value !== undefined) {
					str.push(encodeURIComponent(key) + "=" +
						encodeURIComponent(value));
				}
			}
		}

		return str.join("&")
	}

	function parseQueryString(str) {
		if (str === "" || str == null) { return {} }
		if (str.charAt(0) === "?") { str = str.slice(1); }

		var pairs = str.split("&");
		var params = {};

		forEach(pairs, function (string) {
			var pair = string.split("=");
			var key = decodeURIComponent(pair[0]);
			var value = pair.length === 2 ? decodeURIComponent(pair[1]) : null;
			if (params[key] != null) {
				if (!isArray(params[key])) { params[key] = [params[key]]; }
				params[key].push(value);
			}
			else { params[key] = value; }
		});

		return params
	}

	m.route.buildQueryString = buildQueryString;
	m.route.parseQueryString = parseQueryString;

	function reset(root) {
		var cacheKey = getCellCacheKey(root);
		clear(root.childNodes, cellCache[cacheKey]);
		cellCache[cacheKey] = undefined;
	}

	m.deferred = function () {
		var deferred = new Deferred();
		deferred.promise = propify(deferred.promise);
		return deferred
	};

	function propify(promise, initialValue) {
		var prop = m.prop(initialValue);
		promise.then(prop);
		prop.then = function (resolve, reject) {
			return propify(promise.then(resolve, reject), initialValue)
		};

		prop.catch = prop.then.bind(null, null);
		return prop
	}
	// Promiz.mithril.js | Zolmeister | MIT
	// a modified version of Promiz.js, which does not conform to Promises/A+
	// for two reasons:
	//
	// 1) `then` callbacks are called synchronously (because setTimeout is too
	//    slow, and the setImmediate polyfill is too big
	//
	// 2) throwing subclasses of Error cause the error to be bubbled up instead
	//    of triggering rejection (because the spec does not account for the
	//    important use case of default browser error handling, i.e. message w/
	//    line number)

	var RESOLVING = 1;
	var REJECTING = 2;
	var RESOLVED = 3;
	var REJECTED = 4;

	function Deferred(onSuccess, onFailure) {
		var self = this;
		var state = 0;
		var promiseValue = 0;
		var next = [];

		self.promise = {};

		self.resolve = function (value) {
			if (!state) {
				promiseValue = value;
				state = RESOLVING;

				fire();
			}

			return self
		};

		self.reject = function (value) {
			if (!state) {
				promiseValue = value;
				state = REJECTING;

				fire();
			}

			return self
		};

		self.promise.then = function (onSuccess, onFailure) {
			var deferred = new Deferred(onSuccess, onFailure);

			if (state === RESOLVED) {
				deferred.resolve(promiseValue);
			} else if (state === REJECTED) {
				deferred.reject(promiseValue);
			} else {
				next.push(deferred);
			}

			return deferred.promise
		};

		function finish(type) {
			state = type || REJECTED;
			next.map(function (deferred) {
				if (state === RESOLVED) {
					deferred.resolve(promiseValue);
				} else {
					deferred.reject(promiseValue);
				}
			});
		}

		function thennable(then, success, failure, notThennable) {
			if (((promiseValue != null && isObject(promiseValue)) ||
					isFunction(promiseValue)) && isFunction(then)) {
				try {
					// count protects against abuse calls from spec checker
					var count = 0;
					then.call(promiseValue, function (value) {
						if (count++) { return }
						promiseValue = value;
						success();
					}, function (value) {
						if (count++) { return }
						promiseValue = value;
						failure();
					});
				} catch (e) {
					m.deferred.onerror(e);
					promiseValue = e;
					failure();
				}
			} else {
				notThennable();
			}
		}

		function fire() {
			// check if it's a thenable
			var then;
			try {
				then = promiseValue && promiseValue.then;
			} catch (e) {
				m.deferred.onerror(e);
				promiseValue = e;
				state = REJECTING;
				return fire()
			}

			if (state === REJECTING) {
				m.deferred.onerror(promiseValue);
			}

			thennable(then, function () {
				state = RESOLVING;
				fire();
			}, function () {
				state = REJECTING;
				fire();
			}, function () {
				try {
					if (state === RESOLVING && isFunction(onSuccess)) {
						promiseValue = onSuccess(promiseValue);
					} else if (state === REJECTING && isFunction(onFailure)) {
						promiseValue = onFailure(promiseValue);
						state = RESOLVING;
					}
				} catch (e) {
					m.deferred.onerror(e);
					promiseValue = e;
					return finish()
				}

				if (promiseValue === self) {
					promiseValue = TypeError();
					finish();
				} else {
					thennable(then, function () {
						finish(RESOLVED);
					}, finish, function () {
						finish(state === RESOLVING && RESOLVED);
					});
				}
			});
		}
	}

	m.deferred.onerror = function (e) {
		if (type.call(e) === "[object Error]" &&
				!/ Error/.test(e.constructor.toString())) {
			pendingRequests = 0;
			throw e
		}
	};

	m.sync = function (args) {
		var deferred = m.deferred();
		var outstanding = args.length;
		var results = [];
		var method = "resolve";

		function synchronizer(pos, resolved) {
			return function (value) {
				results[pos] = value;
				if (!resolved) { method = "reject"; }
				if (--outstanding === 0) {
					deferred.promise(results);
					deferred[method](results);
				}
				return value
			}
		}

		if (args.length > 0) {
			forEach(args, function (arg, i) {
				arg.then(synchronizer(i, true), synchronizer(i, false));
			});
		} else {
			deferred.resolve([]);
		}

		return deferred.promise
	};

	function identity(value) { return value }

	function handleJsonp(options) {
		var callbackKey = options.callbackName || "mithril_callback_" +
			new Date().getTime() + "_" +
			(Math.round(Math.random() * 1e16)).toString(36);

		var script = $document.createElement("script");

		global[callbackKey] = function (resp) {
			script.parentNode.removeChild(script);
			options.onload({
				type: "load",
				target: {
					responseText: resp
				}
			});
			global[callbackKey] = undefined;
		};

		script.onerror = function () {
			script.parentNode.removeChild(script);

			options.onerror({
				type: "error",
				target: {
					status: 500,
					responseText: JSON.stringify({
						error: "Error making jsonp request"
					})
				}
			});
			global[callbackKey] = undefined;

			return false
		};

		script.onload = function () {
			return false
		};

		script.src = options.url +
			(options.url.indexOf("?") > 0 ? "&" : "?") +
			(options.callbackKey ? options.callbackKey : "callback") +
			"=" + callbackKey +
			"&" + buildQueryString(options.data || {});

		$document.body.appendChild(script);
	}

	function createXhr(options) {
		var xhr = new global.XMLHttpRequest();
		xhr.open(options.method, options.url, true, options.user,
			options.password);

		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status >= 200 && xhr.status < 300) {
					options.onload({type: "load", target: xhr});
				} else {
					options.onerror({type: "error", target: xhr});
				}
			}
		};

		if (options.serialize === JSON.stringify &&
				options.data &&
				options.method !== "GET") {
			xhr.setRequestHeader("Content-Type",
				"application/json; charset=utf-8");
		}

		if (options.deserialize === JSON.parse) {
			xhr.setRequestHeader("Accept", "application/json, text/*");
		}

		if (isFunction(options.config)) {
			var maybeXhr = options.config(xhr, options);
			if (maybeXhr != null) { xhr = maybeXhr; }
		}

		var data = options.method === "GET" || !options.data ? "" : options.data;

		if (data && !isString(data) && data.constructor !== global.FormData) {
			throw new Error("Request data should be either be a string or " +
				"FormData. Check the `serialize` option in `m.request`")
		}

		xhr.send(data);
		return xhr
	}

	function ajax(options) {
		if (options.dataType && options.dataType.toLowerCase() === "jsonp") {
			return handleJsonp(options)
		} else {
			return createXhr(options)
		}
	}

	function bindData(options, data, serialize) {
		if (options.method === "GET" && options.dataType !== "jsonp") {
			var prefix = options.url.indexOf("?") < 0 ? "?" : "&";
			var querystring = buildQueryString(data);
			options.url += (querystring ? prefix + querystring : "");
		} else {
			options.data = serialize(data);
		}
	}

	function parameterizeUrl(url, data) {
		if (data) {
			url = url.replace(/:[a-z]\w+/gi, function (token){
				var key = token.slice(1);
				var value = data[key] || token;
				delete data[key];
				return value
			});
		}
		return url
	}

	m.request = function (options) {
		if (options.background !== true) { m.startComputation(); }
		var deferred = new Deferred();
		var isJSONP = options.dataType &&
			options.dataType.toLowerCase() === "jsonp";

		var serialize, deserialize, extract;

		if (isJSONP) {
			serialize = options.serialize =
			deserialize = options.deserialize = identity;

			extract = function (jsonp) { return jsonp.responseText };
		} else {
			serialize = options.serialize = options.serialize || JSON.stringify;

			deserialize = options.deserialize =
				options.deserialize || JSON.parse;
			extract = options.extract || function (xhr) {
				if (xhr.responseText.length || deserialize !== JSON.parse) {
					return xhr.responseText
				} else {
					return null
				}
			};
		}

		options.method = (options.method || "GET").toUpperCase();
		options.url = parameterizeUrl(options.url, options.data);
		bindData(options, options.data, serialize);
		options.onload = options.onerror = function (ev) {
			try {
				ev = ev || event;
				var response = deserialize(extract(ev.target, options));
				if (ev.type === "load") {
					if (options.unwrapSuccess) {
						response = options.unwrapSuccess(response, ev.target);
					}

					if (isArray(response) && options.type) {
						forEach(response, function (res, i) {
							response[i] = new options.type(res);
						});
					} else if (options.type) {
						response = new options.type(response);
					}

					deferred.resolve(response);
				} else {
					if (options.unwrapError) {
						response = options.unwrapError(response, ev.target);
					}

					deferred.reject(response);
				}
			} catch (e) {
				deferred.reject(e);
				m.deferred.onerror(e);
			} finally {
				if (options.background !== true) { m.endComputation(); }
			}
		};

		ajax(options);
		deferred.promise = propify(deferred.promise, options.initialValue);
		return deferred.promise
	};

	return m
}); // eslint-disable-line
});

/* global m */


/* Removed from v2.0.0, pass M or use global m */
// import m from 'mithril'

var type = {}.toString;

function isObject(object) {
	return type.call(object) === "[object Object]"
}

function isString(object) {
	return type.call(object) === "[object String]"
}

function bindM (M) {
  M = M || m;
  if (!M) { throw new Error('cannot find mithril, make sure you have `m` available in this scope.') }

  var mapClass = function (cssobjResult, attrs) {
    if(!isObject(attrs)) { return }
    var classAttr = 'class' in attrs ? 'class' : 'className';
    var classObj = attrs[classAttr];
    if (classObj)
      { attrs[classAttr] = cssobjResult.mapClass(classObj); }
  };

  return function(cssobjResult) {
    var c = function (tag, pairs) {
      var arguments$1 = arguments;

      var args = [];

      for (var i = 1, length = arguments.length; i < length; i++) {
        args[i - 1] = arguments$1[i];
      }

      if(isObject(tag)) { return M.apply(null, [tag].concat(args)) }

		  if (!isString(tag)) {
			  throw new Error("selector in m(selector, attrs, children) should " +
				                "be a string")
		  }

      mapClass(cssobjResult, pairs);
      return M.apply( null, [cssobjResult.mapSel(tag)].concat(args) )
    };

    c.old = M;

    for(var i in M) {
      c[i] = M[i];
    }

    c.result = cssobjResult;

    return c
  }

}

var cssobjMithril_cjs$1 = bindM;

/*
  cssobj v0.7.3
  Sat Nov 12 2016 15:54:29 GMT+0800 (HKT)
  commit a4a2c991e3ed3f3c9ebbfdcbd5d3908184a20a72

  https://github.com/cssobj/cssobj
  Released under the MIT License.

  Components version info:
  - cssobj-core@0.7.1
    1a6d428bb1a5b2efaf4b7dab2bc5491c6c6b9fd1
  - cssobj-plugin-cssom@2.2.0
    f594da8a58f04fcfeb43f0bc551cbe9c725593dd
  - cssobj-plugin-localize@3.0.0
    fcb1546c1ba81821bed252880079f04cea1a6cfe
*/

// helper functions for cssobj

// check n is numeric, or string of numeric
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

function own(o, k) {
  return {}.hasOwnProperty.call(o, k)
}

// set default option (not deeply)
function defaults(options, defaultOption) {
  options = options || {};
  for (var i in defaultOption) {
    if (own(defaultOption, i) && !(i in options)) { options[i] = defaultOption[i]; }
  }
  return options
}

// convert js prop into css prop (dashified)
function dashify(str) {
  return str.replace(/[A-Z]/g, function(m) {
    return '-' + m.toLowerCase()
  })
}

// capitalize str
function capitalize (str) {
  return str.charAt(0).toUpperCase() + str.substr(1)
}

// repeat str for num times


// don't use String.prototype.trim in cssobj, using below instead


// random string, should used across all cssobj plugins
var random = (function () {
  var count = 0;
  return function (prefix) {
    count++;
    return '_' + (prefix||'') + Math.floor(Math.random() * Math.pow(2, 32)).toString(36) + count + '_'
  }
})();

// extend obj from source, if it's no key in obj, create one
function extendObj (obj, key, source) {
  obj[key] = obj[key] || {};
  for(var args = arguments, i = 2; i < args.length; i++) {
    source = args[i];
    for (var k in source)
      { if (own(source, k)) { obj[key][k] = source[k]; } }
  }
  return obj[key]
}

// ensure obj[k] as array, then push v into it
function arrayKV (obj, k, v, reverse, unique) {
  obj[k] = k in obj ? [].concat(obj[k]) : [];
  if(unique && obj[k].indexOf(v)>-1) { return }
  reverse ? obj[k].unshift(v) : obj[k].push(v);
}

// replace find in str, with rep function result
function strSugar (str, find, rep) {
  return str.replace(
    new RegExp('\\\\?(' + find + ')', 'g'),
    function (m, z) {
      return m == z ? rep(z) : z
    }
  )
}

// get parents array from node (when it's passed the test)
function getParents (node, test, key, childrenKey, parentKey) {
  var p = node, path = [];
  while(p) {
    if (test(p)) {
      if(childrenKey) { path.forEach(function(v) {
        arrayKV(p, childrenKey, v, false, true);
      }); }
      if(path[0] && parentKey){
        path[0][parentKey] = p;
      }
      path.unshift(p);
    }
    p = p.parent;
  }
  return path.map(function(p){return key?p[key]:p })
}

// split selector etc. aware of css attributes
function splitComma (str) {
  for (var c, i = 0, n = 0, prev = 0, d = []; c = str.charAt(i); i++) {
    if (c == '(' || c == '[') { n++; }
    if (c == ')' || c == ']') { n--; }
    if (!n && c == ',') { d.push(str.substring(prev, i)), prev = i + 1; }
  }
  return d.concat(str.substring(prev))
}

// checking for valid css value
function isValidCSSValue (val) {
  // falsy: '', NaN, Infinity, [], {}
  return typeof val=='string' && val || typeof val=='number' && isFinite(val)
}

// using var as iteral to help optimize
var KEY_ID = '$id';
var KEY_ORDER = '$order';
var KEY_TEST = '$test';

var TYPE_GROUP = 'group';

// helper function
var keys = Object.keys;

// type check helpers
var type$1 = {}.toString;
var ARRAY = type$1.call([]);
var OBJECT = type$1.call({});

// only array, object now treated as iterable
function isIterable (v) {
  return type$1.call(v) == OBJECT || type$1.call(v) == ARRAY
}

// check if it's function
function isFunction (v) {
  return typeof v == 'function'
}

// regexp constants
// @page rule: CSSOM:
//   IE returned: not implemented error
//   FF, Chrome actually is not groupRule(not cssRules), same as @font-face rule
//   https://developer.mozilla.org/en-US/docs/Web/API/CSSGroupingRule
//   CSSPageRule is listed as derived from CSSGroupingRule, but not implemented yet.
//   Here added @page as GroupRule, but plugin should take care of this.
var reGroupRule = /^@(media|document|supports|page|[\w-]*keyframes)/i;
var reAtRule = /^\s*@/i;

/**
 * convert simple Object into node data
 *
 input data format:
 {"a":{"b":{"c":{"":[{color:1}]}}}, "abc":123, '@import':[2,3,4], '@media (min-width:320px)':{ d:{ok:1} }}
 *        1. every key is folder node
 *        2. "":[{rule1}, {rule2}] will split into several rules
 *        3. & will replaced by parent, \\& will escape
 *        4. all prop should be in dom.style camelCase
 *
 * @param {object|array} d - simple object data, or array
 * @param {object} result - the reulst object to store options and root node
 * @param {object} [previousNode] - also act as parent for next node
 * @param {boolean} init whether it's the root call
 * @returns {object} node data object
 */
function parseObj (d, result, node, init) {
  if (init) {
    result.nodes = [];
    result.ref = {};
    if (node) { result.diff = {}; }
  }

  node = node || {};

  node.obj = d;

  if (type$1.call(d) == ARRAY) {
    var nodes = [];
    /* for array type, each children have a parent that not on the virtual tree,
       see test case of @media-array for example, the array node obj=Array, but have node.selPart(no selText)
       So have to set the right node.at/node.type from the node.key, to get right selText for children */
    node.at = reAtRule.exec(node.key);
    for(var i = 0; i < d.length; i++) {
      var prev = node[i];
      var n = parseObj(d[i], result, node[i] || {parent: node, src: d, parentNode: nodes, index: i});
      if(result.diff && prev!=n) { arrayKV(result.diff, n ? 'added' : 'removed', n||prev); }
      nodes.push(n);
    }
    return nodes
  } else {
    // it's no need to check (type.call(d) == OBJECT)
    // isIterable will filter only ARRAY/OBJECT
    // other types will goto parseProp function
    var prevVal = node.prevVal = node.lastVal;
    // at first stage check $test
    if (KEY_TEST in d) {
      var test = isFunction(d[KEY_TEST]) ? d[KEY_TEST](!node.disabled, node, result) : d[KEY_TEST];
      // if test false, remove node completely
      // if it's return function, going to stage 2 where all prop rendered
      if(!test) {
        return
      }
      node.test = test;
    }
    var children = node.children = node.children || {};
    node.lastVal = {};
    node.rawVal = {};
    node.prop = {};
    node.diff = {};
    if (d[KEY_ID]) { result.ref[d[KEY_ID]] = node; }
    var order = d[KEY_ORDER] | 0;
    var funcArr = [];

    var processObj = function (obj, k, nodeObj) {
      var haveOldChild = k in children;
      var newNode = extendObj(children, k, nodeObj);
      // don't overwrite selPart for previous node
      newNode.selPart = newNode.selPart || splitComma(k);
      var n = parseObj(obj, result, newNode);
      if(n) { children[k] = n; }
      // it's new added node
      if (prevVal) { !haveOldChild
        ? n && arrayKV(result.diff, 'added', n)
        : !n && arrayKV(result.diff, 'removed', children[k]); }
      // for first time check, remove from parent (no diff)
      if(!n) { delete nodeObj.parent.children[k]; }
    };

    // only there's no selText, getSel
    if(!('selText' in node)) { getSel(node, result); }

    for (var k in d) {
      // here $key start with $ is special
      // k.charAt(0) == '$' ... but the core will calc it into node.
      // Plugins should take $ with care and mark as a special case. e.g. ignore it
      if (!own(d, k)) { continue }
      if (!isIterable(d[k]) || type$1.call(d[k]) == ARRAY && !isIterable(d[k][0])) {

        // it's inline at-rule: @import etc.
        if (k.charAt(0)=='@') {
          processObj(
            // map @import: [a,b,c] into {a:1, b:1, c:1}
            [].concat(d[k]).reduce(function(prev, cur) {
              prev[cur] = ';';
              return prev
            }, {}), k, {parent: node, src: d, key: k, inline:true});
          continue
        }

        var r = function (_k) {
          // skip $test key
          if(_k != KEY_TEST) { parseProp(node, d, _k, result); }
        };
        order
          ? funcArr.push([r, k])
          : r(k);
      } else {
        processObj(d[k], k, {parent: node, src: d, key: k});
      }
    }

    // when it's second time visit node
    if (prevVal) {
      // children removed
      for (k in children) {
        if (!(k in d)) {
          arrayKV(result.diff, 'removed', children[k]);
          delete children[k];
        }
      }

      // prop changed
      var diffProp = function () {
        var newKeys = keys(node.lastVal);
        var removed = keys(prevVal).filter(function (x) { return newKeys.indexOf(x) < 0 });
        if (removed.length) { node.diff.removed = removed; }
        if (keys(node.diff).length) { arrayKV(result.diff, 'changed', node); }
      };
      order
        ? funcArr.push([diffProp, null])
        : diffProp();
    }

    if (order) { arrayKV(result, '_order', {order: order, func: funcArr}); }
    result.nodes.push(node);
    return node
  }

}

function getSel(node, result) {

  var opt = result.options;

  // array index don't have key,
  // fetch parent key as ruleNode
  var ruleNode = getParents(node, function (v) {
    return v.key
  }).pop();

  node.parentRule = getParents(node.parent, function (n) {
    return n.type == TYPE_GROUP
  }).pop() || null;

  if (ruleNode) {
    var isMedia, sel = ruleNode.key;
    var groupRule = sel.match(reGroupRule);
    if (groupRule) {
      node.type = TYPE_GROUP;
      node.at = groupRule.pop();
      isMedia = node.at == 'media';

      // only media allow nested and join, and have node.selPart
      if (isMedia) { node.selPart = splitComma(sel.replace(reGroupRule, '')); }

      // combinePath is array, 'str' + array instead of array.join(',')
      node.groupText = isMedia
        ? '@' + node.at + combinePath(getParents(node, function (v) {
          return v.type == TYPE_GROUP
        }, 'selPart', 'selChild', 'selParent'), '', ' and')
      : sel;

      node.selText = getParents(node, function (v) {
        return v.selText && !v.at
      }, 'selText').pop() || '';
    } else if (reAtRule.test(sel)) {
      node.type = 'at';
      node.selText = sel;
    } else {
      node.selText = '' + combinePath(getParents(ruleNode, function (v) {
        return v.selPart && !v.at
      }, 'selPart', 'selChild', 'selParent'), '', ' ', true), opt;
    }

    node.selText = applyPlugins(opt, 'selector', node.selText, node, result);
    if (node.selText) { node.selTextPart = splitComma(node.selText); }

    if (node !== ruleNode) { node.ruleNode = ruleNode; }
  }

}

/**
 * Parse property of object d's key, with propKey as a candidate key name
 * @param {} node: v-node of cssobj
 * @param {} d: source object
 * @param {} key: any numeric will be ignored, then converted to string
 * @param {} result: cssobj result object
 * @param {} propKey: candidate prop key name

 Accept only key as string, numeric will be ignored

 color: function(){return ['red', 'blue']} will expand
 color: function(){return {fontSize: '12px', float:'right'}} will be replaced

 */
function parseProp (node, d, key, result, propKey) {
  var prevVal = node.prevVal;
  var lastVal = node.lastVal;

  // the prop name get from object key or candidate key
  var propName = isNumeric(key) ? propKey : key;

  // NEXT: propName can be changed by user
  // now it's not used, since propName ensure exists
  // corner case: propKey==='' ?? below line will do wrong!!
  // if(!propName) return

  var prev = prevVal && prevVal[propName];

  ![].concat(d[key]).forEach(function (v) {
    // pass lastVal if it's function
    var rawVal = isFunction(v)
      ? v(prev, node, result)
      : v;

    var val = applyPlugins(result.options, 'value', rawVal, propName, node, result, propKey);

    // check and merge only format as Object || Array of Object, other format not accepted!
    if (isIterable(val)) {
      for (var k in val) {
        if (own(val, k)) { parseProp(node, val, k, result, propName); }
      }
    } else {
      arrayKV(
        node.rawVal,
        propName,
        rawVal,
        true
      );
      if (isValidCSSValue(val)) {
        // only valid val can enter node.prop and lastVal
        // push every val to prop
        arrayKV(
          node.prop,
          propName,
          val,
          true
        );
        prev = lastVal[propName] = val;
      }
    }
  });
  if (prevVal) {
    if (!(propName in prevVal)) {
      arrayKV(node.diff, 'added', propName);
    } else if (prevVal[propName] != lastVal[propName]) {
      arrayKV(node.diff, 'changed', propName);
    }
  }
}

function combinePath (array, initialString, seperator, replaceAmpersand) {
  return !array.length ? initialString : array[0].reduce(function (result, value) {
    var str = initialString ? initialString + seperator : initialString;
    if (replaceAmpersand) {
      var isReplace = false;
      var sugar = strSugar(value, '&', function (z) {
        isReplace = true;
        return initialString
      });
      str = isReplace ? sugar : str + sugar;
    } else {
      str += value;
    }
    return result.concat(combinePath(array.slice(1), str, seperator, replaceAmpersand))
  }, [])
}

function applyPlugins (opt, type) {
  var args = [].slice.call(arguments, 2);
  var plugin = opt.plugins;
  // plugin is always Array, so here we don't check it
  return [].concat(plugin).reduce(
    function (pre, plugin) { return plugin[type] ? plugin[type].apply(null, [pre].concat(args)) : pre },
    args.shift()
  )
}

function applyOrder (opt) {
  if (!opt._order) { return }
  opt._order
    .sort(function (a, b) {
      return a.order - b.order
    })
    .forEach(function (v) {
      v.func.forEach(function (f) {
        f[0](f[1]);
      });
    });
  delete opt._order;
}

function cssobj$2 (options) {

  options = defaults(options, {
    plugins: [],
    intros: []
  });

  return function (initObj, initState) {
    var updater = function (obj, state) {
      if (arguments.length>1) { result.state = state || {}; }
      if (obj) { result.obj = isFunction(obj) ? obj() : obj; }
      result.root = parseObj(extendObj({}, '', result.intro, result.obj), result, result.root, true);
      applyOrder(result);
      result = applyPlugins(options, 'post', result);
      isFunction(options.onUpdate) && options.onUpdate(result);
      return result
    };

    var result = {
      intro: {},
      update: updater,
      options: options
    };

    ![].concat(options.intros).forEach(
      function(v) {
        extendObj(result, 'intro', isFunction(v) ? v(result) : v);
      }
    );

    updater(initObj, initState);

    return result
  }
}

// plugin for cssobj

function createDOM (rootDoc, id, option) {
  var el = rootDoc.getElementById(id);
  var head = rootDoc.getElementsByTagName('head')[0];
  if(el) {
    if(option.append) { return el }
    el.parentNode && el.parentNode.removeChild(el);
  }
  el = rootDoc.createElement('style');
  head.appendChild(el);
  el.setAttribute('id', id);
  if (option.attrs)
    { for (var i in option.attrs) {
      el.setAttribute(i, option.attrs[i]);
    } }
  return el
}

var addCSSRule = function (parent, selector, body, node) {
  var isImportRule = /@import/i.test(node.selText);
  var rules = parent.cssRules || parent.rules;
  var index=0;

  var omArr = [];
  var str = node.inline
      ? body.map(function(v) {
        return [node.selText, ' ', v]
      })
      : [[selector, '{', body.join(''), '}']];

  str.forEach(function(text) {
    if (parent.cssRules) {
      try {
        index = isImportRule ? 0 : rules.length;
        parent.appendRule
          ? parent.appendRule(text.join(''))  // keyframes.appendRule return undefined
          : parent.insertRule(text.join(''), index); //firefox <16 also return undefined...

        omArr.push(rules[index]);

      } catch(e) {
        // modern browser with prefix check, now only -webkit-
        // http://shouldiprefix.com/#animations
        // if(selector && selector.indexOf('@keyframes')==0) for(var ret, i = 0, len = cssPrefixes.length; i < len; i++) {
        //   ret = addCSSRule(parent, selector.replace('@keyframes', '@-'+cssPrefixes[i].toLowerCase()+'-keyframes'), body, node)
        //   if(ret.length) return ret
        // }
        // the rule is not supported, fail silently
        // console.log(e, selector, body, pos)
      }
    } else if (parent.addRule) {
      // https://msdn.microsoft.com/en-us/library/hh781508(v=vs.85).aspx
      // only supported @rule will accept: @import
      // old IE addRule don't support 'dd,dl' form, add one by one
      // selector normally is node.selTextPart, but have to be array type
      ![].concat(selector).forEach(function (sel) {
        try {
          // remove ALL @-rule support for old IE
          if(isImportRule) {
            index = parent.addImport(text[2]);
            omArr.push(parent.imports[index]);

            // IE addPageRule() return: not implemented!!!!
            // } else if (/@page/.test(sel)) {
            //   index = parent.addPageRule(sel, text[2], -1)
            //   omArr.push(rules[rules.length-1])

          } else if (!/^\s*@/.test(sel)) {
            parent.addRule(sel, text[2], rules.length);
            // old IE have bug: addRule will always return -1!!!
            omArr.push(rules[rules.length-1]);
          }
        } catch(e) {
          // console.log(e, selector, body)
        }
      });
    }
  });

  return omArr
};

function getBodyCss (node) {
  // get cssText from prop
  var prop = node.prop;
  return Object.keys(prop).map(function (k) {
    // skip $prop, e.g. $id, $order
    if(k.charAt(0)=='$') { return '' }
    for (var v, ret='', i = prop[k].length; i--;) {
      v = prop[k][i];

      // value expand & merge should be done as value function/plugin in cssobj-core >=0.5.0
      ret += node.inline ? k : dashify(prefixProp(k, true)) + ':' + v + ';';
    }
    return ret
  })
}

// vendor prefix support
// borrowed from jQuery 1.12
var cssPrefixes = [ "Webkit", "Moz", "ms", "O" ];
var cssPrefixesReg = new RegExp('^(?:' + cssPrefixes.join('|') + ')[A-Z]');
var emptyStyle = document.createElement( "div" ).style;
var testProp  = function (list) {
  for(var i = list.length; i--;) {
    if(list[i] in emptyStyle) { return list[i] }
  }
};

//
/**
 * cache cssProps
 * the value is JS format, will be used:
 * 1. diff & patch properties for CSSOM
 * 2. vendorPrefix property name checking
 */
var cssProps = {
  // normalize float css property
  'float': testProp(['styleFloat', 'cssFloat', 'float'])
};


// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

  // shortcut for names that are not vendor prefixed
  // when name already have '-' as first char, don't prefix
  if ( name in emptyStyle || name.charAt(0) == '-') { return }

  // check for vendor prefixed names
  var preName, capName = capitalize(name);
  var i = cssPrefixes.length;

  while ( i-- ) {
    preName = cssPrefixes[ i ] + capName;
    if ( preName in emptyStyle ) { return preName }
  }
}

// apply prop to get right vendor prefix
// inCSS false=camelcase; true=dashed
function prefixProp (name, inCSS) {
  // $prop will skip
  if(name.charAt(0)=='$') { return '' }
  // find name and cache the name for next time use
  var retName = cssProps[ name ] ||
      ( cssProps[ name ] = vendorPropName( name ) || name);
  return inCSS   // if hasPrefix in prop
      ? cssPrefixesReg.test(retName) ? capitalize(retName) : name=='float' && name || retName  // fix float in CSS, avoid return cssFloat
      : retName
}

/**
 * Get value and important flag from value str
 * @param {CSSStyleRule} rule css style rule object
 * @param {string} prop prop to set
 * @param {string} val value string
 */
function setCSSProperty (styleObj, prop, val) {
  var value;
  var important = /^(.*)!(important)\s*$/i.exec(val);
  var propCamel = prefixProp(prop);
  var propDash = prefixProp(prop, true);
  if(important) {
    value = important[1];
    important = important[2];
    if(styleObj.setProperty) { styleObj.setProperty(propDash, value, important); }
    else {
      // for old IE, cssText is writable, and below is valid for contain !important
      // don't use styleObj.setAttribute since it's not set important
      // should do: delete styleObj[propCamel], but not affect result

      // only work on <= IE8: s.style['FONT-SIZE'] = '12px!important'
      styleObj[propDash.toUpperCase()] = val;
      // refresh cssText, the whole rule!
      styleObj.cssText = styleObj.cssText;
    }
  } else {
    styleObj[propCamel] = val;
  }
}

function cssobj_plugin_post_cssom (option) {
  option = option || {};

  // prefixes array can change the global default vendor prefixes
  if(option.vendors) { cssPrefixes = option.vendors; }

  var id = option.id || 'cssobj' + random();

  var frame = option.frame;
  var rootDoc = frame ? frame.contentDocument||frame.contentWindow.document : document;
  var dom = createDOM(rootDoc, id, option);
  var sheet = dom.sheet || dom.styleSheet;

  // sheet.insertRule ("@import url('test.css');", 0)  // it's ok to insert @import, but only at top
  // sheet.insertRule ("@charset 'UTF-8';", 0)  // throw SyntaxError https://www.w3.org/Bugs/Public/show_bug.cgi?id=22207

  // IE has a bug, first comma rule not work! insert a dummy here
  // addCSSRule(sheet, 'html,body', [], {})

  // helper regexp & function
  // @page in FF not allowed pseudo @page :first{}, with SyntaxError: An invalid or illegal string was specified
  var reWholeRule = /page/i;
  var atomGroupRule = function (node) {
    return !node ? false : reWholeRule.test(node.at) || node.parentRule && reWholeRule.test(node.parentRule.at)
  };

  var getParent = function (node) {
    var p = 'omGroup' in node ? node : node.parentRule;
    return p && p.omGroup || sheet
  };

  var validParent = function (node) {
    return !node.parentRule || node.parentRule.omGroup !== null
  };

  var removeOneRule = function (rule) {
    if (!rule) { return }
    var parent = rule.parentRule || sheet;
    var rules = parent.cssRules || parent.rules;
    var removeFunc = function (v, i) {
      if((v===rule)) {
        parent.deleteRule
          ? parent.deleteRule(rule.keyText || i)
          : parent.removeRule(i);
        return true
      }
    };
    // sheet.imports have bugs in IE:
    // > sheet.removeImport(0)  it's work, then again
    // > sheet.removeImport(0)  it's not work!!!
    //
    // parent.imports && [].some.call(parent.imports, removeFunc)
    ![].some.call(rules, removeFunc);
  };

  function removeNode (node) {
    // remove mediaStore for old IE
    var groupIdx = mediaStore.indexOf(node);
    if (groupIdx > -1) {
      // before remove from mediaStore
      // don't forget to remove all children, by a walk
      node.mediaEnabled = false;
      walk(node);
      mediaStore.splice(groupIdx, 1);
    }
    // remove Group rule and Nomal rule
    ![node.omGroup].concat(node.omRule).forEach(removeOneRule);
  }

  // helper function for addNormalrule
  var addNormalRule = function (node, selText, cssText) {
    if(!cssText) { return }
    // get parent to add
    var parent = getParent(node);
    if (validParent(node))
      { return node.omRule = addCSSRule(parent, selText, cssText, node) }
    else if (node.parentRule) {
      // for old IE not support @media, check mediaEnabled, add child nodes
      if (node.parentRule.mediaEnabled) {
        if (!node.omRule) { return node.omRule = addCSSRule(parent, selText, cssText, node) }
      }else if (node.omRule) {
        node.omRule.forEach(removeOneRule);
        delete node.omRule;
      }
    }
  };

  var mediaStore = [];

  var checkMediaList = function () {
    mediaStore.forEach(function (v) {
      v.mediaEnabled = v.mediaTest(rootDoc);
      walk(v);
    });
  };

  if (window.attachEvent) {
    window.attachEvent('onresize', checkMediaList);
  } else if (window.addEventListener) {
    window.addEventListener('resize', checkMediaList, true);
  }

  var walk = function (node, store) {
    if (!node) { return }

    // cssobj generate vanilla Array, it's safe to use constructor, fast
    if (node.constructor === Array) { return node.map(function (v) {walk(v, store);}) }

    // skip $key node
    if(node.key && node.key.charAt(0)=='$' || !node.prop) { return }

    // nested media rule will pending proceed
    if(node.at=='media' && node.selParent && node.selParent.postArr) {
      return node.selParent.postArr.push(node)
    }

    node.postArr = [];
    var children = node.children;
    var isGroup = node.type == 'group';

    if (atomGroupRule(node)) { store = store || []; }

    if (isGroup) {
      // if it's not @page, @keyframes (which is not groupRule in fact)
      if (!atomGroupRule(node)) {
        var reAdd = 'omGroup' in node;
        if (node.at=='media' && option.noMedia) { node.omGroup = null; }
        else { [''].concat(cssPrefixes).some(function (v) {
          return node.omGroup = addCSSRule(
            // all groupRule will be added to root sheet
            sheet,
            '@' + (v ? '-' + v.toLowerCase() + '-' : v) + node.groupText.slice(1), [], node
          ).pop() || null
        }); }


        // when add media rule failed, build test function then check on window.resize
        if (node.at == 'media' && !reAdd && !node.omGroup) {
          // build test function from @media rule
          var mediaTest = new Function('doc',
            'return ' + node.groupText
              .replace(/@media\s*/i, '')
              .replace(/min-width:/ig, '>=')
              .replace(/max-width:/ig, '<=')
              .replace(/(px)?\s*\)/ig, ')')
              .replace(/\band\b/ig, '&&')
              .replace(/,/g, '||')
              .replace(/\(/g, '(doc.documentElement.offsetWidth')
          );

          try {
            // first test if it's valid function
            var mediaEnabled = mediaTest(rootDoc);
            node.mediaTest = mediaTest;
            node.mediaEnabled = mediaEnabled;
            mediaStore.push(node);
          } catch(e) {}
        }
      }
    }

    var selText = node.selTextPart;
    var cssText = getBodyCss(node);

    // it's normal css rule
    if (cssText.join('')) {
      if (!atomGroupRule(node)) {
        addNormalRule(node, selText, cssText);
      }
      store && store.push(selText ? selText + ' {' + cssText.join('') + '}' : cssText);
    }

    for (var c in children) {
      // empty key will pending proceed
      if (c === '') { node.postArr.push(children[c]); }
      else { walk(children[c], store); }
    }

    if (isGroup) {
      // if it's @page, @keyframes
      if (atomGroupRule(node) && validParent(node)) {
        addNormalRule(node, node.groupText, store);
        store = null;
      }
    }

    // media rules need a stand alone block
    var postArr = node.postArr;
    delete node.postArr;
    postArr.map(function (v) {
      walk(v, store);
    });
  };

  return {
    post: function (result) {
      result.cssdom = dom;
      if (!result.diff) {
        // it's first time render
        walk(result.root);
      } else {
        // it's not first time, patch the diff result to CSSOM
        var diff = result.diff;

        // node added
        if (diff.added) { diff.added.forEach(function (node) {
          walk(node);
        }); }

        // node removed
        if (diff.removed) { diff.removed.forEach(function (node) {
          // also remove all child group & sel
          node.selChild && node.selChild.forEach(removeNode);
          removeNode(node);
        }); }

        // node changed, find which part should be patched
        if (diff.changed) { diff.changed.forEach(function (node) {
          var om = node.omRule;
          var diff = node.diff;

          if (!om) { om = addNormalRule(node, node.selTextPart, getBodyCss(node)); }

          // added have same action as changed, can be merged... just for clarity
          diff.added && diff.added.forEach(function (v) {
            v && om && om.forEach(function (rule) {
              try{
                setCSSProperty(rule.style, v, node.prop[v][0]);
              }catch(e){}
            });
          });

          diff.changed && diff.changed.forEach(function (v) {
            v && om && om.forEach(function (rule) {
              try{
                setCSSProperty(rule.style, v, node.prop[v][0]);
              }catch(e){}
            });
          });

          diff.removed && diff.removed.forEach(function (v) {
            var prefixV = prefixProp(v);
            prefixV && om && om.forEach(function (rule) {
              try{
                rule.style.removeProperty
                  ? rule.style.removeProperty(prefixV)
                  : rule.style.removeAttribute(prefixV);
              }catch(e){}
            });
          });
        }); }
      }

      return result
    }
  }
}

// cssobj plugin

function cssobj_plugin_selector_localize(option) {

  option = option || {};

  var space = option.space = typeof option.space!=='string' ? random() : option.space;

  var localNames = option.localNames = option.localNames || {};

  var parseSel = function(str) {
    var store=[], ast=[], lastAst, match;
    for(var c, n, i=0, len=str.length; i<len; i++) {
      c=str[i];
      lastAst = ast[0];
      if(lastAst!=='\'' && lastAst!=='"') {
        // not in string
        if(!lastAst && c===':' && str.substr(i+1, 7)==='global(') {
          ast.unshift('g');
          i+=7;
          continue
        }
        if(~ '[(\'"'.indexOf(c)) { ast.unshift(c); }
        if(~ '])'.indexOf(c)) {
          if(c==')' && lastAst=='g') { c=''; }
          ast.shift(c);
        }
        if(!lastAst && c==='.') {
          i++;
          if(str[i]!=='!') {
            match = [];
            while( (n=str[i]) &&
                   (n>='0'&&n<='9'||n>='a'&&n<='z'||n>='A'&&n<='Z'||n=='-'||n=='_'||n>='\u00a0'))
              { match.push(str[i++]); }
            if(match.length) {
              n = match.join('');
              c += n in localNames
                ? localNames[n]
                : n + space;
            }
            i--;
          }
        }
      } else {
        if(c===lastAst) { ast.shift(); }
      }
      store.push(c);
    }
    return store.join('')
  };

  var mapClass = function(str) {
    return parseSel(str.replace(/\s+\.?/g, '.').replace(/^([^:\s.])/i, '.$1')).replace(/\./g, ' ')
  };

  return {
    selector: function localizeName (sel, node, result) {
      // don't touch at rule's selText
      // it's copied from parent, which already localized
      if(node.at) { return sel }
      if(!result.mapSel) { result.mapSel = parseSel, result.mapClass = mapClass; }
      return parseSel(sel)
    }
  }
}

// cssobj is simply an intergration for cssobj-core, cssom

function cssobj (obj, option, initData) {
  option = option||{};

  var local = option.local;
  option.local = !local
    ? {space:''}
  : local && typeof local==='object' ? local : {};

  option.plugins = [].concat(
    option.plugins||[],
    cssobj_plugin_selector_localize(option.local),
    cssobj_plugin_post_cssom(option.cssom)
  );

  return cssobj$2(option)(obj, initData)
}

cssobj.version = '0.7.3';

var cssobj_cjs$1 = cssobj;

// better type check
var is = function (t, v) { return {}.toString.call(v) === '[object ' + t + ']' };
var own$1 = function (o, k) { return {}.hasOwnProperty.call(o, k) };

function isIterable$1 (v) {
  return is('Object', v) || is('Array', v) || is('Map', v)
}

function isPrimitive (val) {
  return !/obj|func/.test(typeof val) || !val
}

function deepIt (a, b, callback, path) {
  path = path || [];
  if (isPrimitive(b)) { return a }
  for ( var key in b) {
    if (!own$1(b, key)) { continue }
    callback(a, b, key, path, key in a);
    if (isIterable$1(b[key]) && isIterable$1(a[key])) {
      deepIt(a[key], b[key], callback, path.concat(key));
    }
  }
  return a
}

function get(obj, p, errNotFound) {
  var n = obj;
  for(var i = 0, len = p.length; i < len; i++) {
    if(!isIterable$1(n) || !(p[i] in n))
      { return errNotFound ? new Error('NotFound') : undefined }
    n = n[p[i]];
  }
  return n
}

function invert (obj) {
  var newObj={};
  deepIt(newObj, obj, function(a,b,key) {
    if(isPrimitive(b[key])) { a[b[key]] = key; }
  });
  return newObj
}

function assign () {
  var arg = arguments, last;
  for(var i=arg.length; i--;) {
    last = deepIt(arg[i], last, function (a, b, key, path) {
      a[key] = b[key];
    });
  }
  return last
}

function merge () {
  var arg = arguments, last;
  for(var i=arg.length; i--;) {
    last = deepIt(arg[i], last, function (a, b, key, path, inA) {
      if(!inA || isPrimitive(b[key])) { a[key] = b[key]; }
    });
  }
  return last
}

/** Usage: _exlucde(obj, {x:{y:2, z:3} } ) will delete x.y,x.z on obj
 *  when isSet, will set value to a instead of delete
 */
// _exclude( {a:1,b:{d:{ c:2} } }, { b:{d:{ c:1} } } )
function exclude (x, y, isSet) {
  return deepIt(x, y, function (a, b, key) {
    if (isPrimitive(b[key])) {
      isSet
        ? (key in a ? a[key] = b[key] : '')
      : b[key] && delete a[key];
    }
  })
}

function pick(obj, props) {
  var o={};
  return deepIt(o, props, function(a,b,key,path){
    var c = get(obj,path.concat(key));
    if(!b[key]) { return }
    if(!isPrimitive(c)) { a[key] = is('Array', c) ? [] : {}; }
    if(isPrimitive(b[key])) { a[key] = c; }
  })
}

function defaults$1(obj, option) {
  obj = obj || {};
  return deepIt(obj, option, function(a,b,key){
    if(!(key in a)) { a[key]=b[key]; }
  })
}

var is_1 = is;
var own_1 = own$1;
var isIterable_1 = isIterable$1;
var isPrimitive_1 = isPrimitive;
var deepIt_1 = deepIt;
var get_1 = get;
var invert_1 = invert;
var assign_1 = assign;
var extend = assign;
var merge_1 = merge;
var exclude_1 = exclude;
var pick_1 = pick;
var defaults_1 = defaults$1;

var objutil_cjs = {
	is: is_1,
	own: own_1,
	isIterable: isIterable_1,
	isPrimitive: isPrimitive_1,
	deepIt: deepIt_1,
	get: get_1,
	invert: invert_1,
	assign: assign_1,
	extend: extend,
	merge: merge_1,
	exclude: exclude_1,
	pick: pick_1,
	defaults: defaults_1
};

var css = {
  '.input': {
    position: 'relative',
    input: {
      boxSizing: 'border-box',
      width: '100%',
      paddingRight: '15px'
    }
  },
  '.clear': {
    position: 'absolute',
    width: '15px',
    top: 0,
    right: 0,
    color: 'gray',
    textDecoration: 'none',
    textAlign: 'center',
    '&:hover':{
      color: 'black'
    }
  }
};

var m$1 = cssobjMithril_cjs$1(mithril$1)(cssobj_cjs$1(
  css,
  {
    local: true
  }
));

var mSearch = {
  controller: function controller(options) {
    var arguments$1 = arguments;

    var ctrl = this;
    ctrl.options = options = objutil_cjs.defaults(options, {
      clearChar: '×',
      outer: {},
      input: {},
      clear: {
        onclick: function (e) {
          var input = e.target.previousSibling;
          input.value = '';
          input.focus();
          if(typeof options.onclear=='function'){
            options.onclear(e);
          }
        }
      }
    });
    var oldConfig = options.input.config;
    options.input.config = function (el, old, ctx, node) {
      if(old) { return }
      if(typeof oldConfig=='function') {
        oldConfig.apply(node, arguments$1);
      }
      var style = el.nextSibling.style;
      if('width' in style) {
        el.style.paddingRight = style.width;
      }
    };
  },
  view: function view(ctrl) {
    var options = ctrl.options;
    return m$1(
      '.input',
      options.outer,
      [
        m$1('input', options.input),
        m$1('a.clear[href=javascript:;]', options.clear, options.clearChar)
      ]
    )
  }
};

mithril$1.mount(test, mithril$1(mSearch, {
  outer: {
    config: function (e, old, context, node) {console.log(this ,node);},
    style: {width: '100px'}
  },
  clear: {
    style: {width: '10px'}
  },
  clearChar: 'x',
  onclear: function (v){ return console.log('content cleared'); }
}));

}());
