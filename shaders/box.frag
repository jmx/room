#ifdef GL_ES
precision mediump float;
#endif

varying vec3 fred;
uniform vec4 tint;

void main() {
   gl_FragColor = vec4(fred, 1.0);
}