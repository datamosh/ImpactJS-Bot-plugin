## Installation
- Copy `bot.js` to `lib/plugins/`
- Add plugin in main.js: `'plugins.bot'`
- Make your bot (use `enemy_bot.js` as reference)
- It's Alive!!

## Config

```
loop: [boolean] (Optional, default true) - Loop routine
hole_jump: [boolean] (Optional, default true) - If there's a hole in the collision map, jump
hole_wall: [boolean] (Optional, default true) - If there's a hole in the collision map, change direction
death_fall: [boolean] (Optional, default true) - The bot dies if it falls off the screen (pos.y > collisionMap height)
```

## Movements

action: *function*

```
start: [function] (Optional) - A function to call when the action starts
during: [function] (Optional) - A function to call during the action
complete: [function] (Optional) - A function to call once the action is complete
```

action: *wait*

```
duration: [seconds]
entity: [string] (Optional) - Name of entity
start: [function] (Optional) - A function to call when the action starts
during: [function] (Optional) - A function to call during the action
complete: [function] (Optional) - A function to call once the action is complete
```

action: *walk*

```
direction: 'left' or 'right' - Direction (Change automatically on collision)
distance: [number] (Optional) - Distance of actual position in the game world
start: [function] (Optional) - A function to call when the action starts
during: [function] (Optional) - A function to call during the action
complete: [function] (Optional) - A function to call once the action is complete
```

action: *jump*

```
vel: [number] - Jump velocity
direction: 'left' or 'right' (Optional) - Direction
start: [function] (Optional) - A function to call when the action starts
during: [function] (Optional) - A function to call during the action
complete: [function] (Optional) - A function to call once the action is complete
```

## My game has a particular way to move the entities

you can redefine the basic functions:
`bot_walk`, `bot_jump` and `bot_stop` *(for now)*

See the [source code](https://github.com/datamosh/ImpactJS-Bot-plugin/blob/master/bot.js) for more information

## Example

```javascript
// Configure bot
bot: {
	config: {
		loop: true, // [boolean] (Optional, default true) - Loop routine
		hole_jump: false, // [boolean] (Optional, default true) - If there's a hole in the collision map, jump
		hole_wall: true, // [boolean] (Optional, default false) - If there's a hole in the collision map, change direction
		death_fall: true // [boolean] (Optional, default true) - The bot dies if it falls off the screen (pos.y > collisionMap height)
	},
	movements: [
		// Wait for player and then wait 100 milliseconds
		{
			action: 'wait',
			entity: 'player',
			duration: 0.1,
			start: function() {
				console.log('Starts waiting');
			},
			during: function() {
				console.log('Im waiting!');
			},
			complete: function() {
				console.log('Movement complete!')
			}
		},
		
		// Walk left
		{
			action: 'walk',
			direction: 'left',
			distance: 40,
			start: function() {
				console.log('Starts walking');
			},
			during: function() {
				console.log('Im walking!');
			},
			complete: function() {
				console.log('Movement complete!')
			}
		},

		// Jump in place
		{
			action: 'jump',
			//direction: 'right',
			vel: 150,
			start: function() {
				console.log('Starts jumping');
			},
			during: function() {
				console.log('Im jumpig!!1!');
			},
			complete: function() {
				console.log('Movement complete!')
			}
		},

		// Call a function
		{
			action: function() {
				console.log('Routine complete')
			}
		}
	]
}
```

Impact forum post: http://impactjs.com/forums/code/impact-bot