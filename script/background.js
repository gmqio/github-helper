const btn_search_km = 'btn_search_km';
const btn_add_annotation = 'btn_add_annotation';

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: btn_add_annotation,
		title: 'addNote',
		type: 'normal',
		contexts: ['all']
	});

	chrome.contextMenus.create({
		id: btn_search_km,
		title: 'search KM',
		type: 'normal',
		contexts: ['all']
	});
});

function buildGetParams(data) {
	return Object.keys(data)
		.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
		.join('&');
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getNotesByLine") {
		fetch('http://81.70.42.24:6001/note/query?' + buildGetParams(request.data))
			.then(response => response.json())
			.then(data => sendResponse({ data: data }))
			.catch(error => sendResponse({ e: error }));
	}
	if (request.action === "addNewNotes") {
		fetch(
			"http://81.70.42.24:6001/note/add",
			{
				method: 'POST',
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(request.data),
				mode: 'no-cors'
			}
		)
			.then(data => {
				console.log("send result done", data);
				chrome.runtime.sendMessage({ action: 'send_popup_add_result_success', data: request.data });
				sendResponse({ data: data });
			})
			.catch(error => {
				console.log("send result error", error);
				if (error && Object.keys(error).length > 0) {
					chrome.runtime.sendMessage({ action: 'send_popup_add_result_error', ex: error });
				} else {
					chrome.runtime.sendMessage({ action: 'send_popup_add_result_success', data: {} });
				}

				sendResponse({ e: error })
			});
	}

	if (request.action === "passSelectedInfo") {
		chrome.storage.local.set({
			selectedInfo: request.data
		});
	}

	return true;
});

function debug(message, sendResponse) {
	fetch(
		"http://127.0.0.1:8080/debug",
		{
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(message),
			mode: 'no-cors'
		}
	)
		.then(response => response.json())
		.then(data => sendResponse({ data: data }))
		.catch(error => sendResponse({ e: error }));
}

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
