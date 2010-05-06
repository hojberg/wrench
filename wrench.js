/*globals window document */
"use strict";

(function () {
  var wrench  = {},
      routing = {routes: {}},
      events  = {},
      w       = window,
      d       = document;
      
  wrench.VERSION = "0.0.1";

  // ----------------- events ----------------- //  
  events.add = function (element, eventType, handler) { 
    if (element.addEventListener) {
      element.addEventListener(eventType, handler, false);
      return true;
    }
    else if (element.attachEvent) {
      if (eventType === 'DOMContentLoaded') {
        element   = w;
        eventType = "load";
      }
      return element.attachEvent("on" + eventType, handler);
    } 
    else {
      return false; 
    } 
  };  
      
  // ----------------- routing ----------------- //
  
  // translate a route and some params into the window.location.hash
  // builds a string for window.location.hash into multiple route partials if applicable
  routing.route2Hash = function (route, params, fromRoute) {
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
    
    w.location.hash = route;		
  };

  // find out if window.location.hash has changed
  // make sure this function can handle multiple calls
  routing.lastHash = "/";
  routing.hashChanged = function () {
    var changed = w.location.hash != routing.lastHash && w.location.hash != "#" + routing.lastHash;
    return changed;
  };
  
  // find out if a specific partial of window.location.hash has changed
  routing.partialChanged = function (route) {
    if (routing.hashChanged()) {
      var lastPartials    = routing.lastHash.replace("#", "").split(";"),
          currentPartials = w.location.hash.replace("#", "").split(";");
          
      for (var i = 0; i < lastPartials.length; i++) {
        if (lastPartials[i].indexOf(route) == 0) {
          var lastPartial = lastPartials[i];
          break;
        }
        else var lastPartial = "";
      }

      for (var i = 0; i < currentPartials.length; i++) {
        if (currentPartials[i].indexOf(route) == 0) {
          var currentPartial = currentPartials[i];
          break;
        }
        else var currentPartial = "";
      }
      return lastPartial !== currentPartial;
    }
    else return false;
  };
	
	// looks at the current window.location.hash and routes to its function
	// if one is registered and if the route has changed since last locate
	// this is called onhashchange and on load of the page
  routing.locate = function () {    
    if (routing.hashChanged()) {
      var partials     = w.location.hash.replace("#", "").split(";"),
          partialsLen  = partials.length,
          params        = {}, 
          route         = '';
		
      if (partialsLen > 0 && partials[0] !== "") {
        
        for (var i = 0; i < partialsLen; i++) {
          var query = partials[i].split("?");
              route = query.shift();
          if (route in routing.routes && routing.partialChanged(route)) {  
            if (query.length > 0 && typeof query[0] !== "undefined") {
              var paramPairs    = query[0].split("&"), 
                  paramPairsLen = paramPairs.length;
                
              for (var j = 0; j < paramPairsLen; j++) {
                params[paramPairs[j].split("=")[0]] = paramPairs[j].split("=")[1];
              }
            
            }
            routing.routes[route](params);		 
          }
        }
        
      }
      else if ("/" in routing.routes) {
        routing.routes["/"]();
      }
    }
    routing.lastHash = w.location.hash;
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
        
        events.add(form, "submit", function (event) {
          for (var j = 0; j < form.elements.length; j++) {
            params[form.elements[j].id] = form.elements[j].value;
          }
          routing.route2Hash(form.action.replace("#", ""), params);
          event.preventDefault();
        });
        
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

      // attach event listeners
      events.add(d, "DOMContentLoaded", bootstrap);
      
      // fall back to calling the locate function every 250 miliseconds if the
      // browser doesn't have the onhashchange event
      if ("onhashchange" in w) events.add(w, "hashchange", routing.locate);
      else setInterval(routing.locate, 200);
      
			// Use force loading if wrench is loaded way after the load event has triggered
      if (force) bootstrap();

      return app;
    },
    
    route2Hash: function (route, params) {
      routing.route2Hash(route, params);
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
        routing.route2Hash(route, params, true);
    //    func(params);
      };
    }
    else {
      return {
        to: function (func) { 
          routing.routes[route] = func;
          return function (params) {
            routing.route2Hash(route, params, true);
//            func(params);
          };
        } 
      };
    }
  };
  
	// add the global wrench variable
  w.wrench = wrench;	
}());