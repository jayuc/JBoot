/**
 * 加载地图相关的js
 * Created by 余杰 on 2020/3/18 11:59
 */

;(function () {

    const rootSrc = "public/map/";

    const filePaths = [
        {className: 'JLayerResult', path: 'layer/JLayerResult.js'},
        {className: 'JLayerUtil', path: 'layer/JLayerUtil.js'},
        {className: 'JLayer', path: 'layer/JLayer.js'},
        {className: 'JDeviceLayer', path: 'layer/JDeviceLayer.js'},
        {className: 'JTileLayer', path: 'layer/JTileLayer.js'}
    ];

    for(let index in filePaths){
        let file = filePaths[index];
        if(typeof file === 'object'){
            file.path = rootSrc + file.path;
        }
    }

    JBoot.loadClassBySort(filePaths);

})();