import normals from "normals";

const positions = [
	// top unique faces
	[-0.5, 0.5, 1.0],
	[0.5, 0.5, 1.0],
	[0.5, -0.5, 1.0],
	[-0.5, -0.5, 1.0],
	// bottom unique faces
	[-0.5, 0.5, 0.0],
	[0.5, 0.5, 0.0],
	[0.5, -0.5, 0.0],
	[-0.5, -0.5, 0.0]
];

const cells = [
	// top face
	[0, 2, 1],
	[0, 3, 2],
	// south face
	[3, 6, 2],
	[3, 7, 6],
	// east face
	[2, 5, 1],
	[2, 6, 5],
	// west face
	[0, 4, 7],
	[0, 7, 3],
	// north face
	[0, 1, 5],
	[0, 5, 4],
];

// colors (sic) :-)
const colors = [
	[1.0, 0.0, 0.0],
	[1.0, 0.0, 0.0],
	[1.0, 0.0, 0.0],
	[1.0, 0.0, 0.0],
	[1.0, 0.0, 0.0],
	[1.0, 0.0, 0.0],
	[1.0, 0.0, 0.0],
	[1.0, 0.0, 0.0]
];

const texcoord0 = [
	[0.5, 0.5],
	[0.5, 1.0],
	[1.0, 0.75],
	[1.0, 0.25],
	[0.5, 0.0],
	[0.0, 0.25],
	[0.0, 0.75]
];

const vertexNormals = normals.vertexNormals(cells, positions);

export default {
	positions,
	cells,
	colors,
	texcoord0,
	normals: vertexNormals
}