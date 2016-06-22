Gun-Hue
---------------------------------
*Real-time updates with hue and gunDB*

## What it is
This is a tiny library that syncs hue data and lets you change your lights through gunDB.

By using gun, you get some immediate benefits:

 - simpler API interface
 - easy real-time UI updates
 - real-time updates on other client's apps
 - offline editing
 - street cred

## How to use it
The best way to install is from [npm](https://docs.npmjs.com/getting-started/what-is-npm). Here's how:
```sh
npm install gun-hue
```

You can import this library instead of `Gun` (or just import it for side effects) and it'll add a new method to your gun instances called `hue`.

```javascript
var Gun = require('gun-hue')
var gun = new Gun().get('hue')

typeof gun.hue // 'function'
```

`.hue()` takes an object with the IP of the bridge and your private key. To find the bridge and get an API key, read [this great guide](http://www.developers.meethue.com/documentation/getting-started).

```javascript
gun.hue({
	domain: '192.168.1.337',
	key: 'HfBwAl0gNPUQnmqCaxZCcNfd',
})
```

Once you've done that, it'll fetch the hue state and plug it in your gun instance. That's when the fun begins! Every GET/POST command hue supports is available through gun.

```javascript
var lights = hue.path('lights')
// Print out your available lights
lights.map().val('Lights:')

// Turn on all the lights
lights.map().path('state.on').put(true)

// Print out all the rules
hue.get('rules').map().val('Rules:')

// Listen for changes to a lights' brightness
lights.path('5.state.bri').on(change => {
	// Brightness update!
})

// Change the brightness
lights.path('5.state.bri').put(42)
```

For more stuff you can do, I shall defer to the [Philips Hue API](http://www.developers.meethue.com/philips-hue-api) (you may need to register to see it all).

## Support
Have questions? Either post an issue or tag me on [Gitter](gitter.im/amark/gun) (I usually hang out there as @PsychoLlama).

Thanks for checking out the project! :blush:
