const reader = require('../src/parser/lexer');
const lexer = reader.lexer;
const TOKENS = reader.TOKENS;
let input = new lexer(`
<html>
{{[id]:helper()}}
{{>myblock}}
{{stuff | filter | otherfilter('stuff')}}
{{=options.stuff + options.otherstuff}}
</html>
`);
let token = null;
while(token = input.next()) {
    if(token[0] === TOKENS.T_EOF) break;
    console.log(token);
}
