// Working in WebGL with Three.js
// Threejs library
import * as THREE from '../node_modules/three/build/three.module.js';

// SVGLader library from three.js
import { SVGLoader } from '../node_modules/three/examples/jsm/loaders/SVGLoader.js';

// Some math personalizationjs
import { QUARTER_PI, HALF_PI, PI, TWO_PI, lerp, map } from './utils/math.js';

/* Check if is running on a mobile device */
import {
    MobileCheck
} from './utils/MobileCheck.js';
const mobileCheck = new MobileCheck();
const isMobile = mobileCheck.isMobile;

// Renderer, Scene and Camera for Three.js
let renderer, scene, camera;

// The line geometry
let line;

// Total number of points in the geometry
let MAX_POINTS = 0;// = 500;// = 500;

// The number of point to actually draw from the geometry
let drawCount = 0;

// Is it drawing?
let isDrawing = false;

// 
let isDrawFinished = false;

// instantiate an SVG loader from Three.js
let loader;

// points for the ending path
let endingPoints = [];

// speed of animation for the points;
let pointSpeed = [];

let textIsDrawn = false;

// Pick the SVG from the list
let pathNum = 0;

// And this is the SVG list
let svgs = ['code_test.svg'];

// the color of the line
let lineColor;

const init = () => {

    // renderer
    renderer = new THREE.WebGLRenderer({
        antialiasing: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    document.body.appendChild(renderer.domElement);

    // scene
    scene = new THREE.Scene();

    // camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    let camera_x = isMobile ? window.innerWidth / 2 : window.innerWidth / 2;
    let camera_y = isMobile ? -window.innerHeight / 2 : -window.innerHeight / 2;
    let camera_z = isMobile ? 700 : 1150;
    camera.position.set(camera_x, camera_y, camera_z);

    // geometry
    let geometry = new THREE.BufferGeometry();

    // geometry color
    lineColor = new THREE.Vector3(0, 0, 0);
    let color = new THREE.Color("rgb(" + lineColor.x + ", " + lineColor.y + ", " + lineColor.z + ")");

    // attributes
    let positions = new Float32Array(MAX_POINTS * 3); // 3 vertices per point
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // drawcalls
    geometry.setDrawRange(0, drawCount);

    // material
    let material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 10
    });

    // line
    line = new THREE.Line(geometry, material);
    scene.add(line);

    // The mouse event
    window.addEventListener('mousemove', mousePointer);

    // initialize positions
    initPositions();

    animate();

    // check if it is a mobile device, to bind the touch events
    if (isMobile) {
        window.addEventListener("touchstart", touchDown, false);
        window.addEventListener("touchend", touchUp, false);
        window.addEventListener("touchmove", mousePointer, false);
    }

}

// initialize positions
const initPositions = () => {

    let positions = line.geometry.attributes.position.array;

    let index = 0;

    for (let i = 0, l = MAX_POINTS; i < l; i++) {

        let a = (-Math.PI / 2) + (i / MAX_POINTS) * (Math.PI * 2);

        positions[index + 0] = Math.random() * 100;//0.0;
        positions[index + 1] = Math.random() * 100;//0.0;
        positions[index + 2] = 0;//0.0;

        let s = 0.005 + Math.random() * 0.03;
        pointSpeed[index + 0] = s;
        pointSpeed[index + 1] = s;
        pointSpeed[index + 2] = s;

        index += 3;

    }

}

// render
const render = () => {

    renderer.render(scene, camera);

}

// animate
const animate = () => {

    requestAnimationFrame(animate);

    if (isDrawFinished) {

        // Get the positions, for abbreviation in the code
        let positions = line.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i++) {

            // Update the X and Y position of the vertex
            positions[i] = lerp(positions[i], endingPoints[i], pointSpeed[i]);

        }

        // Linear interpolation for the color of the line
        lineColor.x = lerp(lineColor.x, 255, 0.01);
        // lineColor.z = lerp(lineColor.z, 0, 0.01);
        let color = new THREE.Color("rgb(" + Math.floor(lineColor.x) + ", " + Math.floor(lineColor.y) + ", " + Math.floor(lineColor.z) + ")");
        line.material.color = color;
        line.material.needsUpdate = true;
    }

    line.geometry.setDrawRange(0, drawCount);
    line.geometry.attributes.position.needsUpdate = true; // required after the first render

    render();

}





