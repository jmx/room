#ifdef GL_ES
precision mediump float;
#endif

uniform vec4 tint;
uniform vec3 lightPosition;
uniform vec3 lightColor;

varying vec3 vcol;
varying vec3 vnormal;
varying vec3 vposition;

void main() {
	// already normailzed?
	vec3 norm = normalize(vnormal);

	vec3 lightDirection = normalize(lightPosition - vposition);

	float nDotL = max(dot(lightDirection, norm), 0.0);
	vec3 diffuse = lightColor * vcol.rgb * nDotL;

   gl_FragColor = vec4(diffuse, 1.0);
}