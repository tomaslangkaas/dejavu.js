
## djv

The `dejavu` library consists of one single global, `djv`, with a set of methods and properties. `djv` is also a callable function, used to produce view factories.

### djv()
```javascript
djv(template);
djv(template, public);
djv(template, public, private);
```

### djv.version

String with current library version.

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

Helper function. Calls the `focus()` method on the DOM element with the specified local ID (as specificed by the djv parameter `id`) of the provided view instance.

### djv.$(id)

Helper function. Unless the id argument has an `innerHTML` property of type string, the function returns the result of calling `document.getElementById(id)`.

### djv._pt
### djv.obs
### djv.key
