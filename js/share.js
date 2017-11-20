$.ajax({
    url: "http://www.adleading.com/authorize_new/share_sample.php",
    type: "GET",
    // cache: true,
    data: {u: window.location.href},
    dataType: "jsonp",
    success: function(back) {
        wx.config({
            debug: false,
            appId: back.appId,
            timestamp: back.timestamp,
            nonceStr: back.nonceStr,
            signature: back.signature,
            jsApiList: [
                // 所有要调用的 API 都要加到这个列表中
                'onMenuShareTimeline',
                'onMenuShareAppMessage'
            ]
        });
    },
    error: function() {

    }
});

wx.ready(function() {
    // 在这里调用 e
    wx.error(function(res) {
        //console.log(res)
    });
    //                wx.hideOptionMenu();
    addWeiXinEvent(0);
});
var addWeiXinEvent = function(index) {
    $.timelineTitle = "分手一年的前男友发来消息";
    $.shareAppDesc = "他居然想问我这个？！";
    $.shareAppTitle = "分手一年的前男友发来消息";
    $.shareUrl = window.location.href
    $.shareImage = "http://www.adleading.com/adleading_video/bestpay/images/share.png";
    wx.onMenuShareAppMessage({
        title: $.shareAppTitle,
        desc: $.shareAppDesc,
        link: $.shareUrl,
        imgUrl: $.shareImage,
        trigger: function(res) {

        },
        success: function(res) {
            //                        _smq.push(['custom', '17-baojun', '730newMB-share']);
        },
        cancel: function(res) {

        },
        fail: function(res) {

        }
    });
    wx.onMenuShareTimeline({
        title: $.timelineTitle,
        link: $.shareUrl,
        imgUrl: $.shareImage,
        trigger: function(res) {
        },
        success: function(res) {
            //                        _smq.push(['custom', '17-baojun', '730newMB-share']);
        },
        cancel: function(res) {

        },
        fail: function(res) {
        }
    });
};