/*
 * ------------------------------------------------
 * -------------- SVG LOADER FUNCTION -------------
 * ------------------------------------------------
 */

const loadSVG = () => {
    // load a SVG resource

    // The resolution of the shape
    // High resolutions means more points, but lower speed and more interaction time
    let shapeResolution = 50;

    loader.load(
        // resource URL
        'Assets/' + svgs[pathNum],
        // called when the resource is loaded
        function (data) {

            let paths = data.paths;

            for (let i = 0; i < paths.length; i++) {

                let path = paths[i];

                let currentPath = path.currentPath.curves;
                let subPath = path.subPaths;

                for (let k = currentPath.length - 1; k >= 0; k--) {
                    let points = currentPath[k].getPoints(shapeResolution);
                    for (let p = points.length - 1; p >= 0; p--) {
                        let x = isMobile ? (window.innerWidth / 3.5) + points[p].x * 0.25 : (window.innerWidth / 3) + points[p].x;
                        let y = isMobile ? -(window.innerHeight / 1.75) + points[p].y * 0.25 : -(window.innerHeight / 1.5) + points[p].y;
                        endingPoints.push(x);
                        endingPoints.push(y);
                        endingPoints.push(0);
                    }
                }

                for (let k = subPath.length - 1; k > 0; k--) {
                    let points = subPath[k].getPoints(shapeResolution);
                    for (let p = points.length - 1; p >= 0; p--) {
                        let x = isMobile ? (window.innerWidth / 3.5) + points[p].x * 0.25 : (window.innerWidth / 3) + points[p].x;
                        let y = isMobile ? -(window.innerHeight / 1.75) + points[p].y * 0.25 : -(window.innerHeight / 1.5) + points[p].y;
                        endingPoints.push(x);
                        endingPoints.push(y);
                        endingPoints.push(0);
                    }
                }

            }

            MAX_POINTS = endingPoints.length;
            // drawCount = MAX_POINTS;  // DEBUG PURPOSE

            init();

        },
        // called when loading is in progresses
        function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        function (error) {

            console.log('An error happened');

        }
    );
}





/*  
 * ------------------------------------------------
 * -------------------- EVENTS --------------------
 * ------------------------------------------------
 */

const touchDown = function () {
    isDrawing = true;

    if (drawCount > MAX_POINTS - 1) {
        isDrawing = false;
    }

}

const touchUp = function () {
    isDrawing = false;
    if (drawCount > MAX_POINTS - 1) {
        isDrawing = false;
        isDrawFinished = true;
        // fade the texts, with a small delay so the draw is alisgned with the SVG
        setTimeout(function () {
            // fade in text one
            let textOne = document.getElementsByClassName('textOne')[0];
            textOne.classList.add('intro');
            // fade in text two
            let textTwo = document.getElementsByClassName('textTwo')[0];
            textTwo.classList.add('intro');
        }, 1000);
    } else {
        let lastIndex = (drawCount-1) * 3;
        for (let i = drawCount; i < MAX_POINTS; i++) {
            let index = drawCount * 3;

            // Update the X and Y position of the vertex
            positions[index + 0] = positions[lastIndex + 0];
            positions[index + 1] = positions[lastIndex + 1];

            drawCount++;
        }
        isDrawing = false;
        isDrawFinished = true;
        // fade the texts, with a small delay so the draw is alisgned with the SVG
        setTimeout(function () {
            // fade in text one
            let textOne = document.getElementsByClassName('textOne')[0];
            textOne.classList.add('intro');
            // fade in text two
            let textTwo = document.getElementsByClassName('textTwo')[0];
            textTwo.classList.add('intro');
        }, 1000);
    }

}

