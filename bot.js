ig.module('plugins.bot')
.requires(
	'impact.entity',
	'impact.timer'
)
.defines(function() {
	ig.bot = ig.Entity.extend({
		bot_default: {
			// Movements loop properties
			movements: {},
			movement_start: 0
		},

		timer: null,
		step: 0,
		pause: true,

		// Movements (Can be refefined)
		bot_walk: function(direction) {
			if(direction == 'left') {
				this.accel.x = -(this.standing ? this.accelDef.ground : this.accelDef.air);
			} else {
				this.accel.x = (this.standing ? this.accelDef.ground : this.accelDef.air);
			}
		},

		bot_jump: function(vel) {
			this.vel.y = vel;
		},

		bot_stop: function() {
			this.vel = { x: 0, y: 0 };
			this.accel = { x: 0, y: 0 };
		},

		// Impact events
		init: function(x, y, settings) {
			this.parent(x, y, settings);

			// Exist bot object?
			if(this.bot == undefined) {
				console.error('BOT Error: object bot is undefined');
				return;
			}

			// Bot config
			if(this.bot.config == undefined) this.bot.config = {};
			if(this.bot.config.loop != false) this.bot.config.loop = true;
			if(this.bot.config.hole_jump != false) this.bot.config.hole_jump = true;
			if(this.bot.config.death_fall != false) this.bot.config.death_fall = true;

			// Exist bot.movements object?
			if(this.bot.movements == undefined || this.bot.movements.length == 0) {
				console.error('BOT Error: object bot.movements is empty or undefined');
				return;
			}

			// Movement start
			this.bot.movement_start = typeof this.bot.movement_start !== 'undefined' ? this.bot.movement_start : this.bot_default.movement_start;
			this.step = this.bot.movement_start;
		},

		update: function() {
			var tx = Math.round(this.pos.x / ig.game.collisionMap.tilesize),
				ty = Math.round(this.pos.y / ig.game.collisionMap.tilesize),
				mx = this.vel.x * ig.system.tick,
				my = this.vel.y * ig.system.tick,
				step = this.bot.movements[this.step],
				player = ig.game.getEntitiesByType(EntityPlayer)[0];

			if(this.step == null) return;

			// Function
			if(typeof step.action == 'function') {
				step.action.call(this);
				this.step += 1;
				// Start function
				if(typeof step.start == 'function') step.start.call(this);
				// Complete function
				if(typeof step.complete == 'function') step.complete.call(this);
			}

			// Wait
			if(step.action == 'wait') {
				// Wait for player on screen
				if(step.entity == 'player' && (player != undefined && this.distanceTo(player) > ig.system.width)) {
					this.pause = true;
				} else if(step.duration > 0) {
					this.pause = false;

					// Timer undefined
					if(this.timer == null) {
						this.timer = new ig.Timer(step.duration);
						// Start function
						if(typeof step.start == 'function') step.start.call(this);
					} else if(this.timer.delta() >= 0) {
						this.timer = null;
						this.step += 1;
						// Complete function
						if(typeof step.complete == 'function') step.complete.call(this);
					}
				} else {
					console.error('BOT Error: wait duration is undefined');
				}
			}

			// Jump
			if(step.action == 'jump') {
				if(this.standing && !this.pause) {
					this.bot_jump(-step.vel);
					this.pause = true;
					// Start function
					if(typeof step.start == 'function') step.start.call(this);
				} else if(!this.standing && this.pause) {
					if(step.direction != undefined) this.bot_walk(step.direction);
					// Player
					// ..
				} else {
					this.bot_stop();
					this.pause = false;
					this.step += 1;
					// Complete function
					if(typeof step.complete == 'function') step.complete.call(this);
				}
			}

			// Walk
			if(step.action == 'walk') {
				// Get original position
				if(this.vel.x == 0 && this.original == undefined) {
					this.original = { x: this.pos.x, y: 0 }
					// Start function
					if(typeof step.start == 'function') step.start.call(this);
				}
				if(!this.pause) {
					// Change direction (collision x)
					if(this.pos.x == this.last.x && this.original.x != this.pos.x) {
						if(step.direction == 'left') {
							step.direction = 'right';
						} else if(step.direction == 'right') {
							step.direction = 'left';
						}
					}
					// Move
					if(step.direction != undefined) this.bot_walk(step.direction);
					// Calculate distance
					var distance = this.original.x - this.pos.x;
					if(distance < 0) distance = distance * -1;
					if(distance >= step.distance) {
						this.bot_stop();
						this.pause = false;
						this.step += 1;
						// Complete function
						if(typeof step.complete == 'function') step.complete.call(this);
					}
				}
			} else {
				this.original = undefined;
			}

			// Hole jump
			if(this.bot.config.hole_jump && this.standing) {
				if(this.vel.x < 0 && (tx > 0 && ty < ig.game.collisionMap.height - 1)) {
					if(ig.game.collisionMap.data[ty+1][tx-1] == 0) {
						this.bot_jump(-this.jump);
					}
				}
				if(this.vel.x > 0 && (tx < ig.game.collisionMap.height - 1 && ty > 0)) {
					if(ig.game.collisionMap.data[ty+1][tx+1] == 0) {
						this.bot_jump(-this.jump);
					}
				}
			}

			// Hole wall
			if(this.bot.config.hole_wall) {
				if(this.vel.x < 0 && (tx > 0 && ty < ig.game.collisionMap.height - 1)) {
					if(ig.game.collisionMap.data[ty+1][tx-1] == 0) {
						step.direction = 'right';
					}
				}
				if(this.vel.x > 0 && (ty < ig.game.collisionMap.height - 1 && ty > 0)) {
					if(ig.game.collisionMap.data[ty+1][tx+1] == 0) {
						step.direction = 'left';
					}
				}
			}

			// Routine complete
			if(this.step > this.bot.movements.length - 1) {
				this.step = 0;
				if(!this.bot.config.loop) this.step = null;
			}

			// During function
			if(typeof step.during == 'function') step.during.call(this);

			// Death fall
			if(this.bot.config.death_fall) {
				if(ty > ig.game.collisionMap.height) this.kill();
			}

			// Refresh
			this.parent();
		}
	});
});