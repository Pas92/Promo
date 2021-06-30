import * as THREE from 'https://cdn.skypack.dev/pin/three@v0.129.0-chk6X8RSBl37CcZQlxof/mode=imports/optimized/three.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@v0.129.0-chk6X8RSBl37CcZQlxof/examples/jsm/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'https://cdn.skypack.dev/three@v0.129.0-chk6X8RSBl37CcZQlxof/examples/jsm/renderers/CSS3DRenderer.js';
import Stats from 'https://cdn.skypack.dev/three@v0.129.0-chk6X8RSBl37CcZQlxof/examples/jsm/libs/stats.module.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three@v0.129.0-chk6X8RSBl37CcZQlxof/examples/jsm/loaders/OBJLoader.js';
import { DeviceOrientationControls } from 'https://cdn.skypack.dev/three@v0.129.0-chk6X8RSBl37CcZQlxof/examples/jsm/controls/DeviceOrientationControls.js';
// import { FirstPersonControls } from '/js/three/jsm/controls/FirstPersonControls.js';

let camera, fov, scene, scene2, renderer, renderer2, light, light2, raycaster;
let controls, devControls;
let iframes = [];

let controlUpdateState;
let orbitControlFlag = false;

let INTERSECTED;
const pointer = new THREE.Vector2();

let connectorModel;

if(navigator.userAgentData.mobile) {
  fov = 75;
} else {
  fov = 55;
}

const container = document.getElementById( 'container' );
const stats = new Stats();
container.appendChild( stats.dom );

document.addEventListener("DOMContentLoaded", function(event) {
  if(navigator.userAgentData.mobile) {
    const promptIframe = document.querySelector('#overlay iframe');
    const promptHeader = document.querySelector('#overlay h2');
    promptIframe.remove();
    promptHeader.remove();
  }
});

const startButton = document.getElementById( 'startButton' );
startButton.addEventListener( 'click', function () {
  const overlay = document.getElementById( 'overlay' );
  overlay.style.opacity = 0;
  setTimeout(() => overlay.remove(),300);
} );

const loadingManager = THREE.DefaultLoadingManager.onProgress = ( () => {
  const loadingScreen = document.getElementById( 'loading-screen' );
  loadingScreen.classList.add( 'fade-out' );
  loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
} ); 

init();
render();
animate(performance.now());

