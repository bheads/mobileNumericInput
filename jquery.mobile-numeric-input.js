/**
 * @preserve mobileNumericInput
 * Copyright (c) 2013, Byron Heads
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or
 * other materials provided with the distribution.
 *
 * Neither the name of the {organization} nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * mobileNumericInput
 *
 * Forces numeric input validation/formatting on HTML input elements. This is targeted for mobile devices.
 *
 *   Options for each numericInput element can be set via data- tags
 *
 *   data-XXX               default         Comment
 *   sep                    '.'             The sperator type
 *   has-sep                true            Enables seperator type input, floating points
 *   max-pre-sep            4               Digits before seperator
 *   max-post-sep           2               Digits after seperator
 *   min-value              5.00            Min value, on blur if value is less then min triggers minviolation and then minmaxviolation
 *   max-value              2000.00         Max value, on blur if value is less then min triggers maxviolation and then minmaxviolation
 *   force-type-to-text     true            On focus switch the input to type=text this stops browsers (webkit) from formatting numeric
 *                                           inputs this, webkit causes elem.val() to return an empty string when the val is not a number
 *                                           this prevents numericInput from cleaning up the input string.
 *
 *                                          On most devices the os will show the keyboard type from before the focus event, so you can show
 *                                           the number/tel keyboard and still have the input box as text.  On blur event it is set back
 *                                           to the original type.  Windows Mobile IE(10) will show the text keyboard, you may want to set
 *                                           this to false on these browsers, IE does not have the empty string issue that webkit has.
 *   next-input             null            If set to css locator string, next/go events will set focus to this element.  Go key on iOS
 *                                           does set the focus correctly, but the keyboard is not showing, the next/prev buttons work
 *                                           as normal
 *
 * numericInput can trigger these 4 events on blur, based on the min/max value validation.
 *
 *   event name          event param                                Comment
 *   minviolation       { value: X, min-value: Y }                  Triggered onblur if the value is less then the min-value
 *   maxviolation       { value: X, max-value: Y }                  Triggered onblur if the value is larger then the max-value
 *   minmaxviolation    { value: X, min-value: Y, max-value: Z }    Triggered onblur if the value is not in the min/max value bounds, this
 *                                                                   is triggered after minviolation or maxviolation.
 *   valueok            { value: X, min-value: Y, max-value: Z }    Triggered onblur if the value is in the given min/max bounds
 *
 * Events have helper functions .minviolation() .maxviolation() .minmaxviolation() .valueok().
 * All functions support chaining.
 *
 * Requires: jQuery
 * Author: Byron Heads
 * Date: 2013-11-05
 *
 */

/**
 * Example:
 *
 * <input type='number' name='price' class='.numeric-input' data-min-value='20.00' data-max-value='9999.99' max-pre-sep='4'/>
 * <input type='number' name='how-many' class='.numeric-input' data-min-value='1' data-max-value='500' max-pre-sep='3' has-sep='false'/>
 *
 * function showInputError(args) {
 *     alert(args.value + " is not valid, should be between " + args.min-value + " and " + arg.max-value);
 * }
 *
 * $.ready(function) {
 *      $('.numeric-input').numericInput().minmaxviolation(showInputError);
 * }
 *
 */

