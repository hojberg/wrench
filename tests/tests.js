module("Core");

	test("Public API exists", function () {		
		ok(wrench, "wrench global object should exist");
		equal(typeof route,         "function", "route global function should exist");
    equal(typeof route().to,    "function", "route should return an object with the to function");
		equal(typeof wrench.appify, "function", "wrench.appify function should exist");
    equal(typeof [].forEach,    "function", "[].forEach (array) function should exist");
	});
	
  
	test("Should create a new wrench app", function () {
		var app = wrench.appify({foo: 'bar'});
		equal(typeof app.run, "function", "should have a run function");
		equal(app.foo, "bar", "should have a foo property that returns 'bar'");
	});
	
	test("Should run a wrench app", function () {
		var app = wrench.appify({foo: 'bar', init: function () { app.bar = 'baz'; } });
		app.run(true);
		
		equal(app.bar, "baz", "run should run the init() function and add the property bar");
	});
	
module("Routing");

  test("add #foo/bar route", function () {
  	var app = wrench.appify({
  	  foo: route("foo/bar").to(function () {
  	    app.foobarRoute = "ran";
  	  })
  	});
  	app.run(true);
  	
  	equal(typeof app.foobarRoute, "undefined", "should not yet have the foobarRoute property");
  	window.location.hash = "foo/bar";
    equal(app.foobarRoute, "ran", "should have executed the route function");
    window.location.hash = "";
  });
  
  test("should run 2 route fragments", function () {
  	var app = wrench.appify({
  	  init: function () {
  	    app.fragments = 0;
  	  },
  	  fragmentOne: route("fragmentone/foo").to(function () {
  	    app.fragments++;
  	  }),
  	  fragmentTwo: route("fragmenttwo/bar").to(function () {
        app.fragments++;
  	  })
  	});
  	app.run(true);
  	
  	equal(app.fragments, 0, "no fragment routes should be excecuted");
  	window.location.hash = "fragmentone/foo;fragmenttwo/bar";
    equal(app.fragments, 2, "both fragment routes should be excecuted");
    window.location.hash = "";
  });
  
  test("should create a params hash and pass it to the route function", function () {
    var app = wrench.appify({
      paramsRoute: route("foo/bar").to(function (params) {
        app.params = params;
      })
    });
    app.run(true);
    
    equal(typeof app.params, "undefined", "app.params should not exist");
  	window.location.hash = "foo/bar:one=two+three=four";
    // location.hash = "foo/bar?one=two&three=four";
    ok(typeof app.params !== 'undefined', "app.params should now exist");
    equal(app.params["one"], "two", "app.params['one'] should exist and contain 'two'");
    equal(app.params["three"], "four", "app.params['three'] should exist and contain 'four'");
    window.location.hash = "";
  });
  
  test("should create params from a named params route", function () {
    // var app = wrench.appify({
    //   list: route("list/:view").to(function (params) {
    //     app.params = params;
    //   })
    // });
    // app.run(true);
    // 
    // equal(typeof app.params, "undefined", "app.params should not exist");
    // location.hash = "list/all";
    // ok(typeof app.params !== 'undefined', "app.params should now exist");
    // equal(app.params["view"], "all", "app.params['view'] should exist and contain 'all'");
    window.location.hash = "";
  });
  
  test("a call to a routed function should change location.hash", function () {
    var app = wrench.appify({
      numberOfRuns: 0,
      routeOne: route("foo/bar").to(function () {
        app.numberOfRuns++;
      })
    });
    app.run(true);
    
    app.routeOne();
    equal(window.location.hash, "#foo/bar", "location.hash should be equal to '#foo/bar'");
    equal(app.numberOfRuns, 1, "the routeOne function should only be ran once");
    window.location.hash = '';
  });
  
  test("should add route event handler to all forms with a # in the action", function () {
    var app = wrench.appify({
      login: route("login").to(function (params) {
        app.params = params;
      })
    });
    app.run(true);
    
    ok(typeof app.params === 'undefined', "app.params should not exist");  
    
    document.getElementsByTagName("form")[0].onsubmit();
    
    equal(window.location.hash, "#login:username=frank+password=s3cret", "the form data should have submitted to the location.hash");
    ok(typeof app.params !== 'undefined', "app.params should now exist");
    equal(app.params["username"], "frank", "app.params['username'] should exist and contain 'frank'");
    equal(app.params["password"], "s3cret", "app.params['password'] should exist and contain 's3cret'");
    window.location.hash = '';
  });