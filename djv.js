(function(window, document) {
  window["djv"] = djv;
  djv.version = "0.2.9";

  // active views

  var views = {};

  // view instance id generator

  var IDPrefix = "djv",
      IDCounter = 1;

  function generateID() {
    return IDPrefix + IDCounter++;
  }

  // utils
  
  var defer = setTimeout;

  function target(evt){
    var elm = evt.target || evt.srcElement;
    return elm.nodeType === 3 ? elm.parentNode : elm;
  }

  function attr(elm, prop) {
    return elm.getAttribute("djv-" + prop) || "";
  }

  function runFn(obj, fn, arg1, arg2, arg3) {
    return fn && typeof obj[fn] === "function" && obj[fn](arg1, arg2, arg3);
  }

  function writable(elm){
    var tagName = elm.tagName.toLowerCase();
    return tagName === "textarea" || (tagName === "input" &&
    "text tel url datetime-local search month week file password number email"
     .indexOf(elm.type) > -1);
  }

  function setHandler(elm, remove) {
    elm.onkeydown = elm.onkeypress = elm.onkeyup = elm.onclick = elm.oninput = elm.onfocusout = remove
      ? null
      : handler;
    elm[(remove = (remove ? "remove" : "add") + "EventListener")] &&
      elm[remove]("blur", handler, true);
  }
  
  function getHTML(elm){
    return elm.innerHTML;
  }
  
  function setHTML(elm, html){
    elm.innerHTML = html;
  }

  function disableHTML(str){
    return str.replace(/[<>"'&]/g, function(match) {
      return "&#" + match.charCodeAt(0) + ";";
    });
  }

  djv["attr"] = attr;

  djv["target"] = target;

  djv["writable"] = writable;

  djv["addEvent"] = function(elm, etype, fn){
    var a = 'addEventListener';
    elm[a] && elm[a](etype, fn, !1) ||
    elm[(a = 'attachEvent')] && 
      elm[a](
        'on' + etype, 
        function(){fn['call'](elm, window['event']);}
      );
  }

  djv["keydown"] = function(evt, keycode, prevent) {
    if (evt.type === "keydown" && keycode === (evt.keyCode || evt.charCode)) {
      if (prevent) {
        evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);
      }
      return true;
    }
    return false;
  };

  djv["focus"] = function(viewInstance, localID) {
    defer(function() {
      viewInstance.$(localID).focus();
    });
  };

  // view constructor: djv(templateStringOrId [, methods][, defaultState])

  function djv(templateStringOrID, methods, defaultState) {

    methods = methods || {};
    defaultState = defaultState || {};

    var bindings = {},
        localIDs = {},
        template = elm(templateStringOrID);
    
    template = parseTemplate(
      template ? getHTML(template) : templateStringOrID,
      bindings,
      localIDs
    );

    viewConstructor["_params"] = [
      template,
      bindings,
      localIDs,
      methods,
      defaultState
    ];
    //var viewInstance = viewClass(parentViewInstance, parentLocalID)
    //                   OR viewClass(parentElementOrId)
    function viewConstructor(parent, parentID, clear, viewID) {
      var viewInstance = obs(),
        children,
        prop;
      
      if(!parent){ // mount to template container
        parent = elm(templateStringOrID);
        clear = true;
      }
      
      // update when attached to DOM
      
      defer(function(){
        viewInstance(viewInstance(null));
        runFn(viewInstance, '$mounted');
      })

      // public interface

      for (prop in methods) {
        viewInstance[prop] = methods[prop];
      }

      viewID = viewInstance["_"] = viewID || generateID();
      children = viewInstance["$children"] = {};
      viewInstance["$"] = function(localID) {
        if (localID = localIDs[localID]) {
          return elm(this["_"] + "_" + localID);
        }
      };
      viewInstance["$display"] = function(id, state){
        this.$(id).style.display = state === false ? 'none' : '';
      };
      viewInstance["$destroy"] = function() {
        // TODO: transform to mixin
        var viewInstance = this,
            viewID = viewInstance["_"],
            domElm = elm(viewID + "_1"),
            parent = domElm.parentNode,
            childrenID;
        runFn(this, '$unmount');
        if (!viewInstance.$parent) {
          // is root view
          setHandler(parent, true);
        } else {
          for (childrenID in children) {
            children[childrenID] && children[childrenID].$destroy();
          }
          viewInstance.$parent.$children[viewID] = void 0;
        }
        domElm && parent.removeChild(domElm);
        views[viewID] = null;
      };

      if (parentID && parent.$) {
        // child view
        viewInstance["$parent"] = parent;
        parent.$children[viewID] = viewInstance;
        parent = parent.$(parentID);
      } else if (parent = elm(parent)) {
        // root view
        setHandler(parent);
      }
      
      // $mount hook
      runFn(viewInstance, '$mount');
      
      setHTML(parent, (clear ? "" : getHTML(parent)) + template(viewID));
      views[viewID] = viewInstance;

      // view updater
      viewInstance(defaultState);
      viewInstance(updateViewInstance);
      
      return viewInstance;
    }

    // view updater

    function updateViewInstance(prop, val, avoidID) {
      var a = bindings[prop] || [],
          l = a.length,
          i = 0,
          domElm,
          fun,
          formatted,
          tagName,
          viewID = this._;
      runFn(this, '$update', prop, val);
      for (i; i < l; i++) {
        if (avoidID !== viewID + "_" + a[i] && (domElm = elm(viewID + "_" + a[i]))) {
          tagName = domElm.tagName.toLowerCase();
          fun = attr(domElm, "format");
          formatted = "" + [this[fun] ? runFn(this, fun, val, domElm) : val];
          if (domElm.type === "radio" || domElm.type === "checkbox") {
            domElm.checked = domElm.value === formatted; // val
          } else if (tagName === "input" || tagName === "button") {
            domElm.value = formatted;
          } else if (tagName === "textarea") {
            domElm.value = formatted;
            //setHTML(domElm, formatted);
            domElm.setAttribute("value", formatted); // old IE, fails in chrome?
          } else {
            setHTML(
              domElm, 
              attr(domElm, "html") ? 
                formatted :
                disableHTML(formatted)
            );
          }
        }
      }
      runFn(this, '$updated', prop, val);
    }
    
    return viewConstructor;
  }

  function elm(id) {
    return typeof id.innerHTML === "string" ? id : document.getElementById(id);
  }

  djv["$"] = elm;

  // parseTemplate(templateString, bindings, localIDs); internal template parser

  // compile regexes only once
  var ptRegEx1 = /\{\{\s*(\w+)(?:[\s\|]+(\w+))?\s*\}\}| djv\=(\"([^\"]*)\"|\'([^\']*)\')|[\x00-\x1f\"\\]/gi,
      ptRegEx2 = /\s*(\w+)\s*\:\s*(\w+)\s*/g,
      ptRegEx3 = /^(\s*<[a-z1-6]+)([^>]*>)/i;

  function parseTemplate(str, bindings, localIDs) {
    var IDcounter = 1,
        regex1 = ptRegEx1,
        regex2 = ptRegEx2,
        regex3 = ptRegEx3,
        temp;
    if ((temp = str.match(regex3))) {
      if (!/\sdjv\=[\"\']/.test(temp)) {
        str = str.replace(regex3, '$1 djv=""$2');
      }
    } else {
      str = '<div djv="">' + str + "</div>";
    }
    function replacer2(arr, prop, value) {
      if (prop === "id") {
        localIDs[value] = IDcounter - 1;
      } else if (prop === "bind") {
        (arr = bindings[value] = bindings[value] || [])[arr.length] =
          IDcounter - 1;
      }
      return prop === "radio"
        ? " name=\"'+c+'_" + value + '"'
        : " djv-" + prop + '="' + value + '"';
    }

    return new Function(
      "c",
      "return'" +
        str.replace(regex1, function(m, prop, format, params, p1, p2) {
          return params
            ? " id=\"'+c+'_" +
                IDcounter++ +
                '"' +
                ((p1 || p2 || "").match(regex2) || [])
                  .join(" ")
                  .replace(regex2, replacer2)
            : prop
              ? (((prop = bindings[prop] = bindings[prop] || [])[
                  prop.length
                ] = IDcounter),
                "<span id=\"'+c+'_" +
                  IDcounter++ +
                  '"' +
                  (format ? ' djv-format="' + format + '"' : "") +
                  "></span>")
              : "\\x" + encodeURI(m).slice(-2);
        }) +
        "'"
    );
  }

  djv["_pt"] = parseTemplate;

  // root view event capture handler

  function handler(
    evt,
    elm,
    id,
    key,
    view,
    bind,
    type,
    inputType,
    val,
    fun,
    isBlur
  ) {
    evt = evt || window.event;
    elm = target(evt);
    id = elm.id || ""; //).split("_");
    view = views[id.split("_")[0]];
    if (view) {
      type = evt.type;
      inputType = "" + elm.type;
      if (type === "keydown" || type === "keypress") {
        runFn(view, "$onkey", evt, evt.keyCode || evt.charCode, elm);
      } else if ((bind = attr(elm, "bind"))) {
        if (inputType === "radio" || inputType === "checkbox") {
          if (type === "click") {
            view(bind, elm.checked ? elm.value : "", 0, 1);
          }
        } else if (
          writable(elm)
        ) {
          isBlur = type === "blur" || type === "focusout";
          val = elm.value;
          //protect id if not blur/focusout
          view(
            bind,
            typeof (fun = view[attr(elm, "parse")]) === "function"
              ? fun(val)
              : val,
            isBlur ? null : id,
            1
          );
          if (isBlur) {
            val = view(bind);
            elm.value =
              typeof (fun = view[attr(elm, "format")]) === "function"
                ? fun(val)
                : val;
          }
        }
      }
      runFn(view, attr(elm, type), evt, evt.keyCode || evt.charCode, elm);
    }
  }

  // obs: observable objects

  obs["ver"] = "0.2";
  djv["obs"] = obs;

  function obs(init) {
    var data = {},
      observers = {},
      iter = 1;

    function notify(prop, msg, val, i) {
      val = getPropVal(data, prop); //CONSIDER: drop computable/callable props, except on object copy
      for (i in observers) {
        observers[i] && observers[i].call(obs, prop, val, msg);
      }
    }

    function getPropVal(obj, prop, preserve) {
      return obj.hasOwnProperty(prop)
        ? typeof obj[prop] === "function" && !preserve
          ? obj[prop].call(obs)
          : obj[prop]
        : void 0;
    }

    function obs(arg1, arg2, arg3, arg4) {
      // obs() => return computed copy
      // obs(null) => return equivalent copy
      // obs(object) => overwrite with object data
      // obs(prop) => get property
      // obs(prop, val [, msg][, onlyIfDifferent])=> set property
      var preserve = arg1 === null,
        args = arguments,
        i,
        target,
        source,
        copy = !args.length || preserve;
      if (copy || typeof arg1 === "object") {
        if (!copy) {
          for (i in arg1) {
            data[i] = arg1[i];
          }
        }
        target = copy ? {} : data;
        source = copy ? data : arg1;
        for (i in data) {
          arg2 = getPropVal(source, i, preserve);
          if (copy ^ (arg2 === void 0)) {
            target[i] = arg2;
          }
          !copy && notify(i, arg3);
        }
        return copy ? target : obs;
      } else if (typeof arg1 === "function") {
        return (function(index) {
          observers[index] = arg1;
          return function() {
            observers[index] = 0;
          };
        })(iter++);
      } else {
        if (1 in args && (!arg4 || data[arg1] !== arg2)) {
          data[arg1] = arg2;
          notify(arg1, arg3);
        }
        return getPropVal(data, arg1); //CONSIDER: drop computable/callable props, except on object copy
      }
    }
    if (init) {
      obs(init);
    }
    return obs;
  }
})(window, document);

// key add-on

djv.key = (function(djv){

  var globalKeys = {};

  key["SHIFT"] = key["shift"] = 4/8;
  key["CTRL"]  = key["ctrl"]  = 2/8;
  key["ALT"]   = key["alt"]   = 1/8;

  djv.addEvent(document, 'keydown', function(evt){
    var code,
        elm = djv.target(evt);     
    if(!djv.writable(elm) || elm.tagName.toLowerCase() != "select"){
      code = 8 * (evt.keyCode || evt.charCode) +
             4 * ~~evt.shiftKey + 
             2 * ~~evt.ctrlKey +
             ~~evt.altKey;
      if(globalKeys[code]){
        return globalKeys[code](evt);
      }
    }
  });

  function key(keys, fn){
    var code, i;
    keys = [].concat(keys);
    for(code = i = 0; i < keys.length; i++){
      code += (typeof keys[i] === 'string' ? 
        keys[i].toUpperCase().charCodeAt() : 
        keys[i]) * 8;
    }
    globalKeys[code|0] = typeof fn === "function" ?
      fn : void(0);
  }

  return key;

})(djv);

(function(key){
  var keycodes = {
    "BACKSPACE": 8, 
    "TAB": 9, 
    "ENTER": 13, 
    "CAPSLOCK": 20, 
    "ESC": 27, 
    "SPACE": 32, 
    "PAGEUP": 33, 
    "PAGEDOWN": 34, 
    "END": 35, 
    "HOME": 36, 
    "LEFTARROW": 37, "UPARROW": 38, 
    "RIGHTARROW": 39, "DOWNARROW": 40, 
    "INSERT": 45, 
    "DELETE": 46, 
    "0": 48, "1": 49, "2": 50, "3": 51, "4": 52, 
    "5": 53, "6": 54, "7": 55, "8": 56, "9": 57, 
    "A": 65, "B": 66, "C": 67, "D": 68, "E": 69, "F": 70, 
    "G": 71, "H": 72, "I": 73, "J": 74, "K": 75, "L": 76, 
    "M": 77, "N": 78, "O": 79, "P": 80, "Q": 81, "R": 82, 
    "S": 83, "T": 84, "U": 85, "V": 86, "W": 87, "X": 88, 
    "Y": 89, "Z": 90, 
    "F1": 112, "F2": 113, "F3": 114, "F4": 115, 
    "F5": 116, "F6": 117, "F7": 118, "F8": 119, 
    "F9": 120, "F10": 121, "F11": 122, "F12": 123, 
    "NUMLOCK": 144
  };
  for(i in keycodes){
    key[i] = key[i.toLowerCase()] = keycodes[i];
  }
})(djv.key);
