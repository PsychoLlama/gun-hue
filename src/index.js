'use strict';


/**
 * Interact real-time with your hue lights through gunDB!
 * @module gun-hue
 */

var onward = require('./onward');
var axios = require('axios');
var Gun = require('gun/gun.js');
var equal = require('assert').equal;

/**
 * Overloads the default object type detection.
 * The hue API uses arrays to represent some of it's data,
 * and gun will complain if it sees arrays.
 *
 * @param  {Mixed} input - any value
 * @returns {Boolean} - whether the input is an object
 */
Gun.obj.is = function isObject (input) {
	return input instanceof Object;
};

/**
 * Generate a url to the hue API root,
 * optionally taking an array of routes.
 *
 * @private
 * @param  {String} domain - the ip/domain name of the hue bridge
 * @param  {String} key - your private authentication key
 * @param  {Array} [path] - a list of routes to append to the url
 * @returns {String} - the fully formatted url
 */
function hueURL (domain, key, path) {
	return ([ 'http:/', domain, 'api', key ])
		.concat(path || [])
		.join('/');
}

/**
 * Reads the state of hue and imports it into your
 * gun instance, while listening for changes and
 * sending back to the bridge.
 *
 * @method hue
 * @param {Object} auth - your authentication information
 * @param {String} auth.domain - your hue bridge IP address
 * @param {String} auth.key - your hue API key
 * @returns {Promise} - the web request for your hue state
 * @example
 * let gun = new Gun().get('hue')
 *
 * gun.hue({
 *   domain: '192.168.1.150',
 *   key: 'ZaJV5zCgoH5cBsbKtDZmFLbg',
 * })
 * .catch(Gun.log)
 *
 * // Print out all your lights.
 * gun.path('lights').map().val('Lights:')
 *
 * // Turn all your lights on.
 * gun.path('lights').map().path('state.on').put(true)
 */
function hue (auth) {

	/** Both `domain` and `key` are required properties.*/
	equal(typeof auth.domain, 'string', 'Hue IP address required.');
	equal(typeof auth.key, 'string', 'Authentication key required.');

	var gun = this;
	var rootURL = hueURL(auth.domain, auth.key);

	onward(function (change, path) {

		/** Create an API url that points to the change address*/
		var changeURL = hueURL(auth.domain, auth.key, path);
		if (change instanceof Object) {

			/** Hue gets confused by the metadata*/
			delete change._;
		}

		/** Submit the change to the hue bridge*/
		axios.put(changeURL, change);
	}, null, gun);

	/**
	 * Load the entire bridge state through a
	 * root-level API request.
	 */
	return axios
		.get(rootURL)
		.then(function (response) {

			/** Put the data into the gun instance*/
			gun.put(response.data);
		});
}

Gun.prototype.hue = hue;

module.exports = Gun;
