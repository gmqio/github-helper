const btn_search_km = 'btn_search_km';
const btn_add_annotation = 'btn_add_annotation';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: btn_add_annotation,
    title: '添加代码注释',
    type: 'normal',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: btn_search_km,
    title: 'KM搜索',
    type: 'normal',
    contexts: ['selection']
  });
});


chrome.contextMenus.onClicked.addListener((item, tab) => {
  const s_id = item.menuItemId;
  const s_text =   item.selectionText;

  if (s_id == btn_search_km){
    const url = new URL(`https://km.woa.com/search?q=${s_text}`);
    url.searchParams.set('q', item.selectionText);
    chrome.tabs.create({ url: url.href, index: tab.index + 1 });
  } else if (s_id == btn_add_annotation){
    
  }
  
});