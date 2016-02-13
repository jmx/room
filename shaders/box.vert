attribute vec3 position;
// attribute vec3 colour;
attribute vec4 normal;
attribute vec2 uvs;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 invModel;

// point light(s)
varying vec3 vcol;
varying vec3 vnormal;
varying vec3 vposition;
varying vec2 vtex0;

void main() {
   vposition = vec3(model * vec4(position, 1.0));
   vnormal = normalize(vec3(invModel * normal));
   vtex0 = uvs;
   gl_PointSize = 1.00000;
   gl_Position = projection * view * model * vec4(position, 1.0);
}
