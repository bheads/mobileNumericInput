mobileNumericInput
==================

Forces numeric input validation/formatting on HTML input elements. This is targeted for mobile devices.

Options for each numericInput element can be set via data- tags

|data-XXX|default|Comment|
|--------|------:|-------|
|sep|'.'|The sperator type|
|has-sep|true|Enables seperator type input, floating points|
|max-pre-sep|4|Digits before seperator|
|max-post-sep|2|Digits after seperator|
|min-value|5.00|Min value, on blur if value is less then min triggers minviolation and then minmaxviolation|
|max-value|2000.00|Max value, on blur if value is less then min triggers maxviolation and then minmaxviolation|
|force-type-to-text|true|On focus switch the input to type=text this stops browsers (webkit) from formatting numeric inputs this, webkit causes elem.val() to return an empty string when the val is not a number this prevents numericInput from cleaning up the input string. On most devices the os will show the keyboard type from before the focus event, so you can show the number/tel keyboard and still have the input box as text.  On blur event it is set back to the original type.  Windows Mobile IE(10) will show the text keyboard, you may want to set this to false on these browsers, IE does not have the empty string issue that webkit has.| 
|next-input|null|If set to css locator string, next/go events will set focus to this element.  Go key on iOS does set the focus correctly, but the keyboard is not showing, the next/prev buttons work as normal|

numericInput can trigger these 4 events on blur, based on the min/max value validation.

|event name|event param|Comment|
|----------|:---------:|-------|
|minviolation|{ value: X, min-value: Y }|Triggered onblur if the value is less then the min-value|
|maxviolation|{ value: X, max-value: Y }|Triggered onblur if the value is larger then the max-value|
|minmaxviolation|{ value: X, min-value: Y, max-value: Z }|Triggered onblur if the value is not in the min/max value bounds, this is triggered after minviolation or maxviolation.|
|valueok|{ value: X, min-value: Y, max-value: Z }|Triggered onblur if the value is in the given min/max bounds|

Events have helper functions .minviolation() .maxviolation() .minmaxviolation() .valueok().
All functions support chaining.

Requires: jQuery

Example:

```html
<input type='number' name='price' class='.numeric-input' data-min-value='20.00' data-max-value='9999.99' max-pre-sep='4'/>
<input type='number' name='how-many' class='.numeric-input' data-min-value='1' data-max-value='500' max-pre-sep='3' has-sep='false'/>
```

```javascript
function showInputError(args) {
	alert(args.value + " is not valid, should be between " + args.min-value + " and " + arg.max-value);
}

$.ready(function) {
     $('.numeric-input').numericInput().minmaxviolation(showInputError);
}
```
