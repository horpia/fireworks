const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
	entry: {
		fireworks: './src/index.ts',
		devtool: './src/devtool.ts',
		game1: './src/game1.ts',
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.hbs$/,
				exclude: /node_modules/,
				loader: 'handlebars-loader'
			},
			{
				test: /\.s[ac]ss$/i,
				exclude: /node_modules/,
				use: [
					"sass-to-string",
					{
						loader: "sass-loader",
						options: {
							sassOptions: {
								outputStyle: "compressed",
							},
						},
					},
				],
			},
		],
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{from: 'public', to: ''}
			],
		}),
	],
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'build'),
	},
	devServer: {
		allowedHosts: ['bs-local.com'],
		contentBase: __dirname + '/public',
		port: 10000
	}
};