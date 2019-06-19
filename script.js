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

	var $containerSurvey = $('#cndce-survey-container');


	var $containerStartSurvey = $('#cndce-start-survey-container');
	var $containerBasicDetails = $('#cndce-basic-details-container');
	var $containerQuestions = $('#cndce-questions-container');

	var $formStartSurvey = $('form.cndce-start-survey-row', $containerStartSurvey);
	var $formBasicDetails = $('form.cndce-basic-details-row', $containerBasicDetails);


	var $questionsHeader = $('#cndce-questions-header');
	var $questionDetailsContainer = $('.cndce-question-details-container', $containerQuestions);
	var $questionDetailsTemplate = $('.cndce-question-details.cndce-template', $containerQuestions);

	var $inputQuestionNum = $('#question-num-input');
	var $inputResponseTracking = $('#response-tracking-input');
	var $inputSurveyCreated = $('#survey-created-input');
	var $inputSurveySkipLogic = $('#survey-skip-logic-input');
	var $inputStartDate = $('#start-date-input');
	var $inputEndDate = $('#end-date-input');

	var $inputFilesDropzone = $('#cndce-files-dropzone');

	var $btnGenerateSurvey = $('#cndce-generate-survey-button');
	var $btnEditQuestions = $('#cndce-edit-questions-button');

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

			$header.data('$details', $details);

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

		var $questionNumContainer = $('.cndce-question-numpad', $details);
		var $questionNumColTemplate = $('.cndce-question-num-col.cndce-template', $details);

		var numKeys = [1,2,3,4,5,6,7,8,9,'*',0,'#'];

		// Initialize numpad
		for(var i=0; i < numKeys.length; i++){
			var $questionNumCol = getTemplate($questionNumColTemplate);

			$('.cndce-num', $questionNumCol).text(numKeys[i]);

			$questionNumContainer.append($questionNumCol);

		}

		// Add question index
		$details.attr('data-iQuestion', iQuestion);

		$questionDetailsContainer.append($details);


		// Initialize select
		$('.cndce-file-list, .cndce-questions-list', $details).addClass('mdb-select').materialSelect();

		// $('.mdb-select', $details).materialSelect();


		return $details;
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



	function initInputResponseTracking(){
		$('.cndce-option:last-child', $inputResponseTracking).prop('selected', true);
		updateSelectValue($inputResponseTracking);
	};


	(function initInputSurveyCreated(){

		$inputSurveyCreated.pickadate('set', {select: new Date()})

	})();


	

	(function initDropZone(){

		dropzone = new Dropzone('.cndce-dropzone', {
			url: '#',
			uploadMultiple: true,
			addRemoveLinks: true
		});


		dropzone.on('addedfile', function(file, response, e, f){
			addFile(file);
		})

		dropzone.on('removedfile', function(file){
			removeFile(file);
		})

	})();


	(function testVars(){
		CNDCE.questions = questions;
		CNDCE.dropzone = dropzone;
		CNDCE.files = files;
	})();


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
		$(this).toggleClass('active');
	})

	$containerQuestions.on('click', '.cndce-question-input', function(e){
		e.stopPropagation();
	})


	$btnGenerateSurvey.click(function(){

		$formStartSurvey.addClass('was-validated');

		if($formStartSurvey[0].checkValidity() || CNDCE_TEST_MODE != undefined){
			$containerStartSurvey.addClass('cndce-collapse');
			$containerBasicDetails.addClass('cndce-show');

			initQuestions();
		}
		
	})

	$btnEditQuestions.click(function(){

		$formBasicDetails.addClass('was-validated');

		if($formBasicDetails[0].checkValidity() || CNDCE_TEST_MODE != undefined){
			$containerBasicDetails.removeClass('cndce-show');
			$containerBasicDetails.addClass('cndce-collapse');
			$containerQuestions.addClass('cndce-show');
		}
		
	})





})