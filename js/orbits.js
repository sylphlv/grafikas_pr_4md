const orbits = {
   init(scene) {
       this.scene = scene;
   },

   createOrbit(body) {
	   let orbitMaterial = new THREE.LineDashedMaterial({
		   color: 0xfa00ff, linewidth: 1,
		   scale: 0.4,
		   dashSize: 3000,
		   gapSize: 3000,
	   });
	   body.orbitGeometry = new THREE.BufferGeometry();
	   let positions = new Float32Array(1000 * 3); // 3 vertices per point
	   body.orbitGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
	   body.orbitGeometry.pointsAdded = 0;
	   let line = new THREE.Line(body.orbitGeometry, orbitMaterial);
	   line.computeLineDistances();
	   body.line = line;
	   this.scene.add(line);
	},


   recordOrbit(planet) {
	   let geom = planet.orbitGeometry;
	   let positions = geom.attributes.position.array;
	   let planetPosition = planet.localToWorld(new THREE.Vector3(0, 0, 0));
	   positions[geom.pointsAdded * 3] = planetPosition.x;
	   positions[geom.pointsAdded * 3 + 1] = planetPosition.y;
	   positions[geom.pointsAdded * 3 + 2] = planetPosition.z;
	   this.shiftToNextOrbitPoint(geom, positions);
	   geom.attributes.position.needsUpdate = true;
	   geom.setDrawRange(1, geom.pointsAdded - 1);
	   planet.line.computeLineDistances();
	   geom.computeBoundingSphere();
	},


   shiftToNextOrbitPoint(geom, positions) {
	   geom.pointsAdded++;
	   if (geom.pointsAdded * 3 > 997) {
		   for (i = 3; i < geom.pointsAdded * 3; i++)
			   positions[i - 3] = positions[i];
		   geom.pointsAdded--;
	   }
	},


   animate(delta) {
   }
}
