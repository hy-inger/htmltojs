# htmltojs




> This is a tool that confise the HTML file or the tags of specified in the HTML file, and then compress the output file. The html minify use the [html-minifier](https://github.com/kangax/html-minifier)


## Usage

1、Install the module in a global environment.

```
npm install htmltojs -g;
```

2、Run the following cammand. If the array of label is empty, the whole file will be confused.
 
```
htmltojs -f input_file -o output_file [label1,label2]
```

- `-f input_file`:  `required`. The file that you want to confuse to.
    - Don't begin with '/', eg: `index.html`; `tpl/test.html`.
    - No matter where the parameter is placed, just with `-f`.


- `-o out_file`:  `optional`. The file that you want to output the results to.
    - If the params is empty, the results will output to the `current directory`(where you run the cammand) named `htmltojs.html`. 
    - No matter where the parameter is placed, just with `-o`.


- `[label]`:  `optional`. The labels that you want to conflicts only.
    - Label of the same can't nest, or would cause error.
    - Do not add attributes to the label.
    - The label  will be `removed` after operate.
    - No matter where the parameter is placed, as long as the format is an `array`.


### History:

- 2016-12-30-v0.6.x Use base64 for characters
- 2016-12-29-v0.5.x Support for minify html
- 2016-12-28-v0.4.x Support for confusing specified labels
- 2016-12-27-v0.3.x The character ACSII code value + random offset into hexadecimal numerical output
- 2016-12-23-v0.2.x Change the character to the ASCII value + 1 to the character to the random ASCII value character
- 2016-12-22-v0.1.x The character is converted to ASCII character value + 1 

