// import React from "react";

// export const Calendly = () => {
//   !(function () {
//     var t = {
//         9736: function (t, e, n) {
//           var o = n(95),
//             r = n(2391),
//             i = n(1787),
//             s = o("unscopables"),
//             u = Array.prototype;
//           null == u[s] && i.f(u, s, { configurable: !0, value: r(null) }),
//             (t.exports = function (t) {
//               u[s][t] = !0;
//             });
//         },
//         1176: function (t, e, n) {
//           var o = n(5052);
//           t.exports = function (t) {
//             if (!o(t)) throw TypeError(String(t) + " is not an object");
//             return t;
//           };
//         },
//         9540: function (t, e, n) {
//           var o = n(905),
//             r = n(4237),
//             i = n(3231),
//             s = function (t) {
//               return function (e, n, s) {
//                 var u,
//                   c = o(e),
//                   a = r(c.length),
//                   l = i(s, a);
//                 if (t && n != n) {
//                   for (; a > l; ) if ((u = c[l++]) != u) return !0;
//                 } else
//                   for (; a > l; l++)
//                     if ((t || l in c) && c[l] === n) return t || l || 0;
//                 return !t && -1;
//               };
//             };
//           t.exports = { includes: s(!0), indexOf: s(!1) };
//         },
//         7079: function (t) {
//           var e = {}.toString;
//           t.exports = function (t) {
//             return e.call(t).slice(8, -1);
//           };
//         },
//         7081: function (t, e, n) {
//           var o = n(816),
//             r = n(4826),
//             i = n(7933),
//             s = n(1787);
//           t.exports = function (t, e) {
//             for (var n = r(e), u = s.f, c = i.f, a = 0; a < n.length; a++) {
//               var l = n[a];
//               o(t, l) || u(t, l, c(e, l));
//             }
//           };
//         },
//         5762: function (t, e, n) {
//           var o = n(7400),
//             r = n(1787),
//             i = n(5358);
//           t.exports = o
//             ? function (t, e, n) {
//                 return r.f(t, e, i(1, n));
//               }
//             : function (t, e, n) {
//                 return (t[e] = n), t;
//               };
//         },
//         5358: function (t) {
//           t.exports = function (t, e) {
//             return {
//               enumerable: !(1 & t),
//               configurable: !(2 & t),
//               writable: !(4 & t),
//               value: e,
//             };
//           };
//         },
//         7400: function (t, e, n) {
//           var o = n(4229);
//           t.exports = !o(function () {
//             return (
//               7 !=
//               Object.defineProperty({}, 1, {
//                 get: function () {
//                   return 7;
//                 },
//               })[1]
//             );
//           });
//         },
//         2635: function (t, e, n) {
//           var o = n(9859),
//             r = n(5052),
//             i = o.document,
//             s = r(i) && r(i.createElement);
//           t.exports = function (t) {
//             return s ? i.createElement(t) : {};
//           };
//         },
//         8801: function (t, e, n) {
//           var o = n(7079),
//             r = n(9859);
//           t.exports = "process" == o(r.process);
//         },
//         598: function (t, e, n) {
//           var o = n(1333);
//           t.exports = o("navigator", "userAgent") || "";
//         },
//         6358: function (t, e, n) {
//           var o,
//             r,
//             i = n(9859),
//             s = n(598),
//             u = i.process,
//             c = u && u.versions,
//             a = c && c.v8;
//           a
//             ? (r = (o = a.split("."))[0] + o[1])
//             : s &&
//               (!(o = s.match(/Edge\/(\d+)/)) || o[1] >= 74) &&
//               (o = s.match(/Chrome\/(\d+)/)) &&
//               (r = o[1]),
//             (t.exports = r && +r);
//         },
//         3837: function (t) {
//           t.exports = [
//             "constructor",
//             "hasOwnProperty",
//             "isPrototypeOf",
//             "propertyIsEnumerable",
//             "toLocaleString",
//             "toString",
//             "valueOf",
//           ];
//         },
//         3103: function (t, e, n) {
//           var o = n(9859),
//             r = n(7933).f,
//             i = n(5762),
//             s = n(7487),
//             u = n(2079),
//             c = n(7081),
//             a = n(6541);
//           t.exports = function (t, e) {
//             var n,
//               l,
//               d,
//               p,
//               f,
//               h = t.target,
//               m = t.global,
//               v = t.stat;
//             if ((n = m ? o : v ? o[h] || u(h, {}) : (o[h] || {}).prototype))
//               for (l in e) {
//                 if (
//                   ((p = e[l]),
//                   (d = t.noTargetGet ? (f = r(n, l)) && f.value : n[l]),
//                   !a(m ? l : h + (v ? "." : "#") + l, t.forced) && void 0 !== d)
//                 ) {
//                   if (typeof p == typeof d) continue;
//                   c(p, d);
//                 }
//                 (t.sham || (d && d.sham)) && i(p, "sham", !0), s(n, l, p, t);
//               }
//           };
//         },
//         4229: function (t) {
//           t.exports = function (t) {
//             try {
//               return !!t();
//             } catch (t) {
//               return !0;
//             }
//           };
//         },
//         1333: function (t, e, n) {
//           var o = n(9276),
//             r = n(9859),
//             i = function (t) {
//               return "function" == typeof t ? t : void 0;
//             };
//           t.exports = function (t, e) {
//             return arguments.length < 2
//               ? i(o[t]) || i(r[t])
//               : (o[t] && o[t][e]) || (r[t] && r[t][e]);
//           };
//         },
//         9859: function (t, e, n) {
//           var o = function (t) {
//             return t && t.Math == Math && t;
//           };
//           t.exports =
//             o("object" == typeof globalThis && globalThis) ||
//             o("object" == typeof window && window) ||
//             o("object" == typeof self && self) ||
//             o("object" == typeof n.g && n.g) ||
//             (function () {
//               return this;
//             })() ||
//             Function("return this")();
//         },
//         816: function (t) {
//           var e = {}.hasOwnProperty;
//           t.exports = function (t, n) {
//             return e.call(t, n);
//           };
//         },
//         5977: function (t) {
//           t.exports = {};
//         },
//         3777: function (t, e, n) {
//           var o = n(1333);
//           t.exports = o("document", "documentElement");
//         },
//         4394: function (t, e, n) {
//           var o = n(7400),
//             r = n(4229),
//             i = n(2635);
//           t.exports =
//             !o &&
//             !r(function () {
//               return (
//                 7 !=
//                 Object.defineProperty(i("div"), "a", {
//                   get: function () {
//                     return 7;
//                   },
//                 }).a
//               );
//             });
//         },
//         9337: function (t, e, n) {
//           var o = n(4229),
//             r = n(7079),
//             i = "".split;
//           t.exports = o(function () {
//             return !Object("z").propertyIsEnumerable(0);
//           })
//             ? function (t) {
//                 return "String" == r(t) ? i.call(t, "") : Object(t);
//               }
//             : Object;
//         },
//         8511: function (t, e, n) {
//           var o = n(5353),
//             r = Function.toString;
//           "function" != typeof o.inspectSource &&
//             (o.inspectSource = function (t) {
//               return r.call(t);
//             }),
//             (t.exports = o.inspectSource);
//         },
//         6407: function (t, e, n) {
//           var o,
//             r,
//             i,
//             s = n(8694),
//             u = n(9859),
//             c = n(5052),
//             a = n(5762),
//             l = n(816),
//             d = n(5353),
//             p = n(4399),
//             f = n(5977),
//             h = u.WeakMap;
//           if (s) {
//             var m = d.state || (d.state = new h()),
//               v = m.get,
//               y = m.has,
//               g = m.set;
//             (o = function (t, e) {
//               return (e.facade = t), g.call(m, t, e), e;
//             }),
//               (r = function (t) {
//                 return v.call(m, t) || {};
//               }),
//               (i = function (t) {
//                 return y.call(m, t);
//               });
//           } else {
//             var b = p("state");
//             (f[b] = !0),
//               (o = function (t, e) {
//                 return (e.facade = t), a(t, b, e), e;
//               }),
//               (r = function (t) {
//                 return l(t, b) ? t[b] : {};
//               }),
//               (i = function (t) {
//                 return l(t, b);
//               });
//           }
//           t.exports = {
//             set: o,
//             get: r,
//             has: i,
//             enforce: function (t) {
//               return i(t) ? r(t) : o(t, {});
//             },
//             getterFor: function (t) {
//               return function (e) {
//                 var n;
//                 if (!c(e) || (n = r(e)).type !== t)
//                   throw TypeError("Incompatible receiver, " + t + " required");
//                 return n;
//               };
//             },
//           };
//         },
//         6541: function (t, e, n) {
//           var o = n(4229),
//             r = /#|\.prototype\./,
//             i = function (t, e) {
//               var n = u[s(t)];
//               return (
//                 n == a || (n != c && ("function" == typeof e ? o(e) : !!e))
//               );
//             },
//             s = (i.normalize = function (t) {
//               return String(t).replace(r, ".").toLowerCase();
//             }),
//             u = (i.data = {}),
//             c = (i.NATIVE = "N"),
//             a = (i.POLYFILL = "P");
//           t.exports = i;
//         },
//         5052: function (t) {
//           t.exports = function (t) {
//             return "object" == typeof t ? null !== t : "function" == typeof t;
//           };
//         },
//         4231: function (t) {
//           t.exports = !1;
//         },
//         3839: function (t, e, n) {
//           var o = n(8801),
//             r = n(6358),
//             i = n(4229);
//           t.exports =
//             !!Object.getOwnPropertySymbols &&
//             !i(function () {
//               return !Symbol.sham && (o ? 38 === r : r > 37 && r < 41);
//             });
//         },
//         8694: function (t, e, n) {
//           var o = n(9859),
//             r = n(8511),
//             i = o.WeakMap;
//           t.exports = "function" == typeof i && /native code/.test(r(i));
//         },
//         2391: function (t, e, n) {
//           var o,
//             r = n(1176),
//             i = n(219),
//             s = n(3837),
//             u = n(5977),
//             c = n(3777),
//             a = n(2635),
//             l = n(4399)("IE_PROTO"),
//             d = function () {},
//             p = function (t) {
//               return "<script>" + t + "</script>";
//             },
//             f = function () {
//               try {
//                 o = document.domain && new ActiveXObject("htmlfile");
//               } catch (t) {}
//               var t, e;
//               f = o
//                 ? (function (t) {
//                     t.write(p("")), t.close();
//                     var e = t.parentWindow.Object;
//                     return (t = null), e;
//                   })(o)
//                 : (((e = a("iframe")).style.display = "none"),
//                   c.appendChild(e),
//                   (e.src = String("javascript:")),
//                   (t = e.contentWindow.document).open(),
//                   t.write(p("document.F=Object")),
//                   t.close(),
//                   t.F);
//               for (var n = s.length; n--; ) delete f.prototype[s[n]];
//               return f();
//             };
//           (u[l] = !0),
//             (t.exports =
//               Object.create ||
//               function (t, e) {
//                 var n;
//                 return (
//                   null !== t
//                     ? ((d.prototype = r(t)),
//                       (n = new d()),
//                       (d.prototype = null),
//                       (n[l] = t))
//                     : (n = f()),
//                   void 0 === e ? n : i(n, e)
//                 );
//               });
//         },
//         219: function (t, e, n) {
//           var o = n(7400),
//             r = n(1787),
//             i = n(1176),
//             s = n(5632);
//           t.exports = o
//             ? Object.defineProperties
//             : function (t, e) {
//                 i(t);
//                 for (var n, o = s(e), u = o.length, c = 0; u > c; )
//                   r.f(t, (n = o[c++]), e[n]);
//                 return t;
//               };
//         },
//         1787: function (t, e, n) {
//           var o = n(7400),
//             r = n(4394),
//             i = n(1176),
//             s = n(2066),
//             u = Object.defineProperty;
//           e.f = o
//             ? u
//             : function (t, e, n) {
//                 if ((i(t), (e = s(e, !0)), i(n), r))
//                   try {
//                     return u(t, e, n);
//                   } catch (t) {}
//                 if ("get" in n || "set" in n)
//                   throw TypeError("Accessors not supported");
//                 return "value" in n && (t[e] = n.value), t;
//               };
//         },
//         7933: function (t, e, n) {
//           var o = n(7400),
//             r = n(9195),
//             i = n(5358),
//             s = n(905),
//             u = n(2066),
//             c = n(816),
//             a = n(4394),
//             l = Object.getOwnPropertyDescriptor;
//           e.f = o
//             ? l
//             : function (t, e) {
//                 if (((t = s(t)), (e = u(e, !0)), a))
//                   try {
//                     return l(t, e);
//                   } catch (t) {}
//                 if (c(t, e)) return i(!r.f.call(t, e), t[e]);
//               };
//         },
//         8151: function (t, e, n) {
//           var o = n(140),
//             r = n(3837).concat("length", "prototype");
//           e.f =
//             Object.getOwnPropertyNames ||
//             function (t) {
//               return o(t, r);
//             };
//         },
//         894: function (t, e) {
//           e.f = Object.getOwnPropertySymbols;
//         },
//         140: function (t, e, n) {
//           var o = n(816),
//             r = n(905),
//             i = n(9540).indexOf,
//             s = n(5977);
//           t.exports = function (t, e) {
//             var n,
//               u = r(t),
//               c = 0,
//               a = [];
//             for (n in u) !o(s, n) && o(u, n) && a.push(n);
//             for (; e.length > c; )
//               o(u, (n = e[c++])) && (~i(a, n) || a.push(n));
//             return a;
//           };
//         },
//         5632: function (t, e, n) {
//           var o = n(140),
//             r = n(3837);
//           t.exports =
//             Object.keys ||
//             function (t) {
//               return o(t, r);
//             };
//         },
//         9195: function (t, e) {
//           "use strict";
//           var n = {}.propertyIsEnumerable,
//             o = Object.getOwnPropertyDescriptor,
//             r = o && !n.call({ 1: 2 }, 1);
//           e.f = r
//             ? function (t) {
//                 var e = o(this, t);
//                 return !!e && e.enumerable;
//               }
//             : n;
//         },
//         4826: function (t, e, n) {
//           var o = n(1333),
//             r = n(8151),
//             i = n(894),
//             s = n(1176);
//           t.exports =
//             o("Reflect", "ownKeys") ||
//             function (t) {
//               var e = r.f(s(t)),
//                 n = i.f;
//               return n ? e.concat(n(t)) : e;
//             };
//         },
//         9276: function (t, e, n) {
//           var o = n(9859);
//           t.exports = o;
//         },
//         7487: function (t, e, n) {
//           var o = n(9859),
//             r = n(5762),
//             i = n(816),
//             s = n(2079),
//             u = n(8511),
//             c = n(6407),
//             a = c.get,
//             l = c.enforce,
//             d = String(String).split("String");
//           (t.exports = function (t, e, n, u) {
//             var c,
//               a = !!u && !!u.unsafe,
//               p = !!u && !!u.enumerable,
//               f = !!u && !!u.noTargetGet;
//             "function" == typeof n &&
//               ("string" != typeof e || i(n, "name") || r(n, "name", e),
//               (c = l(n)).source ||
//                 (c.source = d.join("string" == typeof e ? e : ""))),
//               t !== o
//                 ? (a ? !f && t[e] && (p = !0) : delete t[e],
//                   p ? (t[e] = n) : r(t, e, n))
//                 : p
//                 ? (t[e] = n)
//                 : s(e, n);
//           })(Function.prototype, "toString", function () {
//             return ("function" == typeof this && a(this).source) || u(this);
//           });
//         },
//         8885: function (t) {
//           t.exports = function (t) {
//             if (null == t) throw TypeError("Can't call method on " + t);
//             return t;
//           };
//         },
//         2079: function (t, e, n) {
//           var o = n(9859),
//             r = n(5762);
//           t.exports = function (t, e) {
//             try {
//               r(o, t, e);
//             } catch (n) {
//               o[t] = e;
//             }
//             return e;
//           };
//         },
//         4399: function (t, e, n) {
//           var o = n(3036),
//             r = n(1441),
//             i = o("keys");
//           t.exports = function (t) {
//             return i[t] || (i[t] = r(t));
//           };
//         },
//         5353: function (t, e, n) {
//           var o = n(9859),
//             r = n(2079),
//             i = "__core-js_shared__",
//             s = o[i] || r(i, {});
//           t.exports = s;
//         },
//         3036: function (t, e, n) {
//           var o = n(4231),
//             r = n(5353);
//           (t.exports = function (t, e) {
//             return r[t] || (r[t] = void 0 !== e ? e : {});
//           })("versions", []).push({
//             version: "3.9.1",
//             mode: o ? "pure" : "global",
//             copyright: "Â© 2021 Denis Pushkarev (zloirock.ru)",
//           });
//         },
//         3231: function (t, e, n) {
//           var o = n(6051),
//             r = Math.max,
//             i = Math.min;
//           t.exports = function (t, e) {
//             var n = o(t);
//             return n < 0 ? r(n + e, 0) : i(n, e);
//           };
//         },
//         905: function (t, e, n) {
//           var o = n(9337),
//             r = n(8885);
//           t.exports = function (t) {
//             return o(r(t));
//           };
//         },
//         6051: function (t) {
//           var e = Math.ceil,
//             n = Math.floor;
//           t.exports = function (t) {
//             return isNaN((t = +t)) ? 0 : (t > 0 ? n : e)(t);
//           };
//         },
//         4237: function (t, e, n) {
//           var o = n(6051),
//             r = Math.min;
//           t.exports = function (t) {
//             return t > 0 ? r(o(t), 9007199254740991) : 0;
//           };
//         },
//         2066: function (t, e, n) {
//           var o = n(5052);
//           t.exports = function (t, e) {
//             if (!o(t)) return t;
//             var n, r;
//             if (
//               e &&
//               "function" == typeof (n = t.toString) &&
//               !o((r = n.call(t)))
//             )
//               return r;
//             if ("function" == typeof (n = t.valueOf) && !o((r = n.call(t))))
//               return r;
//             if (
//               !e &&
//               "function" == typeof (n = t.toString) &&
//               !o((r = n.call(t)))
//             )
//               return r;
//             throw TypeError("Can't convert object to primitive value");
//           };
//         },
//         1441: function (t) {
//           var e = 0,
//             n = Math.random();
//           t.exports = function (t) {
//             return (
//               "Symbol(" +
//               String(void 0 === t ? "" : t) +
//               ")_" +
//               (++e + n).toString(36)
//             );
//           };
//         },
//         6969: function (t, e, n) {
//           var o = n(3839);
//           t.exports = o && !Symbol.sham && "symbol" == typeof Symbol.iterator;
//         },
//         95: function (t, e, n) {
//           var o = n(9859),
//             r = n(3036),
//             i = n(816),
//             s = n(1441),
//             u = n(3839),
//             c = n(6969),
//             a = r("wks"),
//             l = o.Symbol,
//             d = c ? l : (l && l.withoutSetter) || s;
//           t.exports = function (t) {
//             return (
//               (i(a, t) && (u || "string" == typeof a[t])) ||
//                 (u && i(l, t) ? (a[t] = l[t]) : (a[t] = d("Symbol." + t))),
//               a[t]
//             );
//           };
//         },
//         9529: function (t, e, n) {
//           "use strict";
//           var o = n(3103),
//             r = n(9540).includes,
//             i = n(9736);
//           o(
//             { target: "Array", proto: !0 },
//             {
//               includes: function (t) {
//                 return r(this, t, arguments.length > 1 ? arguments[1] : void 0);
//               },
//             }
//           ),
//             i("includes");
//         },
//       },
//       e = {};
//     function n(o) {
//       var r = e[o];
//       if (void 0 !== r) return r.exports;
//       var i = (e[o] = { exports: {} });
//       return t[o](i, i.exports, n), i.exports;
//     }
//     (n.d = function (t, e) {
//       for (var o in e)
//         n.o(e, o) &&
//           !n.o(t, o) &&
//           Object.defineProperty(t, o, { enumerable: !0, get: e[o] });
//     }),
//       (n.g = (function () {
//         if ("object" == typeof globalThis) return globalThis;
//         try {
//           return this || new Function("return this")();
//         } catch (t) {
//           if ("object" == typeof window) return window;
//         }
//       })()),
//       (n.o = function (t, e) {
//         return Object.prototype.hasOwnProperty.call(t, e);
//       }),
//       (n.r = function (t) {
//         "undefined" != typeof Symbol &&
//           Symbol.toStringTag &&
//           Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
//           Object.defineProperty(t, "__esModule", { value: !0 });
//       });
//     var o = {};
//     !(function () {
//       "use strict";
//       n.r(o),
//         n.d(o, {
//           closePopupWidget: function () {
//             return O;
//           },
//           destroyBadgeWidget: function () {
//             return P;
//           },
//           initBadgeWidget: function () {
//             return E;
//           },
//           initInlineWidget: function () {
//             return j;
//           },
//           initPopupWidget: function () {
//             return C;
//           },
//           showPopupWidget: function () {
//             return S;
//           },
//         }),
//         n(9529);
//       const t = (t) => {
//           ["interactive", "complete"].includes(document.readyState)
//             ? t()
//             : document.addEventListener("DOMContentLoaded", t);
//         },
//         e = (t, e) =>
//           Object.fromEntries(
//             Object.entries(t).map((t) => {
//               let [n, o] = t;
//               return [e(o, n), o];
//             })
//           ),
//         r = (t) =>
//           t
//             .split(/(?=[A-Z])/)
//             .join("_")
//             .toLowerCase(),
//         i = (t, e) =>
//           Object.fromEntries(
//             Object.entries(t).filter((t) => {
//               let [n] = t;
//               return e.includes(n);
//             })
//           ),
//         s = (t) =>
//           t
//             ? Object.fromEntries(
//                 t
//                   .substr(1)
//                   .split("&")
//                   .map((t) => t.split("="))
//                   .map((t) => {
//                     let [e, n] = t;
//                     return [e, decodeURIComponent(n)];
//                   })
//               )
//             : [];
//       class u {
//         constructor(t) {
//           var e, n, o;
//           (e = this),
//             (n = "isMobile"),
//             (o =
//               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
//                 navigator.userAgent
//               )),
//             n in e
//               ? Object.defineProperty(e, n, {
//                   value: o,
//                   enumerable: !0,
//                   configurable: !0,
//                   writable: !0,
//                 })
//               : (e[n] = o),
//             (this.options = t),
//             this.parseOptions();
//         }
//         inject() {
//           return (
//             this.build(),
//             this.format(),
//             this.parent.appendChild(this.buildSpinner()),
//             this.parent.appendChild(this.node)
//           );
//         }
//         parseOptions() {
//           if (
//             ((this.options = Object.assign(
//               {},
//               { inlineStyles: !1 },
//               this.options
//             )),
//             (this.parent = this.options.parentElement),
//             !this.parent)
//           )
//             throw new Error("Calendly: Parent element not set");
//           if (
//             (this.parent.jquery && (this.parent = this.parent[0]),
//             (this.inlineStyles = this.options.inlineStyles),
//             (this.embedType = this.options.embedType),
//             (this.url = (this.options.url || this.getUrlFromParent()).split(
//               "#"
//             )[0]),
//             !this.url)
//           )
//             throw new Error("Calendly: Widget URL not set");
//         }
//         build() {
//           (this.node = document.createElement("iframe")),
//             (this.node.src = this.getSource()),
//             (this.node.width = "100%"),
//             (this.node.height = "100%"),
//             (this.node.frameBorder = "0");
//         }
//         getSource() {
//           const t = new URL(this.url, window.location);
//           return (t.search = this.getQuery()), t.toString();
//         }
//         getUrlFromParent() {
//           return this.parent.getAttribute("data-url");
//         }
//         getQuery() {
//           return (
//             (t = {
//               embed_domain: this.getDomain(),
//               embed_type: this.embedType,
//               ...this.getUtmParamsFromHost(),
//               ...this.getParamsFromUrl(),
//               ...this.getParamsFromOptions(),
//             }),
//             `?${Object.entries(t)
//               .map((t) => {
//                 let [e, n] = t;
//                 return [e, encodeURIComponent(n)].join("=");
//               })
//               .join("&")}`
//           );
//           var t;
//         }
//         getUtmParamsFromHost() {
//           const t = s(new URL(window.location.href).search);
//           return i(t, [
//             "utm_campaign",
//             "utm_source",
//             "utm_medium",
//             "utm_content",
//             "utm_term",
//           ]);
//         }
//         getParamsFromUrl() {
//           return s(new URL(this.url, window.location).search);
//         }
//         getParamsFromOptions() {
//           return { ...this.getPrefillParams(), ...this.getUtmParams() };
//         }
//         getUtmParams() {
//           if (!this.options.utm) return [];
//           const t = i(this.options.utm, [
//             "utmCampaign",
//             "utmSource",
//             "utmMedium",
//             "utmContent",
//             "utmTerm",
//           ]);
//           return e(t, (t, e) => r(e));
//         }
//         getPrefillParams() {
//           if (!this.options.prefill) return [];
//           const t = i(this.options.prefill, [
//               "name",
//               "firstName",
//               "lastName",
//               "email",
//             ]),
//             n = e(t, (t, e) => r(e));
//           if (this.options.prefill.customAnswers) {
//             const t = this.options.prefill.customAnswers;
//             Object.entries(t).forEach((t) => {
//               let [e, o] = t;
//               e.match(/^a\d{1,2}$/) && (n[e] = o);
//             });
//           }
//           return n;
//         }
//         getDomain() {
//           return window.location.host;
//         }
//         format() {
//           return this.isMobile ? this.formatMobile() : this.formatDesktop();
//         }
//         formatDesktop() {
//           this.inlineStyles &&
//             this.parent.setAttribute(
//               "style",
//               `position: relative;${this.parent.getAttribute("style")}`
//             );
//         }
//         formatMobile() {
//           if (this.inlineStyles) {
//             const t = `position: relative;overflow-y:auto;-webkit-overflow-scrolling:touch;${this.parent.getAttribute(
//               "style"
//             )}`;
//             this.parent.setAttribute("style", t);
//           }
//           this.parent.className += " calendly-mobile";
//         }
//         buildSpinner() {
//           const t = document.createElement("div");
//           return (
//             (t.className = "calendly-spinner"),
//             t.appendChild(this.buildBounce(1)),
//             t.appendChild(this.buildBounce(2)),
//             t.appendChild(this.buildBounce(3)),
//             t
//           );
//         }
//         buildBounce(t) {
//           const e = document.createElement("div");
//           return (e.className = `calendly-bounce${t}`), e;
//         }
//       }
//       class c {
//         constructor(t) {
//           this.options = t;
//         }
//         destroy() {
//           return this.widget.parentNode.removeChild(this.widget);
//         }
//         buildWidget() {
//           return (
//             (this.widget = document.createElement("div")),
//             (this.widget.className = "calendly-badge-widget"),
//             this.widget.appendChild(this.buildContent())
//           );
//         }
//         inject() {
//           return (
//             this.buildWidget(),
//             document.body.insertBefore(this.widget, document.body.firstChild)
//           );
//         }
//         buildContent() {
//           const t = document.createElement("div");
//           return (
//             (t.className = "calendly-badge-content"),
//             "#ffffff" === this.options.color &&
//               (t.className += " calendly-white"),
//             (t.onclick = this.options.onClick),
//             (t.innerHTML = this.options.text),
//             (t.style.background = this.options.color),
//             (t.style.color = this.options.textColor),
//             this.options.branding && t.appendChild(this.buildBranding()),
//             t
//           );
//         }
//         buildBranding() {
//           const t = document.createElement("span");
//           return (t.innerHTML = "powered by Calendly"), t;
//         }
//       }
//       var a = !1;
//       if ("undefined" != typeof window) {
//         var l = {
//           get passive() {
//             a = !0;
//           },
//         };
//         window.addEventListener("testPassive", null, l),
//           window.removeEventListener("testPassive", null, l);
//       }
//       var d =
//           "undefined" != typeof window &&
//           window.navigator &&
//           window.navigator.platform &&
//           (/iP(ad|hone|od)/.test(window.navigator.platform) ||
//             ("MacIntel" === window.navigator.platform &&
//               window.navigator.maxTouchPoints > 1)),
//         p = [],
//         f = !1,
//         h = -1,
//         m = void 0,
//         v = void 0,
//         y = void 0,
//         g = function (t) {
//           return p.some(function (e) {
//             return !(!e.options.allowTouchMove || !e.options.allowTouchMove(t));
//           });
//         },
//         b = function (t) {
//           var e = t || window.event;
//           return (
//             !!g(e.target) ||
//             e.touches.length > 1 ||
//             (e.preventDefault && e.preventDefault(), !1)
//           );
//         };
//       class w {
//         constructor(t, e, n) {
//           let o =
//             arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
//           (this.close = this.close.bind(this)),
//             (this.url = t),
//             (this.onClose = e),
//             (this.embedType = n),
//             (this.options = o);
//         }
//         show() {
//           return (
//             this.buildOverlay(), this.insertOverlay(), this.lockPageScroll()
//           );
//         }
//         close() {
//           return this.unlockPageScroll(), this.destroyOverlay(), this.onClose();
//         }
//         buildOverlay() {
//           return (
//             (this.overlay = document.createElement("div")),
//             (this.overlay.className = "calendly-overlay"),
//             this.overlay.appendChild(this.buildCloseOverlay()),
//             this.overlay.appendChild(this.buildPopup()),
//             this.overlay.appendChild(this.buildCloseButton())
//           );
//         }
//         insertOverlay() {
//           return document.body.appendChild(this.overlay);
//         }
//         buildCloseOverlay() {
//           const t = document.createElement("div");
//           return (
//             (t.className = "calendly-close-overlay"),
//             (t.onclick = this.close),
//             t
//           );
//         }
//         buildPopup() {
//           const t = document.createElement("div");
//           return (
//             (t.className = "calendly-popup"),
//             t.appendChild(this.buildPopupContent()),
//             t
//           );
//         }
//         buildPopupContent() {
//           const t = document.createElement("div");
//           return (
//             (t.className = "calendly-popup-content"),
//             t.setAttribute("data-url", this.url),
//             (this.options.parentElement = t),
//             (this.options.embedType = this.embedType),
//             new u(this.options).inject(),
//             t
//           );
//         }
//         buildCloseButton() {
//           const t = document.createElement("div");
//           return (
//             (t.className = "calendly-popup-close"), (t.onclick = this.close), t
//           );
//         }
//         destroyOverlay() {
//           return this.overlay.parentNode.removeChild(this.overlay);
//         }
//         lockPageScroll() {
//           return (
//             (function (t, e) {
//               if (t) {
//                 if (
//                   !p.some(function (e) {
//                     return e.targetElement === t;
//                   })
//                 ) {
//                   var n = { targetElement: t, options: e || {} };
//                   (p = [].concat(
//                     (function (t) {
//                       if (Array.isArray(t)) {
//                         for (var e = 0, n = Array(t.length); e < t.length; e++)
//                           n[e] = t[e];
//                         return n;
//                       }
//                       return Array.from(t);
//                     })(p),
//                     [n]
//                   )),
//                     d
//                       ? window.requestAnimationFrame(function () {
//                           if (void 0 === v) {
//                             v = {
//                               position: document.body.style.position,
//                               top: document.body.style.top,
//                               left: document.body.style.left,
//                             };
//                             var t = window,
//                               e = t.scrollY,
//                               n = t.scrollX,
//                               o = t.innerHeight;
//                             (document.body.style.position = "fixed"),
//                               (document.body.style.top = -e + "px"),
//                               (document.body.style.left = -n + "px"),
//                               setTimeout(function () {
//                                 return window.requestAnimationFrame(
//                                   function () {
//                                     var t = o - window.innerHeight;
//                                     t &&
//                                       e >= o &&
//                                       (document.body.style.top =
//                                         -(e + t) + "px");
//                                   }
//                                 );
//                               }, 300);
//                           }
//                         })
//                       : (function (t) {
//                           if (void 0 === y) {
//                             var e = !!t && !0 === t.reserveScrollBarGap,
//                               n =
//                                 window.innerWidth -
//                                 document.documentElement.clientWidth;
//                             if (e && n > 0) {
//                               var o = parseInt(
//                                 window
//                                   .getComputedStyle(document.body)
//                                   .getPropertyValue("padding-right"),
//                                 10
//                               );
//                               (y = document.body.style.paddingRight),
//                                 (document.body.style.paddingRight =
//                                   o + n + "px");
//                             }
//                           }
//                           void 0 === m &&
//                             ((m = document.body.style.overflow),
//                             (document.body.style.overflow = "hidden"));
//                         })(e),
//                     d &&
//                       ((t.ontouchstart = function (t) {
//                         1 === t.targetTouches.length &&
//                           (h = t.targetTouches[0].clientY);
//                       }),
//                       (t.ontouchmove = function (e) {
//                         1 === e.targetTouches.length &&
//                           (function (t, e) {
//                             var n = t.targetTouches[0].clientY - h;
//                             !g(t.target) &&
//                               ((e && 0 === e.scrollTop && n > 0) ||
//                               ((function (t) {
//                                 return (
//                                   !!t &&
//                                   t.scrollHeight - t.scrollTop <= t.clientHeight
//                                 );
//                               })(e) &&
//                                 n < 0)
//                                 ? b(t)
//                                 : t.stopPropagation());
//                           })(e, t);
//                       }),
//                       f ||
//                         (document.addEventListener(
//                           "touchmove",
//                           b,
//                           a ? { passive: !1 } : void 0
//                         ),
//                         (f = !0)));
//                 }
//               } else
//                 console.error(
//                   "disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices."
//                 );
//             })(this.overlay),
//             document.addEventListener("touchmove", this.handleLockedTouchmove, {
//               passive: !1,
//             })
//           );
//         }
//         unlockPageScroll() {
//           var t;
//           return (
//             (t = this.overlay)
//               ? ((p = p.filter(function (e) {
//                   return e.targetElement !== t;
//                 })),
//                 d &&
//                   ((t.ontouchstart = null),
//                   (t.ontouchmove = null),
//                   f &&
//                     0 === p.length &&
//                     (document.removeEventListener(
//                       "touchmove",
//                       b,
//                       a ? { passive: !1 } : void 0
//                     ),
//                     (f = !1))),
//                 d
//                   ? (function () {
//                       if (void 0 !== v) {
//                         var t = -parseInt(document.body.style.top, 10),
//                           e = -parseInt(document.body.style.left, 10);
//                         (document.body.style.position = v.position),
//                           (document.body.style.top = v.top),
//                           (document.body.style.left = v.left),
//                           window.scrollTo(e, t),
//                           (v = void 0);
//                       }
//                     })()
//                   : (void 0 !== y &&
//                       ((document.body.style.paddingRight = y), (y = void 0)),
//                     void 0 !== m &&
//                       ((document.body.style.overflow = m), (m = void 0))))
//               : console.error(
//                   "enableBodyScroll unsuccessful - targetElement must be provided when calling enableBodyScroll on IOS devices."
//                 ),
//             document.removeEventListener(
//               "touchmove",
//               this.handleLockedTouchmove,
//               { passive: !1 }
//             )
//           );
//         }
//         handleLockedTouchmove(t) {
//           return t.preventDefault();
//         }
//       }
//       const x = {},
//         O = () => {
//           x.popup && x.popup.close();
//         },
//         S = function (t) {
//           let e =
//               arguments.length > 1 && void 0 !== arguments[1]
//                 ? arguments[1]
//                 : "PopupText",
//             n =
//               arguments.length > 2 && void 0 !== arguments[2]
//                 ? arguments[2]
//                 : {};
//           O();
//           const o = () => delete x.popup;
//           (x.popup = new w(t, o, e, n)), x.popup.show();
//         },
//         P = () => {
//           x.badge && (x.badge.destroy(), delete x.badge);
//         },
//         j = (e) => {
//           e.url &&
//             ((e.parentElement ??=
//               document.scripts[document.scripts.length - 1].parentNode),
//             t(() => {
//               (e.embedType = "Inline"), new u(e).inject();
//             }));
//         },
//         E = (e) => {
//           t(() =>
//             ((t) => {
//               P();
//               const e = ((t) => {
//                   const e = {};
//                   return (
//                     ["color", "textColor", "text", "branding"].forEach((n) => {
//                       (e[n] = t[n]), delete t[n];
//                     }),
//                     e
//                   );
//                 })(t),
//                 n = { onClick: () => S(t.url, "PopupWidget", t), ...e };
//               (x.badge = new c(n)), x.badge.inject();
//             })(e)
//           );
//         },
//         C = (e) => {
//           t(() => S(e.url, "PopupText", e));
//         };
//       t(() => {
//         const t = document.querySelectorAll(".calendly-inline-widget");
//         Array.from(t).forEach((t) => {
//           ((t) =>
//             t.getAttribute("data-processed") ||
//             "false" === t.getAttribute("data-auto-load"))(t) ||
//             (t.setAttribute("data-processed", !0),
//             new u({
//               parentElement: t,
//               inlineStyles: !0,
//               embedType: "Inline",
//             }).inject());
//         });
//       });
//     })(),
//       (window.Calendly = o);
//   })();
// };
