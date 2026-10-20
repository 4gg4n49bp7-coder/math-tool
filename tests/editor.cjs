// Run: NODE_PATH=/path/to/node_modules node tests/editor.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8000');
 await page.getByText('準備完了',{exact:true}).waitFor();
 const value=()=>page.locator('#expr').evaluate(e=>e.getValue('latex'));
 const key=async(label)=>{await page.locator('#keys').getByRole('button',{name:label,exact:true}).tap();};
 const tab=async(label)=>{await page.getByRole('tab',{name:label,exact:true}).tap();};
 const clear=async()=>{await page.locator('#clear').tap();};
 await key('1');await key('2');await key('3');assert.equal(await value(),'123');
 await page.getByRole('button',{name:'左に移動',exact:true}).tap();await key('4');assert.equal(await value(),'1243');
 await page.getByRole('button',{name:'削除',exact:true}).tap();assert.equal(await value(),'123');
 await clear();await page.locator('#undo').tap();assert.equal(await value(),'123');await clear();
 await tab('数式');await key('a/b');await key('√');await tab('数字');await key('x');
 await page.getByRole('button',{name:'次の空欄',exact:true}).tap();await key('2');
 assert.match(await value(),/\\frac\{\\sqrt\{x\}\}\{2\}/);
 await clear();await key('x');await tab('数式');await key('xⁿ');await key('a/b');await tab('数字');await key('1');await key('+');await key('x');
 await page.getByRole('button',{name:'次の空欄',exact:true}).tap();await key('2');
 assert.match(await value(),/x\^\{\\frac\{1\+x\}\{2\}\}/);
 for(const symbol of ['∫','∑']){
  await clear();await tab('数式');await key(symbol);await key('a/b');await tab('数字');await key('1');
  await page.getByRole('button',{name:'次の空欄',exact:true}).tap();await key('2');
  await page.getByRole('button',{name:'次の空欄',exact:true}).tap();await key('x');await key('+');await key('1');
  await page.getByRole('button',{name:'次の空欄',exact:true}).tap();await key('x');
  const result=await value();assert.match(result,/\\frac(?:\{1\}\{2\}|12)/);assert.match(result,/x\+1/);assert.match(result,symbol==='∫'?/\\int/:/\\sum/);
 }
 await clear();await tab('文字');await key('A');await key('z');await tab('集合・論理');await key('∈');await key('ℝ');await key('⇒');await key('∀');assert.match(await value(),/Az.*\\in.*\\mathbb\{R\}.*\\Rightarrow.*\\forall/);
 // Force clipboard denial: Safari must offer selectable LaTeX when permission fails.
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied')}},configurable:true}));
 await page.locator('#copy').tap();assert.equal(await page.locator('details').getAttribute('open'),'');assert.equal(await page.locator('#latex').inputValue(),await value());
 await page.evaluate(()=>{window.copied='';Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.copied=text}},configurable:true});});
 await page.locator('#copy').tap();assert.equal(await page.evaluate(()=>window.copied),await value());
 for(const width of [320,390,430,844]){await page.setViewportSize({width,height:width===844?390:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
 assert.deepEqual(errors,[]);console.log('PASS: touch input, deletion, cursor, undo, nested fraction/root/exponent, editable integral/sum bounds, alphabet/logic, clipboard success/fallback, 320–844px layout; no JS errors');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
