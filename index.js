const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');



module.exports = function WebpackLoader(source)
{
	const loader_options = this.loaders?.[this.loaderIndex]?.options || {};

	const source_options = JSON.parse(source);

	const options =
	{
		execute: null,
		target: null,
		watchFiles: [],
		watchDirectories: [],
	};

	Object.assign(options, loader_options, source_options);



	options.watchFiles.forEach((elm) => this.addDependency(elm));

	options.watchDirectories.forEach((elm) => this.addContextDependency(elm));

	if (options.execute)
	{
		console.log(execSync(`${ options.execute }`, { encoding: 'utf8' }));
	}



	const buffer =
		Array.prototype.slice.call
		(
			fs.readFileSync(path.resolve(options.target)),
		);

	const result = `/*eslint-disable*/ export default new Uint8Array([ ${ buffer } ]).buffer;`;

	return result;
};
