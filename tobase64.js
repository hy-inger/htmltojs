#!/usr/bin/env node
var readfile=require("fs"),
        minify = require('html-minifier').minify,           // 压缩html模块
        base64 = require('./lib/base64').base64,            // base64编码解码
        decode = require('./lib/base64').decode,            // base64解码
        path = process.cwd(),                     // 获取执行该命令的文件路径
        arguments = process.argv,           // 获取该命令参数，第一个为node，第二个为命令的脚本文件，第三个起即为自定义参数。
        input = arguments[arguments.indexOf('-f')+1],      // 输入文件
        tags = [],                                           // 对指定标签中的内容进行混淆
        writefile = arguments.indexOf('-o')>0?arguments[arguments.indexOf('-o')+1]:'htmltojs.html';                                      // 结果输出文件

for(var i=2,l=arguments.length;i<l;i++){
    var value = arguments[i];
    if(value && !!~value.indexOf('[')){                              // 指定标签以数组形式输入
        tags = value.substring(1,value.length-1).split(',');
    }
}

var self_closing = ['area','base','br','col','command','embed','hr','img','input','meta','param','source','track','wbr'];       // 自闭合标签
var content = readfile.readFileSync(path+'/'+input,"utf-8");          // 同步读取文件
var output = htmltojs(content);                                                      // 对文件进行混淆

output = minify(output,{                                                                    // 对数据进行压缩
    collapseBooleanAttributes:true,
    collapseWhitespace:true,
    decodeEntities:true,
    minifyCSS:true,
    minifyJS:true,
    processConditionalComments:true,
    removeComments:true,
    removeEmptyAttributes:true,
    removeOptionalTags:true,
    removeRedundantAttributes:true,
    removeScriptTypeAttributes:true,
    removeStyleLinkTypeAttributes:true,
    trimCustomFragments:true,
})
readfile.writeFile(path+'/'+writefile,output);                                  // 输出结果至指定文件



/* 对输入文件进行遍历查找标签，使用递归查找重复出现的标签 ，对标签内容进行替换。
** Attemtion！！同一类型标签嵌套替换出错。
** @params tag : 标签
** @params input : 输入文件内容
** @params output : 结果输出文件内容
 */
function scanInputString(tag,input,output){
    var tag_start_index = input.indexOf('<'+tag),
            tag_end_index;
    if(tag_start_index==-1){
        return output + input;
    }
    if(!!~(self_closing.indexOf(tag))){
        tag_end_index = input.indexOf('/>')  + 1;
    } else { 
        tag_end_index = input.indexOf('</'+tag+'>');
    }

    output += input.substring(0,tag_start_index);
    // 标签转换内容
    var result = base64.encode(input.substring(tag_start_index+tag.length+2,tag_end_index-1));

    var formatted_output = displayOutput(result,tag_start_index);
    output += formatted_output;

    var left_string  = input.substring(tag_end_index+tag.length+3,input.length);
    if(left_string.length){
        return scanInputString(tag,left_string,output);
    } else {
        return output;
    }

}

/* 将结果封装成script脚本输出 */
function displayOutput(jsOutput,id){
    formattedOutput = "<sc" + "ript type=\'text/javascript\' id=\'scr"+"ipt"+id+"\'>" +
                      "var b = "+decode+  
                      ",s=\"" +  jsOutput + "\"," +
                      "m= b(s);" + 
                      "document.write(m);" +
                      "var script= document.getElementById(\'script"+id+"\');"+
                      "script.parentNode.removeChild(script);"+
                      "</s" + "cript>";
                      
    return formattedOutput;                 
}

/* 
** 将字符进行Base64编码
*/
function htmltojs(inputString){
    var outputString = '';
    var offset_ary = [];
    var output
    if(tags.length){                                                            // 若指定标签，对指定标签内容进行转换。
        for(var j=0,jl=tags.length;j<jl;j++){
            var tag = tags[j];
            outputString = '';
            inputString = scanInputString(tag,inputString,outputString);
        }
        outputString = inputString;
    } else {                                                                    // 没有指定标签，对整个文档进行转换。
        var result = base64.encode(inputString);
        outputString = displayOutput(result,0);
    }
    return outputString;
}



