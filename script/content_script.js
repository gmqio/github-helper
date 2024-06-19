// 计算textare选中的文字所处行数
function getSelectedTextLine(textarea) {
    var startPos = textarea.selectionStart;
    var textBeforeSelection = textarea.value.substring(0, startPos);
    var lineNumber = textBeforeSelection.split("\n").length;
    return lineNumber;
}

function getUserName() {
    var metaTag = document.querySelector('meta[name="user-login"]');
    if (metaTag) {
        return metaTag.getAttribute("content");
    } else {
        return "no";
    }
}

function getFileInfo() {
    var filePath = location.href.split('/');
    var repo = filePath[3];
    var project = filePath[4];
    var fileUrl = '';
    
    if (location.href.indexOf('#') > -1){
        fileUrl = location.href.substring(0, location.href.indexOf('#'));
    } else if (location.href.indexOf('?') > -1) {
        fileUrl = location.href.substring(0, location.href.indexOf('?'));
    }else{
        fileUrl = location.href;
    }

    return {
        GithubRepo: repo,
        GithubProject: project,
        GithubURL: fileUrl
    }
    
}
$(document).ready(function () {
    document.addEventListener('contextmenu', function (e) {
        var textarea = document.getElementById('read-only-cursor-text-area');
        if (textarea && textarea === document.activeElement && textarea.selectionStart !== textarea.selectionEnd) {
            var selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
            var selectedLine = getSelectedTextLine(textarea);
            var current = {
                UserName: getUserName(),
                SelectedText: selectedText,
                SelectedLine: selectedLine,
                ...getFileInfo()
            };
            chrome.runtime.sendMessage({
                data: current,
                action: "passSelectedInfo"
            }, function(response){
                console.log("passSelectedInfo callback", response)
            });
            console.log("passSelectedInfo done", current);
        }
    });
    
    chrome.runtime.sendMessage(
        {
            action: "getNotesByLine",
            data: {
                UserName: getUserName(), 
                ...getFileInfo()
            }
        },
        function (response) {
            var notes_arr = response.data.data;
            $('.react-blob-header-edit-and-raw-actions').eq(0).prepend('<div id="tiger_comment">已加载Tiger的评论</div>');
            $('.react-blob-header-edit-and-raw-actions').eq(0).prepend('<div class="tip" style="display:none">hello, I am some demo comments</div>');

            $('.react-line-number').each((index, lineDiv) => { // <div data-line-number="2" class="react-line-number react-code-text" style="padding-right: 16px;">2</div>
                $(lineDiv).attr('id', 'id-line-' + $(lineDiv).text());
                for (var note of notes_arr) {
                    var line = note.selected_line;
                    var content = note.note;

                    if (line == $(lineDiv).text()) {
                        $(lineDiv).text(line + "-c")

                        $(lineDiv).hover(
                            function () {
                                for (var note of notes_arr) {
                                    if ($(this).attr('data-line-number') == line) {
                                        $('.tip').html(content);
                                    }
                                }

                                $('.tip').fadeIn('slow');
                            },
                            function () {
                                $('.tip').hide();
                            }
                        );

                        $(lineDiv).mousemove(function (e) {
                            var left = e.clientX + 400;
                            var top = e.clientY;

                            $('.tip').css({
                                'top': top + 'px',
                                'left': left + 'px'
                            });

                        });
                    }
                }
            });
        });


});
