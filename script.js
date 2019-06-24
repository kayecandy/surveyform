/***************************************************************************
 *  																	   *
 *																		   *
 *	     ___           ___           ___           ___           ___       *
 *	    /  /\         /  /\         /  /\         /  /\         /  /\      *
 *	   /  /::\       /  /::|       /  /::\       /  /::\       /  /::\     *
 *	  /  /:/\:\     /  /:|:|      /  /:/\:\     /  /:/\:\     /  /:/\:\    *
 *	 /  /:/  \:\   /  /:/|:|__   /  /:/  \:\   /  /:/  \:\   /  /::\ \:\   *
 *	/__/:/ \  \:\ /__/:/ |:| /\ /__/:/ \__\:| /__/:/ \  \:\ /__/:/\:\ \:\  *
 *	\  \:\  \__\/ \__\/  |:|/:/ \  \:\ /  /:/ \  \:\  \__\/ \  \:\ \:\_\/  *
 *	 \  \:\           |  |:/:/   \  \:\  /:/   \  \:\        \  \:\ \:\    *
 *	  \  \:\          |__|::/     \  \:\/:/     \  \:\        \  \:\_\/    *
 *	   \  \:\         /__/:/       \__\::/       \  \:\        \  \:\      *
 *	    \__\/         \__\/            ~~         \__\/         \__\/      *
 * 																		   *
 *																		   *
 ***************************************************************************/
var CNDCE = {};

