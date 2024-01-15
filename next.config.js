/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = {
    webpack: (config, options) => {
      config.module.rules.push({
          test: /\.csv$/,
          loader: 'csv-loader',
          options: {
            dynamicTyping: false,
            header: false,
            skipEmptyLines: true
          }
        })
  
      return config
    }
  }