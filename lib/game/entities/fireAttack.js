ig.module('game.entities.fireAttack')
.requires(
  'game.entities.baseAttack',
  'impact.entity-pool'
)
.defines(function() {

  EntityFireAttack = EntityBaseAttack.extend({
    // Collision properties    

    typeOfAttack: 0,

    init: function(x, y, settings) {
      this.parent(x, y, settings);
    },
    
    reset: function(x, y, settings) {
      this.parent(x, y, settings); 
      this.typeOfAttack = 0;
      this.addAnim('anim', 0.1, [0, 1]);
      
      if (settings.flip === false) {
        this.dir = 0;
      } else {
        this.dir = 1;
        this.currentAnim.flip.x = true;
      }
    }
  });
  // Enable Pooling for this Entity Class!
  //ig.EntityPool.enableFor( EntityFireAttack );
});

