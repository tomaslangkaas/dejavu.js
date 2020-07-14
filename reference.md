
# `dejavu` reference

The `dejavu` library consists of one single global, `djv`, with a set of methods and properties. `djv` is also a callable function, used to produce view factories.

## djv properties

### djv.version

String with current library version.

## djv methods

### djv.attr(DOMelement, attribute)

Helper function. Shortcut for `DOMelement.getAttribute('djv-' + attribute)`. All djv parameters on DOM elements are converted to attributes of the form `djv-parameter="value"`.

### djv.target(DOMevent)

Helper function. Returns the DOM element that the DOM event originated from.

### djv.writable(DOMelement)

Helper function. Returns `true` if the DOM element is a `<textarea>` or `<input>` with a type of `text`, `tel`, `url`, `datetime-local`, `search`, `month`, `week`, `file`, `password`, `number`, or `email`.

### djv.addEvent(DOMelement, eventType, eventHandler)

Helper function. Wrapper for `attachEvent` and `addEventListener`, depending on which one is available.

### djv.keydown(DOMevent, keycode\[, prevent\])

Helper function. Returns `true` if the provided DOM event is of type keydown with the specified keycode, otherwise returns `false`. If the optional prevent argument has a truthy value, the function calls `preventDefault()` or sets `returnValue = false` on the DOM event if the event matches the specificed keycode.

### djv.focus(viewInstance, localID)

Helper function. For the provided view instance, this function calls the `focus()` method on the DOM element with the specified local ID (as specificed by the djv parameter `id`).

### djv.$(id)

Helper function. If the id argument has an `innerHTML` property of type string, it returns id. Otherwise, it returns the result of calling `document.getElementById(id)`.

### djv.\_pt

Reference to the internal `parseTemplate` function. Used for debugging.

### djv.obs()

Helper function. Factory for observable objects, based on the library [`obs.js`](https://github.com/tomaslangkaas/obs.js/blob/gh-pages/README.md).

View instances are observable objects, implementing the interface of `obs.js` objects.

### djv.key(key, handler)

Helper function to register global key handlers. The key argument is an array of strings or keycodes, and the handler is the corresponding key handler. The triggering DOM event is passed as a single argument to the key handler.

The function only allows one key handler for each key combination. Register a new handler to override a previous one. To remove a handler, simply call the function with the key combination.

Keycodes for special keys are provided as constant properties of `djv.key`: `djv.key.BACKSPACE`, `djv.key.TAB`, `djv.key.ENTER`, `djv.key.CAPSLOCK`, `djv.key.ESC`, `djv.key.SPACE`, `djv.key.PAGEUP`, `djv.key.PAGEDOWN`, `djv.key.END`, `djv.key.HOME`, `djv.key.LEFTARROW`, `djv.key.UPARROW`, `djv.key.RIGHTARROW`, `djv.key.DOWNARROW`, `djv.key.INSERT`, `djv.key.DELETE`, `djv.key.F1`, `djv.key.F2`, `djv.key.F3`, `djv.key.F4`, `djv.key.F5`, `djv.key.F6`, `djv.key.F7`, `djv.key.F8`, `djv.key.F9`, `djv.key.F10`, `djv.key.F11`, `djv.key.F12`, `djv.key.NUMLOCK`, `djv.key[0]`, `djv.key[1]`, `djv.key[2]`, `djv.key[3]`, `djv.key[4]`, `djv.key[5]`, `djv.key[6]`, `djv.key[7]`, `djv.key[8]`, `djv.key[9]`.

`djv.key` also provides constants for modifier keys, `djv.key.SHIFT`, `djv.key.CTRL`, `djv.key.ALT`.

```javascript
djv.key(
  [djv.key.SHIFT, 'S'],
  function(){
    alert('SHIFT + S was pressed.');
  }
);

djv.key([djv.key.SHIFT, 'S']); // remove key handler
```

## djv function

The `djv()` function is defines and creates views. Technically, `djv()` is called with arguments that define a view, then returns a view factory. This view factory is called to instantiate specific instances of the defined view and mount the instance to DOM. View instances provide an interface for JavaScript to interact with the mounted view.

```javascript
djv(template);
djv(template, public);
djv(template, public, private);
```
