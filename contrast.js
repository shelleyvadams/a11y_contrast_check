var contrast = function(lumin1, lumin2) {
  // Meaningful variable names
	var antecedent,
  		lighter = 0.05,
  		darker = 0.05;

  // Determine divisor and dividend
  if (lumin1 > lumin2) {
  	lighter += lumin1;
    darker += lumin2;
  } else {
  	lighter += lumin2;
    darker += lumin1;
  }

  //See https://www.w3.org/TR/WCAG20/#contrast-ratiodef
  antecedent = lighter / darker;

  // Display the ratio
  $("#ratio").val(antecedent).text(antecedent + ":1");

  // Provide a rating.
	if ( antecedent >= 7 ) {
  	$("#rating").html("Great!");
  } else if ( antecedent >= 4.5 ) {
  	$("#rating").html("Good.");
  } else if ( antecedent >= 3 ) {
  	$("#rating").html("Acceptable for large text.");
  } else {
		$("#rating").html("Poor.");
  }
  return; // Done.
};

// Next three functions based on https://www.w3.org/TR/WCAG20/#relativeluminancedef

var sRGB = function( hexColor ) {
	var redValue, greenValue, blueValue;
  redValue = Number.parseInt( hexColor.substr(1,2), 16) / 255;
  greenValue = Number.parseInt( hexColor.substr(3,2), 16) / 255;
  blueValue = Number.parseInt( hexColor.substr(5,2), 16) / 255;
	return {
    red:   redValue,
    green: greenValue,
    blue:  blueValue
  };
};

var luminComponent = function( colorChannel ) {
	var calculated;
  if ( colorChannel <= 0.03928 ) {
  	calculated = colorChannel / 12.92;
  } else {
  	calculated =  Math.pow((colorChannel + 0.055) / 1.055, 2.4);
  }
  return calculated;
};

var relativeLuminence = function( colorInput ) {
	var colorObj = sRGB( $(colorInput).val() );
  return (
    (0.2126 * luminComponent(colorObj.red)) +
    (0.7152 * luminComponent(colorObj.green)) +
    (0.0722 * luminComponent(colorObj.blue))
  );
};



$(document).ready(function(){
  // Set initial values, or contrast() will produce NaN
  var fgLumin = relativeLuminence( $("#fg_color") );
  var bgLumin = relativeLuminence( $("#bg_color") );

  // Show/hide text by contrast level
  $("#visibility").change(function(){
    var ratio = Number.parseFloat( $("#ratio").val() );
    $("#sample *").removeClass("hidden");
    switch ( $(this).val() ) {
      case "enhanced":
        if (ratio < 4.5) {
          $(".sample-default, .sample-large").addClass("hidden");
        } else if (ratio < 7) {
          $(".sample-default").addClass("hidden");
        }
      break;
      case "minimum":
        if (ratio < 3) {
          $(".sample-default, .sample-large").addClass("hidden");
        } else if (ratio < 4.5) {
          $(".sample-default").addClass("hidden");
        }
      break;
    }
  });

  // Foreground
  $("#fg_color").change(function(){    
    // Do calculations
    fgLumin = relativeLuminence( this );
    contrast(fgLumin, bgLumin);
    // Update sample foreground
    $("#sample").css("color", $(this).val());
    // Update code snippet
    $("#fg_hex").text($(this).val());
    // Update visibility for new color
    $("#visibility").trigger("change");
  });

  // Background
  $("#bg_color").change(function(){
    // Do calculations
    bgLumin = relativeLuminence( this );
    contrast(fgLumin, bgLumin);
    // Update sample background
    $("#sample").css("background-color", $(this).val());
    // Update code snippet
    $("#bg_hex").text($(this).val());
    // Update visibility for new color
    $("#visibility").trigger("change");
  });

	// Ensure forms cannot be submitted (e.g., user hits "return" in #sample_form)
	$("form").submit(function(ev){
		ev.preventDefault();
	});

  // Trigger change events to style the sample and set code snippet values
  $("#fg_color").trigger("change");
  $("#bg_color").trigger("change");
});
