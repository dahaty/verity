/* Verity platform story: live example + before/after diagrams. Demo data only. */
(function(){
  var PRICE={read:.15,write:.85,fact:1.2};
  var LABEL={ok:'РАЗРЕШЕНО',bad:'ОСТАНОВЛЕНО',wait:'ЧЕЛОВЕКУ',pass:'ПЕРЕДАНО',log:'ЗАПИСАНО',back:'ВОЗВРАЩЕНО'};
  var HUBV={ok:'РАЗРЕШЕНО АВТОМАТИЧЕСКИ',bad:'ОСТАНОВЛЕНО · НА ИСПРАВЛЕНИЕ',wait:'КРАЙНИЙ СЛУЧАЙ · ЧЕЛОВЕКУ',pass:'ЗАДАЧА ПЕРЕДАНА',log:'ЗАПИСАНО В ИСТОРИЮ',back:'АГЕНТ ИСПРАВЛЯЕТСЯ'};
  var CLS={ok:'v-ok',bad:'v-bad',wait:'v-wait',pass:'v-pass',log:'v-pass',back:'v-pass'};

  var SCENARIOS={
    order:{
      inLabel:'КЛИЕНТ ПИШЕТ В ЧАТ БИТРИКС24',
      inText:'«Здравствуйте! Нужно 10 кресел Ergo Pro, выставьте счёт на ООО «Ромашка».»',
      outLabel:'ОТВЕТ КЛИЕНТУ',
      steps:[
        {a:['support'],s:['bitrix'],what:'Агент поддержки ← Битрикс24: новое обращение из чата',check:'Право: чтение чатов ✓',v:'ok',k:'read',hub:{rights:'ok'}},
        {a:['support'],s:['amo'],what:'Агент поддержки → amoCRM: найти клиента «Ромашка»',check:'Право: чтение ✓ · amoCRM #4812 = 1С, ИНН 7707123456 — один клиент',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['support','stock'],s:[],what:'Агент поддержки → Агент склада: «Есть 10 × Ergo Pro?»',check:'Передача задачи между агентами — по общим правилам ✓',v:'pass',k:'read',hub:{rights:'ok'}},
        {a:['stock'],s:['sklad'],what:'Агент склада → МойСклад: остаток Ergo Pro',check:'На складе 24 шт ✓',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['stock'],s:['sklad'],what:'Агент склада → МойСклад: резерв 10 шт',check:'Лимит агента склада: резерв до 100 шт ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['account'],s:['onec'],what:'Агент учёта → 1С: счёт на 184 000 ₽',check:'Клиент есть в 1С, лимит 500 000 ₽, долгов нет, цены = прайс ✓ — счёт №А-1043 создан',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['support'],s:[],what:'Агент поддержки → клиенту: ответ',check:'Сверка: 10 шт = резерв в МоёмСкладе ✓ · 184 000 ₽ = счёт в 1С ✓',v:'ok',k:'fact',hub:{rights:'ok',data:'ok',rule:'ok'},
          reply:'«Готово! 10 кресел Ergo Pro в резерве, счёт №А-1043 на 184 000 ₽ отправлен вам на почту.»'},
        {a:['support'],s:['amo'],what:'Агент поддержки → amoCRM: сделка «Ромашка», 184 000 ₽',check:'Право: запись сделок ✓',v:'ok',k:'write',hub:{rights:'ok',rule:'ok'}}
      ]
    },
    error:{
      inLabel:'КЛИЕНТ ПИШЕТ В ЧАТ БИТРИКС24',
      inText:'«Сколько у вас Ergo Pro в наличии? Если от 30 штук — возьмём, но нужна скидка.»',
      outLabel:'ОТВЕТ КЛИЕНТУ',
      steps:[
        {a:['support'],s:['bitrix'],what:'Агент поддержки ← Битрикс24: новое обращение из чата',check:'Право: чтение чатов ✓',v:'ok',k:'read',hub:{rights:'ok'}},
        {a:['support'],s:['amo'],what:'Агент поддержки → amoCRM: карточка клиента',check:'Скидка по договору: 5% · amoCRM #4812 = 1С',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['support','stock'],s:['sklad'],what:'Агент склада → МойСклад: остаток Ergo Pro',check:'На складе 24 шт',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['support'],s:[],what:'Агент поддержки → клиенту (черновик): «В наличии 50 шт, дадим скидку 15%»',check:'В МоёмСкладе 24 шт, а не 50 ✕ · Скидка агента не больше 10%, по договору 5% ✕',v:'bad',k:'fact',hub:{rights:'ok',data:'bad',rule:'bad'}},
        {a:['support'],s:[],what:'Verity → Агенту поддержки: причина остановки',check:'Агент получил верные данные: 24 шт, скидка 5%',v:'back',k:null,hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['support'],s:[],what:'Агент поддержки → клиенту: исправленный ответ',check:'Сверка: 24 шт ✓ · скидка 5% по договору ✓',v:'ok',k:'fact',hub:{rights:'ok',data:'ok',rule:'ok'},
          reply:'«Сейчас в наличии 24 кресла Ergo Pro. По вашему договору скидка 5%. Зарезервировать?»'}
      ]
    },
    rights:{
      inLabel:'СОТРУДНИК ПИШЕТ АГЕНТУ',
      inText:'«Сделай кресла Ergo Pro подешевле — пусть быстрее продаются.»',
      outLabel:'ОТВЕТ СОТРУДНИКУ',
      steps:[
        {a:['support'],s:['bitrix'],what:'Агент поддержки ← Битрикс24: сообщение сотрудника',check:'Право: чтение чатов ✓',v:'ok',k:'read',hub:{rights:'ok'}},
        {a:['support'],s:['onec'],what:'Агент поддержки → 1С: цена Ergo Pro 18 400 → 12 900 ₽',check:'Агенту поддержки запись в 1С запрещена ✕',v:'bad',k:'write',hub:{rights:'bad',rule:'bad'}},
        {a:['support'],s:[],what:'Контролёр → Агенту поддержки: причина отказа',check:'Попытка сохранена в истории и попадёт в табель надёжности',v:'back',k:null,hub:{rights:'bad',rule:'bad'}},
        {a:['support'],s:[],what:'Агент поддержки → сотруднику: ответ',check:'Ответ соответствует правам агента ✓',v:'ok',k:'fact',hub:{rights:'ok',rule:'ok'},
          reply:'«Менять цены в 1С может только отдел продаж. Передать ваш запрос руководителю?»'}
      ]
    },
    edge:{
      inLabel:'КЛИЕНТ ПИШЕТ В ЧАТ БИТРИКС24',
      inText:'«Нужно 60 кресел Ergo Pro. Счёт на ООО «Вектор», оплатим после поставки.»',
      outLabel:'ОТВЕТ КЛИЕНТУ',
      steps:[
        {a:['support'],s:['bitrix'],what:'Агент поддержки ← Битрикс24: новое обращение из чата',check:'Право: чтение чатов ✓',v:'ok',k:'read',hub:{rights:'ok'}},
        {a:['support'],s:['amo'],what:'Агент поддержки → amoCRM: найти клиента «Вектор»',check:'Нет ни в amoCRM, ни в 1С — новый клиент без истории оплат',v:'ok',k:'read',hub:{rights:'ok',data:'ok'}},
        {a:['stock'],s:['sklad'],what:'Агент склада → МойСклад: резерв 60 шт',check:'На складе 24 шт — контролёр сам разрешил резерв 24 шт, остальное под заказ ✓',v:'ok',k:'write',hub:{rights:'ok',data:'ok',rule:'ok'}},
        {a:['account'],s:['onec'],what:'Агент учёта → 1С: счёт на 1 104 000 ₽ с оплатой после поставки',check:'Новый клиент + отсрочка + сумма выше всех лимитов — автоматически решить нельзя',v:'wait',k:'write',hub:{rights:'ok',data:'ok',rule:'wait'},
          tg:{text:'Крайний случай: новый клиент ООО «Вектор», 1 104 000 ₽, оплата после поставки. Как поступить?',btns:['Только предоплата','Отклонить']}},
        {a:['account'],s:['onec'],what:'Руководитель в Telegram: «Только предоплата»',check:'Контролёр применил решение: счёт №А-1044 на 100% предоплату',v:'ok',k:null,hub:{rights:'ok',data:'ok',rule:'ok'},press:true},
        {a:['support'],s:[],what:'Агент поддержки → клиенту: ответ',check:'Сверка: 24 шт = резерв ✓ · условия = счёт в 1С ✓',v:'ok',k:'fact',hub:{rights:'ok',data:'ok',rule:'ok'},
          reply:'«В наличии 24 кресла — уже в резерве, остальные 36 привезём под заказ. Для первого заказа работаем по предоплате, счёт отправили на почту.»'}
      ]
    }
  };

  var root=document.querySelector('[data-ex]');
  if(root){
    var reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var tabs=root.querySelectorAll('[data-ex-case]');
    var log=root.querySelector('[data-ex-log]');
    var hub=root.querySelector('[data-ex-hub]');
    var verdict=root.querySelector('[data-ex-verdict]');
    var tg=root.querySelector('[data-ex-tg]');
    var inB=root.querySelector('[data-ex-in]'),outB=root.querySelector('[data-ex-out]');
    var playBtn=root.querySelector('[data-ex-play]'),stepBtn=root.querySelector('[data-ex-next]');
    var sumChecks=root.querySelector('[data-sum-checks]'),sumCost=root.querySelector('[data-sum-cost]'),sumStop=root.querySelector('[data-sum-stop]'),sumHuman=root.querySelector('[data-sum-human]');
    var live=root.querySelector('[data-ex-live]');
    var cur='order',idx=0,timer=null,stats;

    function $all(sel){return Array.prototype.slice.call(root.querySelectorAll(sel))}
    function clearNodes(){$all('[data-ex-node]').forEach(function(n){n.classList.remove('is-active','is-bad','is-wait')})}
    function setHub(h,v){
      ['rights','data','rule'].forEach(function(key){
        var row=hub.querySelector('[data-hub="'+key+'"]'),st=h&&h[key];
        row.className=st?('on '+st):'';
        row.querySelector('i').textContent=st==='ok'?'✓':st==='bad'?'✕':st==='wait'?'⏸':'·';
      });
      hub.classList.remove('is-ok','is-bad','is-wait');
      if(v==='bad')hub.classList.add('is-bad');else if(v==='wait')hub.classList.add('is-wait');else if(v)hub.classList.add('is-ok');
      verdict.textContent=v?HUBV[v]:'ОЖИДАЕТ ЗАПРОСА';
    }
    function fmt(n){return n.toFixed(2).replace('.',',')+' ₽'}
    function renderSum(){
      sumChecks.textContent=stats.checks;sumCost.textContent=fmt(stats.cost);sumStop.textContent=stats.stop;sumHuman.textContent=stats.dec?Math.round((stats.dec-stats.human)/stats.dec*100)+'%':'—';
    }
    function reset(){
      stop();idx=0;stats={checks:0,cost:0,stop:0,human:0,dec:0};
      var sc=SCENARIOS[cur];
      inB.querySelector('span').textContent=sc.inLabel;inB.querySelector('p').textContent=sc.inText;
      outB.querySelector('span').textContent=sc.outLabel;outB.querySelector('p').textContent='Появится после проверки';
      outB.classList.add('is-empty');outB.classList.remove('is-ok');
      log.innerHTML='<li class="ex-log-empty">Нажмите «Запустить пример» — каждое действие агентов появится здесь с результатом проверки.</li>';
      clearNodes();setHub(null,null);tg.classList.remove('show');renderSum();
      playBtn.querySelector('span:last-child').textContent='Запустить пример';
      stepBtn.disabled=false;
      if(live)live.textContent='';
    }
    function showTg(t,press){
      tg.querySelector('p').textContent=t.text;
      var b=tg.querySelectorAll('b');b[0].textContent=t.btns[0];b[1].textContent=t.btns[1];b[0].classList.remove('pressed');
      tg.classList.add('show');
    }
    function doStep(){
      var sc=SCENARIOS[cur],st=sc.steps[idx];
      if(!st)return false;
      if(idx===0)log.innerHTML='';
      clearNodes();
      st.a.concat(st.s).forEach(function(id){var n=root.querySelector('[data-ex-node="'+id+'"]');if(n)n.classList.add(st.v==='bad'?'is-bad':st.v==='wait'?'is-wait':'is-active')});
      setHub(st.hub,st.v);
      if(st.tg)showTg(st.tg);
      else if(st.press){tg.querySelector('b').classList.add('pressed');setTimeout(function(){tg.classList.remove('show')},reduced?0:900)}
      else tg.classList.remove('show');
      if(st.k){stats.checks++;stats.cost+=PRICE[st.k]}
      if(st.v==='bad')stats.stop++;
      if(!st.press)stats.dec++;
      if(st.v==='wait')stats.human++;
      if(st.reply){outB.querySelector('p').textContent=st.reply;outB.classList.remove('is-empty');outB.classList.add('is-ok')}
      var li=document.createElement('li');
      li.innerHTML='<span>'+String(idx+1).padStart(2,'0')+'</span><span></span><span></span><em class="'+CLS[st.v]+'">'+LABEL[st.v]+'</em>';
      li.children[1].textContent=st.what;li.children[2].textContent=st.check;
      log.appendChild(li);log.scrollTop=log.scrollHeight;
      if(live)live.textContent=st.what+'. '+st.check+'. '+LABEL[st.v]+'.';
      renderSum();
      idx++;
      if(idx>=sc.steps.length){stepBtn.disabled=true;playBtn.querySelector('span:last-child').textContent='Повторить';}
      return st;
    }
    function stop(){if(timer){clearTimeout(timer);timer=null}root.classList.remove('is-playing')}
    function loop(){
      var st=doStep();
      if(!st||idx>=SCENARIOS[cur].steps.length){stop();return}
      timer=setTimeout(loop,reduced?300:(st.v==='wait'||st.v==='bad'?2600:1500));
    }
    playBtn.addEventListener('click',function(){
      if(timer){stop();playBtn.querySelector('span:last-child').textContent='Продолжить';return}
      if(idx>=SCENARIOS[cur].steps.length)reset();
      root.classList.add('is-playing');playBtn.querySelector('span:last-child').textContent='Пауза';loop();
    });
    stepBtn.addEventListener('click',function(){stop();doStep();if(idx<SCENARIOS[cur].steps.length)playBtn.querySelector('span:last-child').textContent='Продолжить'});
    Array.prototype.forEach.call(tabs,function(t){
      t.addEventListener('click',function(){
        Array.prototype.forEach.call(tabs,function(o){o.setAttribute('aria-selected',o===t?'true':'false');o.tabIndex=o===t?0:-1});
        cur=t.getAttribute('data-ex-case');reset();
      });
    });
    reset();
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(e){root.classList.toggle('ex-visible',e[0].isIntersecting)},{threshold:.15}).observe(root);
    }else root.classList.add('ex-visible');
  }

  /* Before / after: 10 agents × 4 systems */
  var NS='http://www.w3.org/2000/svg';
  function el(n,a){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);return e}
  function draw(svg,hubbed){
    var W=420,H=260,ax=40,sx=380,ay=[],sy=[];
    for(var i=0;i<10;i++)ay.push(22+i*24);
    for(var j=0;j<4;j++)sy.push(52+j*52);
    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    var g=el('g',{});svg.appendChild(g);
    if(!hubbed){
      ay.forEach(function(y){sy.forEach(function(y2){g.appendChild(el('path',{d:'M'+ax+' '+y+' C200 '+y+' 220 '+y2+' '+sx+' '+y2,fill:'none',stroke:'#ff7b7b','stroke-opacity':'.38','stroke-width':'1'}))})});
    }else{
      var hx=210,hy=130;
      ay.forEach(function(y){g.appendChild(el('path',{d:'M'+ax+' '+y+' C130 '+y+' 150 '+hy+' '+(hx-34)+' '+hy,fill:'none',stroke:'#4a98ff','stroke-opacity':'.6','stroke-width':'1.2'}))});
      sy.forEach(function(y){g.appendChild(el('path',{d:'M'+(hx+34)+' '+hy+' C270 '+hy+' 290 '+y+' '+sx+' '+y,fill:'none',stroke:'#66d5ff','stroke-opacity':'.75','stroke-width':'1.4'}))});
      g.appendChild(el('rect',{x:hx-34,y:hy-26,width:68,height:52,rx:12,fill:'#152949',stroke:'#4f8fe0'}));
      var t=el('text',{x:hx,y:hy+7,'text-anchor':'middle',fill:'#cfe3ff','font-size':'20','font-weight':'700'});t.textContent='v.';g.appendChild(t);
    }
    ay.forEach(function(y,i){g.appendChild(el('circle',{cx:ax,cy:y,r:7,fill:'#1c2c45',stroke:'#6f8fbb'}))});
    var lab=['1С','Б24','amo','Склад'];
    sy.forEach(function(y,i){g.appendChild(el('rect',{x:sx-4,y:y-14,width:40,height:28,rx:7,fill:'#1a2436',stroke:'#6f8fbb'}));var t=el('text',{x:sx+16,y:y+4,'text-anchor':'middle',fill:'#c6d4e7','font-size':'10'});t.textContent=lab[i];g.appendChild(t)});
    var a=el('text',{x:ax,y:H-2,'text-anchor':'middle',fill:'#697d97','font-size':'10'});a.textContent='10 агентов';g.appendChild(a);
  }
  var b1=document.querySelector('[data-ba="mesh"]'),b2=document.querySelector('[data-ba="hub"]');
  if(b1)draw(b1,false);if(b2)draw(b2,true);
})();
