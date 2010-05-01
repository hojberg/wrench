                                      /\ \        
 __  __  __  _ __    __    ___     ___\ \ \___    
/\ \/\ \/\ \/\`'__\/'__`\/' _ `\  /'___\ \  _ `\  
\ \ \_/ \_/ \ \ \//\  __//\ \/\ \/\ \__/\ \ \ \ \ 
 \ \___x___/'\ \_\\ \____\ \_\ \_\ \____\\ \_\ \_\
  \/__//__/   \/_/ \/____/\/_/\/_/\/____/ \/_/\/_/

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

Copyright (c) 2009 Simon Nielsen

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.