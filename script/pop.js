document.getElementById('id-new-comment').addEventListener('click', function(){
  chrome.runtime.sendMessage(
    {
      action: "addNewNotes",
      data: {
        line: 'value1',
        key2: 'value2'
      }
    }
  );
});
