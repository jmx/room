// hax: glslify is a browserify transform and needs to be 'required'
const glslify = require("glslify");

export let entityVertexShader = glslify("./box.vert", 'utf8');
export let entityFragmentShader = glslify("./box.frag", 'utf8');
export let lightVertexShader = glslify("./light.vert", 'utf8');
export let lightFragmentShader = glslify("./light.frag", 'utf8');
