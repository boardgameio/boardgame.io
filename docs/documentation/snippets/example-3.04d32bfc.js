parcelRequire = (function(e, r, t, n) {
  var i,
    o = 'function' == typeof parcelRequire && parcelRequire,
    u = 'function' == typeof require && require;
  function f(t, n) {
    if (!r[t]) {
      if (!e[t]) {
        var i = 'function' == typeof parcelRequire && parcelRequire;
        if (!n && i) return i(t, !0);
        if (o) return o(t, !0);
        if (u && 'string' == typeof t) return u(t);
        var c = new Error("Cannot find module '" + t + "'");
        throw ((c.code = 'MODULE_NOT_FOUND'), c);
      }
      (p.resolve = function(r) {
        return e[t][1][r] || r;
      }),
        (p.cache = {});
      var l = (r[t] = new f.Module(t));
      e[t][0].call(l.exports, p, l, l.exports, this);
    }
    return r[t].exports;
    function p(e) {
      return f(p.resolve(e));
    }
  }
  (f.isParcelRequire = !0),
    (f.Module = function(e) {
      (this.id = e), (this.bundle = f), (this.exports = {});
    }),
    (f.modules = e),
    (f.cache = r),
    (f.parent = o),
    (f.register = function(r, t) {
      e[r] = [
        function(e, r) {
          r.exports = t;
        },
        {},
      ];
    });
  for (var c = 0; c < t.length; c++)
    try {
      f(t[c]);
    } catch (e) {
      i || (i = e);
    }
  if (t.length) {
    var l = f(t[t.length - 1]);
    'object' == typeof exports && 'undefined' != typeof module
      ? (module.exports = l)
      : 'function' == typeof define && define.amd
      ? define(function() {
          return l;
        })
      : n && (this[n] = l);
  }
  if (((parcelRequire = f), i)) throw i;
  return f;
})(
  {
    J4Nk: [
      function(require, module, exports) {
        'use strict';
        var r = Object.getOwnPropertySymbols,
          t = Object.prototype.hasOwnProperty,
          e = Object.prototype.propertyIsEnumerable;
        function n(r) {
          if (null == r)
            throw new TypeError(
              'Object.assign cannot be called with null or undefined'
            );
          return Object(r);
        }
        function o() {
          try {
            if (!Object.assign) return !1;
            var r = new String('abc');
            if (((r[5] = 'de'), '5' === Object.getOwnPropertyNames(r)[0]))
              return !1;
            for (var t = {}, e = 0; e < 10; e++)
              t['_' + String.fromCharCode(e)] = e;
            if (
              '0123456789' !==
              Object.getOwnPropertyNames(t)
                .map(function(r) {
                  return t[r];
                })
                .join('')
            )
              return !1;
            var n = {};
            return (
              'abcdefghijklmnopqrst'.split('').forEach(function(r) {
                n[r] = r;
              }),
              'abcdefghijklmnopqrst' ===
                Object.keys(Object.assign({}, n)).join('')
            );
          } catch (o) {
            return !1;
          }
        }
        module.exports = o()
          ? Object.assign
          : function(o, c) {
              for (var a, i, s = n(o), f = 1; f < arguments.length; f++) {
                for (var u in (a = Object(arguments[f])))
                  t.call(a, u) && (s[u] = a[u]);
                if (r) {
                  i = r(a);
                  for (var b = 0; b < i.length; b++)
                    e.call(a, i[b]) && (s[i[b]] = a[i[b]]);
                }
              }
              return s;
            };
      },
      {},
    ],
    awqi: [
      function(require, module, exports) {
        'use strict';
        var e = require('object-assign'),
          t = 'function' == typeof Symbol && Symbol.for,
          r = t ? Symbol.for('react.element') : 60103,
          n = t ? Symbol.for('react.portal') : 60106,
          o = t ? Symbol.for('react.fragment') : 60107,
          u = t ? Symbol.for('react.strict_mode') : 60108,
          l = t ? Symbol.for('react.profiler') : 60114,
          f = t ? Symbol.for('react.provider') : 60109,
          c = t ? Symbol.for('react.context') : 60110,
          i = t ? Symbol.for('react.forward_ref') : 60112,
          a = t ? Symbol.for('react.suspense') : 60113,
          s = t ? Symbol.for('react.suspense_list') : 60120,
          p = t ? Symbol.for('react.memo') : 60115,
          y = t ? Symbol.for('react.lazy') : 60116;
        t && Symbol.for('react.fundamental'),
          t && Symbol.for('react.responder');
        var d = 'function' == typeof Symbol && Symbol.iterator;
        function m(e) {
          for (
            var t = e.message,
              r = 'https://reactjs.org/docs/error-decoder.html?invariant=' + t,
              n = 1;
            n < arguments.length;
            n++
          )
            r += '&args[]=' + encodeURIComponent(arguments[n]);
          return (
            (e.message =
              'Minified React error #' +
              t +
              '; visit ' +
              r +
              ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings. '),
            e
          );
        }
        var v = {
            isMounted: function() {
              return !1;
            },
            enqueueForceUpdate: function() {},
            enqueueReplaceState: function() {},
            enqueueSetState: function() {},
          },
          h = {};
        function b(e, t, r) {
          (this.props = e),
            (this.context = t),
            (this.refs = h),
            (this.updater = r || v);
        }
        function S() {}
        function _(e, t, r) {
          (this.props = e),
            (this.context = t),
            (this.refs = h),
            (this.updater = r || v);
        }
        (b.prototype.isReactComponent = {}),
          (b.prototype.setState = function(e, t) {
            if ('object' != typeof e && 'function' != typeof e && null != e)
              throw m(Error(85));
            this.updater.enqueueSetState(this, e, t, 'setState');
          }),
          (b.prototype.forceUpdate = function(e) {
            this.updater.enqueueForceUpdate(this, e, 'forceUpdate');
          }),
          (S.prototype = b.prototype);
        var g = (_.prototype = new S());
        (g.constructor = _), e(g, b.prototype), (g.isPureReactComponent = !0);
        var k = { current: null },
          $ = { suspense: null },
          w = { current: null },
          C = Object.prototype.hasOwnProperty,
          E = { key: !0, ref: !0, __self: !0, __source: !0 };
        function R(e, t, n) {
          var o = void 0,
            u = {},
            l = null,
            f = null;
          if (null != t)
            for (o in (void 0 !== t.ref && (f = t.ref),
            void 0 !== t.key && (l = '' + t.key),
            t))
              C.call(t, o) && !E.hasOwnProperty(o) && (u[o] = t[o]);
          var c = arguments.length - 2;
          if (1 === c) u.children = n;
          else if (1 < c) {
            for (var i = Array(c), a = 0; a < c; a++) i[a] = arguments[a + 2];
            u.children = i;
          }
          if (e && e.defaultProps)
            for (o in (c = e.defaultProps)) void 0 === u[o] && (u[o] = c[o]);
          return {
            $$typeof: r,
            type: e,
            key: l,
            ref: f,
            props: u,
            _owner: w.current,
          };
        }
        function x(e, t) {
          return {
            $$typeof: r,
            type: e.type,
            key: t,
            ref: e.ref,
            props: e.props,
            _owner: e._owner,
          };
        }
        function P(e) {
          return 'object' == typeof e && null !== e && e.$$typeof === r;
        }
        function j(e) {
          var t = { '=': '=0', ':': '=2' };
          return (
            '$' +
            ('' + e).replace(/[=:]/g, function(e) {
              return t[e];
            })
          );
        }
        var O = /\/+/g,
          A = [];
        function I(e, t, r, n) {
          if (A.length) {
            var o = A.pop();
            return (
              (o.result = e),
              (o.keyPrefix = t),
              (o.func = r),
              (o.context = n),
              (o.count = 0),
              o
            );
          }
          return { result: e, keyPrefix: t, func: r, context: n, count: 0 };
        }
        function U(e) {
          (e.result = null),
            (e.keyPrefix = null),
            (e.func = null),
            (e.context = null),
            (e.count = 0),
            10 > A.length && A.push(e);
        }
        function q(e, t, o, u) {
          var l = typeof e;
          ('undefined' !== l && 'boolean' !== l) || (e = null);
          var f = !1;
          if (null === e) f = !0;
          else
            switch (l) {
              case 'string':
              case 'number':
                f = !0;
                break;
              case 'object':
                switch (e.$$typeof) {
                  case r:
                  case n:
                    f = !0;
                }
            }
          if (f) return o(u, e, '' === t ? '.' + F(e, 0) : t), 1;
          if (((f = 0), (t = '' === t ? '.' : t + ':'), Array.isArray(e)))
            for (var c = 0; c < e.length; c++) {
              var i = t + F((l = e[c]), c);
              f += q(l, i, o, u);
            }
          else if (
            (null === e || 'object' != typeof e
              ? (i = null)
              : (i =
                  'function' == typeof (i = (d && e[d]) || e['@@iterator'])
                    ? i
                    : null),
            'function' == typeof i)
          )
            for (e = i.call(e), c = 0; !(l = e.next()).done; )
              f += q((l = l.value), (i = t + F(l, c++)), o, u);
          else if ('object' === l)
            throw ((o = '' + e),
            m(
              Error(31),
              '[object Object]' === o
                ? 'object with keys {' + Object.keys(e).join(', ') + '}'
                : o,
              ''
            ));
          return f;
        }
        function L(e, t, r) {
          return null == e ? 0 : q(e, '', t, r);
        }
        function F(e, t) {
          return 'object' == typeof e && null !== e && null != e.key
            ? j(e.key)
            : t.toString(36);
        }
        function M(e, t) {
          e.func.call(e.context, t, e.count++);
        }
        function D(e, t, r) {
          var n = e.result,
            o = e.keyPrefix;
          (e = e.func.call(e.context, t, e.count++)),
            Array.isArray(e)
              ? V(e, n, r, function(e) {
                  return e;
                })
              : null != e &&
                (P(e) &&
                  (e = x(
                    e,
                    o +
                      (!e.key || (t && t.key === e.key)
                        ? ''
                        : ('' + e.key).replace(O, '$&/') + '/') +
                      r
                  )),
                n.push(e));
        }
        function V(e, t, r, n, o) {
          var u = '';
          null != r && (u = ('' + r).replace(O, '$&/') + '/'),
            L(e, D, (t = I(t, u, n, o))),
            U(t);
        }
        function B() {
          var e = k.current;
          if (null === e) throw m(Error(321));
          return e;
        }
        var N = {
            Children: {
              map: function(e, t, r) {
                if (null == e) return e;
                var n = [];
                return V(e, n, null, t, r), n;
              },
              forEach: function(e, t, r) {
                if (null == e) return e;
                L(e, M, (t = I(null, null, t, r))), U(t);
              },
              count: function(e) {
                return L(
                  e,
                  function() {
                    return null;
                  },
                  null
                );
              },
              toArray: function(e) {
                var t = [];
                return (
                  V(e, t, null, function(e) {
                    return e;
                  }),
                  t
                );
              },
              only: function(e) {
                if (!P(e)) throw m(Error(143));
                return e;
              },
            },
            createRef: function() {
              return { current: null };
            },
            Component: b,
            PureComponent: _,
            createContext: function(e, t) {
              return (
                void 0 === t && (t = null),
                ((e = {
                  $$typeof: c,
                  _calculateChangedBits: t,
                  _currentValue: e,
                  _currentValue2: e,
                  _threadCount: 0,
                  Provider: null,
                  Consumer: null,
                }).Provider = { $$typeof: f, _context: e }),
                (e.Consumer = e)
              );
            },
            forwardRef: function(e) {
              return { $$typeof: i, render: e };
            },
            lazy: function(e) {
              return { $$typeof: y, _ctor: e, _status: -1, _result: null };
            },
            memo: function(e, t) {
              return { $$typeof: p, type: e, compare: void 0 === t ? null : t };
            },
            useCallback: function(e, t) {
              return B().useCallback(e, t);
            },
            useContext: function(e, t) {
              return B().useContext(e, t);
            },
            useEffect: function(e, t) {
              return B().useEffect(e, t);
            },
            useImperativeHandle: function(e, t, r) {
              return B().useImperativeHandle(e, t, r);
            },
            useDebugValue: function() {},
            useLayoutEffect: function(e, t) {
              return B().useLayoutEffect(e, t);
            },
            useMemo: function(e, t) {
              return B().useMemo(e, t);
            },
            useReducer: function(e, t, r) {
              return B().useReducer(e, t, r);
            },
            useRef: function(e) {
              return B().useRef(e);
            },
            useState: function(e) {
              return B().useState(e);
            },
            Fragment: o,
            Profiler: l,
            StrictMode: u,
            Suspense: a,
            unstable_SuspenseList: s,
            createElement: R,
            cloneElement: function(t, n, o) {
              if (null == t) throw m(Error(267), t);
              var u = void 0,
                l = e({}, t.props),
                f = t.key,
                c = t.ref,
                i = t._owner;
              if (null != n) {
                void 0 !== n.ref && ((c = n.ref), (i = w.current)),
                  void 0 !== n.key && (f = '' + n.key);
                var a = void 0;
                for (u in (t.type &&
                  t.type.defaultProps &&
                  (a = t.type.defaultProps),
                n))
                  C.call(n, u) &&
                    !E.hasOwnProperty(u) &&
                    (l[u] = void 0 === n[u] && void 0 !== a ? a[u] : n[u]);
              }
              if (1 === (u = arguments.length - 2)) l.children = o;
              else if (1 < u) {
                a = Array(u);
                for (var s = 0; s < u; s++) a[s] = arguments[s + 2];
                l.children = a;
              }
              return {
                $$typeof: r,
                type: t.type,
                key: f,
                ref: c,
                props: l,
                _owner: i,
              };
            },
            createFactory: function(e) {
              var t = R.bind(null, e);
              return (t.type = e), t;
            },
            isValidElement: P,
            version: '16.9.0',
            unstable_withSuspenseConfig: function(e, t) {
              var r = $.suspense;
              $.suspense = void 0 === t ? null : t;
              try {
                e();
              } finally {
                $.suspense = r;
              }
            },
            __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
              ReactCurrentDispatcher: k,
              ReactCurrentBatchConfig: $,
              ReactCurrentOwner: w,
              IsSomeRendererActing: { current: !1 },
              assign: e,
            },
          },
          T = { default: N },
          z = (T && N) || T;
        module.exports = z.default || z;
      },
      { 'object-assign': 'J4Nk' },
    ],
    '1n8/': [
      function(require, module, exports) {
        'use strict';
        module.exports = require('./cjs/react.production.min.js');
      },
      { './cjs/react.production.min.js': 'awqi' },
    ],
    '5IvP': [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: !0 });
        var e = void 0,
          n = void 0,
          t = void 0,
          r = void 0,
          o = void 0;
        if (
          ((exports.unstable_now = void 0),
          (exports.unstable_forceFrameRate = void 0),
          'undefined' == typeof window || 'function' != typeof MessageChannel)
        ) {
          var i = null,
            l = null,
            u = function() {
              if (null !== i)
                try {
                  var e = exports.unstable_now();
                  i(!0, e), (i = null);
                } catch (n) {
                  throw (setTimeout(u, 0), n);
                }
            };
          (exports.unstable_now = function() {
            return Date.now();
          }),
            (e = function(n) {
              null !== i ? setTimeout(e, 0, n) : ((i = n), setTimeout(u, 0));
            }),
            (n = function(e, n) {
              l = setTimeout(e, n);
            }),
            (t = function() {
              clearTimeout(l);
            }),
            (r = function() {
              return !1;
            }),
            (o = exports.unstable_forceFrameRate = function() {});
        } else {
          var a = window.performance,
            s = window.Date,
            c = window.setTimeout,
            f = window.clearTimeout,
            p = window.requestAnimationFrame,
            x = window.cancelAnimationFrame;
          'undefined' != typeof console &&
            ('function' != typeof p &&
              console.error(
                "This browser doesn't support requestAnimationFrame. Make sure that you load a polyfill in older browsers. https://fb.me/react-polyfills"
              ),
            'function' != typeof x &&
              console.error(
                "This browser doesn't support cancelAnimationFrame. Make sure that you load a polyfill in older browsers. https://fb.me/react-polyfills"
              )),
            (exports.unstable_now =
              'object' == typeof a && 'function' == typeof a.now
                ? function() {
                    return a.now();
                  }
                : function() {
                    return s.now();
                  });
          var v = !1,
            b = null,
            w = -1,
            m = -1,
            d = 33.33,
            y = -1,
            _ = -1,
            h = 0,
            T = !1;
          (r = function() {
            return exports.unstable_now() >= h;
          }),
            (o = function() {}),
            (exports.unstable_forceFrameRate = function(e) {
              0 > e || 125 < e
                ? console.error(
                    'forceFrameRate takes a positive int between 0 and 125, forcing framerates higher than 125 fps is not unsupported'
                  )
                : 0 < e
                ? ((d = Math.floor(1e3 / e)), (T = !0))
                : ((d = 33.33), (T = !1));
            });
          var k = function() {
              if (null !== b) {
                var e = exports.unstable_now(),
                  n = 0 < h - e;
                try {
                  b(n, e) || (b = null);
                } catch (t) {
                  throw (F.postMessage(null), t);
                }
              }
            },
            g = new MessageChannel(),
            F = g.port2;
          g.port1.onmessage = k;
          var P = function(e) {
            if (null === b) (_ = y = -1), (v = !1);
            else {
              (v = !0),
                p(function(e) {
                  f(w), P(e);
                });
              var n = function() {
                (h = exports.unstable_now() + d / 2), k(), (w = c(n, 3 * d));
              };
              if (((w = c(n, 3 * d)), -1 !== y && 0.1 < e - y)) {
                var t = e - y;
                !T &&
                  -1 !== _ &&
                  t < d &&
                  _ < d &&
                  (8.33 > (d = t < _ ? _ : t) && (d = 8.33)),
                  (_ = t);
              }
              (y = e), (h = e + d), F.postMessage(null);
            }
          };
          (e = function(e) {
            (b = e),
              v ||
                ((v = !0),
                p(function(e) {
                  P(e);
                }));
          }),
            (n = function(e, n) {
              m = c(function() {
                e(exports.unstable_now());
              }, n);
            }),
            (t = function() {
              f(m), (m = -1);
            });
        }
        var M = null,
          C = null,
          A = null,
          L = 3,
          R = !1,
          j = !1,
          q = !1;
        function D(e, n) {
          var t = e.next;
          if (t === e) M = null;
          else {
            e === M && (M = t);
            var r = e.previous;
            (r.next = t), (t.previous = r);
          }
          (e.next = e.previous = null), (t = e.callback), (r = L);
          var o = A;
          (L = e.priorityLevel), (A = e);
          try {
            var i = e.expirationTime <= n;
            switch (L) {
              case 1:
                var l = t(i);
                break;
              case 2:
              case 3:
              case 4:
                l = t(i);
                break;
              case 5:
                l = t(i);
            }
          } catch (u) {
            throw u;
          } finally {
            (L = r), (A = o);
          }
          if ('function' == typeof l)
            if (((n = e.expirationTime), (e.callback = l), null === M))
              M = e.next = e.previous = e;
            else {
              (l = null), (i = M);
              do {
                if (n <= i.expirationTime) {
                  l = i;
                  break;
                }
                i = i.next;
              } while (i !== M);
              null === l ? (l = M) : l === M && (M = e),
                ((n = l.previous).next = l.previous = e),
                (e.next = l),
                (e.previous = n);
            }
        }
        function E(e) {
          if (null !== C && C.startTime <= e)
            do {
              var n = C,
                t = n.next;
              if (n === t) C = null;
              else {
                C = t;
                var r = n.previous;
                (r.next = t), (t.previous = r);
              }
              (n.next = n.previous = null), O(n, n.expirationTime);
            } while (null !== C && C.startTime <= e);
        }
        function I(t) {
          (q = !1),
            E(t),
            j ||
              (null !== M
                ? ((j = !0), e(N))
                : null !== C && n(I, C.startTime - t));
        }
        function N(e, o) {
          (j = !1), q && ((q = !1), t()), E(o), (R = !0);
          try {
            if (e) {
              if (null !== M)
                do {
                  D(M, o), E((o = exports.unstable_now()));
                } while (null !== M && !r());
            } else
              for (; null !== M && M.expirationTime <= o; )
                D(M, o), E((o = exports.unstable_now()));
            return null !== M || (null !== C && n(I, C.startTime - o), !1);
          } finally {
            R = !1;
          }
        }
        function B(e) {
          switch (e) {
            case 1:
              return -1;
            case 2:
              return 250;
            case 5:
              return 1073741823;
            case 4:
              return 1e4;
            default:
              return 5e3;
          }
        }
        function O(e, n) {
          if (null === M) M = e.next = e.previous = e;
          else {
            var t = null,
              r = M;
            do {
              if (n < r.expirationTime) {
                t = r;
                break;
              }
              r = r.next;
            } while (r !== M);
            null === t ? (t = M) : t === M && (M = e),
              ((n = t.previous).next = t.previous = e),
              (e.next = t),
              (e.previous = n);
          }
        }
        var U = o;
        (exports.unstable_ImmediatePriority = 1),
          (exports.unstable_UserBlockingPriority = 2),
          (exports.unstable_NormalPriority = 3),
          (exports.unstable_IdlePriority = 5),
          (exports.unstable_LowPriority = 4),
          (exports.unstable_runWithPriority = function(e, n) {
            switch (e) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
                break;
              default:
                e = 3;
            }
            var t = L;
            L = e;
            try {
              return n();
            } finally {
              L = t;
            }
          }),
          (exports.unstable_next = function(e) {
            switch (L) {
              case 1:
              case 2:
              case 3:
                var n = 3;
                break;
              default:
                n = L;
            }
            var t = L;
            L = n;
            try {
              return e();
            } finally {
              L = t;
            }
          }),
          (exports.unstable_scheduleCallback = function(r, o, i) {
            var l = exports.unstable_now();
            if ('object' == typeof i && null !== i) {
              var u = i.delay;
              (u = 'number' == typeof u && 0 < u ? l + u : l),
                (i = 'number' == typeof i.timeout ? i.timeout : B(r));
            } else (i = B(r)), (u = l);
            if (
              ((r = {
                callback: o,
                priorityLevel: r,
                startTime: u,
                expirationTime: (i = u + i),
                next: null,
                previous: null,
              }),
              u > l)
            ) {
              if (((i = u), null === C)) C = r.next = r.previous = r;
              else {
                o = null;
                var a = C;
                do {
                  if (i < a.startTime) {
                    o = a;
                    break;
                  }
                  a = a.next;
                } while (a !== C);
                null === o ? (o = C) : o === C && (C = r),
                  ((i = o.previous).next = o.previous = r),
                  (r.next = o),
                  (r.previous = i);
              }
              null === M && C === r && (q ? t() : (q = !0), n(I, u - l));
            } else O(r, i), j || R || ((j = !0), e(N));
            return r;
          }),
          (exports.unstable_cancelCallback = function(e) {
            var n = e.next;
            if (null !== n) {
              if (e === n) e === M ? (M = null) : e === C && (C = null);
              else {
                e === M ? (M = n) : e === C && (C = n);
                var t = e.previous;
                (t.next = n), (n.previous = t);
              }
              e.next = e.previous = null;
            }
          }),
          (exports.unstable_wrapCallback = function(e) {
            var n = L;
            return function() {
              var t = L;
              L = n;
              try {
                return e.apply(this, arguments);
              } finally {
                L = t;
              }
            };
          }),
          (exports.unstable_getCurrentPriorityLevel = function() {
            return L;
          }),
          (exports.unstable_shouldYield = function() {
            var e = exports.unstable_now();
            return (
              E(e),
              (null !== A &&
                null !== M &&
                M.startTime <= e &&
                M.expirationTime < A.expirationTime) ||
                r()
            );
          }),
          (exports.unstable_requestPaint = U),
          (exports.unstable_continueExecution = function() {
            j || R || ((j = !0), e(N));
          }),
          (exports.unstable_pauseExecution = function() {}),
          (exports.unstable_getFirstCallbackNode = function() {
            return M;
          });
      },
      {},
    ],
    MDSO: [
      function(require, module, exports) {
        'use strict';
        module.exports = require('./cjs/scheduler.production.min.js');
      },
      { './cjs/scheduler.production.min.js': '5IvP' },
    ],
    i17t: [
      function(require, module, exports) {
        'use strict';
        var e = require('react'),
          t = require('object-assign'),
          n = require('scheduler');
        function r(e) {
          for (
            var t = e.message,
              n = 'https://reactjs.org/docs/error-decoder.html?invariant=' + t,
              r = 1;
            r < arguments.length;
            r++
          )
            n += '&args[]=' + encodeURIComponent(arguments[r]);
          return (
            (e.message =
              'Minified React error #' +
              t +
              '; visit ' +
              n +
              ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings. '),
            e
          );
        }
        if (!e) throw r(Error(227));
        var l = null,
          i = {};
        function a() {
          if (l)
            for (var e in i) {
              var t = i[e],
                n = l.indexOf(e);
              if (!(-1 < n)) throw r(Error(96), e);
              if (!u[n]) {
                if (!t.extractEvents) throw r(Error(97), e);
                for (var a in ((u[n] = t), (n = t.eventTypes))) {
                  var s = void 0,
                    f = n[a],
                    d = t,
                    p = a;
                  if (c.hasOwnProperty(p)) throw r(Error(99), p);
                  c[p] = f;
                  var h = f.phasedRegistrationNames;
                  if (h) {
                    for (s in h) h.hasOwnProperty(s) && o(h[s], d, p);
                    s = !0;
                  } else
                    f.registrationName
                      ? (o(f.registrationName, d, p), (s = !0))
                      : (s = !1);
                  if (!s) throw r(Error(98), a, e);
                }
              }
            }
        }
        function o(e, t, n) {
          if (s[e]) throw r(Error(100), e);
          (s[e] = t), (f[e] = t.eventTypes[n].dependencies);
        }
        var u = [],
          c = {},
          s = {},
          f = {};
        function d(e, t, n, r, l, i, a, o, u) {
          var c = Array.prototype.slice.call(arguments, 3);
          try {
            t.apply(n, c);
          } catch (s) {
            this.onError(s);
          }
        }
        var p = !1,
          h = null,
          m = !1,
          g = null,
          v = {
            onError: function(e) {
              (p = !0), (h = e);
            },
          };
        function y(e, t, n, r, l, i, a, o, u) {
          (p = !1), (h = null), d.apply(v, arguments);
        }
        function b(e, t, n, l, i, a, o, u, c) {
          if ((y.apply(this, arguments), p)) {
            if (!p) throw r(Error(198));
            var s = h;
            (p = !1), (h = null), m || ((m = !0), (g = s));
          }
        }
        var w = null,
          k = null,
          E = null;
        function x(e, t, n) {
          var r = e.type || 'unknown-event';
          (e.currentTarget = E(n)),
            b(r, t, void 0, e),
            (e.currentTarget = null);
        }
        function T(e, t) {
          if (null == t) throw r(Error(30));
          return null == e
            ? t
            : Array.isArray(e)
            ? Array.isArray(t)
              ? (e.push.apply(e, t), e)
              : (e.push(t), e)
            : Array.isArray(t)
            ? [e].concat(t)
            : [e, t];
        }
        function C(e, t, n) {
          Array.isArray(e) ? e.forEach(t, n) : e && t.call(n, e);
        }
        var S = null;
        function _(e) {
          if (e) {
            var t = e._dispatchListeners,
              n = e._dispatchInstances;
            if (Array.isArray(t))
              for (var r = 0; r < t.length && !e.isPropagationStopped(); r++)
                x(e, t[r], n[r]);
            else t && x(e, t, n);
            (e._dispatchListeners = null),
              (e._dispatchInstances = null),
              e.isPersistent() || e.constructor.release(e);
          }
        }
        function P(e) {
          if ((null !== e && (S = T(S, e)), (e = S), (S = null), e)) {
            if ((C(e, _), S)) throw r(Error(95));
            if (m) throw ((e = g), (m = !1), (g = null), e);
          }
        }
        var N = {
          injectEventPluginOrder: function(e) {
            if (l) throw r(Error(101));
            (l = Array.prototype.slice.call(e)), a();
          },
          injectEventPluginsByName: function(e) {
            var t,
              n = !1;
            for (t in e)
              if (e.hasOwnProperty(t)) {
                var l = e[t];
                if (!i.hasOwnProperty(t) || i[t] !== l) {
                  if (i[t]) throw r(Error(102), t);
                  (i[t] = l), (n = !0);
                }
              }
            n && a();
          },
        };
        function z(e, t) {
          var n = e.stateNode;
          if (!n) return null;
          var l = w(n);
          if (!l) return null;
          n = l[t];
          e: switch (t) {
            case 'onClick':
            case 'onClickCapture':
            case 'onDoubleClick':
            case 'onDoubleClickCapture':
            case 'onMouseDown':
            case 'onMouseDownCapture':
            case 'onMouseMove':
            case 'onMouseMoveCapture':
            case 'onMouseUp':
            case 'onMouseUpCapture':
              (l = !l.disabled) ||
                (l = !(
                  'button' === (e = e.type) ||
                  'input' === e ||
                  'select' === e ||
                  'textarea' === e
                )),
                (e = !l);
              break e;
            default:
              e = !1;
          }
          if (e) return null;
          if (n && 'function' != typeof n) throw r(Error(231), t, typeof n);
          return n;
        }
        var M = Math.random()
            .toString(36)
            .slice(2),
          U = '__reactInternalInstance$' + M,
          R = '__reactEventHandlers$' + M;
        function F(e) {
          if (e[U]) return e[U];
          for (; !e[U]; ) {
            if (!e.parentNode) return null;
            e = e.parentNode;
          }
          return 5 === (e = e[U]).tag || 6 === e.tag ? e : null;
        }
        function I(e) {
          return !(e = e[U]) || (5 !== e.tag && 6 !== e.tag) ? null : e;
        }
        function D(e) {
          if (5 === e.tag || 6 === e.tag) return e.stateNode;
          throw r(Error(33));
        }
        function O(e) {
          return e[R] || null;
        }
        function L(e) {
          do {
            e = e.return;
          } while (e && 5 !== e.tag);
          return e || null;
        }
        function A(e, t, n) {
          (t = z(e, n.dispatchConfig.phasedRegistrationNames[t])) &&
            ((n._dispatchListeners = T(n._dispatchListeners, t)),
            (n._dispatchInstances = T(n._dispatchInstances, e)));
        }
        function W(e) {
          if (e && e.dispatchConfig.phasedRegistrationNames) {
            for (var t = e._targetInst, n = []; t; ) n.push(t), (t = L(t));
            for (t = n.length; 0 < t--; ) A(n[t], 'captured', e);
            for (t = 0; t < n.length; t++) A(n[t], 'bubbled', e);
          }
        }
        function V(e, t, n) {
          e &&
            n &&
            n.dispatchConfig.registrationName &&
            (t = z(e, n.dispatchConfig.registrationName)) &&
            ((n._dispatchListeners = T(n._dispatchListeners, t)),
            (n._dispatchInstances = T(n._dispatchInstances, e)));
        }
        function B(e) {
          e && e.dispatchConfig.registrationName && V(e._targetInst, null, e);
        }
        function j(e) {
          C(e, W);
        }
        var H = !(
          'undefined' == typeof window ||
          void 0 === window.document ||
          void 0 === window.document.createElement
        );
        function Q(e, t) {
          var n = {};
          return (
            (n[e.toLowerCase()] = t.toLowerCase()),
            (n['Webkit' + e] = 'webkit' + t),
            (n['Moz' + e] = 'moz' + t),
            n
          );
        }
        var K = {
            animationend: Q('Animation', 'AnimationEnd'),
            animationiteration: Q('Animation', 'AnimationIteration'),
            animationstart: Q('Animation', 'AnimationStart'),
            transitionend: Q('Transition', 'TransitionEnd'),
          },
          $ = {},
          q = {};
        function Y(e) {
          if ($[e]) return $[e];
          if (!K[e]) return e;
          var t,
            n = K[e];
          for (t in n) if (n.hasOwnProperty(t) && t in q) return ($[e] = n[t]);
          return e;
        }
        H &&
          ((q = document.createElement('div').style),
          'AnimationEvent' in window ||
            (delete K.animationend.animation,
            delete K.animationiteration.animation,
            delete K.animationstart.animation),
          'TransitionEvent' in window || delete K.transitionend.transition);
        var X = Y('animationend'),
          G = Y('animationiteration'),
          Z = Y('animationstart'),
          J = Y('transitionend'),
          ee = 'abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange seeked seeking stalled suspend timeupdate volumechange waiting'.split(
            ' '
          ),
          te = null,
          ne = null,
          re = null;
        function le() {
          if (re) return re;
          var e,
            t,
            n = ne,
            r = n.length,
            l = 'value' in te ? te.value : te.textContent,
            i = l.length;
          for (e = 0; e < r && n[e] === l[e]; e++);
          var a = r - e;
          for (t = 1; t <= a && n[r - t] === l[i - t]; t++);
          return (re = l.slice(e, 1 < t ? 1 - t : void 0));
        }
        function ie() {
          return !0;
        }
        function ae() {
          return !1;
        }
        function oe(e, t, n, r) {
          for (var l in ((this.dispatchConfig = e),
          (this._targetInst = t),
          (this.nativeEvent = n),
          (e = this.constructor.Interface)))
            e.hasOwnProperty(l) &&
              ((t = e[l])
                ? (this[l] = t(n))
                : 'target' === l
                ? (this.target = r)
                : (this[l] = n[l]));
          return (
            (this.isDefaultPrevented = (null != n.defaultPrevented
            ? n.defaultPrevented
            : !1 === n.returnValue)
              ? ie
              : ae),
            (this.isPropagationStopped = ae),
            this
          );
        }
        function ue(e, t, n, r) {
          if (this.eventPool.length) {
            var l = this.eventPool.pop();
            return this.call(l, e, t, n, r), l;
          }
          return new this(e, t, n, r);
        }
        function ce(e) {
          if (!(e instanceof this)) throw r(Error(279));
          e.destructor(), 10 > this.eventPool.length && this.eventPool.push(e);
        }
        function se(e) {
          (e.eventPool = []), (e.getPooled = ue), (e.release = ce);
        }
        t(oe.prototype, {
          preventDefault: function() {
            this.defaultPrevented = !0;
            var e = this.nativeEvent;
            e &&
              (e.preventDefault
                ? e.preventDefault()
                : 'unknown' != typeof e.returnValue && (e.returnValue = !1),
              (this.isDefaultPrevented = ie));
          },
          stopPropagation: function() {
            var e = this.nativeEvent;
            e &&
              (e.stopPropagation
                ? e.stopPropagation()
                : 'unknown' != typeof e.cancelBubble && (e.cancelBubble = !0),
              (this.isPropagationStopped = ie));
          },
          persist: function() {
            this.isPersistent = ie;
          },
          isPersistent: ae,
          destructor: function() {
            var e,
              t = this.constructor.Interface;
            for (e in t) this[e] = null;
            (this.nativeEvent = this._targetInst = this.dispatchConfig = null),
              (this.isPropagationStopped = this.isDefaultPrevented = ae),
              (this._dispatchInstances = this._dispatchListeners = null);
          },
        }),
          (oe.Interface = {
            type: null,
            target: null,
            currentTarget: function() {
              return null;
            },
            eventPhase: null,
            bubbles: null,
            cancelable: null,
            timeStamp: function(e) {
              return e.timeStamp || Date.now();
            },
            defaultPrevented: null,
            isTrusted: null,
          }),
          (oe.extend = function(e) {
            function n() {}
            function r() {
              return l.apply(this, arguments);
            }
            var l = this;
            n.prototype = l.prototype;
            var i = new n();
            return (
              t(i, r.prototype),
              (r.prototype = i),
              (r.prototype.constructor = r),
              (r.Interface = t({}, l.Interface, e)),
              (r.extend = l.extend),
              se(r),
              r
            );
          }),
          se(oe);
        var fe = oe.extend({ data: null }),
          de = oe.extend({ data: null }),
          pe = [9, 13, 27, 32],
          he = H && 'CompositionEvent' in window,
          me = null;
        H && 'documentMode' in document && (me = document.documentMode);
        var ge = H && 'TextEvent' in window && !me,
          ve = H && (!he || (me && 8 < me && 11 >= me)),
          ye = String.fromCharCode(32),
          be = {
            beforeInput: {
              phasedRegistrationNames: {
                bubbled: 'onBeforeInput',
                captured: 'onBeforeInputCapture',
              },
              dependencies: [
                'compositionend',
                'keypress',
                'textInput',
                'paste',
              ],
            },
            compositionEnd: {
              phasedRegistrationNames: {
                bubbled: 'onCompositionEnd',
                captured: 'onCompositionEndCapture',
              },
              dependencies: 'blur compositionend keydown keypress keyup mousedown'.split(
                ' '
              ),
            },
            compositionStart: {
              phasedRegistrationNames: {
                bubbled: 'onCompositionStart',
                captured: 'onCompositionStartCapture',
              },
              dependencies: 'blur compositionstart keydown keypress keyup mousedown'.split(
                ' '
              ),
            },
            compositionUpdate: {
              phasedRegistrationNames: {
                bubbled: 'onCompositionUpdate',
                captured: 'onCompositionUpdateCapture',
              },
              dependencies: 'blur compositionupdate keydown keypress keyup mousedown'.split(
                ' '
              ),
            },
          },
          we = !1;
        function ke(e, t) {
          switch (e) {
            case 'keyup':
              return -1 !== pe.indexOf(t.keyCode);
            case 'keydown':
              return 229 !== t.keyCode;
            case 'keypress':
            case 'mousedown':
            case 'blur':
              return !0;
            default:
              return !1;
          }
        }
        function Ee(e) {
          return 'object' == typeof (e = e.detail) && 'data' in e
            ? e.data
            : null;
        }
        var xe = !1;
        function Te(e, t) {
          switch (e) {
            case 'compositionend':
              return Ee(t);
            case 'keypress':
              return 32 !== t.which ? null : ((we = !0), ye);
            case 'textInput':
              return (e = t.data) === ye && we ? null : e;
            default:
              return null;
          }
        }
        function Ce(e, t) {
          if (xe)
            return 'compositionend' === e || (!he && ke(e, t))
              ? ((e = le()), (re = ne = te = null), (xe = !1), e)
              : null;
          switch (e) {
            case 'paste':
              return null;
            case 'keypress':
              if (
                !(t.ctrlKey || t.altKey || t.metaKey) ||
                (t.ctrlKey && t.altKey)
              ) {
                if (t.char && 1 < t.char.length) return t.char;
                if (t.which) return String.fromCharCode(t.which);
              }
              return null;
            case 'compositionend':
              return ve && 'ko' !== t.locale ? null : t.data;
            default:
              return null;
          }
        }
        var Se = {
            eventTypes: be,
            extractEvents: function(e, t, n, r) {
              var l = void 0,
                i = void 0;
              if (he)
                e: {
                  switch (e) {
                    case 'compositionstart':
                      l = be.compositionStart;
                      break e;
                    case 'compositionend':
                      l = be.compositionEnd;
                      break e;
                    case 'compositionupdate':
                      l = be.compositionUpdate;
                      break e;
                  }
                  l = void 0;
                }
              else
                xe
                  ? ke(e, n) && (l = be.compositionEnd)
                  : 'keydown' === e &&
                    229 === n.keyCode &&
                    (l = be.compositionStart);
              return (
                l
                  ? (ve &&
                      'ko' !== n.locale &&
                      (xe || l !== be.compositionStart
                        ? l === be.compositionEnd && xe && (i = le())
                        : ((ne =
                            'value' in (te = r) ? te.value : te.textContent),
                          (xe = !0))),
                    (l = fe.getPooled(l, t, n, r)),
                    i ? (l.data = i) : null !== (i = Ee(n)) && (l.data = i),
                    j(l),
                    (i = l))
                  : (i = null),
                (e = ge ? Te(e, n) : Ce(e, n))
                  ? (((t = de.getPooled(be.beforeInput, t, n, r)).data = e),
                    j(t))
                  : (t = null),
                null === i ? t : null === t ? i : [i, t]
              );
            },
          },
          _e = null,
          Pe = null,
          Ne = null;
        function ze(e) {
          if ((e = k(e))) {
            if ('function' != typeof _e) throw r(Error(280));
            var t = w(e.stateNode);
            _e(e.stateNode, e.type, t);
          }
        }
        function Me(e) {
          Pe ? (Ne ? Ne.push(e) : (Ne = [e])) : (Pe = e);
        }
        function Ue() {
          if (Pe) {
            var e = Pe,
              t = Ne;
            if (((Ne = Pe = null), ze(e), t))
              for (e = 0; e < t.length; e++) ze(t[e]);
          }
        }
        function Re(e, t) {
          return e(t);
        }
        function Fe(e, t, n, r) {
          return e(t, n, r);
        }
        function Ie() {}
        var De = Re,
          Oe = !1;
        function Le() {
          (null === Pe && null === Ne) || (Ie(), Ue());
        }
        var Ae = {
          color: !0,
          date: !0,
          datetime: !0,
          'datetime-local': !0,
          email: !0,
          month: !0,
          number: !0,
          password: !0,
          range: !0,
          search: !0,
          tel: !0,
          text: !0,
          time: !0,
          url: !0,
          week: !0,
        };
        function We(e) {
          var t = e && e.nodeName && e.nodeName.toLowerCase();
          return 'input' === t ? !!Ae[e.type] : 'textarea' === t;
        }
        function Ve(e) {
          return (
            (e = e.target || e.srcElement || window).correspondingUseElement &&
              (e = e.correspondingUseElement),
            3 === e.nodeType ? e.parentNode : e
          );
        }
        function Be(e) {
          if (!H) return !1;
          var t = (e = 'on' + e) in document;
          return (
            t ||
              ((t = document.createElement('div')).setAttribute(e, 'return;'),
              (t = 'function' == typeof t[e])),
            t
          );
        }
        function je(e) {
          var t = e.type;
          return (
            (e = e.nodeName) &&
            'input' === e.toLowerCase() &&
            ('checkbox' === t || 'radio' === t)
          );
        }
        function He(e) {
          var t = je(e) ? 'checked' : 'value',
            n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
            r = '' + e[t];
          if (
            !e.hasOwnProperty(t) &&
            void 0 !== n &&
            'function' == typeof n.get &&
            'function' == typeof n.set
          ) {
            var l = n.get,
              i = n.set;
            return (
              Object.defineProperty(e, t, {
                configurable: !0,
                get: function() {
                  return l.call(this);
                },
                set: function(e) {
                  (r = '' + e), i.call(this, e);
                },
              }),
              Object.defineProperty(e, t, { enumerable: n.enumerable }),
              {
                getValue: function() {
                  return r;
                },
                setValue: function(e) {
                  r = '' + e;
                },
                stopTracking: function() {
                  (e._valueTracker = null), delete e[t];
                },
              }
            );
          }
        }
        function Qe(e) {
          e._valueTracker || (e._valueTracker = He(e));
        }
        function Ke(e) {
          if (!e) return !1;
          var t = e._valueTracker;
          if (!t) return !0;
          var n = t.getValue(),
            r = '';
          return (
            e && (r = je(e) ? (e.checked ? 'true' : 'false') : e.value),
            (e = r) !== n && (t.setValue(e), !0)
          );
        }
        var $e = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        $e.hasOwnProperty('ReactCurrentDispatcher') ||
          ($e.ReactCurrentDispatcher = { current: null }),
          $e.hasOwnProperty('ReactCurrentBatchConfig') ||
            ($e.ReactCurrentBatchConfig = { suspense: null });
        var qe = /^(.*)[\\\/]/,
          Ye = 'function' == typeof Symbol && Symbol.for,
          Xe = Ye ? Symbol.for('react.element') : 60103,
          Ge = Ye ? Symbol.for('react.portal') : 60106,
          Ze = Ye ? Symbol.for('react.fragment') : 60107,
          Je = Ye ? Symbol.for('react.strict_mode') : 60108,
          et = Ye ? Symbol.for('react.profiler') : 60114,
          tt = Ye ? Symbol.for('react.provider') : 60109,
          nt = Ye ? Symbol.for('react.context') : 60110,
          rt = Ye ? Symbol.for('react.concurrent_mode') : 60111,
          lt = Ye ? Symbol.for('react.forward_ref') : 60112,
          it = Ye ? Symbol.for('react.suspense') : 60113,
          at = Ye ? Symbol.for('react.suspense_list') : 60120,
          ot = Ye ? Symbol.for('react.memo') : 60115,
          ut = Ye ? Symbol.for('react.lazy') : 60116;
        Ye && Symbol.for('react.fundamental'),
          Ye && Symbol.for('react.responder');
        var ct = 'function' == typeof Symbol && Symbol.iterator;
        function st(e) {
          return null === e || 'object' != typeof e
            ? null
            : 'function' == typeof (e = (ct && e[ct]) || e['@@iterator'])
            ? e
            : null;
        }
        function ft(e) {
          if (null == e) return null;
          if ('function' == typeof e) return e.displayName || e.name || null;
          if ('string' == typeof e) return e;
          switch (e) {
            case Ze:
              return 'Fragment';
            case Ge:
              return 'Portal';
            case et:
              return 'Profiler';
            case Je:
              return 'StrictMode';
            case it:
              return 'Suspense';
            case at:
              return 'SuspenseList';
          }
          if ('object' == typeof e)
            switch (e.$$typeof) {
              case nt:
                return 'Context.Consumer';
              case tt:
                return 'Context.Provider';
              case lt:
                var t = e.render;
                return (
                  (t = t.displayName || t.name || ''),
                  e.displayName ||
                    ('' !== t ? 'ForwardRef(' + t + ')' : 'ForwardRef')
                );
              case ot:
                return ft(e.type);
              case ut:
                if ((e = 1 === e._status ? e._result : null)) return ft(e);
            }
          return null;
        }
        function dt(e) {
          var t = '';
          do {
            e: switch (e.tag) {
              case 3:
              case 4:
              case 6:
              case 7:
              case 10:
              case 9:
                var n = '';
                break e;
              default:
                var r = e._debugOwner,
                  l = e._debugSource,
                  i = ft(e.type);
                (n = null),
                  r && (n = ft(r.type)),
                  (r = i),
                  (i = ''),
                  l
                    ? (i =
                        ' (at ' +
                        l.fileName.replace(qe, '') +
                        ':' +
                        l.lineNumber +
                        ')')
                    : n && (i = ' (created by ' + n + ')'),
                  (n = '\n    in ' + (r || 'Unknown') + i);
            }
            (t += n), (e = e.return);
          } while (e);
          return t;
        }
        var pt = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
          ht = Object.prototype.hasOwnProperty,
          mt = {},
          gt = {};
        function vt(e) {
          return (
            !!ht.call(gt, e) ||
            (!ht.call(mt, e) &&
              (pt.test(e) ? (gt[e] = !0) : ((mt[e] = !0), !1)))
          );
        }
        function yt(e, t, n, r) {
          if (null !== n && 0 === n.type) return !1;
          switch (typeof t) {
            case 'function':
            case 'symbol':
              return !0;
            case 'boolean':
              return (
                !r &&
                (null !== n
                  ? !n.acceptsBooleans
                  : 'data-' !== (e = e.toLowerCase().slice(0, 5)) &&
                    'aria-' !== e)
              );
            default:
              return !1;
          }
        }
        function bt(e, t, n, r) {
          if (null == t || yt(e, t, n, r)) return !0;
          if (r) return !1;
          if (null !== n)
            switch (n.type) {
              case 3:
                return !t;
              case 4:
                return !1 === t;
              case 5:
                return isNaN(t);
              case 6:
                return isNaN(t) || 1 > t;
            }
          return !1;
        }
        function wt(e, t, n, r, l, i) {
          (this.acceptsBooleans = 2 === t || 3 === t || 4 === t),
            (this.attributeName = r),
            (this.attributeNamespace = l),
            (this.mustUseProperty = n),
            (this.propertyName = e),
            (this.type = t),
            (this.sanitizeURL = i);
        }
        var kt = {};
        'children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style'
          .split(' ')
          .forEach(function(e) {
            kt[e] = new wt(e, 0, !1, e, null, !1);
          }),
          [
            ['acceptCharset', 'accept-charset'],
            ['className', 'class'],
            ['htmlFor', 'for'],
            ['httpEquiv', 'http-equiv'],
          ].forEach(function(e) {
            var t = e[0];
            kt[t] = new wt(t, 1, !1, e[1], null, !1);
          }),
          ['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(
            function(e) {
              kt[e] = new wt(e, 2, !1, e.toLowerCase(), null, !1);
            }
          ),
          [
            'autoReverse',
            'externalResourcesRequired',
            'focusable',
            'preserveAlpha',
          ].forEach(function(e) {
            kt[e] = new wt(e, 2, !1, e, null, !1);
          }),
          'allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope'
            .split(' ')
            .forEach(function(e) {
              kt[e] = new wt(e, 3, !1, e.toLowerCase(), null, !1);
            }),
          ['checked', 'multiple', 'muted', 'selected'].forEach(function(e) {
            kt[e] = new wt(e, 3, !0, e, null, !1);
          }),
          ['capture', 'download'].forEach(function(e) {
            kt[e] = new wt(e, 4, !1, e, null, !1);
          }),
          ['cols', 'rows', 'size', 'span'].forEach(function(e) {
            kt[e] = new wt(e, 6, !1, e, null, !1);
          }),
          ['rowSpan', 'start'].forEach(function(e) {
            kt[e] = new wt(e, 5, !1, e.toLowerCase(), null, !1);
          });
        var Et = /[\-:]([a-z])/g;
        function xt(e) {
          return e[1].toUpperCase();
        }
        function Tt(e, t, n, r) {
          var l = kt.hasOwnProperty(t) ? kt[t] : null;
          (null !== l
            ? 0 === l.type
            : !r &&
              (2 < t.length &&
                ('o' === t[0] || 'O' === t[0]) &&
                ('n' === t[1] || 'N' === t[1]))) ||
            (bt(t, n, l, r) && (n = null),
            r || null === l
              ? vt(t) &&
                (null === n ? e.removeAttribute(t) : e.setAttribute(t, '' + n))
              : l.mustUseProperty
              ? (e[l.propertyName] = null === n ? 3 !== l.type && '' : n)
              : ((t = l.attributeName),
                (r = l.attributeNamespace),
                null === n
                  ? e.removeAttribute(t)
                  : ((n =
                      3 === (l = l.type) || (4 === l && !0 === n)
                        ? ''
                        : '' + n),
                    r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
        }
        function Ct(e) {
          switch (typeof e) {
            case 'boolean':
            case 'number':
            case 'object':
            case 'string':
            case 'undefined':
              return e;
            default:
              return '';
          }
        }
        function St(e, n) {
          var r = n.checked;
          return t({}, n, {
            defaultChecked: void 0,
            defaultValue: void 0,
            value: void 0,
            checked: null != r ? r : e._wrapperState.initialChecked,
          });
        }
        function _t(e, t) {
          var n = null == t.defaultValue ? '' : t.defaultValue,
            r = null != t.checked ? t.checked : t.defaultChecked;
          (n = Ct(null != t.value ? t.value : n)),
            (e._wrapperState = {
              initialChecked: r,
              initialValue: n,
              controlled:
                'checkbox' === t.type || 'radio' === t.type
                  ? null != t.checked
                  : null != t.value,
            });
        }
        function Pt(e, t) {
          null != (t = t.checked) && Tt(e, 'checked', t, !1);
        }
        function Nt(e, t) {
          Pt(e, t);
          var n = Ct(t.value),
            r = t.type;
          if (null != n)
            'number' === r
              ? ((0 === n && '' === e.value) || e.value != n) &&
                (e.value = '' + n)
              : e.value !== '' + n && (e.value = '' + n);
          else if ('submit' === r || 'reset' === r)
            return void e.removeAttribute('value');
          t.hasOwnProperty('value')
            ? Mt(e, t.type, n)
            : t.hasOwnProperty('defaultValue') &&
              Mt(e, t.type, Ct(t.defaultValue)),
            null == t.checked &&
              null != t.defaultChecked &&
              (e.defaultChecked = !!t.defaultChecked);
        }
        function zt(e, t, n) {
          if (t.hasOwnProperty('value') || t.hasOwnProperty('defaultValue')) {
            var r = t.type;
            if (
              !(
                ('submit' !== r && 'reset' !== r) ||
                (void 0 !== t.value && null !== t.value)
              )
            )
              return;
            (t = '' + e._wrapperState.initialValue),
              n || t === e.value || (e.value = t),
              (e.defaultValue = t);
          }
          '' !== (n = e.name) && (e.name = ''),
            (e.defaultChecked = !e.defaultChecked),
            (e.defaultChecked = !!e._wrapperState.initialChecked),
            '' !== n && (e.name = n);
        }
        function Mt(e, t, n) {
          ('number' === t && e.ownerDocument.activeElement === e) ||
            (null == n
              ? (e.defaultValue = '' + e._wrapperState.initialValue)
              : e.defaultValue !== '' + n && (e.defaultValue = '' + n));
        }
        'accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height'
          .split(' ')
          .forEach(function(e) {
            var t = e.replace(Et, xt);
            kt[t] = new wt(t, 1, !1, e, null, !1);
          }),
          'xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type'
            .split(' ')
            .forEach(function(e) {
              var t = e.replace(Et, xt);
              kt[t] = new wt(t, 1, !1, e, 'http://www.w3.org/1999/xlink', !1);
            }),
          ['xml:base', 'xml:lang', 'xml:space'].forEach(function(e) {
            var t = e.replace(Et, xt);
            kt[t] = new wt(
              t,
              1,
              !1,
              e,
              'http://www.w3.org/XML/1998/namespace',
              !1
            );
          }),
          ['tabIndex', 'crossOrigin'].forEach(function(e) {
            kt[e] = new wt(e, 1, !1, e.toLowerCase(), null, !1);
          }),
          (kt.xlinkHref = new wt(
            'xlinkHref',
            1,
            !1,
            'xlink:href',
            'http://www.w3.org/1999/xlink',
            !0
          )),
          ['src', 'href', 'action', 'formAction'].forEach(function(e) {
            kt[e] = new wt(e, 1, !1, e.toLowerCase(), null, !0);
          });
        var Ut = {
          change: {
            phasedRegistrationNames: {
              bubbled: 'onChange',
              captured: 'onChangeCapture',
            },
            dependencies: 'blur change click focus input keydown keyup selectionchange'.split(
              ' '
            ),
          },
        };
        function Rt(e, t, n) {
          return (
            ((e = oe.getPooled(Ut.change, e, t, n)).type = 'change'),
            Me(n),
            j(e),
            e
          );
        }
        var Ft = null,
          It = null;
        function Dt(e) {
          P(e);
        }
        function Ot(e) {
          if (Ke(D(e))) return e;
        }
        function Lt(e, t) {
          if ('change' === e) return t;
        }
        var At = !1;
        function Wt() {
          Ft && (Ft.detachEvent('onpropertychange', Vt), (It = Ft = null));
        }
        function Vt(e) {
          if ('value' === e.propertyName && Ot(It))
            if (((e = Rt(It, e, Ve(e))), Oe)) P(e);
            else {
              Oe = !0;
              try {
                Re(Dt, e);
              } finally {
                (Oe = !1), Le();
              }
            }
        }
        function Bt(e, t, n) {
          'focus' === e
            ? (Wt(), (It = n), (Ft = t).attachEvent('onpropertychange', Vt))
            : 'blur' === e && Wt();
        }
        function jt(e) {
          if ('selectionchange' === e || 'keyup' === e || 'keydown' === e)
            return Ot(It);
        }
        function Ht(e, t) {
          if ('click' === e) return Ot(t);
        }
        function Qt(e, t) {
          if ('input' === e || 'change' === e) return Ot(t);
        }
        H &&
          (At =
            Be('input') &&
            (!document.documentMode || 9 < document.documentMode));
        var Kt = {
            eventTypes: Ut,
            _isInputEventSupported: At,
            extractEvents: function(e, t, n, r) {
              var l = t ? D(t) : window,
                i = void 0,
                a = void 0,
                o = l.nodeName && l.nodeName.toLowerCase();
              if (
                ('select' === o || ('input' === o && 'file' === l.type)
                  ? (i = Lt)
                  : We(l)
                  ? At
                    ? (i = Qt)
                    : ((i = jt), (a = Bt))
                  : (o = l.nodeName) &&
                    'input' === o.toLowerCase() &&
                    ('checkbox' === l.type || 'radio' === l.type) &&
                    (i = Ht),
                i && (i = i(e, t)))
              )
                return Rt(i, n, r);
              a && a(e, l, t),
                'blur' === e &&
                  (e = l._wrapperState) &&
                  e.controlled &&
                  'number' === l.type &&
                  Mt(l, 'number', l.value);
            },
          },
          $t = oe.extend({ view: null, detail: null }),
          qt = {
            Alt: 'altKey',
            Control: 'ctrlKey',
            Meta: 'metaKey',
            Shift: 'shiftKey',
          };
        function Yt(e) {
          var t = this.nativeEvent;
          return t.getModifierState
            ? t.getModifierState(e)
            : !!(e = qt[e]) && !!t[e];
        }
        function Xt() {
          return Yt;
        }
        var Gt = 0,
          Zt = 0,
          Jt = !1,
          en = !1,
          tn = $t.extend({
            screenX: null,
            screenY: null,
            clientX: null,
            clientY: null,
            pageX: null,
            pageY: null,
            ctrlKey: null,
            shiftKey: null,
            altKey: null,
            metaKey: null,
            getModifierState: Xt,
            button: null,
            buttons: null,
            relatedTarget: function(e) {
              return (
                e.relatedTarget ||
                (e.fromElement === e.srcElement ? e.toElement : e.fromElement)
              );
            },
            movementX: function(e) {
              if ('movementX' in e) return e.movementX;
              var t = Gt;
              return (
                (Gt = e.screenX),
                Jt
                  ? 'mousemove' === e.type
                    ? e.screenX - t
                    : 0
                  : ((Jt = !0), 0)
              );
            },
            movementY: function(e) {
              if ('movementY' in e) return e.movementY;
              var t = Zt;
              return (
                (Zt = e.screenY),
                en
                  ? 'mousemove' === e.type
                    ? e.screenY - t
                    : 0
                  : ((en = !0), 0)
              );
            },
          }),
          nn = tn.extend({
            pointerId: null,
            width: null,
            height: null,
            pressure: null,
            tangentialPressure: null,
            tiltX: null,
            tiltY: null,
            twist: null,
            pointerType: null,
            isPrimary: null,
          }),
          rn = {
            mouseEnter: {
              registrationName: 'onMouseEnter',
              dependencies: ['mouseout', 'mouseover'],
            },
            mouseLeave: {
              registrationName: 'onMouseLeave',
              dependencies: ['mouseout', 'mouseover'],
            },
            pointerEnter: {
              registrationName: 'onPointerEnter',
              dependencies: ['pointerout', 'pointerover'],
            },
            pointerLeave: {
              registrationName: 'onPointerLeave',
              dependencies: ['pointerout', 'pointerover'],
            },
          },
          ln = {
            eventTypes: rn,
            extractEvents: function(e, t, n, r) {
              var l = 'mouseover' === e || 'pointerover' === e,
                i = 'mouseout' === e || 'pointerout' === e;
              if ((l && (n.relatedTarget || n.fromElement)) || (!i && !l))
                return null;
              if (
                ((l =
                  r.window === r
                    ? r
                    : (l = r.ownerDocument)
                    ? l.defaultView || l.parentWindow
                    : window),
                i
                  ? ((i = t),
                    (t = (t = n.relatedTarget || n.toElement) ? F(t) : null))
                  : (i = null),
                i === t)
              )
                return null;
              var a = void 0,
                o = void 0,
                u = void 0,
                c = void 0;
              'mouseout' === e || 'mouseover' === e
                ? ((a = tn),
                  (o = rn.mouseLeave),
                  (u = rn.mouseEnter),
                  (c = 'mouse'))
                : ('pointerout' !== e && 'pointerover' !== e) ||
                  ((a = nn),
                  (o = rn.pointerLeave),
                  (u = rn.pointerEnter),
                  (c = 'pointer'));
              var s = null == i ? l : D(i);
              if (
                ((l = null == t ? l : D(t)),
                ((e = a.getPooled(o, i, n, r)).type = c + 'leave'),
                (e.target = s),
                (e.relatedTarget = l),
                ((n = a.getPooled(u, t, n, r)).type = c + 'enter'),
                (n.target = l),
                (n.relatedTarget = s),
                (r = t),
                i && r)
              )
                e: {
                  for (l = r, c = 0, a = t = i; a; a = L(a)) c++;
                  for (a = 0, u = l; u; u = L(u)) a++;
                  for (; 0 < c - a; ) (t = L(t)), c--;
                  for (; 0 < a - c; ) (l = L(l)), a--;
                  for (; c--; ) {
                    if (t === l || t === l.alternate) break e;
                    (t = L(t)), (l = L(l));
                  }
                  t = null;
                }
              else t = null;
              for (
                l = t, t = [];
                i && i !== l && (null === (c = i.alternate) || c !== l);

              )
                t.push(i), (i = L(i));
              for (
                i = [];
                r && r !== l && (null === (c = r.alternate) || c !== l);

              )
                i.push(r), (r = L(r));
              for (r = 0; r < t.length; r++) V(t[r], 'bubbled', e);
              for (r = i.length; 0 < r--; ) V(i[r], 'captured', n);
              return [e, n];
            },
          };
        function an(e, t) {
          return (e === t && (0 !== e || 1 / e == 1 / t)) || (e != e && t != t);
        }
        var on = Object.prototype.hasOwnProperty;
        function un(e, t) {
          if (an(e, t)) return !0;
          if (
            'object' != typeof e ||
            null === e ||
            'object' != typeof t ||
            null === t
          )
            return !1;
          var n = Object.keys(e),
            r = Object.keys(t);
          if (n.length !== r.length) return !1;
          for (r = 0; r < n.length; r++)
            if (!on.call(t, n[r]) || !an(e[n[r]], t[n[r]])) return !1;
          return !0;
        }
        function cn(e, t) {
          return { responder: e, props: t };
        }
        function sn(e) {
          var t = e;
          if (e.alternate) for (; t.return; ) t = t.return;
          else {
            if (0 != (2 & t.effectTag)) return 1;
            for (; t.return; )
              if (0 != (2 & (t = t.return).effectTag)) return 1;
          }
          return 3 === t.tag ? 2 : 3;
        }
        function fn(e) {
          if (2 !== sn(e)) throw r(Error(188));
        }
        function dn(e) {
          var t = e.alternate;
          if (!t) {
            if (3 === (t = sn(e))) throw r(Error(188));
            return 1 === t ? null : e;
          }
          for (var n = e, l = t; ; ) {
            var i = n.return;
            if (null === i) break;
            var a = i.alternate;
            if (null === a) {
              if (null !== (l = i.return)) {
                n = l;
                continue;
              }
              break;
            }
            if (i.child === a.child) {
              for (a = i.child; a; ) {
                if (a === n) return fn(i), e;
                if (a === l) return fn(i), t;
                a = a.sibling;
              }
              throw r(Error(188));
            }
            if (n.return !== l.return) (n = i), (l = a);
            else {
              for (var o = !1, u = i.child; u; ) {
                if (u === n) {
                  (o = !0), (n = i), (l = a);
                  break;
                }
                if (u === l) {
                  (o = !0), (l = i), (n = a);
                  break;
                }
                u = u.sibling;
              }
              if (!o) {
                for (u = a.child; u; ) {
                  if (u === n) {
                    (o = !0), (n = a), (l = i);
                    break;
                  }
                  if (u === l) {
                    (o = !0), (l = a), (n = i);
                    break;
                  }
                  u = u.sibling;
                }
                if (!o) throw r(Error(189));
              }
            }
            if (n.alternate !== l) throw r(Error(190));
          }
          if (3 !== n.tag) throw r(Error(188));
          return n.stateNode.current === n ? e : t;
        }
        function pn(e) {
          if (!(e = dn(e))) return null;
          for (var t = e; ; ) {
            if (5 === t.tag || 6 === t.tag) return t;
            if (t.child) (t.child.return = t), (t = t.child);
            else {
              if (t === e) break;
              for (; !t.sibling; ) {
                if (!t.return || t.return === e) return null;
                t = t.return;
              }
              (t.sibling.return = t.return), (t = t.sibling);
            }
          }
          return null;
        }
        new Map(), new Map(), new Set(), new Map();
        var hn = oe.extend({
            animationName: null,
            elapsedTime: null,
            pseudoElement: null,
          }),
          mn = oe.extend({
            clipboardData: function(e) {
              return 'clipboardData' in e
                ? e.clipboardData
                : window.clipboardData;
            },
          }),
          gn = $t.extend({ relatedTarget: null });
        function vn(e) {
          var t = e.keyCode;
          return (
            'charCode' in e
              ? 0 === (e = e.charCode) && 13 === t && (e = 13)
              : (e = t),
            10 === e && (e = 13),
            32 <= e || 13 === e ? e : 0
          );
        }
        for (
          var yn = {
              Esc: 'Escape',
              Spacebar: ' ',
              Left: 'ArrowLeft',
              Up: 'ArrowUp',
              Right: 'ArrowRight',
              Down: 'ArrowDown',
              Del: 'Delete',
              Win: 'OS',
              Menu: 'ContextMenu',
              Apps: 'ContextMenu',
              Scroll: 'ScrollLock',
              MozPrintableKey: 'Unidentified',
            },
            bn = {
              8: 'Backspace',
              9: 'Tab',
              12: 'Clear',
              13: 'Enter',
              16: 'Shift',
              17: 'Control',
              18: 'Alt',
              19: 'Pause',
              20: 'CapsLock',
              27: 'Escape',
              32: ' ',
              33: 'PageUp',
              34: 'PageDown',
              35: 'End',
              36: 'Home',
              37: 'ArrowLeft',
              38: 'ArrowUp',
              39: 'ArrowRight',
              40: 'ArrowDown',
              45: 'Insert',
              46: 'Delete',
              112: 'F1',
              113: 'F2',
              114: 'F3',
              115: 'F4',
              116: 'F5',
              117: 'F6',
              118: 'F7',
              119: 'F8',
              120: 'F9',
              121: 'F10',
              122: 'F11',
              123: 'F12',
              144: 'NumLock',
              145: 'ScrollLock',
              224: 'Meta',
            },
            wn = $t.extend({
              key: function(e) {
                if (e.key) {
                  var t = yn[e.key] || e.key;
                  if ('Unidentified' !== t) return t;
                }
                return 'keypress' === e.type
                  ? 13 === (e = vn(e))
                    ? 'Enter'
                    : String.fromCharCode(e)
                  : 'keydown' === e.type || 'keyup' === e.type
                  ? bn[e.keyCode] || 'Unidentified'
                  : '';
              },
              location: null,
              ctrlKey: null,
              shiftKey: null,
              altKey: null,
              metaKey: null,
              repeat: null,
              locale: null,
              getModifierState: Xt,
              charCode: function(e) {
                return 'keypress' === e.type ? vn(e) : 0;
              },
              keyCode: function(e) {
                return 'keydown' === e.type || 'keyup' === e.type
                  ? e.keyCode
                  : 0;
              },
              which: function(e) {
                return 'keypress' === e.type
                  ? vn(e)
                  : 'keydown' === e.type || 'keyup' === e.type
                  ? e.keyCode
                  : 0;
              },
            }),
            kn = tn.extend({ dataTransfer: null }),
            En = $t.extend({
              touches: null,
              targetTouches: null,
              changedTouches: null,
              altKey: null,
              metaKey: null,
              ctrlKey: null,
              shiftKey: null,
              getModifierState: Xt,
            }),
            xn = oe.extend({
              propertyName: null,
              elapsedTime: null,
              pseudoElement: null,
            }),
            Tn = tn.extend({
              deltaX: function(e) {
                return ('deltaX' in e)
                  ? e.deltaX
                  : ('wheelDeltaX' in e)
                  ? -e.wheelDeltaX
                  : 0;
              },
              deltaY: function(e) {
                return ('deltaY' in e)
                  ? e.deltaY
                  : ('wheelDeltaY' in e)
                  ? -e.wheelDeltaY
                  : ('wheelDelta' in e)
                  ? -e.wheelDelta
                  : 0;
              },
              deltaZ: null,
              deltaMode: null,
            }),
            Cn = [
              ['blur', 'blur', 0],
              ['cancel', 'cancel', 0],
              ['click', 'click', 0],
              ['close', 'close', 0],
              ['contextmenu', 'contextMenu', 0],
              ['copy', 'copy', 0],
              ['cut', 'cut', 0],
              ['auxclick', 'auxClick', 0],
              ['dblclick', 'doubleClick', 0],
              ['dragend', 'dragEnd', 0],
              ['dragstart', 'dragStart', 0],
              ['drop', 'drop', 0],
              ['focus', 'focus', 0],
              ['input', 'input', 0],
              ['invalid', 'invalid', 0],
              ['keydown', 'keyDown', 0],
              ['keypress', 'keyPress', 0],
              ['keyup', 'keyUp', 0],
              ['mousedown', 'mouseDown', 0],
              ['mouseup', 'mouseUp', 0],
              ['paste', 'paste', 0],
              ['pause', 'pause', 0],
              ['play', 'play', 0],
              ['pointercancel', 'pointerCancel', 0],
              ['pointerdown', 'pointerDown', 0],
              ['pointerup', 'pointerUp', 0],
              ['ratechange', 'rateChange', 0],
              ['reset', 'reset', 0],
              ['seeked', 'seeked', 0],
              ['submit', 'submit', 0],
              ['touchcancel', 'touchCancel', 0],
              ['touchend', 'touchEnd', 0],
              ['touchstart', 'touchStart', 0],
              ['volumechange', 'volumeChange', 0],
              ['drag', 'drag', 1],
              ['dragenter', 'dragEnter', 1],
              ['dragexit', 'dragExit', 1],
              ['dragleave', 'dragLeave', 1],
              ['dragover', 'dragOver', 1],
              ['mousemove', 'mouseMove', 1],
              ['mouseout', 'mouseOut', 1],
              ['mouseover', 'mouseOver', 1],
              ['pointermove', 'pointerMove', 1],
              ['pointerout', 'pointerOut', 1],
              ['pointerover', 'pointerOver', 1],
              ['scroll', 'scroll', 1],
              ['toggle', 'toggle', 1],
              ['touchmove', 'touchMove', 1],
              ['wheel', 'wheel', 1],
              ['abort', 'abort', 2],
              [X, 'animationEnd', 2],
              [G, 'animationIteration', 2],
              [Z, 'animationStart', 2],
              ['canplay', 'canPlay', 2],
              ['canplaythrough', 'canPlayThrough', 2],
              ['durationchange', 'durationChange', 2],
              ['emptied', 'emptied', 2],
              ['encrypted', 'encrypted', 2],
              ['ended', 'ended', 2],
              ['error', 'error', 2],
              ['gotpointercapture', 'gotPointerCapture', 2],
              ['load', 'load', 2],
              ['loadeddata', 'loadedData', 2],
              ['loadedmetadata', 'loadedMetadata', 2],
              ['loadstart', 'loadStart', 2],
              ['lostpointercapture', 'lostPointerCapture', 2],
              ['playing', 'playing', 2],
              ['progress', 'progress', 2],
              ['seeking', 'seeking', 2],
              ['stalled', 'stalled', 2],
              ['suspend', 'suspend', 2],
              ['timeupdate', 'timeUpdate', 2],
              [J, 'transitionEnd', 2],
              ['waiting', 'waiting', 2],
            ],
            Sn = {},
            _n = {},
            Pn = 0;
          Pn < Cn.length;
          Pn++
        ) {
          var Nn = Cn[Pn],
            zn = Nn[0],
            Mn = Nn[1],
            Un = Nn[2],
            Rn = 'on' + (Mn[0].toUpperCase() + Mn.slice(1)),
            Fn = {
              phasedRegistrationNames: {
                bubbled: Rn,
                captured: Rn + 'Capture',
              },
              dependencies: [zn],
              eventPriority: Un,
            };
          (Sn[Mn] = Fn), (_n[zn] = Fn);
        }
        var In = {
            eventTypes: Sn,
            getEventPriority: function(e) {
              return void 0 !== (e = _n[e]) ? e.eventPriority : 2;
            },
            extractEvents: function(e, t, n, r) {
              var l = _n[e];
              if (!l) return null;
              switch (e) {
                case 'keypress':
                  if (0 === vn(n)) return null;
                case 'keydown':
                case 'keyup':
                  e = wn;
                  break;
                case 'blur':
                case 'focus':
                  e = gn;
                  break;
                case 'click':
                  if (2 === n.button) return null;
                case 'auxclick':
                case 'dblclick':
                case 'mousedown':
                case 'mousemove':
                case 'mouseup':
                case 'mouseout':
                case 'mouseover':
                case 'contextmenu':
                  e = tn;
                  break;
                case 'drag':
                case 'dragend':
                case 'dragenter':
                case 'dragexit':
                case 'dragleave':
                case 'dragover':
                case 'dragstart':
                case 'drop':
                  e = kn;
                  break;
                case 'touchcancel':
                case 'touchend':
                case 'touchmove':
                case 'touchstart':
                  e = En;
                  break;
                case X:
                case G:
                case Z:
                  e = hn;
                  break;
                case J:
                  e = xn;
                  break;
                case 'scroll':
                  e = $t;
                  break;
                case 'wheel':
                  e = Tn;
                  break;
                case 'copy':
                case 'cut':
                case 'paste':
                  e = mn;
                  break;
                case 'gotpointercapture':
                case 'lostpointercapture':
                case 'pointercancel':
                case 'pointerdown':
                case 'pointermove':
                case 'pointerout':
                case 'pointerover':
                case 'pointerup':
                  e = nn;
                  break;
                default:
                  e = oe;
              }
              return j((t = e.getPooled(l, t, n, r))), t;
            },
          },
          Dn = In.getEventPriority,
          On = [];
        function Ln(e) {
          var t = e.targetInst,
            n = t;
          do {
            if (!n) {
              e.ancestors.push(n);
              break;
            }
            var r;
            for (r = n; r.return; ) r = r.return;
            if (!(r = 3 !== r.tag ? null : r.stateNode.containerInfo)) break;
            e.ancestors.push(n), (n = F(r));
          } while (n);
          for (n = 0; n < e.ancestors.length; n++) {
            t = e.ancestors[n];
            var l = Ve(e.nativeEvent);
            r = e.topLevelType;
            for (var i = e.nativeEvent, a = null, o = 0; o < u.length; o++) {
              var c = u[o];
              c && (c = c.extractEvents(r, t, i, l)) && (a = T(a, c));
            }
            P(a);
          }
        }
        var An = !0;
        function Wn(e, t) {
          Vn(t, e, !1);
        }
        function Vn(e, t, n) {
          switch (Dn(t)) {
            case 0:
              var r = Bn.bind(null, t, 1);
              break;
            case 1:
              r = jn.bind(null, t, 1);
              break;
            default:
              r = Hn.bind(null, t, 1);
          }
          n ? e.addEventListener(t, r, !0) : e.addEventListener(t, r, !1);
        }
        function Bn(e, t, n) {
          Oe || Ie();
          var r = Hn,
            l = Oe;
          Oe = !0;
          try {
            Fe(r, e, t, n);
          } finally {
            (Oe = l) || Le();
          }
        }
        function jn(e, t, n) {
          Hn(e, t, n);
        }
        function Hn(e, t, n) {
          if (An) {
            if (
              (null === (t = F((t = Ve(n)))) ||
                'number' != typeof t.tag ||
                2 === sn(t) ||
                (t = null),
              On.length)
            ) {
              var r = On.pop();
              (r.topLevelType = e),
                (r.nativeEvent = n),
                (r.targetInst = t),
                (e = r);
            } else
              e = {
                topLevelType: e,
                nativeEvent: n,
                targetInst: t,
                ancestors: [],
              };
            try {
              if (((n = e), Oe)) Ln(n, void 0);
              else {
                Oe = !0;
                try {
                  De(Ln, n, void 0);
                } finally {
                  (Oe = !1), Le();
                }
              }
            } finally {
              (e.topLevelType = null),
                (e.nativeEvent = null),
                (e.targetInst = null),
                (e.ancestors.length = 0),
                10 > On.length && On.push(e);
            }
          }
        }
        var Qn = new ('function' == typeof WeakMap ? WeakMap : Map)();
        function Kn(e) {
          var t = Qn.get(e);
          return void 0 === t && ((t = new Set()), Qn.set(e, t)), t;
        }
        function $n(e) {
          if (
            void 0 ===
            (e = e || ('undefined' != typeof document ? document : void 0))
          )
            return null;
          try {
            return e.activeElement || e.body;
          } catch (t) {
            return e.body;
          }
        }
        function qn(e) {
          for (; e && e.firstChild; ) e = e.firstChild;
          return e;
        }
        function Yn(e, t) {
          var n,
            r = qn(e);
          for (e = 0; r; ) {
            if (3 === r.nodeType) {
              if (((n = e + r.textContent.length), e <= t && n >= t))
                return { node: r, offset: t - e };
              e = n;
            }
            e: {
              for (; r; ) {
                if (r.nextSibling) {
                  r = r.nextSibling;
                  break e;
                }
                r = r.parentNode;
              }
              r = void 0;
            }
            r = qn(r);
          }
        }
        function Xn(e, t) {
          return (
            !(!e || !t) &&
            (e === t ||
              ((!e || 3 !== e.nodeType) &&
                (t && 3 === t.nodeType
                  ? Xn(e, t.parentNode)
                  : 'contains' in e
                  ? e.contains(t)
                  : !!e.compareDocumentPosition &&
                    !!(16 & e.compareDocumentPosition(t)))))
          );
        }
        function Gn() {
          for (var e = window, t = $n(); t instanceof e.HTMLIFrameElement; ) {
            try {
              var n = 'string' == typeof t.contentWindow.location.href;
            } catch (r) {
              n = !1;
            }
            if (!n) break;
            t = $n((e = t.contentWindow).document);
          }
          return t;
        }
        function Zn(e) {
          var t = e && e.nodeName && e.nodeName.toLowerCase();
          return (
            t &&
            (('input' === t &&
              ('text' === e.type ||
                'search' === e.type ||
                'tel' === e.type ||
                'url' === e.type ||
                'password' === e.type)) ||
              'textarea' === t ||
              'true' === e.contentEditable)
          );
        }
        var Jn = H && 'documentMode' in document && 11 >= document.documentMode,
          er = {
            select: {
              phasedRegistrationNames: {
                bubbled: 'onSelect',
                captured: 'onSelectCapture',
              },
              dependencies: 'blur contextmenu dragend focus keydown keyup mousedown mouseup selectionchange'.split(
                ' '
              ),
            },
          },
          tr = null,
          nr = null,
          rr = null,
          lr = !1;
        function ir(e, t) {
          var n =
            t.window === t
              ? t.document
              : 9 === t.nodeType
              ? t
              : t.ownerDocument;
          return lr || null == tr || tr !== $n(n)
            ? null
            : ('selectionStart' in (n = tr) && Zn(n)
                ? (n = { start: n.selectionStart, end: n.selectionEnd })
                : (n = {
                    anchorNode: (n = (
                      (n.ownerDocument && n.ownerDocument.defaultView) ||
                      window
                    ).getSelection()).anchorNode,
                    anchorOffset: n.anchorOffset,
                    focusNode: n.focusNode,
                    focusOffset: n.focusOffset,
                  }),
              rr && un(rr, n)
                ? null
                : ((rr = n),
                  ((e = oe.getPooled(er.select, nr, e, t)).type = 'select'),
                  (e.target = tr),
                  j(e),
                  e));
        }
        var ar = {
          eventTypes: er,
          extractEvents: function(e, t, n, r) {
            var l,
              i =
                r.window === r
                  ? r.document
                  : 9 === r.nodeType
                  ? r
                  : r.ownerDocument;
            if (!(l = !i)) {
              e: {
                (i = Kn(i)), (l = f.onSelect);
                for (var a = 0; a < l.length; a++)
                  if (!i.has(l[a])) {
                    i = !1;
                    break e;
                  }
                i = !0;
              }
              l = !i;
            }
            if (l) return null;
            switch (((i = t ? D(t) : window), e)) {
              case 'focus':
                (We(i) || 'true' === i.contentEditable) &&
                  ((tr = i), (nr = t), (rr = null));
                break;
              case 'blur':
                rr = nr = tr = null;
                break;
              case 'mousedown':
                lr = !0;
                break;
              case 'contextmenu':
              case 'mouseup':
              case 'dragend':
                return (lr = !1), ir(n, r);
              case 'selectionchange':
                if (Jn) break;
              case 'keydown':
              case 'keyup':
                return ir(n, r);
            }
            return null;
          },
        };
        function or(t) {
          var n = '';
          return (
            e.Children.forEach(t, function(e) {
              null != e && (n += e);
            }),
            n
          );
        }
        function ur(e, n) {
          return (
            (e = t({ children: void 0 }, n)),
            (n = or(n.children)) && (e.children = n),
            e
          );
        }
        function cr(e, t, n, r) {
          if (((e = e.options), t)) {
            t = {};
            for (var l = 0; l < n.length; l++) t['$' + n[l]] = !0;
            for (n = 0; n < e.length; n++)
              (l = t.hasOwnProperty('$' + e[n].value)),
                e[n].selected !== l && (e[n].selected = l),
                l && r && (e[n].defaultSelected = !0);
          } else {
            for (n = '' + Ct(n), t = null, l = 0; l < e.length; l++) {
              if (e[l].value === n)
                return (
                  (e[l].selected = !0), void (r && (e[l].defaultSelected = !0))
                );
              null !== t || e[l].disabled || (t = e[l]);
            }
            null !== t && (t.selected = !0);
          }
        }
        function sr(e, n) {
          if (null != n.dangerouslySetInnerHTML) throw r(Error(91));
          return t({}, n, {
            value: void 0,
            defaultValue: void 0,
            children: '' + e._wrapperState.initialValue,
          });
        }
        function fr(e, t) {
          var n = t.value;
          if (null == n) {
            if (((n = t.defaultValue), null != (t = t.children))) {
              if (null != n) throw r(Error(92));
              if (Array.isArray(t)) {
                if (!(1 >= t.length)) throw r(Error(93));
                t = t[0];
              }
              n = t;
            }
            null == n && (n = '');
          }
          e._wrapperState = { initialValue: Ct(n) };
        }
        function dr(e, t) {
          var n = Ct(t.value),
            r = Ct(t.defaultValue);
          null != n &&
            ((n = '' + n) !== e.value && (e.value = n),
            null == t.defaultValue &&
              e.defaultValue !== n &&
              (e.defaultValue = n)),
            null != r && (e.defaultValue = '' + r);
        }
        function pr(e) {
          var t = e.textContent;
          t === e._wrapperState.initialValue && (e.value = t);
        }
        N.injectEventPluginOrder(
          'ResponderEventPlugin SimpleEventPlugin EnterLeaveEventPlugin ChangeEventPlugin SelectEventPlugin BeforeInputEventPlugin'.split(
            ' '
          )
        ),
          (w = O),
          (k = I),
          (E = D),
          N.injectEventPluginsByName({
            SimpleEventPlugin: In,
            EnterLeaveEventPlugin: ln,
            ChangeEventPlugin: Kt,
            SelectEventPlugin: ar,
            BeforeInputEventPlugin: Se,
          });
        var hr = {
          html: 'http://www.w3.org/1999/xhtml',
          mathml: 'http://www.w3.org/1998/Math/MathML',
          svg: 'http://www.w3.org/2000/svg',
        };
        function mr(e) {
          switch (e) {
            case 'svg':
              return 'http://www.w3.org/2000/svg';
            case 'math':
              return 'http://www.w3.org/1998/Math/MathML';
            default:
              return 'http://www.w3.org/1999/xhtml';
          }
        }
        function gr(e, t) {
          return null == e || 'http://www.w3.org/1999/xhtml' === e
            ? mr(t)
            : 'http://www.w3.org/2000/svg' === e && 'foreignObject' === t
            ? 'http://www.w3.org/1999/xhtml'
            : e;
        }
        var vr = void 0,
          yr = (function(e) {
            return 'undefined' != typeof MSApp && MSApp.execUnsafeLocalFunction
              ? function(t, n, r, l) {
                  MSApp.execUnsafeLocalFunction(function() {
                    return e(t, n);
                  });
                }
              : e;
          })(function(e, t) {
            if (e.namespaceURI !== hr.svg || 'innerHTML' in e) e.innerHTML = t;
            else {
              for (
                (vr = vr || document.createElement('div')).innerHTML =
                  '<svg>' + t + '</svg>',
                  t = vr.firstChild;
                e.firstChild;

              )
                e.removeChild(e.firstChild);
              for (; t.firstChild; ) e.appendChild(t.firstChild);
            }
          });
        function br(e, t) {
          if (t) {
            var n = e.firstChild;
            if (n && n === e.lastChild && 3 === n.nodeType)
              return void (n.nodeValue = t);
          }
          e.textContent = t;
        }
        var wr = {
            animationIterationCount: !0,
            borderImageOutset: !0,
            borderImageSlice: !0,
            borderImageWidth: !0,
            boxFlex: !0,
            boxFlexGroup: !0,
            boxOrdinalGroup: !0,
            columnCount: !0,
            columns: !0,
            flex: !0,
            flexGrow: !0,
            flexPositive: !0,
            flexShrink: !0,
            flexNegative: !0,
            flexOrder: !0,
            gridArea: !0,
            gridRow: !0,
            gridRowEnd: !0,
            gridRowSpan: !0,
            gridRowStart: !0,
            gridColumn: !0,
            gridColumnEnd: !0,
            gridColumnSpan: !0,
            gridColumnStart: !0,
            fontWeight: !0,
            lineClamp: !0,
            lineHeight: !0,
            opacity: !0,
            order: !0,
            orphans: !0,
            tabSize: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0,
            fillOpacity: !0,
            floodOpacity: !0,
            stopOpacity: !0,
            strokeDasharray: !0,
            strokeDashoffset: !0,
            strokeMiterlimit: !0,
            strokeOpacity: !0,
            strokeWidth: !0,
          },
          kr = ['Webkit', 'ms', 'Moz', 'O'];
        function Er(e, t, n) {
          return null == t || 'boolean' == typeof t || '' === t
            ? ''
            : n ||
              'number' != typeof t ||
              0 === t ||
              (wr.hasOwnProperty(e) && wr[e])
            ? ('' + t).trim()
            : t + 'px';
        }
        function xr(e, t) {
          for (var n in ((e = e.style), t))
            if (t.hasOwnProperty(n)) {
              var r = 0 === n.indexOf('--'),
                l = Er(n, t[n], r);
              'float' === n && (n = 'cssFloat'),
                r ? e.setProperty(n, l) : (e[n] = l);
            }
        }
        Object.keys(wr).forEach(function(e) {
          kr.forEach(function(t) {
            (t = t + e.charAt(0).toUpperCase() + e.substring(1)),
              (wr[t] = wr[e]);
          });
        });
        var Tr = t(
          { menuitem: !0 },
          {
            area: !0,
            base: !0,
            br: !0,
            col: !0,
            embed: !0,
            hr: !0,
            img: !0,
            input: !0,
            keygen: !0,
            link: !0,
            meta: !0,
            param: !0,
            source: !0,
            track: !0,
            wbr: !0,
          }
        );
        function Cr(e, t) {
          if (t) {
            if (
              Tr[e] &&
              (null != t.children || null != t.dangerouslySetInnerHTML)
            )
              throw r(Error(137), e, '');
            if (null != t.dangerouslySetInnerHTML) {
              if (null != t.children) throw r(Error(60));
              if (
                !(
                  'object' == typeof t.dangerouslySetInnerHTML &&
                  '__html' in t.dangerouslySetInnerHTML
                )
              )
                throw r(Error(61));
            }
            if (null != t.style && 'object' != typeof t.style)
              throw r(Error(62), '');
          }
        }
        function Sr(e, t) {
          if (-1 === e.indexOf('-')) return 'string' == typeof t.is;
          switch (e) {
            case 'annotation-xml':
            case 'color-profile':
            case 'font-face':
            case 'font-face-src':
            case 'font-face-uri':
            case 'font-face-format':
            case 'font-face-name':
            case 'missing-glyph':
              return !1;
            default:
              return !0;
          }
        }
        function _r(e, t) {
          var n = Kn(
            (e = 9 === e.nodeType || 11 === e.nodeType ? e : e.ownerDocument)
          );
          t = f[t];
          for (var r = 0; r < t.length; r++) {
            var l = t[r];
            if (!n.has(l)) {
              switch (l) {
                case 'scroll':
                  Vn(e, 'scroll', !0);
                  break;
                case 'focus':
                case 'blur':
                  Vn(e, 'focus', !0),
                    Vn(e, 'blur', !0),
                    n.add('blur'),
                    n.add('focus');
                  break;
                case 'cancel':
                case 'close':
                  Be(l) && Vn(e, l, !0);
                  break;
                case 'invalid':
                case 'submit':
                case 'reset':
                  break;
                default:
                  -1 === ee.indexOf(l) && Wn(l, e);
              }
              n.add(l);
            }
          }
        }
        function Pr() {}
        var Nr = null,
          zr = null;
        function Mr(e, t) {
          switch (e) {
            case 'button':
            case 'input':
            case 'select':
            case 'textarea':
              return !!t.autoFocus;
          }
          return !1;
        }
        function Ur(e, t) {
          return (
            'textarea' === e ||
            'option' === e ||
            'noscript' === e ||
            'string' == typeof t.children ||
            'number' == typeof t.children ||
            ('object' == typeof t.dangerouslySetInnerHTML &&
              null !== t.dangerouslySetInnerHTML &&
              null != t.dangerouslySetInnerHTML.__html)
          );
        }
        var Rr = 'function' == typeof setTimeout ? setTimeout : void 0,
          Fr = 'function' == typeof clearTimeout ? clearTimeout : void 0;
        function Ir(e) {
          for (; null != e; e = e.nextSibling) {
            var t = e.nodeType;
            if (1 === t || 3 === t) break;
          }
          return e;
        }
        new Set();
        var Dr = [],
          Or = -1;
        function Lr(e) {
          0 > Or || ((e.current = Dr[Or]), (Dr[Or] = null), Or--);
        }
        function Ar(e, t) {
          (Dr[++Or] = e.current), (e.current = t);
        }
        var Wr = {},
          Vr = { current: Wr },
          Br = { current: !1 },
          jr = Wr;
        function Hr(e, t) {
          var n = e.type.contextTypes;
          if (!n) return Wr;
          var r = e.stateNode;
          if (r && r.__reactInternalMemoizedUnmaskedChildContext === t)
            return r.__reactInternalMemoizedMaskedChildContext;
          var l,
            i = {};
          for (l in n) i[l] = t[l];
          return (
            r &&
              (((e =
                e.stateNode).__reactInternalMemoizedUnmaskedChildContext = t),
              (e.__reactInternalMemoizedMaskedChildContext = i)),
            i
          );
        }
        function Qr(e) {
          return null != (e = e.childContextTypes);
        }
        function Kr(e) {
          Lr(Br, e), Lr(Vr, e);
        }
        function $r(e) {
          Lr(Br, e), Lr(Vr, e);
        }
        function qr(e, t, n) {
          if (Vr.current !== Wr) throw r(Error(168));
          Ar(Vr, t, e), Ar(Br, n, e);
        }
        function Yr(e, n, l) {
          var i = e.stateNode;
          if (
            ((e = n.childContextTypes), 'function' != typeof i.getChildContext)
          )
            return l;
          for (var a in (i = i.getChildContext()))
            if (!(a in e)) throw r(Error(108), ft(n) || 'Unknown', a);
          return t({}, l, i);
        }
        function Xr(e) {
          var t = e.stateNode;
          return (
            (t = (t && t.__reactInternalMemoizedMergedChildContext) || Wr),
            (jr = Vr.current),
            Ar(Vr, t, e),
            Ar(Br, Br.current, e),
            !0
          );
        }
        function Gr(e, t, n) {
          var l = e.stateNode;
          if (!l) throw r(Error(169));
          n
            ? ((t = Yr(e, t, jr)),
              (l.__reactInternalMemoizedMergedChildContext = t),
              Lr(Br, e),
              Lr(Vr, e),
              Ar(Vr, t, e))
            : Lr(Br, e),
            Ar(Br, n, e);
        }
        var Zr = n.unstable_runWithPriority,
          Jr = n.unstable_scheduleCallback,
          el = n.unstable_cancelCallback,
          tl = n.unstable_shouldYield,
          nl = n.unstable_requestPaint,
          rl = n.unstable_now,
          ll = n.unstable_getCurrentPriorityLevel,
          il = n.unstable_ImmediatePriority,
          al = n.unstable_UserBlockingPriority,
          ol = n.unstable_NormalPriority,
          ul = n.unstable_LowPriority,
          cl = n.unstable_IdlePriority,
          sl = {},
          fl = void 0 !== nl ? nl : function() {},
          dl = null,
          pl = null,
          hl = !1,
          ml = rl(),
          gl =
            1e4 > ml
              ? rl
              : function() {
                  return rl() - ml;
                };
        function vl() {
          switch (ll()) {
            case il:
              return 99;
            case al:
              return 98;
            case ol:
              return 97;
            case ul:
              return 96;
            case cl:
              return 95;
            default:
              throw r(Error(332));
          }
        }
        function yl(e) {
          switch (e) {
            case 99:
              return il;
            case 98:
              return al;
            case 97:
              return ol;
            case 96:
              return ul;
            case 95:
              return cl;
            default:
              throw r(Error(332));
          }
        }
        function bl(e, t) {
          return (e = yl(e)), Zr(e, t);
        }
        function wl(e, t, n) {
          return (e = yl(e)), Jr(e, t, n);
        }
        function kl(e) {
          return null === dl ? ((dl = [e]), (pl = Jr(il, xl))) : dl.push(e), sl;
        }
        function El() {
          null !== pl && el(pl), xl();
        }
        function xl() {
          if (!hl && null !== dl) {
            hl = !0;
            var e = 0;
            try {
              var t = dl;
              bl(99, function() {
                for (; e < t.length; e++) {
                  var n = t[e];
                  do {
                    n = n(!0);
                  } while (null !== n);
                }
              }),
                (dl = null);
            } catch (n) {
              throw (null !== dl && (dl = dl.slice(e + 1)), Jr(il, El), n);
            } finally {
              hl = !1;
            }
          }
        }
        function Tl(e, t) {
          return 1073741823 === t
            ? 99
            : 1 === t
            ? 95
            : 0 >= (e = 10 * (1073741821 - t) - 10 * (1073741821 - e))
            ? 99
            : 250 >= e
            ? 98
            : 5250 >= e
            ? 97
            : 95;
        }
        function Cl(e, n) {
          if (e && e.defaultProps)
            for (var r in ((n = t({}, n)), (e = e.defaultProps)))
              void 0 === n[r] && (n[r] = e[r]);
          return n;
        }
        function Sl(e) {
          var t = e._result;
          switch (e._status) {
            case 1:
              return t;
            case 2:
            case 0:
              throw t;
            default:
              switch (
                ((e._status = 0),
                (t = (t = e._ctor)()).then(
                  function(t) {
                    0 === e._status &&
                      ((t = t.default), (e._status = 1), (e._result = t));
                  },
                  function(t) {
                    0 === e._status && ((e._status = 2), (e._result = t));
                  }
                ),
                e._status)
              ) {
                case 1:
                  return e._result;
                case 2:
                  throw e._result;
              }
              throw ((e._result = t), t);
          }
        }
        var _l = { current: null },
          Pl = null,
          Nl = null,
          zl = null;
        function Ml() {
          zl = Nl = Pl = null;
        }
        function Ul(e, t) {
          var n = e.type._context;
          Ar(_l, n._currentValue, e), (n._currentValue = t);
        }
        function Rl(e) {
          var t = _l.current;
          Lr(_l, e), (e.type._context._currentValue = t);
        }
        function Fl(e, t) {
          for (; null !== e; ) {
            var n = e.alternate;
            if (e.childExpirationTime < t)
              (e.childExpirationTime = t),
                null !== n &&
                  n.childExpirationTime < t &&
                  (n.childExpirationTime = t);
            else {
              if (!(null !== n && n.childExpirationTime < t)) break;
              n.childExpirationTime = t;
            }
            e = e.return;
          }
        }
        function Il(e, t) {
          (Pl = e),
            (zl = Nl = null),
            null !== (e = e.dependencies) &&
              null !== e.firstContext &&
              (e.expirationTime >= t && (ya = !0), (e.firstContext = null));
        }
        function Dl(e, t) {
          if (zl !== e && !1 !== t && 0 !== t)
            if (
              (('number' == typeof t && 1073741823 !== t) ||
                ((zl = e), (t = 1073741823)),
              (t = { context: e, observedBits: t, next: null }),
              null === Nl)
            ) {
              if (null === Pl) throw r(Error(308));
              (Nl = t),
                (Pl.dependencies = {
                  expirationTime: 0,
                  firstContext: t,
                  responders: null,
                });
            } else Nl = Nl.next = t;
          return e._currentValue;
        }
        var Ol = !1;
        function Ll(e) {
          return {
            baseState: e,
            firstUpdate: null,
            lastUpdate: null,
            firstCapturedUpdate: null,
            lastCapturedUpdate: null,
            firstEffect: null,
            lastEffect: null,
            firstCapturedEffect: null,
            lastCapturedEffect: null,
          };
        }
        function Al(e) {
          return {
            baseState: e.baseState,
            firstUpdate: e.firstUpdate,
            lastUpdate: e.lastUpdate,
            firstCapturedUpdate: null,
            lastCapturedUpdate: null,
            firstEffect: null,
            lastEffect: null,
            firstCapturedEffect: null,
            lastCapturedEffect: null,
          };
        }
        function Wl(e, t) {
          return {
            expirationTime: e,
            suspenseConfig: t,
            tag: 0,
            payload: null,
            callback: null,
            next: null,
            nextEffect: null,
          };
        }
        function Vl(e, t) {
          null === e.lastUpdate
            ? (e.firstUpdate = e.lastUpdate = t)
            : ((e.lastUpdate.next = t), (e.lastUpdate = t));
        }
        function Bl(e, t) {
          var n = e.alternate;
          if (null === n) {
            var r = e.updateQueue,
              l = null;
            null === r && (r = e.updateQueue = Ll(e.memoizedState));
          } else
            (r = e.updateQueue),
              (l = n.updateQueue),
              null === r
                ? null === l
                  ? ((r = e.updateQueue = Ll(e.memoizedState)),
                    (l = n.updateQueue = Ll(n.memoizedState)))
                  : (r = e.updateQueue = Al(l))
                : null === l && (l = n.updateQueue = Al(r));
          null === l || r === l
            ? Vl(r, t)
            : null === r.lastUpdate || null === l.lastUpdate
            ? (Vl(r, t), Vl(l, t))
            : (Vl(r, t), (l.lastUpdate = t));
        }
        function jl(e, t) {
          var n = e.updateQueue;
          null ===
          (n = null === n ? (e.updateQueue = Ll(e.memoizedState)) : Hl(e, n))
            .lastCapturedUpdate
            ? (n.firstCapturedUpdate = n.lastCapturedUpdate = t)
            : ((n.lastCapturedUpdate.next = t), (n.lastCapturedUpdate = t));
        }
        function Hl(e, t) {
          var n = e.alternate;
          return (
            null !== n && t === n.updateQueue && (t = e.updateQueue = Al(t)), t
          );
        }
        function Ql(e, n, r, l, i, a) {
          switch (r.tag) {
            case 1:
              return 'function' == typeof (e = r.payload) ? e.call(a, l, i) : e;
            case 3:
              e.effectTag = (-2049 & e.effectTag) | 64;
            case 0:
              if (
                null ==
                (i = 'function' == typeof (e = r.payload) ? e.call(a, l, i) : e)
              )
                break;
              return t({}, l, i);
            case 2:
              Ol = !0;
          }
          return l;
        }
        function Kl(e, t, n, r, l) {
          Ol = !1;
          for (
            var i = (t = Hl(e, t)).baseState,
              a = null,
              o = 0,
              u = t.firstUpdate,
              c = i;
            null !== u;

          ) {
            var s = u.expirationTime;
            s < l
              ? (null === a && ((a = u), (i = c)), o < s && (o = s))
              : (Jo(s, u.suspenseConfig),
                (c = Ql(e, t, u, c, n, r)),
                null !== u.callback &&
                  ((e.effectTag |= 32),
                  (u.nextEffect = null),
                  null === t.lastEffect
                    ? (t.firstEffect = t.lastEffect = u)
                    : ((t.lastEffect.nextEffect = u), (t.lastEffect = u)))),
              (u = u.next);
          }
          for (s = null, u = t.firstCapturedUpdate; null !== u; ) {
            var f = u.expirationTime;
            f < l
              ? (null === s && ((s = u), null === a && (i = c)),
                o < f && (o = f))
              : ((c = Ql(e, t, u, c, n, r)),
                null !== u.callback &&
                  ((e.effectTag |= 32),
                  (u.nextEffect = null),
                  null === t.lastCapturedEffect
                    ? (t.firstCapturedEffect = t.lastCapturedEffect = u)
                    : ((t.lastCapturedEffect.nextEffect = u),
                      (t.lastCapturedEffect = u)))),
              (u = u.next);
          }
          null === a && (t.lastUpdate = null),
            null === s ? (t.lastCapturedUpdate = null) : (e.effectTag |= 32),
            null === a && null === s && (i = c),
            (t.baseState = i),
            (t.firstUpdate = a),
            (t.firstCapturedUpdate = s),
            (e.expirationTime = o),
            (e.memoizedState = c);
        }
        function $l(e, t, n) {
          null !== t.firstCapturedUpdate &&
            (null !== t.lastUpdate &&
              ((t.lastUpdate.next = t.firstCapturedUpdate),
              (t.lastUpdate = t.lastCapturedUpdate)),
            (t.firstCapturedUpdate = t.lastCapturedUpdate = null)),
            ql(t.firstEffect, n),
            (t.firstEffect = t.lastEffect = null),
            ql(t.firstCapturedEffect, n),
            (t.firstCapturedEffect = t.lastCapturedEffect = null);
        }
        function ql(e, t) {
          for (; null !== e; ) {
            var n = e.callback;
            if (null !== n) {
              e.callback = null;
              var l = t;
              if ('function' != typeof n) throw r(Error(191), n);
              n.call(l);
            }
            e = e.nextEffect;
          }
        }
        var Yl = $e.ReactCurrentBatchConfig,
          Xl = new e.Component().refs;
        function Gl(e, n, r, l) {
          (r = null == (r = r(l, (n = e.memoizedState))) ? n : t({}, n, r)),
            (e.memoizedState = r),
            null !== (l = e.updateQueue) &&
              0 === e.expirationTime &&
              (l.baseState = r);
        }
        var Zl = {
          isMounted: function(e) {
            return !!(e = e._reactInternalFiber) && 2 === sn(e);
          },
          enqueueSetState: function(e, t, n) {
            e = e._reactInternalFiber;
            var r = Lo(),
              l = Yl.suspense;
            ((l = Wl((r = Ao(r, e, l)), l)).payload = t),
              null != n && (l.callback = n),
              Bl(e, l),
              Vo(e, r);
          },
          enqueueReplaceState: function(e, t, n) {
            e = e._reactInternalFiber;
            var r = Lo(),
              l = Yl.suspense;
            ((l = Wl((r = Ao(r, e, l)), l)).tag = 1),
              (l.payload = t),
              null != n && (l.callback = n),
              Bl(e, l),
              Vo(e, r);
          },
          enqueueForceUpdate: function(e, t) {
            e = e._reactInternalFiber;
            var n = Lo(),
              r = Yl.suspense;
            ((r = Wl((n = Ao(n, e, r)), r)).tag = 2),
              null != t && (r.callback = t),
              Bl(e, r),
              Vo(e, n);
          },
        };
        function Jl(e, t, n, r, l, i, a) {
          return 'function' == typeof (e = e.stateNode).shouldComponentUpdate
            ? e.shouldComponentUpdate(r, i, a)
            : !t.prototype ||
                !t.prototype.isPureReactComponent ||
                (!un(n, r) || !un(l, i));
        }
        function ei(e, t, n) {
          var r = !1,
            l = Wr,
            i = t.contextType;
          return (
            'object' == typeof i && null !== i
              ? (i = Dl(i))
              : ((l = Qr(t) ? jr : Vr.current),
                (i = (r = null != (r = t.contextTypes)) ? Hr(e, l) : Wr)),
            (t = new t(n, i)),
            (e.memoizedState =
              null !== t.state && void 0 !== t.state ? t.state : null),
            (t.updater = Zl),
            (e.stateNode = t),
            (t._reactInternalFiber = e),
            r &&
              (((e =
                e.stateNode).__reactInternalMemoizedUnmaskedChildContext = l),
              (e.__reactInternalMemoizedMaskedChildContext = i)),
            t
          );
        }
        function ti(e, t, n, r) {
          (e = t.state),
            'function' == typeof t.componentWillReceiveProps &&
              t.componentWillReceiveProps(n, r),
            'function' == typeof t.UNSAFE_componentWillReceiveProps &&
              t.UNSAFE_componentWillReceiveProps(n, r),
            t.state !== e && Zl.enqueueReplaceState(t, t.state, null);
        }
        function ni(e, t, n, r) {
          var l = e.stateNode;
          (l.props = n), (l.state = e.memoizedState), (l.refs = Xl);
          var i = t.contextType;
          'object' == typeof i && null !== i
            ? (l.context = Dl(i))
            : ((i = Qr(t) ? jr : Vr.current), (l.context = Hr(e, i))),
            null !== (i = e.updateQueue) &&
              (Kl(e, i, n, l, r), (l.state = e.memoizedState)),
            'function' == typeof (i = t.getDerivedStateFromProps) &&
              (Gl(e, t, i, n), (l.state = e.memoizedState)),
            'function' == typeof t.getDerivedStateFromProps ||
              'function' == typeof l.getSnapshotBeforeUpdate ||
              ('function' != typeof l.UNSAFE_componentWillMount &&
                'function' != typeof l.componentWillMount) ||
              ((t = l.state),
              'function' == typeof l.componentWillMount &&
                l.componentWillMount(),
              'function' == typeof l.UNSAFE_componentWillMount &&
                l.UNSAFE_componentWillMount(),
              t !== l.state && Zl.enqueueReplaceState(l, l.state, null),
              null !== (i = e.updateQueue) &&
                (Kl(e, i, n, l, r), (l.state = e.memoizedState))),
            'function' == typeof l.componentDidMount && (e.effectTag |= 4);
        }
        var ri = Array.isArray;
        function li(e, t, n) {
          if (
            null !== (e = n.ref) &&
            'function' != typeof e &&
            'object' != typeof e
          ) {
            if (n._owner) {
              n = n._owner;
              var l = void 0;
              if (n) {
                if (1 !== n.tag) throw r(Error(309));
                l = n.stateNode;
              }
              if (!l) throw r(Error(147), e);
              var i = '' + e;
              return null !== t &&
                null !== t.ref &&
                'function' == typeof t.ref &&
                t.ref._stringRef === i
                ? t.ref
                : (((t = function(e) {
                    var t = l.refs;
                    t === Xl && (t = l.refs = {}),
                      null === e ? delete t[i] : (t[i] = e);
                  })._stringRef = i),
                  t);
            }
            if ('string' != typeof e) throw r(Error(284));
            if (!n._owner) throw r(Error(290), e);
          }
          return e;
        }
        function ii(e, t) {
          if ('textarea' !== e.type)
            throw r(
              Error(31),
              '[object Object]' === Object.prototype.toString.call(t)
                ? 'object with keys {' + Object.keys(t).join(', ') + '}'
                : t,
              ''
            );
        }
        function ai(e) {
          function t(t, n) {
            if (e) {
              var r = t.lastEffect;
              null !== r
                ? ((r.nextEffect = n), (t.lastEffect = n))
                : (t.firstEffect = t.lastEffect = n),
                (n.nextEffect = null),
                (n.effectTag = 8);
            }
          }
          function n(n, r) {
            if (!e) return null;
            for (; null !== r; ) t(n, r), (r = r.sibling);
            return null;
          }
          function l(e, t) {
            for (e = new Map(); null !== t; )
              null !== t.key ? e.set(t.key, t) : e.set(t.index, t),
                (t = t.sibling);
            return e;
          }
          function i(e, t, n) {
            return ((e = yu(e, t, n)).index = 0), (e.sibling = null), e;
          }
          function a(t, n, r) {
            return (
              (t.index = r),
              e
                ? null !== (r = t.alternate)
                  ? (r = r.index) < n
                    ? ((t.effectTag = 2), n)
                    : r
                  : ((t.effectTag = 2), n)
                : n
            );
          }
          function o(t) {
            return e && null === t.alternate && (t.effectTag = 2), t;
          }
          function u(e, t, n, r) {
            return null === t || 6 !== t.tag
              ? (((t = ku(n, e.mode, r)).return = e), t)
              : (((t = i(t, n, r)).return = e), t);
          }
          function c(e, t, n, r) {
            return null !== t && t.elementType === n.type
              ? (((r = i(t, n.props, r)).ref = li(e, t, n)), (r.return = e), r)
              : (((r = bu(n.type, n.key, n.props, null, e.mode, r)).ref = li(
                  e,
                  t,
                  n
                )),
                (r.return = e),
                r);
          }
          function s(e, t, n, r) {
            return null === t ||
              4 !== t.tag ||
              t.stateNode.containerInfo !== n.containerInfo ||
              t.stateNode.implementation !== n.implementation
              ? (((t = Eu(n, e.mode, r)).return = e), t)
              : (((t = i(t, n.children || [], r)).return = e), t);
          }
          function f(e, t, n, r, l) {
            return null === t || 7 !== t.tag
              ? (((t = wu(n, e.mode, r, l)).return = e), t)
              : (((t = i(t, n, r)).return = e), t);
          }
          function d(e, t, n) {
            if ('string' == typeof t || 'number' == typeof t)
              return ((t = ku('' + t, e.mode, n)).return = e), t;
            if ('object' == typeof t && null !== t) {
              switch (t.$$typeof) {
                case Xe:
                  return (
                    ((n = bu(t.type, t.key, t.props, null, e.mode, n)).ref = li(
                      e,
                      null,
                      t
                    )),
                    (n.return = e),
                    n
                  );
                case Ge:
                  return ((t = Eu(t, e.mode, n)).return = e), t;
              }
              if (ri(t) || st(t))
                return ((t = wu(t, e.mode, n, null)).return = e), t;
              ii(e, t);
            }
            return null;
          }
          function p(e, t, n, r) {
            var l = null !== t ? t.key : null;
            if ('string' == typeof n || 'number' == typeof n)
              return null !== l ? null : u(e, t, '' + n, r);
            if ('object' == typeof n && null !== n) {
              switch (n.$$typeof) {
                case Xe:
                  return n.key === l
                    ? n.type === Ze
                      ? f(e, t, n.props.children, r, l)
                      : c(e, t, n, r)
                    : null;
                case Ge:
                  return n.key === l ? s(e, t, n, r) : null;
              }
              if (ri(n) || st(n))
                return null !== l ? null : f(e, t, n, r, null);
              ii(e, n);
            }
            return null;
          }
          function h(e, t, n, r, l) {
            if ('string' == typeof r || 'number' == typeof r)
              return u(t, (e = e.get(n) || null), '' + r, l);
            if ('object' == typeof r && null !== r) {
              switch (r.$$typeof) {
                case Xe:
                  return (
                    (e = e.get(null === r.key ? n : r.key) || null),
                    r.type === Ze
                      ? f(t, e, r.props.children, l, r.key)
                      : c(t, e, r, l)
                  );
                case Ge:
                  return s(
                    t,
                    (e = e.get(null === r.key ? n : r.key) || null),
                    r,
                    l
                  );
              }
              if (ri(r) || st(r))
                return f(t, (e = e.get(n) || null), r, l, null);
              ii(t, r);
            }
            return null;
          }
          function m(r, i, o, u) {
            for (
              var c = null, s = null, f = i, m = (i = 0), g = null;
              null !== f && m < o.length;
              m++
            ) {
              f.index > m ? ((g = f), (f = null)) : (g = f.sibling);
              var v = p(r, f, o[m], u);
              if (null === v) {
                null === f && (f = g);
                break;
              }
              e && f && null === v.alternate && t(r, f),
                (i = a(v, i, m)),
                null === s ? (c = v) : (s.sibling = v),
                (s = v),
                (f = g);
            }
            if (m === o.length) return n(r, f), c;
            if (null === f) {
              for (; m < o.length; m++)
                null !== (f = d(r, o[m], u)) &&
                  ((i = a(f, i, m)),
                  null === s ? (c = f) : (s.sibling = f),
                  (s = f));
              return c;
            }
            for (f = l(r, f); m < o.length; m++)
              null !== (g = h(f, r, m, o[m], u)) &&
                (e &&
                  null !== g.alternate &&
                  f.delete(null === g.key ? m : g.key),
                (i = a(g, i, m)),
                null === s ? (c = g) : (s.sibling = g),
                (s = g));
            return (
              e &&
                f.forEach(function(e) {
                  return t(r, e);
                }),
              c
            );
          }
          function g(i, o, u, c) {
            var s = st(u);
            if ('function' != typeof s) throw r(Error(150));
            if (null == (u = s.call(u))) throw r(Error(151));
            for (
              var f = (s = null), m = o, g = (o = 0), v = null, y = u.next();
              null !== m && !y.done;
              g++, y = u.next()
            ) {
              m.index > g ? ((v = m), (m = null)) : (v = m.sibling);
              var b = p(i, m, y.value, c);
              if (null === b) {
                null === m && (m = v);
                break;
              }
              e && m && null === b.alternate && t(i, m),
                (o = a(b, o, g)),
                null === f ? (s = b) : (f.sibling = b),
                (f = b),
                (m = v);
            }
            if (y.done) return n(i, m), s;
            if (null === m) {
              for (; !y.done; g++, y = u.next())
                null !== (y = d(i, y.value, c)) &&
                  ((o = a(y, o, g)),
                  null === f ? (s = y) : (f.sibling = y),
                  (f = y));
              return s;
            }
            for (m = l(i, m); !y.done; g++, y = u.next())
              null !== (y = h(m, i, g, y.value, c)) &&
                (e &&
                  null !== y.alternate &&
                  m.delete(null === y.key ? g : y.key),
                (o = a(y, o, g)),
                null === f ? (s = y) : (f.sibling = y),
                (f = y));
            return (
              e &&
                m.forEach(function(e) {
                  return t(i, e);
                }),
              s
            );
          }
          return function(e, l, a, u) {
            var c =
              'object' == typeof a &&
              null !== a &&
              a.type === Ze &&
              null === a.key;
            c && (a = a.props.children);
            var s = 'object' == typeof a && null !== a;
            if (s)
              switch (a.$$typeof) {
                case Xe:
                  e: {
                    for (s = a.key, c = l; null !== c; ) {
                      if (c.key === s) {
                        if (
                          7 === c.tag ? a.type === Ze : c.elementType === a.type
                        ) {
                          n(e, c.sibling),
                            ((l = i(
                              c,
                              a.type === Ze ? a.props.children : a.props,
                              u
                            )).ref = li(e, c, a)),
                            (l.return = e),
                            (e = l);
                          break e;
                        }
                        n(e, c);
                        break;
                      }
                      t(e, c), (c = c.sibling);
                    }
                    a.type === Ze
                      ? (((l = wu(
                          a.props.children,
                          e.mode,
                          u,
                          a.key
                        )).return = e),
                        (e = l))
                      : (((u = bu(
                          a.type,
                          a.key,
                          a.props,
                          null,
                          e.mode,
                          u
                        )).ref = li(e, l, a)),
                        (u.return = e),
                        (e = u));
                  }
                  return o(e);
                case Ge:
                  e: {
                    for (c = a.key; null !== l; ) {
                      if (l.key === c) {
                        if (
                          4 === l.tag &&
                          l.stateNode.containerInfo === a.containerInfo &&
                          l.stateNode.implementation === a.implementation
                        ) {
                          n(e, l.sibling),
                            ((l = i(l, a.children || [], u)).return = e),
                            (e = l);
                          break e;
                        }
                        n(e, l);
                        break;
                      }
                      t(e, l), (l = l.sibling);
                    }
                    ((l = Eu(a, e.mode, u)).return = e), (e = l);
                  }
                  return o(e);
              }
            if ('string' == typeof a || 'number' == typeof a)
              return (
                (a = '' + a),
                null !== l && 6 === l.tag
                  ? (n(e, l.sibling), ((l = i(l, a, u)).return = e), (e = l))
                  : (n(e, l), ((l = ku(a, e.mode, u)).return = e), (e = l)),
                o(e)
              );
            if (ri(a)) return m(e, l, a, u);
            if (st(a)) return g(e, l, a, u);
            if ((s && ii(e, a), void 0 === a && !c))
              switch (e.tag) {
                case 1:
                case 0:
                  throw ((e = e.type),
                  r(Error(152), e.displayName || e.name || 'Component'));
              }
            return n(e, l);
          };
        }
        var oi = ai(!0),
          ui = ai(!1),
          ci = {},
          si = { current: ci },
          fi = { current: ci },
          di = { current: ci };
        function pi(e) {
          if (e === ci) throw r(Error(174));
          return e;
        }
        function hi(e, t) {
          Ar(di, t, e), Ar(fi, e, e), Ar(si, ci, e);
          var n = t.nodeType;
          switch (n) {
            case 9:
            case 11:
              t = (t = t.documentElement) ? t.namespaceURI : gr(null, '');
              break;
            default:
              t = gr(
                (t = (n = 8 === n ? t.parentNode : t).namespaceURI || null),
                (n = n.tagName)
              );
          }
          Lr(si, e), Ar(si, t, e);
        }
        function mi(e) {
          Lr(si, e), Lr(fi, e), Lr(di, e);
        }
        function gi(e) {
          pi(di.current);
          var t = pi(si.current),
            n = gr(t, e.type);
          t !== n && (Ar(fi, e, e), Ar(si, n, e));
        }
        function vi(e) {
          fi.current === e && (Lr(si, e), Lr(fi, e));
        }
        var yi = 1,
          bi = 1,
          wi = 2,
          ki = { current: 0 };
        function Ei(e) {
          for (var t = e; null !== t; ) {
            if (13 === t.tag) {
              if (null !== t.memoizedState) return t;
            } else if (19 === t.tag && void 0 !== t.memoizedProps.revealOrder) {
              if (0 != (64 & t.effectTag)) return t;
            } else if (null !== t.child) {
              (t.child.return = t), (t = t.child);
              continue;
            }
            if (t === e) break;
            for (; null === t.sibling; ) {
              if (null === t.return || t.return === e) return null;
              t = t.return;
            }
            (t.sibling.return = t.return), (t = t.sibling);
          }
          return null;
        }
        var xi = 0,
          Ti = 2,
          Ci = 4,
          Si = 8,
          _i = 16,
          Pi = 32,
          Ni = 64,
          zi = 128,
          Mi = $e.ReactCurrentDispatcher,
          Ui = 0,
          Ri = null,
          Fi = null,
          Ii = null,
          Di = null,
          Oi = null,
          Li = null,
          Ai = 0,
          Wi = null,
          Vi = 0,
          Bi = !1,
          ji = null,
          Hi = 0;
        function Qi() {
          throw r(Error(321));
        }
        function Ki(e, t) {
          if (null === t) return !1;
          for (var n = 0; n < t.length && n < e.length; n++)
            if (!an(e[n], t[n])) return !1;
          return !0;
        }
        function $i(e, t, n, l, i, a) {
          if (
            ((Ui = a),
            (Ri = t),
            (Ii = null !== e ? e.memoizedState : null),
            (Mi.current = null === Ii ? aa : oa),
            (t = n(l, i)),
            Bi)
          ) {
            do {
              (Bi = !1),
                (Hi += 1),
                (Ii = null !== e ? e.memoizedState : null),
                (Li = Di),
                (Wi = Oi = Fi = null),
                (Mi.current = oa),
                (t = n(l, i));
            } while (Bi);
            (ji = null), (Hi = 0);
          }
          if (
            ((Mi.current = ia),
            ((e = Ri).memoizedState = Di),
            (e.expirationTime = Ai),
            (e.updateQueue = Wi),
            (e.effectTag |= Vi),
            (e = null !== Fi && null !== Fi.next),
            (Ui = 0),
            (Li = Oi = Di = Ii = Fi = Ri = null),
            (Ai = 0),
            (Wi = null),
            (Vi = 0),
            e)
          )
            throw r(Error(300));
          return t;
        }
        function qi() {
          (Mi.current = ia),
            (Ui = 0),
            (Li = Oi = Di = Ii = Fi = Ri = null),
            (Ai = 0),
            (Wi = null),
            (Vi = 0),
            (Bi = !1),
            (ji = null),
            (Hi = 0);
        }
        function Yi() {
          var e = {
            memoizedState: null,
            baseState: null,
            queue: null,
            baseUpdate: null,
            next: null,
          };
          return null === Oi ? (Di = Oi = e) : (Oi = Oi.next = e), Oi;
        }
        function Xi() {
          if (null !== Li)
            (Li = (Oi = Li).next), (Ii = null !== (Fi = Ii) ? Fi.next : null);
          else {
            if (null === Ii) throw r(Error(310));
            var e = {
              memoizedState: (Fi = Ii).memoizedState,
              baseState: Fi.baseState,
              queue: Fi.queue,
              baseUpdate: Fi.baseUpdate,
              next: null,
            };
            (Oi = null === Oi ? (Di = e) : (Oi.next = e)), (Ii = Fi.next);
          }
          return Oi;
        }
        function Gi(e, t) {
          return 'function' == typeof t ? t(e) : t;
        }
        function Zi(e) {
          var t = Xi(),
            n = t.queue;
          if (null === n) throw r(Error(311));
          if (((n.lastRenderedReducer = e), 0 < Hi)) {
            var l = n.dispatch;
            if (null !== ji) {
              var i = ji.get(n);
              if (void 0 !== i) {
                ji.delete(n);
                var a = t.memoizedState;
                do {
                  (a = e(a, i.action)), (i = i.next);
                } while (null !== i);
                return (
                  an(a, t.memoizedState) || (ya = !0),
                  (t.memoizedState = a),
                  t.baseUpdate === n.last && (t.baseState = a),
                  (n.lastRenderedState = a),
                  [a, l]
                );
              }
            }
            return [t.memoizedState, l];
          }
          l = n.last;
          var o = t.baseUpdate;
          if (
            ((a = t.baseState),
            null !== o
              ? (null !== l && (l.next = null), (l = o.next))
              : (l = null !== l ? l.next : null),
            null !== l)
          ) {
            var u = (i = null),
              c = l,
              s = !1;
            do {
              var f = c.expirationTime;
              f < Ui
                ? (s || ((s = !0), (u = o), (i = a)), f > Ai && (Ai = f))
                : (Jo(f, c.suspenseConfig),
                  (a = c.eagerReducer === e ? c.eagerState : e(a, c.action))),
                (o = c),
                (c = c.next);
            } while (null !== c && c !== l);
            s || ((u = o), (i = a)),
              an(a, t.memoizedState) || (ya = !0),
              (t.memoizedState = a),
              (t.baseUpdate = u),
              (t.baseState = i),
              (n.lastRenderedState = a);
          }
          return [t.memoizedState, n.dispatch];
        }
        function Ji(e, t, n, r) {
          return (
            (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
            null === Wi
              ? ((Wi = { lastEffect: null }).lastEffect = e.next = e)
              : null === (t = Wi.lastEffect)
              ? (Wi.lastEffect = e.next = e)
              : ((n = t.next), (t.next = e), (e.next = n), (Wi.lastEffect = e)),
            e
          );
        }
        function ea(e, t, n, r) {
          var l = Yi();
          (Vi |= e),
            (l.memoizedState = Ji(t, n, void 0, void 0 === r ? null : r));
        }
        function ta(e, t, n, r) {
          var l = Xi();
          r = void 0 === r ? null : r;
          var i = void 0;
          if (null !== Fi) {
            var a = Fi.memoizedState;
            if (((i = a.destroy), null !== r && Ki(r, a.deps)))
              return void Ji(xi, n, i, r);
          }
          (Vi |= e), (l.memoizedState = Ji(t, n, i, r));
        }
        function na(e, t) {
          return 'function' == typeof t
            ? ((e = e()),
              t(e),
              function() {
                t(null);
              })
            : null != t
            ? ((e = e()),
              (t.current = e),
              function() {
                t.current = null;
              })
            : void 0;
        }
        function ra() {}
        function la(e, t, n) {
          if (!(25 > Hi)) throw r(Error(301));
          var l = e.alternate;
          if (e === Ri || (null !== l && l === Ri))
            if (
              ((Bi = !0),
              (e = {
                expirationTime: Ui,
                suspenseConfig: null,
                action: n,
                eagerReducer: null,
                eagerState: null,
                next: null,
              }),
              null === ji && (ji = new Map()),
              void 0 === (n = ji.get(t)))
            )
              ji.set(t, e);
            else {
              for (t = n; null !== t.next; ) t = t.next;
              t.next = e;
            }
          else {
            var i = Lo(),
              a = Yl.suspense;
            a = {
              expirationTime: (i = Ao(i, e, a)),
              suspenseConfig: a,
              action: n,
              eagerReducer: null,
              eagerState: null,
              next: null,
            };
            var o = t.last;
            if (null === o) a.next = a;
            else {
              var u = o.next;
              null !== u && (a.next = u), (o.next = a);
            }
            if (
              ((t.last = a),
              0 === e.expirationTime &&
                (null === l || 0 === l.expirationTime) &&
                null !== (l = t.lastRenderedReducer))
            )
              try {
                var c = t.lastRenderedState,
                  s = l(c, n);
                if (((a.eagerReducer = l), (a.eagerState = s), an(s, c)))
                  return;
              } catch (f) {}
            Vo(e, i);
          }
        }
        var ia = {
            readContext: Dl,
            useCallback: Qi,
            useContext: Qi,
            useEffect: Qi,
            useImperativeHandle: Qi,
            useLayoutEffect: Qi,
            useMemo: Qi,
            useReducer: Qi,
            useRef: Qi,
            useState: Qi,
            useDebugValue: Qi,
            useResponder: Qi,
          },
          aa = {
            readContext: Dl,
            useCallback: function(e, t) {
              return (Yi().memoizedState = [e, void 0 === t ? null : t]), e;
            },
            useContext: Dl,
            useEffect: function(e, t) {
              return ea(516, zi | Ni, e, t);
            },
            useImperativeHandle: function(e, t, n) {
              return (
                (n = null != n ? n.concat([e]) : null),
                ea(4, Ci | Pi, na.bind(null, t, e), n)
              );
            },
            useLayoutEffect: function(e, t) {
              return ea(4, Ci | Pi, e, t);
            },
            useMemo: function(e, t) {
              var n = Yi();
              return (
                (t = void 0 === t ? null : t),
                (e = e()),
                (n.memoizedState = [e, t]),
                e
              );
            },
            useReducer: function(e, t, n) {
              var r = Yi();
              return (
                (t = void 0 !== n ? n(t) : t),
                (r.memoizedState = r.baseState = t),
                (e = (e = r.queue = {
                  last: null,
                  dispatch: null,
                  lastRenderedReducer: e,
                  lastRenderedState: t,
                }).dispatch = la.bind(null, Ri, e)),
                [r.memoizedState, e]
              );
            },
            useRef: function(e) {
              return (e = { current: e }), (Yi().memoizedState = e);
            },
            useState: function(e) {
              var t = Yi();
              return (
                'function' == typeof e && (e = e()),
                (t.memoizedState = t.baseState = e),
                (e = (e = t.queue = {
                  last: null,
                  dispatch: null,
                  lastRenderedReducer: Gi,
                  lastRenderedState: e,
                }).dispatch = la.bind(null, Ri, e)),
                [t.memoizedState, e]
              );
            },
            useDebugValue: ra,
            useResponder: cn,
          },
          oa = {
            readContext: Dl,
            useCallback: function(e, t) {
              var n = Xi();
              t = void 0 === t ? null : t;
              var r = n.memoizedState;
              return null !== r && null !== t && Ki(t, r[1])
                ? r[0]
                : ((n.memoizedState = [e, t]), e);
            },
            useContext: Dl,
            useEffect: function(e, t) {
              return ta(516, zi | Ni, e, t);
            },
            useImperativeHandle: function(e, t, n) {
              return (
                (n = null != n ? n.concat([e]) : null),
                ta(4, Ci | Pi, na.bind(null, t, e), n)
              );
            },
            useLayoutEffect: function(e, t) {
              return ta(4, Ci | Pi, e, t);
            },
            useMemo: function(e, t) {
              var n = Xi();
              t = void 0 === t ? null : t;
              var r = n.memoizedState;
              return null !== r && null !== t && Ki(t, r[1])
                ? r[0]
                : ((e = e()), (n.memoizedState = [e, t]), e);
            },
            useReducer: Zi,
            useRef: function() {
              return Xi().memoizedState;
            },
            useState: function(e) {
              return Zi(Gi, e);
            },
            useDebugValue: ra,
            useResponder: cn,
          },
          ua = null,
          ca = null,
          sa = !1;
        function fa(e, t) {
          var n = mu(5, null, null, 0);
          (n.elementType = 'DELETED'),
            (n.type = 'DELETED'),
            (n.stateNode = t),
            (n.return = e),
            (n.effectTag = 8),
            null !== e.lastEffect
              ? ((e.lastEffect.nextEffect = n), (e.lastEffect = n))
              : (e.firstEffect = e.lastEffect = n);
        }
        function da(e, t) {
          switch (e.tag) {
            case 5:
              var n = e.type;
              return (
                null !==
                  (t =
                    1 !== t.nodeType ||
                    n.toLowerCase() !== t.nodeName.toLowerCase()
                      ? null
                      : t) && ((e.stateNode = t), !0)
              );
            case 6:
              return (
                null !==
                  (t = '' === e.pendingProps || 3 !== t.nodeType ? null : t) &&
                ((e.stateNode = t), !0)
              );
            case 13:
            default:
              return !1;
          }
        }
        function pa(e) {
          if (sa) {
            var t = ca;
            if (t) {
              var n = t;
              if (!da(e, t)) {
                if (!(t = Ir(n.nextSibling)) || !da(e, t))
                  return (e.effectTag |= 2), (sa = !1), void (ua = e);
                fa(ua, n);
              }
              (ua = e), (ca = Ir(t.firstChild));
            } else (e.effectTag |= 2), (sa = !1), (ua = e);
          }
        }
        function ha(e) {
          for (
            e = e.return;
            null !== e && 5 !== e.tag && 3 !== e.tag && 18 !== e.tag;

          )
            e = e.return;
          ua = e;
        }
        function ma(e) {
          if (e !== ua) return !1;
          if (!sa) return ha(e), (sa = !0), !1;
          var t = e.type;
          if (
            5 !== e.tag ||
            ('head' !== t && 'body' !== t && !Ur(t, e.memoizedProps))
          )
            for (t = ca; t; ) fa(e, t), (t = Ir(t.nextSibling));
          return ha(e), (ca = ua ? Ir(e.stateNode.nextSibling) : null), !0;
        }
        function ga() {
          (ca = ua = null), (sa = !1);
        }
        var va = $e.ReactCurrentOwner,
          ya = !1;
        function ba(e, t, n, r) {
          t.child = null === e ? ui(t, null, n, r) : oi(t, e.child, n, r);
        }
        function wa(e, t, n, r, l) {
          n = n.render;
          var i = t.ref;
          return (
            Il(t, l),
            (r = $i(e, t, n, r, i, l)),
            null === e || ya
              ? ((t.effectTag |= 1), ba(e, t, r, l), t.child)
              : ((t.updateQueue = e.updateQueue),
                (t.effectTag &= -517),
                e.expirationTime <= l && (e.expirationTime = 0),
                Ua(e, t, l))
          );
        }
        function ka(e, t, n, r, l, i) {
          if (null === e) {
            var a = n.type;
            return 'function' != typeof a ||
              gu(a) ||
              void 0 !== a.defaultProps ||
              null !== n.compare ||
              void 0 !== n.defaultProps
              ? (((e = bu(n.type, null, r, null, t.mode, i)).ref = t.ref),
                (e.return = t),
                (t.child = e))
              : ((t.tag = 15), (t.type = a), Ea(e, t, a, r, l, i));
          }
          return (
            (a = e.child),
            l < i &&
            ((l = a.memoizedProps),
            (n = null !== (n = n.compare) ? n : un)(l, r) && e.ref === t.ref)
              ? Ua(e, t, i)
              : ((t.effectTag |= 1),
                ((e = yu(a, r, i)).ref = t.ref),
                (e.return = t),
                (t.child = e))
          );
        }
        function Ea(e, t, n, r, l, i) {
          return null !== e &&
            un(e.memoizedProps, r) &&
            e.ref === t.ref &&
            ((ya = !1), l < i)
            ? Ua(e, t, i)
            : Ta(e, t, n, r, i);
        }
        function xa(e, t) {
          var n = t.ref;
          ((null === e && null !== n) || (null !== e && e.ref !== n)) &&
            (t.effectTag |= 128);
        }
        function Ta(e, t, n, r, l) {
          var i = Qr(n) ? jr : Vr.current;
          return (
            (i = Hr(t, i)),
            Il(t, l),
            (n = $i(e, t, n, r, i, l)),
            null === e || ya
              ? ((t.effectTag |= 1), ba(e, t, n, l), t.child)
              : ((t.updateQueue = e.updateQueue),
                (t.effectTag &= -517),
                e.expirationTime <= l && (e.expirationTime = 0),
                Ua(e, t, l))
          );
        }
        function Ca(e, t, n, r, l) {
          if (Qr(n)) {
            var i = !0;
            Xr(t);
          } else i = !1;
          if ((Il(t, l), null === t.stateNode))
            null !== e &&
              ((e.alternate = null), (t.alternate = null), (t.effectTag |= 2)),
              ei(t, n, r, l),
              ni(t, n, r, l),
              (r = !0);
          else if (null === e) {
            var a = t.stateNode,
              o = t.memoizedProps;
            a.props = o;
            var u = a.context,
              c = n.contextType;
            'object' == typeof c && null !== c
              ? (c = Dl(c))
              : (c = Hr(t, (c = Qr(n) ? jr : Vr.current)));
            var s = n.getDerivedStateFromProps,
              f =
                'function' == typeof s ||
                'function' == typeof a.getSnapshotBeforeUpdate;
            f ||
              ('function' != typeof a.UNSAFE_componentWillReceiveProps &&
                'function' != typeof a.componentWillReceiveProps) ||
              ((o !== r || u !== c) && ti(t, a, r, c)),
              (Ol = !1);
            var d = t.memoizedState;
            u = a.state = d;
            var p = t.updateQueue;
            null !== p && (Kl(t, p, r, a, l), (u = t.memoizedState)),
              o !== r || d !== u || Br.current || Ol
                ? ('function' == typeof s &&
                    (Gl(t, n, s, r), (u = t.memoizedState)),
                  (o = Ol || Jl(t, n, o, r, d, u, c))
                    ? (f ||
                        ('function' != typeof a.UNSAFE_componentWillMount &&
                          'function' != typeof a.componentWillMount) ||
                        ('function' == typeof a.componentWillMount &&
                          a.componentWillMount(),
                        'function' == typeof a.UNSAFE_componentWillMount &&
                          a.UNSAFE_componentWillMount()),
                      'function' == typeof a.componentDidMount &&
                        (t.effectTag |= 4))
                    : ('function' == typeof a.componentDidMount &&
                        (t.effectTag |= 4),
                      (t.memoizedProps = r),
                      (t.memoizedState = u)),
                  (a.props = r),
                  (a.state = u),
                  (a.context = c),
                  (r = o))
                : ('function' == typeof a.componentDidMount &&
                    (t.effectTag |= 4),
                  (r = !1));
          } else
            (a = t.stateNode),
              (o = t.memoizedProps),
              (a.props = t.type === t.elementType ? o : Cl(t.type, o)),
              (u = a.context),
              'object' == typeof (c = n.contextType) && null !== c
                ? (c = Dl(c))
                : (c = Hr(t, (c = Qr(n) ? jr : Vr.current))),
              (f =
                'function' == typeof (s = n.getDerivedStateFromProps) ||
                'function' == typeof a.getSnapshotBeforeUpdate) ||
                ('function' != typeof a.UNSAFE_componentWillReceiveProps &&
                  'function' != typeof a.componentWillReceiveProps) ||
                ((o !== r || u !== c) && ti(t, a, r, c)),
              (Ol = !1),
              (u = t.memoizedState),
              (d = a.state = u),
              null !== (p = t.updateQueue) &&
                (Kl(t, p, r, a, l), (d = t.memoizedState)),
              o !== r || u !== d || Br.current || Ol
                ? ('function' == typeof s &&
                    (Gl(t, n, s, r), (d = t.memoizedState)),
                  (s = Ol || Jl(t, n, o, r, u, d, c))
                    ? (f ||
                        ('function' != typeof a.UNSAFE_componentWillUpdate &&
                          'function' != typeof a.componentWillUpdate) ||
                        ('function' == typeof a.componentWillUpdate &&
                          a.componentWillUpdate(r, d, c),
                        'function' == typeof a.UNSAFE_componentWillUpdate &&
                          a.UNSAFE_componentWillUpdate(r, d, c)),
                      'function' == typeof a.componentDidUpdate &&
                        (t.effectTag |= 4),
                      'function' == typeof a.getSnapshotBeforeUpdate &&
                        (t.effectTag |= 256))
                    : ('function' != typeof a.componentDidUpdate ||
                        (o === e.memoizedProps && u === e.memoizedState) ||
                        (t.effectTag |= 4),
                      'function' != typeof a.getSnapshotBeforeUpdate ||
                        (o === e.memoizedProps && u === e.memoizedState) ||
                        (t.effectTag |= 256),
                      (t.memoizedProps = r),
                      (t.memoizedState = d)),
                  (a.props = r),
                  (a.state = d),
                  (a.context = c),
                  (r = s))
                : ('function' != typeof a.componentDidUpdate ||
                    (o === e.memoizedProps && u === e.memoizedState) ||
                    (t.effectTag |= 4),
                  'function' != typeof a.getSnapshotBeforeUpdate ||
                    (o === e.memoizedProps && u === e.memoizedState) ||
                    (t.effectTag |= 256),
                  (r = !1));
          return Sa(e, t, n, r, i, l);
        }
        function Sa(e, t, n, r, l, i) {
          xa(e, t);
          var a = 0 != (64 & t.effectTag);
          if (!r && !a) return l && Gr(t, n, !1), Ua(e, t, i);
          (r = t.stateNode), (va.current = t);
          var o =
            a && 'function' != typeof n.getDerivedStateFromError
              ? null
              : r.render();
          return (
            (t.effectTag |= 1),
            null !== e && a
              ? ((t.child = oi(t, e.child, null, i)),
                (t.child = oi(t, null, o, i)))
              : ba(e, t, o, i),
            (t.memoizedState = r.state),
            l && Gr(t, n, !0),
            t.child
          );
        }
        function _a(e) {
          var t = e.stateNode;
          t.pendingContext
            ? qr(e, t.pendingContext, t.pendingContext !== t.context)
            : t.context && qr(e, t.context, !1),
            hi(e, t.containerInfo);
        }
        var Pa = {};
        function Na(e, t, n) {
          var r,
            l = t.mode,
            i = t.pendingProps,
            a = ki.current,
            o = null,
            u = !1;
          if (
            ((r = 0 != (64 & t.effectTag)) ||
              (r = 0 != (a & wi) && (null === e || null !== e.memoizedState)),
            r
              ? ((o = Pa), (u = !0), (t.effectTag &= -65))
              : (null !== e && null === e.memoizedState) ||
                void 0 === i.fallback ||
                !0 === i.unstable_avoidThisFallback ||
                (a |= bi),
            Ar(ki, (a &= yi), t),
            null === e)
          )
            if (u) {
              if (
                ((i = i.fallback),
                ((e = wu(null, l, 0, null)).return = t),
                0 == (2 & t.mode))
              )
                for (
                  u = null !== t.memoizedState ? t.child.child : t.child,
                    e.child = u;
                  null !== u;

                )
                  (u.return = e), (u = u.sibling);
              ((n = wu(i, l, n, null)).return = t), (e.sibling = n), (l = e);
            } else l = n = ui(t, null, i.children, n);
          else {
            if (null !== e.memoizedState)
              if (((l = (a = e.child).sibling), u)) {
                if (
                  ((i = i.fallback),
                  ((n = yu(a, a.pendingProps, 0)).return = t),
                  0 == (2 & t.mode) &&
                    (u = null !== t.memoizedState ? t.child.child : t.child) !==
                      a.child)
                )
                  for (n.child = u; null !== u; )
                    (u.return = n), (u = u.sibling);
                ((i = yu(l, i, l.expirationTime)).return = t),
                  (n.sibling = i),
                  (l = n),
                  (n.childExpirationTime = 0),
                  (n = i);
              } else l = n = oi(t, a.child, i.children, n);
            else if (((a = e.child), u)) {
              if (
                ((u = i.fallback),
                ((i = wu(null, l, 0, null)).return = t),
                (i.child = a),
                null !== a && (a.return = i),
                0 == (2 & t.mode))
              )
                for (
                  a = null !== t.memoizedState ? t.child.child : t.child,
                    i.child = a;
                  null !== a;

                )
                  (a.return = i), (a = a.sibling);
              ((n = wu(u, l, n, null)).return = t),
                (i.sibling = n),
                (n.effectTag |= 2),
                (l = i),
                (i.childExpirationTime = 0);
            } else n = l = oi(t, a, i.children, n);
            t.stateNode = e.stateNode;
          }
          return (t.memoizedState = o), (t.child = l), n;
        }
        function za(e, t, n, r, l) {
          var i = e.memoizedState;
          null === i
            ? (e.memoizedState = {
                isBackwards: t,
                rendering: null,
                last: r,
                tail: n,
                tailExpiration: 0,
                tailMode: l,
              })
            : ((i.isBackwards = t),
              (i.rendering = null),
              (i.last = r),
              (i.tail = n),
              (i.tailExpiration = 0),
              (i.tailMode = l));
        }
        function Ma(e, t, n) {
          var r = t.pendingProps,
            l = r.revealOrder,
            i = r.tail;
          if ((ba(e, t, r.children, n), 0 != ((r = ki.current) & wi)))
            (r = (r & yi) | wi), (t.effectTag |= 64);
          else {
            if (null !== e && 0 != (64 & e.effectTag))
              e: for (e = t.child; null !== e; ) {
                if (13 === e.tag) {
                  if (null !== e.memoizedState) {
                    e.expirationTime < n && (e.expirationTime = n);
                    var a = e.alternate;
                    null !== a &&
                      a.expirationTime < n &&
                      (a.expirationTime = n),
                      Fl(e.return, n);
                  }
                } else if (null !== e.child) {
                  (e.child.return = e), (e = e.child);
                  continue;
                }
                if (e === t) break e;
                for (; null === e.sibling; ) {
                  if (null === e.return || e.return === t) break e;
                  e = e.return;
                }
                (e.sibling.return = e.return), (e = e.sibling);
              }
            r &= yi;
          }
          if ((Ar(ki, r, t), 0 == (2 & t.mode))) t.memoizedState = null;
          else
            switch (l) {
              case 'forwards':
                for (n = t.child, l = null; null !== n; )
                  null !== (r = n.alternate) && null === Ei(r) && (l = n),
                    (n = n.sibling);
                null === (n = l)
                  ? ((l = t.child), (t.child = null))
                  : ((l = n.sibling), (n.sibling = null)),
                  za(t, !1, l, n, i);
                break;
              case 'backwards':
                for (n = null, l = t.child, t.child = null; null !== l; ) {
                  if (null !== (r = l.alternate) && null === Ei(r)) {
                    t.child = l;
                    break;
                  }
                  (r = l.sibling), (l.sibling = n), (n = l), (l = r);
                }
                za(t, !0, n, null, i);
                break;
              case 'together':
                za(t, !1, null, null, void 0);
                break;
              default:
                t.memoizedState = null;
            }
          return t.child;
        }
        function Ua(e, t, n) {
          if (
            (null !== e && (t.dependencies = e.dependencies),
            t.childExpirationTime < n)
          )
            return null;
          if (null !== e && t.child !== e.child) throw r(Error(153));
          if (null !== t.child) {
            for (
              n = yu((e = t.child), e.pendingProps, e.expirationTime),
                t.child = n,
                n.return = t;
              null !== e.sibling;

            )
              (e = e.sibling),
                ((n = n.sibling = yu(
                  e,
                  e.pendingProps,
                  e.expirationTime
                )).return = t);
            n.sibling = null;
          }
          return t.child;
        }
        function Ra(e) {
          e.effectTag |= 4;
        }
        var Fa = void 0,
          Ia = void 0,
          Da = void 0,
          Oa = void 0;
        function La(e, t) {
          switch (e.tailMode) {
            case 'hidden':
              t = e.tail;
              for (var n = null; null !== t; )
                null !== t.alternate && (n = t), (t = t.sibling);
              null === n ? (e.tail = null) : (n.sibling = null);
              break;
            case 'collapsed':
              n = e.tail;
              for (var r = null; null !== n; )
                null !== n.alternate && (r = n), (n = n.sibling);
              null === r
                ? t || null === e.tail
                  ? (e.tail = null)
                  : (e.tail.sibling = null)
                : (r.sibling = null);
          }
        }
        function Aa(e) {
          switch (e.tag) {
            case 1:
              Qr(e.type) && Kr(e);
              var t = e.effectTag;
              return 2048 & t ? ((e.effectTag = (-2049 & t) | 64), e) : null;
            case 3:
              if ((mi(e), $r(e), 0 != (64 & (t = e.effectTag))))
                throw r(Error(285));
              return (e.effectTag = (-2049 & t) | 64), e;
            case 5:
              return vi(e), null;
            case 13:
              return (
                Lr(ki, e),
                2048 & (t = e.effectTag)
                  ? ((e.effectTag = (-2049 & t) | 64), e)
                  : null
              );
            case 18:
              return null;
            case 19:
              return Lr(ki, e), null;
            case 4:
              return mi(e), null;
            case 10:
              return Rl(e), null;
            default:
              return null;
          }
        }
        function Wa(e, t) {
          return { value: e, source: t, stack: dt(t) };
        }
        (Fa = function(e, t) {
          for (var n = t.child; null !== n; ) {
            if (5 === n.tag || 6 === n.tag) e.appendChild(n.stateNode);
            else if (20 === n.tag) e.appendChild(n.stateNode.instance);
            else if (4 !== n.tag && null !== n.child) {
              (n.child.return = n), (n = n.child);
              continue;
            }
            if (n === t) break;
            for (; null === n.sibling; ) {
              if (null === n.return || n.return === t) return;
              n = n.return;
            }
            (n.sibling.return = n.return), (n = n.sibling);
          }
        }),
          (Ia = function() {}),
          (Da = function(e, n, r, l, i) {
            var a = e.memoizedProps;
            if (a !== l) {
              var o = n.stateNode;
              switch ((pi(si.current), (e = null), r)) {
                case 'input':
                  (a = St(o, a)), (l = St(o, l)), (e = []);
                  break;
                case 'option':
                  (a = ur(o, a)), (l = ur(o, l)), (e = []);
                  break;
                case 'select':
                  (a = t({}, a, { value: void 0 })),
                    (l = t({}, l, { value: void 0 })),
                    (e = []);
                  break;
                case 'textarea':
                  (a = sr(o, a)), (l = sr(o, l)), (e = []);
                  break;
                default:
                  'function' != typeof a.onClick &&
                    'function' == typeof l.onClick &&
                    (o.onclick = Pr);
              }
              Cr(r, l), (o = r = void 0);
              var u = null;
              for (r in a)
                if (!l.hasOwnProperty(r) && a.hasOwnProperty(r) && null != a[r])
                  if ('style' === r) {
                    var c = a[r];
                    for (o in c)
                      c.hasOwnProperty(o) && (u || (u = {}), (u[o] = ''));
                  } else
                    'dangerouslySetInnerHTML' !== r &&
                      'children' !== r &&
                      'suppressContentEditableWarning' !== r &&
                      'suppressHydrationWarning' !== r &&
                      'autoFocus' !== r &&
                      (s.hasOwnProperty(r)
                        ? e || (e = [])
                        : (e = e || []).push(r, null));
              for (r in l) {
                var f = l[r];
                if (
                  ((c = null != a ? a[r] : void 0),
                  l.hasOwnProperty(r) && f !== c && (null != f || null != c))
                )
                  if ('style' === r)
                    if (c) {
                      for (o in c)
                        !c.hasOwnProperty(o) ||
                          (f && f.hasOwnProperty(o)) ||
                          (u || (u = {}), (u[o] = ''));
                      for (o in f)
                        f.hasOwnProperty(o) &&
                          c[o] !== f[o] &&
                          (u || (u = {}), (u[o] = f[o]));
                    } else u || (e || (e = []), e.push(r, u)), (u = f);
                  else
                    'dangerouslySetInnerHTML' === r
                      ? ((f = f ? f.__html : void 0),
                        (c = c ? c.__html : void 0),
                        null != f && c !== f && (e = e || []).push(r, '' + f))
                      : 'children' === r
                      ? c === f ||
                        ('string' != typeof f && 'number' != typeof f) ||
                        (e = e || []).push(r, '' + f)
                      : 'suppressContentEditableWarning' !== r &&
                        'suppressHydrationWarning' !== r &&
                        (s.hasOwnProperty(r)
                          ? (null != f && _r(i, r), e || c === f || (e = []))
                          : (e = e || []).push(r, f));
              }
              u && (e = e || []).push('style', u),
                (i = e),
                (n.updateQueue = i) && Ra(n);
            }
          }),
          (Oa = function(e, t, n, r) {
            n !== r && Ra(t);
          });
        var Va = 'function' == typeof WeakSet ? WeakSet : Set;
        function Ba(e, t) {
          var n = t.source,
            r = t.stack;
          null === r && null !== n && (r = dt(n)),
            null !== n && ft(n.type),
            (t = t.value),
            null !== e && 1 === e.tag && ft(e.type);
          try {
            console.error(t);
          } catch (l) {
            setTimeout(function() {
              throw l;
            });
          }
        }
        function ja(e, t) {
          try {
            (t.props = e.memoizedProps),
              (t.state = e.memoizedState),
              t.componentWillUnmount();
          } catch (n) {
            ou(e, n);
          }
        }
        function Ha(e) {
          var t = e.ref;
          if (null !== t)
            if ('function' == typeof t)
              try {
                t(null);
              } catch (n) {
                ou(e, n);
              }
            else t.current = null;
        }
        function Qa(e, t, n) {
          if (
            null !== (n = null !== (n = n.updateQueue) ? n.lastEffect : null)
          ) {
            var r = (n = n.next);
            do {
              if ((r.tag & e) !== xi) {
                var l = r.destroy;
                (r.destroy = void 0), void 0 !== l && l();
              }
              (r.tag & t) !== xi && ((l = r.create), (r.destroy = l())),
                (r = r.next);
            } while (r !== n);
          }
        }
        function Ka(e, t) {
          switch (('function' == typeof du && du(e), e.tag)) {
            case 0:
            case 11:
            case 14:
            case 15:
              var n = e.updateQueue;
              if (null !== n && null !== (n = n.lastEffect)) {
                var r = n.next;
                bl(97 < t ? 97 : t, function() {
                  var t = r;
                  do {
                    var n = t.destroy;
                    if (void 0 !== n) {
                      var l = e;
                      try {
                        n();
                      } catch (i) {
                        ou(l, i);
                      }
                    }
                    t = t.next;
                  } while (t !== r);
                });
              }
              break;
            case 1:
              Ha(e),
                'function' == typeof (t = e.stateNode).componentWillUnmount &&
                  ja(e, t);
              break;
            case 5:
              Ha(e);
              break;
            case 4:
              Xa(e, t);
          }
        }
        function $a(e, t) {
          for (var n = e; ; )
            if ((Ka(n, t), null !== n.child && 4 !== n.tag))
              (n.child.return = n), (n = n.child);
            else {
              if (n === e) break;
              for (; null === n.sibling; ) {
                if (null === n.return || n.return === e) return;
                n = n.return;
              }
              (n.sibling.return = n.return), (n = n.sibling);
            }
        }
        function qa(e) {
          return 5 === e.tag || 3 === e.tag || 4 === e.tag;
        }
        function Ya(e) {
          e: {
            for (var t = e.return; null !== t; ) {
              if (qa(t)) {
                var n = t;
                break e;
              }
              t = t.return;
            }
            throw r(Error(160));
          }
          switch (((t = n.stateNode), n.tag)) {
            case 5:
              var l = !1;
              break;
            case 3:
            case 4:
              (t = t.containerInfo), (l = !0);
              break;
            default:
              throw r(Error(161));
          }
          16 & n.effectTag && (br(t, ''), (n.effectTag &= -17));
          e: t: for (n = e; ; ) {
            for (; null === n.sibling; ) {
              if (null === n.return || qa(n.return)) {
                n = null;
                break e;
              }
              n = n.return;
            }
            for (
              n.sibling.return = n.return, n = n.sibling;
              5 !== n.tag && 6 !== n.tag && 18 !== n.tag;

            ) {
              if (2 & n.effectTag) continue t;
              if (null === n.child || 4 === n.tag) continue t;
              (n.child.return = n), (n = n.child);
            }
            if (!(2 & n.effectTag)) {
              n = n.stateNode;
              break e;
            }
          }
          for (var i = e; ; ) {
            var a = 5 === i.tag || 6 === i.tag;
            if (a || 20 === i.tag) {
              var o = a ? i.stateNode : i.stateNode.instance;
              if (n)
                if (l) {
                  var u = o;
                  (o = n),
                    8 === (a = t).nodeType
                      ? a.parentNode.insertBefore(u, o)
                      : a.insertBefore(u, o);
                } else t.insertBefore(o, n);
              else
                l
                  ? (8 === (u = t).nodeType
                      ? (a = u.parentNode).insertBefore(o, u)
                      : (a = u).appendChild(o),
                    null != (u = u._reactRootContainer) ||
                      null !== a.onclick ||
                      (a.onclick = Pr))
                  : t.appendChild(o);
            } else if (4 !== i.tag && null !== i.child) {
              (i.child.return = i), (i = i.child);
              continue;
            }
            if (i === e) break;
            for (; null === i.sibling; ) {
              if (null === i.return || i.return === e) return;
              i = i.return;
            }
            (i.sibling.return = i.return), (i = i.sibling);
          }
        }
        function Xa(e, t) {
          for (var n = e, l = !1, i = void 0, a = void 0; ; ) {
            if (!l) {
              l = n.return;
              e: for (;;) {
                if (null === l) throw r(Error(160));
                switch (((i = l.stateNode), l.tag)) {
                  case 5:
                    a = !1;
                    break e;
                  case 3:
                  case 4:
                    (i = i.containerInfo), (a = !0);
                    break e;
                }
                l = l.return;
              }
              l = !0;
            }
            if (5 === n.tag || 6 === n.tag)
              if (($a(n, t), a)) {
                var o = i,
                  u = n.stateNode;
                8 === o.nodeType
                  ? o.parentNode.removeChild(u)
                  : o.removeChild(u);
              } else i.removeChild(n.stateNode);
            else if (20 === n.tag)
              (u = n.stateNode.instance),
                $a(n, t),
                a
                  ? 8 === (o = i).nodeType
                    ? o.parentNode.removeChild(u)
                    : o.removeChild(u)
                  : i.removeChild(u);
            else if (4 === n.tag) {
              if (null !== n.child) {
                (i = n.stateNode.containerInfo),
                  (a = !0),
                  (n.child.return = n),
                  (n = n.child);
                continue;
              }
            } else if ((Ka(n, t), null !== n.child)) {
              (n.child.return = n), (n = n.child);
              continue;
            }
            if (n === e) break;
            for (; null === n.sibling; ) {
              if (null === n.return || n.return === e) return;
              4 === (n = n.return).tag && (l = !1);
            }
            (n.sibling.return = n.return), (n = n.sibling);
          }
        }
        function Ga(e, t) {
          switch (t.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
              Qa(Ci, Si, t);
              break;
            case 1:
              break;
            case 5:
              var n = t.stateNode;
              if (null != n) {
                var l = t.memoizedProps,
                  i = null !== e ? e.memoizedProps : l;
                e = t.type;
                var a = t.updateQueue;
                if (((t.updateQueue = null), null !== a)) {
                  for (
                    n[R] = l,
                      'input' === e &&
                        'radio' === l.type &&
                        null != l.name &&
                        Pt(n, l),
                      Sr(e, i),
                      t = Sr(e, l),
                      i = 0;
                    i < a.length;
                    i += 2
                  ) {
                    var o = a[i],
                      u = a[i + 1];
                    'style' === o
                      ? xr(n, u)
                      : 'dangerouslySetInnerHTML' === o
                      ? yr(n, u)
                      : 'children' === o
                      ? br(n, u)
                      : Tt(n, o, u, t);
                  }
                  switch (e) {
                    case 'input':
                      Nt(n, l);
                      break;
                    case 'textarea':
                      dr(n, l);
                      break;
                    case 'select':
                      (t = n._wrapperState.wasMultiple),
                        (n._wrapperState.wasMultiple = !!l.multiple),
                        null != (e = l.value)
                          ? cr(n, !!l.multiple, e, !1)
                          : t !== !!l.multiple &&
                            (null != l.defaultValue
                              ? cr(n, !!l.multiple, l.defaultValue, !0)
                              : cr(n, !!l.multiple, l.multiple ? [] : '', !1));
                  }
                }
              }
              break;
            case 6:
              if (null === t.stateNode) throw r(Error(162));
              t.stateNode.nodeValue = t.memoizedProps;
              break;
            case 3:
            case 12:
              break;
            case 13:
              if (
                ((n = t),
                null === t.memoizedState
                  ? (l = !1)
                  : ((l = !0), (n = t.child), (To = gl())),
                null !== n)
              )
                e: for (e = n; ; ) {
                  if (5 === e.tag)
                    (a = e.stateNode),
                      l
                        ? 'function' == typeof (a = a.style).setProperty
                          ? a.setProperty('display', 'none', 'important')
                          : (a.display = 'none')
                        : ((a = e.stateNode),
                          (i =
                            null != (i = e.memoizedProps.style) &&
                            i.hasOwnProperty('display')
                              ? i.display
                              : null),
                          (a.style.display = Er('display', i)));
                  else if (6 === e.tag)
                    e.stateNode.nodeValue = l ? '' : e.memoizedProps;
                  else {
                    if (13 === e.tag && null !== e.memoizedState) {
                      ((a = e.child.sibling).return = e), (e = a);
                      continue;
                    }
                    if (null !== e.child) {
                      (e.child.return = e), (e = e.child);
                      continue;
                    }
                  }
                  if (e === n) break e;
                  for (; null === e.sibling; ) {
                    if (null === e.return || e.return === n) break e;
                    e = e.return;
                  }
                  (e.sibling.return = e.return), (e = e.sibling);
                }
              Za(t);
              break;
            case 19:
              Za(t);
              break;
            case 17:
            case 20:
              break;
            default:
              throw r(Error(163));
          }
        }
        function Za(e) {
          var t = e.updateQueue;
          if (null !== t) {
            e.updateQueue = null;
            var n = e.stateNode;
            null === n && (n = e.stateNode = new Va()),
              t.forEach(function(t) {
                var r = cu.bind(null, e, t);
                n.has(t) || (n.add(t), t.then(r, r));
              });
          }
        }
        var Ja = 'function' == typeof WeakMap ? WeakMap : Map;
        function eo(e, t, n) {
          ((n = Wl(n, null)).tag = 3), (n.payload = { element: null });
          var r = t.value;
          return (
            (n.callback = function() {
              _o || ((_o = !0), (Po = r)), Ba(e, t);
            }),
            n
          );
        }
        function to(e, t, n) {
          (n = Wl(n, null)).tag = 3;
          var r = e.type.getDerivedStateFromError;
          if ('function' == typeof r) {
            var l = t.value;
            n.payload = function() {
              return Ba(e, t), r(l);
            };
          }
          var i = e.stateNode;
          return (
            null !== i &&
              'function' == typeof i.componentDidCatch &&
              (n.callback = function() {
                'function' != typeof r &&
                  (null === No ? (No = new Set([this])) : No.add(this),
                  Ba(e, t));
                var n = t.stack;
                this.componentDidCatch(t.value, {
                  componentStack: null !== n ? n : '',
                });
              }),
            n
          );
        }
        var no = Math.ceil,
          ro = $e.ReactCurrentDispatcher,
          lo = $e.ReactCurrentOwner,
          io = 0,
          ao = 8,
          oo = 16,
          uo = 32,
          co = 0,
          so = 1,
          fo = 2,
          po = 3,
          ho = 4,
          mo = io,
          go = null,
          vo = null,
          yo = 0,
          bo = co,
          wo = 1073741823,
          ko = 1073741823,
          Eo = null,
          xo = !1,
          To = 0,
          Co = 500,
          So = null,
          _o = !1,
          Po = null,
          No = null,
          zo = !1,
          Mo = null,
          Uo = 90,
          Ro = 0,
          Fo = null,
          Io = 0,
          Do = null,
          Oo = 0;
        function Lo() {
          return (mo & (oo | uo)) !== io
            ? 1073741821 - ((gl() / 10) | 0)
            : 0 !== Oo
            ? Oo
            : (Oo = 1073741821 - ((gl() / 10) | 0));
        }
        function Ao(e, t, n) {
          if (0 == (2 & (t = t.mode))) return 1073741823;
          var l = vl();
          if (0 == (4 & t)) return 99 === l ? 1073741823 : 1073741822;
          if ((mo & oo) !== io) return yo;
          if (null !== n)
            e =
              1073741821 -
              25 *
                (1 +
                  (((1073741821 - e + (0 | n.timeoutMs || 5e3) / 10) / 25) |
                    0));
          else
            switch (l) {
              case 99:
                e = 1073741823;
                break;
              case 98:
                e = 1073741821 - 10 * (1 + (((1073741821 - e + 15) / 10) | 0));
                break;
              case 97:
              case 96:
                e = 1073741821 - 25 * (1 + (((1073741821 - e + 500) / 25) | 0));
                break;
              case 95:
                e = 1;
                break;
              default:
                throw r(Error(326));
            }
          return null !== go && e === yo && --e, e;
        }
        var Wo = 0;
        function Vo(e, t) {
          if (50 < Io) throw ((Io = 0), (Do = null), r(Error(185)));
          if (null !== (e = Bo(e, t))) {
            e.pingTime = 0;
            var n = vl();
            if (1073741823 === t)
              if ((mo & ao) !== io && (mo & (oo | uo)) === io)
                for (var l = Zo(e, 1073741823, !0); null !== l; ) l = l(!0);
              else jo(e, 99, 1073741823), mo === io && El();
            else jo(e, n, t);
            (4 & mo) === io ||
              (98 !== n && 99 !== n) ||
              (null === Fo
                ? (Fo = new Map([[e, t]]))
                : (void 0 === (n = Fo.get(e)) || n > t) && Fo.set(e, t));
          }
        }
        function Bo(e, t) {
          e.expirationTime < t && (e.expirationTime = t);
          var n = e.alternate;
          null !== n && n.expirationTime < t && (n.expirationTime = t);
          var r = e.return,
            l = null;
          if (null === r && 3 === e.tag) l = e.stateNode;
          else
            for (; null !== r; ) {
              if (
                ((n = r.alternate),
                r.childExpirationTime < t && (r.childExpirationTime = t),
                null !== n &&
                  n.childExpirationTime < t &&
                  (n.childExpirationTime = t),
                null === r.return && 3 === r.tag)
              ) {
                l = r.stateNode;
                break;
              }
              r = r.return;
            }
          return (
            null !== l &&
              (t > l.firstPendingTime && (l.firstPendingTime = t),
              0 === (e = l.lastPendingTime) || t < e) &&
              (l.lastPendingTime = t),
            l
          );
        }
        function jo(e, t, n) {
          if (e.callbackExpirationTime < n) {
            var r = e.callbackNode;
            null !== r && r !== sl && el(r),
              (e.callbackExpirationTime = n),
              1073741823 === n
                ? (e.callbackNode = kl(Ho.bind(null, e, Zo.bind(null, e, n))))
                : ((r = null),
                  1 !== n && (r = { timeout: 10 * (1073741821 - n) - gl() }),
                  (e.callbackNode = wl(
                    t,
                    Ho.bind(null, e, Zo.bind(null, e, n)),
                    r
                  )));
          }
        }
        function Ho(e, t, n) {
          var r = e.callbackNode,
            l = null;
          try {
            return null !== (l = t(n)) ? Ho.bind(null, e, l) : null;
          } finally {
            null === l &&
              r === e.callbackNode &&
              ((e.callbackNode = null), (e.callbackExpirationTime = 0));
          }
        }
        function Qo() {
          (mo & (1 | oo | uo)) === io && ($o(), lu());
        }
        function Ko(e, t) {
          var n = e.firstBatch;
          return (
            !!(null !== n && n._defer && n._expirationTime >= t) &&
            (wl(97, function() {
              return n._onComplete(), null;
            }),
            !0)
          );
        }
        function $o() {
          if (null !== Fo) {
            var e = Fo;
            (Fo = null),
              e.forEach(function(e, t) {
                kl(Zo.bind(null, t, e));
              }),
              El();
          }
        }
        function qo(e, t) {
          var n = mo;
          mo |= 1;
          try {
            return e(t);
          } finally {
            (mo = n) === io && El();
          }
        }
        function Yo(e, t, n, r) {
          var l = mo;
          mo |= 4;
          try {
            return bl(98, e.bind(null, t, n, r));
          } finally {
            (mo = l) === io && El();
          }
        }
        function Xo(e, t) {
          var n = mo;
          (mo &= -2), (mo |= ao);
          try {
            return e(t);
          } finally {
            (mo = n) === io && El();
          }
        }
        function Go(e, t) {
          (e.finishedWork = null), (e.finishedExpirationTime = 0);
          var n = e.timeoutHandle;
          if ((-1 !== n && ((e.timeoutHandle = -1), Fr(n)), null !== vo))
            for (n = vo.return; null !== n; ) {
              var r = n;
              switch (r.tag) {
                case 1:
                  var l = r.type.childContextTypes;
                  null != l && Kr(r);
                  break;
                case 3:
                  mi(r), $r(r);
                  break;
                case 5:
                  vi(r);
                  break;
                case 4:
                  mi(r);
                  break;
                case 13:
                case 19:
                  Lr(ki, r);
                  break;
                case 10:
                  Rl(r);
              }
              n = n.return;
            }
          (go = e),
            (vo = yu(e.current, null, t)),
            (yo = t),
            (bo = co),
            (ko = wo = 1073741823),
            (Eo = null),
            (xo = !1);
        }
        function Zo(e, t, n) {
          if ((mo & (oo | uo)) !== io) throw r(Error(327));
          if (e.firstPendingTime < t) return null;
          if (n && e.finishedExpirationTime === t) return nu.bind(null, e);
          if ((lu(), e !== go || t !== yo)) Go(e, t);
          else if (bo === po)
            if (xo) Go(e, t);
            else {
              var l = e.lastPendingTime;
              if (l < t) return Zo.bind(null, e, l);
            }
          if (null !== vo) {
            (l = mo), (mo |= oo);
            var i = ro.current;
            if ((null === i && (i = ia), (ro.current = ia), n)) {
              if (1073741823 !== t) {
                var a = Lo();
                if (a < t)
                  return (mo = l), Ml(), (ro.current = i), Zo.bind(null, e, a);
              }
            } else Oo = 0;
            for (;;)
              try {
                if (n) for (; null !== vo; ) vo = eu(vo);
                else for (; null !== vo && !tl(); ) vo = eu(vo);
                break;
              } catch (m) {
                if ((Ml(), qi(), null === (a = vo) || null === a.return))
                  throw (Go(e, t), (mo = l), m);
                e: {
                  var o = e,
                    u = a.return,
                    c = a,
                    s = m,
                    f = yo;
                  if (
                    ((c.effectTag |= 1024),
                    (c.firstEffect = c.lastEffect = null),
                    null !== s &&
                      'object' == typeof s &&
                      'function' == typeof s.then)
                  ) {
                    var d = s,
                      p = 0 != (ki.current & bi);
                    s = u;
                    do {
                      var h;
                      if (
                        ((h = 13 === s.tag) &&
                          (null !== s.memoizedState
                            ? (h = !1)
                            : (h =
                                void 0 !== (h = s.memoizedProps).fallback &&
                                (!0 !== h.unstable_avoidThisFallback || !p))),
                        h)
                      ) {
                        if (
                          (null === (u = s.updateQueue)
                            ? ((u = new Set()).add(d), (s.updateQueue = u))
                            : u.add(d),
                          0 == (2 & s.mode))
                        ) {
                          (s.effectTag |= 64),
                            (c.effectTag &= -1957),
                            1 === c.tag &&
                              (null === c.alternate
                                ? (c.tag = 17)
                                : (((f = Wl(1073741823, null)).tag = 2),
                                  Bl(c, f))),
                            (c.expirationTime = 1073741823);
                          break e;
                        }
                        (c = o),
                          (o = f),
                          null === (p = c.pingCache)
                            ? ((p = c.pingCache = new Ja()),
                              (u = new Set()),
                              p.set(d, u))
                            : void 0 === (u = p.get(d)) &&
                              ((u = new Set()), p.set(d, u)),
                          u.has(o) ||
                            (u.add(o),
                            (c = uu.bind(null, c, d, o)),
                            d.then(c, c)),
                          (s.effectTag |= 2048),
                          (s.expirationTime = f);
                        break e;
                      }
                      s = s.return;
                    } while (null !== s);
                    s = Error(
                      (ft(c.type) || 'A React component') +
                        ' suspended while rendering, but no fallback UI was specified.\n\nAdd a <Suspense fallback=...> component higher in the tree to provide a loading indicator or placeholder to display.' +
                        dt(c)
                    );
                  }
                  bo !== ho && (bo = so), (s = Wa(s, c)), (c = u);
                  do {
                    switch (c.tag) {
                      case 3:
                        (c.effectTag |= 2048),
                          (c.expirationTime = f),
                          jl(c, (f = eo(c, s, f)));
                        break e;
                      case 1:
                        if (
                          ((d = s),
                          (o = c.type),
                          (u = c.stateNode),
                          0 == (64 & c.effectTag) &&
                            ('function' == typeof o.getDerivedStateFromError ||
                              (null !== u &&
                                'function' == typeof u.componentDidCatch &&
                                (null === No || !No.has(u)))))
                        ) {
                          (c.effectTag |= 2048),
                            (c.expirationTime = f),
                            jl(c, (f = to(c, d, f)));
                          break e;
                        }
                    }
                    c = c.return;
                  } while (null !== c);
                }
                vo = tu(a);
              }
            if (((mo = l), Ml(), (ro.current = i), null !== vo))
              return Zo.bind(null, e, t);
          }
          if (
            ((e.finishedWork = e.current.alternate),
            (e.finishedExpirationTime = t),
            Ko(e, t))
          )
            return null;
          switch (((go = null), bo)) {
            case co:
              throw r(Error(328));
            case so:
              return (l = e.lastPendingTime) < t
                ? Zo.bind(null, e, l)
                : n
                ? nu.bind(null, e)
                : (Go(e, t), kl(Zo.bind(null, e, t)), null);
            case fo:
              return 1073741823 === wo && !n && 10 < (n = To + Co - gl())
                ? xo
                  ? (Go(e, t), Zo.bind(null, e, t))
                  : (l = e.lastPendingTime) < t
                  ? Zo.bind(null, e, l)
                  : ((e.timeoutHandle = Rr(nu.bind(null, e), n)), null)
                : nu.bind(null, e);
            case po:
              if (!n) {
                if (xo) return Go(e, t), Zo.bind(null, e, t);
                if ((n = e.lastPendingTime) < t) return Zo.bind(null, e, n);
                if (
                  (1073741823 !== ko
                    ? (n = 10 * (1073741821 - ko) - gl())
                    : 1073741823 === wo
                    ? (n = 0)
                    : ((n = 10 * (1073741821 - wo) - 5e3),
                      0 > (n = (l = gl()) - n) && (n = 0),
                      (t = 10 * (1073741821 - t) - l) <
                        (n =
                          (120 > n
                            ? 120
                            : 480 > n
                            ? 480
                            : 1080 > n
                            ? 1080
                            : 1920 > n
                            ? 1920
                            : 3e3 > n
                            ? 3e3
                            : 4320 > n
                            ? 4320
                            : 1960 * no(n / 1960)) - n) && (n = t)),
                  10 < n)
                )
                  return (e.timeoutHandle = Rr(nu.bind(null, e), n)), null;
              }
              return nu.bind(null, e);
            case ho:
              return !n &&
                1073741823 !== wo &&
                null !== Eo &&
                ((l = wo),
                0 >= (t = 0 | (i = Eo).busyMinDurationMs)
                  ? (t = 0)
                  : ((n = 0 | i.busyDelayMs),
                    (t =
                      (l =
                        gl() -
                        (10 * (1073741821 - l) - (0 | i.timeoutMs || 5e3))) <= n
                        ? 0
                        : n + t - l)),
                10 < t)
                ? ((e.timeoutHandle = Rr(nu.bind(null, e), t)), null)
                : nu.bind(null, e);
            default:
              throw r(Error(329));
          }
        }
        function Jo(e, t) {
          e < wo && 1 < e && (wo = e),
            null !== t && e < ko && 1 < e && ((ko = e), (Eo = t));
        }
        function eu(e) {
          var t = su(e.alternate, e, yo);
          return (
            (e.memoizedProps = e.pendingProps),
            null === t && (t = tu(e)),
            (lo.current = null),
            t
          );
        }
        function tu(e) {
          vo = e;
          do {
            var n = vo.alternate;
            if (((e = vo.return), 0 == (1024 & vo.effectTag))) {
              e: {
                var l = n,
                  i = yo,
                  a = (n = vo).pendingProps;
                switch (n.tag) {
                  case 2:
                  case 16:
                    break;
                  case 15:
                  case 0:
                    break;
                  case 1:
                    Qr(n.type) && Kr(n);
                    break;
                  case 3:
                    mi(n),
                      $r(n),
                      (i = n.stateNode).pendingContext &&
                        ((i.context = i.pendingContext),
                        (i.pendingContext = null)),
                      (null !== l && null !== l.child) ||
                        (ma(n), (n.effectTag &= -3)),
                      Ia(n);
                    break;
                  case 5:
                    vi(n), (i = pi(di.current));
                    var o = n.type;
                    if (null !== l && null != n.stateNode)
                      Da(l, n, o, a, i),
                        l.ref !== n.ref && (n.effectTag |= 128);
                    else if (a) {
                      var u = pi(si.current);
                      if (ma(n)) {
                        (a = void 0), (o = (l = n).stateNode);
                        var c = l.type,
                          f = l.memoizedProps;
                        switch (((o[U] = l), (o[R] = f), c)) {
                          case 'iframe':
                          case 'object':
                          case 'embed':
                            Wn('load', o);
                            break;
                          case 'video':
                          case 'audio':
                            for (var d = 0; d < ee.length; d++) Wn(ee[d], o);
                            break;
                          case 'source':
                            Wn('error', o);
                            break;
                          case 'img':
                          case 'image':
                          case 'link':
                            Wn('error', o), Wn('load', o);
                            break;
                          case 'form':
                            Wn('reset', o), Wn('submit', o);
                            break;
                          case 'details':
                            Wn('toggle', o);
                            break;
                          case 'input':
                            _t(o, f), Wn('invalid', o), _r(i, 'onChange');
                            break;
                          case 'select':
                            (o._wrapperState = { wasMultiple: !!f.multiple }),
                              Wn('invalid', o),
                              _r(i, 'onChange');
                            break;
                          case 'textarea':
                            fr(o, f), Wn('invalid', o), _r(i, 'onChange');
                        }
                        for (a in (Cr(c, f), (d = null), f))
                          f.hasOwnProperty(a) &&
                            ((u = f[a]),
                            'children' === a
                              ? 'string' == typeof u
                                ? o.textContent !== u && (d = ['children', u])
                                : 'number' == typeof u &&
                                  o.textContent !== '' + u &&
                                  (d = ['children', '' + u])
                              : s.hasOwnProperty(a) && null != u && _r(i, a));
                        switch (c) {
                          case 'input':
                            Qe(o), zt(o, f, !0);
                            break;
                          case 'textarea':
                            Qe(o), pr(o, f);
                            break;
                          case 'select':
                          case 'option':
                            break;
                          default:
                            'function' == typeof f.onClick && (o.onclick = Pr);
                        }
                        (i = d), (l.updateQueue = i), null !== i && Ra(n);
                      } else {
                        (f = o),
                          (l = a),
                          (c = n),
                          (d = 9 === i.nodeType ? i : i.ownerDocument),
                          u === hr.html && (u = mr(f)),
                          u === hr.html
                            ? 'script' === f
                              ? (((f = d.createElement('div')).innerHTML =
                                  '<script></script>'),
                                (d = f.removeChild(f.firstChild)))
                              : 'string' == typeof l.is
                              ? (d = d.createElement(f, { is: l.is }))
                              : ((d = d.createElement(f)),
                                'select' === f &&
                                  ((f = d),
                                  l.multiple
                                    ? (f.multiple = !0)
                                    : l.size && (f.size = l.size)))
                            : (d = d.createElementNS(u, f)),
                          ((f = d)[U] = c),
                          (f[R] = l),
                          Fa((l = f), n, !1, !1),
                          (c = l);
                        var p = i,
                          h = Sr(o, a);
                        switch (o) {
                          case 'iframe':
                          case 'object':
                          case 'embed':
                            Wn('load', c), (i = a);
                            break;
                          case 'video':
                          case 'audio':
                            for (i = 0; i < ee.length; i++) Wn(ee[i], c);
                            i = a;
                            break;
                          case 'source':
                            Wn('error', c), (i = a);
                            break;
                          case 'img':
                          case 'image':
                          case 'link':
                            Wn('error', c), Wn('load', c), (i = a);
                            break;
                          case 'form':
                            Wn('reset', c), Wn('submit', c), (i = a);
                            break;
                          case 'details':
                            Wn('toggle', c), (i = a);
                            break;
                          case 'input':
                            _t(c, a),
                              (i = St(c, a)),
                              Wn('invalid', c),
                              _r(p, 'onChange');
                            break;
                          case 'option':
                            i = ur(c, a);
                            break;
                          case 'select':
                            (c._wrapperState = { wasMultiple: !!a.multiple }),
                              (i = t({}, a, { value: void 0 })),
                              Wn('invalid', c),
                              _r(p, 'onChange');
                            break;
                          case 'textarea':
                            fr(c, a),
                              (i = sr(c, a)),
                              Wn('invalid', c),
                              _r(p, 'onChange');
                            break;
                          default:
                            i = a;
                        }
                        Cr(o, i), (f = void 0), (d = o), (u = c);
                        var m = i;
                        for (f in m)
                          if (m.hasOwnProperty(f)) {
                            var g = m[f];
                            'style' === f
                              ? xr(u, g)
                              : 'dangerouslySetInnerHTML' === f
                              ? null != (g = g ? g.__html : void 0) && yr(u, g)
                              : 'children' === f
                              ? 'string' == typeof g
                                ? ('textarea' !== d || '' !== g) && br(u, g)
                                : 'number' == typeof g && br(u, '' + g)
                              : 'suppressContentEditableWarning' !== f &&
                                'suppressHydrationWarning' !== f &&
                                'autoFocus' !== f &&
                                (s.hasOwnProperty(f)
                                  ? null != g && _r(p, f)
                                  : null != g && Tt(u, f, g, h));
                          }
                        switch (o) {
                          case 'input':
                            Qe(c), zt(c, a, !1);
                            break;
                          case 'textarea':
                            Qe(c), pr(c, a);
                            break;
                          case 'option':
                            null != a.value &&
                              c.setAttribute('value', '' + Ct(a.value));
                            break;
                          case 'select':
                            (i = c),
                              (c = a),
                              (i.multiple = !!c.multiple),
                              null != (f = c.value)
                                ? cr(i, !!c.multiple, f, !1)
                                : null != c.defaultValue &&
                                  cr(i, !!c.multiple, c.defaultValue, !0);
                            break;
                          default:
                            'function' == typeof i.onClick && (c.onclick = Pr);
                        }
                        Mr(o, a) && Ra(n), (n.stateNode = l);
                      }
                      null !== n.ref && (n.effectTag |= 128);
                    } else if (null === n.stateNode) throw r(Error(166));
                    break;
                  case 6:
                    if (l && null != n.stateNode) Oa(l, n, l.memoizedProps, a);
                    else {
                      if ('string' != typeof a && null === n.stateNode)
                        throw r(Error(166));
                      (l = pi(di.current)),
                        pi(si.current),
                        ma(n)
                          ? ((i = n.stateNode),
                            (l = n.memoizedProps),
                            (i[U] = n),
                            i.nodeValue !== l && Ra(n))
                          : ((i = n),
                            ((l = (9 === l.nodeType
                              ? l
                              : l.ownerDocument
                            ).createTextNode(a))[U] = n),
                            (i.stateNode = l));
                    }
                    break;
                  case 11:
                    break;
                  case 13:
                    if (
                      (Lr(ki, n),
                      (a = n.memoizedState),
                      0 != (64 & n.effectTag))
                    ) {
                      n.expirationTime = i;
                      break e;
                    }
                    (i = null !== a),
                      (a = !1),
                      null === l
                        ? ma(n)
                        : ((a = null !== (o = l.memoizedState)),
                          i ||
                            null === o ||
                            (null !== (o = l.child.sibling) &&
                              (null !== (c = n.firstEffect)
                                ? ((n.firstEffect = o), (o.nextEffect = c))
                                : ((n.firstEffect = n.lastEffect = o),
                                  (o.nextEffect = null)),
                              (o.effectTag = 8)))),
                      i &&
                        !a &&
                        0 != (2 & n.mode) &&
                        ((null === l &&
                          !0 !== n.memoizedProps.unstable_avoidThisFallback) ||
                        0 != (ki.current & bi)
                          ? bo === co && (bo = fo)
                          : (bo !== co && bo !== fo) || (bo = po)),
                      (i || a) && (n.effectTag |= 4);
                    break;
                  case 7:
                  case 8:
                  case 12:
                    break;
                  case 4:
                    mi(n), Ia(n);
                    break;
                  case 10:
                    Rl(n);
                    break;
                  case 9:
                  case 14:
                    break;
                  case 17:
                    Qr(n.type) && Kr(n);
                    break;
                  case 18:
                    break;
                  case 19:
                    if ((Lr(ki, n), null === (a = n.memoizedState))) break;
                    if (
                      ((o = 0 != (64 & n.effectTag)),
                      null === (c = a.rendering))
                    ) {
                      if (o) La(a, !1);
                      else if (
                        bo !== co ||
                        (null !== l && 0 != (64 & l.effectTag))
                      )
                        for (l = n.child; null !== l; ) {
                          if (null !== (c = Ei(l))) {
                            for (
                              n.effectTag |= 64,
                                La(a, !1),
                                null !== (l = c.updateQueue) &&
                                  ((n.updateQueue = l), (n.effectTag |= 4)),
                                n.firstEffect = n.lastEffect = null,
                                l = n.child;
                              null !== l;

                            )
                              (o = i),
                                ((a = l).effectTag &= 2),
                                (a.nextEffect = null),
                                (a.firstEffect = null),
                                (a.lastEffect = null),
                                null === (c = a.alternate)
                                  ? ((a.childExpirationTime = 0),
                                    (a.expirationTime = o),
                                    (a.child = null),
                                    (a.memoizedProps = null),
                                    (a.memoizedState = null),
                                    (a.updateQueue = null),
                                    (a.dependencies = null))
                                  : ((a.childExpirationTime =
                                      c.childExpirationTime),
                                    (a.expirationTime = c.expirationTime),
                                    (a.child = c.child),
                                    (a.memoizedProps = c.memoizedProps),
                                    (a.memoizedState = c.memoizedState),
                                    (a.updateQueue = c.updateQueue),
                                    (o = c.dependencies),
                                    (a.dependencies =
                                      null === o
                                        ? null
                                        : {
                                            expirationTime: o.expirationTime,
                                            firstContext: o.firstContext,
                                            responders: o.responders,
                                          })),
                                (l = l.sibling);
                            Ar(ki, (ki.current & yi) | wi, n), (n = n.child);
                            break e;
                          }
                          l = l.sibling;
                        }
                    } else {
                      if (!o)
                        if (null !== (l = Ei(c))) {
                          if (
                            ((n.effectTag |= 64),
                            (o = !0),
                            La(a, !0),
                            null === a.tail && 'hidden' === a.tailMode)
                          ) {
                            null !== (i = l.updateQueue) &&
                              ((n.updateQueue = i), (n.effectTag |= 4)),
                              null !== (n = n.lastEffect = a.lastEffect) &&
                                (n.nextEffect = null);
                            break;
                          }
                        } else
                          gl() > a.tailExpiration &&
                            1 < i &&
                            ((n.effectTag |= 64),
                            (o = !0),
                            La(a, !1),
                            (n.expirationTime = n.childExpirationTime = i - 1));
                      a.isBackwards
                        ? ((c.sibling = n.child), (n.child = c))
                        : (null !== (i = a.last)
                            ? (i.sibling = c)
                            : (n.child = c),
                          (a.last = c));
                    }
                    if (null !== a.tail) {
                      0 === a.tailExpiration && (a.tailExpiration = gl() + 500),
                        (i = a.tail),
                        (a.rendering = i),
                        (a.tail = i.sibling),
                        (a.lastEffect = n.lastEffect),
                        (i.sibling = null),
                        (l = ki.current),
                        Ar(ki, (l = o ? (l & yi) | wi : l & yi), n),
                        (n = i);
                      break e;
                    }
                    break;
                  case 20:
                    break;
                  default:
                    throw r(Error(156));
                }
                n = null;
              }
              if (((i = vo), 1 === yo || 1 !== i.childExpirationTime)) {
                for (l = 0, a = i.child; null !== a; )
                  (o = a.expirationTime) > l && (l = o),
                    (c = a.childExpirationTime) > l && (l = c),
                    (a = a.sibling);
                i.childExpirationTime = l;
              }
              if (null !== n) return n;
              null !== e &&
                0 == (1024 & e.effectTag) &&
                (null === e.firstEffect && (e.firstEffect = vo.firstEffect),
                null !== vo.lastEffect &&
                  (null !== e.lastEffect &&
                    (e.lastEffect.nextEffect = vo.firstEffect),
                  (e.lastEffect = vo.lastEffect)),
                1 < vo.effectTag &&
                  (null !== e.lastEffect
                    ? (e.lastEffect.nextEffect = vo)
                    : (e.firstEffect = vo),
                  (e.lastEffect = vo)));
            } else {
              if (null !== (n = Aa(vo, yo))) return (n.effectTag &= 1023), n;
              null !== e &&
                ((e.firstEffect = e.lastEffect = null), (e.effectTag |= 1024));
            }
            if (null !== (n = vo.sibling)) return n;
            vo = e;
          } while (null !== vo);
          return bo === co && (bo = ho), null;
        }
        function nu(e) {
          var t = vl();
          return (
            bl(99, ru.bind(null, e, t)),
            null !== Mo &&
              wl(97, function() {
                return lu(), null;
              }),
            null
          );
        }
        function ru(e, t) {
          if ((lu(), (mo & (oo | uo)) !== io)) throw r(Error(327));
          var n = e.finishedWork,
            l = e.finishedExpirationTime;
          if (null === n) return null;
          if (
            ((e.finishedWork = null),
            (e.finishedExpirationTime = 0),
            n === e.current)
          )
            throw r(Error(177));
          (e.callbackNode = null), (e.callbackExpirationTime = 0);
          var i = n.expirationTime,
            a = n.childExpirationTime;
          if (
            ((i = a > i ? a : i),
            (e.firstPendingTime = i),
            i < e.lastPendingTime && (e.lastPendingTime = i),
            e === go && ((vo = go = null), (yo = 0)),
            1 < n.effectTag
              ? null !== n.lastEffect
                ? ((n.lastEffect.nextEffect = n), (i = n.firstEffect))
                : (i = n)
              : (i = n.firstEffect),
            null !== i)
          ) {
            (a = mo), (mo |= uo), (lo.current = null), (Nr = An);
            var o = Gn();
            if (Zn(o)) {
              if ('selectionStart' in o)
                var u = { start: o.selectionStart, end: o.selectionEnd };
              else
                e: {
                  var c =
                    (u = ((u = o.ownerDocument) && u.defaultView) || window)
                      .getSelection && u.getSelection();
                  if (c && 0 !== c.rangeCount) {
                    u = c.anchorNode;
                    var s = c.anchorOffset,
                      f = c.focusNode;
                    c = c.focusOffset;
                    try {
                      u.nodeType, f.nodeType;
                    } catch (A) {
                      u = null;
                      break e;
                    }
                    var d = 0,
                      p = -1,
                      h = -1,
                      m = 0,
                      g = 0,
                      v = o,
                      y = null;
                    t: for (;;) {
                      for (
                        var b;
                        v !== u || (0 !== s && 3 !== v.nodeType) || (p = d + s),
                          v !== f ||
                            (0 !== c && 3 !== v.nodeType) ||
                            (h = d + c),
                          3 === v.nodeType && (d += v.nodeValue.length),
                          null !== (b = v.firstChild);

                      )
                        (y = v), (v = b);
                      for (;;) {
                        if (v === o) break t;
                        if (
                          (y === u && ++m === s && (p = d),
                          y === f && ++g === c && (h = d),
                          null !== (b = v.nextSibling))
                        )
                          break;
                        y = (v = y).parentNode;
                      }
                      v = b;
                    }
                    u = -1 === p || -1 === h ? null : { start: p, end: h };
                  } else u = null;
                }
              u = u || { start: 0, end: 0 };
            } else u = null;
            (zr = { focusedElem: o, selectionRange: u }), (An = !1), (So = i);
            do {
              try {
                for (; null !== So; ) {
                  if (0 != (256 & So.effectTag)) {
                    var w = So.alternate;
                    switch ((o = So).tag) {
                      case 0:
                      case 11:
                      case 15:
                        Qa(Ti, xi, o);
                        break;
                      case 1:
                        if (256 & o.effectTag && null !== w) {
                          var k = w.memoizedProps,
                            E = w.memoizedState,
                            x = o.stateNode,
                            T = x.getSnapshotBeforeUpdate(
                              o.elementType === o.type ? k : Cl(o.type, k),
                              E
                            );
                          x.__reactInternalSnapshotBeforeUpdate = T;
                        }
                        break;
                      case 3:
                      case 5:
                      case 6:
                      case 4:
                      case 17:
                        break;
                      default:
                        throw r(Error(163));
                    }
                  }
                  So = So.nextEffect;
                }
              } catch (A) {
                if (null === So) throw r(Error(330));
                ou(So, A), (So = So.nextEffect);
              }
            } while (null !== So);
            So = i;
            do {
              try {
                for (w = t; null !== So; ) {
                  var C = So.effectTag;
                  if ((16 & C && br(So.stateNode, ''), 128 & C)) {
                    var S = So.alternate;
                    if (null !== S) {
                      var _ = S.ref;
                      null !== _ &&
                        ('function' == typeof _ ? _(null) : (_.current = null));
                    }
                  }
                  switch (14 & C) {
                    case 2:
                      Ya(So), (So.effectTag &= -3);
                      break;
                    case 6:
                      Ya(So), (So.effectTag &= -3), Ga(So.alternate, So);
                      break;
                    case 4:
                      Ga(So.alternate, So);
                      break;
                    case 8:
                      Xa((k = So), w),
                        (k.return = null),
                        (k.child = null),
                        (k.memoizedState = null),
                        (k.updateQueue = null),
                        (k.dependencies = null);
                      var P = k.alternate;
                      null !== P &&
                        ((P.return = null),
                        (P.child = null),
                        (P.memoizedState = null),
                        (P.updateQueue = null),
                        (P.dependencies = null));
                  }
                  So = So.nextEffect;
                }
              } catch (A) {
                if (null === So) throw r(Error(330));
                ou(So, A), (So = So.nextEffect);
              }
            } while (null !== So);
            if (
              ((_ = zr),
              (S = Gn()),
              (C = _.focusedElem),
              (w = _.selectionRange),
              S !== C &&
                C &&
                C.ownerDocument &&
                Xn(C.ownerDocument.documentElement, C))
            ) {
              null !== w &&
                Zn(C) &&
                ((S = w.start),
                void 0 === (_ = w.end) && (_ = S),
                'selectionStart' in C
                  ? ((C.selectionStart = S),
                    (C.selectionEnd = Math.min(_, C.value.length)))
                  : (_ =
                      ((S = C.ownerDocument || document) && S.defaultView) ||
                      window).getSelection &&
                    ((_ = _.getSelection()),
                    (k = C.textContent.length),
                    (P = Math.min(w.start, k)),
                    (w = void 0 === w.end ? P : Math.min(w.end, k)),
                    !_.extend && P > w && ((k = w), (w = P), (P = k)),
                    (k = Yn(C, P)),
                    (E = Yn(C, w)),
                    k &&
                      E &&
                      (1 !== _.rangeCount ||
                        _.anchorNode !== k.node ||
                        _.anchorOffset !== k.offset ||
                        _.focusNode !== E.node ||
                        _.focusOffset !== E.offset) &&
                      ((S = S.createRange()).setStart(k.node, k.offset),
                      _.removeAllRanges(),
                      P > w
                        ? (_.addRange(S), _.extend(E.node, E.offset))
                        : (S.setEnd(E.node, E.offset), _.addRange(S))))),
                (S = []);
              for (_ = C; (_ = _.parentNode); )
                1 === _.nodeType &&
                  S.push({ element: _, left: _.scrollLeft, top: _.scrollTop });
              for (
                'function' == typeof C.focus && C.focus(), C = 0;
                C < S.length;
                C++
              )
                ((_ = S[C]).element.scrollLeft = _.left),
                  (_.element.scrollTop = _.top);
            }
            (zr = null), (An = !!Nr), (Nr = null), (e.current = n), (So = i);
            do {
              try {
                for (C = l; null !== So; ) {
                  var N = So.effectTag;
                  if (36 & N) {
                    var z = So.alternate;
                    switch (((_ = C), (S = So).tag)) {
                      case 0:
                      case 11:
                      case 15:
                        Qa(_i, Pi, S);
                        break;
                      case 1:
                        var M = S.stateNode;
                        if (4 & S.effectTag)
                          if (null === z) M.componentDidMount();
                          else {
                            var U =
                              S.elementType === S.type
                                ? z.memoizedProps
                                : Cl(S.type, z.memoizedProps);
                            M.componentDidUpdate(
                              U,
                              z.memoizedState,
                              M.__reactInternalSnapshotBeforeUpdate
                            );
                          }
                        var R = S.updateQueue;
                        null !== R && $l(S, R, M, _);
                        break;
                      case 3:
                        var F = S.updateQueue;
                        if (null !== F) {
                          if (((P = null), null !== S.child))
                            switch (S.child.tag) {
                              case 5:
                                P = S.child.stateNode;
                                break;
                              case 1:
                                P = S.child.stateNode;
                            }
                          $l(S, F, P, _);
                        }
                        break;
                      case 5:
                        var I = S.stateNode;
                        null === z &&
                          4 & S.effectTag &&
                          ((_ = I), Mr(S.type, S.memoizedProps) && _.focus());
                        break;
                      case 6:
                      case 4:
                      case 12:
                        break;
                      case 13:
                      case 19:
                      case 17:
                      case 20:
                        break;
                      default:
                        throw r(Error(163));
                    }
                  }
                  if (128 & N) {
                    var D = So.ref;
                    if (null !== D) {
                      var O = So.stateNode;
                      switch (So.tag) {
                        case 5:
                          var L = O;
                          break;
                        default:
                          L = O;
                      }
                      'function' == typeof D ? D(L) : (D.current = L);
                    }
                  }
                  512 & N && (zo = !0), (So = So.nextEffect);
                }
              } catch (A) {
                if (null === So) throw r(Error(330));
                ou(So, A), (So = So.nextEffect);
              }
            } while (null !== So);
            (So = null), fl(), (mo = a);
          } else e.current = n;
          if (zo) (zo = !1), (Mo = e), (Ro = l), (Uo = t);
          else
            for (So = i; null !== So; )
              (t = So.nextEffect), (So.nextEffect = null), (So = t);
          if (
            (0 !== (t = e.firstPendingTime)
              ? jo(e, (N = Tl((N = Lo()), t)), t)
              : (No = null),
            'function' == typeof fu && fu(n.stateNode, l),
            1073741823 === t
              ? e === Do
                ? Io++
                : ((Io = 0), (Do = e))
              : (Io = 0),
            _o)
          )
            throw ((_o = !1), (e = Po), (Po = null), e);
          return (mo & ao) !== io ? null : (El(), null);
        }
        function lu() {
          if (null === Mo) return !1;
          var e = Mo,
            t = Ro,
            n = Uo;
          return (
            (Mo = null),
            (Ro = 0),
            (Uo = 90),
            bl(97 < n ? 97 : n, iu.bind(null, e, t))
          );
        }
        function iu(e) {
          if ((mo & (oo | uo)) !== io) throw r(Error(331));
          var t = mo;
          for (mo |= uo, e = e.current.firstEffect; null !== e; ) {
            try {
              var n = e;
              if (0 != (512 & n.effectTag))
                switch (n.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Qa(zi, xi, n), Qa(xi, Ni, n);
                }
            } catch (l) {
              if (null === e) throw r(Error(330));
              ou(e, l);
            }
            (n = e.nextEffect), (e.nextEffect = null), (e = n);
          }
          return (mo = t), El(), !0;
        }
        function au(e, t, n) {
          Bl(e, (t = eo(e, (t = Wa(n, t)), 1073741823))),
            null !== (e = Bo(e, 1073741823)) && jo(e, 99, 1073741823);
        }
        function ou(e, t) {
          if (3 === e.tag) au(e, e, t);
          else
            for (var n = e.return; null !== n; ) {
              if (3 === n.tag) {
                au(n, e, t);
                break;
              }
              if (1 === n.tag) {
                var r = n.stateNode;
                if (
                  'function' == typeof n.type.getDerivedStateFromError ||
                  ('function' == typeof r.componentDidCatch &&
                    (null === No || !No.has(r)))
                ) {
                  Bl(n, (e = to(n, (e = Wa(t, e)), 1073741823))),
                    null !== (n = Bo(n, 1073741823)) && jo(n, 99, 1073741823);
                  break;
                }
              }
              n = n.return;
            }
        }
        function uu(e, t, n) {
          var r = e.pingCache;
          null !== r && r.delete(t),
            go === e && yo === n
              ? bo === po || (bo === fo && 1073741823 === wo && gl() - To < Co)
                ? Go(e, yo)
                : (xo = !0)
              : e.lastPendingTime < n ||
                ((0 !== (t = e.pingTime) && t < n) ||
                  ((e.pingTime = n),
                  e.finishedExpirationTime === n &&
                    ((e.finishedExpirationTime = 0), (e.finishedWork = null)),
                  jo(e, (t = Tl((t = Lo()), n)), n)));
        }
        function cu(e, t) {
          var n = e.stateNode;
          null !== n && n.delete(t),
            (n = Tl((n = Lo()), (t = Ao(n, e, null)))),
            null !== (e = Bo(e, t)) && jo(e, n, t);
        }
        var su = void 0;
        su = function(e, t, n) {
          var l = t.expirationTime;
          if (null !== e) {
            var i = t.pendingProps;
            if (e.memoizedProps !== i || Br.current) ya = !0;
            else if (l < n) {
              switch (((ya = !1), t.tag)) {
                case 3:
                  _a(t), ga();
                  break;
                case 5:
                  if ((gi(t), 4 & t.mode && 1 !== n && i.hidden))
                    return (t.expirationTime = t.childExpirationTime = 1), null;
                  break;
                case 1:
                  Qr(t.type) && Xr(t);
                  break;
                case 4:
                  hi(t, t.stateNode.containerInfo);
                  break;
                case 10:
                  Ul(t, t.memoizedProps.value);
                  break;
                case 13:
                  if (null !== t.memoizedState)
                    return 0 !== (l = t.child.childExpirationTime) && l >= n
                      ? Na(e, t, n)
                      : (Ar(ki, ki.current & yi, t),
                        null !== (t = Ua(e, t, n)) ? t.sibling : null);
                  Ar(ki, ki.current & yi, t);
                  break;
                case 19:
                  if (
                    ((l = t.childExpirationTime >= n), 0 != (64 & e.effectTag))
                  ) {
                    if (l) return Ma(e, t, n);
                    t.effectTag |= 64;
                  }
                  if (
                    (null !== (i = t.memoizedState) &&
                      ((i.rendering = null), (i.tail = null)),
                    Ar(ki, ki.current, t),
                    !l)
                  )
                    return null;
              }
              return Ua(e, t, n);
            }
          } else ya = !1;
          switch (((t.expirationTime = 0), t.tag)) {
            case 2:
              if (
                ((l = t.type),
                null !== e &&
                  ((e.alternate = null),
                  (t.alternate = null),
                  (t.effectTag |= 2)),
                (e = t.pendingProps),
                (i = Hr(t, Vr.current)),
                Il(t, n),
                (i = $i(null, t, l, e, i, n)),
                (t.effectTag |= 1),
                'object' == typeof i &&
                  null !== i &&
                  'function' == typeof i.render &&
                  void 0 === i.$$typeof)
              ) {
                if (((t.tag = 1), qi(), Qr(l))) {
                  var a = !0;
                  Xr(t);
                } else a = !1;
                t.memoizedState =
                  null !== i.state && void 0 !== i.state ? i.state : null;
                var o = l.getDerivedStateFromProps;
                'function' == typeof o && Gl(t, l, o, e),
                  (i.updater = Zl),
                  (t.stateNode = i),
                  (i._reactInternalFiber = t),
                  ni(t, l, e, n),
                  (t = Sa(null, t, l, !0, a, n));
              } else (t.tag = 0), ba(null, t, i, n), (t = t.child);
              return t;
            case 16:
              switch (
                ((i = t.elementType),
                null !== e &&
                  ((e.alternate = null),
                  (t.alternate = null),
                  (t.effectTag |= 2)),
                (e = t.pendingProps),
                (i = Sl(i)),
                (t.type = i),
                (a = t.tag = vu(i)),
                (e = Cl(i, e)),
                a)
              ) {
                case 0:
                  t = Ta(null, t, i, e, n);
                  break;
                case 1:
                  t = Ca(null, t, i, e, n);
                  break;
                case 11:
                  t = wa(null, t, i, e, n);
                  break;
                case 14:
                  t = ka(null, t, i, Cl(i.type, e), l, n);
                  break;
                default:
                  throw r(Error(306), i, '');
              }
              return t;
            case 0:
              return (
                (l = t.type),
                (i = t.pendingProps),
                Ta(e, t, l, (i = t.elementType === l ? i : Cl(l, i)), n)
              );
            case 1:
              return (
                (l = t.type),
                (i = t.pendingProps),
                Ca(e, t, l, (i = t.elementType === l ? i : Cl(l, i)), n)
              );
            case 3:
              if ((_a(t), null === (l = t.updateQueue))) throw r(Error(282));
              return (
                (i = null !== (i = t.memoizedState) ? i.element : null),
                Kl(t, l, t.pendingProps, null, n),
                (l = t.memoizedState.element) === i
                  ? (ga(), (t = Ua(e, t, n)))
                  : ((i = t.stateNode),
                    (i = (null === e || null === e.child) && i.hydrate) &&
                      ((ca = Ir(t.stateNode.containerInfo.firstChild)),
                      (ua = t),
                      (i = sa = !0)),
                    i
                      ? ((t.effectTag |= 2), (t.child = ui(t, null, l, n)))
                      : (ba(e, t, l, n), ga()),
                    (t = t.child)),
                t
              );
            case 5:
              return (
                gi(t),
                null === e && pa(t),
                (l = t.type),
                (i = t.pendingProps),
                (a = null !== e ? e.memoizedProps : null),
                (o = i.children),
                Ur(l, i)
                  ? (o = null)
                  : null !== a && Ur(l, a) && (t.effectTag |= 16),
                xa(e, t),
                4 & t.mode && 1 !== n && i.hidden
                  ? ((t.expirationTime = t.childExpirationTime = 1), (t = null))
                  : (ba(e, t, o, n), (t = t.child)),
                t
              );
            case 6:
              return null === e && pa(t), null;
            case 13:
              return Na(e, t, n);
            case 4:
              return (
                hi(t, t.stateNode.containerInfo),
                (l = t.pendingProps),
                null === e ? (t.child = oi(t, null, l, n)) : ba(e, t, l, n),
                t.child
              );
            case 11:
              return (
                (l = t.type),
                (i = t.pendingProps),
                wa(e, t, l, (i = t.elementType === l ? i : Cl(l, i)), n)
              );
            case 7:
              return ba(e, t, t.pendingProps, n), t.child;
            case 8:
            case 12:
              return ba(e, t, t.pendingProps.children, n), t.child;
            case 10:
              e: {
                if (
                  ((l = t.type._context),
                  (i = t.pendingProps),
                  (o = t.memoizedProps),
                  Ul(t, (a = i.value)),
                  null !== o)
                ) {
                  var u = o.value;
                  if (
                    0 ===
                    (a = an(u, a)
                      ? 0
                      : 0 |
                        ('function' == typeof l._calculateChangedBits
                          ? l._calculateChangedBits(u, a)
                          : 1073741823))
                  ) {
                    if (o.children === i.children && !Br.current) {
                      t = Ua(e, t, n);
                      break e;
                    }
                  } else
                    for (
                      null !== (u = t.child) && (u.return = t);
                      null !== u;

                    ) {
                      var c = u.dependencies;
                      if (null !== c) {
                        o = u.child;
                        for (var s = c.firstContext; null !== s; ) {
                          if (s.context === l && 0 != (s.observedBits & a)) {
                            1 === u.tag &&
                              (((s = Wl(n, null)).tag = 2), Bl(u, s)),
                              u.expirationTime < n && (u.expirationTime = n),
                              null !== (s = u.alternate) &&
                                s.expirationTime < n &&
                                (s.expirationTime = n),
                              Fl(u.return, n),
                              c.expirationTime < n && (c.expirationTime = n);
                            break;
                          }
                          s = s.next;
                        }
                      } else
                        o = 10 === u.tag && u.type === t.type ? null : u.child;
                      if (null !== o) o.return = u;
                      else
                        for (o = u; null !== o; ) {
                          if (o === t) {
                            o = null;
                            break;
                          }
                          if (null !== (u = o.sibling)) {
                            (u.return = o.return), (o = u);
                            break;
                          }
                          o = o.return;
                        }
                      u = o;
                    }
                }
                ba(e, t, i.children, n), (t = t.child);
              }
              return t;
            case 9:
              return (
                (i = t.type),
                (l = (a = t.pendingProps).children),
                Il(t, n),
                (l = l((i = Dl(i, a.unstable_observedBits)))),
                (t.effectTag |= 1),
                ba(e, t, l, n),
                t.child
              );
            case 14:
              return (
                (a = Cl((i = t.type), t.pendingProps)),
                ka(e, t, i, (a = Cl(i.type, a)), l, n)
              );
            case 15:
              return Ea(e, t, t.type, t.pendingProps, l, n);
            case 17:
              return (
                (l = t.type),
                (i = t.pendingProps),
                (i = t.elementType === l ? i : Cl(l, i)),
                null !== e &&
                  ((e.alternate = null),
                  (t.alternate = null),
                  (t.effectTag |= 2)),
                (t.tag = 1),
                Qr(l) ? ((e = !0), Xr(t)) : (e = !1),
                Il(t, n),
                ei(t, l, i, n),
                ni(t, l, i, n),
                Sa(null, t, l, !0, e, n)
              );
            case 19:
              return Ma(e, t, n);
          }
          throw r(Error(156));
        };
        var fu = null,
          du = null;
        function pu(e) {
          if ('undefined' == typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) return !1;
          var t = __REACT_DEVTOOLS_GLOBAL_HOOK__;
          if (t.isDisabled || !t.supportsFiber) return !0;
          try {
            var n = t.inject(e);
            (fu = function(e) {
              try {
                t.onCommitFiberRoot(
                  n,
                  e,
                  void 0,
                  64 == (64 & e.current.effectTag)
                );
              } catch (r) {}
            }),
              (du = function(e) {
                try {
                  t.onCommitFiberUnmount(n, e);
                } catch (r) {}
              });
          } catch (r) {}
          return !0;
        }
        function hu(e, t, n, r) {
          (this.tag = e),
            (this.key = n),
            (this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null),
            (this.index = 0),
            (this.ref = null),
            (this.pendingProps = t),
            (this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null),
            (this.mode = r),
            (this.effectTag = 0),
            (this.lastEffect = this.firstEffect = this.nextEffect = null),
            (this.childExpirationTime = this.expirationTime = 0),
            (this.alternate = null);
        }
        function mu(e, t, n, r) {
          return new hu(e, t, n, r);
        }
        function gu(e) {
          return !(!(e = e.prototype) || !e.isReactComponent);
        }
        function vu(e) {
          if ('function' == typeof e) return gu(e) ? 1 : 0;
          if (null != e) {
            if ((e = e.$$typeof) === lt) return 11;
            if (e === ot) return 14;
          }
          return 2;
        }
        function yu(e, t) {
          var n = e.alternate;
          return (
            null === n
              ? (((n = mu(e.tag, t, e.key, e.mode)).elementType =
                  e.elementType),
                (n.type = e.type),
                (n.stateNode = e.stateNode),
                (n.alternate = e),
                (e.alternate = n))
              : ((n.pendingProps = t),
                (n.effectTag = 0),
                (n.nextEffect = null),
                (n.firstEffect = null),
                (n.lastEffect = null)),
            (n.childExpirationTime = e.childExpirationTime),
            (n.expirationTime = e.expirationTime),
            (n.child = e.child),
            (n.memoizedProps = e.memoizedProps),
            (n.memoizedState = e.memoizedState),
            (n.updateQueue = e.updateQueue),
            (t = e.dependencies),
            (n.dependencies =
              null === t
                ? null
                : {
                    expirationTime: t.expirationTime,
                    firstContext: t.firstContext,
                    responders: t.responders,
                  }),
            (n.sibling = e.sibling),
            (n.index = e.index),
            (n.ref = e.ref),
            n
          );
        }
        function bu(e, t, n, l, i, a) {
          var o = 2;
          if (((l = e), 'function' == typeof e)) gu(e) && (o = 1);
          else if ('string' == typeof e) o = 5;
          else
            e: switch (e) {
              case Ze:
                return wu(n.children, i, a, t);
              case rt:
                (o = 8), (i |= 7);
                break;
              case Je:
                (o = 8), (i |= 1);
                break;
              case et:
                return (
                  ((e = mu(12, n, t, 8 | i)).elementType = et),
                  (e.type = et),
                  (e.expirationTime = a),
                  e
                );
              case it:
                return (
                  ((e = mu(13, n, t, i)).type = it),
                  (e.elementType = it),
                  (e.expirationTime = a),
                  e
                );
              case at:
                return (
                  ((e = mu(19, n, t, i)).elementType = at),
                  (e.expirationTime = a),
                  e
                );
              default:
                if ('object' == typeof e && null !== e)
                  switch (e.$$typeof) {
                    case tt:
                      o = 10;
                      break e;
                    case nt:
                      o = 9;
                      break e;
                    case lt:
                      o = 11;
                      break e;
                    case ot:
                      o = 14;
                      break e;
                    case ut:
                      (o = 16), (l = null);
                      break e;
                  }
                throw r(Error(130), null == e ? e : typeof e, '');
            }
          return (
            ((t = mu(o, n, t, i)).elementType = e),
            (t.type = l),
            (t.expirationTime = a),
            t
          );
        }
        function wu(e, t, n, r) {
          return ((e = mu(7, e, r, t)).expirationTime = n), e;
        }
        function ku(e, t, n) {
          return ((e = mu(6, e, null, t)).expirationTime = n), e;
        }
        function Eu(e, t, n) {
          return (
            ((t = mu(
              4,
              null !== e.children ? e.children : [],
              e.key,
              t
            )).expirationTime = n),
            (t.stateNode = {
              containerInfo: e.containerInfo,
              pendingChildren: null,
              implementation: e.implementation,
            }),
            t
          );
        }
        function xu(e, t, n) {
          (this.tag = t),
            (this.current = null),
            (this.containerInfo = e),
            (this.pingCache = this.pendingChildren = null),
            (this.finishedExpirationTime = 0),
            (this.finishedWork = null),
            (this.timeoutHandle = -1),
            (this.pendingContext = this.context = null),
            (this.hydrate = n),
            (this.callbackNode = this.firstBatch = null),
            (this.pingTime = this.lastPendingTime = this.firstPendingTime = this.callbackExpirationTime = 0);
        }
        function Tu(e, t, n) {
          return (
            (e = new xu(e, t, n)),
            (t = mu(3, null, null, 2 === t ? 7 : 1 === t ? 3 : 0)),
            (e.current = t),
            (t.stateNode = e)
          );
        }
        function Cu(e, t, n, l, i, a) {
          var o = t.current;
          e: if (n) {
            t: {
              if (2 !== sn((n = n._reactInternalFiber)) || 1 !== n.tag)
                throw r(Error(170));
              var u = n;
              do {
                switch (u.tag) {
                  case 3:
                    u = u.stateNode.context;
                    break t;
                  case 1:
                    if (Qr(u.type)) {
                      u = u.stateNode.__reactInternalMemoizedMergedChildContext;
                      break t;
                    }
                }
                u = u.return;
              } while (null !== u);
              throw r(Error(171));
            }
            if (1 === n.tag) {
              var c = n.type;
              if (Qr(c)) {
                n = Yr(n, c, u);
                break e;
              }
            }
            n = u;
          } else n = Wr;
          return (
            null === t.context ? (t.context = n) : (t.pendingContext = n),
            (t = a),
            ((i = Wl(l, i)).payload = { element: e }),
            null !== (t = void 0 === t ? null : t) && (i.callback = t),
            Bl(o, i),
            Vo(o, l),
            l
          );
        }
        function Su(e, t, n, r) {
          var l = t.current,
            i = Lo(),
            a = Yl.suspense;
          return Cu(e, t, n, (l = Ao(i, l, a)), a, r);
        }
        function _u(e) {
          if (!(e = e.current).child) return null;
          switch (e.child.tag) {
            case 5:
            default:
              return e.child.stateNode;
          }
        }
        function Pu(e, t, n) {
          var r =
            3 < arguments.length && void 0 !== arguments[3]
              ? arguments[3]
              : null;
          return {
            $$typeof: Ge,
            key: null == r ? null : '' + r,
            children: e,
            containerInfo: t,
            implementation: n,
          };
        }
        function Nu(e) {
          var t =
            1073741821 - 25 * (1 + (((1073741821 - Lo() + 500) / 25) | 0));
          t <= Wo && --t,
            (this._expirationTime = Wo = t),
            (this._root = e),
            (this._callbacks = this._next = null),
            (this._hasChildren = this._didComplete = !1),
            (this._children = null),
            (this._defer = !0);
        }
        function zu() {
          (this._callbacks = null),
            (this._didCommit = !1),
            (this._onCommit = this._onCommit.bind(this));
        }
        function Mu(e, t, n) {
          this._internalRoot = Tu(e, t, n);
        }
        function Uu(e, t) {
          this._internalRoot = Tu(e, 2, t);
        }
        function Ru(e) {
          return !(
            !e ||
            (1 !== e.nodeType &&
              9 !== e.nodeType &&
              11 !== e.nodeType &&
              (8 !== e.nodeType ||
                ' react-mount-point-unstable ' !== e.nodeValue))
          );
        }
        function Fu(e, t) {
          if (
            (t ||
              (t = !(
                !(t = e
                  ? 9 === e.nodeType
                    ? e.documentElement
                    : e.firstChild
                  : null) ||
                1 !== t.nodeType ||
                !t.hasAttribute('data-reactroot')
              )),
            !t)
          )
            for (var n; (n = e.lastChild); ) e.removeChild(n);
          return new Mu(e, 0, t);
        }
        function Iu(e, t, n, r, l) {
          var i = n._reactRootContainer,
            a = void 0;
          if (i) {
            if (((a = i._internalRoot), 'function' == typeof l)) {
              var o = l;
              l = function() {
                var e = _u(a);
                o.call(e);
              };
            }
            Su(t, a, e, l);
          } else {
            if (
              ((i = n._reactRootContainer = Fu(n, r)),
              (a = i._internalRoot),
              'function' == typeof l)
            ) {
              var u = l;
              l = function() {
                var e = _u(a);
                u.call(e);
              };
            }
            Xo(function() {
              Su(t, a, e, l);
            });
          }
          return _u(a);
        }
        function Du(e, t) {
          var n =
            2 < arguments.length && void 0 !== arguments[2]
              ? arguments[2]
              : null;
          if (!Ru(t)) throw r(Error(200));
          return Pu(e, t, null, n);
        }
        (_e = function(e, t, n) {
          switch (t) {
            case 'input':
              if ((Nt(e, n), (t = n.name), 'radio' === n.type && null != t)) {
                for (n = e; n.parentNode; ) n = n.parentNode;
                for (
                  n = n.querySelectorAll(
                    'input[name=' + JSON.stringify('' + t) + '][type="radio"]'
                  ),
                    t = 0;
                  t < n.length;
                  t++
                ) {
                  var l = n[t];
                  if (l !== e && l.form === e.form) {
                    var i = O(l);
                    if (!i) throw r(Error(90));
                    Ke(l), Nt(l, i);
                  }
                }
              }
              break;
            case 'textarea':
              dr(e, n);
              break;
            case 'select':
              null != (t = n.value) && cr(e, !!n.multiple, t, !1);
          }
        }),
          (Nu.prototype.render = function(e) {
            if (!this._defer) throw r(Error(250));
            (this._hasChildren = !0), (this._children = e);
            var t = this._root._internalRoot,
              n = this._expirationTime,
              l = new zu();
            return Cu(e, t, null, n, null, l._onCommit), l;
          }),
          (Nu.prototype.then = function(e) {
            if (this._didComplete) e();
            else {
              var t = this._callbacks;
              null === t && (t = this._callbacks = []), t.push(e);
            }
          }),
          (Nu.prototype.commit = function() {
            var e = this._root._internalRoot,
              t = e.firstBatch;
            if (!this._defer || null === t) throw r(Error(251));
            if (this._hasChildren) {
              var n = this._expirationTime;
              if (t !== this) {
                this._hasChildren &&
                  ((n = this._expirationTime = t._expirationTime),
                  this.render(this._children));
                for (var l = null, i = t; i !== this; ) (l = i), (i = i._next);
                if (null === l) throw r(Error(251));
                (l._next = i._next), (this._next = t), (e.firstBatch = this);
              }
              if (((this._defer = !1), (t = n), (mo & (oo | uo)) !== io))
                throw r(Error(253));
              kl(Zo.bind(null, e, t)),
                El(),
                (t = this._next),
                (this._next = null),
                null !== (t = e.firstBatch = t) &&
                  t._hasChildren &&
                  t.render(t._children);
            } else (this._next = null), (this._defer = !1);
          }),
          (Nu.prototype._onComplete = function() {
            if (!this._didComplete) {
              this._didComplete = !0;
              var e = this._callbacks;
              if (null !== e) for (var t = 0; t < e.length; t++) (0, e[t])();
            }
          }),
          (zu.prototype.then = function(e) {
            if (this._didCommit) e();
            else {
              var t = this._callbacks;
              null === t && (t = this._callbacks = []), t.push(e);
            }
          }),
          (zu.prototype._onCommit = function() {
            if (!this._didCommit) {
              this._didCommit = !0;
              var e = this._callbacks;
              if (null !== e)
                for (var t = 0; t < e.length; t++) {
                  var n = e[t];
                  if ('function' != typeof n) throw r(Error(191), n);
                  n();
                }
            }
          }),
          (Uu.prototype.render = Mu.prototype.render = function(e, t) {
            var n = this._internalRoot,
              r = new zu();
            return (
              null !== (t = void 0 === t ? null : t) && r.then(t),
              Su(e, n, null, r._onCommit),
              r
            );
          }),
          (Uu.prototype.unmount = Mu.prototype.unmount = function(e) {
            var t = this._internalRoot,
              n = new zu();
            return (
              null !== (e = void 0 === e ? null : e) && n.then(e),
              Su(null, t, null, n._onCommit),
              n
            );
          }),
          (Uu.prototype.createBatch = function() {
            var e = new Nu(this),
              t = e._expirationTime,
              n = this._internalRoot,
              r = n.firstBatch;
            if (null === r) (n.firstBatch = e), (e._next = null);
            else {
              for (n = null; null !== r && r._expirationTime >= t; )
                (n = r), (r = r._next);
              (e._next = r), null !== n && (n._next = e);
            }
            return e;
          }),
          (Re = qo),
          (Fe = Yo),
          (Ie = Qo),
          (De = function(e, t) {
            var n = mo;
            mo |= 2;
            try {
              return e(t);
            } finally {
              (mo = n) === io && El();
            }
          });
        var Ou = {
          createPortal: Du,
          findDOMNode: function(e) {
            if (null == e) e = null;
            else if (1 !== e.nodeType) {
              var t = e._reactInternalFiber;
              if (void 0 === t) {
                if ('function' == typeof e.render) throw r(Error(188));
                throw r(Error(268), Object.keys(e));
              }
              e = null === (e = pn(t)) ? null : e.stateNode;
            }
            return e;
          },
          hydrate: function(e, t, n) {
            if (!Ru(t)) throw r(Error(200));
            return Iu(null, e, t, !0, n);
          },
          render: function(e, t, n) {
            if (!Ru(t)) throw r(Error(200));
            return Iu(null, e, t, !1, n);
          },
          unstable_renderSubtreeIntoContainer: function(e, t, n, l) {
            if (!Ru(n)) throw r(Error(200));
            if (null == e || void 0 === e._reactInternalFiber)
              throw r(Error(38));
            return Iu(e, t, n, !1, l);
          },
          unmountComponentAtNode: function(e) {
            if (!Ru(e)) throw r(Error(40));
            return (
              !!e._reactRootContainer &&
              (Xo(function() {
                Iu(null, null, e, !1, function() {
                  e._reactRootContainer = null;
                });
              }),
              !0)
            );
          },
          unstable_createPortal: function() {
            return Du.apply(void 0, arguments);
          },
          unstable_batchedUpdates: qo,
          unstable_interactiveUpdates: function(e, t, n, r) {
            return Qo(), Yo(e, t, n, r);
          },
          unstable_discreteUpdates: Yo,
          unstable_flushDiscreteUpdates: Qo,
          flushSync: function(e, t) {
            if ((mo & (oo | uo)) !== io) throw r(Error(187));
            var n = mo;
            mo |= 1;
            try {
              return bl(99, e.bind(null, t));
            } finally {
              (mo = n), El();
            }
          },
          unstable_createRoot: Lu,
          unstable_createSyncRoot: Au,
          unstable_flushControlled: function(e) {
            var t = mo;
            mo |= 1;
            try {
              bl(99, e);
            } finally {
              (mo = t) === io && El();
            }
          },
          __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
            Events: [
              I,
              D,
              O,
              N.injectEventPluginsByName,
              c,
              j,
              function(e) {
                C(e, B);
              },
              Me,
              Ue,
              Hn,
              P,
              lu,
              { current: !1 },
            ],
          },
        };
        function Lu(e, t) {
          if (!Ru(e)) throw r(Error(299), 'unstable_createRoot');
          return new Uu(e, null != t && !0 === t.hydrate);
        }
        function Au(e, t) {
          if (!Ru(e)) throw r(Error(299), 'unstable_createRoot');
          return new Mu(e, 1, null != t && !0 === t.hydrate);
        }
        !(function(e) {
          var n = e.findFiberByHostInstance;
          pu(
            t({}, e, {
              overrideHookState: null,
              overrideProps: null,
              setSuspenseHandler: null,
              scheduleUpdate: null,
              currentDispatcherRef: $e.ReactCurrentDispatcher,
              findHostInstanceByFiber: function(e) {
                return null === (e = pn(e)) ? null : e.stateNode;
              },
              findFiberByHostInstance: function(e) {
                return n ? n(e) : null;
              },
              findHostInstancesForRefresh: null,
              scheduleRefresh: null,
              scheduleRoot: null,
              setRefreshHandler: null,
              getCurrentFiber: null,
            })
          );
        })({
          findFiberByHostInstance: F,
          bundleType: 0,
          version: '16.9.0',
          rendererPackageName: 'react-dom',
        });
        var Wu = { default: Ou },
          Vu = (Wu && Ou) || Wu;
        module.exports = Vu.default || Vu;
      },
      { react: '1n8/', 'object-assign': 'J4Nk', scheduler: 'MDSO' },
    ],
    NKHc: [
      function(require, module, exports) {
        'use strict';
        function _() {
          if (
            'undefined' != typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ &&
            'function' == typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE
          ) {
            0;
            try {
              __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(_);
            } catch (O) {
              console.error(O);
            }
          }
        }
        _(), (module.exports = require('./cjs/react-dom.production.min.js'));
      },
      { './cjs/react-dom.production.min.js': 'i17t' },
    ],
    L8uO: [
      function(require, module, exports) {
        'use strict';
        var e = require('object-assign'),
          t = 'function' == typeof Symbol && Symbol.for,
          r = t ? Symbol.for('react.element') : 60103,
          n = t ? Symbol.for('react.portal') : 60106,
          o = t ? Symbol.for('react.fragment') : 60107,
          u = t ? Symbol.for('react.strict_mode') : 60108,
          l = t ? Symbol.for('react.profiler') : 60114,
          f = t ? Symbol.for('react.provider') : 60109,
          c = t ? Symbol.for('react.context') : 60110,
          i = t ? Symbol.for('react.forward_ref') : 60112,
          a = t ? Symbol.for('react.suspense') : 60113,
          s = t ? Symbol.for('react.suspense_list') : 60120,
          p = t ? Symbol.for('react.memo') : 60115,
          y = t ? Symbol.for('react.lazy') : 60116;
        t && Symbol.for('react.fundamental'),
          t && Symbol.for('react.responder');
        var d = 'function' == typeof Symbol && Symbol.iterator;
        function m(e) {
          for (
            var t = e.message,
              r = 'https://reactjs.org/docs/error-decoder.html?invariant=' + t,
              n = 1;
            n < arguments.length;
            n++
          )
            r += '&args[]=' + encodeURIComponent(arguments[n]);
          return (
            (e.message =
              'Minified React error #' +
              t +
              '; visit ' +
              r +
              ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings. '),
            e
          );
        }
        var v = {
            isMounted: function() {
              return !1;
            },
            enqueueForceUpdate: function() {},
            enqueueReplaceState: function() {},
            enqueueSetState: function() {},
          },
          h = {};
        function b(e, t, r) {
          (this.props = e),
            (this.context = t),
            (this.refs = h),
            (this.updater = r || v);
        }
        function S() {}
        function _(e, t, r) {
          (this.props = e),
            (this.context = t),
            (this.refs = h),
            (this.updater = r || v);
        }
        (b.prototype.isReactComponent = {}),
          (b.prototype.setState = function(e, t) {
            if ('object' != typeof e && 'function' != typeof e && null != e)
              throw m(Error(85));
            this.updater.enqueueSetState(this, e, t, 'setState');
          }),
          (b.prototype.forceUpdate = function(e) {
            this.updater.enqueueForceUpdate(this, e, 'forceUpdate');
          }),
          (S.prototype = b.prototype);
        var g = (_.prototype = new S());
        (g.constructor = _), e(g, b.prototype), (g.isPureReactComponent = !0);
        var k = { current: null },
          $ = { suspense: null },
          w = { current: null },
          C = Object.prototype.hasOwnProperty,
          E = { key: !0, ref: !0, __self: !0, __source: !0 };
        function R(e, t, n) {
          var o = void 0,
            u = {},
            l = null,
            f = null;
          if (null != t)
            for (o in (void 0 !== t.ref && (f = t.ref),
            void 0 !== t.key && (l = '' + t.key),
            t))
              C.call(t, o) && !E.hasOwnProperty(o) && (u[o] = t[o]);
          var c = arguments.length - 2;
          if (1 === c) u.children = n;
          else if (1 < c) {
            for (var i = Array(c), a = 0; a < c; a++) i[a] = arguments[a + 2];
            u.children = i;
          }
          if (e && e.defaultProps)
            for (o in (c = e.defaultProps)) void 0 === u[o] && (u[o] = c[o]);
          return {
            $$typeof: r,
            type: e,
            key: l,
            ref: f,
            props: u,
            _owner: w.current,
          };
        }
        function x(e, t) {
          return {
            $$typeof: r,
            type: e.type,
            key: t,
            ref: e.ref,
            props: e.props,
            _owner: e._owner,
          };
        }
        function P(e) {
          return 'object' == typeof e && null !== e && e.$$typeof === r;
        }
        function j(e) {
          var t = { '=': '=0', ':': '=2' };
          return (
            '$' +
            ('' + e).replace(/[=:]/g, function(e) {
              return t[e];
            })
          );
        }
        var O = /\/+/g,
          A = [];
        function I(e, t, r, n) {
          if (A.length) {
            var o = A.pop();
            return (
              (o.result = e),
              (o.keyPrefix = t),
              (o.func = r),
              (o.context = n),
              (o.count = 0),
              o
            );
          }
          return { result: e, keyPrefix: t, func: r, context: n, count: 0 };
        }
        function U(e) {
          (e.result = null),
            (e.keyPrefix = null),
            (e.func = null),
            (e.context = null),
            (e.count = 0),
            10 > A.length && A.push(e);
        }
        function q(e, t, o, u) {
          var l = typeof e;
          ('undefined' !== l && 'boolean' !== l) || (e = null);
          var f = !1;
          if (null === e) f = !0;
          else
            switch (l) {
              case 'string':
              case 'number':
                f = !0;
                break;
              case 'object':
                switch (e.$$typeof) {
                  case r:
                  case n:
                    f = !0;
                }
            }
          if (f) return o(u, e, '' === t ? '.' + F(e, 0) : t), 1;
          if (((f = 0), (t = '' === t ? '.' : t + ':'), Array.isArray(e)))
            for (var c = 0; c < e.length; c++) {
              var i = t + F((l = e[c]), c);
              f += q(l, i, o, u);
            }
          else if (
            (null === e || 'object' != typeof e
              ? (i = null)
              : (i =
                  'function' == typeof (i = (d && e[d]) || e['@@iterator'])
                    ? i
                    : null),
            'function' == typeof i)
          )
            for (e = i.call(e), c = 0; !(l = e.next()).done; )
              f += q((l = l.value), (i = t + F(l, c++)), o, u);
          else if ('object' === l)
            throw ((o = '' + e),
            m(
              Error(31),
              '[object Object]' === o
                ? 'object with keys {' + Object.keys(e).join(', ') + '}'
                : o,
              ''
            ));
          return f;
        }
        function L(e, t, r) {
          return null == e ? 0 : q(e, '', t, r);
        }
        function F(e, t) {
          return 'object' == typeof e && null !== e && null != e.key
            ? j(e.key)
            : t.toString(36);
        }
        function M(e, t) {
          e.func.call(e.context, t, e.count++);
        }
        function D(e, t, r) {
          var n = e.result,
            o = e.keyPrefix;
          (e = e.func.call(e.context, t, e.count++)),
            Array.isArray(e)
              ? V(e, n, r, function(e) {
                  return e;
                })
              : null != e &&
                (P(e) &&
                  (e = x(
                    e,
                    o +
                      (!e.key || (t && t.key === e.key)
                        ? ''
                        : ('' + e.key).replace(O, '$&/') + '/') +
                      r
                  )),
                n.push(e));
        }
        function V(e, t, r, n, o) {
          var u = '';
          null != r && (u = ('' + r).replace(O, '$&/') + '/'),
            L(e, D, (t = I(t, u, n, o))),
            U(t);
        }
        function B() {
          var e = k.current;
          if (null === e) throw m(Error(321));
          return e;
        }
        var N = {
            Children: {
              map: function(e, t, r) {
                if (null == e) return e;
                var n = [];
                return V(e, n, null, t, r), n;
              },
              forEach: function(e, t, r) {
                if (null == e) return e;
                L(e, M, (t = I(null, null, t, r))), U(t);
              },
              count: function(e) {
                return L(
                  e,
                  function() {
                    return null;
                  },
                  null
                );
              },
              toArray: function(e) {
                var t = [];
                return (
                  V(e, t, null, function(e) {
                    return e;
                  }),
                  t
                );
              },
              only: function(e) {
                if (!P(e)) throw m(Error(143));
                return e;
              },
            },
            createRef: function() {
              return { current: null };
            },
            Component: b,
            PureComponent: _,
            createContext: function(e, t) {
              return (
                void 0 === t && (t = null),
                ((e = {
                  $$typeof: c,
                  _calculateChangedBits: t,
                  _currentValue: e,
                  _currentValue2: e,
                  _threadCount: 0,
                  Provider: null,
                  Consumer: null,
                }).Provider = { $$typeof: f, _context: e }),
                (e.Consumer = e)
              );
            },
            forwardRef: function(e) {
              return { $$typeof: i, render: e };
            },
            lazy: function(e) {
              return { $$typeof: y, _ctor: e, _status: -1, _result: null };
            },
            memo: function(e, t) {
              return { $$typeof: p, type: e, compare: void 0 === t ? null : t };
            },
            useCallback: function(e, t) {
              return B().useCallback(e, t);
            },
            useContext: function(e, t) {
              return B().useContext(e, t);
            },
            useEffect: function(e, t) {
              return B().useEffect(e, t);
            },
            useImperativeHandle: function(e, t, r) {
              return B().useImperativeHandle(e, t, r);
            },
            useDebugValue: function() {},
            useLayoutEffect: function(e, t) {
              return B().useLayoutEffect(e, t);
            },
            useMemo: function(e, t) {
              return B().useMemo(e, t);
            },
            useReducer: function(e, t, r) {
              return B().useReducer(e, t, r);
            },
            useRef: function(e) {
              return B().useRef(e);
            },
            useState: function(e) {
              return B().useState(e);
            },
            Fragment: o,
            Profiler: l,
            StrictMode: u,
            Suspense: a,
            unstable_SuspenseList: s,
            createElement: R,
            cloneElement: function(t, n, o) {
              if (null == t) throw m(Error(267), t);
              var u = void 0,
                l = e({}, t.props),
                f = t.key,
                c = t.ref,
                i = t._owner;
              if (null != n) {
                void 0 !== n.ref && ((c = n.ref), (i = w.current)),
                  void 0 !== n.key && (f = '' + n.key);
                var a = void 0;
                for (u in (t.type &&
                  t.type.defaultProps &&
                  (a = t.type.defaultProps),
                n))
                  C.call(n, u) &&
                    !E.hasOwnProperty(u) &&
                    (l[u] = void 0 === n[u] && void 0 !== a ? a[u] : n[u]);
              }
              if (1 === (u = arguments.length - 2)) l.children = o;
              else if (1 < u) {
                a = Array(u);
                for (var s = 0; s < u; s++) a[s] = arguments[s + 2];
                l.children = a;
              }
              return {
                $$typeof: r,
                type: t.type,
                key: f,
                ref: c,
                props: l,
                _owner: i,
              };
            },
            createFactory: function(e) {
              var t = R.bind(null, e);
              return (t.type = e), t;
            },
            isValidElement: P,
            version: '16.9.0',
            unstable_withSuspenseConfig: function(e, t) {
              var r = $.suspense;
              $.suspense = void 0 === t ? null : t;
              try {
                e();
              } finally {
                $.suspense = r;
              }
            },
            __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
              ReactCurrentDispatcher: k,
              ReactCurrentBatchConfig: $,
              ReactCurrentOwner: w,
              IsSomeRendererActing: { current: !1 },
              assign: e,
            },
          },
          T = { default: N },
          z = (T && N) || T;
        module.exports = z.default || z;
      },
      { 'object-assign': 'J4Nk' },
    ],
    SAdv: [
      function(require, module, exports) {
        'use strict';
        module.exports = require('./cjs/react.production.min.js');
      },
      { './cjs/react.production.min.js': 'L8uO' },
    ],
    '7PB2': [
      function(require, module, exports) {
        'use strict';
        var _ = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
        module.exports = _;
      },
      {},
    ],
    '632c': [
      function(require, module, exports) {
        'use strict';
        var e = require('./lib/ReactPropTypesSecret');
        function r() {}
        function t() {}
        (t.resetWarningCache = r),
          (module.exports = function() {
            function n(r, t, n, o, a, p) {
              if (p !== e) {
                var c = new Error(
                  'Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types'
                );
                throw ((c.name = 'Invariant Violation'), c);
              }
            }
            function o() {
              return n;
            }
            n.isRequired = n;
            var a = {
              array: n,
              bool: n,
              func: n,
              number: n,
              object: n,
              string: n,
              symbol: n,
              any: n,
              arrayOf: o,
              element: n,
              elementType: n,
              instanceOf: o,
              node: n,
              objectOf: o,
              oneOf: o,
              oneOfType: o,
              shape: o,
              exact: o,
              checkPropTypes: t,
              resetWarningCache: r,
            };
            return (a.PropTypes = a), a;
          });
      },
      { './lib/ReactPropTypesSecret': '7PB2' },
    ],
    yu5W: [
      function(require, module, exports) {
        var r, e;
        module.exports = require('./factoryWithThrowingShims')();
      },
      { './factoryWithThrowingShims': '632c' },
    ],
    b2AJ: [
      function(require, module, exports) {
        var define;
        var e;
        !(function(t, n, r) {
          if (t) {
            for (
              var o,
                i = {
                  8: 'backspace',
                  9: 'tab',
                  13: 'enter',
                  16: 'shift',
                  17: 'ctrl',
                  18: 'alt',
                  20: 'capslock',
                  27: 'esc',
                  32: 'space',
                  33: 'pageup',
                  34: 'pagedown',
                  35: 'end',
                  36: 'home',
                  37: 'left',
                  38: 'up',
                  39: 'right',
                  40: 'down',
                  45: 'ins',
                  46: 'del',
                  91: 'meta',
                  93: 'meta',
                  224: 'meta',
                },
                a = {
                  106: '*',
                  107: '+',
                  109: '-',
                  110: '.',
                  111: '/',
                  186: ';',
                  187: '=',
                  188: ',',
                  189: '-',
                  190: '.',
                  191: '/',
                  192: '`',
                  219: '[',
                  220: '\\',
                  221: ']',
                  222: "'",
                },
                c = {
                  '~': '`',
                  '!': '1',
                  '@': '2',
                  '#': '3',
                  $: '4',
                  '%': '5',
                  '^': '6',
                  '&': '7',
                  '*': '8',
                  '(': '9',
                  ')': '0',
                  _: '-',
                  '+': '=',
                  ':': ';',
                  '"': "'",
                  '<': ',',
                  '>': '.',
                  '?': '/',
                  '|': '\\',
                },
                s = {
                  option: 'alt',
                  command: 'meta',
                  return: 'enter',
                  escape: 'esc',
                  plus: '+',
                  mod: /Mac|iPod|iPhone|iPad/.test(navigator.platform)
                    ? 'meta'
                    : 'ctrl',
                },
                u = 1;
              u < 20;
              ++u
            )
              i[111 + u] = 'f' + u;
            for (u = 0; u <= 9; ++u) i[u + 96] = u.toString();
            (y.prototype.bind = function(e, t, n) {
              return (
                (e = e instanceof Array ? e : [e]),
                this._bindMultiple.call(this, e, t, n),
                this
              );
            }),
              (y.prototype.unbind = function(e, t) {
                return this.bind.call(this, e, function() {}, t);
              }),
              (y.prototype.trigger = function(e, t) {
                return (
                  this._directMap[e + ':' + t] &&
                    this._directMap[e + ':' + t]({}, e),
                  this
                );
              }),
              (y.prototype.reset = function() {
                return (this._callbacks = {}), (this._directMap = {}), this;
              }),
              (y.prototype.stopCallback = function(e, t) {
                if ((' ' + t.className + ' ').indexOf(' mousetrap ') > -1)
                  return !1;
                if (
                  (function e(t, r) {
                    return (
                      null !== t && t !== n && (t === r || e(t.parentNode, r))
                    );
                  })(t, this.target)
                )
                  return !1;
                if (
                  'composedPath' in e &&
                  'function' == typeof e.composedPath
                ) {
                  var r = e.composedPath()[0];
                  r !== e.target && (t = r);
                }
                return (
                  'INPUT' == t.tagName ||
                  'SELECT' == t.tagName ||
                  'TEXTAREA' == t.tagName ||
                  t.isContentEditable
                );
              }),
              (y.prototype.handleKey = function() {
                return this._handleKey.apply(this, arguments);
              }),
              (y.addKeycodes = function(e) {
                for (var t in e) e.hasOwnProperty(t) && (i[t] = e[t]);
                o = null;
              }),
              (y.init = function() {
                var e = y(n);
                for (var t in e)
                  '_' !== t.charAt(0) &&
                    (y[t] = (function(t) {
                      return function() {
                        return e[t].apply(e, arguments);
                      };
                    })(t));
              }),
              y.init(),
              (t.Mousetrap = y),
              'undefined' != typeof module &&
                module.exports &&
                (module.exports = y),
              'function' == typeof e &&
                e.amd &&
                e(function() {
                  return y;
                });
          }
          function l(e, t, n) {
            e.addEventListener
              ? e.addEventListener(t, n, !1)
              : e.attachEvent('on' + t, n);
          }
          function f(e) {
            if ('keypress' == e.type) {
              var t = String.fromCharCode(e.which);
              return e.shiftKey || (t = t.toLowerCase()), t;
            }
            return i[e.which]
              ? i[e.which]
              : a[e.which]
              ? a[e.which]
              : String.fromCharCode(e.which).toLowerCase();
          }
          function p(e) {
            return 'shift' == e || 'ctrl' == e || 'alt' == e || 'meta' == e;
          }
          function h(e, t, n) {
            return (
              n ||
                (n = (function() {
                  if (!o)
                    for (var e in ((o = {}), i))
                      (e > 95 && e < 112) ||
                        (i.hasOwnProperty(e) && (o[i[e]] = e));
                  return o;
                })()[e]
                  ? 'keydown'
                  : 'keypress'),
              'keypress' == n && t.length && (n = 'keydown'),
              n
            );
          }
          function d(e, t) {
            var n,
              r,
              o,
              i = [];
            for (
              n = (function(e) {
                return '+' === e
                  ? ['+']
                  : (e = e.replace(/\+{2}/g, '+plus')).split('+');
              })(e),
                o = 0;
              o < n.length;
              ++o
            )
              (r = n[o]),
                s[r] && (r = s[r]),
                t && 'keypress' != t && c[r] && ((r = c[r]), i.push('shift')),
                p(r) && i.push(r);
            return { key: r, modifiers: i, action: (t = h(r, i, t)) };
          }
          function y(e) {
            var t = this;
            if (((e = e || n), !(t instanceof y))) return new y(e);
            (t.target = e), (t._callbacks = {}), (t._directMap = {});
            var r,
              o = {},
              i = !1,
              a = !1,
              c = !1;
            function s(e) {
              e = e || {};
              var t,
                n = !1;
              for (t in o) e[t] ? (n = !0) : (o[t] = 0);
              n || (c = !1);
            }
            function u(e, n, r, i, a, c) {
              var s,
                u,
                l,
                f,
                h = [],
                d = r.type;
              if (!t._callbacks[e]) return [];
              for (
                'keyup' == d && p(e) && (n = [e]), s = 0;
                s < t._callbacks[e].length;
                ++s
              )
                if (
                  ((u = t._callbacks[e][s]),
                  (i || !u.seq || o[u.seq] == u.level) &&
                    d == u.action &&
                    (('keypress' == d && !r.metaKey && !r.ctrlKey) ||
                      ((l = n),
                      (f = u.modifiers),
                      l.sort().join(',') === f.sort().join(','))))
                ) {
                  var y = !i && u.combo == a,
                    m = i && u.seq == i && u.level == c;
                  (y || m) && t._callbacks[e].splice(s, 1), h.push(u);
                }
              return h;
            }
            function h(e, n, r, o) {
              t.stopCallback(n, n.target || n.srcElement, r, o) ||
                (!1 === e(n, r) &&
                  ((function(e) {
                    e.preventDefault
                      ? e.preventDefault()
                      : (e.returnValue = !1);
                  })(n),
                  (function(e) {
                    e.stopPropagation
                      ? e.stopPropagation()
                      : (e.cancelBubble = !0);
                  })(n)));
            }
            function m(e) {
              'number' != typeof e.which && (e.which = e.keyCode);
              var n = f(e);
              n &&
                ('keyup' != e.type || i !== n
                  ? t.handleKey(
                      n,
                      (function(e) {
                        var t = [];
                        return (
                          e.shiftKey && t.push('shift'),
                          e.altKey && t.push('alt'),
                          e.ctrlKey && t.push('ctrl'),
                          e.metaKey && t.push('meta'),
                          t
                        );
                      })(e),
                      e
                    )
                  : (i = !1));
            }
            function k(e, t, n, a) {
              function u(t) {
                return function() {
                  (c = t), ++o[e], clearTimeout(r), (r = setTimeout(s, 1e3));
                };
              }
              function l(t) {
                h(n, t, e), 'keyup' !== a && (i = f(t)), setTimeout(s, 10);
              }
              o[e] = 0;
              for (var p = 0; p < t.length; ++p) {
                var y = p + 1 === t.length ? l : u(a || d(t[p + 1]).action);
                v(t[p], y, a, e, p);
              }
            }
            function v(e, n, r, o, i) {
              t._directMap[e + ':' + r] = n;
              var a,
                c = (e = e.replace(/\s+/g, ' ')).split(' ');
              c.length > 1
                ? k(e, c, n, r)
                : ((a = d(e, r)),
                  (t._callbacks[a.key] = t._callbacks[a.key] || []),
                  u(a.key, a.modifiers, { type: a.action }, o, e, i),
                  t._callbacks[a.key][o ? 'unshift' : 'push']({
                    callback: n,
                    modifiers: a.modifiers,
                    action: a.action,
                    seq: o,
                    level: i,
                    combo: e,
                  }));
            }
            (t._handleKey = function(e, t, n) {
              var r,
                o = u(e, t, n),
                i = {},
                l = 0,
                f = !1;
              for (r = 0; r < o.length; ++r)
                o[r].seq && (l = Math.max(l, o[r].level));
              for (r = 0; r < o.length; ++r)
                if (o[r].seq) {
                  if (o[r].level != l) continue;
                  (f = !0),
                    (i[o[r].seq] = 1),
                    h(o[r].callback, n, o[r].combo, o[r].seq);
                } else f || h(o[r].callback, n, o[r].combo);
              var d = 'keypress' == n.type && a;
              n.type != c || p(e) || d || s(i), (a = f && 'keydown' == n.type);
            }),
              (t._bindMultiple = function(e, t, n) {
                for (var r = 0; r < e.length; ++r) v(e[r], t, n);
              }),
              l(e, 'keypress', m),
              l(e, 'keydown', m),
              l(e, 'keyup', m);
          }
        })(
          'undefined' != typeof window ? window : null,
          'undefined' != typeof window ? document : null
        );
      },
      {},
    ],
    O5av: [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: !0 }),
          (exports.stringify = exports.parse = exports.default = void 0);
        var t = (function(t, e) {
            return {
              parse: function(e) {
                var r = JSON.parse(e, o).map(n),
                  s = r[0];
                return 'object' == typeof s && s
                  ? (function e(r, n, o) {
                      return Object.keys(o).reduce(function(o, s) {
                        var i = o[s];
                        if (i instanceof t) {
                          var u = r[i];
                          'object' != typeof u || n.has(u)
                            ? (o[s] = u)
                            : (n.add(u), (o[s] = e(r, n, u)));
                        }
                        return o;
                      }, o);
                    })(r, new Set(), s)
                  : s;
              },
              stringify: function(t) {
                for (
                  var n,
                    o = new Map(),
                    s = [],
                    i = [],
                    u = +r(o, s, t),
                    f = function(t, i) {
                      if (n) return (n = !n), i;
                      switch (typeof i) {
                        case 'object':
                          if (null === i) return i;
                        case e:
                          return o.get(i) || r(o, s, i);
                      }
                      return i;
                    };
                  u < s.length;
                  u++
                )
                  (n = !0), (i[u] = JSON.stringify(s[u], f));
                return '[' + i.join(',') + ']';
              },
            };
            function r(e, r, n) {
              var o = t(r.push(n) - 1);
              return e.set(n, o), o;
            }
            function n(e) {
              return e instanceof t ? t(e) : e;
            }
            function o(r, n) {
              return typeof n === e ? new t(n) : n;
            }
          })(String, 'string'),
          e = t;
        exports.default = e;
        const r = t.parse;
        exports.parse = r;
        const n = t.stringify;
        exports.stringify = n;
      },
      {},
    ],
    xmNH: [
      function(require, module, exports) {
        'use strict';
        function e(e) {
          var o,
            r = e.Symbol;
          return (
            'function' == typeof r
              ? r.observable
                ? (o = r.observable)
                : ((o = r('observable')), (r.observable = o))
              : (o = '@@observable'),
            o
          );
        }
        Object.defineProperty(exports, '__esModule', { value: !0 }),
          (exports.default = e);
      },
      {},
    ],
    '0G8e': [
      function(require, module, exports) {
        var global = arguments[3];
        var e = arguments[3];
        Object.defineProperty(exports, '__esModule', { value: !0 }),
          (exports.default = void 0);
        var d,
          o = t(require('./ponyfill.js'));
        function t(e) {
          return e && e.__esModule ? e : { default: e };
        }
        d =
          'undefined' != typeof self
            ? self
            : 'undefined' != typeof window
            ? window
            : void 0 !== e
            ? e
            : 'undefined' != typeof module
            ? module
            : Function('return this')();
        var u = (0, o.default)(d),
          n = u;
        exports.default = n;
      },
      { './ponyfill.js': 'xmNH' },
    ],
    '50OV': [
      function(require, module, exports) {
        'use strict';
        Object.defineProperty(exports, '__esModule', { value: !0 }),
          (exports.applyMiddleware = w),
          (exports.bindActionCreators = p),
          (exports.combineReducers = f),
          (exports.compose = b),
          (exports.createStore = i),
          (exports.__DO_NOT_USE__ActionTypes = void 0);
        var e = t(require('symbol-observable'));
        function t(e) {
          return e && e.__esModule ? e : { default: e };
        }
        var r = function() {
            return Math.random()
              .toString(36)
              .substring(7)
              .split('')
              .join('.');
          },
          n = {
            INIT: '@@redux/INIT' + r(),
            REPLACE: '@@redux/REPLACE' + r(),
            PROBE_UNKNOWN_ACTION: function() {
              return '@@redux/PROBE_UNKNOWN_ACTION' + r();
            },
          };
        function o(e) {
          if ('object' != typeof e || null === e) return !1;
          for (var t = e; null !== Object.getPrototypeOf(t); )
            t = Object.getPrototypeOf(t);
          return Object.getPrototypeOf(e) === t;
        }
        function i(t, r, u) {
          var c;
          if (
            ('function' == typeof r && 'function' == typeof u) ||
            ('function' == typeof u && 'function' == typeof arguments[3])
          )
            throw new Error(
              'It looks like you are passing several store enhancers to createStore(). This is not supported. Instead, compose them together to a single function.'
            );
          if (
            ('function' == typeof r && void 0 === u && ((u = r), (r = void 0)),
            void 0 !== u)
          ) {
            if ('function' != typeof u)
              throw new Error('Expected the enhancer to be a function.');
            return u(i)(t, r);
          }
          if ('function' != typeof t)
            throw new Error('Expected the reducer to be a function.');
          var a = t,
            s = r,
            f = [],
            d = f,
            p = !1;
          function l() {
            d === f && (d = f.slice());
          }
          function h() {
            if (p)
              throw new Error(
                'You may not call store.getState() while the reducer is executing. The reducer has already received the state as an argument. Pass it down from the top reducer instead of reading it from the store.'
              );
            return s;
          }
          function y(e) {
            if ('function' != typeof e)
              throw new Error('Expected the listener to be a function.');
            if (p)
              throw new Error(
                'You may not call store.subscribe() while the reducer is executing. If you would like to be notified after the store has been updated, subscribe from a component and invoke store.getState() in the callback to access the latest state. See https://redux.js.org/api-reference/store#subscribe(listener) for more details.'
              );
            var t = !0;
            return (
              l(),
              d.push(e),
              function() {
                if (t) {
                  if (p)
                    throw new Error(
                      'You may not unsubscribe from a store listener while the reducer is executing. See https://redux.js.org/api-reference/store#subscribe(listener) for more details.'
                    );
                  (t = !1), l();
                  var r = d.indexOf(e);
                  d.splice(r, 1);
                }
              }
            );
          }
          function b(e) {
            if (!o(e))
              throw new Error(
                'Actions must be plain objects. Use custom middleware for async actions.'
              );
            if (void 0 === e.type)
              throw new Error(
                'Actions may not have an undefined "type" property. Have you misspelled a constant?'
              );
            if (p) throw new Error('Reducers may not dispatch actions.');
            try {
              (p = !0), (s = a(s, e));
            } finally {
              p = !1;
            }
            for (var t = (f = d), r = 0; r < t.length; r++) {
              (0, t[r])();
            }
            return e;
          }
          return (
            b({ type: n.INIT }),
            ((c = {
              dispatch: b,
              subscribe: y,
              getState: h,
              replaceReducer: function(e) {
                if ('function' != typeof e)
                  throw new Error('Expected the nextReducer to be a function.');
                (a = e), b({ type: n.REPLACE });
              },
            })[e.default] = function() {
              var t,
                r = y;
              return (
                ((t = {
                  subscribe: function(e) {
                    if ('object' != typeof e || null === e)
                      throw new TypeError(
                        'Expected the observer to be an object.'
                      );
                    function t() {
                      e.next && e.next(h());
                    }
                    return t(), { unsubscribe: r(t) };
                  },
                })[e.default] = function() {
                  return this;
                }),
                t
              );
            }),
            c
          );
        }
        function u(e) {
          'undefined' != typeof console &&
            'function' == typeof console.error &&
            console.error(e);
          try {
            throw new Error(e);
          } catch (t) {}
        }
        function c(e, t) {
          var r = t && t.type;
          return (
            'Given ' +
            ((r && 'action "' + String(r) + '"') || 'an action') +
            ', reducer "' +
            e +
            '" returned undefined. To ignore an action, you must explicitly return the previous state. If you want this reducer to hold no value, you can return null instead of undefined.'
          );
        }
        function a(e, t, r, i) {
          var u = Object.keys(t),
            c =
              r && r.type === n.INIT
                ? 'preloadedState argument passed to createStore'
                : 'previous state received by the reducer';
          if (0 === u.length)
            return 'Store does not have a valid reducer. Make sure the argument passed to combineReducers is an object whose values are reducers.';
          if (!o(e))
            return (
              'The ' +
              c +
              ' has unexpected type of "' +
              {}.toString.call(e).match(/\s([a-z|A-Z]+)/)[1] +
              '". Expected argument to be an object with the following keys: "' +
              u.join('", "') +
              '"'
            );
          var a = Object.keys(e).filter(function(e) {
            return !t.hasOwnProperty(e) && !i[e];
          });
          return (
            a.forEach(function(e) {
              i[e] = !0;
            }),
            r && r.type === n.REPLACE
              ? void 0
              : a.length > 0
              ? 'Unexpected ' +
                (a.length > 1 ? 'keys' : 'key') +
                ' "' +
                a.join('", "') +
                '" found in ' +
                c +
                '. Expected to find one of the known reducer keys instead: "' +
                u.join('", "') +
                '". Unexpected keys will be ignored.'
              : void 0
          );
        }
        function s(e) {
          Object.keys(e).forEach(function(t) {
            var r = e[t];
            if (void 0 === r(void 0, { type: n.INIT }))
              throw new Error(
                'Reducer "' +
                  t +
                  '" returned undefined during initialization. If the state passed to the reducer is undefined, you must explicitly return the initial state. The initial state may not be undefined. If you don\'t want to set a value for this reducer, you can use null instead of undefined.'
              );
            if (void 0 === r(void 0, { type: n.PROBE_UNKNOWN_ACTION() }))
              throw new Error(
                'Reducer "' +
                  t +
                  '" returned undefined when probed with a random type. Don\'t try to handle ' +
                  n.INIT +
                  ' or other actions in "redux/*" namespace. They are considered private. Instead, you must return the current state for any unknown actions, unless it is undefined, in which case you must return the initial state, regardless of the action type. The initial state may not be undefined, but can be null.'
              );
          });
        }
        function f(e) {
          for (var t = Object.keys(e), r = {}, n = 0; n < t.length; n++) {
            var o = t[n];
            0, 'function' == typeof e[o] && (r[o] = e[o]);
          }
          var i,
            u = Object.keys(r);
          try {
            s(r);
          } catch (a) {
            i = a;
          }
          return function(e, t) {
            if ((void 0 === e && (e = {}), i)) throw i;
            for (var n = !1, o = {}, a = 0; a < u.length; a++) {
              var s = u[a],
                f = r[s],
                d = e[s],
                p = f(d, t);
              if (void 0 === p) {
                var l = c(s, t);
                throw new Error(l);
              }
              (o[s] = p), (n = n || p !== d);
            }
            return n ? o : e;
          };
        }
        function d(e, t) {
          return function() {
            return t(e.apply(this, arguments));
          };
        }
        function p(e, t) {
          if ('function' == typeof e) return d(e, t);
          if ('object' != typeof e || null === e)
            throw new Error(
              'bindActionCreators expected an object or a function, instead received ' +
                (null === e ? 'null' : typeof e) +
                '. Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?'
            );
          var r = {};
          for (var n in e) {
            var o = e[n];
            'function' == typeof o && (r[n] = d(o, t));
          }
          return r;
        }
        function l(e, t, r) {
          return (
            t in e
              ? Object.defineProperty(e, t, {
                  value: r,
                  enumerable: !0,
                  configurable: !0,
                  writable: !0,
                })
              : (e[t] = r),
            e
          );
        }
        function h(e, t) {
          var r = Object.keys(e);
          return (
            Object.getOwnPropertySymbols &&
              r.push.apply(r, Object.getOwnPropertySymbols(e)),
            t &&
              (r = r.filter(function(t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable;
              })),
            r
          );
        }
        function y(e) {
          for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? h(r, !0).forEach(function(t) {
                  l(e, t, r[t]);
                })
              : Object.getOwnPropertyDescriptors
              ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
              : h(r).forEach(function(t) {
                  Object.defineProperty(
                    e,
                    t,
                    Object.getOwnPropertyDescriptor(r, t)
                  );
                });
          }
          return e;
        }
        function b() {
          for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++)
            t[r] = arguments[r];
          return 0 === t.length
            ? function(e) {
                return e;
              }
            : 1 === t.length
            ? t[0]
            : t.reduce(function(e, t) {
                return function() {
                  return e(t.apply(void 0, arguments));
                };
              });
        }
        function w() {
          for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++)
            t[r] = arguments[r];
          return function(e) {
            return function() {
              var r = e.apply(void 0, arguments),
                n = function() {
                  throw new Error(
                    'Dispatching while constructing your middleware is not allowed. Other middleware would not be applied to this dispatch.'
                  );
                },
                o = {
                  getState: r.getState,
                  dispatch: function() {
                    return n.apply(void 0, arguments);
                  },
                },
                i = t.map(function(e) {
                  return e(o);
                });
              return y({}, r, {
                dispatch: (n = b.apply(void 0, i)(r.dispatch)),
              });
            };
          };
        }
        function v() {}
        exports.__DO_NOT_USE__ActionTypes = n;
      },
      { 'symbol-observable': '0G8e' },
    ],
    pBGv: [
      function(require, module, exports) {
        var t,
          e,
          n = (module.exports = {});
        function r() {
          throw new Error('setTimeout has not been defined');
        }
        function o() {
          throw new Error('clearTimeout has not been defined');
        }
        function i(e) {
          if (t === setTimeout) return setTimeout(e, 0);
          if ((t === r || !t) && setTimeout)
            return (t = setTimeout), setTimeout(e, 0);
          try {
            return t(e, 0);
          } catch (n) {
            try {
              return t.call(null, e, 0);
            } catch (n) {
              return t.call(this, e, 0);
            }
          }
        }
        function u(t) {
          if (e === clearTimeout) return clearTimeout(t);
          if ((e === o || !e) && clearTimeout)
            return (e = clearTimeout), clearTimeout(t);
          try {
            return e(t);
          } catch (n) {
            try {
              return e.call(null, t);
            } catch (n) {
              return e.call(this, t);
            }
          }
        }
        !(function() {
          try {
            t = 'function' == typeof setTimeout ? setTimeout : r;
          } catch (n) {
            t = r;
          }
          try {
            e = 'function' == typeof clearTimeout ? clearTimeout : o;
          } catch (n) {
            e = o;
          }
        })();
        var c,
          s = [],
          l = !1,
          a = -1;
        function f() {
          l &&
            c &&
            ((l = !1),
            c.length ? (s = c.concat(s)) : (a = -1),
            s.length && h());
        }
        function h() {
          if (!l) {
            var t = i(f);
            l = !0;
            for (var e = s.length; e; ) {
              for (c = s, s = []; ++a < e; ) c && c[a].run();
              (a = -1), (e = s.length);
            }
            (c = null), (l = !1), u(t);
          }
        }
        function m(t, e) {
          (this.fun = t), (this.array = e);
        }
        function p() {}
        (n.nextTick = function(t) {
          var e = new Array(arguments.length - 1);
          if (arguments.length > 1)
            for (var n = 1; n < arguments.length; n++) e[n - 1] = arguments[n];
          s.push(new m(t, e)), 1 !== s.length || l || i(h);
        }),
          (m.prototype.run = function() {
            this.fun.apply(null, this.array);
          }),
          (n.title = 'browser'),
          (n.env = {}),
          (n.argv = []),
          (n.version = ''),
          (n.versions = {}),
          (n.on = p),
          (n.addListener = p),
          (n.once = p),
          (n.off = p),
          (n.removeListener = p),
          (n.removeAllListeners = p),
          (n.emit = p),
          (n.prependListener = p),
          (n.prependOnceListener = p),
          (n.listeners = function(t) {
            return [];
          }),
          (n.binding = function(t) {
            throw new Error('process.binding is not supported');
          }),
          (n.cwd = function() {
            return '/';
          }),
          (n.chdir = function(t) {
            throw new Error('process.chdir is not supported');
          }),
          (n.umask = function() {
            return 0;
          });
      },
      {},
    ],
    SPuX: [
      function(require, module, exports) {
        var process = require('process');
        var e = require('process');
        Object.defineProperty(exports, '__esModule', { value: !0 }),
          (exports.original = c),
          (exports.isDraft = s),
          (exports.isDraftable = u),
          (exports.default = exports.immerable = exports.nothing = exports.Immer = exports.applyPatches = exports.setUseProxies = exports.setAutoFreeze = exports.produce = void 0);
        var r =
            'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
              ? function(e) {
                  return typeof e;
                }
              : function(e) {
                  return e &&
                    'function' == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? 'symbol'
                    : typeof e;
                },
          t = function(e, r) {
            if (!(e instanceof r))
              throw new TypeError('Cannot call a class as a function');
          },
          n = (function() {
            function e(e, r) {
              for (var t = 0; t < r.length; t++) {
                var n = r[t];
                (n.enumerable = n.enumerable || !1),
                  (n.configurable = !0),
                  'value' in n && (n.writable = !0),
                  Object.defineProperty(e, n.key, n);
              }
            }
            return function(r, t, n) {
              return t && e(r.prototype, t), n && e(r, n), r;
            };
          })(),
          o = function(e, r, t) {
            return (
              r in e
                ? Object.defineProperty(e, r, {
                    value: t,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0,
                  })
                : (e[r] = t),
              e
            );
          },
          i =
            'undefined' != typeof Symbol
              ? Symbol('immer-nothing')
              : o({}, 'immer-nothing', !0);
        exports.nothing = i;
        var a =
          'undefined' != typeof Symbol
            ? Symbol('immer-draftable')
            : '__$immer_draftable';
        exports.immerable = a;
        var f =
          'undefined' != typeof Symbol
            ? Symbol('immer-state')
            : '__$immer_state';
        function s(e) {
          return !!e && !!e[f];
        }
        function u(e) {
          if (!e || 'object' !== (void 0 === e ? 'undefined' : r(e))) return !1;
          if (Array.isArray(e)) return !0;
          var t = Object.getPrototypeOf(e);
          return !t || t === Object.prototype || (!!e[a] || !!e.constructor[a]);
        }
        function c(e) {
          if (e && e[f]) return e[f].base;
        }
        var l =
            Object.assign ||
            function(e, r) {
              for (var t in r) v(r, t) && (e[t] = r[t]);
              return e;
            },
          p =
            'undefined' != typeof Reflect && Reflect.ownKeys
              ? Reflect.ownKeys
              : void 0 !== Object.getOwnPropertySymbols
              ? function(e) {
                  return Object.getOwnPropertyNames(e).concat(
                    Object.getOwnPropertySymbols(e)
                  );
                }
              : Object.getOwnPropertyNames;
        function d(e) {
          var r =
            arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
          if (Array.isArray(e)) return e.slice();
          var t = Object.create(Object.getPrototypeOf(e));
          return (
            p(e).forEach(function(n) {
              if (n !== f) {
                var o = Object.getOwnPropertyDescriptor(e, n);
                if (o.get) {
                  if (!r)
                    throw new Error(
                      'Immer drafts cannot have computed properties'
                    );
                  o.value = o.get.call(e);
                }
                o.enumerable
                  ? (t[n] = o.value)
                  : Object.defineProperty(t, n, {
                      value: o.value,
                      writable: !0,
                      configurable: !0,
                    });
              }
            }),
            t
          );
        }
        function h(e, r) {
          if (Array.isArray(e))
            for (var t = 0; t < e.length; t++) r(t, e[t], e);
          else
            p(e).forEach(function(t) {
              return r(t, e[t], e);
            });
        }
        function y(e, r) {
          return Object.getOwnPropertyDescriptor(e, r).enumerable;
        }
        function v(e, r) {
          return Object.prototype.hasOwnProperty.call(e, r);
        }
        function b(e, r) {
          return e === r ? 0 !== e || 1 / e == 1 / r : e != e && r != r;
        }
        var g = {},
          m = [],
          w = function() {
            return m[m.length - 1];
          };
        function O(e, r, t) {
          var n = w();
          n.forEach(function(e) {
            return (e.finalizing = !0);
          }),
            (void 0 !== e && e !== r) || (t && _(r), I(n));
        }
        function P(e, r) {
          var t = Array.isArray(e),
            n = S(e);
          h(n, function(r) {
            D(n, r, t || y(e, r));
          });
          var o = {
            scope: r ? r.scope : w(),
            modified: !1,
            finalizing: !1,
            finalized: !1,
            assigned: {},
            parent: r,
            base: e,
            draft: n,
            copy: null,
            revoke: j,
            revoked: !1,
          };
          return R(n, f, o), o.scope.push(o), n;
        }
        function j() {
          this.revoked = !0;
        }
        function x(e) {
          return e.copy || e.base;
        }
        function z(e, r) {
          F(e);
          var t = x(e)[r];
          return !e.finalizing && t === e.base[r] && u(t)
            ? (E(e), (e.copy[r] = P(t, e)))
            : t;
        }
        function A(e, r, t) {
          if ((F(e), (e.assigned[r] = !0), !e.modified)) {
            if (b(x(e)[r], t)) return;
            k(e), E(e);
          }
          e.copy[r] = t;
        }
        function k(e) {
          e.modified || ((e.modified = !0), e.parent && k(e.parent));
        }
        function E(e) {
          e.copy || (e.copy = S(e.base));
        }
        function S(e) {
          var r = e && e[f];
          if (r) {
            r.finalizing = !0;
            var t = d(r.draft, !0);
            return (r.finalizing = !1), t;
          }
          return d(e);
        }
        function D(e, r, t) {
          var n = g[r];
          n
            ? (n.enumerable = t)
            : (g[r] = n = {
                configurable: !0,
                enumerable: t,
                get: function() {
                  return z(this[f], r);
                },
                set: function(e) {
                  A(this[f], r, e);
                },
              }),
            Object.defineProperty(e, r, n);
        }
        function F(e) {
          if (!0 === e.revoked)
            throw new Error(
              'Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? ' +
                JSON.stringify(x(e))
            );
        }
        function I(e) {
          for (var r = e.length - 1; r >= 0; r--) {
            var t = e[r];
            !1 === t.modified &&
              (Array.isArray(t.base) ? C(t) && k(t) : N(t) && k(t));
          }
        }
        function _(e) {
          if (e && 'object' === (void 0 === e ? 'undefined' : r(e))) {
            var t = e[f];
            if (t) {
              var n = t.base,
                o = t.draft,
                i = t.assigned;
              if (Array.isArray(e)) {
                if (C(t)) {
                  if ((k(t), (i.length = !0), o.length < n.length))
                    for (var a = o.length; a < n.length; a++) i[a] = !1;
                  else for (var s = n.length; s < o.length; s++) i[s] = !0;
                  for (var u = 0; u < o.length; u++) void 0 === i[u] && _(o[u]);
                }
              } else
                Object.keys(o).forEach(function(e) {
                  void 0 !== n[e] || v(n, e)
                    ? i[e] || _(o[e])
                    : ((i[e] = !0), k(t));
                }),
                  Object.keys(n).forEach(function(e) {
                    void 0 !== o[e] || v(o, e) || ((i[e] = !1), k(t));
                  });
            }
          }
        }
        function N(e) {
          for (
            var r = e.base, t = e.draft, n = Object.keys(t), o = n.length - 1;
            o >= 0;
            o--
          )
            if (void 0 === r[n[o]] && !v(r, n[o])) return !0;
          return n.length !== Object.keys(r).length;
        }
        function C(e) {
          var r = e.draft;
          if (r.length !== e.base.length) return !0;
          var t = Object.getOwnPropertyDescriptor(r, r.length - 1);
          return !(!t || t.get);
        }
        function R(e, r, t) {
          Object.defineProperty(e, r, {
            value: t,
            enumerable: !1,
            writable: !0,
          });
        }
        var U = Object.freeze({
            scopes: m,
            currentScope: w,
            willFinalize: O,
            createDraft: P,
          }),
          K = [],
          T = function() {
            return K[K.length - 1];
          };
        function M() {}
        function $(e, r) {
          var t = {
              scope: r ? r.scope : T(),
              modified: !1,
              finalized: !1,
              assigned: {},
              parent: r,
              base: e,
              draft: null,
              drafts: {},
              copy: null,
              revoke: null,
            },
            n = Array.isArray(e)
              ? Proxy.revocable([t], J)
              : Proxy.revocable(t, q),
            o = n.revoke,
            i = n.proxy;
          return (t.draft = i), (t.revoke = o), t.scope.push(t), i;
        }
        var q = {
            get: G,
            has: function(e, r) {
              return r in B(e);
            },
            ownKeys: function(e) {
              return Reflect.ownKeys(B(e));
            },
            set: H,
            deleteProperty: L,
            getOwnPropertyDescriptor: Q,
            defineProperty: function() {
              throw new Error(
                'Object.defineProperty() cannot be used on an Immer draft'
              );
            },
            getPrototypeOf: function(e) {
              return Object.getPrototypeOf(e.base);
            },
            setPrototypeOf: function() {
              throw new Error(
                'Object.setPrototypeOf() cannot be used on an Immer draft'
              );
            },
          },
          J = {};
        function B(e) {
          return e.copy || e.base;
        }
        function G(e, r) {
          if (r === f) return e;
          var t = e.drafts;
          if (!e.modified && v(t, r)) return t[r];
          var n = B(e)[r];
          if (e.finalized || !u(n)) return n;
          if (e.modified) {
            if (n !== e.base[r]) return n;
            t = e.copy;
          }
          return (t[r] = $(n, e));
        }
        function H(e, r, t) {
          if (!e.modified) {
            if (
              t
                ? b(e.base[r], t) || t === e.drafts[r]
                : b(e.base[r], t) && r in e.base
            )
              return !0;
            V(e);
          }
          return (e.assigned[r] = !0), (e.copy[r] = t), !0;
        }
        function L(e, r) {
          return (
            (void 0 !== e.base[r] || r in e.base) &&
              ((e.assigned[r] = !1), V(e)),
            e.copy && delete e.copy[r],
            !0
          );
        }
        function Q(e, r) {
          var t = B(e),
            n = Reflect.getOwnPropertyDescriptor(t, r);
          return (
            n &&
              ((n.writable = !0),
              (n.configurable = !Array.isArray(t) || 'length' !== r)),
            n
          );
        }
        function V(e) {
          e.modified ||
            ((e.modified = !0),
            (e.copy = l(d(e.base), e.drafts)),
            (e.drafts = null),
            e.parent && V(e.parent));
        }
        h(q, function(e, r) {
          J[e] = function() {
            return (arguments[0] = arguments[0][0]), r.apply(this, arguments);
          };
        }),
          (J.deleteProperty = function(e, r) {
            if (isNaN(parseInt(r)))
              throw new Error('Immer only supports deleting array indices');
            return q.deleteProperty.call(this, e[0], r);
          }),
          (J.set = function(e, r, t) {
            if ('length' !== r && isNaN(parseInt(r)))
              throw new Error(
                "Immer only supports setting array indices and the 'length' property"
              );
            return q.set.call(this, e[0], r, t);
          });
        var W = Object.freeze({
          scopes: K,
          currentScope: T,
          willFinalize: M,
          createDraft: $,
        });
        function X(e, r, t, n) {
          Array.isArray(e.base) ? Y(e, r, t, n) : Z(e, r, t, n);
        }
        function Y(e, r, t, n) {
          for (
            var o = e.base,
              i = e.copy,
              a = e.assigned,
              f = Math.min(o.length, i.length),
              s = 0;
            s < f;
            s++
          )
            if (a[s] && o[s] !== i[s]) {
              var u = r.concat(s);
              t.push({ op: 'replace', path: u, value: i[s] }),
                n.push({ op: 'replace', path: u, value: o[s] });
            }
          if (f < i.length) {
            for (var c = f; c < i.length; c++)
              t.push({ op: 'add', path: r.concat(c), value: i[c] });
            n.push({
              op: 'replace',
              path: r.concat('length'),
              value: o.length,
            });
          } else if (f < o.length) {
            t.push({
              op: 'replace',
              path: r.concat('length'),
              value: i.length,
            });
            for (var l = f; l < o.length; l++)
              n.push({ op: 'add', path: r.concat(l), value: o[l] });
          }
        }
        function Z(e, r, t, n) {
          var o = e.base,
            i = e.copy;
          h(e.assigned, function(e, a) {
            var f = o[e],
              s = i[e],
              u = a ? (e in o ? 'replace' : 'add') : 'remove';
            if (f !== s || 'replace' !== u) {
              var c = r.concat(e);
              t.push(
                'remove' === u
                  ? { op: u, path: c }
                  : { op: u, path: c, value: s }
              ),
                n.push(
                  'add' === u
                    ? { op: 'remove', path: c }
                    : 'remove' === u
                    ? { op: 'add', path: c, value: f }
                    : { op: 'replace', path: c, value: f }
                );
            }
          });
        }
        function ee(e, t) {
          for (var n = 0; n < t.length; n++) {
            var o = t[n],
              i = o.path;
            if (0 === i.length && 'replace' === o.op) e = o.value;
            else {
              for (var a = e, f = 0; f < i.length - 1; f++)
                if (
                  !(a = a[i[f]]) ||
                  'object' !== (void 0 === a ? 'undefined' : r(a))
                )
                  throw new Error(
                    "Cannot apply patch, path doesn't resolve: " + i.join('/')
                  );
              var s = i[i.length - 1];
              switch (o.op) {
                case 'replace':
                case 'add':
                  a[s] = o.value;
                  break;
                case 'remove':
                  if (Array.isArray(a)) {
                    if (s !== a.length - 1)
                      throw new Error(
                        'Only the last index of an array can be removed, index: ' +
                          s +
                          ', length: ' +
                          a.length
                      );
                    a.length -= 1;
                  } else delete a[s];
                  break;
                default:
                  throw new Error('Unsupported patch operation: ' + o.op);
              }
            }
          }
          return e;
        }
        function re() {}
        var te = {
            useProxies:
              'undefined' != typeof Proxy && 'undefined' != typeof Reflect,
            autoFreeze: void 0 === e && 'verifyMinified' === re.name,
            onAssign: null,
            onDelete: null,
            onCopy: null,
          },
          ne = (function() {
            function e(r) {
              t(this, e),
                l(this, te, r),
                this.setUseProxies(this.useProxies),
                (this.produce = this.produce.bind(this));
            }
            return (
              n(e, [
                {
                  key: 'produce',
                  value: function(e, r, t) {
                    var n = this;
                    if ('function' == typeof e && 'function' != typeof r) {
                      var o = r;
                      return (
                        (r = e),
                        function() {
                          for (
                            var e = arguments.length,
                              t = Array(e > 1 ? e - 1 : 0),
                              i = 1;
                            i < e;
                            i++
                          )
                            t[i - 1] = arguments[i];
                          var a =
                            arguments.length > 0 && void 0 !== arguments[0]
                              ? arguments[0]
                              : o;
                          return n.produce(a, function(e) {
                            var n;
                            return (n = r).call.apply(n, [e, e].concat(t));
                          });
                        }
                      );
                    }
                    if ('function' != typeof r)
                      throw new Error(
                        'if first argument is not a function, the second argument to produce should be a function'
                      );
                    if (void 0 !== t && 'function' != typeof t)
                      throw new Error(
                        'the third argument of a producer should not be set or a function'
                      );
                    var a = void 0;
                    if (u(e)) {
                      this.scopes.push([]);
                      var s = this.createDraft(e);
                      try {
                        (a = r.call(s, s)), this.willFinalize(a, s, !!t);
                        var c = t && [],
                          l = t && [];
                        if (void 0 === a || a === s)
                          a = this.finalize(s, [], c, l);
                        else {
                          if (s[f].modified)
                            throw new Error(
                              'An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.'
                            );
                          u(a) && (a = this.finalize(a)),
                            t &&
                              (c.push({ op: 'replace', path: [], value: a }),
                              l.push({ op: 'replace', path: [], value: e }));
                        }
                      } finally {
                        this.currentScope().forEach(function(e) {
                          return e.revoke();
                        }),
                          this.scopes.pop();
                      }
                      t && t(c, l);
                    } else if (void 0 === (a = r(e))) return e;
                    return a === i ? void 0 : a;
                  },
                },
                {
                  key: 'setAutoFreeze',
                  value: function(e) {
                    this.autoFreeze = e;
                  },
                },
                {
                  key: 'setUseProxies',
                  value: function(e) {
                    (this.useProxies = e), l(this, e ? W : U);
                  },
                },
                {
                  key: 'applyPatches',
                  value: function(e, r) {
                    return s(e)
                      ? ee(e, r)
                      : this.produce(e, function(e) {
                          return ee(e, r);
                        });
                  },
                },
                {
                  key: 'finalize',
                  value: function(e, r, t, n) {
                    var o = this,
                      i = e[f];
                    if (!i)
                      return Object.isFrozen(e) ? e : this.finalizeTree(e);
                    if (i.scope !== this.currentScope()) return e;
                    if (!i.modified) return i.base;
                    if (!i.finalized) {
                      if (
                        ((i.finalized = !0),
                        this.finalizeTree(i.draft, r, t, n),
                        this.onDelete)
                      )
                        if (this.useProxies) {
                          var a = i.assigned;
                          for (var s in a) a[s] || this.onDelete(i, s);
                        } else {
                          var u = i.base,
                            c = i.copy;
                          h(u, function(e) {
                            v(c, e) || o.onDelete(i, e);
                          });
                        }
                      this.onCopy && this.onCopy(i),
                        this.autoFreeze &&
                          1 === this.scopes.length &&
                          Object.freeze(i.copy),
                        t && X(i, r, t, n);
                    }
                    return i.copy;
                  },
                },
                {
                  key: 'finalizeTree',
                  value: function(e, r, t, n) {
                    var o = this,
                      i = e[f];
                    i &&
                      (this.useProxies ||
                        ((i.finalizing = !0),
                        (i.copy = d(i.draft, !0)),
                        (i.finalizing = !1)),
                      (e = i.copy));
                    var a = this.onAssign;
                    return (
                      h(e, function f(c, l, p) {
                        if (l === p)
                          throw Error('Immer forbids circular references');
                        var d = !!i && p === e;
                        if (s(l)) {
                          if (
                            ((l =
                              t && d && !i.assigned[c]
                                ? o.finalize(l, r.concat(c), t, n)
                                : o.finalize(l)),
                            Array.isArray(p) || y(p, c)
                              ? (p[c] = l)
                              : Object.defineProperty(p, c, { value: l }),
                            d && l === i.base[c])
                          )
                            return;
                        } else {
                          if (d && b(l, i.base[c])) return;
                          u(l) && !Object.isFrozen(l) && h(l, f);
                        }
                        d && a && a(i, c, l);
                      }),
                      e
                    );
                  },
                },
              ]),
              e
            );
          })();
        exports.Immer = ne;
        var oe = new ne(),
          ie = oe.produce;
        exports.produce = ie;
        var ae = oe.setAutoFreeze.bind(oe);
        exports.setAutoFreeze = ae;
        var fe = oe.setUseProxies.bind(oe);
        exports.setUseProxies = fe;
        var se = oe.applyPatches.bind(oe);
        exports.applyPatches = se;
        var ue = ie;
        exports.default = ue;
      },
      { process: 'pBGv' },
    ],
    A28J: [
      function(require, module, exports) {
        var r = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
          e = [
            'source',
            'protocol',
            'authority',
            'userInfo',
            'user',
            'password',
            'host',
            'port',
            'relative',
            'path',
            'directory',
            'file',
            'query',
            'anchor',
          ];
        module.exports = function(t) {
          var s = t,
            o = t.indexOf('['),
            a = t.indexOf(']');
          -1 != o &&
            -1 != a &&
            (t =
              t.substring(0, o) +
              t.substring(o, a).replace(/:/g, ';') +
              t.substring(a, t.length));
          for (var u = r.exec(t || ''), i = {}, h = 14; h--; )
            i[e[h]] = u[h] || '';
          return (
            -1 != o &&
              -1 != a &&
              ((i.source = s),
              (i.host = i.host
                .substring(1, i.host.length - 1)
                .replace(/;/g, ':')),
              (i.authority = i.authority
                .replace('[', '')
                .replace(']', '')
                .replace(/;/g, ':')),
              (i.ipv6uri = !0)),
            i
          );
        };
      },
      {},
    ],
    xsBo: [
      function(require, module, exports) {
        var s = 1e3,
          e = 60 * s,
          r = 60 * e,
          a = 24 * r,
          n = 365.25 * a;
        function c(c) {
          if (!((c = String(c)).length > 100)) {
            var t = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
              c
            );
            if (t) {
              var i = parseFloat(t[1]);
              switch ((t[2] || 'ms').toLowerCase()) {
                case 'years':
                case 'year':
                case 'yrs':
                case 'yr':
                case 'y':
                  return i * n;
                case 'days':
                case 'day':
                case 'd':
                  return i * a;
                case 'hours':
                case 'hour':
                case 'hrs':
                case 'hr':
                case 'h':
                  return i * r;
                case 'minutes':
                case 'minute':
                case 'mins':
                case 'min':
                case 'm':
                  return i * e;
                case 'seconds':
                case 'second':
                case 'secs':
                case 'sec':
                case 's':
                  return i * s;
                case 'milliseconds':
                case 'millisecond':
                case 'msecs':
                case 'msec':
                case 'ms':
                  return i;
                default:
                  return;
              }
            }
          }
        }
        function t(n) {
          return n >= a
            ? Math.round(n / a) + 'd'
            : n >= r
            ? Math.round(n / r) + 'h'
            : n >= e
            ? Math.round(n / e) + 'm'
            : n >= s
            ? Math.round(n / s) + 's'
            : n + 'ms';
        }
        function i(n) {
          return (
            o(n, a, 'day') ||
            o(n, r, 'hour') ||
            o(n, e, 'minute') ||
            o(n, s, 'second') ||
            n + ' ms'
          );
        }
        function o(s, e, r) {
          if (!(s < e))
            return s < 1.5 * e
              ? Math.floor(s / e) + ' ' + r
              : Math.ceil(s / e) + ' ' + r + 's';
        }
        module.exports = function(s, e) {
          e = e || {};
          var r = typeof s;
          if ('string' === r && s.length > 0) return c(s);
          if ('number' === r && !1 === isNaN(s)) return e.long ? i(s) : t(s);
          throw new Error(
            'val is not a non-empty string or a valid number. val=' +
              JSON.stringify(s)
          );
        };
      },
      {},
    ],
    ZnYJ: [
      function(require, module, exports) {
        function e(e) {
          var r,
            s = 0;
          for (r in e) (s = (s << 5) - s + e.charCodeAt(r)), (s |= 0);
          return exports.colors[Math.abs(s) % exports.colors.length];
        }
        function r(r) {
          var t;
          function o() {
            if (o.enabled) {
              var e = o,
                r = +new Date(),
                s = r - (t || r);
              (e.diff = s), (e.prev = t), (e.curr = r), (t = r);
              for (
                var n = new Array(arguments.length), p = 0;
                p < n.length;
                p++
              )
                n[p] = arguments[p];
              (n[0] = exports.coerce(n[0])),
                'string' != typeof n[0] && n.unshift('%O');
              var a = 0;
              (n[0] = n[0].replace(/%([a-zA-Z%])/g, function(r, s) {
                if ('%%' === r) return r;
                a++;
                var t = exports.formatters[s];
                if ('function' == typeof t) {
                  var o = n[a];
                  (r = t.call(e, o)), n.splice(a, 1), a--;
                }
                return r;
              })),
                exports.formatArgs.call(e, n),
                (o.log || exports.log || console.log.bind(console)).apply(e, n);
            }
          }
          return (
            (o.namespace = r),
            (o.enabled = exports.enabled(r)),
            (o.useColors = exports.useColors()),
            (o.color = e(r)),
            (o.destroy = s),
            'function' == typeof exports.init && exports.init(o),
            exports.instances.push(o),
            o
          );
        }
        function s() {
          var e = exports.instances.indexOf(this);
          return -1 !== e && (exports.instances.splice(e, 1), !0);
        }
        function t(e) {
          var r;
          exports.save(e), (exports.names = []), (exports.skips = []);
          var s = ('string' == typeof e ? e : '').split(/[\s,]+/),
            t = s.length;
          for (r = 0; r < t; r++)
            s[r] &&
              ('-' === (e = s[r].replace(/\*/g, '.*?'))[0]
                ? exports.skips.push(new RegExp('^' + e.substr(1) + '$'))
                : exports.names.push(new RegExp('^' + e + '$')));
          for (r = 0; r < exports.instances.length; r++) {
            var o = exports.instances[r];
            o.enabled = exports.enabled(o.namespace);
          }
        }
        function o() {
          exports.enable('');
        }
        function n(e) {
          if ('*' === e[e.length - 1]) return !0;
          var r, s;
          for (r = 0, s = exports.skips.length; r < s; r++)
            if (exports.skips[r].test(e)) return !1;
          for (r = 0, s = exports.names.length; r < s; r++)
            if (exports.names[r].test(e)) return !0;
          return !1;
        }
        function p(e) {
          return e instanceof Error ? e.stack || e.message : e;
        }
        (exports = module.exports = r.debug = r.default = r),
          (exports.coerce = p),
          (exports.disable = o),
          (exports.enable = t),
          (exports.enabled = n),
          (exports.humanize = require('ms')),
          (exports.instances = []),
          (exports.names = []),
          (exports.skips = []),
          (exports.formatters = {});
      },
      { ms: 'xsBo' },
    ],
    '1tjN': [
      function(require, module, exports) {
        var process = require('process');
        var e = require('process');
        function o() {
          return (
            !(
              'undefined' == typeof window ||
              !window.process ||
              'renderer' !== window.process.type
            ) ||
            (('undefined' == typeof navigator ||
              !navigator.userAgent ||
              !navigator.userAgent
                .toLowerCase()
                .match(/(edge|trident)\/(\d+)/)) &&
              (('undefined' != typeof document &&
                document.documentElement &&
                document.documentElement.style &&
                document.documentElement.style.WebkitAppearance) ||
                ('undefined' != typeof window &&
                  window.console &&
                  (window.console.firebug ||
                    (window.console.exception && window.console.table))) ||
                ('undefined' != typeof navigator &&
                  navigator.userAgent &&
                  navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) &&
                  parseInt(RegExp.$1, 10) >= 31) ||
                ('undefined' != typeof navigator &&
                  navigator.userAgent &&
                  navigator.userAgent
                    .toLowerCase()
                    .match(/applewebkit\/(\d+)/))))
          );
        }
        function C(e) {
          var o = this.useColors;
          if (
            ((e[0] =
              (o ? '%c' : '') +
              this.namespace +
              (o ? ' %c' : ' ') +
              e[0] +
              (o ? '%c ' : ' ') +
              '+' +
              exports.humanize(this.diff)),
            o)
          ) {
            var C = 'color: ' + this.color;
            e.splice(1, 0, C, 'color: inherit');
            var t = 0,
              r = 0;
            e[0].replace(/%[a-zA-Z%]/g, function(e) {
              '%%' !== e && (t++, '%c' === e && (r = t));
            }),
              e.splice(r, 0, C);
          }
        }
        function t() {
          return (
            'object' == typeof console &&
            console.log &&
            Function.prototype.apply.call(console.log, console, arguments)
          );
        }
        function r(e) {
          try {
            null == e
              ? exports.storage.removeItem('debug')
              : (exports.storage.debug = e);
          } catch (o) {}
        }
        function n() {
          var o;
          try {
            o = exports.storage.debug;
          } catch (C) {}
          return !o && void 0 !== e && 'env' in e && (o = void 0), o;
        }
        function F() {
          try {
            return window.localStorage;
          } catch (e) {}
        }
        (exports = module.exports = require('./debug')),
          (exports.log = t),
          (exports.formatArgs = C),
          (exports.save = r),
          (exports.load = n),
          (exports.useColors = o),
          (exports.storage =
            'undefined' != typeof chrome && void 0 !== chrome.storage
              ? chrome.storage.local
              : F()),
          (exports.colors = [
            '#0000CC',
            '#0000FF',
            '#0033CC',
            '#0033FF',
            '#0066CC',
            '#0066FF',
            '#0099CC',
            '#0099FF',
            '#00CC00',
            '#00CC33',
            '#00CC66',
            '#00CC99',
            '#00CCCC',
            '#00CCFF',
            '#3300CC',
            '#3300FF',
            '#3333CC',
            '#3333FF',
            '#3366CC',
            '#3366FF',
            '#3399CC',
            '#3399FF',
            '#33CC00',
            '#33CC33',
            '#33CC66',
            '#33CC99',
            '#33CCCC',
            '#33CCFF',
            '#6600CC',
            '#6600FF',
            '#6633CC',
            '#6633FF',
            '#66CC00',
            '#66CC33',
            '#9900CC',
            '#9900FF',
            '#9933CC',
            '#9933FF',
            '#99CC00',
            '#99CC33',
            '#CC0000',
            '#CC0033',
            '#CC0066',
            '#CC0099',
            '#CC00CC',
            '#CC00FF',
            '#CC3300',
            '#CC3333',
            '#CC3366',
            '#CC3399',
            '#CC33CC',
            '#CC33FF',
            '#CC6600',
            '#CC6633',
            '#CC9900',
            '#CC9933',
            '#CCCC00',
            '#CCCC33',
            '#FF0000',
            '#FF0033',
            '#FF0066',
            '#FF0099',
            '#FF00CC',
            '#FF00FF',
            '#FF3300',
            '#FF3333',
            '#FF3366',
            '#FF3399',
            '#FF33CC',
            '#FF33FF',
            '#FF6600',
            '#FF6633',
            '#FF9900',
            '#FF9933',
            '#FFCC00',
            '#FFCC33',
          ]),
          (exports.formatters.j = function(e) {
            try {
              return JSON.stringify(e);
            } catch (o) {
              return '[UnexpectedJSONParseError]: ' + o.message;
            }
          }),
          exports.enable(n());
      },
      { './debug': 'ZnYJ', process: 'pBGv' },
    ],
    MMDw: [
      function(require, module, exports) {
        var o = require('parseuri'),
          t = require('debug')('socket.io-client:url');
        function r(r, p) {
          var s = r;
          (p = p || ('undefined' != typeof location && location)),
            null == r && (r = p.protocol + '//' + p.host),
            'string' == typeof r &&
              ('/' === r.charAt(0) &&
                (r = '/' === r.charAt(1) ? p.protocol + r : p.host + r),
              /^(https?|wss?):\/\//.test(r) ||
                (t('protocol-less url %s', r),
                (r = void 0 !== p ? p.protocol + '//' + r : 'https://' + r)),
              t('parse %s', r),
              (s = o(r))),
            s.port ||
              (/^(http|ws)$/.test(s.protocol)
                ? (s.port = '80')
                : /^(http|ws)s$/.test(s.protocol) && (s.port = '443')),
            (s.path = s.path || '/');
          var e = -1 !== s.host.indexOf(':') ? '[' + s.host + ']' : s.host;
          return (
            (s.id = s.protocol + '://' + e + ':' + s.port),
            (s.href =
              s.protocol +
              '://' +
              e +
              (p && p.port === s.port ? '' : ':' + s.port)),
            s
          );
        }
        module.exports = r;
      },
      { parseuri: 'A28J', debug: '1tjN' },
    ],
    XUqb: [
      function(require, module, exports) {
        function t(t) {
          if (t) return e(t);
        }
        function e(e) {
          for (var s in t.prototype) e[s] = t.prototype[s];
          return e;
        }
        'undefined' != typeof module && (module.exports = t),
          (t.prototype.on = t.prototype.addEventListener = function(t, e) {
            return (
              (this._callbacks = this._callbacks || {}),
              (this._callbacks['$' + t] = this._callbacks['$' + t] || []).push(
                e
              ),
              this
            );
          }),
          (t.prototype.once = function(t, e) {
            function s() {
              this.off(t, s), e.apply(this, arguments);
            }
            return (s.fn = e), this.on(t, s), this;
          }),
          (t.prototype.off = t.prototype.removeListener = t.prototype.removeAllListeners = t.prototype.removeEventListener = function(
            t,
            e
          ) {
            if (
              ((this._callbacks = this._callbacks || {}), 0 == arguments.length)
            )
              return (this._callbacks = {}), this;
            var s,
              i = this._callbacks['$' + t];
            if (!i) return this;
            if (1 == arguments.length)
              return delete this._callbacks['$' + t], this;
            for (var r = 0; r < i.length; r++)
              if ((s = i[r]) === e || s.fn === e) {
                i.splice(r, 1);
                break;
              }
            return this;
          }),
          (t.prototype.emit = function(t) {
            this._callbacks = this._callbacks || {};
            var e = [].slice.call(arguments, 1),
              s = this._callbacks['$' + t];
            if (s)
              for (var i = 0, r = (s = s.slice(0)).length; i < r; ++i)
                s[i].apply(this, e);
            return this;
          }),
          (t.prototype.listeners = function(t) {
            return (
              (this._callbacks = this._callbacks || {}),
              this._callbacks['$' + t] || []
            );
          }),
          (t.prototype.hasListeners = function(t) {
            return !!this.listeners(t).length;
          });
      },
      {},
    ],
    Bi1L: [
      function(require, module, exports) {
        var r = {}.toString;
        module.exports =
          Array.isArray ||
          function(t) {
            return '[object Array]' == r.call(t);
          };
      },
      {},
    ],
    yh9p: [
      function(require, module, exports) {
        'use strict';
        (exports.byteLength = u),
          (exports.toByteArray = i),
          (exports.fromByteArray = d);
        for (
          var r = [],
            t = [],
            e = 'undefined' != typeof Uint8Array ? Uint8Array : Array,
            n =
              'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
            o = 0,
            a = n.length;
          o < a;
          ++o
        )
          (r[o] = n[o]), (t[n.charCodeAt(o)] = o);
        function h(r) {
          var t = r.length;
          if (t % 4 > 0)
            throw new Error('Invalid string. Length must be a multiple of 4');
          var e = r.indexOf('=');
          return -1 === e && (e = t), [e, e === t ? 0 : 4 - (e % 4)];
        }
        function u(r) {
          var t = h(r),
            e = t[0],
            n = t[1];
          return (3 * (e + n)) / 4 - n;
        }
        function c(r, t, e) {
          return (3 * (t + e)) / 4 - e;
        }
        function i(r) {
          var n,
            o,
            a = h(r),
            u = a[0],
            i = a[1],
            f = new e(c(r, u, i)),
            A = 0,
            d = i > 0 ? u - 4 : u;
          for (o = 0; o < d; o += 4)
            (n =
              (t[r.charCodeAt(o)] << 18) |
              (t[r.charCodeAt(o + 1)] << 12) |
              (t[r.charCodeAt(o + 2)] << 6) |
              t[r.charCodeAt(o + 3)]),
              (f[A++] = (n >> 16) & 255),
              (f[A++] = (n >> 8) & 255),
              (f[A++] = 255 & n);
          return (
            2 === i &&
              ((n = (t[r.charCodeAt(o)] << 2) | (t[r.charCodeAt(o + 1)] >> 4)),
              (f[A++] = 255 & n)),
            1 === i &&
              ((n =
                (t[r.charCodeAt(o)] << 10) |
                (t[r.charCodeAt(o + 1)] << 4) |
                (t[r.charCodeAt(o + 2)] >> 2)),
              (f[A++] = (n >> 8) & 255),
              (f[A++] = 255 & n)),
            f
          );
        }
        function f(t) {
          return (
            r[(t >> 18) & 63] + r[(t >> 12) & 63] + r[(t >> 6) & 63] + r[63 & t]
          );
        }
        function A(r, t, e) {
          for (var n, o = [], a = t; a < e; a += 3)
            (n =
              ((r[a] << 16) & 16711680) +
              ((r[a + 1] << 8) & 65280) +
              (255 & r[a + 2])),
              o.push(f(n));
          return o.join('');
        }
        function d(t) {
          for (
            var e, n = t.length, o = n % 3, a = [], h = 0, u = n - o;
            h < u;
            h += 16383
          )
            a.push(A(t, h, h + 16383 > u ? u : h + 16383));
          return (
            1 === o
              ? ((e = t[n - 1]), a.push(r[e >> 2] + r[(e << 4) & 63] + '=='))
              : 2 === o &&
                ((e = (t[n - 2] << 8) + t[n - 1]),
                a.push(r[e >> 10] + r[(e >> 4) & 63] + r[(e << 2) & 63] + '=')),
            a.join('')
          );
        }
        (t['-'.charCodeAt(0)] = 62), (t['_'.charCodeAt(0)] = 63);
      },
      {},
    ],
    JgNJ: [
      function(require, module, exports) {
        (exports.read = function(a, o, t, r, h) {
          var M,
            p,
            w = 8 * h - r - 1,
            f = (1 << w) - 1,
            e = f >> 1,
            i = -7,
            N = t ? h - 1 : 0,
            n = t ? -1 : 1,
            s = a[o + N];
          for (
            N += n, M = s & ((1 << -i) - 1), s >>= -i, i += w;
            i > 0;
            M = 256 * M + a[o + N], N += n, i -= 8
          );
          for (
            p = M & ((1 << -i) - 1), M >>= -i, i += r;
            i > 0;
            p = 256 * p + a[o + N], N += n, i -= 8
          );
          if (0 === M) M = 1 - e;
          else {
            if (M === f) return p ? NaN : (1 / 0) * (s ? -1 : 1);
            (p += Math.pow(2, r)), (M -= e);
          }
          return (s ? -1 : 1) * p * Math.pow(2, M - r);
        }),
          (exports.write = function(a, o, t, r, h, M) {
            var p,
              w,
              f,
              e = 8 * M - h - 1,
              i = (1 << e) - 1,
              N = i >> 1,
              n = 23 === h ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
              s = r ? 0 : M - 1,
              u = r ? 1 : -1,
              l = o < 0 || (0 === o && 1 / o < 0) ? 1 : 0;
            for (
              o = Math.abs(o),
                isNaN(o) || o === 1 / 0
                  ? ((w = isNaN(o) ? 1 : 0), (p = i))
                  : ((p = Math.floor(Math.log(o) / Math.LN2)),
                    o * (f = Math.pow(2, -p)) < 1 && (p--, (f *= 2)),
                    (o += p + N >= 1 ? n / f : n * Math.pow(2, 1 - N)) * f >=
                      2 && (p++, (f /= 2)),
                    p + N >= i
                      ? ((w = 0), (p = i))
                      : p + N >= 1
                      ? ((w = (o * f - 1) * Math.pow(2, h)), (p += N))
                      : ((w = o * Math.pow(2, N - 1) * Math.pow(2, h)),
                        (p = 0)));
              h >= 8;
              a[t + s] = 255 & w, s += u, w /= 256, h -= 8
            );
            for (
              p = (p << h) | w, e += h;
              e > 0;
              a[t + s] = 255 & p, s += u, p /= 256, e -= 8
            );
            a[t + s - u] |= 128 * l;
          });
      },
      {},
    ],
    dskh: [
      function(require, module, exports) {
        var global = arguments[3];
        var t = arguments[3],
          r = require('base64-js'),
          e = require('ieee754'),
          n = require('isarray');
        function i() {
          try {
            var t = new Uint8Array(1);
            return (
              (t.__proto__ = {
                __proto__: Uint8Array.prototype,
                foo: function() {
                  return 42;
                },
              }),
              42 === t.foo() &&
                'function' == typeof t.subarray &&
                0 === t.subarray(1, 1).byteLength
            );
          } catch (r) {
            return !1;
          }
        }
        function o() {
          return f.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
        }
        function u(t, r) {
          if (o() < r) throw new RangeError('Invalid typed array length');
          return (
            f.TYPED_ARRAY_SUPPORT
              ? ((t = new Uint8Array(r)).__proto__ = f.prototype)
              : (null === t && (t = new f(r)), (t.length = r)),
            t
          );
        }
        function f(t, r, e) {
          if (!(f.TYPED_ARRAY_SUPPORT || this instanceof f))
            return new f(t, r, e);
          if ('number' == typeof t) {
            if ('string' == typeof r)
              throw new Error(
                'If encoding is specified then the first argument must be a string'
              );
            return c(this, t);
          }
          return s(this, t, r, e);
        }
        function s(t, r, e, n) {
          if ('number' == typeof r)
            throw new TypeError('"value" argument must not be a number');
          return 'undefined' != typeof ArrayBuffer && r instanceof ArrayBuffer
            ? g(t, r, e, n)
            : 'string' == typeof r
            ? l(t, r, e)
            : y(t, r);
        }
        function h(t) {
          if ('number' != typeof t)
            throw new TypeError('"size" argument must be a number');
          if (t < 0)
            throw new RangeError('"size" argument must not be negative');
        }
        function a(t, r, e, n) {
          return (
            h(r),
            r <= 0
              ? u(t, r)
              : void 0 !== e
              ? 'string' == typeof n
                ? u(t, r).fill(e, n)
                : u(t, r).fill(e)
              : u(t, r)
          );
        }
        function c(t, r) {
          if ((h(r), (t = u(t, r < 0 ? 0 : 0 | w(r))), !f.TYPED_ARRAY_SUPPORT))
            for (var e = 0; e < r; ++e) t[e] = 0;
          return t;
        }
        function l(t, r, e) {
          if (
            (('string' == typeof e && '' !== e) || (e = 'utf8'),
            !f.isEncoding(e))
          )
            throw new TypeError('"encoding" must be a valid string encoding');
          var n = 0 | v(r, e),
            i = (t = u(t, n)).write(r, e);
          return i !== n && (t = t.slice(0, i)), t;
        }
        function p(t, r) {
          var e = r.length < 0 ? 0 : 0 | w(r.length);
          t = u(t, e);
          for (var n = 0; n < e; n += 1) t[n] = 255 & r[n];
          return t;
        }
        function g(t, r, e, n) {
          if ((r.byteLength, e < 0 || r.byteLength < e))
            throw new RangeError("'offset' is out of bounds");
          if (r.byteLength < e + (n || 0))
            throw new RangeError("'length' is out of bounds");
          return (
            (r =
              void 0 === e && void 0 === n
                ? new Uint8Array(r)
                : void 0 === n
                ? new Uint8Array(r, e)
                : new Uint8Array(r, e, n)),
            f.TYPED_ARRAY_SUPPORT
              ? ((t = r).__proto__ = f.prototype)
              : (t = p(t, r)),
            t
          );
        }
        function y(t, r) {
          if (f.isBuffer(r)) {
            var e = 0 | w(r.length);
            return 0 === (t = u(t, e)).length ? t : (r.copy(t, 0, 0, e), t);
          }
          if (r) {
            if (
              ('undefined' != typeof ArrayBuffer &&
                r.buffer instanceof ArrayBuffer) ||
              'length' in r
            )
              return 'number' != typeof r.length || W(r.length)
                ? u(t, 0)
                : p(t, r);
            if ('Buffer' === r.type && n(r.data)) return p(t, r.data);
          }
          throw new TypeError(
            'First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.'
          );
        }
        function w(t) {
          if (t >= o())
            throw new RangeError(
              'Attempt to allocate Buffer larger than maximum size: 0x' +
                o().toString(16) +
                ' bytes'
            );
          return 0 | t;
        }
        function d(t) {
          return +t != t && (t = 0), f.alloc(+t);
        }
        function v(t, r) {
          if (f.isBuffer(t)) return t.length;
          if (
            'undefined' != typeof ArrayBuffer &&
            'function' == typeof ArrayBuffer.isView &&
            (ArrayBuffer.isView(t) || t instanceof ArrayBuffer)
          )
            return t.byteLength;
          'string' != typeof t && (t = '' + t);
          var e = t.length;
          if (0 === e) return 0;
          for (var n = !1; ; )
            switch (r) {
              case 'ascii':
              case 'latin1':
              case 'binary':
                return e;
              case 'utf8':
              case 'utf-8':
              case void 0:
                return $(t).length;
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return 2 * e;
              case 'hex':
                return e >>> 1;
              case 'base64':
                return K(t).length;
              default:
                if (n) return $(t).length;
                (r = ('' + r).toLowerCase()), (n = !0);
            }
        }
        function E(t, r, e) {
          var n = !1;
          if (((void 0 === r || r < 0) && (r = 0), r > this.length)) return '';
          if (((void 0 === e || e > this.length) && (e = this.length), e <= 0))
            return '';
          if ((e >>>= 0) <= (r >>>= 0)) return '';
          for (t || (t = 'utf8'); ; )
            switch (t) {
              case 'hex':
                return x(this, r, e);
              case 'utf8':
              case 'utf-8':
                return Y(this, r, e);
              case 'ascii':
                return L(this, r, e);
              case 'latin1':
              case 'binary':
                return D(this, r, e);
              case 'base64':
                return S(this, r, e);
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return C(this, r, e);
              default:
                if (n) throw new TypeError('Unknown encoding: ' + t);
                (t = (t + '').toLowerCase()), (n = !0);
            }
        }
        function b(t, r, e) {
          var n = t[r];
          (t[r] = t[e]), (t[e] = n);
        }
        function R(t, r, e, n, i) {
          if (0 === t.length) return -1;
          if (
            ('string' == typeof e
              ? ((n = e), (e = 0))
              : e > 2147483647
              ? (e = 2147483647)
              : e < -2147483648 && (e = -2147483648),
            (e = +e),
            isNaN(e) && (e = i ? 0 : t.length - 1),
            e < 0 && (e = t.length + e),
            e >= t.length)
          ) {
            if (i) return -1;
            e = t.length - 1;
          } else if (e < 0) {
            if (!i) return -1;
            e = 0;
          }
          if (('string' == typeof r && (r = f.from(r, n)), f.isBuffer(r)))
            return 0 === r.length ? -1 : _(t, r, e, n, i);
          if ('number' == typeof r)
            return (
              (r &= 255),
              f.TYPED_ARRAY_SUPPORT &&
              'function' == typeof Uint8Array.prototype.indexOf
                ? i
                  ? Uint8Array.prototype.indexOf.call(t, r, e)
                  : Uint8Array.prototype.lastIndexOf.call(t, r, e)
                : _(t, [r], e, n, i)
            );
          throw new TypeError('val must be string, number or Buffer');
        }
        function _(t, r, e, n, i) {
          var o,
            u = 1,
            f = t.length,
            s = r.length;
          if (
            void 0 !== n &&
            ('ucs2' === (n = String(n).toLowerCase()) ||
              'ucs-2' === n ||
              'utf16le' === n ||
              'utf-16le' === n)
          ) {
            if (t.length < 2 || r.length < 2) return -1;
            (u = 2), (f /= 2), (s /= 2), (e /= 2);
          }
          function h(t, r) {
            return 1 === u ? t[r] : t.readUInt16BE(r * u);
          }
          if (i) {
            var a = -1;
            for (o = e; o < f; o++)
              if (h(t, o) === h(r, -1 === a ? 0 : o - a)) {
                if ((-1 === a && (a = o), o - a + 1 === s)) return a * u;
              } else -1 !== a && (o -= o - a), (a = -1);
          } else
            for (e + s > f && (e = f - s), o = e; o >= 0; o--) {
              for (var c = !0, l = 0; l < s; l++)
                if (h(t, o + l) !== h(r, l)) {
                  c = !1;
                  break;
                }
              if (c) return o;
            }
          return -1;
        }
        function A(t, r, e, n) {
          e = Number(e) || 0;
          var i = t.length - e;
          n ? (n = Number(n)) > i && (n = i) : (n = i);
          var o = r.length;
          if (o % 2 != 0) throw new TypeError('Invalid hex string');
          n > o / 2 && (n = o / 2);
          for (var u = 0; u < n; ++u) {
            var f = parseInt(r.substr(2 * u, 2), 16);
            if (isNaN(f)) return u;
            t[e + u] = f;
          }
          return u;
        }
        function m(t, r, e, n) {
          return Q($(r, t.length - e), t, e, n);
        }
        function P(t, r, e, n) {
          return Q(G(r), t, e, n);
        }
        function T(t, r, e, n) {
          return P(t, r, e, n);
        }
        function B(t, r, e, n) {
          return Q(K(r), t, e, n);
        }
        function U(t, r, e, n) {
          return Q(H(r, t.length - e), t, e, n);
        }
        function S(t, e, n) {
          return 0 === e && n === t.length
            ? r.fromByteArray(t)
            : r.fromByteArray(t.slice(e, n));
        }
        function Y(t, r, e) {
          e = Math.min(t.length, e);
          for (var n = [], i = r; i < e; ) {
            var o,
              u,
              f,
              s,
              h = t[i],
              a = null,
              c = h > 239 ? 4 : h > 223 ? 3 : h > 191 ? 2 : 1;
            if (i + c <= e)
              switch (c) {
                case 1:
                  h < 128 && (a = h);
                  break;
                case 2:
                  128 == (192 & (o = t[i + 1])) &&
                    (s = ((31 & h) << 6) | (63 & o)) > 127 &&
                    (a = s);
                  break;
                case 3:
                  (o = t[i + 1]),
                    (u = t[i + 2]),
                    128 == (192 & o) &&
                      128 == (192 & u) &&
                      (s = ((15 & h) << 12) | ((63 & o) << 6) | (63 & u)) >
                        2047 &&
                      (s < 55296 || s > 57343) &&
                      (a = s);
                  break;
                case 4:
                  (o = t[i + 1]),
                    (u = t[i + 2]),
                    (f = t[i + 3]),
                    128 == (192 & o) &&
                      128 == (192 & u) &&
                      128 == (192 & f) &&
                      (s =
                        ((15 & h) << 18) |
                        ((63 & o) << 12) |
                        ((63 & u) << 6) |
                        (63 & f)) > 65535 &&
                      s < 1114112 &&
                      (a = s);
              }
            null === a
              ? ((a = 65533), (c = 1))
              : a > 65535 &&
                ((a -= 65536),
                n.push(((a >>> 10) & 1023) | 55296),
                (a = 56320 | (1023 & a))),
              n.push(a),
              (i += c);
          }
          return O(n);
        }
        (exports.Buffer = f),
          (exports.SlowBuffer = d),
          (exports.INSPECT_MAX_BYTES = 50),
          (f.TYPED_ARRAY_SUPPORT =
            void 0 !== t.TYPED_ARRAY_SUPPORT ? t.TYPED_ARRAY_SUPPORT : i()),
          (exports.kMaxLength = o()),
          (f.poolSize = 8192),
          (f._augment = function(t) {
            return (t.__proto__ = f.prototype), t;
          }),
          (f.from = function(t, r, e) {
            return s(null, t, r, e);
          }),
          f.TYPED_ARRAY_SUPPORT &&
            ((f.prototype.__proto__ = Uint8Array.prototype),
            (f.__proto__ = Uint8Array),
            'undefined' != typeof Symbol &&
              Symbol.species &&
              f[Symbol.species] === f &&
              Object.defineProperty(f, Symbol.species, {
                value: null,
                configurable: !0,
              })),
          (f.alloc = function(t, r, e) {
            return a(null, t, r, e);
          }),
          (f.allocUnsafe = function(t) {
            return c(null, t);
          }),
          (f.allocUnsafeSlow = function(t) {
            return c(null, t);
          }),
          (f.isBuffer = function(t) {
            return !(null == t || !t._isBuffer);
          }),
          (f.compare = function(t, r) {
            if (!f.isBuffer(t) || !f.isBuffer(r))
              throw new TypeError('Arguments must be Buffers');
            if (t === r) return 0;
            for (
              var e = t.length, n = r.length, i = 0, o = Math.min(e, n);
              i < o;
              ++i
            )
              if (t[i] !== r[i]) {
                (e = t[i]), (n = r[i]);
                break;
              }
            return e < n ? -1 : n < e ? 1 : 0;
          }),
          (f.isEncoding = function(t) {
            switch (String(t).toLowerCase()) {
              case 'hex':
              case 'utf8':
              case 'utf-8':
              case 'ascii':
              case 'latin1':
              case 'binary':
              case 'base64':
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return !0;
              default:
                return !1;
            }
          }),
          (f.concat = function(t, r) {
            if (!n(t))
              throw new TypeError(
                '"list" argument must be an Array of Buffers'
              );
            if (0 === t.length) return f.alloc(0);
            var e;
            if (void 0 === r)
              for (r = 0, e = 0; e < t.length; ++e) r += t[e].length;
            var i = f.allocUnsafe(r),
              o = 0;
            for (e = 0; e < t.length; ++e) {
              var u = t[e];
              if (!f.isBuffer(u))
                throw new TypeError(
                  '"list" argument must be an Array of Buffers'
                );
              u.copy(i, o), (o += u.length);
            }
            return i;
          }),
          (f.byteLength = v),
          (f.prototype._isBuffer = !0),
          (f.prototype.swap16 = function() {
            var t = this.length;
            if (t % 2 != 0)
              throw new RangeError('Buffer size must be a multiple of 16-bits');
            for (var r = 0; r < t; r += 2) b(this, r, r + 1);
            return this;
          }),
          (f.prototype.swap32 = function() {
            var t = this.length;
            if (t % 4 != 0)
              throw new RangeError('Buffer size must be a multiple of 32-bits');
            for (var r = 0; r < t; r += 4)
              b(this, r, r + 3), b(this, r + 1, r + 2);
            return this;
          }),
          (f.prototype.swap64 = function() {
            var t = this.length;
            if (t % 8 != 0)
              throw new RangeError('Buffer size must be a multiple of 64-bits');
            for (var r = 0; r < t; r += 8)
              b(this, r, r + 7),
                b(this, r + 1, r + 6),
                b(this, r + 2, r + 5),
                b(this, r + 3, r + 4);
            return this;
          }),
          (f.prototype.toString = function() {
            var t = 0 | this.length;
            return 0 === t
              ? ''
              : 0 === arguments.length
              ? Y(this, 0, t)
              : E.apply(this, arguments);
          }),
          (f.prototype.equals = function(t) {
            if (!f.isBuffer(t))
              throw new TypeError('Argument must be a Buffer');
            return this === t || 0 === f.compare(this, t);
          }),
          (f.prototype.inspect = function() {
            var t = '',
              r = exports.INSPECT_MAX_BYTES;
            return (
              this.length > 0 &&
                ((t = this.toString('hex', 0, r)
                  .match(/.{2}/g)
                  .join(' ')),
                this.length > r && (t += ' ... ')),
              '<Buffer ' + t + '>'
            );
          }),
          (f.prototype.compare = function(t, r, e, n, i) {
            if (!f.isBuffer(t))
              throw new TypeError('Argument must be a Buffer');
            if (
              (void 0 === r && (r = 0),
              void 0 === e && (e = t ? t.length : 0),
              void 0 === n && (n = 0),
              void 0 === i && (i = this.length),
              r < 0 || e > t.length || n < 0 || i > this.length)
            )
              throw new RangeError('out of range index');
            if (n >= i && r >= e) return 0;
            if (n >= i) return -1;
            if (r >= e) return 1;
            if (this === t) return 0;
            for (
              var o = (i >>>= 0) - (n >>>= 0),
                u = (e >>>= 0) - (r >>>= 0),
                s = Math.min(o, u),
                h = this.slice(n, i),
                a = t.slice(r, e),
                c = 0;
              c < s;
              ++c
            )
              if (h[c] !== a[c]) {
                (o = h[c]), (u = a[c]);
                break;
              }
            return o < u ? -1 : u < o ? 1 : 0;
          }),
          (f.prototype.includes = function(t, r, e) {
            return -1 !== this.indexOf(t, r, e);
          }),
          (f.prototype.indexOf = function(t, r, e) {
            return R(this, t, r, e, !0);
          }),
          (f.prototype.lastIndexOf = function(t, r, e) {
            return R(this, t, r, e, !1);
          }),
          (f.prototype.write = function(t, r, e, n) {
            if (void 0 === r) (n = 'utf8'), (e = this.length), (r = 0);
            else if (void 0 === e && 'string' == typeof r)
              (n = r), (e = this.length), (r = 0);
            else {
              if (!isFinite(r))
                throw new Error(
                  'Buffer.write(string, encoding, offset[, length]) is no longer supported'
                );
              (r |= 0),
                isFinite(e)
                  ? ((e |= 0), void 0 === n && (n = 'utf8'))
                  : ((n = e), (e = void 0));
            }
            var i = this.length - r;
            if (
              ((void 0 === e || e > i) && (e = i),
              (t.length > 0 && (e < 0 || r < 0)) || r > this.length)
            )
              throw new RangeError('Attempt to write outside buffer bounds');
            n || (n = 'utf8');
            for (var o = !1; ; )
              switch (n) {
                case 'hex':
                  return A(this, t, r, e);
                case 'utf8':
                case 'utf-8':
                  return m(this, t, r, e);
                case 'ascii':
                  return P(this, t, r, e);
                case 'latin1':
                case 'binary':
                  return T(this, t, r, e);
                case 'base64':
                  return B(this, t, r, e);
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                  return U(this, t, r, e);
                default:
                  if (o) throw new TypeError('Unknown encoding: ' + n);
                  (n = ('' + n).toLowerCase()), (o = !0);
              }
          }),
          (f.prototype.toJSON = function() {
            return {
              type: 'Buffer',
              data: Array.prototype.slice.call(this._arr || this, 0),
            };
          });
        var I = 4096;
        function O(t) {
          var r = t.length;
          if (r <= I) return String.fromCharCode.apply(String, t);
          for (var e = '', n = 0; n < r; )
            e += String.fromCharCode.apply(String, t.slice(n, (n += I)));
          return e;
        }
        function L(t, r, e) {
          var n = '';
          e = Math.min(t.length, e);
          for (var i = r; i < e; ++i) n += String.fromCharCode(127 & t[i]);
          return n;
        }
        function D(t, r, e) {
          var n = '';
          e = Math.min(t.length, e);
          for (var i = r; i < e; ++i) n += String.fromCharCode(t[i]);
          return n;
        }
        function x(t, r, e) {
          var n = t.length;
          (!r || r < 0) && (r = 0), (!e || e < 0 || e > n) && (e = n);
          for (var i = '', o = r; o < e; ++o) i += Z(t[o]);
          return i;
        }
        function C(t, r, e) {
          for (var n = t.slice(r, e), i = '', o = 0; o < n.length; o += 2)
            i += String.fromCharCode(n[o] + 256 * n[o + 1]);
          return i;
        }
        function M(t, r, e) {
          if (t % 1 != 0 || t < 0) throw new RangeError('offset is not uint');
          if (t + r > e)
            throw new RangeError('Trying to access beyond buffer length');
        }
        function k(t, r, e, n, i, o) {
          if (!f.isBuffer(t))
            throw new TypeError('"buffer" argument must be a Buffer instance');
          if (r > i || r < o)
            throw new RangeError('"value" argument is out of bounds');
          if (e + n > t.length) throw new RangeError('Index out of range');
        }
        function N(t, r, e, n) {
          r < 0 && (r = 65535 + r + 1);
          for (var i = 0, o = Math.min(t.length - e, 2); i < o; ++i)
            t[e + i] =
              (r & (255 << (8 * (n ? i : 1 - i)))) >>> (8 * (n ? i : 1 - i));
        }
        function z(t, r, e, n) {
          r < 0 && (r = 4294967295 + r + 1);
          for (var i = 0, o = Math.min(t.length - e, 4); i < o; ++i)
            t[e + i] = (r >>> (8 * (n ? i : 3 - i))) & 255;
        }
        function F(t, r, e, n, i, o) {
          if (e + n > t.length) throw new RangeError('Index out of range');
          if (e < 0) throw new RangeError('Index out of range');
        }
        function j(t, r, n, i, o) {
          return (
            o || F(t, r, n, 4, 3.4028234663852886e38, -3.4028234663852886e38),
            e.write(t, r, n, i, 23, 4),
            n + 4
          );
        }
        function q(t, r, n, i, o) {
          return (
            o || F(t, r, n, 8, 1.7976931348623157e308, -1.7976931348623157e308),
            e.write(t, r, n, i, 52, 8),
            n + 8
          );
        }
        (f.prototype.slice = function(t, r) {
          var e,
            n = this.length;
          if (
            ((t = ~~t) < 0 ? (t += n) < 0 && (t = 0) : t > n && (t = n),
            (r = void 0 === r ? n : ~~r) < 0
              ? (r += n) < 0 && (r = 0)
              : r > n && (r = n),
            r < t && (r = t),
            f.TYPED_ARRAY_SUPPORT)
          )
            (e = this.subarray(t, r)).__proto__ = f.prototype;
          else {
            var i = r - t;
            e = new f(i, void 0);
            for (var o = 0; o < i; ++o) e[o] = this[o + t];
          }
          return e;
        }),
          (f.prototype.readUIntLE = function(t, r, e) {
            (t |= 0), (r |= 0), e || M(t, r, this.length);
            for (var n = this[t], i = 1, o = 0; ++o < r && (i *= 256); )
              n += this[t + o] * i;
            return n;
          }),
          (f.prototype.readUIntBE = function(t, r, e) {
            (t |= 0), (r |= 0), e || M(t, r, this.length);
            for (var n = this[t + --r], i = 1; r > 0 && (i *= 256); )
              n += this[t + --r] * i;
            return n;
          }),
          (f.prototype.readUInt8 = function(t, r) {
            return r || M(t, 1, this.length), this[t];
          }),
          (f.prototype.readUInt16LE = function(t, r) {
            return r || M(t, 2, this.length), this[t] | (this[t + 1] << 8);
          }),
          (f.prototype.readUInt16BE = function(t, r) {
            return r || M(t, 2, this.length), (this[t] << 8) | this[t + 1];
          }),
          (f.prototype.readUInt32LE = function(t, r) {
            return (
              r || M(t, 4, this.length),
              (this[t] | (this[t + 1] << 8) | (this[t + 2] << 16)) +
                16777216 * this[t + 3]
            );
          }),
          (f.prototype.readUInt32BE = function(t, r) {
            return (
              r || M(t, 4, this.length),
              16777216 * this[t] +
                ((this[t + 1] << 16) | (this[t + 2] << 8) | this[t + 3])
            );
          }),
          (f.prototype.readIntLE = function(t, r, e) {
            (t |= 0), (r |= 0), e || M(t, r, this.length);
            for (var n = this[t], i = 1, o = 0; ++o < r && (i *= 256); )
              n += this[t + o] * i;
            return n >= (i *= 128) && (n -= Math.pow(2, 8 * r)), n;
          }),
          (f.prototype.readIntBE = function(t, r, e) {
            (t |= 0), (r |= 0), e || M(t, r, this.length);
            for (var n = r, i = 1, o = this[t + --n]; n > 0 && (i *= 256); )
              o += this[t + --n] * i;
            return o >= (i *= 128) && (o -= Math.pow(2, 8 * r)), o;
          }),
          (f.prototype.readInt8 = function(t, r) {
            return (
              r || M(t, 1, this.length),
              128 & this[t] ? -1 * (255 - this[t] + 1) : this[t]
            );
          }),
          (f.prototype.readInt16LE = function(t, r) {
            r || M(t, 2, this.length);
            var e = this[t] | (this[t + 1] << 8);
            return 32768 & e ? 4294901760 | e : e;
          }),
          (f.prototype.readInt16BE = function(t, r) {
            r || M(t, 2, this.length);
            var e = this[t + 1] | (this[t] << 8);
            return 32768 & e ? 4294901760 | e : e;
          }),
          (f.prototype.readInt32LE = function(t, r) {
            return (
              r || M(t, 4, this.length),
              this[t] |
                (this[t + 1] << 8) |
                (this[t + 2] << 16) |
                (this[t + 3] << 24)
            );
          }),
          (f.prototype.readInt32BE = function(t, r) {
            return (
              r || M(t, 4, this.length),
              (this[t] << 24) |
                (this[t + 1] << 16) |
                (this[t + 2] << 8) |
                this[t + 3]
            );
          }),
          (f.prototype.readFloatLE = function(t, r) {
            return r || M(t, 4, this.length), e.read(this, t, !0, 23, 4);
          }),
          (f.prototype.readFloatBE = function(t, r) {
            return r || M(t, 4, this.length), e.read(this, t, !1, 23, 4);
          }),
          (f.prototype.readDoubleLE = function(t, r) {
            return r || M(t, 8, this.length), e.read(this, t, !0, 52, 8);
          }),
          (f.prototype.readDoubleBE = function(t, r) {
            return r || M(t, 8, this.length), e.read(this, t, !1, 52, 8);
          }),
          (f.prototype.writeUIntLE = function(t, r, e, n) {
            ((t = +t), (r |= 0), (e |= 0), n) ||
              k(this, t, r, e, Math.pow(2, 8 * e) - 1, 0);
            var i = 1,
              o = 0;
            for (this[r] = 255 & t; ++o < e && (i *= 256); )
              this[r + o] = (t / i) & 255;
            return r + e;
          }),
          (f.prototype.writeUIntBE = function(t, r, e, n) {
            ((t = +t), (r |= 0), (e |= 0), n) ||
              k(this, t, r, e, Math.pow(2, 8 * e) - 1, 0);
            var i = e - 1,
              o = 1;
            for (this[r + i] = 255 & t; --i >= 0 && (o *= 256); )
              this[r + i] = (t / o) & 255;
            return r + e;
          }),
          (f.prototype.writeUInt8 = function(t, r, e) {
            return (
              (t = +t),
              (r |= 0),
              e || k(this, t, r, 1, 255, 0),
              f.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)),
              (this[r] = 255 & t),
              r + 1
            );
          }),
          (f.prototype.writeUInt16LE = function(t, r, e) {
            return (
              (t = +t),
              (r |= 0),
              e || k(this, t, r, 2, 65535, 0),
              f.TYPED_ARRAY_SUPPORT
                ? ((this[r] = 255 & t), (this[r + 1] = t >>> 8))
                : N(this, t, r, !0),
              r + 2
            );
          }),
          (f.prototype.writeUInt16BE = function(t, r, e) {
            return (
              (t = +t),
              (r |= 0),
              e || k(this, t, r, 2, 65535, 0),
              f.TYPED_ARRAY_SUPPORT
                ? ((this[r] = t >>> 8), (this[r + 1] = 255 & t))
                : N(this, t, r, !1),
              r + 2
            );
          }),
          (f.prototype.writeUInt32LE = function(t, r, e) {
            return (
              (t = +t),
              (r |= 0),
              e || k(this, t, r, 4, 4294967295, 0),
              f.TYPED_ARRAY_SUPPORT
                ? ((this[r + 3] = t >>> 24),
                  (this[r + 2] = t >>> 16),
                  (this[r + 1] = t >>> 8),
                  (this[r] = 255 & t))
                : z(this, t, r, !0),
              r + 4
            );
          }),
          (f.prototype.writeUInt32BE = function(t, r, e) {
            return (
              (t = +t),
              (r |= 0),
              e || k(this, t, r, 4, 4294967295, 0),
              f.TYPED_ARRAY_SUPPORT
                ? ((this[r] = t >>> 24),
                  (this[r + 1] = t >>> 16),
                  (this[r + 2] = t >>> 8),
                  (this[r + 3] = 255 & t))
                : z(this, t, r, !1),
              r + 4
            );
          }),
          (f.prototype.writeIntLE = function(t, r, e, n) {
            if (((t = +t), (r |= 0), !n)) {
              var i = Math.pow(2, 8 * e - 1);
              k(this, t, r, e, i - 1, -i);
            }
            var o = 0,
              u = 1,
              f = 0;
            for (this[r] = 255 & t; ++o < e && (u *= 256); )
              t < 0 && 0 === f && 0 !== this[r + o - 1] && (f = 1),
                (this[r + o] = (((t / u) >> 0) - f) & 255);
            return r + e;
          }),
          (f.prototype.writeIntBE = function(t, r, e, n) {
            if (((t = +t), (r |= 0), !n)) {
              var i = Math.pow(2, 8 * e - 1);
              k(this, t, r, e, i - 1, -i);
            }
            var o = e - 1,
              u = 1,
              f = 0;
            for (this[r + o] = 255 & t; --o >= 0 && (u *= 256); )
              t < 0 && 0 === f && 0 !== this[r + o + 1] && (f = 1),
                (this[r + o] = (((t / u) >> 0) - f) & 255);
            return r + e;
          }),
          (f.prototype.writeInt8 = function(t, r, e) {
            return (
              (t = +t),
              (r |= 0),
              e || k(this, t, r, 1, 127, -128),
              f.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)),
              t < 0 && (t = 255 + t + 1),
              (this[r] = 255 & t),
              r + 1
            );
          }),
          (f.prototype.writeInt16LE = function(t, r, e) {
            return (
              (t = +t),
              (r |= 0),
              e || k(this, t, r, 2, 32767, -32768),
              f.TYPED_ARRAY_SUPPORT
                ? ((this[r] = 255 & t), (this[r + 1] = t >>> 8))
                : N(this, t, r, !0),
              r + 2
            );
          }),
          (f.prototype.writeInt16BE = function(t, r, e) {
            return (
              (t = +t),
              (r |= 0),
              e || k(this, t, r, 2, 32767, -32768),
              f.TYPED_ARRAY_SUPPORT
                ? ((this[r] = t >>> 8), (this[r + 1] = 255 & t))
                : N(this, t, r, !1),
              r + 2
            );
          }),
          (f.prototype.writeInt32LE = function(t, r, e) {
            return (
              (t = +t),
              (r |= 0),
              e || k(this, t, r, 4, 2147483647, -2147483648),
              f.TYPED_ARRAY_SUPPORT
                ? ((this[r] = 255 & t),
                  (this[r + 1] = t >>> 8),
                  (this[r + 2] = t >>> 16),
                  (this[r + 3] = t >>> 24))
                : z(this, t, r, !0),
              r + 4
            );
          }),
          (f.prototype.writeInt32BE = function(t, r, e) {
            return (
              (t = +t),
              (r |= 0),
              e || k(this, t, r, 4, 2147483647, -2147483648),
              t < 0 && (t = 4294967295 + t + 1),
              f.TYPED_ARRAY_SUPPORT
                ? ((this[r] = t >>> 24),
                  (this[r + 1] = t >>> 16),
                  (this[r + 2] = t >>> 8),
                  (this[r + 3] = 255 & t))
                : z(this, t, r, !1),
              r + 4
            );
          }),
          (f.prototype.writeFloatLE = function(t, r, e) {
            return j(this, t, r, !0, e);
          }),
          (f.prototype.writeFloatBE = function(t, r, e) {
            return j(this, t, r, !1, e);
          }),
          (f.prototype.writeDoubleLE = function(t, r, e) {
            return q(this, t, r, !0, e);
          }),
          (f.prototype.writeDoubleBE = function(t, r, e) {
            return q(this, t, r, !1, e);
          }),
          (f.prototype.copy = function(t, r, e, n) {
            if (
              (e || (e = 0),
              n || 0 === n || (n = this.length),
              r >= t.length && (r = t.length),
              r || (r = 0),
              n > 0 && n < e && (n = e),
              n === e)
            )
              return 0;
            if (0 === t.length || 0 === this.length) return 0;
            if (r < 0) throw new RangeError('targetStart out of bounds');
            if (e < 0 || e >= this.length)
              throw new RangeError('sourceStart out of bounds');
            if (n < 0) throw new RangeError('sourceEnd out of bounds');
            n > this.length && (n = this.length),
              t.length - r < n - e && (n = t.length - r + e);
            var i,
              o = n - e;
            if (this === t && e < r && r < n)
              for (i = o - 1; i >= 0; --i) t[i + r] = this[i + e];
            else if (o < 1e3 || !f.TYPED_ARRAY_SUPPORT)
              for (i = 0; i < o; ++i) t[i + r] = this[i + e];
            else Uint8Array.prototype.set.call(t, this.subarray(e, e + o), r);
            return o;
          }),
          (f.prototype.fill = function(t, r, e, n) {
            if ('string' == typeof t) {
              if (
                ('string' == typeof r
                  ? ((n = r), (r = 0), (e = this.length))
                  : 'string' == typeof e && ((n = e), (e = this.length)),
                1 === t.length)
              ) {
                var i = t.charCodeAt(0);
                i < 256 && (t = i);
              }
              if (void 0 !== n && 'string' != typeof n)
                throw new TypeError('encoding must be a string');
              if ('string' == typeof n && !f.isEncoding(n))
                throw new TypeError('Unknown encoding: ' + n);
            } else 'number' == typeof t && (t &= 255);
            if (r < 0 || this.length < r || this.length < e)
              throw new RangeError('Out of range index');
            if (e <= r) return this;
            var o;
            if (
              ((r >>>= 0),
              (e = void 0 === e ? this.length : e >>> 0),
              t || (t = 0),
              'number' == typeof t)
            )
              for (o = r; o < e; ++o) this[o] = t;
            else {
              var u = f.isBuffer(t) ? t : $(new f(t, n).toString()),
                s = u.length;
              for (o = 0; o < e - r; ++o) this[o + r] = u[o % s];
            }
            return this;
          });
        var V = /[^+\/0-9A-Za-z-_]/g;
        function X(t) {
          if ((t = J(t).replace(V, '')).length < 2) return '';
          for (; t.length % 4 != 0; ) t += '=';
          return t;
        }
        function J(t) {
          return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, '');
        }
        function Z(t) {
          return t < 16 ? '0' + t.toString(16) : t.toString(16);
        }
        function $(t, r) {
          var e;
          r = r || 1 / 0;
          for (var n = t.length, i = null, o = [], u = 0; u < n; ++u) {
            if ((e = t.charCodeAt(u)) > 55295 && e < 57344) {
              if (!i) {
                if (e > 56319) {
                  (r -= 3) > -1 && o.push(239, 191, 189);
                  continue;
                }
                if (u + 1 === n) {
                  (r -= 3) > -1 && o.push(239, 191, 189);
                  continue;
                }
                i = e;
                continue;
              }
              if (e < 56320) {
                (r -= 3) > -1 && o.push(239, 191, 189), (i = e);
                continue;
              }
              e = 65536 + (((i - 55296) << 10) | (e - 56320));
            } else i && (r -= 3) > -1 && o.push(239, 191, 189);
            if (((i = null), e < 128)) {
              if ((r -= 1) < 0) break;
              o.push(e);
            } else if (e < 2048) {
              if ((r -= 2) < 0) break;
              o.push((e >> 6) | 192, (63 & e) | 128);
            } else if (e < 65536) {
              if ((r -= 3) < 0) break;
              o.push((e >> 12) | 224, ((e >> 6) & 63) | 128, (63 & e) | 128);
            } else {
              if (!(e < 1114112)) throw new Error('Invalid code point');
              if ((r -= 4) < 0) break;
              o.push(
                (e >> 18) | 240,
                ((e >> 12) & 63) | 128,
                ((e >> 6) & 63) | 128,
                (63 & e) | 128
              );
            }
          }
          return o;
        }
        function G(t) {
          for (var r = [], e = 0; e < t.length; ++e)
            r.push(255 & t.charCodeAt(e));
          return r;
        }
        function H(t, r) {
          for (var e, n, i, o = [], u = 0; u < t.length && !((r -= 2) < 0); ++u)
            (n = (e = t.charCodeAt(u)) >> 8),
              (i = e % 256),
              o.push(i),
              o.push(n);
          return o;
        }
        function K(t) {
          return r.toByteArray(X(t));
        }
        function Q(t, r, e, n) {
          for (var i = 0; i < n && !(i + e >= r.length || i >= t.length); ++i)
            r[i + e] = t[i];
          return i;
        }
        function W(t) {
          return t != t;
        }
      },
      { 'base64-js': 'yh9p', ieee754: 'JgNJ', isarray: 'Bi1L', buffer: 'dskh' },
    ],
    'fP3/': [
      function(require, module, exports) {
        var Buffer = require('buffer').Buffer;
        var f = require('buffer').Buffer;
        module.exports = n;
        var r = 'function' == typeof f && 'function' == typeof f.isBuffer,
          e = 'function' == typeof ArrayBuffer,
          u = function(f) {
            return 'function' == typeof ArrayBuffer.isView
              ? ArrayBuffer.isView(f)
              : f.buffer instanceof ArrayBuffer;
          };
        function n(n) {
          return (
            (r && f.isBuffer(n)) || (e && (n instanceof ArrayBuffer || u(n)))
          );
        }
      },
      { buffer: 'dskh' },
    ],
    'nr+I': [
      function(require, module, exports) {
        var e = require('isarray'),
          t = require('./is-buffer'),
          r = Object.prototype.toString,
          n =
            'function' == typeof Blob ||
            ('undefined' != typeof Blob &&
              '[object BlobConstructor]' === r.call(Blob)),
          o =
            'function' == typeof File ||
            ('undefined' != typeof File &&
              '[object FileConstructor]' === r.call(File));
        function f(r, n) {
          if (!r) return r;
          if (t(r)) {
            var o = { _placeholder: !0, num: n.length };
            return n.push(r), o;
          }
          if (e(r)) {
            for (var i = new Array(r.length), a = 0; a < r.length; a++)
              i[a] = f(r[a], n);
            return i;
          }
          if ('object' == typeof r && !(r instanceof Date)) {
            i = {};
            for (var u in r) i[u] = f(r[u], n);
            return i;
          }
          return r;
        }
        function i(t, r) {
          if (!t) return t;
          if (t && t._placeholder) return r[t.num];
          if (e(t)) for (var n = 0; n < t.length; n++) t[n] = i(t[n], r);
          else if ('object' == typeof t) for (var o in t) t[o] = i(t[o], r);
          return t;
        }
        (exports.deconstructPacket = function(e) {
          var t = [],
            r = e.data,
            n = e;
          return (
            (n.data = f(r, t)),
            (n.attachments = t.length),
            { packet: n, buffers: t }
          );
        }),
          (exports.reconstructPacket = function(e, t) {
            return (e.data = i(e.data, t)), (e.attachments = void 0), e;
          }),
          (exports.removeBlobs = function(r, f) {
            var i = 0,
              a = r;
            !(function r(u, c, l) {
              if (!u) return u;
              if ((n && u instanceof Blob) || (o && u instanceof File)) {
                i++;
                var s = new FileReader();
                (s.onload = function() {
                  l ? (l[c] = this.result) : (a = this.result), --i || f(a);
                }),
                  s.readAsArrayBuffer(u);
              } else if (e(u)) for (var p = 0; p < u.length; p++) r(u[p], p, u);
              else if ('object' == typeof u && !t(u))
                for (var d in u) r(u[d], d, u);
            })(a),
              i || f(a);
          });
      },
      { isarray: 'Bi1L', './is-buffer': 'fP3/' },
    ],
    '7V8U': [
      function(require, module, exports) {
        var t = require('debug')('socket.io-parser'),
          r = require('component-emitter'),
          e = require('./binary'),
          n = require('isarray'),
          o = require('./is-buffer');
        function s() {}
        (exports.protocol = 4),
          (exports.types = [
            'CONNECT',
            'DISCONNECT',
            'EVENT',
            'ACK',
            'ERROR',
            'BINARY_EVENT',
            'BINARY_ACK',
          ]),
          (exports.CONNECT = 0),
          (exports.DISCONNECT = 1),
          (exports.EVENT = 2),
          (exports.ACK = 3),
          (exports.ERROR = 4),
          (exports.BINARY_EVENT = 5),
          (exports.BINARY_ACK = 6),
          (exports.Encoder = s),
          (exports.Decoder = p);
        var i = exports.ERROR + '"encode error"';
        function c(r) {
          var e = '' + r.type;
          if (
            ((exports.BINARY_EVENT !== r.type &&
              exports.BINARY_ACK !== r.type) ||
              (e += r.attachments + '-'),
            r.nsp && '/' !== r.nsp && (e += r.nsp + ','),
            null != r.id && (e += r.id),
            null != r.data)
          ) {
            var n = a(r.data);
            if (!1 === n) return i;
            e += n;
          }
          return t('encoded %j as %s', r, e), e;
        }
        function a(t) {
          try {
            return JSON.stringify(t);
          } catch (r) {
            return !1;
          }
        }
        function u(t, r) {
          e.removeBlobs(t, function(t) {
            var n = e.deconstructPacket(t),
              o = c(n.packet),
              s = n.buffers;
            s.unshift(o), r(s);
          });
        }
        function p() {
          this.reconstructor = null;
        }
        function f(r) {
          var e = 0,
            o = { type: Number(r.charAt(0)) };
          if (null == exports.types[o.type])
            return N('unknown packet type ' + o.type);
          if (
            exports.BINARY_EVENT === o.type ||
            exports.BINARY_ACK === o.type
          ) {
            for (
              var s = '';
              '-' !== r.charAt(++e) && ((s += r.charAt(e)), e != r.length);

            );
            if (s != Number(s) || '-' !== r.charAt(e))
              throw new Error('Illegal attachments');
            o.attachments = Number(s);
          }
          if ('/' === r.charAt(e + 1))
            for (o.nsp = ''; ++e; ) {
              if (',' === (c = r.charAt(e))) break;
              if (((o.nsp += c), e === r.length)) break;
            }
          else o.nsp = '/';
          var i = r.charAt(e + 1);
          if ('' !== i && Number(i) == i) {
            for (o.id = ''; ++e; ) {
              var c;
              if (null == (c = r.charAt(e)) || Number(c) != c) {
                --e;
                break;
              }
              if (((o.id += r.charAt(e)), e === r.length)) break;
            }
            o.id = Number(o.id);
          }
          if (r.charAt(++e)) {
            var a = h(r.substr(e));
            if (!(!1 !== a && (o.type === exports.ERROR || n(a))))
              return N('invalid payload');
            o.data = a;
          }
          return t('decoded %s as %j', r, o), o;
        }
        function h(t) {
          try {
            return JSON.parse(t);
          } catch (r) {
            return !1;
          }
        }
        function d(t) {
          (this.reconPack = t), (this.buffers = []);
        }
        function N(t) {
          return { type: exports.ERROR, data: 'parser error: ' + t };
        }
        (s.prototype.encode = function(r, e) {
          (t('encoding packet %j', r),
          exports.BINARY_EVENT === r.type || exports.BINARY_ACK === r.type)
            ? u(r, e)
            : e([c(r)]);
        }),
          r(p.prototype),
          (p.prototype.add = function(t) {
            var r;
            if ('string' == typeof t)
              (r = f(t)),
                exports.BINARY_EVENT === r.type || exports.BINARY_ACK === r.type
                  ? ((this.reconstructor = new d(r)),
                    0 === this.reconstructor.reconPack.attachments &&
                      this.emit('decoded', r))
                  : this.emit('decoded', r);
            else {
              if (!o(t) && !t.base64) throw new Error('Unknown type: ' + t);
              if (!this.reconstructor)
                throw new Error(
                  'got binary data when not reconstructing a packet'
                );
              (r = this.reconstructor.takeBinaryData(t)) &&
                ((this.reconstructor = null), this.emit('decoded', r));
            }
          }),
          (p.prototype.destroy = function() {
            this.reconstructor && this.reconstructor.finishedReconstruction();
          }),
          (d.prototype.takeBinaryData = function(t) {
            if (
              (this.buffers.push(t),
              this.buffers.length === this.reconPack.attachments)
            ) {
              var r = e.reconstructPacket(this.reconPack, this.buffers);
              return this.finishedReconstruction(), r;
            }
            return null;
          }),
          (d.prototype.finishedReconstruction = function() {
            (this.reconPack = null), (this.buffers = []);
          });
      },
      {
        debug: '1tjN',
        'component-emitter': 'XUqb',
        './binary': 'nr+I',
        isarray: 'Bi1L',
        './is-buffer': 'fP3/',
      },
    ],
    cnu0: [
      function(require, module, exports) {
        try {
          module.exports =
            'undefined' != typeof XMLHttpRequest &&
            'withCredentials' in new XMLHttpRequest();
        } catch (e) {
          module.exports = !1;
        }
      },
      {},
    ],
    jhGE: [
      function(require, module, exports) {
        var e = require('has-cors');
        module.exports = function(t) {
          var n = t.xdomain,
            r = t.xscheme,
            c = t.enablesXDR;
          try {
            if ('undefined' != typeof XMLHttpRequest && (!n || e))
              return new XMLHttpRequest();
          } catch (i) {}
          try {
            if ('undefined' != typeof XDomainRequest && !r && c)
              return new XDomainRequest();
          } catch (i) {}
          if (!n)
            try {
              return new self[['Active'].concat('Object').join('X')](
                'Microsoft.XMLHTTP'
              );
            } catch (i) {}
        };
      },
      { 'has-cors': 'cnu0' },
    ],
    'PQm/': [
      function(require, module, exports) {
        module.exports =
          Object.keys ||
          function(r) {
            var e = [],
              t = Object.prototype.hasOwnProperty;
            for (var o in r) t.call(r, o) && e.push(o);
            return e;
          };
      },
      {},
    ],
    '+oIq': [
      function(require, module, exports) {
        var Buffer = require('buffer').Buffer;
        var e = require('buffer').Buffer,
          t = require('isarray'),
          r = Object.prototype.toString,
          o =
            'function' == typeof Blob ||
            ('undefined' != typeof Blob &&
              '[object BlobConstructor]' === r.call(Blob)),
          f =
            'function' == typeof File ||
            ('undefined' != typeof File &&
              '[object FileConstructor]' === r.call(File));
        function n(r) {
          if (!r || 'object' != typeof r) return !1;
          if (t(r)) {
            for (var i = 0, u = r.length; i < u; i++) if (n(r[i])) return !0;
            return !1;
          }
          if (
            ('function' == typeof e && e.isBuffer && e.isBuffer(r)) ||
            ('function' == typeof ArrayBuffer && r instanceof ArrayBuffer) ||
            (o && r instanceof Blob) ||
            (f && r instanceof File)
          )
            return !0;
          if (
            r.toJSON &&
            'function' == typeof r.toJSON &&
            1 === arguments.length
          )
            return n(r.toJSON(), !0);
          for (var c in r)
            if (Object.prototype.hasOwnProperty.call(r, c) && n(r[c]))
              return !0;
          return !1;
        }
        module.exports = n;
      },
      { isarray: 'Bi1L', buffer: 'dskh' },
    ],
    v4iP: [
      function(require, module, exports) {
        module.exports = function(r, e, n) {
          var t = r.byteLength;
          if (((e = e || 0), (n = n || t), r.slice)) return r.slice(e, n);
          if (
            (e < 0 && (e += t),
            n < 0 && (n += t),
            n > t && (n = t),
            e >= t || e >= n || 0 === t)
          )
            return new ArrayBuffer(0);
          for (
            var f = new Uint8Array(r), i = new Uint8Array(n - e), u = e, a = 0;
            u < n;
            u++, a++
          )
            i[a] = f[u];
          return i.buffer;
        };
      },
      {},
    ],
    t3ut: [
      function(require, module, exports) {
        function n(n, t, u) {
          var r = !1;
          return (u = u || o), (c.count = n), 0 === n ? t() : c;
          function c(n, o) {
            if (c.count <= 0) throw new Error('after called too many times');
            --c.count,
              n ? ((r = !0), t(n), (t = u)) : 0 !== c.count || r || t(null, o);
          }
        }
        function o() {}
        module.exports = n;
      },
      {},
    ],
    S7zD: [
      function(require, module, exports) {
        var r,
          t,
          n,
          o = String.fromCharCode;
        function e(r) {
          for (var t, n, o = [], e = 0, i = r.length; e < i; )
            (t = r.charCodeAt(e++)) >= 55296 && t <= 56319 && e < i
              ? 56320 == (64512 & (n = r.charCodeAt(e++)))
                ? o.push(((1023 & t) << 10) + (1023 & n) + 65536)
                : (o.push(t), e--)
              : o.push(t);
          return o;
        }
        function i(r) {
          for (var t, n = r.length, e = -1, i = ''; ++e < n; )
            (t = r[e]) > 65535 &&
              ((i += o((((t -= 65536) >>> 10) & 1023) | 55296)),
              (t = 56320 | (1023 & t))),
              (i += o(t));
          return i;
        }
        function u(r, t) {
          if (r >= 55296 && r <= 57343) {
            if (t)
              throw Error(
                'Lone surrogate U+' +
                  r.toString(16).toUpperCase() +
                  ' is not a scalar value'
              );
            return !1;
          }
          return !0;
        }
        function a(r, t) {
          return o(((r >> t) & 63) | 128);
        }
        function f(r, t) {
          if (0 == (4294967168 & r)) return o(r);
          var n = '';
          return (
            0 == (4294965248 & r)
              ? (n = o(((r >> 6) & 31) | 192))
              : 0 == (4294901760 & r)
              ? (u(r, t) || (r = 65533),
                (n = o(((r >> 12) & 15) | 224)),
                (n += a(r, 6)))
              : 0 == (4292870144 & r) &&
                ((n = o(((r >> 18) & 7) | 240)),
                (n += a(r, 12)),
                (n += a(r, 6))),
            (n += o((63 & r) | 128))
          );
        }
        function c(r, t) {
          for (
            var n = !1 !== (t = t || {}).strict,
              o = e(r),
              i = o.length,
              u = -1,
              a = '';
            ++u < i;

          )
            a += f(o[u], n);
          return a;
        }
        function h() {
          if (n >= t) throw Error('Invalid byte index');
          var o = 255 & r[n];
          if ((n++, 128 == (192 & o))) return 63 & o;
          throw Error('Invalid continuation byte');
        }
        function d(o) {
          var e, i;
          if (n > t) throw Error('Invalid byte index');
          if (n == t) return !1;
          if (((e = 255 & r[n]), n++, 0 == (128 & e))) return e;
          if (192 == (224 & e)) {
            if ((i = ((31 & e) << 6) | h()) >= 128) return i;
            throw Error('Invalid continuation byte');
          }
          if (224 == (240 & e)) {
            if ((i = ((15 & e) << 12) | (h() << 6) | h()) >= 2048)
              return u(i, o) ? i : 65533;
            throw Error('Invalid continuation byte');
          }
          if (
            240 == (248 & e) &&
            (i = ((7 & e) << 18) | (h() << 12) | (h() << 6) | h()) >= 65536 &&
            i <= 1114111
          )
            return i;
          throw Error('Invalid UTF-8 detected');
        }
        function v(o, u) {
          var a = !1 !== (u = u || {}).strict;
          (r = e(o)), (t = r.length), (n = 0);
          for (var f, c = []; !1 !== (f = d(a)); ) c.push(f);
          return i(c);
        }
        module.exports = { version: '2.1.2', encode: c, decode: v };
      },
      {},
    ],
    VBf3: [
      function(require, module, exports) {
        !(function() {
          'use strict';
          for (
            var r =
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
              e = new Uint8Array(256),
              t = 0;
            t < r.length;
            t++
          )
            e[r.charCodeAt(t)] = t;
          (exports.encode = function(e) {
            var t,
              n = new Uint8Array(e),
              o = n.length,
              a = '';
            for (t = 0; t < o; t += 3)
              (a += r[n[t] >> 2]),
                (a += r[((3 & n[t]) << 4) | (n[t + 1] >> 4)]),
                (a += r[((15 & n[t + 1]) << 2) | (n[t + 2] >> 6)]),
                (a += r[63 & n[t + 2]]);
            return (
              o % 3 == 2
                ? (a = a.substring(0, a.length - 1) + '=')
                : o % 3 == 1 && (a = a.substring(0, a.length - 2) + '=='),
              a
            );
          }),
            (exports.decode = function(r) {
              var t,
                n,
                o,
                a,
                h,
                c = 0.75 * r.length,
                g = r.length,
                i = 0;
              '=' === r[r.length - 1] && (c--, '=' === r[r.length - 2] && c--);
              var u = new ArrayBuffer(c),
                A = new Uint8Array(u);
              for (t = 0; t < g; t += 4)
                (n = e[r.charCodeAt(t)]),
                  (o = e[r.charCodeAt(t + 1)]),
                  (a = e[r.charCodeAt(t + 2)]),
                  (h = e[r.charCodeAt(t + 3)]),
                  (A[i++] = (n << 2) | (o >> 4)),
                  (A[i++] = ((15 & o) << 4) | (a >> 2)),
                  (A[i++] = ((3 & a) << 6) | (63 & h));
              return u;
            });
        })();
      },
      {},
    ],
    '04AK': [
      function(require, module, exports) {
        var e =
            void 0 !== e
              ? e
              : 'undefined' != typeof WebKitBlobBuilder
              ? WebKitBlobBuilder
              : 'undefined' != typeof MSBlobBuilder
              ? MSBlobBuilder
              : 'undefined' != typeof MozBlobBuilder && MozBlobBuilder,
          t = (function() {
            try {
              return 2 === new Blob(['hi']).size;
            } catch (e) {
              return !1;
            }
          })(),
          r =
            t &&
            (function() {
              try {
                return 2 === new Blob([new Uint8Array([1, 2])]).size;
              } catch (e) {
                return !1;
              }
            })(),
          n = e && e.prototype.append && e.prototype.getBlob;
        function o(e) {
          return e.map(function(e) {
            if (e.buffer instanceof ArrayBuffer) {
              var t = e.buffer;
              if (e.byteLength !== t.byteLength) {
                var r = new Uint8Array(e.byteLength);
                r.set(new Uint8Array(t, e.byteOffset, e.byteLength)),
                  (t = r.buffer);
              }
              return t;
            }
            return e;
          });
        }
        function u(t, r) {
          r = r || {};
          var n = new e();
          return (
            o(t).forEach(function(e) {
              n.append(e);
            }),
            r.type ? n.getBlob(r.type) : n.getBlob()
          );
        }
        function i(e, t) {
          return new Blob(o(e), t || {});
        }
        'undefined' != typeof Blob &&
          ((u.prototype = Blob.prototype), (i.prototype = Blob.prototype)),
          (module.exports = t ? (r ? Blob : i) : n ? u : void 0);
      },
      {},
    ],
    '2W98': [
      function(require, module, exports) {
        var e,
          r = require('./keys'),
          t = require('has-binary2'),
          n = require('arraybuffer.slice'),
          a = require('after'),
          o = require('./utf8');
        'undefined' != typeof ArrayBuffer &&
          (e = require('base64-arraybuffer'));
        var f =
            'undefined' != typeof navigator &&
            /Android/i.test(navigator.userAgent),
          i =
            'undefined' != typeof navigator &&
            /PhantomJS/i.test(navigator.userAgent),
          u = f || i;
        exports.protocol = 3;
        var c = (exports.packets = {
            open: 0,
            close: 1,
            ping: 2,
            pong: 3,
            message: 4,
            upgrade: 5,
            noop: 6,
          }),
          d = r(c),
          s = { type: 'error', data: 'parser error' },
          y = require('blob');
        function p(e, r) {
          return r('b' + exports.packets[e.type] + e.data.data);
        }
        function l(e, r, t) {
          if (!r) return exports.encodeBase64Packet(e, t);
          var n = e.data,
            a = new Uint8Array(n),
            o = new Uint8Array(1 + n.byteLength);
          o[0] = c[e.type];
          for (var f = 0; f < a.length; f++) o[f + 1] = a[f];
          return t(o.buffer);
        }
        function g(e, r, t) {
          if (!r) return exports.encodeBase64Packet(e, t);
          var n = new FileReader();
          return (
            (n.onload = function() {
              exports.encodePacket({ type: e.type, data: n.result }, r, !0, t);
            }),
            n.readAsArrayBuffer(e.data)
          );
        }
        function h(e, r, t) {
          if (!r) return exports.encodeBase64Packet(e, t);
          if (u) return g(e, r, t);
          var n = new Uint8Array(1);
          return (n[0] = c[e.type]), t(new y([n.buffer, e.data]));
        }
        function v(e) {
          try {
            e = o.decode(e, { strict: !1 });
          } catch (r) {
            return !1;
          }
          return e;
        }
        function A(e, r, t) {
          for (
            var n = new Array(e.length),
              o = a(e.length, t),
              f = function(e, t, a) {
                r(t, function(r, t) {
                  (n[e] = t), a(r, n);
                });
              },
              i = 0;
            i < e.length;
            i++
          )
            f(i, e[i], o);
        }
        (exports.encodePacket = function(e, r, t, n) {
          'function' == typeof r && ((n = r), (r = !1)),
            'function' == typeof t && ((n = t), (t = null));
          var a = void 0 === e.data ? void 0 : e.data.buffer || e.data;
          if ('undefined' != typeof ArrayBuffer && a instanceof ArrayBuffer)
            return l(e, r, n);
          if (void 0 !== y && a instanceof y) return h(e, r, n);
          if (a && a.base64) return p(e, n);
          var f = c[e.type];
          return (
            void 0 !== e.data &&
              (f += t
                ? o.encode(String(e.data), { strict: !1 })
                : String(e.data)),
            n('' + f)
          );
        }),
          (exports.encodeBase64Packet = function(e, r) {
            var t,
              n = 'b' + exports.packets[e.type];
            if (void 0 !== y && e.data instanceof y) {
              var a = new FileReader();
              return (
                (a.onload = function() {
                  var e = a.result.split(',')[1];
                  r(n + e);
                }),
                a.readAsDataURL(e.data)
              );
            }
            try {
              t = String.fromCharCode.apply(null, new Uint8Array(e.data));
            } catch (u) {
              for (
                var o = new Uint8Array(e.data), f = new Array(o.length), i = 0;
                i < o.length;
                i++
              )
                f[i] = o[i];
              t = String.fromCharCode.apply(null, f);
            }
            return (n += btoa(t)), r(n);
          }),
          (exports.decodePacket = function(e, r, t) {
            if (void 0 === e) return s;
            if ('string' == typeof e) {
              if ('b' === e.charAt(0))
                return exports.decodeBase64Packet(e.substr(1), r);
              if (t && !1 === (e = v(e))) return s;
              var a = e.charAt(0);
              return Number(a) == a && d[a]
                ? e.length > 1
                  ? { type: d[a], data: e.substring(1) }
                  : { type: d[a] }
                : s;
            }
            a = new Uint8Array(e)[0];
            var o = n(e, 1);
            return (
              y && 'blob' === r && (o = new y([o])), { type: d[a], data: o }
            );
          }),
          (exports.decodeBase64Packet = function(r, t) {
            var n = d[r.charAt(0)];
            if (!e) return { type: n, data: { base64: !0, data: r.substr(1) } };
            var a = e.decode(r.substr(1));
            return 'blob' === t && y && (a = new y([a])), { type: n, data: a };
          }),
          (exports.encodePayload = function(e, r, n) {
            'function' == typeof r && ((n = r), (r = null));
            var a = t(e);
            if (r && a)
              return y && !u
                ? exports.encodePayloadAsBlob(e, n)
                : exports.encodePayloadAsArrayBuffer(e, n);
            if (!e.length) return n('0:');
            A(
              e,
              function(e, t) {
                exports.encodePacket(e, !!a && r, !1, function(e) {
                  t(
                    null,
                    (function(e) {
                      return e.length + ':' + e;
                    })(e)
                  );
                });
              },
              function(e, r) {
                return n(r.join(''));
              }
            );
          }),
          (exports.decodePayload = function(e, r, t) {
            if ('string' != typeof e)
              return exports.decodePayloadAsBinary(e, r, t);
            var n;
            if (('function' == typeof r && ((t = r), (r = null)), '' === e))
              return t(s, 0, 1);
            for (var a, o, f = '', i = 0, u = e.length; i < u; i++) {
              var c = e.charAt(i);
              if (':' === c) {
                if ('' === f || f != (a = Number(f))) return t(s, 0, 1);
                if (f != (o = e.substr(i + 1, a)).length) return t(s, 0, 1);
                if (o.length) {
                  if (
                    ((n = exports.decodePacket(o, r, !1)),
                    s.type === n.type && s.data === n.data)
                  )
                    return t(s, 0, 1);
                  if (!1 === t(n, i + a, u)) return;
                }
                (i += a), (f = '');
              } else f += c;
            }
            return '' !== f ? t(s, 0, 1) : void 0;
          }),
          (exports.encodePayloadAsArrayBuffer = function(e, r) {
            if (!e.length) return r(new ArrayBuffer(0));
            A(
              e,
              function(e, r) {
                exports.encodePacket(e, !0, !0, function(e) {
                  return r(null, e);
                });
              },
              function(e, t) {
                var n = t.reduce(function(e, r) {
                    var t;
                    return (
                      e +
                      (t =
                        'string' == typeof r
                          ? r.length
                          : r.byteLength).toString().length +
                      t +
                      2
                    );
                  }, 0),
                  a = new Uint8Array(n),
                  o = 0;
                return (
                  t.forEach(function(e) {
                    var r = 'string' == typeof e,
                      t = e;
                    if (r) {
                      for (
                        var n = new Uint8Array(e.length), f = 0;
                        f < e.length;
                        f++
                      )
                        n[f] = e.charCodeAt(f);
                      t = n.buffer;
                    }
                    a[o++] = r ? 0 : 1;
                    var i = t.byteLength.toString();
                    for (f = 0; f < i.length; f++) a[o++] = parseInt(i[f]);
                    a[o++] = 255;
                    for (n = new Uint8Array(t), f = 0; f < n.length; f++)
                      a[o++] = n[f];
                  }),
                  r(a.buffer)
                );
              }
            );
          }),
          (exports.encodePayloadAsBlob = function(e, r) {
            A(
              e,
              function(e, r) {
                exports.encodePacket(e, !0, !0, function(e) {
                  var t = new Uint8Array(1);
                  if (((t[0] = 1), 'string' == typeof e)) {
                    for (
                      var n = new Uint8Array(e.length), a = 0;
                      a < e.length;
                      a++
                    )
                      n[a] = e.charCodeAt(a);
                    (e = n.buffer), (t[0] = 0);
                  }
                  var o = (e instanceof ArrayBuffer
                      ? e.byteLength
                      : e.size
                    ).toString(),
                    f = new Uint8Array(o.length + 1);
                  for (a = 0; a < o.length; a++) f[a] = parseInt(o[a]);
                  if (((f[o.length] = 255), y)) {
                    var i = new y([t.buffer, f.buffer, e]);
                    r(null, i);
                  }
                });
              },
              function(e, t) {
                return r(new y(t));
              }
            );
          }),
          (exports.decodePayloadAsBinary = function(e, r, t) {
            'function' == typeof r && ((t = r), (r = null));
            for (var a = e, o = []; a.byteLength > 0; ) {
              for (
                var f = new Uint8Array(a), i = 0 === f[0], u = '', c = 1;
                255 !== f[c];
                c++
              ) {
                if (u.length > 310) return t(s, 0, 1);
                u += f[c];
              }
              (a = n(a, 2 + u.length)), (u = parseInt(u));
              var d = n(a, 0, u);
              if (i)
                try {
                  d = String.fromCharCode.apply(null, new Uint8Array(d));
                } catch (l) {
                  var y = new Uint8Array(d);
                  d = '';
                  for (c = 0; c < y.length; c++) d += String.fromCharCode(y[c]);
                }
              o.push(d), (a = n(a, u));
            }
            var p = o.length;
            o.forEach(function(e, n) {
              t(exports.decodePacket(e, r, !0), n, p);
            });
          });
      },
      {
        './keys': 'PQm/',
        'has-binary2': '+oIq',
        'arraybuffer.slice': 'v4iP',
        after: 't3ut',
        './utf8': 'S7zD',
        'base64-arraybuffer': 'VBf3',
        blob: '04AK',
      },
    ],
    aoJx: [
      function(require, module, exports) {
        var t = require('engine.io-parser'),
          e = require('component-emitter');
        function s(t) {
          (this.path = t.path),
            (this.hostname = t.hostname),
            (this.port = t.port),
            (this.secure = t.secure),
            (this.query = t.query),
            (this.timestampParam = t.timestampParam),
            (this.timestampRequests = t.timestampRequests),
            (this.readyState = ''),
            (this.agent = t.agent || !1),
            (this.socket = t.socket),
            (this.enablesXDR = t.enablesXDR),
            (this.pfx = t.pfx),
            (this.key = t.key),
            (this.passphrase = t.passphrase),
            (this.cert = t.cert),
            (this.ca = t.ca),
            (this.ciphers = t.ciphers),
            (this.rejectUnauthorized = t.rejectUnauthorized),
            (this.forceNode = t.forceNode),
            (this.isReactNative = t.isReactNative),
            (this.extraHeaders = t.extraHeaders),
            (this.localAddress = t.localAddress);
        }
        (module.exports = s),
          e(s.prototype),
          (s.prototype.onError = function(t, e) {
            var s = new Error(t);
            return (
              (s.type = 'TransportError'),
              (s.description = e),
              this.emit('error', s),
              this
            );
          }),
          (s.prototype.open = function() {
            return (
              ('closed' !== this.readyState && '' !== this.readyState) ||
                ((this.readyState = 'opening'), this.doOpen()),
              this
            );
          }),
          (s.prototype.close = function() {
            return (
              ('opening' !== this.readyState && 'open' !== this.readyState) ||
                (this.doClose(), this.onClose()),
              this
            );
          }),
          (s.prototype.send = function(t) {
            if ('open' !== this.readyState)
              throw new Error('Transport not open');
            this.write(t);
          }),
          (s.prototype.onOpen = function() {
            (this.readyState = 'open'), (this.writable = !0), this.emit('open');
          }),
          (s.prototype.onData = function(e) {
            var s = t.decodePacket(e, this.socket.binaryType);
            this.onPacket(s);
          }),
          (s.prototype.onPacket = function(t) {
            this.emit('packet', t);
          }),
          (s.prototype.onClose = function() {
            (this.readyState = 'closed'), this.emit('close');
          });
      },
      { 'engine.io-parser': '2W98', 'component-emitter': 'XUqb' },
    ],
    a1bU: [
      function(require, module, exports) {
        (exports.encode = function(e) {
          var n = '';
          for (var o in e)
            e.hasOwnProperty(o) &&
              (n.length && (n += '&'),
              (n += encodeURIComponent(o) + '=' + encodeURIComponent(e[o])));
          return n;
        }),
          (exports.decode = function(e) {
            for (
              var n = {}, o = e.split('&'), t = 0, r = o.length;
              t < r;
              t++
            ) {
              var d = o[t].split('=');
              n[decodeURIComponent(d[0])] = decodeURIComponent(d[1]);
            }
            return n;
          });
      },
      {},
    ],
    ZngT: [
      function(require, module, exports) {
        module.exports = function(o, t) {
          var p = function() {};
          (p.prototype = t.prototype),
            (o.prototype = new p()),
            (o.prototype.constructor = o);
        };
      },
      {},
    ],
    hQ4G: [
      function(require, module, exports) {
        'use strict';
        var r,
          e = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(
            ''
          ),
          t = 64,
          n = {},
          o = 0,
          u = 0;
        function a(r) {
          var n = '';
          do {
            (n = e[r % t] + n), (r = Math.floor(r / t));
          } while (r > 0);
          return n;
        }
        function c(r) {
          var e = 0;
          for (u = 0; u < r.length; u++) e = e * t + n[r.charAt(u)];
          return e;
        }
        function f() {
          var e = a(+new Date());
          return e !== r ? ((o = 0), (r = e)) : e + '.' + a(o++);
        }
        for (; u < t; u++) n[e[u]] = u;
        (f.encode = a), (f.decode = c), (module.exports = f);
      },
      {},
    ],
    BPT5: [
      function(require, module, exports) {
        var t = require('../transport'),
          e = require('parseqs'),
          i = require('engine.io-parser'),
          o = require('component-inherit'),
          n = require('yeast'),
          r = require('debug')('engine.io-client:polling');
        module.exports = p;
        var s =
          null !=
          new (require('xmlhttprequest-ssl'))({ xdomain: !1 }).responseType;
        function p(e) {
          var i = e && e.forceBase64;
          (s && !i) || (this.supportsBinary = !1), t.call(this, e);
        }
        o(p, t),
          (p.prototype.name = 'polling'),
          (p.prototype.doOpen = function() {
            this.poll();
          }),
          (p.prototype.pause = function(t) {
            var e = this;
            function i() {
              r('paused'), (e.readyState = 'paused'), t();
            }
            if (
              ((this.readyState = 'pausing'), this.polling || !this.writable)
            ) {
              var o = 0;
              this.polling &&
                (r('we are currently polling - waiting to pause'),
                o++,
                this.once('pollComplete', function() {
                  r('pre-pause polling complete'), --o || i();
                })),
                this.writable ||
                  (r('we are currently writing - waiting to pause'),
                  o++,
                  this.once('drain', function() {
                    r('pre-pause writing complete'), --o || i();
                  }));
            } else i();
          }),
          (p.prototype.poll = function() {
            r('polling'), (this.polling = !0), this.doPoll(), this.emit('poll');
          }),
          (p.prototype.onData = function(t) {
            var e = this;
            r('polling got data %s', t);
            i.decodePayload(t, this.socket.binaryType, function(t, i, o) {
              if (
                ('opening' === e.readyState && e.onOpen(), 'close' === t.type)
              )
                return e.onClose(), !1;
              e.onPacket(t);
            }),
              'closed' !== this.readyState &&
                ((this.polling = !1),
                this.emit('pollComplete'),
                'open' === this.readyState
                  ? this.poll()
                  : r('ignoring poll - transport state "%s"', this.readyState));
          }),
          (p.prototype.doClose = function() {
            var t = this;
            function e() {
              r('writing close packet'), t.write([{ type: 'close' }]);
            }
            'open' === this.readyState
              ? (r('transport open - closing'), e())
              : (r('transport not open - deferring close'),
                this.once('open', e));
          }),
          (p.prototype.write = function(t) {
            var e = this;
            this.writable = !1;
            var o = function() {
              (e.writable = !0), e.emit('drain');
            };
            i.encodePayload(t, this.supportsBinary, function(t) {
              e.doWrite(t, o);
            });
          }),
          (p.prototype.uri = function() {
            var t = this.query || {},
              i = this.secure ? 'https' : 'http',
              o = '';
            return (
              !1 !== this.timestampRequests && (t[this.timestampParam] = n()),
              this.supportsBinary || t.sid || (t.b64 = 1),
              (t = e.encode(t)),
              this.port &&
                (('https' === i && 443 !== Number(this.port)) ||
                  ('http' === i && 80 !== Number(this.port))) &&
                (o = ':' + this.port),
              t.length && (t = '?' + t),
              i +
                '://' +
                (-1 !== this.hostname.indexOf(':')
                  ? '[' + this.hostname + ']'
                  : this.hostname) +
                o +
                this.path +
                t
            );
          });
      },
      {
        '../transport': 'aoJx',
        parseqs: 'a1bU',
        'engine.io-parser': '2W98',
        'component-inherit': 'ZngT',
        yeast: 'hQ4G',
        debug: '1tjN',
        'xmlhttprequest-ssl': 'jhGE',
      },
    ],
    uJlD: [
      function(require, module, exports) {
        var t = require('xmlhttprequest-ssl'),
          e = require('./polling'),
          s = require('component-emitter'),
          r = require('component-inherit'),
          i = require('debug')('engine.io-client:polling-xhr');
        function o() {}
        function n(t) {
          if (
            (e.call(this, t),
            (this.requestTimeout = t.requestTimeout),
            (this.extraHeaders = t.extraHeaders),
            'undefined' != typeof location)
          ) {
            var s = 'https:' === location.protocol,
              r = location.port;
            r || (r = s ? 443 : 80),
              (this.xd =
                ('undefined' != typeof location &&
                  t.hostname !== location.hostname) ||
                r !== t.port),
              (this.xs = t.secure !== s);
          }
        }
        function a(t) {
          (this.method = t.method || 'GET'),
            (this.uri = t.uri),
            (this.xd = !!t.xd),
            (this.xs = !!t.xs),
            (this.async = !1 !== t.async),
            (this.data = void 0 !== t.data ? t.data : null),
            (this.agent = t.agent),
            (this.isBinary = t.isBinary),
            (this.supportsBinary = t.supportsBinary),
            (this.enablesXDR = t.enablesXDR),
            (this.requestTimeout = t.requestTimeout),
            (this.pfx = t.pfx),
            (this.key = t.key),
            (this.passphrase = t.passphrase),
            (this.cert = t.cert),
            (this.ca = t.ca),
            (this.ciphers = t.ciphers),
            (this.rejectUnauthorized = t.rejectUnauthorized),
            (this.extraHeaders = t.extraHeaders),
            this.create();
        }
        if (
          ((module.exports = n),
          (module.exports.Request = a),
          r(n, e),
          (n.prototype.supportsBinary = !0),
          (n.prototype.request = function(t) {
            return (
              ((t = t || {}).uri = this.uri()),
              (t.xd = this.xd),
              (t.xs = this.xs),
              (t.agent = this.agent || !1),
              (t.supportsBinary = this.supportsBinary),
              (t.enablesXDR = this.enablesXDR),
              (t.pfx = this.pfx),
              (t.key = this.key),
              (t.passphrase = this.passphrase),
              (t.cert = this.cert),
              (t.ca = this.ca),
              (t.ciphers = this.ciphers),
              (t.rejectUnauthorized = this.rejectUnauthorized),
              (t.requestTimeout = this.requestTimeout),
              (t.extraHeaders = this.extraHeaders),
              new a(t)
            );
          }),
          (n.prototype.doWrite = function(t, e) {
            var s = 'string' != typeof t && void 0 !== t,
              r = this.request({ method: 'POST', data: t, isBinary: s }),
              i = this;
            r.on('success', e),
              r.on('error', function(t) {
                i.onError('xhr post error', t);
              }),
              (this.sendXhr = r);
          }),
          (n.prototype.doPoll = function() {
            i('xhr poll');
            var t = this.request(),
              e = this;
            t.on('data', function(t) {
              e.onData(t);
            }),
              t.on('error', function(t) {
                e.onError('xhr poll error', t);
              }),
              (this.pollXhr = t);
          }),
          s(a.prototype),
          (a.prototype.create = function() {
            var e = {
              agent: this.agent,
              xdomain: this.xd,
              xscheme: this.xs,
              enablesXDR: this.enablesXDR,
            };
            (e.pfx = this.pfx),
              (e.key = this.key),
              (e.passphrase = this.passphrase),
              (e.cert = this.cert),
              (e.ca = this.ca),
              (e.ciphers = this.ciphers),
              (e.rejectUnauthorized = this.rejectUnauthorized);
            var s = (this.xhr = new t(e)),
              r = this;
            try {
              i('xhr open %s: %s', this.method, this.uri),
                s.open(this.method, this.uri, this.async);
              try {
                if (this.extraHeaders)
                  for (var o in (s.setDisableHeaderCheck &&
                    s.setDisableHeaderCheck(!0),
                  this.extraHeaders))
                    this.extraHeaders.hasOwnProperty(o) &&
                      s.setRequestHeader(o, this.extraHeaders[o]);
              } catch (n) {}
              if ('POST' === this.method)
                try {
                  this.isBinary
                    ? s.setRequestHeader(
                        'Content-type',
                        'application/octet-stream'
                      )
                    : s.setRequestHeader(
                        'Content-type',
                        'text/plain;charset=UTF-8'
                      );
                } catch (n) {}
              try {
                s.setRequestHeader('Accept', '*/*');
              } catch (n) {}
              'withCredentials' in s && (s.withCredentials = !0),
                this.requestTimeout && (s.timeout = this.requestTimeout),
                this.hasXDR()
                  ? ((s.onload = function() {
                      r.onLoad();
                    }),
                    (s.onerror = function() {
                      r.onError(s.responseText);
                    }))
                  : (s.onreadystatechange = function() {
                      if (2 === s.readyState)
                        try {
                          var t = s.getResponseHeader('Content-Type');
                          r.supportsBinary &&
                            'application/octet-stream' === t &&
                            (s.responseType = 'arraybuffer');
                        } catch (n) {}
                      4 === s.readyState &&
                        (200 === s.status || 1223 === s.status
                          ? r.onLoad()
                          : setTimeout(function() {
                              r.onError(s.status);
                            }, 0));
                    }),
                i('xhr data %s', this.data),
                s.send(this.data);
            } catch (n) {
              return void setTimeout(function() {
                r.onError(n);
              }, 0);
            }
            'undefined' != typeof document &&
              ((this.index = a.requestsCount++),
              (a.requests[this.index] = this));
          }),
          (a.prototype.onSuccess = function() {
            this.emit('success'), this.cleanup();
          }),
          (a.prototype.onData = function(t) {
            this.emit('data', t), this.onSuccess();
          }),
          (a.prototype.onError = function(t) {
            this.emit('error', t), this.cleanup(!0);
          }),
          (a.prototype.cleanup = function(t) {
            if (void 0 !== this.xhr && null !== this.xhr) {
              if (
                (this.hasXDR()
                  ? (this.xhr.onload = this.xhr.onerror = o)
                  : (this.xhr.onreadystatechange = o),
                t)
              )
                try {
                  this.xhr.abort();
                } catch (e) {}
              'undefined' != typeof document && delete a.requests[this.index],
                (this.xhr = null);
            }
          }),
          (a.prototype.onLoad = function() {
            var t;
            try {
              var e;
              try {
                e = this.xhr.getResponseHeader('Content-Type');
              } catch (s) {}
              t =
                ('application/octet-stream' === e && this.xhr.response) ||
                this.xhr.responseText;
            } catch (s) {
              this.onError(s);
            }
            null != t && this.onData(t);
          }),
          (a.prototype.hasXDR = function() {
            return (
              'undefined' != typeof XDomainRequest &&
              !this.xs &&
              this.enablesXDR
            );
          }),
          (a.prototype.abort = function() {
            this.cleanup();
          }),
          (a.requestsCount = 0),
          (a.requests = {}),
          'undefined' != typeof document)
        )
          if ('function' == typeof attachEvent) attachEvent('onunload', u);
          else if ('function' == typeof addEventListener) {
            var h = 'onpagehide' in self ? 'pagehide' : 'unload';
            addEventListener(h, u, !1);
          }
        function u() {
          for (var t in a.requests)
            a.requests.hasOwnProperty(t) && a.requests[t].abort();
        }
      },
      {
        'xmlhttprequest-ssl': 'jhGE',
        './polling': 'BPT5',
        'component-emitter': 'XUqb',
        'component-inherit': 'ZngT',
        debug: '1tjN',
      },
    ],
    'dW+d': [
      function(require, module, exports) {
        var global = arguments[3];
        var e = arguments[3],
          t = require('./polling'),
          r = require('component-inherit');
        module.exports = c;
        var i,
          o = /\n/g,
          n = /\\n/g;
        function a() {}
        function s() {
          return 'undefined' != typeof self
            ? self
            : 'undefined' != typeof window
            ? window
            : void 0 !== e
            ? e
            : {};
        }
        function c(e) {
          if ((t.call(this, e), (this.query = this.query || {}), !i)) {
            var r = s();
            i = r.___eio = r.___eio || [];
          }
          this.index = i.length;
          var o = this;
          i.push(function(e) {
            o.onData(e);
          }),
            (this.query.j = this.index),
            'function' == typeof addEventListener &&
              addEventListener(
                'beforeunload',
                function() {
                  o.script && (o.script.onerror = a);
                },
                !1
              );
        }
        r(c, t),
          (c.prototype.supportsBinary = !1),
          (c.prototype.doClose = function() {
            this.script &&
              (this.script.parentNode.removeChild(this.script),
              (this.script = null)),
              this.form &&
                (this.form.parentNode.removeChild(this.form),
                (this.form = null),
                (this.iframe = null)),
              t.prototype.doClose.call(this);
          }),
          (c.prototype.doPoll = function() {
            var e = this,
              t = document.createElement('script');
            this.script &&
              (this.script.parentNode.removeChild(this.script),
              (this.script = null)),
              (t.async = !0),
              (t.src = this.uri()),
              (t.onerror = function(t) {
                e.onError('jsonp poll error', t);
              });
            var r = document.getElementsByTagName('script')[0];
            r
              ? r.parentNode.insertBefore(t, r)
              : (document.head || document.body).appendChild(t),
              (this.script = t),
              'undefined' != typeof navigator &&
                /gecko/i.test(navigator.userAgent) &&
                setTimeout(function() {
                  var e = document.createElement('iframe');
                  document.body.appendChild(e), document.body.removeChild(e);
                }, 100);
          }),
          (c.prototype.doWrite = function(e, t) {
            var r = this;
            if (!this.form) {
              var i,
                a = document.createElement('form'),
                s = document.createElement('textarea'),
                c = (this.iframeId = 'eio_iframe_' + this.index);
              (a.className = 'socketio'),
                (a.style.position = 'absolute'),
                (a.style.top = '-1000px'),
                (a.style.left = '-1000px'),
                (a.target = c),
                (a.method = 'POST'),
                a.setAttribute('accept-charset', 'utf-8'),
                (s.name = 'd'),
                a.appendChild(s),
                document.body.appendChild(a),
                (this.form = a),
                (this.area = s);
            }
            function d() {
              m(), t();
            }
            function m() {
              if (r.iframe)
                try {
                  r.form.removeChild(r.iframe);
                } catch (t) {
                  r.onError('jsonp polling iframe removal error', t);
                }
              try {
                var e = '<iframe src="javascript:0" name="' + r.iframeId + '">';
                i = document.createElement(e);
              } catch (t) {
                ((i = document.createElement('iframe')).name = r.iframeId),
                  (i.src = 'javascript:0');
              }
              (i.id = r.iframeId), r.form.appendChild(i), (r.iframe = i);
            }
            (this.form.action = this.uri()),
              m(),
              (e = e.replace(n, '\\\n')),
              (this.area.value = e.replace(o, '\\n'));
            try {
              this.form.submit();
            } catch (p) {}
            this.iframe.attachEvent
              ? (this.iframe.onreadystatechange = function() {
                  'complete' === r.iframe.readyState && d();
                })
              : (this.iframe.onload = d);
          });
      },
      { './polling': 'BPT5', 'component-inherit': 'ZngT' },
    ],
    '70rD': [function(require, module, exports) {}, {}],
    rRq3: [
      function(require, module, exports) {
        var Buffer = require('buffer').Buffer;
        var e,
          t,
          s = require('buffer').Buffer,
          r = require('../transport'),
          i = require('engine.io-parser'),
          o = require('parseqs'),
          n = require('component-inherit'),
          a = require('yeast'),
          h = require('debug')('engine.io-client:websocket');
        if ('undefined' != typeof WebSocket) e = WebSocket;
        else if ('undefined' != typeof self)
          e = self.WebSocket || self.MozWebSocket;
        else
          try {
            t = require('ws');
          } catch (u) {}
        var p = e || t;
        function c(s) {
          s && s.forceBase64 && (this.supportsBinary = !1),
            (this.perMessageDeflate = s.perMessageDeflate),
            (this.usingBrowserWebSocket = e && !s.forceNode),
            (this.protocols = s.protocols),
            this.usingBrowserWebSocket || (p = t),
            r.call(this, s);
        }
        (module.exports = c),
          n(c, r),
          (c.prototype.name = 'websocket'),
          (c.prototype.supportsBinary = !0),
          (c.prototype.doOpen = function() {
            if (this.check()) {
              var e = this.uri(),
                t = this.protocols,
                s = {
                  agent: this.agent,
                  perMessageDeflate: this.perMessageDeflate,
                };
              (s.pfx = this.pfx),
                (s.key = this.key),
                (s.passphrase = this.passphrase),
                (s.cert = this.cert),
                (s.ca = this.ca),
                (s.ciphers = this.ciphers),
                (s.rejectUnauthorized = this.rejectUnauthorized),
                this.extraHeaders && (s.headers = this.extraHeaders),
                this.localAddress && (s.localAddress = this.localAddress);
              try {
                this.ws =
                  this.usingBrowserWebSocket && !this.isReactNative
                    ? t
                      ? new p(e, t)
                      : new p(e)
                    : new p(e, t, s);
              } catch (r) {
                return this.emit('error', r);
              }
              void 0 === this.ws.binaryType && (this.supportsBinary = !1),
                this.ws.supports && this.ws.supports.binary
                  ? ((this.supportsBinary = !0),
                    (this.ws.binaryType = 'nodebuffer'))
                  : (this.ws.binaryType = 'arraybuffer'),
                this.addEventListeners();
            }
          }),
          (c.prototype.addEventListeners = function() {
            var e = this;
            (this.ws.onopen = function() {
              e.onOpen();
            }),
              (this.ws.onclose = function() {
                e.onClose();
              }),
              (this.ws.onmessage = function(t) {
                e.onData(t.data);
              }),
              (this.ws.onerror = function(t) {
                e.onError('websocket error', t);
              });
          }),
          (c.prototype.write = function(e) {
            var t = this;
            this.writable = !1;
            for (var r = e.length, o = 0, n = r; o < n; o++)
              !(function(e) {
                i.encodePacket(e, t.supportsBinary, function(i) {
                  if (!t.usingBrowserWebSocket) {
                    var o = {};
                    if (
                      (e.options && (o.compress = e.options.compress),
                      t.perMessageDeflate)
                    )
                      ('string' == typeof i ? s.byteLength(i) : i.length) <
                        t.perMessageDeflate.threshold && (o.compress = !1);
                  }
                  try {
                    t.usingBrowserWebSocket ? t.ws.send(i) : t.ws.send(i, o);
                  } catch (u) {
                    h('websocket closed before onclose event');
                  }
                  --r || a();
                });
              })(e[o]);
            function a() {
              t.emit('flush'),
                setTimeout(function() {
                  (t.writable = !0), t.emit('drain');
                }, 0);
            }
          }),
          (c.prototype.onClose = function() {
            r.prototype.onClose.call(this);
          }),
          (c.prototype.doClose = function() {
            void 0 !== this.ws && this.ws.close();
          }),
          (c.prototype.uri = function() {
            var e = this.query || {},
              t = this.secure ? 'wss' : 'ws',
              s = '';
            return (
              this.port &&
                (('wss' === t && 443 !== Number(this.port)) ||
                  ('ws' === t && 80 !== Number(this.port))) &&
                (s = ':' + this.port),
              this.timestampRequests && (e[this.timestampParam] = a()),
              this.supportsBinary || (e.b64 = 1),
              (e = o.encode(e)).length && (e = '?' + e),
              t +
                '://' +
                (-1 !== this.hostname.indexOf(':')
                  ? '[' + this.hostname + ']'
                  : this.hostname) +
                s +
                this.path +
                e
            );
          }),
          (c.prototype.check = function() {
            return !(
              !p ||
              ('__initialize' in p && this.name === c.prototype.name)
            );
          });
      },
      {
        '../transport': 'aoJx',
        'engine.io-parser': '2W98',
        parseqs: 'a1bU',
        'component-inherit': 'ZngT',
        yeast: 'hQ4G',
        debug: '1tjN',
        ws: '70rD',
        buffer: 'dskh',
      },
    ],
    DZ9o: [
      function(require, module, exports) {
        var e = require('xmlhttprequest-ssl'),
          o = require('./polling-xhr'),
          r = require('./polling-jsonp'),
          n = require('./websocket');
        function t(n) {
          var t = !1,
            i = !1,
            s = !1 !== n.jsonp;
          if ('undefined' != typeof location) {
            var l = 'https:' === location.protocol,
              p = location.port;
            p || (p = l ? 443 : 80),
              (t = n.hostname !== location.hostname || p !== n.port),
              (i = n.secure !== l);
          }
          if (
            ((n.xdomain = t),
            (n.xscheme = i),
            'open' in new e(n) && !n.forceJSONP)
          )
            return new o(n);
          if (!s) throw new Error('JSONP disabled');
          return new r(n);
        }
        (exports.polling = t), (exports.websocket = n);
      },
      {
        'xmlhttprequest-ssl': 'jhGE',
        './polling-xhr': 'uJlD',
        './polling-jsonp': 'dW+d',
        './websocket': 'rRq3',
      },
    ],
    OedV: [
      function(require, module, exports) {
        var r = [].indexOf;
        module.exports = function(e, n) {
          if (r) return e.indexOf(n);
          for (var f = 0; f < e.length; ++f) if (e[f] === n) return f;
          return -1;
        };
      },
      {},
    ],
    wtcu: [
      function(require, module, exports) {
        var e = require('./transports/index'),
          t = require('component-emitter'),
          r = require('debug')('engine.io-client:socket'),
          s = require('indexof'),
          i = require('engine.io-parser'),
          o = require('parseuri'),
          n = require('parseqs');
        function a(e, t) {
          if (!(this instanceof a)) return new a(e, t);
          (t = t || {}),
            e && 'object' == typeof e && ((t = e), (e = null)),
            e
              ? ((e = o(e)),
                (t.hostname = e.host),
                (t.secure = 'https' === e.protocol || 'wss' === e.protocol),
                (t.port = e.port),
                e.query && (t.query = e.query))
              : t.host && (t.hostname = o(t.host).host),
            (this.secure =
              null != t.secure
                ? t.secure
                : 'undefined' != typeof location &&
                  'https:' === location.protocol),
            t.hostname && !t.port && (t.port = this.secure ? '443' : '80'),
            (this.agent = t.agent || !1),
            (this.hostname =
              t.hostname ||
              ('undefined' != typeof location
                ? location.hostname
                : 'localhost')),
            (this.port =
              t.port ||
              ('undefined' != typeof location && location.port
                ? location.port
                : this.secure
                ? 443
                : 80)),
            (this.query = t.query || {}),
            'string' == typeof this.query &&
              (this.query = n.decode(this.query)),
            (this.upgrade = !1 !== t.upgrade),
            (this.path = (t.path || '/engine.io').replace(/\/$/, '') + '/'),
            (this.forceJSONP = !!t.forceJSONP),
            (this.jsonp = !1 !== t.jsonp),
            (this.forceBase64 = !!t.forceBase64),
            (this.enablesXDR = !!t.enablesXDR),
            (this.timestampParam = t.timestampParam || 't'),
            (this.timestampRequests = t.timestampRequests),
            (this.transports = t.transports || ['polling', 'websocket']),
            (this.transportOptions = t.transportOptions || {}),
            (this.readyState = ''),
            (this.writeBuffer = []),
            (this.prevBufferLen = 0),
            (this.policyPort = t.policyPort || 843),
            (this.rememberUpgrade = t.rememberUpgrade || !1),
            (this.binaryType = null),
            (this.onlyBinaryUpgrades = t.onlyBinaryUpgrades),
            (this.perMessageDeflate =
              !1 !== t.perMessageDeflate && (t.perMessageDeflate || {})),
            !0 === this.perMessageDeflate && (this.perMessageDeflate = {}),
            this.perMessageDeflate &&
              null == this.perMessageDeflate.threshold &&
              (this.perMessageDeflate.threshold = 1024),
            (this.pfx = t.pfx || null),
            (this.key = t.key || null),
            (this.passphrase = t.passphrase || null),
            (this.cert = t.cert || null),
            (this.ca = t.ca || null),
            (this.ciphers = t.ciphers || null),
            (this.rejectUnauthorized =
              void 0 === t.rejectUnauthorized || t.rejectUnauthorized),
            (this.forceNode = !!t.forceNode),
            (this.isReactNative =
              'undefined' != typeof navigator &&
              'string' == typeof navigator.product &&
              'reactnative' === navigator.product.toLowerCase()),
            ('undefined' == typeof self || this.isReactNative) &&
              (t.extraHeaders &&
                Object.keys(t.extraHeaders).length > 0 &&
                (this.extraHeaders = t.extraHeaders),
              t.localAddress && (this.localAddress = t.localAddress)),
            (this.id = null),
            (this.upgrades = null),
            (this.pingInterval = null),
            (this.pingTimeout = null),
            (this.pingIntervalTimer = null),
            (this.pingTimeoutTimer = null),
            this.open();
        }
        function p(e) {
          var t = {};
          for (var r in e) e.hasOwnProperty(r) && (t[r] = e[r]);
          return t;
        }
        (module.exports = a),
          (a.priorWebsocketSuccess = !1),
          t(a.prototype),
          (a.protocol = i.protocol),
          (a.Socket = a),
          (a.Transport = require('./transport')),
          (a.transports = require('./transports/index')),
          (a.parser = require('engine.io-parser')),
          (a.prototype.createTransport = function(t) {
            r('creating transport "%s"', t);
            var s = p(this.query);
            (s.EIO = i.protocol), (s.transport = t);
            var o = this.transportOptions[t] || {};
            return (
              this.id && (s.sid = this.id),
              new e[t]({
                query: s,
                socket: this,
                agent: o.agent || this.agent,
                hostname: o.hostname || this.hostname,
                port: o.port || this.port,
                secure: o.secure || this.secure,
                path: o.path || this.path,
                forceJSONP: o.forceJSONP || this.forceJSONP,
                jsonp: o.jsonp || this.jsonp,
                forceBase64: o.forceBase64 || this.forceBase64,
                enablesXDR: o.enablesXDR || this.enablesXDR,
                timestampRequests:
                  o.timestampRequests || this.timestampRequests,
                timestampParam: o.timestampParam || this.timestampParam,
                policyPort: o.policyPort || this.policyPort,
                pfx: o.pfx || this.pfx,
                key: o.key || this.key,
                passphrase: o.passphrase || this.passphrase,
                cert: o.cert || this.cert,
                ca: o.ca || this.ca,
                ciphers: o.ciphers || this.ciphers,
                rejectUnauthorized:
                  o.rejectUnauthorized || this.rejectUnauthorized,
                perMessageDeflate:
                  o.perMessageDeflate || this.perMessageDeflate,
                extraHeaders: o.extraHeaders || this.extraHeaders,
                forceNode: o.forceNode || this.forceNode,
                localAddress: o.localAddress || this.localAddress,
                requestTimeout: o.requestTimeout || this.requestTimeout,
                protocols: o.protocols || void 0,
                isReactNative: this.isReactNative,
              })
            );
          }),
          (a.prototype.open = function() {
            var e;
            if (
              this.rememberUpgrade &&
              a.priorWebsocketSuccess &&
              -1 !== this.transports.indexOf('websocket')
            )
              e = 'websocket';
            else {
              if (0 === this.transports.length) {
                var t = this;
                return void setTimeout(function() {
                  t.emit('error', 'No transports available');
                }, 0);
              }
              e = this.transports[0];
            }
            this.readyState = 'opening';
            try {
              e = this.createTransport(e);
            } catch (r) {
              return this.transports.shift(), void this.open();
            }
            e.open(), this.setTransport(e);
          }),
          (a.prototype.setTransport = function(e) {
            r('setting transport %s', e.name);
            var t = this;
            this.transport &&
              (r('clearing existing transport %s', this.transport.name),
              this.transport.removeAllListeners()),
              (this.transport = e),
              e
                .on('drain', function() {
                  t.onDrain();
                })
                .on('packet', function(e) {
                  t.onPacket(e);
                })
                .on('error', function(e) {
                  t.onError(e);
                })
                .on('close', function() {
                  t.onClose('transport close');
                });
          }),
          (a.prototype.probe = function(e) {
            r('probing transport "%s"', e);
            var t = this.createTransport(e, { probe: 1 }),
              s = !1,
              i = this;
            function o() {
              if (i.onlyBinaryUpgrades) {
                var o = !this.supportsBinary && i.transport.supportsBinary;
                s = s || o;
              }
              s ||
                (r('probe transport "%s" opened', e),
                t.send([{ type: 'ping', data: 'probe' }]),
                t.once('packet', function(o) {
                  if (!s)
                    if ('pong' === o.type && 'probe' === o.data) {
                      if (
                        (r('probe transport "%s" pong', e),
                        (i.upgrading = !0),
                        i.emit('upgrading', t),
                        !t)
                      )
                        return;
                      (a.priorWebsocketSuccess = 'websocket' === t.name),
                        r('pausing current transport "%s"', i.transport.name),
                        i.transport.pause(function() {
                          s ||
                            ('closed' !== i.readyState &&
                              (r(
                                'changing transport and sending upgrade packet'
                              ),
                              l(),
                              i.setTransport(t),
                              t.send([{ type: 'upgrade' }]),
                              i.emit('upgrade', t),
                              (t = null),
                              (i.upgrading = !1),
                              i.flush()));
                        });
                    } else {
                      r('probe transport "%s" failed', e);
                      var n = new Error('probe error');
                      (n.transport = t.name), i.emit('upgradeError', n);
                    }
                }));
            }
            function n() {
              s || ((s = !0), l(), t.close(), (t = null));
            }
            function p(s) {
              var o = new Error('probe error: ' + s);
              (o.transport = t.name),
                n(),
                r('probe transport "%s" failed because of error: %s', e, s),
                i.emit('upgradeError', o);
            }
            function h() {
              p('transport closed');
            }
            function c() {
              p('socket closed');
            }
            function u(e) {
              t &&
                e.name !== t.name &&
                (r('"%s" works - aborting "%s"', e.name, t.name), n());
            }
            function l() {
              t.removeListener('open', o),
                t.removeListener('error', p),
                t.removeListener('close', h),
                i.removeListener('close', c),
                i.removeListener('upgrading', u);
            }
            (a.priorWebsocketSuccess = !1),
              t.once('open', o),
              t.once('error', p),
              t.once('close', h),
              this.once('close', c),
              this.once('upgrading', u),
              t.open();
          }),
          (a.prototype.onOpen = function() {
            if (
              (r('socket open'),
              (this.readyState = 'open'),
              (a.priorWebsocketSuccess = 'websocket' === this.transport.name),
              this.emit('open'),
              this.flush(),
              'open' === this.readyState &&
                this.upgrade &&
                this.transport.pause)
            ) {
              r('starting upgrade probes');
              for (var e = 0, t = this.upgrades.length; e < t; e++)
                this.probe(this.upgrades[e]);
            }
          }),
          (a.prototype.onPacket = function(e) {
            if (
              'opening' === this.readyState ||
              'open' === this.readyState ||
              'closing' === this.readyState
            )
              switch (
                (r('socket receive: type "%s", data "%s"', e.type, e.data),
                this.emit('packet', e),
                this.emit('heartbeat'),
                e.type)
              ) {
                case 'open':
                  this.onHandshake(JSON.parse(e.data));
                  break;
                case 'pong':
                  this.setPing(), this.emit('pong');
                  break;
                case 'error':
                  var t = new Error('server error');
                  (t.code = e.data), this.onError(t);
                  break;
                case 'message':
                  this.emit('data', e.data), this.emit('message', e.data);
              }
            else
              r('packet received with socket readyState "%s"', this.readyState);
          }),
          (a.prototype.onHandshake = function(e) {
            this.emit('handshake', e),
              (this.id = e.sid),
              (this.transport.query.sid = e.sid),
              (this.upgrades = this.filterUpgrades(e.upgrades)),
              (this.pingInterval = e.pingInterval),
              (this.pingTimeout = e.pingTimeout),
              this.onOpen(),
              'closed' !== this.readyState &&
                (this.setPing(),
                this.removeListener('heartbeat', this.onHeartbeat),
                this.on('heartbeat', this.onHeartbeat));
          }),
          (a.prototype.onHeartbeat = function(e) {
            clearTimeout(this.pingTimeoutTimer);
            var t = this;
            t.pingTimeoutTimer = setTimeout(function() {
              'closed' !== t.readyState && t.onClose('ping timeout');
            }, e || t.pingInterval + t.pingTimeout);
          }),
          (a.prototype.setPing = function() {
            var e = this;
            clearTimeout(e.pingIntervalTimer),
              (e.pingIntervalTimer = setTimeout(function() {
                r(
                  'writing ping packet - expecting pong within %sms',
                  e.pingTimeout
                ),
                  e.ping(),
                  e.onHeartbeat(e.pingTimeout);
              }, e.pingInterval));
          }),
          (a.prototype.ping = function() {
            var e = this;
            this.sendPacket('ping', function() {
              e.emit('ping');
            });
          }),
          (a.prototype.onDrain = function() {
            this.writeBuffer.splice(0, this.prevBufferLen),
              (this.prevBufferLen = 0),
              0 === this.writeBuffer.length ? this.emit('drain') : this.flush();
          }),
          (a.prototype.flush = function() {
            'closed' !== this.readyState &&
              this.transport.writable &&
              !this.upgrading &&
              this.writeBuffer.length &&
              (r('flushing %d packets in socket', this.writeBuffer.length),
              this.transport.send(this.writeBuffer),
              (this.prevBufferLen = this.writeBuffer.length),
              this.emit('flush'));
          }),
          (a.prototype.write = a.prototype.send = function(e, t, r) {
            return this.sendPacket('message', e, t, r), this;
          }),
          (a.prototype.sendPacket = function(e, t, r, s) {
            if (
              ('function' == typeof t && ((s = t), (t = void 0)),
              'function' == typeof r && ((s = r), (r = null)),
              'closing' !== this.readyState && 'closed' !== this.readyState)
            ) {
              (r = r || {}).compress = !1 !== r.compress;
              var i = { type: e, data: t, options: r };
              this.emit('packetCreate', i),
                this.writeBuffer.push(i),
                s && this.once('flush', s),
                this.flush();
            }
          }),
          (a.prototype.close = function() {
            if ('opening' === this.readyState || 'open' === this.readyState) {
              this.readyState = 'closing';
              var e = this;
              this.writeBuffer.length
                ? this.once('drain', function() {
                    this.upgrading ? i() : t();
                  })
                : this.upgrading
                ? i()
                : t();
            }
            function t() {
              e.onClose('forced close'),
                r('socket closing - telling transport to close'),
                e.transport.close();
            }
            function s() {
              e.removeListener('upgrade', s),
                e.removeListener('upgradeError', s),
                t();
            }
            function i() {
              e.once('upgrade', s), e.once('upgradeError', s);
            }
            return this;
          }),
          (a.prototype.onError = function(e) {
            r('socket error %j', e),
              (a.priorWebsocketSuccess = !1),
              this.emit('error', e),
              this.onClose('transport error', e);
          }),
          (a.prototype.onClose = function(e, t) {
            if (
              'opening' === this.readyState ||
              'open' === this.readyState ||
              'closing' === this.readyState
            ) {
              r('socket close with reason: "%s"', e);
              clearTimeout(this.pingIntervalTimer),
                clearTimeout(this.pingTimeoutTimer),
                this.transport.removeAllListeners('close'),
                this.transport.close(),
                this.transport.removeAllListeners(),
                (this.readyState = 'closed'),
                (this.id = null),
                this.emit('close', e, t),
                (this.writeBuffer = []),
                (this.prevBufferLen = 0);
            }
          }),
          (a.prototype.filterUpgrades = function(e) {
            for (var t = [], r = 0, i = e.length; r < i; r++)
              ~s(this.transports, e[r]) && t.push(e[r]);
            return t;
          });
      },
      {
        './transports/index': 'DZ9o',
        'component-emitter': 'XUqb',
        debug: '1tjN',
        indexof: 'OedV',
        'engine.io-parser': '2W98',
        parseuri: 'A28J',
        parseqs: 'a1bU',
        './transport': 'aoJx',
      },
    ],
    wC1p: [
      function(require, module, exports) {
        (module.exports = require('./socket')),
          (module.exports.parser = require('engine.io-parser'));
      },
      { './socket': 'wtcu', 'engine.io-parser': '2W98' },
    ],
    zoi8: [
      function(require, module, exports) {
        function r(r, e) {
          for (var n = [], o = (e = e || 0) || 0; o < r.length; o++)
            n[o - e] = r[o];
          return n;
        }
        module.exports = r;
      },
      {},
    ],
    HHHs: [
      function(require, module, exports) {
        function e(e, n, o) {
          return (
            e.on(n, o),
            {
              destroy: function() {
                e.removeListener(n, o);
              },
            }
          );
        }
        module.exports = e;
      },
      {},
    ],
    RaTb: [
      function(require, module, exports) {
        var n = [].slice;
        module.exports = function(r, t) {
          if (('string' == typeof t && (t = r[t]), 'function' != typeof t))
            throw new Error('bind() requires a function');
          var o = n.call(arguments, 2);
          return function() {
            return t.apply(r, o.concat(n.call(arguments)));
          };
        };
      },
      {},
    ],
    FLFb: [
      function(require, module, exports) {
        var t = require('socket.io-parser'),
          e = require('component-emitter'),
          i = require('to-array'),
          s = require('./on'),
          n = require('component-bind'),
          o = require('debug')('socket.io-client:socket'),
          c = require('parseqs'),
          r = require('has-binary2');
        module.exports = exports = a;
        var h = {
            connect: 1,
            connect_error: 1,
            connect_timeout: 1,
            connecting: 1,
            disconnect: 1,
            error: 1,
            reconnect: 1,
            reconnect_attempt: 1,
            reconnect_failed: 1,
            reconnect_error: 1,
            reconnecting: 1,
            ping: 1,
            pong: 1,
          },
          p = e.prototype.emit;
        function a(t, e, i) {
          (this.io = t),
            (this.nsp = e),
            (this.json = this),
            (this.ids = 0),
            (this.acks = {}),
            (this.receiveBuffer = []),
            (this.sendBuffer = []),
            (this.connected = !1),
            (this.disconnected = !0),
            (this.flags = {}),
            i && i.query && (this.query = i.query),
            this.io.autoConnect && this.open();
        }
        e(a.prototype),
          (a.prototype.subEvents = function() {
            if (!this.subs) {
              var t = this.io;
              this.subs = [
                s(t, 'open', n(this, 'onopen')),
                s(t, 'packet', n(this, 'onpacket')),
                s(t, 'close', n(this, 'onclose')),
              ];
            }
          }),
          (a.prototype.open = a.prototype.connect = function() {
            return this.connected
              ? this
              : (this.subEvents(),
                this.io.open(),
                'open' === this.io.readyState && this.onopen(),
                this.emit('connecting'),
                this);
          }),
          (a.prototype.send = function() {
            var t = i(arguments);
            return t.unshift('message'), this.emit.apply(this, t), this;
          }),
          (a.prototype.emit = function(e) {
            if (h.hasOwnProperty(e)) return p.apply(this, arguments), this;
            var s = i(arguments),
              n = {
                type: (void 0 !== this.flags.binary
                ? this.flags.binary
                : r(s))
                  ? t.BINARY_EVENT
                  : t.EVENT,
                data: s,
                options: {},
              };
            return (
              (n.options.compress = !this.flags || !1 !== this.flags.compress),
              'function' == typeof s[s.length - 1] &&
                (o('emitting packet with ack id %d', this.ids),
                (this.acks[this.ids] = s.pop()),
                (n.id = this.ids++)),
              this.connected ? this.packet(n) : this.sendBuffer.push(n),
              (this.flags = {}),
              this
            );
          }),
          (a.prototype.packet = function(t) {
            (t.nsp = this.nsp), this.io.packet(t);
          }),
          (a.prototype.onopen = function() {
            if ((o('transport is open - connecting'), '/' !== this.nsp))
              if (this.query) {
                var e =
                  'object' == typeof this.query
                    ? c.encode(this.query)
                    : this.query;
                o('sending connect packet with query %s', e),
                  this.packet({ type: t.CONNECT, query: e });
              } else this.packet({ type: t.CONNECT });
          }),
          (a.prototype.onclose = function(t) {
            o('close (%s)', t),
              (this.connected = !1),
              (this.disconnected = !0),
              delete this.id,
              this.emit('disconnect', t);
          }),
          (a.prototype.onpacket = function(e) {
            var i = e.nsp === this.nsp,
              s = e.type === t.ERROR && '/' === e.nsp;
            if (i || s)
              switch (e.type) {
                case t.CONNECT:
                  this.onconnect();
                  break;
                case t.EVENT:
                case t.BINARY_EVENT:
                  this.onevent(e);
                  break;
                case t.ACK:
                case t.BINARY_ACK:
                  this.onack(e);
                  break;
                case t.DISCONNECT:
                  this.ondisconnect();
                  break;
                case t.ERROR:
                  this.emit('error', e.data);
              }
          }),
          (a.prototype.onevent = function(t) {
            var e = t.data || [];
            o('emitting event %j', e),
              null != t.id &&
                (o('attaching ack callback to event'), e.push(this.ack(t.id))),
              this.connected ? p.apply(this, e) : this.receiveBuffer.push(e);
          }),
          (a.prototype.ack = function(e) {
            var s = this,
              n = !1;
            return function() {
              if (!n) {
                n = !0;
                var c = i(arguments);
                o('sending ack %j', c),
                  s.packet({
                    type: r(c) ? t.BINARY_ACK : t.ACK,
                    id: e,
                    data: c,
                  });
              }
            };
          }),
          (a.prototype.onack = function(t) {
            var e = this.acks[t.id];
            'function' == typeof e
              ? (o('calling ack %s with %j', t.id, t.data),
                e.apply(this, t.data),
                delete this.acks[t.id])
              : o('bad ack %s', t.id);
          }),
          (a.prototype.onconnect = function() {
            (this.connected = !0),
              (this.disconnected = !1),
              this.emit('connect'),
              this.emitBuffered();
          }),
          (a.prototype.emitBuffered = function() {
            var t;
            for (t = 0; t < this.receiveBuffer.length; t++)
              p.apply(this, this.receiveBuffer[t]);
            for (
              this.receiveBuffer = [], t = 0;
              t < this.sendBuffer.length;
              t++
            )
              this.packet(this.sendBuffer[t]);
            this.sendBuffer = [];
          }),
          (a.prototype.ondisconnect = function() {
            o('server disconnect (%s)', this.nsp),
              this.destroy(),
              this.onclose('io server disconnect');
          }),
          (a.prototype.destroy = function() {
            if (this.subs) {
              for (var t = 0; t < this.subs.length; t++) this.subs[t].destroy();
              this.subs = null;
            }
            this.io.destroy(this);
          }),
          (a.prototype.close = a.prototype.disconnect = function() {
            return (
              this.connected &&
                (o('performing disconnect (%s)', this.nsp),
                this.packet({ type: t.DISCONNECT })),
              this.destroy(),
              this.connected && this.onclose('io client disconnect'),
              this
            );
          }),
          (a.prototype.compress = function(t) {
            return (this.flags.compress = t), this;
          }),
          (a.prototype.binary = function(t) {
            return (this.flags.binary = t), this;
          });
      },
      {
        'socket.io-parser': '7V8U',
        'component-emitter': 'XUqb',
        'to-array': 'zoi8',
        './on': 'HHHs',
        'component-bind': 'RaTb',
        debug: '1tjN',
        parseqs: 'a1bU',
        'has-binary2': '+oIq',
      },
    ],
    one5: [
      function(require, module, exports) {
        function t(t) {
          (t = t || {}),
            (this.ms = t.min || 100),
            (this.max = t.max || 1e4),
            (this.factor = t.factor || 2),
            (this.jitter = t.jitter > 0 && t.jitter <= 1 ? t.jitter : 0),
            (this.attempts = 0);
        }
        (module.exports = t),
          (t.prototype.duration = function() {
            var t = this.ms * Math.pow(this.factor, this.attempts++);
            if (this.jitter) {
              var i = Math.random(),
                o = Math.floor(i * this.jitter * t);
              t = 0 == (1 & Math.floor(10 * i)) ? t - o : t + o;
            }
            return 0 | Math.min(t, this.max);
          }),
          (t.prototype.reset = function() {
            this.attempts = 0;
          }),
          (t.prototype.setMin = function(t) {
            this.ms = t;
          }),
          (t.prototype.setMax = function(t) {
            this.max = t;
          }),
          (t.prototype.setJitter = function(t) {
            this.jitter = t;
          });
      },
      {},
    ],
    'Z8N/': [
      function(require, module, exports) {
        var t = require('engine.io-client'),
          e = require('./socket'),
          n = require('component-emitter'),
          o = require('socket.io-parser'),
          i = require('./on'),
          s = require('component-bind'),
          c = require('debug')('socket.io-client:manager'),
          r = require('indexof'),
          h = require('backo2'),
          a = Object.prototype.hasOwnProperty;
        function p(t, e) {
          if (!(this instanceof p)) return new p(t, e);
          t && 'object' == typeof t && ((e = t), (t = void 0)),
            ((e = e || {}).path = e.path || '/socket.io'),
            (this.nsps = {}),
            (this.subs = []),
            (this.opts = e),
            this.reconnection(!1 !== e.reconnection),
            this.reconnectionAttempts(e.reconnectionAttempts || 1 / 0),
            this.reconnectionDelay(e.reconnectionDelay || 1e3),
            this.reconnectionDelayMax(e.reconnectionDelayMax || 5e3),
            this.randomizationFactor(e.randomizationFactor || 0.5),
            (this.backoff = new h({
              min: this.reconnectionDelay(),
              max: this.reconnectionDelayMax(),
              jitter: this.randomizationFactor(),
            })),
            this.timeout(null == e.timeout ? 2e4 : e.timeout),
            (this.readyState = 'closed'),
            (this.uri = t),
            (this.connecting = []),
            (this.lastPing = null),
            (this.encoding = !1),
            (this.packetBuffer = []);
          var n = e.parser || o;
          (this.encoder = new n.Encoder()),
            (this.decoder = new n.Decoder()),
            (this.autoConnect = !1 !== e.autoConnect),
            this.autoConnect && this.open();
        }
        (module.exports = p),
          (p.prototype.emitAll = function() {
            for (var t in (this.emit.apply(this, arguments), this.nsps))
              a.call(this.nsps, t) &&
                this.nsps[t].emit.apply(this.nsps[t], arguments);
          }),
          (p.prototype.updateSocketIds = function() {
            for (var t in this.nsps)
              a.call(this.nsps, t) && (this.nsps[t].id = this.generateId(t));
          }),
          (p.prototype.generateId = function(t) {
            return ('/' === t ? '' : t + '#') + this.engine.id;
          }),
          n(p.prototype),
          (p.prototype.reconnection = function(t) {
            return arguments.length
              ? ((this._reconnection = !!t), this)
              : this._reconnection;
          }),
          (p.prototype.reconnectionAttempts = function(t) {
            return arguments.length
              ? ((this._reconnectionAttempts = t), this)
              : this._reconnectionAttempts;
          }),
          (p.prototype.reconnectionDelay = function(t) {
            return arguments.length
              ? ((this._reconnectionDelay = t),
                this.backoff && this.backoff.setMin(t),
                this)
              : this._reconnectionDelay;
          }),
          (p.prototype.randomizationFactor = function(t) {
            return arguments.length
              ? ((this._randomizationFactor = t),
                this.backoff && this.backoff.setJitter(t),
                this)
              : this._randomizationFactor;
          }),
          (p.prototype.reconnectionDelayMax = function(t) {
            return arguments.length
              ? ((this._reconnectionDelayMax = t),
                this.backoff && this.backoff.setMax(t),
                this)
              : this._reconnectionDelayMax;
          }),
          (p.prototype.timeout = function(t) {
            return arguments.length
              ? ((this._timeout = t), this)
              : this._timeout;
          }),
          (p.prototype.maybeReconnectOnOpen = function() {
            !this.reconnecting &&
              this._reconnection &&
              0 === this.backoff.attempts &&
              this.reconnect();
          }),
          (p.prototype.open = p.prototype.connect = function(e, n) {
            if (
              (c('readyState %s', this.readyState),
              ~this.readyState.indexOf('open'))
            )
              return this;
            c('opening %s', this.uri), (this.engine = t(this.uri, this.opts));
            var o = this.engine,
              s = this;
            (this.readyState = 'opening'), (this.skipReconnect = !1);
            var r = i(o, 'open', function() {
                s.onopen(), e && e();
              }),
              h = i(o, 'error', function(t) {
                if (
                  (c('connect_error'),
                  s.cleanup(),
                  (s.readyState = 'closed'),
                  s.emitAll('connect_error', t),
                  e)
                ) {
                  var n = new Error('Connection error');
                  (n.data = t), e(n);
                } else s.maybeReconnectOnOpen();
              });
            if (!1 !== this._timeout) {
              var a = this._timeout;
              c('connect attempt will timeout after %d', a);
              var p = setTimeout(function() {
                c('connect attempt timed out after %d', a),
                  r.destroy(),
                  o.close(),
                  o.emit('error', 'timeout'),
                  s.emitAll('connect_timeout', a);
              }, a);
              this.subs.push({
                destroy: function() {
                  clearTimeout(p);
                },
              });
            }
            return this.subs.push(r), this.subs.push(h), this;
          }),
          (p.prototype.onopen = function() {
            c('open'),
              this.cleanup(),
              (this.readyState = 'open'),
              this.emit('open');
            var t = this.engine;
            this.subs.push(i(t, 'data', s(this, 'ondata'))),
              this.subs.push(i(t, 'ping', s(this, 'onping'))),
              this.subs.push(i(t, 'pong', s(this, 'onpong'))),
              this.subs.push(i(t, 'error', s(this, 'onerror'))),
              this.subs.push(i(t, 'close', s(this, 'onclose'))),
              this.subs.push(i(this.decoder, 'decoded', s(this, 'ondecoded')));
          }),
          (p.prototype.onping = function() {
            (this.lastPing = new Date()), this.emitAll('ping');
          }),
          (p.prototype.onpong = function() {
            this.emitAll('pong', new Date() - this.lastPing);
          }),
          (p.prototype.ondata = function(t) {
            this.decoder.add(t);
          }),
          (p.prototype.ondecoded = function(t) {
            this.emit('packet', t);
          }),
          (p.prototype.onerror = function(t) {
            c('error', t), this.emitAll('error', t);
          }),
          (p.prototype.socket = function(t, n) {
            var o = this.nsps[t];
            if (!o) {
              (o = new e(this, t, n)), (this.nsps[t] = o);
              var i = this;
              o.on('connecting', s),
                o.on('connect', function() {
                  o.id = i.generateId(t);
                }),
                this.autoConnect && s();
            }
            function s() {
              ~r(i.connecting, o) || i.connecting.push(o);
            }
            return o;
          }),
          (p.prototype.destroy = function(t) {
            var e = r(this.connecting, t);
            ~e && this.connecting.splice(e, 1),
              this.connecting.length || this.close();
          }),
          (p.prototype.packet = function(t) {
            c('writing packet %j', t);
            var e = this;
            t.query && 0 === t.type && (t.nsp += '?' + t.query),
              e.encoding
                ? e.packetBuffer.push(t)
                : ((e.encoding = !0),
                  this.encoder.encode(t, function(n) {
                    for (var o = 0; o < n.length; o++)
                      e.engine.write(n[o], t.options);
                    (e.encoding = !1), e.processPacketQueue();
                  }));
          }),
          (p.prototype.processPacketQueue = function() {
            if (this.packetBuffer.length > 0 && !this.encoding) {
              var t = this.packetBuffer.shift();
              this.packet(t);
            }
          }),
          (p.prototype.cleanup = function() {
            c('cleanup');
            for (var t = this.subs.length, e = 0; e < t; e++) {
              this.subs.shift().destroy();
            }
            (this.packetBuffer = []),
              (this.encoding = !1),
              (this.lastPing = null),
              this.decoder.destroy();
          }),
          (p.prototype.close = p.prototype.disconnect = function() {
            c('disconnect'),
              (this.skipReconnect = !0),
              (this.reconnecting = !1),
              'opening' === this.readyState && this.cleanup(),
              this.backoff.reset(),
              (this.readyState = 'closed'),
              this.engine && this.engine.close();
          }),
          (p.prototype.onclose = function(t) {
            c('onclose'),
              this.cleanup(),
              this.backoff.reset(),
              (this.readyState = 'closed'),
              this.emit('close', t),
              this._reconnection && !this.skipReconnect && this.reconnect();
          }),
          (p.prototype.reconnect = function() {
            if (this.reconnecting || this.skipReconnect) return this;
            var t = this;
            if (this.backoff.attempts >= this._reconnectionAttempts)
              c('reconnect failed'),
                this.backoff.reset(),
                this.emitAll('reconnect_failed'),
                (this.reconnecting = !1);
            else {
              var e = this.backoff.duration();
              c('will wait %dms before reconnect attempt', e),
                (this.reconnecting = !0);
              var n = setTimeout(function() {
                t.skipReconnect ||
                  (c('attempting reconnect'),
                  t.emitAll('reconnect_attempt', t.backoff.attempts),
                  t.emitAll('reconnecting', t.backoff.attempts),
                  t.skipReconnect ||
                    t.open(function(e) {
                      e
                        ? (c('reconnect attempt error'),
                          (t.reconnecting = !1),
                          t.reconnect(),
                          t.emitAll('reconnect_error', e.data))
                        : (c('reconnect success'), t.onreconnect());
                    }));
              }, e);
              this.subs.push({
                destroy: function() {
                  clearTimeout(n);
                },
              });
            }
          }),
          (p.prototype.onreconnect = function() {
            var t = this.backoff.attempts;
            (this.reconnecting = !1),
              this.backoff.reset(),
              this.updateSocketIds(),
              this.emitAll('reconnect', t);
          });
      },
      {
        'engine.io-client': 'wC1p',
        './socket': 'FLFb',
        'component-emitter': 'XUqb',
        'socket.io-parser': '7V8U',
        './on': 'HHHs',
        'component-bind': 'RaTb',
        debug: '1tjN',
        indexof: 'OedV',
        backo2: 'one5',
      },
    ],
    ToP9: [
      function(require, module, exports) {
        var e = require('./url'),
          r = require('socket.io-parser'),
          o = require('./manager'),
          t = require('debug')('socket.io-client');
        module.exports = exports = n;
        var c = (exports.managers = {});
        function n(r, n) {
          'object' == typeof r && ((n = r), (r = void 0)), (n = n || {});
          var s,
            i = e(r),
            u = i.source,
            a = i.id,
            p = i.path,
            q = c[a] && p in c[a].nsps;
          return (
            n.forceNew || n['force new connection'] || !1 === n.multiplex || q
              ? (t('ignoring socket cache for %s', u), (s = o(u, n)))
              : (c[a] || (t('new io instance for %s', u), (c[a] = o(u, n))),
                (s = c[a])),
            i.query && !n.query && (n.query = i.query),
            s.socket(i.path, n)
          );
        }
        (exports.protocol = r.protocol),
          (exports.connect = n),
          (exports.Manager = require('./manager')),
          (exports.Socket = require('./socket'));
      },
      {
        './url': 'MMDw',
        'socket.io-parser': '7V8U',
        './manager': 'Z8N/',
        debug: '1tjN',
        './socket': 'FLFb',
      },
    ],
    '+KAZ': [
      function(require, module, exports) {
        'use strict';
        (exports.parse = n), (exports.serialize = o);
        var e = decodeURIComponent,
          t = encodeURIComponent,
          r = /; */,
          i = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
        function n(t, i) {
          if ('string' != typeof t)
            throw new TypeError('argument str must be a string');
          for (
            var n = {}, o = i || {}, s = t.split(r), p = o.decode || e, f = 0;
            f < s.length;
            f++
          ) {
            var u = s[f],
              m = u.indexOf('=');
            if (!(m < 0)) {
              var c = u.substr(0, m).trim(),
                l = u.substr(++m, u.length).trim();
              '"' == l[0] && (l = l.slice(1, -1)),
                null == n[c] && (n[c] = a(l, p));
            }
          }
          return n;
        }
        function o(e, r, n) {
          var o = n || {},
            a = o.encode || t;
          if ('function' != typeof a)
            throw new TypeError('option encode is invalid');
          if (!i.test(e)) throw new TypeError('argument name is invalid');
          var s = a(r);
          if (s && !i.test(s)) throw new TypeError('argument val is invalid');
          var p = e + '=' + s;
          if (null != o.maxAge) {
            var f = o.maxAge - 0;
            if (isNaN(f)) throw new Error('maxAge should be a Number');
            p += '; Max-Age=' + Math.floor(f);
          }
          if (o.domain) {
            if (!i.test(o.domain))
              throw new TypeError('option domain is invalid');
            p += '; Domain=' + o.domain;
          }
          if (o.path) {
            if (!i.test(o.path)) throw new TypeError('option path is invalid');
            p += '; Path=' + o.path;
          }
          if (o.expires) {
            if ('function' != typeof o.expires.toUTCString)
              throw new TypeError('option expires is invalid');
            p += '; Expires=' + o.expires.toUTCString();
          }
          if (
            (o.httpOnly && (p += '; HttpOnly'),
            o.secure && (p += '; Secure'),
            o.sameSite)
          )
            switch (
              'string' == typeof o.sameSite
                ? o.sameSite.toLowerCase()
                : o.sameSite
            ) {
              case !0:
                p += '; SameSite=Strict';
                break;
              case 'lax':
                p += '; SameSite=Lax';
                break;
              case 'strict':
                p += '; SameSite=Strict';
                break;
              default:
                throw new TypeError('option sameSite is invalid');
            }
          return p;
        }
        function a(e, t) {
          try {
            return t(e);
          } catch (r) {
            return e;
          }
        }
      },
      {},
    ],
    '6kpS': [
      function(require, module, exports) {
        var process = require('process');
        var e = require('process');
        Object.defineProperty(exports, '__esModule', { value: !0 });
        var o =
          'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
            ? function(e) {
                return typeof e;
              }
            : function(e) {
                return e &&
                  'function' == typeof Symbol &&
                  e.constructor === Symbol &&
                  e !== Symbol.prototype
                  ? 'symbol'
                  : typeof e;
              };
        (exports.load = f),
          (exports.loadAll = l),
          (exports.select = p),
          (exports.save = y),
          (exports.remove = v),
          (exports.setRawCookie = k),
          (exports.plugToRequest = m);
        var t = require('cookie'),
          r = u(t),
          n = require('object-assign'),
          i = u(n);
        function u(e) {
          return e && e.__esModule ? e : { default: e };
        }
        var c = 'undefined' == typeof document || (void 0 !== e && e.env && !1),
          a = {},
          s = void 0;
        function d() {
          return s && !s.headersSent;
        }
        function f(e, o) {
          var t = c ? a : r.default.parse(document.cookie),
            n = t && t[e];
          if ((void 0 === o && (o = !n || ('{' !== n[0] && '[' !== n[0])), !o))
            try {
              n = JSON.parse(n);
            } catch (i) {}
          return n;
        }
        function l(e) {
          var o = c ? a : r.default.parse(document.cookie);
          if ((void 0 === e && (e = !o || ('{' !== o[0] && '[' !== o[0])), !e))
            try {
              o = JSON.parse(o);
            } catch (t) {}
          return o;
        }
        function p(e) {
          var o = c ? a : r.default.parse(document.cookie);
          return o
            ? e
              ? Object.keys(o).reduce(function(t, r) {
                  if (!e.test(r)) return t;
                  var n = {};
                  return (n[r] = o[r]), (0, i.default)({}, t, n);
                }, {})
              : o
            : {};
        }
        function y(e, t, n) {
          (a[e] = t),
            'object' === (void 0 === t ? 'undefined' : o(t)) &&
              (a[e] = JSON.stringify(t)),
            c || (document.cookie = r.default.serialize(e, a[e], n)),
            d() && s.cookie && s.cookie(e, t, n);
        }
        function v(e, o) {
          delete a[e],
            (o =
              void 0 === o
                ? {}
                : 'string' == typeof o
                ? { path: o }
                : (0, i.default)({}, o)),
            'undefined' != typeof document &&
              ((o.expires = new Date(1970, 1, 1, 0, 0, 1)),
              (o.maxAge = 0),
              (document.cookie = r.default.serialize(e, '', o))),
            d() && s.clearCookie && s.clearCookie(e, o);
        }
        function k(e) {
          a = e ? r.default.parse(e) : {};
        }
        function m(e, o) {
          return (
            e.cookie
              ? (a = e.cookie)
              : e.cookies
              ? (a = e.cookies)
              : e.headers && e.headers.cookie
              ? k(e.headers.cookie)
              : (a = {}),
            (s = o),
            function() {
              (s = null), (a = {});
            }
          );
        }
        exports.default = {
          setRawCookie: k,
          load: f,
          loadAll: l,
          select: p,
          save: y,
          remove: v,
          plugToRequest: m,
        };
      },
      { cookie: '+KAZ', 'object-assign': 'J4Nk', process: 'pBGv' },
    ],
    nBOz: [
      function(require, module, exports) {
        var define;
        var global = arguments[3];
        var e,
          t = arguments[3];
        !(function(t, n) {
          'object' == typeof exports && 'undefined' != typeof module
            ? n(
                exports,
                require('react'),
                require('prop-types'),
                require('mousetrap'),
                require('flatted'),
                require('redux'),
                require('immer'),
                require('socket.io-client'),
                require('react-cookies')
              )
            : 'function' == typeof e && e.amd
            ? e(
                [
                  'exports',
                  'react',
                  'prop-types',
                  'mousetrap',
                  'flatted',
                  'redux',
                  'immer',
                  'socket.io-client',
                  'react-cookies',
                ],
                n
              )
            : n(
                ((t = t || self).Client = {}),
                t.React,
                t.PropTypes,
                t.Mousetrap,
                t.Flatted,
                t.Redux,
                t.immer,
                t.io,
                t.Cookies
              );
        })(this, function(e, t, n, r, a, o, i, s, l) {
          'use strict';
          function c(e) {
            return (c =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function(e) {
                    return typeof e;
                  }
                : function(e) {
                    return e &&
                      'function' == typeof Symbol &&
                      e.constructor === Symbol &&
                      e !== Symbol.prototype
                      ? 'symbol'
                      : typeof e;
                  })(e);
          }
          function u(e, t) {
            if (!(e instanceof t))
              throw new TypeError('Cannot call a class as a function');
          }
          function p(e, t) {
            for (var n = 0; n < t.length; n++) {
              var r = t[n];
              (r.enumerable = r.enumerable || !1),
                (r.configurable = !0),
                'value' in r && (r.writable = !0),
                Object.defineProperty(e, r.key, r);
            }
          }
          function d(e, t, n) {
            return t && p(e.prototype, t), n && p(e, n), e;
          }
          function m(e, t, n) {
            return (
              t in e
                ? Object.defineProperty(e, t, {
                    value: n,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0,
                  })
                : (e[t] = n),
              e
            );
          }
          function h(e, t) {
            var n = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
              var r = Object.getOwnPropertySymbols(e);
              t &&
                (r = r.filter(function(t) {
                  return Object.getOwnPropertyDescriptor(e, t).enumerable;
                })),
                n.push.apply(n, r);
            }
            return n;
          }
          function f(e) {
            for (var t = 1; t < arguments.length; t++) {
              var n = null != arguments[t] ? arguments[t] : {};
              t % 2
                ? h(n, !0).forEach(function(t) {
                    m(e, t, n[t]);
                  })
                : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(n)
                  )
                : h(n).forEach(function(t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(n, t)
                    );
                  });
            }
            return e;
          }
          function y(e, t) {
            if ('function' != typeof t && null !== t)
              throw new TypeError(
                'Super expression must either be null or a function'
              );
            (e.prototype = Object.create(t && t.prototype, {
              constructor: { value: e, writable: !0, configurable: !0 },
            })),
              t && g(e, t);
          }
          function v(e) {
            return (v = Object.setPrototypeOf
              ? Object.getPrototypeOf
              : function(e) {
                  return e.__proto__ || Object.getPrototypeOf(e);
                })(e);
          }
          function g(e, t) {
            return (g =
              Object.setPrototypeOf ||
              function(e, t) {
                return (e.__proto__ = t), e;
              })(e, t);
          }
          function b(e, t) {
            if (null == e) return {};
            var n,
              r,
              a = (function(e, t) {
                if (null == e) return {};
                var n,
                  r,
                  a = {},
                  o = Object.keys(e);
                for (r = 0; r < o.length; r++)
                  (n = o[r]), t.indexOf(n) >= 0 || (a[n] = e[n]);
                return a;
              })(e, t);
            if (Object.getOwnPropertySymbols) {
              var o = Object.getOwnPropertySymbols(e);
              for (r = 0; r < o.length; r++)
                (n = o[r]),
                  t.indexOf(n) >= 0 ||
                    (Object.prototype.propertyIsEnumerable.call(e, n) &&
                      (a[n] = e[n]));
            }
            return a;
          }
          function x(e) {
            if (void 0 === e)
              throw new ReferenceError(
                "this hasn't been initialised - super() hasn't been called"
              );
            return e;
          }
          function I(e, t) {
            return !t || ('object' != typeof t && 'function' != typeof t)
              ? x(e)
              : t;
          }
          function P(e) {
            return (
              (function(e) {
                if (Array.isArray(e)) {
                  for (var t = 0, n = new Array(e.length); t < e.length; t++)
                    n[t] = e[t];
                  return n;
                }
              })(e) ||
              (function(e) {
                if (
                  Symbol.iterator in Object(e) ||
                  '[object Arguments]' === Object.prototype.toString.call(e)
                )
                  return Array.from(e);
              })(e) ||
              (function() {
                throw new TypeError(
                  'Invalid attempt to spread non-iterable instance'
                );
              })()
            );
          }
          (t = t && t.hasOwnProperty('default') ? t.default : t),
            (n = n && n.hasOwnProperty('default') ? n.default : n),
            (r = r && r.hasOwnProperty('default') ? r.default : r),
            (i = i && i.hasOwnProperty('default') ? i.default : i),
            (s = s && s.hasOwnProperty('default') ? s.default : s),
            (l = l && l.hasOwnProperty('default') ? l.default : l);
          var D = function(e) {
            return t.createElement(
              'div',
              { className: 'gameinfo-item' },
              t.createElement('strong', null, e.name, ' '),
              t.createElement('div', null, JSON.stringify(e.value))
            );
          };
          D.propTypes = { name: n.string.isRequired, value: n.any };
          var k = function(e) {
            return t.createElement(
              'section',
              { className: 'gameinfo' },
              t.createElement(D, { name: 'gameID', value: e.gameID }),
              t.createElement(D, { name: 'playerID', value: e.playerID }),
              t.createElement(D, { name: 'isActive', value: e.isActive }),
              e.isMultiplayer &&
                t.createElement(
                  'span',
                  null,
                  t.createElement(D, {
                    name: 'isConnected',
                    value: e.isConnected,
                  }),
                  t.createElement(D, {
                    name: 'isMultiplayer',
                    value: e.isMultiplayer,
                  })
                )
            );
          };
          function E(e, t) {
            void 0 === t && (t = {});
            var n = t.insertAt;
            if (e && 'undefined' != typeof document) {
              var r = document.head || document.getElementsByTagName('head')[0],
                a = document.createElement('style');
              (a.type = 'text/css'),
                'top' === n && r.firstChild
                  ? r.insertBefore(a, r.firstChild)
                  : r.appendChild(a),
                a.styleSheet
                  ? (a.styleSheet.cssText = e)
                  : a.appendChild(document.createTextNode(e));
            }
          }
          k.propTypes = {
            gameID: n.string,
            playerID: n.string,
            isActive: n.bool,
            isConnected: n.bool,
            isMultiplayer: n.bool,
          };
          E(
            '/*\n * Copyright 2017 The boardgame.io Authors\n *\n * Use of this source code is governed by a MIT-style\n * license that can be found in the LICENSE file or at\n * https://opensource.org/licenses/MIT.\n */\n\n.debug-ui {\n  text-align: left;\n  overflow-x: hidden;\n  overflow-y: scroll;\n  background: #fefefe;\n  border-left: 1px solid #ddd;\n  box-shadow: -1px 0 10px #aaa;\n  position: absolute;\n  width: 300px;\n  right: 0;\n  top: 0;\n  height: 100%;\n  font-family: monospace;\n  font-size: 14px;\n}\n\n#debug-controls.docktop {\n  position: fixed;\n  display: flex;\n  flex-direction: row;\n  justify-content: space-evenly;\n  align-items: center;\n  padding-left: 10px;\n  padding-right: 10px;\n  min-width: 500px;\n  top: 0;\n  right: 300px;\n  height: 50px;\n  background: #fff;\n  box-shadow: -3px 3px 3px #ccc;\n}\n\n@media only screen and (max-device-width: 750px) {\n  .debug-ui {\n    display: none;\n  }\n}\n\n.debug-ui .gameinfo {\n  background: #ddd;\n  position: fixed;\n  bottom: 0;\n  box-sizing: border-box;\n  width: 285px;\n  margin-left: -20px;\n  margin-bottom: 0;\n  padding: 10px;\n}\n\n.debug-ui .gameinfo-item div {\n  float: right;\n  text-align: right;\n}\n\n.debug-ui .ai-visualization {\n  position: fixed;\n  opacity: 100%;\n  right: 300px;\n  height: 100%;\n  width: 100%;\n  max-width: 3000px;\n  background: #fafafa;\n  border-right: 1px solid #ddd;\n}\n\n.debug-ui .pane {\n  float: left;\n  padding: 20px;\n  box-sizing: border-box;\n  min-width: 300px;\n  max-width: 400px;\n  opacity: 0.8;\n}\n\n.debug-ui section {\n  margin-bottom: 20px;\n}\n\n.debug-ui textarea {\n  resize: none;\n}\n\n.debug-ui .move {\n  cursor: pointer;\n  margin-bottom: 10px;\n  color: #666;\n}\n\n.debug-ui .move:hover {\n  color: #333;\n}\n\n.debug-ui .move.active {\n  color: #111;\n  font-weight: bold;\n}\n\n.debug-ui .move-error {\n  color: #a00;\n  font-weight: bold;\n}\n\n.debug-ui .arg-field {\n  outline: none;\n  font-family: monospace;\n}\n\n.debug-ui .key {\n  margin-bottom: 5px;\n}\n\n.debug-ui .key-box {\n  display: inline-block;\n  cursor: pointer;\n  min-width: 10px;\n  padding-left: 5px;\n  padding-right: 5px;\n  height: 20px;\n  line-height: 20px;\n  text-align: center;\n  border: 1px solid #ccc;\n  box-shadow: 1px 1px 1px #888;\n  background: #eee;\n  color: #444;\n}\n\n.debug-ui .key-box:hover {\n  background: #ddd;\n}\n\n.debug-ui .key.active .key-box {\n  background: #ddd;\n  border: 1px solid #999;\n  box-shadow: none;\n}\n\n.debug-ui .key-child {\n  display: inline-block;\n  height: 20px;\n  margin-left: 10px;\n}\n\n.debug-ui .menu {\n  display: flex;\n  flex-direction: row;\n  justify-content: center;\n}\n\n.debug-ui .menu .item {\n  cursor: pointer;\n  margin-top: -10px;\n  margin-bottom: 20px;\n  margin-right: 10px;\n  padding: 5px;\n  min-width: 50px;\n  text-align: center;\n}\n\n.debug-ui .menu .item.active {\n  font-weight: bold;\n  border-bottom: 3px solid #ccc;\n}\n\n.debug-ui .player-box {\n  display: flex;\n  flex-direction: row;\n}\n\n.debug-ui .player {\n  cursor: pointer;\n  text-align: center;\n  width: 30px;\n  height: 30px;\n  line-height: 30px;\n  background: #eee;\n  border: 3px solid #fff;\n  box-sizing: content-box;\n}\n\n.debug-ui .player.current {\n  background: #555;\n  color: #eee;\n  font-weight: bold;\n}\n\n.debug-ui .player.active {\n  border: 3px solid #ff7f50;\n}\n'
          );
          var w = (function(e) {
            function n() {
              var e, t;
              u(this, n);
              for (
                var r = arguments.length, a = new Array(r), o = 0;
                o < r;
                o++
              )
                a[o] = arguments[o];
              return (
                m(
                  x((t = I(this, (e = v(n)).call.apply(e, [this].concat(a))))),
                  'state',
                  { active: !1 }
                ),
                m(x(t), 'deactivate', function() {
                  t.setState({ active: !1 });
                }),
                m(x(t), 'activate', function() {
                  t.setState({ active: !0 }),
                    t.props.onPress &&
                      (t.props.onPress(), t.setState({ active: !1 }));
                }),
                t
              );
            }
            return (
              y(n, t.Component),
              d(n, [
                {
                  key: 'componentDidMount',
                  value: function() {
                    var e = this;
                    r.bind(this.props.value, function(t) {
                      t.preventDefault(), e.activate();
                    });
                  },
                },
                {
                  key: 'componentWillUnmount',
                  value: function() {
                    r.unbind(this.props.value);
                  },
                },
                {
                  key: 'render',
                  value: function() {
                    var e = this.props.children;
                    c(this.props.children) === c(this) &&
                      (e = t.cloneElement(this.props.children, {
                        active: this.state.active,
                        deactivate: this.deactivate,
                        activate: this.activate,
                      }));
                    var n = 'key';
                    return (
                      this.state.active && (n += ' active'),
                      t.createElement(
                        'div',
                        { className: n },
                        t.createElement(
                          'div',
                          { className: 'key-box', onClick: this.activate },
                          this.props.value
                        ),
                        t.createElement('div', { className: 'key-child' }, e)
                      )
                    );
                  },
                },
              ]),
              n
            );
          })();
          m(w, 'propTypes', {
            value: n.string.isRequired,
            children: n.any,
            onPress: n.func,
          });
          var _ = function(e) {
            var n = null;
            e.step &&
              (n = [
                t.createElement(
                  w,
                  { key: '4', value: '4', onPress: e.step },
                  'step'
                ),
                t.createElement(
                  w,
                  { key: '5', value: '5', onPress: e.simulate },
                  'simulate'
                ),
              ]);
            var r = 'controls';
            e.dockTop && (r += ' docktop'), e.help && (r += ' help');
            var a = e.help && !e.dockTop ? 'block' : 'none';
            return t.createElement(
              'section',
              { id: 'debug-controls', style: null, className: r },
              t.createElement(w, { value: '1', onPress: e.reset }, 'reset'),
              t.createElement(w, { value: '2', onPress: e.save }, 'save'),
              t.createElement(w, { value: '3', onPress: e.restore }, 'restore'),
              n,
              e.dockTop ||
                t.createElement(
                  w,
                  { value: '?', onPress: e.toggleHelp },
                  'show more'
                ),
              t.createElement(
                'div',
                { className: 'key', style: { display: a } },
                t.createElement('div', { className: 'key-box' }, 'd'),
                ' show/hide this pane'
              ),
              t.createElement(
                'div',
                { className: 'key', style: { display: a } },
                t.createElement('div', { className: 'key-box' }, 'l'),
                ' show/hide log'
              ),
              t.createElement(
                'div',
                { className: 'key', style: { display: a } },
                t.createElement('div', { className: 'key-box' }, 'i'),
                ' show/hide game info tab'
              ),
              t.createElement(
                'div',
                { className: 'key', style: { display: a } },
                t.createElement('div', { className: 'key-box' }, 't'),
                ' dock controls'
              )
            );
          };
          _.propTypes = {
            help: n.bool,
            toggleHelp: n.func,
            step: n.func,
            simulate: n.func,
            reset: n.func,
            save: n.func,
            restore: n.func,
            dockTop: n.bool,
          };
          var C = (function(e) {
            function n() {
              var e, t;
              u(this, n);
              for (
                var r = arguments.length, a = new Array(r), o = 0;
                o < r;
                o++
              )
                a[o] = arguments[o];
              return (
                m(
                  x((t = I(this, (e = v(n)).call.apply(e, [this].concat(a))))),
                  'onClick',
                  function(e) {
                    var n = e == t.props.playerID ? null : e;
                    t.props.onClick(n);
                  }
                ),
                t
              );
            }
            return (
              y(n, t.Component),
              d(n, [
                {
                  key: 'render',
                  value: function() {
                    for (
                      var e = this,
                        n = [],
                        r = function(r) {
                          var a = r + '',
                            o = 'player';
                          a === e.props.ctx.currentPlayer && (o += ' current'),
                            a === e.props.playerID && (o += ' active'),
                            n.push(
                              t.createElement(
                                'div',
                                {
                                  className: o,
                                  key: r,
                                  onClick: function() {
                                    return e.onClick(a);
                                  },
                                },
                                a
                              )
                            );
                        },
                        a = 0;
                      a < this.props.ctx.numPlayers;
                      a++
                    )
                      r(a);
                    return t.createElement(
                      'div',
                      { className: 'player-box' },
                      n
                    );
                  },
                },
              ]),
              n
            );
          })();
          m(C, 'propTypes', {
            ctx: n.any.isRequired,
            playerID: n.any,
            onClick: n.func,
          });
          var N = function() {};
          function S(e) {
            N('ERROR:', e);
          }
          var O = (function(e) {
            function n() {
              var e, t;
              u(this, n);
              for (
                var r = arguments.length, a = new Array(r), o = 0;
                o < r;
                o++
              )
                a[o] = arguments[o];
              return (
                m(
                  x((t = I(this, (e = v(n)).call.apply(e, [this].concat(a))))),
                  'state',
                  { error: '' }
                ),
                m(x(t), 'onSubmit', function(e) {
                  var n = '';
                  try {
                    var r = new Function('return ['.concat(e, ']'))();
                    t.props.fn.apply(x(t), r);
                  } catch (a) {
                    (n = '' + a), S(a);
                  }
                  t.setState({ error: n, focus: !1, enterArg: !1 });
                }),
                t
              );
            }
            return (
              y(n, t.Component),
              d(n, [
                {
                  key: 'render',
                  value: function() {
                    return t.createElement(
                      'div',
                      null,
                      t.createElement(
                        w,
                        { value: this.props.shortcut },
                        t.createElement(M, {
                          name: this.props.name,
                          onSubmit: this.onSubmit,
                        })
                      ),
                      this.state.error
                        ? t.createElement(
                            'span',
                            { className: 'move-error' },
                            this.state.error
                          )
                        : null
                    );
                  },
                },
              ]),
              n
            );
          })();
          m(O, 'propTypes', {
            name: n.string.isRequired,
            shortcut: n.string.isRequired,
            fn: n.func.isRequired,
          });
          var M = (function(e) {
            function n() {
              var e, t;
              u(this, n);
              for (
                var r = arguments.length, a = new Array(r), o = 0;
                o < r;
                o++
              )
                a[o] = arguments[o];
              return (
                m(
                  x((t = I(this, (e = v(n)).call.apply(e, [this].concat(a))))),
                  'onKeyDown',
                  function(e) {
                    if ('Enter' == e.key) {
                      e.preventDefault();
                      var n = t.span.innerText;
                      t.props.onSubmit(n),
                        (t.span.innerText = ''),
                        t.props.deactivate();
                    }
                    'Escape' == e.key &&
                      (e.preventDefault(), t.props.deactivate());
                  }
                ),
                t
              );
            }
            return (
              y(n, t.Component),
              d(n, [
                {
                  key: 'componentDidUpdate',
                  value: function() {
                    this.props.active ? this.span.focus() : this.span.blur();
                  },
                },
                {
                  key: 'render',
                  value: function() {
                    var e = this,
                      n = 'move';
                    return (
                      this.props.active && (n += ' active'),
                      t.createElement(
                        'div',
                        { className: n, onClick: this.props.activate },
                        this.props.name,
                        '(',
                        t.createElement('span', {
                          ref: function(t) {
                            e.span = t;
                          },
                          className: 'arg-field',
                          onBlur: this.props.deactivate,
                          onKeyDown: this.onKeyDown,
                          contentEditable: !0,
                        }),
                        ')'
                      )
                    );
                  },
                },
              ]),
              n
            );
          })();
          m(M, 'propTypes', {
            name: n.string.isRequired,
            onSubmit: n.func.isRequired,
            active: n.bool,
            activate: n.func,
            deactivate: n.func,
          });
          var G = 'MAKE_MOVE',
            A = 'GAME_EVENT',
            L = 'REDO',
            T = 'RESET',
            R = 'SYNC',
            j = 'UNDO',
            q = 'UPDATE';
          E(
            '/*\n * Copyright 2017 The boardgame.io Authors\n *\n * Use of this source code is governed by a MIT-style\n * license that can be found in the LICENSE file or at\n * https://opensource.org/licenses/MIT.\n */\n\n.gamelog {\n  display: grid;\n  grid-template-columns: 30px 1fr 30px;\n  grid-auto-rows: auto;\n  grid-auto-flow: column;\n}\n\n.gamelog .turn-marker {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  grid-column: 1;\n  background: #555;\n  color: #eee;\n  text-align: center;\n  font-weight: bold;\n  border: 1px solid #888;\n}\n\n.gamelog .log-event {\n  grid-column: 2;\n  cursor: pointer;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  background: #fff;\n  border: 1px dotted #ccc;\n  border-left: 5px solid #ccc;\n  padding: 5px;\n  text-align: center;\n  color: #888;\n  font-size: 14px;\n  min-height: 25px;\n  line-height: 25px;\n}\n\n.gamelog .phase-marker {\n  grid-column: 3;\n  background: #555;\n  border: 1px solid #888;\n  color: #eee;\n  text-align: center;\n  font-weight: bold;\n  padding-top: 10px;\n  padding-bottom: 10px;\n  text-orientation: sideways;\n  writing-mode: vertical-rl;\n  line-height: 30px;\n  width: 100%;\n}\n\n.gamelog.pinned .log-event {\n  opacity: 0.2;\n}\n\n.gamelog .log-event:hover {\n  border-style: solid;\n  background: #eee;\n}\n\n.gamelog .log-event.pinned {\n  border-style: solid;\n  background: #eee;\n  opacity: 1;\n}\n\n.gamelog div.player0 {\n  border-left-color: #ff851b;\n}\n\n.gamelog div.player1 {\n  border-left-color: #7fdbff;\n}\n\n.gamelog div.player2 {\n  border-left-color: #0074d9;\n}\n\n.gamelog div.player3 {\n  border-left-color: #39cccc;\n}\n\n.gamelog div.player4 {\n  border-left-color: #3d9970;\n}\n\n.gamelog div.player5 {\n  border-left-color: #2ecc40;\n}\n\n.gamelog div.player6 {\n  border-left-color: #01ff70;\n}\n\n.gamelog div.player7 {\n  border-left-color: #ffdc00;\n}\n\n.gamelog div.player8 {\n  border-left-color: #001f3f;\n}\n\n.gamelog div.player9 {\n  border-left-color: #ff4136;\n}\n\n.gamelog div.player10 {\n  border-left-color: #85144b;\n}\n\n.gamelog div.player11 {\n  border-left-color: #f012be;\n}\n\n.gamelog div.player12 {\n  border-left-color: #b10dc9;\n}\n\n.gamelog div.player13 {\n  border-left-color: #111111;\n}\n\n.gamelog div.player14 {\n  border-left-color: #aaaaaa;\n}\n\n.gamelog div.player15 {\n  border-left-color: #dddddd;\n}\n'
          );
          var U = function(e) {
            var n =
              void 0 !== e.payload ? JSON.stringify(e.payload, null, 4) : '';
            return t.createElement('div', null, n);
          };
          U.propTypes = { payload: n.any };
          var B = function(e) {
            var n = e.action,
              r = n.payload.args || [],
              a = n.payload.playerID,
              o = 'log-event player'.concat(a);
            e.pinned && (o += ' pinned');
            var i =
              void 0 !== e.payloadComponent
                ? t.createElement(e.payloadComponent, { payload: e.payload })
                : t.createElement(U, { payload: e.payload });
            return t.createElement(
              'div',
              {
                className: o,
                onClick: function() {
                  return e.onLogClick(e.logIndex);
                },
                onMouseEnter: function() {
                  return e.onMouseEnter(e.logIndex);
                },
                onMouseLeave: function() {
                  return e.onMouseLeave();
                },
              },
              t.createElement(
                'div',
                null,
                n.payload.type,
                '(',
                r.join(','),
                ')'
              ),
              i
            );
          };
          B.propTypes = {
            action: n.any.isRequired,
            logIndex: n.number.isRequired,
            onLogClick: n.func.isRequired,
            onMouseEnter: n.func.isRequired,
            onMouseLeave: n.func.isRequired,
            pinned: n.bool,
            payload: n.object,
            payloadComponent: n.oneOfType([n.element, n.func]),
          };
          var H = function(e) {
            return t.createElement(
              'div',
              {
                className: 'turn-marker',
                style: { gridRow: 'span ' + e.numEvents },
              },
              e.turn
            );
          };
          H.propTypes = {
            turn: n.number.isRequired,
            numEvents: n.number.isRequired,
          };
          var V = function(e) {
            return t.createElement(
              'div',
              {
                className: 'phase-marker',
                style: { gridRow: 'span ' + e.numEvents },
              },
              e.phase
            );
          };
          V.propTypes = { phase: n.string, numEvents: n.number.isRequired };
          var z = (function(e) {
            function n() {
              var e, t;
              u(this, n);
              for (
                var r = arguments.length, a = new Array(r), o = 0;
                o < r;
                o++
              )
                a[o] = arguments[o];
              return (
                m(
                  x((t = I(this, (e = v(n)).call.apply(e, [this].concat(a))))),
                  'state',
                  { pinned: null }
                ),
                m(x(t), 'rewind', function(e) {
                  for (
                    var n = t.props.initialState, r = 0;
                    r < t.props.log.length;
                    r++
                  ) {
                    var a = t.props.log[r],
                      o = a.action;
                    if (
                      (a.automatic || (n = t.props.reducer(n, o)), o.type == G)
                    ) {
                      if (0 == e) break;
                      e--;
                    }
                  }
                  return { G: n.G, ctx: n.ctx };
                }),
                m(x(t), 'onLogClick', function(e) {
                  t.setState(function(n) {
                    var r = t.rewind(e),
                      a = t.props.log.filter(function(e) {
                        return e.action.type == G;
                      })[e].action.payload.metadata;
                    return n.pinned === e
                      ? (t.props.onHover({
                          logIndex: e,
                          state: r,
                          metadata: void 0,
                        }),
                        { pinned: null })
                      : (t.props.onHover({
                          logIndex: e,
                          state: r,
                          metadata: a,
                        }),
                        { pinned: e });
                  });
                }),
                m(x(t), 'onMouseEnter', function(e) {
                  if (null === t.state.pinned) {
                    var n = t.rewind(e);
                    t.props.onHover({ logIndex: e, state: n });
                  }
                }),
                m(x(t), 'onMouseLeave', function() {
                  null === t.state.pinned && t.props.onHover({ state: null });
                }),
                t
              );
            }
            return (
              y(n, t.Component),
              d(n, [
                {
                  key: 'render',
                  value: function() {
                    for (
                      var e = [],
                        n = [],
                        r = [],
                        a = 0,
                        o = 0,
                        i = this.props.log.filter(function(e) {
                          return e.action.type == G;
                        }),
                        s = 0;
                      s < i.length;
                      s++
                    ) {
                      var l = i[s],
                        c = l.action,
                        u = l.payload,
                        p = l.turn,
                        d = l.phase;
                      a++,
                        o++,
                        e.push(
                          t.createElement(B, {
                            key: s,
                            pinned: s === this.state.pinned,
                            logIndex: s,
                            onLogClick: this.onLogClick,
                            onMouseEnter: this.onMouseEnter,
                            onMouseLeave: this.onMouseLeave,
                            action: c,
                            payload: u,
                            payloadComponent: this.props.payloadComponent,
                          })
                        ),
                        (s != i.length - 1 && i[s + 1].turn == p) ||
                          (n.push(
                            t.createElement(H, {
                              key: n.length,
                              turn: p,
                              numEvents: o,
                            })
                          ),
                          (o = 0)),
                        (s != i.length - 1 && i[s + 1].phase == d) ||
                          (r.push(
                            t.createElement(V, {
                              key: r.length,
                              phase: d,
                              numEvents: a,
                            })
                          ),
                          (a = 0));
                    }
                    var m = 'gamelog';
                    return (
                      null !== this.state.pinned && (m += ' pinned'),
                      t.createElement('div', { className: m }, n, e, r)
                    );
                  },
                },
              ]),
              n
            );
          })();
          m(z, 'propTypes', {
            onHover: n.func,
            reducer: n.func,
            initialState: n.any.isRequired,
            log: n.array.isRequired,
            payloadComponent: n.oneOfType([n.element, n.func]),
          }),
            m(z, 'defaultProps', { onHover: function() {} });
          var F = function(e, t, n, r) {
              return {
                type: A,
                payload: { type: e, args: t, playerID: n, credentials: r },
              };
            },
            J = function(e, t, n, r) {
              return {
                type: A,
                payload: { type: e, args: t, playerID: n, credentials: r },
                automatic: !0,
              };
            },
            K = function(e, t) {
              return { type: R, state: e, log: t, clientOnly: !0 };
            },
            W = function(e, t) {
              return { type: q, state: e, deltalog: t, clientOnly: !0 };
            },
            Y = function(e) {
              return { type: T, state: e, clientOnly: !0 };
            },
            Q = function() {
              return { type: j };
            },
            X = function() {
              return { type: L };
            },
            Z = Object.freeze({
              makeMove: function(e, t, n, r) {
                return {
                  type: G,
                  payload: { type: e, args: t, playerID: n, credentials: r },
                };
              },
              gameEvent: F,
              automaticGameEvent: J,
              sync: K,
              update: W,
              reset: Y,
              undo: Q,
              redo: X,
            });
          var $ = (function(e) {
            function n(e) {
              var t;
              return (
                u(this, n),
                m(
                  x((t = I(this, v(n).call(this, e)))),
                  'saveState',
                  function() {
                    var e = a.stringify(t.props.gamestate);
                    window.localStorage.setItem('gamestate', e);
                  }
                ),
                m(x(t), 'restoreState', function() {
                  var e = window.localStorage.getItem('gamestate');
                  if (null !== e) {
                    var n = a.parse(e);
                    t.props.store.dispatch(K(n));
                  }
                }),
                m(x(t), 'onClickMain', function() {
                  t.setState({ showLog: !1 });
                }),
                m(x(t), 'onClickLog', function() {
                  t.setState({ showLog: !0 });
                }),
                m(x(t), 'toggleHelp', function() {
                  t.setState(function(e) {
                    return { help: !e.help };
                  });
                }),
                m(x(t), 'onLogHover', function(e) {
                  var n = e.state,
                    r = e.metadata;
                  t.setState({ AIMetadata: r }), t.props.overrideGameState(n);
                }),
                m(x(t), 'simulate', function() {
                  var e =
                      arguments.length > 0 && void 0 !== arguments[0]
                        ? arguments[0]
                        : 1e4,
                    n =
                      arguments.length > 1 && void 0 !== arguments[1]
                        ? arguments[1]
                        : 100;
                  return (async function() {
                    for (var r = 0; r < e && (await t.props.step()); r++)
                      await new Promise(function(e) {
                        return setTimeout(e, n);
                      });
                  })();
                }),
                (t.shortcuts = (function(e, t, n) {
                  var r = {},
                    a = {};
                  for (var o in e) a[o] = o;
                  for (var i in t) a[i] = i;
                  for (var s = {}, l = 0; l < n.length; l++) s[n[l]] = !0;
                  var c = s,
                    u = !0;
                  for (var p in a) {
                    var d = p[0];
                    if (c[d]) {
                      u = !1;
                      break;
                    }
                    (c[d] = !0), (r[p] = d);
                  }
                  if (u) return r;
                  c = s;
                  var m = 97;
                  for (var h in ((r = {}), a)) {
                    for (var f = String.fromCharCode(m); c[f]; )
                      m++, (f = String.fromCharCode(m));
                    (c[f] = !0), (r[h] = f);
                  }
                  return r;
                })(e.moves, e.events, 'dlit')),
                (t.state = {
                  showDebugUI: !0,
                  showLog: !1,
                  showGameInfo: e.showGameInfo,
                  dockControls: e.dockControls,
                  help: !1,
                  AIMetadata: null,
                }),
                t
              );
            }
            return (
              y(n, t.Component),
              d(n, [
                {
                  key: 'componentDidMount',
                  value: function() {
                    var e = this;
                    r.bind('d', function(t) {
                      t.preventDefault(),
                        e.setState(function(e) {
                          return { showDebugUI: !e.showDebugUI };
                        });
                    }),
                      r.bind('l', function(t) {
                        t.preventDefault(),
                          e.setState(function(e) {
                            return { showLog: !e.showLog };
                          });
                      }),
                      r.bind('i', function(t) {
                        t.preventDefault(),
                          e.setState(function(e) {
                            return { showGameInfo: !e.showGameInfo };
                          });
                      }),
                      r.bind('t', function(t) {
                        t.preventDefault(),
                          e.setState(function(e) {
                            return { dockControls: !e.dockControls };
                          });
                      });
                  },
                },
                {
                  key: 'componentWillUnmount',
                  value: function() {
                    r.unbind('d'), r.unbind('l');
                  },
                },
                {
                  key: 'render',
                  value: function() {
                    if (!this.state.showDebugUI) return null;
                    var e = [];
                    for (var n in this.props.moves) {
                      var r = this.props.moves[n],
                        a = this.shortcuts[n];
                      e.push(
                        t.createElement(O, {
                          key: n,
                          name: n,
                          fn: r,
                          shortcut: a,
                        })
                      );
                    }
                    var o = [];
                    for (var i in this.props.events) {
                      var s = this.props.events[i],
                        l = this.shortcuts[i];
                      o.push(
                        t.createElement(O, {
                          key: i,
                          name: i,
                          fn: s,
                          shortcut: l,
                        })
                      );
                    }
                    var c = this.state.AIMetadata && this.props.visualizeAI,
                      u = 'debug-ui';
                    return (
                      this.state.dockControls && (u += ' docktop'),
                      t.createElement(
                        'div',
                        { className: u },
                        c &&
                          t.createElement(
                            'div',
                            { className: 'ai-visualization' },
                            this.props.visualizeAI(this.state.AIMetadata)
                          ),
                        t.createElement(
                          'div',
                          { className: 'pane' },
                          t.createElement(
                            'div',
                            { className: 'menu' },
                            t.createElement(
                              'div',
                              {
                                className: this.state.showLog
                                  ? 'item'
                                  : 'item active',
                                onClick: this.onClickMain,
                              },
                              'Main'
                            ),
                            t.createElement(
                              'div',
                              {
                                className: this.state.showLog
                                  ? 'item active'
                                  : 'item',
                                onClick: this.onClickLog,
                              },
                              'Log'
                            )
                          ),
                          this.state.showLog ||
                            t.createElement(
                              'span',
                              null,
                              this.state.showGameInfo &&
                                t.createElement(k, {
                                  gameID: this.props.gameID,
                                  playerID: this.props.playerID,
                                  isActive: this.props.gamestate.isActive,
                                  isConnected: this.props.gamestate.isConnected,
                                  isMultiplayer: this.props.isMultiplayer,
                                }),
                              t.createElement(_, {
                                dockTop: this.state.dockControls,
                                help: this.state.help,
                                toggleHelp: this.toggleHelp,
                                step: this.props.step,
                                simulate: this.simulate,
                                reset: this.props.reset,
                                save: this.saveState,
                                restore: this.restoreState,
                              }),
                              t.createElement('h3', null, 'Players'),
                              t.createElement(C, {
                                ctx: this.props.gamestate.ctx,
                                playerID: this.props.playerID,
                                onClick: this.props.updatePlayerID,
                              }),
                              t.createElement('h3', null, 'Moves'),
                              t.createElement('section', null, e),
                              t.createElement('h3', null, 'Events'),
                              t.createElement('section', null, o),
                              t.createElement(
                                'section',
                                null,
                                t.createElement(
                                  'pre',
                                  { className: 'json' },
                                  t.createElement('strong', null, 'G'),
                                  ':',
                                  ' ',
                                  JSON.stringify(
                                    this.props.gamestate.G,
                                    null,
                                    2
                                  )
                                )
                              ),
                              t.createElement(
                                'section',
                                null,
                                t.createElement(
                                  'pre',
                                  { className: 'json' },
                                  t.createElement('strong', null, 'ctx'),
                                  ':',
                                  ' ',
                                  JSON.stringify(
                                    (function(e) {
                                      var t = {};
                                      for (var n in e)
                                        n.startsWith('_') || (t[n] = e[n]);
                                      return t;
                                    })(this.props.gamestate.ctx),
                                    null,
                                    2
                                  )
                                )
                              )
                            ),
                          this.state.showLog &&
                            t.createElement(
                              'section',
                              null,
                              t.createElement(z, {
                                onHover: this.onLogHover,
                                reducer: this.props.reducer,
                                log: this.props.gamestate.log,
                                initialState: this.props.gamestate._initial,
                              })
                            )
                        )
                      )
                    );
                  },
                },
              ]),
              n
            );
          })();
          m($, 'propTypes', {
            gamestate: n.shape({
              G: n.any.isRequired,
              ctx: n.any.isRequired,
              log: n.array.isRequired,
              isActive: n.bool,
              isConnected: n.bool,
              _initial: n.any.isRequired,
            }),
            gameID: n.string.isRequired,
            playerID: n.string,
            isMultiplayer: n.bool,
            moves: n.any,
            events: n.any,
            restore: n.func,
            showLog: n.bool,
            store: n.any,
            step: n.func,
            reset: n.func,
            reducer: n.func,
            overrideGameState: n.func,
            visualizeAI: n.func,
            updateGameID: n.func,
            updatePlayerID: n.func,
            updateCredentials: n.func,
            showGameInfo: n.bool,
            dockControls: n.bool,
          }),
            m($, 'defaultProps', { showGameInfo: !0, dockControls: !1 });
          var ee = [
              {
                fnWrap: function(e) {
                  return i(e);
                },
              },
            ],
            te = function(e, t) {
              var n = []
                .concat(ee, P(t))
                .filter(function(e) {
                  return void 0 !== e.fnWrap;
                })
                .reduce(function(e, n) {
                  return (0, n.fnWrap)(e, t);
                }, e);
              return function(e, r) {
                (e = (function(e, t) {
                  return (
                    []
                      .concat(ee, P(t))
                      .filter(function(e) {
                        return void 0 !== e.G;
                      })
                      .filter(function(e) {
                        return void 0 !== e.G.preMove;
                      })
                      .forEach(function(n) {
                        e = n.G.preMove(e, t);
                      }),
                    e
                  );
                })(e, t)),
                  (r = (function(e, t) {
                    return (
                      []
                        .concat(ee, P(t))
                        .filter(function(e) {
                          return void 0 !== e.ctx;
                        })
                        .filter(function(e) {
                          return void 0 !== e.ctx.preMove;
                        })
                        .forEach(function(n) {
                          e = n.ctx.preMove(e, t);
                        }),
                      e
                    );
                  })(r, t));
                for (
                  var a = arguments.length,
                    o = new Array(a > 2 ? a - 2 : 0),
                    i = 2;
                  i < a;
                  i++
                )
                  o[i - 2] = arguments[i];
                return (e = (function(e, t) {
                  return (
                    []
                      .concat(ee, P(t))
                      .filter(function(e) {
                        return void 0 !== e.G;
                      })
                      .filter(function(e) {
                        return void 0 !== e.G.postMove;
                      })
                      .forEach(function(n) {
                        e = n.G.postMove(e, t);
                      }),
                    e
                  );
                })((e = n.apply(void 0, [e, r].concat(o))), t));
              };
            },
            ne = {
              setup: function(e, t, n) {
                return (
                  []
                    .concat(ee, P(n.plugins))
                    .filter(function(e) {
                      return void 0 !== e.G;
                    })
                    .filter(function(e) {
                      return void 0 !== e.G.setup;
                    })
                    .forEach(function(r) {
                      e = r.G.setup(e, t, n);
                    }),
                  e
                );
              },
              onPhaseBegin: function(e, t, n) {
                return (
                  []
                    .concat(ee, P(n))
                    .filter(function(e) {
                      return void 0 !== e.G;
                    })
                    .filter(function(e) {
                      return void 0 !== e.G.onPhaseBegin;
                    })
                    .forEach(function(r) {
                      e = r.G.onPhaseBegin(e, t, n);
                    }),
                  e
                );
              },
            },
            re = {
              setup: function(e, t) {
                return (
                  []
                    .concat(ee, P(t.plugins))
                    .filter(function(e) {
                      return void 0 !== e.ctx;
                    })
                    .filter(function(e) {
                      return void 0 !== e.ctx.setup;
                    })
                    .forEach(function(n) {
                      e = n.ctx.setup(e, t);
                    }),
                  e
                );
              },
              onPhaseBegin: function(e, t) {
                return (
                  []
                    .concat(ee, P(t))
                    .filter(function(e) {
                      return void 0 !== e.ctx;
                    })
                    .filter(function(e) {
                      return void 0 !== e.ctx.onPhaseBegin;
                    })
                    .forEach(function(n) {
                      e = n.ctx.onPhaseBegin(e, t);
                    }),
                  e
                );
              },
            };
          function ae(e, t) {
            return f({}, e, { ctx: oe(e.ctx, t) });
          }
          function oe(e, t) {
            var n = e._prevActivePlayers,
              r = t.next || null;
            n = t.revert
              ? n.concat({
                  activePlayers: e.activePlayers,
                  _activePlayersMoveLimit: e._activePlayersMoveLimit,
                  _activePlayersNumMoves: e._activePlayersNumMoves,
                })
              : [];
            var a = {};
            if (
              (t.value && (a = t.value),
              void 0 !== t.currentPlayer &&
                (a[e.currentPlayer] = t.currentPlayer),
              void 0 !== t.others)
            )
              for (var o = 0; o < e.playOrder.length; o++) {
                var i = e.playOrder[o];
                i !== e.currentPlayer && (a[i] = t.others);
              }
            if (void 0 !== t.all)
              for (var s = 0; s < e.playOrder.length; s++) {
                a[e.playOrder[s]] = t.all;
              }
            0 == Object.keys(a).length && (a = null);
            var l = null;
            if (a && t.moveLimit)
              if ('number' == typeof t.moveLimit)
                for (var c in ((l = {}), a)) l[c] = t.moveLimit;
              else if (
                ((l = {}),
                t.moveLimit.value && (l = t.moveLimit.value),
                void 0 !== t.moveLimit.currentPlayer &&
                  a[e.currentPlayer] &&
                  (l[e.currentPlayer] = t.moveLimit.currentPlayer),
                void 0 !== t.moveLimit.others)
              )
                for (var u in a)
                  u !== e.currentPlayer && (l[u] = t.moveLimit.others);
            var p = {};
            for (var d in a) p[d] = 0;
            return f({}, e, {
              activePlayers: a,
              _activePlayersMoveLimit: l,
              _activePlayersNumMoves: p,
              _prevActivePlayers: n,
              _nextActivePlayers: r,
            });
          }
          function ie(e, t) {
            return e[t] + '';
          }
          var se = {
              DEFAULT: {
                first: function(e, t) {
                  return t.playOrderPos;
                },
                next: function(e, t) {
                  return (t.playOrderPos + 1) % t.playOrder.length;
                },
              },
              RESET: {
                first: function() {
                  return 0;
                },
                next: function(e, t) {
                  return (t.playOrderPos + 1) % t.playOrder.length;
                },
              },
              ONCE: {
                first: function() {
                  return 0;
                },
                next: function(e, t) {
                  if (t.playOrderPos < t.playOrder.length - 1)
                    return t.playOrderPos + 1;
                },
              },
              CUSTOM: function(e) {
                return {
                  playOrder: function() {
                    return e;
                  },
                  first: function() {
                    return 0;
                  },
                  next: function(e, t) {
                    return (t.playOrderPos + 1) % t.playOrder.length;
                  },
                };
              },
              CUSTOM_FROM: function(e) {
                return {
                  playOrder: function(t) {
                    return t[e];
                  },
                  first: function() {
                    return 0;
                  },
                  next: function(e, t) {
                    return (t.playOrderPos + 1) % t.playOrder.length;
                  },
                };
              },
              SKIP: {
                first: function(e, t) {
                  return t.playOrderPos;
                },
                next: function(e, t) {
                  if (!e.allPassed)
                    for (
                      var n = t.playOrderPos, r = 0;
                      r < t.playOrder.length;
                      r++
                    )
                      if (
                        ((n = (n + 1) % t.playOrder.length),
                        !e.passOrder.includes(t.playOrder[n] + ''))
                      )
                        return n;
                },
              },
            },
            le = { NULL: null };
          function ce(e) {
            var t,
              n = this,
              r =
                ((t = 4022871197),
                function(e) {
                  e = e.toString();
                  for (var n = 0; n < e.length; n++) {
                    var r = 0.02519603282416938 * (t += e.charCodeAt(n));
                    (r -= t = r >>> 0),
                      (t = (r *= t) >>> 0),
                      (t += 4294967296 * (r -= t));
                  }
                  return 2.3283064365386963e-10 * (t >>> 0);
                });
            (n.next = function() {
              var e = 2091639 * n.s0 + 2.3283064365386963e-10 * n.c;
              return (n.s0 = n.s1), (n.s1 = n.s2), (n.s2 = e - (n.c = 0 | e));
            }),
              (n.c = 1),
              (n.s0 = r(' ')),
              (n.s1 = r(' ')),
              (n.s2 = r(' ')),
              (n.s0 -= r(e)),
              n.s0 < 0 && (n.s0 += 1),
              (n.s1 -= r(e)),
              n.s1 < 0 && (n.s1 += 1),
              (n.s2 -= r(e)),
              n.s2 < 0 && (n.s2 += 1),
              (r = null);
          }
          function ue(e, t) {
            return (t.c = e.c), (t.s0 = e.s0), (t.s1 = e.s1), (t.s2 = e.s2), t;
          }
          function pe(e, t) {
            var n = new ce(e),
              r = t && t.state,
              a = n.next;
            return (
              (a.quick = a),
              r &&
                ('object' == c(r) && ue(r, n),
                (a.state = function() {
                  return ue(n, {});
                })),
              a
            );
          }
          var de = (function() {
            function e(t) {
              u(this, e), (this.state = t._random || { seed: '0' });
            }
            return (
              d(e, [
                {
                  key: 'update',
                  value: function(e) {
                    var t = f({}, e.ctx, { _random: this.state });
                    return f({}, e, { ctx: t });
                  },
                },
                {
                  key: 'attach',
                  value: function(e) {
                    return f({}, e, { random: this._api() });
                  },
                },
                {
                  key: '_random',
                  value: function() {
                    var e,
                      t = this.state,
                      n = (e =
                        void 0 === t.prngstate
                          ? new pe(t.seed, { state: !0 })
                          : new pe('', { state: t.prngstate }))();
                    return (this.state = f({}, t, { prngstate: e.state() })), n;
                  },
                },
                {
                  key: '_api',
                  value: function() {
                    var e = this._random.bind(this),
                      t = { D4: 4, D6: 6, D8: 8, D10: 10, D12: 12, D20: 20 },
                      n = {},
                      r = function(r) {
                        var a = t[r];
                        n[r] = function(t) {
                          return void 0 === t
                            ? Math.floor(e() * a) + 1
                            : P(new Array(t).keys()).map(function() {
                                return Math.floor(e() * a) + 1;
                              });
                        };
                      };
                    for (var a in t) r(a);
                    return f({}, n, {
                      Die: function(t, n) {
                        return (
                          void 0 === t && (t = 6),
                          void 0 === n
                            ? Math.floor(e() * t) + 1
                            : P(new Array(n).keys()).map(function() {
                                return Math.floor(e() * t) + 1;
                              })
                        );
                      },
                      Number: function() {
                        return e();
                      },
                      Shuffle: function(t) {
                        for (
                          var n = t.slice(0),
                            r = t.length,
                            a = 0,
                            o = new Array(r);
                          r;

                        ) {
                          var i = (r * e()) | 0;
                          (o[a++] = n[i]), (n[i] = n[--r]);
                        }
                        return o;
                      },
                    });
                  },
                },
              ]),
              e
            );
          })();
          (de.detach = function(e) {
            e.random;
            return b(e, ['random']);
          }),
            (de.seed = function() {
              return (+new Date()).toString(36).slice(-10);
            });
          var me = (function() {
            function e(t, n) {
              u(this, e),
                (this.flow = t),
                (this.playerID = n),
                (this.dispatch = []);
            }
            return (
              d(e, [
                {
                  key: 'attach',
                  value: function(e) {
                    var t = this,
                      n = {},
                      r = e.phase,
                      a = e.turn,
                      o = !0,
                      i = !1,
                      s = void 0;
                    try {
                      for (
                        var l,
                          c = function() {
                            var e = l.value;
                            n[e] = function() {
                              for (
                                var n = arguments.length,
                                  o = new Array(n),
                                  i = 0;
                                i < n;
                                i++
                              )
                                o[i] = arguments[i];
                              t.dispatch.push({
                                key: e,
                                args: o,
                                phase: r,
                                turn: a,
                              });
                            };
                          },
                          u = this.flow.eventNames[Symbol.iterator]();
                        !(o = (l = u.next()).done);
                        o = !0
                      )
                        c();
                    } catch (p) {
                      (i = !0), (s = p);
                    } finally {
                      try {
                        o || null == u.return || u.return();
                      } finally {
                        if (i) throw s;
                      }
                    }
                    return f({}, e, { events: n });
                  },
                },
                {
                  key: 'update',
                  value: function(e) {
                    for (var t = this.dispatch.length, n = 0; n < t; n++) {
                      var r = this.dispatch[n];
                      if (
                        ('endTurn' !== r.key || r.turn === e.ctx.turn) &&
                        (('endPhase' !== r.key && 'setPhase' !== r.key) ||
                          r.phase === e.ctx.phase)
                      ) {
                        var a = J(r.key, r.args, this.playerID);
                        e = f({}, e, {}, this.flow.processEvent(e, a));
                      }
                    }
                    return e;
                  },
                },
              ]),
              e
            );
          })();
          me.detach = function(e) {
            e.events;
            return b(e, ['events']);
          };
          var he = (function() {
              function e() {
                u(this, e), (this._payload = void 0);
              }
              return (
                d(
                  e,
                  [
                    {
                      key: '_api',
                      value: function() {
                        var e = this;
                        return {
                          setPayload: function(t) {
                            e._payload = t;
                          },
                        };
                      },
                    },
                    {
                      key: 'attach',
                      value: function(e) {
                        return f({}, e, { log: this._api() });
                      },
                    },
                    {
                      key: 'update',
                      value: function(e) {
                        if (void 0 === this._payload) return e;
                        var t = e.deltalog;
                        return (
                          (t[t.length - 1] = f({}, t[t.length - 1], {
                            payload: this._payload,
                          })),
                          (this._payload = void 0),
                          f({}, e, { deltalog: t })
                        );
                      },
                    },
                  ],
                  [
                    {
                      key: 'detach',
                      value: function(e) {
                        e.log;
                        return b(e, ['log']);
                      },
                    },
                  ]
                ),
                e
              );
            })(),
            fe = (function() {
              function e(t, n, r) {
                u(this, e),
                  (this.random = new de(t)),
                  (this.events = new me(n.flow, r)),
                  (this.log = new he());
              }
              return (
                d(
                  e,
                  [
                    {
                      key: 'attachToContext',
                      value: function(e) {
                        var t = this.random.attach(e);
                        return (
                          (t = this.events.attach(t)), (t = this.log.attach(t))
                        );
                      },
                    },
                    {
                      key: '_update',
                      value: function(e, t) {
                        var n = t ? this.events.update(e) : e;
                        return (
                          (n = this.random.update(n)), (n = this.log.update(n))
                        );
                      },
                    },
                    {
                      key: 'updateAndDetach',
                      value: function(t, n) {
                        var r = this._update(t, n);
                        return (r.ctx = e.detachAllFromContext(r.ctx)), r;
                      },
                    },
                  ],
                  [
                    {
                      key: 'detachAllFromContext',
                      value: function(e) {
                        var t = de.detach(e);
                        return (t = me.detach(t)), (t = he.detach(t));
                      },
                    },
                  ]
                ),
                e
              );
            })();
          function ye(e) {
            var t = e.moves,
              n = e.phases,
              r = e.endIf,
              a = e.turn,
              o = e.events,
              i = e.plugins;
            void 0 === t && (t = {}),
              void 0 === o && (o = {}),
              void 0 === i && (i = []),
              void 0 === n && (n = {}),
              r || (r = function() {}),
              a || (a = {});
            var s = f({}, n);
            '' in s && S('cannot specify phase with empty name'), (s[''] = {});
            var l = {},
              c = new Set(),
              u = null;
            for (var p in (Object.keys(t).forEach(function(e) {
              return c.add(e);
            }),
            s)) {
              var d = s[p];
              if ((!0 === d.start && (u = p), void 0 !== d.moves))
                for (var m = 0, h = Object.keys(d.moves); m < h.length; m++) {
                  var y = h[m];
                  (l[p + '.' + y] = d.moves[y]), c.add(y);
                }
              for (var v in (void 0 === d.endIf && (d.endIf = function() {}),
              void 0 === d.onBegin &&
                (d.onBegin = function(e) {
                  return e;
                }),
              (d.onBegin = te(d.onBegin, i)),
              void 0 === d.onEnd &&
                (d.onEnd = function(e) {
                  return e;
                }),
              (d.onEnd = te(d.onEnd, i)),
              void 0 === d.turn && (d.turn = a),
              void 0 === d.turn.order && (d.turn.order = se.DEFAULT),
              void 0 === d.turn.onBegin &&
                (d.turn.onBegin = function(e) {
                  return e;
                }),
              void 0 === d.turn.onEnd &&
                (d.turn.onEnd = function(e) {
                  return e;
                }),
              void 0 === d.turn.endIf &&
                (d.turn.endIf = function() {
                  return !1;
                }),
              void 0 === d.turn.onMove &&
                (d.turn.onMove = function(e) {
                  return e;
                }),
              void 0 === d.turn.stages && (d.turn.stages = {}),
              d.turn.stages))
                for (
                  var g = d.turn.stages[v].moves || {},
                    x = 0,
                    I = Object.keys(g);
                  x < I.length;
                  x++
                ) {
                  var D = I[x];
                  (l[p + '.' + v + '.' + D] = g[D]), c.add(D);
                }
              (d.turn.onMove = te(d.turn.onMove, i)),
                (d.turn.onBegin = te(d.turn.onBegin, i)),
                (d.turn.onEnd = te(d.turn.onEnd, i));
            }
            function k(e) {
              return e.phase ? s[e.phase] : s[''];
            }
            function E(e) {
              return e;
            }
            function w(e, t) {
              for (var n = new Set(), r = new Set(), a = 0; a < t.length; a++) {
                var o = t[a],
                  i = o.fn,
                  s = o.arg,
                  l = b(o, ['fn', 'arg']);
                if (i === j) {
                  r.clear();
                  var c = e.ctx.phase;
                  if (n.has(c)) {
                    var u = f({}, e.ctx, { phase: null });
                    return f({}, e, { ctx: u });
                  }
                  n.add(c);
                }
                var p = [];
                if (((e = i(e, f({}, l, { arg: s, next: p }))), i === R)) break;
                var d = A(e);
                if (d)
                  t.push({
                    fn: R,
                    arg: d,
                    turn: e.ctx.turn,
                    phase: e.ctx.phase,
                    automatic: !0,
                  });
                else {
                  var m = L(e);
                  if (m)
                    t.push({
                      fn: j,
                      arg: m,
                      turn: e.ctx.turn,
                      phase: e.ctx.phase,
                      automatic: !0,
                    });
                  else {
                    if (i === E) {
                      var h = T(e);
                      if (h) {
                        t.push({
                          fn: q,
                          arg: h,
                          turn: e.ctx.turn,
                          phase: e.ctx.phase,
                          automatic: !0,
                        });
                        continue;
                      }
                    }
                    t.push.apply(t, p);
                  }
                }
              }
              return e;
            }
            function _(e, t) {
              return t.next.push({ fn: C }), e;
            }
            function C(e, t) {
              var n = t.next,
                r = e.G,
                a = e.ctx,
                o = k(a);
              return (
                (r = ne.onPhaseBegin(r, a, i)),
                (a = re.onPhaseBegin(a, i)),
                (r = o.onBegin(r, a)),
                n.push({ fn: N }),
                f({}, e, { G: r, ctx: a })
              );
            }
            function N(e, t) {
              var n = t.currentPlayer,
                r = e.G,
                a = e.ctx,
                o = k(a);
              return (
                n
                  ? ((a = f({}, a, { currentPlayer: n })),
                    o.turn.activePlayers && (a = oe(a, o.turn.activePlayers)))
                  : (a = (function(e, t, n) {
                      var r = n.order,
                        a = P(new Array(t.numPlayers)).map(function(e, t) {
                          return t + '';
                        });
                      void 0 !== r.playOrder && (a = r.playOrder(e, t));
                      var o = r.first(e, t);
                      return (t = oe(
                        (t = f({}, t, {
                          currentPlayer: ie(a, o),
                          playOrderPos: o,
                          playOrder: a,
                        })),
                        n.activePlayers || {}
                      ));
                    })(r, a, o.turn)),
                (r = o.turn.onBegin(r, a)),
                (a = f({}, a, {
                  turn: a.turn + 1,
                  numMoves: 0,
                  _prevActivePlayers: [],
                })),
                f({}, e, {
                  G: r,
                  ctx: a,
                  _undo: [{ G: r, ctx: fe.detachAllFromContext(a) }],
                  _redo: [],
                })
              );
            }
            function O(e, t) {
              var n = t.arg,
                r = t.next,
                a = k({ phase: t.phase }),
                o = e.ctx;
              if (n && n.next) {
                if (!(n.next in s)) return S('invalid phase: ' + n.next), e;
                o = f({}, o, { phase: n.next });
              } else o = void 0 !== a.next ? f({}, o, { phase: a.next }) : f({}, o, { phase: null });
              return (e = f({}, e, { ctx: o })), r.push({ fn: C }), e;
            }
            function M(e, t) {
              var n = t.arg,
                r = t.currentPlayer,
                a = t.next,
                o = e,
                i = o.G,
                s = o.ctx,
                l = k(s),
                c = (function(e, t, n, r) {
                  var a = n.order,
                    o = t.playOrderPos,
                    i = t.currentPlayer,
                    s = !1;
                  if (r && !0 !== r)
                    t.playOrder.includes(r.next)
                      ? ((o = t.playOrder.indexOf(r.next)), (i = r.next))
                      : S('invalid argument to endTurn: '.concat(r));
                  else {
                    var l = a.next(e, t);
                    void 0 === l
                      ? (s = !0)
                      : ((o = l), (i = ie(t.playOrder, o)));
                  }
                  return {
                    endPhase: s,
                    ctx: (t = f({}, t, { playOrderPos: o, currentPlayer: i })),
                  };
                })(i, f({}, s, { currentPlayer: r }), l.turn, n),
                u = c.endPhase;
              return (
                (e = f({}, e, { G: i, ctx: (s = c.ctx) })),
                u
                  ? a.push({ fn: j, turn: s.turn, phase: s.phase })
                  : a.push({ fn: N, currentPlayer: s.currentPlayer }),
                e
              );
            }
            function G(e, t) {
              var n = t.arg,
                r = t.playerID;
              'string' == typeof n && (n = { stage: n });
              var a = e.ctx,
                o = a,
                i = o.activePlayers,
                s = o._activePlayersMoveLimit,
                l = o._activePlayersNumMoves;
              return (
                n.stage &&
                  (null === i && (i = {}),
                  (i[r] = n.stage),
                  (l[r] = 0),
                  n.moveLimit &&
                    (null === s && (s = {}), (s[r] = n.moveLimit))),
                (a = f({}, a, {
                  activePlayers: i,
                  _activePlayersMoveLimit: s,
                  _activePlayersNumMoves: l,
                })),
                f({}, e, { ctx: a })
              );
            }
            function A(e) {
              var t = e.G,
                n = e.ctx;
              return r(t, n);
            }
            function L(e) {
              var t = e.G,
                n = e.ctx;
              return k(n).endIf(t, n);
            }
            function T(e) {
              var t = e.G,
                n = e.ctx,
                r = k(n),
                a = n.numMoves || 0;
              return (
                !!(r.turn.moveLimit && a >= r.turn.moveLimit) ||
                r.turn.endIf(t, n)
              );
            }
            function R(e, t) {
              var n = t.arg;
              return (
                void 0 === n && (n = !0),
                f({}, (e = j(e, { phase: t.phase })), {
                  ctx: f({}, e.ctx, { gameover: n }),
                })
              );
            }
            function j(e, t) {
              var n = t.arg,
                r = t.next,
                a = t.turn,
                o = t.automatic,
                i = (e = q(e, { turn: a, force: !0 })).G,
                s = e.ctx;
              if (
                (r && r.push({ fn: O, arg: n, phase: s.phase }),
                null === s.phase)
              )
                return e;
              (i = k(s).onEnd(i, s)), (s = f({}, s, { phase: null }));
              var l = {
                action: F('endPhase', n),
                _stateID: e._stateID,
                turn: e.ctx.turn,
                phase: e.ctx.phase,
              };
              return (
                o && (l.automatic = !0),
                f({}, e, {
                  G: i,
                  ctx: s,
                  deltalog: [].concat(P(e.deltalog), [l]),
                })
              );
            }
            function q(e, t) {
              var n = t.arg,
                r = t.next,
                a = t.turn,
                o = t.force,
                i = t.automatic;
              if (a !== e.ctx.turn) return e;
              var s = e.G,
                l = e.ctx,
                c = k(l),
                u = l.numMoves || 0;
              if (!o && c.turn.moveLimit && u < c.turn.moveLimit) return e;
              (s = c.turn.onEnd(s, l)),
                r && r.push({ fn: M, arg: n, currentPlayer: l.currentPlayer }),
                (l = f({}, l, { activePlayers: null }));
              var p = {
                action: F('endTurn', n),
                _stateID: e._stateID,
                turn: e.ctx.turn,
                phase: e.ctx.phase,
              };
              return (
                i && (p.automatic = !0),
                f({}, e, {
                  G: s,
                  ctx: l,
                  deltalog: [].concat(P(e.deltalog || []), [p]),
                  _undo: [],
                  _redo: [],
                })
              );
            }
            function U(e, t) {
              var n = t.arg,
                r = t.next,
                a = t.automatic,
                o = t.playerID;
              o = o || e.ctx.currentPlayer;
              var i = e.ctx,
                s = i,
                l = s.activePlayers,
                c = s._activePlayersMoveLimit;
              if (
                (r && n && r.push({ fn: G, arg: n, playerID: o }),
                null === l || !(o in l))
              )
                return e;
              (l = Object.keys(l)
                .filter(function(e) {
                  return e !== o;
                })
                .reduce(function(e, t) {
                  return (e[t] = l[t]), e;
                }, {})),
                c &&
                  (c = Object.keys(c)
                    .filter(function(e) {
                      return e !== o;
                    })
                    .reduce(function(e, t) {
                      return (e[t] = c[t]), e;
                    }, {})),
                (i = (function(e) {
                  var t = e,
                    n = t.activePlayers,
                    r = t._activePlayersMoveLimit,
                    a = t._activePlayersNumMoves,
                    o = t._prevActivePlayers;
                  if (n && 0 == Object.keys(n).length)
                    if (e._nextActivePlayers) {
                      var i = (e = oe(e, e._nextActivePlayers));
                      (n = i.activePlayers),
                        (r = i._activePlayersMoveLimit),
                        (a = i._activePlayersNumMoves),
                        (o = i._prevActivePlayers);
                    } else if (o.length > 0) {
                      var s = o.length - 1,
                        l = o[s];
                      (n = l.activePlayers),
                        (r = l._activePlayersMoveLimit),
                        (a = l._activePlayersNumMoves),
                        (o = o.slice(0, s));
                    } else (n = null), (r = null);
                  return f({}, e, {
                    activePlayers: n,
                    _activePlayersMoveLimit: r,
                    _activePlayersNumMoves: a,
                    _prevActivePlayers: o,
                  });
                })(f({}, i, { activePlayers: l, _activePlayersMoveLimit: c })));
              var u = {
                action: F('endStage', n),
                _stateID: e._stateID,
                turn: e.ctx.turn,
                phase: e.ctx.phase,
              };
              return (
                a && (u.automatic = !0),
                f({}, e, {
                  ctx: i,
                  deltalog: [].concat(P(e.deltalog || []), [u]),
                })
              );
            }
            var B = {
                endStage: function(e) {
                  return w(e, [{ fn: U }]);
                },
                setStage: function(e, t) {
                  return w(e, [{ fn: U, arg: t }]);
                },
                endTurn: function(e, t) {
                  return w(e, [
                    { fn: q, turn: e.ctx.turn, phase: e.ctx.phase, arg: t },
                  ]);
                },
                endPhase: function(e) {
                  return w(e, [
                    { fn: j, phase: e.ctx.phase, turn: e.ctx.turn },
                  ]);
                },
                setPhase: function(e, t) {
                  return w(e, [
                    {
                      fn: j,
                      phase: e.ctx.phase,
                      turn: e.ctx.turn,
                      arg: { next: t },
                    },
                  ]);
                },
                endGame: function(e, t) {
                  return w(e, [
                    { fn: R, turn: e.ctx.turn, phase: e.ctx.phase, arg: t },
                  ]);
                },
                setActivePlayers: ae,
              },
              H = [];
            return (
              !1 !== o.endTurn && H.push('endTurn'),
              !1 !== o.endPhase && H.push('endPhase'),
              !1 !== o.setPhase && H.push('setPhase'),
              !1 !== o.endGame && H.push('endGame'),
              !1 !== o.setActivePlayers && H.push('setActivePlayers'),
              !1 !== o.endStage && H.push('endStage'),
              !1 !== o.setStage && H.push('setStage'),
              {
                ctx: function(e) {
                  return {
                    numPlayers: e,
                    turn: 0,
                    currentPlayer: '0',
                    playOrder: P(new Array(e)).map(function(e, t) {
                      return t + '';
                    }),
                    playOrderPos: 0,
                    phase: u,
                    activePlayers: null,
                  };
                },
                init: function(e) {
                  return w(e, [{ fn: _ }]);
                },
                isPlayerActive: function(e, t, n) {
                  return t.activePlayers
                    ? n in t.activePlayers
                    : t.currentPlayer === n;
                },
                eventHandlers: B,
                eventNames: Object.keys(B),
                enabledEventNames: H,
                moveMap: l,
                moveNames: P(c.values()),
                processMove: function(e, t) {
                  var n = k(e.ctx),
                    r = e.ctx,
                    a = r._activePlayersNumMoves,
                    o = t.playerID;
                  r.activePlayers && a[o]++;
                  var i = e.ctx.numMoves;
                  o == e.ctx.currentPlayer && i++,
                    (e = f({}, e, {
                      ctx: f({}, r, { numMoves: i, _activePlayersNumMoves: a }),
                    })),
                    r._activePlayersMoveLimit &&
                      a[o] >= r._activePlayersMoveLimit[o] &&
                      (e = U(e, { playerID: o, automatic: !0 }));
                  var s =
                      (e = f({}, e, { G: n.turn.onMove(e.G, e.ctx, t) }))
                        ._undo || [],
                    l = t.type,
                    c = fe.detachAllFromContext(e.ctx);
                  return w(
                    (e = f({}, e, {
                      _undo: [].concat(P(s), [{ G: e.G, ctx: c, moveType: l }]),
                      _redo: [],
                    })),
                    [{ fn: E }]
                  );
                },
                processEvent: function(e, t) {
                  var n = t.payload;
                  if (B.hasOwnProperty(n.type)) {
                    var r = { playerID: n.playerID },
                      a = [e].concat(n.args);
                    return B[n.type].apply(r, a);
                  }
                  return e;
                },
                getMove: function(e, n, r) {
                  var a = k(e),
                    o = a.turn.stages,
                    i = e.activePlayers;
                  if (
                    i &&
                    void 0 !== i[r] &&
                    i[r] !== le.NULL &&
                    void 0 !== o[i[r]] &&
                    void 0 !== o[i[r]].moves
                  ) {
                    var s = o[i[r]].moves;
                    if (n in s) return s[n];
                  } else if (a.moves) {
                    if (n in a.moves) return a.moves[n];
                  } else if (n in t) return t[n];
                  return null;
                },
              }
            );
          }
          function ve(e) {
            if (e.processMove) return e;
            void 0 === e.name && (e.name = 'default'),
              void 0 === e.setup &&
                (e.setup = function() {
                  return {};
                }),
              void 0 === e.moves && (e.moves = {}),
              void 0 === e.playerView &&
                (e.playerView = function(e) {
                  return e;
                }),
              void 0 === e.plugins && (e.plugins = []);
            var t = ye(e);
            return f({}, e, {
              flow: t,
              moveNames: t.moveNames,
              processMove: function(n, r, a) {
                var o = t.getMove(a, r.type, r.playerID);
                if (
                  (o instanceof Object && o.move && (o = o.move),
                  o instanceof Function)
                ) {
                  var i = [n, f({}, a, { playerID: r.playerID })].concat(
                    r.args
                  );
                  return te(o, e.plugins).apply(void 0, P(i));
                }
                return n;
              },
            });
          }
          var ge = (function() {
              function e() {
                var t =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : {},
                  n = t.socket,
                  r = t.socketOpts,
                  a = t.store,
                  o = t.gameID,
                  i = t.playerID,
                  s = t.gameName,
                  l = t.numPlayers,
                  c = t.server;
                u(this, e),
                  (this.server = c),
                  (this.socket = n),
                  (this.store = a),
                  (this.socketOpts = r),
                  (this.gameName = s || 'default'),
                  (this.gameID = o || 'default'),
                  (this.playerID = i || null),
                  (this.numPlayers = l || 2),
                  (this.gameID = this.gameName + ':' + this.gameID),
                  (this.isConnected = !1),
                  (this.callback = function() {}),
                  (this.gameMetadataCallback = function() {});
              }
              return (
                d(e, [
                  {
                    key: 'onAction',
                    value: function(e, t) {
                      this.socket.emit(
                        'update',
                        t,
                        e._stateID,
                        this.gameID,
                        this.playerID
                      );
                    },
                  },
                  {
                    key: 'connect',
                    value: function() {
                      var e = this;
                      if (!this.socket)
                        if (this.server) {
                          var t = this.server;
                          -1 == t.search(/^https?:\/\//) &&
                            (t = 'http://' + this.server),
                            '/' != t.substr(-1) && (t += '/'),
                            (this.socket = s(
                              t + this.gameName,
                              this.socketOpts
                            ));
                        } else
                          this.socket = s('/' + this.gameName, this.socketOpts);
                      this.socket.on('update', function(t, n, r) {
                        var a = e.store.getState();
                        if (t == e.gameID && n._stateID >= a._stateID) {
                          var o = W(n, r);
                          e.store.dispatch(o);
                        }
                      }),
                        this.socket.on('sync', function(t, n, r, a) {
                          if (t == e.gameID) {
                            var o = K(n, r);
                            e.gameMetadataCallback(a), e.store.dispatch(o);
                          }
                        }),
                        this.socket.emit(
                          'sync',
                          this.gameID,
                          this.playerID,
                          this.numPlayers
                        ),
                        this.socket.on('connect', function() {
                          (e.isConnected = !0), e.callback();
                        }),
                        this.socket.on('disconnect', function() {
                          (e.isConnected = !1), e.callback();
                        });
                    },
                  },
                  {
                    key: 'subscribe',
                    value: function(e) {
                      this.callback = e;
                    },
                  },
                  {
                    key: 'subscribeGameMetadata',
                    value: function(e) {
                      this.gameMetadataCallback = e;
                    },
                  },
                  {
                    key: 'updateGameID',
                    value: function(e) {
                      this.gameID = this.gameName + ':' + e;
                      var t = Y(null);
                      this.store.dispatch(t),
                        this.socket &&
                          this.socket.emit(
                            'sync',
                            this.gameID,
                            this.playerID,
                            this.numPlayers
                          );
                    },
                  },
                  {
                    key: 'updatePlayerID',
                    value: function(e) {
                      this.playerID = e;
                      var t = Y(null);
                      this.store.dispatch(t),
                        this.socket &&
                          this.socket.emit(
                            'sync',
                            this.gameID,
                            this.playerID,
                            this.numPlayers
                          );
                    },
                  },
                ]),
                e
              );
            })(),
            be = (function() {
              function e() {
                u(this, e), (this.games = new Map());
              }
              return (
                d(e, [
                  { key: 'connect', value: function() {} },
                  {
                    key: 'set',
                    value: function(e, t) {
                      return this.games.set(e, t);
                    },
                  },
                  {
                    key: 'get',
                    value: function(e) {
                      return this.games.get(e);
                    },
                  },
                  {
                    key: 'has',
                    value: function(e) {
                      return this.games.has(e);
                    },
                  },
                  {
                    key: 'remove',
                    value: function(e) {
                      this.games.has(e) && this.games.delete(e);
                    },
                  },
                  {
                    key: 'list',
                    value: function() {
                      return P(this.games.keys());
                    },
                  },
                ]),
                e
              );
            })();
          function xe(e) {
            var t = e.game,
              n = e.numPlayers,
              r = e.setupData;
            n || (n = 2);
            var o = (t = ve(t)).flow.ctx(n),
              i = t.seed;
            void 0 === i && (i = de.seed()),
              (o._random = { seed: i }),
              (o = re.setup(o, t));
            var s = new fe(o, t, o.currentPlayer),
              l = s.attachToContext(o),
              c = t.setup(l, r),
              u = {
                G: (c = ne.setup(c, l, t)),
                ctx: o,
                _undo: [],
                _redo: [],
                _stateID: 0,
                _initial: {},
              },
              p = t.flow.init({ G: u.G, ctx: l });
            (u.G = p.G),
              (u._undo = p._undo),
              (p = s.updateAndDetach(p, !0)),
              (u.ctx = p.ctx);
            var d;
            return (u._initial = ((d = u), a.parse(a.stringify(d)))), u;
          }
          var Ie = function(e, t, n) {
              return (
                !1 !== n.undoable &&
                (!(n.undoable instanceof Function) || n.undoable(e, t))
              );
            },
            Pe = 'INVALID_MOVE';
          function De(e) {
            var t = e.game,
              n = e.multiplayer;
            return (
              (t = ve(t)),
              function() {
                var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : null,
                  r = arguments.length > 1 ? arguments[1] : void 0;
                switch (r.type) {
                  case A:
                    if (((e = f({}, e, { deltalog: [] })), n)) return e;
                    if (void 0 !== e.ctx.gameover)
                      return S('cannot call event after game end'), e;
                    if (
                      null !== r.payload.playerID &&
                      void 0 !== r.payload.playerID &&
                      !t.flow.isPlayerActive(e.G, e.ctx, r.payload.playerID)
                    )
                      return S('disallowed event: '.concat(r.payload.type)), e;
                    var a = new fe(e.ctx, t, r.payload.playerID);
                    e.ctx = a.attachToContext(e.ctx);
                    var o = t.flow.processEvent(e, r);
                    return f({}, (o = a.updateAndDetach(o, !0)), {
                      _stateID: e._stateID + 1,
                    });
                  case G:
                    e = f({}, e, { deltalog: [] });
                    var i = t.flow.getMove(
                      e.ctx,
                      r.payload.type,
                      r.payload.playerID || e.ctx.currentPlayer
                    );
                    if (null === i)
                      return S('disallowed move: '.concat(r.payload.type)), e;
                    if (n && !1 === i.optimistic) return e;
                    if (void 0 !== e.ctx.gameover)
                      return S('cannot make move after game end'), e;
                    if (
                      null !== r.payload.playerID &&
                      void 0 !== r.payload.playerID &&
                      !t.flow.isPlayerActive(e.G, e.ctx, r.payload.playerID)
                    )
                      return S('disallowed move: '.concat(r.payload.type)), e;
                    var s = new fe(e.ctx, t, r.payload.playerID),
                      l = s.attachToContext(e.ctx),
                      c = t.processMove(e.G, r.payload, l);
                    if (c === Pe) return e;
                    var u = {
                      action: r,
                      _stateID: e._stateID,
                      turn: e.ctx.turn,
                      phase: e.ctx.phase,
                    };
                    !0 === i.redact && (u.redact = !0);
                    var p = s.updateAndDetach(f({}, e, { deltalog: [u] }), !1),
                      d = p.ctx;
                    return n &&
                      void 0 !== d._random &&
                      void 0 !== d._random.prngstate
                      ? e
                      : ((e = f({}, p, {
                          G: c,
                          ctx: d,
                          _stateID: e._stateID + 1,
                        })),
                        n
                          ? e
                          : ((l = s.attachToContext(e.ctx)),
                            (e = t.flow.processMove(
                              f({}, e, { ctx: l }),
                              r.payload
                            )),
                            (e = s.updateAndDetach(e, !0))));
                  case T:
                  case q:
                  case R:
                    return r.state;
                  case j:
                    var m = e,
                      h = m._undo,
                      y = m._redo;
                    if (h.length < 2) return e;
                    var v = h[h.length - 1],
                      g = h[h.length - 2],
                      b = t.flow.getMove(
                        e.ctx,
                        v.moveType,
                        e.ctx.currentPlayer
                      );
                    return Ie(e.G, e.ctx, b)
                      ? f({}, e, {
                          G: g.G,
                          ctx: g.ctx,
                          _undo: h.slice(0, h.length - 1),
                          _redo: [v].concat(P(y)),
                        })
                      : e;
                  case L:
                    var x = e,
                      I = x._undo,
                      D = x._redo;
                    if (0 == D.length) return e;
                    var k = D[0];
                    return f({}, e, {
                      G: k.G,
                      ctx: k.ctx,
                      _undo: [].concat(P(I), [k]),
                      _redo: D.slice(1),
                    });
                  default:
                    return e;
                }
              }
            );
          }
          var ke = function(e) {
            return ''.concat(e, ':metadata');
          };
          function Ee(e, t) {
            return void 0 === e
              ? e
              : e.map(function(e) {
                  if (null !== t && +t == +e.action.payload.playerID) return e;
                  if (!0 !== e.redact) return e;
                  var n = f({}, e.action.payload, { args: null }),
                    r = f({}, e, { action: f({}, e.action, { payload: n }) });
                  r.redact;
                  return b(r, ['redact']);
                });
          }
          var we = function(e) {
              var t = e.action,
                n = e.gameMetadata,
                r = e.playerID;
              return (
                !n ||
                (!Object.keys(n.players).some(function(e) {
                  return !(!n.players[e] || !n.players[e].credentials);
                }) ||
                  (!!t.payload &&
                    (!!t.payload.credentials &&
                      t.payload.credentials === n.players[r].credentials)))
              );
            },
            _e = (function() {
              function e(t, n, r, a) {
                u(this, e),
                  (this.game = ve(t)),
                  (this.storageAPI = n),
                  (this.transportAPI = r),
                  (this.auth = function() {
                    return !0;
                  }),
                  !0 === a
                    ? (this.auth = we)
                    : 'function' == typeof a && (this.auth = a);
              }
              return (
                d(e, [
                  {
                    key: 'onUpdate',
                    value: async function(e, t, n, r) {
                      var a,
                        i = this;
                      if (this.executeSynchronously) {
                        var s = this.storageAPI.get(ke(n));
                        a = this.auth({
                          action: e,
                          gameMetadata: s,
                          gameID: n,
                          playerID: r,
                        });
                      } else {
                        var l = await this.storageAPI.get(ke(n));
                        a = this.auth({
                          action: e,
                          gameMetadata: l,
                          gameID: n,
                          playerID: r,
                        });
                      }
                      if (!a) return { error: 'unauthorized action' };
                      var c,
                        u = n;
                      if (
                        void 0 ===
                        (c = this.executeSynchronously
                          ? this.storageAPI.get(u)
                          : await this.storageAPI.get(u))
                      )
                        return (
                          S('game not found, gameID=['.concat(u, ']')),
                          { error: 'game not found' }
                        );
                      if (void 0 === c.ctx.gameover) {
                        var p = De({
                            game: this.game,
                            numPlayers: c.ctx.numPlayers,
                          }),
                          d = o.createStore(p, c);
                        if (
                          (e.type != j && e.type != L) ||
                          (c.ctx.currentPlayer === r &&
                            null === c.ctx.activePlayers)
                        )
                          if (this.game.flow.isPlayerActive(c.G, c.ctx, r))
                            if (
                              e.type != G ||
                              this.game.flow.getMove(c.ctx, e.payload.type, r)
                            )
                              if (c._stateID === t) {
                                var m = d.getState().log || [];
                                d.dispatch(e),
                                  (c = d.getState()),
                                  this.transportAPI.sendAll(function(e) {
                                    var t = f({}, c, {
                                        G: i.game.playerView(c.G, c.ctx, e),
                                        ctx: f({}, c.ctx, { _random: void 0 }),
                                        log: void 0,
                                        deltalog: void 0,
                                        _undo: [],
                                        _redo: [],
                                        _initial: f({}, c._initial, {
                                          _undo: [],
                                          _redo: [],
                                        }),
                                      }),
                                      r = Ee(c.deltalog, e);
                                    return { type: 'update', args: [n, t, r] };
                                  }),
                                  (m = [].concat(P(m), P(c.deltalog)));
                                var h = f({}, c, { log: m });
                                this.executeSynchronously
                                  ? this.storageAPI.set(u, h)
                                  : await this.storageAPI.set(u, h);
                              } else
                                S(
                                  'invalid stateID, was=['
                                    .concat(t, '], expected=[')
                                    .concat(c._stateID, ']')
                                );
                            else
                              S(
                                'move not processed - canPlayerMakeMove=false, playerID=['.concat(
                                  r,
                                  ']'
                                )
                              );
                          else
                            S('player not active - playerID=['.concat(r, ']'));
                        else
                          S(
                            'playerID=['.concat(
                              r,
                              '] cannot undo / redo right now'
                            )
                          );
                      } else S('game over - gameID=['.concat(u, ']'));
                    },
                  },
                  {
                    key: 'onSync',
                    value: async function(e, t, n) {
                      var r,
                        a,
                        o,
                        i = e;
                      this.executeSynchronously
                        ? ((r = this.storageAPI.get(i)),
                          (a = this.storageAPI.get(ke(e))))
                        : ((r = await this.storageAPI.get(i)),
                          (a = await this.storageAPI.get(ke(e)))),
                        a &&
                          (o = Object.values(a.players).map(function(e) {
                            return { id: e.id, name: e.name };
                          })),
                        void 0 === r &&
                          ((r = xe({ game: this.game, numPlayers: n })),
                          this.executeSynchronously
                            ? (this.storageAPI.set(i, r),
                              (r = this.storageAPI.get(i)))
                            : (await this.storageAPI.set(i, r),
                              (r = await this.storageAPI.get(i))));
                      var s = f({}, r, {
                          G: this.game.playerView(r.G, r.ctx, t),
                          ctx: f({}, r.ctx, { _random: void 0 }),
                          log: void 0,
                          deltalog: void 0,
                          _undo: [],
                          _redo: [],
                          _initial: f({}, r._initial, { _undo: [], _redo: [] }),
                        }),
                        l = Ee(r.log, t);
                      this.transportAPI.send({
                        playerID: t,
                        type: 'sync',
                        args: [e, s, l, o],
                      });
                    },
                  },
                ]),
                e
              );
            })();
          function Ce(e) {
            var t = {},
              n = function(e) {
                var n = e.type,
                  r = e.playerID,
                  a = e.args,
                  o = t[r];
                void 0 !== o && o.apply(null, [n].concat(P(a)));
              },
              r = new _e(
                e,
                new be(),
                {
                  send: n,
                  sendAll: function(e) {
                    for (var r in t) {
                      var a = e(r),
                        o = a.type,
                        i = a.args;
                      n({ type: o, playerID: r, args: i });
                    }
                  },
                },
                !1
              );
            return (
              (r.executeSynchronously = !0),
              (r.connect = function(e, n, r) {
                t[n] = r;
              }),
              r
            );
          }
          var Ne = (function() {
              function e(t) {
                var n = t.master,
                  r = t.store,
                  a = t.gameID,
                  o = t.playerID,
                  i = t.gameName,
                  s = t.numPlayers;
                u(this, e),
                  (this.master = n),
                  (this.store = r),
                  (this.gameName = i || 'default'),
                  (this.gameID = a || 'default'),
                  (this.playerID = o || null),
                  (this.numPlayers = s || 2),
                  (this.gameID = this.gameName + ':' + this.gameID),
                  (this.isConnected = !0);
              }
              return (
                d(e, [
                  {
                    key: 'onUpdate',
                    value: function(e, t, n) {
                      var r = this.store.getState();
                      if (e == this.gameID && t._stateID >= r._stateID) {
                        var a = W(t, n);
                        this.store.dispatch(a);
                      }
                    },
                  },
                  {
                    key: 'onSync',
                    value: function(e, t, n) {
                      if (e == this.gameID) {
                        var r = K(t, n);
                        this.store.dispatch(r);
                      }
                    },
                  },
                  {
                    key: 'onAction',
                    value: function(e, t) {
                      this.master.onUpdate(
                        t,
                        e._stateID,
                        this.gameID,
                        this.playerID
                      );
                    },
                  },
                  {
                    key: 'connect',
                    value: function() {
                      var e = this;
                      this.master.connect(this.gameID, this.playerID, function(
                        t
                      ) {
                        for (
                          var n = arguments.length,
                            r = new Array(n > 1 ? n - 1 : 0),
                            a = 1;
                          a < n;
                          a++
                        )
                          r[a - 1] = arguments[a];
                        'sync' == t && e.onSync.apply(e, r),
                          'update' == t && e.onUpdate.apply(e, r);
                      }),
                        this.master.onSync(
                          this.gameID,
                          this.playerID,
                          this.numPlayers
                        );
                    },
                  },
                  { key: 'subscribe', value: function() {} },
                  { key: 'subscribeGameMetadata', value: function(e) {} },
                  {
                    key: 'updateGameID',
                    value: function(e) {
                      this.gameID = this.gameName + ':' + e;
                      var t = Y(null);
                      this.store.dispatch(t),
                        this.master.onSync(
                          this.gameID,
                          this.playerID,
                          this.numPlayers
                        );
                    },
                  },
                  {
                    key: 'updatePlayerID',
                    value: function(e) {
                      this.playerID = e;
                      var t = Y(null);
                      this.store.dispatch(t),
                        this.master.onSync(
                          this.gameID,
                          this.playerID,
                          this.numPlayers
                        );
                    },
                  },
                ]),
                e
              );
            })(),
            Se = null;
          function Oe(e, t, n, r, a, o) {
            return t.reduce(function(t, i) {
              return (
                (t[i] = function() {
                  var t = r;
                  o || null != r || (t = n.getState().ctx.currentPlayer);
                  for (
                    var s = arguments.length, l = new Array(s), c = 0;
                    c < s;
                    c++
                  )
                    l[c] = arguments[c];
                  n.dispatch(Z[e](i, l, t, a));
                }),
                t
              );
            }, {});
          }
          var Me = Oe.bind(null, 'gameEvent'),
            Ge = Oe.bind(null, 'makeMove'),
            Ae = (function() {
              function e(t) {
                var n = this,
                  r = t.game,
                  a = t.ai,
                  i = t.numPlayers,
                  s = t.multiplayer,
                  l = t.socketOpts,
                  c = t.gameID,
                  p = t.playerID,
                  d = t.credentials,
                  m = t.enhancer;
                if (
                  (u(this, e),
                  (this.game = ve(r)),
                  (this.playerID = p),
                  (this.gameID = c),
                  (this.credentials = d),
                  (this.multiplayer = s),
                  (this.subscribeCallback = function() {}),
                  (this.reducer = De({
                    game: this.game,
                    numPlayers: i,
                    multiplayer: s,
                  })),
                  void 0 !== a && void 0 === s)
                ) {
                  var h = new a.bot({ game: r, enumerate: a.enumerate });
                  this.step = async function() {
                    var e = n.store.getState(),
                      t = e.ctx.currentPlayer;
                    e.ctx.activePlayers &&
                      (t = Object.keys(e.ctx.activePlayers)[0]);
                    var r = await h.play(e, t),
                      a = r.action,
                      o = r.metadata;
                    return (
                      a && ((a.payload.metadata = o), n.store.dispatch(a)), a
                    );
                  };
                }
                var f = null;
                void 0 === s && (f = xe({ game: this.game, numPlayers: i })),
                  (this.reset = function() {
                    n.store.dispatch(Y(f));
                  }),
                  (this.undo = function() {
                    n.store.dispatch(Q());
                  }),
                  (this.redo = function() {
                    n.store.dispatch(X());
                  }),
                  (this.store = null),
                  (this.log = []);
                var y = function(e) {
                    return function(t) {
                      return function(r) {
                        var a = t(r),
                          o = e.getState();
                        switch (r.type) {
                          case G:
                          case A:
                            var i = o.deltalog;
                            n.log = [].concat(P(n.log), P(i));
                            break;
                          case T:
                            n.log = [];
                            break;
                          case q:
                            var s = -1;
                            n.log.length > 0 &&
                              (s = n.log[n.log.length - 1]._stateID);
                            var l = r.deltalog || [];
                            (l = l.filter(function(e) {
                              return e._stateID > s;
                            })),
                              (n.log = [].concat(P(n.log), P(l)));
                            break;
                          case R:
                            n.log = r.log || [];
                        }
                        return a;
                      };
                    };
                  },
                  v = function(e) {
                    return function(t) {
                      return function(r) {
                        var a = e.getState(),
                          o = t(r);
                        return (
                          1 != r.clientOnly && n.transport.onAction(a, r), o
                        );
                      };
                    };
                  },
                  g = function() {
                    return function(e) {
                      return function(t) {
                        var r = e(t);
                        return n.subscribeCallback(), r;
                      };
                    };
                  };
                (m =
                  void 0 !== m
                    ? o.compose(
                        o.applyMiddleware(g, v, y),
                        m
                      )
                    : o.applyMiddleware(g, v, y)),
                  (this.store = o.createStore(this.reducer, f, m)),
                  (this.transport = {
                    isConnected: !0,
                    onAction: function() {},
                    subscribe: function() {},
                    subscribeGameMetadata: function(e) {},
                    connect: function() {},
                    updateGameID: function() {},
                    updatePlayerID: function() {},
                  }),
                  void 0 !== s &&
                    (!0 === s && (s = { server: '' }),
                    !0 === s.local
                      ? ((null !== Se && Se.config === r) ||
                          ((Se = new Ce(this.game)).config = r),
                        (this.transport = new Ne({
                          master: Se,
                          store: this.store,
                          gameID: c,
                          playerID: p,
                          gameName: this.game.name,
                          numPlayers: i,
                        })))
                      : void 0 !== s.server
                      ? (this.transport = new ge({
                          store: this.store,
                          gameID: c,
                          playerID: p,
                          gameName: this.game.name,
                          numPlayers: i,
                          server: s.server,
                          socketOpts: l,
                        }))
                      : void 0 !== s.transport
                      ? (this.transport = new s.transport({
                          store: this.store,
                          gameID: c,
                          playerID: p,
                          gameName: r.name,
                          numPlayers: i,
                        }))
                      : S('invalid multiplayer spec')),
                  this.createDispatchers(),
                  this.transport.subscribeGameMetadata(function(e) {
                    n.gameMetadata = e;
                  });
              }
              return (
                d(e, [
                  {
                    key: 'subscribe',
                    value: function(e) {
                      var t = this,
                        n = function() {
                          return e(t.getState());
                        };
                      this.transport.subscribe(n), (this.subscribeCallback = n);
                    },
                  },
                  {
                    key: 'getState',
                    value: function() {
                      var e = this.store.getState();
                      if (null === e) return e;
                      var t = !0,
                        n = this.game.flow.isPlayerActive(
                          e.G,
                          e.ctx,
                          this.playerID
                        );
                      this.multiplayer && !n && (t = !1),
                        this.multiplayer ||
                          null === this.playerID ||
                          void 0 === this.playerID ||
                          n ||
                          (t = !1),
                        void 0 !== e.ctx.gameover && (t = !1);
                      var r = f({}, e, {
                        isActive: t,
                        G: this.game.playerView(e.G, e.ctx, this.playerID),
                        log: this.log,
                      });
                      return (r = f({}, r, {
                        isConnected: this.transport.isConnected,
                      }));
                    },
                  },
                  {
                    key: 'connect',
                    value: function() {
                      this.transport.connect();
                    },
                  },
                  {
                    key: 'createDispatchers',
                    value: function() {
                      (this.moves = Ge(
                        this.game.moveNames,
                        this.store,
                        this.playerID,
                        this.credentials,
                        this.multiplayer
                      )),
                        (this.events = Me(
                          this.game.flow.enabledEventNames,
                          this.store,
                          this.playerID,
                          this.credentials,
                          this.multiplayer
                        ));
                    },
                  },
                  {
                    key: 'updatePlayerID',
                    value: function(e) {
                      (this.playerID = e),
                        this.createDispatchers(),
                        this.transport.updatePlayerID(e);
                    },
                  },
                  {
                    key: 'updateGameID',
                    value: function(e) {
                      (this.gameID = e),
                        this.createDispatchers(),
                        this.transport.updateGameID(e);
                    },
                  },
                  {
                    key: 'updateCredentials',
                    value: function(e) {
                      (this.credentials = e), this.createDispatchers();
                    },
                  },
                ]),
                e
              );
            })();
          function Le(e) {
            var r,
              a,
              o = e.game,
              i = e.numPlayers,
              s = e.loading,
              l = e.board,
              p = e.multiplayer,
              h = e.ai,
              g = e.debug,
              P = e.enhancer;
            if (void 0 === s) {
              s = function() {
                return t.createElement(
                  'div',
                  { className: 'bgio-loading' },
                  'connecting...'
                );
              };
            }
            return (
              (a = r = (function(e) {
                function n(e) {
                  var t, r;
                  return (
                    u(this, n),
                    m(x((t = I(this, v(n).call(this, e)))), 'state', {
                      gameStateOverride: null,
                    }),
                    m(x(t), 'updateGameID', function(e) {
                      t.client.updateGameID(e), (t.gameID = e), t.forceUpdate();
                    }),
                    m(x(t), 'updatePlayerID', function(e) {
                      t.client.updatePlayerID(e),
                        (t.playerID = e),
                        t.forceUpdate();
                    }),
                    m(x(t), 'updateCredentials', function(e) {
                      t.client.updateCredentials(e),
                        (t.credentials = e),
                        t.forceUpdate();
                    }),
                    m(x(t), 'overrideGameState', function(e) {
                      t.setState({ gameStateOverride: e });
                    }),
                    (t.client =
                      ((r = {
                        game: o,
                        ai: h,
                        numPlayers: i,
                        multiplayer: p,
                        gameID: e.gameID,
                        playerID: e.playerID,
                        credentials: e.credentials,
                        enhancer: P,
                      }),
                      new Ae(r))),
                    (t.gameID = e.gameID),
                    (t.playerID = e.playerID),
                    (t.credentials = e.credentials),
                    t.client.subscribe(function() {
                      return t.forceUpdate();
                    }),
                    t
                  );
                }
                return (
                  y(n, t.Component),
                  d(n, [
                    {
                      key: 'componentDidUpdate',
                      value: function(e) {
                        this.props.gameID != e.gameID &&
                          this.updateGameID(this.props.gameID),
                          this.props.playerID != e.playerID &&
                            this.updatePlayerID(this.props.playerID),
                          this.props.credentials != e.credentials &&
                            this.updateCredentials(this.props.credentials);
                      },
                    },
                    {
                      key: 'componentDidMount',
                      value: function() {
                        this.client.connect();
                      },
                    },
                    {
                      key: 'render',
                      value: function() {
                        var e = null,
                          n = null,
                          r = this.client.getState(),
                          a = this.props,
                          o = a.debug,
                          i = b(a, ['debug']);
                        if (
                          (this.state.gameStateOverride &&
                            (r = f({}, r, {}, this.state.gameStateOverride)),
                          null === r)
                        )
                          return t.createElement(s);
                        if (
                          (l &&
                            (e = t.createElement(
                              l,
                              f({}, r, {}, i, {
                                isMultiplayer: void 0 !== p,
                                moves: this.client.moves,
                                events: this.client.events,
                                gameID: this.gameID,
                                playerID: this.playerID,
                                step: this.client.step,
                                reset: this.client.reset,
                                undo: this.client.undo,
                                redo: this.client.redo,
                                gameMetadata: this.client.gameMetadata,
                              })
                            )),
                          !1 !== g && o)
                        ) {
                          var u = 'object' === c(g) && g.showGameInfo,
                            d = 'object' === c(g) && g.dockControls;
                          n = t.createElement($, {
                            gamestate: r,
                            reducer: this.client.reducer,
                            store: this.client.store,
                            isMultiplayer: void 0 !== p,
                            moves: this.client.moves,
                            events: this.client.events,
                            gameID: this.gameID,
                            playerID: this.playerID,
                            credentials: this.credentials,
                            step: this.client.step,
                            reset: this.client.reset,
                            undo: this.client.undo,
                            redo: this.client.redo,
                            visualizeAI: h && h.visualize,
                            overrideGameState: this.overrideGameState,
                            updateGameID: this.updateGameID,
                            updatePlayerID: this.updatePlayerID,
                            updateCredentials: this.updateCredentials,
                            showGameInfo: u,
                            dockControls: d,
                          });
                        }
                        return t.createElement(
                          'div',
                          { className: 'bgio-client' },
                          n,
                          e
                        );
                      },
                    },
                  ]),
                  n
                );
              })()),
              m(r, 'propTypes', {
                gameID: n.string,
                playerID: n.string,
                credentials: n.string,
                debug: n.any,
              }),
              m(r, 'defaultProps', {
                gameID: 'default',
                playerID: null,
                credentials: null,
                debug: !0,
              }),
              a
            );
          }
          var Te = (function() {
            function e(t) {
              var n = t.server,
                r = t.gameComponents,
                a = t.playerName,
                o = t.playerCredentials;
              u(this, e),
                (this.gameComponents = r),
                (this.playerName = a || 'Visitor'),
                (this.playerCredentials = o),
                (this.server = n),
                (this.rooms = []);
            }
            return (
              d(e, [
                {
                  key: '_baseUrl',
                  value: function() {
                    return ''.concat(this.server || '', '/games');
                  },
                },
                {
                  key: 'refresh',
                  value: async function() {
                    try {
                      this.rooms.length = 0;
                      var e = await fetch(this._baseUrl());
                      if (200 !== e.status)
                        throw new Error('HTTP status ' + e.status);
                      var t = await e.json(),
                        n = !0,
                        r = !1,
                        a = void 0;
                      try {
                        for (
                          var o, i = t[Symbol.iterator]();
                          !(n = (o = i.next()).done);
                          n = !0
                        ) {
                          var s = o.value;
                          if (this._getGameComponents(s)) {
                            var l = await fetch(this._baseUrl() + '/' + s),
                              c = await l.json(),
                              u = !0,
                              p = !1,
                              d = void 0;
                            try {
                              for (
                                var m, h = c.rooms[Symbol.iterator]();
                                !(u = (m = h.next()).done);
                                u = !0
                              ) {
                                m.value.gameName = s;
                              }
                            } catch (f) {
                              (p = !0), (d = f);
                            } finally {
                              try {
                                u || null == h.return || h.return();
                              } finally {
                                if (p) throw d;
                              }
                            }
                            this.rooms = this.rooms.concat(c.rooms);
                          }
                        }
                      } catch (f) {
                        (r = !0), (a = f);
                      } finally {
                        try {
                          n || null == i.return || i.return();
                        } finally {
                          if (r) throw a;
                        }
                      }
                    } catch (S) {
                      throw new Error(
                        'failed to retrieve list of games (' + S + ')'
                      );
                    }
                  },
                },
                {
                  key: '_getGameInstance',
                  value: function(e) {
                    var t = !0,
                      n = !1,
                      r = void 0;
                    try {
                      for (
                        var a, o = this.rooms[Symbol.iterator]();
                        !(t = (a = o.next()).done);
                        t = !0
                      ) {
                        var i = a.value;
                        if (i.gameID === e) return i;
                      }
                    } catch (s) {
                      (n = !0), (r = s);
                    } finally {
                      try {
                        t || null == o.return || o.return();
                      } finally {
                        if (n) throw r;
                      }
                    }
                  },
                },
                {
                  key: '_getGameComponents',
                  value: function(e) {
                    var t = !0,
                      n = !1,
                      r = void 0;
                    try {
                      for (
                        var a, o = this.gameComponents[Symbol.iterator]();
                        !(t = (a = o.next()).done);
                        t = !0
                      ) {
                        var i = a.value;
                        if (i.game.name === e) return i;
                      }
                    } catch (s) {
                      (n = !0), (r = s);
                    } finally {
                      try {
                        t || null == o.return || o.return();
                      } finally {
                        if (n) throw r;
                      }
                    }
                  },
                },
                {
                  key: '_findPlayer',
                  value: function(e) {
                    var t = !0,
                      n = !1,
                      r = void 0;
                    try {
                      for (
                        var a, o = this.rooms[Symbol.iterator]();
                        !(t = (a = o.next()).done);
                        t = !0
                      ) {
                        var i = a.value;
                        if (
                          i.players.some(function(t) {
                            return t.name === e;
                          })
                        )
                          return i;
                      }
                    } catch (s) {
                      (n = !0), (r = s);
                    } finally {
                      try {
                        t || null == o.return || o.return();
                      } finally {
                        if (n) throw r;
                      }
                    }
                  },
                },
                {
                  key: 'join',
                  value: async function(e, t, n) {
                    try {
                      var r = this._findPlayer(this.playerName);
                      if (r)
                        throw new Error(
                          'player has already joined ' + r.gameID
                        );
                      if (!(r = this._getGameInstance(t)))
                        throw new Error('game instance ' + t + ' not found');
                      var a = await fetch(
                        this._baseUrl() + '/' + e + '/' + t + '/join',
                        {
                          method: 'POST',
                          body: JSON.stringify({
                            playerID: n,
                            playerName: this.playerName,
                          }),
                          headers: { 'Content-Type': 'application/json' },
                        }
                      );
                      if (200 !== a.status)
                        throw new Error('HTTP status ' + a.status);
                      var o = await a.json();
                      (r.players[Number.parseInt(n)].name = this.playerName),
                        (this.playerCredentials = o.playerCredentials);
                    } catch (S) {
                      throw new Error(
                        'failed to join room ' + t + ' (' + S + ')'
                      );
                    }
                  },
                },
                {
                  key: 'leave',
                  value: async function(e, t) {
                    try {
                      var n = this._getGameInstance(t);
                      if (!n) throw new Error('game instance not found');
                      var r = !0,
                        a = !1,
                        o = void 0;
                      try {
                        for (
                          var i, s = n.players[Symbol.iterator]();
                          !(r = (i = s.next()).done);
                          r = !0
                        ) {
                          var l = i.value;
                          if (l.name === this.playerName) {
                            var c = await fetch(
                              this._baseUrl() + '/' + e + '/' + t + '/leave',
                              {
                                method: 'POST',
                                body: JSON.stringify({
                                  playerID: l.id,
                                  credentials: this.playerCredentials,
                                }),
                                headers: { 'Content-Type': 'application/json' },
                              }
                            );
                            if (200 !== c.status)
                              throw new Error('HTTP status ' + c.status);
                            return (
                              delete l.name, void delete this.playerCredentials
                            );
                          }
                        }
                      } catch (u) {
                        (a = !0), (o = u);
                      } finally {
                        try {
                          r || null == s.return || s.return();
                        } finally {
                          if (a) throw o;
                        }
                      }
                      throw new Error('player not found in room');
                    } catch (S) {
                      throw new Error(
                        'failed to leave room ' + t + ' (' + S + ')'
                      );
                    }
                  },
                },
                {
                  key: 'disconnect',
                  value: async function() {
                    var e = this._findPlayer(this.playerName);
                    e && (await this.leave(e.gameName, e.gameID)),
                      (this.rooms = []),
                      (this.playerName = 'Visitor');
                  },
                },
                {
                  key: 'create',
                  value: async function(e, t) {
                    try {
                      var n = this._getGameComponents(e);
                      if (!n) throw new Error('game not found');
                      if (t < n.game.minPlayers || t > n.game.maxPlayers)
                        throw new Error('invalid number of players ' + t);
                      var r = await fetch(
                        this._baseUrl() + '/' + e + '/create',
                        {
                          method: 'POST',
                          body: JSON.stringify({ numPlayers: t }),
                          headers: { 'Content-Type': 'application/json' },
                        }
                      );
                      if (200 !== r.status)
                        throw new Error('HTTP status ' + r.status);
                    } catch (S) {
                      throw new Error(
                        'failed to create room for ' + e + ' (' + S + ')'
                      );
                    }
                  },
                },
              ]),
              e
            );
          })();
          var Re = (function(e) {
            function n() {
              var e, t;
              u(this, n);
              for (
                var r = arguments.length, a = new Array(r), o = 0;
                o < r;
                o++
              )
                a[o] = arguments[o];
              return (
                m(
                  x((t = I(this, (e = v(n)).call.apply(e, [this].concat(a))))),
                  'state',
                  { playerName: t.props.playerName, nameErrorMsg: '' }
                ),
                m(x(t), 'onClickEnter', function() {
                  '' !== t.state.playerName &&
                    t.props.onEnter(t.state.playerName);
                }),
                m(x(t), 'onKeyPress', function(e) {
                  'Enter' === e.key && t.onClickEnter();
                }),
                m(x(t), 'onChangePlayerName', function(e) {
                  var n = e.target.value.trim();
                  t.setState({
                    playerName: n,
                    nameErrorMsg: n.length > 0 ? '' : 'empty player name',
                  });
                }),
                t
              );
            }
            return (
              y(n, t.Component),
              d(n, [
                {
                  key: 'render',
                  value: function() {
                    return t.createElement(
                      'div',
                      null,
                      t.createElement(
                        'p',
                        { className: 'phase-title' },
                        'Choose a player name:'
                      ),
                      t.createElement('input', {
                        type: 'text',
                        value: this.state.playerName,
                        onChange: this.onChangePlayerName,
                        onKeyPress: this.onKeyPress,
                      }),
                      t.createElement(
                        'span',
                        { className: 'buttons' },
                        t.createElement(
                          'button',
                          { className: 'buttons', onClick: this.onClickEnter },
                          'Enter'
                        )
                      ),
                      t.createElement('br', null),
                      t.createElement(
                        'span',
                        { className: 'error-msg' },
                        this.state.nameErrorMsg,
                        t.createElement('br', null)
                      )
                    );
                  },
                },
              ]),
              n
            );
          })();
          m(Re, 'propTypes', {
            playerName: n.string,
            onEnter: n.func.isRequired,
          }),
            m(Re, 'defaultProps', { playerName: '' });
          var je = (function(e) {
            function n() {
              var e, r;
              u(this, n);
              for (
                var a = arguments.length, o = new Array(a), i = 0;
                i < a;
                i++
              )
                o[i] = arguments[i];
              return (
                m(
                  x((r = I(this, (e = v(n)).call.apply(e, [this].concat(o))))),
                  '_createSeat',
                  function(e) {
                    return e.name || '[free]';
                  }
                ),
                m(x(r), '_createInstanceButtons', function(e) {
                  var n = e.players.find(function(e) {
                      return e.name === r.props.playerName;
                    }),
                    a = e.players.find(function(e) {
                      return !e.name;
                    });
                  return n && a
                    ? t.createElement(
                        'button',
                        {
                          onClick: function() {
                            return r.props.onClickLeave(e.gameName, e.gameID);
                          },
                        },
                        'Leave'
                      )
                    : a
                    ? t.createElement(
                        'button',
                        {
                          onClick: function() {
                            return r.props.onClickJoin(
                              e.gameName,
                              e.gameID,
                              '' + a.id
                            );
                          },
                        },
                        'Join'
                      )
                    : n
                    ? t.createElement(
                        'button',
                        {
                          onClick: function() {
                            return r.props.onClickPlay(e.gameName, {
                              gameID: e.gameID,
                              playerID: '' + n.id,
                              numPlayers: e.players.length,
                            });
                          },
                        },
                        'Play'
                      )
                    : t.createElement(
                        'button',
                        {
                          onClick: function() {
                            return r.props.onClickPlay(e.gameName, {
                              gameID: e.gameID,
                              numPlayers: e.players.length,
                            });
                          },
                        },
                        'Spectate'
                      );
                }),
                r
              );
            }
            return (
              y(n, t.Component),
              d(n, [
                {
                  key: 'render',
                  value: function() {
                    var e = this.props.room,
                      n = 'OPEN';
                    return (
                      e.players.find(function(e) {
                        return !e.name;
                      }) || (n = 'RUNNING'),
                      t.createElement(
                        'tr',
                        { key: 'line-' + e.gameID },
                        t.createElement(
                          'td',
                          { key: 'cell-name-' + e.gameID },
                          e.gameName
                        ),
                        t.createElement(
                          'td',
                          { key: 'cell-status-' + e.gameID },
                          n
                        ),
                        t.createElement(
                          'td',
                          { key: 'cell-seats-' + e.gameID },
                          e.players.map(this._createSeat).join(', ')
                        ),
                        t.createElement(
                          'td',
                          { key: 'cell-buttons-' + e.gameID },
                          this._createInstanceButtons(e)
                        )
                      )
                    );
                  },
                },
              ]),
              n
            );
          })();
          m(je, 'propTypes', {
            room: n.shape({
              gameName: n.string.isRequired,
              gameID: n.string.isRequired,
              players: n.array.isRequired,
            }),
            playerName: n.string.isRequired,
            onClickJoin: n.func.isRequired,
            onClickLeave: n.func.isRequired,
            onClickPlay: n.func.isRequired,
          });
          var qe = (function(e) {
            function n(e) {
              var r;
              u(this, n),
                m(x((r = I(this, v(n).call(this, e)))), 'state', {
                  selectedGame: 0,
                  numPlayers: 2,
                }),
                m(x(r), '_createGameNameOption', function(e, n) {
                  return t.createElement(
                    'option',
                    { key: 'name-option-' + n, value: n },
                    e.game.name
                  );
                }),
                m(x(r), '_createNumPlayersOption', function(e) {
                  return t.createElement(
                    'option',
                    { key: 'num-option-' + e, value: e },
                    e
                  );
                }),
                m(x(r), '_createNumPlayersRange', function(e) {
                  return P(new Array(e.maxPlayers + 1).keys()).slice(
                    e.minPlayers
                  );
                }),
                m(x(r), 'onChangeNumPlayers', function(e) {
                  r.setState({ numPlayers: Number.parseInt(e.target.value) });
                }),
                m(x(r), 'onChangeSelectedGame', function(e) {
                  var t = Number.parseInt(e.target.value);
                  r.setState({
                    selectedGame: t,
                    numPlayers: r.props.games[t].game.minPlayers,
                  });
                }),
                m(x(r), 'onClickCreate', function() {
                  r.props.createGame(
                    r.props.games[r.state.selectedGame].game.name,
                    r.state.numPlayers
                  );
                });
              var a = !0,
                o = !1,
                i = void 0;
              try {
                for (
                  var s, l = e.games[Symbol.iterator]();
                  !(a = (s = l.next()).done);
                  a = !0
                ) {
                  var c = s.value.game;
                  c.minPlayers || (c.minPlayers = 1),
                    c.maxPlayers || (c.maxPlayers = 4),
                    console.assert(c.maxPlayers >= c.minPlayers);
                }
              } catch (p) {
                (o = !0), (i = p);
              } finally {
                try {
                  a || null == l.return || l.return();
                } finally {
                  if (o) throw i;
                }
              }
              return (
                (r.state = {
                  selectedGame: 0,
                  numPlayers: e.games[0].game.minPlayers,
                }),
                r
              );
            }
            return (
              y(n, t.Component),
              d(n, [
                {
                  key: 'render',
                  value: function() {
                    var e = this;
                    return t.createElement(
                      'div',
                      null,
                      t.createElement(
                        'select',
                        {
                          value: this.state.selectedGame,
                          onChange: function(t) {
                            return e.onChangeSelectedGame(t);
                          },
                        },
                        this.props.games.map(this._createGameNameOption)
                      ),
                      t.createElement('span', null, 'Players:'),
                      t.createElement(
                        'select',
                        {
                          value: this.state.numPlayers,
                          onChange: this.onChangeNumPlayers,
                        },
                        this._createNumPlayersRange(
                          this.props.games[this.state.selectedGame].game
                        ).map(this._createNumPlayersOption)
                      ),
                      t.createElement(
                        'span',
                        { className: 'buttons' },
                        t.createElement(
                          'button',
                          { onClick: this.onClickCreate },
                          'Create'
                        )
                      )
                    );
                  },
                },
              ]),
              n
            );
          })();
          m(qe, 'propTypes', {
            games: n.array.isRequired,
            createGame: n.func.isRequired,
          });
          var Ue = { ENTER: 'enter', PLAY: 'play', LIST: 'list' },
            Be = (function(e) {
              function n(e) {
                var r;
                return (
                  u(this, n),
                  m(x((r = I(this, v(n).call(this, e)))), 'state', {
                    phase: Ue.ENTER,
                    playerName: 'Visitor',
                    runningGame: null,
                    errorMsg: '',
                    credentialStore: {},
                  }),
                  m(x(r), '_createConnection', function(e) {
                    var t,
                      n = r.state.playerName;
                    r.connection =
                      ((t = {
                        server: e.lobbyServer,
                        gameComponents: e.gameComponents,
                        playerName: n,
                        playerCredentials: r.state.credentialStore[n],
                      }),
                      new Te(t));
                  }),
                  m(x(r), '_updateCredentials', function(e, t) {
                    r.setState(function(n) {
                      var r = Object.assign({}, n.credentialStore);
                      return (r[[e]] = t), { credentialStore: r };
                    });
                  }),
                  m(x(r), '_updateConnection', async function() {
                    await r.connection.refresh(), r.forceUpdate();
                  }),
                  m(x(r), '_enterLobby', function(e) {
                    r.setState({ playerName: e, phase: Ue.LIST });
                  }),
                  m(x(r), '_exitLobby', async function() {
                    await r.connection.disconnect(),
                      r.setState({ phase: Ue.ENTER, errorMsg: '' });
                  }),
                  m(x(r), '_createRoom', async function(e, t) {
                    try {
                      await r.connection.create(e, t),
                        await r.connection.refresh(),
                        r.setState({});
                    } catch (S) {
                      r.setState({ errorMsg: S.message });
                    }
                  }),
                  m(x(r), '_joinRoom', async function(e, t, n) {
                    try {
                      await r.connection.join(e, t, n),
                        await r.connection.refresh(),
                        r._updateCredentials(
                          r.connection.playerName,
                          r.connection.playerCredentials
                        );
                    } catch (S) {
                      r.setState({ errorMsg: S.message });
                    }
                  }),
                  m(x(r), '_leaveRoom', async function(e, t) {
                    try {
                      await r.connection.leave(e, t),
                        await r.connection.refresh(),
                        r._updateCredentials(
                          r.connection.playerName,
                          r.connection.playerCredentials
                        );
                    } catch (S) {
                      r.setState({ errorMsg: S.message });
                    }
                  }),
                  m(x(r), '_startGame', function(e, t) {
                    var n = r.connection._getGameComponents(e);
                    if (n) {
                      var a = void 0;
                      t.numPlayers > 1 &&
                        (a = !r.props.gameServer || {
                          server: r.props.gameServer,
                        });
                      var o = {
                        app: r.props.clientFactory({
                          game: n.game,
                          board: n.board,
                          debug: r.props.debug,
                          multiplayer: a,
                        }),
                        gameID: t.gameID,
                        playerID: t.numPlayers > 1 ? t.playerID : null,
                        credentials: r.connection.playerCredentials,
                      };
                      r.setState({ phase: Ue.PLAY, runningGame: o });
                    } else r.setState({ errorMsg: 'game ' + e + ' not supported' });
                  }),
                  m(x(r), '_exitRoom', function() {
                    r.setState({ phase: Ue.LIST, runningGame: null });
                  }),
                  m(x(r), '_getPhaseVisibility', function(e) {
                    return r.state.phase !== e ? 'hidden' : 'phase';
                  }),
                  m(x(r), 'renderRooms', function(e, n) {
                    return e.map(function(e) {
                      var a = e.gameID,
                        o = e.gameName,
                        i = e.players;
                      return t.createElement(je, {
                        key: 'instance-' + a,
                        room: {
                          gameID: a,
                          gameName: o,
                          players: Object.values(i),
                        },
                        playerName: n,
                        onClickJoin: r._joinRoom,
                        onClickLeave: r._leaveRoom,
                        onClickPlay: r._startGame,
                      });
                    });
                  }),
                  r._createConnection(r.props),
                  r._updateConnection(),
                  r
                );
              }
              return (
                y(n, t.Component),
                d(n, [
                  {
                    key: 'componentDidMount',
                    value: function() {
                      var e = l.load('lobbyState') || {};
                      e.phase && e.phase === Ue.PLAY && (e.phase = Ue.LIST),
                        this.setState({
                          phase: e.phase || Ue.ENTER,
                          playerName: e.playerName || 'Visitor',
                          credentialStore: e.credentialStore || {},
                        });
                    },
                  },
                  {
                    key: 'componentDidUpdate',
                    value: function(e, t) {
                      var n = this.state.playerName,
                        r = this.state.credentialStore[n];
                      if (
                        t.phase !== this.state.phase ||
                        t.credentialStore[n] !== r ||
                        t.playerName !== n
                      ) {
                        this._createConnection(this.props),
                          this._updateConnection();
                        var a = {
                          phase: this.state.phase,
                          playerName: n,
                          credentialStore: this.state.credentialStore,
                        };
                        l.save('lobbyState', a, { path: '/' });
                      }
                    },
                  },
                  {
                    key: 'render',
                    value: function() {
                      var e = this.props,
                        n = e.gameComponents,
                        r = e.renderer,
                        a = this.state,
                        o = a.errorMsg,
                        i = a.playerName,
                        s = a.phase,
                        l = a.runningGame;
                      return r
                        ? r({
                            errorMsg: o,
                            gameComponents: n,
                            rooms: this.connection.rooms,
                            phase: s,
                            playerName: i,
                            runningGame: l,
                            handleEnterLobby: this._enterLobby,
                            handleExitLobby: this._exitLobby,
                            handleCreateRoom: this._createRoom,
                            handleJoinRoom: this._joinRoom,
                            handleLeaveRoom: this._leaveRoom,
                            handleExitRoom: this._exitRoom,
                            handleRefreshRooms: this._updateConnection,
                            handleStartGame: this._startGame,
                          })
                        : t.createElement(
                            'div',
                            { id: 'lobby-view', style: { padding: 50 } },
                            t.createElement(
                              'div',
                              { className: this._getPhaseVisibility(Ue.ENTER) },
                              t.createElement(Re, {
                                key: i,
                                playerName: i,
                                onEnter: this._enterLobby,
                              })
                            ),
                            t.createElement(
                              'div',
                              { className: this._getPhaseVisibility(Ue.LIST) },
                              t.createElement('p', null, 'Welcome, ', i),
                              t.createElement(
                                'div',
                                {
                                  className: 'phase-title',
                                  id: 'game-creation',
                                },
                                t.createElement('span', null, 'Create a room:'),
                                t.createElement(qe, {
                                  games: n,
                                  createGame: this._createRoom,
                                })
                              ),
                              t.createElement(
                                'p',
                                { className: 'phase-title' },
                                'Join a room:'
                              ),
                              t.createElement(
                                'div',
                                { id: 'instances' },
                                t.createElement(
                                  'table',
                                  null,
                                  t.createElement(
                                    'tbody',
                                    null,
                                    this.renderRooms(this.connection.rooms, i)
                                  )
                                ),
                                t.createElement(
                                  'span',
                                  { className: 'error-msg' },
                                  o,
                                  t.createElement('br', null)
                                )
                              ),
                              t.createElement(
                                'p',
                                { className: 'phase-title' },
                                'Rooms that become empty are automatically deleted.'
                              )
                            ),
                            t.createElement(
                              'div',
                              { className: this._getPhaseVisibility(Ue.PLAY) },
                              l &&
                                t.createElement(l.app, {
                                  gameID: l.gameID,
                                  playerID: l.playerID,
                                  credentials: l.credentials,
                                }),
                              t.createElement(
                                'div',
                                { className: 'buttons', id: 'game-exit' },
                                t.createElement(
                                  'button',
                                  { onClick: this._exitRoom },
                                  'Exit game'
                                )
                              )
                            ),
                            t.createElement(
                              'div',
                              { className: 'buttons', id: 'lobby-exit' },
                              t.createElement(
                                'button',
                                { onClick: this._exitLobby },
                                'Exit lobby'
                              )
                            )
                          );
                    },
                  },
                ]),
                n
              );
            })();
          m(Be, 'propTypes', {
            gameComponents: n.array.isRequired,
            lobbyServer: n.string,
            gameServer: n.string,
            debug: n.bool,
            clientFactory: n.func,
          }),
            m(Be, 'defaultProps', { debug: !1, clientFactory: Le }),
            (e.Client = Le),
            (e.Lobby = Be),
            Object.defineProperty(e, '__esModule', { value: !0 });
        });
      },
      {
        react: 'SAdv',
        'prop-types': 'yu5W',
        mousetrap: 'b2AJ',
        flatted: 'O5av',
        redux: '50OV',
        immer: 'SPuX',
        'socket.io-client': 'ToP9',
        'react-cookies': '6kpS',
      },
    ],
    YdaM: [
      function(require, module, exports) {
        var define;
        var global = arguments[3];
        var e,
          t = arguments[3];
        !(function(t, r) {
          'object' == typeof exports && 'undefined' != typeof module
            ? r(exports, require('immer'))
            : 'function' == typeof e && e.amd
            ? e(['exports', 'immer'], r)
            : r(((t = t || self).AI = {}), t.immer);
        })(this, function(e, t) {
          'use strict';
          function r(e) {
            return (r =
              'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function(e) {
                    return typeof e;
                  }
                : function(e) {
                    return e &&
                      'function' == typeof Symbol &&
                      e.constructor === Symbol &&
                      e !== Symbol.prototype
                      ? 'symbol'
                      : typeof e;
                  })(e);
          }
          function n(e, t) {
            if (!(e instanceof t))
              throw new TypeError('Cannot call a class as a function');
          }
          function a(e, t) {
            for (var r = 0; r < t.length; r++) {
              var n = t[r];
              (n.enumerable = n.enumerable || !1),
                (n.configurable = !0),
                'value' in n && (n.writable = !0),
                Object.defineProperty(e, n.key, n);
            }
          }
          function o(e, t, r) {
            return t && a(e.prototype, t), r && a(e, r), e;
          }
          function i(e, t, r) {
            return (
              t in e
                ? Object.defineProperty(e, t, {
                    value: r,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0,
                  })
                : (e[t] = r),
              e
            );
          }
          function u(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
              var n = Object.getOwnPropertySymbols(e);
              t &&
                (n = n.filter(function(t) {
                  return Object.getOwnPropertyDescriptor(e, t).enumerable;
                })),
                r.push.apply(r, n);
            }
            return r;
          }
          function c(e) {
            for (var t = 1; t < arguments.length; t++) {
              var r = null != arguments[t] ? arguments[t] : {};
              t % 2
                ? u(r, !0).forEach(function(t) {
                    i(e, t, r[t]);
                  })
                : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r)
                  )
                : u(r).forEach(function(t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t)
                    );
                  });
            }
            return e;
          }
          function s(e, t) {
            if ('function' != typeof t && null !== t)
              throw new TypeError(
                'Super expression must either be null or a function'
              );
            (e.prototype = Object.create(t && t.prototype, {
              constructor: { value: e, writable: !0, configurable: !0 },
            })),
              t && v(e, t);
          }
          function l(e) {
            return (l = Object.setPrototypeOf
              ? Object.getPrototypeOf
              : function(e) {
                  return e.__proto__ || Object.getPrototypeOf(e);
                })(e);
          }
          function v(e, t) {
            return (v =
              Object.setPrototypeOf ||
              function(e, t) {
                return (e.__proto__ = t), e;
              })(e, t);
          }
          function f(e, t) {
            if (null == e) return {};
            var r,
              n,
              a = (function(e, t) {
                if (null == e) return {};
                var r,
                  n,
                  a = {},
                  o = Object.keys(e);
                for (n = 0; n < o.length; n++)
                  (r = o[n]), t.indexOf(r) >= 0 || (a[r] = e[r]);
                return a;
              })(e, t);
            if (Object.getOwnPropertySymbols) {
              var o = Object.getOwnPropertySymbols(e);
              for (n = 0; n < o.length; n++)
                (r = o[n]),
                  t.indexOf(r) >= 0 ||
                    (Object.prototype.propertyIsEnumerable.call(e, r) &&
                      (a[r] = e[r]));
            }
            return a;
          }
          function p(e, t) {
            return !t || ('object' != typeof t && 'function' != typeof t)
              ? (function(e) {
                  if (void 0 === e)
                    throw new ReferenceError(
                      "this hasn't been initialised - super() hasn't been called"
                    );
                  return e;
                })(e)
              : t;
          }
          function d(e) {
            return (
              (function(e) {
                if (Array.isArray(e)) {
                  for (var t = 0, r = new Array(e.length); t < e.length; t++)
                    r[t] = e[t];
                  return r;
                }
              })(e) ||
              (function(e) {
                if (
                  Symbol.iterator in Object(e) ||
                  '[object Arguments]' === Object.prototype.toString.call(e)
                )
                  return Array.from(e);
              })(e) ||
              (function() {
                throw new TypeError(
                  'Invalid attempt to spread non-iterable instance'
                );
              })()
            );
          }
          t = t && t.hasOwnProperty('default') ? t.default : t;
          var y = 'MAKE_MOVE',
            h = 'GAME_EVENT',
            m = 'REDO',
            g = 'RESET',
            x = 'SYNC',
            P = 'UNDO',
            O = 'UPDATE',
            _ = [
              {
                fnWrap: function(e) {
                  return t(e);
                },
              },
            ],
            b = function(e, t) {
              var r = []
                .concat(_, d(t))
                .filter(function(e) {
                  return void 0 !== e.fnWrap;
                })
                .reduce(function(e, r) {
                  return (0, r.fnWrap)(e, t);
                }, e);
              return function(e, n) {
                (e = (function(e, t) {
                  return (
                    []
                      .concat(_, d(t))
                      .filter(function(e) {
                        return void 0 !== e.G;
                      })
                      .filter(function(e) {
                        return void 0 !== e.G.preMove;
                      })
                      .forEach(function(r) {
                        e = r.G.preMove(e, t);
                      }),
                    e
                  );
                })(e, t)),
                  (n = (function(e, t) {
                    return (
                      []
                        .concat(_, d(t))
                        .filter(function(e) {
                          return void 0 !== e.ctx;
                        })
                        .filter(function(e) {
                          return void 0 !== e.ctx.preMove;
                        })
                        .forEach(function(r) {
                          e = r.ctx.preMove(e, t);
                        }),
                      e
                    );
                  })(n, t));
                for (
                  var a = arguments.length,
                    o = new Array(a > 2 ? a - 2 : 0),
                    i = 2;
                  i < a;
                  i++
                )
                  o[i - 2] = arguments[i];
                return (e = (function(e, t) {
                  return (
                    []
                      .concat(_, d(t))
                      .filter(function(e) {
                        return void 0 !== e.G;
                      })
                      .filter(function(e) {
                        return void 0 !== e.G.postMove;
                      })
                      .forEach(function(r) {
                        e = r.G.postMove(e, t);
                      }),
                    e
                  );
                })((e = r.apply(void 0, [e, n].concat(o))), t));
              };
            },
            M = {
              setup: function(e, t, r) {
                return (
                  []
                    .concat(_, d(r.plugins))
                    .filter(function(e) {
                      return void 0 !== e.G;
                    })
                    .filter(function(e) {
                      return void 0 !== e.G.setup;
                    })
                    .forEach(function(n) {
                      e = n.G.setup(e, t, r);
                    }),
                  e
                );
              },
              onPhaseBegin: function(e, t, r) {
                return (
                  []
                    .concat(_, d(r))
                    .filter(function(e) {
                      return void 0 !== e.G;
                    })
                    .filter(function(e) {
                      return void 0 !== e.G.onPhaseBegin;
                    })
                    .forEach(function(n) {
                      e = n.G.onPhaseBegin(e, t, r);
                    }),
                  e
                );
              },
            },
            w = {
              setup: function(e, t) {
                return (
                  []
                    .concat(_, d(t.plugins))
                    .filter(function(e) {
                      return void 0 !== e.ctx;
                    })
                    .filter(function(e) {
                      return void 0 !== e.ctx.setup;
                    })
                    .forEach(function(r) {
                      e = r.ctx.setup(e, t);
                    }),
                  e
                );
              },
              onPhaseBegin: function(e, t) {
                return (
                  []
                    .concat(_, d(t))
                    .filter(function(e) {
                      return void 0 !== e.ctx;
                    })
                    .filter(function(e) {
                      return void 0 !== e.ctx.onPhaseBegin;
                    })
                    .forEach(function(r) {
                      e = r.ctx.onPhaseBegin(e, t);
                    }),
                  e
                );
              },
            },
            D = function() {};
          function I(e) {
            D('ERROR:', e);
          }
          function A(e, t) {
            return c({}, e, { ctx: k(e.ctx, t) });
          }
          function k(e, t) {
            var r = e._prevActivePlayers,
              n = t.next || null;
            r = t.revert
              ? r.concat({
                  activePlayers: e.activePlayers,
                  _activePlayersMoveLimit: e._activePlayersMoveLimit,
                  _activePlayersNumMoves: e._activePlayersNumMoves,
                })
              : [];
            var a = {};
            if (
              (t.value && (a = t.value),
              void 0 !== t.currentPlayer &&
                (a[e.currentPlayer] = t.currentPlayer),
              void 0 !== t.others)
            )
              for (var o = 0; o < e.playOrder.length; o++) {
                var i = e.playOrder[o];
                i !== e.currentPlayer && (a[i] = t.others);
              }
            if (void 0 !== t.all)
              for (var u = 0; u < e.playOrder.length; u++) {
                a[e.playOrder[u]] = t.all;
              }
            0 == Object.keys(a).length && (a = null);
            var s = null;
            if (a && t.moveLimit)
              if ('number' == typeof t.moveLimit)
                for (var l in ((s = {}), a)) s[l] = t.moveLimit;
              else if (
                ((s = {}),
                t.moveLimit.value && (s = t.moveLimit.value),
                void 0 !== t.moveLimit.currentPlayer &&
                  a[e.currentPlayer] &&
                  (s[e.currentPlayer] = t.moveLimit.currentPlayer),
                void 0 !== t.moveLimit.others)
              )
                for (var v in a)
                  v !== e.currentPlayer && (s[v] = t.moveLimit.others);
            var f = {};
            for (var p in a) f[p] = 0;
            return c({}, e, {
              activePlayers: a,
              _activePlayersMoveLimit: s,
              _activePlayersNumMoves: f,
              _prevActivePlayers: r,
              _nextActivePlayers: n,
            });
          }
          function j(e, t) {
            return e[t] + '';
          }
          var E = {
              DEFAULT: {
                first: function(e, t) {
                  return t.playOrderPos;
                },
                next: function(e, t) {
                  return (t.playOrderPos + 1) % t.playOrder.length;
                },
              },
              RESET: {
                first: function() {
                  return 0;
                },
                next: function(e, t) {
                  return (t.playOrderPos + 1) % t.playOrder.length;
                },
              },
              ONCE: {
                first: function() {
                  return 0;
                },
                next: function(e, t) {
                  if (t.playOrderPos < t.playOrder.length - 1)
                    return t.playOrderPos + 1;
                },
              },
              CUSTOM: function(e) {
                return {
                  playOrder: function() {
                    return e;
                  },
                  first: function() {
                    return 0;
                  },
                  next: function(e, t) {
                    return (t.playOrderPos + 1) % t.playOrder.length;
                  },
                };
              },
              CUSTOM_FROM: function(e) {
                return {
                  playOrder: function(t) {
                    return t[e];
                  },
                  first: function() {
                    return 0;
                  },
                  next: function(e, t) {
                    return (t.playOrderPos + 1) % t.playOrder.length;
                  },
                };
              },
              SKIP: {
                first: function(e, t) {
                  return t.playOrderPos;
                },
                next: function(e, t) {
                  if (!e.allPassed)
                    for (
                      var r = t.playOrderPos, n = 0;
                      n < t.playOrder.length;
                      n++
                    )
                      if (
                        ((r = (r + 1) % t.playOrder.length),
                        !e.passOrder.includes(t.playOrder[r] + ''))
                      )
                        return r;
                },
              },
            },
            G = { NULL: null },
            L = function(e, t, r, n) {
              return {
                type: y,
                payload: { type: e, args: t, playerID: r, credentials: n },
              };
            },
            S = function(e, t, r, n) {
              return {
                type: h,
                payload: { type: e, args: t, playerID: r, credentials: n },
              };
            };
          function N(e) {
            var t,
              r = this,
              n =
                ((t = 4022871197),
                function(e) {
                  e = e.toString();
                  for (var r = 0; r < e.length; r++) {
                    var n = 0.02519603282416938 * (t += e.charCodeAt(r));
                    (n -= t = n >>> 0),
                      (t = (n *= t) >>> 0),
                      (t += 4294967296 * (n -= t));
                  }
                  return 2.3283064365386963e-10 * (t >>> 0);
                });
            (r.next = function() {
              var e = 2091639 * r.s0 + 2.3283064365386963e-10 * r.c;
              return (r.s0 = r.s1), (r.s1 = r.s2), (r.s2 = e - (r.c = 0 | e));
            }),
              (r.c = 1),
              (r.s0 = n(' ')),
              (r.s1 = n(' ')),
              (r.s2 = n(' ')),
              (r.s0 -= n(e)),
              r.s0 < 0 && (r.s0 += 1),
              (r.s1 -= n(e)),
              r.s1 < 0 && (r.s1 += 1),
              (r.s2 -= n(e)),
              r.s2 < 0 && (r.s2 += 1),
              (n = null);
          }
          function T(e, t) {
            return (t.c = e.c), (t.s0 = e.s0), (t.s1 = e.s1), (t.s2 = e.s2), t;
          }
          function B(e, t) {
            var n = new N(e),
              a = t && t.state,
              o = n.next;
            return (
              (o.quick = o),
              a &&
                ('object' == r(a) && T(a, n),
                (o.state = function() {
                  return T(n, {});
                })),
              o
            );
          }
          var C = (function() {
            function e(t) {
              n(this, e), (this.state = t._random || { seed: '0' });
            }
            return (
              o(e, [
                {
                  key: 'update',
                  value: function(e) {
                    var t = c({}, e.ctx, { _random: this.state });
                    return c({}, e, { ctx: t });
                  },
                },
                {
                  key: 'attach',
                  value: function(e) {
                    return c({}, e, { random: this._api() });
                  },
                },
                {
                  key: '_random',
                  value: function() {
                    var e,
                      t = this.state,
                      r = (e =
                        void 0 === t.prngstate
                          ? new B(t.seed, { state: !0 })
                          : new B('', { state: t.prngstate }))();
                    return (this.state = c({}, t, { prngstate: e.state() })), r;
                  },
                },
                {
                  key: '_api',
                  value: function() {
                    var e = this._random.bind(this),
                      t = { D4: 4, D6: 6, D8: 8, D10: 10, D12: 12, D20: 20 },
                      r = {},
                      n = function(n) {
                        var a = t[n];
                        r[n] = function(t) {
                          return void 0 === t
                            ? Math.floor(e() * a) + 1
                            : d(new Array(t).keys()).map(function() {
                                return Math.floor(e() * a) + 1;
                              });
                        };
                      };
                    for (var a in t) n(a);
                    return c({}, r, {
                      Die: function(t, r) {
                        return (
                          void 0 === t && (t = 6),
                          void 0 === r
                            ? Math.floor(e() * t) + 1
                            : d(new Array(r).keys()).map(function() {
                                return Math.floor(e() * t) + 1;
                              })
                        );
                      },
                      Number: function() {
                        return e();
                      },
                      Shuffle: function(t) {
                        for (
                          var r = t.slice(0),
                            n = t.length,
                            a = 0,
                            o = new Array(n);
                          n;

                        ) {
                          var i = (n * e()) | 0;
                          (o[a++] = r[i]), (r[i] = r[--n]);
                        }
                        return o;
                      },
                    });
                  },
                },
              ]),
              e
            );
          })();
          (C.detach = function(e) {
            e.random;
            return f(e, ['random']);
          }),
            (C.seed = function() {
              return (+new Date()).toString(36).slice(-10);
            });
          var F = (function() {
            function e(t, r) {
              n(this, e),
                (this.flow = t),
                (this.playerID = r),
                (this.dispatch = []);
            }
            return (
              o(e, [
                {
                  key: 'attach',
                  value: function(e) {
                    var t = this,
                      r = {},
                      n = e.phase,
                      a = e.turn,
                      o = !0,
                      i = !1,
                      u = void 0;
                    try {
                      for (
                        var s,
                          l = function() {
                            var e = s.value;
                            r[e] = function() {
                              for (
                                var r = arguments.length,
                                  o = new Array(r),
                                  i = 0;
                                i < r;
                                i++
                              )
                                o[i] = arguments[i];
                              t.dispatch.push({
                                key: e,
                                args: o,
                                phase: n,
                                turn: a,
                              });
                            };
                          },
                          v = this.flow.eventNames[Symbol.iterator]();
                        !(o = (s = v.next()).done);
                        o = !0
                      )
                        l();
                    } catch (f) {
                      (i = !0), (u = f);
                    } finally {
                      try {
                        o || null == v.return || v.return();
                      } finally {
                        if (i) throw u;
                      }
                    }
                    return c({}, e, { events: r });
                  },
                },
                {
                  key: 'update',
                  value: function(e) {
                    for (
                      var t, r, n, a = this.dispatch.length, o = 0;
                      o < a;
                      o++
                    ) {
                      var i = this.dispatch[o];
                      if (
                        ('endTurn' !== i.key || i.turn === e.ctx.turn) &&
                        (('endPhase' !== i.key && 'setPhase' !== i.key) ||
                          i.phase === e.ctx.phase)
                      ) {
                        var u =
                          ((t = i.key),
                          (r = i.args),
                          (n = this.playerID),
                          {
                            type: h,
                            payload: {
                              type: t,
                              args: r,
                              playerID: n,
                              credentials: void 0,
                            },
                            automatic: !0,
                          });
                        e = c({}, e, {}, this.flow.processEvent(e, u));
                      }
                    }
                    return e;
                  },
                },
              ]),
              e
            );
          })();
          F.detach = function(e) {
            e.events;
            return f(e, ['events']);
          };
          var R = (function() {
              function e() {
                n(this, e), (this._payload = void 0);
              }
              return (
                o(
                  e,
                  [
                    {
                      key: '_api',
                      value: function() {
                        var e = this;
                        return {
                          setPayload: function(t) {
                            e._payload = t;
                          },
                        };
                      },
                    },
                    {
                      key: 'attach',
                      value: function(e) {
                        return c({}, e, { log: this._api() });
                      },
                    },
                    {
                      key: 'update',
                      value: function(e) {
                        if (void 0 === this._payload) return e;
                        var t = e.deltalog;
                        return (
                          (t[t.length - 1] = c({}, t[t.length - 1], {
                            payload: this._payload,
                          })),
                          (this._payload = void 0),
                          c({}, e, { deltalog: t })
                        );
                      },
                    },
                  ],
                  [
                    {
                      key: 'detach',
                      value: function(e) {
                        e.log;
                        return f(e, ['log']);
                      },
                    },
                  ]
                ),
                e
              );
            })(),
            U = (function() {
              function e(t, r, a) {
                n(this, e),
                  (this.random = new C(t)),
                  (this.events = new F(r.flow, a)),
                  (this.log = new R());
              }
              return (
                o(
                  e,
                  [
                    {
                      key: 'attachToContext',
                      value: function(e) {
                        var t = this.random.attach(e);
                        return (
                          (t = this.events.attach(t)), (t = this.log.attach(t))
                        );
                      },
                    },
                    {
                      key: '_update',
                      value: function(e, t) {
                        var r = t ? this.events.update(e) : e;
                        return (
                          (r = this.random.update(r)), (r = this.log.update(r))
                        );
                      },
                    },
                    {
                      key: 'updateAndDetach',
                      value: function(t, r) {
                        var n = this._update(t, r);
                        return (n.ctx = e.detachAllFromContext(n.ctx)), n;
                      },
                    },
                  ],
                  [
                    {
                      key: 'detachAllFromContext',
                      value: function(e) {
                        var t = C.detach(e);
                        return (t = F.detach(t)), (t = R.detach(t));
                      },
                    },
                  ]
                ),
                e
              );
            })();
          function V(e) {
            var t = e.moves,
              r = e.phases,
              n = e.endIf,
              a = e.turn,
              o = e.events,
              i = e.plugins;
            void 0 === t && (t = {}),
              void 0 === o && (o = {}),
              void 0 === i && (i = []),
              void 0 === r && (r = {}),
              n || (n = function() {}),
              a || (a = {});
            var u = c({}, r);
            '' in u && I('cannot specify phase with empty name'), (u[''] = {});
            var s = {},
              l = new Set(),
              v = null;
            for (var p in (Object.keys(t).forEach(function(e) {
              return l.add(e);
            }),
            u)) {
              var y = u[p];
              if ((!0 === y.start && (v = p), void 0 !== y.moves))
                for (var h = 0, m = Object.keys(y.moves); h < m.length; h++) {
                  var g = m[h];
                  (s[p + '.' + g] = y.moves[g]), l.add(g);
                }
              for (var x in (void 0 === y.endIf && (y.endIf = function() {}),
              void 0 === y.onBegin &&
                (y.onBegin = function(e) {
                  return e;
                }),
              (y.onBegin = b(y.onBegin, i)),
              void 0 === y.onEnd &&
                (y.onEnd = function(e) {
                  return e;
                }),
              (y.onEnd = b(y.onEnd, i)),
              void 0 === y.turn && (y.turn = a),
              void 0 === y.turn.order && (y.turn.order = E.DEFAULT),
              void 0 === y.turn.onBegin &&
                (y.turn.onBegin = function(e) {
                  return e;
                }),
              void 0 === y.turn.onEnd &&
                (y.turn.onEnd = function(e) {
                  return e;
                }),
              void 0 === y.turn.endIf &&
                (y.turn.endIf = function() {
                  return !1;
                }),
              void 0 === y.turn.onMove &&
                (y.turn.onMove = function(e) {
                  return e;
                }),
              void 0 === y.turn.stages && (y.turn.stages = {}),
              y.turn.stages))
                for (
                  var P = y.turn.stages[x].moves || {},
                    O = 0,
                    _ = Object.keys(P);
                  O < _.length;
                  O++
                ) {
                  var D = _[O];
                  (s[p + '.' + x + '.' + D] = P[D]), l.add(D);
                }
              (y.turn.onMove = b(y.turn.onMove, i)),
                (y.turn.onBegin = b(y.turn.onBegin, i)),
                (y.turn.onEnd = b(y.turn.onEnd, i));
            }
            function L(e) {
              return e.phase ? u[e.phase] : u[''];
            }
            function N(e) {
              return e;
            }
            function T(e, t) {
              for (var r = new Set(), n = new Set(), a = 0; a < t.length; a++) {
                var o = t[a],
                  i = o.fn,
                  u = o.arg,
                  s = f(o, ['fn', 'arg']);
                if (i === Y) {
                  n.clear();
                  var l = e.ctx.phase;
                  if (r.has(l)) {
                    var v = c({}, e.ctx, { phase: null });
                    return c({}, e, { ctx: v });
                  }
                  r.add(l);
                }
                var p = [];
                if (((e = i(e, c({}, s, { arg: u, next: p }))), i === H)) break;
                var d = W(e);
                if (d)
                  t.push({
                    fn: H,
                    arg: d,
                    turn: e.ctx.turn,
                    phase: e.ctx.phase,
                    automatic: !0,
                  });
                else {
                  var y = z(e);
                  if (y)
                    t.push({
                      fn: Y,
                      arg: y,
                      turn: e.ctx.turn,
                      phase: e.ctx.phase,
                      automatic: !0,
                    });
                  else {
                    if (i === N) {
                      var h = K(e);
                      if (h) {
                        t.push({
                          fn: J,
                          arg: h,
                          turn: e.ctx.turn,
                          phase: e.ctx.phase,
                          automatic: !0,
                        });
                        continue;
                      }
                    }
                    t.push.apply(t, p);
                  }
                }
              }
              return e;
            }
            function B(e, t) {
              return t.next.push({ fn: C }), e;
            }
            function C(e, t) {
              var r = t.next,
                n = e.G,
                a = e.ctx,
                o = L(a);
              return (
                (n = M.onPhaseBegin(n, a, i)),
                (a = w.onPhaseBegin(a, i)),
                (n = o.onBegin(n, a)),
                r.push({ fn: F }),
                c({}, e, { G: n, ctx: a })
              );
            }
            function F(e, t) {
              var r = t.currentPlayer,
                n = e.G,
                a = e.ctx,
                o = L(a);
              return (
                r
                  ? ((a = c({}, a, { currentPlayer: r })),
                    o.turn.activePlayers && (a = k(a, o.turn.activePlayers)))
                  : (a = (function(e, t, r) {
                      var n = r.order,
                        a = d(new Array(t.numPlayers)).map(function(e, t) {
                          return t + '';
                        });
                      void 0 !== n.playOrder && (a = n.playOrder(e, t));
                      var o = n.first(e, t);
                      return (t = k(
                        (t = c({}, t, {
                          currentPlayer: j(a, o),
                          playOrderPos: o,
                          playOrder: a,
                        })),
                        r.activePlayers || {}
                      ));
                    })(n, a, o.turn)),
                (n = o.turn.onBegin(n, a)),
                (a = c({}, a, {
                  turn: a.turn + 1,
                  numMoves: 0,
                  _prevActivePlayers: [],
                })),
                c({}, e, {
                  G: n,
                  ctx: a,
                  _undo: [{ G: n, ctx: U.detachAllFromContext(a) }],
                  _redo: [],
                })
              );
            }
            function R(e, t) {
              var r = t.arg,
                n = t.next,
                a = L({ phase: t.phase }),
                o = e.ctx;
              if (r && r.next) {
                if (!(r.next in u)) return I('invalid phase: ' + r.next), e;
                o = c({}, o, { phase: r.next });
              } else o = void 0 !== a.next ? c({}, o, { phase: a.next }) : c({}, o, { phase: null });
              return (e = c({}, e, { ctx: o })), n.push({ fn: C }), e;
            }
            function V(e, t) {
              var r = t.arg,
                n = t.currentPlayer,
                a = t.next,
                o = e,
                i = o.G,
                u = o.ctx,
                s = L(u),
                l = (function(e, t, r, n) {
                  var a = r.order,
                    o = t.playOrderPos,
                    i = t.currentPlayer,
                    u = !1;
                  if (n && !0 !== n)
                    t.playOrder.includes(n.next)
                      ? ((o = t.playOrder.indexOf(n.next)), (i = n.next))
                      : I('invalid argument to endTurn: '.concat(n));
                  else {
                    var s = a.next(e, t);
                    void 0 === s
                      ? (u = !0)
                      : ((o = s), (i = j(t.playOrder, o)));
                  }
                  return {
                    endPhase: u,
                    ctx: (t = c({}, t, { playOrderPos: o, currentPlayer: i })),
                  };
                })(i, c({}, u, { currentPlayer: n }), s.turn, r),
                v = l.endPhase;
              return (
                (e = c({}, e, { G: i, ctx: (u = l.ctx) })),
                v
                  ? a.push({ fn: Y, turn: u.turn, phase: u.phase })
                  : a.push({ fn: F, currentPlayer: u.currentPlayer }),
                e
              );
            }
            function q(e, t) {
              var r = t.arg,
                n = t.playerID;
              'string' == typeof r && (r = { stage: r });
              var a = e.ctx,
                o = a,
                i = o.activePlayers,
                u = o._activePlayersMoveLimit,
                s = o._activePlayersNumMoves;
              return (
                r.stage &&
                  (null === i && (i = {}),
                  (i[n] = r.stage),
                  (s[n] = 0),
                  r.moveLimit &&
                    (null === u && (u = {}), (u[n] = r.moveLimit))),
                (a = c({}, a, {
                  activePlayers: i,
                  _activePlayersMoveLimit: u,
                  _activePlayersNumMoves: s,
                })),
                c({}, e, { ctx: a })
              );
            }
            function W(e) {
              var t = e.G,
                r = e.ctx;
              return n(t, r);
            }
            function z(e) {
              var t = e.G,
                r = e.ctx;
              return L(r).endIf(t, r);
            }
            function K(e) {
              var t = e.G,
                r = e.ctx,
                n = L(r),
                a = r.numMoves || 0;
              return (
                !!(n.turn.moveLimit && a >= n.turn.moveLimit) ||
                n.turn.endIf(t, r)
              );
            }
            function H(e, t) {
              var r = t.arg;
              return (
                void 0 === r && (r = !0),
                c({}, (e = Y(e, { phase: t.phase })), {
                  ctx: c({}, e.ctx, { gameover: r }),
                })
              );
            }
            function Y(e, t) {
              var r = t.arg,
                n = t.next,
                a = t.turn,
                o = t.automatic,
                i = (e = J(e, { turn: a, force: !0 })).G,
                u = e.ctx;
              if (
                (n && n.push({ fn: R, arg: r, phase: u.phase }),
                null === u.phase)
              )
                return e;
              (i = L(u).onEnd(i, u)), (u = c({}, u, { phase: null }));
              var s = {
                action: S('endPhase', r),
                _stateID: e._stateID,
                turn: e.ctx.turn,
                phase: e.ctx.phase,
              };
              return (
                o && (s.automatic = !0),
                c({}, e, {
                  G: i,
                  ctx: u,
                  deltalog: [].concat(d(e.deltalog), [s]),
                })
              );
            }
            function J(e, t) {
              var r = t.arg,
                n = t.next,
                a = t.turn,
                o = t.force,
                i = t.automatic;
              if (a !== e.ctx.turn) return e;
              var u = e.G,
                s = e.ctx,
                l = L(s),
                v = s.numMoves || 0;
              if (!o && l.turn.moveLimit && v < l.turn.moveLimit) return e;
              (u = l.turn.onEnd(u, s)),
                n && n.push({ fn: V, arg: r, currentPlayer: s.currentPlayer }),
                (s = c({}, s, { activePlayers: null }));
              var f = {
                action: S('endTurn', r),
                _stateID: e._stateID,
                turn: e.ctx.turn,
                phase: e.ctx.phase,
              };
              return (
                i && (f.automatic = !0),
                c({}, e, {
                  G: u,
                  ctx: s,
                  deltalog: [].concat(d(e.deltalog || []), [f]),
                  _undo: [],
                  _redo: [],
                })
              );
            }
            function Q(e, t) {
              var r = t.arg,
                n = t.next,
                a = t.automatic,
                o = t.playerID;
              o = o || e.ctx.currentPlayer;
              var i = e.ctx,
                u = i,
                s = u.activePlayers,
                l = u._activePlayersMoveLimit;
              if (
                (n && r && n.push({ fn: q, arg: r, playerID: o }),
                null === s || !(o in s))
              )
                return e;
              (s = Object.keys(s)
                .filter(function(e) {
                  return e !== o;
                })
                .reduce(function(e, t) {
                  return (e[t] = s[t]), e;
                }, {})),
                l &&
                  (l = Object.keys(l)
                    .filter(function(e) {
                      return e !== o;
                    })
                    .reduce(function(e, t) {
                      return (e[t] = l[t]), e;
                    }, {})),
                (i = (function(e) {
                  var t = e,
                    r = t.activePlayers,
                    n = t._activePlayersMoveLimit,
                    a = t._activePlayersNumMoves,
                    o = t._prevActivePlayers;
                  if (r && 0 == Object.keys(r).length)
                    if (e._nextActivePlayers) {
                      var i = (e = k(e, e._nextActivePlayers));
                      (r = i.activePlayers),
                        (n = i._activePlayersMoveLimit),
                        (a = i._activePlayersNumMoves),
                        (o = i._prevActivePlayers);
                    } else if (o.length > 0) {
                      var u = o.length - 1,
                        s = o[u];
                      (r = s.activePlayers),
                        (n = s._activePlayersMoveLimit),
                        (a = s._activePlayersNumMoves),
                        (o = o.slice(0, u));
                    } else (r = null), (n = null);
                  return c({}, e, {
                    activePlayers: r,
                    _activePlayersMoveLimit: n,
                    _activePlayersNumMoves: a,
                    _prevActivePlayers: o,
                  });
                })(c({}, i, { activePlayers: s, _activePlayersMoveLimit: l })));
              var v = {
                action: S('endStage', r),
                _stateID: e._stateID,
                turn: e.ctx.turn,
                phase: e.ctx.phase,
              };
              return (
                a && (v.automatic = !0),
                c({}, e, {
                  ctx: i,
                  deltalog: [].concat(d(e.deltalog || []), [v]),
                })
              );
            }
            var X = {
                endStage: function(e) {
                  return T(e, [{ fn: Q }]);
                },
                setStage: function(e, t) {
                  return T(e, [{ fn: Q, arg: t }]);
                },
                endTurn: function(e, t) {
                  return T(e, [
                    { fn: J, turn: e.ctx.turn, phase: e.ctx.phase, arg: t },
                  ]);
                },
                endPhase: function(e) {
                  return T(e, [
                    { fn: Y, phase: e.ctx.phase, turn: e.ctx.turn },
                  ]);
                },
                setPhase: function(e, t) {
                  return T(e, [
                    {
                      fn: Y,
                      phase: e.ctx.phase,
                      turn: e.ctx.turn,
                      arg: { next: t },
                    },
                  ]);
                },
                endGame: function(e, t) {
                  return T(e, [
                    { fn: H, turn: e.ctx.turn, phase: e.ctx.phase, arg: t },
                  ]);
                },
                setActivePlayers: A,
              },
              Z = [];
            return (
              !1 !== o.endTurn && Z.push('endTurn'),
              !1 !== o.endPhase && Z.push('endPhase'),
              !1 !== o.setPhase && Z.push('setPhase'),
              !1 !== o.endGame && Z.push('endGame'),
              !1 !== o.setActivePlayers && Z.push('setActivePlayers'),
              !1 !== o.endStage && Z.push('endStage'),
              !1 !== o.setStage && Z.push('setStage'),
              {
                ctx: function(e) {
                  return {
                    numPlayers: e,
                    turn: 0,
                    currentPlayer: '0',
                    playOrder: d(new Array(e)).map(function(e, t) {
                      return t + '';
                    }),
                    playOrderPos: 0,
                    phase: v,
                    activePlayers: null,
                  };
                },
                init: function(e) {
                  return T(e, [{ fn: B }]);
                },
                isPlayerActive: function(e, t, r) {
                  return t.activePlayers
                    ? r in t.activePlayers
                    : t.currentPlayer === r;
                },
                eventHandlers: X,
                eventNames: Object.keys(X),
                enabledEventNames: Z,
                moveMap: s,
                moveNames: d(l.values()),
                processMove: function(e, t) {
                  var r = L(e.ctx),
                    n = e.ctx,
                    a = n._activePlayersNumMoves,
                    o = t.playerID;
                  n.activePlayers && a[o]++;
                  var i = e.ctx.numMoves;
                  o == e.ctx.currentPlayer && i++,
                    (e = c({}, e, {
                      ctx: c({}, n, { numMoves: i, _activePlayersNumMoves: a }),
                    })),
                    n._activePlayersMoveLimit &&
                      a[o] >= n._activePlayersMoveLimit[o] &&
                      (e = Q(e, { playerID: o, automatic: !0 }));
                  var u =
                      (e = c({}, e, { G: r.turn.onMove(e.G, e.ctx, t) }))
                        ._undo || [],
                    s = t.type,
                    l = U.detachAllFromContext(e.ctx);
                  return T(
                    (e = c({}, e, {
                      _undo: [].concat(d(u), [{ G: e.G, ctx: l, moveType: s }]),
                      _redo: [],
                    })),
                    [{ fn: N }]
                  );
                },
                processEvent: function(e, t) {
                  var r = t.payload;
                  if (X.hasOwnProperty(r.type)) {
                    var n = { playerID: r.playerID },
                      a = [e].concat(r.args);
                    return X[r.type].apply(n, a);
                  }
                  return e;
                },
                getMove: function(e, r, n) {
                  var a = L(e),
                    o = a.turn.stages,
                    i = e.activePlayers;
                  if (
                    i &&
                    void 0 !== i[n] &&
                    i[n] !== G.NULL &&
                    void 0 !== o[i[n]] &&
                    void 0 !== o[i[n]].moves
                  ) {
                    var u = o[i[n]].moves;
                    if (r in u) return u[r];
                  } else if (a.moves) {
                    if (r in a.moves) return a.moves[r];
                  } else if (r in t) return t[r];
                  return null;
                },
              }
            );
          }
          var q = function(e, t, r) {
              return (
                !1 !== r.undoable &&
                (!(r.undoable instanceof Function) || r.undoable(e, t))
              );
            },
            W = 'INVALID_MOVE';
          function z(e) {
            var t = e.game,
              r = e.multiplayer;
            return (
              (t = (function(e) {
                if (e.processMove) return e;
                void 0 === e.name && (e.name = 'default'),
                  void 0 === e.setup &&
                    (e.setup = function() {
                      return {};
                    }),
                  void 0 === e.moves && (e.moves = {}),
                  void 0 === e.playerView &&
                    (e.playerView = function(e) {
                      return e;
                    }),
                  void 0 === e.plugins && (e.plugins = []);
                var t = V(e);
                return c({}, e, {
                  flow: t,
                  moveNames: t.moveNames,
                  processMove: function(r, n, a) {
                    var o = t.getMove(a, n.type, n.playerID);
                    if (
                      (o instanceof Object && o.move && (o = o.move),
                      o instanceof Function)
                    ) {
                      var i = [r, c({}, a, { playerID: n.playerID })].concat(
                        n.args
                      );
                      return b(o, e.plugins).apply(void 0, d(i));
                    }
                    return r;
                  },
                });
              })(t)),
              function() {
                var e =
                    arguments.length > 0 && void 0 !== arguments[0]
                      ? arguments[0]
                      : null,
                  n = arguments.length > 1 ? arguments[1] : void 0;
                switch (n.type) {
                  case h:
                    if (((e = c({}, e, { deltalog: [] })), r)) return e;
                    if (void 0 !== e.ctx.gameover)
                      return I('cannot call event after game end'), e;
                    if (
                      null !== n.payload.playerID &&
                      void 0 !== n.payload.playerID &&
                      !t.flow.isPlayerActive(e.G, e.ctx, n.payload.playerID)
                    )
                      return I('disallowed event: '.concat(n.payload.type)), e;
                    var a = new U(e.ctx, t, n.payload.playerID);
                    e.ctx = a.attachToContext(e.ctx);
                    var o = t.flow.processEvent(e, n);
                    return c({}, (o = a.updateAndDetach(o, !0)), {
                      _stateID: e._stateID + 1,
                    });
                  case y:
                    e = c({}, e, { deltalog: [] });
                    var i = t.flow.getMove(
                      e.ctx,
                      n.payload.type,
                      n.payload.playerID || e.ctx.currentPlayer
                    );
                    if (null === i)
                      return I('disallowed move: '.concat(n.payload.type)), e;
                    if (r && !1 === i.optimistic) return e;
                    if (void 0 !== e.ctx.gameover)
                      return I('cannot make move after game end'), e;
                    if (
                      null !== n.payload.playerID &&
                      void 0 !== n.payload.playerID &&
                      !t.flow.isPlayerActive(e.G, e.ctx, n.payload.playerID)
                    )
                      return I('disallowed move: '.concat(n.payload.type)), e;
                    var u = new U(e.ctx, t, n.payload.playerID),
                      s = u.attachToContext(e.ctx),
                      l = t.processMove(e.G, n.payload, s);
                    if (l === W) return e;
                    var v = {
                      action: n,
                      _stateID: e._stateID,
                      turn: e.ctx.turn,
                      phase: e.ctx.phase,
                    };
                    !0 === i.redact && (v.redact = !0);
                    var f = u.updateAndDetach(c({}, e, { deltalog: [v] }), !1),
                      p = f.ctx;
                    return r &&
                      void 0 !== p._random &&
                      void 0 !== p._random.prngstate
                      ? e
                      : ((e = c({}, f, {
                          G: l,
                          ctx: p,
                          _stateID: e._stateID + 1,
                        })),
                        r
                          ? e
                          : ((s = u.attachToContext(e.ctx)),
                            (e = t.flow.processMove(
                              c({}, e, { ctx: s }),
                              n.payload
                            )),
                            (e = u.updateAndDetach(e, !0))));
                  case g:
                  case O:
                  case x:
                    return n.state;
                  case P:
                    var _ = e,
                      b = _._undo,
                      M = _._redo;
                    if (b.length < 2) return e;
                    var w = b[b.length - 1],
                      D = b[b.length - 2],
                      A = t.flow.getMove(
                        e.ctx,
                        w.moveType,
                        e.ctx.currentPlayer
                      );
                    return q(e.G, e.ctx, A)
                      ? c({}, e, {
                          G: D.G,
                          ctx: D.ctx,
                          _undo: b.slice(0, b.length - 1),
                          _redo: [w].concat(d(M)),
                        })
                      : e;
                  case m:
                    var k = e,
                      j = k._undo,
                      E = k._redo;
                    if (0 == E.length) return e;
                    var G = E[0];
                    return c({}, e, {
                      G: G.G,
                      ctx: G.ctx,
                      _undo: [].concat(d(j), [G]),
                      _redo: E.slice(1),
                    });
                  default:
                    return e;
                }
              }
            );
          }
          var K = (function() {
              function e(t) {
                var r = this,
                  a = t.enumerate,
                  o = t.seed;
                n(this, e),
                  i(this, 'enumerate', function(e, t, n) {
                    return r.enumerateFn(e, t, n).map(function(e) {
                      return void 0 !== e.payload
                        ? e
                        : void 0 !== e.move
                        ? L(e.move, e.args, n)
                        : void 0 !== e.event
                        ? S(e.event, e.args, n)
                        : void 0;
                    });
                  }),
                  (this.enumerateFn = a),
                  (this.seed = o);
              }
              return (
                o(e, [
                  {
                    key: 'random',
                    value: function(e) {
                      var t;
                      if (void 0 !== this.seed) {
                        var r = null;
                        (t = (r = this.prngstate
                          ? new B('', { state: this.prngstate })
                          : new B(this.seed, { state: !0 }))()),
                          (this.prngstate = r.state());
                      } else t = Math.random();
                      return e
                        ? e.length
                          ? e[Math.floor(t * e.length)]
                          : Math.floor(t * e)
                        : t;
                    },
                  },
                ]),
                e
              );
            })(),
            H = (function(e) {
              function t() {
                return n(this, t), p(this, l(t).apply(this, arguments));
              }
              return (
                s(t, K),
                o(t, [
                  {
                    key: 'play',
                    value: function(e, t) {
                      var r = e.G,
                        n = e.ctx,
                        a = this.enumerate(r, n, t);
                      return { action: this.random(a) };
                    },
                  },
                ]),
                t
              );
            })(),
            Y = (function(e) {
              function t(e) {
                var r,
                  a = e.enumerate,
                  o = e.seed,
                  i = e.objectives,
                  u = e.game,
                  c = e.iterations,
                  s = e.playoutDepth;
                return (
                  n(this, t),
                  void 0 === i &&
                    (i = function() {
                      return {};
                    }),
                  ((r = p(
                    this,
                    l(t).call(this, { enumerate: a, seed: o })
                  )).objectives = i),
                  (r.reducer = z({ game: u })),
                  (r.iterations = c || 1e3),
                  (r.playoutDepth = s || 50),
                  r
                );
              }
              return (
                s(t, K),
                o(t, [
                  {
                    key: 'createNode',
                    value: function(e) {
                      var t = e.state,
                        r = e.parentAction,
                        n = e.parent,
                        a = e.playerID,
                        o = t.G,
                        i = t.ctx,
                        u = [],
                        c = [];
                      if (void 0 !== a)
                        (u = this.enumerate(o, i, a)),
                          (c = this.objectives(o, i, a));
                      else if (i.activePlayers)
                        for (var s in i.activePlayers)
                          (u = u.concat(this.enumerate(o, i, s))),
                            (c = c.concat(this.objectives(o, i, s)));
                      else
                        (u = u.concat(this.enumerate(o, i, i.currentPlayer))),
                          (c = c.concat(
                            this.objectives(o, i, i.currentPlayer)
                          ));
                      return {
                        state: t,
                        parent: n,
                        parentAction: r,
                        actions: u,
                        objectives: c,
                        children: [],
                        visits: 0,
                        value: 0,
                      };
                    },
                  },
                  {
                    key: 'select',
                    value: function(e) {
                      if (e.actions.length > 0) return e;
                      if (0 == e.children.length) return e;
                      var t = null,
                        r = 0,
                        n = !0,
                        a = !1,
                        o = void 0;
                      try {
                        for (
                          var i, u = e.children[Symbol.iterator]();
                          !(n = (i = u.next()).done);
                          n = !0
                        ) {
                          var c = i.value,
                            s = c.visits + Number.EPSILON,
                            l =
                              c.value / s +
                              Math.sqrt((2 * Math.log(e.visits)) / s);
                          (null == t || l > r) && ((r = l), (t = c));
                        }
                      } catch (v) {
                        (a = !0), (o = v);
                      } finally {
                        try {
                          n || null == u.return || u.return();
                        } finally {
                          if (a) throw o;
                        }
                      }
                      return this.select(t);
                    },
                  },
                  {
                    key: 'expand',
                    value: function(e) {
                      var t = e.actions;
                      if (0 == t.length || void 0 !== e.state.ctx.gameover)
                        return e;
                      var r = this.random(t.length),
                        n = t[r];
                      e.actions.splice(r, 1);
                      var a = this.reducer(e.state, n),
                        o = this.createNode({
                          state: a,
                          parentAction: n,
                          parent: e,
                        });
                      return e.children.push(o), o;
                    },
                  },
                  {
                    key: 'playout',
                    value: function(e) {
                      for (
                        var t = this,
                          n = e.state,
                          a = function(e) {
                            var r = n,
                              a = r.G,
                              o = r.ctx,
                              i = o.currentPlayer;
                            o.activePlayers &&
                              (i = Object.keys(o.activePlayers)[0]);
                            var u = t.enumerate(a, o, i),
                              c = t.objectives(a, o),
                              s = Object.keys(c).reduce(function(e, t) {
                                var r = c[t];
                                return r.checker(a, o) ? e + r.weight : e;
                              }, 0);
                            if (s > 0) return { v: { score: s } };
                            if (!u || 0 == u.length) return { v: void 0 };
                            var l = t.random(u.length),
                              v = t.reducer(n, u[l]);
                            n = v;
                          },
                          o = 0;
                        o < this.playoutDepth && void 0 === n.ctx.gameover;
                        o++
                      ) {
                        var i = a();
                        if ('object' === r(i)) return i.v;
                      }
                      return n.ctx.gameover;
                    },
                  },
                  {
                    key: 'backpropagate',
                    value: function(e) {
                      var t =
                        arguments.length > 1 && void 0 !== arguments[1]
                          ? arguments[1]
                          : {};
                      e.visits++,
                        void 0 !== t.score && (e.value += t.score),
                        !0 === t.draw && (e.value += 0.5),
                        e.parentAction &&
                          t.winner === e.parentAction.payload.playerID &&
                          e.value++,
                        e.parent && this.backpropagate(e.parent, t);
                    },
                  },
                  {
                    key: 'play',
                    value: function(e, t) {
                      for (
                        var r = this.createNode({ state: e, playerID: t }),
                          n = 0;
                        n < this.iterations;
                        n++
                      ) {
                        var a = this.select(r),
                          o = this.expand(a),
                          i = this.playout(o);
                        this.backpropagate(o, i);
                      }
                      var u = null,
                        c = !0,
                        s = !1,
                        l = void 0;
                      try {
                        for (
                          var v, f = r.children[Symbol.iterator]();
                          !(c = (v = f.next()).done);
                          c = !0
                        ) {
                          var p = v.value;
                          (null == u || p.visits > u.visits) && (u = p);
                        }
                      } catch (d) {
                        (s = !0), (l = d);
                      } finally {
                        try {
                          c || null == f.return || f.return();
                        } finally {
                          if (s) throw l;
                        }
                      }
                      return { action: u && u.parentAction, metadata: r };
                    },
                  },
                ]),
                t
              );
            })();
          (e.AI = function(e) {
            var t = e.bot,
              r = e.enumerate,
              n = e.visualize;
            return t || (t = Y), { bot: t, enumerate: r, visualize: n };
          }),
            (e.MCTSBot = Y),
            (e.RandomBot = H),
            Object.defineProperty(e, '__esModule', { value: !0 });
        });
      },
      { immer: 'SPuX' },
    ],
    yqkG: [
      function(require, module, exports) {
        'use strict';
        var e = n(require('react')),
          t = n(require('react-dom')),
          l = require('boardgame.io/react'),
          r = require('boardgame.io/ai');
        function n(e) {
          return e && e.__esModule ? e : { default: e };
        }
        function i(e) {
          const t = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
          ];
          for (let l of t) {
            const t = e[l[0]];
            let r = t;
            for (let n of l)
              if (e[n] != t) {
                r = null;
                break;
              }
            if (null != r) return !0;
          }
          return !1;
        }
        const o = {
          setup: () => ({ cells: Array(9).fill(null) }),
          moves: {
            clickCell(e, t, l) {
              null === e.cells[l] && (e.cells[l] = t.currentPlayer);
            },
          },
          turn: { moveLimit: 1 },
          endIf: (e, t) =>
            i(e.cells)
              ? { winner: t.currentPlayer }
              : 0 == e.cells.filter(e => null === e).length
              ? { draw: !0 }
              : void 0,
        };
        class s extends e.default.Component {
          onClick(e) {
            this.isActive(e) &&
              (this.props.moves.clickCell(e), this.props.events.endTurn());
          }
          isActive(e) {
            return this.props.isActive && null == this.props.G.cells[e];
          }
          render() {
            let t = '';
            this.props.ctx.gameover &&
              (t =
                void 0 !== this.props.ctx.gameover.winner
                  ? e.default.createElement(
                      'div',
                      { id: 'winner' },
                      'Winner: ',
                      this.props.ctx.gameover.winner
                    )
                  : e.default.createElement('div', { id: 'winner' }, 'Draw!'));
            const l = {
              cursor: 'pointer',
              border: '1px solid #555',
              width: '50px',
              height: '50px',
              lineHeight: '50px',
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '20px',
              fontWeight: 'bold',
            };
            let r = [];
            for (let n = 0; n < 3; n++) {
              let t = [];
              for (let r = 0; r < 3; r++) {
                const i = 3 * n + r;
                t.push(
                  e.default.createElement(
                    'td',
                    { style: l, key: i, onClick: () => this.onClick(i) },
                    this.props.G.cells[i]
                  )
                );
              }
              r.push(e.default.createElement('tr', { key: n }, t));
            }
            return e.default.createElement(
              'div',
              null,
              e.default.createElement(
                'table',
                { id: 'board' },
                e.default.createElement('tbody', null, r)
              ),
              t
            );
          }
        }
        var a = (0, l.Client)({
          board: s,
          game: o,
          debug: { showGameInfo: !1 },
          ai: (0, r.AI)({
            enumerate: (e, t) => {
              let l = [];
              for (let r = 0; r < 9; r++)
                null === e.cells[r] && l.push({ move: 'clickCell', args: [r] });
              return l;
            },
          }),
        });
        t.default.render(
          e.default.createElement(a, null),
          document.getElementById('app')
        );
      },
      {
        react: '1n8/',
        'react-dom': 'NKHc',
        'boardgame.io/react': 'nBOz',
        'boardgame.io/ai': 'YdaM',
      },
    ],
  },
  {},
  ['yqkG'],
  null
);
