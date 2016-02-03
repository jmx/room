import glnow from "gl-now";
import createMesh from "gl-mesh";
import simple3dShader from "simple-3d-shader";
import attachCamera from "game-shell-orbit-camera";
import glm from "gl-matrix";
import Stats from "stats.js";

let shader, mesh, i;
let shell = glnow();
let mat4 = glm.mat4
let stats = new Stats();

stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

let camera = attachCamera(shell);

let boxPositions = [
	[-1, 1, 0],
	[1, 1, 0],
	[1, -1, 0],
	[-1, -1, 0]
];

let boxes = [];

camera.lookAt([0, 0, 7], [0, 0, 0], [0, 1, 0])
 
shell.on("gl-init", function() {
	shader = simple3dShader(shell.gl);
	boxPositions.forEach((position) => {
		mesh = createMesh(shell.gl, require("./geometry/box"));
		mesh.offset = position;
		boxes.push(mesh);
	});
	
});
 
shell.on("gl-render", function(t) {
	stats.begin();
	//Bind shader 
	shader.bind()

	//Set camera parameters 
	var scratch = mat4.create();
	shader.uniforms.projection = mat4.perspective(scratch, Math.PI/4.0, shell.width/shell.height, 0.1, 1000.0);
	shader.uniforms.view = camera.view(scratch);

	//Draw object 
	for (i=0; i<boxes.length; i++) {
		mesh = boxes[i];

		mat4.identity(scratch);
		mat4.translate(scratch, scratch, mesh.offset);

		shader.uniforms.model = scratch;

		mesh.bind(shader)
		mesh.draw()
		mesh.unbind()	
	}
	stats.end();
});