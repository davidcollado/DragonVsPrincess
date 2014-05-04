ig.module('game.entities.heartAttack')
.requires(
  'game.entities.baseAttack',
  'impact.entity-pool'
)
.defines(function() {

  EntityHeartAttack = EntityBaseAttack.extend({
    // Collision properties    
    animSheet: new ig.AnimationSheet('media/fire.png', 32, 32),
    typeOfAttack: 1,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
    },
    
    reset: function(x, y, settings) {
      this.parent(x, y, settings); 
      this.typeOfAttack = 1;
      this.addAnim('anim', 0.1, [2, 3]);
      
      if (settings.flip === false) {
        this.dir = 0;
      } else {
        this.dir = 1;
        this.currentAnim.flip.x = true;
      }
    }
  });
  // Enable Pooling for this Entity Class!
  ig.EntityPool.enableFor( EntityHeartAttack );
});

