const module = {
	frame: 0, sun: null, camera: null, renderer: null, scene: null, controls: null, campsite: null, bee:null, plane: null, objects: [], offset: new THREE.Vector3(),

	init() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1000, 45000 );
		this.controls = new THREE.OrbitControls( this.camera );
		this.clock = new THREE.Clock();

		var renderer = new THREE.WebGLRenderer( {antialias: true});
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.setClearColor(0xEEEEEE);
		renderer.shadowMap.enabled = true;
		this.renderer = renderer;
		document.body.appendChild( this.renderer.domElement );
		
		//smoke.init(this.scene, 69700 * 9);
		orbits.init(this.scene);

		this.stats = new Stats();
		this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
		document.body.appendChild( this.stats.dom );


		
		this.setupEvents();
		this.createWorld();
		this.createObjects();
		this.createLights();
		this.animate();

		this.camera.position.set(0, 400, 6000);

	},


	setupEvents() {
		window.addEventListener( 'resize', () => {
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();

			this.renderer.setSize( window.innerWidth, window.innerHeight );
		}, false );

		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		this.selectedObj = null;
		
		window.addEventListener('mousedown', (event) => {
			// Get mouse position
			var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
			var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

		    // Get 3D vector from 3D mouse position using 'unproject' function
		    var vector = new THREE.Vector3(mouseX, mouseY, 0.5);
		    vector.unproject(this.camera);

		    // Set the raycaster position
		    this.raycaster.set( this.camera.position, vector.sub( this.camera.position ).normalize() );
			//this.raycaster.setFromCamera(this.mouse, this.camera);

			var intersects = this.raycaster.intersectObjects(this.scene.children, true);
			if ( intersects.length ) {
				this.controls.enabled = false;
				for (var i = 0; i < intersects.length; i++) {
					if (this.changeSelection(intersects[i].object)) break;;
				}
			}
			
		}, false);
		window.addEventListener('mousemove', (event) => {
			event.preventDefault();

		    // Get mouse position
		    var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
		    var mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

		    // Get 3D vector from 3D mouse position using 'unproject' function
		    var vector = new THREE.Vector3(mouseX, mouseY, 1);
		    vector.unproject(this.camera);

		    // Set the raycaster position
		    this.raycaster.set( this.camera.position, vector.sub( this.camera.position ).normalize() );
		    //console.log(this.selectedObj);

		    if (this.selectedObj != null) {
		      // Check the position where the plane is intersected
		      var dir = vector.sub( this.camera.position ).normalize();
		      var distance = - this.camera.position.z / dir.z;
		      var pos = this.camera.position.clone().add( dir.multiplyScalar( distance ) );
		      this.selectedObj.position.copy(pos);
		  }
		}, false);
		window.addEventListener('mouseup', (event) => {
			this.controls.enabled = true;
			this.selectedObj = null;
		}, false);

	},
	
	changeSelection(obj) {
		if (obj != this.skysphere && this.selectedObj != obj) {
			this.selectedObj = obj;
			return true;
		}
	},


	createWorld() {
		this.camera.position.z = 555;
		this.camera.position.y = 555;
		
		//var geometry = new THREE.SphereGeometry( this.marsDistance * 9 + 10000, 32, 32 ); //marsDistance + 10000 to marsDistance * 9
		//var material = new THREE.MeshStandardMaterial( {
		//	side: THREE.DoubleSide
		//});
		//this.skysphere = new THREE.Mesh( geometry, material );
		//this.scene.add( this.skysphere );
		

		// var loader = new THREE.GLTFLoader();
		// loader.load( 'pickle.gltf', ( gltf ) => {
		// 	gltf.scene.scale.set(100, 100, 100);
		// 	gltf.scene.position.z = this.camera.position.z-27940;
		// 	gltf.scene.position.x = this.camera.position.x;
		// 	gltf.scene.position.y = this.camera.position.y;
		// 	this.pickle = gltf.scene;
		// 	this.scene.add( gltf.scene );
		// } );

		var loader = new THREE.GLTFLoader();
		loader.load( 'campsite.gltf', ( gltf ) => {
			gltf.scene.scale.set(10000, 10000, 10000);
			gltf.scene.position.copy(this.camera.position);
			gltf.scene.position.x -= 5000;
			gltf.scene.quaternion.copy( this.camera.quaternion );
			gltf.scene.rotation.y = 90;

			this.campsite = gltf.scene;


			this.scene.add( this.campsite );
		});

		loader.load( 'bee.gltf', ( gltf ) => {
			gltf.scene.scale.set(1000, 1000, 1000);
			gltf.scene.position.copy(this.camera.position);
			gltf.scene.position.x -= 5000;
			gltf.scene.rotation.y = 90;
			this.bee = gltf.scene;
			this.scene.add( this.bee );
		});

	},

	createObjects() {		
		var geometry = new THREE.SphereGeometry( 6970, 32, 32 );
		var material = new THREE.MeshStandardMaterial( {emissive: 0xEEEE99} );
	},


	createLights() {
		var spotLight = new THREE.PointLight( 0xffffff, 1, this.camera.far, 2 );
		
		spotLight.castShadow = true;
		spotLight.penumbra = 0.5;
		spotLight.shadow.mapSize.width = 1024;
		spotLight.shadow.mapSize.height = 1024;
		
		spotLight.shadow.camera.near = this.camera.near;
		spotLight.shadow.camera.far = this.camera.far;
		
		this.scene.add( new THREE.AmbientLight( 0x404040 ) );

		this.scene.add( spotLight );
	},
	
	animate() {
		this.controls.update();
		requestAnimationFrame(() => this.animate());
		
		// this.stats.begin();

		// this.stats.end();
		this.stats.update();

		this.renderer.render(this.scene, this.camera);
		
	}
}

module.init();

