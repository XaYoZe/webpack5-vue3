<!-- 日历组件 -->
<template>
    <div class="calendar">
        <div class="year">{{ curYear }}</div>
        <div class="month">
            <div class="month-prev" @click="changeMonth('-')"> &lt; </div>
            <div class="month-text">{{ monthList[curMonth - 1 ]}}</div>
            <div class="month-next" @click="changeMonth('+')"> &gt; </div>
        </div>
        <div class="week-list">
            <div class="week" v-for="week in weekList" :key="week">{{ week }}</div>
        </div>
        <div class="day-list">
            <div class="day" v-for="i in startWeek" :key="'null' + i">
                {{ new Date(dayList[0].startTimestamp * 1000 - 86400000).getDate() - (startWeek - i) }}
            </div>
            <div class="day" v-for="(day, i) in dayList" :key="'day' + i">
                <span v-if="isShow(day)" :class="{
                    isSignIn: isSignIn(day, 1),
                    unSignIn: isSignIn(day, 2),
                }" @click="clickDay(day)">{{ i + 1 }}</span>
            </div>
            <div class="day" v-for="i in (7 - (startWeek + dayList.length) % 7) % 7" :key="'null' + i">
                {{  i  }}
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'calendar',
    data() {
        return {
            monthList: ['Jan', 'Feb', 'Mar', 'Ari', 'May', 'Jun', 'Jul', 'Aut', 'Sep', 'Oct', 'Nov', 'Dec'],
            monthList: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            weekList: ['Mon', 'Tue', 'Wed', 'Thu', 'Fir', 'Sat', 'Sun'],
            weekList: ['一', '二', '三', '四', '五', '六', '日'],
            dateCache: {}, // 缓存时间对象
            show: true,
            curYear: 2022, // 单签展示的年份
            curMonth: 3, // 当前展示的月份
            startTime: 0, // 开始时间
            endTime: 0, // 结束时间
            signInList: [], // 已签到列表
            unSignInList: [], // 未签到日期
        };
    },
    computed: {
        // 选中的月份
        curSelectDate () {
            return this.getDateArr(`${this.curYear} ${this.curMonth}`)
        },
        // 开始时间
        startDate () {
            return this.getDateArr((this.startTime || -2209016202) * 1000);
        },
        // 结束时间
        endDate () {
            return this.getDateArr((this.endTime || 4102416000) * 1000);
        },
        // 当月有多少天
        dayList () {
            let dayLength = (this.nextMonthDate.dateObj - this.curSelectDate.dateObj) / 1000 / 24 / 60 / 60;
            let dayList = []
            for (let i = 0; i < dayLength; i++) {
                // ios Date对象日期必须用斜杆"/"拼接
                dayList.push(this.getDateArr(`${this.curYear}/${this.curMonth}/${i + 1}`));
            }
            return dayList;
        },
        // 当月1号是星期几
        startWeek () {
            // getDay星期天返回0
            return this.curSelectDate.dateObj.getDay() ? this.curSelectDate.dateObj.getDay() - 1 : 6;
        },
        // 下个月的年月
        nextMonthDate () {
            let afterMonth =  this.curMonth + 1;
            let month = afterMonth > 12 ? 1 : afterMonth;
            let year = afterMonth > 12 ? this.curYear + 1 : this.curYear;
            return this.getDateArr(`${year}/${month}/1`)
        },
        // 上个月的年月
        prevMonthDate () {
            let beforeMonth =  this.curMonth - 1;
            let month = beforeMonth < 1 ? 12 : beforeMonth;
            let year = beforeMonth < 1 ? this.curYear - 1 : this.curYear;
            return this.getDateArr(`${year}/${month}/1`)
        }
    },
    mounted() {
        let date = new Date()
        this.curYear = date.getFullYear();
        this.curMonth = date.getMonth() + 1;
        this.signInList.push(parseInt(date.getTime() / 1000));
        console.log(this.signInList);
    },
    methods: {
        // 生成时间对象
        getDateArr (time) {
            if (this.dateCache[time]) return this.dateCache[time]
            let date = new Date(time);
            this.dateCache[time] = {
                arr: [date.getFullYear(), date.getMonth() + 1, date.getDate()],
                endTimestamp: parseInt(date.getTime() / 1000 + 24 * 60 * 60 ),
                startTimestamp: parseInt(date.getTime() / 1000),
                dateObj: date
            }
            return this.dateCache[time];
        },
         // 点击日期
        clickDay (day) {
            console.log(day)
        },
        // 显示区间内日期
        isShow (day) {
            if (this.startDate.endTimestamp <= day.endTimestamp && this.endDate.endTimestamp >= day.endTimestamp) {
                return true
            }
            return false
        },
        // 判断是否已签到
        isSignIn (day, type) {
            if (type === 1) {
                return this.signInList.some(item => day.startTimestamp <= item && item < day.endTimestamp)
            } else if (type === 2) {
                return this.unSignInList.some(item => day.startTimestamp <= item && item < day.endTimestamp)
            }
            return false
        },
        // 改变月份
        changeMonth (type) {
            let [year, month] = type === '+' ? this.nextMonthDate.arr : this.prevMonthDate.arr;
            // console.log(year === this.endDate.arr[0], month > this.endDate.arr[1])
            if ((year === this.endDate.arr[0] && month > this.endDate.arr[1]) || year > this.endDate.arr[0]) return;
            if ((year === this.endDate.arr[0] && month < this.startDate.arr[1]) || year < this.startDate.arr[0]) return;
            this.curMonth = month;
            this.curYear= year;
        }
    },
};
</script>
<style lang="scss" scoped>
    .flexCenter {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .calendar {
        width: 471px;
        // height: 417px;
        user-select: none;
        background: #197e7a;
        margin: 20px auto 0;
        padding: 10px;
        .year {
          text-align: center;
          font-size: 36px;
          font-weight: bold;
          color: #58f1aa;
        }
        .month {
            @extend .flexCenter;
            margin-bottom: 20px;
            .month-prev, .month-next {
                width: 50px;
                height: 30px;
                text-align: center;
                line-height: 30px;
                font-size: 30px;
                color: #FFE372;
            }
            .month-next {
            }
            .month-text {
                line-height: 30px;
                width: 150px;
                height: 30px;
                font-size: 28px;
                text-align: center;
                color: #FFE372;
                font-weight: 600;
            }
        }
        .week-list {
            @extend .flexCenter;
            margin-bottom: 20px;
            .week {
                flex: 1;
                text-align: center;
                color: #FFE372;
                font-size: 24px;
            }
        }
        .day-list {
            display: flex;
            flex-wrap: wrap;
            .day {
                width: calc(100% / 7);
                margin-bottom: 5px;
                text-align: center;
                @extend .flexCenter;
                height: 56px;
                span {
                    @extend .flexCenter;
                    font-size: 24px;
                    color: #FEFCF3;
                    height: 56px;
                    width: 56px;
                    background: #a1a1a1;
                    &.isSignIn {
                        background: #58f1aa
                    }
                    &.unSignIn {
                        background: #fd8b94
                    }
                }
            }
        }
    }
    .sign-in-success {
        width: 264px;
        height: 60px;
        position: absolute;
        top: 101%;
        left: 50%;
        transform: translateX(-50%);
    }
</style>