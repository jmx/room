#extension GL_OES_standard_derivatives : enable
precision highp float;

#pragma glslify: toLinear = require('glsl-gamma/in')
#pragma glslify: toGamma  = require('glsl-gamma/out')
#pragma glslify: perturb = require('glsl-perturb-normal')

vec4 textureLinear(sampler2D uTex, vec2 uv) {
	return toLinear(texture2D(uTex, uv));
}

uniform vec4 tint;
const int MAX_LIGHTS = 128;
uniform int numLights;
uniform vec3 lightPosition[2];
uniform vec3 lightColor;
uniform sampler2D diffuseSampler;
uniform sampler2D normalSampler;

// varying vec3 vcol;
varying vec3 vnormal;
varying vec3 vposition;
varying vec2 vtex0;

void main() {
	// already normailzed?
	vec2 uv = vec2(vtex0.s, vtex0.t);
	// vec3 normalMap = texture2D(normalSampler, uv) * 2.0 - 1.0;
	vec3 norm = normalize(vnormal);
	vec3 lightEffect = vec3(0.0, 0.0, 0.0);
	vec4 diffuseColor = textureLinear(diffuseSampler, uv);

	vec3 normalMap = vec3(textureLinear(normalSampler, uv) * 2.0 - 1.0);
	// some normal maps invert green?
	normalMap.g *= -1.0;

	vec3 V = normalize(vposition);
	vec3 N = perturb(normalMap, norm, -V, vtex0);

	for (int i = 0; i < MAX_LIGHTS; i++) {
		if (i >= numLights) break;
		vec3 lightDirection = normalize(lightPosition[i] - vposition);
		float nDotL = max(dot(lightDirection, N), 0.0);
		lightEffect += nDotL;
	}
	vec3 diffuse = lightEffect * vec3(diffuseColor);
	// vec3 diffuse = lightEffect * vcol.rgb;
	gl_FragColor.rgb = toGamma(diffuse);
	gl_FragColor.a = 1.0;
}
