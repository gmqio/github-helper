document.getElementById('btn-submit').addEventListener('click', function () {
	var selectedInfo = chrome.storage.local.get('selectedInfo', function(value){
		chrome.runtime.sendMessage(
			{
				action: "addNewNotes",
				data: {
					note: document.getElementById('id-new-comment').value,
					...value
				}
			}
		);
	});
	
	
});

function debug(message) {
	fetch(
		"http://127.0.0.1:8080/debug",
		{
			method: 'POST',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(
				{
					"fromPop": true,
					...message
				}
			),
			mode: 'no-cors'
		}
	);
}