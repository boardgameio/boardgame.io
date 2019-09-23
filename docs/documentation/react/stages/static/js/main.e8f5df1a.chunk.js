(window.webpackJsonp = window.webpackJsonp || []).push([
  [0],
  {
    24: function(e, t, a) {},
    50: function(e, t, a) {
      e.exports = a(90);
    },
    61: function(e, t, a) {},
    83: function(e, t) {},
    88: function(e, t, a) {},
    90: function(e, t, a) {
      'use strict';
      a.r(t);
      var n = {};
      a.r(n),
        a.d(n, 'makeMove', function() {
          return K;
        }),
        a.d(n, 'gameEvent', function() {
          return z;
        }),
        a.d(n, 'automaticGameEvent', function() {
          return W;
        }),
        a.d(n, 'sync', function() {
          return Y;
        }),
        a.d(n, 'update', function() {
          return Q;
        }),
        a.d(n, 'reset', function() {
          return X;
        }),
        a.d(n, 'undo', function() {
          return Z;
        }),
        a.d(n, 'redo', function() {
          return $;
        });
      var r = a(8),
        s = a.n(r),
        i = a(47),
        c = a(5),
        o = a(6),
        l = a(11),
        u = a(10),
        p = a(12),
        v = a(4),
        m = a(14),
        d = a(1),
        h = a(3),
        f = a(0),
        y = a.n(f),
        b = a(2),
        g = a.n(b),
        O = a(9),
        j = a.n(O),
        x = a(13),
        k = a(15),
        P = a.n(k);
      var I = function(e) {
        return y.a.createElement(
          'div',
          { className: 'gameinfo-item' },
          y.a.createElement('strong', null, e.name, ' '),
          y.a.createElement('div', null, JSON.stringify(e.value))
        );
      };
      I.propTypes = { name: g.a.string.isRequired, value: g.a.any };
      var E = function(e) {
        return y.a.createElement(
          'section',
          { className: 'gameinfo' },
          y.a.createElement(I, { name: 'gameID', value: e.gameID }),
          y.a.createElement(I, { name: 'playerID', value: e.playerID }),
          y.a.createElement(I, { name: 'isActive', value: e.isActive }),
          e.isMultiplayer &&
            y.a.createElement(
              'span',
              null,
              y.a.createElement(I, {
                name: 'isConnected',
                value: e.isConnected,
              }),
              y.a.createElement(I, {
                name: 'isMultiplayer',
                value: e.isMultiplayer,
              })
            )
        );
      };
      E.propTypes = {
        gameID: g.a.string,
        playerID: g.a.string,
        isActive: g.a.bool,
        isConnected: g.a.bool,
        isMultiplayer: g.a.bool,
      };
      a(24);
      var D = (function(e) {
        function t() {
          var e, a;
          Object(c.a)(this, t);
          for (var n = arguments.length, r = new Array(n), s = 0; s < n; s++)
            r[s] = arguments[s];
          return (
            (a = Object(l.a)(
              this,
              (e = Object(u.a)(t)).call.apply(e, [this].concat(r))
            )),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'state', { active: !1 }),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'deactivate', function() {
              a.setState({ active: !1 });
            }),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'activate', function() {
              a.setState({ active: !0 }),
                a.props.onPress &&
                  (a.props.onPress(), a.setState({ active: !1 }));
            }),
            a
          );
        }
        return (
          Object(p.a)(t, e),
          Object(o.a)(t, [
            {
              key: 'componentDidMount',
              value: function() {
                var e = this;
                P.a.bind(this.props.value, function(t) {
                  t.preventDefault(), e.activate();
                });
              },
            },
            {
              key: 'componentWillUnmount',
              value: function() {
                P.a.unbind(this.props.value);
              },
            },
            {
              key: 'render',
              value: function() {
                var e = this.props.children;
                typeof this.props.children === typeof this &&
                  (e = y.a.cloneElement(this.props.children, {
                    active: this.state.active,
                    deactivate: this.deactivate,
                    activate: this.activate,
                  }));
                var t = 'key';
                return (
                  this.state.active && (t += ' active'),
                  y.a.createElement(
                    'div',
                    { className: t },
                    y.a.createElement(
                      'div',
                      { className: 'key-box', onClick: this.activate },
                      this.props.value
                    ),
                    y.a.createElement('div', { className: 'key-child' }, e)
                  )
                );
              },
            },
          ]),
          t
        );
      })(y.a.Component);
      Object(h.a)(D, 'propTypes', {
        value: g.a.string.isRequired,
        children: g.a.any,
        onPress: g.a.func,
      });
      var w = function(e) {
        var t = null;
        e.step &&
          (t = [
            y.a.createElement(
              D,
              { key: '4', value: '4', onPress: e.step },
              'step'
            ),
            y.a.createElement(
              D,
              { key: '5', value: '5', onPress: e.simulate },
              'simulate'
            ),
          ]);
        var a = 'controls';
        e.dockTop && (a += ' docktop'), e.help && (a += ' help');
        var n = e.help && !e.dockTop ? 'block' : 'none';
        return y.a.createElement(
          'section',
          { id: 'debug-controls', style: null, className: a },
          y.a.createElement(D, { value: '1', onPress: e.reset }, 'reset'),
          y.a.createElement(D, { value: '2', onPress: e.save }, 'save'),
          y.a.createElement(D, { value: '3', onPress: e.restore }, 'restore'),
          t,
          e.dockTop ||
            y.a.createElement(
              D,
              { value: '?', onPress: e.toggleHelp },
              'show more'
            ),
          y.a.createElement(
            'div',
            { className: 'key', style: { display: n } },
            y.a.createElement('div', { className: 'key-box' }, 'd'),
            ' show/hide this pane'
          ),
          y.a.createElement(
            'div',
            { className: 'key', style: { display: n } },
            y.a.createElement('div', { className: 'key-box' }, 'l'),
            ' show/hide log'
          ),
          y.a.createElement(
            'div',
            { className: 'key', style: { display: n } },
            y.a.createElement('div', { className: 'key-box' }, 'i'),
            ' show/hide game info tab'
          ),
          y.a.createElement(
            'div',
            { className: 'key', style: { display: n } },
            y.a.createElement('div', { className: 'key-box' }, 't'),
            ' dock controls'
          )
        );
      };
      w.propTypes = {
        help: g.a.bool,
        toggleHelp: g.a.func,
        step: g.a.func,
        simulate: g.a.func,
        reset: g.a.func,
        save: g.a.func,
        restore: g.a.func,
        dockTop: g.a.bool,
      };
      var N = (function(e) {
        function t() {
          var e, a;
          Object(c.a)(this, t);
          for (var n = arguments.length, r = new Array(n), s = 0; s < n; s++)
            r[s] = arguments[s];
          return (
            (a = Object(l.a)(
              this,
              (e = Object(u.a)(t)).call.apply(e, [this].concat(r))
            )),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'onClick', function(e) {
              var t = e == a.props.playerID ? null : e;
              a.props.onClick(t);
            }),
            a
          );
        }
        return (
          Object(p.a)(t, e),
          Object(o.a)(t, [
            {
              key: 'render',
              value: function() {
                for (
                  var e = this,
                    t = [],
                    a = function(a) {
                      var n = a + '',
                        r = 'player';
                      n === e.props.ctx.currentPlayer && (r += ' current'),
                        n === e.props.playerID && (r += ' active'),
                        t.push(
                          y.a.createElement(
                            'div',
                            {
                              className: r,
                              key: a,
                              onClick: function() {
                                return e.onClick(n);
                              },
                            },
                            n
                          )
                        );
                    },
                    n = 0;
                  n < this.props.ctx.numPlayers;
                  n++
                )
                  a(n);
                return y.a.createElement('div', { className: 'player-box' }, t);
              },
            },
          ]),
          t
        );
      })(y.a.Component);
      Object(h.a)(N, 'propTypes', {
        ctx: g.a.any.isRequired,
        playerID: g.a.any,
        onClick: g.a.func,
      });
      var _ = function() {};
      function C(e) {
        _('ERROR:', e);
      }
      var S = (function(e) {
        function t() {
          var e, a;
          Object(c.a)(this, t);
          for (var n = arguments.length, r = new Array(n), s = 0; s < n; s++)
            r[s] = arguments[s];
          return (
            (a = Object(l.a)(
              this,
              (e = Object(u.a)(t)).call.apply(e, [this].concat(r))
            )),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'state', { error: '' }),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'onSubmit', function(e) {
              var t = '';
              try {
                var n = new Function('return ['.concat(e, ']'))();
                a.props.fn.apply(Object(d.a)(Object(d.a)(a)), n);
              } catch (r) {
                (t = '' + r), C(r);
              }
              a.setState({ error: t, focus: !1, enterArg: !1 });
            }),
            a
          );
        }
        return (
          Object(p.a)(t, e),
          Object(o.a)(t, [
            {
              key: 'render',
              value: function() {
                return y.a.createElement(
                  'div',
                  null,
                  y.a.createElement(
                    D,
                    { value: this.props.shortcut },
                    y.a.createElement(M, {
                      name: this.props.name,
                      onSubmit: this.onSubmit,
                    })
                  ),
                  this.state.error
                    ? y.a.createElement(
                        'span',
                        { className: 'move-error' },
                        this.state.error
                      )
                    : null
                );
              },
            },
          ]),
          t
        );
      })(y.a.Component);
      Object(h.a)(S, 'propTypes', {
        name: g.a.string.isRequired,
        shortcut: g.a.string.isRequired,
        fn: g.a.func.isRequired,
      });
      var M = (function(e) {
        function t() {
          var e, a;
          Object(c.a)(this, t);
          for (var n = arguments.length, r = new Array(n), s = 0; s < n; s++)
            r[s] = arguments[s];
          return (
            (a = Object(l.a)(
              this,
              (e = Object(u.a)(t)).call.apply(e, [this].concat(r))
            )),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'onKeyDown', function(e) {
              if ('Enter' == e.key) {
                e.preventDefault();
                var t = a.span.innerText;
                a.props.onSubmit(t),
                  (a.span.innerText = ''),
                  a.props.deactivate();
              }
              'Escape' == e.key && (e.preventDefault(), a.props.deactivate());
            }),
            a
          );
        }
        return (
          Object(p.a)(t, e),
          Object(o.a)(t, [
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
                  t = 'move';
                return (
                  this.props.active && (t += ' active'),
                  y.a.createElement(
                    'div',
                    { className: t, onClick: this.props.activate },
                    this.props.name,
                    '(',
                    y.a.createElement('span', {
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
          t
        );
      })(y.a.Component);
      Object(h.a)(M, 'propTypes', {
        name: g.a.string.isRequired,
        onSubmit: g.a.func.isRequired,
        active: g.a.bool,
        activate: g.a.func,
        deactivate: g.a.func,
      });
      var G = 'MAKE_MOVE',
        L = 'GAME_EVENT',
        A = 'REDO',
        T = 'RESET',
        R = 'SYNC',
        U = 'UNDO',
        q = 'UPDATE',
        H =
          (a(61),
          function(e) {
            var t =
              void 0 !== e.payload ? JSON.stringify(e.payload, null, 4) : '';
            return y.a.createElement('div', null, t);
          });
      H.propTypes = { payload: g.a.any };
      var B = function(e) {
        var t = e.action,
          a = t.payload.args || [],
          n = t.payload.playerID,
          r = 'log-event player'.concat(n);
        e.pinned && (r += ' pinned');
        var s =
          void 0 !== e.payloadComponent
            ? y.a.createElement(e.payloadComponent, { payload: e.payload })
            : y.a.createElement(H, { payload: e.payload });
        return y.a.createElement(
          'div',
          {
            className: r,
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
          y.a.createElement('div', null, t.payload.type, '(', a.join(','), ')'),
          s
        );
      };
      B.propTypes = {
        action: g.a.any.isRequired,
        logIndex: g.a.number.isRequired,
        onLogClick: g.a.func.isRequired,
        onMouseEnter: g.a.func.isRequired,
        onMouseLeave: g.a.func.isRequired,
        pinned: g.a.bool,
        payload: g.a.object,
        payloadComponent: g.a.oneOfType([g.a.element, g.a.func]),
      };
      var V = function(e) {
        return y.a.createElement(
          'div',
          {
            className: 'turn-marker',
            style: { gridRow: 'span ' + e.numEvents },
          },
          e.turn
        );
      };
      V.propTypes = {
        turn: g.a.number.isRequired,
        numEvents: g.a.number.isRequired,
      };
      var J = function(e) {
        return y.a.createElement(
          'div',
          {
            className: 'phase-marker',
            style: { gridRow: 'span ' + e.numEvents },
          },
          e.phase
        );
      };
      J.propTypes = { phase: g.a.string, numEvents: g.a.number.isRequired };
      var F = (function(e) {
        function t() {
          var e, a;
          Object(c.a)(this, t);
          for (var n = arguments.length, r = new Array(n), s = 0; s < n; s++)
            r[s] = arguments[s];
          return (
            (a = Object(l.a)(
              this,
              (e = Object(u.a)(t)).call.apply(e, [this].concat(r))
            )),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'state', { pinned: null }),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'rewind', function(e) {
              for (
                var t = a.props.initialState, n = 0;
                n < a.props.log.length;
                n++
              ) {
                var r = a.props.log[n],
                  s = r.action;
                if ((r.automatic || (t = a.props.reducer(t, s)), s.type == G)) {
                  if (0 == e) break;
                  e--;
                }
              }
              return { G: t.G, ctx: t.ctx };
            }),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'onLogClick', function(e) {
              a.setState(function(t) {
                var n = a.rewind(e),
                  r = a.props.log.filter(function(e) {
                    return e.action.type == G;
                  })[e].action.payload.metadata;
                return t.pinned === e
                  ? (a.props.onHover({
                      logIndex: e,
                      state: n,
                      metadata: void 0,
                    }),
                    { pinned: null })
                  : (a.props.onHover({ logIndex: e, state: n, metadata: r }),
                    { pinned: e });
              });
            }),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'onMouseEnter', function(
              e
            ) {
              if (null === a.state.pinned) {
                var t = a.rewind(e);
                a.props.onHover({ logIndex: e, state: t });
              }
            }),
            Object(h.a)(
              Object(d.a)(Object(d.a)(a)),
              'onMouseLeave',
              function() {
                null === a.state.pinned && a.props.onHover({ state: null });
              }
            ),
            a
          );
        }
        return (
          Object(p.a)(t, e),
          Object(o.a)(t, [
            {
              key: 'render',
              value: function() {
                for (
                  var e = [],
                    t = [],
                    a = [],
                    n = 0,
                    r = 0,
                    s = this.props.log.filter(function(e) {
                      return e.action.type == G;
                    }),
                    i = 0;
                  i < s.length;
                  i++
                ) {
                  var c = s[i],
                    o = c.action,
                    l = c.payload,
                    u = c.turn,
                    p = c.phase;
                  n++,
                    r++,
                    e.push(
                      y.a.createElement(B, {
                        key: i,
                        pinned: i === this.state.pinned,
                        logIndex: i,
                        onLogClick: this.onLogClick,
                        onMouseEnter: this.onMouseEnter,
                        onMouseLeave: this.onMouseLeave,
                        action: o,
                        payload: l,
                        payloadComponent: this.props.payloadComponent,
                      })
                    ),
                    (i != s.length - 1 && s[i + 1].turn == u) ||
                      (t.push(
                        y.a.createElement(V, {
                          key: t.length,
                          turn: u,
                          numEvents: r,
                        })
                      ),
                      (r = 0)),
                    (i != s.length - 1 && s[i + 1].phase == p) ||
                      (a.push(
                        y.a.createElement(J, {
                          key: a.length,
                          phase: p,
                          numEvents: n,
                        })
                      ),
                      (n = 0));
                }
                var v = 'gamelog';
                return (
                  null !== this.state.pinned && (v += ' pinned'),
                  y.a.createElement('div', { className: v }, t, e, a)
                );
              },
            },
          ]),
          t
        );
      })(y.a.Component);
      Object(h.a)(F, 'propTypes', {
        onHover: g.a.func,
        reducer: g.a.func,
        initialState: g.a.any.isRequired,
        log: g.a.array.isRequired,
        payloadComponent: g.a.oneOfType([g.a.element, g.a.func]),
      }),
        Object(h.a)(F, 'defaultProps', { onHover: function() {} });
      var K = function(e, t, a, n) {
          return {
            type: G,
            payload: { type: e, args: t, playerID: a, credentials: n },
          };
        },
        z = function(e, t, a, n) {
          return {
            type: L,
            payload: { type: e, args: t, playerID: a, credentials: n },
          };
        },
        W = function(e, t, a, n) {
          return {
            type: L,
            payload: { type: e, args: t, playerID: a, credentials: n },
            automatic: !0,
          };
        },
        Y = function(e, t) {
          return { type: R, state: e, log: t, clientOnly: !0 };
        },
        Q = function(e, t) {
          return { type: q, state: e, deltalog: t, clientOnly: !0 };
        },
        X = function(e) {
          return { type: T, state: e, clientOnly: !0 };
        },
        Z = function() {
          return { type: U };
        },
        $ = function() {
          return { type: A };
        },
        ee = a(20);
      var te = (function(e) {
        function t(e) {
          var a;
          return (
            Object(c.a)(this, t),
            (a = Object(l.a)(this, Object(u.a)(t).call(this, e))),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'saveState', function() {
              var e = Object(ee.b)(a.props.gamestate);
              window.localStorage.setItem('gamestate', e);
            }),
            Object(h.a)(
              Object(d.a)(Object(d.a)(a)),
              'restoreState',
              function() {
                var e = window.localStorage.getItem('gamestate');
                if (null !== e) {
                  var t = Object(ee.a)(e);
                  a.props.store.dispatch(Y(t));
                }
              }
            ),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'onClickMain', function() {
              a.setState({ showLog: !1 });
            }),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'onClickLog', function() {
              a.setState({ showLog: !0 });
            }),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'toggleHelp', function() {
              a.setState(function(e) {
                return { help: !e.help };
              });
            }),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'onLogHover', function(e) {
              var t = e.state,
                n = e.metadata;
              a.setState({ AIMetadata: n }), a.props.overrideGameState(t);
            }),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'simulate', function() {
              var e =
                  arguments.length > 0 && void 0 !== arguments[0]
                    ? arguments[0]
                    : 1e4,
                t =
                  arguments.length > 1 && void 0 !== arguments[1]
                    ? arguments[1]
                    : 100;
              return (function() {
                var n = Object(x.a)(
                  j.a.mark(function n() {
                    var r;
                    return j.a.wrap(
                      function(n) {
                        for (;;)
                          switch ((n.prev = n.next)) {
                            case 0:
                              r = 0;
                            case 1:
                              if (!(r < e)) {
                                n.next = 12;
                                break;
                              }
                              return (n.next = 4), a.props.step();
                            case 4:
                              if (n.sent) {
                                n.next = 7;
                                break;
                              }
                              return n.abrupt('break', 12);
                            case 7:
                              return (
                                (n.next = 9),
                                new Promise(function(e) {
                                  return setTimeout(e, t);
                                })
                              );
                            case 9:
                              r++, (n.next = 1);
                              break;
                            case 12:
                            case 'end':
                              return n.stop();
                          }
                      },
                      n,
                      this
                    );
                  })
                );
                return function() {
                  return n.apply(this, arguments);
                };
              })()();
            }),
            (a.shortcuts = (function(e, t, a) {
              var n = {},
                r = {};
              for (var s in e) r[s] = s;
              for (var i in t) r[i] = i;
              for (var c = {}, o = 0; o < a.length; o++) c[a[o]] = !0;
              var l = c,
                u = !0;
              for (var p in r) {
                var v = p[0];
                if (l[v]) {
                  u = !1;
                  break;
                }
                (l[v] = !0), (n[p] = v);
              }
              if (u) return n;
              l = c;
              var m = 97;
              for (var d in ((n = {}), r)) {
                for (var h = String.fromCharCode(m); l[h]; )
                  m++, (h = String.fromCharCode(m));
                (l[h] = !0), (n[d] = h);
              }
              return n;
            })(e.moves, e.events, 'dlit')),
            (a.state = {
              showDebugUI: !0,
              showLog: !1,
              showGameInfo: e.showGameInfo,
              dockControls: e.dockControls,
              help: !1,
              AIMetadata: null,
            }),
            a
          );
        }
        return (
          Object(p.a)(t, e),
          Object(o.a)(t, [
            {
              key: 'componentDidMount',
              value: function() {
                var e = this;
                P.a.bind('d', function(t) {
                  t.preventDefault(),
                    e.setState(function(e) {
                      return { showDebugUI: !e.showDebugUI };
                    });
                }),
                  P.a.bind('l', function(t) {
                    t.preventDefault(),
                      e.setState(function(e) {
                        return { showLog: !e.showLog };
                      });
                  }),
                  P.a.bind('i', function(t) {
                    t.preventDefault(),
                      e.setState(function(e) {
                        return { showGameInfo: !e.showGameInfo };
                      });
                  }),
                  P.a.bind('t', function(t) {
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
                P.a.unbind('d'), P.a.unbind('l');
              },
            },
            {
              key: 'render',
              value: function() {
                if (!this.state.showDebugUI) return null;
                var e = [];
                for (var t in this.props.moves) {
                  var a = this.props.moves[t],
                    n = this.shortcuts[t];
                  e.push(
                    y.a.createElement(S, {
                      key: t,
                      name: t,
                      fn: a,
                      shortcut: n,
                    })
                  );
                }
                var r = [];
                for (var s in this.props.events) {
                  var i = this.props.events[s],
                    c = this.shortcuts[s];
                  r.push(
                    y.a.createElement(S, {
                      key: s,
                      name: s,
                      fn: i,
                      shortcut: c,
                    })
                  );
                }
                var o = this.state.AIMetadata && this.props.visualizeAI,
                  l = 'debug-ui';
                return (
                  this.state.dockControls && (l += ' docktop'),
                  y.a.createElement(
                    'div',
                    { className: l },
                    o &&
                      y.a.createElement(
                        'div',
                        { className: 'ai-visualization' },
                        this.props.visualizeAI(this.state.AIMetadata)
                      ),
                    y.a.createElement(
                      'div',
                      { className: 'pane' },
                      y.a.createElement(
                        'div',
                        { className: 'menu' },
                        y.a.createElement(
                          'div',
                          {
                            className: this.state.showLog
                              ? 'item'
                              : 'item active',
                            onClick: this.onClickMain,
                          },
                          'Main'
                        ),
                        y.a.createElement(
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
                        y.a.createElement(
                          'span',
                          null,
                          this.state.showGameInfo &&
                            y.a.createElement(E, {
                              gameID: this.props.gameID,
                              playerID: this.props.playerID,
                              isActive: this.props.gamestate.isActive,
                              isConnected: this.props.gamestate.isConnected,
                              isMultiplayer: this.props.isMultiplayer,
                            }),
                          y.a.createElement(w, {
                            dockTop: this.state.dockControls,
                            help: this.state.help,
                            toggleHelp: this.toggleHelp,
                            step: this.props.step,
                            simulate: this.simulate,
                            reset: this.props.reset,
                            save: this.saveState,
                            restore: this.restoreState,
                          }),
                          y.a.createElement('h3', null, 'Players'),
                          y.a.createElement(N, {
                            ctx: this.props.gamestate.ctx,
                            playerID: this.props.playerID,
                            onClick: this.props.updatePlayerID,
                          }),
                          y.a.createElement('h3', null, 'Moves'),
                          y.a.createElement('section', null, e),
                          y.a.createElement('h3', null, 'Events'),
                          y.a.createElement('section', null, r),
                          y.a.createElement(
                            'section',
                            null,
                            y.a.createElement(
                              'pre',
                              { className: 'json' },
                              y.a.createElement('strong', null, 'G'),
                              ':',
                              ' ',
                              JSON.stringify(this.props.gamestate.G, null, 2)
                            )
                          ),
                          y.a.createElement(
                            'section',
                            null,
                            y.a.createElement(
                              'pre',
                              { className: 'json' },
                              y.a.createElement('strong', null, 'ctx'),
                              ':',
                              ' ',
                              JSON.stringify(
                                (function(e) {
                                  var t = {};
                                  for (var a in e)
                                    a.startsWith('_') || (t[a] = e[a]);
                                  return t;
                                })(this.props.gamestate.ctx),
                                null,
                                2
                              )
                            )
                          )
                        ),
                      this.state.showLog &&
                        y.a.createElement(
                          'section',
                          null,
                          y.a.createElement(F, {
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
          t
        );
      })(y.a.Component);
      Object(h.a)(te, 'propTypes', {
        gamestate: g.a.shape({
          G: g.a.any.isRequired,
          ctx: g.a.any.isRequired,
          log: g.a.array.isRequired,
          isActive: g.a.bool,
          isConnected: g.a.bool,
          _initial: g.a.any.isRequired,
        }),
        gameID: g.a.string.isRequired,
        playerID: g.a.string,
        isMultiplayer: g.a.bool,
        moves: g.a.any,
        events: g.a.any,
        restore: g.a.func,
        showLog: g.a.bool,
        store: g.a.any,
        step: g.a.func,
        reset: g.a.func,
        reducer: g.a.func,
        overrideGameState: g.a.func,
        visualizeAI: g.a.func,
        updateGameID: g.a.func,
        updatePlayerID: g.a.func,
        updateCredentials: g.a.func,
        showGameInfo: g.a.bool,
        dockControls: g.a.bool,
      }),
        Object(h.a)(te, 'defaultProps', { showGameInfo: !0, dockControls: !1 });
      var ae = a(7),
        ne = a(17),
        re = a(48),
        se = [
          {
            fnWrap: function(e) {
              return Object(re.a)(e);
            },
          },
        ],
        ie = function(e, t) {
          var a = []
            .concat(se, Object(ae.a)(t))
            .filter(function(e) {
              return void 0 !== e.fnWrap;
            })
            .reduce(function(e, a) {
              return (0, a.fnWrap)(e, t);
            }, e);
          return function(e, n) {
            (e = (function(e, t) {
              return (
                []
                  .concat(se, Object(ae.a)(t))
                  .filter(function(e) {
                    return void 0 !== e.G;
                  })
                  .filter(function(e) {
                    return void 0 !== e.G.preMove;
                  })
                  .forEach(function(a) {
                    e = a.G.preMove(e, t);
                  }),
                e
              );
            })(e, t)),
              (n = (function(e, t) {
                return (
                  []
                    .concat(se, Object(ae.a)(t))
                    .filter(function(e) {
                      return void 0 !== e.ctx;
                    })
                    .filter(function(e) {
                      return void 0 !== e.ctx.preMove;
                    })
                    .forEach(function(a) {
                      e = a.ctx.preMove(e, t);
                    }),
                  e
                );
              })(n, t));
            for (
              var r = arguments.length, s = new Array(r > 2 ? r - 2 : 0), i = 2;
              i < r;
              i++
            )
              s[i - 2] = arguments[i];
            return (e = (function(e, t) {
              return (
                []
                  .concat(se, Object(ae.a)(t))
                  .filter(function(e) {
                    return void 0 !== e.G;
                  })
                  .filter(function(e) {
                    return void 0 !== e.G.postMove;
                  })
                  .forEach(function(a) {
                    e = a.G.postMove(e, t);
                  }),
                e
              );
            })((e = a.apply(void 0, [e, n].concat(s))), t));
          };
        },
        ce = {
          setup: function(e, t, a) {
            return (
              []
                .concat(se, Object(ae.a)(a.plugins))
                .filter(function(e) {
                  return void 0 !== e.G;
                })
                .filter(function(e) {
                  return void 0 !== e.G.setup;
                })
                .forEach(function(n) {
                  e = n.G.setup(e, t, a);
                }),
              e
            );
          },
          onPhaseBegin: function(e, t, a) {
            return (
              []
                .concat(se, Object(ae.a)(a))
                .filter(function(e) {
                  return void 0 !== e.G;
                })
                .filter(function(e) {
                  return void 0 !== e.G.onPhaseBegin;
                })
                .forEach(function(n) {
                  e = n.G.onPhaseBegin(e, t, a);
                }),
              e
            );
          },
        },
        oe = {
          setup: function(e, t) {
            return (
              []
                .concat(se, Object(ae.a)(t.plugins))
                .filter(function(e) {
                  return void 0 !== e.ctx;
                })
                .filter(function(e) {
                  return void 0 !== e.ctx.setup;
                })
                .forEach(function(a) {
                  e = a.ctx.setup(e, t);
                }),
              e
            );
          },
          onPhaseBegin: function(e, t) {
            return (
              []
                .concat(se, Object(ae.a)(t))
                .filter(function(e) {
                  return void 0 !== e.ctx;
                })
                .filter(function(e) {
                  return void 0 !== e.ctx.onPhaseBegin;
                })
                .forEach(function(a) {
                  e = a.ctx.onPhaseBegin(e, t);
                }),
              e
            );
          },
        };
      function le(e, t) {
        return Object(v.a)({}, e, { ctx: ue(e.ctx, t) });
      }
      function ue(e, t) {
        var a = e._prevActivePlayers,
          n = t.next || null;
        a = t.revert
          ? a.concat({
              activePlayers: e.activePlayers,
              _activePlayersMoveLimit: e._activePlayersMoveLimit,
              _activePlayersNumMoves: e._activePlayersNumMoves,
            })
          : [];
        var r = {};
        if (
          (t.value && (r = t.value),
          void 0 !== t.currentPlayer && (r[e.currentPlayer] = t.currentPlayer),
          void 0 !== t.others)
        )
          for (var s = 0; s < e.playOrder.length; s++) {
            var i = e.playOrder[s];
            i !== e.currentPlayer && (r[i] = t.others);
          }
        if (void 0 !== t.all)
          for (var c = 0; c < e.playOrder.length; c++) {
            r[e.playOrder[c]] = t.all;
          }
        0 == Object.keys(r).length && (r = null);
        var o = null;
        if (r && t.moveLimit)
          if ('number' === typeof t.moveLimit)
            for (var l in ((o = {}), r)) o[l] = t.moveLimit;
          else if (
            ((o = {}),
            t.moveLimit.value && (o = t.moveLimit.value),
            void 0 !== t.moveLimit.currentPlayer &&
              r[e.currentPlayer] &&
              (o[e.currentPlayer] = t.moveLimit.currentPlayer),
            void 0 !== t.moveLimit.others)
          )
            for (var u in r)
              u !== e.currentPlayer && (o[u] = t.moveLimit.others);
        var p = {};
        for (var m in r) p[m] = 0;
        return Object(v.a)({}, e, {
          activePlayers: r,
          _activePlayersMoveLimit: o,
          _activePlayersNumMoves: p,
          _prevActivePlayers: a,
          _nextActivePlayers: n,
        });
      }
      function pe(e, t) {
        return e[t] + '';
      }
      var ve = {
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
                for (var a = t.playOrderPos, n = 0; n < t.playOrder.length; n++)
                  if (
                    ((a = (a + 1) % t.playOrder.length),
                    !e.passOrder.includes(t.playOrder[a] + ''))
                  )
                    return a;
            },
          },
        },
        me = { NULL: null },
        de = {
          ALL: { all: me.NULL },
          ALL_ONCE: { all: me.NULL, moveLimit: 1 },
          OTHERS: { others: me.NULL },
          OTHERS_ONCE: { others: me.NULL, moveLimit: 1 },
        };
      function he(e) {
        var t = this,
          a = (function() {
            var e = 4022871197;
            return function(t) {
              t = t.toString();
              for (var a = 0; a < t.length; a++) {
                var n = 0.02519603282416938 * (e += t.charCodeAt(a));
                (n -= e = n >>> 0),
                  (e = (n *= e) >>> 0),
                  (e += 4294967296 * (n -= e));
              }
              return 2.3283064365386963e-10 * (e >>> 0);
            };
          })();
        (t.next = function() {
          var e = 2091639 * t.s0 + 2.3283064365386963e-10 * t.c;
          return (t.s0 = t.s1), (t.s1 = t.s2), (t.s2 = e - (t.c = 0 | e));
        }),
          (t.c = 1),
          (t.s0 = a(' ')),
          (t.s1 = a(' ')),
          (t.s2 = a(' ')),
          (t.s0 -= a(e)),
          t.s0 < 0 && (t.s0 += 1),
          (t.s1 -= a(e)),
          t.s1 < 0 && (t.s1 += 1),
          (t.s2 -= a(e)),
          t.s2 < 0 && (t.s2 += 1),
          (a = null);
      }
      function fe(e, t) {
        return (t.c = e.c), (t.s0 = e.s0), (t.s1 = e.s1), (t.s2 = e.s2), t;
      }
      function ye(e, t) {
        var a = new he(e),
          n = t && t.state,
          r = a.next;
        return (
          (r.quick = r),
          n &&
            ('object' == typeof n && fe(n, a),
            (r.state = function() {
              return fe(a, {});
            })),
          r
        );
      }
      var be = (function() {
        function e(t) {
          Object(c.a)(this, e), (this.state = t._random || { seed: '0' });
        }
        return (
          Object(o.a)(e, [
            {
              key: 'update',
              value: function(e) {
                var t = Object(v.a)({}, e.ctx, { _random: this.state });
                return Object(v.a)({}, e, { ctx: t });
              },
            },
            {
              key: 'attach',
              value: function(e) {
                return Object(v.a)({}, e, { random: this._api() });
              },
            },
            {
              key: '_random',
              value: function() {
                var e,
                  t = this.state,
                  a = (e =
                    void 0 === t.prngstate
                      ? new ye(t.seed, { state: !0 })
                      : new ye('', { state: t.prngstate }))();
                return (
                  (this.state = Object(v.a)({}, t, { prngstate: e.state() })), a
                );
              },
            },
            {
              key: '_api',
              value: function() {
                var e = this._random.bind(this),
                  t = { D4: 4, D6: 6, D8: 8, D10: 10, D12: 12, D20: 20 },
                  a = {},
                  n = function(n) {
                    var r = t[n];
                    a[n] = function(t) {
                      return void 0 === t
                        ? Math.floor(e() * r) + 1
                        : Object(ae.a)(new Array(t).keys()).map(function() {
                            return Math.floor(e() * r) + 1;
                          });
                    };
                  };
                for (var r in t) n(r);
                return Object(v.a)({}, a, {
                  Die: function(t, a) {
                    return (
                      void 0 === t && (t = 6),
                      void 0 === a
                        ? Math.floor(e() * t) + 1
                        : Object(ae.a)(new Array(a).keys()).map(function() {
                            return Math.floor(e() * t) + 1;
                          })
                    );
                  },
                  Number: function() {
                    return e();
                  },
                  Shuffle: function(t) {
                    for (
                      var a = t.slice(0), n = t.length, r = 0, s = new Array(n);
                      n;

                    ) {
                      var i = (n * e()) | 0;
                      (s[r++] = a[i]), (a[i] = a[--n]);
                    }
                    return s;
                  },
                });
              },
            },
          ]),
          e
        );
      })();
      (be.detach = function(e) {
        e.random;
        return Object(m.a)(e, ['random']);
      }),
        (be.seed = function() {
          return (+new Date()).toString(36).slice(-10);
        });
      var ge = (function() {
        function e(t, a) {
          Object(c.a)(this, e),
            (this.flow = t),
            (this.playerID = a),
            (this.dispatch = []);
        }
        return (
          Object(o.a)(e, [
            {
              key: 'attach',
              value: function(e) {
                var t = this,
                  a = {},
                  n = e.phase,
                  r = e.turn,
                  s = !0,
                  i = !1,
                  c = void 0;
                try {
                  for (
                    var o,
                      l = function() {
                        var e = o.value;
                        a[e] = function() {
                          for (
                            var a = arguments.length, s = new Array(a), i = 0;
                            i < a;
                            i++
                          )
                            s[i] = arguments[i];
                          t.dispatch.push({
                            key: e,
                            args: s,
                            phase: n,
                            turn: r,
                          });
                        };
                      },
                      u = this.flow.eventNames[Symbol.iterator]();
                    !(s = (o = u.next()).done);
                    s = !0
                  )
                    l();
                } catch (p) {
                  (i = !0), (c = p);
                } finally {
                  try {
                    s || null == u.return || u.return();
                  } finally {
                    if (i) throw c;
                  }
                }
                return Object(v.a)({}, e, { events: a });
              },
            },
            {
              key: 'update',
              value: function(e) {
                for (var t = this.dispatch.length, a = 0; a < t; a++) {
                  var n = this.dispatch[a];
                  if (
                    ('endTurn' !== n.key || n.turn === e.ctx.turn) &&
                    ('endPhase' !== n.key || n.phase === e.ctx.phase)
                  ) {
                    var r = W(n.key, n.args, this.playerID);
                    e = Object(v.a)({}, e, this.flow.processGameEvent(e, r));
                  }
                }
                return e;
              },
            },
          ]),
          e
        );
      })();
      ge.detach = function(e) {
        e.events;
        return Object(m.a)(e, ['events']);
      };
      var Oe = (function() {
          function e() {
            Object(c.a)(this, e), (this._payload = void 0);
          }
          return (
            Object(o.a)(
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
                    return Object(v.a)({}, e, { log: this._api() });
                  },
                },
                {
                  key: 'update',
                  value: function(e) {
                    if (void 0 === this._payload) return e;
                    var t = e.deltalog;
                    return (
                      (t[t.length - 1] = Object(v.a)({}, t[t.length - 1], {
                        payload: this._payload,
                      })),
                      (this._payload = void 0),
                      Object(v.a)({}, e, { deltalog: t })
                    );
                  },
                },
              ],
              [
                {
                  key: 'detach',
                  value: function(e) {
                    e.log;
                    return Object(m.a)(e, ['log']);
                  },
                },
              ]
            ),
            e
          );
        })(),
        je = (function() {
          function e(t, a, n) {
            Object(c.a)(this, e),
              (this.random = new be(t)),
              (this.events = new ge(a.flow, n)),
              (this.log = new Oe());
          }
          return (
            Object(o.a)(
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
                    var a = t ? this.events.update(e) : e;
                    return (
                      (a = this.random.update(a)), (a = this.log.update(a))
                    );
                  },
                },
                {
                  key: 'updateAndDetach',
                  value: function(t, a) {
                    var n = this._update(t, a);
                    return (n.ctx = e.detachAllFromContext(n.ctx)), n;
                  },
                },
              ],
              [
                {
                  key: 'detachAllFromContext',
                  value: function(e) {
                    var t = be.detach(e);
                    return (t = ge.detach(t)), (t = Oe.detach(t));
                  },
                },
              ]
            ),
            e
          );
        })();
      function xe(e) {
        var t = e.ctx,
          a = e.eventHandlers,
          n = e.enabledEvents,
          r = e.init,
          s = e.processMove,
          i = e.moveMap,
          c = e.moveNames,
          o = e.getMove;
        t ||
          (t = function() {
            return {};
          }),
          a || (a = {}),
          n || (n = {}),
          r ||
            (r = function(e) {
              return e;
            }),
          s ||
            (s = function(e) {
              return e;
            });
        return {
          ctx: t,
          init: r,
          moveMap: i,
          moveNames: c,
          getMove: o,
          eventNames: Object.keys(a),
          enabledEventNames: Object.keys(n),
          processMove: function(e, t) {
            return s(e, t);
          },
          processGameEvent: function(e, t) {
            return (function e(t, n) {
              var r = n.payload;
              if (a.hasOwnProperty(r.type)) {
                var s = { playerID: r.playerID, dispatch: e },
                  i = [t].concat(r.args);
                return a[r.type].apply(s, i);
              }
              return t;
            })(e, t);
          },
          canPlayerCallEvent: function(e, t, a) {
            var n = t.currentPlayer == a;
            return t.activePlayers
              ? n && t.currentPlayer in t.activePlayers
              : n;
          },
          canPlayerMakeMove: function(e, t, a) {
            var n = a.payload.playerID;
            if (null === o(t, a.payload.type, n)) return !1;
            if (t.activePlayers) {
              if (!(n in t.activePlayers)) return !1;
            } else if (t.currentPlayer !== n) return !1;
            return !0;
          },
          canPlayerMakeAnyMove: function(e, t, a) {
            return t.activePlayers
              ? a in t.activePlayers
              : t.currentPlayer === a;
          },
        };
      }
      function ke(e) {
        var t = e.moves,
          a = e.phases,
          n = e.endIf,
          r = e.turn,
          s = e.events,
          i = e.plugins;
        void 0 === t && (t = {}),
          void 0 === s && (s = {}),
          void 0 === s.setActivePlayers && (s.setActivePlayers = !0),
          void 0 === s.endStage && ((s.endStage = !0), (s.setStage = !0)),
          void 0 === s.endPhase && a && ((s.endPhase = !0), (s.setPhase = !0)),
          void 0 === s.endTurn && (s.endTurn = !0),
          void 0 === s.endGame && (s.endGame = !1),
          void 0 === i && (i = []),
          n || (n = function() {}),
          r || (r = {});
        var c = a || {};
        '' in c && C('cannot specify phase with empty name'), (c[''] = {});
        var o = {},
          l = new Set(),
          u = null;
        for (var p in (Object.keys(t).forEach(function(e) {
          return l.add(e);
        }),
        c)) {
          var d = c[p];
          if ((!0 === d.start && (u = p), void 0 !== d.moves))
            for (var h = Object.keys(d.moves), f = 0; f < h.length; f++) {
              var y = h[f];
              (o[p + '.' + y] = d.moves[y]), l.add(y);
            }
          for (var b in (void 0 === d.endIf && (d.endIf = function() {}),
          void 0 === d.onBegin &&
            (d.onBegin = function(e) {
              return e;
            }),
          (d.onBegin = ie(d.onBegin, i)),
          void 0 === d.onEnd &&
            (d.onEnd = function(e) {
              return e;
            }),
          (d.onEnd = ie(d.onEnd, i)),
          void 0 === d.turn && (d.turn = r),
          void 0 === d.turn.order && (d.turn.order = ve.DEFAULT),
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
              var g = d.turn.stages[b].moves || {}, O = Object.keys(g), j = 0;
              j < O.length;
              j++
            ) {
              var x = O[j];
              (o[p + '.' + b + '.' + x] = g[x]), l.add(x);
            }
          (d.turn.onMove = ie(d.turn.onMove, i)),
            (d.turn.onBegin = ie(d.turn.onBegin, i)),
            (d.turn.onEnd = ie(d.turn.onEnd, i));
        }
        function k(e) {
          return e.phase ? c[e.phase] : c[''];
        }
        function P(e) {
          return e;
        }
        function I(e, t) {
          for (var a = new Set(), n = new Set(), r = 0; r < t.length; r++) {
            var s = t[r],
              i = s.fn,
              c = s.arg,
              o = Object(m.a)(s, ['fn', 'arg']);
            if (i === T) {
              n.clear();
              var l = e.ctx.phase;
              if (a.has(l)) {
                var u = Object(v.a)({}, e.ctx, { phase: null });
                return Object(v.a)({}, e, { ctx: u });
              }
              a.add(l);
            }
            var p = [];
            if (((e = i(e, Object(v.a)({}, o, { arg: c, next: p }))), i === A))
              break;
            var d = M(e);
            if (d)
              t.push({
                fn: A,
                arg: d,
                turn: e.ctx.turn,
                phase: e.ctx.phase,
                automatic: !0,
              });
            else {
              var h = G(e);
              if (h)
                t.push({
                  fn: T,
                  arg: h,
                  turn: e.ctx.turn,
                  phase: e.ctx.phase,
                  automatic: !0,
                });
              else {
                if (i === P) {
                  var f = L(e);
                  if (f) {
                    t.push({
                      fn: R,
                      arg: f,
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
        function E(e, t) {
          return t.next.push({ fn: D }), e;
        }
        function D(e, t) {
          var a = t.next,
            n = e.G,
            r = e.ctx,
            s = k(r);
          return (
            (n = ce.onPhaseBegin(n, r, i)),
            (r = oe.onPhaseBegin(r, i)),
            (n = s.onBegin(n, r)),
            a.push({ fn: w }),
            Object(v.a)({}, e, { G: n, ctx: r })
          );
        }
        function w(e, t) {
          var a = t.currentPlayer,
            n = e.G,
            r = e.ctx,
            s = k(r);
          a
            ? ((r = Object(v.a)({}, r, { currentPlayer: a })),
              s.turn.activePlayers && (r = ue(r, s.turn.activePlayers)))
            : (r = (function(e, t, a) {
                var n = a.order,
                  r = Object(ae.a)(new Array(t.numPlayers)).map(function(e, t) {
                    return t + '';
                  });
                void 0 !== n.playOrder && (r = n.playOrder(e, t));
                var s = n.first(e, t),
                  i = pe(r, s);
                return (t = ue(
                  (t = Object(v.a)({}, t, {
                    currentPlayer: i,
                    playOrderPos: s,
                    playOrder: r,
                  })),
                  a.activePlayers || {}
                ));
              })(n, r, s.turn)),
            (n = s.turn.onBegin(n, r));
          var i = r.turn + 1;
          r = Object(v.a)({}, r, {
            turn: i,
            numMoves: 0,
            _prevActivePlayers: [],
          });
          var c = [{ G: n, ctx: je.detachAllFromContext(r) }];
          return Object(v.a)({}, e, { G: n, ctx: r, _undo: c, _redo: [] });
        }
        function N(e, t) {
          var a = t.arg,
            n = t.next,
            r = k({ phase: t.phase }),
            s = e.ctx;
          if (a && a.next) {
            if (!(a.next in c)) return C('invalid phase: ' + a.next), e;
            s = Object(v.a)({}, s, { phase: a.next });
          } else
            s =
              void 0 !== r.next
                ? Object(v.a)({}, s, { phase: r.next })
                : Object(v.a)({}, s, { phase: null });
          return (e = Object(v.a)({}, e, { ctx: s })), n.push({ fn: D }), e;
        }
        function _(e, t) {
          var a = t.arg,
            n = t.currentPlayer,
            r = t.next,
            s = e,
            i = s.G,
            c = s.ctx,
            o = k(c),
            l = (function(e, t, a, n) {
              var r = a.order,
                s = t.playOrderPos,
                i = t.currentPlayer,
                c = !1;
              if (n && !0 !== n)
                t.playOrder.includes(n.next)
                  ? ((s = t.playOrder.indexOf(n.next)), (i = n.next))
                  : C('invalid argument to endTurn: '.concat(n));
              else {
                var o = r.next(e, t);
                void 0 === o ? (c = !0) : ((s = o), (i = pe(t.playOrder, s)));
              }
              return {
                endPhase: c,
                ctx: (t = Object(v.a)({}, t, {
                  playOrderPos: s,
                  currentPlayer: i,
                })),
              };
            })(i, Object(v.a)({}, c, { currentPlayer: n }), o.turn, a),
            u = l.endPhase;
          return (
            (c = l.ctx),
            (e = Object(v.a)({}, e, { G: i, ctx: c })),
            u
              ? r.push({ fn: T, turn: c.turn, phase: c.phase })
              : r.push({ fn: w, currentPlayer: c.currentPlayer }),
            e
          );
        }
        function S(e, t) {
          var a = t.arg,
            n = t.playerID;
          'string' === typeof a && (a = { stage: a });
          var r = e.ctx,
            s = r,
            i = s.activePlayers,
            c = s._activePlayersMoveLimit,
            o = s._activePlayersNumMoves;
          return (
            a.stage &&
              (null === i && (i = {}),
              (i[n] = a.stage),
              (o[n] = 0),
              a.moveLimit && (null === c && (c = {}), (c[n] = a.moveLimit))),
            (r = Object(v.a)({}, r, {
              activePlayers: i,
              _activePlayersMoveLimit: c,
              _activePlayersNumMoves: o,
            })),
            Object(v.a)({}, e, { ctx: r })
          );
        }
        function M(e) {
          var t = e.G,
            a = e.ctx;
          return n(t, a);
        }
        function G(e) {
          var t = e.G,
            a = e.ctx;
          return k(a).endIf(t, a);
        }
        function L(e) {
          var t = e.G,
            a = e.ctx,
            n = k(a),
            r = a.numMoves || 0;
          return (
            !!(n.turn.moveLimit && r >= n.turn.moveLimit) || n.turn.endIf(t, a)
          );
        }
        function A(e, t) {
          var a = t.arg;
          return (
            (e = T(e, { phase: t.phase })),
            void 0 === a && (a = !0),
            Object(v.a)({}, e, { ctx: Object(v.a)({}, e.ctx, { gameover: a }) })
          );
        }
        function T(e, t) {
          var a = t.arg,
            n = t.next,
            r = t.turn,
            s = t.automatic,
            i = (e = R(e, { turn: r, force: !0 })).G,
            c = e.ctx;
          if (
            (n && n.push({ fn: N, arg: a, phase: c.phase }), null === c.phase)
          )
            return e;
          (i = k(c).onEnd(i, c)), (c = Object(v.a)({}, c, { phase: null }));
          var o = {
            action: z('endPhase', a),
            _stateID: e._stateID,
            turn: e.ctx.turn,
            phase: e.ctx.phase,
          };
          s && (o.automatic = !0);
          var l = [].concat(Object(ae.a)(e.deltalog), [o]);
          return Object(v.a)({}, e, { G: i, ctx: c, deltalog: l });
        }
        function R(e, t) {
          var a = t.arg,
            n = t.next,
            r = t.turn,
            s = t.force,
            i = t.automatic;
          if (null === e.ctx.currentPlayer) return e;
          if (r !== e.ctx.turn) return e;
          var c = e.G,
            o = e.ctx,
            l = k(o),
            u = o.numMoves || 0;
          if (!s && l.turn.moveLimit && u < l.turn.moveLimit) return e;
          (c = l.turn.onEnd(c, o)),
            n && n.push({ fn: _, arg: a, currentPlayer: o.currentPlayer }),
            (o = Object(v.a)({}, o, {
              currentPlayer: null,
              activePlayers: null,
            }));
          var p = {
            action: z('endTurn', a),
            _stateID: e._stateID,
            turn: e.ctx.turn,
            phase: e.ctx.phase,
          };
          i && (p.automatic = !0);
          var m = [].concat(Object(ae.a)(e.deltalog || []), [p]);
          return Object(v.a)({}, e, {
            G: c,
            ctx: o,
            deltalog: m,
            _undo: [],
            _redo: [],
          });
        }
        function U(e, t) {
          var a = t.arg,
            n = t.next,
            r = t.automatic,
            s = t.playerID;
          s = s || e.ctx.currentPlayer;
          var i = e.ctx,
            c = i,
            o = c.activePlayers,
            l = c._activePlayersMoveLimit;
          if (
            (n && a && n.push({ fn: S, arg: a, playerID: s }),
            null === o || !(s in o))
          )
            return e;
          (o = Object.keys(o)
            .filter(function(e) {
              return e !== s;
            })
            .reduce(function(e, t) {
              return (e[t] = o[t]), e;
            }, {})),
            l &&
              (l = Object.keys(l)
                .filter(function(e) {
                  return e !== s;
                })
                .reduce(function(e, t) {
                  return (e[t] = l[t]), e;
                }, {})),
            (i = (function(e) {
              var t = e,
                a = t.activePlayers,
                n = t._activePlayersMoveLimit,
                r = t._activePlayersNumMoves,
                s = t._prevActivePlayers;
              if (a && 0 == Object.keys(a).length)
                if (e._nextActivePlayers) {
                  var i = (e = ue(e, e._nextActivePlayers));
                  (a = i.activePlayers),
                    (n = i._activePlayersMoveLimit),
                    (r = i._activePlayersNumMoves),
                    (s = i._prevActivePlayers);
                } else if (s.length > 0) {
                  var c = s.length - 1,
                    o = s[c];
                  (a = o.activePlayers),
                    (n = o._activePlayersMoveLimit),
                    (r = o._activePlayersNumMoves),
                    (s = s.slice(0, c));
                } else (a = null), (n = null);
              return Object(v.a)({}, e, {
                activePlayers: a,
                _activePlayersMoveLimit: n,
                _activePlayersNumMoves: r,
                _prevActivePlayers: s,
              });
            })(
              Object(v.a)({}, i, {
                activePlayers: o,
                _activePlayersMoveLimit: l,
              })
            ));
          var u = {
            action: z('endStage', a),
            _stateID: e._stateID,
            turn: e.ctx.turn,
            phase: e.ctx.phase,
          };
          r && (u.automatic = !0);
          var p = [].concat(Object(ae.a)(e.deltalog || []), [u]);
          return Object(v.a)({}, e, { ctx: i, deltalog: p });
        }
        var q = {
            endStage: function(e) {
              return I(e, [{ fn: U }]);
            },
            setStage: function(e, t) {
              return I(e, [{ fn: U, arg: t }]);
            },
            endTurn: function(e, t) {
              return I(e, [
                { fn: R, turn: e.ctx.turn, phase: e.ctx.phase, arg: t },
              ]);
            },
            endPhase: function(e) {
              return I(e, [{ fn: T, phase: e.ctx.phase, turn: e.ctx.turn }]);
            },
            setPhase: function(e, t) {
              return I(e, [
                {
                  fn: T,
                  phase: e.ctx.phase,
                  turn: e.ctx.turn,
                  arg: { next: t },
                },
              ]);
            },
            endGame: function(e, t) {
              return I(e, [
                { fn: A, turn: e.ctx.turn, phase: e.ctx.phase, arg: t },
              ]);
            },
            setActivePlayers: le,
          },
          H = {};
        return (
          s.endTurn && (H.endTurn = !0),
          s.endPhase && ((H.endPhase = !0), (H.setPhase = !0)),
          s.endGame && (H.endGame = !0),
          s.setActivePlayers && (H.setActivePlayers = !0),
          s.endStage && ((H.endStage = !0), (H.setStage = !0)),
          xe({
            ctx: function(e) {
              return {
                numPlayers: e,
                turn: 0,
                currentPlayer: '0',
                playOrder: Object(ae.a)(new Array(e)).map(function(e, t) {
                  return t + '';
                }),
                playOrderPos: 0,
                phase: u,
                activePlayers: null,
              };
            },
            init: function(e) {
              return I(e, [{ fn: E }]);
            },
            eventHandlers: q,
            enabledEvents: H,
            moveMap: o,
            moveNames: Object(ae.a)(l.values()),
            processMove: function(e, t) {
              var a = k(e.ctx),
                n = e.ctx,
                r = n._activePlayersNumMoves,
                s = t.playerID;
              n.activePlayers && r[s]++;
              var i = e.ctx.numMoves;
              s == e.ctx.currentPlayer && i++,
                (e = Object(v.a)({}, e, {
                  ctx: Object(v.a)({}, n, {
                    numMoves: i,
                    _activePlayersNumMoves: r,
                  }),
                })),
                n._activePlayersMoveLimit &&
                  r[s] >= n._activePlayersMoveLimit[s] &&
                  (e = U(e, { playerID: s, automatic: !0 }));
              var c = a.turn.onMove(e.G, e.ctx, t),
                o = (e = Object(v.a)({}, e, { G: c }))._undo || [],
                l = t.type,
                u = je.detachAllFromContext(e.ctx);
              return I(
                (e = Object(v.a)({}, e, {
                  _undo: [].concat(Object(ae.a)(o), [
                    { G: e.G, ctx: u, moveType: l },
                  ]),
                  _redo: [],
                })),
                [{ fn: P }]
              );
            },
            getMove: function(e, a, n) {
              var r = k(e),
                s = r.turn.stages,
                i = e.activePlayers;
              if (
                i &&
                void 0 !== i[n] &&
                i[n] !== me.NULL &&
                void 0 !== s[i[n]] &&
                void 0 !== s[i[n]].moves
              ) {
                var c = s[i[n]].moves;
                if (a in c) return c[a];
              } else if (r.moves) {
                if (a in r.moves) return r.moves[a];
              } else if (a in t) return t[a];
              return null;
            },
          })
        );
      }
      function Pe(e) {
        return void 0 !== e.processMove
          ? e
          : (void 0 === e.name && (e.name = 'default'),
            void 0 === e.setup &&
              (e.setup = function() {
                return {};
              }),
            void 0 === e.moves && (e.moves = {}),
            void 0 === e.playerView &&
              (e.playerView = function(e) {
                return e;
              }),
            void 0 === e.plugins && (e.plugins = []),
            (e.flow && void 0 !== e.flow.processGameEvent) || (e.flow = ke(e)),
            Object(v.a)({}, e, {
              moveNames: e.flow.moveNames,
              processMove: function(t, a, n) {
                var r = e.flow.getMove(n, a.type, a.playerID);
                if (
                  (r instanceof Object && r.move && (r = r.move),
                  r instanceof Function)
                ) {
                  var s = [
                    t,
                    Object(v.a)({}, n, { playerID: a.playerID }),
                  ].concat(a.args);
                  return ie(r, e.plugins).apply(void 0, Object(ae.a)(s));
                }
                return t;
              },
            }));
      }
      var Ie = a(30),
        Ee = a.n(Ie),
        De = (function() {
          function e() {
            var t =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : {},
              a = t.socket,
              n = t.socketOpts,
              r = t.store,
              s = t.gameID,
              i = t.playerID,
              o = t.gameName,
              l = t.numPlayers,
              u = t.server;
            Object(c.a)(this, e),
              (this.server = u),
              (this.socket = a),
              (this.store = r),
              (this.socketOpts = n),
              (this.gameName = o || 'default'),
              (this.gameID = s || 'default'),
              (this.playerID = i || null),
              (this.numPlayers = l || 2),
              (this.gameID = this.gameName + ':' + this.gameID),
              (this.isConnected = !1),
              (this.callback = function() {}),
              (this.gameMetadataCallback = function() {});
          }
          return (
            Object(o.a)(e, [
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
                        (this.socket = Ee()(
                          t + this.gameName,
                          this.socketOpts
                        ));
                    } else
                      this.socket = Ee()('/' + this.gameName, this.socketOpts);
                  this.socket.on('update', function(t, a, n) {
                    var r = e.store.getState();
                    if (t == e.gameID && a._stateID >= r._stateID) {
                      var s = Q(a, n);
                      e.store.dispatch(s);
                    }
                  }),
                    this.socket.on('sync', function(t, a, n, r) {
                      if (t == e.gameID) {
                        var s = Y(a, n);
                        e.gameMetadataCallback(r), e.store.dispatch(s);
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
                  var t = X(null);
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
                  var t = X(null);
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
        we = (function() {
          function e() {
            Object(c.a)(this, e), (this.games = new Map());
          }
          return (
            Object(o.a)(e, [
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
                  return Object(ae.a)(this.games.keys());
                },
              },
            ]),
            e
          );
        })();
      function Ne(e) {
        var t = e.game,
          a = e.numPlayers,
          n = e.setupData;
        a || (a = 2);
        var r = (t = Pe(t)).flow.ctx(a),
          s = t.seed;
        void 0 === s && (s = be.seed()),
          (r._random = { seed: s }),
          (r = oe.setup(r, t));
        var i = new je(r, t, r.currentPlayer),
          c = i.attachToContext(r),
          o = t.setup(c, n),
          l = {
            G: (o = ce.setup(o, c, t)),
            ctx: r,
            _undo: [],
            _redo: [],
            _stateID: 0,
            _initial: {},
          },
          u = t.flow.init({ G: l.G, ctx: c });
        (l.G = u.G),
          (l._undo = u._undo),
          (u = i.updateAndDetach(u, !0)),
          (l.ctx = u.ctx);
        var p;
        return (l._initial = ((p = l), Object(ee.a)(Object(ee.b)(p)))), l;
      }
      var _e = function(e, t, a) {
          return (
            !1 !== a.undoable &&
            (!(a.undoable instanceof Function) || a.undoable(e, t))
          );
        },
        Ce = 'INVALID_MOVE';
      function Se(e) {
        var t = e.game,
          a = e.multiplayer;
        return (
          (t = Pe(t)),
          function() {
            var e =
                arguments.length > 0 && void 0 !== arguments[0]
                  ? arguments[0]
                  : null,
              n = arguments.length > 1 ? arguments[1] : void 0;
            switch (n.type) {
              case L:
                if (((e = Object(v.a)({}, e, { deltalog: [] })), a)) return e;
                if (
                  null !== n.payload.playerID &&
                  void 0 !== n.payload.playerID &&
                  !t.flow.canPlayerCallEvent(e.G, e.ctx, n.payload.playerID)
                )
                  return e;
                var r = new je(e.ctx, t, n.payload.playerID);
                e.ctx = r.attachToContext(e.ctx);
                var s = t.flow.processGameEvent(e, n);
                return (
                  (s = r.updateAndDetach(s, !0)),
                  Object(v.a)({}, s, { _stateID: e._stateID + 1 })
                );
              case G:
                e = Object(v.a)({}, e, { deltalog: [] });
                var i = t.flow.getMove(
                  e.ctx,
                  n.payload.type,
                  n.payload.playerID || e.ctx.currentPlayer
                );
                if (null === i)
                  return C('disallowed move: '.concat(n.payload.type)), e;
                if (a && !1 === i.optimistic) return e;
                if (void 0 !== e.ctx.gameover)
                  return C('cannot make move after game end'), e;
                if (
                  null !== n.payload.playerID &&
                  void 0 !== n.payload.playerID &&
                  !t.flow.canPlayerMakeMove(e.G, e.ctx, n)
                )
                  return C('disallowed move: '.concat(n.payload.type)), e;
                var c = new je(e.ctx, t, n.payload.playerID),
                  o = c.attachToContext(e.ctx),
                  l = t.processMove(e.G, n.payload, o);
                if (l === Ce) return e;
                var u = {
                  action: n,
                  _stateID: e._stateID,
                  turn: e.ctx.turn,
                  phase: e.ctx.phase,
                };
                !0 === i.redact && (u.redact = !0);
                var p = c.updateAndDetach(
                    Object(v.a)({}, e, { deltalog: [u] }),
                    !1
                  ),
                  m = p.ctx;
                return a &&
                  void 0 !== m._random &&
                  void 0 !== m._random.prngstate
                  ? e
                  : ((e = Object(v.a)({}, p, {
                      G: l,
                      ctx: m,
                      _stateID: e._stateID + 1,
                    })),
                    a
                      ? e
                      : ((o = c.attachToContext(e.ctx)),
                        (e = t.flow.processMove(
                          Object(v.a)({}, e, { ctx: o }),
                          n.payload
                        )),
                        (e = c.updateAndDetach(e, !0))));
              case T:
              case q:
              case R:
                return n.state;
              case U:
                var d = e,
                  h = d._undo,
                  f = d._redo;
                if (h.length < 2) return e;
                var y = h[h.length - 1],
                  b = h[h.length - 2],
                  g = t.flow.getMove(e.ctx, y.moveType, e.ctx.currentPlayer);
                return _e(e.G, e.ctx, g)
                  ? Object(v.a)({}, e, {
                      G: b.G,
                      ctx: b.ctx,
                      _undo: h.slice(0, h.length - 1),
                      _redo: [y].concat(Object(ae.a)(f)),
                    })
                  : e;
              case A:
                var O = e,
                  j = O._undo,
                  x = O._redo;
                if (0 == x.length) return e;
                var k = x[0];
                return Object(v.a)({}, e, {
                  G: k.G,
                  ctx: k.ctx,
                  _undo: [].concat(Object(ae.a)(j), [k]),
                  _redo: x.slice(1),
                });
              default:
                return e;
            }
          }
        );
      }
      var Me = function(e) {
        return ''.concat(e, ':metadata');
      };
      function Ge(e, t) {
        return void 0 === e
          ? e
          : e.map(function(e) {
              if (null !== t && +t === +e.action.payload.playerID) return e;
              if (!0 !== e.redact) return e;
              var a = Object(v.a)({}, e.action.payload, { args: null }),
                n = Object(v.a)({}, e, {
                  action: Object(v.a)({}, e.action, { payload: a }),
                });
              n.redact;
              return Object(m.a)(n, ['redact']);
            });
      }
      var Le = function(e) {
          var t = e.action,
            a = e.gameMetadata,
            n = e.playerID;
          return (
            !a ||
            (!Object.keys(a.players).some(function(e) {
              return !(!a.players[e] || !a.players[e].credentials);
            }) ||
              (!!t.payload &&
                (!!t.payload.credentials &&
                  t.payload.credentials === a.players[n].credentials)))
          );
        },
        Ae = (function() {
          function e(t, a, n, r) {
            Object(c.a)(this, e),
              (this.game = Pe(t)),
              (this.storageAPI = a),
              (this.transportAPI = n),
              (this.auth = function() {
                return !0;
              }),
              !0 === r
                ? (this.auth = Le)
                : 'function' === typeof r && (this.auth = r);
          }
          return (
            Object(o.a)(e, [
              {
                key: 'onUpdate',
                value: (function() {
                  var e = Object(x.a)(
                    j.a.mark(function e(t, a, n, r) {
                      var s,
                        i,
                        c,
                        o,
                        l,
                        u,
                        p,
                        m,
                        d,
                        h = this;
                      return j.a.wrap(
                        function(e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (!this.executeSynchronously) {
                                  e.next = 5;
                                  break;
                                }
                                (i = this.storageAPI.get(Me(n))),
                                  (s = this.auth({
                                    action: t,
                                    gameMetadata: i,
                                    gameID: n,
                                    playerID: r,
                                  })),
                                  (e.next = 9);
                                break;
                              case 5:
                                return (e.next = 7), this.storageAPI.get(Me(n));
                              case 7:
                                (c = e.sent),
                                  (s = this.auth({
                                    action: t,
                                    gameMetadata: c,
                                    gameID: n,
                                    playerID: r,
                                  }));
                              case 9:
                                if (s) {
                                  e.next = 11;
                                  break;
                                }
                                return e.abrupt('return', {
                                  error: 'unauthorized action',
                                });
                              case 11:
                                if (((o = n), !this.executeSynchronously)) {
                                  e.next = 16;
                                  break;
                                }
                                (l = this.storageAPI.get(o)), (e.next = 19);
                                break;
                              case 16:
                                return (e.next = 18), this.storageAPI.get(o);
                              case 18:
                                l = e.sent;
                              case 19:
                                if (void 0 !== l) {
                                  e.next = 22;
                                  break;
                                }
                                return (
                                  C('game not found, gameID=['.concat(o, ']')),
                                  e.abrupt('return', {
                                    error: 'game not found',
                                  })
                                );
                              case 22:
                                if (
                                  ((u = Se({
                                    game: this.game,
                                    numPlayers: l.ctx.numPlayers,
                                  })),
                                  (p = Object(ne.c)(u, l)),
                                  t.type != U && t.type != A)
                                ) {
                                  e.next = 28;
                                  break;
                                }
                                if (
                                  l.ctx.currentPlayer === r &&
                                  null === l.ctx.activePlayers
                                ) {
                                  e.next = 28;
                                  break;
                                }
                                return (
                                  C(
                                    'playerID=['.concat(
                                      r,
                                      '] cannot undo / redo right now'
                                    )
                                  ),
                                  e.abrupt('return')
                                );
                              case 28:
                                if (
                                  t.type != G ||
                                  this.game.flow.canPlayerMakeMove(
                                    l.G,
                                    l.ctx,
                                    t
                                  )
                                ) {
                                  e.next = 31;
                                  break;
                                }
                                return (
                                  C(
                                    'move not processed - canPlayerMakeMove=false, playerID=['.concat(
                                      r,
                                      ']'
                                    )
                                  ),
                                  e.abrupt('return')
                                );
                              case 31:
                                if (
                                  t.type != L ||
                                  this.game.flow.canPlayerCallEvent(
                                    l.G,
                                    l.ctx,
                                    r
                                  )
                                ) {
                                  e.next = 34;
                                  break;
                                }
                                return (
                                  C(
                                    'event not processed - invalid playerID=['.concat(
                                      r,
                                      ']'
                                    )
                                  ),
                                  e.abrupt('return')
                                );
                              case 34:
                                if (l._stateID === a) {
                                  e.next = 37;
                                  break;
                                }
                                return (
                                  C(
                                    'invalid stateID, was=['
                                      .concat(a, '], expected=[')
                                      .concat(l._stateID, ']')
                                  ),
                                  e.abrupt('return')
                                );
                              case 37:
                                if (
                                  ((m = p.getState().log || []),
                                  p.dispatch(t),
                                  (l = p.getState()),
                                  this.transportAPI.sendAll(function(e) {
                                    var t = Object(v.a)({}, l, {
                                        G: h.game.playerView(l.G, l.ctx, e),
                                        ctx: Object(v.a)({}, l.ctx, {
                                          _random: void 0,
                                        }),
                                        log: void 0,
                                        deltalog: void 0,
                                        _undo: [],
                                        _redo: [],
                                        _initial: Object(v.a)({}, l._initial, {
                                          _undo: [],
                                          _redo: [],
                                        }),
                                      }),
                                      a = Ge(l.deltalog, e);
                                    return { type: 'update', args: [n, t, a] };
                                  }),
                                  (m = [].concat(
                                    Object(ae.a)(m),
                                    Object(ae.a)(l.deltalog)
                                  )),
                                  (d = Object(v.a)({}, l, { log: m })),
                                  !this.executeSynchronously)
                                ) {
                                  e.next = 47;
                                  break;
                                }
                                this.storageAPI.set(o, d), (e.next = 49);
                                break;
                              case 47:
                                return (e.next = 49), this.storageAPI.set(o, d);
                              case 49:
                              case 'end':
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function(t, a, n, r) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: 'onSync',
                value: (function() {
                  var e = Object(x.a)(
                    j.a.mark(function e(t, a, n) {
                      var r, s, i, c, o, l;
                      return j.a.wrap(
                        function(e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (((r = t), !this.executeSynchronously)) {
                                  e.next = 6;
                                  break;
                                }
                                (s = this.storageAPI.get(r)),
                                  (i = this.storageAPI.get(Me(t))),
                                  (e.next = 12);
                                break;
                              case 6:
                                return (e.next = 8), this.storageAPI.get(r);
                              case 8:
                                return (
                                  (s = e.sent),
                                  (e.next = 11),
                                  this.storageAPI.get(Me(t))
                                );
                              case 11:
                                i = e.sent;
                              case 12:
                                if (
                                  (i &&
                                    (c = Object.values(i.players).map(function(
                                      e
                                    ) {
                                      return { id: e.id, name: e.name };
                                    })),
                                  void 0 !== s)
                                ) {
                                  e.next = 25;
                                  break;
                                }
                                if (
                                  ((s = Ne({ game: this.game, numPlayers: n })),
                                  !this.executeSynchronously)
                                ) {
                                  e.next = 20;
                                  break;
                                }
                                this.storageAPI.set(r, s),
                                  (s = this.storageAPI.get(r)),
                                  (e.next = 25);
                                break;
                              case 20:
                                return (e.next = 22), this.storageAPI.set(r, s);
                              case 22:
                                return (e.next = 24), this.storageAPI.get(r);
                              case 24:
                                s = e.sent;
                              case 25:
                                return (
                                  (o = Object(v.a)({}, s, {
                                    G: this.game.playerView(s.G, s.ctx, a),
                                    ctx: Object(v.a)({}, s.ctx, {
                                      _random: void 0,
                                    }),
                                    log: void 0,
                                    deltalog: void 0,
                                    _undo: [],
                                    _redo: [],
                                    _initial: Object(v.a)({}, s._initial, {
                                      _undo: [],
                                      _redo: [],
                                    }),
                                  })),
                                  (l = Ge(s.log, a)),
                                  this.transportAPI.send({
                                    playerID: a,
                                    type: 'sync',
                                    args: [t, o, l, c],
                                  }),
                                  e.abrupt('return')
                                );
                              case 29:
                              case 'end':
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function(t, a, n) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
            ]),
            e
          );
        })();
      function Te(e) {
        var t = {},
          a = function(e) {
            var a = e.type,
              n = e.playerID,
              r = e.args,
              s = t[n];
            void 0 !== s && s.apply(null, [a].concat(Object(ae.a)(r)));
          },
          n = new Ae(
            e,
            new we(),
            {
              send: a,
              sendAll: function(e) {
                for (var n in t) {
                  var r = e(n),
                    s = r.type,
                    i = r.args;
                  a({ type: s, playerID: n, args: i });
                }
              },
            },
            !1
          );
        return (
          (n.executeSynchronously = !0),
          (n.connect = function(e, a, n) {
            t[a] = n;
          }),
          n
        );
      }
      var Re = (function() {
          function e(t) {
            var a = t.master,
              n = t.store,
              r = t.gameID,
              s = t.playerID,
              i = t.gameName,
              o = t.numPlayers;
            Object(c.a)(this, e),
              (this.master = a),
              (this.store = n),
              (this.gameName = i || 'default'),
              (this.gameID = r || 'default'),
              (this.playerID = s || null),
              (this.numPlayers = o || 2),
              (this.gameID = this.gameName + ':' + this.gameID),
              (this.isConnected = !0);
          }
          return (
            Object(o.a)(e, [
              {
                key: 'onUpdate',
                value: function(e, t, a) {
                  var n = this.store.getState();
                  if (e == this.gameID && t._stateID >= n._stateID) {
                    var r = Q(t, a);
                    this.store.dispatch(r);
                  }
                },
              },
              {
                key: 'onSync',
                value: function(e, t, a) {
                  if (e == this.gameID) {
                    var n = Y(t, a);
                    this.store.dispatch(n);
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
                  this.master.connect(this.gameID, this.playerID, function(t) {
                    for (
                      var a = arguments.length,
                        n = new Array(a > 1 ? a - 1 : 0),
                        r = 1;
                      r < a;
                      r++
                    )
                      n[r - 1] = arguments[r];
                    'sync' == t && e.onSync.apply(e, n),
                      'update' == t && e.onUpdate.apply(e, n);
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
                  var t = X(null);
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
                  var t = X(null);
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
        Ue = null;
      function qe(e, t, a, r, s, i) {
        return t.reduce(function(t, c) {
          return (
            (t[c] = function() {
              var t = r;
              i ||
                (null !== r && void 0 !== r) ||
                (t = a.getState().ctx.currentPlayer);
              for (
                var o = arguments.length, l = new Array(o), u = 0;
                u < o;
                u++
              )
                l[u] = arguments[u];
              a.dispatch(n[e](c, l, t, s));
            }),
            t
          );
        }, {});
      }
      var He = qe.bind(null, 'gameEvent'),
        Be = qe.bind(null, 'makeMove'),
        Ve = (function() {
          function e(t) {
            var a = this,
              n = t.game,
              r = t.ai,
              s = t.numPlayers,
              i = t.multiplayer,
              o = t.socketOpts,
              l = t.gameID,
              u = t.playerID,
              p = t.credentials,
              v = t.enhancer;
            if (
              (Object(c.a)(this, e),
              (this.game = Pe(n)),
              (this.playerID = u),
              (this.gameID = l),
              (this.credentials = p),
              (this.multiplayer = i),
              (this.subscribeCallback = function() {}),
              (this.reducer = Se({
                game: this.game,
                numPlayers: s,
                multiplayer: i,
              })),
              void 0 !== r && void 0 === i)
            ) {
              var m = new r.bot({ game: n, enumerate: r.enumerate });
              this.step = Object(x.a)(
                j.a.mark(function e() {
                  var t, n, r, s, i;
                  return j.a.wrap(
                    function(e) {
                      for (;;)
                        switch ((e.prev = e.next)) {
                          case 0:
                            return (
                              (t = a.store.getState()),
                              (n = t.ctx.currentPlayer),
                              t.ctx.activePlayers &&
                                (n = Object.keys(t.ctx.activePlayers)[0]),
                              (e.next = 5),
                              m.play(t, n)
                            );
                          case 5:
                            return (
                              (r = e.sent),
                              (s = r.action),
                              (i = r.metadata),
                              s &&
                                ((s.payload.metadata = i), a.store.dispatch(s)),
                              e.abrupt('return', s)
                            );
                          case 10:
                          case 'end':
                            return e.stop();
                        }
                    },
                    e,
                    this
                  );
                })
              );
            }
            var d = null;
            void 0 === i && (d = Ne({ game: this.game, numPlayers: s })),
              (this.reset = function() {
                a.store.dispatch(X(d));
              }),
              (this.undo = function() {
                a.store.dispatch(Z());
              }),
              (this.redo = function() {
                a.store.dispatch($());
              }),
              (this.store = null),
              (this.log = []);
            var h = function(e) {
                return function(t) {
                  return function(n) {
                    var r = t(n),
                      s = e.getState();
                    switch (n.type) {
                      case G:
                      case L:
                        var i = s.deltalog;
                        a.log = [].concat(Object(ae.a)(a.log), Object(ae.a)(i));
                        break;
                      case T:
                        a.log = [];
                        break;
                      case q:
                        var c = -1;
                        a.log.length > 0 &&
                          (c = a.log[a.log.length - 1]._stateID);
                        var o = n.deltalog || [];
                        (o = o.filter(function(e) {
                          return e._stateID > c;
                        })),
                          (a.log = [].concat(
                            Object(ae.a)(a.log),
                            Object(ae.a)(o)
                          ));
                        break;
                      case R:
                        a.log = n.log || [];
                    }
                    return r;
                  };
                };
              },
              f = function(e) {
                return function(t) {
                  return function(n) {
                    var r = e.getState(),
                      s = t(n);
                    return 1 != n.clientOnly && a.transport.onAction(r, n), s;
                  };
                };
              },
              y = function() {
                return function(e) {
                  return function(t) {
                    var n = e(t);
                    return a.subscribeCallback(), n;
                  };
                };
              };
            (v =
              void 0 !== v
                ? Object(ne.b)(Object(ne.a)(y, f, h), v)
                : Object(ne.a)(y, f, h)),
              (this.store = Object(ne.c)(this.reducer, d, v)),
              (this.transport = {
                isConnected: !0,
                onAction: function() {},
                subscribe: function() {},
                subscribeGameMetadata: function(e) {},
                connect: function() {},
                updateGameID: function() {},
                updatePlayerID: function() {},
              }),
              void 0 !== i &&
                (!0 === i && (i = { server: '' }),
                !0 === i.local
                  ? ((null !== Ue && Ue.config === n) ||
                      ((Ue = new Te(this.game)).config = n),
                    (this.transport = new Re({
                      master: Ue,
                      store: this.store,
                      gameID: l,
                      playerID: u,
                      gameName: this.game.name,
                      numPlayers: s,
                    })))
                  : void 0 !== i.server
                  ? (this.transport = new De({
                      store: this.store,
                      gameID: l,
                      playerID: u,
                      gameName: this.game.name,
                      numPlayers: s,
                      server: i.server,
                      socketOpts: o,
                    }))
                  : void 0 !== i.transport
                  ? (this.transport = new i.transport({
                      store: this.store,
                      gameID: l,
                      playerID: u,
                      gameName: n.name,
                      numPlayers: s,
                    }))
                  : C('invalid multiplayer spec')),
              this.createDispatchers(),
              this.transport.subscribeGameMetadata(function(e) {
                a.gameMetadata = e;
              });
          }
          return (
            Object(o.a)(e, [
              {
                key: 'subscribe',
                value: function(e) {
                  var t = this,
                    a = function() {
                      return e(t.getState());
                    };
                  this.transport.subscribe(a), (this.subscribeCallback = a);
                },
              },
              {
                key: 'getState',
                value: function() {
                  var e = this.store.getState();
                  if (null === e) return e;
                  var t = !0,
                    a = this.game.flow.canPlayerMakeAnyMove(
                      e.G,
                      e.ctx,
                      this.playerID
                    );
                  this.multiplayer && !a && (t = !1),
                    this.multiplayer ||
                      null === this.playerID ||
                      void 0 === this.playerID ||
                      a ||
                      (t = !1),
                    void 0 !== e.ctx.gameover && (t = !1);
                  var n = this.game.playerView(e.G, e.ctx, this.playerID),
                    r = Object(v.a)({}, e, {
                      isActive: t,
                      G: n,
                      log: this.log,
                    }),
                    s = this.transport.isConnected;
                  return (r = Object(v.a)({}, r, { isConnected: s }));
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
                  (this.moves = Be(
                    this.game.moveNames,
                    this.store,
                    this.playerID,
                    this.credentials,
                    this.multiplayer
                  )),
                    (this.events = He(
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
      function Je(e) {
        var t,
          a,
          n = e.game,
          r = e.numPlayers,
          s = e.loading,
          i = e.board,
          f = e.multiplayer,
          b = e.ai,
          O = e.debug,
          j = e.enhancer;
        if (void 0 === s) {
          s = function() {
            return y.a.createElement(
              'div',
              { className: 'bgio-loading' },
              'connecting...'
            );
          };
        }
        return (
          (a = t = (function(e) {
            function t(e) {
              var a, s;
              return (
                Object(c.a)(this, t),
                (a = Object(l.a)(this, Object(u.a)(t).call(this, e))),
                Object(h.a)(Object(d.a)(Object(d.a)(a)), 'state', {
                  gameStateOverride: null,
                }),
                Object(h.a)(
                  Object(d.a)(Object(d.a)(a)),
                  'updateGameID',
                  function(e) {
                    a.client.updateGameID(e), (a.gameID = e), a.forceUpdate();
                  }
                ),
                Object(h.a)(
                  Object(d.a)(Object(d.a)(a)),
                  'updatePlayerID',
                  function(e) {
                    a.client.updatePlayerID(e),
                      (a.playerID = e),
                      a.forceUpdate();
                  }
                ),
                Object(h.a)(
                  Object(d.a)(Object(d.a)(a)),
                  'updateCredentials',
                  function(e) {
                    a.client.updateCredentials(e),
                      (a.credentials = e),
                      a.forceUpdate();
                  }
                ),
                Object(h.a)(
                  Object(d.a)(Object(d.a)(a)),
                  'overrideGameState',
                  function(e) {
                    a.setState({ gameStateOverride: e });
                  }
                ),
                (a.client =
                  ((s = {
                    game: n,
                    ai: b,
                    numPlayers: r,
                    multiplayer: f,
                    gameID: e.gameID,
                    playerID: e.playerID,
                    credentials: e.credentials,
                    enhancer: j,
                  }),
                  new Ve(s))),
                (a.gameID = e.gameID),
                (a.playerID = e.playerID),
                (a.credentials = e.credentials),
                a.client.subscribe(function() {
                  return a.forceUpdate();
                }),
                a
              );
            }
            return (
              Object(p.a)(t, e),
              Object(o.a)(t, [
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
                      t = null,
                      a = this.client.getState(),
                      n = this.props,
                      r = n.debug,
                      c = Object(m.a)(n, ['debug']);
                    if (
                      (this.state.gameStateOverride &&
                        (a = Object(v.a)({}, a, this.state.gameStateOverride)),
                      null === a)
                    )
                      return y.a.createElement(s);
                    if (
                      (i &&
                        (e = y.a.createElement(
                          i,
                          Object(v.a)({}, a, c, {
                            isMultiplayer: void 0 !== f,
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
                      !1 !== O && r)
                    ) {
                      var o = 'object' === typeof O && O.showGameInfo,
                        l = 'object' === typeof O && O.dockControls;
                      t = y.a.createElement(te, {
                        gamestate: a,
                        reducer: this.client.reducer,
                        store: this.client.store,
                        isMultiplayer: void 0 !== f,
                        moves: this.client.moves,
                        events: this.client.events,
                        gameID: this.gameID,
                        playerID: this.playerID,
                        credentials: this.credentials,
                        step: this.client.step,
                        reset: this.client.reset,
                        undo: this.client.undo,
                        redo: this.client.redo,
                        visualizeAI: b && b.visualize,
                        overrideGameState: this.overrideGameState,
                        updateGameID: this.updateGameID,
                        updatePlayerID: this.updatePlayerID,
                        updateCredentials: this.updateCredentials,
                        showGameInfo: o,
                        dockControls: l,
                      });
                    }
                    return y.a.createElement(
                      'div',
                      { className: 'bgio-client' },
                      t,
                      e
                    );
                  },
                },
              ]),
              t
            );
          })(y.a.Component)),
          Object(h.a)(t, 'propTypes', {
            gameID: g.a.string,
            playerID: g.a.string,
            credentials: g.a.string,
            debug: g.a.any,
          }),
          Object(h.a)(t, 'defaultProps', {
            gameID: 'default',
            playerID: null,
            credentials: null,
            debug: !0,
          }),
          a
        );
      }
      var Fe = a(32),
        Ke = a.n(Fe),
        ze = (function() {
          function e(t) {
            var a = t.server,
              n = t.gameComponents,
              r = t.playerName,
              s = t.playerCredentials;
            Object(c.a)(this, e),
              (this.gameComponents = n),
              (this.playerName = r || 'Visitor'),
              (this.playerCredentials = s),
              (this.server = a),
              (this.rooms = []);
          }
          return (
            Object(o.a)(e, [
              {
                key: '_baseUrl',
                value: function() {
                  return ''.concat(this.server || '', '/games');
                },
              },
              {
                key: 'refresh',
                value: (function() {
                  var e = Object(x.a)(
                    j.a.mark(function e() {
                      var t, a, n, r, s, i, c, o, l, u, p, v, m, d, h;
                      return j.a.wrap(
                        function(e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (e.prev = 0),
                                  (this.rooms.length = 0),
                                  (e.next = 4),
                                  fetch(this._baseUrl())
                                );
                              case 4:
                                if (200 === (t = e.sent).status) {
                                  e.next = 7;
                                  break;
                                }
                                throw new Error('HTTP status ' + t.status);
                              case 7:
                                return (e.next = 9), t.json();
                              case 9:
                                (a = e.sent),
                                  (n = !0),
                                  (r = !1),
                                  (s = void 0),
                                  (e.prev = 13),
                                  (i = a[Symbol.iterator]());
                              case 15:
                                if ((n = (c = i.next()).done)) {
                                  e.next = 48;
                                  break;
                                }
                                if (
                                  ((o = c.value), this._getGameComponents(o))
                                ) {
                                  e.next = 19;
                                  break;
                                }
                                return e.abrupt('continue', 45);
                              case 19:
                                return (
                                  (e.next = 21),
                                  fetch(this._baseUrl() + '/' + o)
                                );
                              case 21:
                                return (l = e.sent), (e.next = 24), l.json();
                              case 24:
                                for (
                                  u = e.sent,
                                    p = !0,
                                    v = !1,
                                    m = void 0,
                                    e.prev = 28,
                                    d = u.rooms[Symbol.iterator]();
                                  !(p = (h = d.next()).done);
                                  p = !0
                                )
                                  h.value.gameName = o;
                                e.next = 36;
                                break;
                              case 32:
                                (e.prev = 32),
                                  (e.t0 = e.catch(28)),
                                  (v = !0),
                                  (m = e.t0);
                              case 36:
                                (e.prev = 36),
                                  (e.prev = 37),
                                  p || null == d.return || d.return();
                              case 39:
                                if (((e.prev = 39), !v)) {
                                  e.next = 42;
                                  break;
                                }
                                throw m;
                              case 42:
                                return e.finish(39);
                              case 43:
                                return e.finish(36);
                              case 44:
                                this.rooms = this.rooms.concat(u.rooms);
                              case 45:
                                (n = !0), (e.next = 15);
                                break;
                              case 48:
                                e.next = 54;
                                break;
                              case 50:
                                (e.prev = 50),
                                  (e.t1 = e.catch(13)),
                                  (r = !0),
                                  (s = e.t1);
                              case 54:
                                (e.prev = 54),
                                  (e.prev = 55),
                                  n || null == i.return || i.return();
                              case 57:
                                if (((e.prev = 57), !r)) {
                                  e.next = 60;
                                  break;
                                }
                                throw s;
                              case 60:
                                return e.finish(57);
                              case 61:
                                return e.finish(54);
                              case 62:
                                e.next = 67;
                                break;
                              case 64:
                                throw ((e.prev = 64),
                                (e.t2 = e.catch(0)),
                                new Error(
                                  'failed to retrieve list of games (' +
                                    e.t2 +
                                    ')'
                                ));
                              case 67:
                              case 'end':
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [
                          [0, 64],
                          [13, 50, 54, 62],
                          [28, 32, 36, 44],
                          [37, , 39, 43],
                          [55, , 57, 61],
                        ]
                      );
                    })
                  );
                  return function() {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: '_getGameInstance',
                value: function(e) {
                  var t = !0,
                    a = !1,
                    n = void 0;
                  try {
                    for (
                      var r, s = this.rooms[Symbol.iterator]();
                      !(t = (r = s.next()).done);
                      t = !0
                    ) {
                      var i = r.value;
                      if (i.gameID === e) return i;
                    }
                  } catch (c) {
                    (a = !0), (n = c);
                  } finally {
                    try {
                      t || null == s.return || s.return();
                    } finally {
                      if (a) throw n;
                    }
                  }
                },
              },
              {
                key: '_getGameComponents',
                value: function(e) {
                  var t = !0,
                    a = !1,
                    n = void 0;
                  try {
                    for (
                      var r, s = this.gameComponents[Symbol.iterator]();
                      !(t = (r = s.next()).done);
                      t = !0
                    ) {
                      var i = r.value;
                      if (i.game.name === e) return i;
                    }
                  } catch (c) {
                    (a = !0), (n = c);
                  } finally {
                    try {
                      t || null == s.return || s.return();
                    } finally {
                      if (a) throw n;
                    }
                  }
                },
              },
              {
                key: '_findPlayer',
                value: function(e) {
                  var t = !0,
                    a = !1,
                    n = void 0;
                  try {
                    for (
                      var r, s = this.rooms[Symbol.iterator]();
                      !(t = (r = s.next()).done);
                      t = !0
                    ) {
                      var i = r.value;
                      if (
                        i.players.some(function(t) {
                          return t.name === e;
                        })
                      )
                        return i;
                    }
                  } catch (c) {
                    (a = !0), (n = c);
                  } finally {
                    try {
                      t || null == s.return || s.return();
                    } finally {
                      if (a) throw n;
                    }
                  }
                },
              },
              {
                key: 'join',
                value: (function() {
                  var e = Object(x.a)(
                    j.a.mark(function e(t, a, n) {
                      var r, s, i;
                      return j.a.wrap(
                        function(e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (
                                  ((e.prev = 0),
                                  !(r = this._findPlayer(this.playerName)))
                                ) {
                                  e.next = 4;
                                  break;
                                }
                                throw new Error(
                                  'player has already joined ' + r.gameID
                                );
                              case 4:
                                if ((r = this._getGameInstance(a))) {
                                  e.next = 7;
                                  break;
                                }
                                throw new Error(
                                  'game instance ' + a + ' not found'
                                );
                              case 7:
                                return (
                                  (e.next = 9),
                                  fetch(
                                    this._baseUrl() +
                                      '/' +
                                      t +
                                      '/' +
                                      a +
                                      '/join',
                                    {
                                      method: 'POST',
                                      body: JSON.stringify({
                                        playerID: n,
                                        playerName: this.playerName,
                                      }),
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                    }
                                  )
                                );
                              case 9:
                                if (200 === (s = e.sent).status) {
                                  e.next = 12;
                                  break;
                                }
                                throw new Error('HTTP status ' + s.status);
                              case 12:
                                return (e.next = 14), s.json();
                              case 14:
                                (i = e.sent),
                                  (r.players[
                                    Number.parseInt(n)
                                  ].name = this.playerName),
                                  (this.playerCredentials =
                                    i.playerCredentials),
                                  (e.next = 22);
                                break;
                              case 19:
                                throw ((e.prev = 19),
                                (e.t0 = e.catch(0)),
                                new Error(
                                  'failed to join room ' + a + ' (' + e.t0 + ')'
                                ));
                              case 22:
                              case 'end':
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [[0, 19]]
                      );
                    })
                  );
                  return function(t, a, n) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: 'leave',
                value: (function() {
                  var e = Object(x.a)(
                    j.a.mark(function e(t, a) {
                      var n, r, s, i, c, o, l, u;
                      return j.a.wrap(
                        function(e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (
                                  ((e.prev = 0), (n = this._getGameInstance(a)))
                                ) {
                                  e.next = 4;
                                  break;
                                }
                                throw new Error('game instance not found');
                              case 4:
                                (r = !0),
                                  (s = !1),
                                  (i = void 0),
                                  (e.prev = 7),
                                  (c = n.players[Symbol.iterator]());
                              case 9:
                                if ((r = (o = c.next()).done)) {
                                  e.next = 23;
                                  break;
                                }
                                if ((l = o.value).name !== this.playerName) {
                                  e.next = 20;
                                  break;
                                }
                                return (
                                  (e.next = 14),
                                  fetch(
                                    this._baseUrl() +
                                      '/' +
                                      t +
                                      '/' +
                                      a +
                                      '/leave',
                                    {
                                      method: 'POST',
                                      body: JSON.stringify({
                                        playerID: l.id,
                                        credentials: this.playerCredentials,
                                      }),
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                    }
                                  )
                                );
                              case 14:
                                if (200 === (u = e.sent).status) {
                                  e.next = 17;
                                  break;
                                }
                                throw new Error('HTTP status ' + u.status);
                              case 17:
                                return (
                                  delete l.name,
                                  delete this.playerCredentials,
                                  e.abrupt('return')
                                );
                              case 20:
                                (r = !0), (e.next = 9);
                                break;
                              case 23:
                                e.next = 29;
                                break;
                              case 25:
                                (e.prev = 25),
                                  (e.t0 = e.catch(7)),
                                  (s = !0),
                                  (i = e.t0);
                              case 29:
                                (e.prev = 29),
                                  (e.prev = 30),
                                  r || null == c.return || c.return();
                              case 32:
                                if (((e.prev = 32), !s)) {
                                  e.next = 35;
                                  break;
                                }
                                throw i;
                              case 35:
                                return e.finish(32);
                              case 36:
                                return e.finish(29);
                              case 37:
                                throw new Error('player not found in room');
                              case 40:
                                throw ((e.prev = 40),
                                (e.t1 = e.catch(0)),
                                new Error(
                                  'failed to leave room ' +
                                    a +
                                    ' (' +
                                    e.t1 +
                                    ')'
                                ));
                              case 43:
                              case 'end':
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [[0, 40], [7, 25, 29, 37], [30, , 32, 36]]
                      );
                    })
                  );
                  return function(t, a) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: 'disconnect',
                value: (function() {
                  var e = Object(x.a)(
                    j.a.mark(function e() {
                      var t;
                      return j.a.wrap(
                        function(e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (!(t = this._findPlayer(this.playerName))) {
                                  e.next = 4;
                                  break;
                                }
                                return (
                                  (e.next = 4), this.leave(t.gameName, t.gameID)
                                );
                              case 4:
                                (this.rooms = []),
                                  (this.playerName = 'Visitor');
                              case 6:
                              case 'end':
                                return e.stop();
                            }
                        },
                        e,
                        this
                      );
                    })
                  );
                  return function() {
                    return e.apply(this, arguments);
                  };
                })(),
              },
              {
                key: 'create',
                value: (function() {
                  var e = Object(x.a)(
                    j.a.mark(function e(t, a) {
                      var n, r;
                      return j.a.wrap(
                        function(e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                if (
                                  ((e.prev = 0),
                                  (n = this._getGameComponents(t)))
                                ) {
                                  e.next = 4;
                                  break;
                                }
                                throw new Error('game not found');
                              case 4:
                                if (
                                  !(
                                    a < n.game.minPlayers ||
                                    a > n.game.maxPlayers
                                  )
                                ) {
                                  e.next = 6;
                                  break;
                                }
                                throw new Error(
                                  'invalid number of players ' + a
                                );
                              case 6:
                                return (
                                  (e.next = 8),
                                  fetch(this._baseUrl() + '/' + t + '/create', {
                                    method: 'POST',
                                    body: JSON.stringify({ numPlayers: a }),
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                  })
                                );
                              case 8:
                                if (200 === (r = e.sent).status) {
                                  e.next = 11;
                                  break;
                                }
                                throw new Error('HTTP status ' + r.status);
                              case 11:
                                e.next = 16;
                                break;
                              case 13:
                                throw ((e.prev = 13),
                                (e.t0 = e.catch(0)),
                                new Error(
                                  'failed to create room for ' +
                                    t +
                                    ' (' +
                                    e.t0 +
                                    ')'
                                ));
                              case 16:
                              case 'end':
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [[0, 13]]
                      );
                    })
                  );
                  return function(t, a) {
                    return e.apply(this, arguments);
                  };
                })(),
              },
            ]),
            e
          );
        })();
      var We = (function(e) {
        function t() {
          var e, a;
          Object(c.a)(this, t);
          for (var n = arguments.length, r = new Array(n), s = 0; s < n; s++)
            r[s] = arguments[s];
          return (
            (a = Object(l.a)(
              this,
              (e = Object(u.a)(t)).call.apply(e, [this].concat(r))
            )),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'state', {
              playerName: a.props.playerName,
              nameErrorMsg: '',
            }),
            Object(h.a)(
              Object(d.a)(Object(d.a)(a)),
              'onClickEnter',
              function() {
                '' !== a.state.playerName &&
                  a.props.onEnter(a.state.playerName);
              }
            ),
            Object(h.a)(Object(d.a)(Object(d.a)(a)), 'onKeyPress', function(e) {
              'Enter' === e.key && a.onClickEnter();
            }),
            Object(h.a)(
              Object(d.a)(Object(d.a)(a)),
              'onChangePlayerName',
              function(e) {
                var t = e.target.value.trim();
                a.setState({
                  playerName: t,
                  nameErrorMsg: t.length > 0 ? '' : 'empty player name',
                });
              }
            ),
            a
          );
        }
        return (
          Object(p.a)(t, e),
          Object(o.a)(t, [
            {
              key: 'render',
              value: function() {
                return y.a.createElement(
                  'div',
                  null,
                  y.a.createElement(
                    'p',
                    { className: 'phase-title' },
                    'Choose a player name:'
                  ),
                  y.a.createElement('input', {
                    type: 'text',
                    value: this.state.playerName,
                    onChange: this.onChangePlayerName,
                    onKeyPress: this.onKeyPress,
                  }),
                  y.a.createElement(
                    'span',
                    { className: 'buttons' },
                    y.a.createElement(
                      'button',
                      { className: 'buttons', onClick: this.onClickEnter },
                      'Enter'
                    )
                  ),
                  y.a.createElement('br', null),
                  y.a.createElement(
                    'span',
                    { className: 'error-msg' },
                    this.state.nameErrorMsg,
                    y.a.createElement('br', null)
                  )
                );
              },
            },
          ]),
          t
        );
      })(y.a.Component);
      Object(h.a)(We, 'propTypes', {
        playerName: g.a.string,
        onEnter: g.a.func.isRequired,
      }),
        Object(h.a)(We, 'defaultProps', { playerName: '' });
      var Ye = We,
        Qe = (function(e) {
          function t() {
            var e, a;
            Object(c.a)(this, t);
            for (var n = arguments.length, r = new Array(n), s = 0; s < n; s++)
              r[s] = arguments[s];
            return (
              (a = Object(l.a)(
                this,
                (e = Object(u.a)(t)).call.apply(e, [this].concat(r))
              )),
              Object(h.a)(Object(d.a)(Object(d.a)(a)), '_createSeat', function(
                e
              ) {
                return e.name || '[free]';
              }),
              Object(h.a)(
                Object(d.a)(Object(d.a)(a)),
                '_createInstanceButtons',
                function(e) {
                  var t = e.players.find(function(e) {
                      return e.name === a.props.playerName;
                    }),
                    n = e.players.find(function(e) {
                      return !e.name;
                    });
                  return t && n
                    ? y.a.createElement(
                        'button',
                        {
                          onClick: function() {
                            return a.props.onClickLeave(e.gameName, e.gameID);
                          },
                        },
                        'Leave'
                      )
                    : n
                    ? y.a.createElement(
                        'button',
                        {
                          onClick: function() {
                            return a.props.onClickJoin(
                              e.gameName,
                              e.gameID,
                              '' + n.id
                            );
                          },
                        },
                        'Join'
                      )
                    : t
                    ? y.a.createElement(
                        'button',
                        {
                          onClick: function() {
                            return a.props.onClickPlay(e.gameName, {
                              gameID: e.gameID,
                              playerID: '' + t.id,
                              numPlayers: e.players.length,
                            });
                          },
                        },
                        'Play'
                      )
                    : y.a.createElement(
                        'button',
                        {
                          onClick: function() {
                            return a.props.onClickPlay(e.gameName, {
                              gameID: e.gameID,
                              numPlayers: e.players.length,
                            });
                          },
                        },
                        'Spectate'
                      );
                }
              ),
              a
            );
          }
          return (
            Object(p.a)(t, e),
            Object(o.a)(t, [
              {
                key: 'render',
                value: function() {
                  var e = this.props.room,
                    t = 'OPEN';
                  return (
                    e.players.find(function(e) {
                      return !e.name;
                    }) || (t = 'RUNNING'),
                    y.a.createElement(
                      'tr',
                      { key: 'line-' + e.gameID },
                      y.a.createElement(
                        'td',
                        { key: 'cell-name-' + e.gameID },
                        e.gameName
                      ),
                      y.a.createElement(
                        'td',
                        { key: 'cell-status-' + e.gameID },
                        t
                      ),
                      y.a.createElement(
                        'td',
                        { key: 'cell-seats-' + e.gameID },
                        e.players.map(this._createSeat).join(', ')
                      ),
                      y.a.createElement(
                        'td',
                        { key: 'cell-buttons-' + e.gameID },
                        this._createInstanceButtons(e)
                      )
                    )
                  );
                },
              },
            ]),
            t
          );
        })(y.a.Component);
      Object(h.a)(Qe, 'propTypes', {
        room: g.a.shape({
          gameName: g.a.string.isRequired,
          gameID: g.a.string.isRequired,
          players: g.a.array.isRequired,
        }),
        playerName: g.a.string.isRequired,
        onClickJoin: g.a.func.isRequired,
        onClickLeave: g.a.func.isRequired,
        onClickPlay: g.a.func.isRequired,
      });
      var Xe = Qe,
        Ze = (function(e) {
          function t(e) {
            var a;
            Object(c.a)(this, t),
              (a = Object(l.a)(this, Object(u.a)(t).call(this, e))),
              Object(h.a)(Object(d.a)(Object(d.a)(a)), 'state', {
                selectedGame: 0,
                numPlayers: 2,
              }),
              Object(h.a)(
                Object(d.a)(Object(d.a)(a)),
                '_createGameNameOption',
                function(e, t) {
                  return y.a.createElement(
                    'option',
                    { key: 'name-option-' + t, value: t },
                    e.game.name
                  );
                }
              ),
              Object(h.a)(
                Object(d.a)(Object(d.a)(a)),
                '_createNumPlayersOption',
                function(e) {
                  return y.a.createElement(
                    'option',
                    { key: 'num-option-' + e, value: e },
                    e
                  );
                }
              ),
              Object(h.a)(
                Object(d.a)(Object(d.a)(a)),
                '_createNumPlayersRange',
                function(e) {
                  return Object(ae.a)(new Array(e.maxPlayers + 1).keys()).slice(
                    e.minPlayers
                  );
                }
              ),
              Object(h.a)(
                Object(d.a)(Object(d.a)(a)),
                'onChangeNumPlayers',
                function(e) {
                  a.setState({ numPlayers: Number.parseInt(e.target.value) });
                }
              ),
              Object(h.a)(
                Object(d.a)(Object(d.a)(a)),
                'onChangeSelectedGame',
                function(e) {
                  var t = Number.parseInt(e.target.value);
                  a.setState({
                    selectedGame: t,
                    numPlayers: a.props.games[t].game.minPlayers,
                  });
                }
              ),
              Object(h.a)(
                Object(d.a)(Object(d.a)(a)),
                'onClickCreate',
                function() {
                  a.props.createGame(
                    a.props.games[a.state.selectedGame].game.name,
                    a.state.numPlayers
                  );
                }
              );
            var n = !0,
              r = !1,
              s = void 0;
            try {
              for (
                var i, o = e.games[Symbol.iterator]();
                !(n = (i = o.next()).done);
                n = !0
              ) {
                var p = i.value.game;
                p.minPlayers || (p.minPlayers = 1),
                  p.maxPlayers || (p.maxPlayers = 4),
                  console.assert(p.maxPlayers >= p.minPlayers);
              }
            } catch (v) {
              (r = !0), (s = v);
            } finally {
              try {
                n || null == o.return || o.return();
              } finally {
                if (r) throw s;
              }
            }
            return (
              (a.state = {
                selectedGame: 0,
                numPlayers: e.games[0].game.minPlayers,
              }),
              a
            );
          }
          return (
            Object(p.a)(t, e),
            Object(o.a)(t, [
              {
                key: 'render',
                value: function() {
                  var e = this;
                  return y.a.createElement(
                    'div',
                    null,
                    y.a.createElement(
                      'select',
                      {
                        value: this.state.selectedGame,
                        onChange: function(t) {
                          return e.onChangeSelectedGame(t);
                        },
                      },
                      this.props.games.map(this._createGameNameOption)
                    ),
                    y.a.createElement('span', null, 'Players:'),
                    y.a.createElement(
                      'select',
                      {
                        value: this.state.numPlayers,
                        onChange: this.onChangeNumPlayers,
                      },
                      this._createNumPlayersRange(
                        this.props.games[this.state.selectedGame].game
                      ).map(this._createNumPlayersOption)
                    ),
                    y.a.createElement(
                      'span',
                      { className: 'buttons' },
                      y.a.createElement(
                        'button',
                        { onClick: this.onClickCreate },
                        'Create'
                      )
                    )
                  );
                },
              },
            ]),
            t
          );
        })(y.a.Component);
      Object(h.a)(Ze, 'propTypes', {
        games: g.a.array.isRequired,
        createGame: g.a.func.isRequired,
      });
      var $e = Ze,
        et = { ENTER: 'enter', PLAY: 'play', LIST: 'list' },
        tt = (function(e) {
          function t(e) {
            var a;
            return (
              Object(c.a)(this, t),
              (a = Object(l.a)(this, Object(u.a)(t).call(this, e))),
              Object(h.a)(Object(d.a)(Object(d.a)(a)), 'state', {
                phase: et.ENTER,
                playerName: 'Visitor',
                runningGame: null,
                errorMsg: '',
                credentialStore: {},
              }),
              Object(h.a)(
                Object(d.a)(Object(d.a)(a)),
                '_createConnection',
                function(e) {
                  var t,
                    n = a.state.playerName;
                  a.connection =
                    ((t = {
                      server: e.lobbyServer,
                      gameComponents: e.gameComponents,
                      playerName: n,
                      playerCredentials: a.state.credentialStore[n],
                    }),
                    new ze(t));
                }
              ),
              Object(h.a)(
                Object(d.a)(Object(d.a)(a)),
                '_updateCredentials',
                function(e, t) {
                  a.setState(function(a) {
                    var n = Object.assign({}, a.credentialStore);
                    return (n[[e]] = t), { credentialStore: n };
                  });
                }
              ),
              Object(h.a)(
                Object(d.a)(Object(d.a)(a)),
                '_updateConnection',
                Object(x.a)(
                  j.a.mark(function e() {
                    return j.a.wrap(
                      function(e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (e.next = 2), a.connection.refresh();
                            case 2:
                              a.forceUpdate();
                            case 3:
                            case 'end':
                              return e.stop();
                          }
                      },
                      e,
                      this
                    );
                  })
                )
              ),
              Object(h.a)(Object(d.a)(Object(d.a)(a)), '_enterLobby', function(
                e
              ) {
                a.setState({ playerName: e, phase: et.LIST });
              }),
              Object(h.a)(
                Object(d.a)(Object(d.a)(a)),
                '_exitLobby',
                Object(x.a)(
                  j.a.mark(function e() {
                    return j.a.wrap(
                      function(e) {
                        for (;;)
                          switch ((e.prev = e.next)) {
                            case 0:
                              return (e.next = 2), a.connection.disconnect();
                            case 2:
                              a.setState({ phase: et.ENTER, errorMsg: '' });
                            case 3:
                            case 'end':
                              return e.stop();
                          }
                      },
                      e,
                      this
                    );
                  })
                )
              ),
              Object(h.a)(
                Object(d.a)(Object(d.a)(a)),
                '_createRoom',
                (function() {
                  var e = Object(x.a)(
                    j.a.mark(function e(t, n) {
                      return j.a.wrap(
                        function(e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (e.prev = 0),
                                  (e.next = 3),
                                  a.connection.create(t, n)
                                );
                              case 3:
                                return (e.next = 5), a.connection.refresh();
                              case 5:
                                a.setState({}), (e.next = 11);
                                break;
                              case 8:
                                (e.prev = 8),
                                  (e.t0 = e.catch(0)),
                                  a.setState({ errorMsg: e.t0.message });
                              case 11:
                              case 'end':
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [[0, 8]]
                      );
                    })
                  );
                  return function(t, a) {
                    return e.apply(this, arguments);
                  };
                })()
              ),
              Object(h.a)(
                Object(d.a)(Object(d.a)(a)),
                '_joinRoom',
                (function() {
                  var e = Object(x.a)(
                    j.a.mark(function e(t, n, r) {
                      return j.a.wrap(
                        function(e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (e.prev = 0),
                                  (e.next = 3),
                                  a.connection.join(t, n, r)
                                );
                              case 3:
                                return (e.next = 5), a.connection.refresh();
                              case 5:
                                a._updateCredentials(
                                  a.connection.playerName,
                                  a.connection.playerCredentials
                                ),
                                  (e.next = 11);
                                break;
                              case 8:
                                (e.prev = 8),
                                  (e.t0 = e.catch(0)),
                                  a.setState({ errorMsg: e.t0.message });
                              case 11:
                              case 'end':
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [[0, 8]]
                      );
                    })
                  );
                  return function(t, a, n) {
                    return e.apply(this, arguments);
                  };
                })()
              ),
              Object(h.a)(
                Object(d.a)(Object(d.a)(a)),
                '_leaveRoom',
                (function() {
                  var e = Object(x.a)(
                    j.a.mark(function e(t, n) {
                      return j.a.wrap(
                        function(e) {
                          for (;;)
                            switch ((e.prev = e.next)) {
                              case 0:
                                return (
                                  (e.prev = 0),
                                  (e.next = 3),
                                  a.connection.leave(t, n)
                                );
                              case 3:
                                return (e.next = 5), a.connection.refresh();
                              case 5:
                                a._updateCredentials(
                                  a.connection.playerName,
                                  a.connection.playerCredentials
                                ),
                                  (e.next = 11);
                                break;
                              case 8:
                                (e.prev = 8),
                                  (e.t0 = e.catch(0)),
                                  a.setState({ errorMsg: e.t0.message });
                              case 11:
                              case 'end':
                                return e.stop();
                            }
                        },
                        e,
                        this,
                        [[0, 8]]
                      );
                    })
                  );
                  return function(t, a) {
                    return e.apply(this, arguments);
                  };
                })()
              ),
              Object(h.a)(Object(d.a)(Object(d.a)(a)), '_startGame', function(
                e,
                t
              ) {
                var n = a.connection._getGameComponents(e);
                if (n) {
                  var r = void 0;
                  t.numPlayers > 1 &&
                    (r = !a.props.gameServer || { server: a.props.gameServer });
                  var s = {
                    app: a.props.clientFactory({
                      game: n.game,
                      board: n.board,
                      debug: a.props.debug,
                      multiplayer: r,
                    }),
                    gameID: t.gameID,
                    playerID: t.numPlayers > 1 ? t.playerID : null,
                    credentials: a.connection.playerCredentials,
                  };
                  a.setState({ phase: et.PLAY, runningGame: s });
                } else a.setState({ errorMsg: 'game ' + e + ' not supported' });
              }),
              Object(h.a)(Object(d.a)(Object(d.a)(a)), '_exitRoom', function() {
                a.setState({ phase: et.LIST, runningGame: null });
              }),
              Object(h.a)(
                Object(d.a)(Object(d.a)(a)),
                '_getPhaseVisibility',
                function(e) {
                  return a.state.phase !== e ? 'hidden' : 'phase';
                }
              ),
              Object(h.a)(Object(d.a)(Object(d.a)(a)), 'renderRooms', function(
                e,
                t
              ) {
                return e.map(function(e) {
                  var n = e.gameID,
                    r = e.gameName,
                    s = e.players;
                  return y.a.createElement(Xe, {
                    key: 'instance-' + n,
                    room: { gameID: n, gameName: r, players: Object.values(s) },
                    playerName: t,
                    onClickJoin: a._joinRoom,
                    onClickLeave: a._leaveRoom,
                    onClickPlay: a._startGame,
                  });
                });
              }),
              a._createConnection(a.props),
              a._updateConnection(),
              a
            );
          }
          return (
            Object(p.a)(t, e),
            Object(o.a)(t, [
              {
                key: 'componentDidMount',
                value: function() {
                  var e = Ke.a.load('lobbyState') || {};
                  e.phase && e.phase === et.PLAY && (e.phase = et.LIST),
                    this.setState({
                      phase: e.phase || et.ENTER,
                      playerName: e.playerName || 'Visitor',
                      credentialStore: e.credentialStore || {},
                    });
                },
              },
              {
                key: 'componentDidUpdate',
                value: function(e, t) {
                  var a = this.state.playerName,
                    n = this.state.credentialStore[a];
                  if (
                    t.phase !== this.state.phase ||
                    t.credentialStore[a] !== n ||
                    t.playerName !== a
                  ) {
                    this._createConnection(this.props),
                      this._updateConnection();
                    var r = {
                      phase: this.state.phase,
                      playerName: a,
                      credentialStore: this.state.credentialStore,
                    };
                    Ke.a.save('lobbyState', r, { path: '/' });
                  }
                },
              },
              {
                key: 'render',
                value: function() {
                  var e = this.props,
                    t = e.gameComponents,
                    a = e.renderer,
                    n = this.state,
                    r = n.errorMsg,
                    s = n.playerName,
                    i = n.phase,
                    c = n.runningGame;
                  return a
                    ? a({
                        errorMsg: r,
                        gameComponents: t,
                        rooms: this.connection.rooms,
                        phase: i,
                        playerName: s,
                        runningGame: c,
                        handleEnterLobby: this._enterLobby,
                        handleExitLobby: this._exitLobby,
                        handleCreateRoom: this._createRoom,
                        handleJoinRoom: this._joinRoom,
                        handleLeaveRoom: this._leaveRoom,
                        handleExitRoom: this._exitRoom,
                        handleRefreshRooms: this._updateConnection,
                        handleStartGame: this._startGame,
                      })
                    : y.a.createElement(
                        'div',
                        { id: 'lobby-view', style: { padding: 50 } },
                        y.a.createElement(
                          'div',
                          { className: this._getPhaseVisibility(et.ENTER) },
                          y.a.createElement(Ye, {
                            key: s,
                            playerName: s,
                            onEnter: this._enterLobby,
                          })
                        ),
                        y.a.createElement(
                          'div',
                          { className: this._getPhaseVisibility(et.LIST) },
                          y.a.createElement('p', null, 'Welcome, ', s),
                          y.a.createElement(
                            'div',
                            { className: 'phase-title', id: 'game-creation' },
                            y.a.createElement('span', null, 'Create a room:'),
                            y.a.createElement($e, {
                              games: t,
                              createGame: this._createRoom,
                            })
                          ),
                          y.a.createElement(
                            'p',
                            { className: 'phase-title' },
                            'Join a room:'
                          ),
                          y.a.createElement(
                            'div',
                            { id: 'instances' },
                            y.a.createElement(
                              'table',
                              null,
                              y.a.createElement(
                                'tbody',
                                null,
                                this.renderRooms(this.connection.rooms, s)
                              )
                            ),
                            y.a.createElement(
                              'span',
                              { className: 'error-msg' },
                              r,
                              y.a.createElement('br', null)
                            )
                          ),
                          y.a.createElement(
                            'p',
                            { className: 'phase-title' },
                            'Rooms that become empty are automatically deleted.'
                          )
                        ),
                        y.a.createElement(
                          'div',
                          { className: this._getPhaseVisibility(et.PLAY) },
                          c &&
                            y.a.createElement(c.app, {
                              gameID: c.gameID,
                              playerID: c.playerID,
                              credentials: c.credentials,
                            }),
                          y.a.createElement(
                            'div',
                            { className: 'buttons', id: 'game-exit' },
                            y.a.createElement(
                              'button',
                              { onClick: this._exitRoom },
                              'Exit game'
                            )
                          )
                        ),
                        y.a.createElement(
                          'div',
                          { className: 'buttons', id: 'lobby-exit' },
                          y.a.createElement(
                            'button',
                            { onClick: this._exitLobby },
                            'Exit lobby'
                          )
                        )
                      );
                },
              },
            ]),
            t
          );
        })(y.a.Component);
      Object(h.a)(tt, 'propTypes', {
        gameComponents: g.a.array.isRequired,
        lobbyServer: g.a.string,
        gameServer: g.a.string,
        debug: g.a.bool,
        clientFactory: g.a.func,
      }),
        Object(h.a)(tt, 'defaultProps', { debug: !1, clientFactory: Je });
      var at = {
          description: function() {
            return s.a.createElement(
              'div',
              null,
              s.a.createElement(
                'pre',
                null,
                '{\n  turn: { activePlayers: ActivePlayers.ALL },\n}\n'
              )
            );
          },
          game: {
            moves: {
              move: function(e) {
                return e;
              },
            },
            turn: { activePlayers: de.ALL },
            events: { endPhase: !1 },
          },
        },
        nt = {
          description: function() {
            return s.a.createElement(
              'div',
              null,
              s.a.createElement(
                'pre',
                null,
                '{\n  turn: { activePlayers: ActivePlayers.ALL_ONCE },\n}\n'
              )
            );
          },
          game: {
            moves: {
              move: function(e) {
                return e;
              },
            },
            turn: { activePlayers: de.ALL_ONCE },
            events: { endPhase: !1 },
          },
        },
        rt = {
          description: function() {
            return s.a.createElement(
              'div',
              null,
              s.a.createElement(
                'pre',
                null,
                '{\n  turn: { activePlayers: ActivePlayers.OTHERS },\n}\n'
              )
            );
          },
          game: {
            moves: {
              move: function(e) {
                return e;
              },
            },
            events: { endPhase: !1 },
            turn: { activePlayers: de.OTHERS },
          },
        },
        st = {
          description: function() {
            return s.a.createElement(
              'div',
              null,
              s.a.createElement(
                'pre',
                null,
                "{\n  moves: {\n    play: (G, ctx) => {\n      ctx.events.setActivePlayers({\n        others: 'discard',\n        moveLimit: 1\n      });\n      return G;\n    },\n  },\n\n  turn: {\n    stages: {\n      discard: {\n        moves: {\n          discard: G => G,\n        },\n      },\n    },\n  },\n}\n"
              )
            );
          },
          game: {
            events: { endPhase: !1 },
            moves: {
              play: function(e, t) {
                return (
                  t.events.setActivePlayers({
                    others: 'discard',
                    moveLimit: 1,
                  }),
                  e
                );
              },
            },
            turn: {
              stages: {
                discard: {
                  moves: {
                    discard: function(e) {
                      return e;
                    },
                  },
                },
              },
            },
          },
        };
      a(88);
      function it(e) {
        var t = e.ctx,
          a = e.moves,
          n = e.events,
          r = e.playerID;
        if (null === r)
          return s.a.createElement('div', { className: 'table-interior' });
        var i,
          c = 'player',
          o = !1,
          l = !1;
        return (
          t.activePlayers
            ? r in t.activePlayers &&
              ((c += ' active'), (o = !0), (i = t.activePlayers[r]))
            : r === t.currentPlayer && ((c += ' active'), (o = !0)),
          r == t.currentPlayer && ((c += ' current'), (l = !0)),
          (a = Object.entries(a)
            .filter(function(e) {
              return !('play' === e[0] && 'discard' === i);
            })
            .filter(function(e) {
              return !('discard' === e[0] && 'discard' !== i);
            })
            .map(function(e) {
              return s.a.createElement(
                'button',
                {
                  key: e[0],
                  onClick: function() {
                    return e[1]();
                  },
                },
                e[0]
              );
            })),
          (n = Object.entries(n)
            .filter(function() {
              return l && o;
            })
            .filter(function(e) {
              return 'setActivePlayers' != e[0];
            })
            .filter(function(e) {
              return 'setStage' != e[0];
            })
            .filter(function(e) {
              return 'endStage' != e[0];
            })
            .map(function(e) {
              return s.a.createElement(
                'button',
                {
                  key: e[0],
                  onClick: function() {
                    return e[1]();
                  },
                },
                e[0]
              );
            })),
          s.a.createElement(
            'div',
            { className: 'player-wrap' },
            s.a.createElement(
              'span',
              { className: c, onClick: function() {} },
              r
            ),
            s.a.createElement('div', { className: 'controls' }, o && a, n)
          )
        );
      }
      var ct = { 'others-once': st, all: at, 'all-once': nt, others: rt },
        ot = (function(e) {
          function t(e) {
            var a;
            return (
              Object(c.a)(this, t),
              (a = Object(l.a)(this, Object(u.a)(t).call(this, e))).init('all'),
              a
            );
          }
          return (
            Object(p.a)(t, e),
            Object(o.a)(t, [
              {
                key: 'init',
                value: function(e) {
                  var t = !1;
                  void 0 !== this.client && (t = !0),
                    (this.type = e),
                    (this.description = ct[e].description),
                    (this.client = Je({
                      game: ct[e].game,
                      numPlayers: 6,
                      debug: !1,
                      board: it,
                      multiplayer: { local: !0 },
                    })),
                    t && this.forceUpdate();
                },
              },
              {
                key: 'render',
                value: function() {
                  for (
                    var e = this,
                      t = this.description,
                      a = this.client,
                      n = [],
                      r = 0;
                    r < 6;
                    r++
                  )
                    n.push(
                      s.a.createElement(a, {
                        key: r,
                        gameID: this.type,
                        playerID: r + '',
                      })
                    );
                  return s.a.createElement(
                    'div',
                    { id: 'turnorder' },
                    s.a.createElement(
                      'div',
                      { className: 'turnorder-options' },
                      s.a.createElement(
                        'div',
                        {
                          className: 'all' === this.type ? 'active' : '',
                          onClick: function() {
                            return e.init('all');
                          },
                        },
                        'ALL'
                      ),
                      s.a.createElement(
                        'div',
                        {
                          className: 'all-once' === this.type ? 'active' : '',
                          onClick: function() {
                            return e.init('all-once');
                          },
                        },
                        'ALL_ONCE'
                      ),
                      s.a.createElement(
                        'div',
                        {
                          className: 'others' === this.type ? 'active' : '',
                          onClick: function() {
                            return e.init('others');
                          },
                        },
                        'OTHERS'
                      ),
                      s.a.createElement(
                        'div',
                        {
                          className:
                            'others-once' === this.type ? 'active' : '',
                          onClick: function() {
                            return e.init('others-once');
                          },
                        },
                        'OTHERS_ONCE'
                      )
                    ),
                    s.a.createElement(
                      'div',
                      { className: 'turnorder-content' },
                      s.a.createElement(
                        'div',
                        { className: 'player-container' },
                        s.a.createElement(a, { gameID: this.type }),
                        s.a.createElement('span', null, n)
                      ),
                      s.a.createElement(
                        'div',
                        { className: 'description' },
                        s.a.createElement(t, null)
                      )
                    )
                  );
                },
              },
            ]),
            t
          );
        })(s.a.Component);
      Object(i.render)(
        s.a.createElement(ot, null),
        document.getElementById('test') || document.createElement('div')
      );
    },
  },
  [[50, 2, 1]],
]);
//# sourceMappingURL=main.e8f5df1a.chunk.js.map
