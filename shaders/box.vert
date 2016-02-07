attribute vec3 position;
attribute vec3 colour;
attribute vec4 normal;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

// diffuse scene light
// uniform vec3 lightColor;
uniform mat4 invModel;

// point light(s)
// uniform vec3 lightPosition;

varying vec3 vcol;
varying vec3 vnormal;
varying vec3 vposition;

void main() {
   gl_Position = projection * view * model * vec4(position, 1.0);
   vposition = vec3(model * vec4(position, 1.0));
   vnormal = normalize(vec3(invModel * normal));
   vcol = colour;
   gl_PointSize = 1.00000;
}
