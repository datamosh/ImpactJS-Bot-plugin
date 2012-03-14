ig.module(
	'game.entities.enemy_bot'
)
.requires(
	'impact.entity',
	'plugins.bot'
)
.defines(function(){
	EntityEnemy_bot = ig.bot.extend({
		// Types
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.PASSIVE,

		// Movement properties
		maxVel: { x: 80, y: 240 },
		accelDef: { ground: 400, air: 200 },
		frictionDef: { ground: 400, air: 100 },
		jump: 100,
		bounciness: 0,

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
						console.log('Im jumping!!1!');
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
		},

		// Image		
		size: {x: 6, y: 10 },
		offset: { x: 2, y: 6 },
		animSheet: new ig.AnimationSheet('media/enemy_bot.png', 12, 16),
		flip: true,

		// Properties
		health: 60,
		direction: 'right',

		// Debug
		debug: true,

		init: function(x, y, settings)  {
			this.parent( x, y, settings);
			
			// Animations
			this.addAnim('idle',	0.07, [01]);
			this.addAnim('walk',	0.07, [00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11]);
			this.addAnim('jump',	1.00, [12]);
			this.addAnim('fall',	1.00, [12]);
		},

		update: function() {
			// Animation
			if(this.vel.x != 0 && this.vel.y == 0) {
				if(this.currentAnim != this.anims.walk) this.currentAnim = this.anims.walk;
			} else if(this.vel.y < 0) {
				if(this.currentAnim != this.anims.jump) {
					this.currentAnim = this.anims.jump;
					this.currentAnim.rewind();
				}
			} else if(this.vel.y > 0) {
				if(this.currentAnim != this.anims.fall) this.currentAnim = this.anims.fall;
			} else if(this.standing) {
				if(this.currentAnim != this.anims.idle) this.currentAnim = this.anims.idle;
			}

			// Flip
			if(this.vel.x > 0) { this.flip = false; } else if(this.vel.x < 0) { this.flip = true; }
			this.currentAnim.flip.x = this.flip;

			// Refresh
			this.parent();
		},

		handleMovementTrace: function(res) {
			// Continue resolving the collision as normal
			this.parent(res); 
		}
	});
});