// When the mouse is pressed, activate the drawing
document.onmousedown = function () {

    isDrawing = true;

    if (drawCount > MAX_POINTS - 1) {
        isDrawing = false;
    }

}

// When the mouse is released, deactivate the drawing
document.onmouseup = function () {
    isDrawing = false;
    if (drawCount > MAX_POINTS - 1) {
        isDrawing = false;
        isDrawFinished = true;
        // fade the texts, with a small delay so the draw is alisgned with the SVG
        setTimeout(function () {
            // fade in text one
            let textOne = document.getElementsByClassName('textOne')[0];
            textOne.classList.add('intro');
            // fade in text two
            let textTwo = document.getElementsByClassName('textTwo')[0];
            textTwo.classList.add('intro');
        }, 1000);
    } else {
        let positions = line.geometry.attributes.position.array;
        let lastIndex = (drawCount - 1) * 3;
        for (let i = drawCount; i < MAX_POINTS; i++) {
            let index = drawCount * 3;

            // Update the X and Y position of the vertex
            positions[index + 0] = positions[lastIndex + 0];
            positions[index + 1] = positions[lastIndex + 1];

            drawCount++;
        }
        isDrawing = false;
        isDrawFinished = true;
        // fade the texts, with a small delay so the draw is alisgned with the SVG
        setTimeout(function () {
            // fade in text one
            let textOne = document.getElementsByClassName('textOne')[0];
            textOne.classList.add('intro');
            // fade in text two
            let textTwo = document.getElementsByClassName('textTwo')[0];
            textTwo.classList.add('intro');
        }, 1000);
    }
}

// When drawing, update the latest vertex to the actual mouse location
const mousePointer = (e) => {

    e.preventDefault();

    // Check if the draw range is smaller that the number of vertices, avoiding a possible error
    if (drawCount > MAX_POINTS - 1) {
        isDrawing = false;
        if (!textIsDrawn) drawText(endingPoints);
    }

    // If is drawing, update the position of the latest vertex, and add 1 vertex in the drawCount
    if (isDrawing) {

        let iterations = pathNum == 0 ? 1 : 10;

        // Get the positions, for abbreviation in the code
        let positions = line.geometry.attributes.position.array;

        // Get the actual drawCount, multiplied by 3 -> (x, y, z) for each vertex
        for (let i = 0; i < iterations; i++) {

            let index = drawCount * 3;

            // Update the X and Y position of the vertex
            positions[index + 0] = isMobile ? e.touches[0].pageX : e.pageX;
            positions[index + 1] = isMobile ? -e.touches[0].pageY : -e.pageY;

            drawCount++;

        }
    }

}

// make the canvas scalable to the window screen
window.addEventListener('resize', function () {
    let width = window.innerWidth;
    let height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});





/*
 * ------------------------------------------------
 * -------------- DRAW TEXT FUNCTION --------------
 * ------------------------------------------------
 */

const drawText = function () {
    // Draw the "text one" on the first point, 10px shifted left
    let x1 = endingPoints[0] - 10;
    let y1 = -endingPoints[1];
    let textOne = document.createElement('div');
    textOne.classList.add('textOne');
    // textOne.classList.add('intro');
    textOne.style.left = '' + x1 + 'px';
    textOne.style.top = '' + y1 + 'px';
    textOne.innerHTML = "TEXT ONE";
    document.body.appendChild(textOne);

    // Draw the "text two" on the first point, 10px shifted right
    let x2 = endingPoints[endingPoints.length - 3] + 10;
    let y2 = -endingPoints[endingPoints.length - 2];
    let textTwo = document.createElement('div');
    textTwo.classList.add('textTwo');
    // textTwo.classList.add('intro');
    textTwo.style.left = '' + x2 + 'px';
    textTwo.style.top = '' + y2 + 'px';
    textTwo.innerHTML = "TEXT TWO";
    document.body.appendChild(textTwo);

    textIsDrawn = true;
}

// Let's get the party started!
loader = new SVGLoader();
loadSVG();