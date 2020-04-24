/**
 * 设备图层
 * Created by 余杰 on 2020/3/24 10:56
 */

;(function (JBoot) {

    // 父类名称
    const parentClassName = 'JLayer';

    // 设备图层
    // 继承 自 图层类
    JBoot.inherit(parentClassName, {

        // 类名
        CLASS_NAME: 'JDeviceLayer',

        restUrl: 'device/deviceConfig/queryDeviceListByType',
        dataKey: 'deviceId',
        dataWktHandler: 'numberDataWktHandler',
        dataLonFieldName: 'longitude',
        dataLatFieldName: 'latitude',
        dataTitleFieldName: 'deviceName',
        resultHandler: 'handleResultByList',

        // 设备状态
        deviceStatus: '1',

        // 类方法
        initialize: function (_options) {

            // 执行父构造方法
            JBoot.parentConstructor(parentClassName, this, _options);

            // 批量设置属性，请使用这种方式
            JBoot.setPropertiesIfNeed(this, _options, [
                {name: 'deviceType', required: true},     // 设备类型
                {name: 'deviceStatus'}
            ]);

            this.restParam = {
                deviceType: this.deviceType
            };
            this.layerOverlayStyle = this.getOverlayStyle();

        },

        // 改变设备状态
        changeDeviceStatus: function (status) {
            this.deviceStatus = status;
        },

        // 获取样式
        getOverlayStyle: function () {
            return {
                imgUrl: 'themes/default/images/device/' + this.deviceType + '_' + this.deviceStatus + '.png',
                size: [20, 20]
            };
        }

    });

})(JBoot);