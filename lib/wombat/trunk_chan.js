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

var trunkChannels = function() {
	return {
	
		/**
		 * Create Slider
		 *
		 * @element - Div that contains the slider.
		 * @max - Maximum value of the sliter.
		 */	
		createSlider: function(element, max = 100) {
			/**
			 * Update the Hidden Select with slider value.
			 */	
			var start_value = trunkChannels.loadValue('#project_channels', max);
			$("#project_channels").val(start_value);

			/**
			 * Create Slider.
			 */	
			var slider = document.getElementById(element);
			noUiSlider.create(slider, {
				start: start_value, 
				step: 1,
				range: {
					'min': 1,
					'max': max
				},
				pips: { // Show a scale with the slider
					mode: 'values',
					stepped: true,
					density: (max > 100) ? 25 : 5,
					values: (max > 100) ?
					    [1,25,50,75,100,125,150,175,200] :
					    [1,10,20,30,40,50,
							60,70,80,90,100,
							110,120,130,140,
							150,160,170,180,190,200]
				},
			});
			
			/**
			 * Update Label with slider value.
			 * Update the Hidden Select with slider value.
			 */	
			slider.noUiSlider.on('update', function( values, handle ) {
				var span = document.getElementById("channel_txt");
				var value = Math.round(values[handle]);
				span.textContent = value;
				$("#project_channels").val(value);
			});
		},		
		
		/**
		 * Update slider when trunk dropdown changes.
		 *
		 * @element - Div that contains the slider.
		 */	
		trunkUpdate: function(element) {
			var trunk = document.getElementById('trunk_id');
			trunkChannels.loadData(element, $(trunk).val());
			$(trunk).on('change', function() {
				// $("#project_channels").val('');  // Clear Hidden Select Value
				trunkChannels.loadData(element, $(trunk).val());
			});		
		},

		/**
		 * Utility to Check for Element Value.
		 *
		 * @element - Select that holds the slider value.
		 * @capacity - Capacity value to use if no value found.
		 */	
		loadValue: function(element, capacity) {
			var data = $(element).val();
			if (data) {
				return data;
			} else {
				return capacity;
			}
		},
		
		/**
		 * Update slider using JSON data
		 *
		 * @element - Div that contains the slider.
		 * @match - Dropdown value to lookup.
		 */	
		loadData: function(element, match) {
			var slider = document.getElementById(element);
			slider.noUiSlider.destroy(); 
			var span = document.getElementById("channel_txt");
			span.textContent = ciTranslations.survey_loading;
			$.getJSON( './lib/wombat/trunk.json', function() {
			})
			.done(function(data) {
				trunkChannels.createSlider(element, data[match].capacity);
			});
		},
		
		/**
		 * Initialize slider creation & dropdown update
		 *
		 * @element - Div that contains the slider.
		 */	
		init: function(element) {
			this.createSlider(element);
			this.trunkUpdate(element);
		}
	};
}();

jQuery(document).ready(function() {
	trunkChannels.init('channels');
});  
