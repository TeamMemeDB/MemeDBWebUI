let FillMemePreview = null;
let UpdateMemePreview = null;
let PopUpMemePreview = null;
let PopUpCollectionPreview = null;
let PopUpMemeEditor = null;
let PopulateMemeEditor = null;
let InfiniteScroll = null;
let ShowBigBoy = null;
let root = window.location.pathname;
let rootchar = '?';
let numtoname = {0:'zero',1:'one',2:'two',3:'three',4:'four',5:'five'};

let colpage = 1;
let colmax = 1;
if(root.startsWith('/meme/')||root.startsWith('/collection/')){
	root='/sort/new';
}
if(root==='/search/'){
	root = window.location.pathname + window.location.search;
	if(root.indexOf('?')>0) rootchar = '&';
	else rootchar = '?';
}

// Scale all memes depending on the user's preferences
$('.memewrapper').css('font-size',(parseInt(getCookie('zoom'))/100).toString()+'em');
$('#scale').val(getCookie('zoom'));
$('#scale').on('input',function(){
	$('.memewrapper').css('font-size',(parseInt($('#scale').val())/100).toString()+'em');
	setCookie('zoom',$('#scale').val().toString(),30);
});

function PauseVideo(vid){
	$(this).find('video').get(0).pause();
}

$(document).ready(function(){
	FillMemePreview = function(meme){
		$('#memepreview').html($(meme).html());
		$('#memepreview').append(
			'<a class="ellipsis" onclick="$(\'#memepreview-dropdown\').toggle()">&#8942;</a>'+
			'<ul class="dropdown-menu" id="memepreview-dropdown" style="display:none;">'+
				'<a href="/report/'+($(meme).is('.parent')?'collection':'meme')+'/'+$(meme).attr('data-id')+'"><li class="dropdown-menu-item">&#9888; Report</li></a>'+
				'<a href="#share"><li class="dropdown-menu-item">Share</li></a>'+
				'<a class="memeurl" href="'+$(meme).data('src')+'" target="_blank"><li class="dropdown-menu-item">View Original</li></a>'+
			'</ul>'
		);
		$('#memepreview img,#memepreview source').first().attr('src',$(meme).data('src'));
		$('#memepreview .edit').on('click',function(){
			PopUpMemeEditor(true,$('#memepreview').attr('data-id'));
		});
		$('#memepreview .upvote').on('click',function(){
			if($(this).is('.active')){
				MemeVote($('#memepreview').attr('data-id'),0);
			}
			else{
				MemeVote($('#memepreview').attr('data-id'),1);
			}
		});
		$('#memepreview .downvote').on('click',function(){
			if($(this).is('.active')){
				MemeVote($('#memepreview').attr('data-id'),0);
			}
			else{
				MemeVote($('#memepreview').attr('data-id'),-1);
			}
		});
		$('#memepreview .fav').on('click',function(){
			MemeFav($('#memepreview').attr('data-id'),($(this).is('.active')?0:1));
		});
		$('#memepreview').attr('data-id',$(meme).attr('data-id'));
		if($(meme).is('.video')) createPlayer(document.getElementById('memepreview'));
	};
	UpdateMemePreview = function(meme){
		$('#memepreview>img,#memepreview>iframe,#memepreview>video,#memepreview>.videoplayer,#memepreview>.text').remove();
		$('#memepreview').append($(meme).find('img,iframe,video,.videoplayer,.text').wrap('<p/>').parent().html());
		$('#memepreview img,#memepreview source').first().attr('src',$(meme).data('src'));
		$('#memepreview>.dropdown-menu>a.memeurl').attr('href',$(meme).data('src'));
	}
	PopUpMemePreview = function(show,id=null){
		if(show & ($('#memepreview').is(':hidden'))){
			meme=document.querySelector(".meme[data-id='"+id+"']");
			if(meme){
				var collection = ($(meme).is('.parent')?'collection':'meme');
				$('html').addClass('lock');
				$('#memeflood').show(0.125);
				$('.wrapper').addClass('blur');
				$('header').addClass('blur');
				$('#memepreview').addClass('full');
				$('#memepreview').show(0.125);
				FillMemePreview(meme);
				window.history.pushState($(meme).attr('data-id'), 'Meme Preview - MemeDB', '/'+collection+'/'+$(meme).attr('data-id'));
				onPop();
				if($(meme).is('.parent')){
					if(!$('#singlememe .meme[data-id='+id+']').length){
						$.ajax({
							url: '?get',
							success: function(data){
								$('#singlememe').html(data);
								PopUpCollectionPreview(true,id);
							},
							error: function(e){
								alert("Failed to get collection!");
							}
						});
					}else{
						PopUpCollectionPreview(true,id);
					}
				}
			}else if(typeof singleedge !== 'undefined'){
				if(parseInt(singleedge.hidden)){
					alert("This meme has been restricted to admins only.");
					window.history.pushState(root, 'root - MemeDB', root);
				}
				else if(singleedge.missing){
					return;
				}
				else{
					var reasons='';
					if(parseInt(singleedge.nsfw)) reasons+='<b>Note:</b> this meme has been marked as NSFW.<br>';
					reasons+='In order to view this meme...';
					if(parseFloat(singleedge.edge)>0.5)reasons+='<br>- We will set your <abbr title="The spice peppers below, hover over them to see definitions.">edge limit</abbr> to '+Math.round(parseFloat(singleedge.edge)+1.0)+'.';
					reasons+='<br>Do you want to continue?';
					ShowBigBoy(true,"This meme is <span class='accent'>Restricted</span>!",reasons,true);
				}
			}else{
				alert("Couldn't show you this meme and the server didn't provide a reason why.");
			}
		}else if(!show & $('#memepreview').is(':visible')){
			$('html').removeClass('lock');
			PopUpMemeEditor(false);
			PopUpCollectionPreview(false);
			$('#memeflood').hide(0.125,function(){
				$('.wrapper').removeClass('blur');
				$('header').removeClass('blur');
				$('#memepreview').off().hide(0.125,function(){
					$('#memepreview').html('');
				});
			});
			if(window.location.pathname.startsWith('/meme/')||window.location.pathname.startsWith('/collection/')) window.history.pushState(root, 'root - MemeDB', root);
			onPop();
		}
	}
	PopUpCollectionPreview = function(show,id=null){
		if(show){
			colpage = 1;
			colmax = $('#singlememe .meme').length;
			$('#memepreview').append('<span class="previous disabled">&lt;</span><span class="next">&gt;</span>');
			$('#memepreview').on('click','.previous',function(e){
				e.preventDefault();
				if(colpage>1){
					colpage--;
					$('#memepreview>.next').removeClass('disabled');
					$('#memepreview>.collection').remove();
					UpdateMemePreview($('#singlememe .meme')[colpage-1]);
					$('#memepreview').append('<span class="collection">'+colpage+' of '+colmax+'</span>');
					if(colpage==1){
						$('#memepreview>.previous').addClass('disabled');
					}
				}
			});
			$('#memepreview').on('click','.next',function(e){
				e.preventDefault();
				if(colpage<colmax){
					colpage++;
					$('#memepreview>.previous').removeClass('disabled');
					$('#memepreview>.collection').remove();
					UpdateMemePreview($('#singlememe .meme')[colpage-1]);
					$('#memepreview').append('<span class="collection">'+colpage+' of '+colmax+'</span>');
					if(colpage==colmax){
						$('#memepreview>.next').addClass('disabled');
					}
				}
			});
		}else{
			$('#memepreview>.previous,#memepreview>.next').remove();
		}
	}
	PopUpMemeEditor = function(show,id=null){
		if(show & $('#memeeditor').is(':hidden')){
			var collection = ($('.meme[data-id='+id+']').is('.parent')?'collection':'meme');
			PopUpMemePreview(show,id);
			window.history.pushState(id, 'Meme Editor - MemeDB', '/'+collection+'/edit/'+id);
			onPop();
			if(typeof editdata == 'undefined' || editdata == null){
				$.ajax({
					url:'/'+collection+'/edit/'+id+'?get',
					success: function(data){
						if(data.success==1){
							PopulateMemeEditor(data);
						}else{
							alert(data.msg);
							if(data.msg=="You must be logged in to use this!"){
								LoginAndReturn();
							}
						}
					},
					error: function(data){
						alert("Can't show you the meme editor: "+data);
					}
				});
			}else{
				PopulateMemeEditor(editdata);
				editdata=null;
			}
		}
		else if($('#memeeditor').is(':visible')){
			id = $('#memepreview').attr('data-id');
			var collection = ($('.meme[data-id='+id+']').is('.parent')?'collection':'meme');
			window.history.pushState(id, 'Meme Preview - MemeDB', '/'+collection+'/'+id);
			onPop();
			$('#memepreview').addClass('full');
			$('#memepreview>.edit').removeClass('active');
			$('#memeeditor').hide(0.125,function(){
				$('#memedesc>.desc').remove();
				$('#memetrans>.trans').remove();
				$('#memecats').empty();
				$('#memetags').empty();
				$('#memespice').attr('class','edgecontainer');
			});
		}
	}
	
	// Take the data from the ajax request and set up the editor to display everything
	PopulateMemeEditor = function(data){
		$('#memeeditor').attr('data-id',data.Id);
		
		$('#isNsfw').prop('checked',(data.Nsfw=='1'));
		if(data.Type=='video'){
			$('#isSilent').prop('checked',false);
			$('#isSilent').show();
			$('label[for="isSilent"]').show();
		}
		else if(data.Type=='webm'){
			$('#isSilent').prop('checked',true);
			$('#isSilent').show();
			$('label[for="isSilent"]').show();
		}
		else{
			$('#isSilent').hide();
			$('label[for="isSilent"]').hide();
		}
		
		$('#isNsfw').off().on('click',function(){
			$.ajax({
				url:window.location.pathname+'?get&nsfw='+(($('#isNsfw').is(':checked'))?'1':'0'),
				success:function(data){
					if(!data.success){
						alert('Failed to change Nsfw status: '+data.msg);
					}
				},
				error:function(){
					alert('Failed to change Nsfw status!');
				}
			});
		});
		$('#isSilent').off().on('click',function(){
			$.ajax({
				url:window.location.pathname+'?get&webm='+(($('#isSilent').is(':checked'))?'1':'0'),
				success:function(data){
					if(!data.success){
						alert('Failed to change silent status: '+data.msg);
					}
				},
				error:function(){
					alert('Failed to change silent status!');
				}
			});
		});
		
		$('#memepreview').removeClass('full');
		$('#memepreview>.edit').addClass('active');
		
		if(Object.keys(data.Descriptions).length>0){
			for(var desc in data.Descriptions){
				$('#memedesc').append("<p class='desc' data-id='"+data.Descriptions[desc].Id+"'>"+desc+' <i class="votes">('+data.Descriptions[desc].Votes+")</i>&nbsp;<a class='inbtn editdesc'>✎</a></p>");
			}
			$('#memedesc').append("<p class='desc'><i>Suggest an alternative?</i>&nbsp;<a class='inbtn editdesc'>+</a></p>");
		}else{
			$('#memedesc').append("<p class='desc'><i>No descriptions yet. Add one!</i>&nbsp;<a class='inbtn editdesc'>+</a></p>");
		}
		if(Object.keys(data.Transcriptions).length>0){
			for(var trans in data.Transcriptions){
				$('#memetrans').append("<p class='trans' data-id='"+data.Transcriptions[trans].Id+"'>"+trans+' <i class="votes">('+data.Transcriptions[trans].Votes+")</i>&nbsp;<a class='inbtn edittrans'>✎</a></p>");
			}
			$('#memetrans').append("<p class='trans'><i>Suggest an alternative?</i>&nbsp;<a class='inbtn edittrans'>+</a></p>");
		}else{
			$('#memetrans').append("<p class='trans'><i>No transcriptions yet. (Or nothing to transcribe.)</i>&nbsp;<a class='inbtn edittrans'>+</a></p>");
		}
		
		$('.desc[data-id]').off().on('click',function(e){
			//upvote/unupvote
		});
		$('.trans[data-id]').off().on('click',function(e){
			//upvote/unupvote
		});
		$('.editdesc').off().on('click',function(e){
			//new or edit desc
			var src = $(this).parent();
			var open = src.parent().find('textarea');
			if(open.length){
				open.parent().remove();
			}
			else{
				var text = '';
				if(typeof src.data('id')!=='undefined'){
					text = src.clone().children().remove().end().text();
					text = text.substring(0,text.length-2);
				}
				src.append("<div class='editor' data-id='"+src.data('id')+"'><textarea rows='4' maxlength='10000'>"+text+"</textarea>"+
					"<sub> - press ctrl+enter or double-tap to save.</sub></div>");
				
				var editor = src.parent().find('textarea');
				setTimeout(function() {
				 editor.focus();
				}, 0.1);
				$(editor).keydown(function (e) {
					if (e.ctrlKey && e.keyCode == 13) {
						// Ctrl-Enter pressed
						SubmitDesc(src.data('id'),editor.val());
					}
				});
				var tapped=false
				$(editor).on("touchstart",function(e){
					if(!tapped){
						tapped=setTimeout(function(){
							tapped=false
						},300);
					} else { //double tap
						clearTimeout(tapped);
						tapped=false
						SubmitDesc(src.data('id'),editor.val());
					}
				});
			}
		});
		$('.edittrans').off().on('click',function(e){
			//new or edit trans
			var src = $(this).parent();
			var open = src.parent().find('textarea');
			if(open.length){
				open.parent().remove();
			}
			else{
				var text = '';
				if(typeof src.data('id')!=='undefined'){
					text = src.clone().children().remove().end().text();
					text = text.substring(0,text.length-2);
				}
				src.append("<div class='editor' data-id='"+src.data('id')+"'><textarea rows='4' maxlength='10000'>"+text+"</textarea>"+
					"<sub> - press ctrl+enter or double-tap to save.<br> - use newlines frequently.</sub></div>");
				
				var editor = src.parent().find('textarea');
				setTimeout(function() {
				 editor.focus();
				}, 0.1);
				$(editor).keydown(function (e) {
					if (e.ctrlKey && e.keyCode == 13) {
						// Ctrl-Enter pressed
						SubmitTrans(src.data('id'),editor.val());
					}
				});
				var tapped=false
				$(editor).on("touchstart",function(e){
					if(!tapped){
						tapped=setTimeout(function(){
							tapped=false
						},300);
					} else { //double tap
						clearTimeout(tapped);
						tapped=false
						SubmitTrans(src.data('id'),editor.val());
					}
				});
			}
		});
		
		for(var i=0;i<Object.keys(data.Categories).length;i++){
			$('#memecats').append('<a class="btn cat" data-cat="'+Object.keys(data.Categories)[i]+'">'+Object.keys(data.Categories)[i]+' <i class="votes">('+Object.values(data.Categories)[i]+')</i> <span class="del">&times;</span></a>');
		}
		$('#memecats').off().on('click','.del',function(e){
			ele=$(this).parent();
			e.stopPropagation();
			$.ajax({
				url:window.location.pathname+'?get&rmcat='+encodeURIComponent(ele.text().substr(0,ele.text().lastIndexOf('(')-1)),
				success:function(data){
					if(data.success==1){
						if(data.votes==null) CatVote(e.target.parentElement,-1);
						else{
							ele.html('<strike>'+data.name+' ('+data.votes+')</strike> <span class="del">&times;</span>');
							TagVote(e.target.parentElement,0);
						}
					}else{
						alert(data.msg);
					}
				}
			});
		});
		$('#memecats').off().on('click','.cat',function(e){
			ele=$(this);
			$.ajax({
				url:window.location.pathname+'?get&'+(ele.is('.active')?'unvote':'add')+'cat='+encodeURIComponent(ele.text().substr(0,ele.text().lastIndexOf('(')-1)),
				success:function(data){
					if(data.success==1){
						ele.html(data.name+' ('+data.votes+') <span class="del">&times;</span>');
						if(data.votes==null) CatVote(e.target,-1);
						CatVote(e.target,(ele.is('.active')?0:1));
					}else{
						alert(data.msg);
					}
				}
			});
		});
		for(var i=0;i<Object.keys(data.Tags).length;i++){
			$('#memetags').append('<a class="tag" data-tag="'+Object.keys(data.Tags)[i]+'">'+Object.keys(data.Tags)[i]+' <i class="votes">('+Object.values(data.Tags)[i]+')</i> <span class="del">&times;</span></a>');
		}
		$('#memetags').off().on('click','.del',function(e){
			ele=$(this).parent();
			e.stopPropagation();
			$.ajax({
				url:window.location.pathname+'?get&rmtag='+encodeURIComponent(ele.text().substr(0,ele.text().lastIndexOf('(')-1)),
				success:function(data){
					if(data.success==1){
						if(data.votes==null) TagVote(e.target.parentElement,-1);
						else{
							ele.html('<strike>'+data.name+' ('+data.votes+')</strike> <span class="del">&times;</span>');
							TagVote(e.target.parentElement,0);
						}
					}else{
						alert(data.msg);
					}
				}
			});
		});
		$('#memetags').off().on('click','.tag',function(e){
			ele=$(this);
			$.ajax({
				url:window.location.pathname+'?get&'+(ele.is('.active')?'unvote':'add')+'tag='+encodeURIComponent(ele.text().substr(0,ele.text().lastIndexOf('(')-1)),
				success:function(data){
					if(data.success==1){
						ele.html(data.name+' ('+data.votes+') <span class="del">&times;</span>');
						if(data.votes==null) TagVote(e.target,-1);
						TagVote(e.target,(ele.is('.active')?0:1));
					}else{
						alert(data.msg);
					}
				}
			});
		});
		$('#averagespice').text((parseFloat(data.Edge)+1).toFixed(2));
		$('#memespice').addClass(numtoname[Math.round(parseFloat(data.EdgeVote)+1)]);
		$('#memespice').off().on('click',function(e){
			$.ajax({
				url:window.location.pathname+'?get&edge='+$(e.target).index().toString(),
				success:function(data){
					if(data.success==1){
						$('#averagespice').text((parseFloat(data.Edge)+1).toFixed(2));
						$('#memespice').removeClass('zero one two three four five').addClass(numtoname[Math.round(parseFloat(data.EdgeVote)+1)]);
					}else alert("Failed to set edge! "+data.msg);
				},
				error:function(){
					alert('Failed to set edge!');
				}
			});
		});
		
		// Everything is ready, show the editor.
		$('#memeeditor').show(0.125);
	}
	
	// Event handlers for when users add another category or tag to the memeeditor
	$('form.memetag').submit(function(e){
		e.preventDefault();
		if($('#memetagsearch').val().length>1){
			$.ajax({
				url:window.location.pathname+'?get&addtag='+encodeURIComponent($('#memetagsearch').val()),
				success: function(data){
					if(data.success==1){
						$(this).hide();
						if($('#memetags>a[data-tag="'+data.name+'"]').length==0){$('#memetags').append('<a class="tag active" data-tag="'+data.name+'">'+data.name+' ('+data.votes+') <span class="del">&times;</span></a>');}
						else{$('#memetags>a[data-tag="'+data.name+'"]').html(data.name+' ('+data.votes+') <span class="del">&times;</span>');}
						$('#memetagsearch').val('');
					}else alert('Failed to submit the tag: '+data.msg);
				},
				error: function(){
					alert('Failed to submit the tag; network error');
				}
			});
		}
	});
	$('form.memecat').submit(function(e){
		e.preventDefault();
		if($('#memecatsearch').val().length>1){
			$.ajax({
				url:window.location.pathname+'?get&addcat='+encodeURIComponent($('#memecatsearch').val()),
				success: function(data){
					if(data.success==1){
						$(this).hide();
						if($('#memecats>.cat[data-cat="'+data.name+'"]').length==0){$('#memecats').append('<a class="btn cat active" data-cat="'+data.name+'">'+data.name+' ('+data.votes+') <span class="del">&times;</span></a>');}
						else{$('#memecats>.cat[data-cat="'+data.name+'"]').html(data.name+' ('+data.votes+') <span class="del">&times;</span>');}
						$('#memecatsearch').val('');
						$('#memecatpicker').val('');
					}else if(data.success==0.5){
						alert(data.msg)
					}else alert('Failed to submit the category: '+data.msg);
				},
				error: function(){
					alert('Failed to submit the category; network error');
				}
			});
		}
	});
	
	// Allow users to change their edge
	function setEdge(edge){
		$.ajax({
			url:'/api/?setedge='+edge.toString(),
			success:function(data){
				if(data.success==1){
					$('#setedge').removeClass('zero one two three four five').addClass(numtoname[data.edge]);
					location.reload();
				}else alert("Failed to set edge! "+data.msg);
			},
			error:function(){
				alert('Failed to set edge!');
			}
		});
	}
	$('#setedge').on('click','span',function(){
		setEdge($(this).index());
	});
	
	// Framework for restricted meme warnings
	ShowBigBoy = function(bigboy=true,title="This page may contain <span class='accent'>NSFW</span> content!",msg='- Do you want to continue?',refreshOn=false){
		if(bigboy){
			$('html').addClass('lock');
			$('.memewrapper').show();
			$('.memewrapper').addClass('blur');
			$('#bigboy h1').html(title);
			$('#bigboy>div>span').html(msg);
			$('#bigboy').show(0.3);
			
			if(refreshOn){
				$('#bigboyconf').off().on('click',function(){
					setCookie('bigboy','ye',9999);
					setEdge(Math.round(parseFloat(singleedge.edge)));
				});
				$('#bigboydeny').off().on('click',function(){
					ShowBigBoy(false);
				});
			}else{
				$('#bigboyconf').off().on('click',function(){
					setCookie('bigboy','ye',9999);
					ShowBigBoy(false);
				});
				$('#bigboydeny').off().on('click',function(){
					setEdge(0);
				});
			}
		}else{
			$('html').removeClass('lock');
			if(!window.location.pathname.startsWith('/meme/')&&!window.location.pathname.startsWith('/collection/')) $('.memewrapper').hide();
			$('.memewrapper').removeClass('blur');
			$('#bigboy').hide(0.3);
		}
	}
	// Pop up 18+ warning if php says that the user hasn't consented and they're on a risque page
	if(typeof require18plusauth !== 'undefined'){
		ShowBigBoy();
	}
	
	// Event handler for when the url changes
	function onPop(e=null){
		if(window.location.pathname.startsWith('/meme/')||window.location.pathname.startsWith('/collection/')){
			var id=window.location.pathname.replace(/\/$/,'');
			id = id.substr(id.lastIndexOf('/')+1);
			if(window.location.pathname.indexOf('edit')>0){
				document.title="Meme editor - MemeDB";
				if(e!==null) PopUpMemeEditor(true,id);
			}
			else{
				if(window.location.pathname.startsWith('/collection/')){
					document.title="Collection #"+id+" - MemeDB";
				}else{
					document.title="Meme #"+id+" - MemeDB";
				}
				if(e!==null) PopUpMemePreview(true,id);
			}
		}
		else{
			if(window.location.pathname.startsWith('/tag/')){
				document.title='#'+decodeURI(window.location.pathname.replace(/\+/g,' ').substr(5,window.location.pathname.replace(/\/$/,'').lastIndexOf('/')-5)).replace('%2F','/')+' memes - MemeDB';
			}
			else if(window.location.pathname.startsWith('/search')){
				if(window.location.search.startsWith('?q=')){
					document.title = decodeURI(window.location.search.substr(3,window.location.search.indexOf('&')).replace(/\+/g,' ') + ' Search - MemeDB')
				}else document.title='Search - MemeDB';
			}
			else if(window.location.pathname.startsWith('/report')){
				document.title='Report - MemeDB';
			}
			else if(window.location.pathname.startsWith('/category/')|window.location.pathname.startsWith('/sort/')){
				document.title=decodeURI(window.location.pathname.replace(/\+/g,' ').substr(10,window.location.pathname.replace(/\/$/,'').lastIndexOf('/')-10)).replace('%2F','/')+' memes - MemeDB';
			}
			else if(window.location.pathname.startsWith('/user/fav')){
				document.title='My Favourite Memes - MemeDB';
			}
			else{
				document.title="Home - MemeDB";
			}
			if(e!==null) PopUpMemePreview(false);
		}
	}
	window.addEventListener('popstate', onPop);
	window.dispatchEvent(new Event('popstate'));
	
	// Open the meme preview or editor depending on where they clicked
	$('.memewrapper').on('click','.meme',function(e){
		e.preventDefault();
		e.stopPropagation();
		PopUpMemePreview(true,$(this).attr('data-id'));
		if($(this).is('.video')||$(this).is('.webm')){
			setTimeout(PauseVideo.bind(this),301);
		}
	});
	$('.memewrapper').on('click','.edit',function(e){
		e.preventDefault();
		e.stopPropagation();
		PopUpMemeEditor(true,$(this.parentElement).attr('data-id'));
	});
	$('.memewrapper').on('click','.upvote',function(e){
		e.preventDefault();
		e.stopPropagation();
		if($(this).is('.active')){
			MemeVote($(this.parentElement).attr('data-id'),0);
		}
		else{
			MemeVote($(this.parentElement).attr('data-id'),1);
		}
	});
	$('.memewrapper').on('click','.downvote',function(e){
		e.preventDefault();
		e.stopPropagation();
		if($(this).is('.active')){
			MemeVote($(this.parentElement).attr('data-id'),0);
		}
		else{
			MemeVote($(this.parentElement).attr('data-id'),-1);
		}
	});
	$('.memewrapper').on('click','.fav',function(e){
		e.preventDefault();
		e.stopPropagation();
		MemeFav($(this.parentElement).attr('data-id'),($(this).is('.active')?0:1));
	});
	$('.memewrapper').on('click','.video-controls',function(e){e.stopPropagation()});
	
	// Play gifs when the user mouses over them
	$('.memewrapper').on('mouseenter','.gif',function(){
		$(this).data('oldSrc',$(this).find('img').attr('src'));
		$(this).find('img').attr('src',$(this).data('src'));
	});
	$('.memewrapper').on('mouseleave','.gif',function(){
		$(this).find('img').attr('src',$(this).data('oldSrc'));
	});
	
	// Close any pop ups when the flood is clicked
	$('#memeflood').on('click',function(){
		PopUpMemePreview(false);
	});
	
	
	// Load more memes if the client is approaching the bottom of the screen.
	let scrolldone = false;
	let scrollrequest = null;
	if($('.wrapper').html().indexOf('<!--END-->')>0) scrolldone = true;
	else scrolldone = false;
	InfiniteScroll = function(reload = false){
		var scrollreload = reload;
		if(scrolldone && !reload) return false;
		if($(window).scrollTop() >= ($(document).height() - $(window).height())-1000 || reload){
			scrolldone = true; //sets a processing AJAX request flag
			var scroll = "&scroll="+($('.memewrapper>.page .meme').length).toString();
			if(reload) scroll = "";
			if(scrollrequest != null){
				scrollrequest.abort();
				scrollrequest = null;
			}
			scrollrequest = $.ajax({
				url:root+rootchar+"get"+scroll,
				success: function(data){
					if(scrollreload) $('.memewrapper').html('');
					$('.memewrapper').append(data);
					if(data.indexOf('<!--END-->')>0) scrolldone = true;
					else scrolldone = scrollreload;
					MemeSearch();
					ShowMemes();
					scrollrequest = null;
				},
				error: function(){
					scrolldone = false;
					scrollrequest = null;
				}
			});
		}
	}
	
	// Keep on loading memes until the scrollbar appears
	var fourkloop=window.setInterval(function(){
		if(document.documentElement.scrollHeight <= document.documentElement.clientHeight+200){
			InfiniteScroll();
		}else{
			window.clearInterval(fourkloop);
			window.clearTimeout(fourktimeout);
		}
	}, 3000);
	var fourktimeout=window.setTimeout(function(){
		window.clearInterval(fourkloop);
	},12000);
	
	$(window).scroll(function(){InfiniteScroll()}); //Call the infinitescroll function whenever the window scrolls
});

