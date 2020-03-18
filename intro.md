# Coding with `dejavu.js`

`dejavu.js` is small JavaScript library for coding the view layer in JavaScript applications. It is written in ECMAScript 3 and  supports browsers back to IE6. The library is kept small, with a minimum of functionality out of the box.

Here, we will go through the functionality of `dejavu.js` with code examples that work as well in IE6 as in modern browsers.

## Observable objects

`dejavu.js` is built on its own type of observable objects, so we need to be familiar with these objects first. The factory function `djv.obs()` creates observable objects.

| Operation               | Standard JavaScript      | `djv.obs()`                        |
| ----------------------- | ------------------------ | ---------------------------------- |
| Create empty object     | `var obj = {}`           | `var obj = djv.obs()`              |
| Create object with data | `var obj = {a: 2, b: 7}` | `var obj = djv.obs({a: 2, b: 7})`  |
| Set property            | `obj['a'] = 5`           | `obj('a', 5)`                      |
| Get property            | `obj['a']`               | `obj('a')`                         |
| Clear property          | `delete obj['a']`        | `obj('a', undefined)`              |

The point of observable objects is to attach listeners that can observe and respond to changes in the object. To attach a listener, simply provide an observer function to the observable object:

```javascript
var obj = djv.obs();
obj(function(property, value){
  alert(property + ' changed to ' + value);
});

```

There is a bit more to learn about observable objects, but we will save that for later.

## Coding a simple view

First, let us create a view factory function. The `djv()` function takes a template string as its first argument and returns a factory function we will use later.

```javascript
var viewFactory = djv('Hello, {{name}}!');
```
Then, with this HTML:
```html
<div id="viewContainer"></div>
```
We can create a view instance as follows:
```javascript
var viewInstance = viewFactory('viewContainer');
```


Coding with <cite>dejavu</cite> is meant to be easy. We start with a template, for instance like this:

```html
<script id="sayHiTemplate" type="text/x-template">
  <div>
    Say hi to <input type="text" djv="bind: person">: Hi, {{person}}
  </div>
</script>
```

Then, we can compile this template, creating a view constructor, like this:

```javascript
var sayHiConstructor = djv('sayHiTemplate');
```
 The `djv()` compiler takes a template as the first argument, either as the id of a DOM element that holds the template, as a direct reference to the DOM element that holds the template, or as a string of HTML.

 Thus, the following all create equivalent constructors:

```javascript
// id of template DOM element
var sayHiConstructor = djv('sayHiTemplate');

// direct reference to template DOM element
var sayHiConstructor = djv(document.getElementById('sayHiTemplate'));

// template as HTML string
var sayHiConstructor = djv(
  '<div>' +
    'Say hi to <input type="text" djv="bind: person">: Hi, {{person}}' +
  '</div>'
);
```

Next, we create an instance of this template, a view instance, and mount it to a DOM element.

```html
<div id="viewContainer"></div>
```

```javascript
var sayHiInstance = sayHiConstructor('viewContainer');
```

Now, we can write in the textbox, and the `{{person}}` field is immediately updated with this text. The `djv="bind: person"` attribute on the input, tells dejavu to bind the value of the input to the observable property `'person'` of the internal state of the view instance. Similarily, the `{{person}}` field is shorthand for `<span djv="bind: person></span>`, which tells dejavu to observe the `'person'` property and update whenever it changes.

If we want to read the value of the `'person'` property from code, we can simply call the view instance like this:

```javascript
var currentPersonValue = sayHiInstance('person');
```

And, if we want to set the value from code, we can do it like this, and watch that the change is immediately visible:

```javascript
sayHiInstance('person', 'Jessie');
```

We can also register observers to the view instance, to be executed whenever a property of the internal state changes. Simply pass an observing function to the instance, like this:

```javascript
sayHiInstance(function(property, value){
  /* code to be executed anytime a property is set or changed */
  if(property === 'person'){
    console.log('Person is currently ' + value)
  }
});
```

We may also set all properties of the internal state directly by passing an object, like this:

```javascript
sayHiInstance({
    person: 'Riley'
});
```

And, if we only needed the view instance (and not the view constructor), we could have mounted and update the template directly like this:

```javascript
var sayHiInstance = djv('sayHiTemplate')('viewContainer')(
  {person: 'Jessie'}
);
```

Now, let us add some buttons and actions. The `djv()` compiler takes up to three arguments when making a view constructor&mdash;a template, a set of view instance external properties, and a default internal state of observable properties. Actions are provided as external properties.

```javascript
var sayHiConstructor = djv(
  // template
  '<div>' +
    '<button djv="click: hiJessie">Jessie</button>' +
    '<button djv="click: hiRiley">Riley</button>: ' +
    'Hi, {{person}}' +
  '</div>',
  // actions, external properties
  {
      hiJessie: function(){
          // this refers to the current view instance
          this('person', 'Jessie')
      },
      hiRiley:  function(){
          this('person', 'Riley')
      }
  },
  // default state, internal and observable properties
  {
      person: 'Riley'
  }
);

// create view instance and mount it
var sayHiInstance = sayHiConstructor('viewContainer');
```

Now, the buttons are linked to the actions, as set by `djv="click: actionName"`, and the two actions set the observable property `'person'` of the view instance.

The actions may also be called directly from code as properties of the view instance:

```javascript
sayHiInstance.hiJessie();
sayHiInstance.hiRiley();
```




