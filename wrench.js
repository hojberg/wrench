//By Simon Nielsen
/*globals window document setInterval */
"use strict";
(function () {
  var wrench  = {},
      routing = {routes: {}, lastHash: "/"},
      events  = {},
      w       = window,
      d       = document;
      
  wrench.VERSION = "0.0.1";

  // ## Events
  // Cross browser compatible event handling
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
      
  // ## Routing
  // translate a route and some params into the 
  // window.location.hash builds a string for 
  // window.location.hash into multiple route 
  // partials if applicable
  routing.route2Hash = function (route, params, fromRoute) {
    var hash  = route,
        i     = 1;
    if (typeof params !== 'undefined') {
      
      if (route.indexOf("/") !== -1 && route.indexOf(":") !== -1) {
        var r = route.split("/");        
        for (var j = 0; j < r.length; j++) {
          if (r[j].indexOf(":") === 0) {
            if (r[j].substr(1) in params) {
              hash = hash.replace(r[j], params[r[j].substr(1)]);
              delete params[r[j].substr(1)];
            }
          }  
        }                
      }
      
      for (var param in params) {
        if (params.hasOwnProperty(param)) {
          if (i !== 1)  { hash += "&"; }
          else          { hash += "?"; }
          hash += param + "=" + params[param];
          i++;
        }
      }
    }
				
    if (w.location.hash !== "" && 
        w.location.hash !== "#" && 
        (w.location.hash.indexOf(route.substr(0, route.indexOf(":") - 1 )) === -1)) {
      route = w.location.hash + ";" + hash;
    }
    else {
      route = hash;
    }
    
    w.location.hash = route;		
  };

  // find out if window.location.hash has changed
  // make sure this function can handle multiple calls
  routing.hashChanged = function () {
    var changed = w.location.hash != routing.lastHash && w.location.hash != "#" + routing.lastHash;
    return changed;
  };
  
  // find out if a specific partial of 
  // window.location.hash has changed
  routing.partialChanged = function (route) {
    if (routing.hashChanged()) {
      var lastPartials    = routing.lastHash.replace("#", "").split(";"),
          currentPartials = w.location.hash.replace("#", "").split(";"),
          lastPartial     = "",
          currentPartial  = "";
          
      for (var i = 0; i < lastPartials.length; i++) {
        if (lastPartials[i].indexOf(route) === 0) {
          lastPartial = lastPartials[i];
          break;
        }
      }

      for (var j = 0; j < currentPartials.length; j++) {
        if (currentPartials[j].indexOf(route) === 0) {
          currentPartial = currentPartials[j];
          break;
        }
      }
      return lastPartial !== currentPartial;
    }
    else { return false; }
  };
  
  // looks at the current window.location.hash 
  // and routes to its function if one is 
  // registered and if the route has changed 
  // since last locate this is called onhashchange 
  // and on load of the page	
  routing.locate = function () {    
    if (routing.hashChanged()) {
      var partials          = w.location.hash.replace("#", "").split(";"),
          numberOfPartials  = partials.length;
		
      if (numberOfPartials > 0 && partials[0] !== "") {
        
        for (var i = 0; i < numberOfPartials; i++) {
          var query   = partials[i].split("?"),
              partial = query.shift(),
              params  = {},
              route   = "";
              
          if (partial in routing.routes) {
            route = partial;
          }
          else if (partial.indexOf("/") !== -1) {
            for (var r in routing.routes) {
              if (r.indexOf("/") !== -1) {
                if (r === partial) {
                  route = r;
                  break;
                }
                else if (r.indexOf(":") !== -1) {
                  var n = r.indexOf(":") - 1;
                  if (r.substr(0, n) === partial.substr(0, n)) {
                    route = r;
                    break;
                  }
                }
              }
            }
          }
                            
          if (route !== "" && routing.partialChanged(partial)) {  
            if (route.indexOf("/") !== -1 && route.indexOf(":") !== -1) {
              var subRoutes   = route.split("/"),
                  subPartial  = partial.split("/");
            
              for (var j = 0; j < subRoutes.length; j++) {
                if (subRoutes[j].indexOf(":") === 0 && subPartial[j]) {
                  params[subRoutes[j].replace(":", "")] = subPartial[j];
                }
              }
            }

            if (query.length > 0 && typeof query[0] !== "undefined") {
              var paramPairs    = query[0].split("&"), 
                  paramPairsLen = paramPairs.length;
                
              for (var k = 0; k < paramPairsLen; k++) {
                params[paramPairs[k].split("=")[0]] = paramPairs[k].split("=")[1];
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
  // character in the action attribute gets a 
  // onsubmit event added
  routing.attachFormRoutes = function () {    
    var forms = d.forms;
    var handler = function (event) {
      var form      = event.target,
          elements  = form.elements,
          params    = {};
      for (var j = 0; j < elements.length; j++) {
        params[elements[j].id] = elements[j].value;
      }
      routing.route2Hash(form.action.replace("#", ""), params);
      event.preventDefault();
    };
    
    for (var i = 0; i < forms.length; i++) {
      if (forms[i].action.indexOf("#") === 0) {        
        events.add(forms[i], "submit", handler);        
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
        if (typeof app.init === 'function') { app.init(); }
      };      

      // attach event listeners
      events.add(d, "DOMContentLoaded", bootstrap);
      
      // fall back to calling the locate function 
      // every 250 miliseconds if the browser 
      // doesn't have the onhashchange event
      if ("onhashchange" in w) { events.add(w, "hashchange", routing.locate); }
      else { setInterval(routing.locate, 200); }
      
			// Use force loading if wrench is loaded way 
			// after the load event has triggered
      if (force) { bootstrap(); }

      return app;
    },
    
    route2Hash: function (route, params) {
      routing.route2Hash(route, params);
    }
  };
	
  // ## public api
	// Turn an object into a wrench application
  wrench.appify = function (properties) {
    function F() {}
    F.prototype = wrenchApp;
    var app = new F();
    for (var prop in properties) {
      if (properties.hasOwnProperty(prop)) {
        app[prop] = properties[prop];
      }
    }
    return app;
  };

  // connects a route to a function
  // can be used like so: 
  // var users = route("users", function () {});
  // or: var users = route("users").to(function () {});
  // all routed functions will be called with a 
  // params hash as the only argument		
  w.route = function (route, func) {
    var locate = function (params) {
      routing.route2Hash(route, params, true);
    };
    
    if (typeof func === 'function') {
      routing.routes[route] = func;			
      return locate;
    }
    else {
      return {
        to: function (func) { 
          routing.routes[route] = func;
          return locate;
        } 
      };
    }
  };
  
  w.wrench = wrench;
}());