(function($){
    /**
     * Turn a given input into a smart numeric input field
     */
    $.fn.numericInput = function() {
        $.each(this, init);
        return this;
    };

    /**
     * Init
     * @param idx unused index
     * @param element HTMLElement to attach to
     * @returns {*|HTMLElement}
     */
    function init(/* unused */ idx, element) {
        // @Todo: validate self as input[type number/text/tel]
        var self = $(element);
        var originalType = self.prop('type');

        // Create options
        var opts = {};

        // load options from data attributes, or use defaults
        // @Todo: validate the data values
        opts.sep = (self.data('sep') || '.');
        opts.hasSep = (self.data('has-sep') || true);
        opts.maxPre = (self.data('max-pre-sep') || 4);
        opts.maxPost = (self.data('max-post-sep') || 2);
        opts.minValue = (self.data('min-value') || 5.00);
        opts.maxValue = (self.data('max-value') || 2000.00);
        // @Todo: windows mobile / ios should not switch to type=text: it shows the text keyboard and not the number/tel keyboard
        opts.forceTextType = (self.data('force-type-to-text') || true);
        opts.nextInput = (self.data('next-input') || null);

        // Test digit
        var isDigit = function(ch) {
            return ('0' <= ch && ch <= '9');
        }

        // Change to type text
        self.focus(function() {
             // browsers like webkit try to process number input fields, this causes val() to return an empty string on non-number values
            if(opts.forceTextType) {
                self.prop('type', 'text');
            }
        });

        /**
         * Handle the next key to set the focus to a given element
         */
        self.keydown(function (event)  {
            if(typeof(opts.nextInput) === 'string' && event.keyCode == 13) {
                $(opts.nextInput).focus().trigger('click', {});
            }
        });

        self.keyup(function(event) {
            var orig = self.val();
            var ret = "";
            var foundSep = false;
            var preSep = 0;
            var pastSep = 0;

            // Scan each char
            for(var i = 0; i < orig.length; ++i) {
                var ch = orig.charAt(i);

                // If digit
                if(isDigit(ch)) {
                    // If we found a sep ie: .
                    if(foundSep) {
                        // Check digits past seperator is less then max
                        if(pastSep < opts.maxPost) {
                            // Accept
                            ret += ch;
                            // Count digit past Sep
                            pastSep++;
                        }
                    } else {
                        // Before Sep, test pre seperator is less then max
                        if(preSep < opts.maxPre) {
                            // accept
                            ret += ch;
                            preSep++;
                        }
                    }
                } else if(opts.hasSep && ch === opts.sep) {
                    // Sep char
                    if(!foundSep) {
                        // Accept sep, only once
                        ret += opts.sep;
                        foundSep = true;
                    }
                }
            }

            // remove leading zero
            while(ret.length && ret.charAt(0) === '0') {
                ret = ret.substr(1);
            }

            // Add leading zero if starts with sep
            if(ret.length && ret.charAt(0) === opts.sep) {
                ret = '0' + ret;
            }

            // Only update if needed
            if(ret !== orig) {
                self.val(ret);
            }
        });

        // Check for min and max values, fire an event if the value is out of range
        self.blur(function(event) {
            var value = parseFloat(self.val());

            // @Todo: Trailing zeros?

            // Check min and max values
            if(value < opts.minValue) {
                // Fire min event
                self.trigger({ type: 'minviolation', 'value': value, 'min-value': opts.minValue });
                self.trigger({ type: 'minmaxviolation', 'value': value, 'min-value': opts.minValue, 'max-value': opts.maxValue });
            } else if(opts.maxValue < value ){
                // Fire max Event Here
                self.trigger({ type: 'maxviolation', 'value': value, 'max-value': opts.maxValue });
                self.trigger({ type: 'minmaxviolation', 'value': value, 'min-value': opts.minValue, 'max-value': opts.maxValue });
            } else {
                // Fire
                self.trigger({ type: 'valueok', 'value': value, 'min-value': opts.minValue, 'max-value': opts.maxValue });
            }

            // reset type value if needed
            if(opts.forceTextType) {
                self.prop('type', originalType);
            }
        });

        return self;
    };

    // Event handlers

    // Min value violation
    $.fn.minviolation = function(fn) {
        var self = this;

        self.on('minviolation', fn);

        return self;
    };

    // Max value violation
    $.fn.maxviolation = function(fn) {
        var self = this;

        self.on('maxviolation', fn);

        return self;
    };

    // Min/Max value violation, fired after either min or max violation events
    $.fn.minmaxviolation = function(fn) {
        var self = this;

        self.on('minmaxviolation', fn);

        return self;
    };

    // input passes min/max value tests
    $.fn.valueok = function(fn) {
        var self = this;

        self.on('valueok', fn);

        return self;
    };
}(jQuery));
