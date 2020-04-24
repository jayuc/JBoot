/**
 * 瓦片类型图层
 * Created by 余杰 on 2020/4/10 9:38
 */

;(function (JBoot) {

    JBoot.Class({

        // 类名字
        CLASS_NAME: 'JTileLayer',

        // 真实的 openlayer 图层对象
        layer: null,

        layerName: null,

        // 图层参数
        layerOptions: null,

        mapWrapper: null,

        // 图层是否处于选中状态
        selected: false,

        // 类方法
        initialize: function (options) {

            JBoot.setPropertiesIfNeed(this, options, [
                {name: 'layerName'},                      // 图层名称
                {name: 'mapWrapper', required: true},     // 地图包装对象
                {name: 'layer', required: true},
                {name: 'layerOptions'},
                {name: 'selected'}
            ]);

        },

        // 操作图层，
        // status 为 true 打开图层，  为 false 关闭图层
        select: function (status) {
            if(status){
                if(!this.selected){
                    this.mapWrapper.addLayer(this.layer, this.layerOptions);
                    this.selected = true;
                }
            }else {
                if(this.selected){
                    this.mapWrapper.removeLayer(this.layer);
                    this.selected = false;
                }
            }
        }

    });

})(JBoot);