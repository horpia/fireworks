# Fireworks

A tool for rendering different fireworks. Created special for celebrating new year 2021 on pikabu.ru. 
Be free to use it as you wish.

[Game demo](https://horpia.github.io/fireworks/build/game1.html)

[Fireworks dev tool](https://horpia.github.io/fireworks/build/index.html) 
 

## Example of usage

[Demo of this example](https://horpia.github.io/fireworks/build/demo.html) 

This code creates one random explosion (without rocket and launching) every second: 

```html
<fw-canvas id="fw" width="800" height="600" bg-color="#000" bg-image="" sounds-url="./sounds"></fw-canvas>
<script src="fireworks.js"></script>
<script>
	const fw = document.querySelector('#fw');
	setInterval(() => {
		if (document.hidden) {
			// ignore if page is not visible
			return;
		}

		const firework = fw.getRandomFirework({x: 400, y: 300});
		// remove rocket, we need only explosion
		firework.rocketType = '';
		fw.addFirework(firework);
	}, 1000);
</script>
``` 

## Tag <fw-canvas>

Custom element `<fw-canvas>` supports the following attributes:

1. `fullscreen` - resizes canvas to whole viewport width and height;
2. `width` & `height` - specifies fixed width and height for canvas;
3. `bg-color` - sets background color. By default `rgba(11, 17, 34, 0.9)`;
4. `bg-image` - sets url to the background image. This image will be rendered at the bottom of canvas 
and with horizontal repeating;
5. `sounds-url` - sets url where sound files are.

### Examples:

```html
<fw-canvas></fw-canvas>
<fw-canvas fullscreen></fw-canvas>
<fw-canvas bg-color="#500" bg-image="//cdn.mysite.com/img1.png"></fw-canvas>
<fw-canvas sounds-url="//cdn.mysite.com/sounds"></fw-canvas>
```

## Methods

Custom element `<fw-canvas>` supports the following methods and getters:

1. `canvas` - getter. Returns instance of HTMLCanvasElement;
2. `addFirework(firework)` - adds a firework to render; 
3. `removeFirework(firework)` - removes firework from rendering; 
4. `removeAllFireworks()` - removes all fireworks; 
5. `launchFirework(firework)` - launch firework with a rocket; 
6. `render()` - force render; 
7. `getRandomFirework(position, autoLaunch)` - generates and returns `firework` random object; 

### Example:

[Demo of this example](https://horpia.github.io/fireworks/build/demo2.html) 

This example creates firework with 3 colors of explosion `comb1` and rocket `type1` with 1 color. 
Rocket automatically launched. No sound.

```js
const fw = document.querySelector('fw-canvas');
fw.addFirework({
    position: {x: 400, y: 560},
    colors: ['#fa5252', '#6db4ff', '#8cff41'],
    rocketColors: ['#ac63c6'],
    angleFactor: 0.5,
    sizeFactor: 0.8,
    elementsFactor: 0.9,
    rocketType: 'type1',
    explosionType: 'comb1',
    canBeLaunched: true,
    autoLaunch: true,
    rocketFading: false,
    noSound: true,
});
```

## Firework object

The firework object contains the following properties:

1. `position: {x: number, y: number}` - Required. Start position of the rocket or explosion;
1. `colors: Array<string>` - Optional. CSS colors for an explosion. If not specified the random colors will be used;
1. `rocketColors: Array<string>` - Optional. CSS colors for a rocket. If not specified the random colors will be used;
1. `angleFactor: number` - Optional. Value from 0 to 1. Specifies start angle of the rocket;
1. `sizeFactor: number` - Optional. Value from 0 to 1. Specifies size of the rocket and explosion;
1. `elementsFactor: number` - Optional. Value from 0 to 1. Specifies count of lights in the explosion;
1. `rocketType: string` - Optional. Possible values: '', 'type1', 'type1';
1. `explosionType: string` - Optional. Possible values: '', 'type0', 'type1-circle', 'type1-sphere', 'type1-disk', 
'type2', 'comb1', 'comb2', 'comb3', 'comb4', 'comb5', 'comb6';
1. `canBeLaunched: boolean` - Optional. TRUE if use may click by a rocket to launch it;
1. `autoLaunch: boolean` - Optional. TRUE if rocket should be automatically launched;
1. `noSound: boolean` - Optional. TRUE if need to mute all sounds;