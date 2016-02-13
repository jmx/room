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
import * as Shaders from "./shaders/index";

let entityShader, lightShader;

/* Stats.js performance counter */
import Stats from "stats.js";

let stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
stats.domElement.style.zIndex = 100;
document.body.appendChild( stats.domElement );

/* Textures */
import createTexture from "gl-texture2d";

/* global vars to prevent GC thrashing */
let mesh, i, frame = 0;
let mat4 = glm.mat4;
let vec3 = glm.vec3;
let scratch = mat4.create();
let tint = [1.0, 1.0, 1.0, 1.0];

let boxes = [];
let lights = [];
let directionalLight;
let textures, diffuse, normal, specular;

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
	[1, 0.1, 0.5, 0.05]
];

export default function createApp(shell, images) {
	let camera = attachCamera(shell);
	camera.lookAt([0, 0, 7], [0, 0, 0], [0, 1, 0]);

	shell.on("gl-init", function() {

		let gl = shell.gl;
		// Enables depth testing, which prevents triangles
		// from overlapping.
		gl.enable(gl.DEPTH_TEST);

		// // Enables face culling, which prevents triangles
		// // being visible from behind.
		// gl.enable(gl.CULL_FACE);

		let ext = gl.getExtension('OES_standard_derivatives');
		if (!ext)
			throw new Error('derivatives not supported');

		// 'misc' entity shader
		entityShader = createShader(
			shell.gl,
			Shaders.entityVertexShader,
			Shaders.entityFragmentShader
		);

		// plain fill for rendering dummy objects (lightsources)
		lightShader = createShader(
			shell.gl,
			Shaders.lightVertexShader,
			Shaders.lightFragmentShader
		);

		textures = images.map(image => {
			let tex = createTexture(gl, image);

			// smooth texture scaling
			tex.bind();
			tex.generateMipmap();
			tex.minFilter = gl.LINEAR_MIPMAP_LINEAR;
			tex.magFilter = gl.LINEAR;

			// set wrapping to repeat
			tex.wrap = gl.REPEAT

			ext = gl.getExtension("EXT_texture_filter_anisotropic");
			if (ext) {
				let maxAnistrophy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
				tex.bind();
				gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(16, maxAnistrophy));
			} 

			return tex;
		});

		[diffuse, normal, specular] = textures;

		boxPositions.forEach((position) => {
			// the order .attr() is called matters!
			mesh = Geometry(shell.gl)
				// .attr("colors", box.colors)
				.attr("normals", box.normals)
				.attr("positions", box.positions)
				.attr("uvs", box.uvs, {size: 2})
				.faces(box.cells)

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

		directionalLight = createMesh(shell.gl, icosphere(1));
		directionalLight.type = "light";
		directionalLight.position = [2, 2, 2];
		directionalLight.scale = [0.2, 0.2, 0.2];
		lights.push(directionalLight);

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
		diffuse.bind(0);
		normal.bind(1);
		specular.bind(2);
		entityShader.uniforms.diffuseSampler = 0;
		entityShader.uniforms.normalSampler = 1;
		entityShader.uniforms.specularSampler = 2;
		
		// normal.bind(1);
		// specular.bind(2);

		// main light is orbiting in a circle outside our pillars
		// primitive animation based on number of frames elapsed
		lights[0].position[0] = 2 * Math.sin(frame/60);
		lights[0].position[1] = 2 * Math.cos(frame/60);

		//Set camera parameters 
		entityShader.uniforms.view = camera.view(scratch);

		// just white.
		entityShader.uniforms.projection = mat4.perspective(scratch, Math.PI/4.0, shell.width/shell.height, 0.1, 1000.0);
		// diffuse directional light for scene
		entityShader.uniforms.lightColor = [1, 1, 1];
		let ld = [-1.5, 3.0, 4.0];
		entityShader.uniforms.lightDirection = vec3.normalize(ld, ld);
		// todo: pass intensity in {w} coordinate

		let lightsForShader = [];

		for (let x = 0; x < lights.length; x++) {
			lightsForShader.push([
				lights[x].position[0],
				lights[x].position[1],
				lights[x].position[2]
			]);
		}
		entityShader.uniforms.lightPosition = lightsForShader;
		entityShader.uniforms.numLights = lights.length;

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

			// invert model matrix (for lighting)
			mat4.invert(scratch, scratch)

			entityShader.uniforms.invModel = mat4.transpose(scratch, scratch);

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

		// put the directional light somewhere we can see it :-)
		mat4.identity(scratch);
		directionalLight.bind(lightShader);
		mat4.translate(scratch, scratch, directionalLight.position);
		mat4.scale(scratch, scratch, directionalLight.scale);
		lightShader.uniforms.model = scratch;
		directionalLight.draw();
		directionalLight.unbind();

		stats.end();
		frame++;
	});
}