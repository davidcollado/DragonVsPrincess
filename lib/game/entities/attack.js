ig.module('game.entities.attack').requires('impact.entity').defines(function() {

  EntityAttack = ig.Entity.extend({
    // Collision properties
    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.BOTH,
    collides: ig.Entity.COLLIDES.PASSIVE,

    size: {
      x: 32,
      y: 32
    },
    animSheet: new ig.AnimationSheet('media/fire.png', 32, 32),
    dir: 0,
    maxVel: {
      x: 400,
      y: 400
    },
    friction: {
      x: 800,
      y: 0
    },
    gravityFactor: 0,

    health: 30,

    // Property to keep track of flip
    flip: false,

    init: function(x, y, settings) {
      //console.log(this.type);
      this.parent(x, y, settings);
      if (this.type == 0) this.addAnim('anim', 0.1, [0, 1]);
      else this.addAnim('anim', 0.1, [2, 3]);

      if (settings.flip === false) {
        this.dir = 0;
        this.pos.x += 20;
      } else {
        this.dir = 1;
        this.pos.x -= (this.size.x + 40);
        this.currentAnim.flip.x = true;
      }
      
      this.hurtDragonSound = new ig.Sound('media/sound/dany_drac.*');
      this.hurtDragonSound.volume = 1;
      this.hurtPrincessSound = new ig.Sound('media/sound/dany_princess.*');
      this.hurtPrincessSound.volume = 1;

    },
    update: function() {
      this.parent();
      this.vel.y = 0;
      if (this.dir == 0) this.vel.x = 400;
      else this.vel.x = -400;

      //this.receiveDamage(1);
    },
    draw: function() {
      this.parent();

    },

    handleMovementTrace: function(res) {
      this.parent(res);
      if (res.collision.x === true) {
        // this.vel.x *= -1;
        // If it collides with the wall
        this.kill();
      }
    },

    check: function(other) {      
      if ((this.type === 0 && other instanceof EntityPrincess) || (this.type === 1 && other instanceof EntityDragon)) {
        
        if (this.type === 0 && other instanceof EntityPrincess)
          this.hurtPrincessSound.play();
        else if (this.type === 1 && other instanceof EntityDragon)  
          this.hurtDragonSound.play();
        
        // Move player back if damage received
        if (this.pos.x > other.pos.x) {
          if (!ig.game.animSheet.getTile(other.pos.x - 1, other.pos.y)) other.pos.x = other.pos.x - 1;
        } else {
          if (!ig.game.collisionMap.getTile(other.pos.x + other.size.x + 1, other.pos.y)) other.pos.x = other.pos.x + 1;
        }
        
        console.log("Attack hit");
        if (other.killed === false) {
          other.receiveDamage(1);
          ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y);
          other.incomingFlip = (this.pos.x < other.pos.x);
        }
        this.kill();
      }
    }
  })
});