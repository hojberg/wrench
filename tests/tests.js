module("Core");

	test("Public API exists", function () {		
		ok(wrench, "wrench global object should exist");
		equal(typeof route, "function", "route global function should exist");
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
		app.run();
		equal(app.bar, "baz", "run should run the init() function and add the property bar");
	});
	
module("Routing");
	
