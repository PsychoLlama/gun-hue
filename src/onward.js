'use strict';

var Gun = require('gun/gun');

/**
 * Adapted from @amark's "onward" plugin.
 * Listens for changes at any depth, and provides a path to them.
 *
 * @author Mark Nadal
 * @see https://github.com/gundb/onward
 * @private
 * @module onward
 * @param  {Function} callback - invokes when a change
 * at any level happens
 * @param  {Object} opt - configuration options
 * @param  {Gun} gun - the gun instance you want onward called for
 * @returns {Gun} - the gun instance you passed
 */
module.exports = function onward (callback, opt, gun) {
	callback = callback || function () {};
	if (opt === true) {
		opt = { full: true };
	}
	opt = opt || {};
	opt.ctx = opt.ctx || {};
	opt.path = opt.path || [];

	gun.on(function (change, field) {
		var object = Gun.obj.copy(opt);
		object.path = opt.path.slice(0);
		if (field) {
			object.path.push(field);
		}
		Gun.obj.map(change, function (val, field) {
			if (field === '_') {
				return;
			}

			if (Gun.obj.is(val)) {
				delete change[field];
				var soul = Gun.is.rel(val);
				var objectID = soul + field;

				if (opt.ctx[objectID]) {
					// Don't re-subscribe.
					return;
				}

				// Unique subscribe.
				opt.ctx[objectID] = true;

				onward(callback, object, this.path(field));
				return;
			}
		}, this);

		if (Gun.obj.empty(change, Gun._.meta)) {
			return;
		}
		var meta = opt._;
		if (meta === false) {
			delete change._;
		}
		callback(change, object.path);
	}, !opt.full);

	return gun;
};
