module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'EfktrBody',
      externals: {
        react: 'React'
      }
    }
  },
  webpack: {
      module: {
          rules: [
              {
                  test: /\.png$/,
                  loader: "url-loader",
                  query: {
                      mimetype: "image/png"
                  }
              }
          ]
      },
  }
}
