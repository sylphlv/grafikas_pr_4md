const smoke = {
   clouds_geom: new THREE.Geometry(),
   init(scene, bounds) {
       let smokeTexture = new THREE.TextureLoader().load('Smoke-Element2.png');
       let smokeMaterial = new THREE.PointsMaterial({
           size: 700000, map: smokeTexture, transparent: true, depthWrite: false
       });

       function randPos() {
           return bounds * Math.random() - bounds / 2
       }

       for (p = 0; p < 100; p++) {
           let vertex = new THREE.Vector3(randPos(), randPos(), randPos());
           this.clouds_geom.vertices.push(vertex);
       }

       particles = new THREE.Points(this.clouds_geom, smokeMaterial);
       scene.add(particles);
   },

   animate(delta) {

   }
}
