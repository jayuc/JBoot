/**
 *
 * 图层类
 * Created by 余杰 on 2020/3/18 10:09
 */

// 代码重构
;(function (JBoot) {

    // 引入类
    const JLayerUtil = JBoot.getClass('JLayerUtil');
    const JLayerResult = JBoot.getClass('JLayerResult');

    // 声名 图层 类
    JBoot.Class({

        // 图层名称
        layerName: null,

        // 加载之前执行
        onBeforeLoad: null,
        // 加载完成之后执行
        onLoad: null,

        // 请求方式
        restMethod: 'GET',
        // 是否懒加载
        lazyLoad: false,
        // 是否正在加载
        loading: false,
        // 是否完成加载
        loaded: false,
        // 图层是否处于选中状态
        selected: false,

        // 结果处理器
        resultHandler: 'handleResultByResult',
        // wkt 处理器
        dataWktHandler: 'defaultDataWktHandler',
        // 数据后置处理器，提供一个数据处理的 钩子
        dataAfterHandler: null,
        // 后置样式处理器
        layerOverlayStyleHandler: null,

        // 类方法
        initialize: function (_options) {

            let options = _options;
            this.options = options;

            // 批量设置属性
            JBoot.setPropertiesIfNeed(this, options, [
                {name: 'layerName'},                      // 图层名称
                {name: 'restUrl', required: true},        // 请求数据的接口
                {name: 'restMethod'},
                {name: 'restParam'},                      // 请求参数
                {name: 'lazyLoad'},
                {name: 'mapWrapper', required: true},     // 地图包装对象
                {name: '$scope', required: true},
                {name: 'onBeforeLoad'},
                {name: 'onLoad'},
                {name: 'dataKey', required: true},        // 数据主键 （必填）
                {name: 'dataTitleFieldName'},             // 数据名称 （非必填）
                {name: 'dataWktFieldName'},               // 数据 wkt 字段名 （非必填）
                {name: 'dataLonFieldName'},               // 经度字段名
                {name: 'dataLatFieldName'},               // 纬度字段名
                {name: 'layerOverlayStyle'},              // 图层中覆盖物样式 （非必填）
                {name: 'dataAfterHandler'},               // 数据后置处理器，提供一个数据处理的 钩子
                {name: 'layerOverlayStyleHandler'},       // 后置样式处理器
                {name: 'resultHandler', required: true},
                {name: 'dataWktHandler', required: true},
                {name: 'loading'},
                {name: 'loaded'},
                {name: 'selected'}
            ]);

            // 数据存储
            this.overlayList = [];                      // 所有覆盖物集合
            this.overlayMap = {};                       // 所有覆盖物 map 其中， key 是覆盖物 id
            this.dataMap = {};                          // 所有数据 map 其中， key 是数据 dataKey
            this.keyToOidMap = {};                      // 数据 dataKey 对 覆盖物 id 的 map, key是 dataKey, value 是覆盖物id
            this.oidToKeyMap = {};                      // 覆盖物 id 对 数据 dataKey 的 map, key是 覆盖物 id, value 是 dataKey

            this.init();
        },

        // 初始化之前执行
        beforeInit: function () {

            // 数据处理方法
            if(typeof this.resultHandler === 'string'){
                this.resultHandler = JLayerUtil[this.resultHandler];
            }

            // wkt handler
            if(typeof this.dataWktHandler === 'string'){
                this.dataWktHandler = JLayerUtil[this.dataWktHandler];
            }

        },
        // 初始化
        init: function () {

            // 执行前置方法
            this.beforeInit();

            if(this.lazyLoad){    // 懒加载
                this.afterRefresh();
            }else{
                this.refresh();
            }

        },
        // 操作图层，
        // status 为 true 打开图层，  为 false 关闭图层
        select: function (status) {
            let that = this;
            let finishSelect = function () {
                that.addAllOverlay();
                that.selected = true;
            };
            if(status){
                if(!this.selected){
                    if(this.loaded){
                        finishSelect();
                    }else {
                        this.refresh(finishSelect);
                    }
                }
            }else {
                if(this.selected){
                    this.removeAllOverlay();
                    this.selected = false;
                }
            }
        },
        // 通过主键获取覆盖物
        getOverLayByDataKey: function (dataKey) {
            let overlayId = this.keyToOidMap[dataKey];
            if(overlayId){
                return this.getOverLayById(overlayId);
            }
            return null;
        },
        // 通过覆盖物id 获取覆盖物
        getOverLayById: function (id) {
            return this.overlayMap[id];
        },
        // 返回结果必须为 Promise
        fetchData: function () {
            let that = this;
            return new Promise(function (resolve, reject) {
                that.$scope.$ajaxRequest({
                    url: that.$scope.$restRoot + that.restUrl,
                    method: that.restMethod,
                    params: that.restParam,
                    success: function (result) {
                        let jResult = that.resultHandler(result);
                        resolve(jResult);
                    },
                    fail: function (err) {
                        reject(err);
                    }
                });
            });
        },
        // 处理数据
        handleData: function (jResult) {
            if(jResult instanceof JLayerResult){

                let list = jResult.list;
                for(let i=0; i<list.length; i++){
                    let item = list[i];
                    let key = item[this.dataKey];
                    let wkt = this.dataWktHandler(item, this.dataWktFieldName, this.dataLonFieldName, this.dataLatFieldName);
                    let data = Object.assign(item, {title: item[this.dataTitleFieldName]});
                    let style = this.layerOverlayStyle;
                    if(typeof this.dataAfterHandler === 'function'){ // 数据处理的一个 钩子
                        data = this.dataAfterHandler(data);
                    }
                    if(typeof this.layerOverlayStyleHandler === 'function'){  // 样式处理的一个 钩子
                        style = this.layerOverlayStyleHandler(style, data);
                    }
                    let overlay = this.mapWrapper.createOverLayByWkt(wkt, this.layerName,
                        style, null, data);
                    if(overlay){
                        let overlayId = overlay.getId();
                        this.overlayList.push(overlay);
                        this.overlayMap[overlayId] = overlay;
                        this.dataMap[key] = data;
                        this.keyToOidMap[key] = overlayId;
                        this.oidToKeyMap[overlayId] = key;
                    }
                }

            }else {
                throw new Error('处理数据出错');
            }
        },
        // 添加图层所有覆盖物
        addAllOverlay: function () {
            this.mapWrapper.addOverLays(this.overlayList);
        },
        // 删除图层所有覆盖物
        removeAllOverlay: function () {
            this.mapWrapper.removeOverlays(this.overlayList);
        },
        // 初始化之前执行
        beforeRefresh: function () {

            if(typeof this.resultHandler !== 'function'){
                throw new Error('找不到合适的结果处理器');
            }

            if(typeof this.dataWktHandler !== 'function'){
                throw new Error('找不到合适的 wkt 处理器');
            }

            if(typeof this.onBeforeLoad === 'function'){
                this.onBeforeLoad(this);
            }

        },
        // 初始化完成之后执行
        afterRefresh: function () {
            if(typeof this.onLoad === 'function'){
                this.onLoad();
            }
        },
        refresh: function (callback) {

            // 如果已经完成加载，则不重复加载
            if(this.loaded){
                return;
            }

            if(!this.loading){

                // 正在加载数据
                this.openLoading();

                // 执行前置操作
                this.beforeRefresh();

                let that = this;
                // 第一步获取数据
                this.fetchData().then((jResult) => {

                    // 第二步处理数据
                    that.handleData(jResult);

                    // 第三步
                    if(typeof callback === 'function'){
                        callback();
                    }

                    // 关闭正在加载
                    that.closeLoading();

                    // 标识已经加载完成
                    that.loaded = true;

                    // 执行加载完毕后回调
                    that.afterRefresh();

                }, (error) => {
                    throw new Error('刷新图层数据出错， error: ' + error.message);
                });

            }else{
                console.warn('图层正在加载， layer name: ' + this.layerName);
            }

        },
        openLoading: function () {
            this.loading = true;
        },
        closeLoading: function () {
            this.loading = false;
        },


        // 类名字
        CLASS_NAME: 'JLayer'
    });

})(JBoot);