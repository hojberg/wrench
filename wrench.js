/*globals window document */
"use strict";

(function () {
  var wrench  = {},
      routing = {routes: {}},
      w       = window,
      d       = document;
      
  wrench.VERSION = "0.0.1";
      
  // ----------------- routing ----------------- //
  routing.lastRoute = "/";
  
  // translate a route and some params into the window.location.hash
  // builds a string for window.location.hash into multiple route fragments if applicable
  routing.changeRoute = function (route, params) {
		var routeUrl  = route,
        i         = 1;
    if (typeof params !== 'undefined') {
      routeUrl += "?";
      for (var param in params) {
        if (params.hasOwnProperty(param)) {
          if (i !== 1) routeUrl += "&";
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
    
    routing.lastRoute = w.location.hash; // route;
    w.location.hash = route;		
  };

  // find out if the the route has change since las time
  routing.hasChanged = function () {
    var changed = w.location.hash != routing.lastRoute && w.location.hash != "#" + routing.lastRoute;
    routing.lastRoute = w.location.hash;
    return changed;
  };
	
	// looks at the current window.location.hash and routes to its function
	// if one is registered and if the route has changed since last locate
  routing.locate = function () {
    if (routing.hasChanged()) {
      var currentRoutes     = w.location.hash.replace("#", "").split(";"),
          currentRoutesLen  = currentRoutes.length,
          params            = {}, 
          route             = '';
		
      if (currentRoutesLen > 0 && currentRoutes[0] !== "") {
        for (var i = 0; i < currentRoutesLen; i++) {
          var rawParams = currentRoutes[i].split("?");
              func      = rawParams.shift();
          if (rawParams.length > 0 && typeof rawParams[0] !== "undefined") {
            var paramPair     = rawParams[0].split("&"), 
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
    }
  };
  
  // form elements on the page with '#' as the first
  // character in the action attribute gets a onsubmit event added
  // TODO: find a solution for live adding of onsubmit events if
  // the user adds a form to the page after load.
  routing.attachFormRoutes = function () {
    for (var i = 0; i < d.forms.length; i++) {
      var form    = d.forms[i], 
          params  = {};
      if (form.action.indexOf("#") == 0) {
        form.onsubmit = function () {
          for (var j = 0; j < form.elements.length; j++) {
            params[form.elements[j].id] = form.elements[j].value;
          }
          routing.changeRoute(form.action.replace("#", ""), params);
          return false;
        };
      }
    }
  };
	
  // the core wrench app object which wrench.appify begets
  // to form a new application with the wrench methods
  var wrenchApp = {
    run: function (force) {
      var app = this;
      
      var bootstrap = function () {
        routing.locate();
        routing.attachFormRoutes();        
        if (typeof app.init === 'function') app.init();
      };      

      // attach event listener
      // TODO: find a dom ready function like jquery
      w.addEventListener('load', bootstrap, false);
      
      // fall back to calling the locate function every 250 miliseconds if the
      // browser doesn't have the onhashchange event
      if ("onhashchange" in w) w.onhashchange = routing.locate;
      else setInterval(routing.locate, 500);
      
			// Use force loading if wrench is loaded way after the load event has triggered
      if (force) bootstrap();
      
      return app;
    }
  };
	
  // ----------------- public api ----------------- //
	
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
  
	// add the global wrench variable
  w.wrench = wrench;	
}());