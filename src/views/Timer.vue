<template>
    <div class="timer">
        <v-navigation-drawer
                absolute
                right
                stateless
                v-model="navOpen"
                width="200"
                :mini-variant="false"
        >
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title>
                        <v-text-field
                                v-model="customTime"
                                color="green darken-2"
                                dense
                                clearable
                                outlined
                                hide-details
                                @blur="clearCustomTime"
                        ></v-text-field>
                        <v-btn
                                class="mt-2 mb-5"
                                @click="startCustom"
                                block
                                outlined
                                tile
                                color="green darken-2"
                        >Start</v-btn>
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title>
                        <v-btn
                                @click="triggerTimer(5)"
                                block
                                outlined
                                tile
                                color="blue darken-2"
                        >5</v-btn>
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title>
                        <v-btn
                                @click="triggerTimer(25)"
                                block
                                outlined
                                tile
                                color="green darken-2"
                        >25</v-btn>
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title>
                        <v-btn
                                @click="triggerTimer(30)"
                                block
                                outlined
                                tile
                                color="blue darken-2"
                        >30</v-btn>
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-divider></v-divider>

            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title>
                        <v-badge
                                v-for="marker in markers"
                                color="pink"
                                dot
                                inline
                        />

                        <v-btn
                                v-if="markers > 0"
                                @click="restartMarkers"
                                block
                                outlined
                                tile
                                color="orange accent-3"
                        >Reset markers</v-btn>
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>


        </v-navigation-drawer>
        <v-btn
                color="red darken-2"
                absolute
                outlined
                bottom
                right
                tile
                @click="stopTimer"
        >Stop</v-btn>
        <Timer :size="timerSize" />
        <v-btn
                :color="muteColor"
                text
                absolute
                icon
                bottom
                left
                @click="muted = !muted"
        >
            <v-icon>{{muteIcon}}</v-icon>
        </v-btn>
    </div>
</template>

<script>
    // @ is an alias to /src
    import Timer from "@/components/Timer.vue";

    export default {
        name: "Home",
        components: {
            Timer
        },
        computed: {
            muteIcon() {
                if (this.muted) {
                    return "mdi-volume-variant-off";
                }
                return "mdi-volume-high";
            },
            muteColor() {
                if (this.navOpen) {
                    return "grey darken-2";
                }
                return "grey lighten-1";
            }
        },
        data() {
            return {
                timerSize: 0,
                customTime: 0,
                markers: 0,
                navOpen: true,
                muted: true,
                ringingSound: null,
            }
        },
        methods: {
            clearCustomTime() {
                if (isNaN(this.customTime) || !this.customTime) {
                    this.customTime = 0;
                }
            },
            startCustom() {
                this.triggerTimer(this.customTime);
            },
            triggerTimer(time) {
                this.$bus=['start-timer', time];
            },
            stopTimer() {
                this.$bus=['stop-timer'];
            },
            timerStopped() {
                // this.markers++;
                this.playFinishedSound();
                this.navOpen = true;
            },
            timerStarted() {
                this.navOpen = false;
            },
            restartMarkers() {
                this.markers = 0;
            },
            setTimerSize() {
                let height = window.innerHeight;
                let width = window.innerWidth;

                this.timerSize = height > width ? width : height;
            },
            playFinishedSound() {
                if (this.ringingSound && !this.muted) {
                    this.ringingSound.play();
                }
            },
        },
        mounted() {
            this.ringingSound = new Audio(require("@/assets/timer-finish-ring.mp3"));
            this.restartMarkers();
            this.setTimerSize();
        },
        created() {
            window.addEventListener("resize", this.setTimerSize);
        },
        beforeDestroy() {
            window.removeEventListener("resize", this.setTimerSize);
        },
        $bus: {
            'clock-started'() {
                this.timerStarted();
            },
            'clock-stopped'() {
                this.timerStopped();
            },
        }
    };
</script>