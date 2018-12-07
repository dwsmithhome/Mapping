const   _ =  require('lodash'),
        fs = require('fs');

module.exports = {
    version:    fs.readFileSync(__dirname + '/../../version').toString().trim(),
    port :      _.get(process, 'env.PORT') || 8082,
    restURL : 'http://elasticsearch_mapping:9200',
    outputPath: __dirname + '/../public/output',
    redisOptions: {
        host: 'mapping_redis'
    }
};
