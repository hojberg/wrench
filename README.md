# Wrench

## Description

Wrench is a tiny javascript router / toolbox that is fully standalone.
It's main purpose is to help making single page evented javascript applications

## Installation

Download the wrench.js file and include it in your html file.

## Usage

Set up a simple application that shows users

		var app = wrench.appify({
			init: function () {
				// this will run after in the boot up process initiated by app.run();
			},
			
			users: {
				list: route("/users/list/").to(function () {
					// fetch all the users and show them on the page
				}),
				
				show: route("/users/show/:id").to(function (params) {
					// find the user via params['id']
				})
			}
		});
		app.run();
		
You can also do fragmented routes. Say you have 2 panes in you application. A list and a show pane.
Each pane can be in different states, these states can be saved with fragmented routes like so:

		var mailapp = wrench.appify({
			init: function () {
				// this will run after in the boot up process initiated by app.run();
			},
	
			list: route("list/:mailbox").to(function () {
				// fetch all the users and show them on the page
			}),
		
			show: route("show/:id").to(function (params) {
				// find the email via params['id']
			})
		});
		app.run();

If both route fragments are active this will result in the following url: http://myapp.com/app#list/inbox;show/312
Where "inbox" will be found in params['mailbox'] available function and "321" will be found in params['id'] 
available in the show function

## Dependencies

None :P

## Authors

* Simon Nielsen / hojberg
* Jonas Drewsen / jcd
  
## License

MIT