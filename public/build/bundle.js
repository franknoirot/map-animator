
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector(compare) {
      if (compare.length === 1) compare = ascendingComparator(compare);
      return {
        left: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) < 0) lo = mid + 1;
            else hi = mid;
          }
          return lo;
        },
        right: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) > 0) hi = mid;
            else lo = mid + 1;
          }
          return lo;
        }
      };
    }

    function ascendingComparator(f) {
      return function(d, x) {
        return ascending(f(d), x);
      };
    }

    var ascendingBisect = bisector(ascending);

    function merge(arrays) {
      var n = arrays.length,
          m,
          i = -1,
          j = 0,
          merged,
          array;

      while (++i < n) j += arrays[i].length;
      merged = new Array(j);

      while (--n >= 0) {
        array = arrays[n];
        m = array.length;
        while (--m >= 0) {
          merged[--j] = array[m];
        }
      }

      return merged;
    }

    var noop$1 = {value: function() {}};

    function dispatch() {
      for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
        if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
        _[t] = [];
      }
      return new Dispatch(_);
    }

    function Dispatch(_) {
      this._ = _;
    }

    function parseTypenames(typenames, types) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
        return {type: t, name: name};
      });
    }

    Dispatch.prototype = dispatch.prototype = {
      constructor: Dispatch,
      on: function(typename, callback) {
        var _ = this._,
            T = parseTypenames(typename + "", _),
            t,
            i = -1,
            n = T.length;

        // If no callback was specified, return the callback of the given type and name.
        if (arguments.length < 2) {
          while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
          return;
        }

        // If a type was specified, set the callback for the given type and name.
        // Otherwise, if a null callback was specified, remove callbacks of the given name.
        if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
        while (++i < n) {
          if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
          else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
        }

        return this;
      },
      copy: function() {
        var copy = {}, _ = this._;
        for (var t in _) copy[t] = _[t].slice();
        return new Dispatch(copy);
      },
      call: function(type, that) {
        if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      },
      apply: function(type, that, args) {
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      }
    };

    function get(type, name) {
      for (var i = 0, n = type.length, c; i < n; ++i) {
        if ((c = type[i]).name === name) {
          return c.value;
        }
      }
    }

    function set(type, name, callback) {
      for (var i = 0, n = type.length; i < n; ++i) {
        if (type[i].name === name) {
          type[i] = noop$1, type = type.slice(0, i).concat(type.slice(i + 1));
          break;
        }
      }
      if (callback != null) type.push({name: name, value: callback});
      return type;
    }

    var xhtml = "http://www.w3.org/1999/xhtml";

    var namespaces = {
      svg: "http://www.w3.org/2000/svg",
      xhtml: xhtml,
      xlink: "http://www.w3.org/1999/xlink",
      xml: "http://www.w3.org/XML/1998/namespace",
      xmlns: "http://www.w3.org/2000/xmlns/"
    };

    function namespace(name) {
      var prefix = name += "", i = prefix.indexOf(":");
      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
      return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
    }

    function creatorInherit(name) {
      return function() {
        var document = this.ownerDocument,
            uri = this.namespaceURI;
        return uri === xhtml && document.documentElement.namespaceURI === xhtml
            ? document.createElement(name)
            : document.createElementNS(uri, name);
      };
    }

    function creatorFixed(fullname) {
      return function() {
        return this.ownerDocument.createElementNS(fullname.space, fullname.local);
      };
    }

    function creator(name) {
      var fullname = namespace(name);
      return (fullname.local
          ? creatorFixed
          : creatorInherit)(fullname);
    }

    function none() {}

    function selector(selector) {
      return selector == null ? none : function() {
        return this.querySelector(selector);
      };
    }

    function selection_select(select) {
      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
          }
        }
      }

      return new Selection(subgroups, this._parents);
    }

    function empty$1() {
      return [];
    }

    function selectorAll(selector) {
      return selector == null ? empty$1 : function() {
        return this.querySelectorAll(selector);
      };
    }

    function selection_selectAll(select) {
      if (typeof select !== "function") select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            subgroups.push(select.call(node, node.__data__, i, group));
            parents.push(node);
          }
        }
      }

      return new Selection(subgroups, parents);
    }

    function matcher(selector) {
      return function() {
        return this.matches(selector);
      };
    }

    function selection_filter(match) {
      if (typeof match !== "function") match = matcher(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Selection(subgroups, this._parents);
    }

    function sparse(update) {
      return new Array(update.length);
    }

    function selection_enter() {
      return new Selection(this._enter || this._groups.map(sparse), this._parents);
    }

    function EnterNode(parent, datum) {
      this.ownerDocument = parent.ownerDocument;
      this.namespaceURI = parent.namespaceURI;
      this._next = null;
      this._parent = parent;
      this.__data__ = datum;
    }

    EnterNode.prototype = {
      constructor: EnterNode,
      appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
      insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
      querySelector: function(selector) { return this._parent.querySelector(selector); },
      querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
    };

    function constant(x) {
      return function() {
        return x;
      };
    }

    var keyPrefix = "$"; // Protect against keys like “__proto__”.

    function bindIndex(parent, group, enter, update, exit, data) {
      var i = 0,
          node,
          groupLength = group.length,
          dataLength = data.length;

      // Put any non-null nodes that fit into update.
      // Put any null nodes into enter.
      // Put any remaining data into enter.
      for (; i < dataLength; ++i) {
        if (node = group[i]) {
          node.__data__ = data[i];
          update[i] = node;
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Put any non-null nodes that don’t fit into exit.
      for (; i < groupLength; ++i) {
        if (node = group[i]) {
          exit[i] = node;
        }
      }
    }

    function bindKey(parent, group, enter, update, exit, data, key) {
      var i,
          node,
          nodeByKeyValue = {},
          groupLength = group.length,
          dataLength = data.length,
          keyValues = new Array(groupLength),
          keyValue;

      // Compute the key for each node.
      // If multiple nodes have the same key, the duplicates are added to exit.
      for (i = 0; i < groupLength; ++i) {
        if (node = group[i]) {
          keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
          if (keyValue in nodeByKeyValue) {
            exit[i] = node;
          } else {
            nodeByKeyValue[keyValue] = node;
          }
        }
      }

      // Compute the key for each datum.
      // If there a node associated with this key, join and add it to update.
      // If there is not (or the key is a duplicate), add it to enter.
      for (i = 0; i < dataLength; ++i) {
        keyValue = keyPrefix + key.call(parent, data[i], i, data);
        if (node = nodeByKeyValue[keyValue]) {
          update[i] = node;
          node.__data__ = data[i];
          nodeByKeyValue[keyValue] = null;
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Add any remaining nodes that were not bound to data to exit.
      for (i = 0; i < groupLength; ++i) {
        if ((node = group[i]) && (nodeByKeyValue[keyValues[i]] === node)) {
          exit[i] = node;
        }
      }
    }

    function selection_data(value, key) {
      if (!value) {
        data = new Array(this.size()), j = -1;
        this.each(function(d) { data[++j] = d; });
        return data;
      }

      var bind = key ? bindKey : bindIndex,
          parents = this._parents,
          groups = this._groups;

      if (typeof value !== "function") value = constant(value);

      for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
        var parent = parents[j],
            group = groups[j],
            groupLength = group.length,
            data = value.call(parent, parent && parent.__data__, j, parents),
            dataLength = data.length,
            enterGroup = enter[j] = new Array(dataLength),
            updateGroup = update[j] = new Array(dataLength),
            exitGroup = exit[j] = new Array(groupLength);

        bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

        // Now connect the enter nodes to their following update node, such that
        // appendChild can insert the materialized enter node before this node,
        // rather than at the end of the parent node.
        for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
          if (previous = enterGroup[i0]) {
            if (i0 >= i1) i1 = i0 + 1;
            while (!(next = updateGroup[i1]) && ++i1 < dataLength);
            previous._next = next || null;
          }
        }
      }

      update = new Selection(update, parents);
      update._enter = enter;
      update._exit = exit;
      return update;
    }

    function selection_exit() {
      return new Selection(this._exit || this._groups.map(sparse), this._parents);
    }

    function selection_join(onenter, onupdate, onexit) {
      var enter = this.enter(), update = this, exit = this.exit();
      enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
      if (onupdate != null) update = onupdate(update);
      if (onexit == null) exit.remove(); else onexit(exit);
      return enter && update ? enter.merge(update).order() : update;
    }

    function selection_merge(selection) {

      for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Selection(merges, this._parents);
    }

    function selection_order() {

      for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
        for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
          if (node = group[i]) {
            if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
            next = node;
          }
        }
      }

      return this;
    }

    function selection_sort(compare) {
      if (!compare) compare = ascending$1;

      function compareNode(a, b) {
        return a && b ? compare(a.__data__, b.__data__) : !a - !b;
      }

      for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            sortgroup[i] = node;
          }
        }
        sortgroup.sort(compareNode);
      }

      return new Selection(sortgroups, this._parents).order();
    }

    function ascending$1(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function selection_call() {
      var callback = arguments[0];
      arguments[0] = this;
      callback.apply(null, arguments);
      return this;
    }

    function selection_nodes() {
      var nodes = new Array(this.size()), i = -1;
      this.each(function() { nodes[++i] = this; });
      return nodes;
    }

    function selection_node() {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
          var node = group[i];
          if (node) return node;
        }
      }

      return null;
    }

    function selection_size() {
      var size = 0;
      this.each(function() { ++size; });
      return size;
    }

    function selection_empty() {
      return !this.node();
    }

    function selection_each(callback) {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
          if (node = group[i]) callback.call(node, node.__data__, i, group);
        }
      }

      return this;
    }

    function attrRemove(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant(name, value) {
      return function() {
        this.setAttribute(name, value);
      };
    }

    function attrConstantNS(fullname, value) {
      return function() {
        this.setAttributeNS(fullname.space, fullname.local, value);
      };
    }

    function attrFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttribute(name);
        else this.setAttribute(name, v);
      };
    }

    function attrFunctionNS(fullname, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
        else this.setAttributeNS(fullname.space, fullname.local, v);
      };
    }

    function selection_attr(name, value) {
      var fullname = namespace(name);

      if (arguments.length < 2) {
        var node = this.node();
        return fullname.local
            ? node.getAttributeNS(fullname.space, fullname.local)
            : node.getAttribute(fullname);
      }

      return this.each((value == null
          ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
          ? (fullname.local ? attrFunctionNS : attrFunction)
          : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
    }

    function defaultView(node) {
      return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
          || (node.document && node) // node is a Window
          || node.defaultView; // node is a Document
    }

    function styleRemove(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant(name, value, priority) {
      return function() {
        this.style.setProperty(name, value, priority);
      };
    }

    function styleFunction(name, value, priority) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.style.removeProperty(name);
        else this.style.setProperty(name, v, priority);
      };
    }

    function selection_style(name, value, priority) {
      return arguments.length > 1
          ? this.each((value == null
                ? styleRemove : typeof value === "function"
                ? styleFunction
                : styleConstant)(name, value, priority == null ? "" : priority))
          : styleValue(this.node(), name);
    }

    function styleValue(node, name) {
      return node.style.getPropertyValue(name)
          || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
    }

    function propertyRemove(name) {
      return function() {
        delete this[name];
      };
    }

    function propertyConstant(name, value) {
      return function() {
        this[name] = value;
      };
    }

    function propertyFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) delete this[name];
        else this[name] = v;
      };
    }

    function selection_property(name, value) {
      return arguments.length > 1
          ? this.each((value == null
              ? propertyRemove : typeof value === "function"
              ? propertyFunction
              : propertyConstant)(name, value))
          : this.node()[name];
    }

    function classArray(string) {
      return string.trim().split(/^|\s+/);
    }

    function classList(node) {
      return node.classList || new ClassList(node);
    }

    function ClassList(node) {
      this._node = node;
      this._names = classArray(node.getAttribute("class") || "");
    }

    ClassList.prototype = {
      add: function(name) {
        var i = this._names.indexOf(name);
        if (i < 0) {
          this._names.push(name);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      remove: function(name) {
        var i = this._names.indexOf(name);
        if (i >= 0) {
          this._names.splice(i, 1);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      contains: function(name) {
        return this._names.indexOf(name) >= 0;
      }
    };

    function classedAdd(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.add(names[i]);
    }

    function classedRemove(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.remove(names[i]);
    }

    function classedTrue(names) {
      return function() {
        classedAdd(this, names);
      };
    }

    function classedFalse(names) {
      return function() {
        classedRemove(this, names);
      };
    }

    function classedFunction(names, value) {
      return function() {
        (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
      };
    }

    function selection_classed(name, value) {
      var names = classArray(name + "");

      if (arguments.length < 2) {
        var list = classList(this.node()), i = -1, n = names.length;
        while (++i < n) if (!list.contains(names[i])) return false;
        return true;
      }

      return this.each((typeof value === "function"
          ? classedFunction : value
          ? classedTrue
          : classedFalse)(names, value));
    }

    function textRemove() {
      this.textContent = "";
    }

    function textConstant(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.textContent = v == null ? "" : v;
      };
    }

    function selection_text(value) {
      return arguments.length
          ? this.each(value == null
              ? textRemove : (typeof value === "function"
              ? textFunction
              : textConstant)(value))
          : this.node().textContent;
    }

    function htmlRemove() {
      this.innerHTML = "";
    }

    function htmlConstant(value) {
      return function() {
        this.innerHTML = value;
      };
    }

    function htmlFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.innerHTML = v == null ? "" : v;
      };
    }

    function selection_html(value) {
      return arguments.length
          ? this.each(value == null
              ? htmlRemove : (typeof value === "function"
              ? htmlFunction
              : htmlConstant)(value))
          : this.node().innerHTML;
    }

    function raise() {
      if (this.nextSibling) this.parentNode.appendChild(this);
    }

    function selection_raise() {
      return this.each(raise);
    }

    function lower() {
      if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
    }

    function selection_lower() {
      return this.each(lower);
    }

    function selection_append(name) {
      var create = typeof name === "function" ? name : creator(name);
      return this.select(function() {
        return this.appendChild(create.apply(this, arguments));
      });
    }

    function constantNull() {
      return null;
    }

    function selection_insert(name, before) {
      var create = typeof name === "function" ? name : creator(name),
          select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
      return this.select(function() {
        return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
      });
    }

    function remove() {
      var parent = this.parentNode;
      if (parent) parent.removeChild(this);
    }

    function selection_remove() {
      return this.each(remove);
    }

    function selection_cloneShallow() {
      var clone = this.cloneNode(false), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_cloneDeep() {
      var clone = this.cloneNode(true), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_clone(deep) {
      return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
    }

    function selection_datum(value) {
      return arguments.length
          ? this.property("__data__", value)
          : this.node().__data__;
    }

    var filterEvents = {};

    if (typeof document !== "undefined") {
      var element$1 = document.documentElement;
      if (!("onmouseenter" in element$1)) {
        filterEvents = {mouseenter: "mouseover", mouseleave: "mouseout"};
      }
    }

    function filterContextListener(listener, index, group) {
      listener = contextListener(listener, index, group);
      return function(event) {
        var related = event.relatedTarget;
        if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
          listener.call(this, event);
        }
      };
    }

    function contextListener(listener, index, group) {
      return function(event1) {
        try {
          listener.call(this, this.__data__, index, group);
        } finally {
        }
      };
    }

    function parseTypenames$1(typenames) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        return {type: t, name: name};
      });
    }

    function onRemove(typename) {
      return function() {
        var on = this.__on;
        if (!on) return;
        for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
          if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.capture);
          } else {
            on[++i] = o;
          }
        }
        if (++i) on.length = i;
        else delete this.__on;
      };
    }

    function onAdd(typename, value, capture) {
      var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
      return function(d, i, group) {
        var on = this.__on, o, listener = wrap(value, i, group);
        if (on) for (var j = 0, m = on.length; j < m; ++j) {
          if ((o = on[j]).type === typename.type && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.capture);
            this.addEventListener(o.type, o.listener = listener, o.capture = capture);
            o.value = value;
            return;
          }
        }
        this.addEventListener(typename.type, listener, capture);
        o = {type: typename.type, name: typename.name, value: value, listener: listener, capture: capture};
        if (!on) this.__on = [o];
        else on.push(o);
      };
    }

    function selection_on(typename, value, capture) {
      var typenames = parseTypenames$1(typename + ""), i, n = typenames.length, t;

      if (arguments.length < 2) {
        var on = this.node().__on;
        if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
          for (i = 0, o = on[j]; i < n; ++i) {
            if ((t = typenames[i]).type === o.type && t.name === o.name) {
              return o.value;
            }
          }
        }
        return;
      }

      on = value ? onAdd : onRemove;
      if (capture == null) capture = false;
      for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
      return this;
    }

    function dispatchEvent(node, type, params) {
      var window = defaultView(node),
          event = window.CustomEvent;

      if (typeof event === "function") {
        event = new event(type, params);
      } else {
        event = window.document.createEvent("Event");
        if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
        else event.initEvent(type, false, false);
      }

      node.dispatchEvent(event);
    }

    function dispatchConstant(type, params) {
      return function() {
        return dispatchEvent(this, type, params);
      };
    }

    function dispatchFunction(type, params) {
      return function() {
        return dispatchEvent(this, type, params.apply(this, arguments));
      };
    }

    function selection_dispatch(type, params) {
      return this.each((typeof params === "function"
          ? dispatchFunction
          : dispatchConstant)(type, params));
    }

    var root = [null];

    function Selection(groups, parents) {
      this._groups = groups;
      this._parents = parents;
    }

    function selection() {
      return new Selection([[document.documentElement]], root);
    }

    Selection.prototype = selection.prototype = {
      constructor: Selection,
      select: selection_select,
      selectAll: selection_selectAll,
      filter: selection_filter,
      data: selection_data,
      enter: selection_enter,
      exit: selection_exit,
      join: selection_join,
      merge: selection_merge,
      order: selection_order,
      sort: selection_sort,
      call: selection_call,
      nodes: selection_nodes,
      node: selection_node,
      size: selection_size,
      empty: selection_empty,
      each: selection_each,
      attr: selection_attr,
      style: selection_style,
      property: selection_property,
      classed: selection_classed,
      text: selection_text,
      html: selection_html,
      raise: selection_raise,
      lower: selection_lower,
      append: selection_append,
      insert: selection_insert,
      remove: selection_remove,
      clone: selection_clone,
      datum: selection_datum,
      on: selection_on,
      dispatch: selection_dispatch
    };

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex = /^#([0-9a-f]{3,8})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      copy: function(channels) {
        return Object.assign(new this.constructor, this, channels);
      },
      displayable: function() {
        return this.rgb().displayable();
      },
      hex: color_formatHex, // Deprecated! Use color.formatHex.
      formatHex: color_formatHex,
      formatHsl: color_formatHsl,
      formatRgb: color_formatRgb,
      toString: color_formatRgb
    });

    function color_formatHex() {
      return this.rgb().formatHex();
    }

    function color_formatHsl() {
      return hslConvert(this).formatHsl();
    }

    function color_formatRgb() {
      return this.rgb().formatRgb();
    }

    function color(format) {
      var m, l;
      format = (format + "").trim().toLowerCase();
      return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
          : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
          : l === 8 ? new Rgb(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
          : l === 4 ? new Rgb((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
          : null) // invalid hex
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (-0.5 <= this.r && this.r < 255.5)
            && (-0.5 <= this.g && this.g < 255.5)
            && (-0.5 <= this.b && this.b < 255.5)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb
    }));

    function rgb_formatHex() {
      return "#" + hex(this.r) + hex(this.g) + hex(this.b);
    }

    function rgb_formatRgb() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }

    function hex(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0));
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      formatHsl: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "hsl(" : "hsla(")
            + (this.h || 0) + ", "
            + (this.s || 0) * 100 + "%, "
            + (this.l || 0) * 100 + "%"
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    function constant$1(x) {
      return function() {
        return x;
      };
    }

    function linear(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear(a, d) : constant$1(isNaN(a) ? b : a);
    }

    var interpolateRgb = (function rgbGamma(y) {
      var color = gamma(y);

      function rgb$1(start, end) {
        var r = color((start = rgb(start)).r, (end = rgb(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$1.gamma = rgbGamma;

      return rgb$1;
    })(1);

    function interpolateNumber(a, b) {
      return a = +a, b = +b, function(t) {
        return a * (1 - t) + b * t;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function interpolateString(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    var degrees = 180 / Math.PI;

    var identity = {
      translateX: 0,
      translateY: 0,
      rotate: 0,
      skewX: 0,
      scaleX: 1,
      scaleY: 1
    };

    function decompose(a, b, c, d, e, f) {
      var scaleX, scaleY, skewX;
      if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
      if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
      if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
      if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
      return {
        translateX: e,
        translateY: f,
        rotate: Math.atan2(b, a) * degrees,
        skewX: Math.atan(skewX) * degrees,
        scaleX: scaleX,
        scaleY: scaleY
      };
    }

    var cssNode,
        cssRoot,
        cssView,
        svgNode;

    function parseCss(value) {
      if (value === "none") return identity;
      if (!cssNode) cssNode = document.createElement("DIV"), cssRoot = document.documentElement, cssView = document.defaultView;
      cssNode.style.transform = value;
      value = cssView.getComputedStyle(cssRoot.appendChild(cssNode), null).getPropertyValue("transform");
      cssRoot.removeChild(cssNode);
      value = value.slice(7, -1).split(",");
      return decompose(+value[0], +value[1], +value[2], +value[3], +value[4], +value[5]);
    }

    function parseSvg(value) {
      if (value == null) return identity;
      if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
      svgNode.setAttribute("transform", value);
      if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
      value = value.matrix;
      return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
    }

    function interpolateTransform(parse, pxComma, pxParen, degParen) {

      function pop(s) {
        return s.length ? s.pop() + " " : "";
      }

      function translate(xa, ya, xb, yb, s, q) {
        if (xa !== xb || ya !== yb) {
          var i = s.push("translate(", null, pxComma, null, pxParen);
          q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
        } else if (xb || yb) {
          s.push("translate(" + xb + pxComma + yb + pxParen);
        }
      }

      function rotate(a, b, s, q) {
        if (a !== b) {
          if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
          q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
        } else if (b) {
          s.push(pop(s) + "rotate(" + b + degParen);
        }
      }

      function skewX(a, b, s, q) {
        if (a !== b) {
          q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
        } else if (b) {
          s.push(pop(s) + "skewX(" + b + degParen);
        }
      }

      function scale(xa, ya, xb, yb, s, q) {
        if (xa !== xb || ya !== yb) {
          var i = s.push(pop(s) + "scale(", null, ",", null, ")");
          q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
        } else if (xb !== 1 || yb !== 1) {
          s.push(pop(s) + "scale(" + xb + "," + yb + ")");
        }
      }

      return function(a, b) {
        var s = [], // string constants and placeholders
            q = []; // number interpolators
        a = parse(a), b = parse(b);
        translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
        rotate(a.rotate, b.rotate, s, q);
        skewX(a.skewX, b.skewX, s, q);
        scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
        a = b = null; // gc
        return function(t) {
          var i = -1, n = q.length, o;
          while (++i < n) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        };
      };
    }

    var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
    var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

    var frame = 0, // is an animation frame pending?
        timeout = 0, // is a timeout pending?
        interval = 0, // are any timers active?
        pokeDelay = 1000, // how frequently we check for clock skew
        taskHead,
        taskTail,
        clockLast = 0,
        clockNow = 0,
        clockSkew = 0,
        clock = typeof performance === "object" && performance.now ? performance : Date,
        setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

    function now() {
      return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
    }

    function clearNow() {
      clockNow = 0;
    }

    function Timer() {
      this._call =
      this._time =
      this._next = null;
    }

    Timer.prototype = timer.prototype = {
      constructor: Timer,
      restart: function(callback, delay, time) {
        if (typeof callback !== "function") throw new TypeError("callback is not a function");
        time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
        if (!this._next && taskTail !== this) {
          if (taskTail) taskTail._next = this;
          else taskHead = this;
          taskTail = this;
        }
        this._call = callback;
        this._time = time;
        sleep();
      },
      stop: function() {
        if (this._call) {
          this._call = null;
          this._time = Infinity;
          sleep();
        }
      }
    };

    function timer(callback, delay, time) {
      var t = new Timer;
      t.restart(callback, delay, time);
      return t;
    }

    function timerFlush() {
      now(); // Get the current time, if not already set.
      ++frame; // Pretend we’ve set an alarm, if we haven’t already.
      var t = taskHead, e;
      while (t) {
        if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
        t = t._next;
      }
      --frame;
    }

    function wake() {
      clockNow = (clockLast = clock.now()) + clockSkew;
      frame = timeout = 0;
      try {
        timerFlush();
      } finally {
        frame = 0;
        nap();
        clockNow = 0;
      }
    }

    function poke() {
      var now = clock.now(), delay = now - clockLast;
      if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
    }

    function nap() {
      var t0, t1 = taskHead, t2, time = Infinity;
      while (t1) {
        if (t1._call) {
          if (time > t1._time) time = t1._time;
          t0 = t1, t1 = t1._next;
        } else {
          t2 = t1._next, t1._next = null;
          t1 = t0 ? t0._next = t2 : taskHead = t2;
        }
      }
      taskTail = t0;
      sleep(time);
    }

    function sleep(time) {
      if (frame) return; // Soonest alarm already set, or will be.
      if (timeout) timeout = clearTimeout(timeout);
      var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
      if (delay > 24) {
        if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
        if (interval) interval = clearInterval(interval);
      } else {
        if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
        frame = 1, setFrame(wake);
      }
    }

    function timeout$1(callback, delay, time) {
      var t = new Timer;
      delay = delay == null ? 0 : +delay;
      t.restart(function(elapsed) {
        t.stop();
        callback(elapsed + delay);
      }, delay, time);
      return t;
    }

    var emptyOn = dispatch("start", "end", "cancel", "interrupt");
    var emptyTween = [];

    var CREATED = 0;
    var SCHEDULED = 1;
    var STARTING = 2;
    var STARTED = 3;
    var RUNNING = 4;
    var ENDING = 5;
    var ENDED = 6;

    function schedule(node, name, id, index, group, timing) {
      var schedules = node.__transition;
      if (!schedules) node.__transition = {};
      else if (id in schedules) return;
      create(node, id, {
        name: name,
        index: index, // For context during callback.
        group: group, // For context during callback.
        on: emptyOn,
        tween: emptyTween,
        time: timing.time,
        delay: timing.delay,
        duration: timing.duration,
        ease: timing.ease,
        timer: null,
        state: CREATED
      });
    }

    function init$1(node, id) {
      var schedule = get$1(node, id);
      if (schedule.state > CREATED) throw new Error("too late; already scheduled");
      return schedule;
    }

    function set$1(node, id) {
      var schedule = get$1(node, id);
      if (schedule.state > STARTED) throw new Error("too late; already running");
      return schedule;
    }

    function get$1(node, id) {
      var schedule = node.__transition;
      if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
      return schedule;
    }

    function create(node, id, self) {
      var schedules = node.__transition,
          tween;

      // Initialize the self timer when the transition is created.
      // Note the actual delay is not known until the first callback!
      schedules[id] = self;
      self.timer = timer(schedule, 0, self.time);

      function schedule(elapsed) {
        self.state = SCHEDULED;
        self.timer.restart(start, self.delay, self.time);

        // If the elapsed delay is less than our first sleep, start immediately.
        if (self.delay <= elapsed) start(elapsed - self.delay);
      }

      function start(elapsed) {
        var i, j, n, o;

        // If the state is not SCHEDULED, then we previously errored on start.
        if (self.state !== SCHEDULED) return stop();

        for (i in schedules) {
          o = schedules[i];
          if (o.name !== self.name) continue;

          // While this element already has a starting transition during this frame,
          // defer starting an interrupting transition until that transition has a
          // chance to tick (and possibly end); see d3/d3-transition#54!
          if (o.state === STARTED) return timeout$1(start);

          // Interrupt the active transition, if any.
          if (o.state === RUNNING) {
            o.state = ENDED;
            o.timer.stop();
            o.on.call("interrupt", node, node.__data__, o.index, o.group);
            delete schedules[i];
          }

          // Cancel any pre-empted transitions.
          else if (+i < id) {
            o.state = ENDED;
            o.timer.stop();
            o.on.call("cancel", node, node.__data__, o.index, o.group);
            delete schedules[i];
          }
        }

        // Defer the first tick to end of the current frame; see d3/d3#1576.
        // Note the transition may be canceled after start and before the first tick!
        // Note this must be scheduled before the start event; see d3/d3-transition#16!
        // Assuming this is successful, subsequent callbacks go straight to tick.
        timeout$1(function() {
          if (self.state === STARTED) {
            self.state = RUNNING;
            self.timer.restart(tick, self.delay, self.time);
            tick(elapsed);
          }
        });

        // Dispatch the start event.
        // Note this must be done before the tween are initialized.
        self.state = STARTING;
        self.on.call("start", node, node.__data__, self.index, self.group);
        if (self.state !== STARTING) return; // interrupted
        self.state = STARTED;

        // Initialize the tween, deleting null tween.
        tween = new Array(n = self.tween.length);
        for (i = 0, j = -1; i < n; ++i) {
          if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
            tween[++j] = o;
          }
        }
        tween.length = j + 1;
      }

      function tick(elapsed) {
        var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
            i = -1,
            n = tween.length;

        while (++i < n) {
          tween[i].call(node, t);
        }

        // Dispatch the end event.
        if (self.state === ENDING) {
          self.on.call("end", node, node.__data__, self.index, self.group);
          stop();
        }
      }

      function stop() {
        self.state = ENDED;
        self.timer.stop();
        delete schedules[id];
        for (var i in schedules) return; // eslint-disable-line no-unused-vars
        delete node.__transition;
      }
    }

    function interrupt(node, name) {
      var schedules = node.__transition,
          schedule,
          active,
          empty = true,
          i;

      if (!schedules) return;

      name = name == null ? null : name + "";

      for (i in schedules) {
        if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
        active = schedule.state > STARTING && schedule.state < ENDING;
        schedule.state = ENDED;
        schedule.timer.stop();
        schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
        delete schedules[i];
      }

      if (empty) delete node.__transition;
    }

    function selection_interrupt(name) {
      return this.each(function() {
        interrupt(this, name);
      });
    }

    function tweenRemove(id, name) {
      var tween0, tween1;
      return function() {
        var schedule = set$1(this, id),
            tween = schedule.tween;

        // If this node shared tween with the previous node,
        // just assign the updated shared tween and we’re done!
        // Otherwise, copy-on-write.
        if (tween !== tween0) {
          tween1 = tween0 = tween;
          for (var i = 0, n = tween1.length; i < n; ++i) {
            if (tween1[i].name === name) {
              tween1 = tween1.slice();
              tween1.splice(i, 1);
              break;
            }
          }
        }

        schedule.tween = tween1;
      };
    }

    function tweenFunction(id, name, value) {
      var tween0, tween1;
      if (typeof value !== "function") throw new Error;
      return function() {
        var schedule = set$1(this, id),
            tween = schedule.tween;

        // If this node shared tween with the previous node,
        // just assign the updated shared tween and we’re done!
        // Otherwise, copy-on-write.
        if (tween !== tween0) {
          tween1 = (tween0 = tween).slice();
          for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
            if (tween1[i].name === name) {
              tween1[i] = t;
              break;
            }
          }
          if (i === n) tween1.push(t);
        }

        schedule.tween = tween1;
      };
    }

    function transition_tween(name, value) {
      var id = this._id;

      name += "";

      if (arguments.length < 2) {
        var tween = get$1(this.node(), id).tween;
        for (var i = 0, n = tween.length, t; i < n; ++i) {
          if ((t = tween[i]).name === name) {
            return t.value;
          }
        }
        return null;
      }

      return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
    }

    function tweenValue(transition, name, value) {
      var id = transition._id;

      transition.each(function() {
        var schedule = set$1(this, id);
        (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
      });

      return function(node) {
        return get$1(node, id).value[name];
      };
    }

    function interpolate(a, b) {
      var c;
      return (typeof b === "number" ? interpolateNumber
          : b instanceof color ? interpolateRgb
          : (c = color(b)) ? (b = c, interpolateRgb)
          : interpolateString)(a, b);
    }

    function attrRemove$1(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS$1(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant$1(name, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = this.getAttribute(name);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function attrConstantNS$1(fullname, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = this.getAttributeNS(fullname.space, fullname.local);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function attrFunction$1(name, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0, value1 = value(this), string1;
        if (value1 == null) return void this.removeAttribute(name);
        string0 = this.getAttribute(name);
        string1 = value1 + "";
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function attrFunctionNS$1(fullname, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0, value1 = value(this), string1;
        if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
        string0 = this.getAttributeNS(fullname.space, fullname.local);
        string1 = value1 + "";
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function transition_attr(name, value) {
      var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
      return this.attrTween(name, typeof value === "function"
          ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)(fullname, i, tweenValue(this, "attr." + name, value))
          : value == null ? (fullname.local ? attrRemoveNS$1 : attrRemove$1)(fullname)
          : (fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, i, value));
    }

    function attrInterpolate(name, i) {
      return function(t) {
        this.setAttribute(name, i.call(this, t));
      };
    }

    function attrInterpolateNS(fullname, i) {
      return function(t) {
        this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
      };
    }

    function attrTweenNS(fullname, value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function attrTween(name, value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function transition_attrTween(name, value) {
      var key = "attr." + name;
      if (arguments.length < 2) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      var fullname = namespace(name);
      return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
    }

    function delayFunction(id, value) {
      return function() {
        init$1(this, id).delay = +value.apply(this, arguments);
      };
    }

    function delayConstant(id, value) {
      return value = +value, function() {
        init$1(this, id).delay = value;
      };
    }

    function transition_delay(value) {
      var id = this._id;

      return arguments.length
          ? this.each((typeof value === "function"
              ? delayFunction
              : delayConstant)(id, value))
          : get$1(this.node(), id).delay;
    }

    function durationFunction(id, value) {
      return function() {
        set$1(this, id).duration = +value.apply(this, arguments);
      };
    }

    function durationConstant(id, value) {
      return value = +value, function() {
        set$1(this, id).duration = value;
      };
    }

    function transition_duration(value) {
      var id = this._id;

      return arguments.length
          ? this.each((typeof value === "function"
              ? durationFunction
              : durationConstant)(id, value))
          : get$1(this.node(), id).duration;
    }

    function easeConstant(id, value) {
      if (typeof value !== "function") throw new Error;
      return function() {
        set$1(this, id).ease = value;
      };
    }

    function transition_ease(value) {
      var id = this._id;

      return arguments.length
          ? this.each(easeConstant(id, value))
          : get$1(this.node(), id).ease;
    }

    function transition_filter(match) {
      if (typeof match !== "function") match = matcher(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Transition(subgroups, this._parents, this._name, this._id);
    }

    function transition_merge(transition) {
      if (transition._id !== this._id) throw new Error;

      for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Transition(merges, this._parents, this._name, this._id);
    }

    function start(name) {
      return (name + "").trim().split(/^|\s+/).every(function(t) {
        var i = t.indexOf(".");
        if (i >= 0) t = t.slice(0, i);
        return !t || t === "start";
      });
    }

    function onFunction(id, name, listener) {
      var on0, on1, sit = start(name) ? init$1 : set$1;
      return function() {
        var schedule = sit(this, id),
            on = schedule.on;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

        schedule.on = on1;
      };
    }

    function transition_on(name, listener) {
      var id = this._id;

      return arguments.length < 2
          ? get$1(this.node(), id).on.on(name)
          : this.each(onFunction(id, name, listener));
    }

    function removeFunction(id) {
      return function() {
        var parent = this.parentNode;
        for (var i in this.__transition) if (+i !== id) return;
        if (parent) parent.removeChild(this);
      };
    }

    function transition_remove() {
      return this.on("end.remove", removeFunction(this._id));
    }

    function transition_select(select) {
      var name = this._name,
          id = this._id;

      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
            schedule(subgroup[i], name, id, i, subgroup, get$1(node, id));
          }
        }
      }

      return new Transition(subgroups, this._parents, name, id);
    }

    function transition_selectAll(select) {
      var name = this._name,
          id = this._id;

      if (typeof select !== "function") select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            for (var children = select.call(node, node.__data__, i, group), child, inherit = get$1(node, id), k = 0, l = children.length; k < l; ++k) {
              if (child = children[k]) {
                schedule(child, name, id, k, children, inherit);
              }
            }
            subgroups.push(children);
            parents.push(node);
          }
        }
      }

      return new Transition(subgroups, parents, name, id);
    }

    var Selection$1 = selection.prototype.constructor;

    function transition_selection() {
      return new Selection$1(this._groups, this._parents);
    }

    function styleNull(name, interpolate) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0 = styleValue(this, name),
            string1 = (this.style.removeProperty(name), styleValue(this, name));
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, string10 = string1);
      };
    }

    function styleRemove$1(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant$1(name, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = styleValue(this, name);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function styleFunction$1(name, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0 = styleValue(this, name),
            value1 = value(this),
            string1 = value1 + "";
        if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function styleMaybeRemove(id, name) {
      var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
      return function() {
        var schedule = set$1(this, id),
            on = schedule.on,
            listener = schedule.value[key] == null ? remove || (remove = styleRemove$1(name)) : undefined;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

        schedule.on = on1;
      };
    }

    function transition_style(name, value, priority) {
      var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
      return value == null ? this
          .styleTween(name, styleNull(name, i))
          .on("end.style." + name, styleRemove$1(name))
        : typeof value === "function" ? this
          .styleTween(name, styleFunction$1(name, i, tweenValue(this, "style." + name, value)))
          .each(styleMaybeRemove(this._id, name))
        : this
          .styleTween(name, styleConstant$1(name, i, value), priority)
          .on("end.style." + name, null);
    }

    function styleInterpolate(name, i, priority) {
      return function(t) {
        this.style.setProperty(name, i.call(this, t), priority);
      };
    }

    function styleTween(name, value, priority) {
      var t, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
        return t;
      }
      tween._value = value;
      return tween;
    }

    function transition_styleTween(name, value, priority) {
      var key = "style." + (name += "");
      if (arguments.length < 2) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
    }

    function textConstant$1(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction$1(value) {
      return function() {
        var value1 = value(this);
        this.textContent = value1 == null ? "" : value1;
      };
    }

    function transition_text(value) {
      return this.tween("text", typeof value === "function"
          ? textFunction$1(tweenValue(this, "text", value))
          : textConstant$1(value == null ? "" : value + ""));
    }

    function textInterpolate(i) {
      return function(t) {
        this.textContent = i.call(this, t);
      };
    }

    function textTween(value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function transition_textTween(value) {
      var key = "text";
      if (arguments.length < 1) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      return this.tween(key, textTween(value));
    }

    function transition_transition() {
      var name = this._name,
          id0 = this._id,
          id1 = newId();

      for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            var inherit = get$1(node, id0);
            schedule(node, name, id1, i, group, {
              time: inherit.time + inherit.delay + inherit.duration,
              delay: 0,
              duration: inherit.duration,
              ease: inherit.ease
            });
          }
        }
      }

      return new Transition(groups, this._parents, name, id1);
    }

    function transition_end() {
      var on0, on1, that = this, id = that._id, size = that.size();
      return new Promise(function(resolve, reject) {
        var cancel = {value: reject},
            end = {value: function() { if (--size === 0) resolve(); }};

        that.each(function() {
          var schedule = set$1(this, id),
              on = schedule.on;

          // If this node shared a dispatch with the previous node,
          // just assign the updated shared dispatch and we’re done!
          // Otherwise, copy-on-write.
          if (on !== on0) {
            on1 = (on0 = on).copy();
            on1._.cancel.push(cancel);
            on1._.interrupt.push(cancel);
            on1._.end.push(end);
          }

          schedule.on = on1;
        });
      });
    }

    var id = 0;

    function Transition(groups, parents, name, id) {
      this._groups = groups;
      this._parents = parents;
      this._name = name;
      this._id = id;
    }

    function transition(name) {
      return selection().transition(name);
    }

    function newId() {
      return ++id;
    }

    var selection_prototype = selection.prototype;

    Transition.prototype = transition.prototype = {
      constructor: Transition,
      select: transition_select,
      selectAll: transition_selectAll,
      filter: transition_filter,
      merge: transition_merge,
      selection: transition_selection,
      transition: transition_transition,
      call: selection_prototype.call,
      nodes: selection_prototype.nodes,
      node: selection_prototype.node,
      size: selection_prototype.size,
      empty: selection_prototype.empty,
      each: selection_prototype.each,
      on: transition_on,
      attr: transition_attr,
      attrTween: transition_attrTween,
      style: transition_style,
      styleTween: transition_styleTween,
      text: transition_text,
      textTween: transition_textTween,
      remove: transition_remove,
      tween: transition_tween,
      delay: transition_delay,
      duration: transition_duration,
      ease: transition_ease,
      end: transition_end
    };

    function cubicInOut(t) {
      return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
    }

    var defaultTiming = {
      time: null, // Set on use.
      delay: 0,
      duration: 250,
      ease: cubicInOut
    };

    function inherit(node, id) {
      var timing;
      while (!(timing = node.__transition) || !(timing = timing[id])) {
        if (!(node = node.parentNode)) {
          return defaultTiming.time = now(), defaultTiming;
        }
      }
      return timing;
    }

    function selection_transition(name) {
      var id,
          timing;

      if (name instanceof Transition) {
        id = name._id, name = name._name;
      } else {
        id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
      }

      for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            schedule(node, name, id, i, group, timing || inherit(node, id));
          }
        }
      }

      return new Transition(groups, this._parents, name, id);
    }

    selection.prototype.interrupt = selection_interrupt;
    selection.prototype.transition = selection_transition;

    var prefix = "$";

    function Map$1() {}

    Map$1.prototype = map.prototype = {
      constructor: Map$1,
      has: function(key) {
        return (prefix + key) in this;
      },
      get: function(key) {
        return this[prefix + key];
      },
      set: function(key, value) {
        this[prefix + key] = value;
        return this;
      },
      remove: function(key) {
        var property = prefix + key;
        return property in this && delete this[property];
      },
      clear: function() {
        for (var property in this) if (property[0] === prefix) delete this[property];
      },
      keys: function() {
        var keys = [];
        for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
        return keys;
      },
      values: function() {
        var values = [];
        for (var property in this) if (property[0] === prefix) values.push(this[property]);
        return values;
      },
      entries: function() {
        var entries = [];
        for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
        return entries;
      },
      size: function() {
        var size = 0;
        for (var property in this) if (property[0] === prefix) ++size;
        return size;
      },
      empty: function() {
        for (var property in this) if (property[0] === prefix) return false;
        return true;
      },
      each: function(f) {
        for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
      }
    };

    function map(object, f) {
      var map = new Map$1;

      // Copy constructor.
      if (object instanceof Map$1) object.each(function(value, key) { map.set(key, value); });

      // Index array by numeric index or specified key function.
      else if (Array.isArray(object)) {
        var i = -1,
            n = object.length,
            o;

        if (f == null) while (++i < n) map.set(i, object[i]);
        else while (++i < n) map.set(f(o = object[i], i, object), o);
      }

      // Convert object to map.
      else if (object) for (var key in object) map.set(key, object[key]);

      return map;
    }

    function Set$1() {}

    var proto = map.prototype;

    Set$1.prototype = set$2.prototype = {
      constructor: Set$1,
      has: proto.has,
      add: function(value) {
        value += "";
        this[prefix + value] = value;
        return this;
      },
      remove: proto.remove,
      clear: proto.clear,
      values: proto.keys,
      size: proto.size,
      empty: proto.empty,
      each: proto.each
    };

    function set$2(object, f) {
      var set = new Set$1;

      // Copy constructor.
      if (object instanceof Set$1) object.each(function(value) { set.add(value); });

      // Otherwise, assume it’s an array.
      else if (object) {
        var i = -1, n = object.length;
        if (f == null) while (++i < n) set.add(object[i]);
        else while (++i < n) set.add(f(object[i], i, object));
      }

      return set;
    }

    var EOL = {},
        EOF = {},
        QUOTE = 34,
        NEWLINE = 10,
        RETURN = 13;

    function objectConverter(columns) {
      return new Function("d", "return {" + columns.map(function(name, i) {
        return JSON.stringify(name) + ": d[" + i + "] || \"\"";
      }).join(",") + "}");
    }

    function customConverter(columns, f) {
      var object = objectConverter(columns);
      return function(row, i) {
        return f(object(row), i, columns);
      };
    }

    // Compute unique columns in order of discovery.
    function inferColumns(rows) {
      var columnSet = Object.create(null),
          columns = [];

      rows.forEach(function(row) {
        for (var column in row) {
          if (!(column in columnSet)) {
            columns.push(columnSet[column] = column);
          }
        }
      });

      return columns;
    }

    function pad(value, width) {
      var s = value + "", length = s.length;
      return length < width ? new Array(width - length + 1).join(0) + s : s;
    }

    function formatYear(year) {
      return year < 0 ? "-" + pad(-year, 6)
        : year > 9999 ? "+" + pad(year, 6)
        : pad(year, 4);
    }

    function formatDate(date) {
      var hours = date.getUTCHours(),
          minutes = date.getUTCMinutes(),
          seconds = date.getUTCSeconds(),
          milliseconds = date.getUTCMilliseconds();
      return isNaN(date) ? "Invalid Date"
          : formatYear(date.getUTCFullYear()) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2)
          + (milliseconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(milliseconds, 3) + "Z"
          : seconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "Z"
          : minutes || hours ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + "Z"
          : "");
    }

    function dsvFormat(delimiter) {
      var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
          DELIMITER = delimiter.charCodeAt(0);

      function parse(text, f) {
        var convert, columns, rows = parseRows(text, function(row, i) {
          if (convert) return convert(row, i - 1);
          columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
        });
        rows.columns = columns || [];
        return rows;
      }

      function parseRows(text, f) {
        var rows = [], // output rows
            N = text.length,
            I = 0, // current character index
            n = 0, // current line number
            t, // current token
            eof = N <= 0, // current token followed by EOF?
            eol = false; // current token followed by EOL?

        // Strip the trailing newline.
        if (text.charCodeAt(N - 1) === NEWLINE) --N;
        if (text.charCodeAt(N - 1) === RETURN) --N;

        function token() {
          if (eof) return EOF;
          if (eol) return eol = false, EOL;

          // Unescape quotes.
          var i, j = I, c;
          if (text.charCodeAt(j) === QUOTE) {
            while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
            if ((i = I) >= N) eof = true;
            else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            return text.slice(j + 1, i - 1).replace(/""/g, "\"");
          }

          // Find next delimiter or newline.
          while (I < N) {
            if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            else if (c !== DELIMITER) continue;
            return text.slice(j, i);
          }

          // Return last token before EOF.
          return eof = true, text.slice(j, N);
        }

        while ((t = token()) !== EOF) {
          var row = [];
          while (t !== EOL && t !== EOF) row.push(t), t = token();
          if (f && (row = f(row, n++)) == null) continue;
          rows.push(row);
        }

        return rows;
      }

      function preformatBody(rows, columns) {
        return rows.map(function(row) {
          return columns.map(function(column) {
            return formatValue(row[column]);
          }).join(delimiter);
        });
      }

      function format(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
      }

      function formatBody(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return preformatBody(rows, columns).join("\n");
      }

      function formatRows(rows) {
        return rows.map(formatRow).join("\n");
      }

      function formatRow(row) {
        return row.map(formatValue).join(delimiter);
      }

      function formatValue(value) {
        return value == null ? ""
            : value instanceof Date ? formatDate(value)
            : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
            : value;
      }

      return {
        parse: parse,
        parseRows: parseRows,
        format: format,
        formatBody: formatBody,
        formatRows: formatRows,
        formatRow: formatRow,
        formatValue: formatValue
      };
    }

    var csv = dsvFormat(",");

    var csvParse = csv.parse;

    // Adds floating point numbers with twice the normal precision.
    // Reference: J. R. Shewchuk, Adaptive Precision Floating-Point Arithmetic and
    // Fast Robust Geometric Predicates, Discrete & Computational Geometry 18(3)
    // 305–363 (1997).
    // Code adapted from GeographicLib by Charles F. F. Karney,
    // http://geographiclib.sourceforge.net/

    function adder() {
      return new Adder;
    }

    function Adder() {
      this.reset();
    }

    Adder.prototype = {
      constructor: Adder,
      reset: function() {
        this.s = // rounded value
        this.t = 0; // exact error
      },
      add: function(y) {
        add(temp, y, this.t);
        add(this, temp.s, this.s);
        if (this.s) this.t += temp.t;
        else this.s = temp.t;
      },
      valueOf: function() {
        return this.s;
      }
    };

    var temp = new Adder;

    function add(adder, a, b) {
      var x = adder.s = a + b,
          bv = x - a,
          av = x - bv;
      adder.t = (a - av) + (b - bv);
    }

    var epsilon = 1e-6;
    var pi = Math.PI;
    var halfPi = pi / 2;
    var quarterPi = pi / 4;
    var tau = pi * 2;

    var degrees$1 = 180 / pi;
    var radians = pi / 180;

    var abs = Math.abs;
    var atan = Math.atan;
    var atan2 = Math.atan2;
    var cos = Math.cos;
    var sin = Math.sin;
    var sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
    var sqrt = Math.sqrt;

    function acos(x) {
      return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
    }

    function asin(x) {
      return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
    }

    function noop$2() {}

    function streamGeometry(geometry, stream) {
      if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
        streamGeometryType[geometry.type](geometry, stream);
      }
    }

    var streamObjectType = {
      Feature: function(object, stream) {
        streamGeometry(object.geometry, stream);
      },
      FeatureCollection: function(object, stream) {
        var features = object.features, i = -1, n = features.length;
        while (++i < n) streamGeometry(features[i].geometry, stream);
      }
    };

    var streamGeometryType = {
      Sphere: function(object, stream) {
        stream.sphere();
      },
      Point: function(object, stream) {
        object = object.coordinates;
        stream.point(object[0], object[1], object[2]);
      },
      MultiPoint: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
      },
      LineString: function(object, stream) {
        streamLine(object.coordinates, stream, 0);
      },
      MultiLineString: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) streamLine(coordinates[i], stream, 0);
      },
      Polygon: function(object, stream) {
        streamPolygon(object.coordinates, stream);
      },
      MultiPolygon: function(object, stream) {
        var coordinates = object.coordinates, i = -1, n = coordinates.length;
        while (++i < n) streamPolygon(coordinates[i], stream);
      },
      GeometryCollection: function(object, stream) {
        var geometries = object.geometries, i = -1, n = geometries.length;
        while (++i < n) streamGeometry(geometries[i], stream);
      }
    };

    function streamLine(coordinates, stream, closed) {
      var i = -1, n = coordinates.length - closed, coordinate;
      stream.lineStart();
      while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
      stream.lineEnd();
    }

    function streamPolygon(coordinates, stream) {
      var i = -1, n = coordinates.length;
      stream.polygonStart();
      while (++i < n) streamLine(coordinates[i], stream, 1);
      stream.polygonEnd();
    }

    function geoStream(object, stream) {
      if (object && streamObjectType.hasOwnProperty(object.type)) {
        streamObjectType[object.type](object, stream);
      } else {
        streamGeometry(object, stream);
      }
    }

    function spherical(cartesian) {
      return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
    }

    function cartesian(spherical) {
      var lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
      return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
    }

    function cartesianDot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    function cartesianCross(a, b) {
      return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }

    // TODO return a
    function cartesianAddInPlace(a, b) {
      a[0] += b[0], a[1] += b[1], a[2] += b[2];
    }

    function cartesianScale(vector, k) {
      return [vector[0] * k, vector[1] * k, vector[2] * k];
    }

    // TODO return d
    function cartesianNormalizeInPlace(d) {
      var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
      d[0] /= l, d[1] /= l, d[2] /= l;
    }

    function compose(a, b) {

      function compose(x, y) {
        return x = a(x, y), b(x[0], x[1]);
      }

      if (a.invert && b.invert) compose.invert = function(x, y) {
        return x = b.invert(x, y), x && a.invert(x[0], x[1]);
      };

      return compose;
    }

    function rotationIdentity(lambda, phi) {
      return [abs(lambda) > pi ? lambda + Math.round(-lambda / tau) * tau : lambda, phi];
    }

    rotationIdentity.invert = rotationIdentity;

    function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
      return (deltaLambda %= tau) ? (deltaPhi || deltaGamma ? compose(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma))
        : rotationLambda(deltaLambda))
        : (deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma)
        : rotationIdentity);
    }

    function forwardRotationLambda(deltaLambda) {
      return function(lambda, phi) {
        return lambda += deltaLambda, [lambda > pi ? lambda - tau : lambda < -pi ? lambda + tau : lambda, phi];
      };
    }

    function rotationLambda(deltaLambda) {
      var rotation = forwardRotationLambda(deltaLambda);
      rotation.invert = forwardRotationLambda(-deltaLambda);
      return rotation;
    }

    function rotationPhiGamma(deltaPhi, deltaGamma) {
      var cosDeltaPhi = cos(deltaPhi),
          sinDeltaPhi = sin(deltaPhi),
          cosDeltaGamma = cos(deltaGamma),
          sinDeltaGamma = sin(deltaGamma);

      function rotation(lambda, phi) {
        var cosPhi = cos(phi),
            x = cos(lambda) * cosPhi,
            y = sin(lambda) * cosPhi,
            z = sin(phi),
            k = z * cosDeltaPhi + x * sinDeltaPhi;
        return [
          atan2(y * cosDeltaGamma - k * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
          asin(k * cosDeltaGamma + y * sinDeltaGamma)
        ];
      }

      rotation.invert = function(lambda, phi) {
        var cosPhi = cos(phi),
            x = cos(lambda) * cosPhi,
            y = sin(lambda) * cosPhi,
            z = sin(phi),
            k = z * cosDeltaGamma - y * sinDeltaGamma;
        return [
          atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k * sinDeltaPhi),
          asin(k * cosDeltaPhi - x * sinDeltaPhi)
        ];
      };

      return rotation;
    }

    // Generates a circle centered at [0°, 0°], with a given radius and precision.
    function circleStream(stream, radius, delta, direction, t0, t1) {
      if (!delta) return;
      var cosRadius = cos(radius),
          sinRadius = sin(radius),
          step = direction * delta;
      if (t0 == null) {
        t0 = radius + direction * tau;
        t1 = radius - step / 2;
      } else {
        t0 = circleRadius(cosRadius, t0);
        t1 = circleRadius(cosRadius, t1);
        if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
      }
      for (var point, t = t0; direction > 0 ? t > t1 : t < t1; t -= step) {
        point = spherical([cosRadius, -sinRadius * cos(t), -sinRadius * sin(t)]);
        stream.point(point[0], point[1]);
      }
    }

    // Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
    function circleRadius(cosRadius, point) {
      point = cartesian(point), point[0] -= cosRadius;
      cartesianNormalizeInPlace(point);
      var radius = acos(-point[1]);
      return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
    }

    function clipBuffer() {
      var lines = [],
          line;
      return {
        point: function(x, y) {
          line.push([x, y]);
        },
        lineStart: function() {
          lines.push(line = []);
        },
        lineEnd: noop$2,
        rejoin: function() {
          if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
        },
        result: function() {
          var result = lines;
          lines = [];
          line = null;
          return result;
        }
      };
    }

    function pointEqual(a, b) {
      return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
    }

    function Intersection(point, points, other, entry) {
      this.x = point;
      this.z = points;
      this.o = other; // another intersection
      this.e = entry; // is an entry?
      this.v = false; // visited
      this.n = this.p = null; // next & previous
    }

    // A generalized polygon clipping algorithm: given a polygon that has been cut
    // into its visible line segments, and rejoins the segments by interpolating
    // along the clip edge.
    function clipRejoin(segments, compareIntersection, startInside, interpolate, stream) {
      var subject = [],
          clip = [],
          i,
          n;

      segments.forEach(function(segment) {
        if ((n = segment.length - 1) <= 0) return;
        var n, p0 = segment[0], p1 = segment[n], x;

        // If the first and last points of a segment are coincident, then treat as a
        // closed ring. TODO if all rings are closed, then the winding order of the
        // exterior ring should be checked.
        if (pointEqual(p0, p1)) {
          stream.lineStart();
          for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
          stream.lineEnd();
          return;
        }

        subject.push(x = new Intersection(p0, segment, null, true));
        clip.push(x.o = new Intersection(p0, null, x, false));
        subject.push(x = new Intersection(p1, segment, null, false));
        clip.push(x.o = new Intersection(p1, null, x, true));
      });

      if (!subject.length) return;

      clip.sort(compareIntersection);
      link(subject);
      link(clip);

      for (i = 0, n = clip.length; i < n; ++i) {
        clip[i].e = startInside = !startInside;
      }

      var start = subject[0],
          points,
          point;

      while (1) {
        // Find first unvisited intersection.
        var current = start,
            isSubject = true;
        while (current.v) if ((current = current.n) === start) return;
        points = current.z;
        stream.lineStart();
        do {
          current.v = current.o.v = true;
          if (current.e) {
            if (isSubject) {
              for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.n.x, 1, stream);
            }
            current = current.n;
          } else {
            if (isSubject) {
              points = current.p.z;
              for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
            } else {
              interpolate(current.x, current.p.x, -1, stream);
            }
            current = current.p;
          }
          current = current.o;
          points = current.z;
          isSubject = !isSubject;
        } while (!current.v);
        stream.lineEnd();
      }
    }

    function link(array) {
      if (!(n = array.length)) return;
      var n,
          i = 0,
          a = array[0],
          b;
      while (++i < n) {
        a.n = b = array[i];
        b.p = a;
        a = b;
      }
      a.n = b = array[0];
      b.p = a;
    }

    var sum = adder();

    function longitude(point) {
      if (abs(point[0]) <= pi)
        return point[0];
      else
        return sign(point[0]) * ((abs(point[0]) + pi) % tau - pi);
    }

    function polygonContains(polygon, point) {
      var lambda = longitude(point),
          phi = point[1],
          sinPhi = sin(phi),
          normal = [sin(lambda), -cos(lambda), 0],
          angle = 0,
          winding = 0;

      sum.reset();

      if (sinPhi === 1) phi = halfPi + epsilon;
      else if (sinPhi === -1) phi = -halfPi - epsilon;

      for (var i = 0, n = polygon.length; i < n; ++i) {
        if (!(m = (ring = polygon[i]).length)) continue;
        var ring,
            m,
            point0 = ring[m - 1],
            lambda0 = longitude(point0),
            phi0 = point0[1] / 2 + quarterPi,
            sinPhi0 = sin(phi0),
            cosPhi0 = cos(phi0);

        for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
          var point1 = ring[j],
              lambda1 = longitude(point1),
              phi1 = point1[1] / 2 + quarterPi,
              sinPhi1 = sin(phi1),
              cosPhi1 = cos(phi1),
              delta = lambda1 - lambda0,
              sign = delta >= 0 ? 1 : -1,
              absDelta = sign * delta,
              antimeridian = absDelta > pi,
              k = sinPhi0 * sinPhi1;

          sum.add(atan2(k * sign * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
          angle += antimeridian ? delta + sign * tau : delta;

          // Are the longitudes either side of the point’s meridian (lambda),
          // and are the latitudes smaller than the parallel (phi)?
          if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
            var arc = cartesianCross(cartesian(point0), cartesian(point1));
            cartesianNormalizeInPlace(arc);
            var intersection = cartesianCross(normal, arc);
            cartesianNormalizeInPlace(intersection);
            var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
            if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
              winding += antimeridian ^ delta >= 0 ? 1 : -1;
            }
          }
        }
      }

      // First, determine whether the South pole is inside or outside:
      //
      // It is inside if:
      // * the polygon winds around it in a clockwise direction.
      // * the polygon does not (cumulatively) wind around it, but has a negative
      //   (counter-clockwise) area.
      //
      // Second, count the (signed) number of times a segment crosses a lambda
      // from the point to the South pole.  If it is zero, then the point is the
      // same side as the South pole.

      return (angle < -epsilon || angle < epsilon && sum < -epsilon) ^ (winding & 1);
    }

    function clip(pointVisible, clipLine, interpolate, start) {
      return function(sink) {
        var line = clipLine(sink),
            ringBuffer = clipBuffer(),
            ringSink = clipLine(ringBuffer),
            polygonStarted = false,
            polygon,
            segments,
            ring;

        var clip = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() {
            clip.point = pointRing;
            clip.lineStart = ringStart;
            clip.lineEnd = ringEnd;
            segments = [];
            polygon = [];
          },
          polygonEnd: function() {
            clip.point = point;
            clip.lineStart = lineStart;
            clip.lineEnd = lineEnd;
            segments = merge(segments);
            var startInside = polygonContains(polygon, start);
            if (segments.length) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              clipRejoin(segments, compareIntersection, startInside, interpolate, sink);
            } else if (startInside) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              interpolate(null, null, 1, sink);
              sink.lineEnd();
            }
            if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
            segments = polygon = null;
          },
          sphere: function() {
            sink.polygonStart();
            sink.lineStart();
            interpolate(null, null, 1, sink);
            sink.lineEnd();
            sink.polygonEnd();
          }
        };

        function point(lambda, phi) {
          if (pointVisible(lambda, phi)) sink.point(lambda, phi);
        }

        function pointLine(lambda, phi) {
          line.point(lambda, phi);
        }

        function lineStart() {
          clip.point = pointLine;
          line.lineStart();
        }

        function lineEnd() {
          clip.point = point;
          line.lineEnd();
        }

        function pointRing(lambda, phi) {
          ring.push([lambda, phi]);
          ringSink.point(lambda, phi);
        }

        function ringStart() {
          ringSink.lineStart();
          ring = [];
        }

        function ringEnd() {
          pointRing(ring[0][0], ring[0][1]);
          ringSink.lineEnd();

          var clean = ringSink.clean(),
              ringSegments = ringBuffer.result(),
              i, n = ringSegments.length, m,
              segment,
              point;

          ring.pop();
          polygon.push(ring);
          ring = null;

          if (!n) return;

          // No intersections.
          if (clean & 1) {
            segment = ringSegments[0];
            if ((m = segment.length - 1) > 0) {
              if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
              sink.lineStart();
              for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
              sink.lineEnd();
            }
            return;
          }

          // Rejoin connected segments.
          // TODO reuse ringBuffer.rejoin()?
          if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

          segments.push(ringSegments.filter(validSegment));
        }

        return clip;
      };
    }

    function validSegment(segment) {
      return segment.length > 1;
    }

    // Intersections are sorted along the clip edge. For both antimeridian cutting
    // and circle clipping, the same comparison is used.
    function compareIntersection(a, b) {
      return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1])
           - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
    }

    var clipAntimeridian = clip(
      function() { return true; },
      clipAntimeridianLine,
      clipAntimeridianInterpolate,
      [-pi, -halfPi]
    );

    // Takes a line and cuts into visible segments. Return values: 0 - there were
    // intersections or the line was empty; 1 - no intersections; 2 - there were
    // intersections, and the first and last segments should be rejoined.
    function clipAntimeridianLine(stream) {
      var lambda0 = NaN,
          phi0 = NaN,
          sign0 = NaN,
          clean; // no intersections

      return {
        lineStart: function() {
          stream.lineStart();
          clean = 1;
        },
        point: function(lambda1, phi1) {
          var sign1 = lambda1 > 0 ? pi : -pi,
              delta = abs(lambda1 - lambda0);
          if (abs(delta - pi) < epsilon) { // line crosses a pole
            stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            stream.point(lambda1, phi0);
            clean = 0;
          } else if (sign0 !== sign1 && delta >= pi) { // line crosses antimeridian
            if (abs(lambda0 - sign0) < epsilon) lambda0 -= sign0 * epsilon; // handle degeneracies
            if (abs(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon;
            phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
            stream.point(sign0, phi0);
            stream.lineEnd();
            stream.lineStart();
            stream.point(sign1, phi0);
            clean = 0;
          }
          stream.point(lambda0 = lambda1, phi0 = phi1);
          sign0 = sign1;
        },
        lineEnd: function() {
          stream.lineEnd();
          lambda0 = phi0 = NaN;
        },
        clean: function() {
          return 2 - clean; // if intersections, rejoin first and last segments
        }
      };
    }

    function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
      var cosPhi0,
          cosPhi1,
          sinLambda0Lambda1 = sin(lambda0 - lambda1);
      return abs(sinLambda0Lambda1) > epsilon
          ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1)
              - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0))
              / (cosPhi0 * cosPhi1 * sinLambda0Lambda1))
          : (phi0 + phi1) / 2;
    }

    function clipAntimeridianInterpolate(from, to, direction, stream) {
      var phi;
      if (from == null) {
        phi = direction * halfPi;
        stream.point(-pi, phi);
        stream.point(0, phi);
        stream.point(pi, phi);
        stream.point(pi, 0);
        stream.point(pi, -phi);
        stream.point(0, -phi);
        stream.point(-pi, -phi);
        stream.point(-pi, 0);
        stream.point(-pi, phi);
      } else if (abs(from[0] - to[0]) > epsilon) {
        var lambda = from[0] < to[0] ? pi : -pi;
        phi = direction * lambda / 2;
        stream.point(-lambda, phi);
        stream.point(0, phi);
        stream.point(lambda, phi);
      } else {
        stream.point(to[0], to[1]);
      }
    }

    function clipCircle(radius) {
      var cr = cos(radius),
          delta = 6 * radians,
          smallRadius = cr > 0,
          notHemisphere = abs(cr) > epsilon; // TODO optimise for this common case

      function interpolate(from, to, direction, stream) {
        circleStream(stream, radius, delta, direction, from, to);
      }

      function visible(lambda, phi) {
        return cos(lambda) * cos(phi) > cr;
      }

      // Takes a line and cuts into visible segments. Return values used for polygon
      // clipping: 0 - there were intersections or the line was empty; 1 - no
      // intersections 2 - there were intersections, and the first and last segments
      // should be rejoined.
      function clipLine(stream) {
        var point0, // previous point
            c0, // code for previous point
            v0, // visibility of previous point
            v00, // visibility of first point
            clean; // no intersections
        return {
          lineStart: function() {
            v00 = v0 = false;
            clean = 1;
          },
          point: function(lambda, phi) {
            var point1 = [lambda, phi],
                point2,
                v = visible(lambda, phi),
                c = smallRadius
                  ? v ? 0 : code(lambda, phi)
                  : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
            if (!point0 && (v00 = v0 = v)) stream.lineStart();
            // Handle degeneracies.
            // TODO ignore if not clipping polygons.
            if (v !== v0) {
              point2 = intersect(point0, point1);
              if (!point2 || pointEqual(point0, point2) || pointEqual(point1, point2)) {
                point1[0] += epsilon;
                point1[1] += epsilon;
                v = visible(point1[0], point1[1]);
              }
            }
            if (v !== v0) {
              clean = 0;
              if (v) {
                // outside going in
                stream.lineStart();
                point2 = intersect(point1, point0);
                stream.point(point2[0], point2[1]);
              } else {
                // inside going out
                point2 = intersect(point0, point1);
                stream.point(point2[0], point2[1]);
                stream.lineEnd();
              }
              point0 = point2;
            } else if (notHemisphere && point0 && smallRadius ^ v) {
              var t;
              // If the codes for two points are different, or are both zero,
              // and there this segment intersects with the small circle.
              if (!(c & c0) && (t = intersect(point1, point0, true))) {
                clean = 0;
                if (smallRadius) {
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1]);
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                } else {
                  stream.point(t[1][0], t[1][1]);
                  stream.lineEnd();
                  stream.lineStart();
                  stream.point(t[0][0], t[0][1]);
                }
              }
            }
            if (v && (!point0 || !pointEqual(point0, point1))) {
              stream.point(point1[0], point1[1]);
            }
            point0 = point1, v0 = v, c0 = c;
          },
          lineEnd: function() {
            if (v0) stream.lineEnd();
            point0 = null;
          },
          // Rejoin first and last segments if there were intersections and the first
          // and last points were visible.
          clean: function() {
            return clean | ((v00 && v0) << 1);
          }
        };
      }

      // Intersects the great circle between a and b with the clip circle.
      function intersect(a, b, two) {
        var pa = cartesian(a),
            pb = cartesian(b);

        // We have two planes, n1.p = d1 and n2.p = d2.
        // Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
        var n1 = [1, 0, 0], // normal
            n2 = cartesianCross(pa, pb),
            n2n2 = cartesianDot(n2, n2),
            n1n2 = n2[0], // cartesianDot(n1, n2),
            determinant = n2n2 - n1n2 * n1n2;

        // Two polar points.
        if (!determinant) return !two && a;

        var c1 =  cr * n2n2 / determinant,
            c2 = -cr * n1n2 / determinant,
            n1xn2 = cartesianCross(n1, n2),
            A = cartesianScale(n1, c1),
            B = cartesianScale(n2, c2);
        cartesianAddInPlace(A, B);

        // Solve |p(t)|^2 = 1.
        var u = n1xn2,
            w = cartesianDot(A, u),
            uu = cartesianDot(u, u),
            t2 = w * w - uu * (cartesianDot(A, A) - 1);

        if (t2 < 0) return;

        var t = sqrt(t2),
            q = cartesianScale(u, (-w - t) / uu);
        cartesianAddInPlace(q, A);
        q = spherical(q);

        if (!two) return q;

        // Two intersection points.
        var lambda0 = a[0],
            lambda1 = b[0],
            phi0 = a[1],
            phi1 = b[1],
            z;

        if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;

        var delta = lambda1 - lambda0,
            polar = abs(delta - pi) < epsilon,
            meridian = polar || delta < epsilon;

        if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;

        // Check that the first point is between a and b.
        if (meridian
            ? polar
              ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1)
              : phi0 <= q[1] && q[1] <= phi1
            : delta > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
          var q1 = cartesianScale(u, (-w + t) / uu);
          cartesianAddInPlace(q1, A);
          return [q, spherical(q1)];
        }
      }

      // Generates a 4-bit vector representing the location of a point relative to
      // the small circle's bounding box.
      function code(lambda, phi) {
        var r = smallRadius ? radius : pi - radius,
            code = 0;
        if (lambda < -r) code |= 1; // left
        else if (lambda > r) code |= 2; // right
        if (phi < -r) code |= 4; // below
        else if (phi > r) code |= 8; // above
        return code;
      }

      return clip(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
    }

    function clipLine(a, b, x0, y0, x1, y1) {
      var ax = a[0],
          ay = a[1],
          bx = b[0],
          by = b[1],
          t0 = 0,
          t1 = 1,
          dx = bx - ax,
          dy = by - ay,
          r;

      r = x0 - ax;
      if (!dx && r > 0) return;
      r /= dx;
      if (dx < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dx > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }

      r = x1 - ax;
      if (!dx && r < 0) return;
      r /= dx;
      if (dx < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dx > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }

      r = y0 - ay;
      if (!dy && r > 0) return;
      r /= dy;
      if (dy < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dy > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }

      r = y1 - ay;
      if (!dy && r < 0) return;
      r /= dy;
      if (dy < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dy > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }

      if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
      if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
      return true;
    }

    var clipMax = 1e9, clipMin = -clipMax;

    // TODO Use d3-polygon’s polygonContains here for the ring check?
    // TODO Eliminate duplicate buffering in clipBuffer and polygon.push?

    function clipRectangle(x0, y0, x1, y1) {

      function visible(x, y) {
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
      }

      function interpolate(from, to, direction, stream) {
        var a = 0, a1 = 0;
        if (from == null
            || (a = corner(from, direction)) !== (a1 = corner(to, direction))
            || comparePoint(from, to) < 0 ^ direction > 0) {
          do stream.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
          while ((a = (a + direction + 4) % 4) !== a1);
        } else {
          stream.point(to[0], to[1]);
        }
      }

      function corner(p, direction) {
        return abs(p[0] - x0) < epsilon ? direction > 0 ? 0 : 3
            : abs(p[0] - x1) < epsilon ? direction > 0 ? 2 : 1
            : abs(p[1] - y0) < epsilon ? direction > 0 ? 1 : 0
            : direction > 0 ? 3 : 2; // abs(p[1] - y1) < epsilon
      }

      function compareIntersection(a, b) {
        return comparePoint(a.x, b.x);
      }

      function comparePoint(a, b) {
        var ca = corner(a, 1),
            cb = corner(b, 1);
        return ca !== cb ? ca - cb
            : ca === 0 ? b[1] - a[1]
            : ca === 1 ? a[0] - b[0]
            : ca === 2 ? a[1] - b[1]
            : b[0] - a[0];
      }

      return function(stream) {
        var activeStream = stream,
            bufferStream = clipBuffer(),
            segments,
            polygon,
            ring,
            x__, y__, v__, // first point
            x_, y_, v_, // previous point
            first,
            clean;

        var clipStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: polygonStart,
          polygonEnd: polygonEnd
        };

        function point(x, y) {
          if (visible(x, y)) activeStream.point(x, y);
        }

        function polygonInside() {
          var winding = 0;

          for (var i = 0, n = polygon.length; i < n; ++i) {
            for (var ring = polygon[i], j = 1, m = ring.length, point = ring[0], a0, a1, b0 = point[0], b1 = point[1]; j < m; ++j) {
              a0 = b0, a1 = b1, point = ring[j], b0 = point[0], b1 = point[1];
              if (a1 <= y1) { if (b1 > y1 && (b0 - a0) * (y1 - a1) > (b1 - a1) * (x0 - a0)) ++winding; }
              else { if (b1 <= y1 && (b0 - a0) * (y1 - a1) < (b1 - a1) * (x0 - a0)) --winding; }
            }
          }

          return winding;
        }

        // Buffer geometry within a polygon and then clip it en masse.
        function polygonStart() {
          activeStream = bufferStream, segments = [], polygon = [], clean = true;
        }

        function polygonEnd() {
          var startInside = polygonInside(),
              cleanInside = clean && startInside,
              visible = (segments = merge(segments)).length;
          if (cleanInside || visible) {
            stream.polygonStart();
            if (cleanInside) {
              stream.lineStart();
              interpolate(null, null, 1, stream);
              stream.lineEnd();
            }
            if (visible) {
              clipRejoin(segments, compareIntersection, startInside, interpolate, stream);
            }
            stream.polygonEnd();
          }
          activeStream = stream, segments = polygon = ring = null;
        }

        function lineStart() {
          clipStream.point = linePoint;
          if (polygon) polygon.push(ring = []);
          first = true;
          v_ = false;
          x_ = y_ = NaN;
        }

        // TODO rather than special-case polygons, simply handle them separately.
        // Ideally, coincident intersection points should be jittered to avoid
        // clipping issues.
        function lineEnd() {
          if (segments) {
            linePoint(x__, y__);
            if (v__ && v_) bufferStream.rejoin();
            segments.push(bufferStream.result());
          }
          clipStream.point = point;
          if (v_) activeStream.lineEnd();
        }

        function linePoint(x, y) {
          var v = visible(x, y);
          if (polygon) ring.push([x, y]);
          if (first) {
            x__ = x, y__ = y, v__ = v;
            first = false;
            if (v) {
              activeStream.lineStart();
              activeStream.point(x, y);
            }
          } else {
            if (v && v_) activeStream.point(x, y);
            else {
              var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))],
                  b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
              if (clipLine(a, b, x0, y0, x1, y1)) {
                if (!v_) {
                  activeStream.lineStart();
                  activeStream.point(a[0], a[1]);
                }
                activeStream.point(b[0], b[1]);
                if (!v) activeStream.lineEnd();
                clean = false;
              } else if (v) {
                activeStream.lineStart();
                activeStream.point(x, y);
                clean = false;
              }
            }
          }
          x_ = x, y_ = y, v_ = v;
        }

        return clipStream;
      };
    }

    function identity$1(x) {
      return x;
    }

    var areaSum = adder(),
        areaRingSum = adder(),
        x00,
        y00,
        x0,
        y0;

    var areaStream = {
      point: noop$2,
      lineStart: noop$2,
      lineEnd: noop$2,
      polygonStart: function() {
        areaStream.lineStart = areaRingStart;
        areaStream.lineEnd = areaRingEnd;
      },
      polygonEnd: function() {
        areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop$2;
        areaSum.add(abs(areaRingSum));
        areaRingSum.reset();
      },
      result: function() {
        var area = areaSum / 2;
        areaSum.reset();
        return area;
      }
    };

    function areaRingStart() {
      areaStream.point = areaPointFirst;
    }

    function areaPointFirst(x, y) {
      areaStream.point = areaPoint;
      x00 = x0 = x, y00 = y0 = y;
    }

    function areaPoint(x, y) {
      areaRingSum.add(y0 * x - x0 * y);
      x0 = x, y0 = y;
    }

    function areaRingEnd() {
      areaPoint(x00, y00);
    }

    var x0$1 = Infinity,
        y0$1 = x0$1,
        x1 = -x0$1,
        y1 = x1;

    var boundsStream = {
      point: boundsPoint,
      lineStart: noop$2,
      lineEnd: noop$2,
      polygonStart: noop$2,
      polygonEnd: noop$2,
      result: function() {
        var bounds = [[x0$1, y0$1], [x1, y1]];
        x1 = y1 = -(y0$1 = x0$1 = Infinity);
        return bounds;
      }
    };

    function boundsPoint(x, y) {
      if (x < x0$1) x0$1 = x;
      if (x > x1) x1 = x;
      if (y < y0$1) y0$1 = y;
      if (y > y1) y1 = y;
    }

    // TODO Enforce positive area for exterior, negative area for interior?

    var X0 = 0,
        Y0 = 0,
        Z0 = 0,
        X1 = 0,
        Y1 = 0,
        Z1 = 0,
        X2 = 0,
        Y2 = 0,
        Z2 = 0,
        x00$1,
        y00$1,
        x0$2,
        y0$2;

    var centroidStream = {
      point: centroidPoint,
      lineStart: centroidLineStart,
      lineEnd: centroidLineEnd,
      polygonStart: function() {
        centroidStream.lineStart = centroidRingStart;
        centroidStream.lineEnd = centroidRingEnd;
      },
      polygonEnd: function() {
        centroidStream.point = centroidPoint;
        centroidStream.lineStart = centroidLineStart;
        centroidStream.lineEnd = centroidLineEnd;
      },
      result: function() {
        var centroid = Z2 ? [X2 / Z2, Y2 / Z2]
            : Z1 ? [X1 / Z1, Y1 / Z1]
            : Z0 ? [X0 / Z0, Y0 / Z0]
            : [NaN, NaN];
        X0 = Y0 = Z0 =
        X1 = Y1 = Z1 =
        X2 = Y2 = Z2 = 0;
        return centroid;
      }
    };

    function centroidPoint(x, y) {
      X0 += x;
      Y0 += y;
      ++Z0;
    }

    function centroidLineStart() {
      centroidStream.point = centroidPointFirstLine;
    }

    function centroidPointFirstLine(x, y) {
      centroidStream.point = centroidPointLine;
      centroidPoint(x0$2 = x, y0$2 = y);
    }

    function centroidPointLine(x, y) {
      var dx = x - x0$2, dy = y - y0$2, z = sqrt(dx * dx + dy * dy);
      X1 += z * (x0$2 + x) / 2;
      Y1 += z * (y0$2 + y) / 2;
      Z1 += z;
      centroidPoint(x0$2 = x, y0$2 = y);
    }

    function centroidLineEnd() {
      centroidStream.point = centroidPoint;
    }

    function centroidRingStart() {
      centroidStream.point = centroidPointFirstRing;
    }

    function centroidRingEnd() {
      centroidPointRing(x00$1, y00$1);
    }

    function centroidPointFirstRing(x, y) {
      centroidStream.point = centroidPointRing;
      centroidPoint(x00$1 = x0$2 = x, y00$1 = y0$2 = y);
    }

    function centroidPointRing(x, y) {
      var dx = x - x0$2,
          dy = y - y0$2,
          z = sqrt(dx * dx + dy * dy);

      X1 += z * (x0$2 + x) / 2;
      Y1 += z * (y0$2 + y) / 2;
      Z1 += z;

      z = y0$2 * x - x0$2 * y;
      X2 += z * (x0$2 + x);
      Y2 += z * (y0$2 + y);
      Z2 += z * 3;
      centroidPoint(x0$2 = x, y0$2 = y);
    }

    function PathContext(context) {
      this._context = context;
    }

    PathContext.prototype = {
      _radius: 4.5,
      pointRadius: function(_) {
        return this._radius = _, this;
      },
      polygonStart: function() {
        this._line = 0;
      },
      polygonEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line === 0) this._context.closePath();
        this._point = NaN;
      },
      point: function(x, y) {
        switch (this._point) {
          case 0: {
            this._context.moveTo(x, y);
            this._point = 1;
            break;
          }
          case 1: {
            this._context.lineTo(x, y);
            break;
          }
          default: {
            this._context.moveTo(x + this._radius, y);
            this._context.arc(x, y, this._radius, 0, tau);
            break;
          }
        }
      },
      result: noop$2
    };

    var lengthSum = adder(),
        lengthRing,
        x00$2,
        y00$2,
        x0$3,
        y0$3;

    var lengthStream = {
      point: noop$2,
      lineStart: function() {
        lengthStream.point = lengthPointFirst;
      },
      lineEnd: function() {
        if (lengthRing) lengthPoint(x00$2, y00$2);
        lengthStream.point = noop$2;
      },
      polygonStart: function() {
        lengthRing = true;
      },
      polygonEnd: function() {
        lengthRing = null;
      },
      result: function() {
        var length = +lengthSum;
        lengthSum.reset();
        return length;
      }
    };

    function lengthPointFirst(x, y) {
      lengthStream.point = lengthPoint;
      x00$2 = x0$3 = x, y00$2 = y0$3 = y;
    }

    function lengthPoint(x, y) {
      x0$3 -= x, y0$3 -= y;
      lengthSum.add(sqrt(x0$3 * x0$3 + y0$3 * y0$3));
      x0$3 = x, y0$3 = y;
    }

    function PathString() {
      this._string = [];
    }

    PathString.prototype = {
      _radius: 4.5,
      _circle: circle(4.5),
      pointRadius: function(_) {
        if ((_ = +_) !== this._radius) this._radius = _, this._circle = null;
        return this;
      },
      polygonStart: function() {
        this._line = 0;
      },
      polygonEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line === 0) this._string.push("Z");
        this._point = NaN;
      },
      point: function(x, y) {
        switch (this._point) {
          case 0: {
            this._string.push("M", x, ",", y);
            this._point = 1;
            break;
          }
          case 1: {
            this._string.push("L", x, ",", y);
            break;
          }
          default: {
            if (this._circle == null) this._circle = circle(this._radius);
            this._string.push("M", x, ",", y, this._circle);
            break;
          }
        }
      },
      result: function() {
        if (this._string.length) {
          var result = this._string.join("");
          this._string = [];
          return result;
        } else {
          return null;
        }
      }
    };

    function circle(radius) {
      return "m0," + radius
          + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius
          + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius
          + "z";
    }

    function index(projection, context) {
      var pointRadius = 4.5,
          projectionStream,
          contextStream;

      function path(object) {
        if (object) {
          if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
          geoStream(object, projectionStream(contextStream));
        }
        return contextStream.result();
      }

      path.area = function(object) {
        geoStream(object, projectionStream(areaStream));
        return areaStream.result();
      };

      path.measure = function(object) {
        geoStream(object, projectionStream(lengthStream));
        return lengthStream.result();
      };

      path.bounds = function(object) {
        geoStream(object, projectionStream(boundsStream));
        return boundsStream.result();
      };

      path.centroid = function(object) {
        geoStream(object, projectionStream(centroidStream));
        return centroidStream.result();
      };

      path.projection = function(_) {
        return arguments.length ? (projectionStream = _ == null ? (projection = null, identity$1) : (projection = _).stream, path) : projection;
      };

      path.context = function(_) {
        if (!arguments.length) return context;
        contextStream = _ == null ? (context = null, new PathString) : new PathContext(context = _);
        if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
        return path;
      };

      path.pointRadius = function(_) {
        if (!arguments.length) return pointRadius;
        pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
        return path;
      };

      return path.projection(projection).context(context);
    }

    function transformer(methods) {
      return function(stream) {
        var s = new TransformStream;
        for (var key in methods) s[key] = methods[key];
        s.stream = stream;
        return s;
      };
    }

    function TransformStream() {}

    TransformStream.prototype = {
      constructor: TransformStream,
      point: function(x, y) { this.stream.point(x, y); },
      sphere: function() { this.stream.sphere(); },
      lineStart: function() { this.stream.lineStart(); },
      lineEnd: function() { this.stream.lineEnd(); },
      polygonStart: function() { this.stream.polygonStart(); },
      polygonEnd: function() { this.stream.polygonEnd(); }
    };

    function fit(projection, fitBounds, object) {
      var clip = projection.clipExtent && projection.clipExtent();
      projection.scale(150).translate([0, 0]);
      if (clip != null) projection.clipExtent(null);
      geoStream(object, projection.stream(boundsStream));
      fitBounds(boundsStream.result());
      if (clip != null) projection.clipExtent(clip);
      return projection;
    }

    function fitExtent(projection, extent, object) {
      return fit(projection, function(b) {
        var w = extent[1][0] - extent[0][0],
            h = extent[1][1] - extent[0][1],
            k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])),
            x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
            y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    function fitSize(projection, size, object) {
      return fitExtent(projection, [[0, 0], size], object);
    }

    function fitWidth(projection, width, object) {
      return fit(projection, function(b) {
        var w = +width,
            k = w / (b[1][0] - b[0][0]),
            x = (w - k * (b[1][0] + b[0][0])) / 2,
            y = -k * b[0][1];
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    function fitHeight(projection, height, object) {
      return fit(projection, function(b) {
        var h = +height,
            k = h / (b[1][1] - b[0][1]),
            x = -k * b[0][0],
            y = (h - k * (b[1][1] + b[0][1])) / 2;
        projection.scale(150 * k).translate([x, y]);
      }, object);
    }

    var maxDepth = 16, // maximum depth of subdivision
        cosMinDistance = cos(30 * radians); // cos(minimum angular distance)

    function resample(project, delta2) {
      return +delta2 ? resample$1(project, delta2) : resampleNone(project);
    }

    function resampleNone(project) {
      return transformer({
        point: function(x, y) {
          x = project(x, y);
          this.stream.point(x[0], x[1]);
        }
      });
    }

    function resample$1(project, delta2) {

      function resampleLineTo(x0, y0, lambda0, a0, b0, c0, x1, y1, lambda1, a1, b1, c1, depth, stream) {
        var dx = x1 - x0,
            dy = y1 - y0,
            d2 = dx * dx + dy * dy;
        if (d2 > 4 * delta2 && depth--) {
          var a = a0 + a1,
              b = b0 + b1,
              c = c0 + c1,
              m = sqrt(a * a + b * b + c * c),
              phi2 = asin(c /= m),
              lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a),
              p = project(lambda2, phi2),
              x2 = p[0],
              y2 = p[1],
              dx2 = x2 - x0,
              dy2 = y2 - y0,
              dz = dy * dx2 - dx * dy2;
          if (dz * dz / d2 > delta2 // perpendicular projected distance
              || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 // midpoint close to an end
              || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) { // angular distance
            resampleLineTo(x0, y0, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
            stream.point(x2, y2);
            resampleLineTo(x2, y2, lambda2, a, b, c, x1, y1, lambda1, a1, b1, c1, depth, stream);
          }
        }
      }
      return function(stream) {
        var lambda00, x00, y00, a00, b00, c00, // first point
            lambda0, x0, y0, a0, b0, c0; // previous point

        var resampleStream = {
          point: point,
          lineStart: lineStart,
          lineEnd: lineEnd,
          polygonStart: function() { stream.polygonStart(); resampleStream.lineStart = ringStart; },
          polygonEnd: function() { stream.polygonEnd(); resampleStream.lineStart = lineStart; }
        };

        function point(x, y) {
          x = project(x, y);
          stream.point(x[0], x[1]);
        }

        function lineStart() {
          x0 = NaN;
          resampleStream.point = linePoint;
          stream.lineStart();
        }

        function linePoint(lambda, phi) {
          var c = cartesian([lambda, phi]), p = project(lambda, phi);
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x0 = p[0], y0 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
          stream.point(x0, y0);
        }

        function lineEnd() {
          resampleStream.point = point;
          stream.lineEnd();
        }

        function ringStart() {
          lineStart();
          resampleStream.point = ringPoint;
          resampleStream.lineEnd = ringEnd;
        }

        function ringPoint(lambda, phi) {
          linePoint(lambda00 = lambda, phi), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
          resampleStream.point = linePoint;
        }

        function ringEnd() {
          resampleLineTo(x0, y0, lambda0, a0, b0, c0, x00, y00, lambda00, a00, b00, c00, maxDepth, stream);
          resampleStream.lineEnd = lineEnd;
          lineEnd();
        }

        return resampleStream;
      };
    }

    var transformRadians = transformer({
      point: function(x, y) {
        this.stream.point(x * radians, y * radians);
      }
    });

    function transformRotate(rotate) {
      return transformer({
        point: function(x, y) {
          var r = rotate(x, y);
          return this.stream.point(r[0], r[1]);
        }
      });
    }

    function scaleTranslate(k, dx, dy) {
      function transform(x, y) {
        return [dx + k * x, dy - k * y];
      }
      transform.invert = function(x, y) {
        return [(x - dx) / k, (dy - y) / k];
      };
      return transform;
    }

    function scaleTranslateRotate(k, dx, dy, alpha) {
      var cosAlpha = cos(alpha),
          sinAlpha = sin(alpha),
          a = cosAlpha * k,
          b = sinAlpha * k,
          ai = cosAlpha / k,
          bi = sinAlpha / k,
          ci = (sinAlpha * dy - cosAlpha * dx) / k,
          fi = (sinAlpha * dx + cosAlpha * dy) / k;
      function transform(x, y) {
        return [a * x - b * y + dx, dy - b * x - a * y];
      }
      transform.invert = function(x, y) {
        return [ai * x - bi * y + ci, fi - bi * x - ai * y];
      };
      return transform;
    }

    function projectionMutator(projectAt) {
      var project,
          k = 150, // scale
          x = 480, y = 250, // translate
          lambda = 0, phi = 0, // center
          deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, // pre-rotate
          alpha = 0, // post-rotate
          theta = null, preclip = clipAntimeridian, // pre-clip angle
          x0 = null, y0, x1, y1, postclip = identity$1, // post-clip extent
          delta2 = 0.5, // precision
          projectResample,
          projectTransform,
          projectRotateTransform,
          cache,
          cacheStream;

      function projection(point) {
        return projectRotateTransform(point[0] * radians, point[1] * radians);
      }

      function invert(point) {
        point = projectRotateTransform.invert(point[0], point[1]);
        return point && [point[0] * degrees$1, point[1] * degrees$1];
      }

      projection.stream = function(stream) {
        return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
      };

      projection.preclip = function(_) {
        return arguments.length ? (preclip = _, theta = undefined, reset()) : preclip;
      };

      projection.postclip = function(_) {
        return arguments.length ? (postclip = _, x0 = y0 = x1 = y1 = null, reset()) : postclip;
      };

      projection.clipAngle = function(_) {
        return arguments.length ? (preclip = +_ ? clipCircle(theta = _ * radians) : (theta = null, clipAntimeridian), reset()) : theta * degrees$1;
      };

      projection.clipExtent = function(_) {
        return arguments.length ? (postclip = _ == null ? (x0 = y0 = x1 = y1 = null, identity$1) : clipRectangle(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]), reset()) : x0 == null ? null : [[x0, y0], [x1, y1]];
      };

      projection.scale = function(_) {
        return arguments.length ? (k = +_, recenter()) : k;
      };

      projection.translate = function(_) {
        return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
      };

      projection.center = function(_) {
        return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees$1, phi * degrees$1];
      };

      projection.rotate = function(_) {
        return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees$1, deltaPhi * degrees$1, deltaGamma * degrees$1];
      };

      projection.angle = function(_) {
        return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees$1;
      };

      projection.precision = function(_) {
        return arguments.length ? (projectResample = resample(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
      };

      projection.fitExtent = function(extent, object) {
        return fitExtent(projection, extent, object);
      };

      projection.fitSize = function(size, object) {
        return fitSize(projection, size, object);
      };

      projection.fitWidth = function(width, object) {
        return fitWidth(projection, width, object);
      };

      projection.fitHeight = function(height, object) {
        return fitHeight(projection, height, object);
      };

      function recenter() {
        var center = scaleTranslateRotate(k, 0, 0, alpha).apply(null, project(lambda, phi)),
            transform = (alpha ? scaleTranslateRotate : scaleTranslate)(k, x - center[0], y - center[1], alpha);
        rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
        projectTransform = compose(project, transform);
        projectRotateTransform = compose(rotate, projectTransform);
        projectResample = resample(projectTransform, delta2);
        return reset();
      }

      function reset() {
        cache = cacheStream = null;
        return projection;
      }

      return function() {
        project = projectAt.apply(this, arguments);
        projection.invert = project.invert && invert;
        return recenter();
      };
    }

    function conicProjection(projectAt) {
      var phi0 = 0,
          phi1 = pi / 3,
          m = projectionMutator(projectAt),
          p = m(phi0, phi1);

      p.parallels = function(_) {
        return arguments.length ? m(phi0 = _[0] * radians, phi1 = _[1] * radians) : [phi0 * degrees$1, phi1 * degrees$1];
      };

      return p;
    }

    function cylindricalEqualAreaRaw(phi0) {
      var cosPhi0 = cos(phi0);

      function forward(lambda, phi) {
        return [lambda * cosPhi0, sin(phi) / cosPhi0];
      }

      forward.invert = function(x, y) {
        return [x / cosPhi0, asin(y * cosPhi0)];
      };

      return forward;
    }

    function conicEqualAreaRaw(y0, y1) {
      var sy0 = sin(y0), n = (sy0 + sin(y1)) / 2;

      // Are the parallels symmetrical around the Equator?
      if (abs(n) < epsilon) return cylindricalEqualAreaRaw(y0);

      var c = 1 + sy0 * (2 * n - sy0), r0 = sqrt(c) / n;

      function project(x, y) {
        var r = sqrt(c - 2 * n * sin(y)) / n;
        return [r * sin(x *= n), r0 - r * cos(x)];
      }

      project.invert = function(x, y) {
        var r0y = r0 - y;
        return [atan2(x, abs(r0y)) / n * sign(r0y), asin((c - (x * x + r0y * r0y) * n * n) / (2 * n))];
      };

      return project;
    }

    function conicEqualArea() {
      return conicProjection(conicEqualAreaRaw)
          .scale(155.424)
          .center([0, 33.6442]);
    }

    function albers() {
      return conicEqualArea()
          .parallels([29.5, 45.5])
          .scale(1070)
          .translate([480, 250])
          .rotate([96, 0])
          .center([-0.6, 38.7]);
    }

    // The projections must have mutually exclusive clip regions on the sphere,
    // as this will avoid emitting interleaving lines and polygons.
    function multiplex(streams) {
      var n = streams.length;
      return {
        point: function(x, y) { var i = -1; while (++i < n) streams[i].point(x, y); },
        sphere: function() { var i = -1; while (++i < n) streams[i].sphere(); },
        lineStart: function() { var i = -1; while (++i < n) streams[i].lineStart(); },
        lineEnd: function() { var i = -1; while (++i < n) streams[i].lineEnd(); },
        polygonStart: function() { var i = -1; while (++i < n) streams[i].polygonStart(); },
        polygonEnd: function() { var i = -1; while (++i < n) streams[i].polygonEnd(); }
      };
    }

    // A composite projection for the United States, configured by default for
    // 960×500. The projection also works quite well at 960×600 if you change the
    // scale to 1285 and adjust the translate accordingly. The set of standard
    // parallels for each region comes from USGS, which is published here:
    // http://egsc.usgs.gov/isb/pubs/MapProjections/projections.html#albers
    function albersUsa() {
      var cache,
          cacheStream,
          lower48 = albers(), lower48Point,
          alaska = conicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), alaskaPoint, // EPSG:3338
          hawaii = conicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), hawaiiPoint, // ESRI:102007
          point, pointStream = {point: function(x, y) { point = [x, y]; }};

      function albersUsa(coordinates) {
        var x = coordinates[0], y = coordinates[1];
        return point = null,
            (lower48Point.point(x, y), point)
            || (alaskaPoint.point(x, y), point)
            || (hawaiiPoint.point(x, y), point);
      }

      albersUsa.invert = function(coordinates) {
        var k = lower48.scale(),
            t = lower48.translate(),
            x = (coordinates[0] - t[0]) / k,
            y = (coordinates[1] - t[1]) / k;
        return (y >= 0.120 && y < 0.234 && x >= -0.425 && x < -0.214 ? alaska
            : y >= 0.166 && y < 0.234 && x >= -0.214 && x < -0.115 ? hawaii
            : lower48).invert(coordinates);
      };

      albersUsa.stream = function(stream) {
        return cache && cacheStream === stream ? cache : cache = multiplex([lower48.stream(cacheStream = stream), alaska.stream(stream), hawaii.stream(stream)]);
      };

      albersUsa.precision = function(_) {
        if (!arguments.length) return lower48.precision();
        lower48.precision(_), alaska.precision(_), hawaii.precision(_);
        return reset();
      };

      albersUsa.scale = function(_) {
        if (!arguments.length) return lower48.scale();
        lower48.scale(_), alaska.scale(_ * 0.35), hawaii.scale(_);
        return albersUsa.translate(lower48.translate());
      };

      albersUsa.translate = function(_) {
        if (!arguments.length) return lower48.translate();
        var k = lower48.scale(), x = +_[0], y = +_[1];

        lower48Point = lower48
            .translate(_)
            .clipExtent([[x - 0.455 * k, y - 0.238 * k], [x + 0.455 * k, y + 0.238 * k]])
            .stream(pointStream);

        alaskaPoint = alaska
            .translate([x - 0.307 * k, y + 0.201 * k])
            .clipExtent([[x - 0.425 * k + epsilon, y + 0.120 * k + epsilon], [x - 0.214 * k - epsilon, y + 0.234 * k - epsilon]])
            .stream(pointStream);

        hawaiiPoint = hawaii
            .translate([x - 0.205 * k, y + 0.212 * k])
            .clipExtent([[x - 0.214 * k + epsilon, y + 0.166 * k + epsilon], [x - 0.115 * k - epsilon, y + 0.234 * k - epsilon]])
            .stream(pointStream);

        return reset();
      };

      albersUsa.fitExtent = function(extent, object) {
        return fitExtent(albersUsa, extent, object);
      };

      albersUsa.fitSize = function(size, object) {
        return fitSize(albersUsa, size, object);
      };

      albersUsa.fitWidth = function(width, object) {
        return fitWidth(albersUsa, width, object);
      };

      albersUsa.fitHeight = function(height, object) {
        return fitHeight(albersUsa, height, object);
      };

      function reset() {
        cache = cacheStream = null;
        return albersUsa;
      }

      return albersUsa.scale(1070);
    }

    function identity$2(x) {
      return x;
    }

    function transform(transform) {
      if (transform == null) return identity$2;
      var x0,
          y0,
          kx = transform.scale[0],
          ky = transform.scale[1],
          dx = transform.translate[0],
          dy = transform.translate[1];
      return function(input, i) {
        if (!i) x0 = y0 = 0;
        var j = 2, n = input.length, output = new Array(n);
        output[0] = (x0 += input[0]) * kx + dx;
        output[1] = (y0 += input[1]) * ky + dy;
        while (j < n) output[j] = input[j], ++j;
        return output;
      };
    }

    function reverse(array, n) {
      var t, j = array.length, i = j - n;
      while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
    }

    function feature(topology, o) {
      if (typeof o === "string") o = topology.objects[o];
      return o.type === "GeometryCollection"
          ? {type: "FeatureCollection", features: o.geometries.map(function(o) { return feature$1(topology, o); })}
          : feature$1(topology, o);
    }

    function feature$1(topology, o) {
      var id = o.id,
          bbox = o.bbox,
          properties = o.properties == null ? {} : o.properties,
          geometry = object(topology, o);
      return id == null && bbox == null ? {type: "Feature", properties: properties, geometry: geometry}
          : bbox == null ? {type: "Feature", id: id, properties: properties, geometry: geometry}
          : {type: "Feature", id: id, bbox: bbox, properties: properties, geometry: geometry};
    }

    function object(topology, o) {
      var transformPoint = transform(topology.transform),
          arcs = topology.arcs;

      function arc(i, points) {
        if (points.length) points.pop();
        for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
          points.push(transformPoint(a[k], k));
        }
        if (i < 0) reverse(points, n);
      }

      function point(p) {
        return transformPoint(p);
      }

      function line(arcs) {
        var points = [];
        for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
        if (points.length < 2) points.push(points[0]); // This should never happen per the specification.
        return points;
      }

      function ring(arcs) {
        var points = line(arcs);
        while (points.length < 4) points.push(points[0]); // This may happen if an arc has only two points.
        return points;
      }

      function polygon(arcs) {
        return arcs.map(ring);
      }

      function geometry(o) {
        var type = o.type, coordinates;
        switch (type) {
          case "GeometryCollection": return {type: type, geometries: o.geometries.map(geometry)};
          case "Point": coordinates = point(o.coordinates); break;
          case "MultiPoint": coordinates = o.coordinates.map(point); break;
          case "LineString": coordinates = line(o.arcs); break;
          case "MultiLineString": coordinates = o.arcs.map(line); break;
          case "Polygon": coordinates = polygon(o.arcs); break;
          case "MultiPolygon": coordinates = o.arcs.map(polygon); break;
          default: return null;
        }
        return {type: type, coordinates: coordinates};
      }

      return geometry(o);
    }

    const labelTweaks = [
      {label : "AL"},
      {label : "AK"},
      {label : "AR"},
      {label : "AZ"},
      {label : "CA"},
      {label : "CO"},
      {label : "CT", tweaks: [3, 20]},
      {label : "DE", tweaks: [20, 10]},
      {label : "FL", tweaks: [15, 0]},
      {label : "GA"},
      {label : "HI", tweaks: [8, 5]},
      {label : "ID"},
      {label : "IL"},
      {label : "IN"},
      {label : "IA"},
      {label : "KS"},
      {label : "KY"},
      {label : "LA", tweaks: [-10, 0]},
      {label : "ME"},
      {label : "MD"},
      {label : "MA", tweaks: [40, -5]},
      {label : "MI", tweaks: [15, 30]},
      {label : "MN"},
      {label : "MS"},
      {label : "MO"},
      {label : "MT"},
      {label : "MT"},
      {label : "NE"},
      {label : "NV"},
      {label : "NH", tweaks: [-3, 10]},
      {label : "NJ", tweaks: [25, 10]},
      {label : "NM"},
      {label : "NY"},
      {label : "NC"},
      {label : "ND"},
      {label : "OH"},
      {label : "OK"},
      {label : "OR"},
      {label : "PA"},
      {label : "RI", tweaks: [8, 17]},
      {label : "SC"},
      {label : "SD"},
      {label : "TN"},
      {label : "TX"},
      {label : "UT"},
      {label : "VT", tweaks: [-5, 0]},
      {label : "VA"},
      {label : "WA"},
      {label : "WV", tweaks: [-5, 0]},
      {label : "WI"},
      {label : "WY"},
    ];

    function matchLabelToTweak(state) {
      const index = labelTweaks.findIndex(st => st.label === state.properties.STATE_ABBR);
      return (labelTweaks[index].tweaks) ? labelTweaks[index].tweaks : null
    }

    /* src/components/Crest.svelte generated by Svelte v3.16.5 */

    const file = "src/components/Crest.svelte";

    function create_fragment(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;
    	let path6;
    	let path7;
    	let path8;
    	let path9;
    	let path10;
    	let path11;
    	let path12;
    	let path13;
    	let path14;
    	let path15;
    	let path16;
    	let path17;
    	let path18;
    	let path19;
    	let path20;
    	let path21;
    	let path22;
    	let path23;
    	let path24;
    	let path25;
    	let path26;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			path6 = svg_element("path");
    			path7 = svg_element("path");
    			path8 = svg_element("path");
    			path9 = svg_element("path");
    			path10 = svg_element("path");
    			path11 = svg_element("path");
    			path12 = svg_element("path");
    			path13 = svg_element("path");
    			path14 = svg_element("path");
    			path15 = svg_element("path");
    			path16 = svg_element("path");
    			path17 = svg_element("path");
    			path18 = svg_element("path");
    			path19 = svg_element("path");
    			path20 = svg_element("path");
    			path21 = svg_element("path");
    			path22 = svg_element("path");
    			path23 = svg_element("path");
    			path24 = svg_element("path");
    			path25 = svg_element("path");
    			path26 = svg_element("path");
    			attr_dev(path0, "d", "M136.085 103.539c-.589.598-1.161.948-2.072 1.29-.782.23-2.845-.286-3.646-1.75-3.803-6.9526-.074-13.8598-.222-20.8859v-1.5015c-.404-4.4376-.782-5.81-3.314-9.2813-1.695-.1468-2.238-.0375-3.564-1.0036l.23-.2126c.736-.1197 1.003-.2848 1.335-.8932.019-.0817-.064-.2109-.257-.35-1.162-1.086-2.819-2.3478-4.135-2.8177-1.713-.552-4.908-1.3713-7.201-1.5093 2.293 1.1692 3.701 2.4948 5.377 4.0781.46-.6808.304-1.3073.608-2.0349h.249c.727.7641.967 2.8734 1.012 3.8865 1.824 2.3853 3.564 4.3463 3.85 7.1276.221 2.8724-1.298 4.6785-3.122 4.926-1.51.1755-2.946 0-3.776-1.2333-.781-1.5011-.672-2.5323.286-4.1719-1.16.2672-2.551.7099-3.527 1.8323-1.316 1.3084-1.068 2.3942-.856 3.6926.359.6642.552.9948 1.049 1.5844-.082.0927-1.328-.9948-3.048-1.1328.231-1.5557.406-3.177.526-4.8708.672-.9114 1.15-1.9245 1.353-2.874 4.384-.1016 6.576-2.2093 6.327-7.0896-.415.9568-1.087 1.547-1.86 1.7486-1.548.4973-3.416.4609-4.236-1.0496-.46-.837-.912-1.7119-1.372-2.5036l.009-2.6615c.82.0271 1.648.1104 2.339.2199 2.209.4337 10.341 1.1614 11.336 3.4634.396 1.1224 0 2.099-.995 2.7074 1.031.3593 2.081.441 3.103.441 2.8-.1926 4.024-2.4853 2.956-4.8984-.588-.3229-1.603-.7276-2.072-.9582l.304-.3959c1.049.2031 2.192.5719 3.26.0744 3.59-2.1093 3.941-8.2333 3.941-8.2333-1.547.7829-3.029.2672-4.595.6917-1.27.2849-2.017 1.4453-2.441 2.5323-.625.1093-.432.0729-.303-.461.156-.4697.856-1.1781.691-1.7134-.388-1.9792-2.137-3.2959-4.2-3.0292-.967.1573-1.86.304-2.587.8197l.764.5339c2.643 1.7136 1.712 4.3838-.929 5.4333-3.795.9765-7.221.138-10.572-1.2979l.009-.7005c.708.3047 1.418.5896 2.136.8473.728-.0738 1.354-.5896 1.851-1.2525 2.661-3.388 3.463-7.2193 3.048-10.7647-.156-1.3173-.443-2.7986-.939-4.0613-.442 4.024-2.661 8.9427-6.096 11.99v-.6353c2.514-2.4307 4.19-5.24 5.203-8.26.349-1.244.46-2.468.589-3.6094l-.064-.12c-.48.8187-1.06 1.592-1.88 2.2187-.137.3133-1.424 2.9707-3.35 4.384l-.148.12-.342-.0293.01-3.444c-.718-.1654-1.363-.552-1.924-1.0947v.488l-.019 12.3481v.6912l-.017 8.0938v5.9584c-.02 1.7681-.084 3.453-.195 5.0744-.055.7458-.109 1.4817-.184 2.2094-.064.5719-.128 1.1422-.201 1.6943-.462 3.5728-1.218 6.7875-2.276 9.7161.774-.7464 1.576-1.051 2.376-1.06.148-.4598.285-.9296.414-1.4088.259.0558.516.1016.755.1198l2.284.1756-.092.3582-1.428.212c-.1.2943-.165.6084-.193.9208.213.0923.424.1939.626.3048.94.4958 1.74 1.4088 2.376 2.4219-.009-.9219.194-1.8516.599-2.8376.533-1.0219 1.695-2.1443 2.763-2.2004.994 0 1.214.3957 1.197 1.3255-.129.7281-.433 1.3906-1.143 2.2292-.396.69-2.14 1.8973-3.172 2.1822.094.414.567.6719.659 1.0678.184.4338.332.8478.432 1.2161.589 3.0025.433 4.9082 2.137 7.2752.212-1.76.387-3.518 1.436-5.2033 1.52-2.7995 3.656-5.0651 5.563-7.6798-.231 3.2042-.94 6.9714-2.459 9.9451-1.069 1.85-1.694 2.634-4.024 3.352-.589.229-.018.138-.028.203.064.082.139.165.212.258l2.191 2.587 1.096 2.182.664-.939.377.157c-.36.617-.534 1.049-.69 1.483l1.933 3.876c.12.525.193 1.05.231 1.594-.232 1.196 1.881 1.62 3.097 3.066 4.921-8.3.917-10.029.917-10.029s1.243 1.013 1.796 1.208c1.804.57 4.651-.213 5.635-1.888.655-1.18 1.16-2.709.249-4.605zm-7.956-69.1297l-1.602 1.428c-.34 0-.286.0547-.359-.2666l1.28-1.2907c1.141-1.6746.681-4.1987-1.28-5.008-.193.2107-.433.396-.719.5427-.073 3.5173-.037 6.668-1.049 7.2653-1.023.8294-3.472-.4973-4.964 2.8174.848-.2934 1.74-.1001 2.404.2399 1.436.7374 1.639 2.184 1.049 3.3054-.718.9306-1.16.9493-2.034 1.4826 2.569.5907 2.586.7107 5.009.424 1.445-.2853 2.864-1.9066 2.744-3.2413l-.092-.4413-.268-.516c-.515-.24-1.012-.4334-1.151-1.0774l.498.064c2.385 1.8694 5.701-1.9879 6.805-3.8399-2.017.1933-4.401-2.6707-6.271-1.8881zm1.012-16.6213c-.884 1.068-1.877 2.2107-2.466 3.4813-.176.3774-.323.7827-.443 1.224 2.063-1.0026 2.265-1.9426 3.536-4.8066-.229.0373-.433.0746-.627.1013zm-3.241 6.1894c-.285 1.592-.377 3.3786-.423 5.12a7.946 7.946 0 00.618-.4974c.957-1.152 1.196-3.4453-.195-4.6226zM7.2947 16.84c-.4067.0547-.8107.092-1.216.1107l-.6814-.148c1.6574 1.576 1.0867 3.988 3.6654 4.5306-.452-2.0626-1.2067-3.3973-1.768-4.4933zm2.0613 6.4093c-.7733 1.2334-.7573 2.5854.212 3.8534.0933-1.4-.1093-2.7947-.212-3.8534zm11.024-7.312l.0547.2587c.0453-.0093.092-.0093.1386-.0093-.0653-.084-.1293-.1667-.1933-.2494zm50.5267 4.7241c-5.8107.056-11.2614.4786-16.6214 1.2253h28.804c-4.428-.8294-8.6093-1.308-12.1826-1.2253zm40.4083 74.7035c-.71-.0546-1.99-.427-2.496-.7306l-1.216 1.4546c-.995.9948-3.067 1.436-3.296 1.8423-.747 1.2984-1.032 1.6291-1.935 2.8178-.064.082-.128.156-.184.239-.396.507-.809 1.003-1.233 1.492-.074.083-.148.166-.222.248-1.0036 1.133-2.0903 2.22-3.2676 3.27-.0107 0-.0107.009-.0201.009-.5613.497-1.1506.994-1.7493 1.473a8.7626 8.7626 0 01-.34.268c-.5253.414-1.068.828-1.6307 1.233-.12.083-.2306.176-.3493.257-1.3627.968-2.7986 1.916-4.3466 2.838-.092.063-.1934.118-.2947.174-.6547.396-1.3254.783-2.0254 1.17-.1933.11-.3866.221-.5893.331-.636.349-1.2893.7-1.9533 1.041-.1933.102-.3867.211-.5894.313-1.7026.883-3.508 1.758-5.4053 2.633-.2387.111-.488.222-.7267.333-.7093.321-1.4373.653-2.1826.984-.3134.138-.6347.276-.9574.414-.5613.249-1.1426.498-1.732.755-.1466.065-.3026.129-.4506.194-.3134.129-.6174.258-.9307.387-1.0307.441-2.0893.884-3.176 1.326-.9853-.387-1.9533-.774-2.9107-1.17-.2666-.111-.5333-.221-.8013-.33-.736-.305-1.4547-.609-2.164-.913-.1013-.046-.2013-.082-.2947-.129-.1373-.055-.2759-.12-.4133-.174-.9213-.406-1.8333-.81-2.7173-1.224-.0734-.038-.1467-.066-.22-.102-.82-.378-1.612-.765-2.3947-1.142-.212-.102-.4147-.212-.6173-.314-.728-.359-1.436-.718-2.136-1.086-.1294-.065-.2493-.129-.3787-.194-.8373-.441-1.6573-.893-2.4587-1.344-.064-.037-.1186-.074-.184-.11-.7266-.414-1.4359-.83-2.1266-1.253a12.4671 12.4671 0 01-.396-.249c-1.5293-.938-2.9747-1.906-4.3467-2.891l-.1107-.083c-.644-.469-1.2706-.949-1.888-1.428-.064-.054-.1373-.109-.2026-.165-1.2974-1.041-2.5227-2.108-3.6547-3.205-.0187-.027-.0467-.045-.0653-.074-.552-.534-1.0774-1.077-1.5934-1.629-.0173-.027-.0453-.056-.0733-.083-1.0493-1.142-2.016-2.33-2.8907-3.5547a.5001.5001 0 00-.0653-.0823 34.083 34.083 0 01-1.224-1.8423h-.0093c-1.7227-2.7905-3.012-5.7645-3.8587-8.9781-.4507-1.7405-.7827-3.5547-.9667-5.4333-.0746-.7083-.304-2.8922-.3133-2.9651-.0187-.1197-.544-8.4437-.544-10.0287l-.028-11.6572v-.4792l-.036-14.0621v-.1373c-.4413.5706-.9667.9666-1.528 1.1973-.1293.0547-.2587.092-.3867.128l.008 3.2227c-.948-.7907-1.74-2.072-2.292-3.4054a.5636.5636 0 01-.12-.0479c-1.4-.5694-4.1893-6.0307-6.5653-8.5814-.0187-.0187-.0373-.028-.0467-.0453-1.216.2293-2.136.6533-2.992.6893-.452.028-.8933-.0547-1.3453-.34-1.372-1.4093-1.164-4.1853-1.4133-6.2947.0933-.5893.1293-1.4733.1933-2.008-1.8693.8014-2.4533 3.0454-2.2973 4.536.3413.516 1.0866.396 1.556.7827.0466.148.0466.2307-.1107.4333-1.8133-.4333-2.5867-.452-4.4747.0174-1.5293.7093-2.92.82-4.1173.58.9493 2.8733 3.3707 5.6187 6.9907 4.78l1.224-.4414v.2667c-.5334.2307-.9574.5893-1.5094.764-.2493 1.6027.3774 3.104 1.676 4.0787 1.924 1.0413 3.5267 1.2347 5.4147.148-1.5293-.912-2.064-1.8867-2.2107-3.388 0-2.644 4.116-2.46 5.58-1.1054 1.4654 1.2614 2.2107 2.8174 2.2654 5.7094.028-.036.0466-.0747.064-.1107.3053 3.0933 1.6586 6.612 3.7946 8.9773 0 .1667-.2306.02-.3506 0-3.02-3.4893-3.572-7.1266-3.8854-10.2479-1.9426 4.8613-2.68 9.5213 2.1734 15.1845l.276.3228c.856-.276 1.704-.5714 2.5413-.8838v.552c-1.1133.4427-2.1827.8204-3.2507 1.1052-2.744.4782-6.04.8844-8.2133-1.5557-1.3173-2.2839.1373-3.9597 2.1173-4.4211-.856-.6626-1.7026-.856-2.6333-1.0133-2.0907.0653-3.8027.4613-4.4573 3.1037.424.5443.8013 1.1328 1.1613 1.7588h-.4613s-1.756-1.7744-4.0094-2.3072c-1.2906-.3048-2.0293-.0704-3.496-1.1646-.14 1.6193-.012 2.2453.428 4.4084.212 1.04 1.004 2.3098 1.672 3.0885 1.2134 1.414 3.4267 2.2457 5.0094 1.6484l.5533-.1292c0 .2292-.056.3871-.12.5885-.7.3047-1.124.4246-1.8427.4246-1.6573 5.1744 3.6574 5.7734 6.308 5.1744-1.316-1.0583-2.1906-2.302-1.4813-3.8578 1.1227-1.8333 4.152-1.6666 6.132-1.9426 3.26-.1667 5.2947-.5355 6.5933-.4792l.0094.6536c-9.1094.5989-11.7867 4.0052-11.7867 4.0052.6813.9021 1.1227 1.013 2.1907 1.5104l.0933.1937c-1.06.8751-4.0613.8011-4.6413.8011-.6734.5428-1.1507 1.4089-1.5294 2.4489-.9853 2.736-1.1413 5.5251-1.1413 8.4079-.3867 7.1 3.2973 14.6693-1.068 21.2815-.5347.414-.82.57-1.4547.782-.5253.102-1.2066.147-1.8786-.156-1.0227-.461-1.188-1.363-1.5294-1.298-.6533.128-1.344 3.803.4974 5.524.7186.672 1.6586.887 2.2653 1.032 2.5813.614 3.7387-1.022 4.1813-1.428.34 0-2.128 2.359-1.0693 5.95.7373 1.979 2.432 3.618 2.128 4.853 1.0773-.746 2.44-1.972 3.5547-3.408.2386-1.243.6813-2.338 1.28-3.749l.2213-2.024c.1107-.305.248-.563.4133-.793-.156-.534-.3493-1.05-.4226-1.722l.1933-.054c.2573.414.4227.864.6347 1.289.792-.839 2.184-1.084 3.2706-2.704-.0453-.193.38-.291.3534-.494-2.46-1.888-3.652-3.12-5.06-5.4873-1.0227-3.1025-1.124-8.591-1.124-8.591 1.372.8009 3.1493 2.5509 3.868 3.8869 1.104 2.6797 1.6573 4.4011 2.192 7.2374.0453.682.092 1.336.1746 1.953.1374-.278.276-.572.4147-.894.5333-2.5881.58-3.8032 1.3347-5.8016.276-.7647.552-1.5016.8653-2.1371-.7453-.5061-.064.0106.0733-.9842-.9386-.1382-2.476-1.7319-3.0293-2.2292-1.104-1.5834-1.0867-2.7812-.0453-3.4167 1.2986-.4688 3.6466.314 3.8853 2.5511.1107 1.0416.1667 1.7968.0653 2.6066.4414-.4702.9574-.7645 1.62-.8296.3587-.0817.7654-.1093 1.2067-.0729.4147-.7093.608-1.5469.5253-2.4219l-1.0693-.5896-.1373-.2109.1373-.2864.1387-.0641c.3226.0729.6813.1109 1.0586.1016.3507 1.3349.7654 2.6421 1.2614 3.9129.24.4609.488.9584.728 1.4464.4973.9937 1.004 1.9703 1.52 2.624.0453.0557.1.1104.1373.1651l1.4 2.0822-3.2773-1.8801c-1.604-1.0771-2.6067 0-2.0814 1.8333 2.7254 3.3971 9.208 9.2111 9.208 9.0731-.672-1.106-1.4186-3.778-1.9253-5.656 4.5307 5.506 11.0507 10.433 19.7893 15.01 2.5147 1.316 5.212 2.605 8.104 3.876 2.0814.911 4.264 1.815 6.5387 2.698l.7174.278.7186-.296c1.556-.636 3.0573-1.262 4.5213-1.888 2.348-1.003 4.5774-1.998 6.6854-2.993 11.1146-5.221 19.08-10.506 24.2923-17.579-.404 2.191-1.04 4.598-1.851 6.215 3.481-2.928 6.351-5.93 7.925-8.6913.719-1.151 1.376-2.741.99-3.6068zM22.58 83.0405l-.3773-.1469c.5346-.3411.8186-.4244 1.0866-1.0129.608-1.3724.5707-2.7814-.6546-4.2464-.2667-.4412-1.3067-1.0312-2.0534-1.0312.1107 1.3905-.248 3.315-1.528 4.3281-1.1426 1.0875-2.496 1.0312-3.7666 1.0312-1.408-.1745-2.044-1.4724-2.3667-2.6328-.7-2.4219-.092-4.8803 1.492-7.2745l.4147-.6172 1.2426-1.3072c1.004-.5991.8934-1.9808 1.8414-4.0068h.424l.0746.0468.248 1.5928v.0921l1.1054-.7187 4.3-2.3657.0093 3.6729c-.248.3595-.524.7282-.856 1.0964-1.6027 1.7318-4.7707 1.1146-5.24-1.5469-1.28 2.4948.184 5.3324 1.308 6.1876 1.436.8203 2.7987.8843 3.7747.1197.48-.3958 1.0693-1.6573 1.0693-1.6573.008.1199.008.2396.0173.3595 0 0 .3867 6.915.636 8.0572.0187.4516.0547.8933.092 1.3266-.7653-.074-1.5293.0547-2.2933.6536");
    			attr_dev(path0, "fill", "#4249A4");
    			add_location(path0, file, 4, 116, 191);
    			attr_dev(path1, "d", "M69.1335 137.354c15.9414-.085 31.0725-6.775 39.6545-12.663.72 2.164 4.887 4.612 10.411 1.25 4.22-2.304 6.053-7.441 5.055-11.774l-3.387-6.776-2.195-2.583c-2.445-2.802-2.168-4.801-2.832-8.1644-.472-1.7187-1.837-4.4129-3.721-5.4115-2.028-1.1093-4.359-1.2514-6.248 2.5522-1.305 2.2224-.847 4.7693.264 4.0453l2.847-3.3776c1.804-.8631 2.64 1.9989 1.333 4.0823-5.139 9.0497-22.3815 21.3807-39.4588 21.7417-11.3547.166-31.1827-4.194-44.8694-21.2444-.5293-1.8296.112-2.7473 1.7214-1.6629l4.0613 2.0806v-.841l-1.6733-3.9636c-1.7227-1.9724-4.444-2.8031-6.0547-2.414-1.804.1681-2.6093 2.138-3.4427 4.4442-.752 1.9958-.8053 3.2214-1.3346 5.8031-1.832 4.302-4.108 4.189-4.9134 6.385l-.2226 2.025c-.8333 1.948-1.3587 3.304-1.4707 5.279-.2773 6.967 3.748 11.189 10.1067 14.243 4.7226 2.11 9.9413 1.495 11.1-1.524 8.5266 4.613 21.5827 9.326 35.2693 8.468z");
    			attr_dev(path1, "fill", "#231F20");
    			add_location(path1, file, 4, 10707, 10782);
    			attr_dev(path2, "d", "M122.58 113.369c-.556-1.19-1.054-2.36-1.694-3.493.528 1.305.582 1.885.334 3.218.334 1.165.667 3.079-.61 4.657-.306-1.023-.471-3.132-1.111-3.107-.803.946-.441 1.751.997 4.44.031.363.308 1.554-.554 2.302l-2.799-4.161-1.167.974c.308.387-.081.885-.804 1.495-.36.305-.832.638-1.332 1l.724.499.608-.276 2.884-1.279-.44.75-2.444 1.277-1.276.665.308.721.968-.417 2.467-1.081c-.636 1.027-1.521 1.692-2.467 2.138-.692.331-1.442.554-2.106.691-.914-.249-1.111-1.164-1.168-2.162l-1.662 1.36c.332.858.834 1.496 1.524 1.967 1.028.5 2.222.529 3.412.222 2.359-.552 4.66-2.274 5.686-3.801 1.97-2.941 2.053-5.185 1.722-8.599M29.7723 126.326c-.2494 2.273-3.5787 1.579-5.0494 1.108-.22-.081-.4426-.194-.6933-.305-2.4667-1.332-5.352-3.938-6.4907-6.324 1.4427 1.082 3.3294 2.357 4.884 3.217-.8346-1.219-1.7466-2.302-2.3586-3.634l3.9653 1.611 1.6907.663c-.36-.223-.94-.582-1.6907-1.109-1.4147-1.026-3.384-2.606-5.1027-4.688l-.832.415.4414 1.332c-.496-.471-1.412-1.942-1.496-1.414l-.2227 2.027c-.888-1.333-1.468-2.967.1387-4.188-.552-.611-1.0547-1.112-1.7187-1.612-1.468 4.355-.1667 9.182 5.464 13.341.664.612 1.9133 1.391 3.328 1.999 2.9413 1.25 6.6293 1.858 7.74-.86-.752-.583-1.3893-1.026-1.9973-1.579");
    			attr_dev(path2, "fill", "#F8BC23");
    			add_location(path2, file, 4, 11572, 11647);
    			attr_dev(path3, "d", "M118.837 107.08c-2.468-1.722-3.278-3.388-3.665-5.415-.221-1.244-.276-2.6334-.469-4.2729-.222-2.4401-2.164-6.2709-5.747-5.9021-.893.2016-1.639 1.3161-2.956 2.7901l-.911 1.9052.259.0651c3.029-2.6797 3.968-3.2317 4.833-2.9833 1.271.4885 1.999 1.8505 2.248 3.6822.027 1.7787-4.329 7.0727-6.024 9.0717-5.856 5.995-12.4489 9.401-18.5822 11.952-5.3773 2.155-9.8893 3.5-14.5493 3.942-3.8667.369-7.836.119-12.496-.792-2.6614-.525-5.5427-1.261-8.7667-2.228-9.0067-3.197-17.8827-7.856-25.5173-16.06-1.2427-1.363-1.988-2.469-2.4667-3.5549-.2773-.6912-.4427-1.3813-.4987-2.1641-.1373-.9765.084-1.6391.4987-2.026.4507-.3864 1.1133-.4973 1.8867-.4412.8933.1276 2.7253 1.1417 3.508 1.9699.0466.0546.1013.1109.1386.1666l-.9213-2.3593a16.353 16.353 0 00-.736-.4324c-1.1693-.6443-2.6973-1.2979-3.876-.8733-.36.1468-.692.3853-.94.7822-1.7493 3.2968-2.1093 5.9296-2.6333 9.2085-.4414 2.099-2.4134 3.765-3.692 5.434-.7467 1.169-.6374 2.3.0546 3.406 2.1907 2.781 4.7054 5.136 7.2107 7.412 12.6693 11.521 28.5133 14.869 34.588 15.621 4.568.568 10.0187.563 10.0187.563 14.6973-.552 29.8093-4.797 44.1745-16.556.856-.673 1.723-1.392 2.524-2.136 1.721-1.585 3.164-3.486 4.611-5.291l.109-1.133-1.215-3.351zm-83.6595 16.539l-1.832-1.456.368-2.201-4.448-3.516-2.0254.893-1.64-1.291 9.5227-3.876 1.5733 1.243-1.5186 10.204zm12.008 3.94c-.3774.747-.7747 1.169-1.1787 1.29-.4147.11-.9947-.027-1.7587-.414l-4.752-2.432c-.764-.387-1.216-.781-1.3626-1.188-.1467-.395-.028-.966.3506-1.703l2.1454-4.199c.3773-.746.7733-1.169 1.1786-1.289.4147-.111.9947.027 1.7587.414l4.752 2.431c.764.387 1.216.782 1.3627 1.188.1466.396.028.967-.3507 1.704l-.3867.754-1.9973-.653.772-1.51-5-2.561-2.5867 5.056 5.0014 2.551.8826-1.714 1.648 1.336-.4786.939zm11.0133 5.37l-.5613-2.157-5.5067-1.38-1.4827 1.649-2.016-.498 7.0814-7.45 1.9506.488 2.8094 9.918-2.2747-.57zm15.3973-1.585c-.424.774-1.0213 1.345-1.796 1.704-.7093.323-1.768.496-3.1866.544l-5.22.146-.2587-8.941 5.7547-.165c1.6493-.047 2.9293.303 3.8226 1.049.9014.754 1.3707 1.823 1.4187 3.223.0267.884-.1573 1.703-.5347 2.44zm4.4747 1.511l-1.988-8.721 8.9226-2.026.3401 1.484-6.896 1.573.4413 1.943 4.024-.92.3413 1.491-4.024.913.488 2.164 6.98-1.585.3774 1.639-9.0067 2.045zm21.512-7.377l-2.348-5.009c-.0933-.193-.212-.488-.3413-.893-.0094.506-.0374.865-.0734 1.078l-1.1413 5.469-.3787.183-4.9546-2.633c-.3574-.192-.6534-.396-.8734-.608.184.314.3307.59.4507.848l2.348 5-1.5187.719-3.804-8.095 1.5187-.718 6.1147 3.103 1.4373-6.648 1.5013-.71 3.8029 8.095-1.7402.819zm7.4122-4.787l-2.394-3.216-6.6769-1.187 2.2289-1.657 4.512.922.424-4.597 1.954-1.463-.784 6.684 2.421 3.261-1.685 1.253zm-35.9415 10.542c-.588.416-1.564.646-2.9467.692l-2.6787.073-.1666-5.663 3.6933-.111c1.9613-.054 2.9653.847 3.0213 2.707.036 1.077-.2773 1.841-.9226 2.302zm-13.868-2.237l-3.8027-.949 2.8173-3.048.9854 3.997zm-22.404-14.785l-.7454 4.052-3.076-2.431 3.8214-1.621");
    			attr_dev(path3, "fill", "#F8BC23");
    			add_location(path3, file, 4, 12778, 12853);
    			attr_dev(path4, "d", "M42.6455 41.8053c-.092.948-.1374 1.8867-.2027 2.1907-.0733.3307-.3213.828-.5333 1.1973-.092-.46-.268-1.0586-.3413-1.4093-.092-.4787-.0001-1.676.0466-1.888.0547-.22-.332-1.4627.4134-1.1787.3693.148.5439.636.6173 1.088M47.3428 42.468c.2107.312.5707 2.412.5707 3.3693 0 .9587-.2307.8574-.2307.8574s-.0827-.756-.34-1.9254c-.2587-1.1693-.2866-1.888-.2866-2.3293 0-.4427.0839-.2853.2866.028zM55.3268 43.112c.0907.3133.3307 1.492.404 1.9707.0734.4786-.3867.8106-.3867.8106s-.0173-1.4373-.2853-2.2746c-.2666-.8387-.5253-1.7227-.6253-1.8694-.0933-.148-.2587-.3413-.2587-.3413l.1653-1.2427s.2401 0 .3601.552c.12.5534.524 2.092.6266 2.3947M12.0576 22.952h1.284l-.676-.356-.608.356M10.807 14.7827c-.7014-.8094 1.4773-1.056.6333-.1747l-.6333.1747z");
    			attr_dev(path4, "fill", "#231F20");
    			add_location(path4, file, 4, 15656, 15731);
    			attr_dev(path5, "d", "M10.2134 12.4947l.42-.2467 1.056-.3507");
    			attr_dev(path5, "stroke", "#231F20");
    			attr_dev(path5, "stroke-width", ".0143");
    			attr_dev(path5, "stroke-linecap", "square");
    			add_location(path5, file, 4, 16417, 16492);
    			attr_dev(path6, "d", "M84.9683 85.0483c0-.0375-.0001-.0739.0093-.1104-.0094.0636-.0093.1198-.0093.1833v-.0729z");
    			attr_dev(path6, "fill", "#25284E");
    			add_location(path6, file, 4, 16529, 16604);
    			attr_dev(path7, "d", "M111.435 128.439h-.608l-1.216 3.13-1.216-3.13h-.618l-.284 3.812h.498l.229-2.928 1.169 2.938h.424l1.179-2.938.221 2.928h.515l-.293-3.812zm-4.559 0h-2.855v.478h1.206v3.334h.516v-3.334h1.206l-.073-.478z");
    			attr_dev(path7, "fill", "#231F20");
    			add_location(path7, file, 4, 16644, 16719);
    			attr_dev(path8, "fill-rule", "evenodd");
    			attr_dev(path8, "clip-rule", "evenodd");
    			attr_dev(path8, "d", "M48.4202 73.74c-7.544 0-13.6653 6.1197-13.6653 13.6651 0 7.5442 6.1213 13.6659 13.6653 13.6659 7.5453 0 13.6653-6.1217 13.6653-13.6659 0-7.5454-6.12-13.6651-13.6653-13.6651zm0 25.8161a12.1948 12.1948 0 01-4.7347-.953c-.2053-.4844-.5639-1.3204-.8226-1.8385-.0893-2.2292 1.2426-2.9273 1.6906-4.4621.2347-.7994.6454-1.612 1.2867-2.0937.5307.3031 1.1133.6744 1.7347.837.528.1354 1.032.1057 1.4853.3254.2294.1109.4054.3167.6654.3959.1106.0338.264.0052.4026.0442.3094.0886.6147.349.9027.3932.6107.0954 1.3-.1129 1.9493.0459.3787.0923.6533.3344 1.0653.2032.328.3083.3774.6676.6161.9973.552.7631 1.7226.25 2.6839-.0469.1027-.1744.3307-.2629.2561-.5613.8706-.3215.7893-1.0991.628-2.0131.1533-.224.2786-.5651.0386-.8803-.2106-.9593-4.3133-4.3343-4.6933-4.7369-.7454-1.0688-1.3173-1.5844-2.516-3.1901-.2813-.8959-1.0134-1.5115-1.736-1.9438.2826-.0182.0147-.2057.1053-.2969.104-.1405.1707-.3072.276-.4452-.0186-.6578.1307-1.4729.384-2.051-.46-.0844-.6546.5077-.8866.7942-.1814.2099-.8214.8506-1.0214 1.3724-.3027-.1156-1.0253-.0844-1.0253-.0844s-.5534.0339-1.0694.1052c-.8106-.7328-1.6493-1.4245-2.4506-2.1719-.3813.5104.028 1.6552.1706 2.2656.192.3115.4814.7084.5467 1.0511-.8573.2917-3.3573 1.2771-3.964 1.7422-.5133.3933-2.272 1.9229-2.2827 1.837-.0973.1198-1.2.8244-1.7706 1.2645.8986-5.8645 5.968-10.3593 12.0853-10.3593 6.7507 0 12.2267 5.4765 12.2267 12.2265 0 6.7511-5.476 12.2276-12.2267 12.2276");
    			attr_dev(path8, "fill", "#C28D1B");
    			add_location(path8, file, 4, 16870, 16945);
    			attr_dev(path9, "d", "M88.4429 98.7488c.7413.9453 1.0973 1.9682.088 2.8432l.008-.461c.4693-.325.3626-.887-.0894-1.4743l-.0066-.9079M88.7935 81.5968l.0093 1.5886c1.1227 0 1.8387 2.8567-.06 4.7005-1.8987 1.8421-4.324 3.7927-1.9694 6.5557l.5721-.6407c-1.88-1.8604-.2907-3.263 1.3973-4.4541 1.688-1.1917 3.6253-5.4.0507-7.75");
    			attr_dev(path9, "fill", "#C28D1B");
    			add_location(path9, file, 4, 18329, 18404);
    			attr_dev(path10, "d", "M87.2814 88.1707c-.0973-.0947-.1973-.1886-.296-.2848-1.8987-1.8438-1.1813-4.6762-.0546-4.6762l.0079-1.6041c-3.52 2.4573-1.6426 6.5495.0467 7.7412l.3-.3229-.004-.8532z");
    			attr_dev(path10, "fill", "#C28D1B");
    			add_location(path10, file, 4, 18654, 18729);
    			attr_dev(path11, "d", "M84.9453 85.0707c-.004 1.751 1.0747 3.4714 2.0267 4.1772l.2347-.2543v-.79a17.0712 17.0712 0 01-.276-.2672c-.8467-.8229-1.176-1.8396-1.176-2.7199.0053-.8516.3013-1.5885.752-1.9036l-1.1587.0088c-.2827.5642-.4027 1.1579-.4027 1.749");
    			attr_dev(path11, "fill", "#C28D1B");
    			add_location(path11, file, 4, 18847, 18922);
    			attr_dev(path12, "d", "M86.9428 81.4275a.0877.0877 0 01.0774 0c.0213.0114.036.0349.036.0652v1.7317a.0891.0891 0 01-.0187.0547c-.016.0104-.032.0208-.052.0208-.0427 0-.0813.0062-.12.013l.416-.0041-.0213-3.2657-2.7094-3.2786H73.7495l3.804 3.2214h3.0814l2.9573 3.3489 1.5906-.0131c.332-.6953.8947-1.3462 1.76-1.8942M87.9283 73.4379c-.0427.4948-2.1641 2.7537-.0427 2.7537 2.0226 0 .3133-1.539.0427-2.7537zM91.2162 76.9025l-2.7266 3.1796-.0213 3.3334h.636c-.1174-.0739-.2374-.1156-.3614-.1156-.0227 0-.0386-.0104-.0533-.0208a.0766.0766 0 01-.0253-.0547v-1.7317a.0673.0673 0 01.0439-.0652.082.082 0 01.0747 0c.9027.574 1.4773 1.2604 1.8027 1.988h1.62l2.9267-3.29h3.0813l3.8044-3.223H91.2162");
    			attr_dev(path12, "fill", "#C28D1B");
    			add_location(path12, file, 4, 19102, 19177);
    			attr_dev(path13, "d", "M88.3057 87.9416l.0706-10.3543h.272v-.3932h.3147v-1.0025H86.7563v1.0025h.3627v.3932h.2693l.1 11.1554c.2654-.2724.5427-.5382.8174-.8011M88.7041 81.5536l.0386-.0609-.0386.0609zM88.7934 94.4119c.6.4584.804 2.0609-.368 3.1937-1.3707 1.336-3.0333 2.9004-1.024 4.4844l.0066-.49c-1.084-1.013-.2013-2.0736 1.0174-2.9355 1.0493-.7412 2.352-3.0704.9413-4.8193l-.5733.5667z");
    			attr_dev(path13, "fill", "#C28D1B");
    			add_location(path13, file, 4, 19789, 19864);
    			attr_dev(path14, "d", "M89.059 89.4119c.632.638.82 2.4541-.492 3.7265-1.616 1.5652-3.6213 3.3344-1.62 5.6823l.3787-.4443c-1.6254-1.6077-.1947-2.9817 1.2413-3.9948 1.2213-.8619 2.6867-3.6337 1.1107-5.6875l-.6187.7178z");
    			attr_dev(path14, "fill", "#C28D1B");
    			add_location(path14, file, 4, 20178, 20253);
    			attr_dev(path15, "d", "M88.2976 89.9338c-.292.2396-.5614.4912-.8.7474l.028 3.0495c.2466-.2448.4986-.4844.7479-.7251l.0241-3.0718zM87.6026 102.96h.604l.0267-3.9569a5.8767 5.8767 0 00-.6601.6025l.0294 3.3544zM88.2627 94.9145c-.2614.2058-.5067.4334-.728.6651l.0293 2.6161c.2187-.2396.4506-.4754.6773-.6978l.0214-2.5834");
    			attr_dev(path15, "fill", "#C28D1B");
    			add_location(path15, file, 4, 20398, 20473);
    			attr_dev(path16, "d", "M67.9747 124.204l-.7173-.281c-28.9067-11.281-41.6573-24.1247-42.588-42.9043-.5547-2.5927-.7067-10.1615-.7067-11.1214l-.108-48.1173-.0026-1.932H112.151l-.003 1.932-.083 45.1788v5.9645c-.262 28.7387-13.0009 38.5667-43.3743 50.9897l-.716.291");
    			attr_dev(path16, "fill", "#4249A4");
    			add_location(path16, file, 4, 20717, 20792);
    			attr_dev(path17, "d", "M25.8882 21.912l.1093 48.1181c0 1.8896.2227 8.9687.6947 10.8542.8907 19.5227 15.412 31.2417 41.3733 41.3747 30.3507-12.412 41.9295-21.821 42.1785-49.2013v-5.9713l.082-45.1744H25.8882");
    			attr_dev(path17, "fill", "#F8BC23");
    			add_location(path17, file, 4, 20982, 21057);
    			attr_dev(path18, "d", "M75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.896 0 2.0254-.091 2.0481-.1337.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm1.5893-2.4512c.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866zm-13.0733.4346c.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032zm-2.2827-18.356l-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479-.256-20.3247zm26.0973 8.1974c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm1.5893-2.4512c.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866zm-13.0733.4346c.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032zm-2.2827-18.356l-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479-.256-20.3247zm.256 20.3247l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm12.292-20.3687c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zm11.0627-.8386h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-9.844 21.2552h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm12.3306-12.1752c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zm0 0c-.039-3.5987-.091-6.7587-.105-7.532-.052-.048-.126-.1094-.23-.192l.014 19.8992H90.4094c.1306.2306.2133.4869.252.7516h10.5976c.009 0 .009.0129.048.0129.125-.0391.265.0443.364-.4167.009-.0353.022-.2957.03-.7177 0-.4124.01-.9947.01-1.656 0-2.5253-.04-6.5587-.083-10.1493zM89.2974 56.3739h-.0653l-.1574-.7563c.0907-.0484.148-.0484.1733-.0355h11.263l-.01-19.7808c-.156-.1306-.282-.204-.421-.288l-.048 19.7251-.3466.0391c-.0094 0-1.4093.1354-3.0867.1354-1.352 0-2.8733-.0912-4.0066-.4302-.6187-.204-1.196-.2694-1.7054-.2694-.6426 0-1.1773.1054-1.5427.212-.3773.1147-.5653.2142-.5653.2142l-.1347.0729-.1866.0927-.2467.1302v-.1786c-.4533-.035-1.4746-.1355-2.2093-.2914-1.0867-.2306-1.7987-.3053-2.312-.3053-.804 0-1.1427.1747-1.852.3227-1.26.2557-2.1734.3485-2.8547.3562h-.092c-.7346 0-1.208-.1432-1.4813-.3122-.296-.1747-.396-.3667-.4133-.4867l-.0134-.044-.144-19.0373-.5253.22.248 19.8556 11.0573.0573v.79c-.108 0-.248.0652-.3653.2491-.1293.1822-.212.4593-.212.738.016.2916.0827.5614.2867.7734.1906.2006.5293.34 1.0946.3567h.0734c.5866-.0348.94-.1744 1.1306-.3567.204-.1953.2613-.4428.2787-.7032 0-.2744-.1053-.5702-.248-.7822-.1307-.1839-.2693-.2656-.36-.2828zm9.844-21.2552h-.3773c-1.2174 0-3.5907-.008-5.0561-.148-.8213-.0734-1.3906-.1387-1.9079-.1387-.512 0-.9654.0653-1.5907.2693-.8654.296-1.2174.6347-1.3347.7747l.1174 18.3333c.4346-.14 1.0866-.2866 1.8946-.2866.5827 0 1.2347.0733 1.948.2946.9654.3054 2.456.404 3.764.396 1.1347 0 2.1387-.0573 2.652-.1l.0387-19.3866c-.048 0-.096 0-.148-.008zm-11.0627.8386c0-.008 0-.008-.008-.0173-.0826-.1213-.2133-.2787-.412-.4427-.4053-.3213-1.0867-.6653-2.248-.6653h-.048c-1.8946 0-3.6733.556-5.4333.5653-.4387 0-.8813-.048-1.3253-.1386-.448-.092-.7747-.148-.9734-.1747l.1387 19.2413c.0173.0134.0266.0227.044.032.1293.0654.46.1907 1.1693.1907.608 0 1.4733-.0907 2.6987-.3387.5906-.1213 1.0773-.3306 2.008-.3306.5867 0 1.352.0733 2.4773.3133.4307.0907 1.0214.1653 1.5.2173.204.0294.3867.048.5347.056l-.1227-18.508zM75.7867 56.326l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479zm0 0l-.256-20.3247-.3867.156v19.977c.0094 0 .0094.2473.1081.4609.1226.2308.2226.374.5746.3869h.0427c.196-.0129.6186-.0224 1.208-.0224.5706-.0077 1.3053-.0077 2.1093-.0077 1.612 0 3.4907.0077 4.972.0077h.1173c.8574.0095 1.5787.0095 2.008.0095.0094-.0432.0174-.1005.0401-.1432.008-.0745.0333-.1485.0519-.2136.0307-.0823.064-.1656.104-.2385l-10.6933-.0479");
    			attr_dev(path18, "fill", "#2B338E");
    			add_location(path18, file, 4, 21191, 21266);
    			attr_dev(path19, "d", "M44.644 23.544c-5.4973 1.1227-11.0866 2.5414-17.0546 4.18v.1107l.0186 10.0186.064 28.6028h38.8614V23.544H44.644zm11.5387 23.3347c-.4974.4333-.8387.0467-.8387.0467s-.2107.9559-.2387 1.4626c-.0186.5067-.36 6.2614-.332 6.787.0187.526.2854 1.0036.1481 1.5104-.148.4973-.5987.691-.5067.8567.092.1744.4507.4323.4507.7187 0 .2943.3413.7459-.5254.9844-.8653.2396-1.104-.1839-1.196-.5979-.0933-.4046-.028-1.0781-.028-1.0781s-.3133-.2109-.332-.3865c-.0173-.1656-.0733-8.076-.1653-9.3187-.1013-1.2533-.0547-2.108-.0547-2.108s-.8573 3.084-1.0773 4.1694c-.2133 1.0786-.36 3.712-.36 5.4433 0 1.7213-.2573 2.0353-.2573 2.0353l-.0281.7188s.1654.3866-.6453.837c-.8186.4609-1.7947.5807-1.8493.0745-.0467-.5068.7907-1.4375.8187-1.6579.0186-.2118-.2667-.617-.2667-.8385 0-.2119.5973-9.8979.5973-11.0499 0-1.1507.24-5.0093.1947-5.5347-.0467-.5253-.2587-1.1226-.2587-1.1226l-1.464 1.3533c.1654.5893.3414 1.3067.4614 2.0254.184 1.032.2106 2.5426.2386 3.288.028.7546-.1013 2.0999-.1013 2.3573 0 .2573-.7827.8-.7827.8l.1293 4.3373-.5159.048s-.156 1.0854-.1014 1.508c.0467.416-.24 3.9327-.396 4.7623-.156.837-.46 1.0401-1.132 1.0401-.6826 0-.4693-.6718-.1653-1.0858.312-.4152.4226-.673.4413-1.1981.028-.5156-.1013-5.3052-.1013-5.3052l-.2853-.1093-.3134-.9307-.1293.7561s-.0734-.3401-.1014.2026c-.0186.5427.0561.5893.1574 1.7587.1013 1.1696.0546 2.9092-.028 3.7841-.0734.8844-.36.5251-.884.8844-.516.3594-1.2614.4973-1.3174.3135-.0546-.1848.5441-.5531.8574-1.013.304-.4698.5426-.7552.5426-.7552s-.2573-1.9427-.4426-2.7445c-.184-.8013-.4133-2.4853-.4133-2.4853h-.4427c.0093-.028.0093-.1293-.128-.544-.2134-.6547.2107-5.0827.2853-5.5254.0734-.4413.3587-2.4133.34-2.5413-.028-.1293-.312-.184-.2853.212.0187.3027-.9387 2.164-1.3627 2.964.1014 2.4693.34 7.4693.4147 8.04.1013.7459.3867 2.5412.3867 2.5412l-.6454.2396s.0187.1474.304.7006c.2947.552.0733.8374-.1373.9113-.2214.0641-.912-.0285-.9867-.414-.0733-.3787-.0733-1.2719-.0733-1.2719l-.6253-.0183s.1466-2.7618-.304-5.8005c-.4614-3.048-.8654-4.844-.8654-4.844s.0453 2.6147.2213 4.1254c.1654 1.5093.7827 6.3718.7827 6.3718l-.48.0744s.1667.4792.0467.7459c-.1107.2578-1.096 1.0312-1.096 1.0312s-.8933.4324-.94-.1198c-.0453-.553 1.06-.7276.9133-1.3448-.056-.2396-.084-.3593-.0933-.414l-.2853-.0458s-.1934-3.9509-.46-4.9363c-.268-.9853-.8387-4.1533-1.0587-5.6533-.212-1.5107.0733-2.3493.2667-2.8093.1933-.4507.6266-1.776.552-1.9894-.0734-.212-.0734-.3587-.0734-.3587s-.672 1.5094-.764 2.0347c-.1013.5347-.9853 2.856-1.0133 3.168-.0187.312-.332.9574.1013.9294.4333-.0174.1374.1946.0734.5253-.0734.3413-.7734.5813-.8201-.12-.0453-.6894.0747-3.0854.4334-4.5027.36-1.408.764-2.4213.7-3.3053-.0734-.8933.24-1.436.2853-1.9614.0467-.5346.0467-1.4.332-1.6306.2947-.248-.1933-.6534.4133-1.252.6-.5987.2587-.3587.6001-1.316.3306-.9587 1.0026-1.4654 1.988-1.4654.976 0 1.556 1.2987 1.6026 1.732.0467.424 0 3.2601 0 3.2601s.884-.0281 1.1694.6893c.12.2773.2306.672.332 1.06.516-.58 1.2426-.3507 1.096-1.1693-.1574-.8574-.9121-2.256-.6734-2.8827.2307-.6173.884-1.2894 1.3174-1.2894 0 0 .8839.0001 1.3533.9854.4613.9853.028 1.0586-.0267 1.4453-.056.396-.5707.8294-.516 1.1427.028.2107.8187.5987 1.4093 1.0133.2854-.3133.5614-.6546.5801-.784.0173-.2666.2853-1.196.856-1.768.58-.5787 2.4946-1.0866 2.6426-1.7306.148-.6454-.0733-.5067-.2386-1.1054-.1667-.5987-.4054-2.56 1.0493-2.66 1.464-.0933 1.556 1.316 1.5106 1.896-.0466.5707-.7826 1.124-.6919 1.7773.0933.644.8853.8374 1.1519.9854.2574.1386 1.2707.2853 1.676 1.1227.4054.8386-.1013 2.9466.1187 3.5733.2134.6173.5533 1.3907.6733 2.2467.12.8653.064 2.5973.064 3.0213 0 .432.1467 1.0307-.3586 1.464");
    			attr_dev(path19, "fill", "#231F20");
    			add_location(path19, file, 4, 168883, 168958);
    			attr_dev(path20, "d", "M60.6762 87.4051c0 6.7412-5.4693 12.2109-12.2106 12.2109a12.271 12.271 0 01-4.7334-.9489c-.2026-.487-.5613-1.3167-.82-1.8323-.0907-2.2276 1.244-2.9281 1.6867-4.4661.2387-.7918.644-1.6027 1.288-2.0896.5253.303 1.1146.6806 1.732.8369.524.138 1.0307.1109 1.4827.3229.2293.1199.4053.3219.6626.3959.1107.0364.2667.0093.4054.0459.3133.0921.6173.35.9026.3957.608.0923 1.2987-.1109 1.9427.0469.3773.0912.6533.3307 1.068.2016.332.3047.3773.663.6173.9948.552.7646 1.7213.249 2.68-.0453.1013-.1761.3307-.2672.2574-.5625.8653-.3219.7826-1.0954.6266-2.0068.1467-.2302.276-.5714.036-.8839-.212-.9583-4.3093-4.3281-4.6867-4.7343-.7466-1.0677-1.3159-1.5833-2.5133-3.1849-.2866-.8932-1.0133-1.5104-1.732-1.9443.276-.0089.0094-.2016.1014-.2942.1013-.138.1746-.3032.2759-.4428-.0186-.6536.1294-1.4724.3881-2.0443-.4614-.0911-.6547.5068-.8947.7933-.1747.2015-.8187.8463-1.012 1.3708-.304-.1198-1.032-.0912-1.032-.0912s-.552.0366-1.0587.111c-.8106-.737-1.648-1.4287-2.4493-2.1734-.3867.5156.028 1.6578.1653 2.2646.1933.3134.4787.7093.544 1.0505-.8573.2943-3.352 1.2708-3.96 1.7396-.5066.3957-2.2653 1.9244-2.2746 1.8333-.1014.1198-1.1974.8282-1.768 1.2604.8933-5.8568 5.9573-10.3412 12.072-10.3412 6.7413 0 12.2106 5.4704 12.2106 12.211");
    			attr_dev(path20, "fill", "#4249A4");
    			add_location(path20, file, 4, 172460, 172535);
    			attr_dev(path21, "d", "M27.6826 68.6384v1.0765c0 2.2568.46 10.7204.46 10.7204.7734 16.9151 12.1 28.2877 38.3907 38.8777V68.6384H27.6826zm20.7827 32.4976c-7.5413 0-13.656-6.1148-13.656-13.6564 0-7.5328 6.1147-13.6475 13.656-13.6475 7.532 0 13.6466 6.1147 13.6466 13.6475 0 7.5416-6.1146 13.6564-13.6466 13.6564z");
    			attr_dev(path21, "fill", "#4249A4");
    			add_location(path21, file, 4, 173702, 173777);
    			attr_dev(path22, "d", "M68.9004 68.6384v50.7036c28.5827-11.89 38.8506-21.0619 39.0796-46.6061v-4.0975H68.9004zm17.8826 7.5417h1.124c-2.1186 0 0-2.2568.0454-2.7437.2666 1.2057 1.98 2.7437-.0454 2.7437h1.0774v1.0036h-.3133v.3959h-.268l-.0734 10.3411c-.276.2672-.552.525-.8187.801l-.1013-11.1421h-.268v-.3959h-.3587v-1.0036zm-6.1146 3.7943h-3.076l-3.8027-3.2136h10.792l2.6987 3.2683.0266 3.2604-.4133.0088c.036-.0088.0733-.0182.12-.0182a.0704.0704 0 00.0453-.0182c.0187-.0088.0187-.0375.0187-.0558v-1.7306c0-.0287-.0093-.047-.0373-.0652-.0187-.0088-.0453-.0088-.0733 0-.8654.5521-1.4267 1.1969-1.7587 1.8974l-1.584.0088-2.956-3.3421zm4.3 5.1468c0-.0635 0-.1197.0093-.1833.028-.5432.1653-1.1058.4427-1.6302.3133-.6172.8093-1.1969 1.5467-1.7125l-.0094 1.6016c-1.124 0-1.8413 2.8271.056 4.6692.092.0912.1933.1928.2933.2855v.8473l-.2933.3219c-.9587-.663-1.9627-2.2474-2.036-3.9416 0-.0922-.0093-.1746-.0093-.2579zm3.26 17.8008h-.5973l-.0374-3.3513c.2027-.2124.4227-.4156.6627-.599l-.028 3.9503zm.3226-1.363l.0094-.461c.4693-.331.3587-.893-.092-1.4725v-.9115c.736.9479 1.096 1.97.0826 2.845zm-.1013-2.9283c-1.216.8656-2.1 1.9243-1.0227 2.9373v.488c-2.0066-1.583-.3493-3.1493 1.0227-4.4843 1.1693-1.1328.9667-2.7265.368-3.1858l.5707-.5719c1.4093 1.75.1106 4.0796-.9387 4.8167zm-.8933-3.085c.2213-.2302.4693-.4516.728-.6625l-.0187 2.5871c-.2306.2213-.4613.452-.6813.69l-.028-2.6146zm1.0306-1.1874c-1.436 1.0025-2.8626 2.3749-1.2426 3.9869l-.368.4417c-2.008-2.348 0-4.1162 1.6106-5.672 1.3174-1.2708 1.124-3.0848.4974-3.729l.6173-.7099c1.5747 2.0443.1107 4.8167-1.1147 5.6823zm-1.0666-3.7016c.2386-.2594.5053-.5068.8-.7464l-.0267 3.0666a64.7181 64.7181 0 00-.7467.7267l-.0266-3.0469zm1.2427-1.336c-1.6854 1.198-3.2694 2.5964-1.3907 4.4568l-.572.6354c-2.3573-2.763.0653-4.7057 1.9627-6.5469 1.8973-1.8421 1.1879-4.6963.0639-4.6963l-.0093-1.5849c3.5733 2.3489 1.6294 6.5484-.0546 7.7359zm9.4666-9.2083h-3.0853l-2.92 3.2875h-1.62c-.3227-.7276-.8934-1.4088-1.796-1.9896-.0267-.0088-.0547-.0088-.0733 0-.028.0182-.0467.0365-.0467.0652v1.7306c0 .0183.0093.047.028.0558a.0712.0712 0 00.0467.0182c.128 0 .248.0459.368.1198h-.636l.0186-3.3334 2.7267-3.1677h10.7826l-3.7933 3.2136M114.57 46.6987c3.064-1.2014 3.84-3.984 4.932-6.1693 1.481-3.668 4.032-2.2467 5.089-3.0921 1.9-1.1266.125-11.1413 2.277-15.8239 1.515-3.296 5.839-5.7854 3.667-8.1121-3.055-3.2786-7.121-4.6586-7.121-4.6586-14.483-4.5467-23.6165-6.592-32.6738-7.6494C80.0615.2427 71.1789-.252 61.0629.136 24.8442 2.9747 18.1322 6.9747 11.5442 8.208c-7.216 1.5893-5.536 6.1947-4.4733 8.408 1.0626 2.2147 3.3653 5.136 2.0386 13.6533.2454 2.116.2454 5.1134 1.6227 6.5214 1.304.8146 2.4653 0 4.3346-.352 2.3974 2.5373 5.2147 8.0733 6.6267 8.6386 2.8894 1.3014 6.0974-.9893 5.8494-7.5799-.6347-2.9267-1.3374-6.2387-1.5854-8.952 16.0734-4.4774 29.22-7.4041 45.08-7.5441 10.96-.2466 27.5627 4.724 39.6885 9.0227-.248 4.864-3.383 6.6627-2.678 11.384.883 3.4893 3.206 6.452 6.522 5.2907");
    			attr_dev(path22, "fill", "#231F20");
    			add_location(path22, file, 4, 174016, 174091);
    			attr_dev(path23, "d", "M73.9455 7.912c-.1373-.0826-.3866-.1293-.736-.1387l-5.1293-.1106-.064 2.6333 5.128.12c.36.0093.6-.0267.7467-.1.1933-.112.2946-.3333.2946-.664l.028-1.0586c.008-.3414-.0826-.5614-.268-.6814zm0 0c-.1373-.0826-.3866-.1293-.736-.1387l-5.1293-.1106-.064 2.6333 5.128.12c.36.0093.6-.0267.7467-.1.1933-.112.2946-.3333.2946-.664l.028-1.0586c.008-.3414-.0826-.5614-.268-.6814zm0 0c-.1373-.0826-.3866-.1293-.736-.1387l-5.1293-.1106-.064 2.6333 5.128.12c.36.0093.6-.0267.7467-.1.1933-.112.2946-.3333.2946-.664l.028-1.0586c.008-.3414-.0826-.5614-.268-.6814zm7.6987.6627l-.8933 6.1507 7.44 1.088.8933-6.152-7.44-1.0867zm21.6498 4.116c-.12-.1013-.35-.1933-.7-.276l-4.9911-1.1507-.6267 2.68 4.9998 1.1507c.342.0827.6.1013.747.0546.212-.064.359-.2573.433-.58l.267-1.1599c.073-.3227.028-.5627-.129-.7187zm0 0c-.12-.1013-.35-.1933-.7-.276l-4.9911-1.1507-.6267 2.68 4.9998 1.1507c.342.0827.6.1013.747.0546.212-.064.359-.2573.433-.58l.267-1.1599c.073-.3227.028-.5627-.129-.7187zm-21.6498-4.116l-.8933 6.1507 7.44 1.088.8933-6.152-7.44-1.0867zm-7.6987-.6627c-.1373-.0826-.3866-.1293-.736-.1387l-5.1293-.1106-.064 2.6333 5.128.12c.36.0093.6-.0267.7467-.1.1933-.112.2946-.3333.2946-.664l.028-1.0586c.008-.3414-.0826-.5614-.268-.6814zm0 0c-.1373-.0826-.3866-.1293-.736-.1387l-5.1293-.1106-.064 2.6333 5.128.12c.36.0093.6-.0267.7467-.1.1933-.112.2946-.3333.2946-.664l.028-1.0586c.008-.3414-.0826-.5614-.268-.6814zm7.6987.6627l-.8933 6.1507 7.44 1.088.8933-6.152-7.44-1.0867zm21.6498 4.116c-.12-.1013-.35-.1933-.7-.276l-4.9911-1.1507-.6267 2.68 4.9998 1.1507c.342.0827.6.1013.747.0546.212-.064.359-.2573.433-.58l.267-1.1599c.073-.3227.028-.5627-.129-.7187zm0 0c-.12-.1013-.35-.1933-.7-.276l-4.9911-1.1507-.6267 2.68 4.9998 1.1507c.342.0827.6.1013.747.0546.212-.064.359-.2573.433-.58l.267-1.1599c.073-.3227.028-.5627-.129-.7187zm-21.6498-4.116l-.8933 6.1507 7.44 1.088.8933-6.152-7.44-1.0867zm-7.6987-.6627c-.1373-.0826-.3866-.1293-.736-.1387l-5.1293-.1106-.064 2.6333 5.128.12c.36.0093.6-.0267.7467-.1.1933-.112.2946-.3333.2946-.664l.028-1.0586c.008-.3414-.0826-.5614-.268-.6814zm0 0c-.1373-.0826-.3866-.1293-.736-.1387l-5.1293-.1106-.064 2.6333 5.128.12c.36.0093.6-.0267.7467-.1.1933-.112.2946-.3333.2946-.664l.028-1.0586c.008-.3414-.0826-.5614-.268-.6814zm7.6987.6627l-.8933 6.1507 7.44 1.088.8933-6.152-7.44-1.0867zm21.6498 4.116c-.12-.1013-.35-.1933-.7-.276l-4.9911-1.1507-.6267 2.68 4.9998 1.1507c.342.0827.6.1013.747.0546.212-.064.359-.2573.433-.58l.267-1.1599c.073-.3227.028-.5627-.129-.7187zm0 0c-.12-.1013-.35-.1933-.7-.276l-4.9911-1.1507-.6267 2.68 4.9998 1.1507c.342.0827.6.1013.747.0546.212-.064.359-.2573.433-.58l.267-1.1599c.073-.3227.028-.5627-.129-.7187zm-21.6498-4.116l-.8933 6.1507 7.44 1.088.8933-6.152-7.44-1.0867zm-7.6987-.6627c-.1373-.0826-.3866-.1293-.736-.1387l-5.1293-.1106-.064 2.6333 5.128.12c.36.0093.6-.0267.7467-.1.1933-.112.2946-.3333.2946-.664l.028-1.0586c.008-.3414-.0826-.5614-.268-.6814zm49.0085 3.4893C87.4269-2.816 45.5002 1.2253 10.2869 10.628l-.848.4694c-.6533.4786-.9387.9759-.8094 1.5013.036 1.3346.3774 2.5787.8094 3.8493 0 0 2.5053 5.976 2.58 10.304-.2494 2.1827-.9867 3.2053-1.8694 4.5493.2854 2.0254.496 4.1627 1.9694 4.0987.1293 0 .268-.0186.424-.056 1.1973-.424 2.284-1.7227 3.4173-2.0067 1.5094-.0653 2.7534-.084 3.848.128.092.0094.1854.0281.268.0467 1.6014.3774 2.8907 1.2894 4.2627 3.3147.4893 1.3347.876 3.38-.708 4.1893-.0827.0467-.1574.0733-.2307.1027-.028.008-.056.008-.0827.008-.6733.1387-1.2533-.552-1.8333-1.308.1013.0466.1934.0826.2774.1026.276.0827.5146.0827.7359.0361 1.0134-.276 1.2707-1.924-.028-3.1307-.92-.9667-2.1453-2.008-3.7653-2.164-.8667-.1013-1.8333.064-2.92.608 2.22 2.928 5.3867 8.3787 6.6493 8.7387.5987.2306 1.0774.24 1.4734.1013.008 0 .028-.0094.036-.0094.6827-.248 1.124-.94 1.52-1.7133 1.5747-5.82-.9947-8.1027-.948-13.02v-.0746c-3.6294.1386-7.6067 1.1613-10.4987 1.1973-.488.5067-.9947 2.7627-1.5467 3.168-.092.0747-.1839.0827-.2759.0373.4226-1.6586.4226-4.4026 1.8226-4.936 19.264-3.02 31.4013-9.6053 56.3387-9.8893 10.4053-.0747 20.2773 2.3573 28.4906 5.0173 3.3805 1.0867 6.4745 2.22 9.2095 3.224 3.729 1.3814 6.804 2.5413 9.024 3.0747.064.028.137.0373.203.056.332.128 1.216-.9027 2.284-1.1787.745-.2026 1.593-.028 2.402 1.1787.166.3493.259.7093.304 1.068.047.3493.038.7-.018 1.032-.074.5053-.239.976-.46 1.3533l-.488-.212-.359-.1467c.423-2.0546-.452-2.4506-1.353-2.2106-.139.028-.278.0733-.406.1373-.728.268-1.105 1.3627-1.989 1.1427-.019-.0093-.037-.0094-.056-.0187l-5.276-1.8973c0 .0827 0 .1667-.009.2493-.064 3.2507-1.603 4.18-2.596 8.232-.314 2.9933.569 5.516 3.369 6.1707.101.0267.212.0453.323.064 3.95.1747 3.692-5.1107 6.52-7.9653-.212.0093-.424.0266-.636.0466-1.962.192-3.876.9107-5.847 3.6173-.497 1.0227.175 2.1841 1.012 3.2054h-1.115c-.008-.0187-.026-.0373-.036-.0467-1.28-1.6573-1.685-2.4307-.985-3.932 2.228-3.4613 4.467-4.7786 6.777-4.9346h.028c1.151-.0747 2.33.1373 3.518.5066.064.0173.137.0453.202.064h.424c.138-2.284-.138-11.0507 1.16-14.2187a22.4532 22.4532 0 011.971-3.7746c.137-.2493.351-.488.535-.7374v-.0733c.45-.516.901-1.0413 1.224-1.5666v-.0641c.561-.8933-.175-2.2653-4.752-3.932zm-91.4511 8.8774l-8.352-4.3373a6.3108 6.3108 0 01-.9667-.5987c.1933.608.34 1.1053.4333 1.5013l1.1601 5.1654-1.9987.452-1.344-5.9494-.0547-.2573-.756-3.352 1.52-.3413 7.992 4.1173c.572.304 1.0134.5613 1.3267.792-.2573-.876-.4134-1.4187-.46-1.6307l-1.1334-5.0186 2.0081-.4507 2.1453 9.5666-1.52.3414zm5.1306-1.0414l-1.6493-9.6586 9.8907-1.6853.276 1.648-7.6334 1.3079.3667 2.1454 4.4573-.7547.2774 1.648-4.4573.7547.4146 2.404 7.7254-1.3267.3133 1.8147-9.9814 1.7026zm23.3334-3.1759l-1.5373.148-3.3427-6.484-2.0627 7.0173-1.5653.1573-4.7147-9.384 2.3387-.2306 3.1213 6.2986 1.9427-6.796 1.5933-.156 3.288 6.28 1.7213-6.7773 2.0174-.1933-2.8 10.12zM76.3775 10.26c-.028 1.2707-.7733 1.8867-2.2466 1.8507l-6.152-.1373-.0827 3.8119-2.2467-.0466.2294-9.7973 8.3893.1933c1.4734.028 2.192.6813 2.164 1.9427l-.0547 2.1826zm14.8801.2947l-.7454 5.1106c-.1293.9027-.3867 1.4921-.7733 1.7494-.3787.2667-1.0414.332-1.9614.1933l-7.1453-1.04c-.9306-.1387-1.5386-.3867-1.8333-.7467-.2853-.3586-.368-.9946-.24-1.8959l.7466-5.112c.1294-.9014.3867-1.4814.7734-1.7494.3866-.2666 1.04-.3307 1.9706-.1933l7.1374 1.0413c.9293.1374 1.5373.3867 1.832.7453.2947.368.368.9947.2387 1.8974zm7.4586 5.5067l-2.108-.488-.8373 3.6093-2.1827-.5067 2.2094-9.5493 8.1774 1.888c1.428.332 1.999 1.1147 1.713 2.348l-.516 2.2386c-.285 1.2334-1.142 1.6854-2.569 1.3534l-1.261-.2854 3.572 4.6227-3.186-.7373-3.0118-4.4933zm12.7638 7.1733l-2.182-.6347 2.248-7.736-4.32-1.2613.488-1.676 10.848 3.168-.488 1.676-4.338-1.2613-2.256 7.7253zm-8.757-8.0854c.212-.064.359-.2573.433-.58l.267-1.1599c.073-.3227.028-.5627-.129-.7187-.12-.1013-.35-.1933-.7-.276l-4.9911-1.1507-.6267 2.68 4.9998 1.1507c.342.0827.6.1013.747.0546zm-21.9721-.4239l7.44 1.088.8933-6.152-7.44-1.0867-.8933 6.1507zm-7.5414-6.952l-5.1293-.1107-.064 2.6333 5.128.12c.36.0093.6-.0267.7467-.1.1933-.112.2946-.3333.2946-.664l.028-1.0586c.008-.3414-.0826-.5614-.268-.6814-.1373-.0826-.3866-.1293-.736-.1387zm.736.1386c-.1373-.0826-.3866-.1293-.736-.1387l-5.1293-.1106-.064 2.6333 5.128.12c.36.0093.6-.0267.7467-.1.1933-.112.2946-.3333.2946-.664l.028-1.0586c.008-.3414-.0826-.5614-.268-.6814zm7.6987.6627l-.8933 6.1507 7.44 1.088.8933-6.152-7.44-1.0867zm21.6498 4.116c-.12-.1013-.35-.1933-.7-.276l-4.9911-1.1507-.6267 2.68 4.9998 1.1507c.342.0827.6.1013.747.0546.212-.064.359-.2573.433-.58l.267-1.1599c.073-.3227.028-.5627-.129-.7187zm0 0c-.12-.1013-.35-.1933-.7-.276l-4.9911-1.1507-.6267 2.68 4.9998 1.1507c.342.0827.6.1013.747.0546.212-.064.359-.2573.433-.58l.267-1.1599c.073-.3227.028-.5627-.129-.7187zm-21.6498-4.116l-.8933 6.1507 7.44 1.088.8933-6.152-7.44-1.0867zm-7.6987-.6627c-.1373-.0826-.3866-.1293-.736-.1387l-5.1293-.1106-.064 2.6333 5.128.12c.36.0093.6-.0267.7467-.1.1933-.112.2946-.3333.2946-.664l.028-1.0586c.008-.3414-.0826-.5614-.268-.6814zm0 0c-.1373-.0826-.3866-.1293-.736-.1387l-5.1293-.1106-.064 2.6333 5.128.12c.36.0093.6-.0267.7467-.1.1933-.112.2946-.3333.2946-.664l.028-1.0586c.008-.3414-.0826-.5614-.268-.6814zm7.6987.6627l-.8933 6.1507 7.44 1.088.8933-6.152-7.44-1.0867zm21.6498 4.116c-.12-.1013-.35-.1933-.7-.276l-4.9911-1.1507-.6267 2.68 4.9998 1.1507c.342.0827.6.1013.747.0546.212-.064.359-.2573.433-.58l.267-1.1599c.073-.3227.028-.5627-.129-.7187zm0 0c-.12-.1013-.35-.1933-.7-.276l-4.9911-1.1507-.6267 2.68 4.9998 1.1507c.342.0827.6.1013.747.0546.212-.064.359-.2573.433-.58l.267-1.1599c.073-.3227.028-.5627-.129-.7187zm-21.6498-4.116l-.8933 6.1507 7.44 1.088.8933-6.152-7.44-1.0867zm-7.6987-.6627c-.1373-.0826-.3866-.1293-.736-.1387l-5.1293-.1106-.064 2.6333 5.128.12c.36.0093.6-.0267.7467-.1.1933-.112.2946-.3333.2946-.664l.028-1.0586c.008-.3414-.0826-.5614-.268-.6814zm0 0c-.1373-.0826-.3866-.1293-.736-.1387l-5.1293-.1106-.064 2.6333 5.128.12c.36.0093.6-.0267.7467-.1.1933-.112.2946-.3333.2946-.664l.028-1.0586c.008-.3414-.0826-.5614-.268-.6814zm7.6987.6627l-.8933 6.1507 7.44 1.088.8933-6.152-7.44-1.0867zm0 0l-.8933 6.1507 7.44 1.088.8933-6.152-7.44-1.0867zm-7.6987-.6627c-.1373-.0826-.3866-.1293-.736-.1387l-5.1293-.1106-.064 2.6333 5.128.12c.36.0093.6-.0267.7467-.1.1933-.112.2946-.3333.2946-.664l.028-1.0586c.008-.3414-.0826-.5614-.268-.6814");
    			attr_dev(path23, "fill", "#F8BC23");
    			add_location(path23, file, 4, 176937, 177012);
    			attr_dev(path24, "d", "M89.8961 23.5693H68.8975v42.8879h39.0945l.033-23.5492.019-6.7507.012-7.1146c-5.572-1.9267-11.9265-3.9267-18.1599-5.4734zM74.3535 35.6267l2.4199-.9947c.044-.156.1827-.2787.2827-.296.1227-.048.2214-.048.344-.056.2734 0 .6827.0653 1.3694.204.3773.0827.7653.108 1.16.1173 1.604 0 3.4173-.5613 5.4813-.5613h.0173c1.6134 0 2.5427.6173 3.0294 1.1267.2693-.252.7386-.5654 1.504-.8134.6866-.2386 1.26-.3133 1.8386-.3133.5907 0 1.1787.0747 1.9733.148.7827.0653 1.8787.1 2.8907.1307 1.0214.0173 1.9693.0173 2.4773.0173h.044c.4774 0 .8386.156 1.0596.34.148.1373.462.252.914.6253.504.4427.765.656.89.7654l.131.112.131.1187.008.1773s.182 12.44.182 17.8733c0 1.3696-.008 2.2253-.048 2.504-.108.8083-.76 1.0781-1.086 1.0781-.026 0-.043 0-.06-.0094-.075 0-.122 0-.158-.0088H90.6308c-.1907.7265-.9 1.3697-2.1347 1.3786-.0386-.0089-.056-.0089-.0733-.0089-.7307.0089-1.2907-.2213-1.66-.5952a1.8569 1.8569 0 01-.4787-.9219c-1.1867 0-4.5027-.0218-7.0973-.0218-.804 0-1.5307 0-2.1094.0129-.5813 0-1.0026.0089-1.1813.0183h-.1c-.6826 0-1.104-.4703-1.26-.8479-.1746-.3959-.1826-.7396-.1826-.7824V35.6267");
    			attr_dev(path24, "fill", "#4249A4");
    			add_location(path24, file, 4, 186117, 186192);
    			attr_dev(path25, "d", "M102.502 54.348c0 1.3696-.008 2.2253-.048 2.504-.108.8083-.76 1.0781-1.087 1.0781-.025 0-.043 0-.06-.0094-.075 0-.121 0-.157-.0088H90.6309c-.1907.7265-.9 1.3697-2.1347 1.3786-.0387-.0089-.056-.0089-.0733-.0089-.7307.0089-1.2907-.2213-1.66-.5952a1.8569 1.8569 0 01-.4787-.9219c-1.1867 0-4.5027-.0218-7.0974-.0218-.804 0-1.5306 0-2.1093.0129-.5813 0-1.0026.0089-1.1813.0183h-.1c-.6827 0-1.104-.4703-1.26-.8479-.1747-.3959-.1827-.7396-.1827-.7824V35.6267l2.42-.9947c.044-.156.1827-.2787.2827-.296.1227-.048.2213-.048.344-.056.2733 0 .6827.0653 1.3693.204.3774.0827.7654.108 1.16.1173 1.604 0 3.4173-.5613 5.4813-.5613h.0174c1.6133 0 2.5427.6173 3.0293 1.1267.2694-.252.7387-.5654 1.504-.8134.6867-.2386 1.26-.3133 1.8387-.3133.5907 0 1.1786.0747 1.9733.148.7827.0653 1.8787.1 2.8907.1307 1.0213.0173 1.9693.0173 2.4773.0173h.044c.4773 0 .8385.156 1.0605.34.148.1373.461.252.913.6253.504.4427.765.656.891.7654l.13.112.131.1186.008.1774s.183 12.44.183 17.8733");
    			attr_dev(path25, "fill", "#4249A4");
    			add_location(path25, file, 4, 187221, 187296);
    			attr_dev(path26, "d", "M100.187 34.6187c-.2217-.148-.5444-.2574-.943-.2574H99.2c-.5093 0-1.456 0-2.4773-.016-1.0134-.032-2.108-.0653-2.8907-.1319-.796-.0734-1.3827-.1467-1.9733-.1467-.5787 0-1.152.0733-1.8387.312-.7653.248-1.2347.5613-1.504.8133-.4867-.508-1.4173-1.1253-3.0293-1.1253h-.0187c-2.064 0-3.876.56-5.48.56-.396-.008-.7827-.0347-1.16-.1174-.688-.1386-1.096-.204-1.3693-.204-.1227.008-.2227.008-.3441.056-.1.0174-.2386.14-.2826.296l-2.4214.9947v20.5161c0 .0443.0094.387.1827.7828.1574.3787.5787.8474 1.2614.8474h.1c.1786-.0078.5986-.0167 1.1813-.0167.5787-.0129 1.304-.0129 2.108-.0129 2.596 0 5.912.0218 7.0986.0218.0654.3298.2214.6511.4787.9208.368.3735.9293.6042 1.66.5964a.315.315 0 01.0734.0078c1.2346-.0078 1.9426-.651 2.1346-1.3776h10.5187c.035.0089.083.0089.156.0089.019.0077.035.0077.061.0077.326 0 .979-.2692 1.087-1.0781.004-.0427.009-.5599.009-1.3984v-.0219c.004-.3521.004-.7561.004-1.2041V35.5787l-2.338-.96zm-9.919.508c.6253-.204 1.0773-.2694 1.5907-.2694.5173 0 1.0866.0654 1.908.1387 1.4653.14 3.8386.148 5.0546.148H99.2c.052.0093.1.0093.148.0093l-.04 19.3867c-.512.0427-1.516.0987-2.6507.0987-1.308.008-2.8-.092-3.764-.3947a6.4659 6.4659 0 00-1.948-.296c-.808 0-1.46.1467-1.8946.2867L88.9333 35.9c.1174-.1387.4694-.4773 1.3347-.7733zm-11.6067.156c.444.092.888.14 1.3267.14 1.76-.0094 3.5373-.5654 5.4333-.5654h.0467c1.1613 0 1.844.344 2.248.6654.2.1653.3307.3213.4133.4426.008.0094.008.0094.008.0174l.1227 18.508a5.3576 5.3576 0 01-.5347-.0574c-.4786-.052-1.0693-.124-1.5-.2173-1.1253-.2373-1.8907-.312-2.4773-.312-.9307 0-1.4174.208-2.008.3307-1.2254.248-2.0907.3386-2.7.3386-.708 0-1.0387-.1266-1.1693-.192-.016-.008-.0254-.016-.0427-.0293l-.14-19.2427c.2.0267.5267.0827.9733.1734zm7.6907 21.8646h-10.32c-.0307 0-.056.0042-.0827.0042h-.0427c-.0133 0-.0226 0-.0306-.0042-.308-.0261-.556-.513-.5654-.5261-.1-.2135-.0999-.4609-.1079-.4609V36.1827l.3866-.156.256 20.3253 9.7187.0427h1.04c-.1307.2308-.2133.4869-.252.7526zm2.9373-.7485h.0654c.0906.0183.2306.1.3613.2824.1426.2135.248.5093.248.7828-.0187.2604-.0747.5088-.2787.7041-.1906.1823-.544.3219-1.1306.3568h-.0734c-.5653-.0182-.904-.1573-1.096-.3568-.204-.2136-.2693-.4828-.2866-.7734 0-.2787.0826-.5574.2133-.7396.1173-.1823.256-.2474.3653-.2474v-.7917l-11.0586-.0557-.2467-19.8563.5253-.2213.144 19.0386.012.044c.0187.1214.1174.3134.4134.4854.2746.171.7479.3142 1.4826.3142h.0907c.6826-.0093 1.5947-.1004 2.856-.3569.7093-.1467 1.048-.3213 1.852-.3213.512 0 1.2253.0746 2.312.304.7347.1566 1.756.2572 2.208.2909v.1781l.248-.1301.1867-.0912.1346-.0739s.1867-.1005.5654-.2125c.3653-.1093.8999-.2133 1.5426-.2133.5093 0 1.0867.0653 1.704.2693 1.1347.3388 2.656.4309 4.008.4309 1.6774 0 3.0773-.1353 3.0867-.1353l.347-.0391.013-20.0112.131.056.382.1614-.048 20.1376H89.3066c-.0253-.0131-.0826-.0131-.1733.0338l.156.7567zm12.4707-.3687c-.009.4208-.021.6823-.031.7162-.1.4609-.404.4052-.412.4052H90.72c-.0387-.2656-.1213-.5224-.2533-.7527h10.8973l-.008-10.0148-.023-10.6013.423.152v14.384l-.009-.096c.004.3693.009.7347.009 1.0907.008 1.144.013 2.1906.013 3.0599 0 .6614-.009 1.2427-.009 1.6568");
    			attr_dev(path26, "fill", "#F8BC23");
    			add_location(path26, file, 4, 188202, 188277);
    			attr_dev(svg, "x", /*x*/ ctx[0]);
    			attr_dev(svg, "y", /*y*/ ctx[1]);
    			attr_dev(svg, "width", /*width*/ ctx[2]);
    			attr_dev(svg, "height", /*height*/ ctx[3]);
    			attr_dev(svg, "viewBox", "0 0 137 138");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file, 4, 0, 75);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    			append_dev(svg, path6);
    			append_dev(svg, path7);
    			append_dev(svg, path8);
    			append_dev(svg, path9);
    			append_dev(svg, path10);
    			append_dev(svg, path11);
    			append_dev(svg, path12);
    			append_dev(svg, path13);
    			append_dev(svg, path14);
    			append_dev(svg, path15);
    			append_dev(svg, path16);
    			append_dev(svg, path17);
    			append_dev(svg, path18);
    			append_dev(svg, path19);
    			append_dev(svg, path20);
    			append_dev(svg, path21);
    			append_dev(svg, path22);
    			append_dev(svg, path23);
    			append_dev(svg, path24);
    			append_dev(svg, path25);
    			append_dev(svg, path26);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*x*/ 1) {
    				attr_dev(svg, "x", /*x*/ ctx[0]);
    			}

    			if (dirty & /*y*/ 2) {
    				attr_dev(svg, "y", /*y*/ ctx[1]);
    			}

    			if (dirty & /*width*/ 4) {
    				attr_dev(svg, "width", /*width*/ ctx[2]);
    			}

    			if (dirty & /*height*/ 8) {
    				attr_dev(svg, "height", /*height*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { x = 0 } = $$props,
    		{ y = 0 } = $$props,
    		{ width = 137 } = $$props,
    		{ height = 138 } = $$props;

    	const writable_props = ["x", "y", "width", "height"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Crest> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("width" in $$props) $$invalidate(2, width = $$props.width);
    		if ("height" in $$props) $$invalidate(3, height = $$props.height);
    	};

    	$$self.$capture_state = () => {
    		return { x, y, width, height };
    	};

    	$$self.$inject_state = $$props => {
    		if ("x" in $$props) $$invalidate(0, x = $$props.x);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("width" in $$props) $$invalidate(2, width = $$props.width);
    		if ("height" in $$props) $$invalidate(3, height = $$props.height);
    	};

    	return [x, y, width, height];
    }

    class Crest extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { x: 0, y: 1, width: 2, height: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Crest",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get x() {
    		throw new Error("<Crest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Crest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Crest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Crest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Crest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Crest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Crest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Crest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function roundToDecimals(num, places) {
        const factorOfTen =- Math.pow(10, places);
        return Math.round(num * factorOfTen) / factorOfTen
    }

    /* src/Map.svelte generated by Svelte v3.16.5 */

    const { Map: Map_1 } = globals;
    const file$1 = "src/Map.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    // (1:0) <script>  import * as d3 from 'd3'  import * as topojson from 'topojson-client'  import { labelTweaks, matchLabelToTweak }
    function create_catch_block_1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1.name,
    		type: "catch",
    		source: "(1:0) <script>  import * as d3 from 'd3'  import * as topojson from 'topojson-client'  import { labelTweaks, matchLabelToTweak }",
    		ctx
    	});

    	return block;
    }

    // (57:0) {:then states}
    function create_then_block(ctx) {
    	let g0;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map_1();
    	let g1;
    	let each_blocks = [];
    	let each1_lookup = new Map_1();
    	let each_value_3 = feature(/*states*/ ctx[23], /*states*/ ctx[23].objects.usStates).features;
    	const get_key = ctx => `state-${/*i*/ ctx[22]}`;

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		let child_ctx = get_each_context_3(ctx, each_value_3, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_3(key, child_ctx));
    	}

    	let if_block = /*dotPromise*/ ctx[6] && create_if_block(ctx);
    	let each_value_1 = feature(/*states*/ ctx[23], /*states*/ ctx[23].objects.usStates).features;
    	const get_key_1 = ctx => `state-label-${/*i*/ ctx[22]}`;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			g0 = svg_element("g");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			if (if_block) if_block.c();
    			g1 = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g0, "class", "states svelte-qah7it");
    			add_location(g0, file$1, 57, 1, 1796);
    			attr_dev(g1, "class", "state-labels");
    			add_location(g1, file$1, 74, 1, 2528);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g0, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(g0, null);
    			}

    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, g1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g1, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			const each_value_3 = feature(/*states*/ ctx[23], /*states*/ ctx[23].objects.usStates).features;
    			each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_3, each0_lookup, g0, destroy_block, create_each_block_3, null, get_each_context_3);

    			if (/*dotPromise*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(g1.parentNode, g1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const each_value_1 = feature(/*states*/ ctx[23], /*states*/ ctx[23].objects.usStates).features;
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value_1, each1_lookup, g1, destroy_block, create_each_block_1, null, get_each_context_1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(g1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(57:0) {:then states}",
    		ctx
    	});

    	return block;
    }

    // (59:2) {#each topojson.feature(states, states.objects.usStates).features as state, i (`state-${i}
    function create_each_block_3(key_1, ctx) {
    	let path_1;
    	let path_1_d_value;
    	let path_1_data_abbr_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			path_1 = svg_element("path");
    			attr_dev(path_1, "d", path_1_d_value = /*path*/ ctx[16](/*state*/ ctx[24]));
    			attr_dev(path_1, "class", "state svelte-qah7it");
    			attr_dev(path_1, "data-abbr", path_1_data_abbr_value = /*state*/ ctx[24].properties.STATE_ABBR);
    			add_location(path_1, file$1, 59, 2, 1913);
    			this.first = path_1;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path_1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(59:2) {#each topojson.feature(states, states.objects.usStates).features as state, i (`state-${i}",
    		ctx
    	});

    	return block;
    }

    // (63:1) {#if dotPromise}
    function create_if_block(ctx) {
    	let g;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block,
    		value: 26
    	};

    	handle_promise(promise = /*dotPromise*/ ctx[6], info);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			info.block.c();
    			attr_dev(g, "class", "dots");
    			add_location(g, file$1, 63, 1, 2034);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			info.block.m(g, info.anchor = null);
    			info.mount = () => g;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*dotPromise*/ 64 && promise !== (promise = /*dotPromise*/ ctx[6]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[26] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(63:1) {#if dotPromise}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>  import * as d3 from 'd3'  import * as topojson from 'topojson-client'  import { labelTweaks, matchLabelToTweak }
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>  import * as d3 from 'd3'  import * as topojson from 'topojson-client'  import { labelTweaks, matchLabelToTweak }",
    		ctx
    	});

    	return block;
    }

    // (67:2) {:then dots}
    function create_then_block_1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map_1();
    	let each_1_anchor;
    	let each_value_2 = /*dots*/ ctx[26].features.sort(/*sortFn*/ ctx[17]);
    	const get_key = ctx => /*i*/ ctx[22];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			const each_value_2 = /*dots*/ ctx[26].features.sort(/*sortFn*/ ctx[17]);
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block_2, each_1_anchor, get_each_context_2);
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1.name,
    		type: "then",
    		source: "(67:2) {:then dots}",
    		ctx
    	});

    	return block;
    }

    // (68:3) {#each dots.features.sort(sortFn) as dot, i (i)}
    function create_each_block_2(key_1, ctx) {
    	let path_1;
    	let path_1_d_value;
    	let path_1_id_value;
    	let path_1_style_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			path_1 = svg_element("path");
    			attr_dev(path_1, "d", path_1_d_value = /*path*/ ctx[16].pointRadius(/*dotSize*/ ctx[3])(/*dot*/ ctx[27]));
    			attr_dev(path_1, "class", "zipcode svelte-qah7it");
    			attr_dev(path_1, "id", path_1_id_value = "dot-" + /*i*/ ctx[22]);
    			attr_dev(path_1, "style", path_1_style_value = `--delay:${(/*i*/ ctx[22] + (Math.random() - 0.5) * /*dots*/ ctx[26].features.length * /*animSpread*/ ctx[2]) / /*dots*/ ctx[26].features.length * /*animLength*/ ctx[1]}s; --cx:${roundToDecimals(/*projection*/ ctx[15](/*dot*/ ctx[27].geometry.coordinates)[0], 3)}px; --cy:${roundToDecimals(/*projection*/ ctx[15](/*dot*/ ctx[27].geometry.coordinates)[1], 3)}px;`);
    			add_location(path_1, file$1, 68, 2, 2158);
    			this.first = path_1;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dotSize, dotPromise*/ 72 && path_1_d_value !== (path_1_d_value = /*path*/ ctx[16].pointRadius(/*dotSize*/ ctx[3])(/*dot*/ ctx[27]))) {
    				attr_dev(path_1, "d", path_1_d_value);
    			}

    			if (dirty & /*dotPromise*/ 64 && path_1_id_value !== (path_1_id_value = "dot-" + /*i*/ ctx[22])) {
    				attr_dev(path_1, "id", path_1_id_value);
    			}

    			if (dirty & /*dotPromise, animSpread, animLength*/ 70 && path_1_style_value !== (path_1_style_value = `--delay:${(/*i*/ ctx[22] + (Math.random() - 0.5) * /*dots*/ ctx[26].features.length * /*animSpread*/ ctx[2]) / /*dots*/ ctx[26].features.length * /*animLength*/ ctx[1]}s; --cx:${roundToDecimals(/*projection*/ ctx[15](/*dot*/ ctx[27].geometry.coordinates)[0], 3)}px; --cy:${roundToDecimals(/*projection*/ ctx[15](/*dot*/ ctx[27].geometry.coordinates)[1], 3)}px;`)) {
    				attr_dev(path_1, "style", path_1_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(68:3) {#each dots.features.sort(sortFn) as dot, i (i)}",
    		ctx
    	});

    	return block;
    }

    // (65:21)    <text></text>   {:then dots}
    function create_pending_block_1(ctx) {
    	let text_1;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			attr_dev(text_1, "class", "svelte-qah7it");
    			add_location(text_1, file$1, 65, 2, 2075);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1.name,
    		type: "pending",
    		source: "(65:21)    <text></text>   {:then dots}",
    		ctx
    	});

    	return block;
    }

    // (76:2) {#each topojson.feature(states, states.objects.usStates).features as state, i (`state-label-${i}
    function create_each_block_1(key_1, ctx) {
    	let text_1;
    	let t_value = /*state*/ ctx[24].properties.STATE_ABBR + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(t_value);

    			attr_dev(text_1, "x", text_1_x_value = /*path*/ ctx[16].centroid(/*state*/ ctx[24])[0] + (matchLabelToTweak(/*state*/ ctx[24]) !== null
    			? matchLabelToTweak(/*state*/ ctx[24])[0]
    			: 0));

    			attr_dev(text_1, "y", text_1_y_value = /*path*/ ctx[16].centroid(/*state*/ ctx[24])[1] + (matchLabelToTweak(/*state*/ ctx[24]) !== null
    			? matchLabelToTweak(/*state*/ ctx[24])[1]
    			: 0));

    			attr_dev(text_1, "class", "svelte-qah7it");
    			add_location(text_1, file$1, 76, 2, 2657);
    			this.first = text_1;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(76:2) {#each topojson.feature(states, states.objects.usStates).features as state, i (`state-label-${i}",
    		ctx
    	});

    	return block;
    }

    // (55:21)   <text x='50%' y='50%' style='transform: translate(-50%, -50%);'>Loading...</text> {:then states}
    function create_pending_block(ctx) {
    	let text_1;
    	let t;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text("Loading...");
    			attr_dev(text_1, "x", "50%");
    			attr_dev(text_1, "y", "50%");
    			set_style(text_1, "transform", "translate(-50%, -50%)");
    			attr_dev(text_1, "class", "svelte-qah7it");
    			add_location(text_1, file$1, 55, 1, 1698);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(55:21)   <text x='50%' y='50%' style='transform: translate(-50%, -50%);'>Loading...</text> {:then states}",
    		ctx
    	});

    	return block;
    }

    // (82:1) {#each crestPositions as crest, i}
    function create_each_block(ctx) {
    	let current;

    	const crest = new Crest({
    			props: {
    				x: /*crest*/ ctx[20].x * /*width*/ ctx[13],
    				y: /*crest*/ ctx[20].y * /*height*/ ctx[14],
    				width: crestSize,
    				height: crestSize,
    				viewBox: "0 0 170 170"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(crest.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(crest, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(crest.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(crest.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(crest, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(82:1) {#each crestPositions as crest, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let svg;
    	let await_block_anchor;
    	let promise;
    	let svg_class_value;
    	let svg_style_value;
    	let current;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block_1,
    		value: 23
    	};

    	handle_promise(promise = /*statePromise*/ ctx[12], info);
    	let each_value = /*crestPositions*/ ctx[18];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			await_block_anchor = empty();
    			info.block.c();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(svg, "id", "map");
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[11]);
    			attr_dev(svg, "class", svg_class_value = "" + (null_to_empty(/*showDots*/ ctx[0] ? "play-anim" : "") + " svelte-qah7it"));

    			attr_dev(svg, "style", svg_style_value = `--bg: rgb(${/*bgColor*/ ctx[7].r},${/*bgColor*/ ctx[7].g},${/*bgColor*/ ctx[7].b});
					 --state: rgb(${/*stateColor*/ ctx[8].r},${/*stateColor*/ ctx[8].g},${/*stateColor*/ ctx[8].b});
					 --text: rgb(${/*textColor*/ ctx[9].r},${/*textColor*/ ctx[9].g},${/*textColor*/ ctx[9].b});
					 --dots: rgb(${/*dotColor*/ ctx[10].r},${/*dotColor*/ ctx[10].g},${/*dotColor*/ ctx[10].b});
					 --max-growth-factor: ${/*maxGrowthFactor*/ ctx[4]};
					 --growth-duration: ${/*growthDuration*/ ctx[5]}s;`);

    			add_location(svg, file$1, 45, 0, 1211);
    			dispose = listen_dev(svg, "click", /*click_handler*/ ctx[19], false, false, false);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, await_block_anchor);
    			info.block.m(svg, info.anchor = null);
    			info.mount = () => svg;
    			info.anchor = await_block_anchor;

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[23] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if (dirty & /*crestPositions, width, height, crestSize*/ 286720) {
    				each_value = /*crestPositions*/ ctx[18];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(svg, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*viewBox*/ 2048) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[11]);
    			}

    			if (!current || dirty & /*showDots*/ 1 && svg_class_value !== (svg_class_value = "" + (null_to_empty(/*showDots*/ ctx[0] ? "play-anim" : "") + " svelte-qah7it"))) {
    				attr_dev(svg, "class", svg_class_value);
    			}

    			if (!current || dirty & /*bgColor, stateColor, textColor, dotColor, maxGrowthFactor, growthDuration*/ 1968 && svg_style_value !== (svg_style_value = `--bg: rgb(${/*bgColor*/ ctx[7].r},${/*bgColor*/ ctx[7].g},${/*bgColor*/ ctx[7].b});
					 --state: rgb(${/*stateColor*/ ctx[8].r},${/*stateColor*/ ctx[8].g},${/*stateColor*/ ctx[8].b});
					 --text: rgb(${/*textColor*/ ctx[9].r},${/*textColor*/ ctx[9].g},${/*textColor*/ ctx[9].b});
					 --dots: rgb(${/*dotColor*/ ctx[10].r},${/*dotColor*/ ctx[10].g},${/*dotColor*/ ctx[10].b});
					 --max-growth-factor: ${/*maxGrowthFactor*/ ctx[4]};
					 --growth-duration: ${/*growthDuration*/ ctx[5]}s;`)) {
    				attr_dev(svg, "style", svg_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			info.block.d();
    			info.token = null;
    			info = null;
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const crestSize = 40;

    function instance$1($$self, $$props, $$invalidate) {
    	let { showDots = false } = $$props;
    	let { animLength = 6 } = $$props;
    	let { animSpread = 0.08 } = $$props;
    	let { dotSize = 3 } = $$props;
    	let { maxGrowthFactor = 1.5 } = $$props;
    	let { growthDuration = 0.2 } = $$props;
    	let { dotPromise = null } = $$props;
    	let { bgColor = { r: 75, g: 112, b: 179 } } = $$props;
    	let { stateColor = { r: 2, g: 16, b: 54 } } = $$props;
    	let { textColor = { r: 234, g: 245, b: 255 } } = $$props;
    	let { dotColor = { r: 252, g: 193, b: 59 } } = $$props;
    	let statePromise = fetch("./assets/states.json").then(res => res.json());
    	let width = 1388;
    	let height = 781;
    	const projection = albersUsa().scale(width * 1.1).translate([width / 2, height / 2]);
    	const path = index().projection(projection);
    	const sortFn = (a, b) => a.geometry.coordinates[0] - b.geometry.coordinates[0];

    	const crestPositions = [
    		{ x: 0.1, y: 0.37 },
    		{ x: 0.12, y: 0.53 },
    		{ x: 0.15, y: 0.56 },
    		{ x: 0.68, y: 0.62 },
    		{ x: 0.78, y: 0.44 },
    		{ x: 0.81, y: 0.3 }
    	];

    	const writable_props = [
    		"showDots",
    		"animLength",
    		"animSpread",
    		"dotSize",
    		"maxGrowthFactor",
    		"growthDuration",
    		"dotPromise",
    		"bgColor",
    		"stateColor",
    		"textColor",
    		"dotColor"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, showDots = !showDots);

    	$$self.$set = $$props => {
    		if ("showDots" in $$props) $$invalidate(0, showDots = $$props.showDots);
    		if ("animLength" in $$props) $$invalidate(1, animLength = $$props.animLength);
    		if ("animSpread" in $$props) $$invalidate(2, animSpread = $$props.animSpread);
    		if ("dotSize" in $$props) $$invalidate(3, dotSize = $$props.dotSize);
    		if ("maxGrowthFactor" in $$props) $$invalidate(4, maxGrowthFactor = $$props.maxGrowthFactor);
    		if ("growthDuration" in $$props) $$invalidate(5, growthDuration = $$props.growthDuration);
    		if ("dotPromise" in $$props) $$invalidate(6, dotPromise = $$props.dotPromise);
    		if ("bgColor" in $$props) $$invalidate(7, bgColor = $$props.bgColor);
    		if ("stateColor" in $$props) $$invalidate(8, stateColor = $$props.stateColor);
    		if ("textColor" in $$props) $$invalidate(9, textColor = $$props.textColor);
    		if ("dotColor" in $$props) $$invalidate(10, dotColor = $$props.dotColor);
    	};

    	$$self.$capture_state = () => {
    		return {
    			showDots,
    			animLength,
    			animSpread,
    			dotSize,
    			maxGrowthFactor,
    			growthDuration,
    			dotPromise,
    			bgColor,
    			stateColor,
    			textColor,
    			dotColor,
    			statePromise,
    			width,
    			height,
    			viewBox
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("showDots" in $$props) $$invalidate(0, showDots = $$props.showDots);
    		if ("animLength" in $$props) $$invalidate(1, animLength = $$props.animLength);
    		if ("animSpread" in $$props) $$invalidate(2, animSpread = $$props.animSpread);
    		if ("dotSize" in $$props) $$invalidate(3, dotSize = $$props.dotSize);
    		if ("maxGrowthFactor" in $$props) $$invalidate(4, maxGrowthFactor = $$props.maxGrowthFactor);
    		if ("growthDuration" in $$props) $$invalidate(5, growthDuration = $$props.growthDuration);
    		if ("dotPromise" in $$props) $$invalidate(6, dotPromise = $$props.dotPromise);
    		if ("bgColor" in $$props) $$invalidate(7, bgColor = $$props.bgColor);
    		if ("stateColor" in $$props) $$invalidate(8, stateColor = $$props.stateColor);
    		if ("textColor" in $$props) $$invalidate(9, textColor = $$props.textColor);
    		if ("dotColor" in $$props) $$invalidate(10, dotColor = $$props.dotColor);
    		if ("statePromise" in $$props) $$invalidate(12, statePromise = $$props.statePromise);
    		if ("width" in $$props) $$invalidate(13, width = $$props.width);
    		if ("height" in $$props) $$invalidate(14, height = $$props.height);
    		if ("viewBox" in $$props) $$invalidate(11, viewBox = $$props.viewBox);
    	};

    	let viewBox;
    	 $$invalidate(11, viewBox = `0 0 ${width} ${height}`);

    	return [
    		showDots,
    		animLength,
    		animSpread,
    		dotSize,
    		maxGrowthFactor,
    		growthDuration,
    		dotPromise,
    		bgColor,
    		stateColor,
    		textColor,
    		dotColor,
    		viewBox,
    		statePromise,
    		width,
    		height,
    		projection,
    		path,
    		sortFn,
    		crestPositions,
    		click_handler
    	];
    }

    class Map$2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			showDots: 0,
    			animLength: 1,
    			animSpread: 2,
    			dotSize: 3,
    			maxGrowthFactor: 4,
    			growthDuration: 5,
    			dotPromise: 6,
    			bgColor: 7,
    			stateColor: 8,
    			textColor: 9,
    			dotColor: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get showDots() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showDots(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animLength() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animLength(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animSpread() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animSpread(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dotSize() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dotSize(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxGrowthFactor() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxGrowthFactor(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get growthDuration() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set growthDuration(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dotPromise() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dotPromise(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stateColor() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stateColor(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textColor() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textColor(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dotColor() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dotColor(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function RGBToHSL({r,g,b}) {
      // Make r, g, and b fractions of 1
      r /= 255;
      g /= 255;
      b /= 255;

      // Find greatest and smallest channel values
      let cmin = Math.min(r,g,b),
          cmax = Math.max(r,g,b),
          delta = cmax - cmin,
          h = 0,
          s = 0,
          l = 0;

      // Calculate hue
      // No difference
      if (delta == 0)
        h = 0;
      // Red is max
      else if (cmax == r)
        h = ((g - b) / delta) % 6;
      // Green is max
      else if (cmax == g)
        h = (b - r) / delta + 2;
      // Blue is max
      else
        h = (r - g) / delta + 4;

      h = Math.round(h * 60);
        
      // Make negative hues positive behind 360°
      if (h < 0)
          h += 360;

      l = (cmax + cmin) / 2;

      // Calculate saturation
      s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        
      // Multiply l and s by 100
      s = +(s * 100).toFixed(1);
      l = +(l * 100).toFixed(1);

      return {h, s, l};
    }

    /* src/components/ColorPicker.svelte generated by Svelte v3.16.5 */
    const file$2 = "src/components/ColorPicker.svelte";

    function create_fragment$2(ctx) {
    	let div0;
    	let p;
    	let div0_class_value;
    	let div0_style_value;
    	let t1;
    	let div1;
    	let label0;
    	let t2;
    	let input0;
    	let t3;
    	let input1;
    	let input1_updating = false;
    	let t4;
    	let label1;
    	let t5;
    	let input2;
    	let t6;
    	let input3;
    	let input3_updating = false;
    	let t7;
    	let label2;
    	let t8;
    	let input4;
    	let t9;
    	let input5;
    	let input5_updating = false;
    	let div1_class_value;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	function input1_input_handler() {
    		input1_updating = true;
    		/*input1_input_handler*/ ctx[7].call(input1);
    	}

    	function input3_input_handler() {
    		input3_updating = true;
    		/*input3_input_handler*/ ctx[9].call(input3);
    	}

    	function input5_input_handler() {
    		input5_updating = true;
    		/*input5_input_handler*/ ctx[11].call(input5);
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			if (!default_slot) {
    				p = element("p");
    				p.textContent = "Color Value";
    			}

    			if (default_slot) default_slot.c();
    			t1 = space();
    			div1 = element("div");
    			label0 = element("label");
    			t2 = text("Red\n    ");
    			input0 = element("input");
    			t3 = space();
    			input1 = element("input");
    			t4 = space();
    			label1 = element("label");
    			t5 = text("Green\n    ");
    			input2 = element("input");
    			t6 = space();
    			input3 = element("input");
    			t7 = space();
    			label2 = element("label");
    			t8 = text("Blue\n    ");
    			input4 = element("input");
    			t9 = space();
    			input5 = element("input");

    			if (!default_slot) {
    				add_location(p, file$2, 15, 4, 414);
    			}

    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(`dropdown ${/*reveal*/ ctx[1] ? "reveal" : "hide"}`) + " svelte-1i2tv66"));

    			attr_dev(div0, "style", div0_style_value = `--bg: hsl(${/*hsl*/ ctx[2].h}deg, ${/*hsl*/ ctx[2].s}%, ${/*hsl*/ ctx[2].l}%);
              --bg-invert: hsl(${/*hsl*/ ctx[2].h}deg, ${100 - /*hsl*/ ctx[2].l}%, ${/*hsl*/ ctx[2].l > 50 ? 3 : 97}%);`);

    			add_location(div0, file$2, 11, 0, 159);
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "255");
    			add_location(input0, file$2, 20, 4, 514);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "255");
    			add_location(input1, file$2, 21, 4, 576);
    			add_location(label0, file$2, 19, 2, 499);
    			attr_dev(input2, "type", "range");
    			attr_dev(input2, "min", "0");
    			attr_dev(input2, "max", "255");
    			add_location(input2, file$2, 24, 4, 665);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "min", "0");
    			attr_dev(input3, "max", "255");
    			add_location(input3, file$2, 25, 4, 727);
    			add_location(label1, file$2, 23, 2, 648);
    			attr_dev(input4, "type", "range");
    			attr_dev(input4, "min", "0");
    			attr_dev(input4, "max", "255");
    			add_location(input4, file$2, 28, 4, 815);
    			attr_dev(input5, "type", "number");
    			attr_dev(input5, "min", "0");
    			attr_dev(input5, "max", "255");
    			add_location(input5, file$2, 29, 4, 877);
    			add_location(label2, file$2, 27, 2, 799);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*reveal*/ ctx[1] ? "revealed" : "hidden") + " svelte-1i2tv66"));
    			add_location(div1, file$2, 18, 0, 450);

    			dispose = [
    				listen_dev(div0, "click", /*click_handler*/ ctx[5], false, false, false),
    				listen_dev(input0, "change", /*input0_change_input_handler*/ ctx[6]),
    				listen_dev(input0, "input", /*input0_change_input_handler*/ ctx[6]),
    				listen_dev(input1, "input", input1_input_handler),
    				listen_dev(input2, "change", /*input2_change_input_handler*/ ctx[8]),
    				listen_dev(input2, "input", /*input2_change_input_handler*/ ctx[8]),
    				listen_dev(input3, "input", input3_input_handler),
    				listen_dev(input4, "change", /*input4_change_input_handler*/ ctx[10]),
    				listen_dev(input4, "input", /*input4_change_input_handler*/ ctx[10]),
    				listen_dev(input5, "input", input5_input_handler)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			if (!default_slot) {
    				append_dev(div0, p);
    			}

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label0);
    			append_dev(label0, t2);
    			append_dev(label0, input0);
    			set_input_value(input0, /*rgb*/ ctx[0].r);
    			append_dev(label0, t3);
    			append_dev(label0, input1);
    			set_input_value(input1, /*rgb*/ ctx[0].r);
    			append_dev(div1, t4);
    			append_dev(div1, label1);
    			append_dev(label1, t5);
    			append_dev(label1, input2);
    			set_input_value(input2, /*rgb*/ ctx[0].g);
    			append_dev(label1, t6);
    			append_dev(label1, input3);
    			set_input_value(input3, /*rgb*/ ctx[0].g);
    			append_dev(div1, t7);
    			append_dev(div1, label2);
    			append_dev(label2, t8);
    			append_dev(label2, input4);
    			set_input_value(input4, /*rgb*/ ctx[0].b);
    			append_dev(label2, t9);
    			append_dev(label2, input5);
    			set_input_value(input5, /*rgb*/ ctx[0].b);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 8) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null));
    			}

    			if (!current || dirty & /*reveal*/ 2 && div0_class_value !== (div0_class_value = "" + (null_to_empty(`dropdown ${/*reveal*/ ctx[1] ? "reveal" : "hide"}`) + " svelte-1i2tv66"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*hsl*/ 4 && div0_style_value !== (div0_style_value = `--bg: hsl(${/*hsl*/ ctx[2].h}deg, ${/*hsl*/ ctx[2].s}%, ${/*hsl*/ ctx[2].l}%);
              --bg-invert: hsl(${/*hsl*/ ctx[2].h}deg, ${100 - /*hsl*/ ctx[2].l}%, ${/*hsl*/ ctx[2].l > 50 ? 3 : 97}%);`)) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (dirty & /*rgb*/ 1) {
    				set_input_value(input0, /*rgb*/ ctx[0].r);
    			}

    			if (!input1_updating && dirty & /*rgb*/ 1) {
    				set_input_value(input1, /*rgb*/ ctx[0].r);
    			}

    			input1_updating = false;

    			if (dirty & /*rgb*/ 1) {
    				set_input_value(input2, /*rgb*/ ctx[0].g);
    			}

    			if (!input3_updating && dirty & /*rgb*/ 1) {
    				set_input_value(input3, /*rgb*/ ctx[0].g);
    			}

    			input3_updating = false;

    			if (dirty & /*rgb*/ 1) {
    				set_input_value(input4, /*rgb*/ ctx[0].b);
    			}

    			if (!input5_updating && dirty & /*rgb*/ 1) {
    				set_input_value(input5, /*rgb*/ ctx[0].b);
    			}

    			input5_updating = false;

    			if (!current || dirty & /*reveal*/ 2 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*reveal*/ ctx[1] ? "revealed" : "hidden") + " svelte-1i2tv66"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { rgb = { r: 0, g: 0, b: 0 } } = $$props;
    	let reveal = false;
    	const writable_props = ["rgb"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ColorPicker> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	const click_handler = () => $$invalidate(1, reveal = !reveal);

    	function input0_change_input_handler() {
    		rgb.r = to_number(this.value);
    		$$invalidate(0, rgb);
    	}

    	function input1_input_handler() {
    		rgb.r = to_number(this.value);
    		$$invalidate(0, rgb);
    	}

    	function input2_change_input_handler() {
    		rgb.g = to_number(this.value);
    		$$invalidate(0, rgb);
    	}

    	function input3_input_handler() {
    		rgb.g = to_number(this.value);
    		$$invalidate(0, rgb);
    	}

    	function input4_change_input_handler() {
    		rgb.b = to_number(this.value);
    		$$invalidate(0, rgb);
    	}

    	function input5_input_handler() {
    		rgb.b = to_number(this.value);
    		$$invalidate(0, rgb);
    	}

    	$$self.$set = $$props => {
    		if ("rgb" in $$props) $$invalidate(0, rgb = $$props.rgb);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { rgb, reveal, hsl };
    	};

    	$$self.$inject_state = $$props => {
    		if ("rgb" in $$props) $$invalidate(0, rgb = $$props.rgb);
    		if ("reveal" in $$props) $$invalidate(1, reveal = $$props.reveal);
    		if ("hsl" in $$props) $$invalidate(2, hsl = $$props.hsl);
    	};

    	let hsl;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*rgb*/ 1) {
    			 $$invalidate(2, hsl = RGBToHSL(rgb));
    		}
    	};

    	return [
    		rgb,
    		reveal,
    		hsl,
    		$$scope,
    		$$slots,
    		click_handler,
    		input0_change_input_handler,
    		input1_input_handler,
    		input2_change_input_handler,
    		input3_input_handler,
    		input4_change_input_handler,
    		input5_input_handler
    	];
    }

    class ColorPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { rgb: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorPicker",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get rgb() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rgb(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function roundToDecimals$1(num, places) {
        const factorOfTen =- Math.pow(10, places);
        return Math.round(num * factorOfTen) / factorOfTen
    }

    const zipTable = enqueueCSV('./assets/zip_lat-long.csv');

    const baseData = enqueueCSV('./assets/na-admission-zip_outpatient-2020.csv');

    const fillerData = enqueueCSV('./assets/filler_data.csv')
        .then(data => {
            return data.map(d => {
                return { // construct a geoJSON feature
                    type: "Feature",
                    properties: {
                        zipcode: undefined,
                        numPeople: 0,
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [d.longitude, d.latitude]
                    }
                }
            })
    });

    const talliedBaseData = baseData.then(data => {
        const lowercaseData = objKeysToLowercase(data); // handle case that user uploads a CSV with title case column headers
        const flatZips = lowercaseData.map(d => d.zipcode); // extract zipcodes into flat Array
        const unique = flatZips.filter(isDistinct) // extract unique values
            .map(d => {
                return { // construct new item with zip and number of occurrances of zip in data
                    zipcode: d,
                    numPeople: flatZips.filter(item => item === d).length
                }
            });

        return unique
    });

    // Making filler data available by itself
    const fillerGeoData = Promise.all([zipTable, fillerData]).then(([zip2geo, filler]) => {
        return { // construct geoJSON FeatureCollection, essentially a big table merge
            "type":"FeatureCollection",
            "features": [...filler]
        }   
    });

    // Making report data available by itself
    const reportGeoData = Promise.all([zipTable, baseData])
        .then(([zip2geo, zipcodes]) => {
            return { // construct geoJSON FeatureCollection, essentially a big table merge
                "type":"FeatureCollection",
                "features": [...zipcodes.map(z => {
                        let item = zip2geo.find(geo => geo.zip == z.zipcode);

                        if (!item) return

                        return {
                            type: "Feature",
                            properties: {
                                zipcode: z.zipcode,
                                numPeople: z.numPeople,
                            },
                            geometry: {
                                type: "Point",
                                coordinates: [parseFloat(item.longitude), parseFloat(item.latitude)]
                            }
                        }
                    }).filter(item => !!item),
                ]
            }   
    });

    // Merged filler and report data
    const mergedGeoData = Promise.all([zipTable, talliedBaseData, fillerData])
        .then(([zip2geo, zipcodes, filler]) => {
            return { // construct geoJSON FeatureCollection, essentially a big table merge
                "type":"FeatureCollection",
                "features": [...zipcodes.map(z => {
                    let item = zip2geo.find(geo => geo.zip == z.zipcode);

                    if (!item) return

                    return {
                        type: "Feature",
                        properties: {
                            zipcode: z.zipcode,
                            numPeople: z.numPeople,
                        },
                        geometry: {
                            type: "Point",
                            coordinates: [roundToDecimals$1(parseFloat(item.longitude), 3), roundToDecimals$1(parseFloat(item.latitude), 3)]
                        }
                    }
                }).filter(item => !!item),
                ...filler]
            }    
    });

    function enqueueCSV(csv) {
        return fetch(csv)
            .then(res => {
                return res.ok ? res.text() : Promise.reject(res.status);
            }).then(text => csvParse(text))
    }

    function isDistinct(val, index, arr) { return arr.indexOf(val) === index }

    function objKeysToLowercase(obj) {
        const newObj = {};
        return Object.keys(obj).map(key => newObj[key.toLowerCase()] = obj[key])
    }

    /* src/App.svelte generated by Svelte v3.16.5 */

    const { Map: Map_1$1 } = globals;
    const file$3 = "src/App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (47:1) {#each rangeUI as range, i (i)}
    function create_each_block_1$1(key_1, ctx) {
    	let label;
    	let t0_value = /*range*/ ctx[18].label + "";
    	let t0;
    	let t1;
    	let input;
    	let input_min_value;
    	let input_max_value;
    	let input_step_value;
    	let input_value_value;
    	let t2;
    	let t3_value = /*animParams*/ ctx[2][/*range*/ ctx[18].param] + /*range*/ ctx[18].labelSuffix + "";
    	let t3;
    	let dispose;

    	function input_handler(...args) {
    		return /*input_handler*/ ctx[11](/*range*/ ctx[18], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			t3 = text(t3_value);
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", input_min_value = /*range*/ ctx[18].min);
    			attr_dev(input, "max", input_max_value = /*range*/ ctx[18].max);
    			attr_dev(input, "step", input_step_value = /*range*/ ctx[18].step);
    			input.value = input_value_value = /*animParams*/ ctx[2][/*range*/ ctx[18].param];
    			add_location(input, file$3, 48, 2, 1760);
    			attr_dev(label, "class", "range-group svelte-oyz1h0");
    			add_location(label, file$3, 47, 1, 1715);

    			dispose = listen_dev(
    				input,
    				"input",
    				function () {
    					input_handler.apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);

    			this.first = label;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, input);
    			append_dev(label, t2);
    			append_dev(label, t3);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*animParams*/ 4 && input_value_value !== (input_value_value = /*animParams*/ ctx[2][/*range*/ ctx[18].param])) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty & /*animParams*/ 4 && t3_value !== (t3_value = /*animParams*/ ctx[2][/*range*/ ctx[18].param] + /*range*/ ctx[18].labelSuffix + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(47:1) {#each rangeUI as range, i (i)}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>  import Map from './Map.svelte'  import ColorPicker from './components/ColorPicker.svelte'  import { mergedGeoData, reportGeoData, fillerGeoData }
    function create_catch_block$1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(1:0) <script>  import Map from './Map.svelte'  import ColorPicker from './components/ColorPicker.svelte'  import { mergedGeoData, reportGeoData, fillerGeoData }",
    		ctx
    	});

    	return block;
    }

    // (58:2) {:then dataset}
    function create_then_block$1(ctx) {
    	let t_value = /*datasetLabels*/ ctx[6][/*datasetIndex*/ ctx[0]] + ` (${/*dataset*/ ctx[17].features.length} dots)` + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*datasetIndex*/ 1 && t_value !== (t_value = /*datasetLabels*/ ctx[6][/*datasetIndex*/ ctx[0]] + ` (${/*dataset*/ ctx[17].features.length} dots)` + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(58:2) {:then dataset}",
    		ctx
    	});

    	return block;
    }

    // (56:33)    ...loading   {:then dataset}
    function create_pending_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("...loading");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(56:33)    ...loading   {:then dataset}",
    		ctx
    	});

    	return block;
    }

    // (66:2) <ColorPicker bind:rgb={ colors[picker.param] }>
    function create_default_slot(ctx) {
    	let p;
    	let t_value = /*picker*/ ctx[14].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$3, 66, 3, 2413);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(66:2) <ColorPicker bind:rgb={ colors[picker.param] }>",
    		ctx
    	});

    	return block;
    }

    // (64:1) {#each colorUI as picker, i (i)}
    function create_each_block$1(key_1, ctx) {
    	let div;
    	let updating_rgb;
    	let t;
    	let current;

    	function colorpicker_rgb_binding(value) {
    		/*colorpicker_rgb_binding*/ ctx[13].call(null, value, /*picker*/ ctx[14]);
    	}

    	let colorpicker_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*colors*/ ctx[3][/*picker*/ ctx[14].param] !== void 0) {
    		colorpicker_props.rgb = /*colors*/ ctx[3][/*picker*/ ctx[14].param];
    	}

    	const colorpicker = new ColorPicker({ props: colorpicker_props, $$inline: true });
    	binding_callbacks.push(() => bind(colorpicker, "rgb", colorpicker_rgb_binding));

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(colorpicker.$$.fragment);
    			t = space();
    			add_location(div, file$3, 64, 1, 2354);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(colorpicker, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const colorpicker_changes = {};

    			if (dirty & /*$$scope*/ 1048576) {
    				colorpicker_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_rgb && dirty & /*colors, colorUI*/ 264) {
    				updating_rgb = true;
    				colorpicker_changes.rgb = /*colors*/ ctx[3][/*picker*/ ctx[14].param];
    				add_flush_callback(() => updating_rgb = false);
    			}

    			colorpicker.$set(colorpicker_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(colorpicker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(colorpicker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(colorpicker);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(64:1) {#each colorUI as picker, i (i)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let updating_showDots;
    	let t0;
    	let section0;
    	let button;
    	let t1_value = (/*showDots*/ ctx[1] ? "Hide" : "Show") + "";
    	let t1;
    	let t2;
    	let t3;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map_1$1();
    	let t4;
    	let label;
    	let t5;
    	let input;
    	let t6;
    	let promise;
    	let t7;
    	let section1;
    	let each_blocks = [];
    	let each1_lookup = new Map_1$1();
    	let current;
    	let dispose;

    	const map_spread_levels = [
    		{ dotPromise: /*dotPromise*/ ctx[4] },
    		/*animParams*/ ctx[2],
    		/*colors*/ ctx[3]
    	];

    	function map_showDots_binding(value) {
    		/*map_showDots_binding*/ ctx[9].call(null, value);
    	}

    	let map_props = {};

    	for (let i = 0; i < map_spread_levels.length; i += 1) {
    		map_props = assign(map_props, map_spread_levels[i]);
    	}

    	if (/*showDots*/ ctx[1] !== void 0) {
    		map_props.showDots = /*showDots*/ ctx[1];
    	}

    	const map = new Map$2({ props: map_props, $$inline: true });
    	binding_callbacks.push(() => bind(map, "showDots", map_showDots_binding));
    	let each_value_1 = /*rangeUI*/ ctx[7];
    	const get_key = ctx => /*i*/ ctx[16];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1$1(key, child_ctx));
    	}

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 17
    	};

    	handle_promise(promise = /*datasets*/ ctx[5][/*datasetIndex*/ ctx[0]], info);
    	let each_value = /*colorUI*/ ctx[8];
    	const get_key_1 = ctx => /*i*/ ctx[16];

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			create_component(map.$$.fragment);
    			t0 = space();
    			section0 = element("section");
    			button = element("button");
    			t1 = text(t1_value);
    			t2 = text(" Dots");
    			t3 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			label = element("label");
    			t5 = text("Dataset\n\t\t");
    			input = element("input");
    			t6 = space();
    			info.block.c();
    			t7 = space();
    			section1 = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(button, "class", "show-dots svelte-oyz1h0");
    			add_location(button, file$3, 45, 1, 1572);
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", "0");
    			attr_dev(input, "max", "2");
    			attr_dev(input, "step", "1");
    			input.value = "0";
    			add_location(input, file$3, 54, 2, 2038);
    			set_style(label, "white-space", "nowrap");
    			add_location(label, file$3, 53, 1, 1992);
    			attr_dev(section0, "class", "svelte-oyz1h0");
    			add_location(section0, file$3, 44, 0, 1561);
    			attr_dev(section1, "class", "svelte-oyz1h0");
    			add_location(section1, file$3, 62, 0, 2309);

    			dispose = [
    				listen_dev(button, "click", /*click_handler*/ ctx[10], false, false, false),
    				listen_dev(
    					input,
    					"input",
    					function () {
    						/*input_handler_1*/ ctx[12].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(map, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, button);
    			append_dev(button, t1);
    			append_dev(button, t2);
    			append_dev(section0, t3);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(section0, null);
    			}

    			append_dev(section0, t4);
    			append_dev(section0, label);
    			append_dev(label, t5);
    			append_dev(label, input);
    			append_dev(label, t6);
    			info.block.m(label, info.anchor = null);
    			info.mount = () => label;
    			info.anchor = null;
    			insert_dev(target, t7, anchor);
    			insert_dev(target, section1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section1, null);
    			}

    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			const map_changes = (dirty & /*dotPromise, animParams, colors*/ 28)
    			? get_spread_update(map_spread_levels, [
    					dirty & /*dotPromise*/ 16 && ({ dotPromise: /*dotPromise*/ ctx[4] }),
    					dirty & /*animParams*/ 4 && get_spread_object(/*animParams*/ ctx[2]),
    					dirty & /*colors*/ 8 && get_spread_object(/*colors*/ ctx[3])
    				])
    			: {};

    			if (!updating_showDots && dirty & /*showDots*/ 2) {
    				updating_showDots = true;
    				map_changes.showDots = /*showDots*/ ctx[1];
    				add_flush_callback(() => updating_showDots = false);
    			}

    			map.$set(map_changes);
    			if ((!current || dirty & /*showDots*/ 2) && t1_value !== (t1_value = (/*showDots*/ ctx[1] ? "Hide" : "Show") + "")) set_data_dev(t1, t1_value);
    			const each_value_1 = /*rangeUI*/ ctx[7];
    			each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, section0, destroy_block, create_each_block_1$1, t4, get_each_context_1$1);
    			info.ctx = ctx;

    			if (dirty & /*datasetIndex*/ 1 && promise !== (promise = /*datasets*/ ctx[5][/*datasetIndex*/ ctx[0]]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[17] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			const each_value = /*colorUI*/ ctx[8];
    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, section1, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    			check_outros();
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(map.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(map.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(map, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			info.block.d();
    			info.token = null;
    			info = null;
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(section1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const datasets = [mergedGeoData, reportGeoData, fillerGeoData];
    	const datasetLabels = ["Merged", "Report", "Filler"];
    	let datasetIndex = 0;
    	let showDots = false;

    	let animParams = {
    		animLength: 5.8,
    		animSpread: 0.18,
    		dotSize: 3.2,
    		maxGrowthFactor: 2.03,
    		growthDuration: 0.24
    	};

    	const rangeUI = [
    		{
    			param: "animLength",
    			label: "Duration",
    			labelSuffix: " s",
    			min: 1,
    			max: 10,
    			step: 0.1
    		},
    		{
    			param: "animSpread",
    			label: "Spread",
    			labelSuffix: "",
    			min: 0,
    			max: 1,
    			step: 0.01
    		},
    		{
    			param: "dotSize",
    			label: "Base Dot Size",
    			labelSuffix: "",
    			min: 1,
    			max: 7,
    			step: 0.1
    		},
    		{
    			param: "maxGrowthFactor",
    			label: "Max Dot Size",
    			labelSuffix: "x",
    			min: 1.1,
    			max: 4.5,
    			step: 0.01
    		},
    		{
    			param: "growthDuration",
    			label: "Growth Duration",
    			labelSuffix: " s",
    			min: 0.05,
    			max: 0.5,
    			step: 0.01
    		}
    	];

    	const colors = {
    		dotColor: { r: 252, g: 193, b: 59 },
    		bgColor: { r: 75, g: 112, b: 179 },
    		stateColor: { r: 2, g: 16, b: 54 },
    		textColor: { r: 234, g: 245, b: 255 }
    	};

    	const colorUI = [
    		{ param: "dotColor", label: "Dot Color" },
    		{
    			param: "bgColor",
    			label: "Background Color"
    		},
    		{
    			param: "stateColor",
    			label: "State Color"
    		},
    		{ param: "textColor", label: "Text Color" }
    	];

    	function map_showDots_binding(value) {
    		showDots = value;
    		$$invalidate(1, showDots);
    	}

    	const click_handler = () => $$invalidate(1, showDots = !showDots);
    	const input_handler = (range, e) => $$invalidate(2, animParams[range.param] = e.target.value, animParams);
    	const input_handler_1 = e => $$invalidate(0, datasetIndex = e.target.value);

    	function colorpicker_rgb_binding(value, picker) {
    		colors[picker.param] = value;
    		$$invalidate(3, colors);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("datasetIndex" in $$props) $$invalidate(0, datasetIndex = $$props.datasetIndex);
    		if ("showDots" in $$props) $$invalidate(1, showDots = $$props.showDots);
    		if ("animParams" in $$props) $$invalidate(2, animParams = $$props.animParams);
    		if ("dotPromise" in $$props) $$invalidate(4, dotPromise = $$props.dotPromise);
    	};

    	let dotPromise;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*datasetIndex*/ 1) {
    			 $$invalidate(4, dotPromise = datasets[datasetIndex]);
    		}
    	};

    	return [
    		datasetIndex,
    		showDots,
    		animParams,
    		colors,
    		dotPromise,
    		datasets,
    		datasetLabels,
    		rangeUI,
    		colorUI,
    		map_showDots_binding,
    		click_handler,
    		input_handler,
    		input_handler_1,
    		colorpicker_rgb_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
