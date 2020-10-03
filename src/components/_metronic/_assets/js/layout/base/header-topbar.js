/* eslint-disable */
"use strict";

import KTToggle from "./../../components/toggle.js";
import { KTUtil } from "./../../components/util.js";

var KTLayoutHeaderTopbar = function() {
    // Private properties
	var _toggleElement;
    var _toggleObject;

    // Private functions
    var _init = function() {
		_toggleObject = new KTToggle(_toggleElement, KTUtil.getBody(), {
			targetState: 'topbar-mobile-on',
			toggleState: 'active'
		});
    }

    // Public methods
	return {
		init: function(id) {
            _toggleElement = KTUtil.getById(id);

			if (!_toggleElement) {
                return;
            }

            // Initialize
            _init();
		},

        getToggleElement: function() {
            return _toggleElement;
        }
	};
}();

// Webpack support
if (typeof module !== 'undefined') {
	// module.exports = KTLayoutHeaderTopbar;
}

export default KTLayoutHeaderTopbar;