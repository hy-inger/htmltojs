#!/usr/bin/env node
var readfile=require("fs"),
        path = process.cwd(),                     // 获取执行该命令的文件路径
        arguments = process.argv,           // 获取该命令参数，第一个为node，第二个为命令的脚本文件，第三个起即为自定义参数。
        input = arguments[2],                   // 输入文件
        tags = [],                                           // 对指定标签中的内容进行混淆
        writefile = 'htmltojs.html';                                      // 结果输出文件

for(var i=3,l=arguments.length;i<l;i++){
    var value = arguments[i];
    if(value && !!~value.indexOf('[')){                              // 指定标签以数组形式输入
        tags = value.substring(1,value.length-1).split(',');
    } else {
        writefile = value || 'htmltojs.html';
    }
}

var self_closing = ['area','base','br','col','command','embed','hr','img','input','meta','param','source','track','wbr'];       // 自闭合标签
var content = readfile.readFileSync(path+'/'+input,"utf-8");          // 同步读取文件
var output = htmltojs(content);                                                      // 对文件进行混淆
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
        tag_end_index = input.indexOf('</'+tag+'>') + tag.length + 2;
    }
    output += input.substring(0,tag_start_index);
    // 标签转换内容
    var tag_output = '',offset_ary = [];
    for (var i=tag_start_index; i < tag_end_index+1; i++){
        charcode = input.charCodeAt(i),
        offset = parseInt(Math.random()*(126-charcode)),              // 随机生成的偏移量与字符ASCII值相加不超过126。
        offset_code = charcode + offset;

        var hex = offset_code.toString(16);
        if(hex.length<=1){
            hex = '0'+hex;                              // 补充十六进制数据为两位数
        }

        tag_output += hex;
        offset_ary.push(offset);                                        // 保存偏移量，用于对ASCII码值进行恢复。
    }
    var formatted_output = displayOutput(tag_output,offset_ary,tag_start_index);
    output += formatted_output;

    var left_string  = input.substring(tag_end_index+1,input.length);
    if(left_string.length){
        return scanInputString(tag,left_string,output);
    } else {
        return output;
    }

}
/* 
** 获取每个字符的ASCII值(charcode)，随机生成一个偏移量(offset)，返回该ASCII值+偏移量(offset_code)的十六进制数据。
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
        for (var i=0; i < inputString.length; i++){
            charcode = inputString.charCodeAt(i),
            offset = parseInt(Math.random()*(126-charcode)),              // 随机生成的偏移量与字符ASCII值相加不超过126。
            offset_code = charcode + offset;

            var hex = offset_code.toString(16);
            if(hex.length<=1){
                hex = '0'+hex;                              // 补充十六进制数据为两位数
            }

            outputString += hex;
            offset_ary.push(offset);                                        // 保存偏移量，用于对ASCII码值进行恢复。
        }
        outputString = displayOutput(outputString,offset_ary,0);
    }
    return outputString;
}

function displayOutput(jsOutput, offset_ary,id){
    formattedOutput = "<sc" + "ript type=\'text/javascript\' id=\'scr"+"ipt"+id+"\'>" +
                      "var s=\"" +  jsOutput + "\"," + 
                      "m=\"\", " +
                      "offset_ary =  ["+ offset_ary+
                      "];" + 
                      "for (i=0,j=0; i<s.length,j<offset_ary.length;j++, i = i+2) {" +
                      " var offset = offset_ary[j]," +
                      " hex = s[i] + s[i+1]," + 
                      " charcode = parseInt(hex,16);" +  
                      " m+=String.fromCharCode(charcode - offset);" +
                      "}" +
                      "document.write(m);" +
                      "var script= document.getElementById(\'script"+id+"\');"+
                      "script.parentNode.removeChild(script);"+
                      "</s" + "cript>";
                      
    return formattedOutput;                 
}

