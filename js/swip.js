/**
 * Created by vtm2k7 on 16/8/24.
 */
(function ($) {
    $.fn.extend({
        swip_config: {},
        startX: 0,
        startY: 0,
        transX: 0,
        transY: 0,
        lastX: 0,
        lastY: 0,
        currentX: 0,
        currentY: 0,
        s_touches: [],
        originTouchPos: {x: 0, y: 0},
        oldTouchPos: {x: 0, y: 0},
        newTouchPos: {x: 0, y: 0},
        firstDir: "",
        originTime: 0,
        oldTime: 0,
        newTime: 0,
        dx: 0,
        dy: 0,
        ax: 0,
        ay: 0,
        time: 0,
        cbf: null,
        addHandler: function (obj, type, fn) {
            if (obj && obj.attachEvent) {
                obj.attachEvent('on' + type, fn);
            } else if (obj.addEventListener) {
                obj.addEventListener(type, fn, false);
            } else {
                obj["on" + type] = fn;
            }
        },
        bind_fn: function (obj, fn) {
            return function () {
                fn.apply(obj, arguments);
            }
        },
        swip: function (config) {
            $(this).addClass("swip");
            this.swip_config = config;
            this.addHandler($(this)[0], "touchstart", this.bind_fn(this, this.touch_start));
            this.addHandler($(this)[0], "touchmove", this.bind_fn(this, this.touch_move));
            this.addHandler($(this)[0], "touchend", this.bind_fn(this, this.touch_end));
            return $(this);
        },
        multi_touch: function (config) {

        },
        getAvePos: function () {
            if (!event.touches.length) {
                return false;
            }
            var pos = false;
            var totalX = 0;
            var totalY = 0;
            var totalCount = event.touches.length;
            for (var i = 0; i < totalCount; i++) {
                totalX += event.touches[i].pageX;
                totalY += event.touches[i].pageY;
            }
            return {x: totalX / totalCount, y: totalY / totalCount}
        },
        touch_click: function (callback) {
            //模拟点击
            var that = this;
            this.swip({
                start: function () {
                    callback.apply(that, arguments);
                }
            });
            //return $(this);
        },
        touch_start: function (e) {
            if (!event.touches.length) return;
            var touch = event.touches[0];
            this.startX = touch.pageX;
            this.startY = touch.pageY;
            this.transX = 0;
            this.transY = 0;
            // console.log(this.swip_config)
            if (this.swip_config.start != null)this.swip_config.start(this.startX, this.startY);
            event.preventDefault();
        },
        touch_move: function (e) {
            if (!event.touches.length) return;
            var touch = event.touches[0];
            this.currentX = touch.pageX;
            this.currentY = touch.pageY;

            var bx = false, by = false;
            if (this.currentX > this.lastX) {
                bx = true;
            }
            if (this.currentY > this.lastY) {
                by = true;
            }

            this.transX = this.startX - touch.pageX;
            this.transY = this.startY - touch.pageY;

            if (this.swip_config.moving != null)this.swip_config.moving(this.transX, this.transY, bx, by);
            if (this.swip_config.currentPos != null)this.swip_config.currentPos(this.currentX, this.currentY);

            this.lastX = this.currentX;
            this.lastY = this.currentY;

            if (this.swip_config.relativeMove != null)this.swip_config.relativeMove(bx, by);

            e.preventDefault();
        },
        touch_end: function () {
            if (!$(this).hasClass("swip"))return;
            var absX = Math.abs(this.transX);
            var absY = Math.abs(this.transY);
            if (absX > 3 && absX > absY) {
                if (this.transX < 0) {
                    if (this.swip_config.right != null)this.swip_config.right.apply(this, arguments);
                } else {
                    if (this.swip_config.left != null)this.swip_config.left.apply(this, arguments);
                }
            } else if (absY > 3 && absY > absX) {
                if (this.transY < 0) {
                    if (this.swip_config.bottom != null)this.swip_config.bottom.apply(this, arguments);
                } else {
                    if (this.swip_config.top != null)this.swip_config.top.apply(this, arguments);
                }
            }
            if (this.swip_config.speed != null)this.swip_config.speed(this.transX, this.transY, this);
        },
        drag: function (cbf) {
            this.cbf = cbf;
            this.addHandler($(this)[0], "touchstart", this.bind_fn(this, this.drag_start));
            this.addHandler($(this)[0], "touchmove", this.bind_fn(this, this.drag_move));
            this.addHandler($(this)[0], "touchend", this.bind_fn(this, this.drag_end));
            return $(this);
        },
        drag_start: function (e) {
            this.firstDir = "";
            t = e.changedTouches[0];
            this.originTouchPos.x = this.oldTouchPos.x = this.newTouchPos.x = t.clientX;
            this.originTouchPos.y = this.oldTouchPos.y = this.newTouchPos.y = t.clientY;
            this.originTime = this.oldTime = this.newTime = Date.now();
            this.dx = this.dy = this.ax = this.ay = 0;
            event.preventDefault();
        },
        drag_move: function (e) {
            t = e.changedTouches[0];
            this.newTouchPos.x = t.clientX;
            this.newTouchPos.y = t.clientY;
            this.newTime = Date.now();
            this.checkGesture();
            this.oldTouchPos.x = this.newTouchPos.x;
            this.oldTouchPos.y = this.newTouchPos.y;
            this.oldTime = this.newTime;

            e.preventDefault();
        },
        drag_end: function () {
            this.newTime = Date.now();
            var t = (this.newTime - this.oldTime) / 1e3;
            this.cbf({
                done: true,
                dx: this.dx,
                dy: this.dy,
                ax: 2 * this.time > t ? this.ax : 0,
                ay: 2 * this.time > t ? this.ay : 0,
                dir: this.firstDir
            });
        },
        checkGesture: function () {
            this.dx = this.fixed2(this.newTouchPos.x - this.originTouchPos.x);
            this.dy = this.fixed2(this.newTouchPos.y - this.originTouchPos.y);
            this.ax = this.fixed2(this.newTouchPos.x - this.oldTouchPos.x);
            this.ay = this.fixed2(this.newTouchPos.y - this.oldTouchPos.y);
            this.time = (this.newTime - this.oldTime) / 1e3;
            if ("" == this.firstDir) {
                if (Math.abs(this.ax) > Math.abs(this.ay)) {
                    this.firstDir = "x"
                } else {
                    if (Math.abs(this.ax) < Math.abs(this.ay)) {
                        this.firstDir = "y";
                    }
                }
            }
            this.cbf({
                done: false,
                dx: this.dx,
                dy: this.dy,
                ax: this.ax,
                ay: this.ay,
                dir: this.firstDir
            })
        },
        fixed2: function (t) {
            return Math.floor(100 * t) / 100;
        }
    });
})(jQuery);