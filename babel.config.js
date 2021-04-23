module.exports = (api) => {
    api.cache(true)
    return {
        presets: [
            ['@babel/preset-env', { modules: false }],
            '@babel/preset-react'
        ],
        ignore: [
            'node_modules/**'
        ]
    }
}
