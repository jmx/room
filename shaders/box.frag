#ifdef GL_ES
precision mediump float;
#endif

uniform vec4 tint;
const int MAX_LIGHTS = 128;
uniform int numLights;
uniform vec3 lightPosition[2];
uniform vec3 lightColor;
uniform sampler2D samplerUniform;

// varying vec3 vcol;
varying vec3 vnormal;
varying vec3 vposition;
varying vec2 vtex0;

void main() {
	// already normailzed?
	vec3 norm = normalize(vnormal);
	vec3 lightEffect = vec3(0.0, 0.0, 0.0);

	for (int i = 0; i < MAX_LIGHTS; i++) {
		if (i >= numLights) break;
		vec3 lightDirection = normalize(lightPosition[i] - vposition);
		float nDotL = max(dot(lightDirection, norm), 0.0);
		lightEffect += nDotL;
	}
	vec3 diffuse = lightEffect * vec3(texture2D(samplerUniform, vec2(vtex0.s, vtex0.t)));
	// vec3 diffuse = lightEffect * vcol.rgb;
	gl_FragColor = vec4(diffuse.r, diffuse.g, diffuse.b, 1.0);
}
