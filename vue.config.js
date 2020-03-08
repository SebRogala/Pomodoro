module.exports = {
    "publicPath": "/timer",
    "transpileDependencies": [
        "vuetify"
    ],
    pwa: {
        workboxOptions: {
            skipWaiting: true,
            clientsClaim: true,
        }
    }
}