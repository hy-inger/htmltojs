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
** 获取每个字符的ASCII值(charcode)，随机生成一个偏移量(offset)，返回该ASCII值+偏移量(offset_code)的字符。
** 单引号'的ASCII值为39，双引号"的ASCII值为34，反斜杠\的ASCII的值为92。
** 因此为了避免冲突，将ASCII值为38(&)、33(!)、92(\)的字符转为其他符号。
** 28为FS，文件分隔符。23为ETB，结束传输块。16为SO，关闭切换。
*/
function scramble(inputString){
    var outputString = '';
    var offset_ary = [];
    for (i=0; i < inputString.length; i++){
        charcode = inputString.charCodeAt(i),
        offset = parseInt(Math.random()*(256-123)+123),          // 忽略前123个ASCII码。其中包括字母，换行符、回车符、反斜杠、单引号、双引号特殊字符等。
        offset_code = charcode + offset;
        /*if(offset_code == 39){
            offset_code = 28;
        } else if (offset_code == 34){
            offset_code = 23;
        } else if (offset_code == 92){
            offset_code = 16;
        }*/
        outputString += String.fromCharCode(offset_code);
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
                      "];\n" + 
                      "for (i=0; i<s.length; i++) {" +
                      " var offset = offset_ary[i]," +
                      " charcode = s.charCodeAt(i);" +  
                      /*" if(charcode == 28){" +
                      "   charcode = 39;" +
                      " } else if (charcode == 23) {" + 
                      "   charcode = 34;" +
                      " } else if (charcode == 16) {" +
                      "   charcode = 92;}" +*/
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
