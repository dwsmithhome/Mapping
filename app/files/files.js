
'use strict';

var fs = require('fs');
module.exports = {

deleteFile: function(filePath)
{
  fs.unlink(filePath,function(err){
    console.log(err);
  });
},

createUploadFolder: function(directory, type)
{
  if (!fs.existsSync(directory + '/public/' + type + '/')){
    fs.mkdirSync(directory + '/public/' + type + '/');
}
},

deleteUploadFolder: function(directory, type)
{
  if (fs.existsSync(directory + '/files/' + type)){
    fs.rmdirSync(directory + '/files/' + type);
}
},
};