// Submit functions
function TagVote(obj,value){
	if(value<0) $(obj).remove();
	else if(value==0) $(obj).removeClass('active');
	else $(obj).addClass('active');
}
function CatVote(obj,value){
	if(value<0) $(obj).remove();
	else if(value==0) $(obj).removeClass('active');
	else $(obj).addClass('active');
}
function MemeVote(id,value){
	$.ajax({
		url:'/api/',
		data:{vote:id,value:value},
		success:function(data){
			if(data.success==1){
				obj=$('.meme[data-id="'+id+'"],#memepreview[data-id="'+id+'"]');
				obj.find('.voteval').text(data.value);
				if(value>0){
					obj.find('.downvote').removeClass('active');
					obj.find('.upvote').addClass('active');
				}
				else if(value<0){
					obj.find('.upvote').removeClass('active');
					obj.find('.downvote').addClass('active');
				}
				else{
					obj.find('.downvote').removeClass('active');
					obj.find('.upvote').removeClass('active');
				}
			}else{
				alert(data.msg);
				if(data.msg=="You must be logged in to use this!"){
					LoginAndReturn();
				}
			}
		},
		error:function(data){
			alert(data);
		}
	});
}
function MemeFav(id,value){
	$.ajax({
		url:'/api/',
		data:{favourite:id,value:value},
		success:function(data){
			if(data.success==1){
				obj=$('.meme[data-id="'+id+'"],#memepreview[data-id="'+id+'"]');
				if(data.value=='0'){
					obj.find('.fav').removeClass('active');
				}
				else if(data.value=='1'){
					obj.find('.fav').addClass('active');
				}
			}else{
				alert(data.msg);
				if(data.msg=="You must be logged in to use this!"){
					LoginAndReturn();
				}
			}
		},
		error:function(data){
			alert(data);
		}
	});
}
function SubmitTrans(transid,text){
	$.ajax({
		url:window.location.pathname+'?get=&trans=&edit='+transid+'&text=',
		method:'POST',
		data:{text:text},
		success:function(data){
			if(data.success==1){
				if($('#memetrans>.trans').length<=1){
					$('#memetrans').empty()
				}else{
					$('#memetrans').find('.trans'+(typeof transid=='undefined'?':not([data-id])':'[data-id='+transid+']')+'>.editor').remove();
				}
				$('#memetrans').prepend("<p class='trans active' data-id='"+data.Id+"'>"+data.Text+' <i class="votes">('+data.Votes+")</i>&nbsp;</p>");
			}else{
				alert(data.msg);
				if(data.msg=="You must be logged in to use this!"){
					LoginAndReturn();
				}
			}
		},
		error:function(data){
			alert(data);
		}
	});
}
function SubmitDesc(descid,text){
	$.ajax({
		url:window.location.pathname+'?get=&desc=&edit='+descid,
		method:'POST',
		data:{text:text},
		success:function(data){
			if(data.success==1){
				if($('#memedesc>.desc').length<=1){
					$('#memedesc').empty()
				}else{
					$('#memedesc').find('.desc'+(typeof descid=='undefined'?':not([data-id])':'[data-id='+descid+']')+'>.editor').remove();
				}
				$('#memedesc').prepend("<p class='desc active' data-id='"+data.Id+"'>"+data.Text+' <i class="votes">('+data.Votes+")</i>&nbsp;</p>");
			}else{
				alert(data.msg);
				if(data.msg=="You must be logged in to use this!"){
					LoginAndReturn();
				}
			}
		},
		error:function(data){
			alert(data);
		}
	});
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

if(window.location.pathname.startsWith('/search')){
	let lastfilterstring = $('#search').val().toLowerCase().replace(/ /g,'');
	let pendingrefresh = null;
	function MemeSearch() {
		var filterstring = $('#search').val().toLowerCase().replace(/ /g,'');
		$('.meme[data-search]').each(function(i,a){
			if(filterstring==''){
				$(a).attr('style','display:none;');
			}else{
				if($(a).data('search').toLowerCase().indexOf(filterstring)<0){
					$(a).attr('style','display:none;');
				}else{
					$(a).attr('style','');
				}
			}
		});
		if(!filterstring==''){
			document.title = $('#search').val()+' Search - MemeDB';
			window.history.pushState('/search/?q='+encodeURIComponent($('#search').val().toLowerCase()).replace('%20','+'), $('#search').val()+' Search - MemeDB', '/search/?q='+encodeURIComponent(filterstring).replace('%20','+'));
		}else{
			document.title = 'Search - MemeDB';
			window.history.pushState('/search/', 'Search - MemeDB', '/search/');
		}
		if(filterstring !== lastfilterstring && typeof InfiniteScroll === 'function'){
			lastfilterstring = filterstring;
			root = window.location.pathname + window.location.search;
			if(root.indexOf('?')>0) rootchar = '&';
			else rootchar = '?';
			if(pendingrefresh != null){
				clearTimeout(pendingrefresh);
				pendingrefresh = null;
			}
			$('.memewrapper>div.rem:last-child').text("Looking for more results...");
			pendingrefresh = window.setTimeout(function(){InfiniteScroll(true);}, 500);
		}
	}
	MemeSearch();
	$('#search').on('change paste keyup',MemeSearch);
}else{
	function MemeSearch(){return null;}; // stub
}

// Lift the curtain
function ShowMemes(){
	var mem = $('.meme:not(.show)').first();
	if(mem.length==0) return;
	mem.addClass('show');
	mem.filter('.video,.webm').each(function(){
		createPlayer(this);
	});
	setTimeout(ShowMemes,20);
}
ShowMemes();