module.exports = {
    entry: __dirname + '/lib/index.js',
    output: {
         path: __dirname + '/build',
         filename: 'efktr-body.js',
         libraryTarget: 'var',
         library: 'EfktrBody'
    }
 };