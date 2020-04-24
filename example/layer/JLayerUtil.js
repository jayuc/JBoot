/**
 *
 * Created by 余杰 on 2020/3/19 9:12
 */

;(function (JBoot) {

    // 引入类
    const JLayerResult = JBoot.getClass('JLayerResult');

    const JLayerUtil = {
        handleResultByResult: function (result) {
            let jResult = new JLayerResult();
            if(result && result.result){
                let re = result.result;
                if(typeof re.total === 'number' && re.total > 0){
                    jResult.total = re.total;
                }
                if(re.rows instanceof Array && re.rows.length > 0){
                    jResult.list = re.rows;
                }
            }
            return jResult;
        },
        handleResultByList: function (result) {
            let jResult = new JLayerResult();
            if(result instanceof Array && result.length > 0){
                jResult.set(result.length, result);
            }
            return jResult;
        },
        defaultDataWktHandler: function (data, wktFieldName) {
            if(data){
                return data[wktFieldName];
            }
            return null;
        },
        numberDataWktHandler: function (data, wktFieldName, lonFieldName, latFieldName) {
            return 'Point(' + data[lonFieldName] + ' ' + data[latFieldName] + ')';
        }
    };

    JBoot.setClass('JLayerUtil', JLayerUtil);

})(JBoot);