<template>
    <div class="timer-wrapper">
        <canvas id="canvas" :width="size" :height="size" ></canvas>
        <img class="timer__background" :width="size" :src="require('@/assets/timer-background-960.png')">
    </div>
</template>

<script>
    import { DateTime, Interval } from "luxon";

    export default {
        name: "Timer",
        props: {
            size: Number | String
        },
        data() {
            return {
                minutes: 0,
                timerIsOn: false,
                canvas: null,
                ctx: null,
                endTime: null,
                intervalId: 0,
                constantsColor: "#000000",
                strokeColor: "#950703"
            }
        },
        computed: {
            lineWidth() {
                return (this.size / 2) - this.size * 0.115;
            }
        },
        methods: {
            runClock() {
                this.timerIsOn = true;
                this.endTime = DateTime.local().plus({minutes: this.minutes});
                this.intervalId = setInterval(this.renderTime, 300);
                this.$bus = ['clock-started'];
            },
            stopClock() {
                this.timerIsOn = false;
                clearInterval(this.intervalId);
                this.$bus = ['clock-stopped'];
            },
            renderConstants() {
                this.ctx.strokeStyle = this.constantsColor;

                this.ctx.lineWidth = 10;
                this.ctx.beginPath();
                this.ctx.arc(this.size / 2, this.size / 2, 5, this.degToRad(0), this.degToRad(360));
                this.ctx.stroke();
            },
            renderTime(){
                let interval = Interval.fromDateTimes(DateTime.local(), this.endTime);
                let mils = interval.length("milliseconds");

                if (isNaN(mils)) {
                    this.stopClock();
                }

                let min = interval.length("minutes");

                this.ctx.fillStyle = 'white';
                this.ctx.fillRect(0, 0, this.size, this.size);

                this.ctx.lineWidth = this.lineWidth;
                this.ctx.strokeStyle = this.strokeColor;
                //Minutes
                this.ctx.beginPath();
                // this.ctx.arc(250,250,170, degToRad(270), degToRad((smoothmin*6)-90));
                this.ctx.arc(this.size / 2, this.size / 2, this.lineWidth / 2, this.degToRad(-(min * 6) - 90), this.degToRad(-90));
                this.ctx.stroke();
                //Date

                this.renderConstants();

            },
            degToRad(degree){
                var factor = Math.PI/180;
                return degree*factor;
            }
        },
        mounted() {
            this.canvas = document.getElementById("canvas");
            this.ctx = this.canvas.getContext("2d");

            // this.ctx.shadowBlur= 10;
            // this.ctx.shadowColor = this.strokeColor;

            this.endTime = DateTime.local();
            this.renderTime();
        },
        $bus: {
            'start-timer'(minutes) {
                this.minutes = minutes;
                this.runClock();
            },
            'stop-timer'() {
                this.stopClock();
            }
        }
    }


</script>

<style lang="scss" scoped>
    .timer-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    #canvas {
        display: block;
    }

    .timer__background {
        position: absolute;
    }
</style>