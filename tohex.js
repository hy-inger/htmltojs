#!/usr/bin/env node
var readfile=require("fs"),
        path = process.cwd(),                     // 获取执行该命令的文件路径
        arguments = process.argv,           // 获取该命令参数，第一个为node，第二个为命令的脚本文件，第三个起即为自定义参数。
        input = arguments[2],
        writefile = arguments[3] || 'htmltojs.html';

var content = readfile.readFileSync(path+'/'+input,"utf-8");          // 同步读取文件
var output = obfuscate(content);                                                      // 对文件进行混淆
readfile.writeFile(path+'/'+writefile,output);                                  // 输出结果至指定文件


/* 
** 获取每个字符的ASCII值(charcode)，随机生成一个偏移量(offset)，返回该ASCII值+偏移量(offset_code)的十六进制数据。
*/
function scramble(inputString){
    var outputString = '';
    var offset_ary = [];
    for (i=0; i < inputString.length; i++){
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
    return {
        outputString:outputString,
        offset_ary:offset_ary,
    };
}
/* 字符转实体代码 */                
function string2EntityCode(str){
    if (str!="") {
        var result = "";
        var charCode = "";
        for(i=0; i < str.length; i++) {
            charCode = str.charCodeAt(i);
            result += "&#" + charCode + ";";
        }
        return result;
    }
}

function displayOutput(jsOutput, offset_ary){
    formattedOutput = "<sc" + "ript type=\'text/javascript\'>\n" +
                      "<!--\n" +
                      "var s=\"" +  jsOutput + "\",\n" + 
                      "m=\"\",\n " +
                      "offset_ary =  ["+ offset_ary+
                      "];console.log(s.length,offset_ary.length);\n" + 
                      "for (i=0,j=0; i<s.length,j<offset_ary.length;j++, i = i+2) {" +
                      " var offset = offset_ary[j]," +
                      " hex = s[i] + s[i+1]," + 
                      " charcode = parseInt(hex,16);" +  
                      " m+=String.fromCharCode(charcode - offset);" +
                      "}" +
                      "document.write(m);" +
                      "//-->\n" +
                      "</s" + "cript>\n";
                      
    return formattedOutput;                 
}

function obfuscate(input){
    var jsOutput = scramble(input);
    var htmlOutput = string2EntityCode(input);
    var formattedOutput = displayOutput(jsOutput.outputString, jsOutput.offset_ary);
    return formattedOutput;
}
