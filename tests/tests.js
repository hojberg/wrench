module("Core");

	test("Public API exists", function () {		
		ok(wrench, "wrench global object should exist");
		equal(typeof route, "function", "route global function should exist");
    equal(typeof route().to, "function", "route should return an object with the to function");
		equal(typeof wrench.appify, "function", "wrench.appify function should exist");
    equal(typeof [].forEach, "function", "[].forEach (array) function should exist");
	});
	
  
	test("Should create a new wrench app", function () {
		var app = wrench.appify({foo: 'bar'});
		equal(typeof app.run, "function", "should have a run function");
		equal(typeof app.callRoute, "function", "should have a callRoute function");
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
  	location.hash = "foo/bar";
    equal(app.foobarRoute, "ran", "should have executed the route function");
    location.hash = "";
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
  	location.hash = "fragmentone/foo;fragmenttwo/bar";
    equal(app.fragments, 2, "both fragment routes should be excecuted");
    location.hash = "";
  });
	
