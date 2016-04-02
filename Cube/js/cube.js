// -----------------  setup functions ---------------------
var camera, controls, scene, renderer;
function init() {
   // camera
   camera = new THREE.PerspectiveCamera(
      45, window.innerWidth / window.innerHeight, 1, 1000
   );
   camera.position.set(150, 100, 100);

   // controls
   controls = new THREE.TrackballControls(camera);
   controls.rotateSpeed = 6;

   // scene
   scene = new THREE.Scene();
   scene.add(new THREE.AmbientLight(0xffffff));

   // renderer
   renderer = new THREE.WebGLRenderer();
   renderer.setSize(window.innerWidth, window.innerHeight);
   renderer.setClearColor(0x202020, 1);
   document.body.appendChild(renderer.domElement);

   // objects
   createCubes();
}

// setup rubik's cube
var CSIZE = 25;
var CSPACE = 28;
var allCubes = [];
function createCubes() {
   var geometry = new THREE.CubeGeometry(CSIZE, CSIZE, CSIZE);
   // set materials
   var side = [
      new THREE.MeshBasicMaterial({color:0xcb1e37}), // 0 up red
      new THREE.MeshBasicMaterial({color:0xdc5c2a}), // 1 down orange
      new THREE.MeshBasicMaterial({color:0x016843}), // 2 left green
      new THREE.MeshBasicMaterial({color:0xeebc37}), // 3 right yelow
      new THREE.MeshBasicMaterial({color:0x3036ae}), // 4 front blue
      new THREE.MeshBasicMaterial({color:0xfaeff1}), // 5 back white
      new THREE.MeshBasicMaterial({color:0x161616}), // 6 inner black
   ];

   // generate a single cube in certain color & position
   function newCube(x, y, z, levelX, levelY, levelZ) {
      // set indexe of material for each side
      var left  = levelX == 0 ? 2 : 6,
          right = levelX == 2 ? 3 : 6,
          up    = levelY == 2 ? 0 : 6,
          down  = levelY == 0 ? 1 : 6,
          front = levelZ == 2 ? 4 : 6,
          back  = levelZ == 0 ? 5 : 6;

      // create cube object
      var cubeMats = [side[right], side[left], side[up], side[down], side[front], side[back]];
      var material = new THREE.MeshFaceMaterial(cubeMats);
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x,y,z);
      mesh.rubikPosition = [mesh.position.x, mesh.position.y, mesh.position.z];

      // add the cube to scene and cube group
      scene.add (mesh);
      allCubes.push (mesh);
   }

   // generate all cubes
   for (var i=0; i<3; i++)
      for (var j=0; j<3; j++)
         for (var k=0; k<3; k++)
            newCube((i-1) * CSPACE, (j-1) * CSPACE, (k-1) * CSPACE, i, j, k);
}


// ------------------------ moving functions-----------------------
var isMoving = false;         // mark if it's in the middle of one move
var moveAxis, moveDirection;
var SPEED = 0.1;

var pivot = new THREE.Object3D();   // rotate pivot
var cubeGroup = [];  // all cubes on the side to be moved
var moveQueue = [];  // list of operations

var centers = [
   [ CSPACE, 0, 0], // 0 right
   [-CSPACE, 0, 0], // 1 left
   [0,  CSPACE, 0], // 2 up
   [0, -CSPACE, 0], // 3 down
   [0, 0,  CSPACE], // 4 front
   [0, 0, -CSPACE]  // 5 back
];

function equal(a, b) {
   return Math.abs(a-b) <= 0.01;
}

// add one move to the list
function pushMove(axis, center, direction) {
   moveQueue.push({axis:axis, center:center, direction:direction});
}

// the group of cubes to be moved
function setGroup(axis, centerPosition) {
   cubeGroup = [];
   allCubes.forEach(function(cube) {
      if (equal(cube.rubikPosition[axis], centerPosition[axis])) {
         cubeGroup.push(cube);
      }
   });
}

function startMove() {
   // retrieve one move from the list
   var nextMove = moveQueue.shift();
   if (nextMove && !isMoving) {
      isMoving = true;
      moveAxis = nextMove.axis;
      moveDirection = nextMove.direction;
      var center = nextMove.center;
      setGroup (moveAxis, center);
      // set the pivot
      pivot.rotation.set(0,0,0);
      pivot.updateMatrixWorld();
      scene.add(pivot);
      // attach cube group to the pivot
      cubeGroup.forEach(function(cube) {
         var pos = cube.position.clone();
         THREE.SceneUtils.attach(cube, scene, pivot);
         cube.position.set(pos.x, pos.y, pos.z);
      });
   }
}


function move() {
   // note: unable to access position[0] in current virsion of three.js
   var rot = [pivot.rotation.x, pivot.rotation.y, pivot.rotation.z];
   if (rot[moveAxis] >= Math.PI / 2) {
      rot[moveAxis] = Math.PI / 2;
      pivot.rotation.set(rot[0], rot[1], rot[2]);
      stopMove();
   }
   else if (rot[moveAxis] <= -Math.PI / 2) {
      rot[moveAxis] = -Math.PI / 2;
      pivot.rotation.set(rot[0], rot[1], rot[2]);
      stopMove();
   }
   else {
      // update the rotation
      rot[moveAxis] += moveDirection * SPEED;
      pivot.rotation.set(rot[0], rot[1], rot[2]);
   }

}

function stopMove() {
   isMoving = false;
   moveAxis, moveDirection = undefined;
   pivot.updateMatrixWorld();
   // detach cube group from the pivot
   cubeGroup.forEach(function(cube){
      cube.updateMatrixWorld();
      cube.position.applyMatrix4(pivot.matrixWorld);
      cube.rubikPosition = [cube.position.x, cube.position.y, cube.position.z];
      THREE.SceneUtils.detach(cube, pivot, scene);
      cube.position.set(cube.rubikPosition[0], cube.rubikPosition[1], cube.rubikPosition[2]);
   });
   scene.remove(pivot);
   setRandomMove();
   startMove();
}

// ---------------------- end move ---------------------

function animate() {
   requestAnimationFrame(animate);
   controls.update();
   if (isMoving) {
      move();
   }
   render();
}

function render() {
   renderer.render(scene, camera);
}

var lastAxis = 0;
function setRandomMove() {
   var axis = Math.floor(Math.random()*3);
   while(axis == lastAxis) {
      axis = Math.floor(Math.random()*3);
   }
   lastAxis = axis;
   var face = Math.floor(Math.random()*2);
   var dir = Math.floor(Math.random()*2);
   pushMove(axis, centers[axis*2+face], dir==1?1:-1);
}

function start() {
   init();
   setRandomMove();
   startMove();
   animate();
}
