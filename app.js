/* MathLive handles the expression tree, selection, deletion and undo history. */
(async () => {
  const field = document.getElementById('expr');
  const status = document.getElementById('status');
  if (!window.MathfieldElement) {
    status.textContent = '読み込みに失敗しました。ページを再読み込みしてください。';
    return;
  }
  MathfieldElement.fontsDirectory = new URL('vendor/fonts/', document.baseURI).href;
  MathfieldElement.soundsDirectory = null;
  await customElements.whenDefined('math-field');
  field.mathVirtualKeyboardPolicy = 'manual';
  const latex = document.getElementById('latex');
  let clearedValue = null;
  const update = () => { latex.value = field.getValue('latex'); };
  field.addEventListener('input', () => { clearedValue = null; update(); });
  const insert = value => {
    clearedValue = null;
    field.focus();
    field.insert(value, {format: 'latex', selectionMode: 'placeholder'});
    update();
    status.textContent = '入力しました';
  };
  const command = value => { field.focus(); field.executeCommand(value); update(); };
  // Prevent touch controls from taking the editor's selection/focus.
  document.querySelectorAll('.panel').forEach(panel => panel.addEventListener('pointerdown', event => {
    if (event.target.closest('button')) event.preventDefault();
  }));
  const navigation = [
    ['←','moveToPreviousChar','左に移動'], ['↑','moveUp','上に移動'],
    ['↓','moveDown','下に移動'], ['→','moveToNextChar','右に移動'],
    ['次の空欄','moveToNextPlaceholder','次の空欄'], ['⌫','deleteBackward','削除']
  ];
  navigation.forEach(([label, action, name]) => {
    const button = document.createElement('button');
    button.textContent = label; button.setAttribute('aria-label',name);
    if(label === '次の空欄') button.style.fontSize = '11px';
    button.onclick = () => command(action);
    document.getElementById('navigation').append(button);
  });
  const pairs = (labels, values) => labels.map((label,i) => [label, values[i]]);
  const groups = {
    '数字': [...'7894561230'.split('').map(x=>[x,x]), ...pairs(['+','−','×','÷','=','.', '(',')',',','x','y','n','π','∞'],['+','-','\\times','\\div','=','.', '(',')',',','x','y','n','\\pi','\\infty'])],
    '文字': [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(x=>[x,x]),
    '数式': pairs(['xⁿ','a/b','√','∫','∑','添字','sin','cos','tan','log','ln','lim','α','β','θ','Δ','λ','μ','≤','≥','≠','±','≈','→','dx','dy','|x|','!','e','空白'],
      ['^{#?}','\\frac{#?}{#?}','\\sqrt{#?}','\\int_{#?}^{#?}#?\\,\\mathrm{d}x','\\sum_{#?}^{#?}#?','_{#?}','\\sin','\\cos','\\tan','\\log','\\ln','\\lim_{#?}','\\alpha','\\beta','\\theta','\\Delta','\\lambda','\\mu','\\le','\\ge','\\ne','\\pm','\\approx','\\to','\\mathrm{d}x','\\mathrm{d}y','\\left|#?\\right|','!','e','\\quad']),
    '集合・論理': pairs(['∩','∪','¬','∧','∨','∈','∉','⊂','⊆','⊇','∅','∖','∀','∃','⇒','⇔','∴','∵','{','}','[',']','ℕ','ℤ','ℚ','ℝ','ℂ'],
      ['\\cap','\\cup','\\neg','\\land','\\lor','\\in','\\notin','\\subset','\\subseteq','\\supseteq','\\emptyset','\\setminus','\\forall','\\exists','\\Rightarrow','\\Leftrightarrow','\\therefore','\\because','\\{','\\}','[',']','\\mathbb{N}','\\mathbb{Z}','\\mathbb{Q}','\\mathbb{R}','\\mathbb{C}'])
  };
  const tabs = document.querySelector('.tabs');
  const keys = document.getElementById('keys');
  const show = (name) => {
    tabs.querySelectorAll('button').forEach(button => {button.setAttribute('aria-selected', String(button.textContent===name));});
    keys.setAttribute('aria-labelledby','tab-'+Object.keys(groups).indexOf(name));
    keys.replaceChildren(...groups[name].map(([label,value]) => {
      const button = document.createElement('button');
      button.textContent = label; button.onclick = () => insert(value);
      return button;
    }));
  };
  Object.keys(groups).forEach((name,i) => {
    const button = document.createElement('button');
    button.textContent = name; button.id = 'tab-'+i;
    button.setAttribute('role','tab');button.setAttribute('aria-controls','keys');
    button.onclick = () => show(name); tabs.append(button);
  });
  document.getElementById('undo').onclick = () => {
    if (clearedValue !== null) { field.setValue(clearedValue); clearedValue = null; update(); }
    else command('undo');
  };
  document.getElementById('clear').onclick = () => {
    const previous = field.getValue('latex');
    if (!previous) return;
    field.setValue(''); clearedValue = previous; update(); status.textContent = '全消去しました。「元に戻す」で復元できます。';
  };
  document.getElementById('copy').onclick = async () => {
    update();
    if (!latex.value) {status.textContent = 'まだ入力がありません';return;}
    try {
      await navigator.clipboard.writeText(latex.value);
      status.textContent = 'LaTeXをコピーしました';
    } catch {
      latex.closest('details').open = true; latex.focus(); latex.select();
      latex.setSelectionRange(0, latex.value.length);
      let copied = false;
      try {copied = document.execCommand('copy');} catch {}
      status.textContent = copied ? 'LaTeXをコピーしました' : 'LaTeX欄を長押ししてコピーしてください';
    }
  };
  show('数字');update();status.textContent = '準備完了';
})();
