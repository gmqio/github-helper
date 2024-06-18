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
$(document).ready(function () {
    document.addEventListener('contextmenu', function (e) {
        var textarea = document.getElementById('read-only-cursor-text-area');
        if (textarea && textarea === document.activeElement && textarea.selectionStart !== textarea.selectionEnd) {
            var selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
            var selectedLine = getSelectedTextLine(textarea);
            var current = {
                userName: getUserName(),
                selectedText: selectedText,
                selectedLine: selectedLine,
                url: location.href
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
            url: location.href
        },
        function (response) {
            var ann_arr = response.data;
            $('.react-blob-header-edit-and-raw-actions').eq(0).prepend('<div id="tiger_comment">已加载Tiger的评论</div>');
            $('.react-blob-header-edit-and-raw-actions').eq(0).prepend('<div class="tip" style="display:none">hello, I am some demo comments</div>');

            $('.react-line-number').each((index, lineDiv) => { // <div data-line-number="2" class="react-line-number react-code-text" style="padding-right: 16px;">2</div>
                $(lineDiv).attr('id', 'id-line-' + $(lineDiv).text());
                for (var ann of ann_arr) {
                    if (ann['line'] == $(lineDiv).text()) {
                        $(lineDiv).text(ann['line'] + "-c")

                        $(lineDiv).hover(
                            function () {
                                for (var ann of ann_arr) {
                                    if ($(this).attr('data-line-number') == ann['line']) {
                                        $('.tip').html(ann['comment']);
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
