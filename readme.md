# htmltojs



## Usage

1、Install the module in a global environment.

```
npm install htmltojs -g;
```

2、Run the following cammand.
 
```
htmltojs input_file output_file [tag]
```

- `input_file`: the file that you want to confuse to, don't begin with '/', eg: `index.html`; `tpl/test.html`;
- `out_file`: the file that you want to output the results to,  if the params is empty, the results will output to the `current directory`(where you run the cammand) named `htmltojs.html`;
- `[tag]`: the tags that you want to conflicts only, tag of the same can't nest, or would cause error.


###history:

- 2016-12-28 Support for confusing specified tags

