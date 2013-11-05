

(function($){
    /**
     * Turn a given input into a smart numeric input field
     */
    $.fn.numericInput = function() {
        // @Todo: validate self as input[type number/text/tel]
        var self = this;
        var originalType;

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
        // @Todo: windows mobile should not switch to type=text: it shows the text keyboard and not the number/tel keyboard
        opts.forceTextType = (self.data('force-type-to-text') || true);

        // Test digit
        var isDigit = function(ch) {
            return ('0' <= ch && ch <= '9');
        }

        // Change to type text
        self.focus(function() {
            originalType = self.prop('type');

            // browsers like webkit try to process number input fields, this causes val() to return an empty string on non-number values
            if(opts.forceTextType && originalType !== 'text') {
                self.prop('type', 'text');
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

            // Add leading zero
            if(ret.length && ret.charAt(0) === opts.sep) {
                ret = '0' + ret;
            }

            // Only update if needed
            if(ret !== orig) {
                self.val(ret);
            }

            // Stop default
            event.preventDefault();
            event.stopPropagation();

            // Return this to allow chaining
            return self;
        });

        // Check for min and max values, fire an event if the value is out of range
        self.blur(function(event) {
            var value = parseFloat(self.val());

            // @Todo: Trailing zeros?

            // Check min and max values
            if(value < opts.minValue) {
                // Fire min event
                self.trigger('minviolation', { 'value': value, 'min-value': opts.minValue });
                self.trigger('minmaxviolation', { 'value': value, 'min-value': opts.minValue, 'max-value': opts.maxValue });
            } else if(opts.maxValue < value ){
                // Fire max Event Here
                self.trigger('maxviolation', { 'value': value, 'max-value': opts.maxValue });
                self.trigger('minmaxviolation', { 'value': value, 'min-value': opts.minValue, 'max-value': opts.maxValue });
            } else {
                // Fire
                self.trigger('valueok', { 'value': value, 'min-value': opts.minValue, 'max-value': opts.maxValue });
            }

            // reset type value if needed
            if(opts.forceTextType && originalType !== self.prop('type')) {
                self.prop('type', originalType);
            }
        });

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
    };
}(jQuery));