$(function(){
	var DATE_FORMAT = 'yyyy-mm-dd';
	var DTMF_NUMKEYS = [1,2,3,4,5,6,7,8,9,'*',0,'#'];

	var $containerSurvey = $('#cndce-survey-container');


	var $containerStartSurvey = $('#cndce-start-survey-container');
	var $containerBasicDetails = $('#cndce-basic-details-container');
	var $containerQuestions = $('#cndce-questions-container');

	var $formStartSurvey = $('form.cndce-start-survey-row', $containerStartSurvey);
	var $formBasicDetails = $('form.cndce-basic-details-row', $containerBasicDetails);


	var $questionsHeader = $('#cndce-questions-header');
	var $questionDetailsContainer = $('.cndce-question-details-container', $containerQuestions);
	var $questionDetailsTemplate = $('.cndce-question-details.cndce-template', $containerQuestions);

	var $questionsPreviewContainer = $('#cndce-questions-preview-container');
	var $questionsPreviewTemplate = $('.cndce-questions-preview.cndce-template', $questionsPreviewContainer);

	var $inputQuestionNum = $('#question-num-input');
	var $inputResponseTracking = $('#response-tracking-input');
	var $inputSurveyCreated = $('#survey-created-input');
	var $inputSurveySkipLogic = $('#survey-skip-logic-input');
	var $inputStartDate = $('#start-date-input');
	var $inputEndDate = $('#end-date-input');
	var $inputTrunk = $('#trunk_id');
	var $inputVolume = $('#volume-input');
	var $inputSurveyID = $('#id-input')

	var $inputFilesDropzone = $('#cndce-files-dropzone');

	var $sliderVolume = $('#volume-slider');

	var $btnGenerateSurvey = $('#cndce-generate-survey-button');
	var $btnEditQuestions = $('#cndce-edit-questions-button');
	var $btnPreview = $('#cndce-preview-button');
	var $btnPreviewBack = $('#cndce-preview-back-button');

	var $btnsFileUpload = $('.cndce-upload-wrapper .cndce-upload-button');

	var dropzone;

	var questions = [];
	var files = [];

	$('input.timepicker').pickatime();

	

	function getTemplate($template){
		return $template
			.clone(true)
			.removeClass('cndce-template');
	}

	function getFormattedDate(date){
		// FORMAT - yyyy/mm/dd
		return date.getFullYear() + '-' + ((date.getMonth() + 1) + '').padStart(2, 0) + '-' + (date.getDate() + '').padStart(2, 0);
	}



	function addFile(file){
		var $fileList = $('select.cndce-file-list');


		files.push(file);
		file.options = [];

		$fileList.each(function(){
			var $select = $(this);
			var $option = $('<option class="cndce-file">' + file.name + '</option>');

			$select.append($option);
			file.options.push($option);

			updateSelectValue($select);

		});


		// Set added file as value to a select
		// Called when file is uploaded through an individual upload button
		if(file.$cndceInput){
			var $select = $('select.cndce-file-list', file.$cndceInput);

			$select.val(file.name);
		}
	}

	function removeFile(file){
		var $fileList = $('select.cndce-file-list');

		var iFile = files.indexOf(file);


		for(var i=0; i < file.options.length; i++){
			if(file.options[i].prop('selected')){
				file.options[i].parent().val('');
			}
			file.options[i].remove();
		}

		$fileList.each(function(){
			updateSelectValue($(this));
		})

		if(iFile >= 0){
			files.splice(iFile, 1);
		}
	}

	function animateOnce($el, animation){
		$el.addClass(animation);
		$el.addClass('animated');

		$el.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
			$el.removeClass(animation);
		})
	}

	function validateQuestionDetailsForms(){
		var $formQuestionDetails = $('.cndce-question-details:not(.cndce-template) form.cndce-question-details-form', $containerQuestions);

		$formQuestionDetails.addClass('was-validated');

		for(var i=0; i < $formQuestionDetails.length; i++){
			if(!$formQuestionDetails[i].checkValidity()){
				// Goto Question
				$formQuestionDetails
					.eq(i)
					.parents('.cndce-question-details')
					.data('$header')
					.click();

				return CNDCE_TEST_MODE;
			}
		}

		return true;
	}

	function invalidForm($form){
		var $invalids = $(':invalid', $form);

		$invalids.each(function(){
			var $invalid = $(this);

			animateOnce($invalid.parents('.md-form'), 'shake');
		})

		// Scroll to first invalid
		if($invalids.length > 0){
			var $scrollbar = $form.parents('.scrollbar');
			$scrollbar.animate({
				scrollTop: $invalids.eq(0).offset().top - $scrollbar.offset().top
			})
		}
		

	}


	// Solution for MDB bug -___-"
	// Selected value becomes empty when updated
	// Very disappointed. Tsk tsk
	function updateSelectValue($selectNode){
		var $wrapper = $selectNode.parents('.cndce-select-wrapper');

		var observer = new MutationObserver(function(mutationList, observer){
			for(var mutation of mutationList){
				for(addedNode of mutation.addedNodes){
					if($(addedNode).is('div.select-wrapper')){
						var $select = $('select', addedNode);

						initInputSelect($select);

						$('ul.dropdown-content li.active', addedNode).click();

						// Another bug - label doesn't go back down when value is empty
						if(!$select.val()){
							$(addedNode).siblings('label').removeClass('active');
						}
					}
				}
			}

			observer.disconnect();
		})


		observer.observe($wrapper[0], { childList: true})
	}




	function updateQuestions(){


		// Init Question Header and Details
		for(var i=0; i < questions.length; i++){
			// $inputResponseTracking.append('<option class="cndce-option">' + questions[i].name + '</option>');

			var $header = $('<div class="cndce-question-header">' + questions[i].name + '</div>');
			var $details = initQuestionDetail(questions[i], i);

			var $preview = initQuestionPreview(questions[i], i);

			$header.data('$details', $details);
			$details.data('$header', $header);

			$questionsHeader.append($header);

		}



		// Init Question Select Options
		var $selects = $('select.cndce-questions-list');

		$selects.each(function(){
			var $select = $(this);

			if($select.parents('.cndce-select-wrapper').hasClass('cndce-question-input-goto')){
				var iSelectedQuestion = $select.parents('.cndce-question-details').attr('data-iQuestion');

			}

			for(var i=0; i < questions.length; i++){
				var $option = $('<option class="cndce-option">' + questions[i].name + '</option>');


				if(iSelectedQuestion != undefined && i == parseInt(iSelectedQuestion) + 1){
					$option.prop('selected', true);
				}

				$select.append($option);
			}

			if(iSelectedQuestion != undefined){
				updateSelectValue($select);
			}
		})

		


		// Select first question
		$('.cndce-question-header:first-child', $questionsHeader).click();


		// Response Tracking Question Default
		initInputResponseTracking();
	}

	function initQuestionDetail(question, iQuestion){
		var $details = getTemplate($questionDetailsTemplate);

		// New IDs
		$('#question-label-input', $details).attr('id', 'question-label-input-' + iQuestion);
		$('label[for="question-label-input"]', $details).attr('for', 'question-label-input-' + iQuestion);

		$('#question-prompt-input', $details).attr('id', 'question-prompt-input-' + iQuestion);
		$('label[for="question-prompt-input"]', $details).attr('for', 'question-prompt-input-' + iQuestion);

		$('#question-audio-input', $details).attr('id', 'question-audio-input-' + iQuestion);
		$('label[for="question-audio-input"]', $details).attr('for', 'question-audio-input-' + iQuestion);





		// Initialize numpad
		var $questionNumContainer = $('.cndce-question-numpad', $details);
		var $questionNumColTemplate = $('.cndce-question-num-col.cndce-template', $details);


		for(var i=0; i < DTMF_NUMKEYS.length; i++){
			var $questionNumCol = getTemplate($questionNumColTemplate);

			$('.cndce-num', $questionNumCol).text(DTMF_NUMKEYS[i]);

			// New Numpad IDs
			$('#question-answer-input', $questionNumCol).attr('id', 'question-answer-input-' + iQuestion + '-' + i);
			$('label[for="question-answer-input"]', $questionNumCol).attr('for', 'question-answer-input-' + iQuestion + '-' + i);

			$('#question-goto-input', $questionNumCol).attr('id', 'question-goto-input-' + iQuestion + '-' + i);
			$('label[for="question-goto-input"]', $questionNumCol).attr('for', 'question-goto-input-' + iQuestion + '-' + i);


			$questionNumCol.attr('data-id', iQuestion + '-' + i);


			$questionNumContainer.append($questionNumCol);

		}

		// Add question index
		$details.attr('data-iQuestion', iQuestion);

		$questionDetailsContainer.append($details);


		// Initialize select
		var $selects = $('.cndce-file-list, .cndce-questions-list', $details)
		$selects.addClass('mdb-select').materialSelect();

		$selects.each(function(){
			initInputSelect($(this));
		})


		return $details;
	}

	function initQuestionPreview(question, iQuestion){
		var $preview = getTemplate($questionsPreviewTemplate);

		$('.question-num', $preview).text(iQuestion + 1);

		// Change data-for IDs
		$('.cndce-value[data-for="question-label-input"]', $preview).attr('data-for', 'question-label-input-' + iQuestion);
		$('.cndce-value[data-for="question-prompt-input"]', $preview).attr('data-for', 'question-prompt-input-' + iQuestion);
		$('.cndce-value[data-for="question-audio-input"]', $preview).attr('data-for', 'question-audio-input-' + iQuestion);


		// DTMF Keys
		var $dtmfKeyContainer = $('.cndce-dtmf-key-container', $preview);
		var $dtmfKeyTemplate = $('.cndce-dtmf-key.cndce-template', $dtmfKeyContainer);

		for(var i=0; i < DTMF_NUMKEYS.length; i++){
			var $dtmfKey = getTemplate($dtmfKeyTemplate);

			$('.cndce-dtmf-num', $dtmfKey).text(DTMF_NUMKEYS[i]);

			// Change DTMF data-for IDs
			$('.cndce-value[data-for="question-answer-input"]', $dtmfKey).attr('data-for', 'question-answer-input-' + iQuestion + '-' + i);
			$('.cndce-value[data-for="question-goto-input"]', $dtmfKey).attr('data-for', 'question-goto-input-' + iQuestion + '-' + i);

			$dtmfKey.attr('data-id', iQuestion + '-' + i);

			$dtmfKeyContainer.append($dtmfKey);
		}


		$questionsPreviewContainer.append($preview);

		return $preview;
	}

	function initQuestions(){
		var nQuestions = $inputQuestionNum.val();

		for(var i=0; i < nQuestions; i++){
			questions.push({
				'name': 'Question ' + (i + 1)
			})
		}

		updateQuestions();
	}


	function initInputSelect($select){
		var $selectWrapper = $select.parents('.cndce-select-wrapper');
		var $inputSelect = $('input.select-dropdown', $selectWrapper);

		$inputSelect
			.removeAttr('readonly')
			.addClass('form-control')
			.css('background-color', '#fff')
			.attr('placeholder', $('.mdb-main-label', $selectWrapper).text())

		if($select.prop('required')){
			$inputSelect
				.prop('required', true)

		}
	};

	(function initInputSelects(){
		var $selects = $('.mdb-select');
		$selects.materialSelect();

		$selects.each(function(){
			initInputSelect($(this));
		})

	})();

	(function initInputDates(){
		$('input.datepicker')
			.pickadate({
				format: DATE_FORMAT
			})
			.removeAttr('readonly');
	})();

	(function initInputTrunk(){
		$('ul.dropdown-content li.active', $inputTrunk.parents('.cndce-select-wrapper')).click();
	})();

	(function initInputVolume(){
		var volumeSlider = noUiSlider.create($sliderVolume[0], {
			start: 100, 
			step: 1,
			range: {
				'min': 0,
				'max': 200
			},
			pips: { // Show a scale with the slider
				mode: 'values',
				stepped: true,
				density: 5,
				values: [1,25,50,75,100,125,150,175,200]
			},
		});

		volumeSlider.on('update', function(){
			$inputVolume.val(parseInt(this.get()));
		})
	})();



	function initInputResponseTracking(){
		$('.cndce-option:last-child', $inputResponseTracking).prop('selected', true);
		updateSelectValue($inputResponseTracking);
	};


	(function initInputSurveyCreated(){

		$inputSurveyCreated.pickadate('set', {select: new Date()})

	})();

	(function initSurveyID(){
		$inputSurveyID.val((Math.random() * 1000000).toFixed(0));
		$inputSurveyID.trigger('change');
	})();


	

	(function initDropZone(){

		dropzone = new Dropzone('.cndce-dropzone', {
			url: '#',
			uploadMultiple: true,
			addRemoveLinks: true
		});


		dropzone.on('addedfile', function(file, response, e, f){
			addFile(file);

			// Change icon for non-images
			if(!file.type.match(/image.*/)){
				dropzone.emit('thumbnail', file, './assets/icon-audio.svg');
			}
		})

		dropzone.on('removedfile', function(file){
			removeFile(file);
		})

	})();

	(function testVars(){
		CNDCE.questions = questions;
		CNDCE.dropzone = dropzone;
		CNDCE.files = files;

		CNDCE_TEST_MODE = false;
	})();


	$containerSurvey.on('change', '.cndce-input', function(){
		var $input = $(this);
		var $valueDiv = $('.cndce-value[data-for="' + $input.attr('id') + '"]');

		if($input.attr('type') == 'checkbox'){
			if($input.prop('checked')){
				$valueDiv.text($input.attr('data-checked-value'));
			}else{
				$valueDiv.text($input.attr('data-unchecked-value'));
			}
		}else{
			$valueDiv.text($input.val());

		}
	})


	$inputSurveySkipLogic.change(function(){
		if($inputSurveySkipLogic.prop('checked')){
			$containerSurvey.addClass('cndce-survey-skip-enabled');
		}else{
			$containerSurvey.removeClass('cndce-survey-skip-enabled');
		}
	})

	$inputStartDate.change(function(){
		var startDate = new Date($inputStartDate.pickadate('get'));
		var endDate = new Date($inputEndDate.pickadate('get'));

		$inputEndDate.pickadate('set', {min: startDate});

		// Empty enddate if it's less than start date
		if(endDate < startDate){
			$inputEndDate.pickadate('set', 'clear');
		}

	})


	$btnsFileUpload.siblings('input[type="file"]').change(function(e){
		if(this.files.length > 0){
			this.files[0].$cndceInput = $(this).parents('.cndce-upload-wrapper');
			dropzone.addFile(this.files[0]);
		}

	})


	$btnsFileUpload.click(function(){
		var $btn = $(this);
		var $inputFile = $btn.siblings('input[type="file"]');

		$inputFile.click();

	})

	$questionsHeader.on('click', '.cndce-question-header', function(){
		var $header = $(this);

		$('.active', $questionsHeader).removeClass('active');
		$header.addClass('active');

		$('.cndce-question-details.active', $questionDetailsContainer).removeClass('active');
		$header.data('$details').addClass('active');
	})

	$containerQuestions.on('click', '.cndce-question-num', function(e){
		var $this = $(this);
		var id = $this.parent().attr('data-id');
		var $preview = $('.cndce-dtmf-key[data-id="' + id + '"]');

		$this.toggleClass('active');
		$preview.toggleClass('active');


		// Require answer input
		var $answerInput = $('.question-answer-input', $this);
		$answerInput.prop('required', $this.hasClass('active'));


		// Select answer input
		$answerInput.focus();

	})

	$containerQuestions.on('click', '.cndce-question-input', function(e){
		e.stopPropagation();
	})




	$btnGenerateSurvey.click(function(){

		$formStartSurvey.addClass('was-validated');

		if($formStartSurvey[0].checkValidity() || CNDCE_TEST_MODE){
			$containerStartSurvey.addClass('cndce-collapse');
			$containerBasicDetails.addClass('cndce-show');

			// Disable Number of Questions input
			var $btnsQuestionNum = $('button', $inputQuestionNum.parents('.cndce-num-input'));

			$inputQuestionNum.prop('disabled', true);
			$btnsQuestionNum.prop('disabled', true);

			initQuestions();
		}else{
			
			invalidForm($formStartSurvey);
			animateOnce($btnGenerateSurvey, 'shake');
		}
		
	})

	$btnEditQuestions.click(function(){

		$formBasicDetails.addClass('was-validated');

		if($formBasicDetails[0].checkValidity() || CNDCE_TEST_MODE){
			$containerBasicDetails.removeClass('cndce-show');
			$containerBasicDetails.addClass('cndce-collapse');
			$containerQuestions.addClass('cndce-show');
		}else{
			invalidForm($formBasicDetails);
			animateOnce($btnEditQuestions, 'shake');
		}
		
	})


	$btnPreview.click(function(){

		if(	($formStartSurvey[0].checkValidity()
			&& $formBasicDetails[0].checkValidity()
			&& validateQuestionDetailsForms()) || CNDCE_TEST_MODE){

			$('.cndce-input').trigger('change');

			$containerSurvey.addClass('cndce-preview');
		}else{

			invalidForm($formStartSurvey);
			invalidForm($formBasicDetails);
			invalidForm($('.cndce-question-details.active form.cndce-question-details-form'));
			animateOnce($btnPreview, 'shake');
		}

		
	})

	$btnPreviewBack.click(function(){
		$containerSurvey.removeClass('cndce-preview');
	})


	

	$containerBasicDetails.add($inputFilesDropzone).on('dragenter', function(e){

		$containerBasicDetails.addClass('dragenter');

	})

	$inputFilesDropzone.on('dragleave drop', function(e){
		$containerBasicDetails.removeClass('dragenter');

	});


})