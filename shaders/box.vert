attribute vec3 position;
attribute vec3 colour;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
varying vec3 fred;

void main() {
   gl_Position = projection * view * model * vec4(position, 1.0);
   fred = colour;
   gl_PointSize = 1.00000;
}
