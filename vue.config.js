module.exports = {
    "publicPath": "/timer",
    "transpileDependencies": [
        "vuetify"
    ],
    pwa: {
        name: "Pomodoro Timer",
        workboxOptions: {
            skipWaiting: true,
            clientsClaim: true,
        }
    }
}