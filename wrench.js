/*globals window document */
"use strict";

(function () {
  var wrench  = {},
      routing = {routes: {}},
      w       = window,
      d       = document;
    
  // ----------------- routing ----------------- //
  routing.changeRoute = function (route, params) {
    var routeUrl  = route,
        i         = 1;
    if (typeof params !== 'undefined') {
      routeUrl += ":";
      for (var param in params) {
        if (params.hasOwnProperty(param)) {
          if (i !== 1) routeUrl += "+";
          routeUrl += param + "=" + params[param];
          i++;
        }
      }
    }
				
    if (w.location.hash !== "" && 
        w.location.hash !== "#" && 
        w.location.hash.indexOf(route) === -1) {
      route = w.location.hash + ";" + routeUrl;
    }
    else {
      route = routeUrl;
    }
		
    w.location.hash = route;		
  };
	
  routing.locate = function () {		
    var currentRoutes     = w.location.hash.replace("#", "").split(";"),
        currentRoutesLen  = currentRoutes.length,
        params            = {}, 
        route             = '';
		
    if (currentRoutesLen > 0 && currentRoutes[0] !== "") {
      for (var i = 0; i < currentRoutesLen; i++) {
        var rawParams = currentRoutes[i].split(":");
            func      = rawParams.shift();
        if (rawParams.length > 0 && typeof rawParams[0] !== "undefined") {
          var paramPair     = rawParams[0].split("+"), 
              paramPairLen  = paramPair.length;
          for (var j = 0; j < paramPairLen; j++) {
            params[paramPair[j].split("=")[0]] = paramPair[j].split("=")[1];
          }
        }
        if (func in routing.routes) routing.routes[func](params);		 
      }
    }
    else if ("/" in routing.routes) {
      routing.routes["/"]();
    }
  };
	
  // ----------------- app object ----------------- //
  var wrenchApp = {
    callRoute: function (route, params) {
      routing.changeRoute(route, params);
    },
    run: function (force) {
      var app = this;
      var loader = function () {
        routing.locate();
        if (typeof app.init === 'function') app.init();
      };
      
      // Use force loading if wrench is loaded way after the load event has triggered
      if (force) loader();

      w.addEventListener('load', loader, false);
      w.onhashchange = routing.locate;
			
      return app;
    }
  };
	
  // ----------------- public api ----------------- //
  wrench.VERSION = "0.0.1";
	
  // Turn an object into a wrench application
  wrench.appify = function (properties) {
    function F() {}
    F.prototype = wrenchApp;
    var app = new F();
    for (var prop in properties)
      if (properties.hasOwnProperty(prop))
        app[prop] = properties[prop];
    return app;
  };
		
  // connects a route to a function
  // can be used like so: var users = route("users", function () {});
  // or: var users = route("users").to(function () {});
  // all routed functions will be called with a params hash
  // as the only argument
  w.route = function (route, func) {
    if (typeof func === 'function') {
      routing.routes[route] = func;			
      return function (params) {
        routing.changeRoute(route, params);
        func(params);
      };
    }
    else {
      return {
        to: function (func) { 
          routing.routes[route] = func;
          return function (params) {
            routing.changeRoute(route, params);
            func(params);
          };
        } 
      };
    }
  };
	
  w.wrench = wrench;	
}());