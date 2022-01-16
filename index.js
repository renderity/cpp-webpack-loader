const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const comment_parser = require('comment-parser');



module.exports = function WebpackLoader(source)
{
	const loader_options = this.loaders?.[this.loaderIndex]?.options || {};

	const [ parsed_comments ] =
		comment_parser
			.parse(source)
			.filter((comment) => comment.description.includes('@renderity/cpp-webpack-loader'));

	const options =
	{
		execute: null,
		target: null,
		watchDirectories: [],
		watchFiles: [],
	};

	Object.assign(options, loader_options);

	if (parsed_comments)
	{
		parsed_comments.tags.forEach
		(
			(tag) =>
			{
				switch (tag.name)
				{
				case 'execute':
				{
					options.execute = tag.description;

					break;
				}

				case 'target':
				{
					options.target = tag.description;

					break;
				}

				case 'watchDirectories':
				case 'watchFiles':

					options[tag.name].push
					(
						...JSON.parse(tag.description),
					);

					break;

				default:
				}
			},
		);
	}



	options.watchDirectories.forEach((elm) => this.addContextDependency(elm));

	options.watchFiles.forEach((elm) => this.addDependency(elm));

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
