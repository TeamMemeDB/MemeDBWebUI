function FilterTags() {
	$('#filtertags>a').each(function(i,a){
		var filterstring = $('#tagfilter').val().toLowerCase();
		if($(a).text().toLowerCase().indexOf(filterstring)<0){
			$(a).hide();
		}else{
			$(a).show();
		}
	});
}
function taglist(tfilter='') {
	let result=[];
	var filter = tfilter.toLowerCase();
	$('#filtertags>a').each(function(i,a){
		if($(a).text().toLowerCase().indexOf(filter)>=0){
			result.push($(a).text().substring(1,$(a).text().lastIndexOf('(')-1));
		}
	});
	return result;
}
function catlist(tfilter='') {
	let result=[];
	var filter = tfilter.toLowerCase();
	$('#filtercats>a').each(function(i,a){
		if($(a).text().toLowerCase().indexOf(filter)>=0){
			result.push($(a).text().substring(0,$(a).text().lastIndexOf('(')-1));
		}
	});
	return result;
}
var cats=catlist()
cats.forEach(function(a){
	$('#memecatpicker').append('<option value="'+a+'">'+a+'</option>')
});
autocomplete(document.getElementById("memecatsearch"),catlist());
autocomplete(document.getElementById("memetagsearch"),taglist());

$("#memecatpicker").change(function(){         
	$("#memecatsearch").val($("#memecatpicker option:selected").text());
	$(this).closest('form').submit();
});

$('#memecatsearch,#memetagsearch').keydown(function (event) {
	var keypressed = event.keyCode || event.which;
	if (keypressed == 13) {
			$(this).closest('form').submit();
	}
});

let PopUp = null;

function is_touch_device() {
	var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
	var mq = function(query) {
		return window.matchMedia(query).matches;
	}

	if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
		return true;
	}

	// include the 'heartz' as a way to have a non matching MQ to help terminate the join
	// https://git.io/vznFH
	var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
	return mq(query);
}
// Let CSS know if the client can't hover
if(is_touch_device()){
	$('html').addClass('touch');
}

function LoginAndReturn(){
	window.location='/user/login/?return='+encodeURIComponent(window.location.pathname);
}

function StayLoggedIn(){
	$.ajax({
		url:'/user/?rememberme',
		success:function(data){
			if(data=='1'){
				PopUp(false);
			}else{
				alert("Something might've gone wrong... "+data);
			}
		},
		error:function(){
			alert("The server failed to send a response.");
		}
	});
}

$(document).ready(function(){
	// Build and show pop ups
	PopUp = function(show,html='',frame="modal"){
		if(show){
			$('html').addClass('lock');
			$('#flood').show(0.125);
			$('.wrapper').addClass('blur');
			$('header').addClass('blur');
			$('#'+frame).show(0.125);
			$('#'+frame).html(html);
		}else{
			$('html').removeClass('lock');
			$('#flood').hide(0.125);
			$('.wrapper').removeClass('blur');
			$('header').removeClass('blur');
			$('#modal').hide(0.125,function(){
				$('#modal').html('');
			});
			$('#prompt').hide(0.125,function(){
				$('#prompt').html('');
			});
		}
	}
	
	$('#flood').on('click',function(){
		PopUp(false);
	});
	
	$('.control-panel>nav a').on('click',function(){
		$('.control-panel>nav a.active').removeClass('active');
		$('.control-panel>.page').hide();
		$('#'+$(this).data('page')+'-page').show();
		$(this).addClass('active');
	});
});

function SearchSubmit(e){
	if($(this).parent().find('input[type=text]').val()){
		$(this).parent().submit();
	}
	else{
		window.location = '/search'
	}
}