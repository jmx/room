#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vcol;
uniform vec4 tint;

void main() {
   gl_FragColor = vec4(vcol, 1.0);
}