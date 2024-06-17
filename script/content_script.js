var ann_arr = [
    {
        "line": 3,
        "lineContent": "",
        "comment": "这个是第3行备注"
    },
    {
        "line": 14,
        "lineContent": "",
        "comment": "这个是第14行备注"
    },
    {
        "line": 21,
        "lineContent": "",
        "comment": "这个是第21行备注"
    },
    {
        "line": 90,
        "lineContent": "",
        "comment": "这个是第90行备注"
    },
    {
        "line": 65,
        "lineContent": "",
        "comment": "这个是第65行备注"
    },
    {
        "line": 145,
        "lineContent": "",
        "comment": "这个是第145行备注"
    }
]

$(document).ready(function() {
    $('.react-blob-header-edit-and-raw-actions').eq(0).prepend('<div id="tiger_comment">已加载Tiger的评论</div>');
    $('.react-blob-header-edit-and-raw-actions').eq(0).prepend('<div class="tip" style="display:none">hello, I am some demo comments</div>');
    
    $('.react-line-number').each((index, lineDiv) => { // <div data-line-number="2" class="react-line-number react-code-text" style="padding-right: 16px;">2</div>
        $(lineDiv).attr('id', 'id-line-' +  $(lineDiv).text());
        for(var ann of ann_arr) {
            if (ann['line'] == $(lineDiv).text()) {
                $(lineDiv).text(ann['line'] + "-c")
                
                $(lineDiv).hover(
                    function() {
                        for(var ann of ann_arr) {
                            if ($(this).attr('data-line-number') == ann['line']){
                                $('.tip').html(ann['comment']);
                            }
                        }
                        
                        $('.tip').fadeIn('slow');
                    },
                    function() {
                        $('.tip').hide();
                    }
                );

                $(lineDiv).mousemove(function(e) {
                    var left = e.clientX + 400;
                    var top = e.clientY;
                        $('.tip').css({
                        'top' : top + 'px',
                        'left': left+ 'px'
                    });
                    
                });
            }
        }
    });
});
