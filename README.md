# Introduction to dejavu.js

`dejavu.js` is a micro-libary for coding the view layer in web
applications. `dejavu.js` is designed to be lightweight and work in almost any browser, including the old ones supporting JavaScript 1.5 or ECMAScript 3 (looking at you, IE6, IE7 and IE8). `dejavu.js` is inspired and influenced by other JavaScript MV*-libraries and frameworks, in particular [Vue.js](https://vuejs.org/).

Explicit design goals of `dejavu.js` was to allow for brief and flexible coding styles, to keep logic out of template syntax, and to make it easy to code reusable
view components.

To illustrate coding with `dejavu.js`, let us start with a few brief examples.

```html
<div id="viewDiv">
  {{message}}
</div>
```

```javascript
var viewInstance = djv('viewDiv')();

viewInstance('message', 'Have we met before?');
```

Here, the code `djv('viewDiv')()` reads the content of `#viewDiv` as a view template, then mounts an instance of this view to `#viewDiv`. The variable `viewInstance` refers to the view instance.

In the next line, the code `viewInstance('message', 'Have we met before?')` sets the `message` property of the view instance, which is immediately reflected in `#viewDiv`. To test it yourself, open up a console and try to change the message, for example like `viewInstance('message', 'another message')`, and see the immediate result.

## User interaction

View instances ease communication between HTML and JavaScript, in particular when handling user interaction. In the next example, we add a text input, bound to the `message` property by the attribute `djv="bind: message"`.

```html
<div id="viewDiv">
  <p>
    <input type="text" djv="bind: message" />
  </p>
  <p>
    The message is: {{message}}
  </p>
</div>
```
```javascript
var viewInstance = djv('viewDiv')();
viewInstance('message', 'Have we met before?');
```

Now, the `message` property is immediately updated when something is written in the textbox. Binding is two-way, whenever the `message` property is set by other code, it is immediately reflected in the textbox as well.

We can set actions on view instances, which can be called from event handlers on input elements, such as the attribute `djv="click: alertMessage"` in the next example:
```html
<div id="viewDiv">
  <p>
    <input type="text" djv="bind: message" />
    <input type="button" djv="click: alertMessage" />
  </p>
</div>
```
```javascript
var viewInstance = djv('viewDiv', {
  alertMessage: function(){
    var message = this('message');
    alert(message);
  }
})();

viewInstance('message', 'Have we met before?');
```

Now, the view instance has a method named `alertMessage`, which is called by the button in the template. Within the action function, `this` refers to view instance.

The action can also be called from code, like this: `viewInstance.alertMessage()`.

## View instances

View instances are the most important part of coding with `dejavu.js`. View instances are functions, but often behave more like objects. This requires some explanation.

View instances have private, observable properties, as the `message` property in the code above. These properties can be bound and displayed in the HTML template. These observable properties are accessed with function syntax.

View instances also have public, unobservable properties, as the `alertMessage` action in the code above. These properties are accessed with object syntax.

Interacting with the observable properties is designed to mimic interacting with standard, unobservable object properties, as shown here:

```javascript
// get observable property value
var value = viewInstance('property');

// get unobservable property value
var value = viewInstance['property'];

// set observable property value
viewInstance('property', value);

// set unobservable property value
viewInstance['property'] = value;
```

And, accessing the full private state can be done as follows:

```javascript
var stateObject = {'propertyA': value1, 'propertyB': value 2 /* ... */};

// set all observable properties from stateObject
viewInstance(stateObject);

// get a copy of the current state
stateObject = viewInstance();
```

### Special methods and properties

#### `viewInstance.$(localID)`

Access the elements by their local id, as set by `djv="id: localID"`.

#### `viewInstance.$destroy()`

Destroys the view instance, cleans up all internal references. Use this to avoid
memory leaks when removing view instances.

#### `viewInstance.$parent`

Reference to the parent view instance of views mounted to another view. This
property does not exist for other view instances.

#### `viewInstance.$children`

Dictionary to the internal IDs of all current child view instances.

#### `viewInstance._`

The internal ID of the current view instance. For internal use.

### Hooks

#### `viewInstance.$update = function(property, value){}`
#### `viewInstance.$updated = function(property, value){}`
#### `viewInstance.$mount = function(){}`
#### `viewInstance.$key = function(event, keycode, element){}`

### Observing a view instance

The point of having observable properties is that we can register observers; functions that are called whenever an observable property is set.

To listen to changes to observable properties, simply pass an observer function to the view instance, like this:

```javascript
viewInstance(function(property, value){
  console.log('The property ' + property +
    ' was just set to the value ' + value)
});
```

To unregister an observer, keep a reference to its unregistration function when it is set. This function can be called later to unregister the observer.

```javascript
// register an observer, keep a reference to its unregistration function
var unregisterFunction = viewInstance(function(property, value){
    /* executes whenever an observable property is set */
});

// unregister the observer
unregisterFunction();
```

View instances do not have a notification function that can be called directly.
To manually trigger notification of a single property, call `viewInstance('property', viewInstance('property'))`.
To manually trigger notification of all current properties, call `viewInstance(viewInstance())`.

To delete an observable property, set it to `undefined`. Then, it will be omitted
when reading the current state by calling `viewInstance()`. When setting an observable property to `undefined`,
all observers are still notified.

## View constructors

In the first example, there was a double function call when creating the view
instance:

```javascript
var viewInstance = djv('viewDiv')();
```

This code could be rewritten to illustrate the three basic parts of coding with `dejavu.js`: the dejavu compiler `djv()`, view constructors, and view instances:

```javascript
var viewConstructor = djv('viewDiv');
var viewInstance = viewConstructor();
```
The compiler `djv()`, creates view constructors from templates. View
constructors are functions that create and mount view instances. In this code, the view constructor reads `#viewDiv` as a template. Then, when called, the view constructor creates a new view instance and mounts it to the same element,
`#viewDiv`, that the template was read from.

## Templates

```html
<label djv="for: id"></label>
<span djv="bind: property, format: formattingFunction">
{{property | formattingFunction}}
<input djv="click: action, keydown: action, keypress: action">
<input djv="id: localID, parse: parsingFunction">
<input type="radio" djv="radio: radioGroupID">
```

## General helper functions

#### `djv.elm(ID)`

If ID is an object with an `innerHTML` property of type string, it returns this object. Otherwise, returns the result of `document.getElementById(ID)`.

#### `djv.keydown(event, keycode[, preventDefault])`

Helper function to test whether an event is of type `keydown` with the specified `keycode`. Returns a boolean. The optional `preventDefault` argument is a boolean to specify if the event default should be prevented if the keycode matches.

#### `djv.focus(viewInstance, localID)`

Helper function for setting focus to local elements of view instances
(certain old browsers requires a workaraound).

#### `djv.obs()`

Constructor for observable objects. Used internally to construct view instances.
Can be used to create subscriber/publisher patterns or simple event hubs.
