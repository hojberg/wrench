// Rewrite of kangax event simulator for prototypejs so it will work
// in native JS (original: http://github.com/kangax/protolicious/blob/master/event.simulate.js)
// usage: 
//
//    simulateEvent(form, "submit"); // => emits the "submit" event on the form element
//
(function () {
  
  var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|mouse(?:down|up|over|move|out))$/
  };
  
  var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
  };
  
  var merge = function (o1, o2) {
    var newO = {};
    for (var prob in o1) newO[prob] = o1[prob];
    for (var prob in o2) newO[prob] = o2[prob];
    return newO;
  };
  
  window.simulateEvent = function (element, eventName) {
    var options = merge(defaultOptions, arguments[2] || {});
    var domEvent, eventType = null;
    
    if (typeof element === 'string') element = document.getElementById(element);
    
    for (var name in eventMatchers) {
      if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
      throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent) {
      domEvent = document.createEvent(eventType);
      if (eventType == 'HTMLEvents') {
        domEvent.initEvent(eventName, options.bubbles, options.cancelable);
      }
      else {
        domEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView, 
          options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
          options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
      }
      element.dispatchEvent(domEvent);
    }
    else {
      options.clientX = options.pointerX;
      options.clientY = options.pointerY;
      domEvent = merge(document.createEventObject(), options);
      element.fireEvent('on' + eventName, domEvent);
    }
  };

}());