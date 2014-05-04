ig.module('game.entities.spawnlocation')
.requires(
  'impact.entity'
)
.defines(function() {

  EntitySpawnlocation = ig.Entity.extend({
    // Weltmeister helpers
    _wmDrawBox: true,
    _wmBoxColor: 'rgba(128, 28, 230, 0.7)',
    _wmScalable: true,

    size: {
      x: 8,
      y: 8
    },

    // Avoid call to parent in update to improve performance
    update: function() {
    }
  });
  
});