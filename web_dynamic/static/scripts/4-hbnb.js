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
      } else {
        delete checked[$(this).attr('data-name')];
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

  fetchPlaces({});

  /**
   * getUserbyID - gets a Users first and last name by ID
   * uses promises to make async ajax calls to /api/v1/users/:id
   *
   * @param userId
   * @returns {Promise.<T>}
   */
  function getUserbyID(userId) {
    return Promise.resolve($.ajax({
      url: "http://localhost:5001/api/v1/users/" + userId
    }));
  }

  /**
   * fetchPlaces - fetches amenity from backend api
   *
   * makes individual <article> blocks that hold the content
   * replaces jinja templating
   *
   * @param places object of search parameters (CAN BE EMPTY)
   * If empty, returns all places
   *
   * {
   *  "states": [list of ids],
   *  "cities": [list of ids],
   *  "amenities": [list of ids]
   * }
   *
   */
  function fetchPlaces(places) {
      $.ajax ({
      url: "http://0.0.0.0:5001/api/v1/places_search/",
      type: "POST",
      data: JSON.stringify(places),
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      success: function(data){

        function compare(a,b) {
          if (a.last_nom < b.last_nom)
            return -1;
          if (a.last_nom > b.last_nom)
            return 1;
          return 0;
        }

        let new_data = data.sort(compare);

        data.sort(function(a, b){
          let nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase();
          if (nameA < nameB)
            return -1;
          if (nameA > nameB)
            return 1;
          return 0
        });

        $.each(new_data, function(index, value) {
          let article = $('<article>');

          let header = $('<div>', {"class": "title",})
            .append($('<h2>').text(value.name))
            .append($('<div>', {'class': 'price_by_night', 'text': '$' + value.price_by_night}));

          article.append(header);


          let info = $('<div>', {'class': 'information'});

          info.append($('<div>', {'class': 'max_guest'})
            .append($('<i>', {'class': 'fa fa-users fa-3x'}))
            .append("</br>" + value.max_guest + " Guest"));

          info.append($('<div>', {'class': 'number_rooms'})
            .append($('<i>', {'class': 'fa fa-bed fa-3x'}))
            .append("</br>" + value.number_rooms + ' Bedrooms'));

          info.append($('<div>', {'class': 'number_bathrooms'})
            .append($('<i>', {'class': 'fa fa-bath fa-3x'}))
            .append("</br>" + value.number_bathrooms + ' Bathrooms'));

          article.append(info);


          let userInfo = $('<div>', {"class": "user",});
          article.append(userInfo);

          getUserbyID(value.user_id).then(function(result) {
            userInfo.append("<strong>" + 'Owner: ' + result.first_name + " " + result.last_name);
          });

          article.append($('<div>', {'class': 'description', 'html': value.description}));
          $('.places').append(article);
        })
      }
    });
  }


  /**
   * search button click
   *
   * removes all places, then reloads places with search parameters
   */
  $('button').click(function() {
    $("article").remove();
    console.log(Object.values(checked));
    fetchPlaces({"amenities": Object.values(checked)})
  });
});