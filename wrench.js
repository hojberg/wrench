(function () {
  var wrench  = {},
      routing = {routes: {}, lastHash: "/"},
      events  = {},
      w       = window,
      d       = document;

  wrench.VERSION = "0.0.1";


  // Clone object
  var cloneObject = function (o, properties) {
    function F() {};
    F.prototype = o;
    var clone = new F();
    if (properties) {
      for (var prop in properties) {
        if (properties.hasOwnProperty(prop)) {
          clone[prop] = properties[prop];
        }
      }
    }
    return clone;
  };

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
  // Set a route and some params into the
  // window.location.hash. This will build a string for
  // window.location.hash into multiple route
  // partials if applicable.
  routing.route2Hash = function (route, parameters, dontLocate) {    
    var hash   = route,
        i      = 1,
        params = cloneObject(parameters);

		// Set params in new partial string to be added to hash.
		// e.g. 'myroute/:param1/:param2?param3=42&param4=foo
    if (typeof params !== 'undefined') {

			// First set the 'myroute/:param1/:param2' style paramters
			// as specified by the route
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

			// The remaining params are just normal urlencoded params
			// e.g. 'myroute?a=42&b=foo'
      for (var param in params) {
        if (params.hasOwnProperty(param)) {
          if (i !== 1)  { hash += "&"; }
          else          { hash += "?"; }
          hash += param + "=" + params[param];
          i++;
        }
      }
    }
  
    var newHash = "";
    // window.location.hash is blank
    if (w.location.hash === '' || w.location.hash === '#') {
      newHash = hash;
    }
    else {
      // find out if we should replace a partial in window.location.hash or just add to it
      // window.location.hash does not include the partial route. Add the partial
      var newRoute        = w.location.hash,
          routePrefix     = route,
          namedPartialPos = route.indexOf(":");

      if (namedPartialPos !== -1) {
        routePrefix = route.substr(0, namedPartialPos - 1);
      }

      var prefixRegexp = new RegExp(routePrefix + "[^;]*");
      newHash = newRoute.replace(prefixRegexp, hash);

      // nothing was found or replaced, just add the hash
      if (newHash === w.location.hash && !prefixRegexp.test(newHash)) {
        newHash = newHash + ";" + hash;
      }
    }
   
    if (dontLocate) routing.lastHash = hash;
    else routing.lastHash = w.location.hash;

    w.location.hash = newHash;
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

			// TODO: det betyder man ikke kan have en route 'foo' og en 'foobar'?
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

      console.log("partial '" + route + "' changed?: " + (lastPartial !== currentPartial).toString());
      console.log("last: " + lastPartial + " || current: " + currentPartial);
      return lastPartial !== currentPartial;
    }
    else { return false; }
  };

	// This function is called on 'onhashchange' and on load of the page
  // Inspects the current window.location.hash to identify routes.
	// Only handles a route if it has changed since last call to locate.
  // If any of the routes are registered then call the matching funcion of that route.
  routing.locate = function () {

		// Only locate if the hash hash changed
    if (routing.hashChanged()) {

			// The hash may consist of many routes called partial routes delimited by ';'.
			// e.g. 'route1?a=b;route2?uu=32..."
      var partials          = w.location.hash.replace("#", "").split(";"),
          numberOfPartials  = partials.length;

      if (numberOfPartials > 0 && partials[0] !== "") {

				// Handle each partial route
        for (var i = 0; i < numberOfPartials; i++) {

					// Each route can have params encoded like url paramters using
					// e.g "myroute?foo=32&bar=goo"
          var query   = partials[i].split("?"),
              partial = query.shift(),
              params  = {},
              route   = "";

					// First check if the is a simple route that can be found
					// the in the routing registry directly e.g. 'myroute'
          if (partial in routing.routes) {
            route = partial;
          }
					// If it is not a simple route it may be on the form 'myroute/
          else if (partial.indexOf("/") !== -1) {
            for (var r in routing.routes) {
                if (r.indexOf(":") !== -1) {
                  var n = r.indexOf(":") - 1;
                  if (r.substr(0, n) === partial.substr(0, n)) {
                    route = r;
                    break;
								}
              }
            }
          }

					// Only call route function if the partial has actually changed
          if (route !== "" && routing.partialChanged(partial)) {

						// Handle	':foo' route params by matching the route and partial
						// e.g. 'myroute/:var1/:var2' and 'myroute/42/77'
            if (route.indexOf("/") !== -1 && route.indexOf(":") !== -1) {
              var subRoutes   = route.split("/"),
                  subPartial  = partial.split("/");

              for (var j = 0; j < subRoutes.length; j++) {
                if (subRoutes[j].indexOf(":") === 0 && subPartial[j]) {
                  params[subRoutes[j].replace(":", "")] = subPartial[j];
                }
              }
            }

						// The partial may provide normal params using
						// 'myroute?a=32' syntax.
            if (query.length > 0 && typeof query[0] !== "undefined") {
              var paramPairs    = query[0].split("&"),
                  paramPairsLen = paramPairs.length;

              for (var k = 0; k < paramPairsLen; k++) {
                params[paramPairs[k].split("=")[0]] = paramPairs[k].split("=")[1];
              }

            }

            // Call the located route
            console.log("calling route: " + route);
            routing.routes[route](params);
          }
        }

      }
      else if ("/" in routing.routes) {
				// Call the default route if none specified by the hash
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

	// the core wrench app object which wrench.appify uses
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
    return cloneObject(wrenchApp, properties);
  };

  // connects a route to a function
  // can be used like so:
  // var users = route("users", function () {});
  // or: var users = route("users").to(function () {});
  // all routed functions will be called with a
  // params hash as the only argument
  w.route = function (route, func) {
    if (typeof func === 'function') {
      routing.routes[route] = func;
      return function (params) {
        routing.route2Hash(route, params, true);
        func.apply(null, arguments);
      };
    }
    else {
      return {
        to: function (func) {
          routing.routes[route] = func;
          return function (params) {
            routing.route2Hash(route, params, true);
            func.apply(null, arguments);
          };
        }
      };
    }
  };

  w.wrench = wrench;
}());