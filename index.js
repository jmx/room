import glnow from "gl-now";
import attachCamera from "game-shell-orbit-camera";
import glm from "gl-matrix";

/* Geometry */
import createMesh from "gl-mesh";
import Geometry from "gl-geometry";

import teapot from "teapot";
import box from "./geometry/box";
import icosphere from "icosphere";

/* Shaders */
import createShader from "gl-shader";
// hax: glslify is a browserify transform and needs to be 'required'
let glslify = require("glslify");

let entityShader, lightShader;
let entityVertexShader = glslify("./shaders/box.vert", 'utf8');
let entityFragmentShader = glslify("./shaders/box.frag", 'utf8');
let lightVertexShader = glslify("./shaders/light.vert", 'utf8');
let lightFragmentShader = glslify("./shaders/light.frag", 'utf8');

/* Stats.js performance counter */
import Stats from "stats.js";

let stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

/* global vars to prevent GC thrashing */
let mesh, i, frame = 0;
let shell = glnow();
let mat4 = glm.mat4;
let scratch = mat4.create();
let tint = [1.0, 1.0, 1.0, 1.0];

let boxes = [];
let lights = [];

// Coordinates for the 'pillars'
let boxPositions = [
	[-1, 1, 0],
	[1, 1, 0],
	[1, -1, 0],
	[-1, -1, 0]
];

// {w} position is light intensity
let lightPositions = [
	[0, 0, 2, 0.1],
	[1, 0.4, 0.5, 0.05]
];

let camera = attachCamera(shell);
camera.lookAt([0, 0, 7], [0, 0, 0], [0, 1, 0])
 
shell.on("gl-init", function() {

	let gl = shell.gl;
	// Enables depth testing, which prevents triangles
	// from overlapping.
	gl.enable(gl.DEPTH_TEST);

	// Enables face culling, which prevents triangles
	// being visible from behind.
	gl.enable(gl.CULL_FACE);

	entityShader = createShader(
		shell.gl,
		entityVertexShader,
		entityFragmentShader
	);

	lightShader = createShader(
		shell.gl,
		lightVertexShader,
		lightFragmentShader
	);

	boxPositions.forEach((position) => {
		mesh = Geometry(shell.gl)
			.faces(box.cells)
			.attr("colors", box.colors)
			.attr("positions", box.positions);

		mesh.type = "box";
		mesh.position = position;
		boxes.push(mesh);
	});

	lightPositions.forEach((position) => {
		mesh = createMesh(shell.gl, icosphere(1));
		mesh.type = "light";
		mesh.position = [position[0], position[1], position[2]];
		mesh.scale = [position[3], position[3], position[3]];
		lights.push(mesh);
	});

	// teapot :-)
	mesh = createMesh(shell.gl, teapot);
	mesh.position = [0, 0, 0];
	mesh.scale = [0.01, 0.01, 0.01];
	lights.push(mesh);
});
 
shell.on("gl-render", function(t) {
	stats.begin();
	//Bind shader
	entityShader.bind();

	// main light is orbiting in a circle outside our pillars
	// primitive animation based on number of frames elapsed
	lights[0].position[0] = 2 * Math.sin(frame/60);
	lights[0].position[1] = 2 * Math.cos(frame/60);

	//Set camera parameters 
	entityShader.uniforms.view = camera.view(scratch);

	// just white.
	entityShader.uniforms.tint = tint;
	entityShader.uniforms.projection = mat4.perspective(scratch, Math.PI/4.0, shell.width/shell.height, 0.1, 1000.0);

	//Draw object 
	for (i=0; i<boxes.length; i++) {
		mesh = boxes[i];

		// reset scratch for this model
		mat4.identity(scratch);

		// apply models' position
		mat4.translate(scratch, scratch, mesh.position);

		// if model has been scaled, apply scale
		if (mesh.scale) {
			mat4.scale(scratch, scratch, mesh.scale);
		}

		// apply matrix to shader
		entityShader.uniforms.model = scratch;

		mesh.bind(entityShader);
		mesh.draw();
		mesh.unbind();
	}

	lightShader.bind();
	// just white.
	lightShader.uniforms.view = camera.view(scratch);
	lightShader.uniforms.tint = tint;
	lightShader.uniforms.projection = mat4.perspective(scratch, Math.PI/4.0, shell.width/shell.height, 0.1, 1000.0);

	// draw lights
	for (i=0; i<lights.length; i++) {

		mesh = lights[i];
		
		// reset scratch for this model
		mat4.identity(scratch);

		// apply models' position
		mat4.translate(scratch, scratch, mesh.position);

		// if model has been scaled, apply scale
		if (mesh.scale) {
			mat4.scale(scratch, scratch, mesh.scale);
		}

		// apply matrix to shader
		lightShader.uniforms.model = scratch;

		mesh.bind(lightShader);
		mesh.draw();
		mesh.unbind();
	}

	stats.end();
	frame++;
});