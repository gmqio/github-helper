const btn_search_km = 'btn_search_km';
const btn_add_annotation = 'btn_add_annotation';

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: btn_add_annotation,
		title: '添加代码注释',
		type: 'normal',
		contexts: ['all']
	});

	chrome.contextMenus.create({
		id: btn_search_km,
		title: 'KM搜索',
		type: 'normal',
		contexts: ['all']
	});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getNotesByLine") {
		fetch('http://127.0.0.1:8080/mock')
			.then(response => response.json())
			.then(data => sendResponse({ data: data }))
			.catch(error => console.error(error));
		return true;
	}
	if (request.action === "addNewNotes") {
		console.log("call addNewNotes ");
		fetch(
			"http://127.0.0.1:8080/add",
			{
				method: 'POST',
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(request.data),
				mode: 'no-cors'
			}
		)
			.then(response => response.json())
			.then(data => sendResponse({ data: data }))
			.catch(error => console.error(error));
		return true;
	}
});



chrome.contextMenus.onClicked.addListener((item, tab) => {
	const s_id = item.menuItemId;
	const s_text = item.selectionText;

	if (s_id == btn_search_km) {
		const url = new URL(`https://km.woa.com/search?q=${s_text}`);
		url.searchParams.set('q', item.selectionText);
		chrome.tabs.create({ url: url.href, index: tab.index + 1 });
	} else if (s_id == btn_add_annotation) {
		chrome.windows.create({
			url: "html/popup-input.html",
			type: 'popup',
			width: 600,
			height: 120,
			left: 500,
			top: 500
		});
	}

});
