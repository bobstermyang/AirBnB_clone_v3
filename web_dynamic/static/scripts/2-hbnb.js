$(document).ready(function () {
  let checked = {};

  /**
   * updateAmenityDisplay
   * @param checkedObj: Object with key as name attr name
   * and value as attr id
   *
   * If the checkedObj has no length, &nbsp is put into the <h4>
   * in the amenities filter, if there is a length, it will insert
   * all of the keys(amenity.id) split by a ',' as a string.
   *
   * The truncation is done in CSS. Refer to 6-filters.css line 63
   */
  function updateAmenityDisplay(checkedObj) {
    if (Object.keys(checkedObj).length === 0) {
      $('.amenities h4').html('&nbsp');
    } else {
      let fullList = Object.keys(checkedObj).join(', ');
      $('.amenities h4').text(fullList);
    }
  }

  /**
   * checks if the popover input checkbox has a change
   *
   * if the box goes from unchecked to checked, the amenity
   * is appended to an object with the format {amenity_name: amenity_id}
   * this is just in case the amenity ID is needed somewhere else
   *
   * if the box goes from checked to unchecked, the amenity
   * is removed from the obj
   *
   * after every change, updateAmenityDisplay is called to
   * update the <h4> tag in amenities
   */
  $('.popover input[type=checkbox]').change(
    function() {
      let amenity_id = $(this).attr('data-id');
      let amenity_name = $(this).attr('data-name');
      if (this.checked) {
        checked[amenity_name] = amenity_id;
        console.log(checked);
      } else {
        delete checked[$(this).attr('data-name')];
        console.log(checked);
      }
      updateAmenityDisplay(checked);
    });

  /**
   * gets the status of the api and changes div#api_status accordingly
   *
   * if the status is OK, then the add the class available to #api_status
   * else, remove the class available it it's there and it defaults back to original color
   */
  $.get("http://localhost:5001/api/v1/status", function(data) {
    if (data.status == "OK") {
      $('header div#api_status').addClass("available");
    } else {
      $('header div#api_status').removeClass("available");
    }
  });
});