

(function($){
    var options = {
        sep: '.',
        allowSep: true,

        maxPre: 4,
        maxPost: 2,

        minValue: 5.00,
        maxValue: 2000.00
    };

    $.fn.numericInput = function(opts) {
        var self = this;

        // Test digit
        var isDigit = function(ch) {
            return ('0' <= ch && ch <= '9');
        }

        self.focus(function() {
            $(this).prop('type', 'text');
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
                        if(pastSep < options.maxPost) {
                            // Accept
                            ret += ch;
                            // Count digit past Sep
                            pastSep++;
                        }
                    } else {
                        // Before Sep, test pre seperator is less then max
                        if(preSep < options.maxPre) {
                            // accept
                            ret += ch;
                            preSep++;
                        }
                    }
                } else if(options.allowSep && ch === options.sep) {
                    // Sep char
                    if(!foundSep) {
                        // Accept sep, only once
                        ret += options.sep;
                        foundSep = true;
                    }
                }
            }

            // Add leading zero
            if(ret.length && ret.charAt(0) === options.sep) {
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
            return this;
        });

        // Check for min and max values, fire an event if the value is out of range
        self.blur(function(event) {
            var value = parseFloat(self.val());

            if(value < options.minValue || options.maxValue < value ){
                // Fire Event Here
            }

            $(this).prop('type', 'number');
        });
    };
}(jQuery));
