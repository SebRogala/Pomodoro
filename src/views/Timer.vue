<template>
    <div class="timer">
        <v-navigation-drawer
                permanent
                absolute
                right
                stateless
                :mini-variant="miniVariant"
                mini-variant-width="100"

        >
            <v-list-item v-show="false">
                <v-list-item-content>
                    <v-list-item-title>Application</v-list-item-title>
                    <v-list-item-subtitle>Subtext</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
            <v-list-item>
                <v-list-item-icon />

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
                <v-list-item-icon />

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
                <v-list-item-icon />

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

            <v-list-item>
                <v-list-item-icon />

                <v-list-item-content>
                    <v-list-item-title>
                        <v-text-field
                                class="mb-2 mt-5"
                                v-model="customTime"
                                color="green darken-2"
                                dense
                                clearable
                                outlined
                                hide-details
                                @blur="clearCustomTime"
                        ></v-text-field>
                        <v-btn
                                @click="startCustom"
                                block
                                outlined
                                tile
                                color="green darken-2"
                        >Start</v-btn>
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>

            <v-divider></v-divider>

            <v-list-item>
                <v-list-item-icon />

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


            <template v-slot:append>
                <div class="pa-2" v-show="miniVariant">
                    <v-btn
                            @click="stopTimer"
                            block
                            outlined
                            tile
                            color="red darken-2"
                    >Stop</v-btn>
                    <v-btn v-show="false" block @click="miniVariant = !miniVariant">
                        <v-icon>mdi-transfer-{{miniVariant ? "left" : "right"}}</v-icon>
                    </v-btn>
                </div>
            </template>
        </v-navigation-drawer>
        <Timer
        />
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
        data() {
            return {
                customTime: 0,
                markers: 0,
                miniVariant: false,
                items: [
                    {title: 'Dashboard', icon: 'mdi-view-dashboard'},
                    {title: 'Photos', icon: 'mdi-image'},
                    {title: 'About', icon: 'mdi-help-box'},
                ],
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
                this.miniVariant = false;
            },
            timerStarted() {
                this.miniVariant = true;
            },
            restartMarkers() {
                this.markers = 0;
            }
        },
        mounted() {
            this.restartMarkers()
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

<style lang="scss" scoped>

</style>