function init() {

  //add renderers
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor( 0x000000, 0 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  document.querySelector('#webgl').appendChild( renderer.domElement );

  renderer2 = new CSS3DRenderer({ alpha: true, antialias: true });
  renderer2.setSize( window.innerWidth, window.innerHeight );
  renderer2.domElement.style.position = 'absolute';
  renderer2.domElement.style.top = 0;
  renderer2.domElement.style.pointerEvents = 'auto';
  document.querySelector('#webgl').appendChild( renderer2.domElement );

  //add scene
  scene = new THREE.Scene();
  scene2 = new THREE.Scene();
  console.log(scene);
  scene.background = new THREE.CubeTextureLoader()
    .setPath("img/Skies_1/background/")
    .load( [
      'px.png',
      'nx.png',
      'py.png',
      'ny.png',
      'pz.png',
      'nz.png'
    ] );

  //add camera
  camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 1000 );
  if(navigator.userAgentData.mobile) {
    camera.position.z = 0;
  } else {
    camera.position.z = 1;
  }

  //add domElements
  for (let i=0; i<6; i++) {
    let elementObj = makeElementObject( 'iframe', 1050, 800 );
    elementObj.css3dObject.element.setAttribute('src', 'iframes/1.html');
    elementObj.css3dObject.element.style.border = '1px solid transparent';
    elementObj.css3dObject.element.style.borderRadius = '40px';
    let frameBlock = elementObj.css3dObject.element;
    
    frameBlock.onload = function(){
      let sections = frameBlock.contentDocument.querySelectorAll('section');
      Array.from(sections).forEach(function(element) {
        element.style.display = 'none';
      });
      sections.item(i).style.display = 'block';
      frameBlock.contentDocument.addEventListener('keydown', restoreControl);
      frameBlock.contentDocument.addEventListener('keyup', deleteControl);

      if(i === 0) {
        let nextSliderButton = frameBlock.contentDocument.querySelector('.slider-btn-next');
        let prevSliderButton = frameBlock.contentDocument.querySelector('.slider-btn-prev');
        nextSliderButton.addEventListener('click', goToNextContent);
        prevSliderButton.addEventListener('click', goToPrevContent);
        console.log(nextSliderButton);
      } else {
        iframes.push(frameBlock);
      }
    };
    elementObj.scale.x = 0.1;
    elementObj.scale.y = 0.1;
    elementObj.scale.z = 0.1;

    let elementObjCoord = new THREE.Cylindrical(100,(Math.PI) - (i*(2*Math.PI)/6));
    elementObj.position.setFromCylindrical(elementObjCoord);
    elementObj.lookAt(0,0,0);
    

    scene2.add( elementObj );
  }
  console.log(iframes);

  //add geometry
  for (let i=0; i<6; i++) {
    let objPlate2 = makePlate(1050/10 + 2,800/10 + 2,5);
    let box2 = new THREE.Box3().setFromObject( objPlate2 );
    box2.getCenter(objPlate2.position);
    objPlate2.position.multiplyScalar(-1);
    let pivot2 = new THREE.Group();
    scene.add(pivot2);
    pivot2.add(objPlate2);
    let pivot2Coord = new THREE.Cylindrical(100, i*(2*Math.PI)/6);
    pivot2.position.setFromCylindrical(pivot2Coord);
    pivot2.lookAt(0,0,0);
  }

  const loader = new OBJLoader();
  loader.load( 'obj/G11K0.obj', function ( obj ) {
    obj.scale.x = 0.25;
    obj.scale.y = 0.25;
    obj.scale.z = 0.25;

    let box = new THREE.Box3().setFromObject( obj );
    box.getCenter(obj.position);
    obj.position.multiplyScalar(-1);
    obj.children[0].castShadow = true;
    obj.children[0].receiveShadow = true;
    console.log(obj.children[0].material.wireframe);

    let pivot = new THREE.Group();
    scene.add(pivot);
    pivot.add(obj);
    pivot.position.z = 10;
    console.log(pivot);
    connectorModel = pivot;

  }, onProgress, onError );

  function onProgress () {};
  function onError () {};
  
  raycaster = new THREE.Raycaster();

  //add light
  light = new THREE.AmbientLight( 0x999999, 1.1); 
  light2 = new THREE.AmbientLight( 0x999999, 1.1);
  scene.add( light );
  scene2.add( light2 );

  const color = 0xFFFFFF;
  const intensity = 1.5;
  const light3 = new THREE.DirectionalLight(color, intensity);
  light3.position.set(0, 2, 0);
  scene.add(light3);


  //add controls
  controls = new OrbitControls(camera, renderer2.domElement );
  controls.addEventListener( 'change', render ); // use if there is no animation loop
  controls.minDistance = 1;
  controls.maxDistance = 1;
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.maxPolarAngle = (Math.PI / 2 + 0.3);
  controls.minPolarAngle = (Math.PI / 2 - 0.3);
  controls.update();
  controls.enabled = false;

  devControls = new DeviceOrientationControls( camera );

  window.addEventListener( 'resize', onWindowResize );
  document.addEventListener('keydown', restoreControl);
  document.addEventListener('keydown', info);
  document.addEventListener('keyup', deleteControl);
  // document.addEventListener( 'wheel', onDocumentMouseWheel );
  document.addEventListener( 'mousemove', onPointerMove );
}

function onTransitionEnd( event ) {
  const element = event.target;
  element.remove();
}

