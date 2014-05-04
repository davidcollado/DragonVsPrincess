ig.module('game.entities.baseAttack')
.requires(
  'impact.entity'
)
.defines(function() {

  EntityBaseAttack = ig.Entity.extend({
    // Collision properties
    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,

    size: {
      x: 32,
      y: 32
    },
    
    animSheet: new ig.AnimationSheet('media/fire.png', 32, 32),
    dir: 0,
    typeOfAttack: 0,
    
    maxVel: {
      x: 400,
      y: 400
    },
    
    friction: {
      x: 0,
      y: 0
    },
    gravityFactor: 0,
    health: 30,

    // Property to keep track of flip
    flip: false,

    init: function(x, y, settings) {
      //console.log(this.type);
      this.parent(x, y, settings);
      if (this.typeOfAttack == 0) 
        this.addAnim('anim', 0.1, [0, 1]);
      else 
        this.addAnim('anim', 0.1, [2, 3]);

      if (settings.flip === false) {
        this.dir = 0;
        //this.pos.x += 20;
      } else {
        this.dir = 1;
        //this.pos.x -= (this.size.x + 40);
        this.currentAnim.flip.x = true;
      }
    },
    
    reset: function(x, y, settings) {
      this.parent(x, y, settings);
    },
    
    update: function() {
      this.parent();
      this.vel.y = 0;
      if (this.dir == 0) 
        this.vel.x = this.maxVel.x;
      else 
        this.vel.x = -this.maxVel.x;
    },

    handleMovementTrace: function(res) {
      this.parent(res);
      if (res.collision.x === true) {
        this.kill();
      }
    },

    check: function(other) {      
      if ((this.typeOfAttack === 0 && other instanceof EntityPrincess) || (this.typeOfAttack === 1 && other instanceof EntityDragon)) {
        
        ig.log("Attack hit");
        
        // Play sound - More elegant solution pending
        /*if (this.type === 0 && other instanceof EntityPrincess)
          this.hurtPrincessSound.play();
        else if (this.type === 1 && other instanceof EntityDragon)  
          this.hurtDragonSound.play();*/
          
          other.hurtSound.play();
        
        // Move player back if damage received
        if (this.pos.x > other.pos.x) {
          if (!ig.game.collisionMap.getTile(other.pos.x - 1, other.pos.y)) other.pos.x = other.pos.x - 1;
        } else {
          if (!ig.game.collisionMap.getTile(other.pos.x + other.size.x + 1, other.pos.y)) other.pos.x = other.pos.x + 1;
        }
        
        if (other.killed === false) {
          other.receiveDamage(1);
          ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y);
          other.incomingFlip = (this.pos.x < other.pos.x);
        }
        
        this.kill();
      }
    }
  });
    
});

