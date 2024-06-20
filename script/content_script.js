// 计算textare选中的文字所处行数
function getSelectedTextLine(textarea) {
    var startPos = textarea.selectionStart;
    var textBeforeSelection = textarea.value.substring(0, startPos);
    var lineNumber = textBeforeSelection.split("\n").length;
    return lineNumber;
}

// 获取当前登录的用户名
function getUserName() {
    var metaTag = document.querySelector('meta[name="user-login"]');
    if (metaTag) {
        return metaTag.getAttribute("content");
    } else {
        return "no";
    }
}

// 设置当前行的注释内容
function setNoteContent(ele, notes_arr) {
    for (var note of notes_arr) {
        if ($(ele).attr('data-line-number') == note.selected_line) {
            $('.tip').html(note.note);
        }
    }
}

// 获取当前页面的源代码文件信息
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
    // 右键菜单点击响应， 将选中的文本发送到backgroud script中
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
    
    // 加载当前页面的代码注释
    chrome.runtime.sendMessage(
        {
            action: "getNotesByLine",
            data: {
                UserName: getUserName(), 
                ...getFileInfo()
            }
        },
        // 从api获取到数据后，填充到页面上
        function (response) {
            var notes_arr = response.data.data;
            $('.react-blob-header-edit-and-raw-actions').eq(0).prepend('<div id="tiger_comment">已加载Tiger的评论</div>');
            $('.react-blob-header-edit-and-raw-actions').eq(0).prepend('<div class="tip" style="display:none">loding...</div>');

            $('.react-line-number').each((index, lineDiv) => { // <div data-line-number="2" class="react-line-number react-code-text" style="padding-right: 16px;">2</div>
                $(lineDiv).attr('id', 'id-line-' + $(lineDiv).text());
                for (var item of notes_arr) {
                    var line = item.selected_line;
                    
                    if (line == $(lineDiv).text()) {
                        $(lineDiv).text(line + "-c")
                        $(lineDiv).hover(
                            function () {
                                setNoteContent(this, notes_arr);
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
