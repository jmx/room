#ifdef GL_ES
precision mediump float;
#endif

uniform vec4 tint;
uniform vec3 lightPosition;
uniform vec3 lightColor;

varying vec3 vcol;
varying vec3 vnormal;
varying vec3 vposition;

// messing around with some functions from
// https://github.com/unconed/DarkSunrise/blob/master/shaders/advect.glsl.html
vec3 rainbow(vec3 rgb) {
  float c = rgb.x * 1.5;
  float c2 = c * c * 2.0;
  float ic = max(0.0, c2 * (1.0 - c2*c));
  float ic2 = max(0.0, c * (1.0 - c2));
  float ic3 = max(0.0, c * (1.0 - c));
  ic3 -= ic2 * .5;
  return 2.0 * vec3(ic2, ic, ic3);
}

vec3 cyber(vec3 rgb) {
  float c = rgb.x;
  float c2 = c * c;
  return vec3(c2 * c, c2 * 4.0, c);
}

vec3 edged(vec3 rgb) {
  float c = rgb.x * 32.0;
  float c2 = clamp(c - 23.5, 0.0, 1.0);
  float c3 = clamp(c - 7.5, 0.0, 1.0);
  float c4 = clamp(c - 3.5, 0.0, 1.0);
  return vec3(c2, mix(c2, c3, .25), mix(c3, c4, .5));
}

vec3 punk(vec3 rgb) {
  float c = rgb.x;
  float c2 = c * c;
  return vec3(c2 * 4.0, c2 * c, c - c2 * 1.5);
}

void main() {
	// already normailzed?
	vec3 norm = normalize(vnormal);

	vec3 lightDirection = normalize(lightPosition - vposition);

	float nDotL = max(dot(lightDirection, norm), 0.0);
	vec3 diffuse = lightColor * vcol.rgb * nDotL;

	// float r = smoothstep(0.1, 0.5, diffuse.r);

	// diffuse.r = r;
	// float bright = 0.33333 * (diffuse.r + diffuse.g + diffuse.b);
	// float b = mix(0.1, 0.8, step(0.2, bright));
	// gl_FragColor = vec4(vec3(b), 1.0);
	gl_FragColor = vec4(punk(diffuse.rgb), 1.0);
}