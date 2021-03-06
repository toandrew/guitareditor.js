var tabsInstance;

function getUrlParams()
{
	var params = {};
    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
    	params[key] = value;
    });
	return params;
}

function selectActiveTab(tabId)
{
	$(".tab.active").removeClass("active");
	$("section").removeClass("nodisplay").addClass("nodisplay");
	$("section#"+tabId).removeClass("nodisplay");

	//$(".tab")
	//$(this).addClass("active");
	$("a.tab[data-tab='"+tabId+"']").addClass("active");

	$("#ascii-text").trigger('autosize');
	$("#ktg").trigger("autosize");

	if (tabId=="editor")
		$(".active .tabblock").focus();
}

var staveWidth=800;
var prevActiveTabBlock=null;

function handleFilesLoad(file)
{
   	var reader = new FileReader();
	reader.onload = function(e) { 
		var contents = e.target.result;
		$("#ktg").val(contents).trigger("autosize");		
		tabsInstance.load($("#ktg").val());
	   	$("#input-file-ktg").val("");
	}
	reader.readAsText(file[0]);
}

$(document).ready(function(){

	tabsInstance=new KORDS.TABS.TabsInstance();

    params=getUrlParams();
    //console.log(params);

    if (params['api-mode']=="editor")
    {
    	$("body").attr("style","background:none")
    	tabsInstance.tabsEditor.setEditorMode(true,params['show-song-info']!="false");
    	selectActiveTab("editor");
    }
    else if (params['api-mode']=="viewer")
    {
    	staveWidth=params['stave-width'];
    	$("body").addClass("viewer");
    	tabsInstance.tabsEditor.setEditorMode(true,params['show-song-info']!="false");
    	$("header").hide();
    	$(".pretty-tab").attr("style","width:"+params['stave-width']+"px");
    }

/*
	$(body).resize(function(){
		console.log("LOL");
		window.parent.postMessage({action:"on-resize",height:$(this).height()}, '*');
	});
*/


    //if (params['song-info']=false)
//	$("#tabs").tabs();

	$("#text").val("");
	$("#ascii-text,#ktg").autosize();
/*
	$(document).keydown(function(e){
		//console.log(e);
		return tabsInstance.tabsEditor.onKeyDown(e);
	});
*/

/*
	$(document).on("keydown", ".tabblock,.tabtext", function(e){
		return tabsInstance.tabsEditor.onKeyDown(e);
    });
*/
	
	$(document).on("blur",".tabblock", function(e){
	//$(".active .tabblock").on("blur",function(e){
		prevActiveTabBlock=$(this);
	});

	//@fixme
	$(document).on("keydown", ".tabblock", function(e){
		return tabsInstance.tabsEditor.onKeyDown(e);
    });

	$(document).on("keyup", ".tabtext", function(e){
		return tabsInstance.tabsEditor.onKeyDown(e);
    });

	$(document).on('click','.youtube_edit',function(){
		var parent=$(this).parents(".tabsection");
		$(".youtube_edit_data",parent).show();
		$(".youtube_title",parent).hide();
		return false;
	});

    $(document).on('click','.loadyoutube',function() {
		tabsInstance.tabsEditor.setActiveSection($(this).parents(".tabsection"));
    	tabsInstance.tabsEditor.getCurrentSection().loadYoutubeLink();
	    return false;
    });

/*
	$(document).keydown(function(e){
		//console.log(e);
		//return tabsInstance.tabsEditor.onKeyUp(e);
	});
*/

	$("#songdata #song").change(function(){
		tabsInstance.tabsEditor.changeSongTitle($(this).val());
	});

	$("#songdata #artist").change(function(){
		tabsInstance.tabsEditor.changeSongArtist($(this).val());
	});

	$("#songdata #transcriber").change(function(){
		tabsInstance.tabsEditor.changeSongTranscriber($(this).val());
	});


	
	// Insert chords
	html="";
	for (var mode in chords)
	{
		html+='<optgroup label="'+mode+'"/>';
		for (var chord in chords[mode])
			html+='<option mode="'+mode+'" value="'+chord+'">'+chord+'</option>';
	}

	$("#chords").html(html);

	$("#new_ktb").click(function(){
		tabsInstance.reset();
		$("#ktg").val("").trigger("autosize");
	});

	$("#save_ktb").click(function(){
		var ktg=tabsInstance.song.save();
		
		var filaname=nvl(tabsInstance.song.data.info.title,"noname")+"-"+nvl(tabsInstance.song.data.info.artist,"noauthor");
		filename=sluggify(filaname);

		var blob = new Blob([ktg], {type: "text/plain;charset=utf-8"});
		saveAs(blob, filename+".ktg");

		$("#ktg").val(ktg).trigger("autosize");
		return false;
	});


	$("#generate_ktb").click(function(){
		var ktg=tabsInstance.song.save();
		//console.log(ktg);

/*		var fileName="test";
		var blob = new Blob([ktg], {type: "text/plain;charset=utf-8"});
		saveAs(blob, fileName+".ktg");
*/
		$("#ktg").val(ktg).trigger("autosize");
		return false;
	});

	$("#load_ktb").click(function()	{
  		if (window.File && window.FileReader && window.FileList && window.Blob) 
	  		$("#input-file-ktg").click();
		else 
  			alert('The File APIs are not fully supported by your browser.');
		return false;
	});

	$("#insert-chords").click(function(){
		var id=parseInt($(".tabsection.active").attr("data-id"));
		var selected=$("#chords").find(":selected");
		//tabsInstance.tabsEditor.htmlSections[id].insertChord($("#chords").val());
		tabsInstance.tabsEditor.htmlSections[id].insertChord(selected.attr("value"),selected.attr("mode"));
		prevActiveTabBlock.focus();
		return false;
	});

	$(".modifier").click(function(){
		var id=parseInt($(".tabsection.active").attr("data-id"));
		tabsInstance.tabsEditor.htmlSections[id].insertModifier($(this).attr("data-modifier"));
		return false;
	});

	$("#lfingers a").click(function(){
		var id=parseInt($(".tabsection.active").attr("data-id"));
		var finger=$(this).attr("data-modifier").replace("lfinger","");
		tabsInstance.tabsEditor.htmlSections[id].setLFingerValue(finger);
		return false;
	});

	$("#open-tabtext").click(function(){
		var id=parseInt($(".tabsection.active").attr("data-id"));
		tabsInstance.tabsEditor.htmlSections[id].showTextDialog();
		return false;
	});

	$(".tab").click(function(){
		var id=$(this).attr("data-tab");
		selectActiveTab(id);
		return false;
	});

	$(".colmodifier").click(function(){
		var id=parseInt($(".tabsection.active").attr("data-id"));
		tabsInstance.tabsEditor.htmlSections[id].insertColumnModifier($(this).attr("data-modifier"));
		return false;
	});

	$("#parse_tab").click(function(){
		var parser=new KORDS.TABS.TabParser($("#text").val());
		tabsInstance.tabsEditor.loadFromParser(parser.parse());
		return false;
	});

	window.addEventListener("message", receiveMessage, false);
	//tabsInstance.load($("#ktg").val());

//	window.parent.postMessage({action:"on-resize",height:$(window).height()}, '*');
/*
    console.log(">>>>>>>>>>");
	$(body).resize(function () {
		//console.log($(window).width()+" "+$(window).height());
		//console.log($(window).height());
		window.parent.postMessage({action:"on-resize",height:$(this).height()}, '*');
    });
*/
    window.parent.postMessage({action:"on-resize",height:$("body").height()}, '*');
});

function receiveMessage(event)
{
  	//if (event.origin !== "http://example.org:8080")
    //return;
    // ...
  	if (event.data.action=="get-tabs")
  	{
		var ktg=tabsInstance.song.save();
		event.source.postMessage({action:'return-tabs',tabs:ktg}, '*');
  	}
  	else if (event.data.action=="on-width-resize")
  	{
  		console.log(">>>>>>>>>>>>>>>>> ASDFASDFASDF");
  	}
  	else if (event.data.action=="load-tabs")
  	{
  		tabsInstance.load(event.data.tabs);
  		window.parent.postMessage({action:"on-resize",height:$("body").height()}, '*');
  	}
	//console.log(event);
}
