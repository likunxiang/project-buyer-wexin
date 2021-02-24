function time() {
    let time = Math.round(new Date().getTime() / 1000);
    return parseInt(time);
}

function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatData(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('-');
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function timestampToTime(timestamp) {
  var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = date.getDate() + ' ';
  var h = date.getHours() + ':';
  var m = date.getMinutes() + ':';
  var s = date.getSeconds();
  return Y + M + D + h + m + s;
}
function dateFormat(fmt, date) {
  let ret;
  let opt = {
    "Y+": date.getFullYear().toString(),        // 年
    "m+": (date.getMonth() + 1).toString(),     // 月
    "d+": date.getDate().toString(),            // 日
    "H+": date.getHours().toString(),           // 时
    "M+": date.getMinutes().toString(),         // 分
    "S+": date.getSeconds().toString()          // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    };
  };
  return fmt;
}

module.exports = {
    formatTime: formatTime,
    formatData: formatData,
    timestampToTime:timestampToTime,
    dateFormat:dateFormat,
    scene_decode: function(scene) {
        var _str = scene + "";
        var _str_list = _str.split(",");
        var res = {};
        for (var i in _str_list) {
            var _tmp_str = _str_list[i];
            var _tmp_str_list = _tmp_str.split(":");
            if (_tmp_str_list.length > 0 && _tmp_str_list[0]) {
                res[_tmp_str_list[0]] = _tmp_str_list[1] || null;
            }
        }
        return res;
    },
    time: time,

    objectToUrlParams: function(obj, urlencode) {
        let str = "";
        for (let key in obj) {
            str += "&" + key + "=" + (urlencode ? encodeURIComponent(obj[key]) : obj[key]);
        }
        return str.substr(1);
    },
    inArray: function(val, arr) {
        return arr.some(function(v) {
            return val === v;
        })
    },
    min: function(var1, var2) {
        var1 = parseFloat(var1);
        var2 = parseFloat(var2);
        return var1 > var2 ? var2 : var1;
    },

    max: function (var1, var2) {
        var1 = parseFloat(var1);
        var2 = parseFloat(var2);
        return var1 < var2 ? var2 : var1;
    },

};