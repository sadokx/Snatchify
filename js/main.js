var Snatch = {
	$company: $('.app-company'),
	$category: $('#category'),
	$version: $('#version'),
	$name: $('.app-title'),
	$wrapper: $('.wrapper'),
	$content: $('.content'),
	$form: $('form'),
	$spinner: $('.spinner'),
	$error: $('.error'),
	toggleLoading: function(){
		// Toggle loading indicator
		this.$spinner.toggleClass('display-none');

		// Toggle the submit button so we don't get double submissions
        // http://stackoverflow.com/questions/4702000/toggle-input-disabled-attribute-using-jquery
        this.$form.find('button').prop('disabled', function(i,v) { return !v; });
	},
	userInput: '',
	userInputIsValid: false,
	appID: '',
	validate: function(input){
		// validation happens here
		// Use regex to test if input is valid. It's valid if:
        // 1. It begins with 'http://itunes'
        // 2. It has '/id' followed by digits in the string somewhere
        var regUrl = /^(http|https):\/\/itunes/;
        var regId = /\/id(\d+)/i;
        if ( regUrl.test(this.userInput) && regId.test(this.userInput) ) {
            this.userInputIsValid = true;
            var id = regId.exec(this.userInput);
            this.appID = id[1];
        } else {
            this.userInputIsValid = false;
            this.appId = '';
        }
	},
	throwError: function(text){
		this.$error.removeClass('error-pop');

		// Trigger reflow
        // https://css-tricks.com/restart-css-animation/
		this.$error[0].offsetWidth = this.$error[0].offsetWidth;

		this.$error
			.html(text)
			.removeClass('display-none')
			.addClass('error-pop');
		this.toggleLoading();
	},
	render: function(response){
		$('.content img').remove();
		var icon = new Image();
		icon.src = response.artworkUrl512;
		icon.onload = function(){
			Snatch.$content.prepend(this);
			Snatch.$error.addClass('display-none');
			Snatch.$wrapper.removeClass('display-none');
			Snatch.toggleLoading();

			// Load app info
			Snatch.$name.html(response.trackName);
			Snatch.$company.html('By ' + response.sellerName);
			Snatch.$category.html('Category: ' + response.primaryGenreName);
			Snatch.$version.html('Version: ' + response.version);

			$('#download-button').prop("href", response.artworkUrl512);
		}
	}
};




$(document).ready(function(){
	Snatch.$form.on('submit', function(e) {
		$('.link-example-button').addClass('display-none');
		Snatch.$wrapper.addClass('display-none');
		e.preventDefault();
		Snatch.toggleLoading(); // Call the loading function

		Snatch.userInput = $(this).find('input').val();
		Snatch.validate();
		if( Snatch.userInputIsValid){

			// API Request
			$.ajax({
				url: "https://itunes.apple.com/lookup?id=" + Snatch.appID,
				dataType: 'JSONP'
			})
			.done(function(response){
				// when finished
				var response = response.results[0];
				

				// Check to see if request is valid & contains the info we want
    			// If it does, render it. Otherwise throw an error
			    if(response && response.artworkUrl512 != null){
			        setTimeout(function() { Snatch.render(response); }, 1000);
			    } else {
			        Snatch.throwError('The request you made appears to not have an associated icon. <br> Try a different URL.');
				}	
			})
			.fail(function(data){
				// when failed
				Snatch.throwError('<em>API error.</em> There was an error retrieving the info. Check the URL or try again later.');
			});
			

		} else{
			// Error
			Snatch.throwError('<em>Error.</em> Invalid app link. Try again.');
			
		}
	});

	$('.link-example-button').click(function(){
		$('#input-link').val('https://itunes.apple.com/us/app/straight-outta-meme-maker/id1028920046?mt=8');
	})
});







