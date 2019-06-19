// +----------------------------------------------------------------------+
// | MCAT Portal - Multi-Carrier Aggregate Trunking Client Portal         |
// +----------------------------------------------------------------------+
// |  © Copyright - INVITE Communications Co., Ltd. - All Rights Reserved |
// |       Unauthorized copying of this file is strictly prohibited       |
// |                     Proprietary and Confidential                     |
// |                                                                      |
// | 1F Computec Ichigaya Building                                        |
// | 2-20 Ichigaya-Honmuracho                                             |
// | Shinjuku-ku, Tokyo, Japan 162-0845                                   |
// +----------------------------------------------------------------------+
// | Contact: Brian LaVallee <brian.lavallee@invite-comm.jp>              |
// +----------------------------------------------------------------------+
//

var wombatTimeout = function() {
	return {
	
		/**
		 * Create Slider
		 *
		 * @element - Div that contains the slider.
		 * @max - Maximum value of the sliter.
		 */	
		createSlider: function(element) {
			var start_value = '30';
			if (typeof Timeout_value != 'undefined'){
				var start_value = Timeout_value;
			}
			var timeout = document.getElementById(element);
			noUiSlider.create(timeout, {
				start: start_value,

				padding: 12,
				step: 3,
				range: {
					'min': 12,
					'max': 120
				},
				pips: { // Show a scale with the slider
					mode: 'values',
					stepped: true,
					density: 3,
					values: [30,45,60,90]
				},
			});
			/**
			 * Update Label with slider value.
			 */	
			timeout.noUiSlider.on('update', function( values, handle ) {
				var span = document.getElementById("timeout_txt");
				var value = values[handle];
				span.textContent = 
					Math.round(value) + ' ' + ciTranslations.date_seconds + 
					' (' + 
					Math.round(value/6) + ' ' + ciTranslations.survey_rings + 
					')';
				$("#project_timeout").val(Math.round(value));
			});
		},		
		
		
		/**
		 * Initialize slider creation & dropdown update
		 *
		 * @element - Div that contains the slider.
		 */	
		init: function(element) {
			this.createSlider(element);
			//this.trunkUpdate(element);
		}
	};
}();

jQuery(document).ready(function() {
	wombatTimeout.init('timeout');
});  
