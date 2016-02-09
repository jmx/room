import createApp from "./app";

import glnow from "gl-now";
import each from "async-each";
import loadImage from "img";

// load our texture maps
let names = ['diffuse', 'normal', 'specular'];
let urls = names.map(x => {
	return `assets/brick-${x}.jpg`;
})

each(urls, loadImage, (err, images) => {
	if (err) 
		throw err;

	// create gl-now context
	let shell = glnow();

	// launch app once images are loaded
	createApp(shell, images);
	
});
 