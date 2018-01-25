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

View instances eases communcication between HTML and JavaScript, in particular when handling user interaction. In the next example, we add a text input, which is bound to the `message` property by the attribute `djv="bind: message"`.

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

Now, the `message` property is immediately updated when something is written in the textbox.

We can also set actions on view instances, which can be called by setting event handlers on input elements, like the attribute `djv="click: alertMessage"` in the next example:
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

View instances are functions. View instances also have static, public properties, like actions. And, view instances have an internal private state with observable properties. This requires some explanation. Interacting with the observable properties is designed to mimic interacting with standard, unobservable JavaScript objects.

```javascript
// read observable property value
var value = viewInstance('property');
// read public, unobservable property value
var value = viewInstance['property'];

// write to observable property value
viewInstance('property', value);
// read to public, unobservable property value
viewInstance['property'] = value;

// set all observable property values
viewInstance('property', value);

```





The `message` property of the view instance is observable, which means that we can listen and respond to changes. To listen to changes to observable properties, simply pass an observer function to the view instance, like this:

```javascript
viewInstance(function(property, value){
    console.log('The property ' + property + ' was just set to the value ' + value)
});
```

To get an object copy with the current state of the observable properties, simply call the view instance like this:

```javascript
var observableProperties = viewInstance();
// observableProperties is now the object {message: 'Have we met before?'}
```


## The basic parts of coding with dejavu

Now it is time to give a more detailed explanation of coding with dejavu. (=
compiler, constructors, instances) (observable, private properties and stat=
ic, public properties of instances)
