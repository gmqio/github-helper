document.getElementById('btn-submit').addEventListener('click', function () {
	chrome.storage.local.get('selectedInfo', function (value) {
		chrome.runtime.sendMessage(
			{
				action: "addNewNotes",
				data: {
					Note: document.getElementById('id-new-comment').value,
					...value.selectedInfo
				}
			}
		);
	});


});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log('receive send result : request', request);
	if (request.action == "send_popup_add_result_success") {
		$('#id-result').text('success for line '+ request.data.SelectedLine +', 3s later will close').css("color", "green");;
		setTimeout(() => {
			window.close(); 
		}, 3000);
	}
	if (request.action == "send_popup_add_result_error") {
		console.log(request);
		$('#id-result').text("fail, "+ JSON.stringify(request.ex)).css("color", "red");;

		setTimeout(() => {
			$('#id-result').text("");
		}, 3000);
	}
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