function deleteControl (event) {
    if (event.code == 'Space') {

      console.log(camera.rotation);
      controls.update();
      controls.enabled = false;
      camera.updateProjectionMatrix();
      orbitControlFlag = false;
      let tempCol = renderer2.domElement.firstElementChild;
      Array.from(tempCol.children).forEach(element => element.style.pointerEvents = 'auto');
    }
  }
function restoreControl (event) {
  if (event.code == 'Space') {
    // console.log('up');
    controls.enabled = true;
    controlUpdateState = controls.update();
    orbitControlFlag = true;
    let tempCol = renderer2.domElement.firstElementChild;
    Array.from(tempCol.children).forEach(element => element.style.pointerEvents = 'none');
  }
}

function info (event) {
  if (event.code == 'Backspace') {
    console.log(camera);
  }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer2.setSize( window.innerWidth, window.innerHeight );
    controls.handleResize();
}

function makeElementObject(type, width, height) {
    const obj = new THREE.Group(loadingManager);
    const element = document.createElement( type );
    element.style.width = width+'px';
    element.style.height = height+'px';
    element.style.opacity = 0.999;
    element.style.boxSizing = 'border-box';
    var css3dObject = new CSS3DObject(element);
    obj.css3dObject = css3dObject;
    obj.add(css3dObject);
    obj.castShadow = true;
    obj.receiveShadow = true;
    return obj
}

function makePlate(w,h,r) {
  const roundedRectShape = new THREE.Shape();
  ( function roundedRect( ctx, x, y, width, height, radius ) {
    ctx.moveTo( x, y + radius );
    ctx.lineTo( x, y + height - radius );
    ctx.quadraticCurveTo( x, y + height, x + radius, y + height );
    ctx.lineTo( x + width - radius, y + height );
    ctx.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
    ctx.lineTo( x + width, y + radius );
    ctx.quadraticCurveTo( x + width, y, x + width - radius, y );
    ctx.lineTo( x + radius, y );
    ctx.quadraticCurveTo( x, y, x, y + radius );
  } )( roundedRectShape, 0, 0, w, h, r );

  const extrudeSettings = {
      steps: 6,
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.5,
      bevelSegments: 3
    };

  var material = new THREE.MeshPhysicalMaterial( {
    dithering: true,
    color: 0xFFFFFF,
    metalness: 0.1,
    roughness: 0.6,
    envMap: scene.background,
    envMapIntensity: 1,
    depthWrite: false,
    transmission: 0.8, // use material.transmission for glass materials
    opacity: 1
  } );

  var geometry = new THREE.ExtrudeGeometry( roundedRectShape, extrudeSettings );
  var mesh = new THREE.Mesh( geometry, material );
  
  return mesh
}

function goToNextContent() {
  iframes.forEach(element => element.contentWindow.goToNextSlide());
}

function goToPrevContent() {
  iframes.forEach(element => element.contentWindow.goToPrevSlide());
}

function onDocumentMouseWheel( event ) {
  const fov = camera.fov + event.deltaY * 0.05;
  camera.fov = THREE.MathUtils.clamp( fov, 10, 75 );
  console.log(camera.fov);
  camera.updateProjectionMatrix();
}

function onPointerMove( event ) {
  pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function render() {

  renderer.render( scene, camera );
  renderer2.render( scene2, camera );
  // controls2.update(clock.getDelta() );

  raycaster.setFromCamera( pointer, camera );
  camera.lookAt(raycaster.ray.direction.x*0.1, raycaster.ray.direction.y*0.1, raycaster.ray.direction.z*0.1);

  const intersects = raycaster.intersectObjects( scene.children, true );

  if ( intersects.length > 0 ) {
    if ( INTERSECTED != intersects[ 0 ].object ) {
      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 0xff0000 );
      console.log(INTERSECTED);
    }
  } else {
    if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
    INTERSECTED = null;
  }
}

function animate () {
  requestAnimationFrame( animate );
  stats.update();
  connectorModel.rotation.y += 0.01;
  if(navigator.userAgentData.mobile) {
    devControls.update();
  }

  if(!orbitControlFlag) {
  } else {
    controls.update();
  }
  render();
};
