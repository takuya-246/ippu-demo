/* dog salon IPPU — interactions */
(function(){
  'use strict';

  /* mark JS active — reveal hidden-state only applies with this class (fails open) */
  document.documentElement.classList.add('js');

  /* ---- nav scrolled state ---- */
  var nav = document.getElementById('nav');
  function onScroll(){
    if(window.scrollY > 12){ nav.classList.add('scrolled'); }
    else{ nav.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---- mobile burger ---- */
  var burger = document.getElementById('burger');
  var links  = document.getElementById('navLinks');
  function closeMenu(){ links.classList.remove('open'); burger.classList.remove('active'); }
  burger.addEventListener('click', function(){
    links.classList.toggle('open');
    burger.classList.toggle('active');
  });
  links.addEventListener('click', function(e){
    if(e.target.closest('a')) closeMenu();
  });

  /* ---- reveal on scroll (scroll-based, no IO dependency — reliable everywhere) ---- */
  var revs = [].slice.call(document.querySelectorAll('.reveal'));
  function revealInView(){
    for(var i=revs.length-1; i>=0; i--){
      var el = revs[i];
      var r = el.getBoundingClientRect();
      if(r.top < window.innerHeight * 0.94 && r.bottom > 0){
        el.classList.add('in');
        revs.splice(i,1);
      }
    }
  }
  revealInView();                                   // above-the-fold immediately
  window.addEventListener('scroll', revealInView, {passive:true});
  window.addEventListener('resize', revealInView, {passive:true});
  window.addEventListener('load', function(){ setTimeout(revealInView, 60); });
  setTimeout(revealInView, 300);                    // safety pass after layout settles
  requestAnimationFrame(function(){ requestAnimationFrame(revealInView); });
  /* hard guarantee: never leave content hidden, even if scroll never fires */
  setTimeout(function(){ revs.slice().forEach(function(el){ el.classList.add('in'); }); revs.length = 0; }, 3500);

  /* ---- lightbox ---- */
  var lb     = document.getElementById('lightbox');
  var lbImg  = document.getElementById('lbImg');
  var lbClose= document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var groups = {};   // groupName -> array of srcs
  var current = { list:[], idx:0 };

  function collect(selector, name){
    var arr = [];
    document.querySelectorAll(selector + ' button[data-img]').forEach(function(b){
      arr.push(b.getAttribute('data-img'));
      b.addEventListener('click', function(){
        openLb(arr, arr.indexOf(b.getAttribute('data-img')));
      });
    });
    groups[name] = arr;
  }
  collect('#awardGallery', 'awards');
  collect('#gallery-grid', 'gallery');

  function openLb(list, idx){
    current.list = list; current.idx = idx;
    lbImg.src = list[idx];
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLb(){
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  function step(d){
    if(!current.list.length) return;
    current.idx = (current.idx + d + current.list.length) % current.list.length;
    lbImg.src = current.list[current.idx];
  }
  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', function(e){ e.stopPropagation(); step(-1); });
  lbNext.addEventListener('click', function(e){ e.stopPropagation(); step(1); });
  lb.addEventListener('click', function(e){ if(e.target === lb) closeLb(); });
  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('open')) return;
    if(e.key === 'Escape') closeLb();
    else if(e.key === 'ArrowLeft') step(-1);
    else if(e.key === 'ArrowRight') step(1);
  });

  /* ---- active nav link highlight (scroll-based, accurate scrollspy) ---- */
  var sections = ['concept','staff','awards','course','price','menu','gallery','reviews','access'];
  var navMap = {};
  document.querySelectorAll('#navLinks a').forEach(function(a){
    navMap[a.getAttribute('href').slice(1)] = a;
  });
  var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),10) || 74;
  var activeId = '__none';
  function updateActive(){
    var line = window.scrollY + navH + 32;          // just below the fixed nav
    var cur = null;
    for(var i=0;i<sections.length;i++){
      var s = document.getElementById(sections[i]);
      if(s && s.offsetTop <= line) cur = sections[i];   // last section whose top has passed
    }
    // snap to final section when scrolled to the very bottom
    if(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4){
      cur = sections[sections.length-1];
    }
    if(cur !== activeId){
      if(navMap[activeId]) navMap[activeId].classList.remove('active');
      if(cur && navMap[cur]) navMap[cur].classList.add('active');
      activeId = cur;
    }
  }
  window.addEventListener('scroll', updateActive, {passive:true});
  window.addEventListener('resize', updateActive, {passive:true});
  window.addEventListener('load', updateActive);
  updateActive();

  /* ---- reviews slider ---- */
  var rTrack = document.getElementById('reviewsTrack');
  if(rTrack){
    var rStep = function(){ var c = rTrack.querySelector('.review'); return c ? c.offsetWidth + 18 : 320; };
    var rp = document.getElementById('revPrev'), rn = document.getElementById('revNext');
    if(rp) rp.addEventListener('click', function(){ rTrack.scrollBy({left:-rStep(), behavior:'smooth'}); });
    if(rn) rn.addEventListener('click', function(){ rTrack.scrollBy({left:rStep(), behavior:'smooth'}); });
  }
})();
