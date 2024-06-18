document.getElementById('btn-submit').addEventListener('click', function(){
  chrome.runtime.sendMessage(
    {
      action: "addNewNotes",
      data: {
        line: 'value1',
        note: document.getElementById('id-new-comment').value
      }
    }
  );
});
