'use strict';
const groups=window.menuGroups;
const tabs=document.getElementById('menu-tabs');
const panel=document.getElementById('menu-panel');
let activeCategory=groups[0].id;
function renderCategory(id,{focus=false}={}){
 const group=groups.find(g=>g.id===id);if(!group)throw new Error('Unknown menu category.');
 activeCategory=id;
 for(const tab of tabs.children){const selected=tab.dataset.category===id;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;if(selected&&focus)tab.focus();}
 panel.setAttribute('aria-labelledby','tab-'+id);
 document.getElementById('category-title').textContent=group.name;
 document.getElementById('category-intro').textContent=group.intro;
 const list=document.getElementById('menu-items');list.replaceChildren();
 for(const [name,price,page,note] of group.items){
  const row=document.createElement('article');row.className='menu-row';
  const label=document.createElement('div');const heading=document.createElement('h4');heading.className='item-name';heading.textContent=name;label.append(heading);
  if(note){const p=document.createElement('p');p.className='item-note';p.textContent=note;label.append(p);}
  const amount=document.createElement('span');amount.className='item-price'+(price===null?' unknown':'');amount.textContent=price===null?'Please ask':'GH₵'+price;
  row.append(label,amount);list.append(row);
 }
 document.getElementById('menu-count').textContent=group.items.length+' menu items';
 return group;
}
groups.forEach((group,index)=>{const button=document.createElement('button');button.type='button';button.role='tab';button.id='tab-'+group.id;button.dataset.category=group.id;button.setAttribute('aria-controls','menu-panel');button.textContent=group.name;button.addEventListener('click',()=>renderCategory(group.id));button.addEventListener('keydown',event=>{let i=index;if(event.key==='ArrowRight')i=(index+1)%groups.length;else if(event.key==='ArrowLeft')i=(index+groups.length-1)%groups.length;else if(event.key==='Home')i=0;else if(event.key==='End')i=groups.length-1;else return;event.preventDefault();renderCategory(groups[i].id,{focus:true});});tabs.append(button);});
renderCategory(activeCategory);
const photoTitles=['Noodles & pho','Chicken, prawns, tofu & vegetables','Bao, dim sum & sweets','Dumplings & wonton soups','Fried noodles & extras','Wings & fried chicken','Main plates & sauces','Small plates & sides','Rice','Starters & soups'];
const dialog=document.getElementById('photo-dialog');let photoIndex=0;
function updatePhoto(){const path='assets/menu-'+String(photoIndex+1).padStart(2,'0')+'.jpg';const photo=document.getElementById('menu-photo');photo.src=path;photo.alt='Photographed menu page '+(photoIndex+1)+': '+photoTitles[photoIndex];document.getElementById('original-photo').href=path;document.getElementById('photo-counter').textContent=(photoIndex+1)+' / 10';document.getElementById('photo-caption').textContent=photoTitles[photoIndex];document.getElementById('previous-photo').disabled=photoIndex===0;document.getElementById('next-photo').disabled=photoIndex===9;}
function openPhotos(){photoIndex=groups.find(g=>g.id===activeCategory).items[0][2]-1;updatePhoto();dialog.showModal();document.body.classList.add('modal-open');}
document.getElementById('view-photos').addEventListener('click',openPhotos);
document.querySelector('.close-button').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
document.getElementById('previous-photo').addEventListener('click',()=>{if(photoIndex>0){photoIndex--;updatePhoto();}});
document.getElementById('next-photo').addEventListener('click',()=>{if(photoIndex<9){photoIndex++;updatePhoto();}});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
// Optional browser support: navigating the menu uses the same action as its visible tabs.
if(document.modelContext?.registerTool){const lifecycle=new AbortController();try{Promise.resolve(document.modelContext.registerTool({name:'show_menu_category',description:'Show a photographed menu category and return its recorded prices; this does not place an order.',inputSchema:{type:'object',properties:{category:{type:'string',enum:groups.map(g=>g.id)}},required:['category'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input||typeof input.category!=='string'||Object.keys(input).some(k=>k!=='category'))throw new Error('Supply a valid menu category only.');const group=renderCategory(input.category);document.getElementById('menu').scrollIntoView({behavior:'instant'});return{category:group.name,pricesStatus:'Photographed menu; current prices unconfirmed',currency:'GHS',items:group.items.map(([name,price])=>({name,price}))};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});}
