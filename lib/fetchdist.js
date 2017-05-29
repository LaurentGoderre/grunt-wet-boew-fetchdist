var zlib = require('zlib');
var bower = require('requireg')('bower')
var request = require('request');
var tar = require('tar');

var getBuiltArtifact = function(dist, cb) {
	var repo = 'wet-boew/wet-boew-cdn',
		cdnBranch = 'v4.0-dist'
		getWetCommit = function(resolve) {
			bower.commands
				.list()
				.on('end', function (results) {
			    	resolve(results.dependencies['wet-boew'].pkgMeta._release);
				});
		},
		getWetCdnCommits = function(resolve, reject) {
			request({
				url: `https://api.github.com/repos/${repo}/commits?sha=${cdnBranch}`,
				headers: {
	        'User-Agent': 'npm request'
	      },
				json: true
			}, function(error, response, body) {
				if (error || body.message) {
					reject(error || body.message);
				}
				resolve(body);
			})
		},
		getArtifacts = function(artifactCommitId){
			request({
				url: `https://github.com/${repo}/archive/${artifactCommitId}.tar.gz`,
				endcoding: null
			})
				.pipe(zlib.Unzip())
				.pipe(tar.x({
					cwd: dist,
					strip: 1
				}))
				.on('close', cb);
		};

	Promise.all([
		new Promise(getWetCommit),
		new Promise(getWetCdnCommits)
	])
	.then(function(values) {
		var wetCommit = values[0],
			cdnCommits = values[1],
			c, commit;

		for (c = 0; c < cdnCommits.length; c++) {
			commit = cdnCommits[c];
			if (commit.commit.message.indexOf(`wet-boew/wet-boew#${wetCommit}`) !== -1) {
				return getArtifacts(commit.sha);
			}
		}

		cb(new Error(`Commit ${wetCommit} not found in recent commits`))
	})
	.catch(function(error) {
		cb(error);
	})
}

module.exports = {
	getBuiltArtifact: getBuiltArtifact
};
