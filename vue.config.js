module.exports = {
    "publicPath": "/",
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