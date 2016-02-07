attribute vec3 position;
attribute vec3 colour;
attribute vec4 normal;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

// diffuse scene light
uniform vec3 lightColor;
uniform vec3 lightDirection;

// point light(s)
uniform vec3 lightPosition;


varying vec3 vcol;

void main() {
   gl_Position = projection * view * model * vec4(position, 1.0);

   vec4 vertexPosition = model * vec4(position, 1.0);
   vec3 pointLightDirection = normalize(lightPosition - vec3(vertexPosition));
   // Ensure the length of the normal is 1.0 (should already be?)
   vec3 norm = normalize(vec3(normal));
   float nDotL = max(dot(pointLightDirection, norm), 0.0);
   vec3 diffuse = lightColor * colour * nDotL;



   vcol = diffuse;
   gl_PointSize = 1.00000;
}
