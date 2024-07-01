String.prototype.format = function() {
    var formatted = this;
    for( var arg in arguments ) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
};

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
function setNoteContent(lineDiv, tipId) {
    for (var note of notes_arr) {
        if ($(lineDiv).attr('data-line-number') == note.selected_line) {
            $('#' + tipId).html(note.note);
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
var tipWidth = 0;
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
            var firstChild = $('.react-blob-header-edit-and-raw-actions').eq(0).children().eq(0);

            firstChild.prepend(`<a id="btnNoteSwitch" class="types__StyledButton-sc-ws60qy-0 dupbIv" data-testid="raw-button" data-size="small" data-no-visuals="false">
                                    Show Notes
                                </a>`);
            
            $('#btnNoteSwitch').attr('class', $('.types__StyledButton-sc-ws60qy-0').eq(0).attr('class'));

            $('.react-line-number').each((index, lineDiv) => { // <div data-line-number="2" class="react-line-number react-code-text" style="padding-right: 16px;">2</div>
                for (var item of notes_arr) {
                    var line = item.selected_line;
                    if (line == $(lineDiv).text()) {
                        $(lineDiv).text(line + "-c");
                        $(lineDiv).css("padding-right", "1px");
                        $(lineDiv).attr('id', 'id-line-' + line);
                        var tipId = 'tip-line-' + line;

                        tipWidth = $('#read-only-cursor-text-area').parent().parent().parent().parent().width() + 262;
                        $('#read-only-cursor-text-area').parent().parent().parent().parent().parent().parent()
                            .append(
                                '<div id="{0}" class="tip" style="display:none; width: {1}px">{2}</div>'
                            .format(
                                tipId,
                                tipWidth - 50,
                                item.note
                            )
                        );

                        var top= ((parseInt($(lineDiv).attr('data-line-number')) + 1) * 20 + 12) + 'px';
                        $('#' + tipId).css({
                            'top': top,
                            'right': '0px'
                        });

                        $(lineDiv).hover(
                            function () {
                                $('#' + tipId).css('width', tipWidth - $('#filter-results').width() - 50);
                                $('#' + tipId).show();
                                
                                
                            },
                            function () {
                                $('#' + tipId).css('width', tipWidth);
                                $('#' + tipId).hide();
                            }
                        );
                    }
                }
            });

            $('#btnNoteSwitch').on('click', function () {
                var s = $(this).text();
                var contentDiv = $(this).siblings('.css-bg-code');

                if (s.trim() == 'Show Notes') {
                    contentDiv.css('display', 'block');
                    $(this).text('Close Notes');

                    $('.tip').show();
                    $('#symbols-pane').parent().hide();
                } else {
                    contentDiv.css('display', 'none');
                    $(this).text('Show Notes');

                    $('.tip').hide();

                    $('#symbols-pane').parent().show();
                }
            });

            
        });
});
