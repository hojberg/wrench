"use strict";

(function () {
  
  // ----------------- ES5 features for older browsers ----------------- //
  if (!Array.prototype.forEach) {
    Array.prototype.forEach =  function(block, thisObject) {
      var len = this.length > 0;
      for (var i = 0; i < len; i++)
        if (i in this) block.call(thisObject, this[i], i, this);
    };
  }	
	
  // ----------------- private api ----------------- //
  var wrench  = {},
      routing = {routes: {}},
      w       = window,
      d       = document;
	
  // Routing
  routing.changeRoute = function (route, params) {
    var routeUrl  = route,
        i         = 1;
    if (typeof params !== 'undefined') {
      routeUrl += ":";
      for (var param in params) {
        if (params.hasOwnProperty(param)) {
          if (i != 1) routeUrl += "+";
          routeUrl += param + "=" + params[param];
          i++;
        }
      }
    }
				
    if (w.location.hash != "" && 
        w.location.hash != "#" && 
        w.location.hash.indexOf(route) == -1) {
      route = w.location.hash + ";" + routeUrl;
    }
    else {
      route = routeUrl;
    }
		
    w.location.hash = route;		
  };
	
  routing.locate = function () {		
    var currentRoutes = w.location.hash.replace("#", "").split(";"), 
        params        = {}, 
        route         = '';
		
    if (currentRoutes.length > 0 && currentRoutes[0] != "") {
			
			currentRoutes.forEach(function (routeString) {
				var rawParams = routeString.split(":");			
				func = rawParams.shift();
				if (rawParams.length > 0 && rawParams[0] != undefined) {
					rawParams[0].split("+").forEach(function (param) {
						params[param.split("=")[0]] = param.split("=")[1]
					});
				}

				if (func in routing.routes) routing.routes[func](params);			
			});
			
		}
		else if ("/" in routing.routes) {
			routing.routes["/"]();
		}
		
	};
	
	// wrench application object
	var wrenchApp = {
		callRoute: function (route, params) {
			routing.changeRoute(route, params);
		},
		run: function () {
			var app = this;

			window.addEventListener('load', function () {
				routing.locate();
				if (typeof app.init === 'function') app.init();
			}, false);
			// window.onhashchange = routing.locate;
			
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
	//  as the only argument
	window.route = function (route, func) {
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
	
	window.wrench = wrench;	
}());