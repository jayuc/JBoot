/**
 * 图层需要处理数据 的 实体
 * Created by 余杰 on 2020/3/19 9:27
 */

;(function (JBoot) {

    function JLayerResult() {
        this.total = 0;
        this.list = [];
    }
    JLayerResult.prototype = {
        set: function (total, list) {
            this.total = total;
            this.list = list;
        }
    };

    JBoot.setClass('JLayerResult', JLayerResult);

})(JBoot);